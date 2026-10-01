import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 24;
const GRID = { cols: 12, rows: 13 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'A', pts: [[4, 1], [7, 1], [7, 0], [0, 0], [0, 4]] },
  { id: 'B', pts: [[10, 0], [11, 0], [11, 2]] },
  { id: 'C', pts: [[9, 1], [9, 3], [6, 3]] },
  { id: 'D', pts: [[4, 2], [2, 2], [2, 3], [1, 3]] },
  { id: 'E', pts: [[4, 4], [5, 4], [5, 5]] },
  { id: 'F', pts: [[8, 4], [6, 4]] },
  { id: 'K', pts: [[3, 8], [3, 5]] },
  { id: 'J', pts: [[1, 5], [2, 5], [2, 7]] },
  { id: 'G', pts: [[4, 7], [4, 6], [10, 6]] },
  { id: 'H', pts: [[11, 6], [11, 8]] },
  { id: 'S', pts: [[7, 8], [10, 8]] },
  { id: 'I', pts: [[6, 10], [6, 9], [10, 9]] },
  { id: 'L', pts: [[3, 9], [4, 9], [4, 10]] },
  { id: 'N', pts: [[2, 10], [2, 11]] },
  { id: 'M', pts: [[0, 8], [0, 12], [3, 12]] },
  { id: 'O', pts: [[5, 11], [7, 11]] },
  { id: 'Q', pts: [[9, 11], [11, 11]] },
  { id: 'P', pts: [[5, 12], [11, 12]] },
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [def.pts[0]];
  for (let i = 1; i < def.pts.length; i++) {
    let [c, r] = def.pts[i - 1];
    const [c2, r2] = def.pts[i];
    const dc = Math.sign(c2 - c);
    const dr = Math.sign(r2 - r);
    while (c !== c2 || r !== r2) {
      c += dc;
      r += dr;
      out.push([c, r]);
    }
  }
  return out;
}

const ARROWS: (ArrowDef & { cells: [number, number][] })[] = RAW_ARROWS.map((a) => ({
  ...a,
  cells: cellsOf(a),
}));

const SEQ = ['A', 'B', 'C', 'D', 'E', 'F', 'K', 'J', 'G', 'H', 'S', 'I', 'L', 'N', 'M', 'O', 'Q', 'P'];

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

export default function Level5() {
  const { dispatch } = useStore();
  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

  const [hearts, setHearts] = useState(3);
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

  const remove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      clearedRef.current++;

      a.g.classList.add('fly');

      // A successful removal changes the board, so any arrow that is now
      // unblocked may be tried again and can make a new mistake if blocked later.
      Object.values(arrowsRef.current).forEach((x) => {
        if (!x.gone && x !== a && !isBlocked(x.def.id)) {
          x.wrongLocked = false;
        }
      });

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
                levelId: 5,
                moves: 18,
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

      // Same wrong arrow on same board state:
      // no additional heart, but it still performs the bump/move animation.
      const firstMistake = !a.wrongLocked;
      if (firstMistake) {
        a.wrongLocked = true;
        setHearts((curr) => {
          const nextHearts = Math.max(0, curr - 1);
          if (nextHearts <= 0) {
            isInputLockedRef.current = true;
            playFailSound();
            showToast('Out of Lives!');
            window.setTimeout(() => {
              isInputLockedRef.current = false;
              setIsWon(false);
              setHearts(3);
              buildBoardRef.current();
            }, 800);
          }
          return nextHearts;
        });
      }

      a.busy = true;
      a.g.classList.add('fly');
      playCollisionSound();

      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
      }

      // Pull the arrow toward the blocking point, then return it.
      const bump = Math.max(14, Math.min(gapPx(id) - 6, 58));
      const dur = 420;
      const startTime = performance.now();

      function fr(now: number) {
        const k = Math.min(1, (now - startTime) / dur);
        const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 3) : 1 - Math.pow(2 * k - 1, 3);

        drawArrow(a.line, a.head, a.g, a.path, bump * e, 1);

        if (k < 1) {
          requestAnimationFrame(fr);
        } else {
          a.busy = false;
          a.g.classList.remove('fly');
          drawArrow(a.line, a.head, a.g, a.path, 0, 1);
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

    ARROWS.forEach((def) => {
      const path = makePath(def);
      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl5-dots');
      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '2.4');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl5-arrow pop');
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl5-pathline');
      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl5-head');
      head.setAttribute('d', 'M11 0 L-4 -7 L-4 7 Z');
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

  const handleHint = () => {
    const id = SEQ.find((x) => arrowsRef.current[x] && !arrowsRef.current[x].gone);
    if (!id) {
      showToast('Level cleared');
      return;
    }
    arrowsRef.current[id].g.animate(
      [
        { filter: 'drop-shadow(0 0 0 transparent)' },
        { filter: 'drop-shadow(0 0 10px rgba(91,108,243,.85))' },
        { filter: 'drop-shadow(0 0 0 transparent)' },
      ],
      { duration: 700, iterations: 2 }
    );
    showToast('Hint');
  };

  const handleRestart = () => {
    setIsWon(false);
    setHearts(3);
    isInputLockedRef.current = false;
    buildBoard();
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 6 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl5-stage">
      <div className="lvl5-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl5-topbar">
          <button className="lvl5-top-btn lvl5-back" onClick={handleHome} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>

          <div className="lvl5-header-center">
            <div className="lvl5-level">Level 5</div>
            <div className="lvl5-hearts" id="hearts">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`lvl5-heart ${idx >= hearts ? 'lost' : ''}`}
                  aria-label={idx < hearts ? 'Active heart' : 'Lost heart'}
                >
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <button
            className="lvl5-top-btn lvl5-settings"
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
        <div id="board-wrap" className="lvl5-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl5-boardSvg" viewBox="-20 -20 328 352" />
        </div>

        {/* Controls */}
        <div className="lvl5-controls">
          <button className="lvl5-round lvl5-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl5-bulb">
              <span className="lvl5-bolt">ϟ</span>
            </span>
            <span className="lvl5-ad">AD</span>
          </button>
          <button
            className="lvl5-round lvl5-calculator"
            onClick={() => showToast('Calculator')}
            aria-label="Calculator"
          >
            <span className="lvl5-calc-icon">
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
        <div className={`lvl5-win ${isWon ? 'on' : ''}`}>
          <div className="lvl5-win-card">
            <h2>Level Complete!</h2>
            <p>Level 5 cleared</p>
            <div className="lvl5-trophy">🏆</div>
            <div className="lvl5-stars">★ ★ ★</div>
            <button className="lvl5-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button className="lvl5-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl5-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl5-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
