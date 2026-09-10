/* A tiny, dependency-free ambient field. It keeps the interface alive without
   stealing focus or requiring WebGL, and respects both pause controls and the
   operating system's reduced-motion preference. */
(() => {
  const canvas = document.getElementById('ambientFxCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d', {alpha: true});
  if (!ctx) return;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const finePointer = matchMedia('(hover: hover) and (pointer: fine)');
  let width = 0;
  let height = 0;
  let dpr = 1;
  let frame = 0;
  let last = 0;
  let paused = reduced.matches;
  let pointer = {x: .72, y: .24, active: false};
  const dots = [];
  const dotCount = 48;
  const random = (min, max) => min + Math.random() * (max - min);
  for (let i = 0; i < dotCount; i += 1) dots.push({x: Math.random(), y: Math.random(), r: random(.6, 2.1), v: random(.03, .12), phase: random(0, Math.PI * 2)});

  function resize() {
    dpr = Math.min(globalThis.devicePixelRatio || 1, 2);
    width = innerWidth;
    height = innerHeight;
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  function draw(now) {
    frame = 0;
    if (paused || document.hidden) return;
    const delta = last ? Math.min((now - last) / 1000, .06) : 0;
    last = now;
    ctx.clearRect(0, 0, width, height);
    if (!paused) {
      for (const dot of dots) {
        dot.y -= dot.v * delta;
        if (dot.y < -.04) { dot.y = 1.04; dot.x = Math.random(); }
        const x = dot.x * width + Math.sin(now * .00025 + dot.phase) * 16;
        const y = dot.y * height;
        const alpha = .16 + (Math.sin(now * .001 + dot.phase) + 1) * .07;
        ctx.beginPath();
        ctx.fillStyle = `rgba(166,214,247,${alpha})`;
        ctx.arc(x, y, dot.r, 0, Math.PI * 2);
        ctx.fill();
      }
      const px = pointer.x * width;
      const py = pointer.y * height;
      const halo = ctx.createRadialGradient(px, py, 0, px, py, Math.min(width, height) * .28);
      halo.addColorStop(0, 'rgba(166,214,247,.08)');
      halo.addColorStop(1, 'rgba(166,214,247,0)');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, width, height);
      if (pointer.active) {
        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(now * .00015);
        ctx.strokeStyle = 'rgba(166,214,247,.17)';
        ctx.lineWidth = 1;
        for (const radius of [38, 54]) {
          ctx.beginPath();
          ctx.arc(0, 0, radius, -.7, 1.45);
          ctx.stroke();
        }
        ctx.restore();
      }
    }
    frame = requestAnimationFrame(draw);
  }
  function sync() {
    paused = reduced.matches || document.body.classList.contains('motion-paused');
    canvas.classList.toggle('is-paused', paused);
    if (paused || document.hidden) { cancelAnimationFrame(frame); frame = 0; last = 0; ctx.clearRect(0,0,width,height); }
    else if (!frame) frame = requestAnimationFrame(draw);
  }
  resize();
  sync();
  addEventListener('resize', resize, {passive: true});
  reduced.addEventListener('change', sync);
  addEventListener('space:motion', sync);
  if (finePointer.matches) addEventListener('pointermove', event => {
    pointer = {x: event.clientX / Math.max(1, innerWidth), y: event.clientY / Math.max(1, innerHeight), active: true};
  }, {passive: true});
  addEventListener('pointerleave', () => { pointer.active = false; }, {passive: true});
  document.addEventListener('visibilitychange', sync);
  addEventListener('pagehide', () => cancelAnimationFrame(frame), {once: true});
})();
