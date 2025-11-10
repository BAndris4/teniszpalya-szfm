using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;

namespace Teniszpalya.API.Controllers
{
    [ApiController]
    [Route("/api/[controller]")]
    public class CourtsController : ControllerBase
    {
        private readonly AppDBContext _context;

        public CourtsController(AppDBContext context)
        {
            _context = context;
        }

        [HttpGet]
        public async Task<IActionResult> GetCourts()
        {
            var courts = await _context.Courts.ToListAsync();
            return Ok(courts);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateCourt(CourtDTO courtDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse<Role>(roleClaim, out var role) || role != Role.ADMIN)
            {
                return Forbid();
            }

            var court = new Court
            {
                Material = courtDTO.Material,
                Outdoors = courtDTO.Outdoors
            };
            
            _context.Courts.Add(court);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Court created sucessfully." });
        }

        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> EditCourt(int id, CourtDTO newCourt)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse<Role>(roleClaim, out var role) || role != Role.ADMIN)
            {
                return Forbid();
            }

            var court = await _context.Courts.FindAsync(id);

            if (court == null) return NotFound();

            court.Material = newCourt.Material;
            court.Outdoors = newCourt.Outdoors;

            await _context.SaveChangesAsync();
            return Ok(new { message = "Court modified sucessfully." });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteCourt(int id)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse<Role>(roleClaim, out var role) || role != Role.ADMIN)
            {
                return Forbid();
            }    

            var court = await _context.Courts.FindAsync(id);

            if (court == null) return NotFound();

            _context.Courts.Remove(court);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Court deleted sucessfully." });
        }
    }
}