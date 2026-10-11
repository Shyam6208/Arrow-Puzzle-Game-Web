import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 47, rows: 48 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[23,11],[23,10],[23,9],[23,8],[23,7],[23,6],[23,5],[23,4],[23,3]]},
  {"id":"a1","pts":[[25,5],[25,6],[25,7],[25,8]]},
  {"id":"a2","pts":[[22,6],[22,7],[22,8],[22,9],[22,10],[22,11],[22,12],[22,13],[23,13],[23,14],[23,15],[22,15],[21,15],[20,15],[19,15],[18,15],[17,15],[16,15]]},
  {"id":"a3","pts":[[26,7],[26,8],[26,9],[26,10],[25,10],[25,11],[25,12],[25,13],[25,14],[25,15],[25,16],[26,16],[27,16],[28,16],[28,17],[28,18],[27,18],[26,18],[25,18],[25,19],[25,20],[26,20],[27,20]]},
  {"id":"a4","pts":[[27,10],[27,9],[27,8]]},
  {"id":"a5","pts":[[20,13],[19,13],[18,13],[18,12],[18,11],[19,11],[20,11]]},
  {"id":"a6","pts":[[36,13],[35,13],[34,13],[33,13],[32,13],[31,13],[31,12]]},
  {"id":"a7","pts":[[30,13],[30,12],[30,11],[29,11],[28,11],[27,11],[26,11],[26,12],[26,13],[26,14],[26,15]]},
  {"id":"a8","pts":[[28,13],[28,14],[28,15],[29,15],[30,15],[31,15],[32,15]]},
  {"id":"a9","pts":[[19,18],[19,17],[19,16],[18,16],[17,16],[16,16],[16,17],[16,18],[15,18],[14,18],[13,18],[12,18],[12,17],[12,16],[12,15]]},
  {"id":"a10","pts":[[14,16],[14,15]]},
  {"id":"a11","pts":[[6,17],[7,17],[8,17],[9,17],[10,17],[10,16],[10,15]]},
  {"id":"a12","pts":[[34,15],[35,15],[36,15],[36,16],[36,17],[35,17],[34,17],[33,17],[32,17],[31,17],[30,17],[30,18],[30,19],[31,19],[32,19],[33,19],[34,19]]},
  {"id":"a13","pts":[[37,15],[37,16],[38,16],[39,16],[40,16]]},
  {"id":"a14","pts":[[8,21],[7,21],[6,21],[6,20],[6,19],[6,18],[5,18],[4,18],[4,17],[4,16],[3,16],[2,16]]},
  {"id":"a15","pts":[[19,19],[20,19],[21,19],[22,19],[23,19],[23,18],[22,18],[21,18],[20,18],[20,17],[20,16],[21,16],[22,16]]},
  {"id":"a16","pts":[[41,16],[42,16],[43,16],[44,16]]},
  {"id":"a17","pts":[[29,17],[29,18],[29,19],[29,20],[30,20],[31,20],[32,20],[33,20],[34,20],[34,21],[34,22],[34,23],[34,24],[34,25],[34,26],[35,26],[36,26],[37,26]]},
  {"id":"a18","pts":[[17,18],[17,19],[17,20]]},
  {"id":"a19","pts":[[8,20],[8,19],[8,18],[9,18],[9,19],[9,20],[9,21]]},
  {"id":"a20","pts":[[16,20],[15,20],[14,20],[13,20],[12,20],[11,20],[11,19],[11,18]]},
  {"id":"a21","pts":[[40,20],[40,19],[40,18]]},
  {"id":"a22","pts":[[39,24],[39,23],[40,23],[40,22],[40,21],[39,21],[39,20],[39,19],[39,18],[38,18],[37,18],[36,18],[36,19],[37,19],[37,20],[37,21],[37,22],[37,23],[37,24]]},
  {"id":"a23","pts":[[43,18],[42,18],[42,19],[42,20],[42,21]]},
  {"id":"a24","pts":[[23,21],[22,21],[22,22],[22,23],[22,24],[21,24],[20,24],[19,24],[19,23],[20,23],[20,22],[20,21],[19,21],[18,21],[17,21],[17,22],[17,23],[17,24],[17,25],[17,26]]},
  {"id":"a25","pts":[[35,21],[35,22],[35,23]]},
  {"id":"a26","pts":[[15,23],[14,23],[13,23],[12,23],[12,24],[11,24],[10,24],[9,24],[9,23],[10,23],[11,23],[11,22],[11,21],[12,21],[13,21],[14,21],[15,21],[16,21]]},
  {"id":"a27","pts":[[28,22],[27,22],[26,22],[25,22]]},
  {"id":"a28","pts":[[33,24],[33,23],[33,22],[32,22],[31,22],[30,22],[29,22],[29,23],[29,24],[29,25]]},
  {"id":"a29","pts":[[23,22],[23,23],[23,24],[23,25],[23,26],[23,27],[22,27],[22,26]]},
  {"id":"a30","pts":[[31,23],[31,24],[31,25],[31,26],[32,26],[33,26],[33,27],[33,28],[33,29],[34,29],[35,29]]},
  {"id":"a31","pts":[[31,28],[30,28],[30,27],[30,26],[29,26],[28,26],[28,25],[28,24],[27,24],[26,24],[25,24]]},
  {"id":"a32","pts":[[14,26],[14,25],[14,24]]},
  {"id":"a33","pts":[[11,26],[12,26],[12,27],[12,28],[13,28],[14,28],[15,28],[15,27],[15,26]]},
  {"id":"a34","pts":[[25,27],[25,26],[25,25],[26,25],[27,25],[27,26],[27,27]]},
  {"id":"a35","pts":[[20,25],[19,25],[19,26],[19,27],[19,28]]},
  {"id":"a36","pts":[[20,27],[20,28],[20,29],[20,30],[21,30],[22,30],[23,30],[23,31],[23,32],[23,33],[23,34],[23,35],[23,36],[23,37],[22,37],[21,37]]},
  {"id":"a37","pts":[[34,27],[35,27],[36,27],[37,27]]},
  {"id":"a38","pts":[[29,28],[29,29],[30,29],[31,29],[32,29]]},
  {"id":"a39","pts":[[21,29],[22,29],[23,29],[24,29]]},
  {"id":"a40","pts":[[30,30],[29,30],[28,30],[27,30],[27,29],[26,29],[25,29],[25,30],[25,31],[26,31],[27,31]]},
  {"id":"a41","pts":[[17,32],[17,31],[16,31],[15,31],[15,32],[14,32],[13,32],[13,31],[13,30],[13,29],[14,29],[15,29],[16,29],[17,29],[18,29]]},
  {"id":"a42","pts":[[12,33],[12,32],[12,31],[12,30]]},
  {"id":"a43","pts":[[36,36],[36,35],[36,34],[36,33],[36,32],[36,31],[36,30]]},
  {"id":"a44","pts":[[31,31],[32,31],[33,31],[34,31]]},
  {"id":"a45","pts":[[24,30],[24,31],[24,32],[24,33],[25,33],[26,33],[26,34],[25,34],[24,34],[24,35],[24,36],[24,37],[25,37],[26,37]]},
  {"id":"a46","pts":[[20,32],[20,33],[20,34],[19,34],[18,34],[18,33],[18,32],[18,31],[19,31],[20,31],[21,31],[22,31],[22,32],[22,33],[22,34],[22,35],[21,35],[20,35],[19,35],[18,35],[17,35],[16,35]]},
  {"id":"a47","pts":[[33,32],[34,32],[35,32],[35,33],[35,34],[35,35],[35,36],[35,37],[35,38],[36,38]]},
  {"id":"a48","pts":[[31,32],[30,32],[30,33],[30,34],[30,35],[29,35],[28,35],[28,34],[28,33]]},
  {"id":"a49","pts":[[16,33],[15,33],[14,33],[14,34],[14,35],[13,35],[12,35],[12,36]]},
  {"id":"a50","pts":[[34,33],[33,33],[32,33],[31,33],[31,34],[31,35],[32,35],[33,35],[34,35]]},
  {"id":"a51","pts":[[20,37],[19,37],[18,37],[17,37],[16,37],[15,37],[14,37]]},
  {"id":"a52","pts":[[28,38],[28,37],[29,37],[30,37],[31,37],[32,37]]},
  {"id":"a53","pts":[[34,37],[34,38],[34,39],[35,39],[35,40],[36,40],[37,40],[37,41],[37,42],[37,43],[37,44]]},
  {"id":"a54","pts":[[13,41],[13,40],[13,39],[13,38],[14,38],[15,38],[16,38],[17,38]]},
  {"id":"a55","pts":[[20,38],[19,38],[19,39],[18,39],[17,39],[16,39],[16,40],[16,41]]},
  {"id":"a56","pts":[[12,38],[11,38]]},
  {"id":"a57","pts":[[34,40],[33,40],[33,39],[33,38],[32,38],[31,38],[30,38],[29,38],[29,39]]},
  {"id":"a58","pts":[[15,40],[15,41],[15,42],[14,42],[13,42],[13,43],[12,43],[11,43],[11,44],[11,45]]},
  {"id":"a59","pts":[[32,40],[32,41],[32,42],[33,42],[34,42],[35,42],[35,43]]},
  {"id":"a60","pts":[[12,40],[12,41],[12,42]]}
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

export default function Level54() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 54;

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
        el.className = 'lvl54-confetti';
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
      head.setAttribute('d', 'M7.5 0 L-3.5 -5 L-3.5 5 Z');

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
    dispatch({ type: 'START_LEVEL', levelId: 55 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl54-stage">
      <div className="lvl54-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl54-topbar">
          <div className="lvl54-btns">
            <button className="lvl54-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl54-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl54-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl54-header-center">
            <span className="lvl54-level">Level {currentLevelId}</span>
            <div className="lvl54-hearts">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`lvl54-hslot ${i >= 3 - mistakes ? 'lost' : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div className="lvl54-settings">
            <button className="lvl54-round-btn" onClick={handleLevels} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Board */}
        <div className="lvl54-board-wrap" ref={boardRef} style={boardStyle}>
          <svg ref={svgRef} id="boardSvg" className="lvl54-svg" viewBox="-14 -14 856 874" />
        </div>

        {/* Controls */}
        <div className="lvl54-controls">
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
          <button className="lvl54-round" onClick={handleHint} aria-label="Hint">
            <span className="lvl54-bulb">
              <span className="lvl54-bolt">⚡</span>
              <span className="lvl54-ad">AD</span>
            </span>
          </button>

          <button
            className="lvl54-round"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl54-calc-icon">
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
        <div className={`lvl54-win ${isWon ? 'on' : ''}`}>
          <div className="lvl54-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl54-trophy">🏆</div>
            <div className="lvl54-stars">★ ★ ★</div>
            <button className="lvl54-next" onClick={handleNextLevel}>
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
            <button className="lvl54-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl54-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl54-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
