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
    public class ReservationsController : ControllerBase
    {
        public readonly AppDBContext _context;

        public ReservationsController(AppDBContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet]
        public async Task<IActionResult> GetReservations()
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse<Role>(roleClaim, out var role) || role != Role.ADMIN)
            {
                return Forbid();
            }

            var reservations = await _context.Reservations.ToListAsync();
            return Ok(reservations);
        }

        [Authorize]
        [HttpGet("{id}")]
        public async Task<IActionResult> GetReservation(int id)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (idClaim == null || roleClaim == null) return Forbid();

            if (!Enum.TryParse<Role>(roleClaim, out var role))
            {
                return Forbid();
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ID == id);

            if (reservation == null) return NotFound();

            if (role != Role.ADMIN && reservation.UserID.ToString() != idClaim) return Forbid();

            return Ok(reservation);
        }

        [Authorize]
        [HttpPost]
        public async Task<IActionResult> CreateReservation(ReservationDTO reservationDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (idClaim == null) return Forbid();

            var reservation = new Reservation
            {
                CreatedAt = reservationDTO.CreatedAt,
                ReservedAt = reservationDTO.ReservedAt,
                Hours = reservationDTO.Hours,
                UserID = int.Parse(idClaim),
                CourtID = reservationDTO.CourtID
            };

            var coupon = await _context.Coupons.FirstOrDefaultAsync(c => c.Code == reservationDTO.CouponCode);

            if(coupon != null)
            {
                if (coupon.Used) return BadRequest(new { message = "Coupon code already used." });

                coupon.Used = true;
            }

            _context.Reservations.Add(reservation);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Reservation created sucessfully.", reservationId = reservation.ID });
        }

        [Authorize]
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteReservation(int id)
        {
            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (idClaim == null) return Forbid();

            if (!Enum.TryParse<Role>(roleClaim, out var role))
            {
                return Forbid();
            }

            var reservation = await _context.Reservations.FirstOrDefaultAsync(r => r.ID == id);

            if (reservation == null) return NotFound();

            if (role != Role.ADMIN && reservation.UserID.ToString() != idClaim) return Forbid();

            _context.Reservations.Remove(reservation);
            await _context.SaveChangesAsync();
            return Ok(new { message = "Reservation deleted sucessfully." });
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> MyReservations()
        {
            var idClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (idClaim == null) return Forbid();

            var reservations = await _context.Reservations.Where(r => r.UserID.ToString() == idClaim).ToListAsync();
            return Ok(reservations);
        }
    }
}