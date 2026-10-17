import { useState, useCallback, useRef, useEffect, useMemo } from 'react';

export const ZOOM_MIN = 0.55;
export const ZOOM_MAX = 3.2;
export const ZOOM_STEP = 0.16;

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
    const maxPanX = Math.max(320, (zoom - 0.2) * 550);
    const maxPanY = Math.max(380, (zoom - 0.2) * 650);
    return {
      x: Math.max(-maxPanX, Math.min(maxPanX, Math.round(x))),
      y: Math.max(-maxPanY, Math.min(maxPanY, Math.round(y))),
    };
  }, []);

  // Multi-touch gestures (Pinch-to-zoom + 2-finger Pan) & PC Mouse interactions (Wheel zoom, drag & double-tap hold to pan)
  useEffect(() => {
    const el = boardRef.current;
    if (!el) return;

    // Track active touch points (multi-touch pinch)
    let touchStartDist = 0;
    let touchStartZoom = 1;
    let touchStartCenter = { x: 0, y: 0 };
    let touchStartPan = { x: 0, y: 0 };

    // Multi-touch flags to guarantee arrows NEVER trigger when 2 fingers / hands are used
    let wasMultiTouch = false;
    let lastMultiTouchEndTime = 0;
    const activePointers = new Map<number, { clientX: number; clientY: number }>();

    // Track pointer state (mouse & touch)
    let isPointerDragging = false;
    let dragCandidate = false;
    let potentialArrowTarget: Element | null = null;
    let downPos = { x: 0, y: 0 };
    let mouseStartPan = { x: 0, y: 0 };

    // Double-tap tracking for PC double-click & hold to drag
    let lastTapUpTime = 0;
    let lastTapDownPos = { x: 0, y: 0 };
    let pendingTapTimer: ReturnType<typeof setTimeout> | null = null;
    let pendingTapTarget: Element | null = null;
    let pendingTapPos = { x: 0, y: 0 };

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

    const isArrowElement = (target: EventTarget | null): boolean => {
      if (!target || !(target instanceof Element)) return false;
      return !!target.closest(
        '[class*="arrow"], polyline, polygon, path.head, path[class*="-head"], .lvl1-arrow, .lvl1-col, [class*="-head"], [class*="-pathline"]'
      );
    };

    const flushPendingTap = () => {
      if (pendingTapTimer) {
        clearTimeout(pendingTapTimer);
        pendingTapTimer = null;
      }
      if (pendingTapTarget) {
        const target = pendingTapTarget;
        const pos = pendingTapPos;
        pendingTapTarget = null;
        try {
          const tapEvt = new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            clientX: pos.x,
            clientY: pos.y,
            pointerType: 'mouse',
          });
          (tapEvt as unknown as { _isVerifiedTap: boolean })._isVerifiedTap = true;
          target.dispatchEvent(tapEvt);
        } catch {
          // ignore error if element unmounted
        }
      }
    };

    const cancelPendingTap = () => {
      if (pendingTapTimer) {
        clearTimeout(pendingTapTimer);
        pendingTapTimer = null;
      }
      pendingTapTarget = null;
      dragCandidate = false;
      potentialArrowTarget = null;
    };

    // --- Pointer Events (Mouse + Touch) in Capture Phase ---
    const onPointerDownCapture = (e: PointerEvent) => {
      // If synthetic verified tap from our tap timer, let it reach the arrow!
      if ((e as unknown as { _isVerifiedTap?: boolean })._isVerifiedTap) {
        return;
      }

      activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      // If 2 or more pointers are active: MULTI-TOUCH / PINCH MODE!
      if (activePointers.size >= 2) {
        wasMultiTouch = true;
        lastMultiTouchEndTime = performance.now();
        cancelPendingTap();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // If recent multi-touch pinch ended less than 400ms ago, ignore stray single finger taps
      const now = performance.now();
      if (now - lastMultiTouchEndTime < 400) {
        wasMultiTouch = true;
        cancelPendingTap();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        return;
      }

      // Middle click (1) or Right click (2): always pan immediately!
      if (e.button === 1 || e.button === 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        cancelPendingTap();
        isPointerDragging = true;
        downPos = { x: e.clientX, y: e.clientY };
        mouseStartPan = { ...panRef.current };
        setIsDragging(true);
        document.body.classList.add('is-board-dragging');
        return;
      }

      if (e.button !== 0) return; // ignore other buttons

      const distFromLastTap = Math.hypot(e.clientX - lastTapDownPos.x, e.clientY - lastTapDownPos.y);
      const timeSinceLastTap = now - lastTapUpTime;

      // Double-click / double-tap detection: 2nd tap within 360ms and within 35px
      const isDoubleTap = e.pointerType === 'mouse' && timeSinceLastTap < 360 && distFromLastTap < 35;

      if (isDoubleTap) {
        // Double-tap & hold detected! Cancel 1st tap so arrow NEVER triggers!
        cancelPendingTap();
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        isPointerDragging = true;
        downPos = { x: e.clientX, y: e.clientY };
        mouseStartPan = { ...panRef.current };
        setIsDragging(true);
        document.body.classList.add('is-board-dragging');
        return;
      }

      // If user tapped a different area while another tap was pending, flush previous tap immediately
      if (pendingTapTarget) {
        flushPendingTap();
      }

      const targetEl = e.target instanceof Element ? e.target : null;
      const isArrow = isArrowElement(targetEl);

      if (!isArrow || isPanModeRef.current) {
        // Clicked on empty board background / grid / dots or in Pan Mode
        e.preventDefault();
        isPointerDragging = true;
        downPos = { x: e.clientX, y: e.clientY };
        mouseStartPan = { ...panRef.current };
        setIsDragging(true);
        document.body.classList.add('is-board-dragging');
      } else {
        // Clicked on an arrow! Intercept in capture phase so arrow doesn't fire prematurely on pointerdown
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        dragCandidate = true;
        potentialArrowTarget = targetEl?.closest('[class*="arrow"], .lvl1-arrow') || targetEl;
        downPos = { x: e.clientX, y: e.clientY };
        mouseStartPan = { ...panRef.current };
      }
    };

    const onPointerMoveCapture = (e: PointerEvent) => {
      activePointers.set(e.pointerId, { clientX: e.clientX, clientY: e.clientY });

      // If multi-touch, ensure no arrow tap candidate is active
      if (activePointers.size >= 2 || wasMultiTouch) {
        cancelPendingTap();
        return;
      }

      if (isPointerDragging) {
        e.preventDefault();
        const dx = e.clientX - downPos.x;
        const dy = e.clientY - downPos.y;
        const newPan = clampPan(mouseStartPan.x + dx, mouseStartPan.y + dy, zoomRef.current);
        setPanOffset(newPan);
        return;
      }

      if (dragCandidate) {
        const dist = Math.hypot(e.clientX - downPos.x, e.clientY - downPos.y);
        if (dist > 7) {
          // Moved more than 7px! This is a DRAG gesture, not an arrow tap!
          dragCandidate = false;
          potentialArrowTarget = null;
          isPointerDragging = true;
          setIsDragging(true);
          document.body.classList.add('is-board-dragging');

          const dx = e.clientX - downPos.x;
          const dy = e.clientY - downPos.y;
          const newPan = clampPan(mouseStartPan.x + dx, mouseStartPan.y + dy, zoomRef.current);
          setPanOffset(newPan);
        }
      }
    };

    const onPointerUpCapture = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);

      if ((e as unknown as { _isVerifiedTap?: boolean })._isVerifiedTap) return;

      const now = performance.now();
      const isMultiTouchRecent = wasMultiTouch || (now - lastMultiTouchEndTime < 400);

      if (isMultiTouchRecent) {
        // Was pinching/multi-touch! NEVER tap arrows from lifting fingers
        cancelPendingTap();
        if (activePointers.size === 0) {
          wasMultiTouch = false;
          isPointerDragging = false;
          setIsDragging(false);
          document.body.classList.remove('is-board-dragging');
        }
        return;
      }

      if (isPointerDragging) {
        isPointerDragging = false;
        setIsDragging(false);
        document.body.classList.remove('is-board-dragging');
        lastTapUpTime = 0; // Prevent drag release from counting as a double-tap
        return;
      }

      if (dragCandidate) {
        dragCandidate = false;
        const targetToTap = potentialArrowTarget;
        potentialArrowTarget = null;

        if (targetToTap) {
          lastTapUpTime = now;
          lastTapDownPos = { ...downPos };
          pendingTapTarget = targetToTap;
          pendingTapPos = { x: e.clientX, y: e.clientY };

          // On mobile touch: very quick 40ms dispatch for crisp responsiveness
          // On PC mouse: 180ms delay to allow double-tap hold to drag without triggering arrow
          const tapDelay = e.pointerType === 'touch' ? 40 : 180;
          pendingTapTimer = setTimeout(() => {
            flushPendingTap();
          }, tapDelay);
        }
      }
    };

    const onPointerCancelCapture = (e: PointerEvent) => {
      activePointers.delete(e.pointerId);
      cancelPendingTap();
      isPointerDragging = false;
      setIsDragging(false);
      document.body.classList.remove('is-board-dragging');
    };

    // --- PC Mouse Wheel Handler (Zoom centered on cursor) ---
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      e.stopPropagation();
      cancelPendingTap();

      const rect = el.getBoundingClientRect();
      const mouseX = e.clientX - rect.left - rect.width / 2;
      const mouseY = e.clientY - rect.top - rect.height / 2;

      const currentZoom = zoomRef.current;
      const zoomFactor = e.deltaY < 0 ? 1.15 : 0.87;
      const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(currentZoom * zoomFactor).toFixed(2)));

      if (newZoom !== currentZoom) {
        const scaleChange = newZoom / currentZoom;
        const newPanX = panRef.current.x - (mouseX - panRef.current.x) * (scaleChange - 1);
        const newPanY = panRef.current.y - (mouseY - panRef.current.y) * (scaleChange - 1);

        setZoomLevel(newZoom);
        setPanOffset(clampPan(newPanX, newPanY, newZoom));
      }
    };

    // --- Mobile Touch Gestures (Pinch to zoom + 2-finger pan) in Capture Phase ---
    const onTouchStartCapture = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        // 2 fingers detected! Absolutely cancel any pending or candidate arrow tap!
        wasMultiTouch = true;
        lastMultiTouchEndTime = performance.now();
        cancelPendingTap();
        isPointerDragging = false;

        touchStartDist = getDistance(e.touches[0], e.touches[1]);
        touchStartZoom = zoomRef.current;
        touchStartCenter = getCenter(e.touches[0], e.touches[1]);
        touchStartPan = { ...panRef.current };
        setIsDragging(true);
        document.body.classList.add('is-board-dragging');
      }
    };

    const onTouchMoveCapture = (e: TouchEvent) => {
      if (e.touches.length >= 2) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();

        wasMultiTouch = true;
        lastMultiTouchEndTime = performance.now();
        cancelPendingTap();

        if (touchStartDist > 0) {
          const currentDist = getDistance(e.touches[0], e.touches[1]);
          const currentCenter = getCenter(e.touches[0], e.touches[1]);

          const scale = currentDist / touchStartDist;
          const newZoom = Math.min(ZOOM_MAX, Math.max(ZOOM_MIN, +(touchStartZoom * scale).toFixed(2)));

          const centerDeltaX = currentCenter.x - touchStartCenter.x;
          const centerDeltaY = currentCenter.y - touchStartCenter.y;

          const newPan = clampPan(touchStartPan.x + centerDeltaX, touchStartPan.y + centerDeltaY, newZoom);

          setZoomLevel(newZoom);
          setPanOffset(newPan);
        }
      }
    };

    const onTouchEndCapture = (e: TouchEvent) => {
      if (wasMultiTouch || e.touches.length > 0) {
        // Multi-touch ending: lock out all arrow taps!
        lastMultiTouchEndTime = performance.now();
        cancelPendingTap();
      }

      if (e.touches.length < 2) {
        touchStartDist = 0;
      }

      if (e.touches.length === 0) {
        isPointerDragging = false;
        setIsDragging(false);
        document.body.classList.remove('is-board-dragging');
      }
    };

    // Attach capture listeners to intercept before arrows
    el.addEventListener('pointerdown', onPointerDownCapture, { capture: true, passive: false });
    window.addEventListener('pointermove', onPointerMoveCapture, { passive: false });
    window.addEventListener('pointerup', onPointerUpCapture);
    window.addEventListener('pointercancel', onPointerCancelCapture);

    el.addEventListener('wheel', onWheel, { passive: false });
    el.addEventListener('touchstart', onTouchStartCapture, { capture: true, passive: false });
    el.addEventListener('touchmove', onTouchMoveCapture, { capture: true, passive: false });
    el.addEventListener('touchend', onTouchEndCapture, { capture: true });
    el.addEventListener('touchcancel', onTouchEndCapture, { capture: true });

    // Prevent context menu on long-press or right-click within the board so panning is uninterrupted
    const onContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };
    el.addEventListener('contextmenu', onContextMenu);

    return () => {
      cancelPendingTap();
      document.body.classList.remove('is-board-dragging');

      el.removeEventListener('pointerdown', onPointerDownCapture, { capture: true });
      window.removeEventListener('pointermove', onPointerMoveCapture);
      window.removeEventListener('pointerup', onPointerUpCapture);
      window.removeEventListener('pointercancel', onPointerCancelCapture);

      el.removeEventListener('wheel', onWheel);
      el.removeEventListener('touchstart', onTouchStartCapture, { capture: true });
      el.removeEventListener('touchmove', onTouchMoveCapture, { capture: true });
      el.removeEventListener('touchend', onTouchEndCapture, { capture: true });
      el.removeEventListener('touchcancel', onTouchEndCapture, { capture: true });
      el.removeEventListener('contextmenu', onContextMenu);
    };
  }, [clampPan]);

  const isZoomed = zoomLevel !== 1;
  const isPanned = panOffset.x !== 0 || panOffset.y !== 0;
  const canZoomIn = zoomLevel < ZOOM_MAX;
  const canZoomOut = zoomLevel > ZOOM_MIN;

  // Pre-calculated CSS style object for the board wrap div
  const boardStyle = useMemo<React.CSSProperties>(() => {
    return {
      transform: `translate3d(${panOffset.x}px, ${panOffset.y}px, 0) scale(${zoomLevel})`,
      transformOrigin: 'center center',
      transition: isDragging ? 'none' : 'transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1)',
      cursor: isDragging ? 'grabbing' : 'grab',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
    };
  }, [panOffset.x, panOffset.y, zoomLevel, isDragging]);

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
