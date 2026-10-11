import type { LevelData, Arrow } from '../types';
import { solveLevel } from './engine';

let arrowIdCounter = 0;
function nextArrowId(): string {
  return `arrow-${++arrowIdCounter}`;
}

function makeArrow(
  segments: { row: number; col: number }[],
  direction: 'up' | 'down' | 'left' | 'right'
): Arrow {
  return {
    id: nextArrowId(),
    segments,
    direction,
  };
}

// ─── Hand-crafted levels 1-10 ───

const level1: LevelData = {
  id: 1,
  gridRows: 3,
  gridCols: 3,
  par: 3,
  difficulty: 1,
  arrows: [
    // 3 up arrows, one in each column
    makeArrow([{ row: 2, col: 0 }, { row: 1, col: 0 }, { row: 0, col: 0 }], 'up'),
    makeArrow([{ row: 2, col: 1 }, { row: 1, col: 1 }, { row: 0, col: 1 }], 'up'),
    makeArrow([{ row: 2, col: 2 }, { row: 1, col: 2 }, { row: 0, col: 2 }], 'up'),
  ],
};

const level2: LevelData = {
  id: 2,
  gridRows: 8,
  gridCols: 8,
  par: 5,
  difficulty: 2,
  arrows: [
    // L-shaped arrow going right then down
    makeArrow([{ row: 2, col: 2 }, { row: 2, col: 3 }, { row: 3, col: 3 }, { row: 4, col: 3 }], 'down'),
    // Straight arrow pointing up
    makeArrow([{ row: 5, col: 4 }, { row: 4, col: 4 }, { row: 3, col: 4 }], 'up'),
    // Straight arrow pointing right
    makeArrow([{ row: 4, col: 2 }, { row: 4, col: 3 }], 'right'),
    // Straight arrow pointing down (long)
    makeArrow([{ row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 }], 'down'),
    // Straight arrow pointing left
    makeArrow([{ row: 5, col: 3 }, { row: 5, col: 2 }], 'left'),
  ],
};

const level3: LevelData = {
  id: 3,
  gridRows: 9,
  gridCols: 9,
  par: 7,
  difficulty: 3,
  arrows: (() => {
    arrowIdCounter = 100; // Reset for level 3
    return [
      makeArrow([{ row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }], 'right'),
      makeArrow([{ row: 6, col: 6 }, { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }], 'up'),
      makeArrow([{ row: 1, col: 2 }, { row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }, { row: 5, col: 2 }, { row: 6, col: 2 }], 'down'),
      makeArrow([{ row: 3, col: 3 }, { row: 3, col: 4 }, { row: 3, col: 5 }], 'right'),
      makeArrow([{ row: 5, col: 4 }, { row: 5, col: 5 }], 'right'),
      makeArrow([{ row: 6, col: 3 }, { row: 6, col: 4 }], 'right'),
      makeArrow([{ row: 4, col: 3 }, { row: 4, col: 4 }], 'right'),
    ];
  })(),
};

const level4: LevelData = {
  id: 4,
  gridRows: 7,
  gridCols: 7,
  par: 4,
  difficulty: 2,
  arrows: [
    makeArrow([{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }], 'right'),
    makeArrow([{ row: 3, col: 1 }, { row: 2, col: 1 }], 'up'),
    makeArrow([{ row: 5, col: 3 }, { row: 4, col: 3 }, { row: 3, col: 3 }], 'up'),
    makeArrow([{ row: 3, col: 5 }, { row: 3, col: 4 }], 'left'),
  ],
};

const level5: LevelData = {
  id: 5,
  gridRows: 8,
  gridCols: 8,
  par: 5,
  difficulty: 3,
  arrows: [
    makeArrow([{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }], 'right'),
    makeArrow([{ row: 1, col: 5 }, { row: 2, col: 5 }, { row: 3, col: 5 }], 'down'),
    makeArrow([{ row: 3, col: 5 }, { row: 3, col: 4 }, { row: 3, col: 3 }], 'left'),
    makeArrow([{ row: 5, col: 3 }, { row: 4, col: 3 }], 'up'),
    makeArrow([{ row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }], 'right'),
  ],
};

const level6: LevelData = {
  id: 6,
  gridRows: 8,
  gridCols: 8,
  par: 6,
  difficulty: 4,
  arrows: [
    makeArrow([{ row: 2, col: 1 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }], 'right'),
    makeArrow([{ row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }], 'down'),
    makeArrow([{ row: 4, col: 5 }, { row: 4, col: 4 }, { row: 4, col: 3 }], 'left'),
    makeArrow([{ row: 4, col: 2 }, { row: 3, col: 2 }], 'up'),
    makeArrow([{ row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }], 'right'),
    makeArrow([{ row: 0, col: 3 }, { row: 1, col: 3 }], 'down'),
  ],
};

const level7: LevelData = {
  id: 7,
  gridRows: 9,
  gridCols: 9,
  par: 6,
  difficulty: 5,
  arrows: [
    makeArrow([{ row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }], 'down'),
    makeArrow([{ row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }], 'right'),
    makeArrow([{ row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }], 'right'),
    makeArrow([{ row: 4, col: 7 }, { row: 3, col: 7 }, { row: 2, col: 7 }, { row: 1, col: 7 }], 'up'),
    makeArrow([{ row: 6, col: 4 }, { row: 6, col: 5 }], 'right'),
    makeArrow([{ row: 6, col: 2 }, { row: 5, col: 2 }], 'up'),
  ],
};

const level8: LevelData = {
  id: 8,
  gridRows: 9,
  gridCols: 9,
  par: 7,
  difficulty: 5,
  arrows: [
    makeArrow([{ row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }], 'right'),
    makeArrow([{ row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }], 'up'),
    makeArrow([{ row: 3, col: 2 }, { row: 3, col: 3 }, { row: 3, col: 4 }], 'right'),
    makeArrow([{ row: 3, col: 5 }, { row: 4, col: 5 }, { row: 5, col: 5 }], 'down'),
    makeArrow([{ row: 5, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 3 }], 'left'),
    makeArrow([{ row: 7, col: 2 }, { row: 6, col: 2 }, { row: 5, col: 2 }], 'up'),
    makeArrow([{ row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }], 'right'),
  ],
};

const level9: LevelData = {
  id: 9,
  gridRows: 10,
  gridCols: 10,
  par: 8,
  difficulty: 6,
  arrows: [
    makeArrow([{ row: 0, col: 4 }, { row: 1, col: 4 }, { row: 1, col: 5 }], 'right'),
    makeArrow([{ row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }], 'down'),
    makeArrow([{ row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }], 'up'),
    makeArrow([{ row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }], 'right'),
    makeArrow([{ row: 6, col: 4 }, { row: 5, col: 4 }], 'up'),
    makeArrow([{ row: 6, col: 6 }, { row: 6, col: 5 }], 'left'),
    makeArrow([{ row: 6, col: 2 }, { row: 7, col: 2 }, { row: 8, col: 2 }], 'down'),
    makeArrow([{ row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }], 'right'),
  ],
};

const level10: LevelData = {
  id: 10,
  gridRows: 23,
  gridCols: 22,
  par: 43,
  difficulty: 7,
  arrows: [
    makeArrow([{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }], 'right'),
    makeArrow([{ row: 1, col: 6 }, { row: 2, col: 6 }, { row: 3, col: 6 }], 'down'),
    makeArrow([{ row: 3, col: 6 }, { row: 3, col: 5 }, { row: 3, col: 4 }], 'left'),
    makeArrow([{ row: 3, col: 3 }, { row: 4, col: 3 }, { row: 5, col: 3 }], 'down'),
    makeArrow([{ row: 5, col: 3 }, { row: 5, col: 4 }, { row: 5, col: 5 }, { row: 5, col: 6 }], 'right'),
    makeArrow([{ row: 5, col: 7 }, { row: 4, col: 7 }, { row: 3, col: 7 }, { row: 2, col: 7 }, { row: 1, col: 7 }], 'up'),
    makeArrow([{ row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }], 'right'),
    makeArrow([{ row: 7, col: 6 }, { row: 8, col: 6 }], 'down'),
    makeArrow([{ row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }], 'left'),
  ],
};

const level11: LevelData = {
  id: 11,
  gridRows: 14,
  gridCols: 12,
  par: 24,
  difficulty: 8,
  arrows: [
    makeArrow([{ row: 0, col: 11 }, { row: 0, col: 10 }, { row: 0, col: 9 }, { row: 0, col: 8 }, { row: 0, col: 7 }, { row: 0, col: 6 }], 'left'),
    makeArrow([{ row: 1, col: 0 }, { row: 0, col: 0 }, { row: 0, col: 1 }, { row: 1, col: 1 }, { row: 1, col: 2 }, { row: 0, col: 2 }], 'up'),
    makeArrow([{ row: 0, col: 3 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 }, { row: 1, col: 9 }, { row: 1, col: 10 }, { row: 1, col: 11 }], 'right'),
    makeArrow([{ row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }, { row: 4, col: 3 }, { row: 4, col: 2 }, { row: 4, col: 1 }, { row: 4, col: 0 }, { row: 3, col: 0 }, { row: 2, col: 0 }], 'up'),
    makeArrow([{ row: 3, col: 3 }, { row: 3, col: 2 }, { row: 3, col: 1 }, { row: 2, col: 1 }], 'up'),
    makeArrow([{ row: 4, col: 9 }, { row: 4, col: 8 }, { row: 4, col: 7 }, { row: 3, col: 7 }, { row: 2, col: 7 }], 'up'),
    makeArrow([{ row: 4, col: 5 }, { row: 3, col: 5 }, { row: 2, col: 5 }, { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }], 'down'),
    makeArrow([{ row: 2, col: 8 }, { row: 2, col: 9 }, { row: 2, col: 10 }, { row: 3, col: 10 }, { row: 4, col: 10 }], 'down'),
    makeArrow([{ row: 2, col: 11 }, { row: 3, col: 11 }, { row: 4, col: 11 }, { row: 5, col: 11 }, { row: 6, col: 11 }, { row: 6, col: 10 }, { row: 6, col: 9 }, { row: 6, col: 8 }, { row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 8, col: 10 }, { row: 8, col: 9 }, { row: 8, col: 8 }, { row: 9, col: 8 }], 'down'),
    makeArrow([{ row: 3, col: 8 }, { row: 3, col: 9 }], 'right'),
    makeArrow([{ row: 5, col: 10 }, { row: 5, col: 9 }, { row: 5, col: 8 }, { row: 5, col: 7 }, { row: 5, col: 6 }, { row: 5, col: 5 }, { row: 5, col: 4 }, { row: 5, col: 3 }, { row: 5, col: 2 }, { row: 5, col: 1 }, { row: 5, col: 0 }], 'left'),
    makeArrow([{ row: 11, col: 3 }, { row: 10, col: 3 }, { row: 10, col: 4 }, { row: 9, col: 4 }, { row: 8, col: 4 }, { row: 7, col: 4 }, { row: 6, col: 4 }, { row: 6, col: 5 }], 'right'),
    makeArrow([{ row: 11, col: 0 }, { row: 10, col: 0 }, { row: 9, col: 0 }, { row: 8, col: 0 }, { row: 7, col: 0 }, { row: 6, col: 0 }], 'up'),
    makeArrow([{ row: 11, col: 1 }, { row: 10, col: 1 }, { row: 10, col: 2 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 8, col: 3 }, { row: 7, col: 3 }, { row: 6, col: 3 }, { row: 6, col: 2 }, { row: 7, col: 2 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 7, col: 1 }, { row: 6, col: 1 }], 'up'),
    makeArrow([{ row: 6, col: 6 }, { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 8, col: 7 }, { row: 9, col: 7 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 11, col: 9 }, { row: 12, col: 9 }, { row: 13, col: 9 }], 'down'),
    makeArrow([{ row: 9, col: 5 }, { row: 8, col: 5 }, { row: 7, col: 5 }], 'up'),
    makeArrow([{ row: 11, col: 11 }, { row: 10, col: 11 }, { row: 9, col: 11 }, { row: 8, col: 11 }, { row: 7, col: 11 }], 'up'),
    makeArrow([{ row: 7, col: 6 }, { row: 8, col: 6 }, { row: 9, col: 6 }, { row: 10, col: 6 }, { row: 10, col: 5 }], 'left'),
    makeArrow([{ row: 10, col: 9 }, { row: 9, col: 9 }, { row: 9, col: 10 }, { row: 10, col: 10 }, { row: 11, col: 10 }, { row: 12, col: 10 }, { row: 12, col: 11 }], 'right'),
    makeArrow([{ row: 12, col: 2 }, { row: 11, col: 2 }], 'up'),
    makeArrow([{ row: 11, col: 4 }, { row: 11, col: 5 }, { row: 11, col: 6 }, { row: 11, col: 7 }, { row: 12, col: 7 }, { row: 12, col: 8 }, { row: 13, col: 8 }, { row: 13, col: 7 }], 'left'),
    makeArrow([{ row: 12, col: 6 }, { row: 12, col: 5 }, { row: 12, col: 4 }, { row: 12, col: 3 }], 'left'),
    makeArrow([{ row: 13, col: 6 }, { row: 13, col: 5 }, { row: 13, col: 4 }, { row: 13, col: 3 }, { row: 13, col: 2 }, { row: 13, col: 1 }, { row: 12, col: 1 }, { row: 12, col: 0 }, { row: 13, col: 0 }], 'down'),
    makeArrow([{ row: 13, col: 11 }, { row: 13, col: 10 }], 'left'),
  ],
};

const level12: LevelData = {
  id: 12,
  gridRows: 20,
  gridCols: 14,
  par: 46,
  difficulty: 8,
  arrows: [
    makeArrow([{ row: 0, col: 2 }, { row: 0, col: 3 }, { row: 0, col: 4 }, { row: 0, col: 5 }, { row: 0, col: 6 }, { row: 0, col: 7 }, { row: 0, col: 8 }, { row: 0, col: 9 }], 'right'),
    makeArrow([{ row: 4, col: 10 }, { row: 3, col: 10 }, { row: 2, col: 10 }, { row: 1, col: 10 }, { row: 0, col: 10 }], 'up'),
    makeArrow([{ row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }, { row: 7, col: 7 }, { row: 8, col: 7 }, { row: 9, col: 7 }, { row: 10, col: 7 }, { row: 10, col: 8 }, { row: 10, col: 9 }, { row: 10, col: 10 }, { row: 10, col: 11 }, { row: 10, col: 12 }, { row: 9, col: 12 }, { row: 8, col: 12 }, { row: 7, col: 12 }, { row: 6, col: 12 }, { row: 5, col: 12 }, { row: 4, col: 12 }, { row: 3, col: 12 }, { row: 2, col: 12 }, { row: 1, col: 12 }, { row: 0, col: 12 }], 'up'),
    makeArrow([{ row: 17, col: 13 }, { row: 16, col: 13 }, { row: 15, col: 13 }, { row: 14, col: 13 }, { row: 13, col: 13 }, { row: 12, col: 13 }, { row: 11, col: 13 }, { row: 10, col: 13 }, { row: 9, col: 13 }, { row: 8, col: 13 }, { row: 7, col: 13 }, { row: 6, col: 13 }, { row: 5, col: 13 }, { row: 4, col: 13 }, { row: 3, col: 13 }, { row: 2, col: 13 }, { row: 1, col: 13 }, { row: 0, col: 13 }], 'up'),
    makeArrow([{ row: 0, col: 1 }, { row: 0, col: 0 }, { row: 1, col: 0 }, { row: 2, col: 0 }, { row: 3, col: 0 }, { row: 4, col: 0 }, { row: 5, col: 0 }, { row: 6, col: 0 }, { row: 7, col: 0 }, { row: 8, col: 0 }, { row: 9, col: 0 }, { row: 9, col: 1 }, { row: 9, col: 2 }, { row: 9, col: 3 }, { row: 10, col: 3 }, { row: 10, col: 2 }, { row: 10, col: 1 }], 'left'),
    makeArrow([{ row: 1, col: 2 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 1, col: 8 }], 'right'),
    makeArrow([{ row: 3, col: 1 }, { row: 2, col: 1 }, { row: 1, col: 1 }], 'up'),
    makeArrow([{ row: 1, col: 11 }, { row: 2, col: 11 }, { row: 3, col: 11 }, { row: 4, col: 11 }, { row: 5, col: 11 }, { row: 6, col: 11 }, { row: 6, col: 10 }, { row: 6, col: 9 }, { row: 6, col: 8 }, { row: 5, col: 8 }, { row: 4, col: 8 }, { row: 4, col: 9 }, { row: 3, col: 9 }, { row: 2, col: 9 }], 'up'),
    makeArrow([{ row: 3, col: 7 }, { row: 3, col: 8 }, { row: 2, col: 8 }, { row: 2, col: 7 }], 'left'),
    makeArrow([{ row: 3, col: 4 }, { row: 2, col: 4 }], 'up'),
    makeArrow([{ row: 2, col: 2 }, { row: 3, col: 2 }], 'down'),
    makeArrow([{ row: 2, col: 3 }, { row: 3, col: 3 }], 'down'),
    makeArrow([{ row: 2, col: 5 }, { row: 2, col: 6 }, { row: 3, col: 6 }, { row: 3, col: 5 }], 'left'),
    makeArrow([{ row: 4, col: 1 }, { row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }], 'right'),
    makeArrow([{ row: 7, col: 2 }, { row: 6, col: 2 }, { row: 6, col: 1 }, { row: 5, col: 1 }, { row: 5, col: 2 }], 'right'),
    makeArrow([{ row: 5, col: 9 }, { row: 5, col: 10 }], 'right'),
    makeArrow([{ row: 6, col: 6 }, { row: 5, col: 6 }, { row: 5, col: 5 }, { row: 6, col: 5 }, { row: 7, col: 5 }, { row: 7, col: 4 }, { row: 6, col: 4 }, { row: 5, col: 4 }, { row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }, { row: 9, col: 5 }, { row: 10, col: 5 }, { row: 11, col: 5 }, { row: 11, col: 6 }, { row: 11, col: 7 }, { row: 11, col: 8 }, { row: 11, col: 9 }, { row: 11, col: 10 }, { row: 11, col: 11 }, { row: 11, col: 12 }], 'right'),
    makeArrow([{ row: 8, col: 2 }, { row: 8, col: 1 }, { row: 7, col: 1 }], 'up'),
    makeArrow([{ row: 10, col: 6 }, { row: 9, col: 6 }, { row: 8, col: 6 }, { row: 7, col: 6 }], 'up'),
    makeArrow([{ row: 7, col: 8 }, { row: 7, col: 9 }, { row: 7, col: 10 }], 'right'),
    makeArrow([{ row: 9, col: 11 }, { row: 8, col: 11 }, { row: 7, col: 11 }], 'up'),
    makeArrow([{ row: 8, col: 8 }, { row: 8, col: 9 }], 'right'),
    makeArrow([{ row: 8, col: 10 }, { row: 9, col: 10 }, { row: 9, col: 9 }, { row: 9, col: 8 }], 'left'),
    makeArrow([{ row: 14, col: 2 }, { row: 14, col: 1 }, { row: 13, col: 1 }, { row: 13, col: 2 }, { row: 13, col: 3 }, { row: 13, col: 4 }, { row: 12, col: 4 }, { row: 11, col: 4 }, { row: 10, col: 4 }, { row: 9, col: 4 }], 'up'),
    makeArrow([{ row: 10, col: 0 }, { row: 11, col: 0 }, { row: 12, col: 0 }, { row: 13, col: 0 }, { row: 14, col: 0 }, { row: 15, col: 0 }, { row: 16, col: 0 }, { row: 16, col: 1 }, { row: 15, col: 1 }, { row: 15, col: 2 }, { row: 15, col: 3 }, { row: 14, col: 3 }, { row: 14, col: 4 }], 'right'),
    makeArrow([{ row: 11, col: 1 }, { row: 11, col: 2 }, { row: 11, col: 3 }, { row: 12, col: 3 }], 'down'),
    makeArrow([{ row: 12, col: 2 }, { row: 12, col: 1 }], 'left'),
    makeArrow([{ row: 14, col: 5 }, { row: 13, col: 5 }, { row: 12, col: 5 }, { row: 12, col: 6 }, { row: 12, col: 7 }, { row: 12, col: 8 }, { row: 12, col: 9 }, { row: 12, col: 10 }], 'right'),
    makeArrow([{ row: 13, col: 10 }, { row: 13, col: 11 }, { row: 12, col: 11 }, { row: 12, col: 12 }, { row: 13, col: 12 }, { row: 14, col: 12 }], 'down'),
    makeArrow([{ row: 15, col: 6 }, { row: 14, col: 6 }, { row: 13, col: 6 }, { row: 13, col: 7 }, { row: 13, col: 8 }, { row: 13, col: 9 }], 'right'),
    makeArrow([{ row: 15, col: 7 }, { row: 14, col: 7 }, { row: 14, col: 8 }], 'right'),
    makeArrow([{ row: 14, col: 11 }, { row: 14, col: 10 }, { row: 14, col: 9 }, { row: 15, col: 9 }, { row: 16, col: 9 }, { row: 17, col: 9 }, { row: 18, col: 9 }, { row: 19, col: 9 }], 'down'),
    makeArrow([{ row: 15, col: 4 }, { row: 15, col: 5 }], 'right'),
    makeArrow([{ row: 16, col: 8 }, { row: 15, col: 8 }], 'up'),
    makeArrow([{ row: 16, col: 12 }, { row: 15, col: 12 }, { row: 15, col: 11 }, { row: 15, col: 10 }, { row: 16, col: 10 }, { row: 17, col: 10 }, { row: 18, col: 10 }], 'down'),
    makeArrow([{ row: 18, col: 4 }, { row: 17, col: 4 }, { row: 17, col: 5 }, { row: 16, col: 5 }, { row: 16, col: 4 }], 'left'),
    makeArrow([{ row: 17, col: 6 }, { row: 16, col: 6 }, { row: 16, col: 7 }], 'right'),
    makeArrow([{ row: 18, col: 1 }, { row: 17, col: 1 }, { row: 17, col: 2 }, { row: 17, col: 3 }, { row: 16, col: 3 }, { row: 16, col: 2 }], 'left'),
    makeArrow([{ row: 16, col: 11 }, { row: 17, col: 11 }, { row: 17, col: 12 }], 'right'),
    makeArrow([{ row: 18, col: 0 }, { row: 17, col: 0 }], 'up'),
    makeArrow([{ row: 17, col: 8 }, { row: 17, col: 7 }], 'left'),
    makeArrow([{ row: 18, col: 3 }, { row: 18, col: 2 }], 'left'),
    makeArrow([{ row: 18, col: 5 }, { row: 18, col: 6 }], 'right'),
    makeArrow([{ row: 18, col: 11 }, { row: 18, col: 12 }, { row: 18, col: 13 }], 'right'),
    makeArrow([{ row: 18, col: 7 }, { row: 18, col: 8 }, { row: 19, col: 8 }, { row: 19, col: 7 }, { row: 19, col: 6 }, { row: 19, col: 5 }, { row: 19, col: 4 }, { row: 19, col: 3 }, { row: 19, col: 2 }, { row: 19, col: 1 }, { row: 19, col: 0 }], 'left'),
    makeArrow([{ row: 19, col: 13 }, { row: 19, col: 12 }, { row: 19, col: 11 }, { row: 19, col: 10 }], 'left'),
  ],
};

const level13: LevelData = {
  id: 13,
  gridRows: 8,
  gridCols: 8,
  par: 7,
  difficulty: 7,
  arrows: (() => {
    arrowIdCounter = 1300;
    return [
      makeArrow([{ row: 1, col: 1 }, { row: 1, col: 2 }, { row: 1, col: 3 }], 'right'),
      makeArrow([{ row: 3, col: 5 }, { row: 2, col: 5 }, { row: 1, col: 5 }, { row: 0, col: 5 }], 'up'),
      makeArrow([{ row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 5, col: 1 }, { row: 6, col: 1 }], 'down'),
      makeArrow([{ row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 }, { row: 6, col: 6 }], 'right'),
      makeArrow([{ row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }], 'up'),
      makeArrow([{ row: 5, col: 4 }, { row: 4, col: 4 }, { row: 3, col: 4 }, { row: 3, col: 3 }, { row: 3, col: 2 }], 'left'),
      makeArrow([{ row: 4, col: 3 }, { row: 5, col: 3 }], 'down'),
    ];
  })(),
};

const level14: LevelData = {
  id: 14,
  gridRows: 24,
  gridCols: 20,
  par: 70,
  difficulty: 9,
  arrows: (() => {
    arrowIdCounter = 1400;
    return [
      makeArrow([{ row: 0, col: 7 }, { row: 0, col: 6 }, { row: 0, col: 5 }, { row: 0, col: 4 }, { row: 0, col: 3 }], 'left'),
      makeArrow([{ row: 1, col: 9 }, { row: 1, col: 8 }, { row: 0, col: 8 }, { row: 0, col: 9 }], 'right'),
      makeArrow([{ row: 0, col: 15 }, { row: 0, col: 16 }], 'right'),
      makeArrow([{ row: 1, col: 18 }, { row: 0, col: 18 }, { row: 0, col: 19 }, { row: 1, col: 19 }, { row: 2, col: 19 }, { row: 2, col: 18 }, { row: 2, col: 17 }, { row: 2, col: 16 }, { row: 1, col: 16 }, { row: 1, col: 17 }, { row: 0, col: 17 }], 'up'),
      makeArrow([{ row: 0, col: 0 }, { row: 0, col: 1 }, { row: 0, col: 2 }, { row: 1, col: 2 }, { row: 1, col: 1 }, { row: 2, col: 1 }, { row: 3, col: 1 }, { row: 4, col: 1 }, { row: 4, col: 0 }], 'left'),
      makeArrow([{ row: 1, col: 10 }, { row: 0, col: 10 }, { row: 0, col: 11 }, { row: 0, col: 12 }, { row: 1, col: 12 }, { row: 1, col: 11 }, { row: 2, col: 11 }, { row: 2, col: 12 }, { row: 2, col: 13 }, { row: 2, col: 14 }, { row: 2, col: 15 }], 'right'),
      makeArrow([{ row: 1, col: 14 }, { row: 0, col: 14 }, { row: 0, col: 13 }, { row: 1, col: 13 }], 'down'),
      makeArrow([{ row: 3, col: 0 }, { row: 2, col: 0 }, { row: 1, col: 0 }], 'up'),
      makeArrow([{ row: 4, col: 4 }, { row: 4, col: 3 }, { row: 3, col: 3 }, { row: 3, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 3 }, { row: 1, col: 3 }, { row: 1, col: 4 }, { row: 1, col: 5 }, { row: 1, col: 6 }, { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }], 'down'),
      makeArrow([{ row: 2, col: 5 }, { row: 3, col: 5 }, { row: 4, col: 5 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }], 'up'),
      makeArrow([{ row: 4, col: 10 }, { row: 5, col: 10 }, { row: 5, col: 11 }, { row: 4, col: 11 }, { row: 3, col: 11 }, { row: 3, col: 10 }, { row: 3, col: 9 }, { row: 4, col: 9 }, { row: 4, col: 8 }, { row: 3, col: 8 }, { row: 2, col: 8 }, { row: 2, col: 9 }, { row: 2, col: 10 }], 'right'),
      makeArrow([{ row: 2, col: 4 }, { row: 3, col: 4 }], 'down'),
      makeArrow([{ row: 4, col: 16 }, { row: 5, col: 16 }, { row: 5, col: 15 }, { row: 4, col: 15 }, { row: 3, col: 15 }, { row: 3, col: 16 }], 'right'),
      makeArrow([{ row: 5, col: 17 }, { row: 4, col: 17 }, { row: 3, col: 17 }], 'up'),
      makeArrow([{ row: 3, col: 18 }, { row: 4, col: 18 }, { row: 5, col: 18 }, { row: 5, col: 19 }, { row: 4, col: 19 }, { row: 3, col: 19 }], 'up'),
      makeArrow([{ row: 3, col: 12 }, { row: 4, col: 12 }, { row: 5, col: 12 }, { row: 6, col: 12 }, { row: 6, col: 11 }], 'left'),
      makeArrow([{ row: 3, col: 14 }, { row: 3, col: 13 }, { row: 4, col: 13 }, { row: 4, col: 14 }, { row: 5, col: 14 }, { row: 5, col: 13 }, { row: 6, col: 13 }, { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 6, col: 10 }], 'up'),
      makeArrow([{ row: 5, col: 3 }, { row: 6, col: 3 }, { row: 7, col: 3 }, { row: 7, col: 2 }, { row: 6, col: 2 }, { row: 5, col: 2 }, { row: 4, col: 2 }], 'up'),
      makeArrow([{ row: 5, col: 0 }, { row: 6, col: 0 }, { row: 6, col: 1 }, { row: 5, col: 1 }], 'up'),
      makeArrow([{ row: 6, col: 5 }, { row: 5, col: 5 }, { row: 5, col: 4 }, { row: 6, col: 4 }, { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }, { row: 6, col: 6 }, { row: 6, col: 7 }, { row: 7, col: 7 }], 'down'),
      makeArrow([{ row: 15, col: 9 }, { row: 14, col: 9 }, { row: 13, col: 9 }, { row: 12, col: 9 }, { row: 11, col: 9 }, { row: 10, col: 9 }, { row: 9, col: 9 }, { row: 8, col: 9 }, { row: 7, col: 9 }, { row: 6, col: 9 }, { row: 5, col: 9 }, { row: 5, col: 8 }, { row: 6, col: 8 }, { row: 7, col: 8 }], 'down'),
      makeArrow([{ row: 6, col: 19 }, { row: 6, col: 18 }, { row: 6, col: 17 }], 'left'),
      makeArrow([{ row: 6, col: 16 }, { row: 6, col: 15 }, { row: 6, col: 14 }, { row: 7, col: 14 }, { row: 8, col: 14 }, { row: 9, col: 14 }, { row: 10, col: 14 }], 'down'),
      makeArrow([{ row: 9, col: 18 }, { row: 8, col: 18 }, { row: 8, col: 19 }, { row: 7, col: 19 }, { row: 7, col: 18 }], 'left'),
      makeArrow([{ row: 12, col: 0 }, { row: 13, col: 0 }, { row: 13, col: 1 }, { row: 12, col: 1 }, { row: 12, col: 2 }, { row: 11, col: 2 }, { row: 10, col: 2 }, { row: 10, col: 1 }, { row: 9, col: 1 }, { row: 9, col: 0 }, { row: 8, col: 0 }, { row: 7, col: 0 }], 'up'),
      makeArrow([{ row: 8, col: 3 }, { row: 9, col: 3 }, { row: 9, col: 2 }, { row: 8, col: 2 }, { row: 8, col: 1 }, { row: 7, col: 1 }], 'up'),
      makeArrow([{ row: 9, col: 17 }, { row: 8, col: 17 }, { row: 7, col: 17 }, { row: 7, col: 16 }, { row: 8, col: 16 }, { row: 8, col: 15 }, { row: 7, col: 15 }], 'up'),
      makeArrow([{ row: 10, col: 11 }, { row: 11, col: 11 }, { row: 12, col: 11 }, { row: 12, col: 10 }, { row: 11, col: 10 }, { row: 10, col: 10 }, { row: 9, col: 10 }, { row: 8, col: 10 }], 'up'),
      makeArrow([{ row: 8, col: 11 }, { row: 9, col: 11 }, { row: 9, col: 12 }, { row: 8, col: 12 }], 'up'),
      makeArrow([{ row: 8, col: 4 }, { row: 8, col: 5 }, { row: 9, col: 5 }, { row: 9, col: 4 }], 'left'),
      makeArrow([{ row: 8, col: 6 }, { row: 9, col: 6 }, { row: 10, col: 6 }, { row: 11, col: 6 }, { row: 11, col: 7 }, { row: 12, col: 7 }], 'down'),
      makeArrow([{ row: 10, col: 8 }, { row: 9, col: 8 }, { row: 8, col: 8 }, { row: 8, col: 7 }, { row: 9, col: 7 }, { row: 10, col: 7 }], 'down'),
      makeArrow([{ row: 8, col: 13 }, { row: 9, col: 13 }, { row: 10, col: 13 }, { row: 10, col: 12 }, { row: 11, col: 12 }, { row: 11, col: 13 }, { row: 12, col: 13 }, { row: 12, col: 12 }, { row: 13, col: 12 }, { row: 13, col: 13 }, { row: 14, col: 13 }, { row: 14, col: 12 }, { row: 15, col: 12 }, { row: 15, col: 11 }, { row: 14, col: 11 }, { row: 13, col: 11 }], 'up'),
      makeArrow([{ row: 9, col: 15 }, { row: 10, col: 15 }, { row: 11, col: 15 }, { row: 11, col: 14 }, { row: 12, col: 14 }, { row: 12, col: 15 }, { row: 13, col: 15 }, { row: 13, col: 14 }, { row: 14, col: 14 }, { row: 14, col: 15 }, { row: 15, col: 15 }, { row: 15, col: 14 }, { row: 16, col: 14 }], 'down'),
      makeArrow([{ row: 9, col: 19 }, { row: 10, col: 19 }, { row: 11, col: 19 }], 'down'),
      makeArrow([{ row: 10, col: 4 }, { row: 10, col: 5 }], 'right'),
      makeArrow([{ row: 11, col: 18 }, { row: 11, col: 17 }, { row: 12, col: 17 }, { row: 13, col: 17 }, { row: 14, col: 17 }, { row: 14, col: 16 }, { row: 13, col: 16 }, { row: 12, col: 16 }, { row: 11, col: 16 }, { row: 10, col: 16 }, { row: 10, col: 17 }, { row: 10, col: 18 }], 'right'),
      makeArrow([{ row: 10, col: 3 }, { row: 11, col: 3 }, { row: 12, col: 3 }, { row: 13, col: 3 }, { row: 13, col: 2 }], 'left'),
      makeArrow([{ row: 11, col: 1 }, { row: 11, col: 0 }], 'left'),
      makeArrow([{ row: 11, col: 5 }, { row: 11, col: 4 }, { row: 12, col: 4 }, { row: 13, col: 4 }, { row: 14, col: 4 }, { row: 14, col: 5 }, { row: 14, col: 6 }, { row: 15, col: 6 }, { row: 15, col: 5 }, { row: 15, col: 4 }], 'left'),
      makeArrow([{ row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 }], 'down'),
      makeArrow([{ row: 13, col: 19 }, { row: 14, col: 19 }, { row: 14, col: 18 }, { row: 13, col: 18 }, { row: 12, col: 18 }, { row: 12, col: 19 }], 'right'),
      makeArrow([{ row: 12, col: 6 }, { row: 12, col: 5 }, { row: 13, col: 5 }, { row: 13, col: 6 }, { row: 13, col: 7 }, { row: 14, col: 7 }, { row: 14, col: 8 }, { row: 15, col: 8 }, { row: 15, col: 7 }, { row: 16, col: 7 }, { row: 17, col: 7 }, { row: 18, col: 7 }], 'down'),
      makeArrow([{ row: 23, col: 9 }, { row: 23, col: 10 }, { row: 23, col: 11 }, { row: 22, col: 11 }, { row: 22, col: 10 }, { row: 21, col: 10 }, { row: 20, col: 10 }, { row: 19, col: 10 }, { row: 18, col: 10 }, { row: 17, col: 10 }, { row: 16, col: 10 }, { row: 15, col: 10 }, { row: 14, col: 10 }, { row: 13, col: 10 }], 'up'),
      makeArrow([{ row: 14, col: 0 }, { row: 15, col: 0 }, { row: 16, col: 0 }, { row: 16, col: 1 }, { row: 15, col: 1 }, { row: 14, col: 1 }], 'up'),
      makeArrow([{ row: 14, col: 2 }, { row: 15, col: 2 }, { row: 15, col: 3 }, { row: 14, col: 3 }], 'up'),
      makeArrow([{ row: 15, col: 13 }, { row: 16, col: 13 }, { row: 16, col: 12 }, { row: 16, col: 11 }, { row: 17, col: 11 }, { row: 17, col: 12 }], 'right'),
      makeArrow([{ row: 17, col: 17 }, { row: 17, col: 16 }, { row: 16, col: 16 }, { row: 16, col: 17 }, { row: 15, col: 17 }, { row: 15, col: 18 }, { row: 16, col: 18 }, { row: 17, col: 18 }], 'down'),
      makeArrow([{ row: 15, col: 19 }, { row: 16, col: 19 }, { row: 17, col: 19 }], 'down'),
      makeArrow([{ row: 17, col: 2 }, { row: 17, col: 3 }, { row: 16, col: 3 }, { row: 16, col: 2 }], 'left'),
      makeArrow([{ row: 17, col: 5 }, { row: 17, col: 6 }, { row: 16, col: 6 }, { row: 16, col: 5 }], 'left'),
      makeArrow([{ row: 18, col: 15 }, { row: 17, col: 15 }, { row: 16, col: 15 }], 'up'),
      makeArrow([{ row: 16, col: 4 }, { row: 17, col: 4 }, { row: 18, col: 4 }, { row: 19, col: 4 }, { row: 19, col: 5 }, { row: 18, col: 5 }, { row: 18, col: 6 }, { row: 19, col: 6 }, { row: 20, col: 6 }, { row: 20, col: 5 }], 'left'),
      makeArrow([{ row: 17, col: 8 }, { row: 16, col: 8 }, { row: 16, col: 9 }, { row: 17, col: 9 }, { row: 18, col: 9 }, { row: 18, col: 8 }], 'left'),
      makeArrow([{ row: 17, col: 1 }, { row: 18, col: 1 }, { row: 19, col: 1 }, { row: 20, col: 1 }, { row: 20, col: 0 }, { row: 19, col: 0 }, { row: 18, col: 0 }, { row: 17, col: 0 }], 'up'),
      makeArrow([{ row: 22, col: 14 }, { row: 21, col: 14 }, { row: 20, col: 14 }, { row: 19, col: 14 }, { row: 18, col: 14 }, { row: 17, col: 14 }, { row: 17, col: 13 }, { row: 18, col: 13 }, { row: 18, col: 12 }, { row: 19, col: 12 }, { row: 19, col: 13 }, { row: 20, col: 13 }, { row: 21, col: 13 }, { row: 22, col: 13 }, { row: 22, col: 12 }], 'left'),
      makeArrow([{ row: 18, col: 2 }, { row: 19, col: 2 }, { row: 19, col: 3 }, { row: 18, col: 3 }], 'up'),
      makeArrow([{ row: 18, col: 11 }, { row: 19, col: 11 }], 'down'),
      makeArrow([{ row: 22, col: 18 }, { row: 21, col: 18 }, { row: 21, col: 19 }, { row: 20, col: 19 }, { row: 19, col: 19 }, { row: 18, col: 19 }, { row: 18, col: 18 }, { row: 18, col: 17 }, { row: 18, col: 16 }, { row: 19, col: 16 }, { row: 19, col: 17 }, { row: 19, col: 18 }, { row: 20, col: 18 }, { row: 20, col: 17 }, { row: 21, col: 17 }], 'down'),
      makeArrow([{ row: 20, col: 7 }, { row: 19, col: 7 }, { row: 19, col: 8 }], 'right'),
      makeArrow([{ row: 22, col: 17 }, { row: 22, col: 16 }, { row: 22, col: 15 }, { row: 21, col: 15 }, { row: 21, col: 16 }, { row: 20, col: 16 }, { row: 20, col: 15 }, { row: 19, col: 15 }], 'up'),
      makeArrow([{ row: 19, col: 9 }, { row: 20, col: 9 }, { row: 20, col: 8 }, { row: 21, col: 8 }, { row: 21, col: 9 }, { row: 22, col: 9 }], 'down'),
      makeArrow([{ row: 21, col: 12 }, { row: 21, col: 11 }, { row: 20, col: 11 }, { row: 20, col: 12 }], 'right'),
      makeArrow([{ row: 20, col: 2 }, { row: 21, col: 2 }, { row: 21, col: 3 }], 'right'),
      makeArrow([{ row: 20, col: 3 }, { row: 20, col: 4 }, { row: 21, col: 4 }], 'down'),
      makeArrow([{ row: 23, col: 0 }, { row: 23, col: 1 }, { row: 23, col: 2 }, { row: 23, col: 3 }, { row: 23, col: 4 }, { row: 22, col: 4 }, { row: 22, col: 3 }, { row: 22, col: 2 }, { row: 22, col: 1 }, { row: 21, col: 1 }, { row: 21, col: 0 }], 'left'),
      makeArrow([{ row: 21, col: 5 }, { row: 21, col: 6 }, { row: 21, col: 7 }], 'right'),
      makeArrow([{ row: 22, col: 7 }, { row: 22, col: 6 }, { row: 22, col: 5 }, { row: 23, col: 5 }, { row: 23, col: 6 }, { row: 23, col: 7 }], 'right'),
      makeArrow([{ row: 22, col: 8 }, { row: 23, col: 8 }], 'down'),
      makeArrow([{ row: 23, col: 12 }, { row: 23, col: 13 }, { row: 23, col: 14 }, { row: 23, col: 15 }, { row: 23, col: 16 }, { row: 23, col: 17 }, { row: 23, col: 18 }, { row: 23, col: 19 }], 'right'),
    ];
  })(),
};

const level15: LevelData = {
  id: 15,
  gridRows: 15,
  gridCols: 15,
  par: 30,
  difficulty: 9,
  arrows: (() => {
    arrowIdCounter = 1500;
    return [
      makeArrow([{ row: 1, col: 2 }, { row: 2, col: 2 }, { row: 2, col: 0 }, { row: 0, col: 0 }], 'up'),
      makeArrow([{ row: 8, col: 6 }, { row: 4, col: 6 }, { row: 4, col: 8 }, { row: 0, col: 8 }], 'up'),
      makeArrow([{ row: 0, col: 10 }, { row: 0, col: 9 }], 'left'),
      makeArrow([{ row: 0, col: 11 }, { row: 0, col: 12 }], 'right'),
      makeArrow([{ row: 0, col: 2 }, { row: 0, col: 1 }, { row: 1, col: 1 }], 'down'),
      makeArrow([{ row: 1, col: 7 }, { row: 1, col: 4 }], 'left'),
      makeArrow([{ row: 4, col: 9 }, { row: 1, col: 9 }, { row: 1, col: 10 }], 'right'),
      makeArrow([{ row: 1, col: 11 }, { row: 4, col: 11 }, { row: 4, col: 12 }, { row: 1, col: 12 }], 'up'),
      makeArrow([{ row: 0, col: 7 }, { row: 0, col: 3 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 2, col: 4 }, { row: 2, col: 7 }], 'right'),
      makeArrow([{ row: 3, col: 7 }, { row: 3, col: 5 }, { row: 4, col: 5 }], 'down'),
      makeArrow([{ row: 2, col: 10 }, { row: 4, col: 10 }], 'down'),
      makeArrow([{ row: 1, col: 13 }, { row: 4, col: 13 }], 'down'),
      makeArrow([{ row: 5, col: 13 }, { row: 5, col: 11 }, { row: 7, col: 11 }, { row: 7, col: 10 }, { row: 5, col: 10 }, { row: 5, col: 8 }], 'left'),
      makeArrow([{ row: 6, col: 1 }, { row: 4, col: 1 }, { row: 4, col: 0 }, { row: 6, col: 0 }], 'down'),
      makeArrow([{ row: 10, col: 2 }, { row: 10, col: 4 }, { row: 6, col: 4 }], 'up'),
      makeArrow([{ row: 8, col: 10 }, { row: 8, col: 9 }, { row: 7, col: 9 }, { row: 7, col: 7 }, { row: 6, col: 7 }, { row: 6, col: 9 }], 'right'),
      makeArrow([{ row: 8, col: 11 }, { row: 8, col: 12 }, { row: 6, col: 12 }], 'up'),
      makeArrow([{ row: 8, col: 5 }, { row: 5, col: 5 }, { row: 5, col: 3 }, { row: 9, col: 3 }, { row: 9, col: 2 }, { row: 8, col: 2 }], 'up'),
      makeArrow([{ row: 11, col: 3 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 10, col: 5 }, { row: 9, col: 5 }, { row: 9, col: 8 }, { row: 8, col: 8 }, { row: 8, col: 7 }], 'left'),
      makeArrow([{ row: 12, col: 4 }, { row: 12, col: 7 }, { row: 10, col: 7 }, { row: 10, col: 9 }, { row: 9, col: 9 }, { row: 9, col: 10 }], 'right'),
      makeArrow([{ row: 6, col: 13 }, { row: 10, col: 13 }], 'down'),
      makeArrow([{ row: 3, col: 0 }, { row: 3, col: 2 }, { row: 7, col: 2 }, { row: 7, col: 1 }, { row: 11, col: 1 }], 'down'),
      makeArrow([{ row: 12, col: 9 }, { row: 12, col: 11 }, { row: 11, col: 11 }, { row: 11, col: 13 }], 'right'),
      makeArrow([{ row: 7, col: 0 }, { row: 12, col: 0 }, { row: 12, col: 1 }], 'right'),
      makeArrow([{ row: 9, col: 11 }, { row: 9, col: 12 }, { row: 10, col: 12 }, { row: 10, col: 10 }, { row: 11, col: 10 }, { row: 11, col: 8 }, { row: 12, col: 8 }], 'down'),
      makeArrow([{ row: 0, col: 13 }, { row: 0, col: 14 }, { row: 14, col: 14 }, { row: 14, col: 2 }, { row: 13, col: 2 }, { row: 13, col: 0 }], 'left'),
      makeArrow([{ row: 11, col: 2 }, { row: 12, col: 2 }, { row: 12, col: 3 }, { row: 13, col: 3 }], 'down'),
      makeArrow([{ row: 13, col: 4 }, { row: 13, col: 9 }], 'right'),
      makeArrow([{ row: 13, col: 10 }, { row: 13, col: 12 }, { row: 12, col: 12 }, { row: 12, col: 13 }, { row: 13, col: 13 }], 'down'),
      makeArrow([{ row: 14, col: 0 }, { row: 14, col: 1 }], 'right'),
    ];
  })(),
};

const level16: LevelData = {
  ...level15,
  id: 16,
  par: 55,
  difficulty: 10,
};

const level17: LevelData = {
  ...level15,
  id: 17,
  par: 30,
  difficulty: 9,
};

const level18: LevelData = {
  id: 18,
  gridRows: 24,
  gridCols: 17,
  par: 63,
  difficulty: 10,
  arrows: [], // Handled by custom component Level18.tsx
};

const level19: LevelData = {
  id: 19,
  gridRows: 27,
  gridCols: 20,
  par: 68,
  difficulty: 10,
  arrows: [], // Handled by custom component Level19.tsx
};

const level20: LevelData = {
  id: 20,
  gridRows: 30,
  gridCols: 22,
  par: 71,
  difficulty: 10,
  arrows: [], // Handled by custom component Level20.tsx
};

const level21: LevelData = {
  id: 21,
  gridRows: 28,
  gridCols: 27,
  par: 100,
  difficulty: 10,
  arrows: [], // Handled by custom component Level21.tsx
};

const level22: LevelData = {
  id: 22,
  gridRows: 35,
  gridCols: 27,
  par: 102,
  difficulty: 10,
  arrows: [], // Handled by custom component Level22.tsx
};

const level23: LevelData = {
  id: 23,
  gridRows: 22,
  gridCols: 20,
  par: 74,
  difficulty: 10,
  arrows: [], // Handled by custom component Level23.tsx
};

const level24: LevelData = {
  id: 24,
  gridRows: 18,
  gridCols: 17,
  par: 37,
  difficulty: 10,
  arrows: [], // Handled by custom component Level24.tsx
};

const level25: LevelData = {
  id: 25,
  gridRows: 25,
  gridCols: 18,
  par: 44,
  difficulty: 10,
  arrows: [], // Handled by custom component Level25.tsx
};

const level26: LevelData = {
  id: 26,
  gridRows: 33,
  gridCols: 27,
  par: 75,
  difficulty: 10,
  arrows: [], // Handled by custom component Level26.tsx
};

const level27: LevelData = {
  id: 27,
  gridRows: 19,
  gridCols: 17,
  par: 62,
  difficulty: 10,
  arrows: [], // Handled by custom component Level27.tsx
};

const level28: LevelData = {
  id: 28,
  gridRows: 22,
  gridCols: 16,
  par: 35,
  difficulty: 10,
  arrows: [], // Handled by custom component Level28.tsx
};

const level29: LevelData = {
  id: 29,
  gridRows: 27,
  gridCols: 21,
  par: 88,
  difficulty: 10,
  arrows: [], // Handled by custom component Level29.tsx
};

const level30: LevelData = {
  id: 30,
  gridRows: 41,
  gridCols: 35,
  par: 63,
  difficulty: 10,
  arrows: [], // Handled by custom component Level30.tsx
};

const level31: LevelData = {
  id: 31,
  gridRows: 33,
  gridCols: 25,
  par: 74,
  difficulty: 10,
  arrows: [], // Handled by custom component Level31.tsx
};

const level32: LevelData = {
  id: 32,
  gridRows: 51,
  gridCols: 44,
  par: 141,
  difficulty: 10,
  arrows: [], // Handled by custom component Level32.tsx
};

const level33: LevelData = {
  id: 33,
  gridRows: 47,
  gridCols: 39,
  par: 47,
  difficulty: 10,
  arrows: [], // Handled by custom component Level33.tsx
};

const level34: LevelData = {
  id: 34,
  gridRows: 30,
  gridCols: 26,
  par: 50,
  difficulty: 10,
  arrows: [], // Handled by custom component Level34.tsx
};

const level35: LevelData = {
  id: 35,
  gridRows: 41,
  gridCols: 35,
  par: 59,
  difficulty: 10,
  arrows: [], // Handled by custom component Level35.tsx
};

const level36: LevelData = {
  id: 36,
  gridRows: 33,
  gridCols: 28,
  par: 68,
  difficulty: 10,
  arrows: [], // Handled by custom component Level36.tsx
};

const level37: LevelData = {
  id: 37,
  gridRows: 32,
  gridCols: 31,
  par: 61,
  difficulty: 10,
  arrows: [], // Handled by custom component Level37.tsx
};

const level38: LevelData = {
  id: 38,
  gridRows: 35,
  gridCols: 37,
  par: 64,
  difficulty: 10,
  arrows: [], // Handled by custom component Level38.tsx
};

const level39: LevelData = {
  id: 39,
  gridRows: 37,
  gridCols: 35,
  par: 60,
  difficulty: 10,
  arrows: [], // Handled by custom component Level39.tsx
};

const level40: LevelData = {
  id: 40,
  gridRows: 41,
  gridCols: 35,
  par: 70,
  difficulty: 10,
  arrows: [], // Handled by custom component Level40.tsx
};

const level41: LevelData = {
  id: 41,
  gridRows: 32,
  gridCols: 32,
  par: 43,
  difficulty: 10,
  arrows: [], // Handled by custom component Level41.tsx
};

const level42: LevelData = {
  id: 42,
  gridRows: 22,
  gridCols: 18,
  par: 36,
  difficulty: 10,
  arrows: [], // Handled by custom component Level42.tsx
};

const level43: LevelData = {
  id: 43,
  gridRows: 41,
  gridCols: 34,
  par: 67,
  difficulty: 10,
  arrows: [], // Handled by custom component Level43.tsx
};

const level44: LevelData = {
  id: 44,
  gridRows: 50,
  gridCols: 35,
  par: 46,
  difficulty: 10,
  arrows: [], // Handled by custom component Level44.tsx
};

const level45: LevelData = {
  id: 45,
  gridRows: 53,
  gridCols: 50,
  par: 164,
  difficulty: 10,
  arrows: [], // Handled by custom component Level45.tsx
};

const level46: LevelData = {
  id: 46,
  gridRows: 40,
  gridCols: 40,
  par: 76,
  difficulty: 10,
  arrows: [], // Handled by custom component Level46.tsx
};

const level47: LevelData = {
  id: 47,
  gridRows: 32,
  gridCols: 39,
  par: 52,
  difficulty: 10,
  arrows: [], // Handled by custom component Level47.tsx
};

const level48: LevelData = {
  id: 48,
  gridRows: 30,
  gridCols: 32,
  par: 41,
  difficulty: 10,
  arrows: [], // Handled by custom component Level48.tsx
};

const level49: LevelData = {
  id: 49,
  gridRows: 33,
  gridCols: 31,
  par: 41,
  difficulty: 10,
  arrows: [], // Handled by custom component Level49.tsx
};

const level50: LevelData = {
  id: 50,
  gridRows: 38,
  gridCols: 32,
  par: 91,
  difficulty: 10,
  arrows: [], // Handled by custom component Level50.tsx
};

const level51: LevelData = {
  id: 51,
  gridRows: 32,
  gridCols: 27,
  par: 42,
  difficulty: 10,
  arrows: [], // Handled by custom component Level51.tsx
};

const level52: LevelData = {
  id: 52,
  gridRows: 29,
  gridCols: 27,
  par: 40,
  difficulty: 10,
  arrows: [], // Handled by custom component Level52.tsx
};

const level53: LevelData = {
  id: 53,
  gridRows: 47,
  gridCols: 47,
  par: 107,
  difficulty: 10,
  arrows: [], // Handled by custom component Level53.tsx
};

const level54: LevelData = {
  id: 54,
  gridRows: 48,
  gridCols: 47,
  par: 61,
  difficulty: 10,
  arrows: [], // Handled by custom component Level54.tsx
};

const level55: LevelData = {
  id: 55,
  gridRows: 52,
  gridCols: 31,
  par: 42,
  difficulty: 10,
  arrows: [], // Handled by custom component Level55.tsx
};

export const ALL_LEVELS: LevelData[] = [
  level1,
  level2,
  level3,
  level4,
  level5,
  level6,
  level7,
  level8,
  level9,
  level10,
  level11,
  level12,
  level13,
  level14,
  level15,
  level16,
  level17,
  level18,
  level19,
  level20,
  level21,
  level22,
  level23,
  level24,
  level25,
  level26,
  level27,
  level28,
  level29,
  level30,
  level31,
  level32,
  level33,
  level34,
  level35,
  level36,
  level37,
  level38,
  level39,
  level40,
  level41,
  level42,
  level43,
  level44,
  level45,
  level46,
  level47,
  level48,
  level49,
  level50,
  level51,
  level52,
  level53,
  level54,
  level55,
];

export function getLevelById(id: number): LevelData | undefined {
  return ALL_LEVELS.find((l) => l.id === id);
}

export function getTotalLevels(): number {
  return ALL_LEVELS.length;
}

// ─── Level Generator ───

function generateRandomLevel(
  id: number,
  gridSize: number,
  arrowCount: number,
  difficulty: number
): LevelData | null {
  const arrows: Arrow[] = [];
  const occupied = new Set<string>();
  const directions: ('up' | 'down' | 'left' | 'right')[] = ['up', 'down', 'left', 'right'];

  for (let i = 0; i < arrowCount; i++) {
    const dir = directions[Math.floor(Math.random() * 4)];
    const len = Math.floor(Math.random() * 3) + 2; // 2-4 segments
    let placed = false;

    for (let attempt = 0; attempt < 50; attempt++) {
      const startRow = Math.floor(Math.random() * (gridSize - len));
      const startCol = Math.floor(Math.random() * (gridSize - len));

      const segments: { row: number; col: number }[] = [];
      let valid = true;

      for (let s = 0; s < len; s++) {
        let r = startRow;
        let c = startCol;

        if (dir === 'down') r += s;
        else if (dir === 'up') r = startRow + len - 1 - s;
        else if (dir === 'right') c += s;
        else if (dir === 'left') c = startCol + len - 1 - s;

        if (r < 0 || r >= gridSize || c < 0 || c >= gridSize) { valid = false; break; }
        if (occupied.has(`${r},${c}`)) { valid = false; break; }

        segments.push({ row: r, col: c });
      }

      if (valid && segments.length === len) {
        segments.forEach((s) => occupied.add(`${s.row},${s.col}`));
        arrows.push({
          id: `gen-${id}-${i}`,
          segments,
          direction: dir,
        });
        placed = true;
        break;
      }
    }

    if (!placed) return null;
  }

  const level: LevelData = {
    id,
    gridRows: gridSize,
    gridCols: gridSize,
    arrows,
    par: arrowCount,
    difficulty,
  };

  // Validate solvability
  const solution = solveLevel(level);
  if (!solution) return null;

  return level;
}

export function generateLevel(id: number, difficulty: number): LevelData {
  const gridSize = Math.min(6 + Math.floor(difficulty / 2), 12);
  const arrowCount = Math.min(3 + difficulty, 10);

  for (let attempt = 0; attempt < 100; attempt++) {
    const level = generateRandomLevel(id, gridSize, arrowCount, difficulty);
    if (level) return level;
  }

  // Fallback: return a simple solvable level
  arrowIdCounter = id * 100;
  return {
    id,
    gridRows: 7,
    gridCols: 7,
    par: 3,
    difficulty: 1,
    arrows: [
      makeArrow([{ row: 2, col: 2 }, { row: 3, col: 2 }, { row: 4, col: 2 }], 'down'),
      makeArrow([{ row: 2, col: 4 }, { row: 3, col: 4 }, { row: 4, col: 4 }], 'down'),
      makeArrow([{ row: 2, col: 6 }, { row: 3, col: 6 }, { row: 4, col: 6 }], 'down'),
    ],
  };
}
