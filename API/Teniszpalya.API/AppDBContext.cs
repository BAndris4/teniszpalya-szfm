using Microsoft.EntityFrameworkCore;
using Teniszpalya.API.Models;

namespace Teniszpalya.API.Data
{
    public class AppDBContext : DbContext
    {
        public AppDBContext(DbContextOptions<AppDBContext> options)
            : base(options)
        {
        }

        public DbSet<Court> Courts { get; set; }
        public DbSet<CourtPrice> CourtPrices { get; set; }
        public DbSet<User> Users { get; set; }
        public DbSet<PasswordReset> PasswordResets { get; set; }
        public DbSet<Reservation> Reservations { get; set; }
        public DbSet<Tournament> Tournaments { get; set; }
        public DbSet<TournamentRegistration> TournamentRegistrations { get; set; }
        public DbSet<Match> Matches { get; set; }
        public DbSet<Coupon> Coupons { get; set; }
    }
}
