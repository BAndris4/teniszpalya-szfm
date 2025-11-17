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
        <div className="rounded-2xl bg-white p-8">
          <p className="text-dark-green">Loading bracket...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
        <div className="rounded-2xl bg-white p-8">
          <p className="mb-4 text-red-600">{error}</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-dark-green px-4 py-2 text-white hover:bg-dark-green/90"
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
        <div className="rounded-2xl bg-white p-8">
          <p className="mb-4">No bracket data available</p>
          <button
            onClick={onClose}
            className="rounded-lg bg-dark-green px-4 py-2 text-white hover:bg-dark-green/90"
          >
            Close
          </button>
        </div>
      </div>
    );
  }

  const totalRounds = bracket.rounds.length;
  const isFinal = totalRounds === 1;

  // Split rounds for two-sided bracket (left side plays toward right, right side plays toward left)
  const leftRounds = bracket.rounds.slice(0, Math.ceil(totalRounds / 2));
  const rightRounds = bracket.rounds.slice(Math.ceil(totalRounds / 2)).reverse();

  return (
    <div className="fixed inset-0 z-50 overflow-auto bg-black/50 p-4">
      <div className="mx-auto max-w-7xl rounded-2xl bg-white p-6 shadow-xl">
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

        {/* Bracket */}
        {isFinal ? (
          // Single final match
          <div className="flex items-center justify-center py-8">
            <RoundColumn
              round={bracket.rounds[0]}
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
          <div className="flex items-start justify-between gap-8">
            {/* Left side */}
            <div className="flex flex-1 gap-4">
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

            {/* Finals in the middle */}
            {totalRounds > 1 && (
              <div className="flex items-center">
                <RoundColumn
                  round={bracket.rounds[bracket.rounds.length - 1]}
                  roundIndex={totalRounds - 1}
                  isFinal={true}
                    side="final"
                  isAdmin={isAdmin}
                  savingId={savingId}
                  onSubmitResult={submitResult}
                  scores={scores}
                  setScores={setScores}
                />
              </div>
            )}

            {/* Right side */}
            <div className="flex flex-1 flex-row-reverse gap-4">
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

  return (
    <div className="flex flex-col" style={{ marginTop }}>
      <h3 className="mb-3 text-center text-sm font-semibold text-dark-green">
        {displayName}
      </h3>
      <div className="flex flex-col gap-6">
        {round.matches.map((match) => (
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
    <div className="relative w-52 rounded-lg border-2 border-dark-green-octa bg-white shadow-md">
      {/* Connector lines */}
      {side === "left" && (
        <>
          {/* Right horizontal connector */}
          <div className="absolute right-[-16px] top-1/2 h-[1px] w-4 -translate-y-1/2 bg-gray-300" />
        </>
      )}
      {side === "right" && (
        <>
          {/* Left horizontal connector */}
          <div className="absolute left-[-16px] top-1/2 h-[1px] w-4 -translate-y-1/2 bg-gray-300" />
        </>
      )}
      {/* Player 1 */}
      <div
        className={`border-b px-3 py-2 ${
          isCompleted && winner?.id === match.player1?.id
            ? "bg-green-100 font-semibold"
            : ""
        }`}
      >
        <p className="text-sm text-gray-800">{player1Name}</p>
      </div>

      {/* Player 2 */}
      <div
        className={`px-3 py-2 ${
          isCompleted && winner?.id === match.player2?.id
            ? "bg-green-100 font-semibold"
            : ""
        }`}
      >
        <p className="text-sm text-gray-800">{player2Name}</p>
      </div>

      {/* Score */}
      {match.score && (
        <div className="border-t bg-gray-50 px-3 py-1 text-center">
          <p className="text-xs text-gray-600">{match.score}</p>
        </div>
      )}

      {canSet && (
        <div className="space-y-2 border-t p-2">
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
              className="flex-1 rounded bg-green-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
            >
              {savingId === match.id ? "Saving..." : "P1 wins"}
            </button>
            <button
              className="flex-1 rounded bg-blue-600 px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
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
