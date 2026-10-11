import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 47, rows: 47 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[5,2],[6,2],[7,2]]},
  {"id":"a1","pts":[[7,29],[7,28],[7,27],[6,27],[6,26],[6,25],[7,25],[8,25],[8,26],[8,27],[8,28],[8,29],[8,30],[7,30]]},
  {"id":"a2","pts":[[6,22],[6,23]]},
  {"id":"a3","pts":[[7,23],[7,24]]},
  {"id":"a4","pts":[[8,31],[8,32]]},
  {"id":"a5","pts":[[8,15],[8,16],[8,17],[8,18]]},
  {"id":"a6","pts":[[12,4],[11,4],[10,4],[9,4],[8,4],[7,4],[6,4],[5,4],[4,4],[3,4],[3,3],[4,3],[5,3],[6,3],[7,3],[8,3],[9,3],[10,3]]},
  {"id":"a7","pts":[[10,34],[10,35]]},
  {"id":"a8","pts":[[11,17],[12,17],[13,17],[13,18],[13,19],[13,20],[13,21],[12,21],[11,21],[11,22],[12,22],[13,22],[14,22],[15,22],[16,22],[16,23],[17,23],[18,23],[18,22],[18,21],[19,21],[20,21],[21,21],[22,21],[23,21],[24,21],[25,21],[26,21],[27,21],[28,21],[29,21],[30,21],[31,21],[31,20],[31,19],[32,19],[33,19],[33,20],[34,20],[35,20],[36,20],[37,20],[38,20],[39,20],[40,20],[40,19],[39,19],[38,19],[37,19],[37,18],[37,17],[37,16],[37,15],[37,14],[37,13]]},
  {"id":"a9","pts":[[12,32],[12,33],[12,34],[13,34],[13,33],[13,32],[13,31],[12,31],[11,31],[11,30],[11,29],[10,29],[10,30],[10,31],[9,31],[9,32],[9,33],[10,33],[10,32],[11,32],[11,33],[11,34],[11,35],[11,36]]},
  {"id":"a10","pts":[[13,24],[13,23],[12,23]]},
  {"id":"a11","pts":[[13,30],[12,30]]},
  {"id":"a12","pts":[[12,36],[12,35],[13,35],[13,36],[13,37]]},
  {"id":"a13","pts":[[14,5],[14,6],[14,7],[14,8],[15,8],[16,8],[17,8],[17,7],[18,7],[18,8],[18,9],[19,9],[20,9],[21,9],[21,10],[22,10],[22,9],[22,8],[21,8],[20,8],[19,8],[19,7],[19,6],[20,6],[21,6],[22,6],[22,7],[23,7],[24,7],[24,8],[23,8],[23,9],[23,10],[24,10],[24,9],[25,9],[25,8],[25,7],[25,6]]},
  {"id":"a14","pts":[[15,32],[14,32]]},
  {"id":"a15","pts":[[17,34],[16,34],[15,34],[15,33],[14,33]]},
  {"id":"a16","pts":[[16,37],[16,38],[16,39],[17,39],[17,38],[17,37],[17,36],[16,36],[15,36],[15,37],[15,38],[14,38],[14,37],[14,36],[14,35],[15,35],[16,35],[17,35],[18,35],[18,36],[18,37],[18,38],[19,38],[20,38],[20,39],[20,40]]},
  {"id":"a17","pts":[[15,23],[14,23],[14,24],[14,25],[14,26]]},
  {"id":"a18","pts":[[15,25],[16,25],[17,25],[17,26],[17,27],[17,28]]},
  {"id":"a19","pts":[[29,23],[28,23],[28,24],[27,24],[26,24],[26,25],[26,26],[26,27],[26,28],[25,28],[24,28],[24,27],[24,26],[24,25],[23,25],[22,25],[21,25],[20,25],[19,25],[18,25]]},
  {"id":"a20","pts":[[19,40],[19,39],[18,39]]},
  {"id":"a21","pts":[[20,37],[19,37]]},
  {"id":"a22","pts":[[24,40],[23,40],[22,40],[22,39],[21,39],[21,40]]},
  {"id":"a23","pts":[[19,31],[20,31],[21,31],[21,32]]},
  {"id":"a24","pts":[[21,29],[20,29],[20,28],[19,28],[19,27],[18,27],[18,28],[18,29],[19,29],[19,30]]},
  {"id":"a25","pts":[[23,34],[24,34],[25,34],[26,34],[26,35],[26,36],[26,37],[27,37],[28,37],[28,36],[28,35],[28,34],[28,33],[28,32],[28,31],[27,31],[26,31],[25,31],[25,32],[25,33],[24,33],[23,33],[22,33],[22,32],[22,31],[23,31],[23,30],[22,30],[21,30],[20,30]]},
  {"id":"a26","pts":[[21,27],[22,27],[23,27],[23,28],[23,29]]},
  {"id":"a27","pts":[[24,35],[25,35],[25,36]]},
  {"id":"a28","pts":[[24,30],[24,31],[24,32]]},
  {"id":"a29","pts":[[24,29],[25,29],[26,29],[27,29],[27,30],[26,30],[25,30]]},
  {"id":"a30","pts":[[21,23],[20,23],[19,23],[19,22],[20,22],[21,22],[22,22],[23,22],[24,22],[25,22],[25,23],[25,24],[25,25],[25,26],[25,27]]},
  {"id":"a31","pts":[[15,24],[16,24],[17,24],[18,24],[19,24],[20,24],[21,24],[22,24],[23,24],[24,24],[24,23],[23,23],[22,23]]},
  {"id":"a32","pts":[[34,19],[35,19],[36,19],[36,18],[35,18],[34,18],[33,18],[32,18],[31,18],[30,18],[29,18],[28,18],[27,18],[26,18],[25,18],[25,19],[24,19],[23,19],[23,18],[23,17],[23,16],[22,16],[22,17],[22,18],[21,18],[20,18],[20,19],[20,20],[19,20],[19,19],[19,18],[18,18],[17,18],[17,19],[17,20],[17,21],[17,22]]},
  {"id":"a33","pts":[[26,32],[27,32],[27,33],[26,33]]},
  {"id":"a34","pts":[[32,24],[32,25],[32,26],[32,27],[32,28],[32,29],[33,29],[34,29],[34,28],[34,27],[34,26],[34,25],[35,25],[36,25],[37,25],[38,25],[38,26],[38,27],[38,28],[38,29],[38,30],[37,30],[36,30],[35,30],[34,30],[33,30],[32,30],[31,30],[31,29],[31,28],[31,27],[31,26],[31,25],[31,24],[31,23],[31,22],[30,22],[29,22],[28,22],[27,22],[26,22],[26,23]]},
  {"id":"a35","pts":[[27,34],[27,35],[27,36]]},
  {"id":"a36","pts":[[27,27],[27,28]]},
  {"id":"a37","pts":[[29,39],[30,39],[30,38],[30,37],[30,36],[29,36],[29,37],[29,38],[28,38]]},
  {"id":"a38","pts":[[27,26],[28,26],[28,27],[28,28],[28,29],[28,30]]},
  {"id":"a39","pts":[[40,27],[40,26],[40,25],[39,25],[39,26],[39,27],[39,28],[39,29],[39,30],[39,31],[38,31],[37,31],[36,31],[36,32],[35,32],[35,33],[35,34],[36,34],[36,35],[35,35],[34,35],[34,34],[34,33],[34,32],[34,31],[33,31],[32,31],[31,31],[30,31],[29,31]]},
  {"id":"a40","pts":[[29,34],[30,34],[30,33],[29,33],[29,32],[30,32],[31,32],[31,33],[31,34],[31,35],[30,35]]},
  {"id":"a41","pts":[[29,26],[29,27],[29,28],[29,29],[29,30]]},
  {"id":"a42","pts":[[30,20],[29,20],[28,20],[28,19],[29,19],[30,19]]},
  {"id":"a43","pts":[[30,23],[30,24],[30,25],[30,26],[30,27],[30,28],[30,29]]},
  {"id":"a44","pts":[[32,15],[32,14],[32,13],[31,13],[31,12],[32,12],[33,12],[33,11],[33,10],[33,9],[32,9],[31,9],[30,9],[30,8],[29,8],[28,8],[27,8],[27,9],[28,9],[28,10],[28,11],[28,12],[28,13],[27,13],[27,12],[26,12],[26,13],[26,14],[27,14],[28,14],[29,14],[29,13],[29,12],[29,11],[30,11],[30,12],[30,13],[30,14],[30,15],[30,16],[30,17]]},
  {"id":"a45","pts":[[31,8],[32,8]]},
  {"id":"a46","pts":[[31,10],[31,11],[32,11],[32,10]]},
  {"id":"a47","pts":[[31,17],[31,16],[31,15]]},
  {"id":"a48","pts":[[32,35],[32,34],[32,33],[32,32],[33,32],[33,33],[33,34],[33,35],[33,36],[32,36],[32,37],[31,37],[31,36]]},
  {"id":"a49","pts":[[34,10],[35,10]]},
  {"id":"a50","pts":[[29,9],[29,10],[30,10]]},
  {"id":"a51","pts":[[35,36],[34,36]]},
  {"id":"a52","pts":[[38,15],[38,14]]},
  {"id":"a53","pts":[[38,33],[39,33],[40,33],[41,33],[41,32],[40,32],[39,32],[38,32]]},
  {"id":"a54","pts":[[36,33],[37,33]]},
  {"id":"a55","pts":[[40,44],[39,44]]},
  {"id":"a56","pts":[[42,43],[43,43],[43,42],[42,42],[42,41],[43,41],[44,41],[44,40],[44,39],[43,39],[42,39],[41,39],[41,40],[41,41],[40,41],[39,41],[38,41],[38,42],[39,42],[40,42],[41,42],[41,43],[41,44]]},
  {"id":"a57","pts":[[32,39],[33,39],[34,39],[35,39]]},
  {"id":"a58","pts":[[32,41],[33,41],[34,41],[34,42],[35,42],[35,41],[36,41],[36,42],[36,43],[37,43],[38,43],[39,43],[40,43]]},
  {"id":"a59","pts":[[33,37],[33,38],[32,38],[31,38],[31,39],[31,40],[32,40],[33,40],[34,40],[35,40],[36,40],[37,40],[37,41],[37,42]]},
  {"id":"a60","pts":[[32,20],[32,21],[33,21],[34,21],[35,21],[36,21],[37,21],[38,21],[39,21],[40,21],[40,22],[39,22],[38,22],[38,23],[39,23],[40,23],[40,24],[39,24],[38,24],[37,24],[36,24],[35,24],[34,24],[33,24],[33,25],[33,26],[33,27],[33,28]]},
  {"id":"a61","pts":[[27,25],[28,25],[29,25]]},
  {"id":"a62","pts":[[22,19],[21,19],[21,20],[22,20],[23,20],[24,20],[25,20],[26,20],[26,19],[27,19],[27,20]]},
  {"id":"a63","pts":[[27,16],[26,16],[25,16],[24,16],[24,17]]},
  {"id":"a64","pts":[[32,22],[32,23],[33,23],[33,22],[34,22],[35,22],[36,22],[36,23],[37,23],[37,22]]},
  {"id":"a65","pts":[[34,23],[35,23]]},
  {"id":"a66","pts":[[41,35],[42,35],[42,34],[41,34],[40,34],[39,34],[39,35],[40,35],[40,36],[41,36],[42,36],[43,36],[43,37],[43,38],[42,38]]},
  {"id":"a67","pts":[[39,16],[38,16],[38,17],[39,17],[39,18]]},
  {"id":"a68","pts":[[36,17],[35,17],[34,17],[33,17],[32,17],[32,16],[33,16],[34,16],[34,15],[34,14],[35,14],[35,15],[35,16],[36,16]]},
  {"id":"a69","pts":[[25,17],[26,17],[27,17],[28,17],[28,16],[29,16]]},
  {"id":"a70","pts":[[35,12],[34,12],[34,11],[35,11],[36,11],[36,12],[36,13],[35,13],[34,13],[33,13],[33,14],[33,15]]},
  {"id":"a71","pts":[[36,15],[36,14]]},
  {"id":"a72","pts":[[19,15],[19,16],[19,17],[20,17],[20,16],[20,15],[21,15],[22,15],[23,15],[24,15],[25,15],[26,15],[27,15],[28,15]]},
  {"id":"a73","pts":[[27,10],[27,11]]},
  {"id":"a74","pts":[[15,20],[15,19],[15,18],[15,17],[15,16],[16,16],[16,17],[16,18],[16,19],[16,20],[16,21],[15,21],[14,21],[14,20],[14,19],[14,18],[14,17],[14,16],[13,16],[12,16],[12,15],[13,15],[14,15],[15,15],[16,15],[17,15],[18,15],[18,14],[19,14],[20,14],[21,14],[22,14],[23,14],[24,14],[25,14],[25,13],[25,12],[24,12],[24,13],[23,13],[23,12],[22,12],[21,12],[20,12],[20,11],[21,11],[22,11],[23,11],[24,11],[25,11],[26,11],[26,10],[26,9],[26,8],[26,7],[26,6],[27,6],[27,7]]},
  {"id":"a75","pts":[[5,11],[5,10],[5,9],[5,8],[5,7],[4,7],[3,7],[2,7],[2,6],[2,5],[3,5],[4,5],[5,5],[6,5],[7,5],[8,5],[9,5],[10,5],[11,5],[12,5],[13,5],[13,6],[13,7],[13,8],[13,9],[13,10],[13,11],[12,11],[11,11],[10,11],[10,12],[10,13],[10,14],[11,14],[12,14],[13,14],[13,13],[13,12],[14,12],[14,11],[14,10],[14,9],[15,9],[16,9],[16,10],[17,10],[18,10],[18,11],[18,12],[19,12],[19,13],[20,13],[21,13],[22,13]]},
  {"id":"a76","pts":[[5,6],[4,6]]},
  {"id":"a77","pts":[[12,18],[12,19],[12,20],[11,20],[10,20],[9,20],[9,19],[9,18],[9,17],[9,16],[9,15],[9,14],[8,14],[7,14],[6,14],[5,14],[5,13],[5,12],[4,12],[4,11],[4,10],[4,9],[3,9],[3,8],[4,8]]},
  {"id":"a78","pts":[[6,12],[7,12],[7,11],[6,11]]},
  {"id":"a79","pts":[[9,13],[8,13],[7,13],[6,13]]},
  {"id":"a80","pts":[[9,6],[10,6],[11,6],[11,7],[12,7],[12,6]]},
  {"id":"a81","pts":[[9,27],[9,26]]},
  {"id":"a82","pts":[[11,13],[11,12],[12,12],[12,13]]},
  {"id":"a83","pts":[[11,16],[11,15],[10,15],[10,16],[10,17],[10,18],[11,18]]},
  {"id":"a84","pts":[[6,15],[7,15]]},
  {"id":"a85","pts":[[6,9],[6,10]]},
  {"id":"a86","pts":[[7,17],[7,16]]},
  {"id":"a87","pts":[[17,11],[17,12],[17,13],[17,14],[16,14],[15,14],[14,14],[14,13],[15,13],[16,13],[16,12],[16,11]]},
  {"id":"a88","pts":[[17,16],[17,17],[18,17],[18,16]]},
  {"id":"a89","pts":[[18,20],[18,19]]},
  {"id":"a90","pts":[[10,19],[11,19]]},
  {"id":"a91","pts":[[9,29],[9,28],[10,28],[10,27]]},
  {"id":"a92","pts":[[22,29],[22,28],[21,28]]},
  {"id":"a93","pts":[[37,26],[36,26],[35,26],[35,27],[36,27],[37,27],[37,28],[37,29],[36,29]]},
  {"id":"a94","pts":[[16,26],[15,26],[15,27],[16,27]]},
  {"id":"a95","pts":[[15,10],[15,11],[15,12]]},
  {"id":"a96","pts":[[15,6],[15,7]]},
  {"id":"a97","pts":[[18,26],[19,26],[20,26],[21,26],[22,26],[23,26]]},
  {"id":"a98","pts":[[20,10],[19,10],[19,11]]},
  {"id":"a99","pts":[[11,10],[12,10]]},
  {"id":"a100","pts":[[21,7],[20,7]]},
  {"id":"a101","pts":[[21,17],[21,16]]},
  {"id":"a102","pts":[[24,6],[23,6]]},
  {"id":"a103","pts":[[30,7],[29,7],[28,7]]},
  {"id":"a104","pts":[[35,28],[36,28]]},
  {"id":"a105","pts":[[42,37],[41,37]]},
  {"id":"a106","pts":[[43,40],[42,40]]}
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

export default function Level53() {
  const { state, dispatch, showRewardedAd } = useStore();
  const currentLevelId = state.game?.levelId || 53;

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
        el.className = 'lvl53-confetti';
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
    dispatch({ type: 'START_LEVEL', levelId: 54 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl53-stage">
      <div className="lvl53-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl53-topbar">
          <div className="lvl53-btns">
            <button className="lvl53-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl53-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl53-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl53-header-center">
            <span className="lvl53-level">Level {currentLevelId}</span>
            <div className="lvl53-hearts">
              {[0, 1, 2].map((i) => (
                <span key={i} className={`lvl53-hslot ${i >= 3 - mistakes ? 'lost' : ''}`}>
                  <svg viewBox="0 0 24 24">
                    <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
                  </svg>
                </span>
              ))}
            </div>
          </div>

          <div className="lvl53-settings">
            <button className="lvl53-round-btn" onClick={handleLevels} aria-label="Settings">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
              </svg>
            </button>
          </div>
        </header>

        {/* Board */}
        <div className="lvl53-board-wrap" ref={boardRef} style={boardStyle}>
          <svg ref={svgRef} id="boardSvg" className="lvl53-svg" viewBox="-14 -14 856 856" />
        </div>

        {/* Controls */}
        <div className="lvl53-controls">
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
          <button className="lvl53-round" onClick={handleHint} aria-label="Hint">
            <span className="lvl53-bulb">
              <span className="lvl53-bolt">⚡</span>
              <span className="lvl53-ad">AD</span>
            </span>
          </button>

          <button
            className="lvl53-round"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl53-calc-icon">
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
        <div className={`lvl53-win ${isWon ? 'on' : ''}`}>
          <div className="lvl53-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl53-trophy">🏆</div>
            <div className="lvl53-stars">★ ★ ★</div>
            <button className="lvl53-next" onClick={handleNextLevel}>
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
            <button className="lvl53-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl53-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl53-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
