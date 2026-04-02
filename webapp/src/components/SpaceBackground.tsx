import { memo, useEffect, useRef } from 'react';

/* ─── 3D Starfield: полёт через открытый космос ─── */

const STAR_COUNT = 320;
const MAX_DEPTH = 1500;
const SPEED = 0.35;           // базовая скорость полёта
const COMET_CHANCE = 0.002;   // вероятность кометы за кадр
const MAX_COMETS = 2;

interface Star {
  x: number;    // -1..1 от центра
  y: number;    // -1..1 от центра
  z: number;    // глубина 1..MAX_DEPTH
  prevSx: number;
  prevSy: number;
  size: number;
  hue: number;  // 0=белая, иначе цветной оттенок
}

interface Comet {
  x: number; y: number;
  vx: number; vy: number;
  life: number; maxLife: number;
  size: number;
  trail: { x: number; y: number; a: number }[];
}

function initStar(): Star {
  return {
    x: (Math.random() - 0.5) * 2,
    y: (Math.random() - 0.5) * 2,
    z: Math.random() * MAX_DEPTH,
    prevSx: 0, prevSy: 0,
    size: 0.5 + Math.random() * 1.5,
    hue: Math.random() < 0.15 ? (200 + Math.random() * 60) : 0,
  };
}

function resetStar(s: Star) {
  s.x = (Math.random() - 0.5) * 2;
  s.y = (Math.random() - 0.5) * 2;
  s.z = MAX_DEPTH;
  s.prevSx = 0;
  s.prevSy = 0;
  s.size = 0.5 + Math.random() * 1.5;
  s.hue = Math.random() < 0.15 ? (200 + Math.random() * 60) : 0;
}

function spawnComet(w: number, _h: number): Comet {
  const side = Math.random();
  let x: number, y: number, vx: number, vy: number;
  if (side < 0.5) {
    // from top-right
    x = w * (0.3 + Math.random() * 0.7);
    y = -20;
    vx = -(1.5 + Math.random() * 2);
    vy = 2 + Math.random() * 2;
  } else {
    // from top-left
    x = w * Math.random() * 0.7;
    y = -20;
    vx = 1 + Math.random() * 2;
    vy = 2 + Math.random() * 2.5;
  }
  return { x, y, vx, vy, life: 0, maxLife: 120 + Math.random() * 100, size: 1.5 + Math.random() * 1.5, trail: [] };
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
    let w = 0, h = 0, cx = 0, cy = 0;
    let rafId = 0;
    let paused = false;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      cx = w / 2;
      cy = h / 2;
      canvas!.width = w * dpr;
      canvas!.height = h * dpr;
      canvas!.style.width = w + 'px';
      canvas!.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    // Init stars
    const stars: Star[] = [];
    for (let i = 0; i < STAR_COUNT; i++) {
      const s = initStar();
      // Spread initial z evenly so screen isn't empty at start
      s.z = (i / STAR_COUNT) * MAX_DEPTH;
      stars.push(s);
    }

    // Comets
    const comets: Comet[] = [];

    let prevTime = 0;
    const focalLength = Math.max(w, h) * 0.8;

    function animate(time: number) {
      if (paused) { rafId = requestAnimationFrame(animate); return; }
      const dt = prevTime ? Math.min(time - prevTime, 50) : 16;
      prevTime = time;
      const speed = SPEED * dt;

      const c = ctx!;
      c.clearRect(0, 0, w, h);

      // ── Звёзды ──
      const fl = focalLength;
      for (let i = 0; i < STAR_COUNT; i++) {
        const s = stars[i];

        // Двигаем к камере
        s.z -= speed;

        if (s.z <= 1) {
          resetStar(s);
          continue;
        }

        // 3D → 2D проекция
        const sx = cx + (s.x * fl) / s.z;
        const sy = cy + (s.y * fl) / s.z;

        // За экраном — ресет
        if (sx < -50 || sx > w + 50 || sy < -50 || sy > h + 50) {
          resetStar(s);
          continue;
        }

        // Размер и яркость зависят от глубины
        const depthRatio = 1 - s.z / MAX_DEPTH;
        const radius = s.size * depthRatio * 1.8;
        const alpha = depthRatio * depthRatio; // квадратичное нарастание

        if (alpha < 0.02) continue;

        // Streak (линия движения) для близких звёзд
        if (depthRatio > 0.3 && s.prevSx !== 0) {
          const streakAlpha = (depthRatio - 0.3) * 0.6;
          c.beginPath();
          c.moveTo(s.prevSx, s.prevSy);
          c.lineTo(sx, sy);
          c.strokeStyle = s.hue
            ? `hsla(${s.hue}, 60%, 80%, ${streakAlpha * alpha})`
            : `rgba(200, 220, 255, ${streakAlpha * alpha})`;
          c.lineWidth = radius * 0.6;
          c.stroke();
        }

        // Точка звезды
        c.beginPath();
        c.arc(sx, sy, Math.max(radius, 0.3), 0, Math.PI * 2);
        if (s.hue) {
          c.fillStyle = `hsla(${s.hue}, 50%, 85%, ${alpha})`;
        } else {
          c.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        }
        c.fill();

        // Glow для крупных близких звёзд
        if (radius > 1.5) {
          c.beginPath();
          c.arc(sx, sy, radius * 3, 0, Math.PI * 2);
          const g = c.createRadialGradient(sx, sy, 0, sx, sy, radius * 3);
          g.addColorStop(0, `rgba(180, 200, 255, ${alpha * 0.2})`);
          g.addColorStop(1, 'rgba(180, 200, 255, 0)');
          c.fillStyle = g;
          c.fill();
        }

        s.prevSx = sx;
        s.prevSy = sy;
      }

      // ── Кометы ──
      if (Math.random() < COMET_CHANCE && comets.length < MAX_COMETS) {
        comets.push(spawnComet(w, h));
      }

      for (let i = comets.length - 1; i >= 0; i--) {
        const cm = comets[i];
        cm.life++;
        cm.x += cm.vx * (dt / 16);
        cm.y += cm.vy * (dt / 16);

        const lifeRatio = cm.life / cm.maxLife;
        const fade = lifeRatio > 0.7 ? 1 - (lifeRatio - 0.7) / 0.3 : Math.min(lifeRatio * 5, 1);

        // Trail
        cm.trail.unshift({ x: cm.x, y: cm.y, a: fade });
        if (cm.trail.length > 25) cm.trail.length = 25;

        // Draw trail
        for (let t = 1; t < cm.trail.length; t++) {
          const p = cm.trail[t];
          const ta = (1 - t / cm.trail.length) * 0.4 * p.a;
          const ts = cm.size * (1 - t / cm.trail.length) * 0.7;
          c.beginPath();
          c.arc(p.x, p.y, ts, 0, Math.PI * 2);
          c.fillStyle = `rgba(180, 210, 255, ${ta})`;
          c.fill();
        }

        // Head
        c.beginPath();
        c.arc(cm.x, cm.y, cm.size, 0, Math.PI * 2);
        c.fillStyle = `rgba(255, 255, 255, ${fade})`;
        c.fill();

        // Head glow
        c.beginPath();
        c.arc(cm.x, cm.y, cm.size * 4, 0, Math.PI * 2);
        const cg = c.createRadialGradient(cm.x, cm.y, 0, cm.x, cm.y, cm.size * 4);
        cg.addColorStop(0, `rgba(160, 200, 255, ${fade * 0.35})`);
        cg.addColorStop(1, 'rgba(160, 200, 255, 0)');
        c.fillStyle = cg;
        c.fill();

        if (cm.life > cm.maxLife || cm.x < -60 || cm.x > w + 60 || cm.y > h + 60) {
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
    document.addEventListener('visibilitychange', onVisibility);
    window.addEventListener('resize', resize);

    return () => {
      cancelAnimationFrame(rafId);
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* Глубокий космический градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#030812] via-[#0a0e24] to-[#050810]" />

      {/* Далёкие туманности */}
      <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-950/[0.12] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-950/[0.08] blur-[100px]" />
      <div className="absolute top-[40%] right-[5%] w-[25%] h-[25%] rounded-full bg-purple-950/[0.06] blur-[80px]" />

      {/* Canvas — все звёзды + кометы рендерятся здесь */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Глубинный оверлей */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/15" />
    </div>
  );
});

export default SpaceBackground;
