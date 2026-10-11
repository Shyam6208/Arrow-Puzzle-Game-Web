import { useEffect, useRef, useState, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const NS = 'http://www.w3.org/2000/svg';
const CELL = 13;
const GRID = { cols: 27, rows: 35 };
const P = (c: number, r: number): [number, number] => [c * CELL, r * CELL];

interface ArrowDef {
  id: string;
  pts: [number, number][];
  cells?: [number, number][];
}

const RAW_ARROWS: ArrowDef[] = [
  { id: 'a0', pts: [[0, 0], [1, 0], [1, 1], [0, 1], [0, 2], [1, 2], [1, 3], [0, 3]] },
  { id: 'a1', pts: [[2, 0], [2, 1], [2, 2], [3, 2], [3, 1], [3, 0]] },
  { id: 'a2', pts: [[4, 0], [5, 0], [6, 0], [7, 0], [7, 1], [6, 1], [5, 1]] },
  { id: 'a3', pts: [[20, 5], [19, 5], [18, 5], [17, 5], [16, 5], [15, 5], [14, 5], [13, 5], [12, 5], [11, 5], [10, 5], [10, 4], [10, 3], [10, 2], [10, 1], [10, 0], [9, 0], [9, 1], [8, 1], [8, 0]] },
  { id: 'a4', pts: [[16, 3], [16, 4], [15, 4], [15, 3], [15, 2], [16, 2], [17, 2], [17, 1], [17, 0], [16, 0], [16, 1], [15, 1], [15, 0], [14, 0], [13, 0], [12, 0], [11, 0]] },
  { id: 'a5', pts: [[18, 0], [19, 0], [20, 0], [21, 0], [22, 0], [23, 0], [24, 0], [25, 0], [26, 0]] },
  { id: 'a6', pts: [[4, 1], [4, 2], [4, 3], [4, 4], [4, 5], [4, 6], [4, 7], [4, 8], [3, 8], [3, 7], [3, 6], [2, 6]] },
  { id: 'a7', pts: [[14, 4], [14, 3], [13, 3], [12, 3], [11, 3], [11, 2], [12, 2], [13, 2], [14, 2], [14, 1], [13, 1], [12, 1], [11, 1]] },
  { id: 'a8', pts: [[5, 9], [6, 9], [7, 9], [7, 8], [6, 8], [6, 7], [6, 6], [5, 6], [5, 5], [6, 5], [6, 4], [5, 4], [5, 3], [5, 2]] },
  { id: 'a9', pts: [[8, 5], [7, 5], [7, 4], [8, 4], [8, 3], [7, 3], [6, 3], [6, 2], [7, 2], [8, 2], [9, 2]] },
  { id: 'a10', pts: [[24, 2], [24, 3], [24, 4], [23, 4], [23, 3], [23, 2], [23, 1], [24, 1], [25, 1], [26, 1], [26, 2], [25, 2], [25, 3], [25, 4], [25, 5]] },
  { id: 'a11', pts: [[3, 5], [3, 4], [3, 3], [2, 3]] },
  { id: 'a12', pts: [[9, 5], [9, 4], [9, 3]] },
  { id: 'a13', pts: [[21, 3], [21, 4], [22, 4], [22, 3], [22, 2], [21, 2], [21, 1], [20, 1], [19, 1], [18, 1], [18, 2], [19, 2], [20, 2], [20, 3], [20, 4], [19, 4], [19, 3], [18, 3], [18, 4], [17, 4], [17, 3]] },
  { id: 'a14', pts: [[26, 7], [26, 6], [26, 5], [26, 4], [26, 3]] },
  { id: 'a15', pts: [[1, 6], [0, 6], [0, 5], [0, 4], [1, 4], [1, 5], [2, 5], [2, 4]] },
  { id: 'a16', pts: [[13, 4], [12, 4], [11, 4]] },
  { id: 'a17', pts: [[20, 7], [20, 6], [21, 6], [22, 6], [22, 7], [22, 8], [23, 8], [23, 7], [23, 6], [23, 5], [22, 5], [21, 5]] },
  { id: 'a18', pts: [[16, 8], [17, 8], [17, 7], [17, 6]] },
  { id: 'a19', pts: [[19, 6], [18, 6], [18, 7], [19, 7], [19, 8], [20, 8], [21, 8], [21, 7]] },
  { id: 'a20', pts: [[2, 15], [2, 14], [2, 13], [2, 12], [2, 11], [2, 10], [2, 9], [2, 8], [2, 7], [1, 7], [0, 7]] },
  { id: 'a21', pts: [[5, 8], [5, 7]] },
  { id: 'a22', pts: [[16, 9], [15, 9], [14, 9], [13, 9], [13, 8], [14, 8], [15, 8], [15, 7], [16, 7], [16, 6], [15, 6], [14, 6], [14, 7], [13, 7], [13, 6], [12, 6], [12, 7]] },
  { id: 'a23', pts: [[1, 8], [1, 9], [1, 10], [1, 11], [0, 11], [0, 10], [0, 9], [0, 8]] },
  { id: 'a24', pts: [[11, 8], [11, 7], [11, 6], [10, 6], [9, 6], [8, 6], [7, 6], [7, 7], [8, 7], [9, 7], [10, 7], [10, 8], [9, 8], [8, 8], [8, 9], [9, 9]] },
  { id: 'a25', pts: [[12, 8], [12, 9], [11, 9], [10, 9], [10, 10], [11, 10]] },
  { id: 'a26', pts: [[4, 9], [3, 9]] },
  { id: 'a27', pts: [[23, 10], [23, 11], [22, 11], [22, 10], [21, 10], [21, 11], [20, 11], [20, 10], [20, 9], [21, 9], [22, 9], [23, 9]] },
  { id: 'a28', pts: [[4, 11], [3, 11], [3, 10], [4, 10], [5, 10], [6, 10], [7, 10], [8, 10], [9, 10]] },
  { id: 'a29', pts: [[25, 10], [25, 9], [26, 9], [26, 8], [25, 8], [25, 7], [25, 6], [24, 6], [24, 7], [24, 8], [24, 9], [24, 10], [24, 11], [24, 12], [24, 13], [25, 13], [26, 13]] },
  { id: 'a30', pts: [[26, 10], [26, 11], [25, 11], [25, 12], [26, 12]] },
  { id: 'a31', pts: [[8, 12], [8, 13], [7, 13], [7, 12], [6, 12], [6, 13], [5, 13], [4, 13], [4, 12], [5, 12], [5, 11], [6, 11], [7, 11], [8, 11]] },
  { id: 'a32', pts: [[17, 11], [17, 12], [18, 12], [18, 11], [18, 10], [19, 10], [19, 9], [18, 9], [17, 9], [17, 10], [16, 10], [16, 11], [16, 12], [15, 12], [15, 11], [15, 10], [14, 10], [14, 11], [14, 12]] },
  { id: 'a33', pts: [[0, 12], [1, 12], [1, 13], [0, 13]] },
  { id: 'a34', pts: [[8, 14], [7, 14], [6, 14], [5, 14], [4, 14], [3, 14], [3, 13], [3, 12]] },
  { id: 'a35', pts: [[9, 14], [10, 14], [11, 14], [12, 14], [12, 13], [12, 12], [11, 12], [11, 13], [10, 13], [10, 12], [9, 12], [9, 11], [10, 11], [11, 11], [12, 11], [12, 10], [13, 10], [13, 11], [13, 12]] },
  { id: 'a36', pts: [[16, 13], [17, 13], [18, 13], [19, 13], [19, 12], [20, 12], [20, 13], [21, 13], [21, 12], [22, 12], [22, 13], [23, 13], [23, 12]] },
  { id: 'a37', pts: [[2, 20], [1, 20], [1, 21], [0, 21], [0, 20], [0, 19], [0, 18], [1, 18], [2, 18], [3, 18], [3, 17], [3, 16], [2, 16], [2, 17], [1, 17], [0, 17], [0, 16], [1, 16], [1, 15], [0, 15], [0, 14], [1, 14]] },
  { id: 'a38', pts: [[24, 14], [23, 14], [22, 14], [21, 14], [20, 14], [19, 14], [18, 14], [17, 14], [16, 14], [15, 14], [15, 15], [14, 15], [14, 14], [14, 13], [13, 13], [13, 14], [13, 15]] },
  { id: 'a39', pts: [[26, 17], [25, 17], [25, 16], [26, 16], [26, 15], [25, 15], [25, 14], [26, 14]] },
  { id: 'a40', pts: [[3, 15], [4, 15]] },
  { id: 'a41', pts: [[9, 15], [8, 15], [7, 15], [6, 15], [6, 16], [5, 16], [5, 15]] },
  { id: 'a42', pts: [[12, 16], [12, 17], [11, 17], [11, 16], [10, 16], [10, 15], [11, 15], [12, 15]] },
  { id: 'a43', pts: [[16, 17], [16, 16], [16, 15], [17, 15], [17, 16], [17, 17], [18, 17], [18, 16], [18, 15], [19, 15], [20, 15], [21, 15]] },
  { id: 'a44', pts: [[22, 15], [23, 15], [23, 16], [23, 17], [24, 17], [24, 16], [24, 15]] },
  { id: 'a45', pts: [[7, 18], [6, 18], [5, 18], [4, 18], [4, 17], [4, 16]] },
  { id: 'a46', pts: [[5, 17], [6, 17], [7, 17], [7, 16], [8, 16], [9, 16]] },
  { id: 'a47', pts: [[22, 17], [21, 17], [20, 17], [19, 17], [19, 16], [20, 16], [21, 16], [22, 16]] },
  { id: 'a48', pts: [[8, 21], [8, 20], [8, 19], [8, 18], [8, 17], [9, 17], [10, 17]] },
  { id: 'a49', pts: [[14, 17], [13, 17], [13, 16], [14, 16], [15, 16], [15, 17]] },
  { id: 'a50', pts: [[10, 18], [11, 18], [12, 18], [13, 18], [14, 18], [15, 18], [16, 18], [17, 18], [18, 18], [19, 18], [20, 18], [21, 18], [22, 18], [23, 18], [24, 18], [25, 18], [26, 18]] },
  { id: 'a51', pts: [[2, 19], [1, 19]] },
  { id: 'a52', pts: [[15, 19], [15, 20], [15, 21], [15, 22], [15, 23], [16, 23], [16, 24], [15, 24], [15, 25], [15, 26], [16, 26], [17, 26], [18, 26], [19, 26]] },
  { id: 'a53', pts: [[16, 20], [16, 21], [16, 22], [17, 22], [18, 22], [18, 21], [17, 21], [17, 20], [17, 19], [16, 19]] },
  { id: 'a54', pts: [[18, 19], [18, 20]] },
  { id: 'a55', pts: [[21, 19], [22, 19], [23, 19]] },
  { id: 'a56', pts: [[19, 21], [19, 20], [19, 19], [20, 19], [20, 20], [20, 21], [21, 21], [21, 20], [22, 20], [23, 20], [23, 21], [24, 21], [24, 20], [24, 19]] },
  { id: 'a57', pts: [[25, 21], [25, 20], [25, 19], [26, 19]] },
  { id: 'a58', pts: [[10, 20], [11, 20], [11, 21], [11, 22], [11, 23], [10, 23], [9, 23], [8, 23], [8, 22], [7, 22], [7, 23], [6, 23], [6, 24], [7, 24], [8, 24], [9, 24], [10, 24]] },
  { id: 'a59', pts: [[9, 21], [9, 20], [9, 19], [10, 19], [11, 19], [12, 19], [12, 20], [12, 21], [13, 21], [13, 20], [13, 19], [14, 19], [14, 20]] },
  { id: 'a60', pts: [[26, 21], [26, 20]] },
  { id: 'a61', pts: [[3, 23], [3, 22], [4, 22], [5, 22], [6, 22], [6, 21], [5, 21], [4, 21]] },
  { id: 'a62', pts: [[0, 22], [1, 22], [2, 22], [2, 21], [3, 21], [3, 20], [3, 19], [4, 19], [4, 20], [5, 20], [6, 20], [6, 19], [7, 19], [7, 20], [7, 21]] },
  { id: 'a63', pts: [[14, 21], [14, 22], [14, 23], [14, 24], [13, 24], [13, 23], [13, 22], [12, 22], [12, 23]] },
  { id: 'a64', pts: [[22, 21], [22, 22], [23, 22], [24, 22], [25, 22], [26, 22], [26, 23], [25, 23]] },
  { id: 'a65', pts: [[10, 22], [9, 22]] },
  { id: 'a66', pts: [[0, 34], [0, 33], [0, 32], [0, 31], [0, 30], [0, 29], [0, 28], [0, 27], [0, 26], [0, 25], [0, 24], [1, 24], [1, 25], [2, 25], [2, 24], [2, 23], [1, 23], [0, 23]] },
  { id: 'a67', pts: [[5, 23], [4, 23]] },
  { id: 'a68', pts: [[18, 23], [17, 23], [17, 24]] },
  { id: 'a69', pts: [[20, 23], [19, 23], [19, 22], [20, 22], [21, 22], [21, 23], [21, 24], [20, 24], [19, 24], [18, 24], [18, 25], [19, 25], [20, 25], [21, 25]] },
  { id: 'a70', pts: [[5, 29], [6, 29], [6, 28], [5, 28], [5, 27], [5, 26], [5, 25], [5, 24], [4, 24], [3, 24]] },
  { id: 'a71', pts: [[11, 24], [12, 24], [12, 25], [11, 25], [10, 25], [10, 26], [11, 26]] },
  { id: 'a72', pts: [[23, 24], [23, 25], [23, 26], [24, 26], [24, 27], [25, 27], [26, 27]] },
  { id: 'a73', pts: [[13, 25], [14, 25]] },
  { id: 'a74', pts: [[16, 25], [17, 25]] },
  { id: 'a75', pts: [[24, 25], [24, 24], [24, 23], [23, 23], [22, 23], [22, 24], [22, 25]] },
  { id: 'a76', pts: [[7, 26], [7, 25], [6, 25], [6, 26], [6, 27], [7, 27], [8, 27], [8, 26], [8, 25], [9, 25], [9, 26]] },
  { id: 'a77', pts: [[12, 26], [13, 26], [13, 27], [13, 28], [14, 28], [14, 27], [15, 27], [15, 28]] },
  { id: 'a78', pts: [[25, 26], [25, 25], [25, 24], [26, 24], [26, 25], [26, 26]] },
  { id: 'a79', pts: [[2, 27], [1, 27], [1, 26], [2, 26], [3, 26], [3, 25], [4, 25], [4, 26], [4, 27], [3, 27], [3, 28], [2, 28], [2, 29], [2, 30], [3, 30], [3, 29], [4, 29], [4, 30], [5, 30], [6, 30], [7, 30]] },
  { id: 'a80', pts: [[9, 27], [10, 27], [11, 27], [12, 27], [12, 28], [12, 29], [12, 30], [11, 30], [10, 30], [9, 30], [9, 29], [10, 29], [11, 29], [11, 28], [10, 28], [9, 28], [8, 28], [8, 29], [8, 30]] },
  { id: 'a81', pts: [[16, 27], [16, 28], [16, 29], [16, 30], [16, 31], [16, 32], [16, 33], [16, 34]] },
  { id: 'a82', pts: [[18, 28], [17, 28], [17, 27], [18, 27]] },
  { id: 'a83', pts: [[19, 27], [20, 27], [20, 26], [21, 26], [22, 26], [22, 27]] },
  { id: 'a84', pts: [[1, 28], [1, 29], [1, 30], [1, 31], [1, 32], [1, 33], [1, 34]] },
  { id: 'a85', pts: [[7, 28], [7, 29]] },
  { id: 'a86', pts: [[19, 28], [20, 28], [21, 28], [22, 28], [23, 28], [24, 28], [25, 28], [26, 28]] },
  { id: 'a87', pts: [[13, 29], [13, 30]] },
  { id: 'a88', pts: [[15, 33], [15, 34], [14, 34], [14, 33], [13, 33], [13, 32], [13, 31], [14, 31], [14, 32], [15, 32], [15, 31], [15, 30], [14, 30], [14, 29], [15, 29]] },
  { id: 'a89', pts: [[22, 30], [22, 29], [23, 29], [23, 30]] },
  { id: 'a90', pts: [[26, 30], [26, 29], [25, 29], [24, 29], [24, 30], [25, 30], [25, 31], [26, 31], [26, 32], [25, 32], [25, 33], [25, 34], [26, 34]] },
  { id: 'a91', pts: [[4, 31], [3, 31], [2, 31]] },
  { id: 'a92', pts: [[12, 31], [12, 32], [12, 33]] },
  { id: 'a93', pts: [[24, 31], [23, 31], [22, 31], [22, 32], [23, 32], [24, 32]] },
  { id: 'a94', pts: [[2, 32], [3, 32]] },
  { id: 'a95', pts: [[2, 33], [3, 33], [4, 33], [4, 32], [5, 32], [5, 31], [6, 31], [6, 32]] },
  { id: 'a96', pts: [[18, 32], [17, 32], [17, 31], [18, 31], [19, 31], [19, 32], [19, 33], [19, 34], [20, 34], [20, 33], [20, 32], [20, 31], [20, 30], [19, 30], [18, 30], [17, 30], [17, 29], [18, 29], [19, 29], [20, 29], [21, 29], [21, 30], [21, 31], [21, 32], [21, 33], [21, 34]] },
  { id: 'a97', pts: [[6, 33], [5, 33], [5, 34], [4, 34], [3, 34], [2, 34]] },
  { id: 'a98', pts: [[6, 34], [7, 34], [7, 33], [7, 32], [7, 31], [8, 31], [9, 31], [10, 31], [11, 31], [11, 32], [10, 32], [10, 33], [11, 33]] },
  { id: 'a99', pts: [[18, 34], [17, 34], [17, 33], [18, 33]] },
  { id: 'a100', pts: [[24, 34], [23, 34], [22, 34], [22, 33], [23, 33], [24, 33]] },
  { id: 'a101', pts: [[8, 34], [8, 33], [8, 32], [9, 32], [9, 33], [9, 34], [10, 34], [11, 34], [12, 34], [13, 34]] },
];

/* 100% verified removal solution sequence (102/102 arrows) */
const SOLUTION_IDS: string[] = [
  'a0', 'a1', 'a3', 'a5', 'a11', 'a15', 'a6', 'a2', 'a4', 'a7',
  'a8', 'a13', 'a18', 'a20', 'a21', 'a23', 'a26', 'a29', 'a27', 'a30',
  'a33', 'a39', 'a50', 'a57', 'a66', 'a70', 'a72', 'a81', 'a84', 'a86',
  'a90', 'a78', 'a91', 'a93', 'a96', 'a97', 'a100', 'a89', 'a83', 'a52',
  'a75', 'a69', 'a74', 'a73', 'a82', 'a88', 'a77', 'a49', 'a71', 'a99',
  'a68', 'a101', 'a87', 'a92', 'a98', 'a80', 'a63', 'a58', 'a59', 'a38',
  'a32', 'a35', 'a25', 'a28', 'a31', 'a34', 'a37', 'a41', 'a51', 'a76',
  'a79', 'a85', 'a62', 'a61', 'a65', 'a67', 'a64', 'a10', 'a9', 'a12',
  'a14', 'a16', 'a17', 'a19', 'a36', 'a44', 'a43', 'a42', 'a22', 'a24',
  'a40', 'a45', 'a47', 'a46', 'a48', 'a53', 'a54', 'a56', 'a55', 'a60',
  'a95', 'a94',
];

function cellsOf(def: ArrowDef): [number, number][] {
  const out: [number, number][] = [[def.pts[0][0], def.pts[0][1]]];
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

const ARROWS = RAW_ARROWS.map((a) => ({
  ...a,
  cells: cellsOf(a),
}));

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
  while (i < arcs.length && arcs[i] < p) i++;
  if (i >= arcs.length) i = arcs.length - 1;
  const t = (p - arcs[i - 1]) / (arcs[i] - arcs[i - 1] || 1);
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
  path: PathInfo,
  s: number,
  op = 1,
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

interface ArrowRuntime {
  def: ArrowDef;
  path: PathInfo;
  g: SVGGElement;
  line: SVGPolylineElement;
  hitArea: SVGPolylineElement;
  head: SVGPathElement;
  dots: SVGGElement;
  gone: boolean;
  busy: boolean;
  wrongLocked: boolean;
}

export default function Level22() {
  const { state, dispatch, showRewardedAd } = useStore();
  const { zoomLevel, panOffset, isPanMode, togglePanMode, isPanned, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isZoomed, boardRef, boardStyle } = useZoom();
  const currentLevelId = state.game?.levelId || 22;

  const appRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const arrowsRef = useRef<Record<string, ArrowRuntime>>({});
  const clearedRef = useRef(0);
  const isInputLockedRef = useRef(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const toastTimerRef = useRef<number | null>(null);
  const buildBoardRef = useRef<() => void>(() => {});

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
      osc.frequency.setValueAtTime(ok ? 520 : 190, ctx.currentTime);
      gain.gain.setValueAtTime(0.0001, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(ok ? 0.038 : 0.028, ctx.currentTime + 0.008);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + (ok ? 0.09 : 0.16));
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + (ok ? 0.1 : 0.18));
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
        el.className = 'lvl22-confetti';
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
        p.el.style.left = p.x + 'px';
        p.el.style.top = p.y + 'px';
        p.el.style.transform = `rotate(${p.rot}deg)`;
      });
      if (alive) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  };

  const currentTarget = useCallback((): string | null => {
    for (let k = 0; k < SOLUTION_IDS.length; k++) {
      const id = SOLUTION_IDS[k];
      if (!arrowsRef.current[id]?.gone) return id;
    }
    return null;
  }, []);

  const isExitPathClear = useCallback((id: string): boolean => {
    const a = arrowsRef.current[id];
    if (!a || a.gone) return false;
    const [dc, dr] = a.path.dir;
    const sdc = Math.round(dc);
    const sdr = Math.round(dr);
    let [c, r] = a.def.pts[a.def.pts.length - 1];

    const occ = new Set<string>();
    ARROWS.forEach((o) => {
      if (o.id === id || arrowsRef.current[o.id]?.gone) return;
      o.cells.forEach(([cc, rr]) => occ.add(`${cc},${rr}`));
    });

    c += sdc;
    r += sdr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      if (occ.has(`${c},${r}`)) return false;
      c += sdc;
      r += sdr;
    }
    return true;
  }, []);

  const getObstacleGapPx = useCallback((id: string): number => {
    const a = arrowsRef.current[id];
    if (!a) return 9999;
    const [dc, dr] = a.path.dir;
    const sdc = Math.round(dc);
    const sdr = Math.round(dr);
    let [c, r] = a.def.pts[a.def.pts.length - 1];
    let k = 0;
    c += sdc;
    r += sdr;
    while (c >= 0 && c < GRID.cols && r >= 0 && r < GRID.rows) {
      k++;
      if (
        ARROWS.some(
          (o) =>
            o.id !== id &&
            !arrowsRef.current[o.id]?.gone &&
            o.cells.some(([cc, rr]) => cc === c && rr === r)
        )
      ) {
        return k * CELL;
      }
      c += sdc;
      r += sdr;
    }
    return 9999;
  }, []);

  const collide = useCallback((id: string) => {
    const a = arrowsRef.current[id];
    if (!a || a.busy) return;
    a.busy = true;
    a.g.classList.add('hit');

    if (appRef.current) {
      appRef.current.classList.remove('shake');
      void appRef.current.offsetWidth;
      appRef.current.classList.add('shake');
    }

    if (!a.wrongLocked) {
      a.wrongLocked = true;
      setMistakes((prev) => {
        const next = prev + 1;
        if (next >= 3) {
          playFailSound();
          isInputLockedRef.current = true;
          showToast('Out of Lives!');
          window.setTimeout(() => {
            isInputLockedRef.current = false;
            setIsWon(false);
            setMistakes(0);
            buildBoardRef.current();
          }, 950);
        }
        return next;
      });
    }

    playTapSound(false);

    const bump = Math.max(14, Math.min(getObstacleGapPx(id) - 10, 46));
    const dur = 500;
    const start = performance.now();

    function fr(now: number) {
      const k = Math.min(1, (now - start) / dur);
      const e = k < 0.5 ? 1 - Math.pow(1 - 2 * k, 2) : Math.pow(2 - 2 * k, 2);
      drawArrow(a.line, a.head, a.g, a.path, bump * e, 1, a.hitArea);
      if (k < 1) {
        requestAnimationFrame(fr);
      } else {
        a.busy = false;
        a.g.classList.remove('hit');
      }
    }
    requestAnimationFrame(fr);
  }, [getObstacleGapPx, showToast]);

  const removeArrow = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone) return;
      a.gone = true;
      a.g.classList.add('fly');
      clearedRef.current++;
      setRemainingCount(RAW_ARROWS.length - clearedRef.current);

      const L = a.path.L;
      const dist = L + 340;
      const dur = 750 + L * 3.0;
      const start = performance.now();
      let dotsShown = false;

      function frame(now: number) {
        const k = Math.min(1, (now - start) / dur);
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
          Object.values(arrowsRef.current).forEach((x) => {
            if (!x.gone) x.wrongLocked = false;
          });
          if (clearedRef.current === RAW_ARROWS.length) {
            window.setTimeout(() => {
              setIsWon(true);
              triggerConfetti();
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: currentLevelId,
                moves: 102,
                stars: 3,
              });
            }, 380);
          }
        }
      }
      requestAnimationFrame(frame);
    },
    [dispatch, currentLevelId]
  );

  const tryRemove = useCallback(
    (id: string) => {
      const a = arrowsRef.current[id];
      if (!a || a.gone || a.busy || isInputLockedRef.current) return;

      const clear = isExitPathClear(id);

      if (!clear) {
        collide(id);
        return;
      }

      playTapSound(true);
      removeArrow(id);
    },
    [isExitPathClear, collide, removeArrow]
  );

  const buildBoard = useCallback(() => {
    const svg = svgRef.current;
    if (!svg) return;
    svg.innerHTML = '';
    arrowsRef.current = {};
    clearedRef.current = 0;
    setRemainingCount(RAW_ARROWS.length);
    isInputLockedRef.current = false;

    ARROWS.forEach((def) => {
      const path = makePath(def);

      const dots = document.createElementNS(NS, 'g');
      dots.setAttribute('class', 'lvl22-dots');
      def.cells.forEach(([c, r]) => {
        const [x, y] = P(c, r);
        const d = document.createElementNS(NS, 'circle');
        d.setAttribute('cx', String(x));
        d.setAttribute('cy', String(y));
        d.setAttribute('r', '1.3');
        dots.appendChild(d);
      });
      svg.appendChild(dots);

      const g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'lvl22-arrow pop');
      g.style.touchAction = 'none';

      const line = document.createElementNS(NS, 'polyline');
      line.setAttribute('class', 'lvl22-pathline');

      const head = document.createElementNS(NS, 'path');
      head.setAttribute('class', 'lvl22-head');
      head.setAttribute('d', 'M7 0 L-3 -5.5 L-3 5.5 Z');

      const hitArea = document.createElementNS(NS, 'polyline');
      hitArea.setAttribute('stroke', 'transparent');
      hitArea.setAttribute('stroke-width', '16');
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
    const targetId = currentTarget();
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
  }, [currentTarget, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    if (!currentTarget()) {
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
    <div className="lvl22-stage">
      <div className="lvl22-app" ref={appRef} id="app">
        {/* Header */}
        <header className="lvl22-topbar">
          <div className="lvl22-btns">
            <button className="lvl22-round-btn" onClick={handleHome} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <button className="lvl22-round-btn" onClick={handleRestart} aria-label="Restart">
              <svg viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 5a7 7 0 1 1-6.3 4H3.5L7 4.5 10.5 9H8.2A5 5 0 1 0 12 7z" />
              </svg>
            </button>
            <span className="lvl22-cnt-pill" title="Remaining Arrows">
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

          <div className="lvl22-header-center">
            <div className="lvl22-level">Level {currentLevelId}</div>
            <div className="lvl22-hearts" id="hearts">
              {[0, 1, 2].map((idx) => {
                const isActive = idx < 3 - mistakes;
                return (
                  <span
                    key={idx}
                    className={`lvl22-heart ${!isActive ? 'lost' : ''}`}
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
            className="lvl22-round-btn lvl22-settings"
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            aria-label="Settings"
          >
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.4 13a7.8 7.8 0 0 0 .1-1 7.8 7.8 0 0 0-.1-1l2.1-1.7a.6.6 0 0 0 .1-.7l-2-3.4a.6.6 0 0 0-.7-.2l-2.5 1a7.7 7.7 0 0 0-1.7-1l-.4-2.6a.6.6 0 0 0-.6-.5h-4a.6.6 0 0 0-.6.5l-.4 2.6a7.7 7.7 0 0 0-1.7 1l-2.5-1a.6.6 0 0 0-.7.2l-2 3.4a.6.6 0 0 0 .1.7L4.5 11a7.8 7.8 0 0 0 0 2l-2.1 1.7a.6.6 0 0 0-.1.7l2 3.4c.1.3.4.4.7.2l2.5-1a7.7 7.7 0 0 0 1.7 1l.4 2.6c0 .3.3.5.6.5h4c.3 0 .6-.2.6-.5l.4-2.6a7.7 7.7 0 0 0 1.7-1l2.5 1c.3.2.6.1.7-.2l2-3.4a.6.6 0 0 0-.1-.7zM12 15.5A3.5 3.5 0 1 1 12 8.5a3.5 3.5 0 0 1 0 7z" />
            </svg>
          </button>
        </header>

        {/* Board Wrap */}
        <div id="board-wrap" className="lvl22-board-wrap" ref={boardRef} style={boardStyle}>
          <svg id="boardSvg" ref={svgRef} className="lvl22-boardSvg" viewBox="-20 -20 378 482" />
        </div>

        {/* Controls */}
        <div className="lvl22-controls">
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
          <button className="lvl22-round lvl22-hint" onClick={handleHint} aria-label="Hint">
            <span className="lvl22-bulb">
              <span className="lvl22-bolt">ϟ</span>
            </span>
            <span className="lvl22-ad">AD</span>
          </button>
          <button
            className="lvl22-round lvl22-calculator"
            onClick={() => showToast('Level 22: 102 Arrows')}
            aria-label="Info"
          >
            <span className="lvl22-calc-icon">
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
        <div className={`lvl22-win ${isWon ? 'on' : ''}`}>
          <div className="lvl22-win-card">
            <h2>Mega!</h2>
            <p>Level {currentLevelId} Cleared</p>
            <div className="lvl22-trophy">🏆</div>
            <div className="lvl22-stars">★ ★ ★</div>
            <button className="lvl22-next" onClick={handleNextLevel}>
              Level Select ➔
            </button>
            <button className="lvl22-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl22-sub">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl22-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>

        <div className="home-bar" />
      </div>
    </div>
  );
}
