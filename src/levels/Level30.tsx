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
  free?: number;
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[19, 22], [18, 22], [18, 21], [19, 21], [19, 20], [19, 19], [20, 19], [20, 20], [20, 21], [20, 22], [20, 23], [19, 23], [18, 23], [17, 23], [17, 22], [17, 21], [16, 21], [15, 21], [14, 21], [13, 21], [13, 22], [14, 22], [15, 22], [16, 22], [16, 23], [15, 23], [14, 23], [13, 23], [13, 24], [13, 25], [12, 25], [12, 24], [12, 23]] },
  { id: 'a1', pts: [[7, 17], [6, 17], [5, 17], [5, 18]] },
  { id: 'a2', pts: [[12, 16], [12, 17], [12, 18], [12, 19], [12, 20], [13, 20], [14, 20], [15, 20], [16, 20], [16, 19], [16, 18], [17, 18], [17, 19], [17, 20], [18, 20], [18, 19], [18, 18], [18, 17], [18, 16], [18, 15], [18, 14], [17, 14]] },
  { id: 'a3', pts: [[18, 24], [18, 25], [18, 26], [18, 27], [17, 27], [17, 28], [16, 28], [16, 29], [16, 30], [16, 31]] },
  { id: 'a4', pts: [[18, 34], [18, 35], [18, 36], [19, 36], [19, 35], [19, 34], [20, 34], [20, 35]] },
  { id: 'a5', pts: [[19, 10], [19, 9], [18, 9], [17, 9], [16, 9], [15, 9], [15, 10], [14, 10], [14, 9]] },
  { id: 'a6', pts: [[8, 18], [7, 18], [7, 19], [6, 19], [5, 19], [4, 19], [3, 19], [2, 19], [1, 19]] },
  { id: 'a7', pts: [[21, 38], [21, 37], [22, 37], [22, 38], [23, 38], [23, 37]] },
  { id: 'a8', pts: [[29, 19], [30, 19], [30, 18], [29, 18], [28, 18], [28, 19], [27, 19], [27, 18], [27, 17], [27, 16], [28, 16], [28, 15], [29, 15], [29, 16], [30, 16]] },
  { id: 'a9', pts: [[5, 14], [6, 14], [7, 14], [8, 14], [9, 14], [10, 14], [11, 14], [12, 14], [12, 13], [12, 12], [12, 11], [12, 10], [12, 9]] },
  { id: 'a10', pts: [[11, 24], [10, 24], [9, 24], [8, 24], [8, 23], [9, 23], [10, 23], [11, 23]] },
  { id: 'a11', pts: [[10, 26], [10, 27], [10, 28], [10, 29], [10, 30]] },
  { id: 'a12', pts: [[23, 21], [22, 21], [21, 21], [21, 22], [21, 23], [21, 24], [22, 24], [22, 25], [21, 25], [20, 25], [20, 26], [20, 27], [20, 28], [21, 28], [21, 27], [21, 26], [22, 26], [22, 27], [22, 28], [23, 28], [23, 27], [23, 26], [23, 25], [24, 25], [25, 25], [25, 24], [25, 23], [24, 23], [24, 24], [23, 24], [23, 23], [22, 23], [22, 22], [23, 22], [24, 22], [25, 22], [25, 21], [24, 21], [24, 20], [23, 20], [23, 19], [23, 18], [24, 18], [24, 17], [24, 16], [24, 15], [25, 15], [26, 15]] },
  { id: 'a13', pts: [[11, 37], [10, 37], [10, 38], [11, 38], [12, 38], [12, 37], [12, 36], [11, 36], [10, 36], [9, 36], [9, 35], [8, 35], [8, 34], [9, 34], [9, 33], [8, 33], [8, 32], [9, 32], [10, 32], [11, 32], [11, 33], [11, 34], [12, 34], [12, 33]] },
  { id: 'a14', pts: [[15, 31], [14, 31], [14, 32], [15, 32], [16, 32], [16, 33], [16, 34], [16, 35], [17, 35], [17, 34], [17, 33], [18, 33], [19, 33], [20, 33], [21, 33], [22, 33], [23, 33], [23, 34], [24, 34], [25, 34], [25, 35], [25, 36]] },
  { id: 'a15', pts: [[16, 7], [16, 8], [17, 8], [18, 8], [19, 8], [19, 7], [20, 7], [20, 8], [20, 9], [20, 10], [21, 10], [22, 10], [22, 11], [23, 11]] },
  { id: 'a16', pts: [[20, 18], [21, 18], [21, 19], [22, 19], [22, 18]] },
  { id: 'a17', pts: [[2, 17], [2, 18], [3, 18], [3, 17], [3, 16], [4, 16], [5, 16], [5, 15], [6, 15], [6, 16], [7, 16], [7, 15], [8, 15], [9, 15], [10, 15], [11, 15], [12, 15], [13, 15], [13, 16], [13, 17], [14, 17], [14, 16], [15, 16], [16, 16], [16, 17], [17, 17], [17, 16], [17, 15], [16, 15], [16, 14], [16, 13], [16, 12], [17, 12], [17, 11], [18, 11], [18, 10], [17, 10], [16, 10], [16, 11], [15, 11], [15, 12], [15, 13], [15, 14], [15, 15], [14, 15], [14, 14], [13, 14]] },
  { id: 'a18', pts: [[14, 24], [14, 25], [14, 26]] },
  { id: 'a19', pts: [[15, 35], [15, 34], [15, 33], [14, 33], [14, 34], [14, 35]] },
  { id: 'a20', pts: [[15, 7], [14, 7], [14, 8], [15, 8]] },
  { id: 'a21', pts: [[24, 19], [25, 19], [26, 19], [26, 18], [25, 18], [25, 17], [25, 16], [26, 16]] },
  { id: 'a22', pts: [[18, 12], [18, 13], [19, 13], [19, 14], [19, 15], [19, 16], [19, 17]] },
  { id: 'a23', pts: [[17, 24], [16, 24], [15, 24], [15, 25], [16, 25], [16, 26], [16, 27], [15, 27], [14, 27], [13, 27], [12, 27], [11, 27], [11, 26], [11, 25], [10, 25], [9, 25], [8, 25]] },
  { id: 'a24', pts: [[18, 30], [19, 30], [19, 29], [19, 28], [18, 28], [18, 29], [17, 29], [17, 30], [17, 31], [17, 32], [18, 32], [18, 31], [19, 31], [20, 31], [20, 32]] },
  { id: 'a25', pts: [[21, 30], [21, 31], [21, 32], [22, 32], [23, 32], [24, 32], [24, 33], [25, 33], [25, 32], [25, 31], [25, 30], [24, 30], [24, 31], [23, 31], [22, 31], [22, 30], [22, 29], [21, 29], [20, 29], [20, 30]] },
  { id: 'a26', pts: [[11, 12], [10, 12], [9, 12], [8, 12], [8, 11], [9, 11], [10, 11], [11, 11], [11, 10], [11, 9], [11, 8], [12, 8], [12, 7]] },
  { id: 'a27', pts: [[25, 11], [25, 12], [25, 13], [25, 14], [24, 14], [23, 14]] },
  { id: 'a28', pts: [[8, 22], [8, 21], [8, 20], [8, 19], [9, 19], [9, 18], [9, 17], [8, 17], [8, 16], [9, 16], [10, 16], [11, 16], [11, 17], [10, 17], [10, 18], [11, 18], [11, 19], [11, 20], [11, 21], [10, 21], [10, 20], [9, 20], [9, 21], [9, 22], [10, 22], [11, 22], [12, 22], [12, 21]] },
  { id: 'a29', pts: [[17, 36], [16, 36], [15, 36], [14, 36], [13, 36], [13, 35], [13, 34], [13, 33], [13, 32], [13, 31], [12, 31], [11, 31], [10, 31], [9, 31], [9, 30]] },
  { id: 'a30', pts: [[23, 30], [23, 29], [24, 29], [25, 29], [25, 28], [25, 27]] },
  { id: 'a31', pts: [[24, 38], [24, 37], [25, 37], [25, 38]] },
  { id: 'a32', pts: [[24, 13], [23, 13], [22, 13], [22, 14], [22, 15], [23, 15]] },
  { id: 'a33', pts: [[14, 19], [15, 19]] },
  { id: 'a34', pts: [[13, 29], [14, 29], [14, 28], [13, 28], [12, 28], [12, 29], [11, 29], [11, 30], [12, 30], [13, 30], [14, 30]] },
  { id: 'a35', pts: [[13, 37], [13, 38], [14, 38], [14, 37], [15, 37], [15, 38], [16, 38], [16, 37], [17, 37], [18, 37], [18, 38]] },
  { id: 'a36', pts: [[17, 7], [18, 7]] },
  { id: 'a37', pts: [[21, 34], [21, 35], [21, 36], [22, 36], [23, 36], [24, 36], [24, 35], [23, 35], [22, 35], [22, 34]] },
  { id: 'a38', pts: [[33, 19], [32, 19], [32, 18], [31, 18], [31, 19]] },
  { id: 'a39', pts: [[10, 33], [10, 34], [10, 35], [11, 35], [12, 35]] },
  { id: 'a40', pts: [[22, 8], [22, 9], [21, 9], [21, 8], [21, 7]] },
  { id: 'a41', pts: [[16, 5], [15, 5], [14, 5], [14, 6], [15, 6], [16, 6], [17, 6], [18, 6], [19, 6], [19, 5], [18, 5], [18, 4], [17, 4], [17, 3], [16, 3], [16, 4], [15, 4]] },
  { id: 'a42', pts: [[17, 26], [17, 25]] },
  { id: 'a43', pts: [[28, 17], [29, 17], [30, 17]] },
  { id: 'a44', pts: [[20, 12], [20, 13], [20, 14], [20, 15], [20, 16], [20, 17], [21, 17], [22, 17], [22, 16], [21, 16], [21, 15], [21, 14], [21, 13], [21, 12], [21, 11], [20, 11], [19, 11], [19, 12]] },
  { id: 'a45', pts: [[15, 17], [15, 18], [14, 18], [13, 18], [13, 19]] },
  { id: 'a46', pts: [[24, 28], [24, 27], [24, 26]] },
  { id: 'a47', pts: [[9, 29], [9, 28], [8, 28]] },
  { id: 'a48', pts: [[8, 38], [9, 38], [9, 37], [8, 37], [8, 36]] },
  { id: 'a49', pts: [[13, 6], [13, 7], [13, 8], [13, 9], [13, 10], [13, 11], [14, 11], [14, 12], [13, 12], [13, 13], [14, 13]] },
  { id: 'a50', pts: [[12, 26], [13, 26]] },
  { id: 'a51', pts: [[10, 9], [10, 10], [9, 10]] },
  { id: 'a52', pts: [[6, 13], [7, 13], [8, 13], [9, 13], [10, 13]] },
  { id: 'a53', pts: [[20, 24], [19, 24], [19, 25], [19, 26], [19, 27]] },
  { id: 'a54', pts: [[23, 9], [23, 10], [24, 10], [24, 11], [24, 12], [23, 12], [22, 12]] },
  { id: 'a55', pts: [[8, 26], [9, 26], [9, 27], [8, 27]] },
  { id: 'a56', pts: [[20, 36], [20, 37], [19, 37], [19, 38]] },
  { id: 'a57', pts: [[8, 31], [8, 30], [8, 29]] },
  { id: 'a58', pts: [[15, 29], [15, 28]] },
  { id: 'a59', pts: [[26, 12], [26, 13], [26, 14], [27, 14], [27, 15]] },
  { id: 'a60', pts: [[22, 20], [21, 20]] },
  { id: 'a61', pts: [[4, 18], [4, 17]] },
  { id: 'a62', pts: [[23, 17], [23, 16]] },
];

/* 100% verified greedy removal solution sequence (63/63 arrows) */
const SOLUTION_IDS: string[] = [
  'a6', 'a1', 'a8', 'a21', 'a23', 'a26', 'a9', 'a17', 'a2', 'a28',
  'a0', 'a31', 'a14', 'a35', 'a38', 'a40', 'a41', 'a43', 'a47', 'a51',
  'a55', 'a56', 'a4', 'a24', 'a25', 'a53', 'a22', 'a44', 'a59', 'a12',
  'a10', 'a32', 'a27', 'a30', 'a49', 'a52', 'a29', 'a3', 'a19', 'a34',
  'a18', 'a54', 'a15', 'a16', 'a20', 'a5', 'a33', 'a36', 'a42', 'a46',
  'a50', 'a13', 'a45', 'a57', 'a48', 'a58', 'a60', 'a37', 'a39', 'a11',
  'a61', 'a62', 'a7',
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [[def.pts[0][0], def.pts[0][1]]];
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

const ARROWS = RAW_ARROWS.map((a) => ({
  ...a,
  cells: cellsOf(a),
}));

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

interface PathInfo {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

function makePath(def: ArrowDef): PathInfo {
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
  return { pts, arcs, L, dir: [(ex - px) / dl, (ey - py) / dl] };
}

function pointAt(path: PathInfo, p: number): [number, number] {
  const { pts, arcs, L, dir } = path;
  if (p >= L) {
    const [ex, ey] = pts[pts.length - 1];
    return [ex + dir[0] * (p - L), ey + dir[1] * (p - L)];
  }
  if (p <= 0) return pts[0];
  let i = 1;
  while (i < arcs.length && arcs[i] < p) i++;
  if (i >= arcs.length) i = arcs.length - 1;
  const t = (p - arcs[i - 1]) / (arcs[i] - arcs[i - 1] || 1);
  return [
    pts[i - 1][0] + (pts[i][0] - pts[i - 1][0]) * t,
    pts[i - 1][1] + (pts[i][1] - pts[i - 1][1]) * t,
  ];
}

function pulledShape(path: PathInfo, s: number): [number, number][] {
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
  path: PathInfo,
  s: number,
  op = 1,
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

interface ArrowRuntime {
  def: ArrowDef;
  path: PathInfo;
  g: SVGGElement;
  line: SVGPolylineElement;
  hitArea: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

export default function Level30() {
  const { state, dispatch, showRewardedAd } = useStore();
  const { zoomLevel, panOffset, isPanMode, togglePanMode, isPanned, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isZoomed, boardRef, boardStyle } = useZoom();
  const currentLevelId = state.game?.levelId || 30;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

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
      osc.stop(ctx.currentTime + (ok ? 0.065 : 0.1));
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
        el.className = 'lvl30-confetti';
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
        p.el.style.opacity = p.t > p.life - 0.4 ? String((p.life - p.t) / 0.4) : '1';
        p.el.style.left = p.x + 'px';
        p.el.style.top = p.y + 'px';
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const isExitPathClear = useCallback((id: string): boolean => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return false;
    if (a.def.free) return true;

    const ray = new Set(rayCells(a.def));
    const isBlocked = ARROWS.some(
      (o) =>
        o.id !== id &&
        !o.free &&
        !arrowsRef.current[o.id]?.gone &&
        o.cells?.some(([c, r]) => ray.has(`${c},${r}`))
    );
    return !isBlocked;
  }, []);

  const currentTarget = useCallback((): string | null => {
    for (let k = 0; k < SOLUTION_IDS.length; k++) {
      const id = SOLUTION_IDS[k];
      if (!arrowsRef.current[id]?.gone && isExitPathClear(id)) return id;
    }
    for (let i = 0; i < ARROWS.length; i++) {
      const id = ARROWS[i].id;
      if (!arrowsRef.current[id]?.gone && isExitPathClear(id)) return id;
    }
    return null;
  }, [isExitPathClear]);

  const getObstacleGapPx = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = cellDir(a.def);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        ARROWS.some(
          (o) =>
            o.id !== id &&
            !o.free &&
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
  }, []);

  const collide = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.busy) return;
    a.busy = true;
    a.g.classList.add('hit');

    if (appRef.current) {
      appRef.current.classList.remove('shake');
      void appRef.current.offsetWidth;
      appRef.current.classList.add('shake');
    }

    if (!a.wrongLocked) {
      a.wrongLocked = true;
      setMistakes((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          playFailSound();
          isInputLockedRef.current = true;
          showToast('Out of Lives!');
          window.setTimeout(() => {
            isInputLockedRef.current = false;
            setIsWon(false);
            setMistakes(0);
            buildBoardRef.current();
          }, 950);
        }
        return next;
      });
    }

    playTapSound(false);

    const bump = Math.max(14, Math.min(getObstacleGapPx(id) - 10, 46));
    const dur = 500;
    const start = performance.now();

    function fr(now: number) {
      const k = Math.min(1, (now - start) / dur);
      const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);
      drawArrow(a.line, a.head, a.g, a.path, bump * e, 1, a.hitArea);
      if (k < 1) {
        requestAnimationFrame(fr);
      } else {
        a.busy = false;
        a.g.classList.remove('hit');
      }
    }
    requestAnimationFrame(fr);
  }, [getObstacleGapPx, showToast]);

  const removeArrow = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      a.g.classList.add('fly');
      clearedRef.current++;
      setRemainingCount(RAW_ARROWS.length - clearedRef.current);

      const L = a.path.L;
      const dist = L + 340;
      const dur = 750 + L * 3.0;
      const start = performance.now();
      let dotsShown = false;

      function frame(now: number) {
        const k = Math.min(1, (now - start) / dur);
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
          Object.values(arrowsRef.current).forEach((x) => {
            if (!x.gone) x.wrongLocked = false;
          });
          if (clearedRef.current === RAW_ARROWS.length) {
            window.setTimeout(() => {
              setIsWon(true);
              triggerConfetti();
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: currentLevelId,
                moves: 63,
                stars: 3,
              });
            }, 380);
          }
        }
      }
      requestAnimationFrame(frame);
    },
    [dispatch, currentLevelId]
  );

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy || isInputLockedRef.current) return;

      const clear = isExitPathClear(id);

      if (!clear) {
        collide(id);
        return;
      }

      playTapSound(true);
      removeArrow(id);
    },
    [isExitPathClear, collide, removeArrow]
  );

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;

    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    setRemainingCount(RAW_ARROWS.length);
    isInputLockedRef.current = false;

    ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl30-dots');
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
      g.setAttribute('class', 'lvl30-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl30-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl30-head');
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
    const targetId = currentTarget();
    if (!targetId) {
      showToast('All arrows cleared!');
      return;
    }

    const a = arrowsRef.current[targetId];
    if (a) {
      a.g.animate(
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
  }, [currentTarget, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    if (!currentTarget()) {
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
    dispatch({ type: 'START_LEVEL', levelId: 31 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl30-stage">
      <div className="lvl30-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl30-topbar">
          <div className="lvl30-btns">
            <button className="lvl30-round-btn" onClick={handleLevels} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl30-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl30-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl30-header-center">
            <div className="lvl30-level">Level {currentLevelId}</div>
            <div className="lvl30-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl30-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl30-round-btn lvl30-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl30-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl30-boardSvg" viewBox="-14 -14 640 748" />
        </div>

        {/* Controls */}
        <div className="lvl30-controls">
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
          <button className="lvl30-round lvl30-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl30-bulb">
              <span className="lvl30-bolt">ϟ</span>
            </span>
            <span className="lvl30-ad">AD</span>
          </button>
          <button
            className="lvl30-round lvl30-calculator"
            onClick={() => showToast('Level 30: 63 Arrows')}
            aria-label="Info"
          >
            <span className="lvl30-calc-icon">
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
        <div className={`lvl30-win ${isWon ? 'on' : ''}`}>
          <div className="lvl30-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl30-trophy">🏆</div>
            <div className="lvl30-stars">★ ★ ★</div>
            <button className="lvl30-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button className="lvl30-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl30-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl30-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
