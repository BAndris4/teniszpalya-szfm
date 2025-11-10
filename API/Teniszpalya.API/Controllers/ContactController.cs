using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Teniszpalya.API.Data;

namespace Teniszpalya.API.Controllers
{
    [ApiController]
    [Route("/api/contact/")]
    public class ContactController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IConfiguration _config;

        public ContactController(AppDBContext context, IConfiguration config)
        {
            _config = config;
            _context = context;
        }

        [Authorize]
        [HttpPost("message/user")]
        public async Task <IActionResult> ContactUser(string userEmail, string message)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            var roleClaim = User.FindFirst(ClaimTypes.Role)?.Value;

            if (!Enum.TryParse(roleClaim, out Role role) || role != Role.ADMIN)
            {
                return Forbid();
            }

            return Ok(new { message = $"The message was sucessfully sent to {userEmail}" });
        }
    }
}