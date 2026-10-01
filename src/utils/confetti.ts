// Confetti fountains simulation from user's level 1 implementation
export function triggerConfetti(container: HTMLElement) {
  const colors = ['#5b6cf0', '#2b3160', '#aab3f2', '#e3e3ea', '#8f9bf5'];
  const r = container.getBoundingClientRect();
  const origins = [
    { x: r.width * 0.06, y: r.height * 0.98, dx: 1 },
    { x: r.width * 0.94, y: r.height * 0.98, dx: -1 },
  ];

  interface Particle {
    el: HTMLElement;
    x: number;
    y: number;
    vx: number;
    vy: number;
    rot: number;
    vr: number;
    t: number;
    life: number;
  }

  const parts: Particle[] = [];

  origins.forEach((o) => {
    for (let i = 0; i < 55; i++) {
      const el = document.createElement('i');
      el.className = 'confetti-particle';
      el.style.background = colors[i % colors.length];
      const s = 0.7 + Math.random() * 0.8;
      el.style.transform = `scale(${s})`;
      container.appendChild(el);
      parts.push({
        el,
        x: o.x,
        y: o.y,
        vx: o.dx * (60 + Math.random() * 260) + (Math.random() * 80 - 40),
        vy: -(620 + Math.random() * 620),
        rot: Math.random() * 360,
        vr: Math.random() * 720 - 360,
        t: 0,
        life: 1.6 + Math.random() * 1.1,
      });
    }
  });

  let last = performance.now();
  function step(now: number) {
    const dt = Math.min(0.032, (now - last) / 1000);
    last = now;
    let alive = false;

    parts.forEach((p) => {
      p.t += dt;
      if (p.t > p.life) {
        if (p.el.isConnected) {
          p.el.remove();
        }
        return;
      }
      alive = true;
      p.vy += 1500 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += p.vr * dt;
      const fade = p.t > p.life - 0.4 ? (p.life - p.t) / 0.4 : 1;
      p.el.style.opacity = String(fade);
      p.el.style.left = `${p.x}px`;
      p.el.style.top = `${p.y}px`;
      p.el.style.transform = `rotate(${p.rot}deg)`;
    });

    if (alive) {
      requestAnimationFrame(step);
    }
  }

  requestAnimationFrame(step);
}
