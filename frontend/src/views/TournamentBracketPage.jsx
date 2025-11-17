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
        {/* Animated background blobs */}
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
          
          <div className="pt-32 px-6 pb-12">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="max-w-7xl mx-auto"
            >
              {/* Header */}
              <div className="mb-8 flex items-center justify-between">
                <div>
                  <button
                    onClick={() => navigate("/tournaments")}
                    className="mb-4 flex items-center gap-2 text-dark-green hover:text-green transition-colors"
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                    </svg>
                    Back to Tournaments
                  </button>
                  <h1 className="text-4xl font-bold text-dark-green mb-2">
                    {bracket.tournamentTitle}
                  </h1>
                  <p className="text-lg text-dark-green-half">
                    Status: {bracket.status === 1 ? "In Progress" : "Completed"}
                  </p>
                </div>
              </div>

              {/* Bracket */}
              <div className="bg-gradient-to-br from-light-green/40 via-white to-light-green/20 rounded-3xl p-8 shadow-2xl border-2 border-green/30">
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
                  <div className="flex items-start justify-center gap-12 overflow-x-auto pb-4">
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
            </motion.div>
          </div>
        </div>
      </div>
    </ReserveMenuProvider>
  );
}

function RoundColumn({ round, roundIndex, isFinal, totalInSide, side = "left", isAdmin, savingId, onSubmitResult, scores, setScores }) {
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
    <div className="flex flex-col" style={{ marginTop }}>
      <h3 className="mb-4 text-center text-lg font-bold text-dark-green">
        {displayName}
      </h3>
      <div className="flex flex-col gap-6">
        {pairs.map((pair, idx) => (
          <div key={`pair-${idx}`} className="relative flex flex-col gap-6">
            {pair.length === 2 && (
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
    <div className="relative w-56 rounded-xl border-2 border-green/50 bg-gradient-to-br from-light-green/20 to-white shadow-lg hover:shadow-xl transition-all">
      {/* Connector lines */}
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
        className={`border-b border-green/30 px-4 py-3 rounded-t-xl ${
          isCompleted && winner?.id === match.player1?.id
            ? "bg-green/30 font-bold text-dark-green"
            : "text-dark-green-half"
        }`}
      >
        <p className="text-sm">{player1Name}</p>
      </div>

      {/* Player 2 */}
      <div
        className={`px-4 py-3 rounded-b-xl ${
          isCompleted && winner?.id === match.player2?.id
            ? "bg-green/30 font-bold text-dark-green"
            : "text-dark-green-half"
        }`}
      >
        <p className="text-sm">{player2Name}</p>
      </div>

      {/* Score */}
      {match.score && (
        <div className="border-t border-green/30 bg-light-green/10 px-4 py-2 text-center">
          <p className="text-xs text-dark-green font-semibold">{match.score}</p>
        </div>
      )}

      {canSet && (
        <div className="space-y-2 border-t border-green/30 p-3 bg-light-green/5">
          <input
            type="text"
            placeholder="Score (e.g. 6-4, 6-3)"
            className="w-full rounded-lg border-2 border-green/30 px-3 py-2 text-xs focus:border-green focus:outline-none"
            value={scores[match.id] || ""}
            onChange={(e) =>
              setScores((s) => ({ ...s, [match.id]: e.target.value }))
            }
          />
          <div className="flex gap-2">
            <button
              className="flex-1 rounded-lg bg-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-green/90 transition-colors shadow-md"
              disabled={savingId === match.id}
              onClick={() => onSubmitResult(match, match.player1.id)}
            >
              {savingId === match.id ? "Saving..." : "P1 wins"}
            </button>
            <button
              className="flex-1 rounded-lg bg-dark-green px-3 py-2 text-xs font-bold text-white disabled:opacity-50 hover:bg-dark-green/90 transition-colors shadow-md"
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

export default TournamentBracketPage;
