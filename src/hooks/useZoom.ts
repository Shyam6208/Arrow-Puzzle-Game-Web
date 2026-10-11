import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export const ZOOM_MIN = 0.7;
export const ZOOM_MAX = 2.6;
export const ZOOM_STEP = 0.2;

export interface PanOffset {
  x: number;
  y: number;
}

export function useZoom(initialZoom = 1) {
  const [zoomLevel, setZoomLevel] = useState(initialZoom);
  const [panOffset, setPanOffset] = useState<PanOffset>({ x: 0, y: 0 });
  const [isPanMode, setIsPanMode] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const boardRef = useRef<HTMLDivElement>(null);

  // Keep latest state in refs for use in event listeners
  const zoomRef = useRef(zoomLevel);
  zoomRef.current = zoomLevel;

  const panRef = useRef(panOffset);
  panRef.current = panOffset;

  const isPanModeRef = useRef(isPanMode);
  isPanModeRef.current = isPanMode;

  const isDraggingRef = useRef(isDragging);
  isDraggingRef.current = isDragging;

  // Zoom action functions
  const zoomIn = useCallback(() => {
    setZoomLevel((prev) => Math.min(ZOOM_MAX, +(prev + ZOOM_STEP).toFixed(2)));
  }, []);

  const zoomOut = useCallback(() => {
    setZoomLevel((prev) => Math.max(ZOOM_MIN, +(prev - ZOOM_STEP).toFixed(2)));
  }, []);

  const resetZoom = useCallback(() => {
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
  }, []);

  const togglePanMode = useCallback(() => {
    setIsPanMode((prev) => !prev);
  }, []);

  // Clamp pan based on current zoom level so the board doesn't get lost
  const clampPan = useCallback((x: number, y: number, zoom: number): PanOffset => {
    const maxPanX = Math.max(160, (zoom - 0.4) * 360);
    const maxPanY = Math.max(180, (zoom - 0.4) * 440);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, Math.round(x))),
      y: Math.max(-maxPanY, Math.min(maxPanY, Math.round(y))),
    };
  }, []);

  // Multi-touch gestures (Pinch-to-zoom + 2-finger Pan) & 1-finger pan & Mouse interactions
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    // Track active touch points
    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchStartCenter = { x: 0, y: 0 };
    let touchStartPan = { x: 0, y: 0 };
    let singleTouchStart = { x: 0, y: 0 };
    let isSingleTouchPanning = false;

    // Track mouse dragging
    let mouseStart = { x: 0, y: 0 };
    let mouseStartPan = { x: 0, y: 0 };
    let isMouseDragging = false;

    const getDistance = (t0: Touch, t1: Touch) => {
      const dx = t0.clientX - t1.clientX;
      const dy = t0.clientY - t1.clientY;
      return Math.hypot(dx, dy);
    };

    const getCenter = (t0: Touch, t1: Touch) => {
      return {
        x: (t0.clientX + t1.clientX) / 2,
        y: (t0.clientY + t1.clientY) / 2,
      };
    };

    const isInteractiveElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      // Check if target is an arrow, button, or clickable element
      return !!target.closest(
        'button, a, input, select, textarea, [role="button"], [class*="arrow"], polyline, polygon, path.head, .lvl1-arrow, .lvl1-circle, .lvl2-round'
      );
    };

    // --- Touch Handlers ---
    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        // Multi-touch: 2 fingers -> Pinch to zoom + Pan simultaneously
        e.preventDefault();
        touchStartDist = getDistance(e.touches[0], e.touches[1]);
        touchStartZoom = zoomRef.current;
        touchStartCenter = getCenter(e.touches[0], e.touches[1]);
        touchStartPan = { ...panRef.current };
        isSingleTouchPanning = false;
        setIsDragging(true);
      } else if (e.touches.length === 1) {
        // Single touch: Check if in Pan Mode or touching background
        const target = e.target;
        const isInteractive = isInteractiveElement(target);

        if (isPanModeRef.current || !isInteractive) {
          // If in pan mode, or if touching empty space, initiate drag/pan
          singleTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
          touchStartPan = { ...panRef.current };
          isSingleTouchPanning = true;
          // Don't preventDefault immediately if not in pan mode so short taps still work
          if (isPanModeRef.current) {
            e.preventDefault();
            setIsDragging(true);
          }
        }
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && touchStartDist > 0) {
        // 2-finger pinch & drag
        e.preventDefault();
        const currentDist = getDistance(e.touches[0], e.touches[1]);
        const currentCenter = getCenter(e.touches[0], e.touches[1]);

        const scale = currentDist / touchStartDist;
        const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(touchStartZoom * scale).toFixed(2)));

        const centerDeltaX = currentCenter.x - touchStartCenter.x;
        const centerDeltaY = currentCenter.y - touchStartCenter.y;

        const newPan = clampPan(touchStartPan.x + centerDeltaX, touchStartPan.y + centerDeltaY, newZoom);

        setZoomLevel(newZoom);
        setPanOffset(newPan);
      } else if (e.touches.length === 1 && isSingleTouchPanning) {
        const dx = e.touches[0].clientX - singleTouchStart.x;
        const dy = e.touches[0].clientY - singleTouchStart.y;

        // If moved more than 6px, treat as intentional pan
        if (Math.hypot(dx, dy) > 6 || isPanModeRef.current) {
          e.preventDefault();
          setIsDragging(true);
          const newPan = clampPan(touchStartPan.x + dx, touchStartPan.y + dy, zoomRef.current);
          setPanOffset(newPan);
        }
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length === 0) {
        touchStartDist = 0;
        isSingleTouchPanning = false;
        setIsDragging(false);
      } else if (e.touches.length === 1) {
        // Transitioned from 2 fingers to 1 finger
        singleTouchStart = { x: e.touches[0].clientX, y: e.touches[0].clientY };
        touchStartPan = { ...panRef.current };
        isSingleTouchPanning = isPanModeRef.current;
        setIsDragging(false);
      }
    };

    // --- PC Mouse Wheel Handler ---
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      const zoomDelta = e.deltaY < 0 ? ZOOM_STEP : -ZOOM_STEP;
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(zoomRef.current + zoomDelta).toFixed(2)));
      setZoomLevel(newZoom);
    };

    // --- PC Mouse Drag Handlers ---
    const onMouseDown = (e: MouseEvent) => {
      // Middle click (button 1) OR Left click in Pan Mode OR Left click on non-interactive background
      const isMiddle = e.button === 1;
      const isLeft = e.button === 0;
      const isInteractive = isInteractiveElement(e.target);

      if (isMiddle || (isLeft && (isPanModeRef.current || !isInteractive))) {
        e.preventDefault();
        isMouseDragging = true;
        mouseStart = { x: e.clientX, y: e.clientY };
        mouseStartPan = { ...panRef.current };
        setIsDragging(true);
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!isMouseDragging) return;
      e.preventDefault();
      const dx = e.clientX - mouseStart.x;
      const dy = e.clientY - mouseStart.y;
      const newPan = clampPan(mouseStartPan.x + dx, mouseStartPan.y + dy, zoomRef.current);
      setPanOffset(newPan);
    };

    const onMouseUp = () => {
      if (isMouseDragging) {
        isMouseDragging = false;
        setIsDragging(false);
      }
    };

    // --- Double click to reset ---
    const onDblClick = (e: MouseEvent) => {
      if (!isInteractiveElement(e.target)) {
        resetZoom();
      }
    };

    // Attach listeners
    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    el.addEventListener('touchcancel', onTouchEnd);
    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('mousedown', onMouseDown);
    el.addEventListener('dblclick', onDblClick);
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('mousedown', onMouseDown);
      el.removeEventListener('dblclick', onDblClick);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    };
  }, [clampPan, resetZoom]);

  const isZoomed = zoomLevel !== 1;
  const isPanned = panOffset.x !== 0 || panOffset.y !== 0;
  const canZoomIn = zoomLevel < ZOOM_MAX;
  const canZoomOut = zoomLevel > ZOOM_MIN;

  // Pre-calculated CSS style object for the board wrap div
  const boardStyle = useMemo<React.CSSProperties>(() => {
    return {
      transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
      transformOrigin: 'center center',
      transition: isDragging ? 'none' : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
      cursor: isPanMode ? (isDragging ? 'grabbing' : 'grab') : 'default',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    };
  }, [panOffset.x, panOffset.y, zoomLevel, isDragging, isPanMode]);

  return {
    zoomLevel,
    setZoomLevel,
    panOffset,
    setPanOffset,
    isPanMode,
    setIsPanMode,
    togglePanMode,
    isDragging,
    zoomIn,
    zoomOut,
    resetZoom,
    isZoomed,
    isPanned,
    canZoomIn,
    canZoomOut,
    boardRef,
    boardStyle,
    ZOOM_MIN,
    ZOOM_MAX,
  };
}
