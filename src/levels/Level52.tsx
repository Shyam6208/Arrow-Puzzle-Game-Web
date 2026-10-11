import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 27, rows: 29 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[6,10],[6,9],[7,9],[7,10],[7,11],[6,11],[5,11],[4,11],[3,11]]},
  {"id":"a1","pts":[[4,17],[4,18],[4,19],[4,20],[4,21]]},
  {"id":"a2","pts":[[5,15],[5,14],[5,13],[4,13],[4,14]]},
  {"id":"a3","pts":[[5,7],[5,6]]},
  {"id":"a4","pts":[[6,5],[6,6],[6,7],[6,8],[7,8],[8,8],[9,8],[10,8],[11,8],[12,8],[13,8],[14,8],[15,8],[16,8],[17,8],[18,8],[19,8],[20,8],[21,8]]},
  {"id":"a5","pts":[[11,5],[12,5],[13,5],[13,6],[12,6],[11,6],[10,6],[9,6],[8,6],[7,6]]},
  {"id":"a6","pts":[[19,5],[19,6],[20,6],[21,6],[21,7],[20,7],[19,7],[18,7],[17,7],[16,7],[15,7],[14,7],[13,7],[12,7],[11,7],[10,7],[9,7],[8,7],[7,7]]},
  {"id":"a7","pts":[[2,13],[2,14],[3,14],[3,13],[3,12],[4,12],[5,12],[6,12],[7,12],[8,12],[8,11],[8,10],[8,9]]},
  {"id":"a8","pts":[[3,21],[3,20],[3,19]]},
  {"id":"a9","pts":[[8,15],[7,15],[6,15],[6,14],[7,14],[8,14],[8,13],[7,13],[6,13]]},
  {"id":"a10","pts":[[14,3],[13,3],[12,3],[12,4],[13,4],[14,4],[14,5],[14,6],[15,6],[16,6],[17,6],[18,6]]},
  {"id":"a11","pts":[[15,24],[14,24],[14,23],[15,23],[16,23],[16,24],[16,25]]},
  {"id":"a12","pts":[[17,20],[17,21],[18,21],[19,21],[20,21],[21,21],[21,20],[21,19],[21,18],[21,17],[21,16],[21,15],[21,14],[21,13],[21,12],[21,11]]},
  {"id":"a13","pts":[[17,22],[18,22],[18,23],[18,24]]},
  {"id":"a14","pts":[[9,23],[10,23],[11,23],[12,23],[13,23],[13,22],[14,22],[15,22],[16,22]]},
  {"id":"a15","pts":[[7,21],[8,21],[8,22],[9,22],[10,22],[11,22]]},
  {"id":"a16","pts":[[12,18],[12,19],[13,19],[13,18],[13,17],[12,17],[11,17],[11,18],[11,19],[11,20],[12,20],[13,20],[14,20],[15,20],[16,20],[16,21]]},
  {"id":"a17","pts":[[22,11],[23,11]]},
  {"id":"a18","pts":[[22,15],[22,14],[22,13],[22,12],[23,12],[24,12]]},
  {"id":"a19","pts":[[22,19],[23,19]]},
  {"id":"a20","pts":[[23,21],[23,20],[22,20],[22,21]]},
  {"id":"a21","pts":[[9,21],[10,21],[11,21],[12,21],[13,21],[14,21]]},
  {"id":"a22","pts":[[9,9],[9,10],[9,11],[9,12],[9,13],[9,14],[9,15],[9,16],[8,16],[7,16],[6,16],[5,16],[5,17],[5,18],[5,19],[5,20],[5,21],[6,21]]},
  {"id":"a23","pts":[[13,14],[12,14],[11,14],[10,14]]},
  {"id":"a24","pts":[[18,19],[18,20],[19,20],[20,20],[20,19],[20,18],[20,17],[20,16],[20,15],[20,14],[19,14],[18,14],[17,14],[16,14],[15,14],[14,14],[14,15],[13,15],[12,15],[11,15],[10,15]]},
  {"id":"a25","pts":[[10,20],[10,19],[10,18],[10,17],[10,16],[11,16],[12,16],[13,16],[14,16],[14,17],[14,18],[15,18],[15,17],[16,17],[17,17],[18,17],[18,16],[18,15],[17,15],[16,15],[15,15]]},
  {"id":"a26","pts":[[15,10],[14,10],[13,10],[12,10],[11,10],[10,10],[10,9],[11,9],[12,9],[13,9],[14,9],[15,9],[16,9],[17,9],[18,9],[19,9],[20,9],[20,10],[20,11],[20,12]]},
  {"id":"a27","pts":[[10,13],[10,12],[10,11]]},
  {"id":"a28","pts":[[15,13],[14,13],[13,13],[12,13],[11,13],[11,12],[11,11]]},
  {"id":"a29","pts":[[17,16],[16,16],[15,16]]},
  {"id":"a30","pts":[[18,10],[17,10],[16,10],[16,11],[17,11],[18,11],[19,11],[19,10]]},
  {"id":"a31","pts":[[16,13],[17,13],[18,13],[19,13],[19,12],[18,12],[17,12],[16,12],[15,12],[14,12],[13,12],[12,12],[12,11],[13,11],[14,11],[15,11]]},
  {"id":"a32","pts":[[19,15],[19,16],[19,17],[19,18]]},
  {"id":"a33","pts":[[22,17],[22,18]]},
  {"id":"a34","pts":[[8,19],[7,19],[7,18],[8,18],[9,18],[9,19],[9,20],[8,20],[7,20],[6,20],[6,19],[6,18],[6,17],[7,17],[8,17],[9,17]]},
  {"id":"a35","pts":[[8,24],[8,23]]},
  {"id":"a36","pts":[[18,18],[17,18],[17,19],[16,19],[15,19],[14,19]]},
  {"id":"a37","pts":[[17,25],[17,24],[17,23]]},
  {"id":"a38","pts":[[12,24],[11,24],[10,24],[9,24],[9,25],[10,25]]},
  {"id":"a39","pts":[[23,14],[24,14],[24,13],[23,13]]}
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

export default function Level52() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 52;

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
        el.className = 'lvl52-confetti';
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
    const active = Object.values(arrowsRef.current).filter((x) => !x.gone && !x.busy);
    for (const a of active) {
      if (!isBlocked(a.def.id)) {
        return a.def.id;
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
    setIsWon(false);

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
    dispatch({ type: 'START_LEVEL', levelId: 53 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl52-stage">
      <div className="lvl52-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl52-topbar">
          <div className="lvl52-btns">
            <button className="lvl52-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl52-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl52-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl52-header-center">
            <span className="lvl52-level">Level {currentLevelId}</span>
            <div className="lvl52-hearts">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`lvl52-hslot ${i >= 3 - mistakes ? 'lost' : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div className="lvl52-settings">
            <button className="lvl52-round-btn" onClick={handleLevels} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Board */}
        <div className="lvl52-board-wrap" ref={boardRef} style={boardStyle}>
          <svg ref={svgRef} id="boardSvg" className="lvl52-svg" viewBox="-14 -14 496 532" />
        </div>

        {/* Controls */}
        <div className="lvl52-controls">
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
          <button className="lvl52-round" onClick={handleHint} aria-label="Hint">
            <span className="lvl52-bulb">
              <span className="lvl52-bolt">⚡</span>
              <span className="lvl52-ad">AD</span>
            </span>
          </button>

          <button
            className="lvl52-round"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl52-calc-icon">
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
        <div className={`lvl52-win ${isWon ? 'on' : ''}`}>
          <div className="lvl52-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl52-trophy">🏆</div>
            <div className="lvl52-stars">★ ★ ★</div>
            <button className="lvl52-next" onClick={handleNextLevel}>
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
            <button className="lvl52-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl52-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl52-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
