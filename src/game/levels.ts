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
    makeArrow([{ row: 1, col: 3 }, { row: 2, col: 3 }, { row: 3, col: 3 }], 'down'),
    makeArrow([{ row: 3, col: 1 }, { row: 3, col: 2 }, { row: 3, col: 3 }], 'right'),
    makeArrow([{ row: 5, col: 3 }, { row: 4, col: 3 }, { row: 3, col: 3 }], 'up'),
    makeArrow([{ row: 3, col: 5 }, { row: 3, col: 4 }, { row: 3, col: 3 }], 'left'),
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
  gridRows: 9,
  gridCols: 9,
  par: 8,
  difficulty: 6,
  arrows: [
    makeArrow([{ row: 0, col: 4 }, { row: 1, col: 4 }, { row: 2, col: 4 }], 'down'),
    makeArrow([{ row: 2, col: 2 }, { row: 2, col: 3 }, { row: 2, col: 4 }], 'right'),
    makeArrow([{ row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }], 'up'),
    makeArrow([{ row: 4, col: 2 }, { row: 4, col: 3 }, { row: 4, col: 4 }, { row: 4, col: 5 }, { row: 4, col: 6 }], 'right'),
    makeArrow([{ row: 6, col: 4 }, { row: 5, col: 4 }], 'up'),
    makeArrow([{ row: 6, col: 6 }, { row: 6, col: 5 }, { row: 6, col: 4 }], 'left'),
    makeArrow([{ row: 6, col: 2 }, { row: 7, col: 2 }, { row: 8, col: 2 }], 'down'),
    makeArrow([{ row: 8, col: 3 }, { row: 8, col: 4 }, { row: 8, col: 5 }], 'right'),
  ],
};

const level10: LevelData = {
  id: 10,
  gridRows: 10,
  gridCols: 10,
  par: 9,
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
