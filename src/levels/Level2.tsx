import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 28;
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

/* Exact Level 2 source geometry from user code */
interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells: [number, number][];
}

const ARROWS: ArrowDef[] = [
  {
    id: 'A',
    pts: [[0, 4], [0, 1], [2, 1], [2, 0]],
    cells: [[0, 4], [0, 3], [0, 2], [0, 1], [1, 1], [2, 1], [2, 0]],
  },
  {
    id: 'B',
    pts: [[3, 0], [3, 2], [1, 2]],
    cells: [[3, 0], [3, 1], [3, 2], [2, 2], [1, 2]],
  },
  {
    id: 'C',
    pts: [[4, 2], [4, 3], [1, 3]],
    cells: [[4, 2], [4, 3], [3, 3], [2, 3], [1, 3]],
  },
];

const SEQ = ['A', 'B', 'C'];

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
  def: ArrowDef;
  path: PathInfo;
  g: SVGGElement;
  line: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
}

export default function Level2() {
  const { state, dispatch } = useStore();
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);

  const [moves, setMoves] = useState(5);
  const [coins, setCoins] = useState(state.player.coins || 80);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

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
      const now = audioCtxRef.current.currentTime;
      const o = audioCtxRef.current.createOscillator();
      const g = audioCtxRef.current.createGain();
      o.type = 'sine';
      o.frequency.setValueAtTime(620, now);
      o.frequency.exponentialRampToValueAtTime(430, now + 0.055);
      g.gain.setValueAtTime(0.0001, now);
      g.gain.exponentialRampToValueAtTime(0.14, now + 0.006);
      g.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);
      o.connect(g);
      g.connect(audioCtxRef.current.destination);
      o.start(now);
      o.stop(now + 0.08);
    } catch {}
  };

  const remove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      clearedRef.current++;
      setMoves((m) => Math.max(0, m - 1));
      setCoins((c) => c + 5);

      a.g.classList.add('fly');
      const L = a.path.L;
      const dist = L + 340;
      const dur = 750 + L * 3.2;
      let t0: number | null = null;
      let dotsShown = false;

      function frame(now: number) {
        if (t0 === null) t0 = now;
        const k = Math.min(1, (now - t0) / dur);
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
                levelId: 2,
                moves: 5,
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

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    setMoves(5);

    ARROWS.forEach((def) => {
      const path = makePath(def);
      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl2-dots');
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
      g.setAttribute('class', 'lvl2-arrow pop');
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl2-pathline');
      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl2-head');
      head.setAttribute('d', 'M11 0 L-4 -7 L-4 7 Z');
      g.appendChild(line);
      g.appendChild(head);
      svg.appendChild(g);

      const obj: ArrowRuntime = { def, path, g, line, head, dots, gone: false };
      arrowsRef.current[def.id] = obj;
      drawArrow(line, head, g, path, 0, 1);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (obj.gone) return;
        playTapSound();
        remove(def.id);
      });
    });
  }, [remove]);

  useEffect(() => {
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
    buildBoard();
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 3 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl2-stage">
      <div className="lvl2-app">
        {/* Header */}
        <header className="lvl2-topbar">
          <button className="lvl2-top-btn lvl2-back" onClick={handleHome} aria-label="Back">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
              <path d="M15 5l-7 7 7 7" />
            </svg>
          </button>
          <div className="lvl2-title">Level 2</div>
          <button
            className="lvl2-top-btn lvl2-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-2.68v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.7 15a1.7 1.7 0 0 0-1.56-1.04H6v-2.68h.14A1.7 1.7 0 0 0 7.7 10.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 0 0 1.88.34 1.7 1.7 0 0 0 1.04-1.56V5h2.68v.2a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04H21v2.68h-.04A1.7 1.7 0 0 0 19.4 15z" />
            </svg>
          </button>
        </header>

        {/* Top Stats */}
        <div className="lvl2-stats">
          <div className="lvl2-pill">
            <span className="lvl2-move-icon">↗</span>
            <span id="moves">{moves}</span>
          </div>
          <div className="lvl2-hearts" aria-label="3 hearts">
            <span className="lvl2-heart">
              <svg viewBox="0 0 36 34">
                <path d="M18 32.2C16.9 31.1 4.3 20.9 1.5 14.1-.9 8.2 2.4 2.4 8.2 1.2c3.8-.8 7.4.9 9.8 4.1 2.4-3.2 6-4.9 9.8-4.1 5.8 1.2 9.1 7 6.7 12.9C31.7 20.9 19.1 31.1 18 32.2Z" />
              </svg>
            </span>
            <span className="lvl2-heart">
              <svg viewBox="0 0 36 34">
                <path d="M18 32.2C16.9 31.1 4.3 20.9 1.5 14.1-.9 8.2 2.4 2.4 8.2 1.2c3.8-.8 7.4.9 9.8 4.1 2.4-3.2 6-4.9 9.8-4.1 5.8 1.2 9.1 7 6.7 12.9C31.7 20.9 19.1 31.1 18 32.2Z" />
              </svg>
            </span>
            <span className="lvl2-heart">
              <svg viewBox="0 0 36 34">
                <path d="M18 32.2C16.9 31.1 4.3 20.9 1.5 14.1-.9 8.2 2.4 2.4 8.2 1.2c3.8-.8 7.4.9 9.8 4.1 2.4-3.2 6-4.9 9.8-4.1 5.8 1.2 9.1 7 6.7 12.9C31.7 20.9 19.1 31.1 18 32.2Z" />
              </svg>
            </span>
          </div>
          <div className="lvl2-pill">
            <span className="lvl2-coin">★</span>
            <span id="coins">{coins}</span>
          </div>
        </div>

        {/* Board SVG Wrap */}
        <div id="board-wrap" className="lvl2-board-wrap">
          <svg id="boardSvg" ref={svgRef} className="lvl2-boardSvg" viewBox="-15 -15 170 170" />
        </div>

        {/* Bottom Controls */}
        <div className="lvl2-controls">
          <button className="lvl2-round lvl2-hint" onClick={handleHint}>
            <span className="lvl2-bulb">
              <span className="lvl2-bolt">ϟ</span>
            </span>
            <span className="lvl2-ad">AD</span>
          </button>
          <button className="lvl2-round lvl2-calculator" onClick={() => showToast('Grid')}>
            <span className="lvl2-calc-icon">
              <i /><i /><i /><i /><i /><i /><i /><i /><i />
            </span>
          </button>
        </div>

        {/* Win Modal */}
        <div className={`lvl2-win ${isWon ? 'on' : ''}`}>
          <div className="lvl2-win-card">
            <h2>Level Complete!</h2>
            <p>Level 2 cleared</p>
            <div className="lvl2-trophy">🏆</div>
            <div className="lvl2-stars">★ ★ ★</div>
            <button className="lvl2-next" onClick={handleNextLevel}>
              Next Level
            </button>
            <div className="lvl2-sub">
              <button onClick={handleRestart}>↺ Replay</button>
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl2-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
