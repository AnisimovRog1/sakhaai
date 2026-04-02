import { memo, useEffect, useRef } from 'react';

/* ─── Млечный Путь: медленный дрейф через галактику ─── */

// Слои звёзд
const FAR_COUNT = 200;
const MID_COUNT = 120;
const NEAR_COUNT = 40;
const DUST_COUNT = 30;

// Скорости дрейфа (px/sec) — диагональ: вправо-вниз
const DRIFT_DIR_X = 0.6;  // направление
const DRIFT_DIR_Y = 0.3;
const FAR_SPEED = 0.8;
const MID_SPEED = 2.0;
const NEAR_SPEED = 4.5;
const DUST_SPEED = 0.4;

// Кометы
const COMET_INTERVAL_MIN = 15000;
const COMET_INTERVAL_MAX = 30000;

interface Star {
  x: number; y: number;
  size: number;
  baseAlpha: number;
  twinkleSpeed: number;  // уникальная частота мерцания
  twinklePhase: number;  // начальная фаза
  // Цвет: 0 = белый, иначе hue
  hue: number;
  saturation: number;
}

interface DustParticle {
  x: number; y: number;
  size: number;
  alpha: number;
}

interface Comet {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  trail: { x: number; y: number }[];
}

function rnd(a: number, b: number) { return a + Math.random() * (b - a); }

function makeStar(w: number, h: number, layer: 'far' | 'mid' | 'near'): Star {
  const colorRoll = Math.random();
  let hue = 0, saturation = 0;
  if (colorRoll < 0.08) { hue = rnd(200, 230); saturation = rnd(30, 60); }      // голубые
  else if (colorRoll < 0.14) { hue = rnd(35, 55); saturation = rnd(40, 70); }    // желтоватые
  else if (colorRoll < 0.18) { hue = rnd(10, 25); saturation = rnd(30, 50); }    // красноватые
  else if (colorRoll < 0.22) { hue = rnd(260, 290); saturation = rnd(20, 40); }  // фиолетовые

  const sizes = { far: rnd(0.3, 0.8), mid: rnd(0.6, 1.4), near: rnd(1.0, 2.5) };
  const alphas = { far: rnd(0.15, 0.35), mid: rnd(0.3, 0.6), near: rnd(0.5, 0.9) };

  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: sizes[layer],
    baseAlpha: alphas[layer],
    twinkleSpeed: rnd(0.3, 1.2),
    twinklePhase: rnd(0, Math.PI * 2),
    hue, saturation,
  };
}

function makeDust(w: number, h: number): DustParticle {
  return {
    x: Math.random() * w,
    y: Math.random() * h,
    size: rnd(0.5, 1.5),
    alpha: rnd(0.03, 0.12),
  };
}

function makeComet(w: number, h: number): Comet {
  const fromRight = Math.random() > 0.4;
  const x = fromRight ? w + 20 : rnd(-20, w * 0.3);
  const y = rnd(-20, h * 0.3);
  const speed = rnd(1.5, 3);
  const angle = fromRight ? rnd(210, 240) : rnd(300, 330);
  const rad = angle * Math.PI / 180;
  return {
    x, y,
    vx: Math.cos(rad) * speed,
    vy: -Math.sin(rad) * speed,
    life: 0, maxLife: rnd(180, 300),
    size: rnd(1.2, 2),
    trail: [],
  };
}

// Wrap-around: звезда вышла за край — появляется с другой стороны
function wrap(v: number, max: number): number {
  if (v < -10) return max + 10;
  if (v > max + 10) return -10;
  return v;
}

const SpaceBackground = memo(function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    let ctx: CanvasRenderingContext2D | null = null;
    try { ctx = canvas.getContext('2d'); } catch { /* noop */ }
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let rafId = 0;
    let paused = false;

    // Звёзды
    let farStars: Star[] = [];
    let midStars: Star[] = [];
    let nearStars: Star[] = [];
    let dust: DustParticle[] = [];

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }

    function init() {
      resize();
      farStars = Array.from({ length: FAR_COUNT }, () => makeStar(w, h, 'far'));
      midStars = Array.from({ length: MID_COUNT }, () => makeStar(w, h, 'mid'));
      nearStars = Array.from({ length: NEAR_COUNT }, () => makeStar(w, h, 'near'));
      dust = Array.from({ length: DUST_COUNT }, () => makeDust(w, h));
    }
    init();

    // Кометы
    const comets: Comet[] = [];
    let nextCometAt = performance.now() + rnd(5000, 12000); // первая пораньше

    let prevTime = 0;

    function drawStar(c: CanvasRenderingContext2D, s: Star, time: number) {
      // Мерцание
      const twinkle = 0.7 + 0.3 * Math.sin(time * 0.001 * s.twinkleSpeed + s.twinklePhase);
      const alpha = s.baseAlpha * twinkle;
      if (alpha < 0.01) return;

      // Цвет
      let color: string;
      if (s.hue) {
        color = `hsla(${s.hue}, ${s.saturation}%, 85%, ${alpha})`;
      } else {
        color = `rgba(255, 255, 255, ${alpha})`;
      }

      c.beginPath();
      c.arc(s.x, s.y, s.size, 0, Math.PI * 2);
      c.fillStyle = color;
      c.fill();

      // Glow для крупных ярких звёзд
      if (s.size > 1.5 && alpha > 0.4) {
        c.beginPath();
        c.arc(s.x, s.y, s.size * 3.5, 0, Math.PI * 2);
        const g = c.createRadialGradient(s.x, s.y, 0, s.x, s.y, s.size * 3.5);
        const glowColor = s.hue
          ? `hsla(${s.hue}, ${s.saturation}%, 80%, ${alpha * 0.15})`
          : `rgba(180, 200, 255, ${alpha * 0.15})`;
        g.addColorStop(0, glowColor);
        g.addColorStop(1, 'rgba(0, 0, 0, 0)');
        c.fillStyle = g;
        c.fill();
      }
    }

    function moveLayer(stars: Star[], speed: number, dtSec: number) {
      const dx = DRIFT_DIR_X * speed * dtSec;
      const dy = DRIFT_DIR_Y * speed * dtSec;
      for (let i = 0; i < stars.length; i++) {
        const s = stars[i];
        s.x += dx;
        s.y += dy;
        s.x = wrap(s.x, w);
        s.y = wrap(s.y, h);
      }
    }

    function animate(time: number) {
      if (paused) { rafId = requestAnimationFrame(animate); return; }
      const dt = prevTime ? Math.min(time - prevTime, 80) : 16;
      prevTime = time;
      const dtSec = dt / 1000 * 60; // normalize to ~60fps

      const c = ctx!;
      c.clearRect(0, 0, w, h);

      // ── Двигаем слои ──
      moveLayer(farStars, FAR_SPEED, dtSec);
      moveLayer(midStars, MID_SPEED, dtSec);
      moveLayer(nearStars, NEAR_SPEED, dtSec);

      // Пыль
      const dustDx = DRIFT_DIR_X * DUST_SPEED * dtSec;
      const dustDy = DRIFT_DIR_Y * DUST_SPEED * dtSec;
      for (let i = 0; i < dust.length; i++) {
        const d = dust[i];
        d.x += dustDx;
        d.y += dustDy;
        d.x = wrap(d.x, w);
        d.y = wrap(d.y, h);
        c.beginPath();
        c.arc(d.x, d.y, d.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(150, 160, 200, ${d.alpha})`;
        c.fill();
      }

      // ── Рисуем звёзды (от далёких к ближним) ──
      for (let i = 0; i < farStars.length; i++) drawStar(c, farStars[i], time);
      for (let i = 0; i < midStars.length; i++) drawStar(c, midStars[i], time);
      for (let i = 0; i < nearStars.length; i++) drawStar(c, nearStars[i], time);

      // ── Кометы ──
      if (time > nextCometAt && comets.length < 1) {
        comets.push(makeComet(w, h));
        nextCometAt = time + rnd(COMET_INTERVAL_MIN, COMET_INTERVAL_MAX);
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const cm = comets[i];
        cm.life++;
        cm.x += cm.vx * (dt / 16);
        cm.y += cm.vy * (dt / 16);

        const lifeRatio = cm.life / cm.maxLife;
        const fade = lifeRatio > 0.75 ? 1 - (lifeRatio - 0.75) / 0.25 : Math.min(lifeRatio * 4, 1);

        cm.trail.unshift({ x: cm.x, y: cm.y });
        if (cm.trail.length > 35) cm.trail.length = 35;

        // Trail
        for (let t = 1; t < cm.trail.length; t++) {
          const p = cm.trail[t];
          const ta = (1 - t / cm.trail.length) * 0.3 * fade;
          const ts = cm.size * (1 - t / cm.trail.length) * 0.6;
          c.beginPath();
          c.arc(p.x, p.y, ts, 0, Math.PI * 2);
          c.fillStyle = `rgba(180, 210, 255, ${ta})`;
          c.fill();
        }

        // Head
        c.beginPath();
        c.arc(cm.x, cm.y, cm.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 255, 255, ${fade * 0.9})`;
        c.fill();

        // Glow
        c.beginPath();
        c.arc(cm.x, cm.y, cm.size * 5, 0, Math.PI * 2);
        const cg = c.createRadialGradient(cm.x, cm.y, 0, cm.x, cm.y, cm.size * 5);
        cg.addColorStop(0, `rgba(140, 180, 255, ${fade * 0.25})`);
        cg.addColorStop(1, 'rgba(140, 180, 255, 0)');
        c.fillStyle = cg;
        c.fill();

        if (cm.life > cm.maxLife) {
          comets.splice(i, 1);
        }
      }

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    function onVisibility() {
      paused = document.hidden;
      if (!paused) prevTime = 0;
    }
    function onResize() {
      resize();
    }
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Глубокий космический градиент */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#020610] via-[#0a0d20] to-[#04060f]" />

      {/* Полоса Млечного Пути — диагональная туманность */}
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-30%', left: '-20%',
          width: '140%', height: '60%',
          transform: 'rotate(-25deg)',
          background: 'linear-gradient(90deg, transparent 0%, rgba(80,70,120,0.04) 15%, rgba(100,90,160,0.07) 30%, rgba(120,110,180,0.08) 45%, rgba(100,100,170,0.06) 60%, rgba(70,80,140,0.04) 80%, transparent 100%)',
          filter: 'blur(40px)',
        }}
      />
      <div
        className="absolute pointer-events-none"
        style={{
          top: '-15%', left: '-10%',
          width: '120%', height: '40%',
          transform: 'rotate(-22deg)',
          background: 'linear-gradient(90deg, transparent 5%, rgba(60,70,130,0.03) 25%, rgba(90,80,150,0.05) 50%, rgba(60,70,130,0.03) 75%, transparent 95%)',
          filter: 'blur(60px)',
        }}
      />

      {/* Далёкие туманности */}
      <div className="absolute top-[10%] left-[5%] w-[35%] h-[35%] rounded-full bg-blue-950/[0.06] blur-[100px]" />
      <div className="absolute bottom-[5%] right-[0%] w-[40%] h-[30%] rounded-full bg-indigo-950/[0.05] blur-[90px]" />
      <div className="absolute top-[50%] right-[15%] w-[20%] h-[20%] rounded-full bg-purple-950/[0.04] blur-[70px]" />

      {/* Canvas — звёзды, пыль, кометы */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Глубинный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/10" />
    </div>
  );
});

export default SpaceBackground;
