import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 26;
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

/* Level 3 data taken directly from the uploaded source */
interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells: [number, number][];
}

const ARROWS: ArrowDef[] = [
  { id: 'A', pts: [[3, 0], [1, 0]], cells: [[3, 0], [2, 0], [1, 0]] },
  { id: 'B', pts: [[1, 1], [0, 1], [0, 4]], cells: [[1, 1], [0, 1], [0, 2], [0, 3], [0, 4]] },
  { id: 'C', pts: [[3, 3], [3, 4], [1, 4], [1, 2]], cells: [[3, 3], [3, 4], [2, 4], [1, 4], [1, 3], [1, 2]] },
  { id: 'D', pts: [[3, 1], [2, 1], [2, 3]], cells: [[3, 1], [2, 1], [2, 2], [2, 3]] },
];

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
  op: number,
  hitArea?: SVGPolylineElement
) {
  const shape = pulledShape(path, s);
  line.setAttribute('points', shape.map((p) => p[0].toFixed(2) + ',' + p[1].toFixed(2)).join(' '));
  if (hitArea) hitArea.setAttribute('points', line.getAttribute('points')!);
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
  hitArea: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  collided: boolean;
  animating: boolean;
  dotsShown?: boolean;
}

export default function Level3() {
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

  const [hearts, setHearts] = useState(3);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => setToastMsg(null), 800);
  }, []);

  const getAudioContext = () => {
    const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
    } catch { }
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
    } catch { }
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
    } catch { }
  };

  const checkExitRay = (def: ArrowDef): { clear: boolean; steps: number; obstacleId: string | null } => {
    const headCell = def.cells[def.cells.length - 1];
    const [ex, ey] = def.pts[def.pts.length - 1];
    const [px, py] = def.pts[def.pts.length - 2];
    const dl = Math.hypot(ex - px, ey - py) || 1;
    const dc = Math.round((ex - px) / dl);
    const dr = Math.round((ey - py) / dl);

    let c = headCell[0] + dc;
    let r = headCell[1] + dr;
    let steps = 0;

    // Grid bounds for Level 3: cols 0..4, rows 0..5
    while (c >= 0 && c <= 4 && r >= 0 && r <= 5) {
      steps++;
      for (const otherDef of ARROWS) {
        if (otherDef.id === def.id) continue;
        const other = arrowsRef.current[otherDef.id];
        if (!other || other.gone) continue;
        const occupies = otherDef.cells.some(([oc, or]) => oc === c && or === r);
        if (occupies) {
          return { clear: false, steps, obstacleId: otherDef.id };
        }
      }
      c += dc;
      r += dr;
    }
    return { clear: true, steps, obstacleId: null };
  };

  const remove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.animating) return;
      a.animating = true;
      a.gone = true;
      clearedRef.current++;

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
        drawArrow(a.line, a.head, a.g, a.path, s, op, a.hitArea);

        if (!dotsShown && s >= L) {
          dotsShown = true;
          a.dots.classList.add('show');
        }

        if (k < 1) {
          requestAnimationFrame(frame);
        } else {
          a.animating = false;
          a.g.style.display = 'none';
          if (clearedRef.current === ARROWS.length) {
            window.setTimeout(() => {
              setIsWon(true);
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: 3,
                moves: 4,
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

  const bounce = useCallback(
    (id: string, steps: number) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.animating) return;
      a.animating = true;

      playCollisionSound();

      // App shake
      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
        window.setTimeout(() => {
          appRef.current?.classList.remove('shake');
        }, 320);
      }

      // Heart deduction: ONLY on the FIRST collision per arrow
      if (!a.collided) {
        a.collided = true;
        setHearts((curr) => {
          const nextHearts = Math.max(0, curr - 1);
          if (nextHearts === 0) {
            // 3rd loss: lock input, show toast, and restart level
            isInputLockedRef.current = true;
            playFailSound();
            showToast('Out of Lives!');
            window.setTimeout(() => {
              setIsWon(false);
              setHearts(3);
              buildBoardRef.current();
              isInputLockedRef.current = false;
            }, 1000);
          }
          return nextHearts;
        });
      }

      // Move forward to just before obstacle, then bounce back (~520ms total)
      const maxDist = Math.max(4, Math.min(16, steps * CELL - 10));
      const dur = 520;
      let t0: number | null = null;

      function frame(now: number) {
        if (t0 === null) t0 = now;
        const progress = Math.min(1, (now - t0) / dur);

        let s = 0;
        if (progress < 0.45) {
          const k = progress / 0.45;
          const easeOut = Math.sin((k * Math.PI) / 2);
          s = easeOut * maxDist;
        } else {
          const k = (progress - 0.45) / 0.55;
          const easeIn = Math.cos((k * Math.PI) / 2);
          s = easeIn * maxDist;
        }

        drawArrow(a.line, a.head, a.g, a.path, s, 1, a.hitArea);

        if (progress < 1) {
          requestAnimationFrame(frame);
        } else {
          drawArrow(a.line, a.head, a.g, a.path, 0, 1, a.hitArea);
          a.animating = false;
        }
      }

      requestAnimationFrame(frame);
    },
    [showToast]
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
      dots.setAttribute('class', 'lvl3-dots');
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
      g.setAttribute('class', 'lvl3-arrow pop');
      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl3-pathline');
      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl3-head');
      head.setAttribute('d', 'M11 0 L-4 -7 L-4 7 Z');
      // Wide invisible hit area for reliable mobile taps
      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '28');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('pointer-events', 'stroke');
      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);
      svg.appendChild(g);

      const obj: ArrowRuntime = {
        def,
        path,
        g,
        line,
        hitArea,
        head,
        dots,
        gone: false,
        collided: false,
        animating: false,
      };
      arrowsRef.current[def.id] = obj;
      drawArrow(line, head, g, path, 0, 1, hitArea);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (isInputLockedRef.current || obj.gone || obj.animating) return;

        const ray = checkExitRay(def);
        if (ray.clear) {
          playTapSound();
          remove(def.id);
        } else {
          bounce(def.id, ray.steps);
        }
      });
    });
  }, [remove, bounce]);

  useEffect(() => {
    buildBoardRef.current = buildBoard;
    buildBoard();
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, [buildBoard]);

  const revealSolvableHint = useCallback(() => {
    const freeArrow = ARROWS.find((def) => {
      const a = arrowsRef.current[def.id];
      if (!a || a.gone || a.animating) return false;
      return checkExitRay(def).clear;
    });

    if (!freeArrow) {
      showToast('No solvable arrows remaining');
      return;
    }

    const a = arrowsRef.current[freeArrow.id];
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
    const freeArrow = ARROWS.find((def) => {
      const a = arrowsRef.current[def.id];
      if (!a || a.gone || a.animating) return false;
      return checkExitRay(def).clear;
    });

    if (!freeArrow) {
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
    setHearts(3);
    isInputLockedRef.current = false;
    buildBoard();
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 4 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl3-stage">
      <div className="lvl3-app" ref={appRef}>
        {/* Header */}
        <header className="lvl3-topbar">
          <button className="lvl3-round-btn lvl3-back" onClick={handleLevels} aria-label="Back">
            <svg viewBox="0 0 24 24">
              <path d="M16 4L6 12l10 8z" />
            </svg>
          </button>
          <button className="lvl3-round-btn lvl3-restart" onClick={handleRestart} aria-label="Restart">
            <svg viewBox="0 0 24 24">
              <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
            </svg>
          </button>
          <div className="lvl3-level">Level 3</div>
          <div className="lvl3-hearts" aria-label="3 hearts">
            {[0, 1, 2].map((idx) => (
              <span
                key={idx}
                className={`lvl3-heart ${idx >= hearts ? 'lost' : ''}`}
                aria-label={idx < hearts ? 'Active heart' : 'Lost heart'}
              >
                <svg viewBox="0 0 24 24">
                  <path
                    fill="#ee4b60"
                    d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z"
                  />
                </svg>
              </span>
            ))}
          </div>
          <button
            className="lvl3-round-btn lvl3-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
              <circle cx="12" cy="12" r="3" />
              <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-2.68v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.7 15a1.7 1.7 0 0 0-1.56-1.04H6v-2.68h.14A1.7 1.7 0 0 0 7.7 10.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 0 0 1.88-.34 1.7 1.7 0 0 0 1.04-1.56V5h2.68v.2a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04H21v2.68h-.04A1.7 1.7 0 0 0 19.4 15z" />
            </svg>
          </button>
        </header>

        {/* Board SVG Wrap */}
        <div id="board-wrap" className="lvl3-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl3-boardSvg" viewBox="-20 -20 118 144" />
        </div>

        {/* Bottom Controls */}
        <div className="lvl2-controls">
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
        <div className={`lvl3-win ${isWon ? 'on' : ''}`}>
          <div className="lvl3-win-card">
            <h2>Level Complete!</h2>
            <p>Level 3 cleared</p>
            <div className="lvl3-trophy">🏆</div>
            <div className="lvl3-stars">★ ★ ★</div>
            <button className="lvl3-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button
              onClick={() => {
                showRewardedAd({
                  rewardType: 'double_win',
                  title: 'Double Level Coins',
                  rewardDescription: '+40 Bonus Coins',
                  onReward: () => {
                    dispatch({ type: 'ADD_COINS', amount: 40 });
                    showToast('+40 Bonus Coins Claimed!');
                  },
                });
              }}
              style={{
                width: '100%',
                height: 42,
                borderRadius: 14,
                background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                color: '#fff',
                fontWeight: 800,
                fontSize: 13,
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 6,
                cursor: 'pointer',
                border: 'none',
              }}
            >
              <span>🪙</span>
              <span>Claim 2x Coins (Watch Ad)</span>
            </button>
            <button className="lvl3-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl3-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl3-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
