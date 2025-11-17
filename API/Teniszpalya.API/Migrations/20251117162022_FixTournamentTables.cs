using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Teniszpalya.API.Migrations
{
    /// <inheritdoc />
    public partial class FixTournamentTables : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Create Tournaments table if missing
            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS Tournaments (
                ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                Title TEXT NOT NULL,
                Description TEXT NULL,
                StartDate TEXT NOT NULL,
                Location TEXT NULL,
                MaxParticipants INTEGER NOT NULL,
                Fee TEXT NULL
            );");

            // Create TournamentRegistrations table if missing
            migrationBuilder.Sql(@"CREATE TABLE IF NOT EXISTS TournamentRegistrations (
                ID INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                TournamentID INTEGER NOT NULL,
                UserID INTEGER NOT NULL,
                CreatedAt INTEGER NOT NULL
            );");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS TournamentRegistrations;");
            migrationBuilder.Sql("DROP TABLE IF EXISTS Tournaments;");
        }
    }
}
