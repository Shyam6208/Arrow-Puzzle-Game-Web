import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 14;
const GRID = { cols: 28, rows: 26 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[6, 0], [9, 0], [9, 1], [11, 1], [11, 2], [8, 2], [8, 1], [7, 1], [7, 2]] },
  { id: 'a1', pts: [[24, 1], [22, 1], [22, 0], [19, 0], [19, 1], [17, 1], [17, 3], [15, 3]] },
  { id: 'a2', pts: [[3, 1], [4, 1], [4, 2], [2, 2], [2, 3], [1, 3], [1, 5]] },
  { id: 'a3', pts: [[6, 1], [5, 1], [5, 2], [6, 2], [6, 3], [13, 3]] },
  { id: 'a4', pts: [[25, 2], [21, 2], [21, 1], [20, 1], [20, 2], [18, 2], [18, 3], [25, 3]] },
  {
    id: 'a5',
    pts: [
      [2, 6], [10, 6], [10, 5], [13, 5], [13, 4], [9, 4], [9, 5], [8, 5], [8, 4], [7, 4], [7, 5],
      [6, 5], [6, 4], [5, 4], [5, 5], [2, 5], [2, 4], [4, 4], [4, 3], [3, 3],
    ],
  },
  {
    id: 'a6',
    pts: [
      [11, 7], [11, 6], [13, 6], [13, 7], [15, 7], [15, 4], [19, 4], [19, 6], [20, 6], [20, 4], [21, 4],
    ],
  },
  {
    id: 'a7',
    pts: [
      [25, 4], [24, 4], [24, 5], [23, 5], [23, 4], [22, 4], [22, 5], [21, 5], [21, 6], [25, 6], [25, 5],
    ],
  },
  { id: 'a8', pts: [[0, 10], [0, 6], [1, 6], [1, 10], [3, 10], [3, 13]] },
  { id: 'a9', pts: [[2, 7], [10, 7]] },
  { id: 'a10', pts: [[17, 7], [22, 7], [22, 10], [23, 10], [23, 7], [25, 7]] },
  {
    id: 'a11',
    pts: [
      [12, 7], [12, 8], [10, 8], [10, 10], [7, 10], [7, 12], [5, 12], [5, 8], [3, 8], [3, 9], [4, 9], [4, 13],
    ],
  },
  { id: 'a12', pts: [[6, 8], [9, 8], [9, 9], [7, 9]] },
  { id: 'a13', pts: [[13, 8], [13, 9], [11, 9], [11, 10], [13, 10], [13, 14]] },
  { id: 'a14', pts: [[27, 6], [27, 10], [26, 10], [26, 11], [25, 11], [25, 9], [26, 9], [26, 3]] },
  { id: 'a15', pts: [[1, 11], [2, 11], [2, 14], [3, 14], [3, 15]] },
  {
    id: 'a16',
    pts: [
      [9, 12], [9, 14], [10, 14], [10, 12], [11, 12], [11, 14], [12, 14], [12, 11], [8, 11], [8, 13], [5, 13],
    ],
  },
  {
    id: 'a17',
    pts: [
      [16, 12], [22, 12], [22, 13], [23, 13], [23, 12], [25, 12], [25, 13], [24, 13], [24, 14], [16, 14], [16, 13],
    ],
  },
  { id: 'a18', pts: [[18, 13], [21, 13]] },
  { id: 'a19', pts: [[5, 17], [5, 15], [8, 15], [8, 14], [4, 14], [4, 16]] },
  { id: 'a20', pts: [[8, 16], [8, 20], [9, 20], [9, 15], [10, 15], [10, 16]] },
  { id: 'a21', pts: [[16, 16], [12, 16], [12, 15], [22, 15]] },
  { id: 'a22', pts: [[23, 16], [23, 15], [24, 15]] },
  { id: 'a23', pts: [[6, 18], [6, 16], [7, 16], [7, 19]] },
  { id: 'a24', pts: [[22, 17], [22, 16], [17, 16], [17, 20]] },
  {
    id: 'a25',
    pts: [
      [11, 20], [10, 20], [10, 19], [11, 19], [11, 18], [10, 18], [10, 17], [11, 17], [11, 15],
    ],
  },
  { id: 'a26', pts: [[13, 18], [13, 17], [12, 17], [12, 21]] },
  { id: 'a27', pts: [[18, 21], [17, 21], [17, 22], [16, 22], [16, 17], [15, 17], [15, 19]] },
  { id: 'a28', pts: [[21, 18], [21, 17], [18, 17], [18, 20]] },
  { id: 'a29', pts: [[19, 20], [19, 19], [20, 19], [20, 18], [19, 18]] },
  {
    id: 'a30',
    pts: [
      [14, 17], [14, 19], [13, 19], [13, 20], [14, 20], [14, 22], [13, 22], [13, 23], [15, 23], [15, 25],
    ],
  },
  { id: 'a31', pts: [[10, 21], [11, 21], [11, 22], [12, 22]] },
  { id: 'a32', pts: [[2, 9], [2, 8]] },
  { id: 'a33', pts: [[6, 11], [6, 9]] },
  { id: 'a34', pts: [[14, 3], [14, 6]] },
  { id: 'a35', pts: [[14, 8], [14, 14]] },
  { id: 'a36', pts: [[15, 8], [15, 14]] },
  { id: 'a37', pts: [[20, 11], [20, 9]] },
  { id: 'a38', pts: [[16, 11], [16, 5], [17, 5], [17, 6], [18, 6], [18, 5]] },
  { id: 'a39', pts: [[25, 8], [24, 8], [24, 11], [21, 11], [21, 8], [19, 8], [19, 11], [17, 11]] },
  { id: 'a40', pts: [[17, 10], [18, 10], [18, 8], [17, 8], [17, 9]] },
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [def.pts[0]];
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

const ARROWS: (ArrowDef & { cells: [number, number][] })[] = RAW_ARROWS.map((a) => ({
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
  return us.filter((u, i) => !i || u - us[i - 1] >= 0.01).map((u) => pointAt(path, u + s));
}

function drawArrow(
  line: SVGPolylineElement,
  head: SVGPathElement,
  g: SVGGElement,
  path: PathInfo,
  s: number,
  op: number
) {
  const shape = pulledShape(path, s);
  line.setAttribute('points', shape.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '));
  const [hx, hy] = pointAt(path, path.L + s);
  const ang = (Math.atan2(path.dir[1], path.dir[0]) * 180) / Math.PI;
  head.setAttribute('transform', `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`);
  g.setAttribute('opacity', String(op));
}

interface ArrowRuntime {
  def: ArrowDef & { cells: [number, number][] };
  path: PathInfo;
  g: SVGGElement;
  line: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
  dotsShown?: boolean;
}

export default function Level6() {
  const { dispatch, showRewardedAd } = useStore();
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

  function isBlocked(id: string): boolean {
    const def = arrowsRef.current[id].def;
    const ray = new Set(rayCells(def));
    return ARROWS.some(
      (o) =>
        o.id !== id &&
        !arrowsRef.current[o.id].gone &&
        o.cells.some(([c, r]) => ray.has(c + ',' + r))
    );
  }

  function gapPx(id: string): number {
    const def = arrowsRef.current[id].def;
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

      a.g.classList.add('fly');

      // Unblock check
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
        drawArrow(a.line, a.head, a.g, a.path, s, op);

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
                levelId: 6,
                moves: 41,
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

      a.g.classList.add('fly');
      playCollisionSound();

      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
      }

      const bump = Math.max(14, Math.min(gapPx(id) - 10, 46));
      const dur = 420;
      const start = performance.now();

      function fr(now: number) {
        const k = Math.min(1, (now - start) / dur);
        const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);

        drawArrow(a.line, a.head, a.g, a.path, bump * e, 1);

        if (k < 1) {
          requestAnimationFrame(fr);
        } else {
          drawArrow(a.line, a.head, a.g, a.path, 0, 1);
          a.busy = false;
          a.g.classList.remove('fly');
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
    setMistakes(0);

    ARROWS.forEach((def) => {
      const path = makePath(def);
      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl6-dots');
      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.8');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl6-arrow pop');
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl6-pathline');
      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl6-head');
      head.setAttribute('d', 'M7.5 0 L-3.5 -5 L-3.5 5 Z');
      g.appendChild(line);
      g.appendChild(head);
      svg.appendChild(g);

      const obj: ArrowRuntime = {
        def,
        path,
        g,
        line,
        head,
        dots,
        gone: false,
        busy: false,
        wrongLocked: false,
      };
      arrowsRef.current[def.id] = obj;
      drawArrow(line, head, g, path, 0, 1);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (isInputLockedRef.current || obj.gone || obj.busy) return;
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
    const freeDef = ARROWS.find(
      (a) =>
        arrowsRef.current[a.id] &&
        !arrowsRef.current[a.id].gone &&
        !arrowsRef.current[a.id].busy &&
        !isBlocked(a.id)
    );

    if (!freeDef) {
      showToast('No solvable arrows remaining');
      return;
    }

    const a = arrowsRef.current[freeDef.id];
    if (a) {
      a.g.animate(
        [
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
          { filter: 'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))', transform: 'scale(1.05)' },
          { filter: 'drop-shadow(0 0 6px rgba(91,108,243,0.5))', transform: 'scale(1)' },
          { filter: 'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))', transform: 'scale(1.05)' },
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
    const freeDef = ARROWS.find(
      (a) =>
        arrowsRef.current[a.id] &&
        !arrowsRef.current[a.id].gone &&
        !arrowsRef.current[a.id].busy &&
        !isBlocked(a.id)
    );

    if (!freeDef) {
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
    dispatch({ type: 'START_LEVEL', levelId: 7 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl6-stage">
      <div className="lvl6-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl6-topbar">
          <button className="lvl6-top-btn lvl6-back" onClick={handleHome} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl6-header-center">
            <div className="lvl6-level">Level 6</div>
            <div className="lvl6-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl6-heart ${!isActive ? 'lost' : ''}`}
                    style={{
                      opacity: isActive ? 1 : 0.22,
                      transform: `scale(${isActive ? 1 : 0.82})`,
                      transition: 'transform 0.25s ease, opacity 0.25s ease, filter 0.25s ease',
                    }}
                    aria-label={isActive ? 'Active heart' : 'Lost heart'}
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
            className="lvl6-top-btn lvl6-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-2.68v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.7 15a1.7 1.7 0 0 0-1.56-1.04H6v-2.68h.14A1.7 1.7 0 0 0 7.7 10.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 0 0 1.88-.34 1.7 1.7 0 0 0 1.04-1.56V5h2.68v.2a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0 1.56 1.04H21v2.68h-.04A1.7 1.7 0 0 0 19.4 15z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl6-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl6-boardSvg" viewBox="-20 -20 432 404" />
        </div>

        {/* Controls */}
        <div className="lvl6-controls">
          <button className="lvl6-round lvl6-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl6-bulb">
              <span className="lvl6-bolt">ϟ</span>
            </span>
            <span className="lvl6-ad">AD</span>
          </button>
          <button
            className="lvl6-round lvl6-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl6-calc-icon">
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
        <div className={`lvl6-win ${isWon ? 'on' : ''}`}>
          <div className="lvl6-win-card">
            <h2>Level Complete!</h2>
            <p>Level 6 cleared</p>
            <div className="lvl6-trophy">🏆</div>
            <div className="lvl6-stars">★ ★ ★</div>
            <button className="lvl6-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button className="lvl6-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl6-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl6-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
