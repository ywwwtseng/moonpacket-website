import { useEffect, useRef } from 'react';

export default function RedPacketAnimation() {
  const ref = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = ref.current!;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const ctx = canvas.getContext('2d')!;
    let raf = 0;
    let running = true;

    type Packet = {
      x: number; y: number; s: number; vx: number; vy: number; r: number; vr: number; d: number; grabbed?: boolean;
    };
    const packets: Packet[] = [];

    function spawnPackets(width: number, height: number) {
      packets.length = 0;
      const count = Math.min(48, Math.max(18, Math.round((width * height) / 16000)));
      for (let i = 0; i < count; i++) {
        const d = Math.random(); // depth: 0 near, 1 far
        const near = 1 - d;
        packets.push({
          x: width * 0.25 + Math.random() * width * 0.70,
          y: -Math.random() * height * 0.6,
          s: Math.min(2.6, (0.3 + Math.random() * 0.4) + near * 1.4), // 近处更大更明显
          // 初速度几乎垂直向下，水平速度极小
          vx: (Math.random() - 0.5) * 0.12 * (1 - d),
          vy: (0.4 + Math.random() * 0.6) + near * 1.0,
          r: Math.random() * Math.PI,
          vr: (Math.random() - 0.5) * 0.04,
          d,
        });
      }
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      const width = Math.max(1, rect.width);
      const height = Math.max(1, rect.height);
      canvas.width = Math.floor(width * dpr);
      canvas.height = Math.floor(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      if (packets.length === 0) spawnPackets(width, height);
    }

    function drawPacket(x: number, y: number, s: number, r: number, depth: number, width: number) {
      const w = 24 * s;
      const h = 30 * s;
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(r);
      // depth-based alpha and slight left-side fade
      const baseAlpha = 0.2 + (1 - depth) * 0.8; // 近处几乎不透明，远处更淡
      const leftFade = 0.6 + 0.4 * Math.min(1, Math.max(0, x / Math.max(1, width))); // 越靠左越淡
      ctx.globalAlpha = baseAlpha * leftFade;

      // optional soft shadow for near packets
      if (depth < 0.35) {
        ctx.shadowColor = 'rgba(0,0,0,.18)';
        ctx.shadowBlur = 8 * (1 - depth);
        ctx.shadowOffsetY = 2;
      }

      // envelope body
      ctx.fillStyle = '#E32521';
      ctx.strokeStyle = 'rgba(0,0,0,.15)';
      ctx.lineWidth = 1;
      roundRect(ctx, -w / 2, -h / 2, w, h, 4 * s);
      ctx.fill();
      ctx.stroke();
      // flap
      ctx.beginPath();
      ctx.moveTo(-w / 2, -h / 2);
      ctx.lineTo(0, -h / 2 + 8 * s);
      ctx.lineTo(w / 2, -h / 2);
      ctx.closePath();
      ctx.fillStyle = '#FFBA00';
      ctx.fill();
      ctx.restore();
    }

    function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
      c.beginPath();
      c.moveTo(x + r, y);
      c.arcTo(x + w, y, x + w, y + h, r);
      c.arcTo(x + w, y + h, x, y + h, r);
      c.arcTo(x, y + h, x, y, r);
      c.arcTo(x, y, x + w, y, r);
      c.closePath();
    }

    // simple physics params
    const gravity = 0.06; // px/frame^2
    const airY = 0.995; // vertical air drag
    const airX = 0.92; // stronger horizontal damping → 更小漂移
    let windPhase = Math.random() * Math.PI * 2;
    function wind(t: number) {
      // very gentle wind; keep motion mostly vertical
      return Math.sin(t * 0.6 + windPhase) * 0.01; // amplitude reduced
    }

    function tick() {
      if (!running) return;
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      // draw far → near for更好的层次
      packets.sort((a, b) => b.d - a.d);
      const t = performance.now() / 1000;
      packets.forEach((p) => {
        if (!p.grabbed) {
          // physics integration
          p.vx += wind(t) * (0.3 + (1 - p.d) * 0.4); // much smaller wind effect
          p.vy += gravity * (0.6 + (1 - p.d) * 0.8);
          // stronger damping on horizontal to避免左右漂移
          p.vx *= airX; p.vy *= airY;
          // clamp horizontal speed
          if (p.vx > 0.6) p.vx = 0.6; else if (p.vx < -0.6) p.vx = -0.6;
          p.x += p.vx; p.y += p.vy;
          p.r += p.vy * 0.01 + p.vr;
        }
        if (p.y - 20 > height) {
          p.y = -Math.random() * 80;
          p.x = width * 0.25 + Math.random() * width * 0.70;
          p.vx = (Math.random() - 0.5) * 0.5;
          p.vy = 0.4 + Math.random() * 0.6;
        }
        drawPacket(p.x, p.y, p.s, p.r, p.d, width);
      });
      raf = requestAnimationFrame(tick);
    }

    // interaction: click/drag to grab packets
    let dragging: Packet | null = null;
    let offsetX = 0, offsetY = 0;
    function findPacket(mx: number, my: number): Packet | null {
      // iterate from near to far to pick top-most
      for (let i = 0; i < packets.length; i++) {
        const p = packets[i];
        const w = 24 * p.s, h = 30 * p.s;
        // rough AABB hit (ignore rotation for speed)
        if (Math.abs(mx - p.x) <= w * 0.6 && Math.abs(my - p.y) <= h * 0.6) {
          return p;
        }
      }
      return null;
    }
    function onDown(e: MouseEvent) {
      const rect = canvas.getBoundingClientRect();
      const mx = (e.clientX - rect.left);
      const my = (e.clientY - rect.top);
      const p = findPacket(mx, my);
      if (p) {
        dragging = p;
        p.grabbed = true;
        // slight pop/enlarge effect
        p.s *= 1.08;
        offsetX = mx - p.x; offsetY = my - p.y;
      }
    }
    function onMove(e: MouseEvent) {
      if (!dragging) return;
      const rect = canvas.getBoundingClientRect();
      dragging.x = (e.clientX - rect.left) - offsetX;
      dragging.y = (e.clientY - rect.top) - offsetY;
      // damp velocities while dragging
      dragging.vx *= 0.8; dragging.vy *= 0.8;
    }
    function onUp() {
      if (dragging) {
        dragging.grabbed = false;
        dragging = null;
      }
    }

    const ro = new ResizeObserver(resize);
    ro.observe(canvas);
    resize();
    // enable pointer interactions (limit to this canvas area)
    canvas.style.pointerEvents = 'auto';
    canvas.addEventListener('mousedown', onDown);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    tick();
    return () => {
      running = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener('mousedown', onDown);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }} aria-hidden="true">
      <canvas ref={ref} style={{ width: '100%', height: '100%', display: 'block' }} />
    </div>
  );
}


