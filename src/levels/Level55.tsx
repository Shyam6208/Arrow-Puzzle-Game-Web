import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 31, rows: 52 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[3,44],[3,47]]},
  {"id":"a1","pts":[[17,46],[18,46],[18,48],[21,48],[21,45],[22,45],[22,49],[2,49],[2,44]]},
  {"id":"a2","pts":[[6,45],[10,45],[10,48],[3,48]]},
  {"id":"a3","pts":[[10,44],[5,44],[5,46],[9,46],[9,47],[4,47],[4,44]]},
  {"id":"a4","pts":[[25,40],[5,40],[5,41],[25,41],[25,42],[5,42]]},
  {"id":"a5","pts":[[24,39],[24,37],[6,37],[6,39],[23,39],[23,38],[7,38]]},
  {"id":"a6","pts":[[8,34],[11,34],[11,35],[8,35]]},
  {"id":"a7","pts":[[10,10],[10,6],[12,6],[12,4],[14,4],[14,2],[16,2],[16,4],[18,4],[18,6],[20,6],[20,10]]},
  {"id":"a8","pts":[[10,14],[10,12],[20,12],[20,14]]},
  {"id":"a9","pts":[[10,33],[10,31]]},
  {"id":"a10","pts":[[11,9],[11,7],[13,7],[13,5],[15,5],[15,3]]},
  {"id":"a11","pts":[[11,10],[12,10],[12,11],[18,11],[18,10],[19,10]]},
  {"id":"a12","pts":[[19,13],[19,14],[11,14],[11,13]]},
  {"id":"a13","pts":[[16,23],[16,25],[14,25],[14,27],[13,27],[13,29],[11,29],[11,27]]},
  {"id":"a14","pts":[[11,30],[12,30],[12,31],[11,31],[11,33],[12,33],[12,36],[15,36],[15,34],[16,34],[16,36],[22,36]]},
  {"id":"a15","pts":[[11,36],[7,36],[7,33],[9,33],[9,30],[10,30],[10,26],[11,26],[11,24],[12,24],[12,15],[13,15]]},
  {"id":"a16","pts":[[17,47],[17,48],[12,48],[12,47],[11,47],[11,48]]},
  {"id":"a17","pts":[[12,8],[14,8],[14,6],[16,6],[16,8]]},
  {"id":"a18","pts":[[12,9],[15,9],[15,7]]},
  {"id":"a19","pts":[[12,13],[18,13]]},
  {"id":"a20","pts":[[16,17],[16,20],[14,20],[14,22],[13,22],[13,25],[12,25],[12,28]]},
  {"id":"a21","pts":[[19,47],[19,45],[12,45]]},
  {"id":"a22","pts":[[12,46],[11,46],[11,44],[20,44],[20,47]]},
  {"id":"a23","pts":[[13,10],[17,10]]},
  {"id":"a24","pts":[[13,16],[13,21]]},
  {"id":"a25","pts":[[13,34],[13,31],[14,31],[14,29],[16,29],[16,27],[19,27],[19,30]]},
  {"id":"a26","pts":[[13,35],[14,35],[14,32],[15,32],[15,30],[16,30]]},
  {"id":"a27","pts":[[14,47],[16,47],[16,46],[13,46],[13,47]]},
  {"id":"a28","pts":[[14,18],[14,15],[18,15],[18,24],[19,24],[19,26],[20,26],[20,28]]},
  {"id":"a29","pts":[[14,19],[15,19],[15,16],[17,16],[17,18]]},
  {"id":"a30","pts":[[14,23],[14,24],[15,24],[15,21],[16,21]]},
  {"id":"a31","pts":[[16,26],[15,26],[15,28],[14,28]]},
  {"id":"a32","pts":[[16,5],[17,5],[17,7],[19,7],[19,9]]},
  {"id":"a33","pts":[[16,9],[17,9],[17,8],[18,8],[18,9]]},
  {"id":"a34","pts":[[16,31],[16,33],[18,33],[18,34],[17,34],[17,35],[22,35]]},
  {"id":"a35","pts":[[17,19],[17,22]]},
  {"id":"a36","pts":[[17,23],[17,25],[18,25],[18,26],[17,26]]},
  {"id":"a37","pts":[[18,28],[17,28],[17,32],[19,32],[19,34],[21,34]]},
  {"id":"a38","pts":[[18,29],[18,31],[20,31],[20,33]]},
  {"id":"a39","pts":[[20,29],[20,30],[21,30],[21,33],[23,33],[23,36]]},
  {"id":"a40","pts":[[25,49],[23,49],[23,48],[24,48],[24,47],[25,47],[25,46],[26,46],[26,49],[28,49],[28,44],[21,44]]},
  {"id":"a41","pts":[[27,48],[27,45],[23,45],[23,47]]}
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

interface PathData {
  pts: [number, number][];
  arcs: number[];
  L: number;
  dir: [number, number];
}

function makePath(def: ArrowDef): PathData {
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

function pointAt(path: PathData, p: number): [number, number] {
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

function pulledShape(path: PathData, s: number): [number, number][] {
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
  def: ArrowDef;
  path: PathData;
  g: SVGGElement;
  line: SVGPolylineElement;
  hit: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  lastWrongRevision: number;
}

export default function Level55() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 55;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
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

  const [mistakes, setMistakes] = useState(0);
  const [remainingCount, setRemainingCount] = useState(RAW_ARROWS.length);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const mistakesRef = useRef(0);
  const boardRevisionRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    setTimeout(() => {
      setToastMsg((cur) => (cur === msg ? null : cur));
    }, 2400);
  }, []);

  const tapSound = useCallback(() => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      if (!audioCtxRef.current) audioCtxRef.current = new AudioCtx();
      if (audioCtxRef.current.state === 'suspended') audioCtxRef.current.resume();

      const now = audioCtxRef.current.currentTime;
      const osc = audioCtxRef.current.createOscillator();
      const gain = audioCtxRef.current.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(520, now);
      osc.frequency.exponentialRampToValueAtTime(340, now + 0.045);
      gain.gain.setValueAtTime(0.045, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(audioCtxRef.current.destination);
      osc.start(now);
      osc.stop(now + 0.065);
    } catch {
      // Audio optional
    }
  }, []);

  const draw = useCallback((a: ArrowRuntime, s: number, op: number) => {
    const shape = pulledShape(a.path, s);
    const ptsStr = shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    a.line.setAttribute('points', ptsStr);
    a.hit.setAttribute('points', ptsStr);

    const [hx, hy] = pointAt(a.path, a.path.L + s);
    const ang = (Math.atan2(a.path.dir[1], a.path.dir[0]) * 180) / Math.PI;
    a.head.setAttribute('transform', `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`);
    a.g.setAttribute('opacity', op.toFixed(3));
  }, []);

  const isBlocked = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a) return false;
    const ray = new Set(rayCells(a.def));
    return RAW_ARROWS.some((o) => {
      if (o.id === id) return false;
      const target = arrowsRef.current[o.id];
      if (!target || target.gone) return false;
      return o.cells?.some(([c, r]) => ray.has(`${c},${r}`));
    });
  }, []);

  const gapPx = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = cellDir(a.def);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      const blockedHere = RAW_ARROWS.some((o) => {
        if (o.id === id) return false;
        const target = arrowsRef.current[o.id];
        if (!target || target.gone) return false;
        return o.cells?.some(([cc, rr]) => cc === c && rr === r);
      });
      if (blockedHere) return k * CELL;
      c += dc;
      r += dr;
    }
    return 9999;
  }, []);

  const confetti = useCallback(() => {
    if (!appRef.current) return;
    const appEl = appRef.current;
    const colors = ['#5b6cf0', '#2b3160', '#aab3f2', '#e3e3ea', '#8f9bf5'];
    const r = appEl.getBoundingClientRect();
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
        el.className = 'lvl55-confetti';
        el.style.background = colors[i % colors.length];
        el.style.transform = `scale(${0.7 + Math.random() * 0.8})`;
        appEl.appendChild(el);
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
  }, []);

  const win = useCallback(() => {
    setIsWon(true);
    dispatch({ type: 'COMPLETE_LEVEL' });
    confetti();
  }, [confetti, dispatch]);

  const removeArrow = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    boardRevisionRef.current++;
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
      draw(a, s, op);

      if (!dotsShown && s >= L) {
        dotsShown = true;
        a.dots.classList.add('show');
      }

      if (k < 1) {
        requestAnimationFrame(frame);
      } else {
        a.g.style.display = 'none';
        const left = Object.values(arrowsRef.current).filter((x) => !x.gone).length;
        setRemainingCount(left);
        if (left === 0) {
          setTimeout(win, 420);
        }
      }
    };
    requestAnimationFrame(frame);
  }, [draw, win]);

  const collideArrow = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    a.busy = true;

    const firstWrongInState = a.lastWrongRevision !== boardRevisionRef.current;
    if (firstWrongInState) {
      a.lastWrongRevision = boardRevisionRef.current;
      mistakesRef.current++;
      setMistakes(mistakesRef.current);
      if (mistakesRef.current >= 3) {
        isInputLockedRef.current = true;
      }
    }

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
      draw(a, bump * e, 1);
      if (k < 1) {
        requestAnimationFrame(fr);
      } else {
        a.busy = false;
        a.g.classList.remove('hit');
        if (mistakesRef.current >= 3) {
          setTimeout(() => {
            buildBoardRef.current();
          }, 950);
        }
      }
    };
    requestAnimationFrame(fr);
  }, [draw, gapPx]);

  const tryRemove = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    if (isBlocked(id)) {
      collideArrow(id);
      return;
    }
    removeArrow(id);
  }, [collideArrow, isBlocked, removeArrow]);

  const findSolvableArrow = useCallback((): string | null => {
    for (const def of RAW_ARROWS) {
      const a = arrowsRef.current[def.id];
      if (a && !a.gone && !isBlocked(def.id)) {
        return def.id;
      }
    }
    return null;
  }, [isBlocked]);

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    mistakesRef.current = 0;
    boardRevisionRef.current = 0;
    isInputLockedRef.current = false;
    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'dots');
      def.cells?.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '2.6');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'arrow pop');

      const hit = document.createElementNS(NS, 'polyline');
      hit.setAttribute('class', 'hit');

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      g.appendChild(hit);
      g.appendChild(line);
      g.appendChild(head);

      g.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        if (isInputLockedRef.current) return;
        tapSound();
        tryRemove(def.id);
      });

      svg.appendChild(g);

      const runtime: ArrowRuntime = {
        def,
        path,
        g,
        line,
        hit,
        head,
        dots,
        gone: false,
        busy: false,
        lastWrongRevision: -1,
      };
      arrowsRef.current[def.id] = runtime;
      draw(runtime, 0, 1);
    });
  }, [draw, tapSound, tryRemove]);

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
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl55-stage">
      <div className="lvl55-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl55-topbar">
          <div className="lvl55-btns">
            <button className="lvl55-round-btn" onClick={handleLevels} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl55-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl55-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl55-header-center">
            <span className="lvl55-level">Level {currentLevelId}</span>
            <div className="lvl55-hearts">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`lvl55-hslot ${i >= 3 - mistakes ? 'lost' : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div className="lvl55-settings">
            <button className="lvl55-round-btn" onClick={handleLevels} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Board */}
        <div className="lvl55-board-wrap" ref={boardRef} style={boardStyle}>
          <svg ref={svgRef} id="boardSvg" className="lvl55-svg" viewBox="-14 -14 568 946" />
        </div>

        {/* Controls */}
        <div className="lvl55-controls">
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
          <button className="lvl55-round" onClick={handleHint} aria-label="Hint">
            <span className="lvl55-bulb">
              <span className="lvl55-bolt">⚡</span>
              <span className="lvl55-ad">AD</span>
            </span>
          </button>

          <button
            className="lvl55-round"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl55-calc-icon">
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
        <div className={`lvl55-win ${isWon ? 'on' : ''}`}>
          <div className="lvl55-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl55-trophy">🏆</div>
            <div className="lvl55-stars">★ ★ ★</div>
            <button className="lvl55-next" onClick={handleNextLevel}>
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
            <button className="lvl55-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl55-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl55-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
