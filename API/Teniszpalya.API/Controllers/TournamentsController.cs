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

            // Validate MaxParticipants - must be 2, 4, 8, or 16
            if (tournament.MaxParticipants != 2 && tournament.MaxParticipants != 4 && 
                tournament.MaxParticipants != 8 && tournament.MaxParticipants != 16)
            {
                return BadRequest(new { message = "MaxParticipants must be 2, 4, 8, or 16." });
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

            // Validate MaxParticipants - must be 2, 4, 8, or 16
            if (updatedTournament.MaxParticipants != 2 && updatedTournament.MaxParticipants != 4 && 
                updatedTournament.MaxParticipants != 8 && updatedTournament.MaxParticipants != 16)
            {
                return BadRequest(new { message = "MaxParticipants must be 2, 4, 8, or 16." });
            }

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

            // Validate MaxParticipants - must be 2, 4, 8, or 16
            if (tournament.MaxParticipants != 2 && tournament.MaxParticipants != 4 && 
                tournament.MaxParticipants != 8 && tournament.MaxParticipants != 16)
            {
                return BadRequest(new { message = "Tournament can only be started with 2, 4, 8, or 16 participants capacity" });
            }

            // Get registered participants
            var registrations = await _context.TournamentRegistrations
                .Where(r => r.TournamentID == id)
                .ToListAsync();

            // Tournament must have at least 2 participants to start
            if (registrations.Count < 2)
            {
                return BadRequest(new { message = $"Tournament must have at least 2 participants to start. Current: {registrations.Count}" });
            }

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

        [HttpGet("{id}/bracket")]
        public async Task<IActionResult> GetBracket(int id)
        {
            var tournament = await _context.Tournaments.FindAsync(id);
            if (tournament == null)
                return NotFound(new { message = "Tournament not found" });

            if (tournament.Status == TournamentStatus.Upcoming)
                return BadRequest(new { message = "Tournament has not started yet" });

            // Get all matches for this tournament
            var matches = await _context.Matches
                .Where(m => m.TournamentID == id)
                .OrderBy(m => m.Round)
                .ThenBy(m => m.MatchNumber)
                .ToListAsync();

            // Separate 3rd place match from regular rounds
            var thirdPlaceMatchEntity = matches.FirstOrDefault(m => m.Round == -1);
            var regularMatches = matches.Where(m => m.Round >= 0).ToList();

            // Get all participants
            var playerIds = regularMatches
                .SelectMany(m => new[] { m.Player1ID, m.Player2ID, m.WinnerID })
                .Where(pid => pid.HasValue)
                .Select(pid => pid!.Value)
                .Distinct()
                .ToList();

            // Add 3rd place match participants if exists
            if (thirdPlaceMatchEntity != null)
            {
                if (thirdPlaceMatchEntity.Player1ID.HasValue) playerIds.Add(thirdPlaceMatchEntity.Player1ID.Value);
                if (thirdPlaceMatchEntity.Player2ID.HasValue) playerIds.Add(thirdPlaceMatchEntity.Player2ID.Value);
                if (thirdPlaceMatchEntity.WinnerID.HasValue) playerIds.Add(thirdPlaceMatchEntity.WinnerID.Value);
                playerIds = playerIds.Distinct().ToList();
            }

            var users = await _context.Users
                .Where(u => playerIds.Contains(u.ID))
                .Select(u => new { u.ID, u.FirstName, u.LastName, u.Email })
                .ToListAsync();

            var userDict = users.ToDictionary(u => u.ID);

            // Group matches by round (only regular matches)
            var rounds = regularMatches
                .GroupBy(m => m.Round)
                .OrderBy(g => g.Key)
                .Select(g => new
                {
                    round = g.Key,
                    matches = g.Select(m => new
                    {
                        id = m.ID,
                        matchNumber = m.MatchNumber,
                        player1 = m.Player1ID.HasValue && userDict.ContainsKey(m.Player1ID.Value)
                            ? new { id = m.Player1ID.Value, name = $"{userDict[m.Player1ID.Value].FirstName} {userDict[m.Player1ID.Value].LastName}" }
                            : null,
                        player2 = m.Player2ID.HasValue && userDict.ContainsKey(m.Player2ID.Value)
                            ? new { id = m.Player2ID.Value, name = $"{userDict[m.Player2ID.Value].FirstName} {userDict[m.Player2ID.Value].LastName}" }
                            : null,
                        winner = m.WinnerID.HasValue && userDict.ContainsKey(m.WinnerID.Value)
                            ? new { id = m.WinnerID.Value, name = $"{userDict[m.WinnerID.Value].FirstName} {userDict[m.WinnerID.Value].LastName}" }
                            : null,
                        score = m.Score,
                        status = m.Status
                    }).ToList()
                }).ToList();

            // Create 3rd place match object from database if exists
            object? thirdPlaceMatch = null;
            if (thirdPlaceMatchEntity != null)
            {
                thirdPlaceMatch = new
                {
                    id = thirdPlaceMatchEntity.ID,
                    matchNumber = thirdPlaceMatchEntity.MatchNumber,
                    player1 = thirdPlaceMatchEntity.Player1ID.HasValue && userDict.ContainsKey(thirdPlaceMatchEntity.Player1ID.Value)
                        ? new { id = thirdPlaceMatchEntity.Player1ID.Value, name = $"{userDict[thirdPlaceMatchEntity.Player1ID.Value].FirstName} {userDict[thirdPlaceMatchEntity.Player1ID.Value].LastName}" }
                        : null,
                    player2 = thirdPlaceMatchEntity.Player2ID.HasValue && userDict.ContainsKey(thirdPlaceMatchEntity.Player2ID.Value)
                        ? new { id = thirdPlaceMatchEntity.Player2ID.Value, name = $"{userDict[thirdPlaceMatchEntity.Player2ID.Value].FirstName} {userDict[thirdPlaceMatchEntity.Player2ID.Value].LastName}" }
                        : null,
                    winner = thirdPlaceMatchEntity.WinnerID.HasValue && userDict.ContainsKey(thirdPlaceMatchEntity.WinnerID.Value)
                        ? new { id = thirdPlaceMatchEntity.WinnerID.Value, name = $"{userDict[thirdPlaceMatchEntity.WinnerID.Value].FirstName} {userDict[thirdPlaceMatchEntity.WinnerID.Value].LastName}" }
                        : null,
                    score = thirdPlaceMatchEntity.Score,
                    status = thirdPlaceMatchEntity.Status
                };
            }

            return Ok(new
            {
                tournamentId = id,
                tournamentTitle = tournament.Title,
                status = tournament.Status,
                rounds,
                thirdPlaceMatch
            });
        }

        [Authorize]
        [HttpPost("{tournamentId}/matches/{matchId}/result")]
        public async Task<IActionResult> SetMatchResult(int tournamentId, int matchId, [FromBody] MatchResultRequest request)
        {
            // Only admins can set match results
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            if (roleClaim == null || !int.TryParse(roleClaim, out var roleId) || roleId != (int)Role.ADMIN)
            {
                return Forbid();
            }

            var match = await _context.Matches
                .FirstOrDefaultAsync(m => m.ID == matchId && m.TournamentID == tournamentId);

            if (match == null)
                return NotFound(new { message = "Match not found" });

            if (match.Status == MatchStatus.Completed)
                return BadRequest(new { message = "Match already completed" });

            // Validate winner is one of the players
            if (request.WinnerId != match.Player1ID && request.WinnerId != match.Player2ID)
                return BadRequest(new { message = "Winner must be one of the match participants" });

            // Update match
            match.WinnerID = request.WinnerId;
            match.Score = request.Score;
            match.Status = MatchStatus.Completed;

            // Advance winner to next round
            var nextRound = match.Round + 1;
            var nextMatchNumber = (match.MatchNumber + 1) / 2; // Pairing logic

            var nextMatch = await _context.Matches
                .FirstOrDefaultAsync(m => m.TournamentID == tournamentId 
                    && m.Round == nextRound 
                    && m.MatchNumber == nextMatchNumber);

            if (nextMatch != null)
            {
                // Determine if winner goes to player1 or player2 slot
                if (match.MatchNumber % 2 == 1) // Odd match number -> player1
                {
                    nextMatch.Player1ID = request.WinnerId;
                }
                else // Even match number -> player2
                {
                    nextMatch.Player2ID = request.WinnerId;
                }
            }
            else
            {
                // This was the final match, tournament is complete
                var tournament = await _context.Tournaments.FindAsync(tournamentId);
                if (tournament != null)
                {
                    tournament.Status = TournamentStatus.Completed;
                }
            }

            // Check if we need to create/update 3rd place match after semi-finals
            await CheckAndCreateThirdPlaceMatch(tournamentId, match.Round);

            await _context.SaveChangesAsync();

            return Ok(new { message = "Match result saved successfully" });
        }

        private async Task CheckAndCreateThirdPlaceMatch(int tournamentId, int completedRound)
        {
            // Get total rounds to identify semi-finals
            var totalRounds = await _context.Matches
                .Where(m => m.TournamentID == tournamentId)
                .Select(m => m.Round)
                .MaxAsync();

            var semiFinalRound = totalRounds - 1;

            // Only proceed if we just completed a semi-final
            if (completedRound != semiFinalRound) return;

            // Check if both semi-finals are completed
            var semiFinals = await _context.Matches
                .Where(m => m.TournamentID == tournamentId && m.Round == semiFinalRound)
                .ToListAsync();

            if (semiFinals.Count < 2 || !semiFinals.All(m => m.Status == MatchStatus.Completed))
                return;

            // Get losers
            var losers = semiFinals
                .Where(m => m.WinnerID.HasValue)
                .Select(m => m.Player1ID == m.WinnerID ? m.Player2ID : m.Player1ID)
                .Where(id => id.HasValue)
                .Select(id => id!.Value)
                .ToList();

            if (losers.Count == 0) return;

            // Check if 3rd place match already exists
            var existingThirdPlace = await _context.Matches
                .FirstOrDefaultAsync(m => m.TournamentID == tournamentId && m.Round == -1);

            if (existingThirdPlace == null)
            {
                // Create 3rd place match
                var thirdPlaceMatch = new Match
                {
                    TournamentID = tournamentId,
                    Round = -1, // Special round number for 3rd place
                    MatchNumber = 999,
                    Player1ID = losers[0],
                    Player2ID = losers.Count > 1 ? losers[1] : null,
                    Status = losers.Count > 1 ? MatchStatus.Pending : MatchStatus.Completed,
                    WinnerID = losers.Count > 1 ? null : losers[0] // Auto-win if only 1 loser
                };

                _context.Matches.Add(thirdPlaceMatch);
            }
        }
    }
}

public class MatchResultRequest
{
    public required int WinnerId { get; set; }
    public string? Score { get; set; }
}
