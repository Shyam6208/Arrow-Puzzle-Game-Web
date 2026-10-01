import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 24;
const GRID = { cols: 12, rows: 15 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[2, 1], [0, 1], [0, 0], [2, 0]] },
  { id: 'a1', pts: [[4, 1], [3, 1], [3, 0], [7, 0]] },
  { id: 'a2', pts: [[11, 0], [9, 0], [9, 1], [10, 1], [10, 2]] },
  { id: 'a3', pts: [[7, 2], [7, 1], [6, 1]] },
  { id: 'a4', pts: [[4, 2], [3, 2], [3, 3], [5, 3]] },
  { id: 'a5', pts: [[8, 0], [8, 2], [9, 2]] },
  { id: 'a6', pts: [[6, 2], [6, 4], [3, 4]] },
  { id: 'a7', pts: [[9, 3], [9, 4], [8, 4], [8, 8], [7, 8], [7, 6], [5, 6], [5, 9], [4, 9], [4, 8], [3, 8], [3, 12]] },
  { id: 'a8', pts: [[0, 2], [0, 6], [1, 6], [1, 5], [2, 5]] },
  { id: 'a9', pts: [[2, 6], [3, 6], [3, 5], [4, 5], [4, 6]] },
  { id: 'a10', pts: [[5, 5], [7, 5], [7, 3]] },
  { id: 'a11', pts: [[2, 11], [1, 11], [1, 7], [4, 7]] },
  { id: 'a12', pts: [[6, 7], [6, 9], [8, 9]] },
  { id: 'a13', pts: [[9, 13], [8, 13], [8, 12], [9, 12], [9, 10], [8, 10], [8, 11], [7, 11], [7, 10], [6, 10]] },
  { id: 'a14', pts: [[5, 10], [5, 11], [6, 11], [6, 12], [7, 12], [7, 14]] },
  { id: 'a15', pts: [[3, 13], [2, 13], [2, 12], [1, 12]] },
  { id: 'a16', pts: [[4, 10], [4, 12], [5, 12], [5, 14]] },
  { id: 'a17', pts: [[4, 13], [4, 14], [0, 14]] },
  { id: 'a18', pts: [[9, 14], [8, 14]] },
  { id: 'a19', pts: [[5, 2], [5, 1]] },
  { id: 'a20', pts: [[11, 14], [11, 1]] },
  { id: 'a21', pts: [[1, 2], [1, 4]] },
  { id: 'a22', pts: [[2, 4], [2, 2]] },
  { id: 'a23', pts: [[10, 3], [10, 14]] },
  { id: 'a24', pts: [[9, 9], [9, 5]] },
  { id: 'a25', pts: [[0, 7], [0, 13]] },
  { id: 'a26', pts: [[2, 8], [2, 10]] },
  { id: 'a27', pts: [[6, 14], [6, 13]] },
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
  op: number
) {
  const shape = pulledShape(path, s);
  line.setAttribute('points', shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' '));
  const [hx, hy] = pointAt(path, path.L + s);
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
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

export default function Level7() {
  const { dispatch, showRewardedAd } = useStore();
  const [mistakes, setMistakes] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const svgRef = useRef<SVGSVGElement | null>(null);
  const appRef = useRef<HTMLDivElement | null>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef<number>(0);
  const isInputLockedRef = useRef(false);
  const toastTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 800);
  }, []);

  const playTapSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(430, now + 0.055);
      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {
      // Audio fallback
    }
  };

  const playCollisionSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(190, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.12);
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch {
      // Audio fallback
    }
  };

  const playFailSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;
      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(260, now);
      osc.frequency.exponentialRampToValueAtTime(110, now + 0.35);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.37);
    } catch {
      // Audio fallback
    }
  };

  const isBlocked = (id: string): boolean => {
    const entry = arrowsRef.current[id];
    if (!entry) return false;
    const def = entry.def;
    const ray = new Set(rayCells(def));
    return ARROWS.some(
      (o) =>
        o.id !== id &&
        arrowsRef.current[o.id] &&
        !arrowsRef.current[o.id].gone &&
        o.cells.some(([c, r]) => ray.has(`${c},${r}`))
    );
  };

  const gapPx = (id: string): number => {
    const entry = arrowsRef.current[id];
    if (!entry) return 9999;
    const def = entry.def;
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
            arrowsRef.current[o.id] &&
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
  };

  const resetUnlockedWrongLocks = () => {
    ARROWS.forEach((o) => {
      const a = arrowsRef.current[o.id];
      if (a && !a.gone && !isBlocked(o.id)) {
        a.wrongLocked = false;
      }
    });
  };

  const remove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      clearedRef.current += 1;
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
                levelId: 7,
                moves: 28,
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
      dots.setAttribute('class', 'lvl7-dots');
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
      g.setAttribute('class', 'lvl7-arrow pop');
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl7-pathline');
      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl7-head');
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
    dispatch({ type: 'START_LEVEL', levelId: 8 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl7-stage">
      <div className="lvl7-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl7-topbar">
          <button className="lvl7-top-btn lvl7-back" onClick={handleHome} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl7-header-center">
            <div className="lvl7-level">Level 7</div>
            <div className="lvl7-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl7-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl7-top-btn lvl7-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl7-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl7-boardSvg" viewBox="-20 -20 328 400" />
        </div>

        {/* Controls */}
        <div className="lvl7-controls">
          <button className="lvl7-round lvl7-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl7-bulb">
              <span className="lvl7-bolt">ϟ</span>
            </span>
            <span className="lvl7-ad">AD</span>
          </button>
          <button
            className="lvl7-round lvl7-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl7-calc-icon">
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
        <div className={`lvl7-win ${isWon ? 'on' : ''}`}>
          <div className="lvl7-win-card">
            <h2>Level Complete!</h2>
            <p>Level 7 cleared</p>
            <div className="lvl7-trophy">🏆</div>
            <div className="lvl7-stars">★ ★ ★</div>
            <button className="lvl7-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button className="lvl7-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl7-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl7-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
