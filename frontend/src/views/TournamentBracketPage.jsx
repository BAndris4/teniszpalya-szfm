import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useCurrentUser } from "../hooks/useCurrentUser";
import Navbar from "../components/Navbar";
import { ReserveMenuProvider } from "../contexts/ReserveMenuContext";
import { backgroundPositions } from "../backgroundPositions";

function TournamentBracketPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const [bracket, setBracket] = useState(null);
  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [scores, setScores] = useState({});

  const { topBlob, bottomBlob } = backgroundPositions.Hero;

  useEffect(() => {
    loadData();
  }, [id]);

  // Derived bracket with BYE auto-advances
  const displayBracket = useMemo(() => {
    if (!bracket) return null;
    try {
      return autoAdvanceByes(structuredClone(bracket));
    } catch { return bracket; }
  }, [bracket]);

  async function loadData() {
    try {
      const [brRes, tRes] = await Promise.all([
        fetch(`http://localhost:5044/api/tournaments/${id}/bracket`, { credentials: "include" }),
        fetch(`http://localhost:5044/api/tournaments/${id}`)
      ]);
      if (!brRes.ok) throw new Error(`Failed to load bracket: ${brRes.status}`);
      const brData = await brRes.json();
      setBracket(brData);
      if (tRes.ok) {
        const tData = await tRes.json();
        setTournament(tData);
      }
    } catch (e) {
      setError(e?.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  }

  const isAdmin = false; // Public view

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
      await loadData();
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
          <Navbar />
          <div className="flex items-center justify-center min-h-screen">
            <div className="text-center">
              <div className="inline-block animate-spin rounded-full h-16 w-16 border-4 border-green border-t-transparent mb-4"></div>
              <p className="text-dark-green-half text-lg">Loading bracket...</p>
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
      </ReserveMenuProvider>
    );
  }

  const activeRoundNumber = displayBracket?.rounds.find(r => r.matches.some(m => m.status !== 2))?.round ?? null;
  const thirdPlaceMatch = displayBracket?.thirdPlaceMatch;

  // --- LOGIKA A DOBOGÓSOK MEGHATÁROZÁSÁHOZ ---
  let champion = displayBracket?.champion;
  let runnerUp = null;
  let thirdPlaceWinner = null;

  if (displayBracket && displayBracket.rounds.length > 0) {
    const finalRound = displayBracket.rounds[displayBracket.rounds.length - 1];
    
    // Ha van döntő meccs
    if (finalRound.matches.length === 1) {
      const finalMatch = finalRound.matches[0];
      
      // Ha a meccs lezárult (status === 2) és van győztese
      if (finalMatch.status === 2 && finalMatch.winner) {
        // Ha a champion még nincs beállítva, beállítjuk most
        if (!champion) {
            champion = finalMatch.winner;
        }
        
        // A vesztes a 2. helyezett
        runnerUp = finalMatch.winner.id === finalMatch.player1?.id 
          ? finalMatch.player2 
          : finalMatch.player1;
      }
    }

    // 3. helyezett keresése
    if (displayBracket.thirdPlaceMatch?.status === 2 && displayBracket.thirdPlaceMatch?.winner) {
      thirdPlaceWinner = displayBracket.thirdPlaceMatch.winner;
    }
  }
  // -------------------------------------------

  // Layout positioning calculations
  const cardHeight = 96;
  const baseGap = 32;
  const firstRoundMatches = displayBracket?.rounds[0]?.matches.length || 0;
  const roundTopPositions = [];
  const roundMarginTop = [];
  const roundGapBetween = [];

  if (firstRoundMatches > 0) {
    const tops0 = Array.from({ length: firstRoundMatches }, (_, i) => i * (cardHeight + baseGap));
    roundTopPositions.push(tops0);
    roundMarginTop.push(0);
    roundGapBetween.push(baseGap);
  }

  for (let r = 1; r < (displayBracket?.rounds?.length || 0); r++) {
    const prevTops = roundTopPositions[r - 1];
    const prevCenters = prevTops.map(t => t + cardHeight / 2);
    const matchCount = displayBracket.rounds[r].matches.length;
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
      <div className="relative bg-white overflow-hidden min-h-screen font-['Poppins',sans-serif]">
      <motion.div
        className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
        animate={topBlob}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
      <motion.div
        className="w-[50vw] h-[50vw] bg-light-green rounded-full fixed blur-[200px] pointer-events-none z-0"
        animate={bottomBlob}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />
        <div className="relative z-10">
          <Navbar />
          <div className="pt-32 px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              {/* Tournament Info Header */}
              {tournament && (
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="mb-8 bg-white rounded-3xl p-6 shadow-xl border border-gray-100"
                >
                  <div className="mb-4">
                    <button
                      onClick={() => navigate("/tournaments")}
                      className="flex items-center gap-2 text-dark-green hover:text-green transition-colors font-semibold"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                      </svg>
                      Back to Tournaments
                    </button>
                  </div>
                  <div className="flex items-start justify-between gap-6">
                    <div className="flex-1">
                      <h1 className="text-3xl font-bold text-dark-green mb-2">
                        {tournament.title}
                      </h1>
                      {tournament.description && (
                        <p className="text-dark-green-half mb-4">
                          {tournament.description}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-3">
                         {/* Info Badges */}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/20">
                          <svg className="w-5 h-5 text-dark-green" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-dark-green">
                            {new Date(tournament.startDate).toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                        {tournament.location && (
                          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/20">
                            <svg className="w-5 h-5 text-dark-green" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                            </svg>
                            <span className="text-sm font-semibold text-dark-green">{tournament.location}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/20">
                          <svg className="w-5 h-5 text-dark-green" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                          </svg>
                          <span className="text-sm font-semibold text-dark-green">
                            {tournament.currentParticipants} / {tournament.maxParticipants}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green/5 border border-green/20">
                           <svg className="w-5 h-5 text-dark-green" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                          </svg>
                          <span className="text-sm font-semibold text-dark-green">
                            {tournament.fee > 0 ? `${tournament.fee} Ft` : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Bracket Area */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, delay: 0.2 }}
                className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100"
              >
                <div className="flex items-start overflow-x-auto pb-4 w-full">
                  {displayBracket.rounds.length === 1 ? (
                    <div className="flex justify-center w-full">
                      <RoundColumn
                        round={displayBracket.rounds[0]}
                        roundIndex={0}
                        isFinal={true}
                        side="final"
                        isAdmin={isAdmin}
                        savingId={savingId}
                        onSubmitResult={submitResult}
                        scores={scores}
                        setScores={setScores}
                        isActive={displayBracket.rounds[0].round === activeRoundNumber}
                        marginTop={roundMarginTop[0]}
                        gapBetweenMatches={roundGapBetween[0]}
                        matchHeight={cardHeight}
                        firstRoundMatches={firstRoundMatches}
                      />
                    </div>
                  ) : (
                    displayBracket.rounds.map((round, idx) => {
                      const isLastBeforeFinal = idx === displayBracket.rounds.length - 2;
                      const isFinalRound = idx === displayBracket.rounds.length - 1;
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
                      <h3 className="mb-6 text-center text-lg font-bold text-gray-700">3rd Place</h3>
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

              {/* --- TOP 3 PODIUM SECTION --- */}
              {champion && (
                <div className="mt-16 mb-8">
                  <TournamentPodium 
                    first={champion} 
                    second={runnerUp} 
                    third={thirdPlaceWinner} 
                  />
                </div>
              )}

            </motion.div>
          </div>
        </div>
      </div>
    </ReserveMenuProvider>
  );
}

// --- SEGÉD KOMPONENSEK ---

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
        className="mb-6 text-center text-lg font-bold text-dark-green"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: roundIndex * 0.1 + 0.2 }}
      >
        {displayName}
      </motion.h3>
      <div className="flex flex-col relative" style={{ gap: `${gapBetweenMatches}px` }}>
        {round.matches.map((match, matchIdx) => (
          <div key={match.id} className="relative">
            {roundIndex > 0 && (
              <div className="absolute right-full bg-green" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            {!isFinal && (
              <div className="absolute left-full bg-green" style={{ top: 'calc(50% - 1.5px)', height: '3px', width: '46.5px' }} />
            )}
            {!isFinal && matchIdx % 2 === 0 && matchIdx + 1 < round.matches.length && (
              <div 
                className="absolute left-[calc(100%+46.5px)] bg-green"
                style={{ 
                  top: 'calc(50% - 1.5px)',
                  width: '3px',
                  height: `${gapBetweenMatches + matchHeight +3}px`
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
  const isPlaceholder = (p) => !p || p.name === 'TBD' || p.id === 0;
  const isP1Placeholder = isPlaceholder(match.player1);
  const isP2Placeholder = isPlaceholder(match.player2);
  const player1Name = isP1Placeholder && !isP2Placeholder ? 'BYE' : (match.player1?.name || 'TBD');
  const player2Name = isP2Placeholder && !isP1Placeholder ? 'BYE' : (match.player2?.name || 'TBD');
  const isCompleted = match.status === 2;
  const winner = match.winner;
  const canSet = isAdmin && !isCompleted && match.player1 && match.player2;
  const topWinner = isCompleted && winner?.id === match.player1?.id;
  const bottomWinner = isCompleted && winner?.id === match.player2?.id;

  return (
    <motion.div 
      className="relative w-56 h-24 rounded-xl border-2 border-gray-200 bg-white shadow-md transition-all group flex flex-col justify-center overflow-hidden"
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      {topWinner && <div className="absolute inset-x-0 top-0 h-1/2 bg-green/10 rounded-t-xl pointer-events-none" />}
      {bottomWinner && <div className="absolute inset-x-0 bottom-0 h-1/2 bg-green/10 rounded-b-xl pointer-events-none" />}
      
      <motion.div className={`border-b border-gray-100 px-4 py-3 transition-all relative flex items-center justify-between ${topWinner ? "font-bold text-dark-green" : "text-gray-700 hover:bg-gray-50"}`}>
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player1?.id && (
            <motion.svg className="w-4 h-4 text-green" fill="currentColor" viewBox="0 0 20 20" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
          )}
          {player1Name}
        </p>
        {match.score && isCompleted && <span className="text-xs font-semibold text-gray-600">{match.score.split('-')[0] || match.score}</span>}
      </motion.div>

      <motion.div className={`px-4 py-3 transition-all relative flex items-center justify-between ${bottomWinner ? "font-bold text-dark-green" : "text-gray-700 hover:bg-gray-50"}`}>
        <p className="text-sm flex items-center gap-2">
          {isCompleted && winner?.id === match.player2?.id && (
            <motion.svg className="w-4 h-4 text-green" fill="currentColor" viewBox="0 0 20 20" initial={{ scale: 0, rotate: -180 }} animate={{ scale: 1, rotate: 0 }} transition={{ duration: 0.5, type: "spring" }}>
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
          )}
          {player2Name}
        </p>
        {match.score && isCompleted && <span className="text-xs font-semibold text-gray-600">{match.score.split('-')[1] || ''}</span>}
      </motion.div>

      {canSet && (
        <motion.div className="space-y-2 border-t border-gray-100 p-3 bg-gray-50/50" initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} transition={{ duration: 0.3 }}>
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded-lg border-2 border-gray-200 px-3 py-2 text-xs focus:border-green focus:outline-none focus:ring-2 focus:ring-green/20 transition-all"
            value={scores[match.id] || ""}
            onChange={(e) => setScores((s) => ({ ...s, [match.id]: e.target.value }))}
          />
          <div className="flex gap-2">
            <motion.button
              className="flex-1 rounded-lg bg-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-green/90 transition-all shadow-sm hover:shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {savingId === match.id ? "..." : "P1 wins"}
            </motion.button>
            <motion.button
              className="flex-1 rounded-lg bg-dark-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-dark-green/90 transition-all shadow-sm hover:shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player2.id)}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
               {savingId === match.id ? "..." : "P2 wins"}
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}

// --- PODIUM COMPONENTS ---

function TournamentPodium({ first, second, third }) {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.3, delayChildren: 0.2 }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.9 },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { type: "spring", stiffness: 100, damping: 12 }
    }
  };

  return (
    <div className="flex flex-col items-center justify-center mt-12">
      <motion.h2 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-2xl font-bold text-dark-green mb-8 text-center"
      >
        Tournament Results
      </motion.h2>

      {/* Icon Trophy Outline - Méret csökkentve h-16 w-16-ra */}
      <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20, delay: 0.1 }}
          className="mb-6"
      >
          <svg className="h-16 w-16 text-dark-green drop-shadow-lg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
            <path d="M4 22h16" />
            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
            <path d="M18 2v7c0 1.1-.9 2-2 2H8c-1.1 0-2-.9-2-2V2" />
          </svg>
      </motion.div>

      <motion.div 
        className="flex items-end justify-center gap-4 md:gap-8 pb-4"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        
        {/* 2nd Place */}
        <PodiumStep 
          player={second} 
          rank={2} 
          height="h-36 md:h-48" 
          color="bg-slate-100" 
          borderColor="border-slate-300"
          textColor="text-slate-400"
          badgeColor="bg-slate-400"
          variants={itemVariants}
        />

        {/* 1st Place */}
        <div className="relative z-10 -mx-2 mb-2">
            {/* Confetti for the winner */}
            <div className="absolute inset-0 overflow-visible pointer-events-none">
              {[...Array(12)].map((_, i) => (
                <motion.span
                  key={i}
                  className="absolute w-2 h-2 rounded-full"
                  style={{
                    backgroundColor: ['#fbbf24', '#f59e0b', '#16a34a', '#34d399'][i % 4],
                    top: '0%',
                    left: '50%'
                  }}
                  initial={{ x: 0, y: 0, opacity: 0 }}
                  animate={{
                    x: (Math.random() - 0.5) * 200,
                    y: (Math.random() - 1) * 150 - 50,
                    opacity: [0, 1, 0],
                    rotate: Math.random() * 360
                  }}
                  transition={{ duration: 2, repeat: Infinity, repeatDelay: 3, delay: i * 0.2 }}
                />
              ))}
            </div>

            <PodiumStep 
              player={first} 
              rank={1} 
              height="h-48 md:h-64" 
              color="bg-yellow-50" 
              borderColor="border-yellow-300"
              textColor="text-yellow-400"
              badgeColor="bg-yellow-500"
              isWinner={true}
              variants={itemVariants}
            />
        </div>

        {/* 3rd Place */}
        <PodiumStep 
          player={third} 
          rank={3} 
          height="h-24 md:h-32" 
          color="bg-orange-50" 
          borderColor="border-orange-300"
          textColor="text-orange-300"
          badgeColor="bg-orange-400"
          variants={itemVariants}
        />
      </motion.div>
    </div>
  );
}

function PodiumStep({ player, rank, height, color, borderColor, textColor, badgeColor, isWinner, variants }) {
  return (
    <motion.div className="flex flex-col items-center group" variants={variants}>
      {/* Avatar / Info */}
      <div className="mb-3 flex flex-col items-center text-center z-20">
        <motion.div 
          className={`relative rounded-full flex items-center justify-center shadow-sm mb-2 transition-transform bg-white
          ${isWinner ? 'w-20 h-20 border-[3px] border-yellow-400' : 'w-14 h-14 border-2 border-gray-200'}
          `}
          whileHover={{ y: -5 }}
        >
          <span className={`font-bold ${isWinner ? 'text-xl text-dark-green' : 'text-base text-gray-500'}`}>
            {player?.name?.charAt(0).toUpperCase() || "?"}
          </span>
          <div className={`absolute -bottom-1.5 rounded-full px-2 py-0.5 text-[10px] font-bold text-white shadow-sm ${badgeColor}`}>
            #{rank}
          </div>
        </motion.div>
        <span className={`font-bold px-2 py-0.5 rounded-lg bg-white/70 backdrop-blur-sm ${isWinner ? 'text-lg text-dark-green' : 'text-xs text-gray-600'} max-w-[120px] truncate`}>
          {player?.name || "TBD"}
        </span>
      </div>

      {/* The Bar */}
      <div className={`w-20 md:w-28 ${height} rounded-t-xl border-t-4 border-x border-b-0 shadow-sm relative overflow-hidden ${color} ${borderColor}`}>
         <div className="absolute inset-0 bg-gradient-to-b from-white/60 to-transparent opacity-50" />
         <div className={`absolute bottom-2 w-full text-center text-5xl font-black opacity-20 select-none ${textColor}`}>
            {rank}
         </div>
      </div>
    </motion.div>
  );
}

function autoAdvanceByes(br) {
  if (!br?.rounds || br.rounds.length < 2) return br;
  for (let r = 0; r < br.rounds.length - 1; r++) {
    const currentRound = br.rounds[r];
    const nextRound = br.rounds[r + 1];
    if (!currentRound?.matches || !nextRound?.matches) continue;
    currentRound.matches.forEach((m, idx) => {
      const isPlaceholder = (p) => !p || p.name === 'TBD' || p.id === 0;
      const hasP1 = !!m.player1 && !isPlaceholder(m.player1);
      const hasP2 = !!m.player2 && !isPlaceholder(m.player2);
      if (hasP1 !== hasP2) {
        if (m.status !== 2) {
          const winner = hasP1 ? m.player1 : m.player2;
          m.winner = winner;
          m.status = 2;
        }
        const winnerToPropagate = m.winner || (hasP1 ? m.player1 : m.player2);
        if (winnerToPropagate) {
          const targetIdx = Math.floor(idx / 2);
          const targetMatch = nextRound.matches[targetIdx];
          if (targetMatch) {
            const isTargetP1Placeholder = !targetMatch.player1 || isPlaceholder(targetMatch.player1);
            const isTargetP2Placeholder = !targetMatch.player2 || isPlaceholder(targetMatch.player2);
            if (idx % 2 === 0) {
              if (isTargetP1Placeholder) targetMatch.player1 = winnerToPropagate;
            } else {
              if (isTargetP2Placeholder) targetMatch.player2 = winnerToPropagate;
            }
          }
        }
      }
    });
  }
  const finalRound = br.rounds[br.rounds.length - 1];
  if (finalRound?.matches?.length === 1) {
    const fm = finalRound.matches[0];
    const lone = fm.player1 && !fm.player2 ? fm.player1 : (!fm.player1 && fm.player2 ? fm.player2 : null);
    if (lone && fm.status !== 2) {
      fm.winner = lone;
      fm.status = 2;
      br.champion = lone;
    }
  }
  return br;
}

export default TournamentBracketPage;