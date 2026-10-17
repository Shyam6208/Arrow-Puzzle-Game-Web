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
  Trophy,
  Crown,
  Award,
  Flame,
  Zap,
  Star,
  Globe,
  BarChart3,
  Lock,
  Shield,
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
            className={`game-modal-card ${modal === 'leaderboard' ? 'leaderboard-modal-card' : ''}`}
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
              title="Home"
            >
              <Home size={20} className="text-slate-800" />
            </button>
            <button
              onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
              className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center hover:bg-slate-200 transition-colors cursor-pointer shrink-0"
              aria-label="All Levels"
              title="All Levels"
            >
              <Grid3x3 size={20} className="text-slate-800" />
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
                    window.dispatchEvent(new CustomEvent('arrow-puzzle:use-hint'));
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
// 8. Leaderboard Modal (Professional Global & Player Dossier)
// ─────────────────────────────────────────────────────────────

type LeaderboardTab = 'global' | 'stats' | 'tiers';

interface GlobalLeaderboardEntry {
  id: string;
  name: string;
  country: string;
  avatar: string;
  score: number;
  stars: number;
  cleared: number;
  tier: string;
  isPlayer?: boolean;
}

const GLOBAL_LEADERBOARD_SEED: Omit<GlobalLeaderboardEntry, 'tier'>[] = [
  { id: 'p1', name: 'ZenMaster', country: '🇯🇵', avatar: '🦊', score: 2940, stars: 30, cleared: 10 },
  { id: 'p2', name: 'NovaGamer', country: '🇬🇧', avatar: '⚡', score: 2780, stars: 29, cleared: 10 },
  { id: 'p3', name: 'ArrowQueen', country: '🇺🇸', avatar: '👑', score: 2650, stars: 28, cleared: 10 },
  { id: 'p4', name: 'Aarav_IN', country: '🇮🇳', avatar: '🐯', score: 2490, stars: 27, cleared: 9 },
  { id: 'p5', name: 'Lucas_FR', country: '🇫🇷', avatar: '🦅', score: 2380, stars: 26, cleared: 9 },
  { id: 'p6', name: 'Elena_DE', country: '🇩🇪', avatar: '🐺', score: 2190, stars: 24, cleared: 8 },
  { id: 'p7', name: 'Chen_SG', country: '🇸🇬', avatar: '🐉', score: 1980, stars: 22, cleared: 8 },
  { id: 'p8', name: 'Mateo_BR', country: '🇧🇷', avatar: '🐆', score: 1760, stars: 20, cleared: 7 },
  { id: 'p9', name: 'Yuki_Puzzle', country: '🇯🇵', avatar: '🌸', score: 1540, stars: 18, cleared: 6 },
  { id: 'p10', name: 'Liam_CA', country: '🇨🇦', avatar: '🍁', score: 1320, stars: 15, cleared: 5 },
  { id: 'p11', name: 'Sophia_AU', country: '🇦🇺', avatar: '🐨', score: 1110, stars: 13, cleared: 5 },
  { id: 'p12', name: 'Vikram_IN', country: '🇮🇳', avatar: '🦁', score: 890, stars: 11, cleared: 4 },
  { id: 'p13', name: 'Chloe_UK', country: '🇬🇧', avatar: '🦄', score: 680, stars: 9, cleared: 3 },
  { id: 'p14', name: 'Leo_ES', country: '🇪🇸', avatar: '🐂', score: 490, stars: 7, cleared: 2 },
  { id: 'p15', name: 'Mia_US', country: '🇺🇸', avatar: '🐱', score: 280, stars: 4, cleared: 2 },
];

interface RankTierInfo {
  id: string;
  title: string;
  minScore: number;
  icon: typeof Crown;
  colorName: string;
  gradient: string;
  badgeBg: string;
  textColor: string;
  percentile: string;
  perks: string;
}

const RANK_TIERS: RankTierInfo[] = [
  {
    id: 'grandmaster',
    title: 'Grandmaster',
    minScore: 2500,
    icon: Crown,
    colorName: 'amber',
    gradient: 'from-amber-500 via-amber-600 to-yellow-500',
    badgeBg: 'bg-amber-50 text-amber-700 border-amber-200',
    textColor: 'text-amber-500',
    percentile: 'Top 1% Global',
    perks: 'Gold Crown Badge · Hall of Fame Solver',
  },
  {
    id: 'master',
    title: 'Master',
    minScore: 1800,
    icon: Award,
    colorName: 'purple',
    gradient: 'from-purple-600 via-indigo-600 to-violet-700',
    badgeBg: 'bg-purple-50 text-purple-700 border-purple-200',
    textColor: 'text-purple-500',
    percentile: 'Top 5% Global',
    perks: 'Diamond Badge · Master Rank Profile Glow',
  },
  {
    id: 'expert',
    title: 'Expert',
    minScore: 1200,
    icon: Flame,
    colorName: 'rose',
    gradient: 'from-rose-500 via-red-500 to-orange-500',
    badgeBg: 'bg-rose-50 text-rose-700 border-rose-200',
    textColor: 'text-rose-500',
    percentile: 'Top 15% Global',
    perks: 'Expert Flame Badge · Bonus Solver Title',
  },
  {
    id: 'challenger',
    title: 'Challenger',
    minScore: 600,
    icon: Zap,
    colorName: 'blue',
    gradient: 'from-sky-500 via-blue-600 to-indigo-600',
    badgeBg: 'bg-blue-50 text-blue-700 border-blue-200',
    textColor: 'text-blue-500',
    percentile: 'Top 35% Global',
    perks: 'Lightning Badge · Competitive Standings',
  },
  {
    id: 'rookie',
    title: 'Rookie',
    minScore: 200,
    icon: Star,
    colorName: 'emerald',
    gradient: 'from-emerald-500 via-teal-600 to-emerald-700',
    badgeBg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    textColor: 'text-emerald-500',
    percentile: 'Top 60% Global',
    perks: 'Rookie Star Badge · Unlocks Global Rankings',
  },
  {
    id: 'beginner',
    title: 'Beginner',
    minScore: 0,
    icon: Shield,
    colorName: 'slate',
    gradient: 'from-slate-700 via-slate-800 to-slate-900',
    badgeBg: 'bg-slate-100 text-slate-700 border-slate-200',
    textColor: 'text-slate-400',
    percentile: 'Novice Tier',
    perks: 'Clear Level 1 with 3 Stars to Rank Up',
  },
];

function getTierByScore(score: number): RankTierInfo {
  for (const tier of RANK_TIERS) {
    if (score >= tier.minScore) {
      return tier;
    }
  }
  return RANK_TIERS[RANK_TIERS.length - 1];
}

function LeaderboardModal() {
  const { state, dispatch } = useStore();
  const { player } = state;
  const [activeTab, setActiveTab] = useState<LeaderboardTab>('global');

  const totalLevels = getTotalLevels();
  const completedLevels = Object.values(player.levelProgress).filter((p) => p.completed);
  const totalStars = completedLevels.reduce((sum, p) => sum + p.stars, 0);
  const maxStars = totalLevels * 3;

  // Par efficiency calculation
  const underParSolves = completedLevels.filter((p) => {
    const level = getLevelById(p.levelId);
    return level && p.bestMoves <= level.par;
  }).length;
  const efficiencyRate = completedLevels.length > 0
    ? Math.round((underParSolves / completedLevels.length) * 100)
    : 100;

  // Calculate score: stars * 100 + efficiency bonus
  const totalScore = completedLevels.reduce((sum, p) => {
    const level = getLevelById(p.levelId);
    const par = level?.par ?? p.bestMoves;
    const efficiency = Math.max(0, (par - p.bestMoves + 3) * 10);
    return sum + p.stars * 100 + efficiency;
  }, 0);

  const currentTier = getTierByScore(totalScore);
  const currentTierIndex = RANK_TIERS.findIndex((t) => t.id === currentTier.id);
  const nextTier = currentTierIndex > 0 ? RANK_TIERS[currentTierIndex - 1] : null;

  const ptsToNext = nextTier ? Math.max(0, nextTier.minScore - totalScore) : 0;
  const progressPercent = nextTier
    ? Math.min(100, Math.max(0, ((totalScore - currentTier.minScore) / (nextTier.minScore - currentTier.minScore)) * 100))
    : 100;

  // Build full global rankings
  const userEntry: GlobalLeaderboardEntry = {
    id: 'user-you',
    name: 'You',
    country: '🌟',
    avatar: '🎮',
    score: totalScore,
    stars: totalStars,
    cleared: completedLevels.length,
    tier: currentTier.title,
    isPlayer: true,
  };

  const allRankings: GlobalLeaderboardEntry[] = [
    ...GLOBAL_LEADERBOARD_SEED.map((p) => ({
      ...p,
      tier: getTierByScore(p.score).title,
    })),
    userEntry,
  ].sort((a, b) => b.score - a.score || b.stars - a.stars);

  const userRankIndex = allRankings.findIndex((p) => p.isPlayer);
  const userRank = userRankIndex + 1;

  // Top 3 for Podium
  const top1 = allRankings[0];
  const top2 = allRankings[1];
  const top3 = allRankings[2];
  const restRankings = allRankings.slice(3);

  const handleTabChange = (tab: LeaderboardTab) => {
    sounds.playTap();
    triggerHaptic(10);
    setActiveTab(tab);
  };

  const handleClose = () => {
    sounds.playTap();
    dispatch({ type: 'SET_MODAL', modal: 'none' });
  };

  const TierCurrentIcon = currentTier.icon;

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 text-white flex items-center justify-center shadow-md shadow-amber-500/25 shrink-0">
            <Trophy size={20} strokeWidth={2.5} />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-xl font-black text-slate-900 leading-none">Leaderboard</h2>
              <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-wider bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded-full shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Live
              </span>
            </div>
            <p className="text-[11px] font-bold text-slate-400 mt-0.5">
              Global Season 1 · Compete & Rank Up
            </p>
          </div>
        </div>

        <button
          onClick={handleClose}
          className="game-modal-close"
          aria-label="Close"
        >
          <X size={18} strokeWidth={2.5} />
        </button>
      </div>

      {/* Segmented Tab Switcher */}
      <div className="grid grid-cols-3 gap-1 bg-slate-100 p-1 rounded-2xl mb-3 border border-slate-200/80">
        <button
          onClick={() => handleTabChange('global')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'global'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Globe size={14} strokeWidth={2.5} />
          <span>Global</span>
        </button>

        <button
          onClick={() => handleTabChange('stats')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'stats'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <BarChart3 size={14} strokeWidth={2.5} />
          <span>My Stats</span>
        </button>

        <button
          onClick={() => handleTabChange('tiers')}
          className={`py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            activeTab === 'tiers'
              ? 'bg-white text-indigo-600 shadow-xs'
              : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <Crown size={14} strokeWidth={2.5} />
          <span>Tiers</span>
        </button>
      </div>

      {/* Tab Body Scrollable Container */}
      <div className="leaderboard-scroll">
        {/* ================= TAB 1: GLOBAL RANKINGS ================= */}
        {activeTab === 'global' && (
          <div className="flex flex-col">
            {/* Top 3 Podium Showcase */}
            <div className="bg-gradient-to-b from-indigo-950/5 via-slate-50/80 to-indigo-50/50 rounded-2xl p-3 border border-indigo-100/70 mb-3 shadow-xs">
              <div className="text-[10px] font-black text-indigo-500 uppercase tracking-widest text-center mb-2.5">
                Top World Champions
              </div>

              <div className="grid grid-cols-3 gap-2 items-end pt-3 pb-1">
                {/* #2 Silver (Left) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-1">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg bg-white shadow-md border-2 ${
                      top2.isPlayer ? 'border-indigo-500 ring-2 ring-indigo-400' : 'border-slate-300'
                    }`}>
                      {top2.avatar}
                    </div>
                    <span className="absolute -top-1 -right-1 text-xs">🥈</span>
                    <span className="absolute -bottom-1 -left-1 text-[10px]">{top2.country}</span>
                  </div>
                  <div className="text-[11px] font-black text-slate-800 truncate max-w-[85px] text-center">
                    {top2.name}
                  </div>
                  <div className="text-[10px] font-black text-slate-500">
                    {top2.score.toLocaleString()} <span className="text-[8px]">pts</span>
                  </div>
                  {/* Pedestal */}
                  <div className="w-full h-15 rounded-t-xl bg-gradient-to-t from-slate-200 to-slate-100 border border-slate-300/80 flex flex-col items-center justify-center mt-1.5 shadow-xs">
                    <span className="text-xs font-black text-slate-600">#2</span>
                    <span className="text-[9px] font-bold text-slate-400">{top2.stars}★</span>
                  </div>
                </div>

                {/* #1 Gold (Center, Elevated) */}
                <div className="flex flex-col items-center -mt-2">
                  <div className="crown-float text-amber-500 text-base mb-0.5">👑</div>
                  <div className="relative mb-1">
                    <div className={`w-13 h-13 rounded-full flex items-center justify-center text-2xl bg-gradient-to-br from-amber-100 to-yellow-200 shadow-md border-2 ${
                      top1.isPlayer ? 'border-amber-500 ring-4 ring-amber-400/50' : 'border-amber-400 ring-2 ring-amber-300/60'
                    }`}>
                      {top1.avatar}
                    </div>
                    <span className="absolute -top-1.5 -right-1 text-sm">🥇</span>
                    <span className="absolute -bottom-1 -left-1 text-[11px]">{top1.country}</span>
                  </div>
                  <div className="text-xs font-black text-amber-900 truncate max-w-[95px] text-center">
                    {top1.name}
                  </div>
                  <div className="text-[11px] font-black text-amber-600">
                    {top1.score.toLocaleString()} <span className="text-[9px]">pts</span>
                  </div>
                  {/* Pedestal */}
                  <div className="w-full h-20 rounded-t-xl bg-gradient-to-t from-amber-300 via-amber-200 to-yellow-100 border-2 border-amber-300 flex flex-col items-center justify-center mt-1.5 shadow-md podium-gold-glow">
                    <span className="text-sm font-black text-amber-800">#1</span>
                    <span className="text-[9px] font-extrabold text-amber-700">{top1.stars}★</span>
                    <span className="text-[8px] font-black text-amber-600 uppercase tracking-tighter">Winner</span>
                  </div>
                </div>

                {/* #3 Bronze (Right) */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-1">
                    <div className={`w-11 h-11 rounded-full flex items-center justify-center text-lg bg-white shadow-md border-2 ${
                      top3.isPlayer ? 'border-indigo-500 ring-2 ring-indigo-400' : 'border-amber-700/40'
                    }`}>
                      {top3.avatar}
                    </div>
                    <span className="absolute -top-1 -right-1 text-xs">🥉</span>
                    <span className="absolute -bottom-1 -left-1 text-[10px]">{top3.country}</span>
                  </div>
                  <div className="text-[11px] font-black text-slate-800 truncate max-w-[85px] text-center">
                    {top3.name}
                  </div>
                  <div className="text-[10px] font-black text-slate-500">
                    {top3.score.toLocaleString()} <span className="text-[8px]">pts</span>
                  </div>
                  {/* Pedestal */}
                  <div className="w-full h-12 rounded-t-xl bg-gradient-to-t from-amber-100 to-orange-50 border border-amber-200 flex flex-col items-center justify-center mt-1.5 shadow-xs">
                    <span className="text-xs font-black text-amber-800">#3</span>
                    <span className="text-[9px] font-bold text-amber-700/80">{top3.stars}★</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Competitors List (#4+) */}
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider mb-2 px-1 flex items-center justify-between">
              <span>World Standings</span>
              <span>Score & Stars</span>
            </div>

            <div className="flex flex-col gap-1.5 mb-2.5">
              {restRankings.map((p, idx) => {
                const rankNum = idx + 4;
                return (
                  <div
                    key={p.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl transition-all ${
                      p.isPlayer
                        ? 'bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-indigo-500/10 border-2 border-indigo-500 shadow-sm'
                        : 'bg-white border border-slate-200/90'
                    }`}
                  >
                    {/* Rank badge */}
                    <div
                      className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0 ${
                        p.isPlayer ? 'bg-indigo-600 text-white shadow-xs' : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {rankNum}
                    </div>

                    {/* Avatar & Flag */}
                    <div className="relative shrink-0">
                      <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-base border border-slate-200">
                        {p.avatar}
                      </div>
                      <span className="absolute -bottom-1 -right-1 text-[9px]">{p.country}</span>
                    </div>

                    {/* Player Name & Tier */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-extrabold truncate ${p.isPlayer ? 'text-indigo-900' : 'text-slate-800'}`}>
                          {p.name}
                        </span>
                        {p.isPlayer && (
                          <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider shrink-0">
                            You
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] font-bold text-slate-400">
                        {p.tier} · {p.cleared}/10 Cleared
                      </div>
                    </div>

                    {/* Stars & Score */}
                    <div className="text-right shrink-0">
                      <div className={`text-xs font-black ${p.isPlayer ? 'text-indigo-600' : 'text-slate-800'}`}>
                        {p.score.toLocaleString()} <span className="text-[9px] font-bold text-slate-400">pts</span>
                      </div>
                      <div className="text-[10px] font-bold text-amber-500 flex items-center justify-end gap-0.5">
                        <span>★</span> {p.stars}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Pinned Your Standing Summary Bar */}
            <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-2xl p-3 shadow-lg border border-indigo-500/30 flex items-center justify-between mb-1">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 border border-indigo-400/50 flex flex-col items-center justify-center shrink-0">
                  <span className="text-[8px] font-bold text-indigo-300 uppercase leading-none">Rank</span>
                  <span className="text-sm font-black text-white leading-tight">#{userRank}</span>
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-black text-white">Your Standing</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded-md bg-indigo-500/40 text-indigo-200 font-extrabold uppercase">
                      {currentTier.title}
                    </span>
                  </div>
                  <div className="text-[10px] text-indigo-200/80 font-semibold">
                    {userRank <= 3 ? '🏆 Podium Champion!' : `Top ${Math.round((userRank / allRankings.length) * 100)}% Global Solvers`}
                  </div>
                </div>
              </div>

              <div className="text-right">
                <div className="text-sm font-black text-amber-400">
                  {totalScore.toLocaleString()} <span className="text-[10px] font-bold text-amber-300/80">pts</span>
                </div>
                <div className="text-[10px] font-bold text-slate-300">
                  {totalStars}★ · {completedLevels.length}/10 cleared
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= TAB 2: MY STATS & LEVELS ================= */}
        {activeTab === 'stats' && (
          <div className="flex flex-col">
            {/* Hero Rank Tier Card */}
            <div className={`p-4 rounded-2xl bg-gradient-to-br ${currentTier.gradient} text-white mb-3 shadow-lg relative overflow-hidden`}>
              <div className="absolute -right-6 -bottom-6 w-28 h-28 rounded-full bg-white/10 blur-xl pointer-events-none" />

              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center shadow-inner shrink-0">
                    <TierCurrentIcon size={22} className="text-white" />
                  </div>
                  <div>
                    <div className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Current Rank</div>
                    <div className="text-xl font-black">{currentTier.title}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] font-extrabold text-white/80 uppercase tracking-wider">Total Score</div>
                  <div className="text-2xl font-black">{totalScore.toLocaleString()} <span className="text-xs font-semibold">pts</span></div>
                </div>
              </div>

              {/* Progress to next tier */}
              <div className="relative z-10 pt-1">
                <div className="flex justify-between text-[11px] font-extrabold text-white/90 mb-1">
                  <span>{nextTier ? `Next Rank: ${nextTier.title}` : 'Peak Tier Reached!'}</span>
                  <span>{nextTier ? `${ptsToNext} pts needed` : '100%'}</span>
                </div>
                <div className="w-full bg-black/20 rounded-full h-2.5 p-0.5 backdrop-blur-sm">
                  <div
                    className="h-full bg-gradient-to-r from-amber-300 to-white rounded-full transition-all duration-500 shadow-xs"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>

            {/* Performance Metrics Grid */}
            <div className="grid grid-cols-2 gap-2 mb-3">
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-600 flex items-center justify-center font-black text-sm shrink-0">
                  🧩
                </div>
                <div>
                  <div className="text-sm font-black text-slate-800">{completedLevels.length}/{totalLevels}</div>
                  <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Cleared</div>
                </div>
              </div>

              <div className="bg-amber-50/70 border border-amber-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-black text-sm shrink-0">
                  ⭐
                </div>
                <div>
                  <div className="text-sm font-black text-amber-800">{totalStars}/{maxStars}</div>
                  <div className="text-[10px] font-bold text-amber-600/80 uppercase tracking-wider">Stars</div>
                </div>
              </div>

              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center font-black text-sm shrink-0">
                  🎯
                </div>
                <div>
                  <div className="text-sm font-black text-emerald-800">{efficiencyRate}%</div>
                  <div className="text-[10px] font-bold text-emerald-600/80 uppercase tracking-wider">Par Mastery</div>
                </div>
              </div>

              <div className="bg-yellow-50/70 border border-yellow-200/80 rounded-xl p-2.5 flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-yellow-100 text-yellow-600 flex items-center justify-center font-black text-sm shrink-0">
                  🪙
                </div>
                <div>
                  <div className="text-sm font-black text-yellow-900">{player.coins}</div>
                  <div className="text-[10px] font-bold text-yellow-700/80 uppercase tracking-wider">Coins</div>
                </div>
              </div>
            </div>

            {/* Level-by-Level Breakdown */}
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-[11px] font-black text-slate-400 uppercase tracking-wider">
                All Levels Breakdown
              </span>
              <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-full">
                {completedLevels.length}/{totalLevels} Completed
              </span>
            </div>

            <div className="flex flex-col gap-1.5 mb-2">
              {ALL_LEVELS.map((level) => {
                const progress = player.levelProgress[level.id];
                const isCompleted = progress?.completed;
                const stars = progress?.stars ?? 0;
                const bestMoves = progress?.bestMoves;
                const parDelta = bestMoves ? level.par - bestMoves : 0;
                const levelScore = isCompleted
                  ? stars * 100 + Math.max(0, (level.par - (bestMoves ?? level.par) + 3) * 10)
                  : 0;

                return (
                  <div
                    key={level.id}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-xl border transition-all ${
                      isCompleted
                        ? 'bg-white border-slate-200 shadow-xs'
                        : 'bg-slate-50/60 border-slate-200/60 opacity-60'
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs shrink-0 ${
                        isCompleted
                          ? 'bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-xs'
                          : 'bg-slate-200 text-slate-500'
                      }`}
                    >
                      {level.id < 10 ? `0${level.id}` : level.id}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-black text-slate-800">
                          Level {level.id}
                        </span>
                        {isCompleted && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.2 rounded-md ${
                            parDelta > 0
                              ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                              : parDelta === 0
                              ? 'bg-indigo-50 text-indigo-600 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {parDelta > 0 ? `-${parDelta} Under Par` : parDelta === 0 ? 'Par Solved' : `${bestMoves} moves`}
                          </span>
                        )}
                      </div>

                      {isCompleted ? (
                        <div className="text-[10px] font-bold text-slate-400">
                          Best: <strong className="text-slate-600">{bestMoves}</strong> moves · Par: {level.par}
                        </div>
                      ) : (
                        <div className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                          <Lock size={10} /> Locked
                        </div>
                      )}
                    </div>

                    {/* Stars and Score */}
                    <div className="text-right shrink-0">
                      {isCompleted ? (
                        <>
                          <div className="flex gap-0.5 justify-end mb-0.5">
                            {[1, 2, 3].map((s) => (
                              <span
                                key={s}
                                className={`text-xs ${s <= stars ? 'text-amber-500' : 'text-slate-200'}`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <div className="text-xs font-black text-indigo-600">
                            +{levelScore} <span className="text-[9px]">pts</span>
                          </div>
                        </>
                      ) : (
                        <span className="text-xs font-extrabold text-slate-400">—</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= TAB 3: RANK TIERS & REWARDS ================= */}
        {activeTab === 'tiers' && (
          <div className="flex flex-col gap-2 mb-2">
            <div className="text-[11px] font-black text-slate-400 uppercase tracking-wider px-1">
              Seasonal Rank Hierarchy
            </div>

            {RANK_TIERS.map((tier) => {
              const isCurrent = tier.id === currentTier.id;
              const isUnlocked = totalScore >= tier.minScore;
              const TierIcon = tier.icon;

              return (
                <div
                  key={tier.id}
                  className={`p-3 rounded-2xl border transition-all ${
                    isCurrent
                      ? 'bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-indigo-50/90 border-2 border-indigo-500 shadow-md ring-2 ring-indigo-200/50'
                      : isUnlocked
                      ? 'bg-white border-slate-200'
                      : 'bg-slate-50 border-slate-200/70 opacity-65'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <div className="flex items-center gap-2.5">
                      <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-xs shrink-0 ${
                        isCurrent
                          ? 'bg-indigo-600 text-white'
                          : isUnlocked
                          ? 'bg-slate-100 text-slate-700'
                          : 'bg-slate-200 text-slate-400'
                      }`}>
                        <TierIcon size={16} strokeWidth={2.5} />
                      </div>
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-black text-slate-800">{tier.title}</span>
                          {isCurrent && (
                            <span className="text-[9px] font-black bg-indigo-600 text-white px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                              Current
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] font-bold text-slate-400">
                          {tier.minScore === 0 ? 'Starting Rank' : `${tier.minScore.toLocaleString()}+ pts`} · {tier.percentile}
                        </span>
                      </div>
                    </div>

                    <div>
                      {isCurrent ? (
                        <span className="text-xs font-black text-indigo-600 bg-indigo-100/70 px-2 py-0.5 rounded-lg">
                          Active
                        </span>
                      ) : isUnlocked ? (
                        <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Check size={12} strokeWidth={3} /> Reached
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg flex items-center gap-1">
                          <Lock size={10} /> {tier.minScore - totalScore} pts left
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="text-[10px] text-slate-500 font-semibold pl-10.5">
                    🎁 {tier.perks}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Footer Close Button */}
      <button
        onClick={handleClose}
        className="modal-btn-primary !mt-2.5"
      >
        <Check size={18} strokeWidth={3} />
        Done
      </button>
    </div>
  );
}

