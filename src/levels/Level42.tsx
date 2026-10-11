import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 18, rows: 22 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[3,3],[2,3],[2,4],[2,5],[2,6],[3,6],[3,5],[3,4],[4,4],[5,4],[6,4],[6,5],[6,6],[6,7],[7,7],[8,7],[9,7],[10,7],[11,7],[11,6],[11,5],[12,5],[13,5],[14,5],[15,5]]},
  {"id":"a1","pts":[[8,3],[7,3],[6,3],[5,3],[4,3]]},
  {"id":"a2","pts":[[6,9],[6,8]]},
  {"id":"a3","pts":[[13,4],[12,4],[11,4],[10,4],[9,4],[9,5],[9,6],[8,6],[7,6],[7,5],[8,5],[8,4],[7,4]]},
  {"id":"a4","pts":[[12,10],[13,10],[14,10],[15,10]]},
  {"id":"a5","pts":[[13,9],[14,9],[14,8],[14,7],[13,7],[13,6],[14,6],[15,6]]},
  {"id":"a6","pts":[[14,3],[15,3],[15,4],[14,4]]},
  {"id":"a7","pts":[[4,18],[3,18],[2,18],[2,17],[2,16],[2,15],[2,14],[2,13],[3,13],[3,14],[3,15],[3,16],[3,17],[4,17],[5,17],[6,17],[7,17],[8,17],[9,17],[10,17],[11,17],[12,17],[13,17],[14,17],[14,16],[14,15],[14,14],[14,13],[14,12],[14,11]]},
  {"id":"a8","pts":[[2,7],[2,8],[2,9],[2,10],[2,11],[2,12]]},
  {"id":"a9","pts":[[5,6],[4,6],[4,7],[3,7]]},
  {"id":"a10","pts":[[15,11],[15,12],[15,13],[15,14],[15,15],[15,16],[15,17],[15,18],[14,18],[13,18],[12,18],[11,18],[10,18],[9,18],[8,18],[7,18],[6,18],[5,18]]},
  {"id":"a11","pts":[[9,3],[10,3],[11,3],[12,3],[13,3]]},
  {"id":"a12","pts":[[12,15],[13,15]]},
  {"id":"a13","pts":[[15,7],[15,8],[15,9]]},
  {"id":"a14","pts":[[10,9],[10,8],[11,8],[11,9],[12,9]]},
  {"id":"a15","pts":[[4,12],[3,12],[3,11],[3,10],[4,10],[5,10],[6,10],[6,11],[7,11],[7,10],[7,9],[8,9],[9,9]]},
  {"id":"a16","pts":[[3,8],[3,9]]},
  {"id":"a17","pts":[[5,9],[5,8],[4,8]]},
  {"id":"a18","pts":[[6,12],[6,13],[5,13],[5,12],[5,11],[4,11]]},
  {"id":"a19","pts":[[9,8],[8,8],[7,8]]},
  {"id":"a20","pts":[[13,16],[12,16],[11,16],[11,15],[11,14],[10,14],[10,15],[9,15],[9,14],[9,13],[8,13],[8,14],[7,14],[7,13],[7,12]]},
  {"id":"a21","pts":[[4,16],[5,16],[6,16],[7,16],[8,16],[9,16],[10,16]]},
  {"id":"a22","pts":[[4,13],[4,14],[4,15]]},
  {"id":"a23","pts":[[10,11],[11,11],[11,10]]},
  {"id":"a24","pts":[[9,10],[10,10]]},
  {"id":"a25","pts":[[10,13],[10,12],[9,12],[9,11]]},
  {"id":"a26","pts":[[10,5],[10,6]]},
  {"id":"a27","pts":[[4,5],[5,5]]},
  {"id":"a28","pts":[[8,15],[7,15],[6,15],[5,15],[5,14]]},
  {"id":"a29","pts":[[8,10],[8,11],[8,12]]},
  {"id":"a30","pts":[[12,12],[11,12],[11,13]]},
  {"id":"a31","pts":[[12,8],[13,8]]},
  {"id":"a32","pts":[[13,11],[12,11]]},
  {"id":"a33","pts":[[12,13],[13,13],[13,12]]},
  {"id":"a34","pts":[[13,14],[12,14]]},
  {"id":"a35","pts":[[12,6],[12,7]]}
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [def.pts[0].slice() as [number, number]];
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

RAW_ARROWS.forEach((a) => {
  a.cells = cellsOf(a);
});

interface ArrowPath {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

interface ArrowRuntime {
  def: ArrowDef;
  path: ArrowPath;
  g: SVGGElement;
  line: SVGPolylineElement;
  hitArea: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

function makePath(def: ArrowDef): ArrowPath {
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
  const dir: [number, number] = [(ex - px) / dl, (ey - py) / dl];
  return { pts, arcs, L, dir };
}

function pointAt(path: ArrowPath, p: number): [number, number] {
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

function pulledShape(path: ArrowPath, s: number): [number, number][] {
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
  path: ArrowPath,
  s: number,
  op: number,
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

export default function Level42() {
  const { state, dispatch, showRewardedAd } = useStore();
  const {
    zoomLevel,
    isPanMode,
    togglePanMode,
    isPanned,
    zoomIn,
    zoomOut,
    resetZoom,
    canZoomIn,
    canZoomOut,
    boardRef,
    boardStyle,
  } = useZoom();

  const currentLevelId = state.game?.levelId || 42;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});
  const boardRevisionRef = useRef(0);

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
      osc.stop(ctx.currentTime + 0.095);
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
        el.className = 'lvl42-confetti';
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
        p.el.style.opacity = p.t > p.life - 0.4 ? `${(p.life - p.t) / 0.4}` : '1';
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const blocked = useCallback((id: string): boolean => {
    const a = arrowsRef.current[id];
    if (!a) return false;
    const ray = new Set(rayCells(a.def));
    return RAW_ARROWS.some((o) => {
      if (o.id === id) return false;
      const other = arrowsRef.current[o.id];
      if (!other || other.gone) return false;
      return (o.cells || []).some(([c, r]) => ray.has(c + ',' + r));
    });
  }, []);

  const gapPx = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = cellDir(a.def);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      for (const o of RAW_ARROWS) {
        if (o.id === id) continue;
        const other = arrowsRef.current[o.id];
        if (other && !other.gone && (o.cells || []).some(([cc, rr]) => cc === c && rr === r)) {
          return k * CELL;
        }
      }
      c += dc;
      r += dr;
    }
    return 9999;
  }, []);

  const collide = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy) return;
      a.busy = true;

      if (!a.wrongLocked) {
        a.wrongLocked = true;
        setMistakes((prev) => {
          const next = prev + 1;
          if (next >= 3) {
            isInputLockedRef.current = true;
          }
          return next;
        });
      }

      playTapSound(false);

      a.g.classList.add('hit');
      if (appRef.current) {
        appRef.current.classList.remove('shake');
        void appRef.current.offsetWidth;
        appRef.current.classList.add('shake');
      }

      const gap = gapPx(id);
      const bump = Math.max(14, Math.min(gap === 9999 ? 46 : gap - 10, 46));
      const dur = 520;
      let t0: number | null = null;

      const fr = (now: number) => {
        if (t0 === null) t0 = now;
        const k = Math.min(1, (now - t0) / dur);
        const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);
        drawArrow(a.line, a.head, a.g, a.path, bump * e, 1, a.hitArea);
        if (k < 1) {
          requestAnimationFrame(fr);
        } else {
          a.busy = false;
          a.g.classList.remove('hit');
          setMistakes((currentMistakes) => {
            if (currentMistakes >= 3) {
              isInputLockedRef.current = true;
              playFailSound();
              setTimeout(() => {
                buildBoardRef.current();
              }, 950);
            }
            return currentMistakes;
          });
        }
      };
      requestAnimationFrame(fr);
    },
    [gapPx]
  );

  const remove = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    clearedRef.current += 1;
    setRemainingCount(RAW_ARROWS.length - clearedRef.current);
    boardRevisionRef.current += 1;

    Object.values(arrowsRef.current).forEach((ar) => {
      ar.wrongLocked = false;
    });

    a.g.classList.add('fly');
    const L = a.path.L;
    const dist = L + 340;
    const dur = 750 + L * 3.2;
    let t0: number | null = null;
    let dotsShown = false;

    const frame = (now: number) => {
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
        a.g.style.display = 'none';
        if (clearedRef.current >= RAW_ARROWS.length) {
          setTimeout(() => {
            setIsWon(true);
            triggerConfetti();
            dispatch({ type: 'COMPLETE_LEVEL' });
          }, 420);
        }
      }
    };
    requestAnimationFrame(frame);
  };

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy || isInputLockedRef.current) return;
      if (blocked(id)) {
        collide(id);
        return;
      }
      remove(id);
    },
    [blocked, collide]
  );

  const findSolvableArrow = useCallback((): string | null => {
    for (const def of RAW_ARROWS) {
      const a = arrowsRef.current[def.id];
      if (a && !a.gone && !blocked(def.id)) {
        return def.id;
      }
    }
    return null;
  }, [blocked]);

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    boardRevisionRef.current = 0;
    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);
    isInputLockedRef.current = false;
    setIsWon(false);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g') as SVGGElement;
      dots.setAttribute('class', 'dots');
      def.cells?.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', x.toString());
        d.setAttribute('cy', y.toString());
        d.setAttribute('r', '2.6');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g') as SVGGElement;
      g.setAttribute('class', 'arrow pop');

      const hitArea = document.createElementNS(NS, 'polyline') as SVGPolylineElement;
      hitArea.setAttribute('class', 'hit');

      const line = document.createElementNS(NS, 'polyline') as SVGPolylineElement;
      line.setAttribute('class', 'pathline');

      const head = document.createElementNS(NS, 'path') as SVGPathElement;
      head.setAttribute('class', 'head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);

      const handlePointer = (e: PointerEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInputLockedRef.current) return;
        playTapSound(true);
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
    const solvableId = findSolvableArrow();
    if (!solvableId) {
      showToast('No free arrows found!');
      return;
    }
    const arrow = arrowsRef.current[solvableId];
    if (arrow) {
      arrow.g.animate(
        [
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
          { filter: 'drop-shadow(0 0 10px #5b6cf3)', transform: 'scale(1.05)' },
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
        ],
        {
          duration: 900,
          iterations: 3,
        }
      );
      showToast('Free arrow highlighted!');
    }
  }, [findSolvableArrow, showToast]);

  const handleHint = () => {
    showRewardedAd({
      rewardType: 'hint',
      title: 'Watch Ad for Hint',
      rewardDescription: '1 Free Move Hint',
      onReward: () => {
        revealSolvableHint();
      },
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

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 43 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl42-stage">
      <div className="lvl42-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl42-topbar">
          <div className="lvl42-btns">
            <button className="lvl42-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl42-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl42-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl42-header-center">
            <div className="lvl42-level">Level {currentLevelId}</div>
            <div className="lvl42-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl42-hslot ${!isActive ? 'lost' : ''}`}
                    style={{
                      opacity: isActive ? 1 : 0.22,
                      transform: `scale(${isActive ? 1 : 0.82})`,
                    }}
                    aria-label={`Heart ${idx + 1} ${isActive ? 'active' : 'lost'}`}
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
            className="lvl42-round-btn lvl42-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl42-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl42-svg" viewBox="-14 -14 334 406" />
        </div>

        {/* Controls */}
        <div className="lvl42-controls">
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
          <button className="lvl42-round lvl42-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl42-bulb">
              <span className="lvl42-bolt">ϟ</span>
            </span>
            <span className="lvl42-ad">AD</span>
          </button>
          <button
            className="lvl42-round lvl42-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl42-calc-icon">
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
        <div className={`lvl42-win ${isWon ? 'on' : ''}`}>
          <div className="lvl42-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl42-trophy">🏆</div>
            <div className="lvl42-stars">★ ★ ★</div>
            <button className="lvl42-next" onClick={handleNextLevel}>
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
            <button className="lvl42-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl42-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl42-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
