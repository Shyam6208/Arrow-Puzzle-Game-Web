import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 15;
const GRID = { cols: 20, rows: 24 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

/* Level 14 source geometry (70 arrows, 20x24 grid) */
const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[7, 0], [6, 0], [5, 0], [4, 0], [3, 0]] },
  { id: 'a1', pts: [[9, 1], [8, 1], [8, 0], [9, 0]] },
  { id: 'a2', pts: [[15, 0], [16, 0]] },
  { id: 'a3', pts: [[18, 1], [18, 0], [19, 0], [19, 1], [19, 2], [18, 2], [17, 2], [16, 2], [16, 1], [17, 1], [17, 0]] },
  { id: 'a4', pts: [[0, 0], [1, 0], [2, 0], [2, 1], [1, 1], [1, 2], [1, 3], [1, 4], [0, 4]] },
  { id: 'a5', pts: [[10, 1], [10, 0], [11, 0], [12, 0], [12, 1], [11, 1], [11, 2], [12, 2], [13, 2], [14, 2], [15, 2]] },
  { id: 'a6', pts: [[14, 1], [14, 0], [13, 0], [13, 1]] },
  { id: 'a7', pts: [[0, 3], [0, 2], [0, 1]] },
  { id: 'a8', pts: [[4, 4], [3, 4], [3, 3], [2, 3], [2, 2], [3, 2], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [7, 2], [7, 3], [7, 4], [7, 5]] },
  { id: 'a9', pts: [[5, 2], [5, 3], [5, 4], [6, 4], [6, 3], [6, 2]] },
  { id: 'a10', pts: [[10, 4], [10, 5], [11, 5], [11, 4], [11, 3], [10, 3], [9, 3], [9, 4], [8, 4], [8, 3], [8, 2], [9, 2], [10, 2]] },
  { id: 'a11', pts: [[4, 2], [4, 3]] },
  { id: 'a12', pts: [[16, 4], [16, 5], [15, 5], [15, 4], [15, 3], [16, 3]] },
  { id: 'a13', pts: [[17, 5], [17, 4], [17, 3]] },
  { id: 'a14', pts: [[18, 3], [18, 4], [18, 5], [19, 5], [19, 4], [19, 3]] },
  { id: 'a15', pts: [[12, 3], [12, 4], [12, 5], [12, 6], [11, 6]] },
  { id: 'a16', pts: [[14, 3], [13, 3], [13, 4], [14, 4], [14, 5], [13, 5], [13, 6], [13, 7], [12, 7], [11, 7], [10, 7], [10, 6]] },
  { id: 'a17', pts: [[3, 5], [3, 6], [3, 7], [2, 7], [2, 6], [2, 5], [2, 4]] },
  { id: 'a18', pts: [[0, 5], [0, 6], [1, 6], [1, 5]] },
  { id: 'a19', pts: [[5, 6], [5, 5], [4, 5], [4, 6], [4, 7], [5, 7], [6, 7], [6, 6], [7, 6], [7, 7]] },
  { id: 'a20', pts: [[9, 15], [9, 14], [9, 13], [9, 12], [9, 11], [9, 10], [9, 9], [9, 8], [9, 7], [9, 6], [9, 5], [8, 5], [8, 6], [8, 7]] },
  { id: 'a21', pts: [[19, 6], [18, 6], [17, 6]] },
  { id: 'a22', pts: [[16, 6], [15, 6], [14, 6], [14, 7], [14, 8], [14, 9], [14, 10]] },
  { id: 'a23', pts: [[18, 9], [18, 8], [19, 8], [19, 7], [18, 7]] },
  { id: 'a24', pts: [[0, 12], [0, 13], [1, 13], [1, 12], [2, 12], [2, 11], [2, 10], [1, 10], [1, 9], [0, 9], [0, 8], [0, 7]] },
  { id: 'a25', pts: [[3, 8], [3, 9], [2, 9], [2, 8], [1, 8], [1, 7]] },
  { id: 'a26', pts: [[17, 9], [17, 8], [17, 7], [16, 7], [16, 8], [15, 8], [15, 7]] },
  { id: 'a27', pts: [[11, 10], [11, 11], [11, 12], [10, 12], [10, 11], [10, 10], [10, 9], [10, 8]] },
  { id: 'a28', pts: [[11, 8], [11, 9], [12, 9], [12, 8]] },
  { id: 'a29', pts: [[4, 8], [5, 8], [5, 9], [4, 9]] },
  { id: 'a30', pts: [[6, 8], [6, 9], [6, 10], [6, 11], [7, 11], [7, 12]] },
  { id: 'a31', pts: [[8, 10], [8, 9], [8, 8], [7, 8], [7, 9], [7, 10]] },
  { id: 'a32', pts: [[13, 8], [13, 9], [13, 10], [12, 10], [12, 11], [13, 11], [13, 12], [12, 12], [12, 13], [13, 13], [13, 14], [12, 14], [12, 15], [11, 15], [11, 14], [11, 13]] },
  { id: 'a33', pts: [[15, 9], [15, 10], [15, 11], [14, 11], [14, 12], [15, 12], [15, 13], [14, 13], [14, 14], [15, 14], [15, 15], [14, 15], [14, 16]] },
  { id: 'a34', pts: [[19, 9], [19, 10], [19, 11]] },
  { id: 'a35', pts: [[4, 10], [5, 10]] },
  { id: 'a36', pts: [[18, 11], [17, 11], [17, 12], [17, 13], [17, 14], [16, 14], [16, 13], [16, 12], [16, 11], [16, 10], [17, 10], [18, 10]] },
  { id: 'a37', pts: [[3, 10], [3, 11], [3, 12], [3, 13], [2, 13]] },
  { id: 'a38', pts: [[1, 11], [0, 11]] },
  { id: 'a39', pts: [[5, 11], [4, 11], [4, 12], [4, 13], [4, 14], [5, 14], [6, 14], [6, 15], [5, 15], [4, 15]] },
  { id: 'a40', pts: [[8, 11], [8, 12], [8, 13]] },
  { id: 'a41', pts: [[19, 13], [19, 14], [18, 14], [18, 13], [18, 12], [19, 12]] },
  { id: 'a42', pts: [[6, 12], [5, 12], [5, 13], [6, 13], [7, 13], [7, 14], [8, 14], [8, 15], [7, 15], [7, 16], [7, 17], [7, 18]] },
  { id: 'a43', pts: [[9, 23], [10, 23], [11, 23], [11, 22], [10, 22], [10, 21], [10, 20], [10, 19], [10, 18], [10, 17], [10, 16], [10, 15], [10, 14], [10, 13]] },
  { id: 'a44', pts: [[0, 14], [0, 15], [0, 16], [1, 16], [1, 15], [1, 14]] },
  { id: 'a45', pts: [[2, 14], [2, 15], [3, 15], [3, 14]] },
  { id: 'a46', pts: [[13, 15], [13, 16], [12, 16], [11, 16], [11, 17], [12, 17]] },
  { id: 'a47', pts: [[17, 17], [16, 17], [16, 16], [17, 16], [17, 15], [18, 15], [18, 16], [18, 17]] },
  { id: 'a48', pts: [[19, 15], [19, 16], [19, 17]] },
  { id: 'a49', pts: [[2, 17], [3, 17], [3, 16], [2, 16]] },
  { id: 'a50', pts: [[5, 17], [6, 17], [6, 16], [5, 16]] },
  { id: 'a51', pts: [[15, 18], [15, 17], [15, 16]] },
  { id: 'a52', pts: [[4, 16], [4, 17], [4, 18], [4, 19], [5, 19], [5, 18], [6, 18], [6, 19], [6, 20], [5, 20]] },
  { id: 'a53', pts: [[8, 17], [8, 16], [9, 16], [9, 17], [9, 18], [8, 18]] },
  { id: 'a54', pts: [[1, 17], [1, 18], [1, 19], [1, 20], [0, 20], [0, 19], [0, 18], [0, 17]] },
  { id: 'a55', pts: [[14, 22], [14, 21], [14, 20], [14, 19], [14, 18], [14, 17], [13, 17], [13, 18], [12, 18], [12, 19], [13, 19], [13, 20], [13, 21], [13, 22], [12, 22]] },
  { id: 'a56', pts: [[2, 18], [2, 19], [3, 19], [3, 18]] },
  { id: 'a57', pts: [[11, 18], [11, 19]] },
  { id: 'a58', pts: [[18, 22], [18, 21], [19, 21], [19, 20], [19, 19], [19, 18], [18, 18], [17, 18], [16, 18], [16, 19], [17, 19], [18, 19], [18, 20], [17, 20], [17, 21]] },
  { id: 'a59', pts: [[7, 20], [7, 19], [8, 19]] },
  { id: 'a60', pts: [[17, 22], [16, 22], [15, 22], [15, 21], [16, 21], [16, 20], [15, 20], [15, 19]] },
  { id: 'a61', pts: [[9, 19], [9, 20], [8, 20], [8, 21], [9, 21], [9, 22]] },
  { id: 'a62', pts: [[12, 21], [11, 21], [11, 20], [12, 20]] },
  { id: 'a63', pts: [[2, 20], [2, 21], [3, 21]] },
  { id: 'a64', pts: [[3, 20], [4, 20], [4, 21]] },
  { id: 'a65', pts: [[0, 23], [1, 23], [2, 23], [3, 23], [4, 23], [4, 22], [3, 22], [2, 22], [1, 22], [1, 21], [0, 21]] },
  { id: 'a66', pts: [[5, 21], [6, 21], [7, 21]] },
  { id: 'a67', pts: [[7, 22], [6, 22], [5, 22], [5, 23], [6, 23], [7, 23]] },
  { id: 'a68', pts: [[8, 22], [8, 23]] },
  { id: 'a69', pts: [[12, 23], [13, 23], [14, 23], [15, 23], [16, 23], [17, 23], [18, 23], [19, 23]] }
];

/* Verified solvable removal order for Level 14 */
const SOLUTION = [
  'a3', 'a2', 'a4', 'a0', 'a5', 'a7', 'a10', 'a13', 'a14', 'a12',
  'a16', 'a18', 'a24', 'a25', 'a27', 'a29', 'a37', 'a38', 'a41', 'a43',
  'a44', 'a49', 'a50', 'a54', 'a61', 'a65', 'a64', 'a52', 'a68', 'a69',
  'a58', 'a47', 'a48', 'a34', 'a36', 'a67', 'a55', 'a33', 'a22', 'a26',
  'a51', 'a46', 'a60', 'a62', 'a57', 'a59', 'a66', 'a42', 'a30', 'a31',
  'a19', 'a8', 'a9', 'a17', 'a45', 'a39', 'a11', 'a56', 'a53', 'a40',
  'a20', 'a15', 'a21', 'a23', 'a28', 'a32', 'a6', 'a1', 'a35', 'a63'
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [];
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

const ARROWS: Required<ArrowDef>[] = RAW_ARROWS.map((a) => ({
  ...a,
  cells: a.cells || cellsOf(a),
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
  while (arcs[i] < p) i++;
  const t = (p - arcs[i - 1]) / (arcs[i] - arcs[i - 1]);
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
  return us
    .filter((u, i) => !i || u - us[i - 1] >= 0.01)
    .map((u) => pointAt(path, u + s));
}

function drawArrow(
  line: SVGPolylineElement,
  head: SVGPathElement,
  g: SVGGElement,
  path: PathInfo,
  s: number,
  op: number,
  hitArea?: SVGPolylineElement
) {
  const shape = pulledShape(path, s);
  const CAP = 2.8;

  // Keep every arrow visually separated at its tail and head.
  if (s < path.L && shape.length > 1) {
    const tdx = shape[1][0] - shape[0][0];
    const tdy = shape[1][1] - shape[0][1];
    const tl = Math.hypot(tdx, tdy) || 1;
    shape[0] = [shape[0][0] + (tdx / tl) * CAP, shape[0][1] + (tdy / tl) * CAP];
  }

  const rawHead = pointAt(path, path.L + s);
  const hx = rawHead[0] + path.dir[0] * CAP;
  const hy = rawHead[1] + path.dir[1] * CAP;
  if (shape.length) shape[shape.length - 1] = [hx, hy];

  line.setAttribute('points', shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' '));
  if (hitArea) hitArea.setAttribute('points', line.getAttribute('points')!);
  const ang = (Math.atan2(path.dir[1], path.dir[0]) * 180) / Math.PI;
  head.setAttribute('transform', `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`);
  g.setAttribute('opacity', String(op));
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
  def: Required<ArrowDef>;
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

export default function Level14() {
  const { dispatch, showRewardedAd } = useStore();
  const { zoomLevel, panOffset, isPanMode, togglePanMode, isPanned, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isZoomed, boardRef, boardStyle } = useZoom();
  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 800);
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

  const playTapSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(620, now);
      o.frequency.exponentialRampToValueAtTime(430, now + 0.055);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.08);
    } catch {}
  };

  const playCollisionSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'triangle';
      o.frequency.setValueAtTime(170, now);
      o.frequency.exponentialRampToValueAtTime(65, now + 0.12);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.15);
    } catch {}
  };

  const playFailSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const now = ctx.currentTime;
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sawtooth';
      o.frequency.setValueAtTime(260, now);
      o.frequency.exponentialRampToValueAtTime(95, now + 0.32);
      g.gain.setValueAtTime(0.2, now);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.35);
      o.connect(g);
      g.connect(ctx.destination);
      o.start(now);
      o.stop(now + 0.36);
    } catch {}
  };

  function isBlocked(id: string): boolean {
    const a = arrowsRef.current[id];
    if (!a) return false;
    const def = a.def;
    const ray = new Set(rayCells(def));
    return ARROWS.some(
      (o) =>
        o.id !== id &&
        !arrowsRef.current[o.id].gone &&
        o.cells.some(([c, r]) => ray.has(`${c},${r}`))
    );
  }

  function gapPx(id: string): number {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const def = a.def;
    const [dc, dr] = cellDir(def);
    let [c, r] = def.pts[def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        ARROWS.some(
          (o) =>
            o.id !== id &&
            !arrowsRef.current[o.id].gone &&
            o.cells.some(([cc, rr]) => cc === c && rr === r)
        )
      ) {
        return k * CELL;
      }
      c += dc;
      r += dr;
    }
    return 9999;
  }

  function resetUnlockedWrongLocks() {
    ARROWS.forEach((o) => {
      const a = arrowsRef.current[o.id];
      if (a && !a.gone && !isBlocked(o.id)) {
        a.wrongLocked = false;
      }
    });
  }

  const remove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      clearedRef.current++;

      a.g.classList.remove('hit');
      a.g.classList.add('fly');

      resetUnlockedWrongLocks();

      const L = a.path.L;
      const dist = L + 320;
      const dur = 720 + L * 3.0;
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
          if (clearedRef.current === ARROWS.length) {
            window.setTimeout(() => {
              setIsWon(true);
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: 14,
                moves: 70,
                stars: 3,
              });
            }, 420);
          }
        }
      }

      requestAnimationFrame(frame);
    },
    [dispatch]
  );

  const collide = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy) return;

      a.busy = true;

      if (!a.wrongLocked) {
        a.wrongLocked = true;
        setMistakes((curr) => {
          const next = curr + 1;
          if (next >= 3) {
            isInputLockedRef.current = true;
            playFailSound();
            showToast('Out of Lives!');
            window.setTimeout(() => {
              isInputLockedRef.current = false;
              setIsWon(false);
              setMistakes(0);
              buildBoardRef.current();
            }, 850);
          }
          return next;
        });
      }

      a.g.classList.add('hit');
      playCollisionSound();

      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
      }

      const bump = Math.max(6, Math.min(gapPx(id) - 6, 34));
      const dur = 420;
      const start = performance.now();

      function fr(now: number) {
        const k = Math.min(1, (now - start) / dur);
        const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);

        drawArrow(a.line, a.head, a.g, a.path, bump * e, 1, a.hitArea);

        if (k < 1) {
          requestAnimationFrame(fr);
        } else {
          drawArrow(a.line, a.head, a.g, a.path, 0, 1, a.hitArea);
          a.busy = false;
          a.g.classList.remove('hit');
        }
      }

      requestAnimationFrame(fr);
    },
    [showToast]
  );

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy) return;
      if (isBlocked(id)) {
        collide(id);
        return;
      }
      remove(id);
    },
    [collide, remove]
  );

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    isInputLockedRef.current = false;

    ARROWS.forEach((def) => {
      const path = makePath(def);
      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl14-dots');

      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.6');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl14-arrow pop');

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl14-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl14-head');
      head.setAttribute('d', 'M6 0 L-3.5 -5 L-3.5 5 Z');

      // Wide invisible hit area for reliable taps
      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '22');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('pointer-events', 'stroke');
      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);
      svg.appendChild(g);

      const runtime: ArrowRuntime = {
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

      arrowsRef.current[def.id] = runtime;
      drawArrow(line, head, g, path, 0, 1, hitArea);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (isInputLockedRef.current || runtime.gone || runtime.busy) return;
        playTapSound();
        tryRemove(def.id);
      });
    });
  }, [tryRemove]);

  useEffect(() => {
    buildBoardRef.current = buildBoard;
    buildBoard();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [buildBoard]);

  const revealSolvableHint = useCallback(() => {
    const nextSolvableId =
      SOLUTION.find(
        (id) =>
          arrowsRef.current[id] &&
          !arrowsRef.current[id].gone &&
          !arrowsRef.current[id].busy &&
          !isBlocked(id)
      ) ||
      ARROWS.find(
        (a) =>
          arrowsRef.current[a.id] &&
          !arrowsRef.current[a.id].gone &&
          !arrowsRef.current[a.id].busy &&
          !isBlocked(a.id)
      )?.id;

    if (!nextSolvableId) {
      showToast('No solvable arrows remaining');
      return;
    }

    const a = arrowsRef.current[nextSolvableId];
    if (a) {
      a.g.animate(
        [
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.05)',
          },
          { filter: 'drop-shadow(0 0 6px rgba(91,108,243,0.5))', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.05)',
          },
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
        ],
        { duration: 1500, iterations: 1 }
      );
      showToast('Hint: Solvable Arrow Highlighted!');
    }
  }, [showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    const nextSolvableId =
      SOLUTION.find(
        (id) =>
          arrowsRef.current[id] &&
          !arrowsRef.current[id].gone &&
          !arrowsRef.current[id].busy &&
          !isBlocked(id)
      ) ||
      ARROWS.find(
        (a) =>
          arrowsRef.current[a.id] &&
          !arrowsRef.current[a.id].gone &&
          !arrowsRef.current[a.id].busy &&
          !isBlocked(a.id)
      )?.id;

    if (!nextSolvableId) {
      showToast('No solvable arrows remaining');
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
    <div className="lvl14-stage">
      <div className="lvl14-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl14-topbar">
          <button className="lvl14-top-btn lvl14-back" onClick={handleLevels} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl14-header-center">
            <div className="lvl14-level">Level 14</div>
            <div className="lvl14-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl14-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl14-top-btn lvl14-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl14-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl14-boardSvg" viewBox="-8 -8 301 361" />
        </div>

        {/* Controls */}
        <div className="lvl14-controls">
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
          <button className="lvl14-round lvl14-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl14-bulb">
              <span className="lvl14-bolt">ϟ</span>
            </span>
            <span className="lvl14-ad">AD</span>
          </button>
          <button
            className="lvl14-round lvl14-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl14-calc-icon">
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
        <div className={`lvl14-win ${isWon ? 'on' : ''}`}>
          <div className="lvl14-win-card">
            <h2>Level Complete!</h2>
            <p>Level 14 cleared</p>
            <div className="lvl14-trophy">🏆</div>
            <div className="lvl14-stars">★ ★ ★</div>
            <button className="lvl14-next" onClick={handleNextLevel}>
              Level Select ➔
            </button>
            <button className="lvl14-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl14-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl14-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
