using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;
using Teniszpalya.API.Services;

namespace Teniszpalya.API.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class TournamentsController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly BracketService _bracketService;

        public TournamentsController(AppDBContext context, BracketService bracketService)
        {
            _context = context;
            _bracketService = bracketService;
        }

        [HttpGet]
        public async Task<IActionResult> GetTournaments()
        {
            var tournaments = await _context.Tournaments
                .OrderBy(t => t.StartDate)
                .ToListAsync();

            var registrations = await _context.TournamentRegistrations.ToListAsync();

            var result = tournaments.Select(t => new {
                t.ID,
                t.Title,
                t.Description,
                t.StartDate,
                t.Location,
                t.MaxParticipants,
                t.Fee,
                t.Status,
                CurrentParticipants = registrations.Count(r => r.TournamentID == t.ID),
                RegisteredUserIds = registrations.Where(r => r.TournamentID == t.ID).Select(r => r.UserID).ToList()
            });

            return Ok(result);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateTournament(Tournament tournament)
        {
            // Only admins can create tournaments (RoleID == 2)
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null || !int.TryParse(roleClaim, out var roleId) || roleId != (int)Role.ADMIN)
            {
                return Forbid();
            }

            _context.Tournaments.Add(tournament);
            await _context.SaveChangesAsync();
            return Ok(tournament);
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> UpdateTournament(int id, [FromBody] Tournament updatedTournament)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null || !int.TryParse(roleClaim, out var roleId) || roleId != (int)Role.ADMIN)
            {
                return Forbid();
            }

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            // Update fields
            tournament.Title = updatedTournament.Title;
            tournament.Description = updatedTournament.Description;
            tournament.StartDate = updatedTournament.StartDate;
            tournament.Location = updatedTournament.Location;
            tournament.MaxParticipants = updatedTournament.MaxParticipants;
            tournament.Fee = updatedTournament.Fee;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Tournament updated successfully." });
        }

        [Authorize]
        [HttpPost("{id}/register")]
        public async Task<IActionResult> Register(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            var existing = await _context.TournamentRegistrations.FirstOrDefaultAsync(r => r.TournamentID == id && r.UserID == userId);
            if (existing != null) return BadRequest(new { message = "You are already registered." });

            var currentCount = await _context.TournamentRegistrations.CountAsync(r => r.TournamentID == id);
            if (tournament.MaxParticipants > 0 && currentCount >= tournament.MaxParticipants)
            {
                return BadRequest(new { message = "Tournament is full." });
            }

            var reg = new TournamentRegistration { TournamentID = id, UserID = userId };
            _context.TournamentRegistrations.Add(reg);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Registered successfully." });
        }

        [Authorize]
        [HttpPost("{id}/unregister")]
        public async Task<IActionResult> Unregister(int id)
        {
            var userIdClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;
            if (userIdClaim == null || !int.TryParse(userIdClaim, out var userId))
                return Unauthorized();

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found." });

            var registration = await _context.TournamentRegistrations
                .FirstOrDefaultAsync(r => r.TournamentID == id && r.UserID == userId);
            
            if (registration == null) 
                return BadRequest(new { message = "You are not registered for this tournament." });

            _context.TournamentRegistrations.Remove(registration);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Unregistered successfully." });
        }

        [HttpGet("{id}")]
        public async Task<IActionResult> GetTournament(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found" });

            var registrations = await _context.TournamentRegistrations
                .Where(r => r.TournamentID == id)
                .ToListAsync();

            var result = new {
                id = tournament.ID,
                title = tournament.Title,
                description = tournament.Description,
                startDate = tournament.StartDate,
                location = tournament.Location,
                maxParticipants = tournament.MaxParticipants,
                fee = tournament.Fee,
                currentParticipants = registrations.Count,
                registeredUserIds = registrations.Select(r => r.UserID).ToList()
            };

            return Ok(result);
        }

        [HttpGet("{id}/participants")]
        public async Task<IActionResult> GetParticipants(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found" });

            var participants = await _context.TournamentRegistrations
                .Where(r => r.TournamentID == id)
                .Join(_context.Users,
                    reg => reg.UserID,
                    user => user.ID,
                    (reg, user) => new {
                        id = user.ID,
                        firstName = user.FirstName,
                        lastName = user.LastName,
                        email = user.Email,
                        registeredAt = reg.CreatedAt
                    })
                .OrderBy(p => p.registeredAt)
                .ToListAsync();

            return Ok(participants);
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteTournament(int id)
        {
            // Only admins can delete tournaments
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null || !int.TryParse(roleClaim, out var roleId) || roleId != (int)Role.ADMIN)
            {
                return Forbid();
            }

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) return NotFound(new { message = "Tournament not found" });

            // Delete registrations first (cascade)
            var registrations = await _context.TournamentRegistrations.Where(r => r.TournamentID == id).ToListAsync();
            _context.TournamentRegistrations.RemoveRange(registrations);
            
            _context.Tournaments.Remove(tournament);
            await _context.SaveChangesAsync();
            
            return Ok(new { message = "Tournament deleted successfully" });
        }

        [Authorize]
        [HttpPost("{id}/start")]
        public async Task<IActionResult> StartTournament(int id)
        {
            // Only admins can start tournaments
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null || !int.TryParse(roleClaim, out var roleId) || roleId != (int)Role.ADMIN)
            {
                return Forbid();
            }

            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null) 
                return NotFound(new { message = "Tournament not found" });

            if (tournament.Status != TournamentStatus.Upcoming)
                return BadRequest(new { message = "Tournament has already started or completed" });

            // Get registered participants
            var registrations = await _context.TournamentRegistrations
                .Where(r => r.TournamentID == id)
                .ToListAsync();

            if (registrations.Count < 2)
                return BadRequest(new { message = "At least 2 participants required to start tournament" });

            // Generate bracket
            var participantIds = registrations.Select(r => r.UserID).ToList();
            var matches = _bracketService.GenerateBracket(id, participantIds);

            // Save matches to database
            await _context.Matches.AddRangeAsync(matches);

            // Update tournament status
            tournament.Status = TournamentStatus.InProgress;

            await _context.SaveChangesAsync();

            return Ok(new { message = "Tournament started successfully", matchCount = matches.Count });
        }
    }
}
