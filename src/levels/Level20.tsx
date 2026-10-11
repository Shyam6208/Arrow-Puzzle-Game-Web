import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 15;
const GRID = { cols: 22, rows: 30 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[0, 0], [0, 1], [1, 1], [1, 0], [2, 0], [2, 1]] },
  { id: 'a1', pts: [[3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [7, 1], [7, 2], [7, 3], [7, 4], [8, 4], [9, 4], [10, 4], [11, 4], [12, 4], [13, 4], [13, 3]] },
  { id: 'a2', pts: [[10, 1], [10, 0], [9, 0], [8, 0]] },
  { id: 'a3', pts: [[12, 0], [11, 0], [11, 1], [12, 1], [13, 1], [13, 0], [14, 0], [14, 1], [15, 1], [15, 0]] },
  { id: 'a4', pts: [[19, 0], [20, 0], [20, 1], [21, 1]] },
  { id: 'a5', pts: [[3, 1], [4, 1], [5, 1], [6, 1], [6, 2], [6, 3], [6, 4], [5, 4], [4, 4]] },
  { id: 'a6', pts: [[8, 2], [8, 3], [9, 3], [10, 3], [11, 3], [12, 3], [12, 2], [11, 2], [10, 2], [9, 2], [9, 1]] },
  { id: 'a7', pts: [[17, 1], [18, 1], [18, 0], [17, 0], [16, 0], [16, 1]] },
  { id: 'a8', pts: [[16, 3], [17, 3], [17, 2], [18, 2], [19, 2], [19, 1]] },
  { id: 'a9', pts: [[1, 2], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [1, 6], [2, 6], [3, 6], [4, 6], [4, 7], [4, 8], [3, 8], [2, 8]] },
  { id: 'a10', pts: [[4, 3], [5, 3], [5, 2], [4, 2]] },
  { id: 'a11', pts: [[18, 3], [19, 3], [20, 3], [21, 3], [21, 2], [20, 2]] },
  { id: 'a12', pts: [[1, 3], [1, 4], [1, 5], [2, 5], [3, 5], [4, 5], [5, 5], [6, 5], [6, 6], [7, 6], [7, 7], [7, 8], [8, 8], [9, 8], [9, 9], [9, 10], [10, 10], [11, 10]] },
  { id: 'a13', pts: [[3, 4], [3, 3], [3, 2], [2, 2], [2, 3], [2, 4]] },
  { id: 'a14', pts: [[14, 4], [14, 3], [14, 2], [15, 2], [15, 3], [15, 4], [16, 4], [17, 4], [18, 4], [19, 4], [20, 4], [21, 4], [21, 5], [21, 6], [21, 7], [21, 8]] },
  { id: 'a15', pts: [[8, 7], [9, 7], [9, 6], [9, 5], [8, 5], [7, 5]] },
  { id: 'a16', pts: [[13, 5], [12, 5], [11, 5], [10, 5], [10, 6], [10, 7], [10, 8], [10, 9]] },
  { id: 'a17', pts: [[13, 6], [14, 6], [15, 6], [16, 6], [17, 6], [17, 7], [17, 8], [17, 9], [18, 9], [18, 8], [18, 7], [18, 6], [18, 5], [17, 5], [16, 5], [15, 5], [14, 5]] },
  { id: 'a18', pts: [[19, 5], [19, 6], [19, 7]] },
  { id: 'a19', pts: [[19, 9], [20, 9], [20, 8], [20, 7], [20, 6], [20, 5]] },
  { id: 'a20', pts: [[5, 6], [5, 7], [6, 7], [6, 8], [5, 8]] },
  { id: 'a21', pts: [[11, 9], [11, 8], [11, 7], [11, 6]] },
  { id: 'a22', pts: [[3, 7], [2, 7], [1, 7], [0, 7], [0, 8], [1, 8], [1, 9], [0, 9], [0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [1, 14], [1, 15], [0, 15], [0, 16], [1, 16], [1, 17], [1, 18], [1, 19], [1, 20], [1, 21], [1, 22], [1, 23], [1, 24], [2, 24], [3, 24], [4, 24], [5, 24], [6, 24], [7, 24], [7, 23], [7, 22], [7, 21], [8, 21], [9, 21]] },
  { id: 'a23', pts: [[16, 7], [15, 7], [14, 7], [13, 7], [12, 7]] },
  { id: 'a24', pts: [[12, 8], [13, 8], [14, 8], [15, 8], [16, 8]] },
  { id: 'a25', pts: [[5, 9], [5, 10], [5, 11], [5, 12], [5, 13], [5, 14], [5, 15], [5, 16], [5, 17], [4, 17], [3, 17], [2, 17]] },
  { id: 'a26', pts: [[1, 10], [1, 11], [1, 12], [1, 13]] },
  { id: 'a27', pts: [[3, 16], [3, 15], [3, 14], [3, 13], [3, 12], [3, 11], [3, 10]] },
  { id: 'a28', pts: [[7, 10], [7, 11], [7, 12], [8, 12], [9, 12], [9, 13], [9, 14], [9, 15], [9, 16], [10, 16], [11, 16], [12, 16], [13, 16], [14, 16], [15, 16], [16, 16], [17, 16], [18, 16], [18, 17], [19, 17], [20, 17], [21, 17]] },
  { id: 'a29', pts: [[14, 10], [15, 10]] },
  { id: 'a30', pts: [[12, 11], [11, 11], [11, 12], [12, 12], [13, 12], [14, 12], [14, 13], [15, 13]] },
  { id: 'a31', pts: [[14, 11], [13, 11], [13, 10], [12, 10], [12, 9], [13, 9], [14, 9], [15, 9], [16, 9], [16, 10], [17, 10], [18, 10], [19, 10], [19, 11], [19, 12], [20, 12]] },
  { id: 'a32', pts: [[16, 13], [16, 12], [15, 12], [15, 11], [16, 11]] },
  { id: 'a33', pts: [[17, 11], [18, 11], [18, 12], [17, 12], [17, 13], [18, 13], [19, 13], [19, 14], [20, 14]] },
  { id: 'a34', pts: [[20, 11], [20, 10], [21, 10], [21, 11], [21, 12], [21, 13], [21, 14], [21, 15], [21, 16]] },
  { id: 'a35', pts: [[2, 22], [2, 23], [3, 23], [4, 23], [5, 23], [6, 23], [6, 22], [6, 21], [6, 20], [6, 19], [6, 18], [6, 17], [6, 16], [6, 15], [6, 14], [6, 13], [6, 12], [6, 11], [6, 10], [6, 9], [7, 9], [8, 9], [8, 10], [8, 11], [9, 11], [10, 11], [10, 12]] },
  { id: 'a36', pts: [[10, 13], [11, 13], [12, 13], [13, 13]] },
  { id: 'a37', pts: [[10, 15], [10, 14], [11, 14], [12, 14], [13, 14], [14, 14], [15, 14], [16, 14], [16, 15], [17, 15], [17, 14], [18, 14]] },
  { id: 'a38', pts: [[15, 15], [14, 15], [13, 15], [12, 15], [11, 15]] },
  { id: 'a39', pts: [[18, 15], [19, 15], [19, 16]] },
  { id: 'a40', pts: [[20, 16], [20, 15]] },
  { id: 'a41', pts: [[2, 16], [2, 15], [2, 14], [2, 13], [2, 12], [2, 11], [2, 10], [2, 9], [3, 9], [4, 9], [4, 10], [4, 11], [4, 12], [4, 13], [4, 14], [4, 15], [4, 16]] },
  { id: 'a42', pts: [[8, 16], [8, 15], [8, 14], [8, 13], [7, 13], [7, 14], [7, 15], [7, 16], [7, 17], [7, 18], [7, 19], [7, 20], [8, 20], [9, 20]] },
  { id: 'a43', pts: [[0, 17], [0, 18], [0, 19], [0, 20], [0, 21], [0, 22], [0, 23], [0, 24]] },
  { id: 'a44', pts: [[11, 17], [12, 17], [13, 17], [14, 17], [15, 17], [16, 17]] },
  { id: 'a45', pts: [[17, 17], [17, 18], [17, 19], [16, 19], [15, 19], [14, 19], [13, 19], [12, 19], [11, 19]] },
  { id: 'a46', pts: [[2, 18], [3, 18], [4, 18], [5, 18], [5, 19], [4, 19]] },
  { id: 'a47', pts: [[16, 18], [15, 18], [14, 18], [13, 18], [12, 18], [11, 18]] },
  { id: 'a48', pts: [[19, 18], [18, 18], [18, 19], [19, 19]] },
  { id: 'a49', pts: [[20, 19], [20, 18], [21, 18]] },
  { id: 'a50', pts: [[3, 19], [2, 19], [2, 20], [3, 20], [4, 20], [5, 20], [5, 21], [4, 21], [3, 21], [2, 21]] },
  { id: 'a51', pts: [[8, 19], [9, 19], [9, 18], [8, 18], [8, 17], [9, 17], [10, 17], [10, 18], [10, 19]] },
  { id: 'a52', pts: [[21, 21], [20, 21], [19, 21], [18, 21], [17, 21], [16, 21], [15, 21], [14, 21], [13, 21], [12, 21], [11, 21], [10, 21], [10, 20], [11, 20], [12, 20], [13, 20], [14, 20], [15, 20], [16, 20], [17, 20], [18, 20], [19, 20], [20, 20], [21, 20]] },
  { id: 'a53', pts: [[5, 22], [4, 22], [3, 22]] },
  { id: 'a54', pts: [[5, 25], [6, 25], [7, 25], [7, 26], [8, 26], [8, 25], [8, 24], [8, 23], [8, 22]] },
  { id: 'a55', pts: [[18, 29], [19, 29], [20, 29], [21, 29], [21, 28], [20, 28], [19, 28], [18, 28], [17, 28], [16, 28], [15, 28], [14, 28], [13, 28], [13, 27], [13, 26], [13, 25], [12, 25], [11, 25], [10, 25], [9, 25], [9, 24], [9, 23], [9, 22], [10, 22], [11, 22], [12, 22], [13, 22], [14, 22], [15, 22], [16, 22], [17, 22], [18, 22], [19, 22], [20, 22]] },
  { id: 'a56', pts: [[10, 23], [10, 24], [11, 24], [11, 23], [12, 23], [12, 24], [13, 24], [13, 23], [14, 23], [14, 24], [14, 25], [14, 26], [14, 27]] },
  { id: 'a57', pts: [[16, 23], [15, 23], [15, 24], [16, 24], [17, 24], [17, 23], [18, 23], [18, 24]] },
  { id: 'a58', pts: [[19, 23], [19, 24], [19, 25], [19, 26], [18, 26], [17, 26], [16, 26], [15, 26], [15, 27]] },
  { id: 'a59', pts: [[3, 29], [4, 29], [5, 29], [5, 28], [5, 27], [4, 27], [4, 26], [4, 25], [3, 25], [2, 25], [1, 25], [0, 25]] },
  { id: 'a60', pts: [[15, 25], [16, 25], [17, 25], [18, 25]] },
  { id: 'a61', pts: [[0, 26], [0, 27], [0, 28], [0, 29], [1, 29], [1, 28], [2, 28], [2, 29]] },
  { id: 'a62', pts: [[1, 27], [2, 27], [2, 26], [1, 26]] },
  { id: 'a63', pts: [[3, 26], [3, 27], [3, 28]] },
  { id: 'a64', pts: [[5, 26], [6, 26], [6, 27], [7, 27], [8, 27], [9, 27], [9, 28], [8, 28], [7, 28], [6, 28]] },
  { id: 'a65', pts: [[6, 29], [7, 29], [8, 29], [9, 29], [10, 29], [10, 28], [10, 27], [10, 26], [11, 26], [12, 26]] },
  { id: 'a66', pts: [[11, 27], [11, 28]] },
  { id: 'a67', pts: [[11, 29], [12, 29], [12, 28], [12, 27]] },
  { id: 'a68', pts: [[19, 27], [18, 27], [17, 27], [16, 27]] },
  { id: 'a69', pts: [[20, 27], [20, 26], [20, 25], [20, 24], [20, 23], [21, 23], [21, 24], [21, 25], [21, 26], [21, 27]] },
  { id: 'a70', pts: [[13, 29], [14, 29], [15, 29], [16, 29], [17, 29]] },
];

/* 100% verified removal solution sequence (71/71 arrows) */
const SOLUTION_IDS: string[] = [
  'a3', 'a1', 'a4', 'a8', 'a28', 'a49', 'a48', 'a52', 'a22', 'a9',
  'a20', 'a42', 'a55', 'a59', 'a61', 'a43', 'a25', 'a50', 'a46', 'a62',
  'a26', 'a63', 'a64', 'a69', 'a34', 'a14', 'a31', 'a29', 'a12', 'a15',
  'a33', 'a32', 'a30', 'a36', 'a37', 'a70', 'a56', 'a58', 'a60', 'a65',
  'a51', 'a35', 'a16', 'a17', 'a45', 'a44', 'a47', 'a53', 'a41', 'a13',
  'a0', 'a2', 'a5', 'a6', 'a10', 'a11', 'a19', 'a21', 'a23', 'a24',
  'a27', 'a38', 'a40', 'a54', 'a67', 'a66', 'a68', 'a39', 'a18', 'a57',
  'a7',
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

export default function Level20() {
  const { state, dispatch, showRewardedAd } = useStore();
  const { zoomLevel, panOffset, isPanMode, togglePanMode, isPanned, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isZoomed, boardRef, boardStyle } = useZoom();
  const currentLevelId = state.game?.levelId || 20;

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
      osc.frequency.setValueAtTime(ok ? 520 : 190, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(ok ? 0.038 : 0.028, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (ok ? 0.09 : 0.16));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.1 : 0.18));
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
        el.className = 'lvl20-confetti';
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

  const currentTarget = useCallback((): string | null => {
    for (let k = 0; k < SOLUTION_IDS.length; k++) {
      const id = SOLUTION_IDS[k];
      if (!arrowsRef.current[id]?.gone) return id;
    }
    return null;
  }, []);

  const isExitPathClear = useCallback((id: string): boolean => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return false;
    const [dc, dr] = a.path.dir;
    const sdc = Math.round(dc);
    const sdr = Math.round(dr);
    let [c, r] = a.def.pts[a.def.pts.length - 1];

    const occ = new Set<string>();
    ARROWS.forEach((o) => {
      if (o.id === id || arrowsRef.current[o.id]?.gone) return;
      o.cells.forEach(([cc, rr]) => occ.add(`${cc},${rr}`));
    });

    c += sdc;
    r += sdr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      if (occ.has(`${c},${r}`)) return false;
      c += sdc;
      r += sdr;
    }
    return true;
  }, []);

  const getObstacleGapPx = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = a.path.dir;
    const sdc = Math.round(dc);
    const sdr = Math.round(dr);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += sdc;
    r += sdr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        ARROWS.some(
          (o) =>
            o.id !== id &&
            !arrowsRef.current[o.id]?.gone &&
            o.cells.some(([cc, rr]) => cc === c && rr === r)
        )
      ) {
        return k * CELL;
      }
      c += sdc;
      r += sdr;
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
                moves: 71,
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
      dots.setAttribute('class', 'lvl20-dots');
      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.5');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl20-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl20-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl20-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '16');
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
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl20-stage">
      <div className="lvl20-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl20-topbar">
          <div className="lvl20-btns">
            <button className="lvl20-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl20-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl20-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl20-header-center">
            <div className="lvl20-level">Level {currentLevelId}</div>
            <div className="lvl20-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl20-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl20-round-btn lvl20-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl20-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl20-boardSvg" viewBox="-20 -20 355 475" />
        </div>

        {/* Controls */}
        <div className="lvl20-controls">
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
          <button className="lvl20-round lvl20-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl20-bulb">
              <span className="lvl20-bolt">ϟ</span>
            </span>
            <span className="lvl20-ad">AD</span>
          </button>
          <button
            className="lvl20-round lvl20-calculator"
            onClick={() => showToast('Level 20: 71 Arrows')}
            aria-label="Info"
          >
            <span className="lvl20-calc-icon">
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
        <div className={`lvl20-win ${isWon ? 'on' : ''}`}>
          <div className="lvl20-win-card">
            <h2>Wahnsinn!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl20-trophy">🏆</div>
            <div className="lvl20-stars">★ ★ ★</div>
            <button className="lvl20-next" onClick={handleNextLevel}>
              Level Select ➔
            </button>
            <button className="lvl20-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl20-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl20-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
