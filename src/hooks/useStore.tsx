import React, { createContext, useContext, useReducer, useCallback } from 'react';
import type { GameState, PlayerProfile, LevelProgress, ScreenType, ModalType, GameSettings } from '../types';
import { createGameState, isPathClear, calculateStars } from '../game/engine';
import { getLevelById, getTotalLevels } from '../game/levels';
import { GAME } from '../utils/constants';

// ─── Store State ───
interface StoreState {
  screen: ScreenType;
  modal: ModalType;
  game: GameState | null;
  player: PlayerProfile;
}

const defaultSettings: GameSettings = {
  soundEnabled: true,
  hapticsEnabled: true,
  showGrid: false,
};

const defaultPlayer: PlayerProfile = {
  coins: 80,
  currentLevel: 3,
  levelProgress: {
    1: { levelId: 1, completed: true, stars: 3, bestMoves: 3 },
    2: { levelId: 2, completed: true, stars: 3, bestMoves: 5 },
  },
  settings: defaultSettings,
};

function loadPlayer(): PlayerProfile {
  try {
    const saved = localStorage.getItem('arrow-puzzle-player');
    if (saved) {
      const parsed = JSON.parse(saved);
      return { ...defaultPlayer, ...parsed, settings: { ...defaultSettings, ...parsed.settings } };
    }
  } catch { /* ignore */ }
  return defaultPlayer;
}

function savePlayer(player: PlayerProfile) {
  localStorage.setItem('arrow-puzzle-player', JSON.stringify(player));
}

// ─── Actions ───
type Action =
  | { type: 'SET_SCREEN'; screen: ScreenType }
  | { type: 'SET_MODAL'; modal: ModalType }
  | { type: 'START_LEVEL'; levelId: number }
  | { type: 'TAP_ARROW'; arrowId: string }
  | { type: 'ARROW_MOVED'; arrowId: string }
  | { type: 'ARROW_SHAKE_DONE'; arrowId: string }
  | { type: 'RESTART_LEVEL' }
  | { type: 'COMPLETE_LEVEL' }
  | { type: 'NEXT_LEVEL' }
  | { type: 'TOGGLE_SETTING'; key: keyof GameSettings }
  | { type: 'USE_HINT' }
  | { type: 'ADD_COINS'; amount: number }
  | { type: 'COMPLETE_LEVEL_DIRECT'; levelId: number; moves: number; stars: number };

function reducer(state: StoreState, action: Action): StoreState {
  switch (action.type) {
    case 'SET_SCREEN':
      return { ...state, screen: action.screen, modal: 'none' };

    case 'SET_MODAL':
      return { ...state, modal: action.modal };

    case 'START_LEVEL': {
      const level = getLevelById(action.levelId);
      if (!level) return state;
      return {
        ...state,
        screen: 'game',
        modal: 'none',
        game: createGameState(level),
      };
    }

    case 'TAP_ARROW': {
      if (!state.game || state.game.isComplete || state.game.isFailed) return state;
      const arrowRuntime = state.game.arrows.find((a) => a.arrow.id === action.arrowId);
      if (!arrowRuntime || arrowRuntime.state !== 'idle') return state;

      const level = getLevelById(state.game.levelId);
      if (!level) return state;

      const clear = isPathClear(arrowRuntime.arrow, state.game.arrows, level.gridRows, level.gridCols);

      if (clear) {
        // Arrow can move - mark as moving
        const newArrows = state.game.arrows.map((a) =>
          a.arrow.id === action.arrowId ? { ...a, state: 'moving' as const } : a
        );
        return {
          ...state,
          game: {
            ...state.game,
            arrows: newArrows,
            moves: state.game.moves + 1,
          },
        };
      } else {
        // Arrow is blocked - collides and bounces back
        // Exactly ONE heart is lost — but only on the FIRST collision per arrow
        const alreadyCollided = arrowRuntime.collided;
        const newLives = alreadyCollided ? state.game.lives : Math.max(0, state.game.lives - 1);
        const newArrows = state.game.arrows.map((a) =>
          a.arrow.id === action.arrowId
            ? { ...a, state: 'blocked' as const, collided: true }
            : a
        );
        return {
          ...state,
          game: {
            ...state.game,
            arrows: newArrows,
            lives: newLives,
            moves: state.game.moves + 1,
            isFailed: newLives <= 0,
          },
        };
      }
    }

    case 'ARROW_MOVED': {
      if (!state.game) return state;
      const newArrows = state.game.arrows.map((a) =>
        a.arrow.id === action.arrowId ? { ...a, state: 'removed' as const } : a
      );
      const remaining = newArrows.filter((a) => a.state !== 'removed');
      const isComplete = remaining.length === 0;

      const newGame = {
        ...state.game,
        arrows: newArrows,
        isComplete,
      };

      if (isComplete) {
        const level = getLevelById(state.game.levelId);
        const stars = level ? calculateStars(state.game.moves, level.par) : 1;
        const progress: LevelProgress = {
          levelId: state.game.levelId,
          completed: true,
          stars,
          bestMoves: state.game.moves,
        };

        const existing = state.player.levelProgress[state.game.levelId];
        const finalProgress = existing && existing.stars > stars ? existing : progress;

        const newCurrentLevel = Math.max(state.player.currentLevel, state.game.levelId + 1);

        const newPlayer = {
          ...state.player,
          coins: state.player.coins + GAME.coinsPerLevel,
          currentLevel: Math.min(newCurrentLevel, getTotalLevels()),
          levelProgress: {
            ...state.player.levelProgress,
            [state.game.levelId]: finalProgress,
          },
        };
        savePlayer(newPlayer);

        return {
          ...state,
          game: newGame,
          player: newPlayer,
          modal: 'win',
        };
      }

      return { ...state, game: newGame };
    }

    case 'ARROW_SHAKE_DONE': {
      if (!state.game) return state;
      const newArrows = state.game.arrows.map((a) =>
        a.arrow.id === action.arrowId && a.state === 'blocked' ? { ...a, state: 'idle' as const } : a
      );

      if (state.game.isFailed) {
        return {
          ...state,
          game: { ...state.game, arrows: newArrows },
          modal: 'lose',
        };
      }

      return { ...state, game: { ...state.game, arrows: newArrows } };
    }

    case 'RESTART_LEVEL': {
      if (!state.game) return state;
      const level = getLevelById(state.game.levelId);
      if (!level) return state;
      return {
        ...state,
        modal: 'none',
        game: createGameState(level),
      };
    }

    case 'COMPLETE_LEVEL':
      return state;

    case 'COMPLETE_LEVEL_DIRECT': {
      const levelId = action.levelId;
      const stars = action.stars;
      const progress: LevelProgress = {
        levelId,
        completed: true,
        stars,
        bestMoves: action.moves,
      };

      const existing = state.player.levelProgress[levelId];
      const finalProgress = existing && existing.stars > stars ? existing : progress;
      const newCurrentLevel = Math.max(state.player.currentLevel, levelId + 1);

      const newPlayer = {
        ...state.player,
        coins: state.player.coins + GAME.coinsPerLevel,
        currentLevel: Math.min(newCurrentLevel, getTotalLevels()),
        levelProgress: {
          ...state.player.levelProgress,
          [levelId]: finalProgress,
        },
      };
      savePlayer(newPlayer);

      const level = getLevelById(levelId);
      const newGame = level ? createGameState(level) : state.game;

      return {
        ...state,
        game: newGame,
        player: newPlayer,
        modal: 'none',
      };
    }

    case 'NEXT_LEVEL': {
      const currentLevelId = state.game ? state.game.levelId : state.player.currentLevel;
      const nextId = currentLevelId + 1;
      const nextLevel = getLevelById(nextId);
      if (!nextLevel) {
        return { ...state, screen: 'levels', modal: 'none', game: null };
      }
      return {
        ...state,
        screen: 'game',
        modal: 'none',
        game: createGameState(nextLevel),
      };
    }

    case 'TOGGLE_SETTING': {
      const newSettings = {
        ...state.player.settings,
        [action.key]: !state.player.settings[action.key],
      };
      const newPlayer = { ...state.player, settings: newSettings };
      savePlayer(newPlayer);
      return { ...state, player: newPlayer };
    }

    case 'USE_HINT': {
      if (state.player.coins < GAME.coinsForHint) return state;
      // Hint: find a moveable arrow and highlight it
      // Deduct coins
      const newPlayer = {
        ...state.player,
        coins: state.player.coins - GAME.coinsForHint,
      };
      savePlayer(newPlayer);
      return { ...state, player: newPlayer };
    }

    case 'ADD_COINS': {
      const newPlayer = {
        ...state.player,
        coins: state.player.coins + action.amount,
      };
      savePlayer(newPlayer);
      return { ...state, player: newPlayer };
    }

    default:
      return state;
  }
}

// ─── Context ───
interface StoreContextType {
  state: StoreState;
  dispatch: React.Dispatch<Action>;
  findHintArrow: () => string | null;
}

const StoreContext = createContext<StoreContextType | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(reducer, {
    screen: 'home',
    modal: 'none',
    game: null,
    player: loadPlayer(),
  });

  const findHintArrow = useCallback((): string | null => {
    if (!state.game) return null;
    const level = getLevelById(state.game.levelId);
    if (!level) return null;

    for (const ar of state.game.arrows) {
      if (ar.state !== 'idle') continue;
      if (isPathClear(ar.arrow, state.game.arrows, level.gridRows, level.gridCols)) {
        return ar.arrow.id;
      }
    }
    return null;
  }, [state.game]);

  return (
    <StoreContext.Provider value={{ state, dispatch, findHintArrow }}>
      {children}
    </StoreContext.Provider>
  );
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
