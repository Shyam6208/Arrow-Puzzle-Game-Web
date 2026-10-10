import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 10;
const GRID = { cols: 25, rows: 33 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  free?: number;
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[12, 10], [12, 11], [12, 12], [13, 12], [13, 11], [13, 10], [14, 10], [14, 11], [14, 12], [14, 13], [15, 13], [16, 13], [17, 13], [17, 14], [17, 15], [17, 16], [17, 17], [18, 17]] },
  { id: 'a1', pts: [[15, 30], [15, 29], [15, 28], [15, 27], [15, 26]] },
  { id: 'a2', pts: [[4, 26], [4, 25], [4, 24], [4, 23], [5, 23], [6, 23], [7, 23], [7, 24], [8, 24], [8, 25], [7, 25], [7, 26]] },
  { id: 'a3', pts: [[15, 10], [16, 10], [17, 10], [18, 10], [19, 10], [19, 9]] },
  { id: 'a4', pts: [[18, 3], [18, 4], [18, 5], [18, 6]] },
  { id: 'a5', pts: [[13, 15], [14, 15], [14, 16], [15, 16]] },
  { id: 'a6', pts: [[15, 25], [14, 25], [13, 25], [12, 25], [12, 24], [12, 23], [12, 22], [13, 22], [14, 22], [15, 22], [15, 21], [15, 20], [15, 19], [14, 19], [13, 19], [12, 19]] },
  { id: 'a7', pts: [[7, 30], [7, 29], [7, 28], [6, 28], [6, 27], [7, 27], [8, 27], [8, 26], [9, 26], [9, 25], [9, 24], [9, 23], [8, 23], [8, 22], [7, 22], [6, 22], [5, 22], [4, 22]] },
  { id: 'a8', pts: [[8, 4], [7, 4], [6, 4]] },
  { id: 'a9', pts: [[21, 18], [21, 17], [21, 16], [21, 15]] },
  { id: 'a10', pts: [[6, 13], [7, 13], [8, 13], [9, 13], [9, 14], [9, 15], [10, 15], [10, 16], [10, 17]] },
  { id: 'a11', pts: [[3, 4], [4, 4], [4, 5], [3, 5]] },
  { id: 'a12', pts: [[14, 14], [13, 14], [13, 13]] },
  { id: 'a13', pts: [[15, 6], [14, 6], [13, 6], [13, 5]] },
  { id: 'a14', pts: [[24, 25], [24, 26], [24, 27], [24, 28], [24, 29], [24, 30], [23, 30], [22, 30], [22, 29], [22, 28], [22, 27], [22, 26], [22, 25], [21, 25], [20, 25], [19, 25], [18, 25], [17, 25]] },
  { id: 'a15', pts: [[11, 6], [12, 6], [12, 5], [11, 5], [10, 5], [10, 4], [11, 4], [12, 4], [12, 3], [11, 3], [10, 3]] },
  { id: 'a16', pts: [[6, 26], [6, 25], [6, 24], [5, 24], [5, 25], [5, 26], [5, 27], [4, 27], [4, 28], [4, 29], [5, 29], [6, 29], [6, 30], [5, 30], [4, 30], [3, 30], [2, 30], [2, 31], [2, 32], [3, 32], [4, 32], [5, 32], [6, 32], [7, 32], [8, 32], [9, 32], [10, 32], [11, 32], [12, 32], [13, 32], [14, 32], [15, 32], [16, 32], [17, 32], [18, 32], [19, 32], [20, 32], [21, 32], [22, 32], [23, 32], [24, 32]] },
  { id: 'a17', pts: [[5, 11], [6, 11], [6, 10]] },
  { id: 'a18', pts: [[19, 8], [20, 8], [21, 8]] },
  { id: 'a19', pts: [[21, 26], [21, 27], [21, 28], [21, 29], [21, 30], [20, 30], [20, 29], [19, 29]] },
  { id: 'a20', pts: [[2, 3], [3, 3], [4, 3], [5, 3], [6, 3], [7, 3], [8, 3], [9, 3], [9, 4], [9, 5], [8, 5], [8, 6], [9, 6], [10, 6], [10, 7], [11, 7]] },
  { id: 'a21', pts: [[10, 25], [10, 26], [10, 27], [10, 28], [10, 29]] },
  { id: 'a22', pts: [[11, 27], [12, 27], [13, 27]] },
  { id: 'a23', pts: [[6, 5], [7, 5], [7, 6], [7, 7], [8, 7], [9, 7], [9, 8], [9, 9], [9, 10], [9, 11]] },
  { id: 'a24', pts: [[20, 12], [20, 13], [21, 13], [21, 12]] },
  { id: 'a25', pts: [[2, 7], [2, 8], [2, 9], [2, 10], [2, 11], [2, 12], [2, 13], [2, 14], [2, 15], [2, 16], [2, 17], [2, 18], [2, 19], [2, 20], [2, 21], [2, 22], [2, 23], [2, 24], [2, 25], [2, 26], [2, 27], [2, 28], [2, 29]] },
  { id: 'a26', pts: [[24, 31], [23, 31], [22, 31], [21, 31], [20, 31], [19, 31], [18, 31], [17, 31], [16, 31], [15, 31], [14, 31], [13, 31], [12, 31], [11, 31], [10, 31], [9, 31], [8, 31], [7, 31], [6, 31], [5, 31], [4, 31], [3, 31]] },
  { id: 'a27', pts: [[18, 19], [17, 19]] },
  { id: 'a28', pts: [[7, 10], [7, 9], [6, 9]] },
  { id: 'a29', pts: [[21, 7], [20, 7], [20, 6], [20, 5], [20, 4]] },
  { id: 'a30', pts: [[23, 25], [23, 26], [23, 27], [23, 28], [23, 29]] },
  { id: 'a31', pts: [[24, 14], [23, 14], [23, 15], [24, 15], [24, 16], [23, 16], [23, 17], [24, 17]] },
  { id: 'a32', pts: [[4, 21], [5, 21]] },
  { id: 'a33', pts: [[16, 23], [16, 22], [16, 21], [17, 21], [17, 22], [17, 23]] },
  { id: 'a34', pts: [[18, 9], [18, 8], [18, 7], [19, 7], [19, 6], [19, 5], [19, 4], [19, 3], [20, 3], [21, 3], [22, 3], [22, 4], [22, 5], [23, 5], [24, 5], [24, 4], [23, 4], [23, 3], [24, 3]] },
  { id: 'a35', pts: [[15, 4], [16, 4], [16, 3], [15, 3], [14, 3], [13, 3], [13, 4], [14, 4], [14, 5], [15, 5], [16, 5], [16, 6], [16, 7], [15, 7], [15, 8], [16, 8]] },
  { id: 'a36', pts: [[18, 27], [17, 27], [17, 26], [18, 26], [19, 26], [19, 27]] },
  { id: 'a37', pts: [[12, 15], [12, 14], [11, 14], [10, 14], [10, 13], [10, 12], [9, 12], [8, 12]] },
  { id: 'a38', pts: [[20, 28], [19, 28], [18, 28], [17, 28], [16, 28], [16, 27], [16, 26], [16, 25], [16, 24], [17, 24], [18, 24], [19, 24], [20, 24], [20, 23], [20, 22], [20, 21], [20, 20], [19, 20], [18, 20], [17, 20], [16, 20], [16, 19]] },
  { id: 'a39', pts: [[4, 11], [4, 10], [5, 10]] },
  { id: 'a40', pts: [[23, 24], [23, 23], [23, 22], [23, 21], [23, 20], [23, 19]] },
  { id: 'a41', pts: [[8, 17], [7, 17], [7, 16], [6, 16], [6, 17], [6, 18], [5, 18], [5, 19], [5, 20], [4, 20]] },
  { id: 'a42', pts: [[19, 30], [18, 30], [18, 29], [17, 29], [16, 29], [16, 30]] },
  { id: 'a43', pts: [[11, 18], [11, 17], [11, 16], [11, 15]] },
  { id: 'a44', pts: [[21, 9], [21, 10], [20, 10], [20, 9]] },
  { id: 'a45', pts: [[20, 18], [19, 18], [18, 18], [17, 18], [16, 18], [15, 18], [14, 18], [14, 17]] },
  { id: 'a46', pts: [[4, 19], [4, 18], [4, 17], [5, 17], [5, 16], [5, 15], [5, 14], [5, 13], [5, 12], [4, 12]] },
  { id: 'a47', pts: [[8, 21], [7, 21], [6, 21], [6, 20], [7, 20], [7, 19], [8, 19], [8, 18], [7, 18]] },
  { id: 'a48', pts: [[19, 23], [18, 23], [18, 22], [18, 21], [19, 21]] },
  { id: 'a49', pts: [[14, 30], [13, 30], [12, 30], [11, 30], [10, 30], [9, 30], [8, 30]] },
  { id: 'a50', pts: [[11, 26], [12, 26], [13, 26], [14, 26], [14, 27], [14, 28], [14, 29], [13, 29], [12, 29], [11, 29]] },
  { id: 'a51', pts: [[15, 17], [16, 17], [16, 16], [16, 15], [15, 15], [15, 14]] },
  { id: 'a52', pts: [[11, 25], [11, 24], [11, 23], [10, 23], [10, 24]] },
  { id: 'a53', pts: [[14, 20], [13, 20], [12, 20], [12, 21], [13, 21], [14, 21]] },
  { id: 'a54', pts: [[24, 24], [24, 23], [24, 22], [24, 21], [24, 20], [24, 19], [24, 18], [23, 18], [22, 18], [22, 17], [22, 16], [22, 15], [22, 14], [21, 14], [20, 14], [19, 14], [18, 14], [18, 13], [19, 13], [19, 12], [18, 12], [17, 12], [16, 12], [15, 12], [15, 11], [16, 11], [17, 11], [18, 11], [19, 11], [20, 11], [21, 11]] },
  { id: 'a55', pts: [[21, 20], [21, 21], [21, 22], [21, 23], [21, 24]] },
  { id: 'a56', pts: [[9, 21], [9, 22], [10, 22], [11, 22], [11, 21], [10, 21], [10, 20], [11, 20], [11, 19], [10, 19]] },
  { id: 'a57', pts: [[3, 29], [3, 28], [3, 27], [3, 26], [3, 25], [3, 24], [3, 23], [3, 22], [3, 21], [3, 20], [3, 19], [3, 18], [3, 17], [3, 16], [3, 15], [3, 14], [3, 13], [3, 12], [3, 11], [3, 10], [3, 9], [3, 8], [3, 7]] },
  { id: 'a58', pts: [[6, 8], [5, 8], [5, 7], [6, 7], [6, 6], [5, 6], [5, 5], [5, 4]] },
  { id: 'a59', pts: [[21, 6], [21, 5], [21, 4]] },
  { id: 'a60', pts: [[23, 12], [23, 11], [23, 10], [23, 9], [23, 8], [23, 7], [23, 6], [24, 6], [24, 7], [24, 8], [24, 9], [24, 10], [24, 11], [24, 12], [24, 13], [23, 13], [22, 13], [22, 12], [22, 11], [22, 10], [22, 9], [22, 8], [22, 7], [22, 6]] },
  { id: 'a61', pts: [[9, 27], [9, 28], [9, 29], [8, 29]] },
  { id: 'a62', pts: [[6, 12], [7, 12], [7, 11], [8, 11], [8, 10], [8, 9], [8, 8], [7, 8]] },
  { id: 'a63', pts: [[20, 27], [20, 26]] },
  { id: 'a64', pts: [[13, 23], [14, 23], [15, 23], [15, 24], [14, 24], [13, 24]] },
  { id: 'a65', pts: [[12, 7], [12, 8], [11, 8], [10, 8], [10, 9], [11, 9], [12, 9], [13, 9], [13, 8], [13, 7], [14, 7], [14, 8], [14, 9], [15, 9], [16, 9], [17, 9], [17, 8], [17, 7], [17, 6], [17, 5], [17, 4], [17, 3]] },
  { id: 'a66', pts: [[12, 17], [12, 16], [13, 16], [13, 17], [13, 18], [12, 18]] },
  { id: 'a67', pts: [[5, 9], [4, 9], [4, 8], [4, 7], [4, 6], [3, 6], [2, 6], [2, 5], [2, 4]] },
  { id: 'a68', pts: [[13, 28], [12, 28], [11, 28]] },
  { id: 'a69', pts: [[12, 13], [11, 13], [11, 12], [11, 11], [10, 11], [10, 10], [11, 10]] },
  { id: 'a70', pts: [[8, 14], [7, 14], [6, 14], [6, 15], [7, 15], [8, 15], [8, 16], [9, 16], [9, 17], [9, 18], [9, 19], [9, 20], [8, 20]] },
  { id: 'a71', pts: [[4, 13], [4, 14], [4, 15], [4, 16]] },
  { id: 'a72', pts: [[20, 16], [20, 17], [19, 17], [19, 16], [18, 16], [18, 15], [19, 15]] },
  { id: 'a73', pts: [[19, 19], [20, 19], [21, 19], [22, 19], [22, 20], [22, 21], [22, 22], [22, 23], [22, 24]] },
];

/* 100% verified greedy removal solution sequence (74/74 arrows) */
const SOLUTION_IDS: string[] = [
  'a16', 'a25', 'a26', 'a31', 'a34', 'a29', 'a42', 'a59', 'a60', 'a18',
  'a3', 'a44', 'a54', 'a24', 'a9', 'a40', 'a65', 'a35', 'a13', 'a20',
  'a15', 'a58', 'a67', 'a11', 'a8', 'a57', 'a7', 'a2', 'a28', 'a41',
  'a46', 'a47', 'a49', 'a21', 'a52', 'a61', 'a50', 'a62', 'a37', 'a68',
  'a70', 'a56', 'a6', 'a10', 'a23', 'a17', 'a64', 'a72', 'a0', 'a12',
  'a51', 'a5', 'a45', 'a1', 'a19', 'a38', 'a14', 'a27', 'a30', 'a36',
  'a33', 'a55', 'a69', 'a39', 'a43', 'a66', 'a73', 'a48', 'a4', 'a53',
  'a32', 'a63', 'a22', 'a71',
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

export default function Level31() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 31;

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
        el.className = 'lvl31-confetti';
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
                moves: 74,
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
      dots.setAttribute('class', 'lvl31-dots');
      def.cells?.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.5');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl31-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl31-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl31-head');
      head.setAttribute('d', 'M3.6 0 L-3.9 -3.7 L-3.9 3.7 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '9.5');
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
    <div className="lvl31-stage">
      <div className="lvl31-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl31-topbar">
          <div className="lvl31-btns">
            <button className="lvl31-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl31-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl31-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl31-header-center">
            <div className="lvl31-level">Level {currentLevelId}</div>
            <div className="lvl31-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl31-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl31-round-btn lvl31-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl31-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl31-boardSvg" viewBox="-14 -14 268 348" />
        </div>

        {/* Controls */}
        <div className="lvl31-controls">
          <button className="lvl31-round lvl31-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl31-bulb">
              <span className="lvl31-bolt">ϟ</span>
            </span>
            <span className="lvl31-ad">AD</span>
          </button>
          <button
            className="lvl31-round lvl31-calculator"
            onClick={() => showToast('Level 31: 74 Arrows')}
            aria-label="Info"
          >
            <span className="lvl31-calc-icon">
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
        <div className={`lvl31-win ${isWon ? 'on' : ''}`}>
          <div className="lvl31-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl31-trophy">🏆</div>
            <div className="lvl31-stars">★ ★ ★</div>
            <button className="lvl31-next" onClick={handleLevelSelect}>
              Level Select ➔
            </button>
            <button className="lvl31-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl31-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl31-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
