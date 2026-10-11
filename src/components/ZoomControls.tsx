/**
 * Interactive Zoom & Pan Controls for Arrow Puzzle.
 * Provides touch-friendly controls:
 * - ✋ Pan/Move Mode toggle: Allows dragging anywhere (even over arrows) without triggering them.
 * - 🎯 Center/Reset: Resets both zoom and pan position to center.
 * - Zoom In (+) and Zoom Out (-) buttons.
 * - Displays active zoom percentage.
 */

interface ZoomControlsProps {
  zoomLevel: number;
  onZoomIn: () => void;
  onZoomOut: () => void;
  onReset: () => void;
  canZoomIn: boolean;
  canZoomOut: boolean;
  isPanMode?: boolean;
  onTogglePanMode?: () => void;
  isPanned?: boolean;
}

export default function ZoomControls({
  zoomLevel,
  onZoomIn,
  onZoomOut,
  onReset,
  canZoomIn,
  canZoomOut,
  isPanMode = false,
  onTogglePanMode,
  isPanned = false,
}: ZoomControlsProps) {
  const isDefault = zoomLevel === 1 && !isPanned;

  return (
    <div className="zoom-floating-wrapper">
      <div className={`zoom-floating-controls ${isPanMode ? 'zoom-pan-mode-active' : ''}`}>
        {/* Pan / Move Mode Toggle Button */}
        {onTogglePanMode && (
          <button
            type="button"
            className={`zoom-float-btn zoom-pan-toggle ${isPanMode ? 'active' : ''}`}
            onClick={onTogglePanMode}
            aria-label={isPanMode ? 'Switch to Play Mode' : 'Switch to Move Board Mode'}
            title={isPanMode ? 'Move mode active (Tap to return to play)' : 'Tap to drag board anywhere'}
          >
            {isPanMode ? (
              <span className="zoom-hand-icon">✋</span>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="5 9 2 12 5 15" />
                <polyline points="9 5 12 2 15 5" />
                <polyline points="15 19 12 22 9 19" />
                <polyline points="19 9 22 12 19 15" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <line x1="12" y1="2" x2="12" y2="22" />
              </svg>
            )}
          </button>
        )}

        {/* Zoom Out Button */}
        <button
          type="button"
          className={`zoom-float-btn ${!canZoomOut ? 'zoom-ctrl-disabled' : ''}`}
          onClick={onZoomOut}
          disabled={!canZoomOut}
          aria-label="Zoom Out"
          title="Zoom out"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>

        {/* Reset / Zoom Indicator Button */}
        <button
          type="button"
          className={`zoom-float-indicator ${isDefault ? 'zoom-indicator-default' : 'zoom-indicator-active'}`}
          onClick={onReset}
          aria-label="Reset Zoom and Pan"
          title="Tap to reset zoom and center board"
        >
          {!isDefault && <span className="zoom-recenter-icon">🎯</span>}
          <span>{Math.round(zoomLevel * 100)}%</span>
        </button>

        {/* Zoom In Button */}
        <button
          type="button"
          className={`zoom-float-btn ${!canZoomIn ? 'zoom-ctrl-disabled' : ''}`}
          onClick={onZoomIn}
          disabled={!canZoomIn}
          aria-label="Zoom In"
          title="Zoom in"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Helper pill tooltip when in pan mode or zoomed */}
      {isPanMode && (
        <div className="zoom-pan-badge">
          ✋ Move Mode: Drag board anywhere to reposition
        </div>
      )}
    </div>
  );
}
