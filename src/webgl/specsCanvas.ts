// Interactive 3D Rotating Architectural Workspace Wireframe (Pine Sage #3d5740 accent)
export function initSpecsCanvas(canvas: HTMLCanvasElement | null): () => void {
  if (!canvas) return () => {};
  const ctx = canvas.getContext('2d');
  if (!ctx) return () => {};

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let angle = 0.35;
  const targetSpeed = 0.0075;
  let hoverBoost = 0;
  let rafId = 0;

  const resize = () => {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const w = Math.floor(canvas.clientWidth * dpr);
    const h = Math.floor(canvas.clientHeight * dpr);
    if (canvas.width !== w || canvas.height !== h) {
      canvas.width = w;
      canvas.height = h;
    }
  };

  const onEnter = () => {
    hoverBoost = 0.016;
  };
  const onLeave = () => {
    hoverBoost = 0;
  };

  const parent = canvas.parentElement;
  parent?.addEventListener('pointerenter', onEnter);
  parent?.addEventListener('pointerleave', onLeave);
  window.addEventListener('resize', resize, { passive: true });
  resize();

  // Stacked 3D modular system layers representing SoloBiz OS modules
  const layers = [
    { y: -0.7, w: 0.72, d: 0.5, accent: false },
    { y: -0.35, w: 0.84, d: 0.56, accent: false },
    { y: 0.0, w: 0.92, d: 0.62, accent: true },
    { y: 0.35, w: 0.84, d: 0.56, accent: false },
    { y: 0.7, w: 0.68, d: 0.46, accent: true },
  ];

  const draw = () => {
    resize();
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    const strokeMain = 'rgba(32, 32, 32, 0.22)';
    const strokeAccent = 'rgba(61, 87, 64, 0.88)';
    const fillAccent = 'rgba(61, 87, 64, 0.08)';

    const cx = w * 0.55;
    const cy = h * 0.5;
    const scale = Math.min(w, h) * 0.36;

    if (!prefersReduced) {
      angle += targetSpeed + hoverBoost;
    }

    const cosA = Math.cos(angle);
    const sinA = Math.sin(angle);
    const tilt = 0.42;

    const project = (x: number, y: number, z: number) => {
      const rx = x * cosA - z * sinA;
      const rz = x * sinA + z * cosA;
      return {
        px: cx + rx * scale,
        py: cy + y * scale * 0.65 + rz * scale * tilt,
      };
    };

    ctx.lineWidth = Math.max(1.2, w / 440);

    // Vertical spine axes
    const corners = [
      [-0.5, -0.5],
      [0.5, -0.5],
      [0.5, 0.5],
      [-0.5, 0.5],
    ];
    for (const [kx, kz] of corners) {
      ctx.beginPath();
      ctx.strokeStyle = strokeMain;
      const top = project(kx * 0.72, -0.7, kz * 0.5);
      const bot = project(kx * 0.68, 0.7, kz * 0.46);
      ctx.moveTo(top.px, top.py);
      ctx.lineTo(bot.px, bot.py);
      ctx.stroke();
    }

    // Floating 3D workspace planes
    for (const layer of layers) {
      const hw = layer.w * 0.5;
      const hd = layer.d * 0.5;
      const pts = [
        project(-hw, layer.y, -hd),
        project(hw, layer.y, -hd),
        project(hw, layer.y, hd),
        project(-hw, layer.y, hd),
      ];

      ctx.beginPath();
      ctx.moveTo(pts[0].px, pts[0].py);
      for (let i = 1; i < pts.length; i++) {
        ctx.lineTo(pts[i].px, pts[i].py);
      }
      ctx.closePath();

      if (layer.accent) {
        ctx.fillStyle = fillAccent;
        ctx.fill();
        ctx.strokeStyle = strokeAccent;
      } else {
        ctx.strokeStyle = strokeMain;
      }
      ctx.stroke();
    }

    if (!prefersReduced) {
      rafId = requestAnimationFrame(draw);
    }
  };

  rafId = requestAnimationFrame(draw);

  return () => {
    cancelAnimationFrame(rafId);
    parent?.removeEventListener('pointerenter', onEnter);
    parent?.removeEventListener('pointerleave', onLeave);
    window.removeEventListener('resize', resize);
  };
}
