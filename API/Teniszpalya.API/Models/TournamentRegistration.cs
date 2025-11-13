using System.ComponentModel.DataAnnotations;

namespace Teniszpalya.API.Models
{
    public class TournamentRegistration
    {
        [Key]
        public int ID { get; set; }
        public required int TournamentID { get; set; }
        public required int UserID { get; set; }
        public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    }
}
