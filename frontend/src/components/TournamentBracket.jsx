import { useState, useEffect } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";

// Use the same API base as TournamentsTab
const API_BASE = "http://localhost:5044/api/tournaments";

export default function TournamentBracket({ tournamentId, onClose }) {
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [scores, setScores] = useState({});
  const { user } = useCurrentUser();

  useEffect(() => {
    loadBracket();
  }, [tournamentId]);

  async function loadBracket() {
    try {
      const res = await fetch(`${API_BASE}/${tournamentId}/bracket`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error(`Failed to load bracket: ${res.status}`);
      const data = await res.json();
      setBracket(data);
    } catch (e) {
      setError(e?.message || "Failed to load bracket");
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = user?.roleID === 2;

  async function submitResult(match, winnerId) {
    try {
      setSavingId(match.id);
      const res = await fetch(
        `${API_BASE}/${tournamentId}/matches/${match.id}/result`,
        {
          method: "POST",
          credentials: "include",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            winnerId,
            score: scores[match.id] || null,
          }),
        }
      );
      if (!res.ok) throw new Error(`Failed to save result: ${res.status}`);
      await loadBracket();
    } catch (e) {
      setError(e?.message || "Failed to save result");
    } finally {
      setSavingId(null);
    }
  }

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-gradient-to-br from-light-green/30 to-white p-8 shadow-xl border-2 border-green">
          <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green border-t-transparent mb-4"></div>
          <p className="text-dark-green font-semibold">Loading bracket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-gradient-to-br from-light-green/30 to-white p-8 shadow-xl border-2 border-green">
          <p className="mb-4 text-red-600 font-semibold">{error}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-green px-6 py-2 text-white font-semibold hover:bg-green/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  if (!bracket || !bracket.rounds || bracket.rounds.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-gradient-to-br from-light-green/30 to-white p-8 shadow-xl border-2 border-green">
          <p className="mb-4 text-dark-green font-semibold">No bracket data available</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-green px-6 py-2 text-white font-semibold hover:bg-green/90 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const totalRounds = bracket.rounds.length;
  
  // Split rounds for proper two-sided bracket like FIFA World Cup
  let leftRounds = [];
  let rightRounds = [];
  let middleRounds = [];

  if (totalRounds === 1) {
    // Just finals (2 players)
    middleRounds = [bracket.rounds[0]];
  } else if (totalRounds === 2) {
    // 4 players: split first round left/right, finals in middle
    const firstRound = bracket.rounds[0];
    const half = Math.ceil(firstRound.matches.length / 2);
    
    leftRounds = [{
      ...firstRound,
      matches: firstRound.matches.slice(0, half)
    }];
    
    rightRounds = [{
      ...firstRound,
      matches: firstRound.matches.slice(half)
    }];
    
    middleRounds = [bracket.rounds[1]];
  } else {
    // 8+ players: split multiple rounds
    // Left side: first half of early rounds
    // Right side: second half of early rounds  
    // Middle: semi-finals and finals
    
    const numEarlyRounds = totalRounds - 2; // All except semi and finals
    
    for (let i = 0; i < numEarlyRounds; i++) {
      const round = bracket.rounds[i];
      const half = Math.ceil(round.matches.length / 2);
      
      leftRounds.push({
        ...round,
        matches: round.matches.slice(0, half)
      });
      
      rightRounds.push({
        ...round,
        matches: round.matches.slice(half)
      });
    }
    
    // Semi-finals and finals go in the middle
    middleRounds = bracket.rounds.slice(numEarlyRounds);
  }

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-2xl bg-gradient-to-br from-light-green/40 via-white to-light-green/20 p-6 shadow-2xl border-2 border-green">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b-2 border-green/30 pb-4">
          <div>
            <h2 className="text-2xl font-bold text-dark-green">
              {bracket.tournamentTitle}
            </h2>
            <p className="text-sm text-gray-600">
              Status: {bracket.status === 1 ? "In Progress" : "Completed"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg bg-green px-6 py-2 text-white font-semibold hover:bg-green/90 transition-colors shadow-md"
          >
            Close
          </button>
        </div>

        {/* Bracket */}
        {totalRounds === 1 ? (
          // Just finals
          <div className="flex items-center justify-center py-8">
            <RoundColumn
              round={middleRounds[0]}
              roundIndex={0}
              isFinal={true}
              side="final"
              isAdmin={isAdmin}
              savingId={savingId}
              onSubmitResult={submitResult}
              scores={scores}
              setScores={setScores}
            />
          </div>
        ) : (
          // Two-sided bracket
          <div className="flex items-start justify-center gap-12">
            {/* Left side */}
            {leftRounds.length > 0 && (
              <div className="flex gap-8">
                {leftRounds.map((round, idx) => (
                  <RoundColumn
                    key={`left-${round.round}`}
                    round={round}
                    roundIndex={idx}
                    totalInSide={leftRounds.length}
                    side="left"
                    isAdmin={isAdmin}
                    savingId={savingId}
                    onSubmitResult={submitResult}
                    scores={scores}
                    setScores={setScores}
                  />
                ))}
              </div>
            )}

            {/* Middle (semi-finals, finals) */}
            {middleRounds.length > 0 && (
              <div className="flex gap-8">
                {middleRounds.map((round, idx) => (
                  <RoundColumn
                    key={`middle-${round.round}`}
                    round={round}
                    roundIndex={idx}
                    isFinal={idx === middleRounds.length - 1}
                    side="middle"
                    isAdmin={isAdmin}
                    savingId={savingId}
                    onSubmitResult={submitResult}
                    scores={scores}
                    setScores={setScores}
                  />
                ))}
              </div>
            )}

            {/* Right side */}
            {rightRounds.length > 0 && (
              <div className="flex flex-row-reverse gap-8">
                {rightRounds.map((round, idx) => (
                  <RoundColumn
                    key={`right-${round.round}`}
                    round={round}
                    roundIndex={idx}
                    totalInSide={rightRounds.length}
                    side="right"
                    isAdmin={isAdmin}
                    savingId={savingId}
                    onSubmitResult={submitResult}
                    scores={scores}
                    setScores={setScores}
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function RoundColumn({ round, roundIndex, isFinal, totalInSide, side = "left", isAdmin, savingId, onSubmitResult, scores, setScores }) {
  const roundNames = ["Round 1", "Round 2", "Semi-Finals", "Finals"];
  const displayName = isFinal
    ? "Finals"
    : roundNames[roundIndex] || `Round ${roundIndex + 1}`;

  // Calculate vertical spacing based on round
  const marginTop = roundIndex > 0 ? `${roundIndex * 3}rem` : "0";

  // Pair matches for connector rendering (two matches feed into one next-round match)
  const pairs = [];
  for (let i = 0; i < round.matches.length; i += 2) {
    pairs.push(round.matches.slice(i, i + 2));
  }

  return (
    <div className="flex flex-col" style={{ marginTop }}>
      <h3 className="mb-3 text-center text-sm font-semibold text-dark-green">
        {displayName}
      </h3>
      <div className="flex flex-col gap-6">
        {pairs.map((pair, idx) => (
          <div key={`pair-${idx}`} className="relative flex flex-col gap-6">
            {/* Vertical connector across the pair + horizontal to next round */}
            {pair.length === 2 && (
              <>
                {/* Vertical line connecting the two matches */}
                <div
                  className={
                    "absolute w-[2px] bg-green/60 " +
                    (side === "left"
                      ? "right-[-50px] top-[25%] bottom-[25%]"
                      : side === "right"
                      ? "left-[-50px] top-[25%] bottom-[25%]"
                      : "right-[-50px] top-[25%] bottom-[25%]")
                  }
                />
              </>
            )}

            {pair.map((match) => (
              <MatchCard
                key={match.id}
                match={match}
                side={side}
                isAdmin={isAdmin}
                savingId={savingId}
                onSubmitResult={onSubmitResult}
                scores={scores}
                setScores={setScores}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, side, isAdmin, savingId, onSubmitResult, scores, setScores }) {
  const player1Name = match.player1?.name || "TBD";
  const player2Name = match.player2?.name || "TBD";
  const isCompleted = match.status === 2;
  const winner = match.winner;
  const canSet = isAdmin && !isCompleted && match.player1 && match.player2;

  return (
    <div className="relative w-52 rounded-lg border-2 border-green/50 bg-gradient-to-br from-light-green/20 to-white shadow-lg hover:shadow-xl transition-shadow">
      {/* Connector lines to next round */}
      {side === "left" && (
        <div className="absolute right-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-green/60" />
      )}
      {side === "right" && (
        <div className="absolute left-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-green/60" />
      )}
      {side === "middle" && (
        <>
          <div className="absolute right-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-green/60" />
          <div className="absolute left-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-green/60" />
        </>
      )}
      {/* Player 1 */}
      <div
        className={`border-b border-green/30 px-3 py-2 ${
          isCompleted && winner?.id === match.player1?.id
            ? "bg-green/30 font-bold text-dark-green"
            : "text-dark-green-half"
        }`}
      >
        <p className="text-sm">{player1Name}</p>
      </div>

      {/* Player 2 */}
      <div
        className={`px-3 py-2 ${
          isCompleted && winner?.id === match.player2?.id
            ? "bg-green/30 font-bold text-dark-green"
            : "text-dark-green-half"
        }`}
      >
        <p className="text-sm">{player2Name}</p>
      </div>

      {/* Score */}
      {match.score && (
        <div className="border-t border-green/30 bg-light-green/10 px-3 py-1 text-center">
          <p className="text-xs text-dark-green font-semibold">{match.score}</p>
        </div>
      )}

      {canSet && (
        <div className="space-y-2 border-t border-green/30 p-2 bg-light-green/5">
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded border-2 border-green/30 px-2 py-1 text-xs focus:border-green focus:outline-none"
            value={scores[match.id] || ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [match.id]: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded bg-green px-2 py-1 text-xs font-bold text-white disabled:opacity-50 hover:bg-green/90 transition-colors shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
            >
              {savingId === match.id ? "Saving..." : "P1 wins"}
            </button>
            <button
              className="flex-1 rounded bg-dark-green px-2 py-1 text-xs font-bold text-white disabled:opacity-50 hover:bg-dark-green/90 transition-colors shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player2.id)}
            >
              {savingId === match.id ? "Saving..." : "P2 wins"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
