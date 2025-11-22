using System.ComponentModel.DataAnnotations;

namespace Teniszpalya.API.Models
{
    public class Tournament
    {
        [Key]
        public int ID { get; set; }
        public required string Title { get; set; }
        public string? Description { get; set; }
        public DateTime StartDate { get; set; }
        public string? Location { get; set; }
        public int MaxParticipants { get; set; }
        public decimal? Fee { get; set; }
        public TournamentStatus Status { get; set; } = TournamentStatus.Upcoming;
    }
    
    public enum TournamentStatus
    {
        Upcoming = 0,
        InProgress = 1,
        Completed = 2
    }
}
