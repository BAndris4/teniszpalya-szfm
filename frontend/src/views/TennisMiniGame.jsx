import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import racketSvg from "../assets/racket.svg";

/**
 * TennisMiniGame.jsx
 * - Klasszikus tenisz pontozás (0,15,30,40; deuce/előny)
 * - Bot stroke-hiba
 * - Start overlay a játéktérben; countdown csak Start után
 * - Külön Game Over overlay (győztes/vesztes üzenet + kupon)
 */
export default function TennisMiniGame({ onWin }) {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);

  // 'menu' = kezdőképernyő, 'playing' = meccs fut
  const [screen, setScreen] = useState("menu");
  const [coupon, setCoupon] = useState(null);

  // Tenisz pontozás állapota
  const [score, setScore] = useState({
    p: 0,
    b: 0,
    adv: null, // "player" | "bot" | null
    over: false,
    winner: null,
  });

  // Internal game state stored in a ref
  const gameRef = useRef(null);

  // Racket image ref
  const racketImgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.src = racketSvg;
    racketImgRef.current = img;
  }, []);

  // --- Layout & gameplay constants ---
  const WIDTH = 520;
  const HEIGHT = 720;

  const COURT_MARGIN = 50;      // oldalsó + alsó margin
  const COURT_MARGIN_TOP = 90;  // nagyobb felső margin a HUD alatt

  const COURT_LEFT = COURT_MARGIN;
  const COURT_RIGHT = WIDTH - COURT_MARGIN;
  const COURT_TOP = COURT_MARGIN_TOP;
  const COURT_BOTTOM = HEIGHT - COURT_MARGIN;
  const COURT_WIDTH = COURT_RIGHT - COURT_LEFT;
  const COURT_HEIGHT = COURT_BOTTOM - COURT_TOP;
  const COURT_CENTER_Y = COURT_TOP + COURT_HEIGHT / 2;

  const NET_HEIGHT = 6;

  const PADDLE_W = 80;
  const PADDLE_H = 12;
  const PADDLE_SPEED = 7.5;

  const BALL_R = 7;
  const BALL_SPEED_INIT = 3;
  const BALL_SPEED_MAX = 3;

  const BOT_SKILL = 1;
  const BOT_WRONG_STROKE_PROB = 0.5;

  const COUNTDOWN_MS = 3000; // 3..2..1..Go

  // Helpers
  const resetRally = (serveTo = "player") => {
    const dirY = serveTo === "player" ? 1 : -1;
    const now = performance.now();
    gameRef.current.ball = {
      x: WIDTH / 2,
      y: COURT_CENTER_Y, // középen a pályán
      vx: 0,
      vy: 0, // freeze during countdown
      speed: BALL_SPEED_INIT,
    };
    gameRef.current.serveDir = dirY;
    gameRef.current.countdownEnd = now + COUNTDOWN_MS;
    gameRef.current.rallyActive = false;
    gameRef.current.lastHitType = null;
  };

  const resetScore = () =>
    setScore({ p: 0, b: 0, adv: null, over: false, winner: null });

  const resetGame = () => {
    resetScore();
    const now = performance.now();
    gameRef.current = {
      keys: { left: false, right: false },
      mouse: { left: false, right: false },
      pointerX: null,
      player: {
        x: WIDTH / 2 - PADDLE_W / 2,
        y: COURT_BOTTOM - PADDLE_H, // alul a pálya szélén
      },
      bot: {
        x: WIDTH / 2 - PADDLE_W / 2,
        y: COURT_TOP, // felül a pálya szélén
      },
      ball: {
        x: WIDTH / 2,
        y: COURT_CENTER_Y,
        vx: 0,
        vy: 0,
        speed: BALL_SPEED_INIT,
      },
      lastTouch: null,
      lastHitType: null,
      rallyActive: false,
      serveDir: 1,
      countdownEnd: now + COUNTDOWN_MS,
      anim: {
        playerHitAt: 0,
        botHitAt: 0,
        playerFacing: 1, // 1 = jobbra, -1 = balra
        botFacing: 1,
      },
    };
  };

  useEffect(() => {
    resetGame();
  }, []);

  // Controls: bal/jobb nyíl vagy A/D + egér (bal = balkezes stroke, jobb = jobbkezes)
  useEffect(() => {
    const onKey = (e) => {
      if (!gameRef.current) return;
      if (e.key === "ArrowLeft" || e.key === "a")
        gameRef.current.keys.left = e.type === "keydown";
      if (e.key === "ArrowRight" || e.key === "d")
        gameRef.current.keys.right = e.type === "keydown";
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

    const preventMenu = (e) => e.preventDefault();

    const onPointerMove = (e) => {
      if (!gameRef.current) return;
      const rect = cvs.getBoundingClientRect();
      const pointerX = (e.clientX - rect.left) * (cvs.width / rect.width);
      gameRef.current.pointerX = pointerX;
    };
    const onPointerLeave = () => {
      if (!gameRef.current) return;
      gameRef.current.pointerX = null;
    };

    const onPointerDown = (e) => {
      if (!gameRef.current) return;
      // bal gomb = balra néz, jobb gomb = jobbra néz
      if (e.button === 0) {
        gameRef.current.mouse.left = true;
        gameRef.current.anim.playerFacing = -1; // balra
      }
      if (e.button === 2) {
        gameRef.current.mouse.right = true;
        gameRef.current.anim.playerFacing = 1; // jobbra
      }
    };
    const onPointerUp = (e) => {
      if (!gameRef.current) return;
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

  // Pálya rajzolás
  const drawCourt = (ctx) => {
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    grad.addColorStop(0, "#f6f9f7");
    grad.addColorStop(1, "#e9f3ef");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

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

    ctx.save();
    ctx.shadowColor = "rgba(13, 94, 74, 0.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#91c9a0";
    ctx.fillRect(COURT_LEFT, COURT_TOP, COURT_WIDTH, COURT_HEIGHT);
    ctx.restore();

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(
      COURT_LEFT + 6,
      COURT_TOP + 6,
      COURT_WIDTH - 12,
      COURT_HEIGHT - 12
    );

    const netY = COURT_CENTER_Y - NET_HEIGHT / 2;

    ctx.fillStyle = "#fff";
    ctx.fillRect(COURT_LEFT + 6, netY, COURT_WIDTH - 12, NET_HEIGHT);

    ctx.fillStyle = "#dfe8e4";
    ctx.fillRect(
      COURT_LEFT + 5,
      netY - NET_HEIGHT - 10,
      4,
      NET_HEIGHT + 20
    );
    ctx.fillRect(
      COURT_RIGHT - 9,
      netY - NET_HEIGHT - 10,
      4,
      NET_HEIGHT + 20
    );

    const t = (performance.now() / 2000) % 1;
    const sweepX = COURT_LEFT + 20 + (COURT_WIDTH - 40) * t;
    const lg = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.5, "rgba(255,255,255,0.06)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(
      COURT_LEFT + 6,
      COURT_TOP + 6,
      COURT_WIDTH - 12,
      COURT_HEIGHT - 12
    );
  };

  const hitAnimScale = (hitAt) => {
    if (!hitAt) return 1;
    const t = Math.max(0, 1 - (performance.now() - hitAt) / 180);
    return 1 + t * 0.25;
  };

  const hitAnimAngle = (hitAt, isPlayer) => {
    if (!hitAt) return 0;
    const elapsed = performance.now() - hitAt;
    const dur = 180;
    if (elapsed > dur) return 0;
    const t = 1 - elapsed / dur; // 1 -> 0
    const dir = isPlayer ? 1 : -1;
    // kb. 25-30 fokos suhintás
    return dir * 0.45 * t;
  };

  // ÚJ: ütő rajzolása a piros/kék bar helyett
  const drawRacket = (ctx, x, y, isPlayer) => {
    const g = gameRef.current;
    const img = racketImgRef.current;

    const hitAt = isPlayer ? g.anim.playerHitAt : g.anim.botHitAt;
    const scale = hitAnimScale(hitAt);
    const angle = hitAnimAngle(hitAt, isPlayer);

    const facing = isPlayer ? g.anim.playerFacing : g.anim.botFacing || 1;

    const cx = x + PADDLE_W / 2;
    const cy = y + PADDLE_H / 2;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);
    ctx.scale(scale * facing, scale);

    if (img && img.complete) {
      const baseSize = 90; // tetszőleges vizuális méret
      const w = baseSize;
      const h = baseSize;
      ctx.drawImage(img, -w / 2, -h / 2, w, h);
    } else {
      // fallback: régi bar, ha még nem töltött be az SVG
      ctx.fillStyle = isPlayer ? "#0ea5e9" : "#ef4444";
      ctx.fillRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H);
    }

    ctx.restore();
  };

  const drawBall = (ctx, x, y) => {
    ctx.beginPath();
    ctx.arc(x, y, BALL_R, 0, Math.PI * 2);
    ctx.closePath();
    ctx.fillStyle = "#facc15";
    ctx.fill();
  };

  const applyPlayerControl = () => {
    const g = gameRef.current;
    const p = g.player;

    if (g.pointerX != null) {
      const target = g.pointerX - PADDLE_W / 2;
      const dx = target - p.x;
      p.x += Math.max(-PADDLE_SPEED, Math.min(PADDLE_SPEED, dx));
    } else {
      if (g.keys.left) p.x -= PADDLE_SPEED;
      if (g.keys.right) p.x += PADDLE_SPEED;
    }

    const minX = COURT_LEFT + 8;
    const maxX = COURT_RIGHT - 8 - PADDLE_W;
    p.x = Math.max(minX, Math.min(maxX, p.x));
  };

  const botAI = () => {
    const g = gameRef.current;
    const b = g.ball;
    const bot = g.bot;

    // Countdown közben centerezzen
    if (isCountdownActive() && screen === "playing") {
      const centerTarget = WIDTH / 2 - PADDLE_W / 2;
      const dx = centerTarget - bot.x;
      const move = PADDLE_SPEED * 0.3;
      if (Math.abs(dx) > 1) bot.x += Math.max(-move, Math.min(move, dx));
      return;
    }

    if (b.vy > 0) {
      const centerTarget = WIDTH / 2 - PADDLE_W / 2;
      const dx = centerTarget - bot.x;
      const move = PADDLE_SPEED * 0.35;
      if (Math.abs(dx) > 1) bot.x += Math.max(-move, Math.min(move, dx));
    } else {
      const noise = (Math.random() * 40 - 20) * (1 - BOT_SKILL);
      const targetX = b.x + noise;
      const alreadyCovered =
        targetX >= bot.x - 6 && targetX <= bot.x + PADDLE_W + 6;
      const dx = targetX - (bot.x + PADDLE_W / 2);
      const base = PADDLE_SPEED * (0.65 + 0.5 * BOT_SKILL);
      const move = alreadyCovered ? base * 0.25 : base;
      if (Math.abs(dx) > 2) bot.x += Math.max(-move, Math.min(move, dx));
    }

    const minX = COURT_LEFT + 8;
    const maxX = COURT_RIGHT - 8 - PADDLE_W;
    bot.x = Math.max(minX, Math.min(maxX, bot.x));

    // bot ütő orientációja: a labda felé nézzen
    g.anim.botFacing = b.x >= bot.x + PADDLE_W / 2 ? 1 : -1;
  };

  const tryRacketReturn = (paddleX, paddleY, isPlayer) => {
    const g = gameRef.current;
    const b = g.ball;

    const withinY = isPlayer
      ? b.y + BALL_R >= paddleY && b.y + BALL_R <= paddleY + PADDLE_H
      : b.y - BALL_R <= paddleY + PADDLE_H && b.y - BALL_R >= paddleY;

    if (!withinY) return false;
    if (b.x + BALL_R < paddleX || b.x - BALL_R > paddleX + PADDLE_W) return false;

    const center = paddleX + PADDLE_W / 2;
    const offset = b.x - center;

    if (isPlayer) {
      const needFH = offset > 0; // jobb oldal = forehand
      const ok = needFH ? g.mouse.right : g.mouse.left;
      if (!ok) return false;
      // orientáció ütéskor is igazodjon
      g.anim.playerFacing = needFH ? 1 : -1;
    } else {
      const needFH = offset > 0;
      const botChoosesFH =
        Math.random() > BOT_WRONG_STROKE_PROB ? needFH : !needFH;
      if (botChoosesFH !== needFH) return false;
      g.anim.botFacing = needFH ? 1 : -1;
    }

    const norm = Math.max(-1, Math.min(1, offset / (PADDLE_W / 2)));
    const angle = norm * 0.6;

    const speed = Math.min(BALL_SPEED_MAX, b.speed * 1.05 + 0.2);
    b.speed = speed;

    const newVy =
      (isPlayer ? -1 : 1) * (0.9 + Math.random() * 0.3) * speed;
    const newVx = angle * speed;

    b.vx = newVx;
    b.vy = newVy;

    b.y = isPlayer
      ? paddleY - BALL_R - 1
      : paddleY + PADDLE_H + BALL_R + 1;

    const now = performance.now();
    if (isPlayer) g.anim.playerHitAt = now;
    else g.anim.botHitAt = now;

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
      g.ball.vx = (Math.random() * 2 - 1) * 2.2;
      g.ball.vy = g.serveDir * BALL_SPEED_INIT;
      g.rallyActive = true;
    }
  };

  const step = () => {
    const g = gameRef.current;
    const cvs = canvasRef.current;
    if (!g || !cvs) {
      rafRef.current = requestAnimationFrame(step);
      return;
    }
    const ctx = cvs.getContext("2d");

    const playing = screen === "playing";

    if (playing) {
      maybeStartServe();
    }

    if (!playing || isCountdownActive()) {
      applyPlayerControl();
      botAI();

      drawCourt(ctx);
      drawRacket(ctx, g.player.x, g.player.y, true);
      drawRacket(ctx, g.bot.x, g.bot.y, false);
      drawBall(ctx, g.ball.x, g.ball.y);
      drawHUD(ctx);
      if (playing) drawCountdown(ctx);
      rafRef.current = requestAnimationFrame(step);
      return;
    }

    // Fizika
    applyPlayerControl();
    botAI();

    const b = g.ball;
    b.x += b.vx;
    b.y += b.vy;

    // oldalsó falak
    if (b.x - BALL_R <= COURT_LEFT + 6) {
      b.x = COURT_LEFT + 6 + BALL_R;
      b.vx *= -1;
    }
    if (b.x + BALL_R >= COURT_RIGHT - 6) {
      b.x = COURT_RIGHT - 6 - BALL_R;
      b.vx *= -1;
    }

    tryRacketReturn(g.player.x, g.player.y, true);
    tryRacketReturn(g.bot.x, g.bot.y, false);

    // pontszerzés: ha kijut a pályáról felül/alul
    if (b.y - BALL_R <= COURT_TOP + 6) {
      awardPoint("player");
    } else if (b.y + BALL_R >= COURT_BOTTOM - 6) {
      awardPoint("bot");
    }

    drawCourt(ctx);
    drawRacket(ctx, g.player.x, g.player.y, true);
    drawRacket(ctx, g.bot.x, g.bot.y, false);
    drawBall(ctx, b.x, b.y);
    drawHUD(ctx);

    rafRef.current = requestAnimationFrame(step);
  };

  // --- Tennis scoring helpers ---
  const PVAL = [0, 15, 30, 40];

  const formatScore = (s) => {
    if (s.p === 3 && s.b === 3) {
      if (s.adv === "player") return "40 Adv : 40";
      if (s.adv === "bot") return "40 : 40 Adv";
      return "40 : 40";
    }
    return `${PVAL[s.p]} : ${PVAL[s.b]}`;
  };

  const drawHUD = (ctx) => {
    ctx.fillStyle = "#0f172a";
    ctx.font = "bold 18px Poppins, sans-serif";
    const label = formatScore(score);
    const text = `You ${label} Bot`;
    const metrics = ctx.measureText(text);
    // 24px magasság: nem csúszik ki, de elég fent van
    ctx.fillText(text, (WIDTH - metrics.width) / 2, 24);
  };

  const onGameWon = (winner) => {
    // Állapot jelzése + kupon
    setScore((s) => ({ ...s, over: true, winner }));
    if (winner === "player") {
      const code = generateCoupon();
      setCoupon(code);
      onWin?.(code);
    }
  };

  const awardPoint = (who) => {
    if (gameRef.current) {
      gameRef.current.lastHitType = null;
      gameRef.current.rallyActive = false;
    }

    setScore((s) => {
      if (s.over) return s;

      if (s.p === 3 && s.b === 3) {
        if (s.adv === null) {
          const next = { ...s, adv: who };
          const serveTo = who === "player" ? "bot" : "player";
          resetRally(serveTo);
          return next;
        }
        if (s.adv === who) {
          const serveTo = who === "player" ? "bot" : "player";
          resetRally(serveTo);
          onGameWon(who);
          return { ...s, over: true, winner: who };
        }
        const serveTo = who === "player" ? "bot" : "player";
        resetRally(serveTo);
        return { ...s, adv: null };
      }

      if (who === "player") {
        if (s.p === 3) {
          const serveTo = "bot";
          resetRally(serveTo);
          onGameWon("player");
          return { ...s, over: true, winner: "player" };
        }
        const newP = s.p + 1;
        const next = { ...s, p: newP };
        if (newP === 3 && s.b === 3) next.adv = null;
        const serveTo = "bot";
        resetRally(serveTo);
        return next;
      } else {
        if (s.b === 3) {
          const serveTo = "player";
          resetRally(serveTo);
          onGameWon("bot");
          return { ...s, over: true, winner: "bot" };
        }
        const newB = s.b + 1;
        const next = { ...s, b: newB };
        if (newB === 3 && s.p === 3) next.adv = null;
        const serveTo = "player";
        resetRally(serveTo);
        return next;
      }
    });
  };

  const generateCoupon = () => {
    const rnd = Array.from({ length: 4 }, () =>
      Math.floor(Math.random() * 36).toString(36).toUpperCase()
    ).join("");
    return `TENNIS-${rnd}-20`;
  };

  // --------- PRE-SERVE COUNTDOWN with scale + easing ----------
  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const drawCountdown = (ctx) => {
    if (!isCountdownActive()) return;

    const end = gameRef.current.countdownEnd;
    const now = performance.now();
    const remaining = Math.max(0, end - now);

    const step = Math.ceil(remaining / 1000); // 3..2..1..0
    const isGo = step <= 0;
    const label = isGo ? "Go" : String(step);

    const localMs = isGo
      ? (1000 - (remaining % 1000)) % 1000
      : remaining % 1000;
    const t = 1 - localMs / 1000;
    const e = easeInOutCubic(Math.min(Math.max(t, 0), 1));

    const scale = isGo ? 0.9 + e * 0.45 : 1.25 - e * 0.25;
    const alpha = isGo ? Math.max(0, 1 - e * 1.2) : Math.max(0, 1 - e);
    const bgAlpha = 0.25 + 0.1 * e;

    ctx.save();
    ctx.fillStyle = `rgba(0,0,0,${bgAlpha})`;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.translate(WIDTH / 2, HEIGHT / 2 + 12);
    ctx.scale(scale, scale);
    ctx.globalAlpha = alpha;

    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = isGo
      ? "800 72px Poppins, sans-serif"
      : "800 88px Poppins, sans-serif";
    ctx.fillText(label, 0, 0);

    ctx.globalAlpha = alpha * 0.4;
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 24;
    ctx.fillText(label, 0, 0);

    ctx.restore();
  };

  // Game loop
  useEffect(() => {
    const loop = () => step();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, score.p, score.b, score.adv, score.over]);

  // DPR
  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const cssW = WIDTH;
  const cssH = HEIGHT;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center border">
      <div className="w-full flex flex-col items-center gap-4 select-none">
        <div className="w-full max-w-[760px]">
          <div className="relative flex items-center justify-center p-5">
            <canvas
              ref={canvasRef}
              width={cssW * dpr}
              height={cssH * dpr}
              style={{ width: cssW, height: cssH }}
              className="rounded-[20px] shadow-md bg-[#e7f3eb] border border-dark-green-octa"
            />

            {/* DPR scale priming; main draw is in the loop */}
            <Scaler canvasRef={canvasRef} dpr={dpr} draw={() => {}} />

            {/* START OVERLAY (motivational) */}
            {screen === "menu" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/30">
                <div className="bg-white/95 backdrop-blur-sm border border-dark-green-octa rounded-[20px] px-7 py-7 w-[88%] max-w-md text-center shadow-lg">
                  <h3 className="text-2xl font-semibold mb-2 text-dark-green">
                    Swing, win — get 20% in!
                  </h3>
                  <p className="text-sm text-slate-600 mb-5 leading-relaxed">
                    Smash that serve, beat the bot, and grab a discount while
                    you’re hot.
                  </p>

                  {coupon && (
                    <div className="mb-4">
                      <div className="text-xs text-emerald-700 mb-1">
                        Your last reward coupon:
                      </div>
                      <div className="font-mono text-base px-3 py-2 bg-emerald-50 text-emerald-800 rounded-lg inline-block select-all">
                        {coupon}
                      </div>
                    </div>
                  )}

                  <motion.button
                    whileTap={{ scale: 0.98 }}
                    onClick={() => {
                      resetGame(); // beállítja a countdown-ot is
                      setScreen("playing");
                    }}
                    className="px-4 py-2 rounded-[20px] bg-green text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                  >
                    Start
                  </motion.button>
                </div>
              </div>
            )}

            {/* GAME OVER OVERLAY */}
            {screen === "playing" && score.over && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-[20px]"
              >
                <div className="bg-white rounded-[20px] p-6 w-[88%] max-w-md text-center shadow-lg border border-dark-green-octa">
                  {score.winner === "player" ? (
                    <>
                      <h3 className="text-xl font-semibold mb-2 text-dark-green">
                        You won! 🎉
                      </h3>
                      <p className="text-slate-600 mb-4">
                        Here is your 20% discount coupon:
                      </p>
                      <div className="font-mono text-lg px-3 py-2 bg-slate-100 rounded-lg inline-block mb-4 select-all">
                        {coupon}
                      </div>
                      <div className="text-xs text-slate-500 mb-5">
                        Apply at checkout to get 20% off your next reservation.
                      </div>
                    </>
                  ) : (
                    <>
                      <h3 className="text-xl font-semibold mb-2 text-dark-green">
                        Game Over
                      </h3>
                      <p className="text-slate-600 mb-5">
                        The bot took this one. Ready for a rematch?
                      </p>
                    </>
                  )}

                  <div className="flex items-center justify-center gap-2">
                    <button
                      className="px-3 py-1.5 rounded-[20px] bg-slate-800 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                      onClick={() => {
                        // vissza a kezdőképernyőre (kupon megmarad a menün)
                        setScreen("menu");
                      }}
                    >
                      Back to Start
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-[20px] bg-emerald-600 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300"
                      onClick={() => {
                        resetGame();
                        setScore({
                          p: 0,
                          b: 0,
                          adv: null,
                          over: false,
                          winner: null,
                        });
                        setScreen("playing");
                      }}
                    >
                      Play Again
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </div>
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
