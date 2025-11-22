
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "../hooks/useCurrentUser";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";

const API_BASE = "http://localhost:5044/api/tournaments";

function AdminBracketView() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [bracket, setBracket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [scores, setScores] = useState({});

  useEffect(() => {
    loadBracket();
  }, [id]);

  async function loadBracket() {
    try {
      const res = await fetch(`http://localhost:5044/api/tournaments/${id}/bracket`, {
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
        `http://localhost:5044/api/tournaments/${id}/matches/${match.id}/result`,
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
      <ReserveMenuProvider>
        <div className="relative bg-slate-50 overflow-hidden min-h-screen">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-slate-700 border-t-transparent mb-4"></div>
              <p className="text-slate-600 text-lg">Loading bracket...</p>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

  if (error || !bracket) {
    return (
      <ReserveMenuProvider>
        <div className="relative bg-slate-50 overflow-hidden min-h-screen">
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <p className="text-2xl text-red-600 mb-4">{error || "Bracket not found"}</p>
              <button
                onClick={() => navigate("/admin/tournaments")}
                className="px-6 py-3 bg-slate-800 text-white rounded-xl hover:bg-slate-700 font-semibold"
              >
                Back to Admin
              </button>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

  const totalRounds = bracket.rounds?.length || 0;
  const activeRoundNumber = bracket.rounds.find(r => r.matches.some(m => m.status !== 2))?.round ?? null;
  const thirdPlaceMatch = bracket.thirdPlaceMatch;
  const champion = bracket.champion;

  // Dynamic vertical positioning for any participant count (supports 8,16,... powers of 2)
  const cardHeight = 96;
  const baseGap = 32;
  const firstRoundMatches = bracket.rounds[0]?.matches.length || 0;

  // Precompute top positions per round
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
    <ReserveMenuProvider>
      <div className="relative bg-slate-50 overflow-hidden min-h-screen">
        <div className="relative z-10">
          <Navbar />
          <div className="pt-32 px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header */}
              <div className="text-center mb-12 relative">
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.6, type: "spring", stiffness: 200 }}
                  className="inline-block mb-6"
                >
                  <svg className="w-24 h-24 mx-auto text-slate-700 drop-shadow-lg" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"/>
                  </svg>
                </motion.div>
                
                <motion.h1 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.2 }}
                  className="text-6xl font-bold text-slate-800 mb-4 tracking-tight"
                >
                  Tournament Bracket
                </motion.h1>
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: 0.4 }}
                  className="text-xl text-slate-600 max-w-2xl mx-auto"
                >
                  Admin View - Manage matches and results
                </motion.p>
              </div>
            
              {/* Bracket */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-slate-200"
              >
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
                  
                  {/* 3rd Place Match */}
                  {thirdPlaceMatch && (
                    <div className="ml-12 flex flex-col">
                      <h3 className="mb-6 text-center text-lg font-bold text-slate-700">3rd Place</h3>
                      <div className="mt-12">
                        <MatchCard
                          match={thirdPlaceMatch}
                          side="final"
                          isAdmin={isAdmin}
                          savingId={savingId}
                          onSubmitResult={submitResult}
                          scores={scores}
                          setScores={setScores}
                        />
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Champion section */}
              {champion && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6 }}
                  className="mt-10 flex flex-col items-center"
                >
                  <div className="relative">
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.5, type: 'spring' }}
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 text-white flex items-center justify-center shadow-xl"
                    >
                      <span className="text-center font-bold text-lg px-2">{champion.name}</span>
                    </motion.div>
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-lg font-semibold text-slate-700">
                    <span role="img" aria-label="trophy">🏆</span>
                    Tournament Champion
                  </p>
                </motion.div>
              )}
            </motion.div>
          </div>
        </div>
      </div>
    </ReserveMenuProvider>
  );
}


function RoundColumn({ round, roundIndex, isFinal, side = "left", isAdmin, savingId, onSubmitResult, scores, setScores, isActive, marginTop, gapBetweenMatches, matchHeight, firstRoundMatches }) {
  const baseNames = firstRoundMatches === 8
    ? ["Round of 16", "Quarterfinals", "Semifinals", "Finals"]
    : ["Round 1", "Quarterfinals", "Semifinals", "Finals"];
  const displayName = isFinal ? "Finals" : baseNames[roundIndex] || `Round ${roundIndex + 1}`;
  return (
    <motion.div 
      className="flex flex-col" 
      style={{ marginTop: `${marginTop}px` }}
      initial={{ opacity: 0, x: -30 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: roundIndex * 0.1 }}
    >
      <motion.h3 
        className="mb-6 text-center text-lg font-bold text-slate-700"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: roundIndex * 0.1 + 0.2 }}
      >
        {displayName}
      </motion.h3>
      <div className="flex flex-col relative" style={{ gap: `${gapBetweenMatches}px` }}>
        {round.matches.map((match, matchIdx) => (
          <div key={match.id} className="relative">
            {/* Horizontal line coming INTO the match from previous round */}
            {roundIndex > 0 && (
              <div className="absolute right-full bg-slate-700" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            
            {/* Horizontal line going OUT from the match to next round */}
            {!isFinal && (
              <div className="absolute left-full bg-slate-700" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            
            {/* Vertical connector connecting pairs of matches to next round */}
            {!isFinal && matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length && (
              <div 
                className="absolute left-[calc(100%+46.5px)] bg-slate-700"
                style={{ 
                  top: 'calc(50% - 1.5px)',
                  width: '3px',
                  height: `${gapBetweenMatches + matchHeight + 1.5}px`
                }}
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
              isActiveRound={isActive}
            />
          </div>
        ))}
      </div>
    </motion.div>
  );
}

function MatchCard({ match, side, isAdmin, savingId, onSubmitResult, scores, setScores }) {
  const player1Name = match.player1?.name || "TBD";
  const player2Name = match.player2?.name || "TBD";
  const isCompleted = match.status === 2;
  const winner = match.winner;
  const canSet = isAdmin && !isCompleted && match.player1 && match.player2;

  return (
    <motion.div 
      className="relative w-56 rounded-xl border-2 border-slate-300 bg-white shadow-md transition-all group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >

      {/* Player 1 */}
      <motion.div
        className={`border-b border-slate-200 px-4 py-3 transition-all relative flex items-center justify-between ${
          isCompleted && winner?.id === match.player1?.id
            ? "bg-slate-100 font-bold text-slate-900"
            : "text-slate-700 hover:bg-slate-50"
        }`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player1?.id && (
            <motion.svg 
              className="w-4 h-4 text-slate-700" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
          )}
          {player1Name}
        </p>
        {match.score && isCompleted && (
          <span className="text-xs font-semibold text-slate-600">{match.score.split('-')[0] || match.score}</span>
        )}
      </motion.div>

      {/* Player 2 */}
      <motion.div
        className={`px-4 py-3 transition-all relative flex items-center justify-between ${
          isCompleted && winner?.id === match.player2?.id
            ? "bg-slate-100 font-bold text-slate-900"
            : "text-slate-700 hover:bg-slate-50"
        }`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player2?.id && (
            <motion.svg 
              className="w-4 h-4 text-slate-700" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ duration: 0.5, type: "spring" }}
            >
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
          )}
          {player2Name}
        </p>
        {match.score && isCompleted && (
          <span className="text-xs font-semibold text-slate-600">{match.score.split('-')[1] || ''}</span>
        )}
      </motion.div>

      {canSet && (
        <motion.div 
          className="space-y-2 border-t border-slate-200 p-3 bg-slate-50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded-lg border-2 border-slate-300 px-3 py-2 text-xs focus:border-slate-600 focus:outline-none focus:ring-2 focus:ring-slate-400/20 transition-all"
            value={scores[match.id] || ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [match.id]: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <motion.button
              className="flex-1 rounded-lg bg-slate-800 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-slate-700 transition-all shadow-sm hover:shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {savingId === match.id ? (
                <span className="flex items-center justify-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : "P1 wins"}
            </motion.button>
            <motion.button
              className="flex-1 rounded-lg bg-slate-600 px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-slate-500 transition-all shadow-sm hover:shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player2.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {savingId === match.id ? (
                <span className="flex items-center justify-center gap-1">
                  <svg className="animate-spin h-3 w-3" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : "P2 wins"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

export default AdminBracketView;
