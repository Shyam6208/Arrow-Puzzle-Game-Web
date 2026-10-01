import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../hooks/useStore';
import {
  Play,
  Home,
  Grid3x3,
  SkipForward,
  Volume2,
  Smartphone,
  X,
  Gift,
  Tv,
  Sparkles,
  HelpCircle,
  RotateCcw,
  AlertTriangle,
  Check,
} from 'lucide-react';
import { calculateStars } from '../game/engine';
import { getLevelById } from '../game/levels';
import { sounds, triggerHaptic } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';

export default function Modals() {
  const { state, dispatch } = useStore();
  const { modal } = state;

  return (
    <AnimatePresence>
      {modal !== 'none' && (
        <motion.div
          key="modal-overlay"
          className="game-modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
        >
          {/* Backdrop */}
          <div
            className="game-modal-backdrop"
            onClick={() => {
              if (modal === 'pause' || modal === 'coin-shop' || modal === 'how-to-play') {
                dispatch({ type: 'SET_MODAL', modal: 'none' });
              }
            }}
          />

          {/* Modal card */}
          <motion.div
            className="game-modal-card"
            initial={{ scale: 0.93, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.93, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 26, stiffness: 320 }}
          >
            {modal === 'win' && <WinModal />}
            {modal === 'lose' && <LoseModal />}
            {modal === 'pause' && <PauseModal />}
            {modal === 'leave-confirm' && <LeaveConfirmModal />}
            {modal === 'coin-shop' && <CoinShopModal />}
            {modal === 'how-to-play' && <HowToPlayModal />}
            {modal === 'reset-confirm' && <ResetConfirmModal />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

// ─────────────────────────────────────────────────────────────
// 1. Win Modal
// ─────────────────────────────────────────────────────────────
function WinModal() {
  const { state, dispatch } = useStore();
  const game = state.game!;
  const level = getLevelById(game.levelId);
  const stars = level ? calculateStars(game.moves, level.par) : 1;
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    sounds.playWin();
    triggerHaptic([30, 60, 90]);
    if (containerRef.current) {
      triggerConfetti(containerRef.current);
    }
  }, []);

  return (
    <div ref={containerRef} className="text-center relative">
      <h2 className="game-modal-title mb-1">Level Complete!</h2>
      <p className="text-sm font-bold text-slate-400 mb-4">Level {game.levelId} cleared</p>

      {/* Trophy */}
      <div className="w-20 h-20 mx-auto rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center mb-4 shadow-inner">
        <span className="text-4xl">🏆</span>
      </div>

      {/* Stars */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s, i) => (
          <motion.span
            key={s}
            className={`text-3xl ${s <= stars ? 'text-amber-500' : 'text-slate-200'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.15 + i * 0.15, type: 'spring', damping: 10 }}
          >
            ★
          </motion.span>
        ))}
      </div>

      {/* Next Level button */}
      <button
        onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
        className="modal-btn-primary !mt-0 mb-2.5"
      >
        <Play size={18} fill="white" />
        Next Level
      </button>

      {/* Play Again button */}
      <button
        onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
        className="w-full bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-sm py-3 rounded-2xl flex items-center justify-center gap-2 mb-3 transition-colors cursor-pointer"
      >
        <RotateCcw size={16} />
        Play Again
      </button>

      {/* Bottom actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="flex-1 h-11 rounded-xl bg-slate-100 flex items-center justify-center gap-1.5 font-bold text-xs text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <Home size={16} />
          Home
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
          className="flex-1 h-11 rounded-xl bg-slate-100 flex items-center justify-center gap-1.5 font-bold text-xs text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <Grid3x3 size={16} />
          All Levels
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 2. Lose Modal
// ─────────────────────────────────────────────────────────────
function LoseModal() {
  const { state, dispatch } = useStore();
  const game = state.game!;

  useEffect(() => {
    sounds.playFail();
    triggerHaptic([50, 50, 100]);
  }, []);

  return (
    <div className="text-center">
      <h2 className="game-modal-title mb-1">Out of Lives!</h2>
      <p className="text-sm font-bold text-slate-400 mb-6">Level {game.levelId}</p>

      {/* Broken heart */}
      <div className="w-20 h-20 mx-auto rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center mb-6 shadow-inner">
        <span className="text-4xl">💔</span>
      </div>

      {/* Try Again */}
      <button
        onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
        className="modal-btn-primary !mt-0 mb-3"
      >
        <Play size={18} fill="white" />
        Try Again
      </button>

      {/* Bottom actions */}
      <div className="flex items-center gap-2.5">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
          aria-label="Home"
        >
          <Home size={20} className="text-slate-800" />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
          className="flex-1 h-12 rounded-2xl bg-slate-100 flex items-center justify-center gap-2 font-bold text-sm text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
        >
          <Grid3x3 size={16} />
          All Levels
        </button>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 3. Pause & Settings Modal
// ─────────────────────────────────────────────────────────────
function PauseModal() {
  const { state, dispatch } = useStore();
  const game = state.game;
  const isGameplay = game !== null && state.screen === 'game';

  const handleToggleSound = () => {
    const nextVal = !state.player.settings.soundEnabled;
    dispatch({ type: 'TOGGLE_SETTING', key: 'soundEnabled' });
    if (nextVal) {
      setTimeout(() => sounds.playCoin(), 50);
    }
  };

  const handleToggleHaptics = () => {
    const nextVal = !state.player.settings.hapticsEnabled;
    dispatch({ type: 'TOGGLE_SETTING', key: 'hapticsEnabled' });
    if (nextVal) {
      triggerHaptic([30, 40]);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="game-modal-header">
        <h2 className="game-modal-title">
          {isGameplay ? `Level ${game.levelId}` : 'Settings'}
        </h2>
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
          className="game-modal-close"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Preferences Group */}
      <div className="settings-group mb-3.5">
        {/* Sound FX */}
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-badge bg-blue-100 text-blue-600">
              <Volume2 size={19} strokeWidth={2.2} />
            </div>
            <span className="settings-row-label">Sound Effects</span>
          </div>
          <button
            type="button"
            onClick={handleToggleSound}
            aria-label="Toggle Sound Effects"
            className={`ios-switch ${state.player.settings.soundEnabled ? 'on' : 'off'}`}
          >
            <span className="ios-switch-knob" />
          </button>
        </div>

        {/* Vibration / Haptics */}
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-badge bg-purple-100 text-purple-600">
              <Smartphone size={19} strokeWidth={2.2} />
            </div>
            <span className="settings-row-label">Vibration</span>
          </div>
          <button
            type="button"
            onClick={handleToggleHaptics}
            aria-label="Toggle Vibration"
            className={`ios-switch ${state.player.settings.hapticsEnabled ? 'on' : 'off'}`}
          >
            <span className="ios-switch-knob" />
          </button>
        </div>

        {/* Show Grid */}
        <div className="settings-row">
          <div className="settings-row-left">
            <div className="settings-badge bg-emerald-100 text-emerald-600">
              <Grid3x3 size={19} strokeWidth={2.2} />
            </div>
            <span className="settings-row-label">Grid Guidelines</span>
          </div>
          <button
            type="button"
            onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'showGrid' })}
            aria-label="Toggle Grid Guidelines"
            className={`ios-switch ${state.player.settings.showGrid ? 'on' : 'off'}`}
          >
            <span className="ios-switch-knob" />
          </button>
        </div>
      </div>

      {/* Nav Actions Group */}
      <div className="settings-group mb-1">
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'how-to-play' })}
          className="settings-nav-row"
        >
          <div className="settings-row-left">
            <div className="settings-badge bg-blue-50 text-blue-600 border border-blue-100">
              <HelpCircle size={18} strokeWidth={2.2} />
            </div>
            <span className="settings-row-label text-blue-600">How to Play</span>
          </div>
          <span className="text-slate-400 font-extrabold text-sm">➔</span>
        </button>

        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'reset-confirm' })}
          className="settings-nav-row"
        >
          <div className="settings-row-left">
            <div className="settings-badge bg-rose-50 text-rose-600 border border-rose-100">
              <AlertTriangle size={18} strokeWidth={2.2} />
            </div>
            <span className="settings-row-label text-rose-600">Reset All Progress</span>
          </div>
          <span className="text-xs">⚠️</span>
        </button>
      </div>

      {/* Primary Action Button */}
      {isGameplay ? (
        <div className="flex flex-col gap-2 mt-4">
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
            className="modal-btn-primary !mt-0"
          >
            <Play size={18} fill="white" />
            Resume Game
          </button>

          <button
            onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
            className="w-full text-blue-600 font-extrabold text-sm py-2 hover:underline cursor-pointer"
          >
            Restart Level
          </button>

          <div className="flex items-center gap-2 mt-1">
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
              className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="Home"
            >
              <Home size={20} className="text-slate-800" />
            </button>
            <button
              onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
              className="flex-1 h-12 rounded-2xl bg-slate-100 flex items-center justify-center gap-2 font-extrabold text-sm text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <SkipForward size={16} />
              Skip Level
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
          className="modal-btn-primary"
        >
          Done
        </button>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 4. Leave Confirm Modal
// ─────────────────────────────────────────────────────────────
function LeaveConfirmModal() {
  const { state, dispatch } = useStore();
  const game = state.game;

  return (
    <div className="text-center">
      <h2 className="game-modal-title mb-2">Leave this level?</h2>
      <p className="text-sm font-bold text-slate-400 mb-6">
        Your progress on Level {game?.levelId} will not be saved.
      </p>

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
        className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base mb-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
      >
        Leave Level
      </button>

      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
        className="w-full h-11 bg-slate-100 text-slate-800 hover:bg-slate-200 font-extrabold text-sm rounded-2xl transition-colors cursor-pointer"
      >
        Cancel
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 5. Coin Shop Modal
// ─────────────────────────────────────────────────────────────
function CoinShopModal() {
  const { state, dispatch } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [claimedToday, setClaimedToday] = useState(() => {
    try {
      return localStorage.getItem('arrow_daily_reward_claim') === new Date().toDateString();
    } catch {
      return false;
    }
  });
  const [adCountdown, setAdCountdown] = useState<number | null>(null);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showCelebration = (msg: string) => {
    setToastMsg(msg);
    sounds.playCoin();
    triggerHaptic([30, 50, 40]);
    if (containerRef.current) {
      triggerConfetti(containerRef.current);
    }
    setTimeout(() => setToastMsg(null), 2500);
  };

  const handleClaimDaily = () => {
    if (claimedToday) return;
    try {
      localStorage.setItem('arrow_daily_reward_claim', new Date().toDateString());
    } catch {}
    setClaimedToday(true);
    dispatch({ type: 'ADD_COINS', amount: 50 });
    showCelebration('+50 Coins Claimed!');
  };

  const handleWatchAd = () => {
    if (adCountdown !== null) return;
    setAdCountdown(3);
    const interval = setInterval(() => {
      setAdCountdown((prev) => {
        if (prev === null || prev <= 1) {
          clearInterval(interval);
          dispatch({ type: 'ADD_COINS', amount: 30 });
          showCelebration('+30 Coins Earned!');
          return null;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleClaimPack = (amount: number, packName: string) => {
    dispatch({ type: 'ADD_COINS', amount });
    showCelebration(`+${amount} Coins from ${packName}!`);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Header */}
      <div className="game-modal-header">
        <h2 className="game-modal-title">Coin Shop</h2>

        <div className="flex items-center gap-2.5">
          <div className="shop-balance-pill">
            <span className="text-base leading-none">🪙</span>
            <span>{state.player.coins}</span>
          </div>
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
            className="game-modal-close"
            aria-label="Close"
          >
            <X size={18} strokeWidth={2.5} />
          </button>
        </div>
      </div>

      {/* Toast Alert */}
      {toastMsg && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0 }}
          className="mb-3 p-2.5 bg-emerald-500 text-white rounded-xl text-center text-xs font-black shadow-md flex items-center justify-center gap-1.5"
        >
          <Sparkles size={16} />
          <span>{toastMsg}</span>
        </motion.div>
      )}

      {/* Daily Free Reward Item */}
      <div className="shop-card-item">
        <div className="shop-card-left">
          <div className="shop-card-icon bg-blue-100 text-blue-600">
            <Gift size={22} strokeWidth={2.2} />
          </div>
          <div className="shop-card-info">
            <div className="shop-card-title">Daily Free Gift</div>
            <div className="shop-card-desc">+50 Free Coins daily</div>
          </div>
        </div>
        <button
          onClick={handleClaimDaily}
          disabled={claimedToday}
          className={`shop-action-btn ${claimedToday ? 'shop-btn-claimed' : 'shop-btn-blue'}`}
        >
          {claimedToday ? 'Claimed ✓' : 'Claim +50'}
        </button>
      </div>

      {/* Watch Ad Item */}
      <div className="shop-card-item">
        <div className="shop-card-left">
          <div className="shop-card-icon bg-amber-100 text-amber-600">
            <Tv size={22} strokeWidth={2.2} />
          </div>
          <div className="shop-card-info">
            <div className="shop-card-title">Sponsor Bonus</div>
            <div className="shop-card-desc">Quick 3s ad simulation</div>
          </div>
        </div>
        <button
          onClick={handleWatchAd}
          disabled={adCountdown !== null}
          className="shop-action-btn shop-btn-amber min-w-[94px]"
        >
          {adCountdown !== null ? `Watching ${adCountdown}s` : 'Watch (+30)'}
        </button>
      </div>

      {/* Bonus Boosters Section */}
      <div className="pt-2">
        <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
          Instant Coin Packs
        </div>

        <div className="booster-grid">
          {/* Starter */}
          <button
            onClick={() => handleClaimPack(100, 'Starter Pack')}
            className="booster-pack-card"
          >
            <span className="booster-emoji">🪙</span>
            <span className="booster-amount">+100</span>
            <span className="booster-tag text-blue-600">Free Claim</span>
          </button>

          {/* Pro */}
          <button
            onClick={() => handleClaimPack(500, 'Pro Bundle')}
            className="booster-pack-card"
          >
            <span className="booster-emoji">💰</span>
            <span className="booster-amount">+500</span>
            <span className="booster-tag text-purple-600">Free Claim</span>
          </button>

          {/* Mega */}
          <button
            onClick={() => handleClaimPack(1200, 'Mega Chest')}
            className="booster-pack-card"
          >
            <span className="booster-emoji">💎</span>
            <span className="booster-amount">+1,200</span>
            <span className="booster-tag text-amber-600">Free Claim</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 6. How to Play Modal
// ─────────────────────────────────────────────────────────────
function HowToPlayModal() {
  const { dispatch } = useStore();

  return (
    <div className="text-left">
      <div className="game-modal-header">
        <h2 className="game-modal-title">How to Play</h2>
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
          className="game-modal-close"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      <div className="flex flex-col gap-2.5 mb-6 text-sm">
        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-black shrink-0">
            1
          </div>
          <div>
            <div className="font-black text-slate-800 mb-0.5 leading-snug">Tap an Arrow</div>
            <div className="text-xs font-bold text-slate-500 leading-snug">
              Every arrow wants to slide forward following its bent polyline track in the direction its tip points.
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-600 flex items-center justify-center font-black shrink-0">
            2
          </div>
          <div>
            <div className="font-black text-slate-800 mb-0.5 leading-snug">Clear the Path</div>
            <div className="text-xs font-bold text-slate-500 leading-snug">
              An arrow only exits if its forward path to the edge of the board is completely clear of obstacles!
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-600 flex items-center justify-center font-black shrink-0">
            3
          </div>
          <div>
            <div className="font-black text-slate-800 mb-0.5 leading-snug">Avoid Collisions</div>
            <div className="text-xs font-bold text-slate-500 leading-snug">
              If an arrow collides with another arrow, it bumps back and you lose 1 Heart. You have 3 lives!
            </div>
          </div>
        </div>

        <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 shadow-xs">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-600 flex items-center justify-center font-black shrink-0">
            4
          </div>
          <div>
            <div className="font-black text-slate-800 mb-0.5 leading-snug">Clear the Board</div>
            <div className="text-xs font-bold text-slate-500 leading-snug">
              Free all arrows to solve the puzzle, earn 3 stars, and collect bonus coins!
            </div>
          </div>
        </div>
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
        className="modal-btn-primary !mt-0"
      >
        <Check size={18} strokeWidth={3} />
        Got It! Let's Play
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────
// 7. Reset Confirm Modal
// ─────────────────────────────────────────────────────────────
function ResetConfirmModal() {
  const { dispatch } = useStore();

  const handleReset = () => {
    dispatch({ type: 'RESET_PROGRESS' });
    sounds.playBlocked();
    triggerHaptic([60, 60]);
  };

  return (
    <div className="text-center">
      <div className="w-16 h-16 mx-auto rounded-full bg-rose-100 border border-rose-200 flex items-center justify-center mb-4 text-rose-600 shadow-inner">
        <AlertTriangle size={32} />
      </div>

      <h2 className="game-modal-title mb-2">Reset All Progress?</h2>
      <p className="text-sm font-bold text-slate-500 mb-6 leading-relaxed">
        This will reset your unlocked levels back to Level 1, clear all your earned stars, and reset coins. This cannot be undone!
      </p>

      <button
        onClick={handleReset}
        className="w-full h-12 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-extrabold text-base mb-2.5 transition-all shadow-md active:scale-98 cursor-pointer"
      >
        Yes, Reset Everything
      </button>

      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
        className="w-full h-11 bg-slate-100 text-slate-700 hover:bg-slate-200 font-extrabold text-sm rounded-2xl transition-colors cursor-pointer"
      >
        Cancel & Keep Progress
      </button>
    </div>
  );
}
