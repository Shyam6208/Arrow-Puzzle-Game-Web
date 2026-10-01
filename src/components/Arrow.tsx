
import { motion } from 'framer-motion';
import type { Arrow as ArrowType, ArrowState, Direction } from '../types';
import { COLORS } from '../utils/constants';

interface ArrowProps {
  arrow: ArrowType;
  state: ArrowState;
  cellSize: number;
  gridRows: number;
  gridCols: number;
  onTap: (id: string) => void;
  onMoved: (id: string) => void;
  onShakeDone: (id: string) => void;
  isHinted?: boolean;
}

const DIR_ANGLE: Record<Direction, number> = {
  right: 0,
  down: 90,
  left: 180,
  up: 270,
};

const DIR_VECTORS: Record<Direction, { dx: number; dy: number }> = {
  right: { dx: 1,  dy: 0  },
  left:  { dx: -1, dy: 0  },
  down:  { dx: 0,  dy: 1  },
  up:    { dx: 0,  dy: -1 },
};

export default function ArrowComponent({
  arrow,
  state,
  cellSize,
  gridRows,
  gridCols,
  onTap,
  onMoved,
  onShakeDone,
  isHinted,
}: ArrowProps) {
  if (state === 'removed') return null;

  const segments = arrow.segments;
  if (!segments || segments.length === 0) return null;

  const isMoving  = state === 'moving';
  const isBlocked = state === 'blocked';

  const strokeW = Math.max(cellSize * 0.22, 6);
  const color   = isBlocked ? COLORS.arrowBlocked : COLORS.arrow;

  // Center points of each segment
  const pts = segments.map((s) => ({
    x: s.col * cellSize + cellSize / 2,
    y: s.row * cellSize + cellSize / 2,
  }));

  const head = pts[pts.length - 1];
  const v    = DIR_VECTORS[arrow.direction];

  // Body path (just through segment centers)
  let bodyD = `M ${pts[0].x} ${pts[0].y}`;
  for (let i = 1; i < pts.length; i++) {
    bodyD += ` L ${pts[i].x} ${pts[i].y}`;
  }

  // Exit path for slide-out animation
  const exitDist = (Math.max(gridRows, gridCols) + 4) * cellSize + 300;
  const exitPt   = { x: head.x + v.dx * exitDist, y: head.y + v.dy * exitDist };
  const fullD    = bodyD + ` L ${exitPt.x} ${exitPt.y}`;

  // Ratios for pathLength/pathOffset animation
  const bodyLen   = Math.max((segments.length - 1) * cellSize, 1);
  const totalLen  = bodyLen + exitDist;
  const bodyRatio = bodyLen / totalLen;

  // Arrowhead geometry
  const headSize = cellSize * 0.38;
  const angle    = DIR_ANGLE[arrow.direction];
  // Tip slightly beyond the last segment center
  const tipX = head.x + v.dx * (cellSize * 0.18);
  const tipY = head.y + v.dy * (cellSize * 0.18);

  const boardW = gridCols * cellSize;
  const boardH = gridRows * cellSize;

  return (
    <div
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: isMoving ? 50 : 10 }}
    >
      {/* Clickable hit areas per cell */}
      {!isMoving &&
        segments.map((seg, idx) => (
          <div
            key={`${arrow.id}-hit-${idx}`}
            onClick={(e) => {
              e.stopPropagation();
              if (state === 'idle') onTap(arrow.id);
            }}
            className="absolute cursor-pointer pointer-events-auto"
            style={{
              top:    seg.row * cellSize,
              left:   seg.col * cellSize,
              width:  cellSize,
              height: cellSize,
              touchAction: 'none',
            }}
          />
        ))}

      <svg
        className="absolute pointer-events-none overflow-visible"
        style={{ top: 0, left: 0, width: boardW, height: boardH }}
      >
        {/* Hint glow */}
        {isHinted && state === 'idle' && (
          <motion.path
            d={bodyD}
            fill="none"
            stroke="rgba(34,137,242,0.35)"
            strokeWidth={strokeW + 8}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{ opacity: [0.3, 0.9, 0.3] }}
            transition={{ duration: 1.2, repeat: Infinity }}
          />
        )}

        {/* ── Body ── */}
        {isMoving ? (
          <motion.path
            d={fullD}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            initial={{ pathLength: bodyRatio, pathOffset: 0 }}
            animate={{ pathOffset: 1, pathLength: bodyRatio }}
            transition={{ duration: 0.55, ease: 'easeIn' }}
            onAnimationComplete={() => onMoved(arrow.id)}
          />
        ) : isBlocked ? (
          <motion.path
            d={bodyD}
            fill="none"
            stroke={COLORS.arrowBlocked}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
            animate={{
              x: [0, v.dx * cellSize * 0.1, -v.dx * cellSize * 0.08, 0],
              y: [0, v.dy * cellSize * 0.1, -v.dy * cellSize * 0.08, 0],
            }}
            transition={{ duration: 0.38, ease: 'easeInOut' }}
            onAnimationComplete={() => onShakeDone(arrow.id)}
          />
        ) : (
          <path
            d={bodyD}
            fill="none"
            stroke={color}
            strokeWidth={strokeW}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        )}

        {/* ── Arrowhead ── */}
        {isMoving ? (
          <motion.g
            initial={{ translateX: tipX, translateY: tipY }}
            animate={{ translateX: exitPt.x, translateY: exitPt.y }}
            transition={{ duration: 0.55, ease: 'easeIn' }}
          >
            <ArrowheadPoly size={headSize} angle={angle} color={color} />
          </motion.g>
        ) : isBlocked ? (
          <motion.g
            animate={{
              x: [0, v.dx * cellSize * 0.1, -v.dx * cellSize * 0.08, 0],
              y: [0, v.dy * cellSize * 0.1, -v.dy * cellSize * 0.08, 0],
            }}
            transition={{ duration: 0.38, ease: 'easeInOut' }}
          >
            <ArrowheadPoly
              size={headSize}
              angle={angle}
              color={COLORS.arrowBlocked}
              cx={tipX}
              cy={tipY}
            />
          </motion.g>
        ) : (
          <ArrowheadPoly size={headSize} angle={angle} color={color} cx={tipX} cy={tipY} />
        )}
      </svg>
    </div>
  );
}

// Solid triangle arrowhead — points right by default, rotated by `angle`
function ArrowheadPoly({
  size,
  angle,
  color,
  cx = 0,
  cy = 0,
}: {
  size: number;
  angle: number;
  color: string;
  cx?: number;
  cy?: number;
}) {
  const hw  = size * 0.52;  // half-base width
  const len = size * 1.0;   // triangle length
  // Points: tip at (len, 0), base corners at (0, ±hw)
  const pts = `${len},0 0,${-hw} 0,${hw}`;
  return (
    <g transform={`translate(${cx}, ${cy}) rotate(${angle})`}>
      <polygon points={pts} fill={color} />
    </g>
  );
}
