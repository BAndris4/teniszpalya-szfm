import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "../hooks/useCurrentUser";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";

const API_BASE = "http://localhost:5044/api/tournaments";

function TournamentBracketPage() {
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
      const res = await fetch(`${API_BASE}/${id}/bracket`, {
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
        `${API_BASE}/${id}/matches/${match.id}/result`,
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
        <div className="relative bg-white overflow-hidden min-h-screen">
          <motion.div
            className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
            animate={{
              top: ["-20vh", "10vh", "-20vh"],
              left: ["20vw", "30vw", "20vw"],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
            animate={{
              top: ["60vh", "70vh", "60vh"],
              left: ["65vw", "55vw", "65vw"],
            }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green border-t-transparent mb-4"></div>
                <p className="text-dark-green-half text-lg">Loading bracket...</p>
              </div>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

  if (error || !bracket) {
    return (
      <ReserveMenuProvider>
        <div className="relative bg-white overflow-hidden min-h-screen">
          <motion.div
            className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
            animate={{
              top: ["-20vh", "10vh", "-20vh"],
              left: ["20vw", "30vw", "20vw"],
            }}
            transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="relative z-10">
            <Navbar />
            <div className="flex items-center justify-center min-h-screen">
              <div className="text-center">
                <p className="text-2xl text-red-600 mb-4">{error || "Bracket not found"}</p>
                <button
                  onClick={() => navigate("/tournaments")}
                  className="px-6 py-3 bg-green text-white rounded-xl hover:bg-green/90 font-semibold"
                >
                  Back to Tournaments
                </button>
              </div>
            </div>
          </div>
        </div>
      </ReserveMenuProvider>
    );
  }

  const totalRounds = bracket.rounds?.length || 0;
  // Determine active round number (first with any incomplete match)
  const activeRoundNumber = bracket.rounds.find(r => r.matches.some(m => m.status !== 2))?.round ?? null;
  const isCompletedTournament = bracket.status === 2;
  // Champion (winner of final match if completed)
  let champion = null;
  if (isCompletedTournament && bracket.rounds.length > 0) {
    const finalRound = bracket.rounds[bracket.rounds.length - 1];
    const decidedFinal = finalRound.matches.find(m => m.winner);
    champion = decidedFinal?.winner;
  }
  
  // Split rounds for proper two-sided bracket like FIFA World Cup
  let leftRounds = [];
  let rightRounds = [];
  let middleRounds = [];

  if (totalRounds === 1) {
    middleRounds = [bracket.rounds[0]];
  } else if (totalRounds === 2) {
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
    const numEarlyRounds = totalRounds - 2;
    
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
    
    middleRounds = bracket.rounds.slice(numEarlyRounds);
  }

  return (
    <ReserveMenuProvider>
      <div className="relative bg-white overflow-hidden min-h-screen">
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
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5 }}
                className="mb-8"
              >
                <motion.button
                  onClick={() => navigate("/tournaments")}
                  className="mb-6 flex items-center gap-2 text-dark-green hover:text-green transition-colors group"
                  whileHover={{ x: -5 }}
                  transition={{ duration: 0.2 }}
                >
                  <motion.svg 
                    className="w-5 h-5 transition-transform group-hover:-translate-x-1" 
                    fill="currentColor" 
                    viewBox="0 0 20 20"
                  >
                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                  </motion.svg>
                  <span className="font-semibold">Back to Tournaments</span>
                </motion.button>
                
                <div className="flex items-center gap-4 mb-3">
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <svg className="w-12 h-12 text-green" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M7.73 9.728a6.726 6.726 0 0 0 2.748 1.35m8.272-6.842V4.5c0 2.108-.966 3.99-2.48 5.228m2.48-5.492a46.32 46.32 0 0 1 2.916.52 6.003 6.003 0 0 1-5.395 4.972m0 0a6.726 6.726 0 0 1-2.749 1.35m0 0a6.772 6.772 0 0 1-3.044 0"/>
                    </svg>
                  </motion.div>
                  <div>
                    <motion.h1 
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="text-5xl font-bold text-dark-green"
                    >
                      {bracket.tournamentTitle}
                    </motion.h1>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.3 }}
                      className="flex items-center gap-2 mt-2"
                    >
                      <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                        bracket.status === 1 
                          ? 'bg-green/20 text-green' 
                          : 'bg-gray-200 text-gray-700'
                      }`}>
                        {bracket.status === 1 ? "In Progress" : "Completed"}
                      </span>
                    </motion.div>
                  </div>
                </div>
              </motion.div>

              {/* Round progress badges */}
              <div className="flex flex-wrap gap-3 mb-6 justify-center">
                {bracket.rounds.map(r => {
                  const done = r.matches.every(m => m.status === 2);
                  const active = r.round === activeRoundNumber && !isCompletedTournament;
                  return (
                    <div
                      key={`progress-${r.round}`}
                      className={`px-4 py-1 rounded-full text-xs font-semibold border tracking-wide transition-colors ${
                        active
                          ? 'bg-blue-50 border-blue-300 text-blue-700 shadow-sm'
                          : done
                          ? 'bg-green/10 border-green/40 text-green-700'
                          : 'bg-gray-100 border-gray-300 text-gray-600'
                      }`}
                    >
                      {r.round + 1 < totalRounds ? `Round ${r.round + 1}` : 'Final'}
                    </div>
                  );
                })}
              </div>

              {/* Bracket */}
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              >
                {totalRounds === 1 ? (
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
                  <div className="flex items-start justify-center gap-12 overflow-x-auto overflow-y-visible pb-4">
                    {/* Left side */}
                    {leftRounds.length > 0 && (
                      <div className="flex gap-8 relative">
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
                            isActive={round.round === activeRoundNumber}
                          />
                        ))}
                      </div>
                    )}

                    {/* Middle (semi-finals, finals) */}
                    {middleRounds.length > 0 && (
                      <div className="flex gap-8 relative">
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
                            isActive={round.round === activeRoundNumber}
                          />
                        ))}
                      </div>
                    )}

                    {/* Right side */}
                    {rightRounds.length > 0 && (
                      <div className="flex flex-row-reverse gap-8 relative">
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
                            isActive={round.round === activeRoundNumber}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                )}
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
                      className="w-28 h-28 rounded-full bg-gradient-to-br from-green/60 to-green text-white flex items-center justify-center shadow-xl"
                    >
                      <span className="text-center font-bold text-lg px-2">{champion.name}</span>
                    </motion.div>
                    {/* Confetti */}
                    {[...Array(18)].map((_, i) => (
                      <motion.span
                        key={i}
                        className="absolute w-2 h-2 rounded-full"
                        style={{
                          backgroundColor: ['#16a34a','#059669','#10b981','#34d399','#6ee7b7'][i % 5],
                          top: '50%',
                          left: '50%'
                        }}
                        initial={{ x: 0, y: 0, opacity: 0 }}
                        animate={{
                          x: (Math.random() - 0.5) * 160,
                          y: (Math.random() - 0.5) * 160,
                          opacity: 1
                        }}
                        transition={{ duration: 1.2, delay: i * 0.05 }}
                      />
                    ))}
                  </div>
                  <p className="mt-4 flex items-center gap-2 text-lg font-semibold text-dark-green">
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

function RoundColumn({ round, roundIndex, isFinal, totalInSide, side = "left", isAdmin, savingId, onSubmitResult, scores, setScores, isActive }) {
  const roundNames = ["Round 1", "Round 2", "Semi-Finals", "Finals"];
  const displayName = isFinal
    ? "Finals"
    : roundNames[roundIndex] || `Round ${roundIndex + 1}`;

  const marginTop = roundIndex > 0 ? `${roundIndex * 3}rem` : "0";

  const pairs = [];
  for (let i = 0; i < round.matches.length; i += 2) {
    pairs.push(round.matches.slice(i, i + 2));
  }

  return (
    <motion.div 
      className="flex flex-col" 
      style={{ marginTop }}
      initial={{ opacity: 0, x: side === "left" ? -30 : side === "right" ? 30 : 0 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: roundIndex * 0.1 }}
    >
      <motion.h3 
        className="mb-4 text-center text-lg font-bold text-dark-green"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: roundIndex * 0.1 + 0.2 }}
      >
        {displayName}
      </motion.h3>
      <div className="flex flex-col gap-6">
        {pairs.map((pair, idx) => (
          <div key={`pair-${idx}`} className="relative flex flex-col gap-6">
            {pair.length === 2 && (
              <>
                {/* Vertical line connecting the two matches */}
                <motion.div
                  className={
                    "absolute w-[4px] rounded bg-gradient-to-b from-green via-green to-green/70 shadow-sm " +
                    (side === "left"
                      ? "right-[-65px] top-[25%] bottom-[25%]"
                      : side === "right"
                      ? "left-[-65px] top-[25%] bottom-[25%]"
                      : "right-[-65px] top-[25%] bottom-[25%]")
                  }
                  initial={{ scaleY: 0 }}
                  animate={{ scaleY: 1 }}
                  transition={{ duration: 0.6, delay: idx * 0.12 }}
                />
                {/* Horizontal bridge from vertical to next round (if not final) */}
                {!isFinal && (
                  <motion.div
                    className={
                      "absolute top-1/2 h-[4px] -translate-y-1/2 rounded-full bg-gradient-to-r shadow-sm " +
                      (side === "left"
                        ? "right-[-97px] w-[32px] from-green/70 to-green/40"
                        : side === "right"
                        ? "left-[-97px] w-[32px] from-green/40 to-green/70 scale-x-[-1]"
                        : "right-[-97px] w-[32px] from-green/70 to-green/40")
                    }
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ duration: 0.5, delay: idx * 0.12 + 0.3 }}
                  />
                )}
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
      className="relative w-56 rounded-xl border-2 border-gray-200 bg-white shadow-md hover:shadow-xl transition-all group"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      whileHover={{ scale: 1.02, y: -2 }}
    >
      {/* Connector lines */}
      {side === "left" && (
        <div className="absolute right-[-65px] top-1/2 h-[4px] w-[65px] -translate-y-1/2 bg-gradient-to-r from-green via-green/80 to-green/60 rounded-full shadow-sm" />
      )}
      {side === "right" && (
        <div className="absolute left-[-65px] top-1/2 h-[4px] w-[65px] -translate-y-1/2 bg-gradient-to-l from-green via-green/80 to-green/60 rounded-full shadow-sm" />
      )}
      {side === "middle" && (
        <>
          <div className="absolute right-[-65px] top-1/2 h-[4px] w-[65px] -translate-y-1/2 bg-gradient-to-r from-green via-green/80 to-green/60 rounded-full shadow-sm" />
          <div className="absolute left-[-65px] top-1/2 h-[4px] w-[65px] -translate-y-1/2 bg-gradient-to-l from-green via-green/80 to-green/60 rounded-full shadow-sm" />
        </>
      )}
      
      {/* Animated accent bar */}
      <motion.div 
        className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-green to-green/50"
        initial={{ height: 0 }}
        animate={{ height: "100%" }}
        transition={{ duration: 0.5, delay: 0.2 }}
      />

      {/* Player 1 */}
      <motion.div
        className={`border-b border-gray-100 px-4 py-3 transition-all relative flex items-center justify-between ${
          isCompleted && winner?.id === match.player1?.id
            ? "bg-green/10 font-bold text-dark-green"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.1 }}
      >
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player1?.id && (
            <motion.svg 
              className="w-4 h-4 text-green" 
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
          <span className="text-xs font-semibold text-gray-600">{match.score.split('-')[0] || match.score}</span>
        )}
      </motion.div>

      {/* Player 2 */}
      <motion.div
        className={`px-4 py-3 transition-all relative flex items-center justify-between ${
          isCompleted && winner?.id === match.player2?.id
            ? "bg-green/10 font-bold text-dark-green"
            : "text-gray-700 hover:bg-gray-50"
        }`}
        initial={{ x: -10, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player2?.id && (
            <motion.svg 
              className="w-4 h-4 text-green" 
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
          <span className="text-xs font-semibold text-gray-600">{match.score.split('-')[1] || ''}</span>
        )}
      </motion.div>

      {canSet && (
        <motion.div 
          className="space-y-2 border-t border-gray-100 p-3 bg-gray-50/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          transition={{ duration: 0.3 }}
        >
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-xs focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 transition-all"
            value={scores[match.id] || ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [match.id]: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <motion.button
              className="flex-1 rounded-lg bg-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-green/90 transition-all shadow-sm hover:shadow-md"
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
              className="flex-1 rounded-lg bg-dark-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-dark-green/90 transition-all shadow-sm hover:shadow-md"
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

export default TournamentBracketPage;
