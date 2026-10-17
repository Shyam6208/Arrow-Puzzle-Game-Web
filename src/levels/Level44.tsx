import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 35, rows: 50 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[8,46],[7,46],[6,46],[6,45],[5,45],[5,44],[4,44],[4,43],[4,42],[3,42],[3,43]]},
  {"id":"a1","pts":[[4,41],[3,41],[3,40],[3,39],[3,38],[4,38],[4,37],[4,36],[4,35],[5,35],[5,34],[5,33],[6,33],[6,32],[6,31],[7,31],[7,30],[7,29],[8,29],[9,29],[9,28],[8,28]]},
  {"id":"a2","pts":[[12,42],[11,42],[11,43],[11,44],[11,45],[10,45],[10,44],[9,44],[8,44],[8,43],[7,43],[7,42],[6,42],[5,42]]},
  {"id":"a3","pts":[[15,18],[14,18],[13,18],[13,19],[12,19],[11,19],[11,20],[10,20],[10,21],[10,22],[9,22],[9,23],[9,24],[8,24],[8,25],[8,26],[9,26],[9,27],[8,27]]},
  {"id":"a4","pts":[[9,43],[10,43],[10,42],[9,42],[8,42],[8,41],[7,41],[6,41],[5,41],[5,40],[4,40],[4,39],[5,39],[5,38],[5,37],[5,36],[6,36],[6,35],[6,34],[7,34],[7,33],[7,32],[8,32],[8,31],[8,30]]},
  {"id":"a5","pts":[[9,41],[10,41],[11,41],[11,40],[10,40],[9,40],[8,40],[7,40],[6,40]]},
  {"id":"a6","pts":[[10,24],[10,23],[11,23],[11,24],[12,24],[12,23],[13,23],[13,24],[14,24],[14,23],[15,23],[15,24],[15,25],[14,25],[13,25],[12,25],[11,25],[10,25],[9,25]]},
  {"id":"a7","pts":[[14,32],[13,32],[13,33],[12,33],[12,34],[11,34],[10,34],[10,33],[11,33],[11,32],[10,32],[9,32]]},
  {"id":"a8","pts":[[11,21],[11,22],[12,22],[13,22],[14,22],[15,22],[15,21],[14,21],[13,21],[12,21],[12,20],[13,20],[14,20],[15,20],[15,19],[14,19]]},
  {"id":"a9","pts":[[14,30],[14,29],[14,28],[14,27],[14,26],[15,26],[15,27],[15,28],[15,29],[15,30],[15,31],[14,31],[13,31],[13,30],[13,29],[13,28],[13,27],[13,26]]},
  {"id":"a10","pts":[[15,10],[14,10],[14,9],[14,8],[14,7],[14,6],[14,5],[14,4],[15,4],[15,3]]},
  {"id":"a11","pts":[[20,33],[20,34],[21,34],[21,35],[22,35],[22,36],[22,37],[23,37],[23,38],[23,39],[22,39],[22,40],[22,41],[21,41],[21,42],[20,42],[20,43],[19,43],[18,43],[17,43],[16,43],[15,43],[14,43],[14,42],[13,42],[13,41],[12,41],[12,40],[12,39],[11,39],[11,38],[11,37],[12,37],[12,36],[12,35],[13,35],[13,34],[14,34],[14,33]]},
  {"id":"a12","pts":[[16,4],[16,3]]},
  {"id":"a13","pts":[[16,36],[16,35],[16,34],[16,33],[16,32],[16,31],[16,30],[16,29],[16,28],[16,27],[16,26],[16,25],[16,24],[16,23],[16,22],[16,21],[16,20],[16,19],[16,18],[16,17],[16,16],[16,15],[16,14],[16,13],[16,12],[16,11],[16,10],[16,9],[16,8],[16,7],[16,6],[16,5]]},
  {"id":"a14","pts":[[17,4],[17,3]]},
  {"id":"a15","pts":[[18,45],[19,45],[20,45],[20,44],[19,44],[18,44],[17,44],[16,44],[15,44],[14,44],[14,45],[15,45],[16,45],[17,45],[17,46]]},
  {"id":"a16","pts":[[18,38],[19,38],[19,37],[18,37],[17,37],[16,37],[15,37],[15,38],[16,38],[17,38],[17,39]]},
  {"id":"a17","pts":[[17,5],[17,6],[17,7],[17,8],[17,9],[17,10],[17,11],[17,12],[17,13],[17,14],[17,15],[17,16],[17,17],[17,18],[17,19],[17,20],[17,21],[17,22],[17,23],[17,24],[17,25],[17,26],[17,27],[17,28],[17,29],[17,30],[17,31],[17,32],[17,33],[17,34],[17,35],[17,36]]},
  {"id":"a18","pts":[[18,4],[18,3]]},
  {"id":"a19","pts":[[18,36],[18,35],[18,34],[18,33],[18,32],[18,31],[18,30],[18,29],[18,28],[18,27],[18,26],[18,25],[18,24],[18,23],[18,22],[18,21],[18,20],[18,19],[18,18],[18,17],[18,16],[18,15],[18,14],[18,13],[18,12],[18,11],[18,10],[18,9],[18,8],[18,7],[18,6],[18,5]]},
  {"id":"a20","pts":[[19,10],[20,10],[20,9],[20,8],[20,7],[20,6],[20,5],[20,4],[19,4],[19,3]]},
  {"id":"a21","pts":[[19,18],[20,18],[21,18],[21,19],[22,19],[23,19],[23,20],[24,20],[24,21],[24,22],[25,22],[25,23],[25,24],[26,24],[26,25],[26,26],[25,26],[25,27],[26,27]]},
  {"id":"a22","pts":[[23,21],[23,22],[22,22],[21,22],[20,22],[19,22],[19,21],[20,21],[21,21],[22,21],[22,20],[21,20],[20,20],[19,20],[19,19],[20,19]]},
  {"id":"a23","pts":[[24,24],[24,23],[23,23],[23,24],[22,24],[22,23],[21,23],[21,24],[20,24],[20,23],[19,23],[19,24],[19,25],[20,25],[21,25],[22,25],[23,25],[24,25],[25,25]]},
  {"id":"a24","pts":[[24,26],[23,26],[22,26],[22,27],[23,27],[24,27]]},
  {"id":"a25","pts":[[30,41],[31,41],[31,40],[31,39],[31,38],[30,38],[30,37],[30,36],[30,35],[29,35],[29,34],[29,33],[28,33],[28,32],[28,31],[27,31],[27,30],[27,29],[26,29],[25,29],[25,28],[26,28]]},
  {"id":"a26","pts":[[20,32],[20,31],[21,31],[22,31],[23,31],[24,31],[25,31],[26,31],[26,30]]},
  {"id":"a27","pts":[[23,40],[23,41],[23,42],[23,43],[23,44],[24,44],[25,44],[26,44],[27,44],[28,44],[28,43],[29,43],[29,42],[29,41],[29,40],[30,40]]},
  {"id":"a28","pts":[[24,32],[25,32],[26,32],[27,32]]},
  {"id":"a29","pts":[[25,42],[25,41],[25,40],[25,39],[25,38],[25,37],[25,36],[25,35],[24,35],[24,34],[24,33],[23,33],[23,32],[22,32],[21,32],[21,33],[22,33],[22,34],[23,34],[23,35],[23,36],[24,36],[24,37],[24,38],[24,39],[24,40],[24,41],[24,42],[24,43],[25,43],[26,43],[27,43],[27,42],[28,42],[28,41],[28,40],[28,39],[28,38],[28,37],[28,36],[28,35],[28,34]]},
  {"id":"a30","pts":[[26,46],[27,46],[28,46],[28,45],[29,45],[29,44],[30,44],[30,43],[30,42],[31,42],[31,43]]},
  {"id":"a31","pts":[[21,43],[21,44],[21,45],[22,45],[23,45],[24,45],[24,46],[25,46]]},
  {"id":"a32","pts":[[18,46],[19,46],[20,46],[21,46],[22,46],[23,46]]},
  {"id":"a33","pts":[[5,43],[6,43],[6,44],[7,44],[7,45],[8,45],[9,45],[9,46],[10,46],[11,46],[12,46],[12,45],[12,44],[12,43],[13,43],[13,44],[13,45],[13,46],[14,46],[15,46],[16,46]]},
  {"id":"a34","pts":[[9,38],[8,38],[7,38],[7,39],[8,39],[9,39],[10,39],[10,38],[10,37],[9,37],[8,37],[8,36],[9,36],[10,36],[11,36],[11,35],[10,35],[9,35],[9,34],[9,33],[8,33],[8,34],[8,35],[7,35],[7,36],[7,37],[6,37],[6,38],[6,39]]},
  {"id":"a35","pts":[[11,29],[11,30],[11,31],[10,31],[9,31],[9,30],[10,30],[10,29],[10,28],[11,28],[11,27],[10,27],[10,26],[11,26],[12,26],[12,27],[12,28],[12,29],[12,30],[12,31],[12,32]]},
  {"id":"a36","pts":[[15,32],[15,33],[15,34],[15,35],[14,35],[14,36],[13,36],[13,37],[13,38],[13,39],[14,39],[14,40],[15,40],[15,41],[16,41],[16,42]]},
  {"id":"a37","pts":[[15,5],[15,6],[15,7],[15,8],[15,9]]},
  {"id":"a38","pts":[[19,32],[19,33],[19,34],[19,35],[20,35],[20,36],[21,36],[21,37],[21,38],[21,39],[20,39],[20,40],[19,40],[19,41],[18,41],[18,42]]},
  {"id":"a39","pts":[[19,26],[19,27],[19,28],[20,28],[20,27],[20,26],[21,26],[21,27],[21,28],[22,28],[23,28],[24,28],[24,29],[23,29],[22,29],[21,29],[20,29],[19,29]]},
  {"id":"a40","pts":[[25,30],[24,30],[23,30],[22,30],[21,30],[20,30],[19,30],[19,31]]},
  {"id":"a41","pts":[[19,5],[19,6],[19,7],[19,8],[19,9]]},
  {"id":"a42","pts":[[22,44],[22,43],[22,42]]},
  {"id":"a43","pts":[[25,45],[26,45],[27,45]]},
  {"id":"a44","pts":[[27,41],[27,40],[27,39],[27,38],[27,37],[27,36],[27,35],[27,34],[27,33],[26,33],[25,33],[25,34],[26,34],[26,35],[26,36],[26,37],[26,38],[26,39],[26,40],[26,41],[26,42]]},
  {"id":"a45","pts":[[30,39],[29,39],[29,38],[29,37],[29,36]]}
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

export default function Level44() {
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

  const currentLevelId = state.game?.levelId || 44;

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
        el.className = 'lvl44-confetti';
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
    dispatch({ type: 'START_LEVEL', levelId: 45 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl44-stage">
      <div className="lvl44-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl44-topbar">
          <div className="lvl44-btns">
            <button className="lvl44-round-btn" onClick={handleLevels} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl44-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl44-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl44-header-center">
            <div className="lvl44-level">Level {currentLevelId}</div>
            <div className="lvl44-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl44-hslot ${!isActive ? 'lost' : ''}`}
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
            className="lvl44-round-btn lvl44-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl44-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl44-svg" viewBox="-14 -14 640 910" />
        </div>

        {/* Controls */}
        <div className="lvl44-controls">
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
          <button className="lvl44-round lvl44-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl44-bulb">
              <span className="lvl44-bolt">ϟ</span>
            </span>
            <span className="lvl44-ad">AD</span>
          </button>
          <button
            className="lvl44-round lvl44-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl44-calc-icon">
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
        <div className={`lvl44-win ${isWon ? 'on' : ''}`}>
          <div className="lvl44-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl44-trophy">🏆</div>
            <div className="lvl44-stars">★ ★ ★</div>
            <button className="lvl44-next" onClick={handleNextLevel}>
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
            <button className="lvl44-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl44-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl44-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
