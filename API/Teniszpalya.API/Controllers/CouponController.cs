using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;

namespace Teniszpalya.API.Controllers
{
    [ApiController]
    [Route("/api/coupon/")]
    public class CouponController : ControllerBase
    {
        private readonly AppDBContext _context;

        public CouponController(AppDBContext context)
        {
            _context = context;
        }

        [Authorize]
        [HttpGet("request")]
        public async Task<IActionResult> RequestCoupon()
        {
            var userIDClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIDClaim, out int userID)) return Unauthorized();

            string code = Guid.NewGuid().ToString("N").Substring(0, 6).ToUpper();

            var coupon = new Coupon
            {
                Code = code,
                UserID = userID,
            };

            _context.Coupons.Add(coupon);
            await _context.SaveChangesAsync();
            return Ok(code);
        }

        [Authorize]
        [HttpGet("my")]
        public async Task<IActionResult> GetMyCoupons()
        {
            var userIDClaim = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (!int.TryParse(userIDClaim, out int userID)) return Unauthorized();

            var coupons = await _context.Coupons
                .Where(c => c.UserID == userID && !c.Used)
                .ToListAsync();

            return Ok(coupons);
        }
    }
}