import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 35, rows: 41 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[6,22],[6,21],[7,21],[7,20],[6,20],[5,20],[4,20],[4,19],[4,18],[4,17],[3,17]]},
  {"id":"a1","pts":[[7,29],[6,29],[5,29],[4,29],[4,28],[4,27],[3,27]]},
  {"id":"a2","pts":[[3,18],[3,19],[3,20],[3,21],[3,22],[3,23],[3,24],[3,25],[3,26]]},
  {"id":"a3","pts":[[6,18],[6,17],[6,16],[5,16],[4,16]]},
  {"id":"a4","pts":[[9,32],[8,32],[7,32],[6,32],[6,31],[5,31]]},
  {"id":"a5","pts":[[12,11],[11,11],[10,11],[9,11],[9,12],[8,12],[7,12]]},
  {"id":"a6","pts":[[7,34],[8,34],[9,34],[9,33],[8,33],[7,33]]},
  {"id":"a7","pts":[[9,35],[8,35],[7,35]]},
  {"id":"a8","pts":[[13,14],[13,13],[13,12],[12,12],[12,13],[12,14],[12,15],[12,16],[12,17],[12,18],[11,18],[11,17],[11,16],[11,15],[11,14],[11,13],[11,12],[10,12]]},
  {"id":"a9","pts":[[10,35],[10,34],[10,33],[10,32],[10,31],[10,30],[10,29],[10,28],[10,27],[11,27],[12,27],[13,27],[14,27],[15,27],[15,28],[15,29],[15,30],[15,31],[15,32],[15,33],[15,34],[16,34],[17,34],[18,34],[19,34],[20,34],[20,33],[20,32],[20,31],[20,30],[20,29],[20,28],[20,27],[21,27],[22,27],[23,27],[24,27],[25,27],[25,28],[25,29],[25,30],[25,31],[25,32],[25,33],[25,34],[26,34],[27,34],[28,34],[29,34]]},
  {"id":"a10","pts":[[16,12],[15,12],[15,13],[15,14],[14,14],[14,13],[14,12]]},
  {"id":"a11","pts":[[21,7],[21,6],[21,5],[20,5],[19,5],[19,6],[19,7],[19,8],[18,8],[17,8]]},
  {"id":"a12","pts":[[17,11],[17,10],[18,10],[18,9],[17,9]]},
  {"id":"a13","pts":[[18,7],[18,6]]},
  {"id":"a14","pts":[[21,4],[20,4]]},
  {"id":"a15","pts":[[22,3],[22,4],[22,5],[22,6],[22,7],[22,8],[21,8],[20,8],[20,7]]},
  {"id":"a16","pts":[[20,35],[19,35],[18,35],[17,35],[16,35],[16,36],[17,36],[18,36],[19,36],[20,36],[21,36],[22,36],[23,36],[24,36],[25,36],[26,36],[27,36]]},
  {"id":"a17","pts":[[20,37],[21,37],[22,37],[23,37],[24,37],[25,37],[26,37]]},
  {"id":"a18","pts":[[21,10],[20,10],[19,10],[19,9],[20,9],[21,9],[22,9]]},
  {"id":"a19","pts":[[21,11],[22,11],[23,11],[24,11],[25,11],[26,11]]},
  {"id":"a20","pts":[[22,13],[23,13],[24,13],[25,13],[26,13],[27,13],[28,13],[28,12],[27,12],[26,12],[25,12],[24,12],[23,12],[22,12],[21,12],[20,12],[19,12],[18,12],[18,11],[19,11]]},
  {"id":"a21","pts":[[29,15],[30,15],[30,14],[29,14],[28,14],[27,14],[26,14],[25,14],[24,14],[23,14],[22,14],[21,14],[20,14],[19,14],[18,14],[17,14],[16,14],[16,13],[17,13],[18,13],[19,13],[20,13],[21,13]]},
  {"id":"a22","pts":[[4,15],[5,15],[6,15],[6,14],[6,13],[7,13],[8,13],[9,13],[10,13]]},
  {"id":"a23","pts":[[5,21],[5,22],[4,22],[4,21]]},
  {"id":"a24","pts":[[5,25],[4,25],[4,26],[5,26],[6,26],[6,25],[6,24],[5,24],[4,24],[4,23]]},
  {"id":"a25","pts":[[7,14],[7,15],[7,16],[7,17],[7,18],[7,19],[6,19],[5,19],[5,18]]},
  {"id":"a26","pts":[[8,27],[8,26],[8,25],[7,25],[7,24],[7,23],[6,23],[5,23]]},
  {"id":"a27","pts":[[8,30],[8,29],[8,28],[7,28],[6,28],[5,28],[5,27],[6,27],[7,27],[7,26]]},
  {"id":"a28","pts":[[9,21],[9,20],[9,19],[9,18],[9,17],[9,16],[9,15],[9,14]]},
  {"id":"a29","pts":[[19,15],[19,16],[19,17],[19,18],[19,19],[19,20],[19,21],[20,21],[21,21],[22,21],[22,20],[22,19],[22,18],[22,17],[22,16],[22,15]]},
  {"id":"a30","pts":[[24,28],[24,29],[24,30],[23,30],[22,30],[22,31],[21,31],[21,32],[21,33],[21,34],[21,35]]},
  {"id":"a31","pts":[[21,28],[22,28],[23,28],[23,29],[22,29],[21,29],[21,30]]},
  {"id":"a32","pts":[[26,35],[27,35],[28,35]]},
  {"id":"a33","pts":[[22,32],[22,33],[22,34],[22,35],[23,35],[23,34],[23,33],[23,32],[23,31],[24,31],[24,32],[24,33],[24,34],[24,35],[25,35]]},
  {"id":"a34","pts":[[9,36],[10,36],[11,36],[12,36],[12,35],[12,34],[13,34],[14,34]]},
  {"id":"a35","pts":[[30,31],[30,32],[29,32],[29,33],[28,33],[27,33],[27,32],[27,31],[26,31],[26,32],[26,33]]},
  {"id":"a36","pts":[[19,29],[19,30],[18,30],[17,30],[16,30],[16,31],[17,31],[18,31],[19,31],[19,32],[18,32],[17,32],[16,32],[16,33],[17,33],[18,33],[19,33]]},
  {"id":"a37","pts":[[27,22],[27,23],[27,24],[26,24],[26,25],[27,25],[28,25]]},
  {"id":"a38","pts":[[23,26],[24,26],[25,26],[25,25],[24,25],[23,25],[23,24],[24,24],[25,24]]},
  {"id":"a39","pts":[[28,28],[29,28],[30,28],[31,28],[31,29],[31,30],[30,30],[29,30],[29,31]]},
  {"id":"a40","pts":[[28,26],[27,26],[26,26],[26,27],[26,28],[26,29],[26,30],[27,30],[28,30]]},
  {"id":"a41","pts":[[28,31],[28,32]]},
  {"id":"a42","pts":[[29,26],[29,27],[28,27],[27,27],[27,28],[27,29],[28,29],[29,29],[30,29]]},
  {"id":"a43","pts":[[8,14],[8,15],[8,16],[8,17],[8,18],[8,19],[8,20],[8,21],[8,22],[9,22],[10,22],[11,22],[12,22],[13,22],[13,21],[13,20],[13,19],[13,18],[13,17],[13,16],[13,15],[14,15],[15,15],[16,15],[17,15],[18,15],[18,16],[18,17],[18,18],[18,19],[18,20],[18,21],[18,22],[19,22],[20,22],[21,22],[22,22],[23,22],[23,21],[23,20],[23,19],[23,18],[23,17],[23,16],[23,15],[24,15],[25,15],[26,15],[27,15],[28,15],[28,16],[28,17],[28,18]]},
  {"id":"a44","pts":[[12,24],[11,24],[10,24],[10,25],[10,26],[9,26],[9,25],[9,24],[8,24],[8,23]]},
  {"id":"a45","pts":[[9,23],[10,23],[11,23],[12,23],[13,23],[13,24],[13,25],[12,25],[11,25]]},
  {"id":"a46","pts":[[4,30],[5,30],[6,30],[7,30],[7,31],[8,31],[9,31],[9,30],[9,29],[9,28],[9,27]]},
  {"id":"a47","pts":[[12,21],[11,21],[10,21],[10,20],[11,20],[12,20],[12,19],[11,19],[10,19]]},
  {"id":"a48","pts":[[16,26],[16,25],[16,24],[16,23],[16,22],[16,21],[16,20],[16,19],[15,19],[15,20],[15,21],[15,22],[15,23],[15,24],[15,25],[15,26],[14,26],[13,26],[12,26],[11,26]]},
  {"id":"a49","pts":[[14,28],[13,28],[12,28],[12,29],[13,29],[14,29],[14,30],[13,30],[12,30],[11,30]]},
  {"id":"a50","pts":[[12,33],[13,33],[14,33],[14,32],[14,31],[13,31],[12,31],[11,31]]},
  {"id":"a51","pts":[[11,35],[11,34],[11,33],[11,32],[12,32],[13,32]]},
  {"id":"a52","pts":[[14,36],[13,36],[13,35]]},
  {"id":"a53","pts":[[10,37],[11,37],[12,37],[13,37],[14,37],[15,37],[15,36],[15,35],[14,35]]},
  {"id":"a54","pts":[[10,14],[10,15],[10,16],[10,17],[10,18]]},
  {"id":"a55","pts":[[11,28],[11,29]]},
  {"id":"a56","pts":[[14,24],[14,25]]},
  {"id":"a57","pts":[[17,25],[17,24],[17,23],[17,22],[17,21],[17,20],[17,19],[17,18],[17,17],[17,16],[16,16],[15,16],[14,16],[14,17],[14,18],[14,19],[14,20],[14,21],[14,22],[14,23]]},
  {"id":"a58","pts":[[15,17],[15,18],[16,18],[16,17]]},
  {"id":"a59","pts":[[19,27],[18,27],[18,28],[18,29],[17,29],[16,29],[16,28],[16,27]]},
  {"id":"a60","pts":[[19,25],[19,24],[20,24],[20,25],[21,25],[21,24],[21,23],[20,23],[19,23],[18,23]]},
  {"id":"a61","pts":[[17,28],[17,27],[17,26],[18,26],[18,25],[18,24]]},
  {"id":"a62","pts":[[24,22],[24,23],[23,23],[22,23],[22,24],[22,25],[22,26],[21,26],[20,26],[19,26]]},
  {"id":"a63","pts":[[21,16],[21,15],[20,15]]},
  {"id":"a64","pts":[[20,16],[20,17],[20,18],[20,19],[20,20],[21,20],[21,19],[21,18],[21,17]]},
  {"id":"a65","pts":[[24,21],[24,20],[24,19],[25,19],[26,19],[27,19],[27,20],[27,21]]},
  {"id":"a66","pts":[[25,17],[26,17],[27,17]]},
  {"id":"a67","pts":[[27,16],[26,16],[25,16],[24,16],[24,17],[24,18],[25,18],[26,18],[27,18]]},
  {"id":"a68","pts":[[23,8],[23,7],[23,6],[23,5],[23,4],[23,3],[24,3],[24,4],[24,5],[24,6]]},
  {"id":"a69","pts":[[25,20],[25,21],[25,22],[25,23],[26,23],[26,22],[26,21],[26,20]]}
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [def.pts[0].slice() as [number, number]];
  for (let i = 1; i < def.pts.length; i++) {
    let [c, r] = def.pts[i - 1];
    const [c2, r2] = def.pts[i];
    const dc = Math.sign(c2 - c);
    const dr = Math.sign(r2 - r);
    let guard = 0;
    while (c !== c2 || r !== r2) {
      c += dc;
      r += dr;
      out.push([c, r]);
      if (++guard > 500) break;
    }
  }
  return out;
}

RAW_ARROWS.forEach((a) => {
  a.cells = cellsOf(a);
});

interface ArrowPath {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

interface ArrowRuntime {
  def: ArrowDef;
  path: ArrowPath;
  g: SVGGElement;
  line: SVGPolylineElement;
  hitArea: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

export default function Level40() {
  const { state, dispatch, showRewardedAd } = useStore();
  const {
    zoomLevel,
    isPanMode,
    togglePanMode,
    isPanned,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn,
    canZoomOut,
    boardRef,
    boardStyle,
  } = useZoom();

  const currentLevelId = state.game?.levelId || 40;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});
  const boardRevisionRef = useRef(0);

  const [mistakes, setMistakes] = useState(0);
  const [remainingCount, setRemainingCount] = useState(RAW_ARROWS.length);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 850);
  }, []);

  const getAudioContext = () => {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!audioCtxRef.current && AudioCtx) {
      audioCtxRef.current = new AudioCtx();
    }
    if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
      audioCtxRef.current.resume();
    }
    return audioCtxRef.current;
  };

  const playTapSound = (ok = true) => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      if (ok) {
        osc.frequency.setValueAtTime(520, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(340, ctx.currentTime + 0.045);
        gain.gain.setValueAtTime(0.045, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.06);
      } else {
        osc.frequency.setValueAtTime(200, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(110, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.04, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.09);
      }
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.095);
    } catch {
      /* ignore audio error */
    }
  };

  const playFailSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.32);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.34);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.35);
    } catch {
      /* ignore audio error */
    }
  };

  const triggerConfetti = () => {
    const app = appRef.current;
    if (!app) return;
    const colors = ['#5b6cf0', '#2b3160', '#aab3f2', '#e3e3ea', '#8f9bf5'];
    const r = app.getBoundingClientRect();
    const origins = [
      { x: r.width * 0.06, y: r.height * 0.98, dx: 1 },
      { x: r.width * 0.94, y: r.height * 0.98, dx: -1 },
    ];
    const parts: Array<{
      el: HTMLElement;
      x: number;
      y: number;
      vx: number;
      vy: number;
      rot: number;
      vr: number;
      t: number;
      life: number;
    }> = [];

    origins.forEach((o) => {
      for (let i = 0; i < 55; i++) {
        const el = document.createElement('i');
        el.className = 'lvl40-confetti';
        el.style.background = colors[i % colors.length];
        app.appendChild(el);
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
    const step = (now: number) => {
      const dt = Math.min(0.032, (now - last) / 1000);
      last = now;
      let alive = false;
      parts.forEach((p) => {
        p.t += dt;
        if (p.t > p.life) {
          if (p.el.isConnected) p.el.remove();
          return;
        }
        alive = true;
        p.vy += 1500 * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        p.rot += p.vr * dt;
        p.el.style.opacity = String(p.t > p.life - 0.4 ? (p.life - p.t) / 0.4 : 1);
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const makePath = (def: ArrowDef): ArrowPath => {
    const pts = def.pts.map(([c, r]) => P(c, r));
    const arcs = [0];
    let L = 0;
    for (let i = 1; i < pts.length; i++) {
      L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
      arcs.push(L);
    }
    const [ex, ey] = pts[pts.length - 1];
    const [px, py] = pts[pts.length - 2];
    const dl = Math.hypot(ex - px, ey - py) || 1;
    const dir: [number, number] = [(ex - px) / dl, (ey - py) / dl];
    return { pts, arcs, L, dir };
  };

  const pointAt = (path: ArrowPath, p: number): [number, number] => {
    const { pts, arcs, L, dir } = path;
    if (p >= L) {
      const [ex, ey] = pts[pts.length - 1];
      return [ex + dir[0] * (p - L), ey + dir[1] * (p - L)];
    }
    if (p <= 0) return pts[0];
    let i = 1;
    while (arcs[i] < p) i++;
    const t = (p - arcs[i - 1]) / (arcs[i] - arcs[i - 1]);
    return [
      pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
      pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
    ];
  };

  const pulledShape = (path: ArrowPath, s: number): [number, number][] => {
    const { arcs, L } = path;
    const us = [0];
    for (let i = 1; i < arcs.length - 1; i++) {
      const u = arcs[i] - s;
      if (u > 0.01 && u < L - 0.01) us.push(u);
    }
    const ub = L - s;
    if (ub > 0.01 && ub < L - 0.01) us.push(ub);
    us.push(L);
    us.sort((a, b) => a - b);
    const out: [number, number][] = [];
    for (let i = 0; i < us.length; i++) {
      if (i && us[i] - us[i - 1] < 0.01) continue;
      out.push(pointAt(path, us[i] + s));
    }
    return out;
  };

  const drawArrow = (
    line: SVGPolylineElement,
    head: SVGPathElement,
    g: SVGGElement,
    path: ArrowPath,
    s: number,
    op: number,
    hitArea?: SVGPolylineElement
  ) => {
    const shape = pulledShape(path, s);
    const ptsStr = shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    line.setAttribute('points', ptsStr);
    if (hitArea) hitArea.setAttribute('points', ptsStr);
    const [hx, hy] = pointAt(path, path.L + s);
    const ang = (Math.atan2(path.dir[1], path.dir[0]) * 180) / Math.PI;
    head.setAttribute(
      'transform',
      `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`
    );
    g.setAttribute('opacity', op.toFixed(3));
  };

  const cellDir = (def: ArrowDef): [number, number] => {
    const [hc, hr] = def.pts[def.pts.length - 1];
    const [pc, pr] = def.pts[def.pts.length - 2];
    return [Math.sign(hc - pc), Math.sign(hr - pr)];
  };

  const rayCells = (def: ArrowDef): string[] => {
    const [dc, dr] = cellDir(def);
    let [c, r] = def.pts[def.pts.length - 1];
    const out: string[] = [];
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      out.push(`${c},${r}`);
      c += dc;
      r += dr;
    }
    return out;
  };

  const blocked = useCallback((id: string): boolean => {
    const current = arrowsRef.current[id];
    if (!current) return false;
    const def = current.def;
    const ray = new Set(rayCells(def));
    return RAW_ARROWS.some(
      (o) =>
        o.id !== id &&
        !arrowsRef.current[o.id]?.gone &&
        o.cells?.some(([c, r]) => ray.has(`${c},${r}`))
    );
  }, []);

  const gapPx = (id: string): number => {
    const current = arrowsRef.current[id];
    if (!current) return 9999;
    const def = current.def;
    const [dc, dr] = cellDir(def);
    let [c, r] = def.pts[def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        RAW_ARROWS.some(
          (o) =>
            o.id !== id &&
            !arrowsRef.current[o.id]?.gone &&
            o.cells?.some(([cc, rr]) => cc === c && rr === r)
        )
      ) {
        return k * CELL;
      }
      c += dc;
      r += dr;
    }
    return 9999;
  };

  const collide = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    a.busy = true;

    playTapSound(false);

    setMistakes((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        isInputLockedRef.current = true;
        playFailSound();
        showToast('Level Failed! Restarting...');
        setTimeout(() => {
          handleRestart();
        }, 1100);
      }
      return next;
    });

    a.g.classList.add('hit');
    const app = appRef.current;
    if (app) {
      app.classList.remove('shake');
      void app.offsetWidth;
      app.classList.add('shake');
    }

    const gap = gapPx(id);
    const bump = Math.max(14, Math.min(gap === 9999 ? 46 : gap - 10, 46));
    const dur = 520;
    let t0: number | null = null;

    const fr = (now: number) => {
      if (t0 === null) t0 = now;
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);
      drawArrow(a.line, a.head, a.g, a.path, bump * e, 1, a.hitArea);
      if (k < 1) {
        requestAnimationFrame(fr);
      } else {
        a.busy = false;
        a.g.classList.remove('hit');
      }
    };
    requestAnimationFrame(fr);
  };

  const remove = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    clearedRef.current += 1;
    boardRevisionRef.current += 1;
    setRemainingCount(RAW_ARROWS.length - clearedRef.current);

    playTapSound(true);

    a.g.classList.add('fly');
    const L = a.path.L;
    const dist = L + 340;
    const dur = 750 + L * 3.2;
    let t0: number | null = null;
    let dotsShown = false;

    const frame = (now: number) => {
      if (t0 === null) t0 = now;
      const k = Math.min(1, (now - t0) / dur);
      const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
      const s = e * dist;
      const op = k > 0.72 ? Math.max(0, 1 - (k - 0.72) / 0.28) : 1;
      drawArrow(a.line, a.head, a.g, a.path, s, op, a.hitArea);
      if (!dotsShown && s >= L) {
        dotsShown = true;
        a.dots.classList.add('show');
      }
      if (k < 1) {
        requestAnimationFrame(frame);
      } else {
        a.g.style.display = 'none';
        if (clearedRef.current >= RAW_ARROWS.length) {
          setTimeout(() => {
            setIsWon(true);
            triggerConfetti();
            dispatch({ type: 'COMPLETE_LEVEL' });
          }, 420);
        }
      }
    };
    requestAnimationFrame(frame);
  };

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy || isInputLockedRef.current) return;
      if (blocked(id)) {
        collide(id);
        return;
      }
      remove(id);
    },
    [blocked]
  );

  const findSolvableArrow = useCallback((): string | null => {
    for (const def of RAW_ARROWS) {
      const a = arrowsRef.current[def.id];
      if (a && !a.gone && !blocked(def.id)) {
        return def.id;
      }
    }
    return null;
  }, [blocked]);

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    boardRevisionRef.current = 0;
    isInputLockedRef.current = false;
    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);
    setIsWon(false);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl40-dots');
      def.cells?.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '2.6');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl40-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl40-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl40-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '17');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('stroke-linecap', 'round');
      hitArea.setAttribute('stroke-linejoin', 'round');
      hitArea.setAttribute('pointer-events', 'stroke');

      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);

      const handlePointer = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInputLockedRef.current) return;
        tryRemove(def.id);
      };

      g.addEventListener('pointerdown', handlePointer);
      svg.appendChild(g);

      arrowsRef.current[def.id] = {
        def,
        path,
        g,
        line,
        hitArea,
        head,
        dots,
        gone: false,
        busy: false,
        wrongLocked: false,
      };

      drawArrow(line, head, g, path, 0, 1, hitArea);
    });
  }, [tryRemove]);

  useEffect(() => {
    buildBoardRef.current = buildBoard;
  }, [buildBoard]);

  useEffect(() => {
    buildBoard();
  }, [buildBoard]);

  const revealSolvableHint = useCallback(() => {
    const solvableId = findSolvableArrow();
    if (!solvableId) {
      showToast('No free arrows found!');
      return;
    }
    const arrow = arrowsRef.current[solvableId];
    if (arrow) {
      arrow.g.animate(
        [
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.06)',
          },
          { filter: 'drop-shadow(0 0 6px rgba(91,108,243,0.5))', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.06)',
          },
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
        ],
        { duration: 1500, iterations: 1 }
      );
      showToast('Hint: Next Solvable Arrow Highlighted!');
    }
  }, [findSolvableArrow, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    if (!findSolvableArrow()) {
      showToast('All arrows cleared!');
      return;
    }

    showRewardedAd({
      rewardType: 'hint',
      title: 'Free In-Game Hint',
      rewardDescription: 'Reveals Next Solvable Arrow',
      onReward: revealSolvableHint,
    });
  };

  const handleRestart = () => {
    setIsWon(false);
    setMistakes(0);
    isInputLockedRef.current = false;
    buildBoard();
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 41 });
  };

  const handleLevelSelect = () => {
    setIsWon(false);
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl40-stage">
      <div className="lvl40-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl40-topbar">
          <div className="lvl40-btns">
            <button className="lvl40-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl40-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl40-cnt-pill" title="Remaining Arrows">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path
                  d="M3 21 L14 10 M14 10 h-6 M14 10 v6"
                  stroke="currentColor"
                  strokeWidth="2.6"
                  fill="none"
                  strokeLinecap="round"
                />
              </svg>
              {remainingCount}
            </span>
          </div>

          <div className="lvl40-header-center">
            <div className="lvl40-level">Level {currentLevelId}</div>
            <div className="lvl40-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl40-heart ${!isActive ? 'lost' : ''}`}
                    style={{
                      opacity: isActive ? 1 : 0.22,
                      transform: `scale(${isActive ? 1 : 0.82})`,
                    }}
                  >
                    <svg viewBox="0 0 24 24">
                      <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                    </svg>
                  </span>
                );
              })}
            </div>
          </div>

          <button
            className="lvl40-round-btn lvl40-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl40-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl40-boardSvg" viewBox="-14 -14 640 748" />
        </div>

        {/* Controls */}
        <div className="lvl40-controls">
          <ZoomControls
            zoomLevel={zoomLevel}
            onZoomIn={zoomIn}
            onZoomOut={zoomOut}
            onReset={resetZoom}
            canZoomIn={canZoomIn}
            canZoomOut={canZoomOut}
            isPanMode={isPanMode}
            onTogglePanMode={togglePanMode}
            isPanned={isPanned}
          />
          <button className="lvl40-round lvl40-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl40-bulb">
              <span className="lvl40-bolt">ϟ</span>
            </span>
            <span className="lvl40-ad">AD</span>
          </button>
          <button
            className="lvl40-round lvl40-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl40-calc-icon">
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
              <i />
            </span>
          </button>
        </div>

        {/* Win Modal */}
        <div className={`lvl40-win ${isWon ? 'on' : ''}`}>
          <div className="lvl40-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl40-trophy">🏆</div>
            <div className="lvl40-stars">★ ★ ★</div>
            <button className="lvl40-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button
              onClick={() => {
                showRewardedAd({
                  rewardType: 'double_win',
                  title: 'Double Level Coins',
                  rewardDescription: '+40 Bonus Coins',
                  onReward: () => {
                    dispatch({ type: 'ADD_COINS', amount: 40 });
                    showToast('+40 Bonus Coins Claimed!');
                  },
                });
              }}
              style={{
                width: '100%',
                height: 42,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <span>🪙</span>
              <span>Claim 2x Coins (Watch Ad)</span>
            </button>
            <button className="lvl40-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl40-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl40-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
