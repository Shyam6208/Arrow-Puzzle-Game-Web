// ─── Direction ───
export type Direction = 'up' | 'down' | 'left' | 'right';

// ─── Grid position ───
export interface Position {
  row: number;
  col: number;
}

// ─── Arrow segment (each cell the arrow occupies) ───
export interface ArrowSegment {
  row: number;
  col: number;
}

// ─── Arrow definition ───
export interface Arrow {
  id: string;
  /** The cells this arrow occupies (body + head). Last segment is the head. */
  segments: ArrowSegment[];
  /** Direction the arrowhead points — determines exit direction */
  direction: Direction;
  /** Color override (optional, defaults to theme arrow color) */
  color?: string;
}

// ─── Arrow runtime state ───
export type ArrowState = 'idle' | 'moving' | 'blocked' | 'removed';

export interface ArrowRuntime {
  arrow: Arrow;
  state: ArrowState;
  collided?: boolean;
}

// ─── Level definition ───
export interface LevelData {
  id: number;
  /** Grid dimensions */
  gridRows: number;
  gridCols: number;
  /** Arrows placed on the board */
  arrows: Arrow[];
  /** Maximum number of moves for 3 stars */
  par: number;
  /** Difficulty rating 1-10 */
  difficulty: number;
}

// ─── Level progress (saved state) ───
export interface LevelProgress {
  levelId: number;
  completed: boolean;
  stars: number; // 0-3
  bestMoves: number;
}

// ─── Game state ───
export interface GameState {
  levelId: number;
  arrows: ArrowRuntime[];
  moves: number;
  lives: number;
  maxLives: number;
  isComplete: boolean;
  isFailed: boolean;
}

// ─── Player profile ───
export interface PlayerProfile {
  coins: number;
  currentLevel: number;
  levelProgress: Record<number, LevelProgress>;
  settings: GameSettings;
}

// ─── Settings ───
export interface GameSettings {
  soundEnabled: boolean;
  hapticsEnabled: boolean;
  showGrid: boolean;
}

// ─── Screen type ───
export type ScreenType = 'home' | 'levels' | 'game' | 'settings';

// ─── Modal type ───
export type ModalType =
  | 'none'
  | 'pause'
  | 'win'
  | 'lose'
  | 'leave-confirm'
  | 'coin-shop'
  | 'how-to-play'
  | 'reset-confirm'
  | 'leaderboard';
