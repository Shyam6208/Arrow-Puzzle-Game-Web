import { useEffect } from 'react';
import { ChevronLeft, Settings, Lightbulb, Grid3x3 } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import GameBoard from './GameBoard';
import ZoomControls from './ZoomControls';
import { LEVEL_COMPONENTS } from '../levels';

export default function GameScreen() {
  const { state, dispatch, findHintArrow, showRewardedAd } = useStore();
  const game = state.game;
  const {
    zoomLevel,
    panOffset,
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

  // Reset zoom & pan when level changes
  useEffect(() => {
    resetZoom();
  }, [game?.levelId, resetZoom]);

  useEffect(() => {
    const onUseHint = () => {
      const hintId = findHintArrow();
      if (hintId) {
        dispatch({ type: 'TAP_ARROW', arrowId: hintId });
      }
    };
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [findHintArrow, dispatch]);

  if (!game) return null;

  // Render custom level from src/levels if defined
  const CustomLevel = LEVEL_COMPONENTS[game.levelId];
  if (CustomLevel) {
    return <CustomLevel />;
  }

  const remainingArrows = game.arrows.filter((a) => a.state !== 'removed').length;

  const handleHint = () => {
    const hintId = findHintArrow();
    if (!hintId) return;

    showRewardedAd({
      rewardType: 'hint',
      title: 'Free In-Game Hint',
      rewardDescription: 'Reveals Next Solvable Arrow',
      onReward: () => {
        dispatch({ type: 'TAP_ARROW', arrowId: hintId });
      },
    });
  };

  const handleBack = () => {
    if (game.moves > 0) {
      dispatch({ type: 'SET_MODAL', modal: 'leave-confirm' });
    } else {
      dispatch({ type: 'SET_SCREEN', screen: 'levels' });
    }
  };

  const openSettings = () => {
    dispatch({ type: 'SET_MODAL', modal: 'pause' });
  };

  const renderHeart = (active: boolean, key: number) => (
    <svg
      key={key}
      viewBox="0 0 24 24"
      className="w-6 h-6 transition-all duration-300"
      style={{ fill: active ? 'var(--heart)' : 'var(--gray)', opacity: active ? 1 : 0.4 }}
    >
      <path d="M12 21s-7.5-4.9-10-9.2C.4 8.9 1.7 5.4 4.9 4.4c2-.6 4.1.1 5.4 1.8L12 8l1.7-1.8c1.3-1.7 3.4-2.4 5.4-1.8 3.2 1 4.5 4.5 2.9 7.4C19.5 16.1 12 21 12 21z" />
    </svg>
  );

  return (
    <div className="landing-page-stage">
      <div className="lvl-standard-app">
        {/* Topbar */}
        <div className="shrink-0 pt-3 pb-2 px-4 border-b border-[var(--line)]">
          <div className="flex items-center justify-between">
            <button
              onClick={handleBack}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            >
              <ChevronLeft size={24} strokeWidth={2.5} className="text-[var(--navy)]" />
            </button>
            <h1 className="text-xl font-black text-[var(--navy)] tracking-wide">
              Level {game.levelId}
            </h1>
            <button
              onClick={openSettings}
              className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-black/5 active:scale-95 transition-all cursor-pointer"
            >
              <Settings size={22} className="text-[var(--navy-soft)]" />
            </button>
          </div>

          {/* Stats Bar */}
          <div className="flex items-center justify-between mt-2 px-2">
            {/* Moves Remaining */}
            <div className="flex items-center gap-1.5 text-sm font-extrabold text-[var(--navy-soft)]">
              <span>Moves:</span>
              <span className="text-[var(--indigo)] font-black text-base">{game.moves}</span>
              <span className="text-xs text-gray-400">({remainingArrows} left)</span>
            </div>

            {/* Lives */}
            <div className="flex items-center gap-1">
              {[0, 1, 2].map((i) => renderHeart(i < game.hearts, i))}
            </div>

            {/* Coins */}
            <button
              onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
              className="flex items-center gap-1.5 text-sm font-extrabold text-[var(--navy-soft)] hover:opacity-80 active:scale-95 cursor-pointer bg-white/60 px-2 py-0.5 rounded-full"
              aria-label="Coin Shop"
            >
              <span>🪙</span>
              <span>{state.player.coins}</span>
            </button>
          </div>
        </div>

        {/* Main Board Content for grid levels */}
        <GameBoard
          boardRef={boardRef}
          boardStyle={boardStyle}
          isPanMode={isPanMode}
        />

        {/* Bottom Bar for grid levels */}
        <div className="flex items-center justify-center gap-3 pb-6 pt-2 z-10">
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

          {/* Divider */}
          <div className="w-px h-8 bg-[var(--line)] mx-1" />

          {/* Hint */}
          <button
            onClick={handleHint}
            className="relative w-14 h-14 rounded-full bg-white shadow-md flex items-center justify-center hover:shadow-lg transition-all active:scale-95 cursor-pointer"
          >
            <Lightbulb size={24} className="text-[var(--indigo)]" />
            <span className="absolute -top-1 -right-1 bg-[var(--indigo)] text-white text-[9px] font-black px-1.5 py-0.5 rounded-full">
              AD
            </span>
          </button>

          {/* Grid Toggle */}
          <button
            onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showGrid' })}
            className={`w-14 h-14 rounded-full flex items-center justify-center transition-all active:scale-95 shadow-md cursor-pointer ${
              state.player.settings.showGrid
                ? 'bg-white ring-2 ring-[var(--indigo)]'
                : 'bg-white/80'
            }`}
            aria-label="Toggle Grid"
          >
            <Grid3x3
              size={24}
              className={state.player.settings.showGrid ? 'text-[var(--indigo)]' : 'text-[var(--navy-soft)]'}
            />
          </button>
        </div>
      </div>
    </div>
  );
}
