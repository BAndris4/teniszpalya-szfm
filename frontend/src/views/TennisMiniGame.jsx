import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

/**
 * TennisMiniGame.jsx
 *
 * Pong-like tennis mini-game (2D canvas).
 *
 * This rev:
 * - Hide last-stroke label (no "last hit" text). Also ensure it's cleared on point.
 * - Nicer, more alive court surround (gradient, vignette, subtle crowd, light sweep).
 * - Bot can make stroke mistakes via BOT_WRONG_STROKE_PROB.
 * - Pre-serve countdown + hit animations remain.
 */
export default function TennisMiniGame({ onWin }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const [running, setRunning] = useState(false);
  const [paused, setPaused] = useState(false);
  const [score, setScore] = useState({ player: 0, bot: 0 });
  const [coupon, setCoupon] = useState(null);

  // Internal game state stored in a ref to avoid re-renders during animation
  const gameRef = useRef(null);

  // --- Layout & gameplay constants (portrait court) ---
  const WIDTH = 520;
  const HEIGHT = 720;
  const COURT_MARGIN = 50;
  const NET_HEIGHT = 6;

  const PADDLE_W = 80; // racket width
  const PADDLE_H = 12; // racket height
  const PADDLE_SPEED = 7.5; // px per frame

  const BALL_R = 7;
  const BALL_SPEED_INIT = 3;
  const BALL_SPEED_MAX = 3;

  const BOT_SKILL = 1; // movement sharpness
  const BOT_WRONG_STROKE_PROB = 0.5; // chance to choose the wrong stroke (higher = easier)

  const COUNTDOWN_MS = 2500; // 3..2..1..Go

  // Helpers
  const resetRally = (serveTo = "player") => {
    const dirY = serveTo === "player" ? 1 : -1; // ball moving towards receiver after countdown
    const now = performance.now();
    gameRef.current.ball = {
      x: WIDTH / 2,
      y: HEIGHT / 2,
      vx: 0,
      vy: 0, // frozen during countdown
      speed: BALL_SPEED_INIT,
    };
    gameRef.current.serveDir = dirY;
    gameRef.current.countdownEnd = now + COUNTDOWN_MS;
    gameRef.current.rallyActive = false; // will flip true when serve starts
    gameRef.current.lastHitType = null; // clear any last-hit marker
  };

  const resetGame = () => {
    setScore({ player: 0, bot: 0 });
    setCoupon(null);
    const now = performance.now();
    gameRef.current = {
      keys: { left: false, right: false },
      mouse: { left: false, right: false },
      pointerX: null,
      player: { x: WIDTH / 2 - PADDLE_W / 2, y: HEIGHT - COURT_MARGIN - PADDLE_H },
      bot: { x: WIDTH / 2 - PADDLE_W / 2, y: COURT_MARGIN },
      ball: { x: WIDTH / 2, y: HEIGHT / 2, vx: 0, vy: 0, speed: BALL_SPEED_INIT },
      lastTouch: null,
      lastHitType: null,
      rallyActive: false,
      serveDir: 1,
      countdownEnd: now + COUNTDOWN_MS,
      anim: { playerHitAt: 0, botHitAt: 0 },
    };
  };

  useEffect(() => {
    resetGame();
  }, []);

  // Controls: keyboard + pointer + mouse buttons
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowLeft" || e.key === "a") gameRef.current.keys.left = e.type === "keydown";
      if (e.key === "ArrowRight" || e.key === "d") gameRef.current.keys.right = e.type === "keydown";
      if (e.key === " ") setPaused((p) => !p);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("keyup", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("keyup", onKey);
    };
  }, []);

  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;

    // Prevent context menu so right-click works as a control
    const preventMenu = (e) => e.preventDefault();

    // Pointer move for mouse/touch
    const onPointerMove = (e) => {
      const rect = cvs.getBoundingClientRect();
      const pointerX = (e.clientX - rect.left) * (cvs.width / rect.width);
      gameRef.current.pointerX = pointerX;
    };
    const onPointerLeave = () => (gameRef.current.pointerX = null);

    const onPointerDown = (e) => {
      // 0: left, 2: right
      if (e.button === 0) gameRef.current.mouse.left = true;
      if (e.button === 2) gameRef.current.mouse.right = true;
    };
    const onPointerUp = (e) => {
      if (e.button === 0) gameRef.current.mouse.left = false;
      if (e.button === 2) gameRef.current.mouse.right = false;
    };

    cvs.addEventListener("contextmenu", preventMenu);
    cvs.addEventListener("pointermove", onPointerMove);
    cvs.addEventListener("pointerleave", onPointerLeave);
    cvs.addEventListener("pointerdown", onPointerDown);
    cvs.addEventListener("pointerup", onPointerUp);

    return () => {
      cvs.removeEventListener("contextmenu", preventMenu);
      cvs.removeEventListener("pointermove", onPointerMove);
      cvs.removeEventListener("pointerleave", onPointerLeave);
      cvs.removeEventListener("pointerdown", onPointerDown);
      cvs.removeEventListener("pointerup", onPointerUp);
    };
  }, []);

  // Fancy court drawing
  const drawCourt = (ctx) => {
    // Background gradient (matches app vibe)
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, "#f6f9f7");
    grad.addColorStop(1, "#e9f3ef");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Vignette
    const vign = ctx.createRadialGradient(
      WIDTH / 2,
      HEIGHT / 2,
      Math.min(WIDTH, HEIGHT) * 0.2,
      WIDTH / 2,
      HEIGHT / 2,
      Math.max(WIDTH, HEIGHT) * 0.7
    );
    vign.addColorStop(0, "rgba(0,0,0,0)");
    vign.addColorStop(1, "rgba(0,0,0,0.08)");
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Subtle "crowd" dots above top court
    ctx.save();
    ctx.globalAlpha = 0.25;
    for (let i = 0; i < 80; i++) {
      const x = 20 + Math.random() * (WIDTH - 40);
      const y = 12 + Math.random() * 26;
      ctx.fillStyle = i % 2 ? "#a6b4ad" : "#c2cec9";
      ctx.beginPath();
      ctx.arc(x, y, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    // Court body with shadow
    ctx.save();
    ctx.shadowColor = "rgba(13, 94, 74, 0.25)"; // dark-green shadow
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#91c9a0"; // green court
    ctx.fillRect(COURT_MARGIN, COURT_MARGIN, WIDTH - COURT_MARGIN * 2, HEIGHT - COURT_MARGIN * 2);
    ctx.restore();

    // Lines
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;

    // Outer line
    ctx.strokeRect(
      COURT_MARGIN + 6,
      COURT_MARGIN + 6,
      WIDTH - (COURT_MARGIN + 6) * 2,
      HEIGHT - (COURT_MARGIN + 6) * 2
    );

    // Net
    ctx.fillStyle = "#fff";
    ctx.fillRect(COURT_MARGIN + 6, HEIGHT / 2 - NET_HEIGHT / 2, WIDTH - (COURT_MARGIN + 6) * 2, NET_HEIGHT);

    // Net posts
    ctx.fillStyle = "#dfe8e4";
    ctx.fillRect(COURT_MARGIN + 5, HEIGHT / 2 - NET_HEIGHT - 10, 4, NET_HEIGHT + 20);
    ctx.fillRect(WIDTH - COURT_MARGIN - 9, HEIGHT / 2 - NET_HEIGHT - 10, 4, NET_HEIGHT + 20);

    // Moving light sweep across court (alive feel)
    const t = (performance.now() / 2000) % 1; // 0..1
    const sweepX = COURT_MARGIN + 20 + (WIDTH - (COURT_MARGIN + 20) * 2) * t;
    const lg = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.5, "rgba(255,255,255,0.06)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(COURT_MARGIN + 6, COURT_MARGIN + 6, WIDTH - (COURT_MARGIN + 6) * 2, HEIGHT - (COURT_MARGIN + 6) * 2);
  };

  const hitAnimScale = (hitAt) => {
    if (!hitAt) return 1;
    const t = Math.max(0, 1 - (performance.now() - hitAt) / 180); // 0..1 over ~180ms
    return 1 + t * 0.25; // squash/stretch factor
  };

  const drawPaddle = (ctx, x, y, isPlayer) => {
    const g = gameRef.current;
    const hitAt = isPlayer ? g.anim.playerHitAt : g.anim.botHitAt;
    const scale = hitAnimScale(hitAt);

    ctx.save();
    // Anchor at paddle center for scale
    const cx = x + PADDLE_W / 2;
    const cy = y + PADDLE_H / 2;
    ctx.translate(cx, cy);
    ctx.scale(scale, 1 / scale);
    ctx.translate(-cx, -cy);

    // Body
    ctx.fillStyle = isPlayer ? "#0ea5e9" : "#ef4444"; // blue player, red bot
    ctx.fillRect(x, y, PADDLE_W, PADDLE_H);

    // center mark (visual only)
    ctx.fillStyle = "rgba(255,255,255,0.8)";
    ctx.fillRect(cx - 1, y, 2, PADDLE_H);

    // swing flash
    if (hitAt && performance.now() - hitAt < 120) {
      ctx.fillStyle = "rgba(255,255,255,0.4)";
      ctx.fillRect(x - 6, y, 6, PADDLE_H);
      ctx.fillRect(x + PADDLE_W, y, 6, PADDLE_H);
    }

    ctx.restore();
  };

  const drawBall = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#facc15"; // tennis ball yellow
    ctx.fill();
  };

  const applyPlayerControl = () => {
    const g = gameRef.current;
    const p = g.player;

    // Pointer has priority for intuitive control
    if (g.pointerX != null) {
      const target = g.pointerX - PADDLE_W / 2;
      const dx = target - p.x;
      p.x += Math.max(-PADDLE_SPEED, Math.min(PADDLE_SPEED, dx));
    } else {
      if (g.keys.left) p.x -= PADDLE_SPEED;
      if (g.keys.right) p.x += PADDLE_SPEED;
    }

    // Clamp within court
    const minX = COURT_MARGIN + 8;
    const maxX = WIDTH - COURT_MARGIN - 8 - PADDLE_W;
    p.x = Math.max(minX, Math.min(maxX, p.x));
  };

  const botAI = () => {
    const g = gameRef.current;
    const b = g.ball;
    const bot = g.bot;

    // If countdown active, gently center and return
    if (isCountdownActive()) {
      const centerTarget = WIDTH / 2 - PADDLE_W / 2;
      const dx = centerTarget - bot.x;
      const move = PADDLE_SPEED * 0.3;
      if (Math.abs(dx) > 1) bot.x += Math.max(-move, Math.min(move, dx));
      return;
    }

    // If ball is moving AWAY from bot, gently drift toward center and chill
    if (b.vy > 0) {
      const centerTarget = WIDTH / 2 - PADDLE_W / 2;
      const dx = centerTarget - bot.x;
      const move = PADDLE_SPEED * 0.35; // relaxed return-to-center
      if (Math.abs(dx) > 1) bot.x += Math.max(-move, Math.min(move, dx));
    } else {
      // Ball moving TOWARD bot: move toward an intercept with slight noise
      const noise = (Math.random() * 40 - 20) * (1 - BOT_SKILL);
      const targetX = b.x + noise;

      // If ball already horizontally above racket area, reduce following
      const alreadyCovered = targetX >= bot.x - 6 && targetX <= bot.x + PADDLE_W + 6;

      const dx = targetX - (bot.x + PADDLE_W / 2);
      const base = PADDLE_SPEED * (0.65 + 0.5 * BOT_SKILL);
      const move = alreadyCovered ? base * 0.25 : base; // relax when covered
      if (Math.abs(dx) > 2) bot.x += Math.max(-move, Math.min(move, dx));
    }

    // Clamp
    const minX = COURT_MARGIN + 8;
    const maxX = WIDTH - COURT_MARGIN - 8 - PADDLE_W;
    bot.x = Math.max(minX, Math.min(maxX, bot.x));
  };

  const tryRacketReturn = (paddleX, paddleY, isPlayer) => {
    const g = gameRef.current;
    const b = g.ball;

    // Check collision: y overlap
    const withinY = isPlayer
      ? b.y + BALL_R >= paddleY && b.y + BALL_R <= paddleY + PADDLE_H
      : b.y - BALL_R <= paddleY + PADDLE_H && b.y - BALL_R >= paddleY;

    if (!withinY) return false;

    // Check x overlap
    if (b.x + BALL_R < paddleX || b.x - BALL_R > paddleX + PADDLE_W) return false;

    // Determine side via horizontal offset to paddle center
    const center = paddleX + PADDLE_W / 2;
    const offset = b.x - center; // negative -> left (BH), positive -> right (FH)

    // --- Player-specific input gating (mouse buttons) ---
    if (isPlayer) {
      const needFH = offset > 0; // ball on right side => forehand
      const ok = needFH ? g.mouse.right : g.mouse.left;
      if (!ok) {
        // no reflection if wrong input, hide any labels
        return false;
      }
    } else {
      // --- Bot stroke mistake mechanic ---
      const needFH = offset > 0;
      const botChoosesFH = Math.random() > BOT_WRONG_STROKE_PROB ? needFH : !needFH;
      if (botChoosesFH !== needFH) {
        // bot used wrong stroke -> whiff (no visible label)
        return false;
      }
    }

    // Reflect with slight angle based on offset magnitude
    const norm = Math.max(-1, Math.min(1, offset / (PADDLE_W / 2)));
    const angle = norm * 0.6; // -0.6..0.6 radians horizontal tilt

    const speed = Math.min(BALL_SPEED_MAX, b.speed * 1.05 + 0.2);
    b.speed = speed;

    const newVy = (isPlayer ? -1 : 1) * (0.9 + Math.random() * 0.3) * speed;
    const newVx = angle * speed;

    b.vx = newVx;
    b.vy = newVy;

    // Nudge ball outside paddle to avoid sticking
    b.y = isPlayer ? paddleY - BALL_R - 1 : paddleY + PADDLE_H + BALL_R + 1;

    // Hit animation stamp
    const now = performance.now();
    if (isPlayer) gameRef.current.anim.playerHitAt = now; else gameRef.current.anim.botHitAt = now;

    // We no longer show last hit label, but keep touch for game logic if needed
    g.lastTouch = isPlayer ? "player" : "bot";
    return true;
  };

  const isCountdownActive = () => {
    const g = gameRef.current;
    return g && g.countdownEnd && performance.now() < g.countdownEnd;
  };

  const maybeStartServe = () => {
    const g = gameRef.current;
    if (!g || !g.countdownEnd) return;
    const now = performance.now();
    if (now >= g.countdownEnd && g.ball.vy === 0 && g.ball.vx === 0) {
      // Kick off serve
      g.ball.vx = (Math.random() * 2 - 1) * 2.2;
      g.ball.vy = g.serveDir * BALL_SPEED_INIT;
      g.rallyActive = true;
    }
  };

  const drawCountdown = (ctx) => {
    const g = gameRef.current;
    if (!isCountdownActive()) return;
    const remaining = Math.max(0, g.countdownEnd - performance.now());
    const step = Math.ceil(remaining / 1000); // 3..2..1..0
    const label = step > 0 ? String(step) : "Go";

    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.fillStyle = "#ffffff";
    ctx.font = "bold 64px ui-sans-serif";
    ctx.textAlign = "center";
    ctx.fillText(label, WIDTH / 2, HEIGHT / 2 + 22);
    ctx.textAlign = "start";
  };

  const step = () => {
    const g = gameRef.current;
    const cvs = canvasRef.current;
    const ctx = cvs.getContext("2d");

    // Update serve countdown state
    if (running && !paused) {
      maybeStartServe();
    }

    // Physics pause OR pre-serve freeze
    if (!running || paused || isCountdownActive()) {
      // Allow paddle control even during countdown to let players prepare
      applyPlayerControl();
      botAI();

      drawCourt(ctx);
      drawPaddle(ctx, g.player.x, g.player.y, true);
      drawPaddle(ctx, g.bot.x, g.bot.y, false);
      drawBall(ctx, g.ball.x, g.ball.y);
      drawHUD(ctx);
      drawCountdown(ctx);
      rafRef.current = requestAnimationFrame(step);
      return;
    }

    // Update controls & AI
    applyPlayerControl();
    botAI();

    // Move ball
    const b = g.ball;
    b.x += b.vx;
    b.y += b.vy;

    // Wall bounces L/R
    if (b.x - BALL_R <= COURT_MARGIN + 6) {
      b.x = COURT_MARGIN + 6 + BALL_R;
      b.vx *= -1;
    }
    if (b.x + BALL_R >= WIDTH - (COURT_MARGIN + 6)) {
      b.x = WIDTH - (COURT_MARGIN + 6) - BALL_R;
      b.vx *= -1;
    }

    // Try returns
    tryRacketReturn(g.player.x, g.player.y, true);
    tryRacketReturn(g.bot.x, g.bot.y, false);

    // Top/Bottom: point scored
    if (b.y - BALL_R <= COURT_MARGIN + 6) {
      pointTo("player");
    } else if (b.y + BALL_R >= HEIGHT - (COURT_MARGIN + 6)) {
      pointTo("bot");
    }

    // Render
    drawCourt(ctx);
    drawPaddle(ctx, g.player.x, g.player.y, true);
    drawPaddle(ctx, g.bot.x, g.bot.y, false);
    drawBall(ctx, b.x, b.y);
    drawHUD(ctx);

    rafRef.current = requestAnimationFrame(step);
  };

  const drawHUD = (ctx) => {
    // Score only (hide last hit info as requested)
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px ui-sans-serif, system-ui, -apple-system";
    ctx.fillText(`You ${score.player} : ${score.bot} Bot`, WIDTH / 2 - 60, 26);
  };

  const pointTo = (who) => {
    // Hide last-stroke immediately on scoring
    if (gameRef.current) gameRef.current.lastHitType = null;
    if (gameRef.current) gameRef.current.rallyActive = false;

    setScore((s) => {
      const next = { ...s, [who]: s[who] + 1 };

      // Setup next rally serve + countdown (serve to side that lost point)
      const serveTo = who === "player" ? "bot" : "player";
      resetRally(serveTo);

      // Win check
      const WIN_SCORE = 5;
      if (next.player >= WIN_SCORE || next.bot >= WIN_SCORE) {
        setRunning(false);
        setPaused(false);
        if (next.player > next.bot) {
          const code = generateCoupon();
          setCoupon(code);
          onWin?.(code);
        }
      }
      return next;
    });
  };

  const generateCoupon = () => {
    // 20% coupon, valid code format TENNIS-XXXX-20
    const rnd = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 36)
        .toString(36)
        .toUpperCase()
    ).join("");
    return `TENNIS-${rnd}-20`;
  };

  // Game loop
  useEffect(() => {
    const loop = () => step();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [running, paused, score.player, score.bot]);

  // Resize canvas for crisp rendering on DPR screens
  const dpr = typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const cssW = WIDTH;
  const cssH = HEIGHT;

  return (
    <div className="w-full flex flex-col items-center gap-4 select-none">
      <div className="w-full max-w-[760px]">
        <div className="flex items-center justify-between mb-2">
          <div className="text-sm text-dark-green">
            First to <span className="font-semibold">5</span>. Hold <span className="font-semibold">Right Click</span> for Forehand, <span className="font-semibold">Left Click</span> for Backhand.
          </div>
          <div className="flex items-center gap-2">
            {!running ? (
              <motion.button
                whileTap={{ scale: 0.98 }}
                onClick={() => {
                  resetGame();
                  setRunning(true);
                }}
                className="px-3 py-1.5 rounded-[20px] bg-green text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
              >
                Start
              </motion.button>
            ) : (
              <>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => setPaused((p) => !p)}
                  className="px-3 py-1.5 rounded-[20px] bg-dark-green text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  {paused ? "Resume" : "Pause"} (Space)
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    resetGame();
                    setRunning(true);
                  }}
                  className="px-3 py-1.5 rounded-[20px] bg-slate-200 text-slate-800 shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                >
                  Restart
                </motion.button>
              </>
            )}
          </div>
        </div>

        <div className="relative flex items-center justify-center">
          <canvas
            ref={canvasRef}
            width={cssW * dpr}
            height={cssH * dpr}
            style={{ width: cssW, height: cssH }}
            className="rounded-[20px] shadow-md bg-[#e7f3eb] border border-dark-green-octa"
          />

          {/* Scale drawing for DPR */}
          <Scaler
            canvasRef={canvasRef}
            dpr={dpr}
            draw={(ctx) => {
              // ctx scaled via setTransform; main loop handles drawing.
            }}
          />

          {/* End / Coupon overlay */}
          {(score.player >= 5 || score.bot >= 5) && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[20px]"
            >
              <div className="bg-white rounded-[20px] p-6 w-[88%] max-w-md text-center shadow-lg border border-dark-green-octa">
                {score.player > score.bot ? (
                  <>
                    <h3 className="text-xl font-semibold mb-1 text-dark-green">You win! 🎉</h3>
                    <p className="text-slate-600 mb-4">Here is your 20% discount coupon:</p>
                    <div className="font-mono text-lg px-3 py-2 bg-slate-100 rounded-lg inline-block mb-4 select-all">
                      {coupon}
                    </div>
                    <div className="text-xs text-slate-500 mb-4">Apply at checkout to get 20% off your next reservation.</div>
                    <div className="flex items-center justify-center gap-2">
                      <button
                        className="px-3 py-1.5 rounded-[20px] bg-emerald-600 text-white"
                        onClick={() => {
                          resetGame();
                          setRunning(true);
                        }}
                      >
                        Play Again
                      </button>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-semibold mb-2 text-dark-green">Bot wins 😅</h3>
                    <p className="text-slate-600 mb-4">Try again to earn the 20% coupon.</p>
                    <button
                      className="px-3 py-1.5 rounded-[20px] bg-slate-800 text-white"
                      onClick={() => {
                        resetGame();
                        setRunning(true);
                      }}
                    >
                      Try Again
                    </button>
                  </>
                )}
              </div>
            </motion.div>
          )}
        </div>

        <div className="mt-2 text-xs text-dark-green">
          Controls: Move with mouse (or touch) or ← / →. Hold Right Click for Forehand, Left Click for Backhand. Press Space to pause.
        </div>
      </div>
    </div>
  );
}

function Scaler({ canvasRef, dpr, draw }) {
  useEffect(() => {
    const cvs = canvasRef.current;
    if (!cvs) return;
    const ctx = cvs.getContext("2d");
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx);
  }, [canvasRef, dpr, draw]);
  return null;
}
