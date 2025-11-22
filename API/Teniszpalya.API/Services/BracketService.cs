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
                    CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
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
                        CreatedAt = DateTimeOffset.UtcNow.ToUnixTimeSeconds()
                    });
                }
                
                round++;
            }
            
            // Propagate BYE winners to next rounds immediately
            PropagateWinners(matches);
            
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
        
        // Propagate winners from completed matches to next round slots
        private void PropagateWinners(List<Match> matches)
        {
            bool hasChanges;
            do
            {
                hasChanges = false;
                var matchesByRound = matches
                    .GroupBy(m => m.Round)
                    .OrderBy(g => g.Key)
                    .ToList();
                
                foreach (var roundGroup in matchesByRound)
                {
                    var currentRound = roundGroup.Key;
                    var currentMatches = roundGroup.OrderBy(m => m.MatchNumber).ToList();
                    var nextRoundMatches = matches
                        .Where(m => m.Round == currentRound + 1)
                        .OrderBy(m => m.MatchNumber)
                        .ToList();
                    
                    if (!nextRoundMatches.Any()) continue;
                    
                    for (int i = 0; i < currentMatches.Count; i++)
                    {
                        var match = currentMatches[i];
                        if (match.Status == MatchStatus.Completed && match.WinnerID.HasValue)
                        {
                            var nextMatchIndex = i / 2;
                            if (nextMatchIndex < nextRoundMatches.Count)
                            {
                                var nextMatch = nextRoundMatches[nextMatchIndex];
                                bool wasUpdated = false;
                                
                                // Use matchNumber to determine slot (odd -> player1, even -> player2)
                                if (match.MatchNumber % 2 == 1 && nextMatch.Player1ID != match.WinnerID)
                                {
                                    nextMatch.Player1ID = match.WinnerID;
                                    wasUpdated = true;
                                }
                                else if (match.MatchNumber % 2 == 0 && nextMatch.Player2ID != match.WinnerID)
                                {
                                    nextMatch.Player2ID = match.WinnerID;
                                    wasUpdated = true;
                                }
                                
                                if (wasUpdated) hasChanges = true;
                            }
                        }
                    }
                }
            } while (hasChanges);
        }
    }
}
