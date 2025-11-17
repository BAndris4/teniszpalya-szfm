using Teniszpalya.API.Models;

namespace Teniszpalya.API.Services
{
    public class BracketService
    {
        public List<Match> GenerateBracket(int tournamentId, List<int> participantIds)
        {
            var matches = new List<Match>();
            var participants = new List<int?>(participantIds.Cast<int?>());
            
            // Calculate next power of 2
            int totalSlots = GetNextPowerOfTwo(participants.Count);
            int byeCount = totalSlots - participants.Count;
            
            // Add BYEs (null players)
            for (int i = 0; i < byeCount; i++)
            {
                participants.Add(null);
            }
            
            // Shuffle participants for fairness (optional)
            // participants = participants.OrderBy(x => Guid.NewGuid()).ToList();
            
            // Generate first round matches
            int matchNumber = 1;
            for (int i = 0; i < participants.Count; i += 2)
            {
                var match = new Match
                {
                    TournamentID = tournamentId,
                    Round = 1,
                    MatchNumber = matchNumber++,
                    Player1ID = participants[i],
                    Player2ID = participants[i + 1],
                    Status = MatchStatus.Pending,
                    CreatedAt = DateTime.UtcNow
                };
                
                // Auto-advance if one player is BYE
                if (match.Player1ID == null)
                {
                    match.WinnerID = match.Player2ID;
                    match.Status = MatchStatus.Completed;
                }
                else if (match.Player2ID == null)
                {
                    match.WinnerID = match.Player1ID;
                    match.Status = MatchStatus.Completed;
                }
                
                matches.Add(match);
            }
            
            // Generate subsequent rounds (empty matches to be filled as tournament progresses)
            int currentRoundMatches = matches.Count;
            int round = 2;
            
            while (currentRoundMatches > 1)
            {
                currentRoundMatches /= 2;
                matchNumber = 1;
                
                for (int i = 0; i < currentRoundMatches; i++)
                {
                    matches.Add(new Match
                    {
                        TournamentID = tournamentId,
                        Round = round,
                        MatchNumber = matchNumber++,
                        Player1ID = null,
                        Player2ID = null,
                        Status = MatchStatus.Pending,
                        CreatedAt = DateTime.UtcNow
                    });
                }
                
                round++;
            }
            
            return matches;
        }
        
        private int GetNextPowerOfTwo(int n)
        {
            int power = 1;
            while (power < n)
            {
                power *= 2;
            }
            return power;
        }
    }
}
