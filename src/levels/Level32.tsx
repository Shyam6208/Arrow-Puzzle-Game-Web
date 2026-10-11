import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 44, rows: 51 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[4,13],[3,13],[3,14],[4,14],[4,15],[3,15],[2,15],[2,16],[2,17],[1,17]]},
  {"id":"a1","pts":[[5,17],[6,17],[6,18],[6,19],[6,20],[5,20],[4,20],[3,20],[3,19],[3,18],[2,18],[1,18]]},
  {"id":"a2","pts":[[2,20],[2,19],[1,19]]},
  {"id":"a3","pts":[[6,12],[5,12],[4,12]]},
  {"id":"a4","pts":[[6,11],[5,11]]},
  {"id":"a5","pts":[[5,18],[5,19]]},
  {"id":"a6","pts":[[11,46],[12,46],[12,45],[12,44],[11,44],[10,44],[10,43],[9,43],[8,43],[7,43]]},
  {"id":"a7","pts":[[16,36],[16,37],[16,38],[16,39],[17,39],[17,40],[16,40],[15,40],[15,39],[15,38],[14,38],[14,37],[14,36],[15,36],[15,35],[14,35],[14,34],[14,33],[14,32],[14,31],[13,31],[13,32],[12,32],[12,31],[11,31]]},
  {"id":"a8","pts":[[13,45],[14,45],[14,44],[15,44],[15,45],[15,46]]},
  {"id":"a9","pts":[[17,47],[17,46],[17,45],[17,44],[16,44],[16,45],[16,46],[16,47]]},
  {"id":"a10","pts":[[17,48],[18,48],[18,47],[18,46],[19,46],[20,46],[20,45],[21,45],[21,46],[21,47],[21,48],[21,49]]},
  {"id":"a11","pts":[[21,6],[21,5],[21,4],[20,4],[19,4],[18,4]]},
  {"id":"a12","pts":[[19,5],[20,5],[20,6],[19,6],[18,6],[18,5]]},
  {"id":"a13","pts":[[22,6],[22,5],[22,4],[23,4],[24,4],[24,3],[23,3],[22,3],[21,3],[20,3],[19,3]]},
  {"id":"a14","pts":[[10,9],[11,9],[12,9],[12,8],[13,8],[14,8],[15,8],[15,7],[16,7],[16,8],[17,8],[17,7],[18,7],[18,8],[19,8],[19,7]]},
  {"id":"a15","pts":[[20,49],[20,48],[20,47],[19,47],[19,48],[19,49]]},
  {"id":"a16","pts":[[23,1],[23,2],[22,2],[21,2]]},
  {"id":"a17","pts":[[21,26],[22,26],[22,27],[22,28],[22,29],[22,30],[22,31],[22,32],[22,33],[22,34],[22,35],[22,36],[22,37],[22,38],[22,39],[22,40],[22,41],[22,42],[22,43],[22,44],[22,45],[22,46],[22,47],[22,48],[22,49]]},
  {"id":"a18","pts":[[23,47],[24,47],[24,46],[25,46],[25,47],[25,48],[24,48],[23,48]]},
  {"id":"a19","pts":[[29,49],[28,49],[28,48],[27,48],[27,49],[26,49],[25,49],[24,49],[23,49]]},
  {"id":"a20","pts":[[25,44],[24,44],[23,44],[23,45],[24,45],[25,45],[26,45],[27,45],[27,46],[26,46]]},
  {"id":"a21","pts":[[28,47],[27,47],[26,47],[26,48]]},
  {"id":"a22","pts":[[27,3],[28,3],[29,3],[29,2],[28,2],[27,2],[27,1]]},
  {"id":"a23","pts":[[27,14],[27,15],[26,15],[25,15],[24,15],[24,14],[25,14],[26,14],[26,13],[26,12],[27,12],[27,13],[28,13],[28,14],[28,15],[28,16],[28,17],[28,18],[29,18]]},
  {"id":"a24","pts":[[30,27],[29,27],[28,27],[28,26],[28,25],[28,24],[28,23],[28,22],[29,22],[30,22],[31,22],[32,22],[33,22],[34,22],[35,22],[35,23],[36,23],[37,23],[38,23],[39,23],[40,23],[41,23],[42,23]]},
  {"id":"a25","pts":[[30,47],[29,47],[29,48],[30,48],[30,49]]},
  {"id":"a26","pts":[[31,30],[32,30],[33,30],[33,29],[33,28],[33,27],[33,26],[33,25],[34,25],[34,26],[34,27],[35,27]]},
  {"id":"a27","pts":[[31,40],[32,40],[32,41],[31,41],[30,41],[30,42],[31,42],[31,43],[30,43],[30,44],[30,45],[30,46],[31,46],[31,45],[31,44],[32,44],[33,44],[33,45],[32,45],[32,46],[33,46],[33,47],[32,47],[31,47]]},
  {"id":"a28","pts":[[34,44],[34,45],[34,46],[35,46],[35,47],[34,47],[34,48],[34,49],[33,49],[33,48],[32,48],[31,48]]},
  {"id":"a29","pts":[[32,15],[31,15],[31,14],[32,14],[33,14]]},
  {"id":"a30","pts":[[32,43],[33,43],[34,43]]},
  {"id":"a31","pts":[[34,38],[33,38],[33,39],[33,40]]},
  {"id":"a32","pts":[[34,5],[34,6],[35,6]]},
  {"id":"a33","pts":[[31,13],[31,12],[32,12],[32,13],[33,13],[33,12],[33,11],[33,10],[34,10],[34,9],[35,9],[35,8],[35,7]]},
  {"id":"a34","pts":[[32,7],[32,6],[32,5],[33,5],[33,6],[33,7],[34,7]]},
  {"id":"a35","pts":[[33,9],[32,9],[32,10],[32,11],[31,11],[31,10],[31,9],[31,8],[32,8],[33,8],[34,8]]},
  {"id":"a36","pts":[[33,23],[34,23],[34,24],[33,24],[32,24],[32,23]]},
  {"id":"a37","pts":[[34,12],[34,11],[35,11],[35,10]]},
  {"id":"a38","pts":[[33,33],[33,34],[32,34],[31,34],[31,35],[32,35],[32,36],[32,37],[33,37],[34,37],[34,36],[33,36],[33,35],[34,35],[34,34],[34,33],[34,32],[34,31]]},
  {"id":"a39","pts":[[33,32],[32,32],[31,32],[31,33],[32,33]]},
  {"id":"a40","pts":[[36,26],[35,26],[35,25],[35,24]]},
  {"id":"a41","pts":[[35,48],[36,48]]},
  {"id":"a42","pts":[[37,46],[37,45],[36,45],[36,44],[35,44],[35,45]]},
  {"id":"a43","pts":[[39,24],[39,25],[38,25],[37,25],[36,25],[36,24]]},
  {"id":"a44","pts":[[36,46],[36,47]]},
  {"id":"a45","pts":[[30,40],[30,39],[29,39],[29,40],[28,40],[28,41],[29,41],[29,42],[29,43],[28,43],[28,44],[29,44],[29,45],[28,45],[28,46],[29,46]]},
  {"id":"a46","pts":[[21,44],[20,44],[19,44],[18,44],[18,45],[19,45]]},
  {"id":"a47","pts":[[9,44],[8,44],[8,45],[9,45],[10,45],[11,45]]},
  {"id":"a48","pts":[[6,40],[6,41],[7,41],[7,40],[8,40],[9,40],[9,41],[10,41],[10,42]]},
  {"id":"a49","pts":[[6,22],[6,23],[6,24],[6,25]]},
  {"id":"a50","pts":[[7,15],[6,15],[6,16]]},
  {"id":"a51","pts":[[4,18],[4,17],[3,17],[3,16],[4,16],[5,16],[5,15],[5,14],[5,13],[6,13],[6,14]]},
  {"id":"a52","pts":[[8,18],[7,18],[7,17],[8,17],[9,17],[9,16],[9,15],[9,14],[9,13],[9,12],[9,11],[9,10],[8,10],[7,10],[7,11],[8,11],[8,12],[8,13],[7,13],[7,14],[8,14],[8,15],[8,16],[7,16]]},
  {"id":"a53","pts":[[7,21],[7,22],[7,23],[8,23],[8,22],[8,21],[8,20]]},
  {"id":"a54","pts":[[7,24],[8,24],[9,24],[9,23],[9,22],[9,21],[9,20],[9,19]]},
  {"id":"a55","pts":[[12,27],[11,27],[10,27],[9,27],[9,26],[9,25]]},
  {"id":"a56","pts":[[9,39],[8,39],[8,38],[9,38],[10,38],[11,38],[12,38],[12,37],[13,37],[13,36],[12,36],[11,36],[11,37],[10,37],[9,37],[9,36],[9,35],[9,34]]},
  {"id":"a57","pts":[[16,11],[16,10],[16,9],[15,9],[15,10],[14,10],[14,9],[13,9],[13,10],[12,10],[11,10],[10,10]]},
  {"id":"a58","pts":[[11,12],[10,12],[10,13],[11,13],[12,13],[12,12],[12,11],[11,11],[10,11]]},
  {"id":"a59","pts":[[10,22],[10,23],[11,23],[12,23],[12,22],[11,22],[11,21],[10,21]]},
  {"id":"a60","pts":[[11,33],[11,32],[10,32],[10,33],[10,34],[11,34],[11,35],[10,35]]},
  {"id":"a61","pts":[[11,39],[10,39]]},
  {"id":"a62","pts":[[20,37],[20,38],[20,39],[20,40],[20,41],[19,41],[18,41],[17,41],[16,41],[15,41],[14,41],[13,41],[12,41],[11,41],[11,40],[10,40]]},
  {"id":"a63","pts":[[12,24],[11,24],[10,24],[10,25],[10,26]]},
  {"id":"a64","pts":[[11,16],[11,15],[11,14],[10,14],[10,15],[10,16],[10,17],[10,18],[10,19],[10,20]]},
  {"id":"a65","pts":[[13,42],[13,43],[12,43],[12,42],[11,42],[11,43]]},
  {"id":"a66","pts":[[13,24],[13,25],[13,26],[12,26],[12,25],[11,25],[11,26]]},
  {"id":"a67","pts":[[13,17],[13,18],[14,18],[15,18],[15,19],[15,20],[15,21],[14,21],[13,21],[12,21],[12,20],[13,20],[14,20],[14,19],[13,19],[12,19],[12,18],[12,17],[11,17],[11,18],[11,19],[11,20]]},
  {"id":"a68","pts":[[13,22],[14,22],[14,23],[13,23]]},
  {"id":"a69","pts":[[14,13],[14,12],[15,12],[15,13],[15,14],[16,14],[17,14],[17,13],[16,13],[16,12]]},
  {"id":"a70","pts":[[17,11],[17,10],[18,10],[19,10],[19,11],[18,11],[18,12],[19,12],[20,12],[20,11],[20,10],[20,9],[19,9],[18,9],[17,9]]},
  {"id":"a71","pts":[[15,11],[14,11],[13,11],[13,12],[13,13],[13,14],[12,14],[12,15],[12,16],[13,16],[14,16],[14,17],[15,17],[16,17],[16,16],[17,16],[17,15]]},
  {"id":"a72","pts":[[17,23],[18,23],[19,23],[19,24],[18,24],[17,24]]},
  {"id":"a73","pts":[[24,42],[25,42],[25,43],[26,43],[26,42],[27,42],[27,43],[27,44],[26,44]]},
  {"id":"a74","pts":[[21,43],[20,43],[19,43],[18,43],[17,43],[16,43],[15,43],[14,43],[14,42],[15,42],[16,42],[17,42],[18,42],[19,42],[20,42],[21,42]]},
  {"id":"a75","pts":[[7,42],[8,42],[9,42]]},
  {"id":"a76","pts":[[7,26],[7,25],[8,25],[8,26],[8,27]]},
  {"id":"a77","pts":[[12,39],[12,40],[13,40],[13,39],[14,39],[14,40]]},
  {"id":"a78","pts":[[12,33],[12,34],[12,35]]},
  {"id":"a79","pts":[[13,33],[13,34],[13,35]]},
  {"id":"a80","pts":[[15,27],[15,28],[15,29],[16,29],[16,28],[16,27],[17,27],[17,26],[16,26],[15,26]]},
  {"id":"a81","pts":[[20,33],[19,33],[19,32],[18,32],[18,31],[19,31],[19,30],[19,29],[20,29],[20,28],[19,28],[19,27],[18,27],[18,26],[19,26],[19,25],[18,25],[17,25],[16,25]]},
  {"id":"a82","pts":[[17,36],[17,37],[17,38],[18,38],[18,39],[19,39],[19,40],[18,40]]},
  {"id":"a83","pts":[[24,43],[23,43]]},
  {"id":"a84","pts":[[26,40],[25,40],[24,40],[23,40],[23,41]]},
  {"id":"a85","pts":[[25,33],[24,33],[24,34],[25,34],[25,35],[24,35],[24,36],[25,36],[26,36],[26,35],[27,35],[27,36],[27,37],[27,38],[27,39],[27,40],[27,41],[26,41],[25,41],[24,41]]},
  {"id":"a86","pts":[[32,39],[31,39],[31,38],[31,37],[31,36],[30,36],[30,37],[30,38],[29,38],[29,37],[28,37],[28,38],[28,39]]},
  {"id":"a87","pts":[[23,34],[23,35],[23,36],[23,37],[24,37],[25,37],[26,37]]},
  {"id":"a88","pts":[[23,38],[23,39],[24,39],[24,38],[25,38],[26,38]]},
  {"id":"a89","pts":[[27,30],[27,31],[28,31],[28,30],[28,29],[28,28],[29,28],[29,29],[29,30],[30,30],[30,31],[30,32],[30,33],[30,34],[30,35],[29,35],[28,35],[28,36],[29,36]]},
  {"id":"a90","pts":[[23,33],[23,32],[24,32],[25,32],[26,32],[26,33],[26,34],[27,34],[28,34],[29,34]]},
  {"id":"a91","pts":[[24,27],[25,27],[25,28],[24,28],[23,28],[23,29],[23,30],[23,31]]},
  {"id":"a92","pts":[[24,25],[25,25],[26,25],[27,25],[27,26],[27,27],[26,27],[26,26],[25,26],[24,26],[23,26],[23,27]]},
  {"id":"a93","pts":[[25,29],[24,29],[24,30],[24,31],[25,31],[25,30],[26,30]]},
  {"id":"a94","pts":[[29,31],[29,32],[29,33],[28,33],[28,32],[27,32],[27,33]]},
  {"id":"a95","pts":[[19,37],[18,37],[18,36],[18,35],[18,34],[17,34],[17,35],[16,35],[16,34],[15,34],[15,33],[16,33],[17,33],[18,33]]},
  {"id":"a96","pts":[[17,30],[17,29],[17,28],[18,28],[18,29],[18,30]]},
  {"id":"a97","pts":[[15,32],[15,31],[15,30],[16,30],[16,31],[16,32],[17,32],[17,31]]},
  {"id":"a98","pts":[[15,22],[15,23]]},
  {"id":"a99","pts":[[13,15],[14,15],[15,15],[15,16]]},
  {"id":"a100","pts":[[13,29],[13,30],[14,30],[14,29],[14,28]]},
  {"id":"a101","pts":[[20,15],[19,15],[18,15]]},
  {"id":"a102","pts":[[20,36],[20,35],[20,34],[19,34],[19,35],[19,36]]},
  {"id":"a103","pts":[[19,21],[19,22]]},
  {"id":"a104","pts":[[21,27],[21,28],[21,29],[21,30],[20,30],[20,31],[20,32],[21,32]]},
  {"id":"a105","pts":[[23,20],[23,21],[23,22],[23,23],[23,24],[22,24],[22,25],[21,25],[21,24],[20,24],[20,25],[20,26],[20,27]]},
  {"id":"a106","pts":[[20,19],[19,19],[19,20],[20,20],[20,21],[20,22],[20,23]]},
  {"id":"a107","pts":[[22,23],[21,23],[21,22],[22,22],[22,21],[21,21],[21,20],[22,20],[22,19],[21,19],[21,18],[22,18],[22,17],[21,17],[21,16],[20,16],[19,16],[19,17],[20,17],[20,18]]},
  {"id":"a108","pts":[[23,14],[23,15],[23,16],[23,17],[23,18],[23,19]]},
  {"id":"a109","pts":[[25,23],[24,23]]},
  {"id":"a110","pts":[[27,24],[26,24],[25,24],[24,24]]},
  {"id":"a111","pts":[[27,16],[26,16],[26,17],[27,17],[27,18],[26,18],[26,19],[25,19],[24,19],[24,20],[24,21],[24,22]]},
  {"id":"a112","pts":[[27,28],[27,29],[26,29]]},
  {"id":"a113","pts":[[31,23],[31,24],[30,24],[29,24]]},
  {"id":"a114","pts":[[29,23],[30,23]]},
  {"id":"a115","pts":[[33,31],[32,31]]},
  {"id":"a116","pts":[[37,22],[38,22],[39,22],[40,22],[41,22],[42,22]]},
  {"id":"a117","pts":[[41,24],[41,25],[40,25],[40,24]]},
  {"id":"a118","pts":[[30,28],[31,28],[31,27],[31,26],[30,26],[29,26],[29,25],[30,25],[31,25],[32,25]]},
  {"id":"a119","pts":[[30,29],[31,29],[32,29],[32,28],[32,27],[32,26]]},
  {"id":"a120","pts":[[27,19],[27,20],[27,21],[28,21],[29,21],[29,20],[29,19],[30,19],[30,20],[31,20],[31,21]]},
  {"id":"a121","pts":[[28,19],[28,20]]},
  {"id":"a122","pts":[[29,6],[29,7],[29,8],[30,8],[30,7],[30,6],[30,5],[31,5],[31,6],[31,7]]},
  {"id":"a123","pts":[[30,3],[30,4],[29,4],[28,4],[28,5],[29,5]]},
  {"id":"a124","pts":[[22,8],[23,8],[23,7],[24,7],[25,7],[26,7],[26,6],[25,6],[24,6],[23,6],[23,5],[24,5],[25,5],[26,5],[27,5]]},
  {"id":"a125","pts":[[24,2],[24,1],[25,1],[26,1],[26,2],[25,2],[25,3],[26,3],[26,4],[27,4]]},
  {"id":"a126","pts":[[28,6],[27,6],[27,7],[28,7],[28,8],[27,8],[27,9],[28,9],[28,10],[29,10],[29,11],[28,11],[27,11],[27,10],[26,10],[26,9],[26,8]]},
  {"id":"a127","pts":[[22,13],[23,13],[23,12],[23,11],[22,11],[22,10],[22,9],[21,9],[21,8],[20,8],[20,7],[21,7],[22,7]]},
  {"id":"a128","pts":[[26,11],[25,11],[25,10],[25,9],[25,8],[24,8],[24,9],[23,9],[23,10]]},
  {"id":"a129","pts":[[24,13],[25,13],[25,12],[24,12],[24,11],[24,10]]},
  {"id":"a130","pts":[[24,16],[24,17],[24,18],[25,18],[25,17],[25,16]]},
  {"id":"a131","pts":[[25,20],[26,20],[26,21],[25,21],[25,22],[26,22],[26,23],[27,23],[27,22]]},
  {"id":"a132","pts":[[28,12],[29,12],[30,12],[30,11],[30,10],[30,9],[29,9]]},
  {"id":"a133","pts":[[21,10],[21,11],[21,12],[22,12]]},
  {"id":"a134","pts":[[29,14],[29,13]]},
  {"id":"a135","pts":[[30,17],[30,16],[30,15],[29,15],[29,16],[29,17]]},
  {"id":"a136","pts":[[30,14],[30,13]]},
  {"id":"a137","pts":[[22,16],[22,15],[22,14],[21,14],[20,14],[19,14],[19,13],[20,13],[21,13]]},
  {"id":"a138","pts":[[21,40],[21,39],[21,38],[21,37],[21,36],[21,35],[21,34]]},
  {"id":"a139","pts":[[26,39],[25,39]]},
  {"id":"a140","pts":[[37,24],[38,24]]}
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

export default function Level32() {
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

  const currentLevelId = state.game?.levelId || 32;

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
        el.className = 'lvl32-confetti';
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
      dots.setAttribute('class', 'lvl32-dots');
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
      g.setAttribute('class', 'lvl32-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl32-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl32-head');
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

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  return (
    <div className="lvl32-stage">
      <div className="lvl32-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl32-topbar">
          <div className="lvl32-btns">
            <button className="lvl32-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl32-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl32-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl32-header-center">
            <div className="lvl32-level">Level {currentLevelId}</div>
            <div className="lvl32-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl32-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl32-round-btn lvl32-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl32-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl32-boardSvg" viewBox="-14 -14 802 928" />
        </div>

        {/* Controls */}
        <div className="lvl32-controls">
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
          <button className="lvl32-round lvl32-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl32-bulb">
              <span className="lvl32-bolt">ϟ</span>
            </span>
            <span className="lvl32-ad">AD</span>
          </button>
          <button
            className="lvl32-round lvl32-calculator"
            onClick={() => showToast('Level 32: 141 Arrows')}
            aria-label="Info"
          >
            <span className="lvl32-calc-icon">
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
        <div className={`lvl32-win ${isWon ? 'on' : ''}`}>
          <div className="lvl32-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl32-trophy">🏆</div>
            <div className="lvl32-stars">★ ★ ★</div>
            <button className="lvl32-next" onClick={handleLevelSelect}>
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
            <button className="lvl32-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl32-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl32-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
