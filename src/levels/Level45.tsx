import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 18;
const GRID = { cols: 50, rows: 53 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  {"id":"a0","pts":[[8,26],[8,27],[7,27],[6,27],[5,27],[4,27],[3,27],[2,27],[2,26],[3,26],[3,25],[3,24]]},
  {"id":"a1","pts":[[4,28],[5,28],[5,29],[5,30],[4,30],[4,29],[3,29],[3,28]]},
  {"id":"a2","pts":[[5,26],[5,25],[4,25],[4,26]]},
  {"id":"a3","pts":[[4,23],[4,24]]},
  {"id":"a4","pts":[[7,26],[6,26],[6,25],[7,25],[7,24],[6,24],[6,23],[6,22],[5,22],[5,23],[5,24]]},
  {"id":"a5","pts":[[6,28],[7,28],[7,29],[6,29]]},
  {"id":"a6","pts":[[10,28],[10,29],[9,29],[9,28],[8,28],[8,29],[8,30],[9,30],[9,31],[8,31],[8,32],[7,32],[7,31],[6,31],[6,30]]},
  {"id":"a7","pts":[[7,23],[7,22],[8,22],[8,23],[8,24],[8,25]]},
  {"id":"a8","pts":[[7,19],[7,20],[7,21],[8,21],[8,20],[8,19],[9,19],[9,20],[9,21],[10,21],[10,22],[9,22]]},
  {"id":"a9","pts":[[9,18],[8,18],[7,18],[7,17],[8,17],[8,16],[8,15],[8,14]]},
  {"id":"a10","pts":[[10,14],[9,14],[9,13],[9,12]]},
  {"id":"a11","pts":[[10,15],[9,15]]},
  {"id":"a12","pts":[[10,16],[10,17],[9,17],[9,16]]},
  {"id":"a13","pts":[[12,20],[11,20],[11,21],[11,22],[12,22],[12,21],[13,21],[13,22],[13,23],[12,23],[11,23],[10,23],[9,23]]},
  {"id":"a14","pts":[[18,32],[17,32],[16,32],[16,31],[15,31],[15,32],[15,33],[14,33],[13,33],[13,32],[14,32],[14,31],[13,31],[13,30],[12,30],[12,31],[11,31],[11,32],[10,32],[9,32]]},
  {"id":"a15","pts":[[12,32],[12,33],[11,33],[10,33]]},
  {"id":"a16","pts":[[11,29],[11,30],[10,30],[10,31]]},
  {"id":"a17","pts":[[15,18],[15,19],[15,20],[16,20],[16,21],[15,21],[15,22],[14,22]]},
  {"id":"a18","pts":[[15,38],[15,39],[16,39],[17,39],[17,40],[16,40],[15,40],[14,40]]},
  {"id":"a19","pts":[[17,6],[16,6],[15,6],[15,5],[15,4]]},
  {"id":"a20","pts":[[15,37],[16,37],[17,37],[17,38],[16,38]]},
  {"id":"a21","pts":[[17,49],[18,49],[19,49],[19,48],[18,48],[17,48],[16,48],[16,47],[17,47],[18,47],[18,46],[17,46],[16,46],[15,46],[15,47]]},
  {"id":"a22","pts":[[18,6],[18,5],[17,5],[16,5]]},
  {"id":"a23","pts":[[19,34],[18,34],[17,34],[17,33],[16,33]]},
  {"id":"a24","pts":[[16,43],[16,42],[16,41],[17,41],[17,42],[18,42],[19,42],[19,41],[18,41],[18,40],[18,39],[19,39],[19,38],[18,38],[18,37],[18,36],[17,36],[16,36]]},
  {"id":"a25","pts":[[18,33],[19,33],[19,32],[19,31],[18,31],[17,31]]},
  {"id":"a26","pts":[[25,2],[24,2],[23,2],[22,2],[21,2],[20,2],[19,2]]},
  {"id":"a27","pts":[[24,39],[23,39],[22,39],[22,40],[22,41],[22,42],[23,42],[24,42],[25,42],[26,42],[27,42],[28,42],[29,42],[30,42],[30,43],[30,44],[30,45],[30,46],[30,47],[30,48],[30,49],[30,50],[31,50],[32,50],[33,50]]},
  {"id":"a28","pts":[[31,7],[31,6],[31,5],[31,4],[30,4],[29,4],[28,4],[27,4],[26,4],[26,3],[26,2]]},
  {"id":"a29","pts":[[27,3],[28,3],[28,2],[27,2]]},
  {"id":"a30","pts":[[27,47],[27,48],[27,49],[27,50],[28,50],[29,50]]},
  {"id":"a31","pts":[[25,49],[24,49],[24,50],[25,50],[26,50]]},
  {"id":"a32","pts":[[20,50],[21,50],[21,49],[21,48],[22,48],[22,49],[22,50],[23,50],[23,49],[23,48],[24,48],[25,48],[26,48],[26,49]]},
  {"id":"a33","pts":[[18,50],[19,50]]},
  {"id":"a34","pts":[[22,47],[21,47],[20,47],[20,48],[20,49]]},
  {"id":"a35","pts":[[14,45],[14,44],[14,43],[15,43],[15,44],[16,44],[17,44],[17,43],[18,43],[18,44],[19,44],[20,44],[20,43],[21,43],[21,44],[21,45],[21,46]]},
  {"id":"a36","pts":[[15,42],[15,41],[14,41],[14,42]]},
  {"id":"a37","pts":[[12,25],[12,26],[12,27],[12,28],[12,29],[13,29],[13,28],[14,28],[15,28],[15,29],[14,29],[14,30]]},
  {"id":"a38","pts":[[16,29],[16,28],[16,27],[16,26],[15,26],[15,27],[14,27],[14,26],[13,26],[13,27]]},
  {"id":"a39","pts":[[11,28],[11,27],[10,27],[9,27],[9,26],[9,25],[9,24],[10,24],[10,25],[10,26],[11,26],[11,25],[11,24],[12,24],[13,24],[13,25]]},
  {"id":"a40","pts":[[14,24],[14,23],[15,23],[16,23],[17,23],[17,24],[17,25],[16,25],[15,25],[14,25]]},
  {"id":"a41","pts":[[13,20],[13,19],[13,18],[12,18],[12,19],[11,19],[10,19],[10,18],[11,18],[11,17],[11,16],[12,16],[13,16],[14,16],[15,16],[15,17],[14,17],[14,18],[14,19],[14,20],[14,21]]},
  {"id":"a42","pts":[[13,17],[12,17]]},
  {"id":"a43","pts":[[16,24],[15,24]]},
  {"id":"a44","pts":[[22,35],[22,34],[22,33],[21,33],[21,32],[20,32],[20,31],[21,31],[21,30],[20,30],[19,30],[18,30],[17,30],[16,30],[15,30]]},
  {"id":"a45","pts":[[19,46],[20,46],[20,45],[19,45],[18,45],[17,45],[16,45],[15,45]]},
  {"id":"a46","pts":[[16,17],[17,17],[18,17],[18,16],[18,15],[18,14],[17,14],[16,14],[15,14],[15,15],[16,15],[17,15],[17,16],[16,16]]},
  {"id":"a47","pts":[[16,22],[17,22],[18,22],[18,23],[19,23],[19,22],[19,21],[18,21],[17,21]]},
  {"id":"a48","pts":[[19,18],[19,19],[18,19],[18,18],[17,18],[16,18],[16,19]]},
  {"id":"a49","pts":[[19,20],[18,20],[17,20]]},
  {"id":"a50","pts":[[20,19],[20,20],[21,20],[21,21],[20,21],[20,22],[21,22],[21,23],[21,24],[20,24],[19,24],[18,24]]},
  {"id":"a51","pts":[[20,39],[20,40],[20,41],[21,41],[21,42],[20,42]]},
  {"id":"a52","pts":[[21,40],[21,39],[21,38],[21,37],[21,36],[20,36],[19,36],[19,37],[20,37],[20,38]]},
  {"id":"a53","pts":[[28,30],[27,30],[26,30],[25,30],[24,30],[23,30],[23,29],[22,29],[22,30],[22,31],[23,31],[23,32],[22,32]]},
  {"id":"a54","pts":[[22,37],[22,38],[23,38],[23,37],[23,36],[22,36]]},
  {"id":"a55","pts":[[23,47],[24,47],[24,46],[23,46],[22,46]]},
  {"id":"a56","pts":[[28,47],[28,46],[28,45],[27,45],[27,46],[26,46],[25,46],[25,47]]},
  {"id":"a57","pts":[[29,3],[30,3],[31,3]]},
  {"id":"a58","pts":[[25,4],[24,4],[24,3],[25,3]]},
  {"id":"a59","pts":[[18,3],[19,3],[20,3],[21,3],[22,3],[23,3]]},
  {"id":"a60","pts":[[24,8],[24,7],[24,6],[23,6],[23,5],[23,4]]},
  {"id":"a61","pts":[[26,7],[26,6],[27,6],[28,6],[29,6],[30,6],[30,5]]},
  {"id":"a62","pts":[[35,30],[34,30],[34,29],[33,29],[32,29],[31,29],[31,30],[30,30],[29,30]]},
  {"id":"a63","pts":[[32,41],[31,41],[30,41],[30,40],[30,39],[31,39],[31,40],[32,40],[33,40],[33,41],[33,42],[33,43],[32,43],[32,42],[31,42]]},
  {"id":"a64","pts":[[32,35],[31,35],[31,34],[31,33],[31,32],[31,31],[32,31],[32,32],[33,32],[33,31],[33,30],[32,30]]},
  {"id":"a65","pts":[[26,36],[26,35],[27,35],[27,36],[28,36],[28,35],[28,34],[28,33],[28,32],[29,32],[29,31],[30,31]]},
  {"id":"a66","pts":[[25,39],[25,38],[24,38],[24,37],[24,36],[25,36],[25,35],[25,34],[26,34],[27,34],[27,33],[26,33],[25,33],[24,33],[24,32],[24,31],[25,31],[26,31],[27,31],[28,31]]},
  {"id":"a67","pts":[[27,32],[26,32],[25,32]]},
  {"id":"a68","pts":[[33,33],[32,33],[32,34],[33,34]]},
  {"id":"a69","pts":[[30,36],[30,35],[29,35],[29,34],[29,33],[30,33]]},
  {"id":"a70","pts":[[35,6],[35,7],[34,7],[34,6],[34,5]]},
  {"id":"a71","pts":[[33,4],[32,4],[32,5],[33,5]]},
  {"id":"a72","pts":[[16,4],[16,3],[17,3],[17,4],[18,4],[19,4],[20,4],[21,4],[22,4]]},
  {"id":"a73","pts":[[17,8],[17,9],[18,9],[18,8],[18,7]]},
  {"id":"a74","pts":[[18,10],[19,10],[19,9],[19,8],[19,7],[19,6],[19,5]]},
  {"id":"a75","pts":[[10,13],[10,12],[10,11],[11,11],[11,10],[12,10],[13,10],[14,10],[14,11],[15,11],[15,12],[14,12],[14,13],[15,13],[16,13],[16,12],[16,11],[16,10],[17,10],[17,11],[18,11],[18,12],[18,13],[19,13],[19,12],[19,11]]},
  {"id":"a76","pts":[[12,15],[11,15],[11,14],[11,13],[12,13],[13,13],[13,12],[12,12],[11,12]]},
  {"id":"a77","pts":[[13,11],[12,11]]},
  {"id":"a78","pts":[[12,14],[13,14],[14,14],[14,15],[13,15]]},
  {"id":"a79","pts":[[20,12],[20,11],[21,11],[22,11],[22,10],[22,9],[22,8],[21,8],[21,7],[21,6],[21,5],[20,5],[20,6],[20,7],[20,8],[20,9],[21,9],[21,10],[20,10]]},
  {"id":"a80","pts":[[19,14],[19,15],[20,15],[20,14],[20,13]]},
  {"id":"a81","pts":[[20,16],[21,16],[21,17],[20,17],[19,17],[19,16]]},
  {"id":"a82","pts":[[23,10],[23,11],[24,11],[24,12],[24,13],[23,13],[23,14],[23,15],[23,16],[23,17],[24,17],[25,17],[25,18],[24,18],[23,18],[22,18],[22,17],[22,16],[22,15],[21,15]]},
  {"id":"a83","pts":[[24,9],[23,9],[23,8],[23,7],[22,7],[22,6],[22,5]]},
  {"id":"a84","pts":[[21,12],[21,13],[21,14],[22,14],[22,13],[22,12]]},
  {"id":"a85","pts":[[22,22],[22,21],[22,20],[22,19],[21,19],[21,18]]},
  {"id":"a86","pts":[[20,25],[19,25],[18,25],[18,26],[17,26],[17,27],[18,27],[19,27],[19,26],[20,26],[20,27],[21,27],[21,26],[21,25],[22,25],[22,24],[22,23]]},
  {"id":"a87","pts":[[22,27],[22,26]]},
  {"id":"a88","pts":[[26,11],[25,11],[25,12],[25,13],[25,14],[25,15],[25,16],[24,16],[24,15],[24,14]]},
  {"id":"a89","pts":[[23,19],[23,20],[23,21],[24,21],[24,20],[24,19]]},
  {"id":"a90","pts":[[25,26],[24,26],[23,26],[23,25],[24,25],[24,24],[23,24],[23,23],[23,22]]},
  {"id":"a91","pts":[[24,23],[25,23],[25,24],[26,24],[27,24],[27,25],[26,25],[25,25]]},
  {"id":"a92","pts":[[29,16],[28,16],[28,15],[29,15],[29,14],[28,14],[27,14],[26,14],[26,13],[26,12],[27,12],[27,13],[28,13],[29,13],[29,12],[28,12],[28,11],[27,11]]},
  {"id":"a93","pts":[[30,10],[29,10],[28,10],[27,10],[26,10],[25,10],[25,9],[25,8],[25,7],[25,6],[25,5],[26,5],[27,5],[28,5],[29,5]]},
  {"id":"a94","pts":[[31,19],[31,20],[30,20],[29,20],[28,20],[28,19],[27,19],[27,20],[26,20],[25,20],[25,19]]},
  {"id":"a95","pts":[[31,22],[30,22],[30,21],[29,21],[29,22],[29,23],[28,23],[28,22],[28,21],[27,21],[27,22],[27,23],[26,23],[26,22],[25,22],[25,21]]},
  {"id":"a96","pts":[[28,7],[27,7],[27,8],[28,8],[28,9],[27,9],[26,9],[26,8]]},
  {"id":"a97","pts":[[26,15],[26,16],[27,16],[27,15]]},
  {"id":"a98","pts":[[33,7],[32,7],[32,6],[33,6]]},
  {"id":"a99","pts":[[13,6],[14,6]]},
  {"id":"a100","pts":[[30,8],[30,9],[29,9],[29,8],[29,7],[30,7]]},
  {"id":"a101","pts":[[15,8],[14,8],[13,8],[12,8],[12,7],[13,7],[14,7],[15,7],[16,7],[17,7]]},
  {"id":"a102","pts":[[11,9],[12,9],[13,9],[14,9],[15,9],[16,9],[16,8]]},
  {"id":"a103","pts":[[17,13],[17,12]]},
  {"id":"a104","pts":[[26,19],[26,18],[27,18],[28,18],[29,18],[29,17]]},
  {"id":"a105","pts":[[30,12],[30,11],[31,11],[32,11],[32,10],[32,9],[31,9]]},
  {"id":"a106","pts":[[31,21],[32,21],[32,20],[32,19],[32,18],[31,18],[30,18]]},
  {"id":"a107","pts":[[33,12],[33,11],[33,10],[33,9],[33,8],[32,8],[31,8]]},
  {"id":"a108","pts":[[35,12],[35,11],[35,10],[35,9],[35,8],[34,8],[34,9],[34,10],[34,11],[34,12],[34,13],[33,13],[32,13],[32,12]]},
  {"id":"a109","pts":[[32,15],[32,14],[33,14],[34,14],[35,14],[35,13]]},
  {"id":"a110","pts":[[34,49],[33,49],[32,49],[31,49],[31,48],[31,47],[31,46],[32,46],[32,47],[33,47],[33,46],[34,46],[34,47],[35,47],[36,47]]},
  {"id":"a111","pts":[[29,43],[29,44],[29,45],[29,46],[29,47],[29,48],[28,48],[28,49],[29,49]]},
  {"id":"a112","pts":[[27,39],[28,39],[29,39],[29,40],[29,41]]},
  {"id":"a113","pts":[[35,48],[34,48],[33,48],[32,48]]},
  {"id":"a114","pts":[[33,44],[33,45]]},
  {"id":"a115","pts":[[35,45],[34,45],[34,44],[34,43],[35,43],[35,42],[34,42],[34,41],[35,41],[35,40],[34,40],[34,39],[35,39],[35,38],[35,37],[34,37],[34,38],[33,38],[33,39]]},
  {"id":"a116","pts":[[37,42],[37,43],[37,44],[36,44],[36,45],[36,46],[35,46]]},
  {"id":"a117","pts":[[32,44],[31,44],[31,45],[32,45]]},
  {"id":"a118","pts":[[28,37],[27,37],[27,38],[28,38],[29,38],[30,38],[31,38],[32,38],[32,39]]},
  {"id":"a119","pts":[[35,36],[34,36],[34,35],[33,35],[33,36],[33,37],[32,37],[32,36],[31,36],[31,37]]},
  {"id":"a120","pts":[[29,36],[29,37],[30,37]]},
  {"id":"a121","pts":[[36,20],[37,20],[38,20],[39,20],[40,20],[41,20],[42,20],[43,20],[44,20],[45,20],[46,20],[47,20]]},
  {"id":"a122","pts":[[36,38],[36,39],[36,40],[37,40],[37,41]]},
  {"id":"a123","pts":[[38,29],[39,29]]},
  {"id":"a124","pts":[[42,13],[41,13],[40,13],[40,12],[40,11]]},
  {"id":"a125","pts":[[38,10],[39,10],[39,11],[38,11],[38,12],[39,12]]},
  {"id":"a126","pts":[[38,9],[37,9],[37,8],[36,8],[36,9],[36,10],[37,10]]},
  {"id":"a127","pts":[[39,16],[38,16],[37,16],[36,16],[36,15],[36,14],[36,13],[36,12],[36,11]]},
  {"id":"a128","pts":[[37,13],[37,12],[37,11]]},
  {"id":"a129","pts":[[38,15],[37,15],[37,14],[38,14],[38,13],[39,13]]},
  {"id":"a130","pts":[[30,15],[30,16],[30,17],[31,17],[32,17],[32,16],[31,16],[31,15],[31,14],[30,14],[30,13],[31,13]]},
  {"id":"a131","pts":[[40,14],[39,14],[39,15],[40,15],[41,15],[42,15],[43,15],[44,15],[45,15],[45,16],[45,17],[45,18],[45,19],[46,19],[47,19]]},
  {"id":"a132","pts":[[41,19],[40,19],[39,19],[39,18],[39,17]]},
  {"id":"a133","pts":[[43,21],[43,22],[42,22],[41,22],[41,21],[40,21],[40,22],[39,22],[39,21]]},
  {"id":"a134","pts":[[44,19],[43,19],[42,19],[42,18],[43,18],[44,18],[44,17],[44,16],[43,16],[43,17],[42,17],[42,16],[41,16],[41,17],[41,18],[40,18],[40,17],[40,16]]},
  {"id":"a135","pts":[[43,14],[42,14],[41,14]]},
  {"id":"a136","pts":[[41,27],[41,28]]},
  {"id":"a137","pts":[[42,27],[43,27],[43,26],[44,26],[44,25],[44,24],[44,23],[44,22],[44,21]]},
  {"id":"a138","pts":[[40,25],[40,24],[41,24],[41,23],[40,23],[39,23],[39,24],[39,25],[39,26],[40,26],[41,26],[41,25],[42,25],[42,24],[42,23],[43,23],[43,24],[43,25]]},
  {"id":"a139","pts":[[46,24],[45,24],[45,23],[46,23],[46,22],[45,22],[45,21],[46,21],[47,21],[47,22]]},
  {"id":"a140","pts":[[46,16],[46,17],[47,17],[47,18]]},
  {"id":"a141","pts":[[36,17],[37,17],[38,17]]},
  {"id":"a142","pts":[[36,18],[36,19],[37,19],[37,18],[38,18]]},
  {"id":"a143","pts":[[40,28],[40,27],[39,27],[39,28],[38,28],[37,28],[37,27],[38,27],[38,26],[38,25],[38,24],[38,23],[38,22],[38,21]]},
  {"id":"a144","pts":[[33,27],[33,28],[34,28],[34,27],[35,27],[36,27]]},
  {"id":"a145","pts":[[31,28],[30,28],[30,29],[29,29],[28,29],[27,29],[26,29],[25,29],[24,29],[24,28],[23,28],[23,27],[24,27],[25,27],[26,27],[26,26],[27,26],[27,27],[28,27],[29,27],[30,27],[31,27],[32,27]]},
  {"id":"a146","pts":[[23,33],[23,34],[23,35],[24,35],[24,34]]},
  {"id":"a147","pts":[[25,37],[26,37],[26,38],[26,39],[26,40],[27,40],[28,40],[28,41],[27,41],[26,41],[25,41],[24,41],[23,41],[23,40]]},
  {"id":"a148","pts":[[25,40],[24,40]]},
  {"id":"a149","pts":[[36,23],[37,23],[37,22],[36,22],[36,21],[37,21]]},
  {"id":"a150","pts":[[28,26],[29,26],[30,26],[31,26],[31,25],[31,24],[31,23],[32,23],[32,24],[33,24],[33,23],[34,23],[35,23],[35,24],[36,24],[36,25],[35,25],[35,26],[36,26],[37,26],[37,25],[37,24]]},
  {"id":"a151","pts":[[30,25],[29,25],[28,25],[28,24],[29,24],[30,24]]},
  {"id":"a152","pts":[[34,25],[33,25],[32,25],[32,26],[33,26],[34,26]]},
  {"id":"a153","pts":[[35,17],[35,18],[35,19],[34,19],[34,18],[34,17],[34,16],[35,16],[35,15],[34,15],[33,15],[33,16],[33,17],[33,18],[33,19],[33,20],[34,20],[35,20],[35,21],[34,21],[33,21],[33,22],[34,22],[35,22]]},
  {"id":"a154","pts":[[26,17],[27,17],[28,17]]},
  {"id":"a155","pts":[[29,19],[30,19]]},
  {"id":"a156","pts":[[37,29],[37,30],[36,30],[36,29],[35,29],[35,28],[36,28]]},
  {"id":"a157","pts":[[22,28],[21,28],[20,28],[19,28],[18,28],[17,28],[17,29],[18,29],[19,29],[20,29],[21,29]]},
  {"id":"a158","pts":[[17,35],[18,35],[19,35],[20,35],[21,35],[21,34],[20,34],[20,33]]},
  {"id":"a159","pts":[[26,43],[26,44],[26,45],[25,45],[24,45],[23,45],[22,45],[22,44],[22,43]]},
  {"id":"a160","pts":[[23,43],[24,43],[25,43],[25,44],[24,44],[23,44]]},
  {"id":"a161","pts":[[25,28],[26,28],[27,28],[28,28],[29,28]]},
  {"id":"a162","pts":[[27,43],[27,44],[28,44],[28,43]]},
  {"id":"a163","pts":[[36,43],[36,42],[36,41]]}
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

export default function Level45() {
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

  const currentLevelId = state.game?.levelId || 45;

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
        el.className = 'lvl45-confetti';
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

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 46 });
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
    <div className="lvl45-stage">
      <div className="lvl45-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl45-topbar">
          <div className="lvl45-btns">
            <button className="lvl45-round-btn" onClick={handleLevels} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl45-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl45-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl45-header-center">
            <div className="lvl45-level">Level {currentLevelId}</div>
            <div className="lvl45-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl45-hslot ${!isActive ? 'lost' : ''}`}
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
            className="lvl45-round-btn lvl45-settings"
            onClick={handleLevelSelect}
            aria-label="Level Select"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 6h16v2H4zm0 5h16v2H4zm0 5h16v2H4z" />
            </svg>
          </button>
        </header>

        {/* Board & Zoom */}
        <div id="board-wrap" className="lvl45-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl45-svg" viewBox="-14 -14 910 964" />
        </div>

        {/* Controls */}
        <div className="lvl45-controls">
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
          <button className="lvl45-round lvl45-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl45-bulb">
              <span className="lvl45-bolt">ϟ</span>
            </span>
            <span className="lvl45-ad">AD</span>
          </button>
          <button
            className="lvl45-round lvl45-calculator"
            onClick={handleRestart}
            aria-label="Restart Board"
          >
            <span className="lvl45-calc-icon">
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
        <div className={`lvl45-win ${isWon ? 'on' : ''}`}>
          <div className="lvl45-win-card">
            <h2>Phantastisch!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl45-trophy">🏆</div>
            <div className="lvl45-stars">★ ★ ★</div>
            <button className="lvl45-next" onClick={handleNextLevel}>
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
            <button className="lvl45-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl45-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl45-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
