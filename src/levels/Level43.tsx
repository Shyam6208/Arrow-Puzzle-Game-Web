import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 34, rows: 41 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[18,21],[18,22],[18,23],[18,24],[17,24],[16,24],[16,23],[16,22],[16,21],[16,20],[16,19],[15,19],[14,19],[13,19],[13,20],[12,20],[12,21],[12,22],[11,22],[11,23],[10,23],[10,24],[11,24],[11,25],[11,26],[11,27],[10,27],[9,27],[8,27],[8,28],[8,29],[9,29],[9,30],[9,31],[8,31],[7,31],[7,32],[7,33],[7,34],[7,35],[6,35],[5,35],[5,34],[4,34]]},
  {"id":"a1","pts":[[20,34],[19,34],[18,34],[18,33],[18,32],[19,32],[19,33],[20,33],[21,33],[21,34],[21,35],[20,35],[19,35],[18,35],[17,35],[16,35],[15,35],[14,35],[14,36],[15,36],[16,36],[16,37],[17,37],[18,37],[19,37],[20,37],[21,37],[22,37],[23,37],[24,37],[25,37],[26,37],[27,37],[28,37],[29,37],[30,37],[31,37]]},
  {"id":"a2","pts":[[9,28],[10,28],[10,29],[10,30],[10,31],[11,31],[12,31],[12,30],[12,29],[12,28],[13,28],[14,28],[15,28],[16,28],[16,29],[16,30],[17,30],[18,30],[19,30],[19,31],[18,31],[17,31],[17,32],[17,33],[17,34],[16,34],[15,34],[14,34],[13,34],[13,35],[13,36],[13,37],[14,37],[15,37]]},
  {"id":"a3","pts":[[10,33],[10,34],[11,34],[12,34],[12,35],[12,36],[11,36],[10,36],[9,36],[9,37],[10,37],[11,37],[12,37]]},
  {"id":"a4","pts":[[15,22],[15,23],[15,24],[15,25],[16,25],[17,25],[17,26],[17,27],[17,28],[17,29],[18,29],[19,29],[20,29],[20,30],[20,31],[20,32],[21,32],[22,32],[22,33],[22,34],[23,34],[23,35],[23,36]]},
  {"id":"a5","pts":[[22,30],[23,30],[24,30],[25,30],[26,30],[27,30],[27,29],[28,29],[28,30],[28,31],[29,31],[30,31],[31,31],[31,30],[31,29],[31,28],[30,28],[29,28],[28,28],[27,28],[26,28],[26,27],[26,26],[26,25],[26,24],[26,23],[26,22],[25,22],[24,22],[24,21],[24,20],[24,19],[24,18],[23,18],[22,18],[22,17],[22,16],[22,15],[22,14],[22,13],[21,13],[20,13],[20,12],[20,11],[21,11],[22,11],[23,11],[24,11],[24,10],[24,9],[25,9],[26,9],[27,9],[28,9],[29,9]]},
  {"id":"a6","pts":[[23,15],[24,15],[25,15],[26,15],[26,14],[26,13],[26,12],[26,11],[26,10],[27,10],[28,10],[28,11],[28,12],[28,13],[29,13],[30,13]]},
  {"id":"a7","pts":[[24,17],[23,17],[23,16],[24,16],[25,16],[25,17],[25,18],[25,19],[25,20],[25,21],[26,21],[27,21],[27,22],[28,22],[28,23],[28,24],[29,24],[29,25],[28,25],[27,25],[27,26],[27,27],[28,27],[29,27],[30,27]]},
  {"id":"a8","pts":[[28,32],[28,33],[27,33],[26,33],[26,34],[26,35],[26,36]]},
  {"id":"a9","pts":[[25,33],[25,32],[25,31],[26,31],[26,32]]},
  {"id":"a10","pts":[[28,3],[29,3],[30,3]]},
  {"id":"a11","pts":[[12,4],[11,4],[11,5],[10,5],[9,5],[9,4],[10,4],[10,3],[11,3]]},
  {"id":"a12","pts":[[18,19],[18,18],[18,17],[17,17],[17,16],[16,16],[16,15],[17,15],[18,15],[19,15],[20,15],[21,15],[21,16],[21,17],[20,17],[19,17],[19,18],[19,19],[19,20],[18,20],[17,20],[17,19],[17,18],[16,18],[15,18],[14,18],[13,18],[13,17],[13,16],[13,15],[12,15],[11,15],[11,14],[11,13],[10,13],[9,13],[9,12]]},
  {"id":"a13","pts":[[13,13],[13,12],[13,11],[13,10],[12,10],[12,9],[12,8],[13,8],[14,8],[14,7],[14,6],[14,5],[14,4],[13,4],[13,5],[12,5]]},
  {"id":"a14","pts":[[28,26],[29,26]]},
  {"id":"a15","pts":[[28,34],[27,34],[27,35],[27,36],[28,36],[28,35],[29,35],[29,36],[30,36],[31,36],[31,35],[30,35],[30,34],[31,34],[31,33],[30,33],[30,32],[31,32]]},
  {"id":"a16","pts":[[27,31],[27,32]]},
  {"id":"a17","pts":[[27,23],[27,24]]},
  {"id":"a18","pts":[[24,23],[25,23]]},
  {"id":"a19","pts":[[29,16],[29,15],[30,15],[30,14],[29,14],[28,14],[28,15],[28,16],[28,17],[27,17],[27,18],[27,19],[27,20]]},
  {"id":"a20","pts":[[29,10],[29,11],[29,12],[30,12]]},
  {"id":"a21","pts":[[30,30],[29,30],[29,29],[30,29]]},
  {"id":"a22","pts":[[10,12],[11,12],[12,12],[12,13],[12,14],[13,14],[14,14],[14,13],[14,12],[14,11],[14,10],[15,10],[16,10],[16,11],[16,12],[16,13],[16,14],[17,14],[18,14],[19,14],[19,13],[19,12],[19,11],[19,10],[20,10],[21,10],[21,9],[21,8],[22,8],[23,8],[24,8],[25,8],[26,8],[27,8],[28,8],[28,7],[28,6],[28,5],[28,4],[29,4],[30,4],[30,5],[30,6]]},
  {"id":"a23","pts":[[23,32],[23,33],[24,33],[24,32],[24,31],[23,31],[22,31],[21,31],[21,30],[21,29],[22,29],[23,29],[24,29],[25,29],[26,29]]},
  {"id":"a24","pts":[[27,11],[27,12],[27,13],[27,14],[27,15],[27,16],[26,16],[26,17],[26,18],[26,19],[26,20]]},
  {"id":"a25","pts":[[15,11],[15,12],[15,13],[15,14],[15,15],[14,15],[14,16],[14,17],[15,17],[16,17]]},
  {"id":"a26","pts":[[27,4],[27,5],[27,6],[27,7]]},
  {"id":"a27","pts":[[29,8],[29,7],[29,6],[29,5]]},
  {"id":"a28","pts":[[29,34],[29,33],[29,32]]},
  {"id":"a29","pts":[[7,36],[8,36],[8,35],[9,35],[9,34],[9,33],[9,32],[10,32],[11,32],[11,33],[12,33],[13,33],[14,33],[15,33],[16,33]]},
  {"id":"a30","pts":[[11,35],[10,35]]},
  {"id":"a31","pts":[[8,26],[9,26],[9,25],[10,25],[10,26]]},
  {"id":"a32","pts":[[12,16],[12,17],[12,18],[11,18],[11,17],[11,16],[10,16],[10,15],[10,14],[9,14],[9,15]]},
  {"id":"a33","pts":[[11,28],[11,29],[11,30]]},
  {"id":"a34","pts":[[12,32],[13,32],[14,32],[15,32],[16,32]]},
  {"id":"a35","pts":[[22,35],[22,36],[21,36],[20,36],[19,36],[18,36],[17,36]]},
  {"id":"a36","pts":[[17,21],[17,22],[17,23]]},
  {"id":"a37","pts":[[20,16],[19,16],[18,16]]},
  {"id":"a38","pts":[[18,25],[18,26],[18,27],[19,27],[19,28]]},
  {"id":"a39","pts":[[17,13],[17,12],[17,11],[18,11],[18,12],[18,13]]},
  {"id":"a40","pts":[[24,26],[24,25],[23,25],[23,26],[22,26],[22,25],[22,24],[22,23],[22,22],[22,21],[22,20],[23,20],[23,19],[22,19],[21,19],[21,18],[20,18],[20,19],[20,20],[21,20],[21,21],[20,21],[19,21],[19,22],[19,23],[19,24],[20,24],[20,25],[19,25],[19,26],[20,26],[20,27],[20,28]]},
  {"id":"a41","pts":[[25,10],[25,11],[25,12],[25,13],[25,14],[24,14],[23,14],[23,13],[23,12],[22,12],[21,12]]},
  {"id":"a42","pts":[[13,7],[13,6],[12,6],[12,7],[11,7],[11,8],[11,9],[11,10],[10,10],[10,11],[11,11],[12,11]]},
  {"id":"a43","pts":[[14,20],[15,20],[15,21],[14,21],[13,21],[13,22],[13,23],[13,24],[12,24],[12,23]]},
  {"id":"a44","pts":[[20,14],[21,14]]},
  {"id":"a45","pts":[[21,22],[20,22],[20,23],[21,23],[21,24],[21,25],[21,26],[21,27],[21,28]]},
  {"id":"a46","pts":[[13,9],[14,9],[15,9],[15,8],[15,7],[16,7],[16,6],[17,6],[18,6],[19,6],[20,6],[21,6],[21,7]]},
  {"id":"a47","pts":[[13,26],[14,26],[15,26],[16,26],[16,27],[15,27],[14,27],[13,27],[12,27],[12,26],[12,25],[13,25],[14,25],[14,24],[14,23],[14,22]]},
  {"id":"a48","pts":[[14,30],[14,29],[15,29],[15,30],[15,31],[14,31],[13,31],[13,30],[13,29]]},
  {"id":"a49","pts":[[6,34],[6,33],[6,32],[6,31],[6,30],[7,30],[8,30]]},
  {"id":"a50","pts":[[25,6],[24,6],[23,6],[23,5],[24,5],[25,5],[25,4],[26,4],[26,5],[26,6],[26,7],[25,7],[24,7],[23,7],[22,7],[22,6],[22,5],[21,5],[20,5],[19,5],[18,5],[17,5],[16,5],[15,5],[15,6]]},
  {"id":"a51","pts":[[10,9],[10,8],[10,7],[10,6],[11,6]]},
  {"id":"a52","pts":[[18,10],[17,10],[17,9],[16,9],[16,8],[17,8],[17,7],[18,7],[19,7],[20,7]]},
  {"id":"a53","pts":[[18,9],[19,9],[20,9],[20,8],[19,8],[18,8]]},
  {"id":"a54","pts":[[23,9],[22,9],[22,10],[23,10]]},
  {"id":"a55","pts":[[25,28],[25,27],[25,26],[25,25],[25,24],[24,24],[23,24],[23,23],[23,22],[23,21]]},
  {"id":"a56","pts":[[7,29],[6,29],[5,29],[4,29],[4,28],[3,28],[2,28],[2,27],[2,26],[2,25],[2,24],[3,24],[4,24],[5,24],[6,24],[7,24],[7,23],[6,23],[6,22],[5,22],[5,21],[6,21],[7,21],[8,21]]},
  {"id":"a57","pts":[[2,29],[3,29]]},
  {"id":"a58","pts":[[7,20],[8,20],[8,19],[7,19],[6,19],[6,20],[5,20],[4,20],[4,21],[4,22],[3,22],[3,23],[4,23],[5,23]]},
  {"id":"a59","pts":[[4,25],[4,26],[5,26],[5,25],[6,25],[6,26],[6,27],[5,27],[4,27],[3,27],[3,26],[3,25]]},
  {"id":"a60","pts":[[8,22],[7,22]]},
  {"id":"a61","pts":[[8,34],[8,33],[8,32]]},
  {"id":"a62","pts":[[22,28],[23,28],[24,28],[24,27],[23,27],[22,27]]},
  {"id":"a63","pts":[[5,28],[6,28]]},
  {"id":"a64","pts":[[3,32],[3,31],[3,30],[4,30],[4,31],[4,32],[4,33],[5,33],[5,32],[5,31],[5,30]]},
  {"id":"a65","pts":[[24,34],[24,35],[24,36],[25,36],[25,35],[25,34]]},
  {"id":"a66","pts":[[24,12],[24,13]]}
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

function makePath(def: ArrowDef): ArrowPath {
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
}

function pointAt(path: ArrowPath, p: number): [number, number] {
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
}

function pulledShape(path: ArrowPath, s: number): [number, number][] {
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
}

function drawArrow(
  line: SVGPolylineElement,
  head: SVGPathElement,
  g: SVGGElement,
  path: ArrowPath,
  s: number,
  op: number,
  hitArea?: SVGPolylineElement
) {
  const shape = pulledShape(path, s);
  const ptsStr = shape.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' ');
  line.setAttribute('points', ptsStr);
  if (hitArea) {
    hitArea.setAttribute('points', ptsStr);
  }
  const [hx, hy] = pointAt(path, path.L + s);
  const ang = (Math.atan2(path.dir[1], path.dir[0]) * 180) / Math.PI;
  head.setAttribute(
    'transform',
    `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`
  );
  g.setAttribute('opacity', op.toFixed(3));
}

function cellDir(def: ArrowDef): [number, number] {
  const [hc, hr] = def.pts[def.pts.length - 1];
  const [pc, pr] = def.pts[def.pts.length - 2];
  return [Math.sign(hc - pc), Math.sign(hr - pr)];
}

function rayCells(def: ArrowDef): string[] {
  const [dc, dr] = cellDir(def);
  let [c, r] = def.pts[def.pts.length - 1];
  const out: string[] = [];
  c += dc;
  r += dr;
  while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
    out.push(c + ',' + r);
    c += dc;
    r += dr;
  }
  return out;
}

export default function Level43() {
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

  const currentLevelId = state.game?.levelId || 43;

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
        el.className = 'lvl43-confetti';
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
        p.el.style.opacity = p.t > p.life - 0.4 ? `${(p.life - p.t) / 0.4}` : '1';
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const blocked = useCallback((id: string): boolean => {
    const a = arrowsRef.current[id];
    if (!a) return false;
    const ray = new Set(rayCells(a.def));
    return RAW_ARROWS.some((o) => {
      if (o.id === id) return false;
      const other = arrowsRef.current[o.id];
      if (!other || other.gone) return false;
      return (o.cells || []).some(([c, r]) => ray.has(c + ',' + r));
    });
  }, []);

  const gapPx = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = cellDir(a.def);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      for (const o of RAW_ARROWS) {
        if (o.id === id) continue;
        const other = arrowsRef.current[o.id];
        if (other && !other.gone && (o.cells || []).some(([cc, rr]) => cc === c && rr === r)) {
          return k * CELL;
        }
      }
      c += dc;
      r += dr;
    }
    return 9999;
  }, []);

  const collide = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy) return;
      a.busy = true;

      if (!a.wrongLocked) {
        a.wrongLocked = true;
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            isInputLockedRef.current = true;
          }
          return next;
        });
      }

      playTapSound(false);

      a.g.classList.add('hit');
      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
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
          setMistakes((currentMistakes) => {
            if (currentMistakes >= 3) {
              isInputLockedRef.current = true;
              playFailSound();
              setTimeout(() => {
                buildBoardRef.current();
              }, 950);
            }
            return currentMistakes;
          });
        }
      };
      requestAnimationFrame(fr);
    },
    [gapPx]
  );

  const remove = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    clearedRef.current += 1;
    setRemainingCount(RAW_ARROWS.length - clearedRef.current);
    boardRevisionRef.current += 1;

    Object.values(arrowsRef.current).forEach((ar) => {
      ar.wrongLocked = false;
    });

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
    [blocked, collide]
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
    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);
    isInputLockedRef.current = false;
    setIsWon(false);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g') as SVGGElement;
      dots.setAttribute('class', 'dots');
      def.cells?.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', x.toString());
        d.setAttribute('cy', y.toString());
        d.setAttribute('r', '2.6');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g') as SVGGElement;
      g.setAttribute('class', 'arrow pop');

      const hitArea = document.createElementNS(NS, 'polyline') as SVGPolylineElement;
      hitArea.setAttribute('class', 'hit');

      const line = document.createElementNS(NS, 'polyline') as SVGPolylineElement;
      line.setAttribute('class', 'pathline');

      const head = document.createElementNS(NS, 'path') as SVGPathElement;
      head.setAttribute('class', 'head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);

      const handlePointer = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInputLockedRef.current) return;
        playTapSound(true);
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
          { filter: 'drop-shadow(0 0 10px #5b6cf3)', transform: 'scale(1.05)' },
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
        ],
        {
          duration: 900,
          iterations: 3,
        }
      );
      showToast('Free arrow highlighted!');
    }
  }, [findSolvableArrow, showToast]);

  const handleHint = () => {
    showRewardedAd({
      rewardType: 'hint',
      title: 'Watch Ad for Hint',
      rewardDescription: '1 Free Move Hint',
      onReward: () => {
        revealSolvableHint();
      },
    });
  };

  const handleRestart = () => {
    setIsWon(false);
    setMistakes(0);
    isInputLockedRef.current = false;
    buildBoard();
  };

  const handleLevelSelect = () => {
    setIsWon(false);
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 44 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl43-stage">
      <div className="lvl43-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl43-topbar">
          <div className="lvl43-btns">
            <button className="lvl43-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl43-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl43-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl43-header-center">
            <div className="lvl43-level">Level {currentLevelId}</div>
            <div className="lvl43-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl43-hslot ${!isActive ? 'lost' : ''}`}
                    style={{
                      opacity: isActive ? 1 : 0.22,
                      transform: `scale(${isActive ? 1 : 0.82})`,
                    }}
                    aria-label={`Heart ${idx + 1} ${isActive ? 'active' : 'lost'}`}
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
            className="lvl43-round-btn lvl43-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl43-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl43-svg" viewBox="-14 -14 622 748" />
        </div>

        {/* Controls */}
        <div className="lvl43-controls">
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
          <button className="lvl43-round lvl43-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl43-bulb">
              <span className="lvl43-bolt">ϟ</span>
            </span>
            <span className="lvl43-ad">AD</span>
          </button>
          <button
            className="lvl43-round lvl43-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl43-calc-icon">
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
        <div className={`lvl43-win ${isWon ? 'on' : ''}`}>
          <div className="lvl43-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl43-trophy">🏆</div>
            <div className="lvl43-stars">★ ★ ★</div>
            <button className="lvl43-next" onClick={handleNextLevel}>
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
            <button className="lvl43-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl43-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl43-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
