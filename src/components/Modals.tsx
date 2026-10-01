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
import { getLevelById, getTotalLevels, ALL_LEVELS } from '../game/levels';
import { sounds, triggerHaptic } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import { GAME } from '../utils/constants';

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
              if (modal === 'pause' || modal === 'coin-shop' || modal === 'how-to-play' || modal === 'leaderboard') {
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
            {modal === 'leaderboard' && <LeaderboardModal />}
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
  const { state, dispatch, showRewardedAd } = useStore();
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
        className="modal-btn-primary !mt-0 mb-2"
      >
        <Play size={18} fill="white" />
        Next Level
      </button>

      {/* 2x Coins with Ad */}
      <button
        onClick={() => {
          showRewardedAd({
            rewardType: 'double_win',
            title: 'Double Level Coins',
            rewardDescription: '+40 Bonus Coins',
            onReward: () => {
              dispatch({ type: 'ADD_COINS', amount: 40 });
            },
          });
        }}
        className="w-full h-11 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-amber-950 font-black text-sm shadow-md flex items-center justify-center gap-2 mb-2.5 cursor-pointer active:scale-98 transition-all"
      >
        <span className="text-lg">🪙</span>
        <span>Claim 2x Coins (Watch Ad)</span>
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
  const { state, dispatch, showRewardedAd } = useStore();
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

      {/* Revive with Ad Button */}
      <button
        onClick={() => {
          showRewardedAd({
            rewardType: 'revive',
            title: 'Revive & Continue',
            rewardDescription: '+1 Heart Revive',
            onReward: () => {
              dispatch({ type: 'REVIVE_LEVEL' });
            },
          });
        }}
        className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all mb-2.5"
      >
        <span className="text-xl">💖</span>
        <span>Revive with Ad (+1 Life)</span>
      </button>

      {/* Buy Extra Life with Coins */}
      <button
        onClick={() => {
          dispatch({ type: 'BUY_EXTRA_LIFE' });
          sounds.playCoin();
          triggerHaptic([30, 50]);
        }}
        disabled={state.player.coins < GAME.coinsForExtraLife}
        className={`w-full h-11 rounded-2xl font-extrabold text-sm flex items-center justify-center gap-2 mb-2.5 transition-all cursor-pointer active:scale-98 ${
          state.player.coins >= GAME.coinsForExtraLife
            ? 'bg-gradient-to-r from-violet-500 to-purple-500 text-white shadow-md shadow-violet-500/20'
            : 'bg-slate-100 text-slate-400 cursor-not-allowed'
        }`}
      >
        <span>💖</span>
        <span>Buy +1 Life ({GAME.coinsForExtraLife} 🪙)</span>
      </button>

      {/* Try Again */}
      <button
        onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
        className="w-full h-11 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-extrabold text-sm flex items-center justify-center gap-2 mb-3 transition-colors cursor-pointer"
      >
        <RotateCcw size={16} />
        Restart Level
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

          {/* Buy power-ups with coins */}
          <div className="settings-group mt-3">
            <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Spend Coins
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  if (state.player.coins >= GAME.coinsForHint && game) {
                    dispatch({ type: 'USE_HINT' });
                    dispatch({ type: 'SET_MODAL', modal: 'none' });
                    sounds.playCoin();
                  }
                }}
                disabled={state.player.coins < GAME.coinsForHint}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                  state.player.coins >= GAME.coinsForHint
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">💡</span>
                <span>Hint</span>
                <span className="text-[10px] opacity-70">{GAME.coinsForHint} 🪙</span>
              </button>
              <button
                onClick={() => {
                  if (state.player.coins >= GAME.coinsForExtraLife && game) {
                    dispatch({ type: 'BUY_EXTRA_LIFE' });
                    sounds.playCoin();
                    triggerHaptic([30, 50]);
                  }
                }}
                disabled={!game || state.player.coins < GAME.coinsForExtraLife || (game?.lives ?? 0) >= (game?.maxLives ?? 3)}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                  game && state.player.coins >= GAME.coinsForExtraLife && game.lives < game.maxLives
                    ? 'bg-rose-50 text-rose-700 border border-rose-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">💖</span>
                <span>+1 Life</span>
                <span className="text-[10px] opacity-70">{GAME.coinsForExtraLife} 🪙</span>
              </button>
              <button
                onClick={() => {
                  if (state.player.coins >= GAME.coinsForSkip) {
                    dispatch({ type: 'BUY_SKIP_LEVEL' });
                    sounds.playCoin();
                    triggerHaptic([30, 60]);
                  }
                }}
                disabled={state.player.coins < GAME.coinsForSkip}
                className={`flex-1 py-2.5 rounded-xl text-xs font-extrabold flex flex-col items-center gap-1 transition-all cursor-pointer active:scale-95 ${
                  state.player.coins >= GAME.coinsForSkip
                    ? 'bg-amber-50 text-amber-700 border border-amber-200'
                    : 'bg-slate-50 text-slate-400 border border-slate-100 cursor-not-allowed'
                }`}
              >
                <span className="text-lg">⏭️</span>
                <span>Skip</span>
                <span className="text-[10px] opacity-70">{GAME.coinsForSkip} 🪙</span>
              </button>
            </div>
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
  const { state, dispatch, showRewardedAd } = useStore();
  const containerRef = useRef<HTMLDivElement>(null);
  const [claimedToday, setClaimedToday] = useState(() => {
    try {
      return localStorage.getItem('arrow_daily_reward_claim') === new Date().toDateString();
    } catch {
      return false;
    }
  });
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
    showRewardedAd({
      rewardType: 'coins',
      title: 'Sponsor Bonus Coins',
      rewardDescription: '+30 Free Coins',
      onReward: () => {
        dispatch({ type: 'ADD_COINS', amount: 30 });
        showCelebration('+30 Coins Earned!');
      },
    });
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
          className="shop-action-btn shop-btn-amber min-w-[94px]"
        >
          Watch (+30)
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

// ─────────────────────────────────────────────────────────────
// 8. Leaderboard Modal
// ─────────────────────────────────────────────────────────────
function LeaderboardModal() {
  const { state, dispatch } = useStore();
  const { player } = state;

  const totalLevels = getTotalLevels();
  const completedLevels = Object.values(player.levelProgress).filter((p) => p.completed);
  const totalStars = completedLevels.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = totalLevels * 3;
  const totalMoves = completedLevels.reduce((sum, p) => sum + p.bestMoves, 0);

  // Calculate score: stars * 100 + efficiency bonus
  const totalScore = completedLevels.reduce((sum, p) => {
    const level = getLevelById(p.levelId);
    const par = level?.par ?? p.bestMoves;
    const efficiency = Math.max(0, (par - p.bestMoves + 3) * 10);
    return sum + p.stars * 100 + efficiency;
  }, 0);

  // Rank tiers
  const getRank = (score: number) => {
    if (score >= 2500) return { title: 'Grandmaster', emoji: '👑', color: 'from-amber-400 to-amber-600' };
    if (score >= 1800) return { title: 'Master', emoji: '💎', color: 'from-purple-400 to-purple-600' };
    if (score >= 1200) return { title: 'Expert', emoji: '🔥', color: 'from-orange-400 to-orange-600' };
    if (score >= 600) return { title: 'Challenger', emoji: '⚡', color: 'from-blue-400 to-blue-600' };
    if (score >= 200) return { title: 'Rookie', emoji: '🌟', color: 'from-emerald-400 to-emerald-600' };
    return { title: 'Beginner', emoji: '🎯', color: 'from-slate-400 to-slate-600' };
  };

  const rank = getRank(totalScore);

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="game-modal-header">
        <h2 className="game-modal-title">Leaderboard</h2>
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
          className="game-modal-close"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Rank Card */}
      <div className={`p-4 rounded-2xl bg-gradient-to-br ${rank.color} text-white mb-4 shadow-lg`}>
        <div className="flex items-center justify-between mb-3">
          <div>
            <div className="text-xs font-bold opacity-80 uppercase tracking-wider">Your Rank</div>
            <div className="text-2xl font-black">{rank.emoji} {rank.title}</div>
          </div>
          <div className="text-right">
            <div className="text-xs font-bold opacity-80">Total Score</div>
            <div className="text-3xl font-black">{totalScore.toLocaleString()}</div>
          </div>
        </div>
        {/* Progress to next rank */}
        <div className="w-full bg-white/20 rounded-full h-2 overflow-hidden">
          <div
            className="h-full bg-white/80 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, (totalScore % 600) / 6)}%` }}
          />
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="bg-slate-50 rounded-xl p-3 text-center border border-slate-100">
          <div className="text-lg font-black text-slate-800">{completedLevels.length}/{totalLevels}</div>
          <div className="text-[10px] font-bold text-slate-500 uppercase">Cleared</div>
        </div>
        <div className="bg-amber-50 rounded-xl p-3 text-center border border-amber-100">
          <div className="text-lg font-black text-amber-700">
            {totalStars}<span className="text-xs opacity-60">/{maxStars}</span>
          </div>
          <div className="text-[10px] font-bold text-amber-600 uppercase">Stars</div>
        </div>
        <div className="bg-blue-50 rounded-xl p-3 text-center border border-blue-100">
          <div className="text-lg font-black text-blue-700">{totalMoves || '—'}</div>
          <div className="text-[10px] font-bold text-blue-600 uppercase">Moves</div>
        </div>
      </div>

      {/* Per-Level Breakdown */}
      <div className="text-[11px] font-extrabold text-slate-400 uppercase tracking-wider mb-2 px-1">
        Level Breakdown
      </div>

      <div className="flex flex-col gap-1.5 mb-4">
        {ALL_LEVELS.map((level) => {
          const progress = player.levelProgress[level.id];
          const isCompleted = progress?.completed;
          const stars = progress?.stars ?? 0;
          const bestMoves = progress?.bestMoves;
          const levelScore = isCompleted
            ? stars * 100 + Math.max(0, (level.par - (bestMoves ?? level.par) + 3) * 10)
            : 0;

          return (
            <div
              key={level.id}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl border transition-all ${
                isCompleted
                  ? 'bg-white border-slate-200 shadow-xs'
                  : 'bg-slate-50 border-slate-100 opacity-50'
              }`}
            >
              {/* Level number */}
              <div
                className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm shrink-0 ${
                  isCompleted
                    ? 'bg-gradient-to-br from-blue-500 to-indigo-500 text-white'
                    : 'bg-slate-200 text-slate-500'
                }`}
              >
                {level.id}
              </div>

              {/* Stars */}
              <div className="flex gap-0.5 shrink-0">
                {[1, 2, 3].map((s) => (
                  <span
                    key={s}
                    className={`text-sm ${s <= stars ? 'text-amber-500' : 'text-slate-200'}`}
                  >
                    ★
                  </span>
                ))}
              </div>

              {/* Best moves */}
              <div className="flex-1 text-right">
                {isCompleted ? (
                  <div className="flex items-center justify-end gap-2">
                    <span className="text-xs font-bold text-slate-500">
                      {bestMoves} moves
                    </span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg">
                      {levelScore}pts
                    </span>
                  </div>
                ) : (
                  <span className="text-xs font-bold text-slate-400">Locked</span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Coin balance */}
      <div className="flex items-center justify-center gap-2 py-2 bg-amber-50 rounded-xl border border-amber-100 mb-3">
        <span className="text-base">🪙</span>
        <span className="font-black text-amber-700">{player.coins} Coins</span>
      </div>

      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
        className="modal-btn-primary !mt-0"
      >
        <Check size={18} strokeWidth={3} />
        Close
      </button>
    </div>
  );
}
