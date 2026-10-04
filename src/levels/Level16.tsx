import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';

/*
 * Level 16 geometry snapped onto an exact orthogonal grid (29 x 35 cells).
 * The original hand-traced points were slightly off-axis, which made some
 * segments slanted and a few heads point the wrong way. Every point now sits
 * exactly on a grid node, so all corners are crisp 90° turns.
 * Pixel mapping keeps the original layout: x = 47 + c*12.7, y = 39 + r*12.7.
 */
const CELL = 12.7;
const ORIGIN_X = 47;
const ORIGIN_Y = 39;
const GRID = { cols: 29, rows: 35 };
const P = (c: number, r: number): [number, number] => [ORIGIN_X + c * CELL, ORIGIN_Y + r * CELL];

type Dir = 'U' | 'D' | 'L' | 'R';

interface RawArrowDef {
  id: string;
  dir: Dir;
  pts: [number, number][];
}

const RAW_ARROWS: RawArrowDef[] = [
  { id: 'a0', dir: 'U', pts: [[14, 0], [13, 0], [13, 1], [11, 1], [11, 2], [14, 2], [14, 1], [15, 1], [15, 3], [14, 3], [14, 6], [15, 6], [15, 10], [22, 10], [22, 8], [17, 8], [17, 1]] },
  { id: 'a1', dir: 'D', pts: [[16, 1], [16, 3]] },
  { id: 'a2', dir: 'U', pts: [[12, 5], [12, 3]] },
  { id: 'a3', dir: 'D', pts: [[10, 4], [10, 3], [11, 3], [11, 5]] },
  { id: 'a4', dir: 'U', pts: [[19, 6], [19, 5]] },
  { id: 'a5', dir: 'U', pts: [[18, 1], [18, 7], [22, 7], [22, 6], [20, 6], [20, 5]] },
  { id: 'a6', dir: 'U', pts: [[8, 7], [8, 6]] },
  { id: 'a7', dir: 'R', pts: [[6, 7], [7, 7]] },
  { id: 'a8', dir: 'U', pts: [[24, 9], [24, 7]] },
  { id: 'a9', dir: 'U', pts: [[4, 9], [5, 9], [5, 8]] },
  { id: 'a10', dir: 'R', pts: [[8, 9], [6, 9], [6, 8], [8, 8]] },
  { id: 'a11', dir: 'D', pts: [[15, 5], [15, 4], [16, 4], [16, 9]] },
  { id: 'a12', dir: 'R', pts: [[17, 9], [20, 9]] },
  { id: 'a13', dir: 'D', pts: [[11, 9], [11, 10]] },
  { id: 'a14', dir: 'D', pts: [[14, 7], [14, 10]] },
  { id: 'a15', dir: 'U', pts: [[8, 12], [8, 11], [9, 11], [9, 13], [6, 13], [6, 12], [7, 12], [7, 11]] },
  { id: 'a16', dir: 'U', pts: [[23, 12], [23, 11], [24, 11], [24, 13], [22, 13], [22, 11]] },
  { id: 'a17', dir: 'D', pts: [[4, 13], [4, 11], [5, 11], [5, 14], [10, 14], [10, 5], [9, 5], [9, 10], [3, 10], [3, 12]] },
  { id: 'a18', dir: 'D', pts: [[17, 12], [19, 12], [19, 11], [16, 11], [16, 12]] },
  { id: 'a19', dir: 'D', pts: [[21, 11], [20, 11], [20, 12]] },
  { id: 'a20', dir: 'U', pts: [[13, 3], [13, 15], [14, 15], [14, 11], [15, 11], [15, 16], [12, 16], [12, 12]] },
  { id: 'a21', dir: 'D', pts: [[12, 7], [12, 6], [11, 6], [11, 8], [12, 8], [12, 11], [11, 11], [11, 13]] },
  { id: 'a22', dir: 'R', pts: [[17, 16], [16, 16], [16, 15], [17, 15], [17, 14], [16, 14], [16, 13], [20, 13]] },
  { id: 'a23', dir: 'L', pts: [[24, 16], [23, 16], [23, 17], [22, 17], [22, 15], [18, 15]] },
  { id: 'a24', dir: 'L', pts: [[18, 14], [24, 14], [24, 15], [23, 15]] },
  { id: 'a25', dir: 'L', pts: [[10, 18], [12, 18], [12, 20], [11, 20], [11, 24], [13, 24], [13, 17], [11, 17]] },
  { id: 'a26', dir: 'R', pts: [[14, 17], [14, 18], [19, 18], [19, 17], [20, 17]] },
  { id: 'a27', dir: 'U', pts: [[15, 17], [18, 17], [18, 16], [21, 16], [21, 18], [24, 18], [24, 17]] },
  { id: 'a28', dir: 'L', pts: [[9, 18], [9, 19], [7, 19]] },
  { id: 'a29', dir: 'L', pts: [[11, 19], [10, 19]] },
  { id: 'a30', dir: 'L', pts: [[14, 20], [14, 24], [18, 24], [18, 19], [14, 19]] },
  { id: 'a31', dir: 'L', pts: [[10, 20], [6, 20]] },
  { id: 'a32', dir: 'L', pts: [[23, 20], [20, 20]] },
  { id: 'a33', dir: 'L', pts: [[10, 22], [10, 21], [5, 21]] },
  { id: 'a34', dir: 'R', pts: [[4, 22], [6, 22]] },
  { id: 'a35', dir: 'U', pts: [[12, 23], [12, 22]] },
  { id: 'a36', dir: 'D', pts: [[16, 21], [16, 23], [17, 23], [17, 20], [15, 20], [15, 23]] },
  { id: 'a37', dir: 'D', pts: [[24, 22], [20, 22], [20, 23]] },
  { id: 'a38', dir: 'L', pts: [[7, 22], [9, 22], [9, 23], [10, 23], [10, 24], [8, 24], [8, 23], [4, 23]] },
  { id: 'a39', dir: 'L', pts: [[21, 3], [20, 3], [20, 2], [19, 2], [19, 4], [22, 4], [22, 5], [23, 5], [23, 10], [25, 10], [25, 23], [21, 23]] },
  { id: 'a40', dir: 'R', pts: [[25, 25], [3, 25], [3, 24], [7, 24]] },
  { id: 'a41', dir: 'R', pts: [[20, 21], [24, 21], [24, 19], [19, 19], [19, 24], [24, 24]] },
  { id: 'a42', dir: 'R', pts: [[1, 29], [11, 29]] },
  { id: 'a43', dir: 'L', pts: [[20, 33], [20, 30], [13, 30]] },
  { id: 'a44', dir: 'D', pts: [[12, 34], [22, 34], [22, 30], [23, 30], [23, 31]] },
  { id: 'a45', dir: 'D', pts: [[21, 33], [21, 29], [24, 29], [24, 31]] },
  { id: 'a46', dir: 'U', pts: [[0, 32], [0, 31]] },
  { id: 'a47', dir: 'L', pts: [[27, 29], [25, 29], [25, 30], [28, 30], [28, 31], [26, 31]] },
  { id: 'a48', dir: 'L', pts: [[8, 34], [3, 34], [3, 33], [9, 33], [9, 34], [10, 34], [10, 32], [3, 32]] },
  { id: 'a49', dir: 'L', pts: [[25, 33], [25, 34], [26, 34], [26, 32], [25, 32]] },
  { id: 'a50', dir: 'R', pts: [[27, 33], [27, 32], [28, 32]] },
  { id: 'a51', dir: 'D', pts: [[1, 33], [1, 30], [2, 30], [2, 33]] },
  { id: 'a52', dir: 'D', pts: [[20, 29], [12, 29], [12, 30], [3, 30], [3, 31], [19, 31], [19, 33]] },
  { id: 'a53', dir: 'D', pts: [[23, 34], [23, 32], [24, 32], [24, 33]] },
  { id: 'a54', dir: 'D', pts: [[13, 32], [18, 32], [18, 33], [12, 33], [12, 32], [11, 32], [11, 34]] },
];

/* Verified 100% solvable removal sequence (55/55) on the snapped grid */
const SOLUTION = [
  'a0', 'a2', 'a6', 'a8', 'a9', 'a25', 'a28', 'a29', 'a30', 'a31', 'a33', 'a38', 'a41', 'a40',
  'a46', 'a50', 'a51', 'a48', 'a53', 'a44', 'a45', 'a52', 'a43', 'a37', 'a47', 'a42', 'a17',
  'a54', 'a21', 'a13', 'a3', 'a20', 'a35', 'a36', 'a32', 'a39', 'a4', 'a5', 'a12', 'a16',
  'a22', 'a23', 'a24', 'a27', 'a26', 'a14', 'a18', 'a11', 'a1', 'a7', 'a10', 'a15', 'a19',
  'a34', 'a49',
];

/* All grid cells covered by an arrow (including its tail cell) */
function computeCells(def: RawArrowDef): [number, number][] {
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

const ARROWS = RAW_ARROWS.map((a) => ({ ...a, cells: computeCells(a) }));
type ArrowDef = (typeof ARROWS)[number];

function dirVec(d: Dir): [number, number] {
  return d === 'U' ? [0, -1] : d === 'D' ? [0, 1] : d === 'L' ? [-1, 0] : [1, 0];
}

interface PathInfo {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

function makePath(def: RawArrowDef): PathInfo {
  const pts = def.pts.map(([c, r]) => P(c, r));
  const arcs = [0];
  let L = 0;
  for (let i = 1; i < pts.length; i++) {
    L += Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]);
    arcs.push(L);
  }
  return { pts, arcs, L, dir: dirVec(def.dir) };
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
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

export default function Level16() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 16;

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
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.045, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.09);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch {
      /* ignore */
    }
  };

  const playCollisionSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(180, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.035, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.14);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch {
      /* ignore */
    }
  };

  const playFailSound = () => {
    try {
      const ctx = getAudioContext();
      if (!ctx) return;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(70, ctx.currentTime + 0.3);
      gain.gain.setValueAtTime(0.04, ctx.currentTime);
      gain.gain.linearRampToValueAtTime(0.0001, ctx.currentTime + 0.32);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.33);
    } catch {
      /* ignore */
    }
  };

  /* Distance (px) from the head to the first blocking cell, or 9999 if the exit is clear */
  const rayGap = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const occupied = new Set<string>();
    ARROWS.forEach((o) => {
      if (o.id === id || arrowsRef.current[o.id]?.gone) return;
      o.cells.forEach(([c, r]) => occupied.add(`${c},${r}`));
    });
    const [dc, dr] = dirVec(a.def.dir);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (occupied.has(`${c},${r}`)) return k * CELL;
      c += dc;
      r += dr;
    }
    return 9999;
  }, []);

  const isBlocked = useCallback((id: string): boolean => rayGap(id) < 9998, [rayGap]);

  const resetUnlockedWrongLocks = () => {
    Object.values(arrowsRef.current).forEach((x) => {
      if (!x.gone) x.wrongLocked = false;
    });
  };

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
      const dist = L + 180;
      const dur = 650 + L * 2.7;
      const start = performance.now();

      function frame(now: number) {
        const k = Math.min(1, (now - start) / dur);
        const e = k < 0.5 ? 4 * k * k * k : 1 - Math.pow(-2 * k + 2, 3) / 2;
        const s = e * dist;
        const op = k > 0.76 ? Math.max(0, 1 - (k - 0.76) / 0.24) : 1;
        drawArrow(a.line, a.head, a.g, a.path, s, op, a.hitArea);

        if (k < 1) {
          requestAnimationFrame(frame);
        } else {
          a.g.style.display = 'none';
          if (clearedRef.current === ARROWS.length) {
            window.setTimeout(() => {
              setIsWon(true);
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: currentLevelId,
                moves: 55,
                stars: 3,
              });
            }, 420);
          }
        }
      }

      requestAnimationFrame(frame);
    },
    [dispatch, currentLevelId]
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

      const gap = rayGap(id);
      const bump = Math.max(6, Math.min(gap === 9999 ? 28 : gap - 6, 36));
      const dur = 480;
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
    [rayGap, showToast]
  );

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy) return;
      if (isBlocked(id)) {
        collide(id);
        return;
      }
      playTapSound();
      remove(id);
    },
    [isBlocked, collide, remove]
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

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl16-arrow pop');

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl16-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl16-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '14');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('stroke-linecap', 'round');
      hitArea.setAttribute('stroke-linejoin', 'round');
      hitArea.setAttribute('pointer-events', 'stroke');

      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);

      const onPointerDown = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInputLockedRef.current) return;
        tryRemove(def.id);
      };

      g.addEventListener('pointerdown', onPointerDown);

      svg.appendChild(g);

      arrowsRef.current[def.id] = {
        def,
        path,
        g,
        line,
        hitArea,
        head,
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

  const findNextSolvable = useCallback((): string | undefined => {
    const ok = (id: string) =>
      arrowsRef.current[id] &&
      !arrowsRef.current[id].gone &&
      !arrowsRef.current[id].busy &&
      !isBlocked(id);
    return SOLUTION.find(ok) || ARROWS.find((a) => ok(a.id))?.id;
  }, [isBlocked]);

  const revealSolvableHint = useCallback(() => {
    const nextSolvableId = findNextSolvable();
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
  }, [findNextSolvable, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    if (!findNextSolvable()) {
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
    <div className="lvl16-stage">
      <div className="lvl16-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl16-topbar">
          <button className="lvl16-top-btn lvl16-back" onClick={handleHome} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl16-header-center">
            <div className="lvl16-level">Level {currentLevelId}</div>
            <div className="lvl16-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl16-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl16-top-btn lvl16-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl16-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl16-boardSvg" viewBox="40 32 370 446" />
        </div>

        {/* Controls */}
        <div className="lvl16-controls">
          <button className="lvl16-round lvl16-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl16-bulb">
              <span className="lvl16-bolt">ϟ</span>
            </span>
            <span className="lvl16-ad">AD</span>
          </button>
          <button
            className="lvl16-round lvl16-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl16-calc-icon">
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
        <div className={`lvl16-win ${isWon ? 'on' : ''}`}>
          <div className="lvl16-win-card">
            <h2>Level Complete!</h2>
            <p>Level {currentLevelId} cleared</p>
            <div className="lvl16-trophy">🏆</div>
            <div className="lvl16-stars">★ ★ ★</div>
            <button className="lvl16-next" onClick={handleNextLevel}>
              Level Select ➔
            </button>
            <button className="lvl16-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl16-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl16-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
