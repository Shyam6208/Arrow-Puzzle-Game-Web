import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 14, rows: 20 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

/* Level 12 source geometry (46 arrows, 14x20 grid) */
const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0]] },
  { id: 'a1', pts: [[10, 4], [10, 3], [10, 2], [10, 1], [10, 0]] },
  { id: 'a2', pts: [[7, 4], [7, 5], [7, 6], [7, 7], [7, 8], [7, 9], [7, 10], [8, 10], [9, 10], [10, 10], [11, 10], [12, 10], [12, 9], [12, 8], [12, 7], [12, 6], [12, 5], [12, 4], [12, 3], [12, 2], [12, 1], [12, 0]] },
  { id: 'a3', pts: [[13, 17], [13, 16], [13, 15], [13, 14], [13, 13], [13, 12], [13, 11], [13, 10], [13, 9], [13, 8], [13, 7], [13, 6], [13, 5], [13, 4], [13, 3], [13, 2], [13, 1], [13, 0]] },
  { id: 'a4', pts: [[1, 0], [0, 0], [0, 1], [0, 2], [0, 3], [0, 4], [0, 5], [0, 6], [0, 7], [0, 8], [0, 9], [1, 9], [2, 9], [3, 9], [3, 10], [2, 10], [1, 10]] },
  { id: 'a5', pts: [[2, 1], [3, 1], [4, 1], [5, 1], [6, 1], [7, 1], [8, 1]] },
  { id: 'a6', pts: [[1, 3], [1, 2], [1, 1]] },
  { id: 'a7', pts: [[11, 1], [11, 2], [11, 3], [11, 4], [11, 5], [11, 6], [10, 6], [9, 6], [8, 6], [8, 5], [8, 4], [9, 4], [9, 3], [9, 2]] },
  { id: 'a8', pts: [[7, 3], [8, 3], [8, 2], [7, 2]] },
  { id: 'a9', pts: [[4, 3], [4, 2]] },
  { id: 'a10', pts: [[2, 2], [2, 3]] },
  { id: 'a11', pts: [[3, 2], [3, 3]] },
  { id: 'a12', pts: [[5, 2], [6, 2], [6, 3], [5, 3]] },
  { id: 'a13', pts: [[1, 4], [2, 4], [3, 4], [4, 4], [5, 4], [6, 4]] },
  { id: 'a14', pts: [[2, 7], [2, 6], [1, 6], [1, 5], [2, 5]] },
  { id: 'a15', pts: [[9, 5], [10, 5]] },
  { id: 'a16', pts: [[6, 6], [6, 5], [5, 5], [5, 6], [5, 7], [4, 7], [4, 6], [4, 5], [3, 5], [3, 6], [3, 7], [3, 8], [4, 8], [5, 8], [5, 9], [5, 10], [5, 11], [6, 11], [7, 11], [8, 11], [9, 11], [10, 11], [11, 11], [12, 11]] },
  { id: 'a17', pts: [[2, 8], [1, 8], [1, 7]] },
  { id: 'a18', pts: [[6, 10], [6, 9], [6, 8], [6, 7]] },
  { id: 'a19', pts: [[8, 7], [9, 7], [10, 7]] },
  { id: 'a20', pts: [[11, 9], [11, 8], [11, 7]] },
  { id: 'a21', pts: [[8, 8], [9, 8]] },
  { id: 'a22', pts: [[10, 8], [10, 9], [9, 9], [8, 9]] },
  { id: 'a23', pts: [[2, 14], [1, 14], [1, 13], [2, 13], [3, 13], [4, 13], [4, 12], [4, 11], [4, 10], [4, 9]] },
  { id: 'a24', pts: [[0, 10], [0, 11], [0, 12], [0, 13], [0, 14], [0, 15], [0, 16], [1, 16], [1, 15], [2, 15], [3, 15], [3, 14], [4, 14]] },
  { id: 'a25', pts: [[1, 11], [2, 11], [3, 11], [3, 12]] },
  { id: 'a26', pts: [[2, 12], [1, 12]] },
  { id: 'a27', pts: [[5, 14], [5, 13], [5, 12], [6, 12], [7, 12], [8, 12], [9, 12], [10, 12]] },
  { id: 'a28', pts: [[10, 13], [11, 13], [11, 12], [12, 12], [12, 13], [12, 14]] },
  { id: 'a29', pts: [[6, 15], [6, 14], [6, 13], [7, 13], [8, 13], [9, 13]] },
  { id: 'a30', pts: [[7, 15], [7, 14], [8, 14]] },
  { id: 'a31', pts: [[11, 14], [10, 14], [9, 14], [9, 15], [9, 16], [9, 17], [9, 18], [9, 19]] },
  { id: 'a32', pts: [[4, 15], [5, 15]] },
  { id: 'a33', pts: [[8, 16], [8, 15]] },
  { id: 'a34', pts: [[12, 16], [12, 15], [11, 15], [10, 15], [10, 16], [10, 17], [10, 18]] },
  { id: 'a35', pts: [[4, 18], [4, 17], [5, 17], [5, 16], [4, 16]] },
  { id: 'a36', pts: [[6, 17], [6, 16], [7, 16]] },
  { id: 'a37', pts: [[1, 18], [1, 17], [2, 17], [3, 17], [3, 16], [2, 16]] },
  { id: 'a38', pts: [[11, 16], [11, 17], [12, 17]] },
  { id: 'a39', pts: [[0, 18], [0, 17]] },
  { id: 'a40', pts: [[8, 17], [7, 17]] },
  { id: 'a41', pts: [[3, 18], [2, 18]] },
  { id: 'a42', pts: [[5, 18], [6, 18]] },
  { id: 'a43', pts: [[11, 18], [12, 18], [13, 18]] },
  { id: 'a44', pts: [[7, 18], [8, 18], [8, 19], [7, 19], [6, 19], [5, 19], [4, 19], [3, 19], [2, 19], [1, 19], [0, 19]] },
  { id: 'a45', pts: [[13, 19], [12, 19], [11, 19], [10, 19]] }
];

/* Verified solvable removal order for the supplied geometry */
const SOLUTION = [
  'a1', 'a2', 'a3', 'a0', 'a4', 'a5', 'a6', 'a7', 'a9', 'a13',
  'a15', 'a16', 'a14', 'a17', 'a20', 'a19', 'a21', 'a23', 'a31', 'a38',
  'a41', 'a43', 'a44', 'a45', 'a34', 'a28', 'a27', 'a29', 'a30', 'a24',
  'a26', 'a36', 'a37', 'a25', 'a10', 'a11', 'a12', 'a8', 'a18', 'a22',
  'a33', 'a32', 'a35', 'a39', 'a40', 'a42'
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
  const CAP = 3.2;

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

export default function Level12() {
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
      const dist = L + 340;
      const dur = 750 + L * 3.2;
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
                levelId: 12,
                moves: 46,
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

      // Safe bump clamp: stops safely before touching any obstacle tail or body
      const bump = Math.max(6, Math.min(gapPx(id) - 6, 36));
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
      dots.setAttribute('class', 'lvl12-dots');

      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.7');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl12-arrow pop');

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl12-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl12-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      // Wide invisible hit area for reliable mobile taps
      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '24');
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
    <div className="lvl12-stage">
      <div className="lvl12-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl12-topbar">
          <button className="lvl12-top-btn lvl12-back" onClick={handleLevels} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl12-header-center">
            <div className="lvl12-level">Level 12</div>
            <div className="lvl12-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl12-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl12-top-btn lvl12-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl12-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl12-boardSvg" viewBox="-20 -20 274 382" />
        </div>

        {/* Controls */}
        <div className="lvl12-controls">
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
          <button className="lvl12-round lvl12-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl12-bulb">
              <span className="lvl12-bolt">ϟ</span>
            </span>
            <span className="lvl12-ad">AD</span>
          </button>
          <button
            className="lvl12-round lvl12-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl12-calc-icon">
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
        <div className={`lvl12-win ${isWon ? 'on' : ''}`}>
          <div className="lvl12-win-card">
            <h2>Level Complete!</h2>
            <p>Level 12 cleared</p>
            <div className="lvl12-trophy">🏆</div>
            <div className="lvl12-stars">★ ★ ★</div>
            <button className="lvl12-next" onClick={handleNextLevel}>
              Level Select ➔
            </button>
            <button className="lvl12-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl12-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl12-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
