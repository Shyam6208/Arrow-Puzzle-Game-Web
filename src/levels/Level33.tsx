import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 39, rows: 47 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[12,37],[12,38],[11,38],[11,39],[10,39],[10,40]]},
  {"id":"a1","pts":[[15,36],[15,35],[15,34],[15,33],[15,32],[15,31],[14,31],[13,31],[13,32],[13,33],[12,33],[12,34],[12,35],[12,36],[11,36],[11,37],[10,37],[10,38]]},
  {"id":"a2","pts":[[15,28],[15,27],[15,26],[15,25],[14,25],[13,25],[13,26],[13,27],[13,28],[12,28],[12,27],[12,26],[12,25],[12,24]]},
  {"id":"a3","pts":[[14,32],[14,33],[14,34],[13,34],[13,35],[14,35],[14,36],[13,36]]},
  {"id":"a4","pts":[[17,44],[16,44],[15,44],[14,44],[13,44]]},
  {"id":"a5","pts":[[15,24],[14,24],[14,23]]},
  {"id":"a6","pts":[[22,27],[22,28],[22,29],[21,29],[20,29],[19,29],[18,29],[17,29],[16,29],[15,29],[14,29],[14,28],[14,27],[14,26]]},
  {"id":"a7","pts":[[18,3],[18,4],[18,5],[17,5],[16,5],[15,5]]},
  {"id":"a8","pts":[[17,10],[17,9],[17,8],[16,8]]},
  {"id":"a9","pts":[[21,44],[20,44],[19,44],[18,44],[18,45],[17,45],[16,45]]},
  {"id":"a10","pts":[[19,1],[18,1],[17,1]]},
  {"id":"a11","pts":[[26,37],[27,37],[27,38],[27,39],[27,40],[27,41],[26,41],[25,41],[24,41],[23,41],[23,42],[23,43],[23,44],[22,44],[22,45],[21,45],[20,45],[19,45]]},
  {"id":"a12","pts":[[21,11],[21,10],[21,9],[20,9],[20,8],[21,8],[22,8],[22,7],[22,6],[22,5],[21,5],[21,4],[21,3],[22,3],[22,2],[21,2],[21,1],[20,1]]},
  {"id":"a13","pts":[[21,6],[21,7],[20,7],[20,6],[20,5],[20,4],[20,3],[20,2]]},
  {"id":"a14","pts":[[20,10],[20,11],[20,12],[20,13],[20,14],[20,15],[21,15],[21,14],[21,13],[21,12]]},
  {"id":"a15","pts":[[24,25],[24,26],[24,27],[23,27],[23,26]]},
  {"id":"a16","pts":[[24,43],[24,42],[25,42],[26,42],[27,42]]},
  {"id":"a17","pts":[[26,43],[25,43],[25,44],[24,44]]},
  {"id":"a18","pts":[[12,39],[12,40],[11,40],[11,41],[11,42],[12,42],[12,43],[13,43],[14,43],[15,43],[16,43],[17,43],[18,43],[19,43],[20,43],[21,43],[22,43]]},
  {"id":"a19","pts":[[12,41],[13,41],[13,42],[14,42],[14,41],[15,41],[15,42]]},
  {"id":"a20","pts":[[26,33],[26,34],[26,35],[26,36],[27,36]]},
  {"id":"a21","pts":[[28,40],[28,39],[28,38],[28,37]]},
  {"id":"a22","pts":[[12,29],[13,29],[13,30],[14,30],[15,30],[16,30],[17,30],[18,30],[19,30],[20,30],[21,30],[22,30],[23,30],[23,31],[23,32],[23,33],[24,33],[25,33],[25,34],[25,35],[25,36],[25,37],[25,38],[26,38]]},
  {"id":"a23","pts":[[24,30],[24,31],[24,32],[25,32],[25,31],[25,30],[25,29],[24,29],[23,29]]},
  {"id":"a24","pts":[[19,40],[18,40],[17,40],[16,40],[16,41],[16,42],[17,42],[18,42],[19,42],[20,42],[21,42],[22,42],[22,41],[22,40],[22,39],[22,38],[22,37],[22,36],[21,36],[20,36],[19,36],[18,36],[17,36],[16,36],[16,35],[16,34],[16,33],[16,32],[16,31],[17,31],[18,31],[19,31],[20,31],[21,31],[22,31]]},
  {"id":"a25","pts":[[20,40],[20,39],[19,39],[18,39],[17,39],[17,38],[18,38],[19,38],[20,38],[21,38],[21,39],[21,40],[21,41],[20,41],[19,41],[18,41],[17,41]]},
  {"id":"a26","pts":[[23,37],[24,37],[24,36],[23,36]]},
  {"id":"a27","pts":[[15,40],[14,40],[13,40],[13,39],[13,38],[13,37],[14,37],[15,37],[16,37],[17,37],[18,37],[19,37],[20,37],[21,37]]},
  {"id":"a28","pts":[[13,23],[13,24]]},
  {"id":"a29","pts":[[15,38],[16,38],[16,39],[15,39],[14,39],[14,38]]},
  {"id":"a30","pts":[[23,39],[23,38],[24,38],[24,39],[25,39],[26,39],[26,40],[25,40],[24,40],[23,40]]},
  {"id":"a31","pts":[[23,35],[22,35],[21,35],[20,35],[20,34],[20,33],[21,33],[21,34],[22,34],[23,34],[24,34],[24,35]]},
  {"id":"a32","pts":[[20,32],[21,32],[22,32],[22,33]]},
  {"id":"a33","pts":[[25,24],[25,25],[26,25],[26,26],[26,27],[26,28],[26,29]]},
  {"id":"a34","pts":[[23,28],[24,28],[25,28],[25,27],[25,26]]},
  {"id":"a35","pts":[[16,2],[17,2],[18,2],[19,2],[19,3],[19,4],[19,5],[19,6],[19,7],[19,8],[19,9],[19,10],[19,11],[19,12],[19,13],[19,14],[19,15],[19,16],[19,17],[19,18],[19,19],[20,19],[21,19],[21,20],[21,21],[21,22],[21,23],[20,23],[19,23],[18,23],[17,23],[17,24],[17,25],[17,26],[17,27],[18,27],[19,27],[20,27],[21,27]]},
  {"id":"a36","pts":[[16,4],[17,4]]},
  {"id":"a37","pts":[[16,26],[16,27],[16,28],[17,28],[18,28],[19,28],[20,28],[21,28]]},
  {"id":"a38","pts":[[19,21],[20,21],[20,22],[19,22],[18,22],[18,21],[18,20],[19,20],[20,20]]},
  {"id":"a39","pts":[[20,26],[19,26],[18,26],[18,25],[18,24],[19,24],[20,24],[21,24],[21,25],[21,26]]},
  {"id":"a40","pts":[[19,25],[20,25]]},
  {"id":"a41","pts":[[17,32],[17,33],[17,34],[17,35],[18,35],[19,35],[19,34],[19,33],[19,32]]},
  {"id":"a42","pts":[[18,19],[18,18],[18,17],[18,16],[18,15],[18,14],[17,14],[17,15],[17,16],[17,17],[17,18],[17,19],[17,20],[17,21],[17,22]]},
  {"id":"a43","pts":[[15,7],[16,7],[17,7],[17,6],[18,6],[18,7],[18,8],[18,9],[18,10],[18,11],[17,11],[17,12],[17,13]]},
  {"id":"a44","pts":[[18,13],[18,12]]},
  {"id":"a45","pts":[[18,34],[18,33],[18,32]]},
  {"id":"a46","pts":[[20,18],[20,17],[20,16],[21,16],[21,17],[21,18]]}
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

export default function Level33() {
  const { state, dispatch, showRewardedAd } = useStore();
  const {
    zoomLevel,
    panOffset,
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

  const currentLevelId = state.game?.levelId || 33;

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
      osc.stop(ctx.currentTime + (ok ? 0.065 : 0.1));
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
        el.className = 'lvl33-confetti';
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
        p.el.style.opacity = p.t > p.life - 0.4 ? String((p.life - p.t) / 0.4) : '1';
        p.el.style.left = `${p.x}px`;
        p.el.style.top = `${p.y}px`;
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const makePath = (def: ArrowDef): ArrowPath => {
    const pts = def.pts.map(([c, r]) => P(c, r));
    const arcs: number[] = [0];
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
  };

  const pointAt = (path: ArrowPath, p: number): [number, number] => {
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
  };

  const pulledShape = (path: ArrowPath, s: number): [number, number][] => {
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
  };

  const drawArrow = (
    line: SVGPolylineElement,
    head: SVGPathElement,
    g: SVGGElement,
    path: ArrowPath,
    s: number,
    op: number,
    hitArea?: SVGPolylineElement
  ) => {
    const shape = pulledShape(path, s);
    const ptsStr = shape.map((p) => `${p[0].toFixed(2)},${p[1].toFixed(2)}`).join(' ');
    line.setAttribute('points', ptsStr);
    if (hitArea) hitArea.setAttribute('points', ptsStr);
    const [hx, hy] = pointAt(path, path.L + s);
    const ang = (Math.atan2(path.dir[1], path.dir[0]) * 180) / Math.PI;
    head.setAttribute(
      'transform',
      `translate(${hx.toFixed(2)},${hy.toFixed(2)}) rotate(${ang.toFixed(2)})`
    );
    g.setAttribute('opacity', op.toFixed(3));
  };

  const cellDir = (def: ArrowDef): [number, number] => {
    const [hc, hr] = def.pts[def.pts.length - 1];
    const [pc, pr] = def.pts[def.pts.length - 2];
    return [Math.sign(hc - pc), Math.sign(hr - pr)];
  };

  const rayCells = (def: ArrowDef): string[] => {
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
  };

  const blocked = useCallback((id: string): boolean => {
    const current = arrowsRef.current[id];
    if (!current) return false;
    const def = current.def;
    const ray = new Set(rayCells(def));
    return RAW_ARROWS.some(
      (o) =>
        o.id !== id &&
        !arrowsRef.current[o.id]?.gone &&
        o.cells?.some(([c, r]) => ray.has(`${c},${r}`))
    );
  }, []);

  const gapPx = (id: string): number => {
    const current = arrowsRef.current[id];
    if (!current) return 9999;
    const def = current.def;
    const [dc, dr] = cellDir(def);
    let [c, r] = def.pts[def.pts.length - 1];
    let k = 0;
    c += dc;
    r += dr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        RAW_ARROWS.some(
          (o) =>
            o.id !== id &&
            !arrowsRef.current[o.id]?.gone &&
            o.cells?.some(([cc, rr]) => cc === c && rr === r)
        )
      ) {
        return k * CELL;
      }
      c += dc;
      r += dr;
    }
    return 9999;
  };

  const collide = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone || a.busy) return;
    a.busy = true;

    playTapSound(false);

    setMistakes((prev) => {
      const next = prev + 1;
      if (next >= 3) {
        isInputLockedRef.current = true;
        playFailSound();
        showToast('Level Failed! Restarting...');
        setTimeout(() => {
          handleRestart();
        }, 1100);
      }
      return next;
    });

    a.g.classList.add('hit');
    const app = appRef.current;
    if (app) {
      app.classList.remove('shake');
      void app.offsetWidth;
      app.classList.add('shake');
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
      }
    };
    requestAnimationFrame(fr);
  };

  const remove = (id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return;
    a.gone = true;
    clearedRef.current += 1;
    boardRevisionRef.current += 1;
    setRemainingCount(RAW_ARROWS.length - clearedRef.current);

    playTapSound(true);

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
    [blocked]
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
    isInputLockedRef.current = false;
    setMistakes(0);
    setRemainingCount(RAW_ARROWS.length);
    setIsWon(false);

    RAW_ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl33-dots');
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
      g.setAttribute('class', 'lvl33-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl33-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl33-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '17');
      hitArea.setAttribute('fill', 'none');
      hitArea.setAttribute('stroke-linecap', 'round');
      hitArea.setAttribute('stroke-linejoin', 'round');
      hitArea.setAttribute('pointer-events', 'stroke');

      g.appendChild(hitArea);
      g.appendChild(line);
      g.appendChild(head);

      const handlePointer = (e: Event) => {
        e.preventDefault();
        e.stopPropagation();
        if (isInputLockedRef.current) return;
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
    const targetId = findSolvableArrow();
    if (!targetId) {
      showToast('All arrows cleared!');
      return;
    }

    const a = arrowsRef.current[targetId];
    if (a) {
      a.g.animate(
        [
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.06)',
          },
          { filter: 'drop-shadow(0 0 6px rgba(91,108,243,0.5))', transform: 'scale(1)' },
          {
            filter:
              'drop-shadow(0 0 18px rgba(91,108,243,1)) drop-shadow(0 0 8px rgba(245,158,11,0.9))',
            transform: 'scale(1.06)',
          },
          { filter: 'drop-shadow(0 0 0 transparent)', transform: 'scale(1)' },
        ],
        { duration: 1500, iterations: 1 }
      );
      showToast('Hint: Next Solvable Arrow Highlighted!');
    }
  }, [findSolvableArrow, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    if (!findSolvableArrow()) {
      showToast('All arrows cleared!');
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

  const handleLevelSelect = () => {
    setIsWon(false);
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 34 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl33-stage">
      <div className="lvl33-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl33-topbar">
          <div className="lvl33-btns">
            <button className="lvl33-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl33-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl33-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl33-header-center">
            <div className="lvl33-level">Level {currentLevelId}</div>
            <div className="lvl33-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl33-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl33-round-btn lvl33-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl33-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl33-boardSvg" viewBox="-14 -14 712 856" />
        </div>

        {/* Controls */}
        <div className="lvl33-controls">
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
          <button className="lvl33-round lvl33-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl33-bulb">
              <span className="lvl33-bolt">ϟ</span>
            </span>
            <span className="lvl33-ad">AD</span>
          </button>
          <button
            className="lvl33-round lvl33-calculator"
            onClick={() => showToast('Level 33: 47 Arrows')}
            aria-label="Info"
          >
            <span className="lvl33-calc-icon">
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
        <div className={`lvl33-win ${isWon ? 'on' : ''}`}>
          <div className="lvl33-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl33-trophy">🏆</div>
            <div className="lvl33-stars">★ ★ ★</div>
            <button className="lvl33-next" onClick={handleLevelSelect}>
              Level Select ➔
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
            <button className="lvl33-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl33-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl33-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
