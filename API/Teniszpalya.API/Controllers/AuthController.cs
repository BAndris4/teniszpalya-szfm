using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;

namespace Teniszpalya.API.Controllers
{
    [ApiController]
    [Route("/api/auth/")]
    public class AuthController : ControllerBase
    {
        private readonly AppDBContext _context;
        private readonly IConfiguration _config;

        public AuthController(AppDBContext context, IConfiguration config)
        {
            _context = context;
            _config = config;
        }

        [AllowAnonymous]
        [HttpPost("login")]
        public IActionResult Login(LoginDTO login)
        {
            var user = _context.Users.FirstOrDefault(u => u.Email == login.Email);

            if (user == null || !BCrypt.Net.BCrypt.Verify(login.Password, user.PasswordHash))
            {
                return Unauthorized("Invalid credentials");
            }

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.ID.ToString()),
                new Claim(ClaimTypes.Name, $"{user.FirstName} {user.LastName}"),
                new Claim(ClaimTypes.Role, user.RoleID.ToString())
            };

#pragma warning disable CS8604 // Possible null reference argument.
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]));
#pragma warning restore CS8604 // Possible null reference argument.
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);
            var token = new JwtSecurityToken(
                issuer: "teniszpalya",
                audience: "teniszpalya",
                claims: claims,
                expires: DateTime.UtcNow.AddHours(1),
                signingCredentials: creds
            );

            var jwt = new JwtSecurityTokenHandler().WriteToken(token);

            Response.Cookies.Append("AuthToken", jwt, new CookieOptions
            {
                HttpOnly = true,
                Secure = Request.IsHttps,
                SameSite = SameSiteMode.Strict,
                Expires = DateTime.UtcNow.AddHours(1)
            });

            return Ok();
        }

        [Authorize]
        [HttpPost("logout")]
        public IActionResult Logout()
        {
            Response.Cookies.Append("AuthToken", "",
                new CookieOptions
                {
                    HttpOnly = true,
                    Secure = Request.IsHttps,
                    SameSite = SameSiteMode.Strict,
                    Expires = DateTime.UtcNow.AddDays(-1)
                });

            return Ok(new { message = "Logged out" });
        }

        [AllowAnonymous]
        [HttpPost("register")]
        public async Task<IActionResult> Register(UserDTO userDTO)
        {
            if (!ModelState.IsValid) return BadRequest(ModelState);

            if (await _context.Users.AnyAsync(u => u.Email == userDTO.Email))
            {
                return BadRequest(new { message = "Email already in use." });
            }

            if (await _context.Users.AnyAsync(u => u.PhoneNumber == userDTO.PhoneNumber))
            {
                return BadRequest(new { message = "Phone Number already in use." });
            }

            var user = new User
            {
                FirstName = userDTO.FirstName.Trim(),
                LastName = userDTO.LastName.Trim(),
                Email = userDTO.Email.Trim(),
                PhoneNumber = userDTO.PhoneNumber.Trim(),
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(userDTO.Password.Trim()),
                RoleID = 1
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();
            return Ok(new { message = "User registered successfully" });

        }      

        [Authorize]
        [HttpGet("me")]
        public async Task<IActionResult> GetCurrentUser()
        {
            var userID = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

            if (userID == null) return NotFound();

            var user = await _context.Users.FindAsync(int.Parse(userID));

            if (user == null) return NotFound();

            return Ok(new { id = user.ID, firstName = user.FirstName, lastName = user.LastName, email = user.Email, phoneNumber = user.PhoneNumber, roleID = user.RoleID });
        }  
    }
}
