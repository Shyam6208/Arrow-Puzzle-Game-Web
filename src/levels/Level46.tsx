import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 40, rows: 40 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[22,36],[21,36],[20,36],[19,36],[18,36],[17,36],[16,36],[15,36],[14,36],[13,36],[13,35],[12,35],[11,35],[11,34],[10,34],[9,34],[9,33],[8,33],[8,32],[7,32],[7,31],[6,31],[6,30],[5,30],[5,29],[5,28],[4,28],[4,27],[4,26],[3,26],[3,25],[3,24],[3,23],[2,23],[2,22],[2,21],[2,20],[2,19],[2,18],[2,17],[2,16],[3,16],[3,15],[3,14],[3,13],[4,13],[4,12],[4,11],[5,11],[5,10],[5,9],[6,9],[6,8],[7,8],[7,7],[8,7],[8,6],[9,6],[9,5],[10,5],[11,5],[11,4],[12,4],[13,4],[13,3],[14,3],[15,3],[16,3],[16,2],[17,2],[18,2],[19,2],[20,2],[21,2],[22,2],[23,2],[23,3],[24,3],[25,3],[26,3],[26,4],[27,4],[28,4],[28,5],[29,5],[30,5],[30,6],[31,6],[31,7],[32,7],[32,8],[33,8],[33,9],[34,9],[34,10],[34,11],[35,11],[35,12],[35,13],[36,13],[36,14],[36,15],[36,16],[37,16],[37,17],[37,18],[37,19],[37,20],[37,21],[37,22],[37,23],[36,23],[36,24],[36,25],[36,26],[35,26],[35,27],[35,28],[34,28],[34,29],[34,30],[33,30],[33,31],[32,31],[32,32],[31,32],[31,33],[30,33],[30,34],[29,34],[28,34],[28,35],[27,35],[26,35],[26,36],[25,36],[24,36],[23,36],[23,37],[22,37],[21,37],[20,37],[19,37],[18,37],[17,37],[16,37]]},
  {"id":"a1","pts":[[4,23],[4,22],[3,22]]},
  {"id":"a2","pts":[[4,21],[3,21],[3,20],[3,19],[3,18],[3,17],[4,17],[4,16],[4,15],[4,14]]},
  {"id":"a3","pts":[[4,20],[4,19],[4,18]]},
  {"id":"a4","pts":[[22,6],[21,6],[20,6],[19,6],[18,6],[17,6],[16,6],[15,6],[14,6],[14,7],[14,8],[14,9],[14,10],[14,11],[14,12],[14,13],[14,14],[14,15],[13,15],[12,15],[11,15],[10,15],[9,15],[8,15],[7,15],[6,15],[5,15],[5,16],[5,17],[5,18],[5,19],[5,20],[5,21],[5,22],[5,23],[5,24],[4,24]]},
  {"id":"a5","pts":[[5,25],[4,25]]},
  {"id":"a6","pts":[[7,13],[7,14],[8,14],[8,13],[8,12],[8,11],[7,11],[7,12],[6,12],[6,13],[6,14],[5,14],[5,13]]},
  {"id":"a7","pts":[[6,18],[6,19],[6,20],[6,21],[6,22],[6,23],[6,24],[6,25],[6,26],[5,26]]},
  {"id":"a8","pts":[[6,29],[6,28],[6,27],[5,27]]},
  {"id":"a9","pts":[[7,18],[7,19],[7,20],[7,21],[7,22],[7,23],[7,24],[7,25],[7,26],[7,27],[7,28],[7,29],[7,30]]},
  {"id":"a10","pts":[[6,17],[6,16],[7,16],[7,17]]},
  {"id":"a11","pts":[[8,8],[9,8],[9,7],[10,7],[10,6],[11,6],[12,6],[12,5]]},
  {"id":"a12","pts":[[6,11],[6,10],[7,10],[7,9],[8,9],[9,9],[9,10],[10,10],[10,9],[11,9],[11,8],[10,8]]},
  {"id":"a13","pts":[[8,16],[8,17],[8,18],[8,19],[8,20],[8,21],[8,22],[8,23],[8,24],[8,25],[8,26],[8,27],[8,28],[8,29],[8,30],[8,31]]},
  {"id":"a14","pts":[[11,10],[11,11],[10,11],[9,11]]},
  {"id":"a15","pts":[[9,14],[9,13],[9,12]]},
  {"id":"a16","pts":[[9,20],[9,21],[9,22],[9,23],[9,24],[9,25],[9,26],[9,27],[9,28],[9,29],[9,30],[9,31],[9,32]]},
  {"id":"a17","pts":[[13,20],[12,20],[12,19],[12,18],[12,17],[12,16],[11,16],[10,16],[9,16],[9,17],[9,18],[9,19]]},
  {"id":"a18","pts":[[10,14],[10,13],[10,12],[11,12],[11,13],[11,14],[12,14],[12,13],[12,12],[12,11],[12,10],[12,9],[12,8],[12,7]]},
  {"id":"a19","pts":[[11,17],[10,17]]},
  {"id":"a20","pts":[[13,21],[13,22],[12,22],[12,21]]},
  {"id":"a21","pts":[[15,34],[14,34],[13,34],[12,34]]},
  {"id":"a22","pts":[[14,4],[15,4],[16,4],[17,4],[18,4],[19,4],[20,4],[21,4],[22,4],[23,4],[24,4],[25,4]]},
  {"id":"a23","pts":[[25,35],[24,35],[23,35],[22,35],[21,35],[20,35],[19,35],[18,35],[17,35],[16,35],[15,35],[14,35]]},
  {"id":"a24","pts":[[15,14],[15,13],[15,12],[15,11],[15,10],[15,9],[15,8],[15,7],[16,7],[17,7],[18,7],[19,7],[20,7],[21,7],[22,7],[23,7],[24,7],[25,7],[26,7],[27,7],[28,7],[29,7],[30,7]]},
  {"id":"a25","pts":[[22,3],[21,3],[20,3],[19,3],[18,3],[17,3]]},
  {"id":"a26","pts":[[25,34],[24,34],[23,34],[22,34],[21,34],[20,34],[19,34],[18,34],[17,34]]},
  {"id":"a27","pts":[[22,5],[23,5],[24,5],[25,5],[26,5],[27,5]]},
  {"id":"a28","pts":[[13,14],[13,13],[13,12],[13,11],[13,10],[13,9],[13,8],[13,7],[13,6],[13,5],[14,5],[15,5],[16,5],[17,5],[18,5],[19,5],[20,5],[21,5]]},
  {"id":"a29","pts":[[13,19],[13,18],[13,17],[13,16]]},
  {"id":"a30","pts":[[16,11],[16,10],[16,9],[16,8]]},
  {"id":"a31","pts":[[19,12],[19,11],[19,10],[19,9],[19,8]]},
  {"id":"a32","pts":[[23,6],[24,6],[25,6],[26,6],[27,6],[28,6],[29,6]]},
  {"id":"a33","pts":[[33,19],[34,19],[34,20],[34,21],[34,22],[34,23],[34,24],[34,25],[34,26],[33,26],[32,26],[31,26],[30,26],[29,26],[28,26],[27,26],[26,26],[26,27],[26,28],[26,29],[26,30],[26,31],[26,32],[26,33],[26,34]]},
  {"id":"a34","pts":[[27,34],[27,33],[28,33],[29,33]]},
  {"id":"a35","pts":[[28,31],[29,31],[30,31],[30,30],[29,30],[28,30],[27,30],[27,31],[27,32],[28,32],[29,32],[30,32]]},
  {"id":"a36","pts":[[29,16],[30,16],[30,17],[31,17],[32,17],[33,17],[33,16],[34,16],[34,15],[33,15],[33,14],[34,14],[34,13]]},
  {"id":"a37","pts":[[30,18],[31,18],[32,18],[33,18],[34,18],[35,18],[35,17],[35,16],[35,15],[35,14]]},
  {"id":"a38","pts":[[26,16],[26,17],[27,17],[27,16],[28,16],[28,17],[29,17]]},
  {"id":"a39","pts":[[31,9],[31,8],[30,8],[29,8],[28,8],[27,8],[26,8],[25,8],[25,9],[25,10],[25,11],[25,12],[25,13],[25,14],[25,15],[26,15],[27,15],[28,15],[29,15],[30,15],[31,15],[32,15],[32,14],[32,13],[32,12],[32,11],[32,10],[32,9]]},
  {"id":"a40","pts":[[23,8],[24,8]]},
  {"id":"a41","pts":[[21,10],[20,10],[20,11],[20,12],[21,12],[21,11],[22,11],[22,10],[22,9],[21,9],[20,9],[20,8],[21,8],[22,8]]},
  {"id":"a42","pts":[[26,14],[26,13],[26,12],[26,11],[26,10],[26,9],[27,9],[28,9],[29,9],[30,9]]},
  {"id":"a43","pts":[[19,13],[20,13],[21,13],[22,13],[23,13],[23,12],[23,11],[23,10],[23,9],[24,9]]},
  {"id":"a44","pts":[[30,10],[29,10],[28,10],[27,10],[27,11],[27,12],[27,13],[27,14],[28,14],[29,14],[30,14],[31,14],[31,13],[31,12],[31,11],[31,10]]},
  {"id":"a45","pts":[[28,13],[28,12],[28,11]]},
  {"id":"a46","pts":[[31,16],[32,16]]},
  {"id":"a47","pts":[[32,30],[32,29],[32,28],[32,27],[33,27],[34,27]]},
  {"id":"a48","pts":[[31,31],[31,30],[31,29],[31,28],[30,28],[29,28],[29,29],[28,29],[28,28],[27,28],[27,27],[28,27],[29,27],[30,27],[31,27]]},
  {"id":"a49","pts":[[33,13],[33,12],[33,11],[33,10]]},
  {"id":"a50","pts":[[29,11],[30,11],[30,12],[29,12],[29,13],[30,13]]},
  {"id":"a51","pts":[[33,28],[33,29]]},
  {"id":"a52","pts":[[35,21],[36,21],[36,20],[35,20],[35,19],[36,19],[36,18]]},
  {"id":"a53","pts":[[26,18],[27,18],[28,18],[29,18]]},
  {"id":"a54","pts":[[30,20],[31,20],[31,21],[32,21],[33,21],[33,22],[33,23],[32,23],[32,24],[31,24],[31,23],[30,23],[29,23],[29,22],[29,21],[29,20],[29,19],[30,19],[31,19],[32,19],[32,20],[33,20]]},
  {"id":"a55","pts":[[26,21],[26,22],[27,22],[27,21],[27,20],[26,20],[26,19],[27,19],[28,19]]},
  {"id":"a56","pts":[[26,23],[27,23],[28,23],[28,22],[28,21]]},
  {"id":"a57","pts":[[35,25],[35,24],[35,23],[35,22],[36,22]]},
  {"id":"a58","pts":[[10,22],[10,23],[10,24],[10,25],[10,26],[10,27],[10,28],[10,29],[10,30],[10,31],[10,32],[10,33],[11,33],[12,33],[13,33],[14,33],[15,33],[16,33],[17,33],[18,33],[19,33],[20,33],[21,33],[22,33],[23,33],[24,33],[25,33],[25,32],[25,31],[25,30],[25,29],[25,28],[25,27],[25,26],[25,25],[25,24],[26,24],[27,24],[28,24],[29,24],[30,24]]},
  {"id":"a59","pts":[[12,31],[12,32],[11,32]]},
  {"id":"a60","pts":[[22,31],[22,32],[21,32],[20,32],[19,32],[18,32],[17,32],[16,32],[16,31],[16,30],[16,29],[16,28],[16,27],[16,26],[15,26],[14,26],[13,26],[12,26],[11,26],[11,27],[11,28],[11,29],[11,30],[11,31]]},
  {"id":"a61","pts":[[15,29],[14,29],[14,28],[13,28],[12,28],[12,29],[12,30],[13,30],[14,30],[15,30],[15,31],[15,32],[14,32],[14,31],[13,31],[13,32]]},
  {"id":"a62","pts":[[12,27],[13,27],[14,27],[15,27],[15,28]]},
  {"id":"a63","pts":[[17,25],[18,25],[19,25],[20,25],[21,25],[22,25],[23,25],[23,24],[24,24],[24,23],[25,23],[25,22],[25,21],[25,20],[25,19],[25,18],[25,17],[25,16],[24,16],[24,15],[23,15],[23,14],[22,14],[21,14],[20,14],[19,14],[18,14],[17,14],[16,14],[16,15],[15,15],[15,16],[14,16],[14,17],[14,18],[14,19],[14,20],[14,21],[14,22],[14,23],[15,23],[15,24],[16,24],[16,25]]},
  {"id":"a64","pts":[[11,20],[11,19],[11,18],[10,18],[10,19],[10,20],[10,21],[11,21],[11,22],[11,23],[12,23],[13,23]]},
  {"id":"a65","pts":[[11,24],[11,25],[12,25],[12,24],[13,24],[13,25],[14,25],[14,24]]},
  {"id":"a66","pts":[[18,8],[17,8],[17,9],[18,9],[18,10],[17,10],[17,11],[18,11],[18,12],[18,13],[17,13],[17,12],[16,12],[16,13]]},
  {"id":"a67","pts":[[17,26],[17,27],[17,28],[17,29],[17,30],[17,31]]},
  {"id":"a68","pts":[[18,31],[18,30],[18,29],[18,28],[18,27],[18,26],[19,26],[20,26],[21,26],[22,26],[23,26],[24,26],[24,27],[24,28],[24,29],[24,30],[24,31],[24,32]]},
  {"id":"a69","pts":[[21,31],[20,31],[20,30],[19,30],[19,31]]},
  {"id":"a70","pts":[[19,27],[20,27],[20,28],[19,28],[19,29]]},
  {"id":"a71","pts":[[22,28],[22,29],[23,29]]},
  {"id":"a72","pts":[[23,28],[23,27],[22,27],[21,27],[21,28],[21,29],[21,30],[22,30],[23,30],[23,31],[23,32]]},
  {"id":"a73","pts":[[24,10],[24,11],[24,12],[24,13],[24,14]]},
  {"id":"a74","pts":[[26,25],[27,25],[28,25],[29,25],[30,25],[31,25],[32,25],[33,25]]},
  {"id":"a75","pts":[[30,21],[30,22],[31,22],[32,22]]}
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

interface PathData {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

function makePath(def: ArrowDef): PathData {
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

function pointAt(path: PathData, p: number): [number, number] {
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

function pulledShape(path: PathData, s: number): [number, number][] {
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
    out.push(`${c},${r}`);
    c += dc;
    r += dr;
  }
  return out;
}

interface ArrowRuntime {
  def: ArrowDef;
  path: PathData;
  g: SVGGElement;
  line: SVGPolylineElement;
  hit: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  lastWrongRevision: number;
}

export default function Level46() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 46;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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

  const [mistakes, setMistakes] = useState(0);
  const [remainingCount, setRemainingCount] = useState(RAW_ARROWS.length);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const mistakesRef = useRef(0);
  const boardRevisionRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2400);
  }, []);

  const tapSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // Audio optional
    }
  }, []);

  const draw = useCallback((a: ArrowRuntime, s: number, op: number) => {
    const shape = pulledShape(a.path, s);
    const ptsStr = shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    a.line.setAttribute('points', ptsStr);
    a.hit.setAttribute('points', ptsStr);

    const [hx, hy] = pointAt(a.path, a.path.L + s);
    const ang = (Math.atan2(a.path.dir[1], a.path.dir[0]) * 180) / Math.PI;
    a.head.setAttribute('transform', `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`);
    a.g.setAttribute('opacity', op.toFixed(3));
  }, []);

  const isBlocked = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a) return false;
    const ray = new Set(rayCells(a.def));
    return RAW_ARROWS.some((o) => {
      if (o.id === id) return false;
      const target = arrowsRef.current[o.id];
      if (!target || target.gone) return false;
      return o.cells?.some(([c, r]) => ray.has(`${c},${r}`));
    });
  }, []);

  const gapPx = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = cellDir(a.def);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      const blockedHere = RAW_ARROWS.some((o) => {
        if (o.id === id) return false;
        const target = arrowsRef.current[o.id];
        if (!target || target.gone) return false;
        return o.cells?.some(([cc, rr]) => cc === c && rr === r);
      });
      if (blockedHere) return k * CELL;
      c += dc;
      r += dr;
    }
    return 9999;
  }, []);

  const confetti = useCallback(() => {
    if (!appRef.current) return;
    const appEl = appRef.current;
    const colors = ['#5b6cf0', '#2b3160', '#aab3f2', '#e3e3ea', '#8f9bf5'];
    const r = appEl.getBoundingClientRect();
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
        el.className = 'lvl46-confetti';
        el.style.background = colors[i % colors.length];
        el.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
        appEl.appendChild(el);
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
  }, []);

  const win = useCallback(() => {
    setIsWon(true);
    dispatch({ type: 'COMPLETE_LEVEL' });
    confetti();
  }, [confetti, dispatch]);

  const removeArrow = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    boardRevisionRef.current++;
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
      draw(a, s, op);

      if (!dotsShown && s >= L) {
        dotsShown = true;
        a.dots.classList.add('show');
      }

      if (k < 1) {
        requestAnimationFrame(frame);
      } else {
        a.g.style.display = 'none';
        const left = Object.values(arrowsRef.current).filter((x) => !x.gone).length;
        setRemainingCount(left);
        if (left === 0) {
          setTimeout(win, 420);
        }
      }
    };
    requestAnimationFrame(frame);
  }, [draw, win]);

  const collideArrow = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    a.busy = true;

    const firstWrongInState = a.lastWrongRevision !== boardRevisionRef.current;
    if (firstWrongInState) {
      a.lastWrongRevision = boardRevisionRef.current;
      mistakesRef.current++;
      setMistakes(mistakesRef.current);
      if (mistakesRef.current >= 3) {
        isInputLockedRef.current = true;
      }
    }

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
      draw(a, bump * e, 1);
      if (k < 1) {
        requestAnimationFrame(fr);
      } else {
        a.busy = false;
        a.g.classList.remove('hit');
        if (mistakesRef.current >= 3) {
          setTimeout(() => {
            buildBoardRef.current();
          }, 950);
        }
      }
    };
    requestAnimationFrame(fr);
  }, [draw, gapPx]);

  const tryRemove = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    if (isBlocked(id)) {
      collideArrow(id);
      return;
    }
    removeArrow(id);
  }, [collideArrow, isBlocked, removeArrow]);

  const findSolvableArrow = useCallback((): string | null => {
    const active = Object.values(arrowsRef.current).filter((x) => !x.gone && !x.busy);
    for (const a of active) {
      if (!isBlocked(a.def.id)) {
        return a.def.id;
      }
    }
    return null;
  }, [isBlocked]);

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = '';
    arrowsRef.current = {};
    mistakesRef.current = 0;
    boardRevisionRef.current = 0;
    isInputLockedRef.current = false;

    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);
    setIsWon(false);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'dots');
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
      g.setAttribute('class', 'arrow pop');

      const hit = document.createElementNS(NS, 'polyline');
      hit.setAttribute('class', 'hit');

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      g.appendChild(hit);
      g.appendChild(line);
      g.appendChild(head);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (isInputLockedRef.current) return;
        tapSound();
        tryRemove(def.id);
      });

      svg.appendChild(g);

      const runtime: ArrowRuntime = {
        def,
        path,
        g,
        line,
        hit,
        head,
        dots,
        gone: false,
        busy: false,
        lastWrongRevision: -1,
      };
      arrowsRef.current[def.id] = runtime;
      draw(runtime, 0, 1);
    });
  }, [draw, tapSound, tryRemove]);

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

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 47 });
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
    <div className="lvl46-stage">
      <div className="lvl46-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl46-topbar">
          <div className="lvl46-btns">
            <button className="lvl46-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl46-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl46-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl46-header-center">
            <span className="lvl46-level">Level {currentLevelId}</span>
            <div className="lvl46-hearts">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`lvl46-hslot ${i >= 3 - mistakes ? 'lost' : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div className="lvl46-settings">
            <button className="lvl46-round-btn" onClick={handleLevels} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Board */}
        <div className="lvl46-board-wrap" ref={boardRef} style={boardStyle}>
          <svg ref={svgRef} id="boardSvg" className="lvl46-svg" viewBox="-14 -14 730 730" />
        </div>

        <div className="lvl46-controls">
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
          <button className="lvl46-round" onClick={handleHint} aria-label="Hint">
            <span className="lvl46-bulb">
              <span className="lvl46-bolt">⚡</span>
              <span className="lvl46-ad">AD</span>
            </span>
          </button>

          <button
            className="lvl46-round"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl46-calc-icon">
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
        <div className={`lvl46-win ${isWon ? 'on' : ''}`}>
          <div className="lvl46-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl46-trophy">🏆</div>
            <div className="lvl46-stars">★ ★ ★</div>
            <button className="lvl46-next" onClick={handleNextLevel}>
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
            <button className="lvl46-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl46-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl46-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
