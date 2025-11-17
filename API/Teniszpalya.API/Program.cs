
using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Teniszpalya.API.Data;
using Teniszpalya.API.Models;
using Teniszpalya.API.Services;

namespace Teniszpalya.API;

public class Program
{
    public static void Main(string[] args)
    {
        var builder = WebApplication.CreateBuilder(args);

        builder.Services.AddCors(options =>
        {
            options.AddPolicy("AllowReactApp",
                policy =>
                {
                    policy.WithOrigins("http://localhost:5173")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials();
                });
        });

        builder.Services.AddAuthorization();
        builder.Services.AddEndpointsApiExplorer();
        builder.Services.AddSwaggerGen();
        builder.Services.AddDbContext<AppDBContext>(options =>
        options.UseSqlite(builder.Configuration.GetConnectionString("DefaultConnection")));
        builder.Services.AddControllers();
        
        // Register services
        builder.Services.AddScoped<BracketService>();

#pragma warning disable CS8604 // Possible null reference argument.
        var key = Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]);
#pragma warning restore CS8604 // Possible null reference argument.

        builder.Services.AddAuthentication(options =>
        {
            options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
            options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
        })
        .AddJwtBearer(options =>
        {
            options.TokenValidationParameters = new TokenValidationParameters
            {
                ValidateIssuer = true,
                ValidateAudience = true,
                ValidateLifetime = true,
                ValidateIssuerSigningKey = true,
                ValidIssuer = builder.Configuration["Jwt:Issuer"],
                ValidAudience = builder.Configuration["Jwt:Audience"],
                IssuerSigningKey = new SymmetricSecurityKey(key)
            };

            options.Events = new JwtBearerEvents
            {
                OnMessageReceived = context =>
                {
                    if (context.Request.Cookies.ContainsKey("AuthToken"))
                        context.Token = context.Request.Cookies["AuthToken"];
                    return Task.CompletedTask;
                }
            };
        });

        builder.Services.AddAuthorization();


        var app = builder.Build();

        // Seed the database with initial data
        using (var scope = app.Services.CreateScope())
        {
            var context = scope.ServiceProvider.GetRequiredService<AppDBContext>();
            // Apply pending migrations automatically on startup so a new database is generated if missing
            try
            {
                context.Database.Migrate();
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[Migration Error] {ex.Message}\n{ex.StackTrace}");
            }
            SeedDatabase(context);
        }

        if (app.Environment.IsDevelopment())
        {
            app.UseSwagger();
            app.UseSwaggerUI(c =>
            {
                c.RoutePrefix = "";
                c.SwaggerEndpoint("/swagger/v1/swagger.json", "Teniszpalya API v1");
            });
        }

        app.UseHttpsRedirection();
        app.UseCors("AllowReactApp");
        app.UseAuthentication();
        app.UseAuthorization();
        app.MapControllers();
        app.Run();
    }

    private static void SeedDatabase(AppDBContext context)
    {
        // Seed Users
        if (!context.Users.Any())
        {
            var users = new List<User>
            {
                new User
                {
                    FirstName = "Admin",
                    LastName = "User",
                    Email = "admin@admin.com",
                    PhoneNumber = "+36301234567",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword("admin"),
                    RoleID = 2 // Admin role
                }
            };

            // Add test users
            for (int i = 1; i <= 10; i++)
            {
                users.Add(new User
                {
                    FirstName = $"User{i}",
                    LastName = $"Test{i}",
                    Email = $"user{i}@example.com",
                    PhoneNumber = $"+36301234{i:D3}",
                    PasswordHash = BCrypt.Net.BCrypt.HashPassword($"user{i}"),
                    RoleID = 1 // Regular user role
                });
            }

            context.Users.AddRange(users);
            context.SaveChanges();
        }

        // Seed Courts
        if (!context.Courts.Any())
        {
            var courts = new[]
            {
                new Court { Material = "Clay", Outdoors = true },
                new Court { Material = "Hard", Outdoors = true },
                new Court { Material = "Grass", Outdoors = true },
                new Court { Material = "Hard", Outdoors = false }
            };

            context.Courts.AddRange(courts);
            context.SaveChanges();
        }

        // Seed Court Prices
        if (!context.CourtPrices.Any())
        {
            var prices = new[]
            {
                // Indoor prices (Summer 6-18)
                new CourtPrice { Outdoor = false, Season = Season.SUMMER, Price = 3000, ValidFrom = 6, ValidTo = 18 },
                // Indoor prices (Summer 18-22)
                new CourtPrice { Outdoor = false, Season = Season.SUMMER, Price = 4000, ValidFrom = 18, ValidTo = 22 },
                // Indoor prices (Winter 6-18)
                new CourtPrice { Outdoor = false, Season = Season.WINTER, Price = 3500, ValidFrom = 6, ValidTo = 18 },
                // Indoor prices (Winter 18-22)
                new CourtPrice { Outdoor = false, Season = Season.WINTER, Price = 4500, ValidFrom = 18, ValidTo = 22 },
                
                // Outdoor prices (Summer 6-18)
                new CourtPrice { Outdoor = true, Season = Season.SUMMER, Price = 2000, ValidFrom = 6, ValidTo = 18 },
                // Outdoor prices (Summer 18-22)
                new CourtPrice { Outdoor = true, Season = Season.SUMMER, Price = 2500, ValidFrom = 18, ValidTo = 22 },
                // Outdoor prices (Winter 6-18)
                new CourtPrice { Outdoor = true, Season = Season.WINTER, Price = 2500, ValidFrom = 6, ValidTo = 18 },
                // Outdoor prices (Winter 18-22)
                new CourtPrice { Outdoor = true, Season = Season.WINTER, Price = 3000, ValidFrom = 18, ValidTo = 22 }
            };

            context.CourtPrices.AddRange(prices);
            context.SaveChanges();
        }
    }
}
