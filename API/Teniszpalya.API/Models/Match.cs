using System.ComponentModel.DataAnnotations;

namespace Teniszpalya.API.Models
{
    public class Match
    {
        [Key]
        public int ID { get; set; }
        
        public required int TournamentID { get; set; }
        
        // Round number (1 = first round, 2 = quarter-finals, etc.)
        public int Round { get; set; }
        
        // Match number within the round
        public int MatchNumber { get; set; }
        
        // Participant IDs (null means BYE or waiting for previous match)
        public int? Player1ID { get; set; }
        public int? Player2ID { get; set; }
        
        // Winner ID (null if match not played yet)
        public int? WinnerID { get; set; }
        
        // Optional score tracking
        public string? Score { get; set; }
        
        // Match status
        public MatchStatus Status { get; set; } = MatchStatus.Pending;
        
        public long CreatedAt { get; set; } = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
    }
    
    public enum MatchStatus
    {
        Pending = 0,
        InProgress = 1,
        Completed = 2
    }
}
