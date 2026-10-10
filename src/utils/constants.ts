// ─── Design Constants ───
// Centralized visual constants for easy tuning

export const COLORS = {
  primary: '#2289f2',
  primaryDark: '#1a6fd4',
  primaryLight: '#4da3f7',

  bgMain: '#edf2f7',
  bgCard: '#ffffff',
  bgLocked: '#e2e8f0',

  arrow: '#1e293b',
  arrowBlocked: '#ef4444',
  gridLine: '#cbd5e1',

  heart: '#f43f5e',
  heartEmpty: '#fda4af',

  star: '#f59e0b',
  starEmpty: '#d1d5db',

  coin: '#eab308',
  coinBg: '#fef3c7',

  textPrimary: '#0f172a',
  textSecondary: '#64748b',
  textMuted: '#94a3b8',
  textWhite: '#ffffff',

  darkCard: '#1e293b',
  darkCardBorder: '#334155',

  border: '#e2e8f0',
} as const;

export const SIZES = {
  // App container
  maxWidth: 430,
  maxHeight: 932,

  // Arrow rendering
  arrowStrokeWidth: 8,
  arrowHeadSize: 14,
  arrowCornerRadius: 6,

  // Grid
  cellGap: 2,

  // Cards
  cardBorderRadius: 16,
  modalBorderRadius: 24,
  buttonBorderRadius: 9999, // pill

  // Level card
  levelCardSize: 72,
} as const;

export const ANIMATION = {
  // Arrow slide-out duration
  arrowSlideMs: 350,
  // Arrow blocked shake duration
  arrowShakeMs: 400,
  // Screen transition
  screenTransitionMs: 300,
  // Modal entrance
  modalEnterMs: 300,
  // Star pop delay between stars
  starStaggerMs: 200,
} as const;

export const GAME = {
  maxLives: 3,
  coinsPerLevel: 5,
  coinsForHint: 10,
  coinsForExtraLife: 20,
  coinsForSkip: 50,
  coinsForUndo: 15,
  totalLevels: 31,
  // Stars calculation:
  // 3 stars = within par moves
  // 2 stars = par + 1 or 2 extra
  // 1 star = completed at all
  starThresholds: {
    three: 0,   // <= par
    two: 2,     // par + 2
  },
} as const;
