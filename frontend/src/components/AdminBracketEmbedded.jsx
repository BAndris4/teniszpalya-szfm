import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useCurrentUser } from "../hooks/useCurrentUser";

// Embedded admin bracket (single-column progressive layout) for use inside AdminPanel tournaments tab.
// Mirrors logic from AdminBracketView but strips outer page chrome (Navbar, providers) so it can be placed inline.

const API_BASE = "http://localhost:5044/api/tournaments";

export default function AdminBracketEmbedded({ tournamentId, onClose }) {
  const { user } = useCurrentUser();
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [scores, setScores] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);

  useEffect(() => {
    if (!tournamentId) return;
    loadBracket();
  }, [tournamentId]);

  async function loadBracket() {
    try {
      setLoading(true);
      setError(null);
      const res = await fetch(`${API_BASE}/${tournamentId}/bracket`, { credentials: "include" });
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
      const res = await fetch(`${API_BASE}/${tournamentId}/matches/${match.id}/result`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ winnerId, score: scores[match.id] || null })
      });
      if (!res.ok) throw new Error(`Failed to save result: ${res.status}`);
      await loadBracket();
    } catch (e) {
      setError(e?.message || "Failed to save result");
    } finally {
      setSavingId(null);
    }
  }

  if (!tournamentId) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="mt-8 rounded-2xl border border-slate-200 bg-white p-6 shadow-lg"
    >
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h3 className="text-2xl font-bold text-slate-800 tracking-tight">Tournament Bracket</h3>
          <p className="text-sm text-slate-600 mt-1">
            {bracket?.tournamentTitle || `Tournament ${tournamentId}`} {bracket?.status === 1 ? '(In Progress)' : bracket?.status === 2 ? '(Completed)' : ''}
          </p>
        </div>
        <button
          onClick={onClose}
          className="rounded-xl border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 cursor-pointer"
        >
          Close Bracket
        </button>
      </div>

      {loading && (
        <div className="py-16 text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-slate-300 border-t-slate-700" />
          <p className="text-slate-600">Loading bracket…</p>
        </div>
      )}

      {!loading && error && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      )}

      {!loading && !error && bracket && bracket.rounds && bracket.rounds.length > 0 && (
        <>
          <BracketContent
            bracket={bracket}
            isAdmin={isAdmin}
            savingId={savingId}
            submitResult={submitResult}
            scores={scores}
            setScores={setScores}
            selectedMatch={selectedMatch}
            setSelectedMatch={setSelectedMatch}
          />
          
          {isAdmin && selectedMatch && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-8 rounded-xl border-2 border-slate-300 bg-slate-50 p-6"
            >
              <div className="mb-4">
                <h4 className="text-lg font-bold text-slate-800">Set Match Result</h4>
                <p className="text-sm text-slate-600 mt-1">
                  {selectedMatch.player1?.name || "TBD"} vs {selectedMatch.player2?.name || "TBD"}
                </p>
              </div>
              <div className="space-y-3">
                <input
                  type="text"
                  placeholder="Score (e.g. 6-4, 6-3)"
                  className="w-full rounded-lg border-2 border-slate-300 px-4 py-3 text-sm focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20"
                  value={scores[selectedMatch.id] || ''}
                  onChange={(e) => setScores(s => ({ ...s, [selectedMatch.id]: e.target.value }))}
                />
                <div className="flex gap-3">
                  <button
                    className="flex-1 rounded-lg bg-slate-800 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-slate-700 transition"
                    disabled={savingId === selectedMatch.id}
                    onClick={() => {
                      submitResult(selectedMatch, selectedMatch.player1.id);
                      setSelectedMatch(null);
                    }}
                  >
                    {savingId === selectedMatch.id ? 'Saving…' : `${selectedMatch.player1?.name || "P1"} Wins`}
                  </button>
                  <button
                    className="flex-1 rounded-lg bg-slate-600 px-4 py-3 text-sm font-bold text-white disabled:opacity-50 hover:bg-slate-500 transition"
                    disabled={savingId === selectedMatch.id}
                    onClick={() => {
                      submitResult(selectedMatch, selectedMatch.player2.id);
                      setSelectedMatch(null);
                    }}
                  >
                    {savingId === selectedMatch.id ? 'Saving…' : `${selectedMatch.player2?.name || "P2"} Wins`}
                  </button>
                  <button
                    className="rounded-lg border-2 border-slate-300 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-100 transition"
                    onClick={() => setSelectedMatch(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}

function BracketContent({ bracket, isAdmin, savingId, submitResult, scores, setScores, selectedMatch, setSelectedMatch }) {
  const activeRoundNumber = bracket.rounds.find(r => r.matches.some(m => m.status !== 2))?.round ?? null;
  const thirdPlaceMatch = bracket.thirdPlaceMatch;
  const champion = bracket.champion;

  const cardHeight = 96;
  const baseGap = 32;
  const firstRoundMatches = bracket.rounds[0]?.matches.length || 0;

  const roundTopPositions = [];
  const roundMarginTop = [];
  const roundGapBetween = [];

  if (firstRoundMatches > 0) {
    const tops0 = Array.from({ length: firstRoundMatches }, (_, i) => i * (cardHeight + baseGap));
    roundTopPositions.push(tops0);
    roundMarginTop.push(0);
    roundGapBetween.push(baseGap);
  }

  for (let r = 1; r < bracket.rounds.length; r++) {
    const prevTops = roundTopPositions[r - 1];
    const prevCenters = prevTops.map(t => t + cardHeight / 2);
    const matchCount = bracket.rounds[r].matches.length;
    const tops = [];
    for (let i = 0; i < matchCount; i++) {
      const c1 = prevCenters[i * 2];
      const c2 = prevCenters[i * 2 + 1];
      const center = (c1 + c2) / 2;
      tops.push(center - cardHeight / 2);
    }
    roundTopPositions.push(tops);
    roundMarginTop.push(tops[0]);
    if (matchCount > 1) {
      const gap = tops[1] - (tops[0] + cardHeight);
      roundGapBetween.push(gap);
    } else {
      roundGapBetween.push(baseGap);
    }
  }

  return (
    <div>
      <div className="flex items-start overflow-x-auto pb-4 w-full">
        {bracket.rounds.length === 1 ? (
          <div className="flex justify-center w-full">
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
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              isActive={bracket.rounds[0].round === activeRoundNumber}
              marginTop={roundMarginTop[0]}
              gapBetweenMatches={roundGapBetween[0]}
              matchHeight={cardHeight}
              firstRoundMatches={firstRoundMatches}
            />
          </div>
        ) : (
          bracket.rounds.map((round, idx) => {
            const isLastBeforeFinal = idx === bracket.rounds.length - 2;
            const isFinalRound = idx === bracket.rounds.length - 1;
            let marginRight = '48px';
            if (idx === 0 || idx === 1) marginRight = '96px';
            if (isLastBeforeFinal) marginRight = '96px';
            if (isFinalRound) marginRight = '46.5px';
            return (
              <div key={`round-wrapper-${round.round}`} style={{ marginRight }}>
                <RoundColumn
                  key={`round-${round.round}`}
                  round={round}
                  roundIndex={idx}
                  isFinal={isFinalRound}
                  side="left"
                  isAdmin={isAdmin}
                  savingId={savingId}
                  onSubmitResult={submitResult}
                  scores={scores}
                  setScores={setScores}
                  selectedMatch={selectedMatch}
                  setSelectedMatch={setSelectedMatch}
                  isActive={round.round === activeRoundNumber}
                  marginTop={roundMarginTop[idx]}
                  gapBetweenMatches={roundGapBetween[idx]}
                  matchHeight={cardHeight}
                  firstRoundMatches={firstRoundMatches}
                />
              </div>
            );
          })
        )}

        {thirdPlaceMatch && (
          <div className="ml-12 flex flex-col">
            <h3 className="mb-3 text-center text-sm font-bold text-slate-700">3rd Place</h3>
            <div>
              <MatchCard
                match={thirdPlaceMatch}
                side="final"
                isAdmin={isAdmin}
                savingId={savingId}
                onSubmitResult={submitResult}
                scores={scores}
                setScores={setScores}
                selectedMatch={selectedMatch}
                setSelectedMatch={setSelectedMatch}
              />
            </div>
          </div>
        )}
      </div>

      {champion && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mt-8 flex flex-col items-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ duration: 0.5, type: 'spring' }}
            className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center shadow-xl"
          >
            <span className="text-center font-bold text-sm px-2">{champion.name}</span>
          </motion.div>
          <p className="mt-3 flex items-center gap-2 text-sm font-semibold text-slate-700">
            <span role="img" aria-label="trophy">🏆</span>
            Champion
          </p>
        </motion.div>
      )}
    </div>
  );
}

function RoundColumn({ round, roundIndex, isFinal, side, isAdmin, savingId, onSubmitResult, scores, setScores, selectedMatch, setSelectedMatch, isActive, marginTop, gapBetweenMatches, matchHeight, firstRoundMatches }) {
  const baseNames = firstRoundMatches === 8
    ? ["Round of 16", "Quarterfinals", "Semifinals", "Finals"]
    : ["Round 1", "Quarterfinals", "Semifinals", "Finals"];
  const displayName = isFinal ? "Finals" : baseNames[roundIndex] || `Round ${roundIndex + 1}`;
  return (
    <motion.div
      className="flex flex-col"
      style={{ marginTop: `${marginTop}px` }}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay: roundIndex * 0.05 }}
    >
      <h3 className="mb-4 text-center text-sm font-semibold text-slate-700">{displayName}</h3>
      <div className="flex flex-col relative" style={{ gap: `${gapBetweenMatches}px` }}>
        {round.matches.map((match, matchIdx) => (
          <div key={match.id} className="relative">
            {roundIndex > 0 && (
              <div className="absolute right-full bg-slate-700" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            {!isFinal && (
              <div className="absolute left-full bg-slate-700" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            {!isFinal && matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length && (
              <div
                className="absolute left-[calc(100%+46.5px)] bg-slate-700"
                style={{ top: 'calc(50% - 1px)', width: '3px', height: `${gapBetweenMatches + matchHeight - 1}px` }}
              />
            )}
            <MatchCard
              match={match}
              side={side}
              isAdmin={isAdmin}
              savingId={savingId}
              onSubmitResult={onSubmitResult}
              scores={scores}
              setScores={setScores}
              selectedMatch={selectedMatch}
              setSelectedMatch={setSelectedMatch}
              isActiveRound={isActive}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MatchCard({ match, side, isAdmin, savingId, onSubmitResult, scores, setScores, selectedMatch, setSelectedMatch }) {
  const player1Name = match.player1?.name || "TBD";
  const player2Name = match.player2?.name || "TBD";
  const isCompleted = match.status === 2;
  const winner = match.winner;
  const canSet = isAdmin && !isCompleted && match.player1 && match.player2;
  const isSelected = selectedMatch?.id === match.id;
  const topWinner = isCompleted && winner?.id === match.player1?.id;
  const bottomWinner = isCompleted && winner?.id === match.player2?.id;

  return (
    <motion.div
      className={`relative w-56 rounded-xl border-2 bg-white shadow-sm transition-all overflow-hidden ${
        isSelected ? 'border-slate-600 ring-2 ring-slate-400/30' : 'border-slate-300'
      } ${canSet ? 'cursor-pointer hover:border-slate-500' : ''}`}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25 }}
      onClick={() => canSet && setSelectedMatch(match)}
    >

      {/* overlays use the exact Tailwind slate color so admin stays non-green */}
      {topWinner && (
        <div className="absolute inset-x-0 top-0 h-1/2 bg-slate-100 rounded-t-xl pointer-events-none" />
      )}
      {bottomWinner && (
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-slate-100 rounded-b-xl pointer-events-none" />
      )}

      <div
        className={`relative z-10 border-b border-slate-200 px-4 py-3 flex items-center justify-between text-sm ${topWinner ? 'font-semibold text-slate-900' : 'text-slate-700'}`}
      >
        <span>{player1Name}</span>
        {match.score && isCompleted && (
          <span className="text-xs font-semibold text-slate-600">{match.score.split('-')[0] || match.score}</span>
        )}
      </div>
      <div
        className={`relative z-10 px-4 py-3 flex items-center justify-between text-sm ${bottomWinner ? 'font-semibold text-slate-900' : 'text-slate-700'}`}
      >
        <span>{player2Name}</span>
        {match.score && isCompleted && (
          <span className="text-xs font-semibold text-slate-600">{match.score.split('-')[1] || ''}</span>
        )}
      </div>
    </motion.div>
  );
}
