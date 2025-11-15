import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import racketSvg from "../assets/minigame/racket.svg";
import { useCurrentUser } from "../hooks/useCurrentUser";

import hit1 from "../assets/minigame/hit1.mp3";
import hit2 from "../assets/minigame/hit2.mp3";
import hit3 from "../assets/minigame/hit3.mp3";
import hit4 from "../assets/minigame/hit4.mp3";
import swing1 from "../assets/minigame/swing1.mp3";
import swing2 from "../assets/minigame/swing2.mp3";
import swing3 from "../assets/minigame/swing3.mp3";
import swing4 from "../assets/minigame/swing4.mp3";

export default function TennisMiniGame() {
  const canvasRef = useRef(null);
  const rafRef = useRef(0);
  const navigate = useNavigate();

  const { user, authenticated } = useCurrentUser();

  const [screen, setScreen] = useState("menu");
  const [coupon, setCoupon] = useState(null);

  const [score, setScore] = useState({
    p: 0,
    b: 0,
    adv: null,
    over: false,
    winner: null,
  });

  const gameRef = useRef(null);

  const racketImgRef = useRef(null);

  const swingSoundsRef = useRef([]);
  const hitSoundsRef = useRef([]);

  const WIDTH = 520;
  const HEIGHT = 720;

  const COURT_MARGIN = 50;
  const COURT_MARGIN_TOP = 90; 

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

  const BALL_R = 9;
  const BALL_SPEED_INIT = 3;
  const BALL_SPEED_MAX = 5.5; 

  const BOT_SKILL = 1;
  const BOT_WRONG_STROKE_STEP = 0.1;  
  const BOT_WRONG_STROKE_MAX = 1;   

  const COUNTDOWN_MS = 3000;

  useEffect(() => {
    if (authenticated === false) {
      navigate("/login");
    }
  }, [authenticated, navigate]);

  useEffect(() => {
    const img = new Image();
    img.src = racketSvg;
    racketImgRef.current = img;
  }, []);

  useEffect(() => {
    swingSoundsRef.current = [swing1, swing2, swing3, swing4].map((src) => {
      const a = new Audio(src);
      a.preload = "auto";
      a.volume = 0.55;
      return a;
    });

    hitSoundsRef.current = [hit1, hit2, hit3, hit4].map((src) => {
      const a = new Audio(src);
      a.preload = "auto";
      a.volume = 0.7;
      return a;
    });
  }, []);

  const playRandomFromRef = (ref, volume) => {
    const arr = ref.current;
    if (!arr || !arr.length) return;
    const idx = Math.floor(Math.random() * arr.length);
    const audio = arr[idx];
    try {
      if (volume != null) audio.volume = volume;
      audio.currentTime = 0;
      audio.play();
    } catch {}
  };

  const playSwingSound = () => playRandomFromRef(swingSoundsRef);
  const playHitSound = () => playRandomFromRef(hitSoundsRef);

  const resetRally = (serveTo = "player") => {
    if (!gameRef.current) return;
    const dirY = serveTo === "player" ? 1 : -1;
    const now = performance.now();
    gameRef.current.ball = {
      x: WIDTH / 2,
      y: COURT_CENTER_Y,
      vx: 0,
      vy: 0,
      speed: BALL_SPEED_INIT,
    };
    gameRef.current.serveDir = dirY;
    gameRef.current.countdownEnd = now + COUNTDOWN_MS;
    gameRef.current.rallyActive = false;
    gameRef.current.lastHitType = null;
    gameRef.current.botWrongStrokeProb = 0;
  };

  const resetScore = () =>
    setScore({ p: 0, b: 0, adv: null, over: false, winner: null });

  const resetGame = () => {
    resetScore();
    const now = performance.now();
    gameRef.current = {
      keys: { left: false, right: false },
      mouse: {
        leftDown: false,
        rightDown: false,
        lastLeftTapAt: 0,
        lastRightTapAt: 0,
      },
      hit: {
        cooldownMs: 600,
        playerNextAllowedAt: now,
      },
      pointerX: null,
      player: {
        x: WIDTH / 2 - PADDLE_W / 2,
        y: COURT_BOTTOM - PADDLE_H,
      },
      bot: {
        x: WIDTH / 2 - PADDLE_W / 2,
        y: COURT_TOP,
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
        playerFacing: 1, 
        botFacing: 1,
      },
      vfx: {
        trail: [], 
      },
      botWrongStrokeProb: 0,
    };
  };

  useEffect(() => {
    resetGame();
  }, []);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") {
        setScreen((prev) => {
          if (prev === "playing" && !score.over) {
            return "paused";
          }
          if (prev === "paused") {
            return "playing";
          }
          return prev;
        });
      }
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [score.over]);

  useEffect(() => {
    const handleBlur = () => {
      setScreen((prev) =>
        prev === "playing" && !score.over ? "paused" : prev
      );
    };
    const handleVisibility = () => {
      if (document.hidden) {
        setScreen((prev) =>
          prev === "playing" && !score.over ? "paused" : prev
        );
      }
    };
    window.addEventListener("blur", handleBlur);
    document.addEventListener("visibilitychange", handleVisibility);
    return () => {
      window.removeEventListener("blur", handleBlur);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, [score.over]);

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
      const g = gameRef.current;
      const now = performance.now();

      if (e.button === 0) {
        g.mouse.leftDown = true;
        g.mouse.lastLeftTapAt = now;
        g.anim.playerFacing = -1;
      }
      if (e.button === 2) {
        g.mouse.rightDown = true;
        g.mouse.lastRightTapAt = now;
        g.anim.playerFacing = 1;
      }
    };

    const onPointerUp = (e) => {
      if (!gameRef.current) return;
      const g = gameRef.current;
      if (e.button === 0) g.mouse.leftDown = false;
      if (e.button === 2) g.mouse.rightDown = false;
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

  const drawRoundedRect = (ctx, x, y, w, h, r) => {
    const radius = Math.min(r, w / 2, h / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + w - radius, y);
    ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
    ctx.lineTo(x + w, y + h - radius);
    ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
    ctx.lineTo(x + radius, y + h);
    ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
  };

  const drawCourt = (ctx) => {
    ctx.fillStyle = "#f9fafb";
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.globalAlpha = 0.85;

    const leftGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    leftGrad.addColorStop(0, "rgba(16,185,129,0.10)");
    leftGrad.addColorStop(1, "rgba(59,130,246,0.02)");
    ctx.fillStyle = leftGrad;
    ctx.beginPath();
    ctx.arc(COURT_LEFT - 80, HEIGHT * 0.22, 160, 0, Math.PI * 2);
    ctx.fill();

    const rightGrad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    rightGrad.addColorStop(0, "rgba(52,211,153,0.06)");
    rightGrad.addColorStop(1, "rgba(56,189,248,0.12)");
    ctx.fillStyle = rightGrad;
    ctx.beginPath();
    ctx.arc(COURT_RIGHT + 90, HEIGHT * 0.8, 200, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = "rgba(148,163,184,0.18)";
    ctx.lineWidth = 16;
    for (let i = -WIDTH; i < WIDTH * 1.5; i += 90) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i + WIDTH * 0.6, COURT_TOP - 10);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(i - 40, COURT_BOTTOM + 10);
      ctx.lineTo(i + WIDTH * 0.6 - 40, HEIGHT);
      ctx.stroke();
    }
    ctx.restore();

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

    const vign = ctx.createRadialGradient(
      WIDTH / 2,
      HEIGHT / 2,
      Math.min(WIDTH, HEIGHT) * 0.4,
      WIDTH / 2,
      HEIGHT / 2,
      Math.max(WIDTH, HEIGHT) * 0.9
    );
    vign.addColorStop(0, "rgba(0,0,0,0)");
    vign.addColorStop(1, "rgba(0,0,0,0.10)");
    ctx.fillStyle = vign;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    ctx.save();
    ctx.shadowColor = "rgba(13, 94, 74, 0.25)";
    ctx.shadowBlur = 18;
    ctx.shadowOffsetY = 6;
    ctx.fillStyle = "#91c9a0";
    ctx.fillRect(COURT_LEFT, COURT_TOP, COURT_WIDTH, COURT_HEIGHT);
    ctx.restore();

    const L = COURT_LEFT + 6;
    const R = COURT_RIGHT - 6;
    const T = COURT_TOP + 6;
    const B = COURT_BOTTOM - 6;
    const cw = R - L;
    const ch = B - T;
    const centerX = L + cw / 2;

    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 2;
    ctx.strokeRect(L, T, cw, ch);

    ctx.beginPath();
    ctx.moveTo(L, T);
    ctx.lineTo(R, T);
    ctx.moveTo(L, B);
    ctx.lineTo(R, B);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(L, T);
    ctx.lineTo(L, B);
    ctx.moveTo(R, T);
    ctx.lineTo(R, B);
    ctx.stroke();

    const singlesInset = cw * 0.14;
    const sL = L + singlesInset;
    const sR = R - singlesInset;

    ctx.beginPath();
    ctx.moveTo(sL, T);
    ctx.lineTo(sL, B);
    ctx.moveTo(sR, T);
    ctx.lineTo(sR, B);
    ctx.stroke();

    const serviceTop = T + ch * 0.28;
    const serviceBot = B - ch * 0.28;

    ctx.beginPath();
    ctx.moveTo(sL, serviceTop);
    ctx.lineTo(sR, serviceTop);
    ctx.moveTo(sL, serviceBot);
    ctx.lineTo(sR, serviceBot);
    ctx.stroke();

    ctx.beginPath();
    ctx.moveTo(centerX, serviceTop);
    ctx.lineTo(centerX, serviceBot);
    ctx.stroke();

    const markLen = 10;
    ctx.beginPath();
    ctx.moveTo(centerX, T);
    ctx.lineTo(centerX, T + markLen);
    ctx.moveTo(centerX, B);
    ctx.lineTo(centerX, B - markLen);
    ctx.stroke();

    const netY = COURT_CENTER_Y - NET_HEIGHT / 2;
    ctx.fillStyle = "#fff";
    ctx.fillRect(L, netY, cw, NET_HEIGHT);

    ctx.fillStyle = "#dfe8e4";
    ctx.fillRect(L - 1, netY - NET_HEIGHT - 10, 4, NET_HEIGHT + 20);
    ctx.fillRect(R - 3, netY - NET_HEIGHT - 10, 4, NET_HEIGHT + 20);

    const t = (performance.now() / 2000) % 1;
    const sweepX = L + 20 + (cw - 40) * t;
    const lg = ctx.createLinearGradient(sweepX - 80, 0, sweepX + 80, 0);
    lg.addColorStop(0, "rgba(255,255,255,0)");
    lg.addColorStop(0.5, "rgba(255,255,255,0.06)");
    lg.addColorStop(1, "rgba(255,255,255,0)");
    ctx.fillStyle = lg;
    ctx.fillRect(L, T, cw, ch);
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
    const t = 1 - elapsed / 180;
    const dir = isPlayer ? 1 : -1;
    return dir * 0.45 * t;
  };

  const drawRacket = (ctx, x, y, isPlayer) => {
    const g = gameRef.current;
    const img = racketImgRef.current;
    if (!g) return;

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
      const baseSize = 90;
      ctx.drawImage(img, -baseSize / 2, -baseSize / 2, baseSize, baseSize);
    } else {
      ctx.fillStyle = isPlayer ? "#0ea5e9" : "#ef4444";
      ctx.fillRect(-PADDLE_W / 2, -PADDLE_H / 2, PADDLE_W, PADDLE_H);
    }

    ctx.restore();
  };

  const drawBallTrail = (ctx) => {
    const g = gameRef.current;
    if (!g || !g.vfx || !g.vfx.trail) return;
    const now = performance.now();
    const maxAge = 180;

    const next = [];
    for (const p of g.vfx.trail) {
      const age = now - p.t;
      if (age > maxAge) continue;
      const t = age / maxAge;
      const alpha = 0.25 * (1 - t);
      const r = BALL_R * (0.4 + 0.6 * (1 - t));

      ctx.save();
      ctx.beginPath();
      ctx.arc(p.x, p.y, r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(190, 242, 100, ${alpha})`;
      ctx.fill();
      ctx.restore();

      next.push(p);
    }
    g.vfx.trail = next;
  };

  const drawBall = (ctx, x, y) => {
    const r = BALL_R;

    ctx.save();

    const glowGrad = ctx.createRadialGradient(x, y, r * 0.8, x, y, r * 2.1);
    glowGrad.addColorStop(0, "rgba(190, 242, 100, 0.55)");
    glowGrad.addColorStop(1, "rgba(190, 242, 100, 0)");
    ctx.fillStyle = glowGrad;
    ctx.beginPath();
    ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
    ctx.fill();

    const grad = ctx.createRadialGradient(
      x - r * 0.5,
      y - r * 0.6,
      r * 0.2,
      x,
      y,
      r
    );
    grad.addColorStop(0, "#fefce8");
    grad.addColorStop(0.4, "#d9f99d");
    grad.addColorStop(1, "#a3e635");
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = "rgba(15, 23, 42, 0.35)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(x - r * 0.4, y - r * 0.45, r * 0.23, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(255,255,255,0.7)";
    ctx.fill();

    ctx.strokeStyle = "rgba(250, 250, 250, 0.95)";
    ctx.lineWidth = 1.4;

    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.8, r * 0.45, 0.5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.beginPath();
    ctx.ellipse(x, y, r * 0.8, r * 0.45, -0.9, 0, Math.PI * 2);
    ctx.stroke();

    ctx.restore();
  };

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
    const boxW = 260;
    const boxH = 52;
    const x = WIDTH / 2 - boxW / 2;
    const y = 18;

    ctx.save();

    ctx.globalAlpha = 0.95;
    drawRoundedRect(ctx, x, y, boxW, boxH, 16);

    const grd = ctx.createLinearGradient(x, y, x + boxW, y + boxH);
    grd.addColorStop(0, "rgba(255,255,255,0.9)");
    grd.addColorStop(1, "rgba(241,245,249,0.9)");
    ctx.fillStyle = grd;
    ctx.fill();

    ctx.strokeStyle = "rgba(148,163,184,0.6)";
    ctx.lineWidth = 1.4;
    ctx.stroke();

    ctx.globalAlpha = 0.18;
    ctx.shadowColor = "rgba(15,23,42,0.7)";
    ctx.shadowBlur = 16;
    ctx.shadowOffsetY = 6;
    drawRoundedRect(ctx, x, y + 2, boxW, boxH, 16);
    ctx.fillStyle = "rgba(15,23,42,0.15)";
    ctx.fill();

    ctx.restore();

    ctx.save();
    ctx.fillStyle = "#0f172a";
    ctx.font = "700 18px Poppins, sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = `You ${formatScore(score)} Bot`;
    ctx.fillText(label, WIDTH / 2, y + boxH / 2);
    ctx.restore();
  };

  const drawHitCooldown = (ctx) => {
    const g = gameRef.current;
    if (!g || !g.hit) return;

    const now = performance.now();
    const cd = g.hit.cooldownMs || 1;
    const remaining = Math.max(0, g.hit.playerNextAllowedAt - now);
    const ratio = Math.max(0, Math.min(1, 1 - remaining / cd));

    const cx = WIDTH - 32;
    const cy = HEIGHT - 32;
    const outerR = 18;
    const innerR = 12;

    ctx.save();
    ctx.globalAlpha = 0.95;

    ctx.beginPath();
    ctx.arc(cx, cy, outerR, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(15,23,42,0.85)";
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, innerR, 0, Math.PI * 2);
    ctx.fillStyle = "#020617";
    ctx.fill();

    ctx.beginPath();
    const startAngle = -Math.PI / 2;
    const endAngle = startAngle + Math.PI * 2 * ratio;
    ctx.arc(cx, cy, innerR, startAngle, endAngle);
    ctx.strokeStyle = "#22c55e";
    ctx.lineWidth = 4;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 3, 0, Math.PI * 2);
    ctx.fillStyle = remaining > 0 ? "#f97373" : "#bbf7d0";
    ctx.fill();

    ctx.restore();
  };

  const couponRequestedRef = useRef(false);

  const onGameWon = async (winner) => {
    setScore((s) => ({ ...s, over: true, winner }));

    if (winner === "player") {
      if (couponRequestedRef.current) return;
      couponRequestedRef.current = true;

      const code = await requestCouponFromAPI();
      setCoupon(code || "ERROR");
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

  const requestCouponFromAPI = async () => {
    try {
      const res = await fetch("http://localhost:5044/api/coupon/request", {
        method: "GET",
        credentials: "include",
      });

      if (!res.ok) throw new Error("Coupon request failed");

      const code = await res.text();

      return code.trim();
    } catch (err) {
      console.error("Coupon API error:", err);
      return null;
    }
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

  const applyPlayerControl = () => {
    const g = gameRef.current;
    if (!g) return;
    const p = g.player;

    if (g.pointerX != null) {
      const target = g.pointerX - PADDLE_W / 2;
      const dx = target - p.x;
      p.x += Math.max(-PADDLE_SPEED, Math.min(PADDLE_SPEED, dx));
    }

    const minX = COURT_LEFT + 8;
    const maxX = COURT_RIGHT - 8 - PADDLE_W;
    p.x = Math.max(minX, Math.min(maxX, p.x));
  };

  const botAI = () => {
    const g = gameRef.current;
    if (!g) return;
    const b = g.ball;
    const bot = g.bot;

    if ((isCountdownActive() || screen !== "playing") && !score.over) {
      const centerTarget = WIDTH / 2 - PADDLE_W / 2;
      const dx = centerTarget - bot.x;
      const move = PADDLE_SPEED * 0.3;
      if (Math.abs(dx) > 1) bot.x += Math.max(-move, Math.min(move, dx));
    } else if (screen === "playing") {
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
    }

    const minX = COURT_LEFT + 8;
    const maxX = COURT_RIGHT - 8 - PADDLE_W;
    bot.x = Math.max(minX, Math.min(maxX, bot.x));

    g.anim.botFacing = b.x >= bot.x + PADDLE_W / 2 ? 1 : -1;
  };

  const tryRacketReturn = (paddleX, paddleY, isPlayer) => {
    const g = gameRef.current;
    if (!g) return false;
    const b = g.ball;

    const center = paddleX + PADDLE_W / 2;
    const offset = b.x - center;
    const now = performance.now();

    if (isPlayer) {
      const hit = g.hit;
      if (now < hit.playerNextAllowedAt) return false;

      const tapWindowMs = 160;
      const dtLeft = now - g.mouse.lastLeftTapAt;
      const dtRight = now - g.mouse.lastRightTapAt;

      let strokeSide = null;
      if (dtLeft <= tapWindowMs || dtRight <= tapWindowMs) {
        strokeSide = dtRight < dtLeft ? "fh" : "bh";
      } else {
        return false;
      }

      g.anim.playerFacing = strokeSide === "fh" ? 1 : -1;
      g.anim.playerHitAt = now;
      playSwingSound();

      hit.playerNextAllowedAt = now + hit.cooldownMs;
      g.lastTouch = "player";
    } else {
      
      const needFH = offset > 0;
      
      const wrongProb = Math.min(
        BOT_WRONG_STROKE_MAX,
        Math.max(0, g.botWrongStrokeProb ?? 0)
      );

      const botChoosesFH =
        Math.random() > wrongProb ? needFH : !needFH;
  
      if (botChoosesFH !== needFH) return false;

      g.anim.botFacing = needFH ? 1 : -1;
    }

    const extra = isPlayer ? 25 : 0;

    const withinY = isPlayer
      ? b.y + BALL_R >= paddleY - extra &&
        b.y + BALL_R <= paddleY + PADDLE_H + extra
      : b.y - BALL_R <= paddleY + PADDLE_H + extra &&
        b.y - BALL_R >= paddleY - extra;

    const withinX =
      b.x + BALL_R >= paddleX - extra &&
      b.x - BALL_R <= paddleX + PADDLE_W + extra;

    if (!withinX || !withinY) {
      return false;
    }

    if (!isPlayer) {
      g.anim.botHitAt = now;
      playSwingSound();
    }

    playHitSound();

    const norm = Math.max(-1, Math.min(1, offset / (PADDLE_W / 2)));
    const angle = norm * 0.6;

    const prevSpeed = b.speed;
    const speed = Math.min(BALL_SPEED_MAX, prevSpeed * 1.05 + 0.2);
    b.speed = speed;

    if (speed > prevSpeed) {
      const current = g.botWrongStrokeProb ?? 0;
      g.botWrongStrokeProb = Math.min(
        BOT_WRONG_STROKE_MAX,
        current + BOT_WRONG_STROKE_STEP
      );
    }

    const newVy =
      (isPlayer ? -1 : 1) * (0.9 + Math.random() * 0.3) * speed;
    const newVx = angle * speed;


    b.vx = newVx;
    b.vy = newVy;

    b.y = isPlayer
      ? paddleY - BALL_R - 1
      : paddleY + PADDLE_H + BALL_R + 1;

    g.lastTouch = isPlayer ? "player" : "bot";

    return true;
  };

  const easeInOutCubic = (t) =>
    t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

  const drawCountdown = (ctx) => {
    if (!isCountdownActive()) return;
    const g = gameRef.current;
    if (!g) return;

    const end = g.countdownEnd;
    const now = performance.now();
    const remaining = Math.max(0, end - now);

    const step = Math.ceil(remaining / 1000);
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

      const b = g.ball;

      if (g.vfx && g.vfx.trail) {
        g.vfx.trail.push({ x: b.x, y: b.y, t: performance.now() });
      }

      drawCourt(ctx);
      drawBallTrail(ctx);
      drawRacket(ctx, g.player.x, g.player.y, true);
      drawRacket(ctx, g.bot.x, g.bot.y, false);
      drawBall(ctx, g.ball.x, g.ball.y);
      drawHUD(ctx);
      drawHitCooldown(ctx);
      if (playing) drawCountdown(ctx);

      rafRef.current = requestAnimationFrame(step);
      return;
    }

    applyPlayerControl();
    botAI();

    const b = g.ball;
    b.x += b.vx;
    b.y += b.vy;

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

    if (b.y - BALL_R <= COURT_TOP + 6) {
      awardPoint("player");
    } else if (b.y + BALL_R >= COURT_BOTTOM - 6) {
      awardPoint("bot");
    }

    if (g.vfx && g.vfx.trail) {
      g.vfx.trail.push({ x: b.x, y: b.y, t: performance.now() });
    }

    drawCourt(ctx);
    drawBallTrail(ctx);
    drawRacket(ctx, g.player.x, g.player.y, true);
    drawRacket(ctx, g.bot.x, g.bot.y, false);
    drawBall(ctx, b.x, b.y);
    drawHUD(ctx);
    drawHitCooldown(ctx);

    rafRef.current = requestAnimationFrame(step);
  };

  useEffect(() => {
    const loop = () => step();
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [screen, score.p, score.b, score.adv, score.over]);

  const dpr =
    typeof window !== "undefined" ? window.devicePixelRatio || 1 : 1;
  const cssW = WIDTH;
  const cssH = HEIGHT;

  return (
    <div className="w-full h-screen flex flex-col items-center justify-center border">
      <div className="w-full flex flex-col items-center gap-4 select-none">
        <div className="">
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

            {/* START OVERLAY */}
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

                  <div className="flex flex-col gap-3 items-center">
                    <motion.button
                      whileTap={{ scale: 0.98 }}
                      onClick={() => {
                        resetGame();
                        setScreen("playing");
                      }}
                      className="px-4 py-2 rounded-[20px] bg-green text-white shadow-md cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 w-full"
                    >
                      Start
                    </motion.button>

                    <button
                      onClick={() => {
                        navigate("/profile?tab=coupons");
                      }}
                      className="px-4 py-2 rounded-[20px] border border-slate-300 text-slate-700 bg-white/80 hover:bg-white cursor-pointer transition-all duration-200 w-full"
                    >
                      Back to coupons
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* PAUSE OVERLAY */}
            {screen === "paused" && !score.over && (
              <div className="absolute inset-0 flex items-center justify-center rounded-[20px] bg-black/40">
                <div className="bg-white rounded-[20px] p-6 w-[88%] max-w-md text-center shadow-lg border border-dark-green-octa">
                  <h3 className="text-xl font-semibold mb-2 text-dark-green">
                    Paused ⏸
                  </h3>
                  <p className="text-slate-600 mb-5 text-sm">
                    Take a breather. The match will wait for you.
                  </p>

                  <div className="flex flex-col gap-3">
                    <button
                      className="px-3 py-2 rounded-[20px] bg-emerald-600 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 w-full"
                      onClick={() => {
                        setScreen("playing");
                      }}
                    >
                      Resume match
                    </button>
                    <button
                      className="px-3 py-2 rounded-[20px] border border-slate-300 bg-white text-slate-700 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all duration-300 w-full"
                      onClick={() => {
                        navigate("/profile?tab=coupons");
                      }}
                    >
                      Back to coupons
                    </button>
                  </div>
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
                        Apply at checkout to get 20% off your next
                        reservation.
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

                  <div className="flex flex-col gap-3">
                    <button
                      className="px-3 py-1.5 rounded-[20px] bg-slate-800 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 w-full"
                      onClick={() => {
                        setScreen("menu");
                      }}
                    >
                      Back to Start
                    </button>
                    <button
                      className="px-3 py-1.5 rounded-[20px] bg-emerald-600 text-white cursor-pointer hover:scale-105 active:scale-95 transition-all duration-300 w-full"
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
                    <button
                      className="px-3 py-1.5 rounded-[20px] border border-slate-300 bg-white text-slate-700 cursor-pointer hover:bg-slate-50 active:scale-95 transition-all duration-300 w-full"
                      onClick={() => {
                        navigate("/profile?tab=coupons");
                      }}
                    >
                      Back to coupons
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
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(ctx);
  }, [canvasRef, dpr, draw]);
  return null;
}