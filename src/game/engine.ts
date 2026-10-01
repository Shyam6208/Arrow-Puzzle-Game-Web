import type { Arrow, ArrowRuntime, GameState, LevelData } from '../types';

/**
 * Check if an arrow's exit path is clear of other arrows.
 * The exit path goes from the arrowhead in the arrow's direction to the board edge.
 */
export function isPathClear(
  arrow: Arrow,
  allArrows: ArrowRuntime[],
  gridRows: number,
  gridCols: number
): boolean {
  const head = arrow.segments[arrow.segments.length - 1];
  const exitCells = getExitPath(head, arrow.direction, gridRows, gridCols);

  // Get all occupied cells by other active arrows
  const occupiedCells = new Set<string>();
  for (const ar of allArrows) {
    if (ar.arrow.id === arrow.id) continue;
    if (ar.state === 'removed' || ar.state === 'moving') continue;
    for (const seg of ar.arrow.segments) {
      occupiedCells.add(`${seg.row},${seg.col}`);
    }
  }

  // Check if any exit cell is occupied
  for (const cell of exitCells) {
    if (occupiedCells.has(`${cell.row},${cell.col}`)) {
      return false;
    }
  }

  return true;
}

/**
 * Get the exit path cells from a position in a direction to the board edge.
 */
function getExitPath(
  head: { row: number; col: number },
  direction: Direction,
  gridRows: number,
  gridCols: number
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  let r = head.row;
  let c = head.col;

  const dr = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;
  const dc = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;

  // Move one step past the head in the direction
  r += dr;
  c += dc;

  while (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
    cells.push({ row: r, col: c });
    r += dr;
    c += dc;
  }

  return cells;
}

/**
 * Get the translation offset for slide-out animation.
 * Returns how far the arrow should move to exit the board.
 */
export function getSlideOffset(
  arrow: Arrow,
  gridRows: number,
  gridCols: number,
  cellSize: number
): { x: number; y: number; dist: number } {
  const head = arrow.segments[arrow.segments.length - 1];
  
  // Calculate a generic safe exit distance that will clear any board
  const exitDist = (Math.max(gridRows, gridCols) + arrow.segments.length + 2) * cellSize;

  switch (arrow.direction) {
    case 'up':
      return { x: 0, y: -exitDist, dist: exitDist };
    case 'down':
      return { x: 0, y: exitDist, dist: exitDist };
    case 'left':
      return { x: -exitDist, y: 0, dist: exitDist };
    case 'right':
      return { x: exitDist, y: 0, dist: exitDist };
    default:
      return { x: 0, y: 0, dist: 0 };
  }
}

/**
 * Initialize game state from level data.
 */
export function createGameState(level: LevelData): GameState {
  return {
    levelId: level.id,
    arrows: level.arrows.map((a) => ({ arrow: a, state: 'idle' as const })),
    moves: 0,
    lives: 3,
    maxLives: 3,
    isComplete: false,
    isFailed: false,
  };
}

/**
 * Calculate stars earned based on moves vs par.
 */
export function calculateStars(moves: number, par: number): number {
  if (moves <= par) return 3;
  if (moves <= par + 2) return 2;
  return 1;
}

/**
 * Solve a level - BFS/DFS to find if all arrows can be removed.
 * Returns the solution order (arrow IDs) or null if unsolvable.
 */
export function solveLevel(level: LevelData): string[] | null {
  const initialState = level.arrows.map((a) => a.id);

  function canRemove(
    arrowId: string,
    remainingIds: string[]
  ): boolean {
    const arrow = level.arrows.find((a) => a.id === arrowId)!;
    const remaining = remainingIds
      .filter((id) => id !== arrowId)
      .map((id) => level.arrows.find((a) => a.id === id)!);

    const head = arrow.segments[arrow.segments.length - 1];
    const exitCells = getExitPathForSolver(head, arrow.direction, level.gridRows, level.gridCols);

    const occupiedCells = new Set<string>();
    for (const a of remaining) {
      for (const seg of a.segments) {
        occupiedCells.add(`${seg.row},${seg.col}`);
      }
    }

    for (const cell of exitCells) {
      if (occupiedCells.has(`${cell.row},${cell.col}`)) {
        return false;
      }
    }

    return true;
  }

  function solve(remainingIds: string[], order: string[]): string[] | null {
    if (remainingIds.length === 0) return order;

    for (const id of remainingIds) {
      if (canRemove(id, remainingIds)) {
        const newRemaining = remainingIds.filter((rid) => rid !== id);
        const result = solve(newRemaining, [...order, id]);
        if (result) return result;
      }
    }

    return null;
  }

  return solve(initialState, []);
}

function getExitPathForSolver(
  head: { row: number; col: number },
  direction: Direction,
  gridRows: number,
  gridCols: number
): { row: number; col: number }[] {
  const cells: { row: number; col: number }[] = [];
  let r = head.row;
  let c = head.col;

  const dr = direction === 'down' ? 1 : direction === 'up' ? -1 : 0;
  const dc = direction === 'right' ? 1 : direction === 'left' ? -1 : 0;

  r += dr;
  c += dc;

  while (r >= 0 && r < gridRows && c >= 0 && c < gridCols) {
    cells.push({ row: r, col: c });
    r += dr;
    c += dc;
  }

  return cells;
}
