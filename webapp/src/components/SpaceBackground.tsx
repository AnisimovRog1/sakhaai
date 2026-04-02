import { memo, useEffect, useRef } from 'react';

/* ─── Типы объектов на canvas ─── */
interface SpaceObject {
  type: 'comet' | 'satellite';
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  tail: { x: number; y: number }[];
  born: number;
  lifespan: number;
}

function randomBetween(a: number, b: number) {
  return a + Math.random() * (b - a);
}

function spawnComet(w: number, h: number): SpaceObject {
  // Spawn from top or right edge, fly down-left or down
  const fromTop = Math.random() > 0.4;
  const x = fromTop ? randomBetween(w * 0.2, w) : w + 10;
  const y = fromTop ? -10 : randomBetween(0, h * 0.4);
  const angle = fromTop
    ? randomBetween(200, 250) * (Math.PI / 180) // down-left
    : randomBetween(200, 240) * (Math.PI / 180);
  const speed = randomBetween(3, 6);
  return {
    type: 'comet',
    x, y,
    vx: Math.cos(angle) * speed,
    vy: -Math.sin(angle) * speed,
    size: randomBetween(2, 3),
    opacity: randomBetween(0.7, 1),
    tail: [],
    born: 0,
    lifespan: randomBetween(2000, 4000),
  };
}

function spawnSatellite(w: number, h: number): SpaceObject {
  // Slow, straight line across sky
  const fromLeft = Math.random() > 0.5;
  const x = fromLeft ? -10 : w + 10;
  const y = randomBetween(h * 0.05, h * 0.5);
  const speed = randomBetween(0.4, 0.8);
  return {
    type: 'satellite',
    x, y,
    vx: fromLeft ? speed : -speed,
    vy: randomBetween(-0.1, 0.15),
    size: 1.5,
    opacity: randomBetween(0.4, 0.7),
    tail: [],
    born: 0,
    lifespan: randomBetween(10000, 18000),
  };
}

/* ─── Компонент ─── */
const SpaceBackground = memo(function SpaceBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let ctx: CanvasRenderingContext2D | null = null;
    try {
      ctx = canvas.getContext('2d');
    } catch {
      ctx = null;
    }
    if (!ctx) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    let w = 0, h = 0;
    let rafId = 0;
    let paused = false;

    function resize() {
      w = window.innerWidth;
      h = window.innerHeight;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
      canvas.style.width = w + 'px';
      canvas.style.height = h + 'px';
      ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    const objects: SpaceObject[] = [];
    let lastComet = 0;
    let lastSatellite = 0;
    let nextCometDelay = randomBetween(3000, 7000);
    let nextSatDelay = randomBetween(12000, 22000);
    let prevTime = 0;

    function animate(time: number) {
      if (paused) { rafId = requestAnimationFrame(animate); return; }

      const dt = prevTime ? Math.min(time - prevTime, 100) : 16;
      prevTime = time;

      ctx!.clearRect(0, 0, w, h);

      // Spawn comets
      if (time - lastComet > nextCometDelay) {
        objects.push({ ...spawnComet(w, h), born: time });
        lastComet = time;
        nextCometDelay = randomBetween(6000, 12000);
      }

      // Spawn satellites
      if (time - lastSatellite > nextSatDelay) {
        objects.push({ ...spawnSatellite(w, h), born: time });
        lastSatellite = time;
        nextSatDelay = randomBetween(15000, 25000);
      }

      // Update & draw
      for (let i = objects.length - 1; i >= 0; i--) {
        const obj = objects[i];
        const age = time - obj.born;

        // Fade out near end of life
        const fadeOut = age > obj.lifespan * 0.8
          ? 1 - (age - obj.lifespan * 0.8) / (obj.lifespan * 0.2)
          : 1;

        if (age > obj.lifespan || obj.x < -50 || obj.x > w + 50 || obj.y < -50 || obj.y > h + 50) {
          objects.splice(i, 1);
          continue;
        }

        const factor = dt / 16;
        obj.x += obj.vx * factor;
        obj.y += obj.vy * factor;

        if (obj.type === 'comet') {
          // Save tail positions
          obj.tail.unshift({ x: obj.x, y: obj.y });
          if (obj.tail.length > 18) obj.tail.length = 18;

          // Draw tail
          for (let t = 1; t < obj.tail.length; t++) {
            const p = obj.tail[t];
            const alpha = (1 - t / obj.tail.length) * 0.5 * obj.opacity * fadeOut;
            const sz = obj.size * (1 - t / obj.tail.length) * 0.8;
            ctx!.beginPath();
            ctx!.arc(p.x, p.y, sz, 0, Math.PI * 2);
            ctx!.fillStyle = `rgba(200, 220, 255, ${alpha})`;
            ctx!.fill();
          }

          // Draw head with glow
          const headAlpha = obj.opacity * fadeOut;
          ctx!.beginPath();
          ctx!.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 255, 255, ${headAlpha})`;
          ctx!.fill();

          // Glow
          ctx!.beginPath();
          ctx!.arc(obj.x, obj.y, obj.size * 3, 0, Math.PI * 2);
          const glow = ctx!.createRadialGradient(obj.x, obj.y, 0, obj.x, obj.y, obj.size * 3);
          glow.addColorStop(0, `rgba(180, 200, 255, ${headAlpha * 0.4})`);
          glow.addColorStop(1, 'rgba(180, 200, 255, 0)');
          ctx!.fillStyle = glow;
          ctx!.fill();

        } else {
          // Satellite — simple blinking dot
          const blink = 0.5 + 0.5 * Math.sin(time * 0.003 + obj.born);
          const alpha = obj.opacity * fadeOut * blink;
          ctx!.beginPath();
          ctx!.arc(obj.x, obj.y, obj.size, 0, Math.PI * 2);
          ctx!.fillStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx!.fill();
        }
      }

      // Cap active objects
      while (objects.length > 4) objects.shift();

      rafId = requestAnimationFrame(animate);
    }

    rafId = requestAnimationFrame(animate);

    // Pause when hidden
    function onVisibility() {
      paused = document.hidden;
      if (!paused) prevTime = 0; // reset dt
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
      {/* Космический градиент */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#050a18] via-[#0c0f2e] to-[#060818]" />

      {/* Далёкие туманности (glow) */}
      <div className="absolute top-[-15%] left-[-5%] w-[50%] h-[50%] rounded-full bg-blue-900/[0.08] blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[45%] h-[45%] rounded-full bg-indigo-800/[0.06] blur-[100px]" />
      <div className="absolute top-[30%] right-[10%] w-[30%] h-[30%] rounded-full bg-violet-900/[0.05] blur-[80px]" />

      {/* CSS звёзды — 3 слоя с parallax */}
      <div className="stars-small" />
      <div className="stars-medium" />
      <div className="stars-large" />

      {/* Canvas для комет и спутников */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 pointer-events-none"
      />

      {/* Оверлей для глубины */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
    </div>
  );
});

export default SpaceBackground;
