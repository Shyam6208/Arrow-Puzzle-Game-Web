import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 37, rows: 35 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[2,11],[3,11],[3,12],[3,13],[3,14],[4,14],[5,14],[6,14],[7,14],[7,15],[7,16],[7,17],[7,18],[6,18],[5,18],[4,18]]},
  {"id":"a1","pts":[[6,3],[5,3],[4,3],[3,3]]},
  {"id":"a2","pts":[[6,17],[6,16],[6,15],[5,15],[4,15],[3,15],[3,16]]},
  {"id":"a3","pts":[[5,16],[4,16]]},
  {"id":"a4","pts":[[5,17],[4,17]]},
  {"id":"a5","pts":[[4,8],[4,9],[4,10],[4,11],[4,12]]},
  {"id":"a6","pts":[[4,5],[4,6],[4,7]]},
  {"id":"a7","pts":[[7,22],[8,22],[8,21],[8,20],[8,19],[8,18],[8,17],[8,16],[8,15],[8,14],[8,13],[7,13],[6,13],[6,12],[6,11],[6,10],[6,9],[6,8],[6,7],[6,6],[6,5],[5,5],[5,6],[5,7],[5,8],[5,9],[5,10],[5,11],[5,12],[5,13]]},
  {"id":"a8","pts":[[7,20],[7,19],[6,19]]},
  {"id":"a9","pts":[[10,30],[10,29],[10,28],[10,27],[10,26],[10,25],[10,24],[10,23],[10,22],[10,21],[10,20],[10,19],[10,18],[10,17],[10,16],[10,15],[10,14],[10,13],[10,12],[10,11],[9,11],[8,11],[7,11]]},
  {"id":"a10","pts":[[8,12],[7,12]]},
  {"id":"a11","pts":[[9,30],[9,29],[9,28],[9,27],[8,27],[7,27]]},
  {"id":"a12","pts":[[8,10],[9,10],[10,10],[10,9],[10,8],[10,7]]},
  {"id":"a13","pts":[[8,28],[8,29]]},
  {"id":"a14","pts":[[16,12],[15,12],[14,12],[13,12],[12,12],[12,11],[12,10],[12,9],[12,8]]},
  {"id":"a15","pts":[[12,15],[12,14],[12,13]]},
  {"id":"a16","pts":[[11,7],[11,8],[11,9],[11,10],[11,11],[11,12],[11,13],[11,14],[11,15],[11,16],[11,17],[11,18],[11,19],[11,20],[11,21],[11,22],[11,23],[11,24],[11,25],[11,26],[11,27],[11,28],[11,29],[11,30],[11,31],[12,31],[12,30],[12,29],[12,28],[12,27],[12,26],[12,25],[12,24],[12,23],[12,22],[12,21],[12,20],[12,19],[12,18],[12,17],[12,16]]},
  {"id":"a17","pts":[[14,25],[14,26],[14,27],[14,28],[14,29],[13,29],[13,28],[13,27],[13,26],[13,25],[13,24],[14,24],[15,24],[15,25],[15,26],[15,27],[15,28],[15,29],[15,30],[14,30],[13,30]]},
  {"id":"a18","pts":[[16,27],[16,28],[16,29]]},
  {"id":"a19","pts":[[17,18],[18,18],[19,18],[20,18],[21,18],[22,18],[23,18],[24,18],[25,18],[26,18],[26,17],[26,16],[27,16],[27,15],[27,14],[27,13],[27,12],[27,11],[27,10],[27,9],[27,8],[27,7],[27,6]]},
  {"id":"a20","pts":[[22,10],[22,11],[22,12],[22,13],[23,13],[23,12],[23,11],[23,10],[23,9],[24,9],[24,10],[24,11],[24,12],[24,13],[24,14],[23,14],[22,14],[21,14],[21,13],[21,12],[21,11]]},
  {"id":"a21","pts":[[25,31],[24,31]]},
  {"id":"a22","pts":[[26,14],[26,13],[26,12],[26,11],[26,10],[26,9],[26,8],[26,7],[26,6]]},
  {"id":"a23","pts":[[27,18],[27,17]]},
  {"id":"a24","pts":[[28,6],[28,5],[28,4]]},
  {"id":"a25","pts":[[17,19],[18,19],[19,19],[20,19],[21,19],[22,19],[23,19],[24,19],[25,19],[26,19],[27,19],[28,19],[28,18],[28,17],[28,16],[28,15],[28,14],[28,13],[28,12],[28,11],[28,10],[28,9],[28,8],[28,7]]},
  {"id":"a26","pts":[[19,27],[19,26],[20,26],[20,27],[20,28],[20,29],[21,29],[22,29],[23,29],[24,29],[25,29],[26,29],[26,28],[26,27],[26,26],[26,25],[26,24],[26,23],[26,22],[26,21],[26,20]]},
  {"id":"a27","pts":[[23,28],[22,28],[21,28]]},
  {"id":"a28","pts":[[25,28],[24,28]]},
  {"id":"a29","pts":[[30,12],[29,12],[29,11],[29,10],[29,9],[29,8],[29,7],[29,6],[29,5]]},
  {"id":"a30","pts":[[29,14],[29,13]]},
  {"id":"a31","pts":[[21,30],[22,30],[23,30],[24,30],[25,30],[26,30],[27,30],[27,29],[27,28],[27,27],[27,26],[27,25],[27,24],[27,23],[27,22],[27,21],[27,20],[28,20],[29,20],[29,19],[29,18],[29,17],[29,16],[29,15]]},
  {"id":"a32","pts":[[24,21],[25,21]]},
  {"id":"a33","pts":[[18,21],[19,21],[20,21],[21,21],[22,21],[23,21]]},
  {"id":"a34","pts":[[28,27],[28,26],[28,25],[28,24],[28,23],[28,22]]},
  {"id":"a35","pts":[[29,22],[29,23],[29,24],[29,25],[29,26],[29,27],[29,28],[28,28]]},
  {"id":"a36","pts":[[25,20],[24,20],[23,20],[22,20],[21,20],[20,20],[19,20],[18,20],[17,20],[17,21],[17,22],[17,23],[17,24],[18,24],[18,23],[18,22],[19,22],[20,22],[21,22],[22,22],[23,22],[24,22],[25,22]]},
  {"id":"a37","pts":[[30,26],[30,27]]},
  {"id":"a38","pts":[[23,26],[24,26]]},
  {"id":"a39","pts":[[25,27],[24,27],[23,27],[22,27],[21,27],[21,26],[22,26]]},
  {"id":"a40","pts":[[16,26],[17,26]]},
  {"id":"a41","pts":[[9,12],[9,13],[9,14],[9,15],[9,16],[9,17],[9,18],[9,19],[9,20],[9,21],[9,22],[9,23],[8,23],[7,23],[6,23],[6,24],[6,25],[6,26],[7,26],[8,26],[9,26]]},
  {"id":"a42","pts":[[7,25],[7,24],[8,24],[8,25]]},
  {"id":"a43","pts":[[2,5],[2,6],[2,7],[2,8],[2,9],[2,10],[3,10],[3,9],[3,8],[3,7],[3,6],[3,5],[3,4],[4,4],[5,4],[6,4],[7,4],[7,5],[7,6],[7,7],[7,8],[7,9],[7,10]]},
  {"id":"a44","pts":[[8,9],[9,9],[9,8],[9,7],[9,6],[9,5],[8,5]]},
  {"id":"a45","pts":[[8,6],[8,7],[8,8]]},
  {"id":"a46","pts":[[9,24],[9,25]]},
  {"id":"a47","pts":[[33,4],[33,3],[32,3],[31,3],[30,3],[30,4],[30,5],[31,5],[32,5],[33,5],[34,5],[34,6],[33,6],[32,6],[31,6],[30,6]]},
  {"id":"a48","pts":[[32,9],[31,9],[31,10],[32,10],[33,10],[33,9],[33,8],[32,8],[31,8],[30,8],[30,9],[30,10],[30,11],[31,11],[32,11],[33,11],[34,11],[34,10],[34,9],[34,8],[34,7],[33,7],[32,7],[31,7],[30,7]]},
  {"id":"a49","pts":[[33,16],[33,15],[33,14],[33,13],[33,12],[32,12],[31,12],[31,13],[31,14],[31,15],[31,16],[31,17],[31,18],[31,19],[30,19],[30,18],[30,17],[30,16],[30,15],[30,14],[30,13]]},
  {"id":"a50","pts":[[30,25],[30,24],[30,23]]},
  {"id":"a51","pts":[[25,8],[25,9],[25,10],[25,11],[25,12],[25,13],[25,14],[25,15],[25,16],[25,17],[24,17],[23,17],[22,17],[21,17],[20,17],[19,17],[18,17],[17,17],[16,17],[16,18],[16,19],[16,20],[16,21],[16,22],[16,23],[16,24],[16,25],[17,25],[18,25],[19,25],[20,25],[21,25],[22,25],[23,25],[24,25],[25,25]]},
  {"id":"a52","pts":[[21,24],[21,23],[22,23],[23,23],[24,23],[25,23],[25,24]]},
  {"id":"a53","pts":[[22,24],[23,24],[24,24]]},
  {"id":"a54","pts":[[31,4],[32,4]]},
  {"id":"a55","pts":[[32,13],[32,14],[32,15],[32,16],[32,17],[32,18]]},
  {"id":"a56","pts":[[19,14],[20,14]]},
  {"id":"a57","pts":[[14,15],[14,16],[14,17],[14,18],[14,19],[14,20],[14,21],[14,22],[13,22],[13,21],[13,20],[13,19],[13,18],[13,17],[13,16],[13,15],[13,14],[14,14],[15,14],[16,14],[17,14]]},
  {"id":"a58","pts":[[13,23],[14,23],[15,23],[15,22],[15,21],[15,20],[15,19],[15,18],[15,17],[15,16],[16,16],[17,16],[18,16],[19,16],[20,16],[21,16],[22,16],[23,16],[24,16],[24,15],[23,15],[22,15],[21,15],[20,15],[19,15],[18,15],[17,15],[16,15],[15,15]]},
  {"id":"a59","pts":[[19,24],[20,24],[20,23],[19,23]]},
  {"id":"a60","pts":[[20,12],[20,13]]},
  {"id":"a61","pts":[[13,13],[14,13],[15,13]]},
  {"id":"a62","pts":[[13,9],[13,10],[13,11]]},
  {"id":"a63","pts":[[14,10],[14,11]]}
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

export default function Level38() {
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

  const currentLevelId = state.game?.levelId || 38;

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
        el.className = 'lvl38-confetti';
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
      dots.setAttribute('class', 'lvl38-dots');
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
      g.setAttribute('class', 'lvl38-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl38-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl38-head');
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
    dispatch({ type: 'START_LEVEL', levelId: 39 });
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
    <div className="lvl38-stage">
      <div className="lvl38-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl38-topbar">
          <div className="lvl38-btns">
            <button className="lvl38-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl38-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl38-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl38-header-center">
            <div className="lvl38-level">Level {currentLevelId}</div>
            <div className="lvl38-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl38-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl38-round-btn lvl38-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl38-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl38-boardSvg" viewBox="-14 -14 676 640" />
        </div>

        {/* Controls */}
        <div className="lvl38-controls">
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
          <button className="lvl38-round lvl38-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl38-bulb">
              <span className="lvl38-bolt">ϟ</span>
            </span>
            <span className="lvl38-ad">AD</span>
          </button>
          <button
            className="lvl38-round lvl38-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl38-calc-icon">
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
        <div className={`lvl38-win ${isWon ? 'on' : ''}`}>
          <div className="lvl38-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl38-trophy">🏆</div>
            <div className="lvl38-stars">★ ★ ★</div>
            <button className="lvl38-next" onClick={handleNextLevel}>
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
            <button className="lvl38-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl38-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl38-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
