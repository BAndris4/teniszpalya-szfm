import { useState, useEffect } from "react";
import { motion } from "framer-motion";
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
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-gray-300 border-t-gray-600 mb-3"></div>
          <p className="text-gray-700">Loading bracket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
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
        <div className="rounded-xl bg-white p-8 shadow-lg">
          <p className="mb-4 text-gray-700">No bracket data available</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-gray-600 px-4 py-2 text-white hover:bg-gray-700"
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

  // Determine current active round (first with any match not completed)
  const allRounds = [...leftRounds, ...middleRounds, ...rightRounds];
  const activeRoundIndexGlobal = allRounds.findIndex(r => r.matches.some(m => m.status !== 2));

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-xl bg-white p-6 shadow-xl border border-gray-200">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between border-b pb-4">
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
            className="rounded-lg bg-gray-200 px-4 py-2 text-gray-700 hover:bg-gray-300"
          >
            Close
          </button>
        </div>
        {/* Round progress badges */}
        <div className="flex flex-wrap gap-3 mb-8 justify-center">
          {allRounds.map((r, idx) => {
            const isActive = idx === activeRoundIndexGlobal && bracket.status === 1;
            const isDone = r.matches.every(m => m.status === 2);
            return (
              <div
                key={`badge-${idx}`}
                className={`px-3 py-1 rounded-full text-xs font-semibold tracking-wide border transition-colors ${isActive
                    ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                    : isDone
                      ? 'bg-green-50 border-green-300 text-green-700'
                      : 'bg-gray-100 border-gray-300 text-gray-600'
                  }`}
              >
                {idx + 1 < allRounds.length ? `Round ${idx + 1}` : 'Final'}
              </div>
            );
          })}
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

function RoundColumn({ round, roundIndex, isFinal, totalInSide, side = "left", isAdmin, savingId, onSubmitResult, scores, setScores, isActive }) {
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
                    "absolute w-[2px] bg-gray-300 " +
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
                isActiveRound={isActive}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

function MatchCard({ match, side, isAdmin, savingId, onSubmitResult, scores, setScores, isActiveRound }) {
  const player1Name = match.player1?.name || "TBD";
  const player2Name = match.player2?.name || "TBD";
  const isCompleted = match.status === 2;
  const winner = match.winner;
  const canSet = isAdmin && !isCompleted && match.player1 && match.player2;

  // Status color coding
  const statusBorder = isCompleted
    ? 'border-green-400'
    : match.player1 && match.player2
      ? 'border-yellow-400'
      : 'border-gray-300';

  const activeGlow = isActiveRound && !isCompleted ? 'shadow-[0_0_0_3px_rgba(59,130,246,0.15)]' : '';

  return (
    <motion.div
      className={`relative w-52 rounded-lg border-2 bg-white shadow-sm hover:shadow-md transition-shadow ${statusBorder} ${activeGlow}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.25 }}
    >
      {/* Connector lines to next round */}
      {side === "left" && (
        <div className="absolute right-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-gray-400" />
      )}
      {side === "right" && (
        <div className="absolute left-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-gray-400" />
      )}
      {side === "middle" && (
        <>
          <div className="absolute right-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-gray-400" />
          <div className="absolute left-[-50px] top-1/2 h-[2px] w-12 -translate-y-1/2 bg-gray-400" />
        </>
      )}
      {/* Player 1 */}
      <div
        className={`border-b px-3 py-2 ${isCompleted && winner?.id === match.player1?.id
            ? "bg-blue-100 font-semibold"
            : ""
          }`}
      >
        <p className="text-sm text-gray-800 flex items-center gap-1">
          {isCompleted && winner?.id === match.player1?.id && (
            <span className="text-yellow-500" title="Winner">🏆</span>
          )}
          {player1Name}
        </p>
      </div>

      {/* Player 2 */}
      <div
        className={`px-3 py-2 ${isCompleted && winner?.id === match.player2?.id
            ? "bg-blue-100 font-semibold"
            : ""
          }`}
      >
        <p className="text-sm text-gray-800 flex items-center gap-1">
          {isCompleted && winner?.id === match.player2?.id && (
            <span className="text-yellow-500" title="Winner">🏆</span>
          )}
          {player2Name}
        </p>
      </div>

      {/* Score */}
      {match.score && (
        <div className="border-t bg-gray-50 px-3 py-1 text-center">
          <p className="text-xs text-gray-600">{match.score}</p>
        </div>
      )}

      {canSet && (
        <div className="space-y-2 border-t p-2 bg-gray-50">
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded border px-2 py-1 text-xs"
            value={scores[match.id] || ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [match.id]: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-blue-700"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
            >
              {savingId === match.id ? "Saving..." : "P1 wins"}
            </button>
            <button
              className="flex-1 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50 hover:bg-green-700"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player2.id)}
            >
              {savingId === match.id ? "Saving..." : "P2 wins"}
            </button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
