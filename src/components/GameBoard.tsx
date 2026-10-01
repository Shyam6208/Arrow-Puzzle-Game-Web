import { useRef, useState, useEffect, useMemo, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { getLevelById } from '../game/levels';
import ArrowComponent from './Arrow';

export default function GameBoard() {
  const { state, dispatch } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [cellSize, setCellSize] = useState(80);
  const [showTapGrid, setShowTapGrid] = useState(false);
  const tapGridTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const game = state.game;
  const level = game ? getLevelById(game.levelId) : null;
  const gridRows = level?.gridRows ?? 8;
  const gridCols = level?.gridCols ?? 6;

  useEffect(() => {
    function updateSize() {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const maxCellW = (rect.width - 32) / gridCols;
      const maxCellH = (rect.height - 32) / gridRows;
      const size = Math.floor(Math.min(maxCellW, maxCellH, 100));
      setCellSize(size);
    }
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [gridRows, gridCols]);

  const occupiedCells = useMemo(() => {
    const set = new Set<string>();
    if (!game) return set;
    for (const ar of game.arrows) {
      if (ar.state === 'removed') continue;
      for (const seg of ar.arrow.segments) {
        set.add(`${seg.row},${seg.col}`);
      }
    }
    return set;
  }, [game]);

  const handleTap = useCallback((id: string) => {
    dispatch({ type: 'TAP_ARROW', arrowId: id });
    setShowTapGrid(true);
    if (tapGridTimer.current) clearTimeout(tapGridTimer.current);
    tapGridTimer.current = setTimeout(() => setShowTapGrid(false), 500);
  }, [dispatch]);

  if (!game || !level) return null;

  const boardWidth = cellSize * gridCols;
  const boardHeight = cellSize * gridRows;
  const showGrid = state.player.settings.showGrid || showTapGrid;

  return (
    <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-hidden">
      <div className="relative" style={{ width: boardWidth, height: boardHeight }}>

        {/* Dots for empty cells */}
        {Array.from({ length: gridRows }, (_, row) =>
          Array.from({ length: gridCols }, (_, col) => {
            if (occupiedCells.has(`${row},${col}`)) return null;
            const cx = col * cellSize + cellSize / 2;
            const cy = row * cellSize + cellSize / 2;
            return (
              <div
                key={`dot-${row}-${col}`}
                className="absolute rounded-full"
                style={{ width: 10, height: 10, background: '#c8d3e0', left: cx - 5, top: cy - 5 }}
              />
            );
          })
        )}

        {/* Grid lines — flash on tap, always on if setting enabled */}
        {showGrid && (
          <svg
            className="absolute inset-0 pointer-events-none"
            style={{
              width: boardWidth,
              height: boardHeight,
              transition: 'opacity 0.3s',
              opacity: showTapGrid && !state.player.settings.showGrid ? 0.55 : 1,
            }}
          >
            {Array.from({ length: gridCols + 1 }, (_, i) => (
              <line key={`v-${i}`} x1={i * cellSize} y1={0} x2={i * cellSize} y2={boardHeight} stroke="#94a3b8" strokeWidth={1} opacity={0.5} />
            ))}
            {Array.from({ length: gridRows + 1 }, (_, i) => (
              <line key={`h-${i}`} x1={0} y1={i * cellSize} x2={boardWidth} y2={i * cellSize} stroke="#94a3b8" strokeWidth={1} opacity={0.5} />
            ))}
          </svg>
        )}

        {/* Arrows */}
        {game.arrows.map((ar) => (
          <ArrowComponent
            key={ar.arrow.id}
            arrow={ar.arrow}
            state={ar.state}
            cellSize={cellSize}
            gridRows={gridRows}
            gridCols={gridCols}
            onTap={handleTap}
            onMoved={(id) => dispatch({ type: 'ARROW_MOVED', arrowId: id })}
            onShakeDone={(id) => dispatch({ type: 'ARROW_SHAKE_DONE', arrowId: id })}
          />
        ))}
      </div>
    </div>
  );
}
