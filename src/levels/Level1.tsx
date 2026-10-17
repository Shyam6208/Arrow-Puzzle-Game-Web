import { useState, useRef, useEffect, useCallback } from 'react';
import { useStore } from '../hooks/useStore';
import { useZoom } from '../hooks/useZoom';
import ZoomControls from '../components/ZoomControls';

const COLS = [{ x: -54 }, { x: 0 }, { x: 54 }];

interface ArrowItem {
  id: number;
  isFlying: boolean;
  gone: boolean;
  hinting: boolean;
}

export default function Level1() {
  const { state, dispatch, showRewardedAd } = useStore();
  const { zoomLevel, panOffset, isPanMode, togglePanMode, isPanned, zoomIn, zoomOut, resetZoom, canZoomIn, canZoomOut, isZoomed, boardRef, boardStyle } = useZoom();
  const [arrows, setArrows] = useState<ArrowItem[]>([
    { id: 0, isFlying: false, gone: false, hinting: false },
    { id: 1, isFlying: false, gone: false, hinting: false },
    { id: 2, isFlying: false, gone: false, hinting: false },
  ]);

  const [moves, setMoves] = useState(3);
  const [hearts, setHearts] = useState(3);
  const [coins, setCoins] = useState(state.player.coins || 65);
  const [cleared, setCleared] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const isInputLockedRef = useRef(false);
  const appRef = useRef<HTMLDivElement>(null);
  const toastTimerRef = useRef<number | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);

  const showToast = useCallback((msg: string) => {
    setToastMsg(msg);
    if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    toastTimerRef.current = window.setTimeout(() => {
      setToastMsg(null);
    }, 800);
  }, []);

  const playTapSound = () => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!audioCtxRef.current && AudioCtx) {
        audioCtxRef.current = new AudioCtx();
      }
      if (audioCtxRef.current && audioCtxRef.current.state === 'suspended') {
        audioCtxRef.current.resume();
      }
      if (!audioCtxRef.current) return;

      const ctx = audioCtxRef.current;
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(620, now);
      osc.frequency.exponentialRampToValueAtTime(430, now + 0.055);

      gain.gain.setValueAtTime(0.0001, now);
      gain.gain.exponentialRampToValueAtTime(0.16, now + 0.006);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.075);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.08);
    } catch {}
  };

  const clearArrow = (i: number) => {
    if (isInputLockedRef.current) return;
    setArrows((prev) => {
      const target = prev[i];
      if (!target || target.gone || target.isFlying) return prev;

      playTapSound();

      const nextMoves = Math.max(0, moves - 1);
      const nextCoins = coins + 5;
      const nextCleared = cleared + 1;

      setMoves(nextMoves);
      setCoins(nextCoins);
      setCleared(nextCleared);

      // Start fly animation
      const nextState = prev.map((item, idx) =>
        idx === i ? { ...item, isFlying: true } : item
      );

      // After 620ms remove arrow
      window.setTimeout(() => {
        setArrows((curr) => {
          const updated = curr.map((item, idx) =>
            idx === i ? { ...item, gone: true } : item
          );

          if (nextCleared === 3) {
            // Level cleared!
            window.setTimeout(() => {
              setIsWon(true);
              dispatch({
                type: 'COMPLETE_LEVEL_DIRECT',
                levelId: 1,
                moves: 3,
                stars: 3,
              });
            }, 450);
          }

          return updated;
        });
      }, 620);

      return nextState;
    });
  };

  const revealSolvableHint = useCallback(() => {
    const unClearedIdx = arrows.findIndex((a) => !a.gone && !a.isFlying);
    if (unClearedIdx === -1) {
      showToast('No solvable arrows remaining');
      return;
    }

    setArrows((prev) =>
      prev.map((a, idx) => (idx === unClearedIdx ? { ...a, hinting: true } : a))
    );
    window.setTimeout(() => {
      setArrows((prev) =>
        prev.map((a, idx) => (idx === unClearedIdx ? { ...a, hinting: false } : a))
      );
    }, 1800);
    showToast('Hint: Solvable Arrow Highlighted!');
  }, [arrows, showToast]);

  useEffect(() => {
    const onUseHint = () => revealSolvableHint();
    window.addEventListener('arrow-puzzle:use-hint', onUseHint);
    return () => window.removeEventListener('arrow-puzzle:use-hint', onUseHint);
  }, [revealSolvableHint]);

  const handleHint = () => {
    const unClearedIdx = arrows.findIndex((a) => !a.gone && !a.isFlying);
    if (unClearedIdx === -1) {
      showToast('No solvable arrows remaining');
      return;
    }

    showRewardedAd({
      rewardType: 'hint',
      title: 'Free In-Game Hint',
      rewardDescription: 'Reveals Next Solvable Arrow',
      onReward: revealSolvableHint,
    });
  };

  const handleRestart = () => {
    setIsWon(false);
    setMoves(3);
    setHearts(3);
    setCleared(0);
    isInputLockedRef.current = false;
    setArrows([
      { id: 0, isFlying: false, gone: false, hinting: false },
      { id: 1, isFlying: false, gone: false, hinting: false },
      { id: 2, isFlying: false, gone: false, hinting: false },
    ]);
  };

  const handleNextLevel = () => {
    setIsWon(false);
    dispatch({ type: 'START_LEVEL', levelId: 2 });
  };

  const handleHome = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'home' });
  };

  const handleLevels = () => {
    dispatch({ type: 'SET_SCREEN', screen: 'levels' });
  };

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
    };
  }, []);

  return (
    <div className="lvl1-stage">
      <div className="lvl1-app" ref={appRef}>
        <section className="lvl1-game">
          {/* Top Bar */}
          <div className="lvl1-topbar">
            <button className="lvl1-top-icon lvl1-back" onClick={handleLevels} aria-label="Back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.8" strokeLinecap="round">
                <path d="M15 5l-7 7 7 7" />
              </svg>
            </button>
            <div className="lvl1-level-title">
              Level <span>1</span>
            </div>
            <button
              className="lvl1-top-icon lvl1-settings"
              onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
              aria-label="Settings"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .34 1.88l.06.06-1.9 1.9-.06-.06a1.7 1.7 0 0 0-1.88-.34 1.7 1.7 0 0 0-1.04 1.56V21h-2.68v-.08a1.7 1.7 0 0 0-1.04-1.56 1.7 1.7 0 0 0-1.88.34l-.06.06-1.9-1.9.06-.06A1.7 1.7 0 0 0 7.7 15a1.7 1.7 0 0 0-1.56-1.04H6v-2.68h.14A1.7 1.7 0 0 0 7.7 10.2a1.7 1.7 0 0 0-.34-1.88l-.06-.06 1.9-1.9.06.06a1.7 1.7 0 0 0 1.88-.34 1.7 1.7 0 0 0 1.04-1.56V5h2.68v.2a1.7 1.7 0 0 0 1.04 1.56 1.7 1.7 0 0 0 1.88-.34l.06-.06 1.9 1.9-.06.06a1.7 1.7 0 0 0-.34 1.88 1.7 1.7 0 0 0 1.56 1.04H21v2.68h-.04A1.7 1.7 0 0 0 19.4 15z" />
              </svg>
            </button>
          </div>

          {/* Top Stats Bar */}
          <div className="lvl1-stats">
            <div className="lvl1-pill">
              <span className="lvl1-moves-icon">↗</span>
              <span id="moves">{moves}</span>
            </div>
            <div className="lvl1-hearts" aria-label="3 hearts">
              {[0, 1, 2].map((idx) => (
                <span
                  key={idx}
                  className={`lvl1-heart ${idx >= hearts ? 'lost' : ''}`}
                  aria-label={idx < hearts ? 'Active heart' : 'Lost heart'}
                >
                  <svg viewBox="0 0 36 34" aria-hidden="true">
                    <path d="M18 32.2C16.9 31.1 4.3 20.9 1.5 14.1-.9 8.2 2.4 2.4 8.2 1.2c3.8-.8 7.4.9 9.8 4.1 2.4-3.2 6-4.9 9.8-4.1 5.8 1.2 9.1 7 6.7 12.9C31.7 20.9 19.1 31.1 18 32.2Z" />
                  </svg>
                </span>
              ))}
            </div>
            <button
              className="lvl1-pill cursor-pointer hover:opacity-85 active:scale-95 transition-all"
              onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
              aria-label="Coin Shop"
            >
              <span className="lvl1-coin">★</span>
              <span id="coins">{coins}</span>
            </button>
          </div>

          {/* Board */}
          <div className="lvl1-board" ref={boardRef} style={boardStyle}>
            {COLS.map((col, i) => {
              const arrow = arrows[i];
              return (
                <div key={i} className="lvl1-col" style={{ left: `calc(50% + ${col.x}px)` }}>
                  <div className="lvl1-dots">
                    <i /><i /><i /><i /><i /><i />
                  </div>
                  {!arrow.gone && (
                    <div
                      className={`lvl1-arrow pop ${arrow.isFlying ? 'fly' : ''}`}
                      style={{
                        animation: arrow.hinting
                          ? 'hintGlow 0.7s ease-in-out infinite'
                          : undefined,
                      }}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        clearArrow(i);
                      }}
                    >
                      <svg viewBox="0 0 26 150" aria-hidden="true">
                        <line className="shaft" x1="13" y1="146" x2="13" y2="16" />
                        <path className="head" d="M13 0 L4 18 H22 Z" />
                      </svg>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Controls */}
          <div className="lvl1-controls">
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
            <button className="lvl1-circle lvl1-hint" onClick={handleHint}>
              <span className="lvl1-bulb">
                <span className="lvl1-bolt">ϟ</span>
              </span>
              <span className="lvl1-ad">AD</span>
            </button>
            <button className="lvl1-circle lvl1-calc" onClick={() => showToast('Grid')}>
              <span className="lvl1-calc-icon">
                <i /><i /><i /><i /><i /><i /><i /><i /><i />
              </span>
            </button>
          </div>
        </section>

        {/* Win Screen */}
        <div className={`lvl1-win ${isWon ? 'on' : ''}`}>
          <div className="lvl1-win-card">
            <h2>Level Complete!</h2>
            <p>Level 1 cleared</p>
            <div className="lvl1-trophy">🏆</div>
            <div className="lvl1-stars">★ ★ ★</div>
            <button className="lvl1-next" onClick={handleNextLevel}>
              Next Level ➔
            </button>
            <button className="lvl1-replay" onClick={handleRestart}>
              ↺ Play Again
            </button>
            <div className="lvl1-sub-actions">
              <button onClick={handleHome}>⌂ Home</button>
              <button onClick={handleLevels}>▦ Levels</button>
            </div>
          </div>
        </div>

        {/* Toast */}
        <div className={`lvl1-toast ${toastMsg ? 'show' : ''}`}>{toastMsg}</div>
      </div>
    </div>
  );
}
