import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../hooks/useStore';
import { Play, Home, Grid3x3, SkipForward, Volume2, Smartphone } from 'lucide-react';
import { calculateStars } from '../game/engine';
import { getLevelById } from '../game/levels';

export default function Modals() {
  const { state } = useStore();
  const { modal } = state;

  return (
    <AnimatePresence>
      {modal !== 'none' && (
        <motion.div
          key="modal-overlay"
          className="absolute inset-0 z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-[#94a3b8]/60 backdrop-blur-sm" />

          {/* Modal content */}
          <motion.div
            className="relative bg-white rounded-3xl shadow-2xl w-[90%] max-w-[380px] p-6 z-10"
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          >
            {modal === 'win' && <WinModal />}
            {modal === 'lose' && <LoseModal />}
            {modal === 'pause' && <PauseModal />}
            {modal === 'leave-confirm' && <LeaveConfirmModal />}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function WinModal() {
  const { state, dispatch } = useStore();
  const game = state.game!;
  const level = getLevelById(game.levelId);
  const stars = level ? calculateStars(game.moves, level.par) : 1;

  return (
    <div className="text-center font-['Nunito']">
      <h2 className="text-2xl font-black text-[var(--navy)] mb-1">Level Complete!</h2>
      <p className="text-sm font-bold text-[var(--gray)] mb-4">Level {game.levelId} cleared</p>

      {/* Trophy */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#f1f5f9] flex items-center justify-center mb-4">
        <span className="text-4xl">🏆</span>
      </div>

      {/* Stars */}
      <div className="flex items-center justify-center gap-2 mb-6">
        {[1, 2, 3].map((s, i) => (
          <motion.span
            key={s}
            className={`text-3xl ${s <= stars ? 'text-[#f59e0b]' : 'text-[#d1d5db]'}`}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 + i * 0.2, type: 'spring', damping: 10 }}
          >
            ★
          </motion.span>
        ))}
      </div>

      {/* Next Level button */}
      <button
        onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
        className="w-full btn-primary text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-3"
      >
        <Play size={18} fill="white" />
        Next Level
      </button>

      {/* Bottom actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center hover:bg-[#e2e8f0] transition-colors"
        >
          <Home size={20} className="text-[#0f172a]" />
        </button>
        <button
          onClick={() => {
            dispatch({ type: 'SET_SCREEN', screen: 'levels' });
          }}
          className="flex-1 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center gap-2 font-semibold text-sm text-[#0f172a] hover:bg-[#e2e8f0] transition-colors"
        >
          <Grid3x3 size={16} />
          All Levels
        </button>
      </div>
    </div>
  );
}

function LoseModal() {
  const { state, dispatch } = useStore();
  const game = state.game!;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Out of Lives!</h2>
      <p className="text-sm text-[#94a3b8] mb-6">Level {game.levelId}</p>

      {/* Broken heart */}
      <div className="w-20 h-20 mx-auto rounded-full bg-[#fef2f2] flex items-center justify-center mb-6">
        <span className="text-4xl">💔</span>
      </div>

      {/* Try Again */}
      <button
        onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
        className="w-full btn-primary text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-3"
      >
        <Play size={18} fill="white" />
        Try Again
      </button>

      {/* Bottom actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center"
        >
          <Home size={20} className="text-[#0f172a]" />
        </button>
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
          className="flex-1 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center gap-2 font-semibold text-sm text-[#0f172a]"
        >
          <Grid3x3 size={16} />
          All Levels
        </button>
      </div>
    </div>
  );
}

function PauseModal() {
  const { state, dispatch } = useStore();
  const game = state.game;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#0f172a] mb-1">Paused</h2>
      {game && <p className="text-sm text-[#94a3b8] mb-4">Level {game.levelId}</p>}

      {/* Sound toggle */}
      <div className="flex items-center gap-3 bg-[#f1f5f9] rounded-xl px-4 py-3 mb-2">
        <Volume2 size={20} className="text-[#64748b]" />
        <span className="flex-1 text-left text-sm font-medium text-[#0f172a]">Sound</span>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'soundEnabled' })}
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            state.player.settings.soundEnabled
              ? 'bg-[#2289f2] text-white'
              : 'bg-[#d1d5db] text-white'
          }`}
        >
          {state.player.settings.soundEnabled && <span className="text-xs">✓</span>}
        </button>
      </div>

      {/* Haptics toggle */}
      <div className="flex items-center gap-3 bg-[#f1f5f9] rounded-xl px-4 py-3 mb-4">
        <Smartphone size={20} className="text-[#64748b]" />
        <span className="flex-1 text-left text-sm font-medium text-[#0f172a]">Haptics</span>
        <button
          onClick={() => dispatch({ type: 'TOGGLE_SETTING', key: 'hapticsEnabled' })}
          className={`w-6 h-6 rounded-full flex items-center justify-center ${
            state.player.settings.hapticsEnabled
              ? 'bg-[#2289f2] text-white'
              : 'bg-[#d1d5db] text-white'
          }`}
        >
          {state.player.settings.hapticsEnabled && <span className="text-xs">✓</span>}
        </button>
      </div>

      {/* Resume */}
      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
        className="w-full btn-primary text-white font-bold text-base py-3.5 rounded-2xl flex items-center justify-center gap-2 mb-3"
      >
        <Play size={18} fill="white" />
        Resume Game
      </button>

      {/* Restart */}
      {game && (
        <button
          onClick={() => dispatch({ type: 'RESTART_LEVEL' })}
          className="text-[#2289f2] font-semibold text-sm mb-4 hover:underline"
        >
          Restart Level
        </button>
      )}

      {/* Bottom actions */}
      <div className="flex items-center gap-2 mt-2">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-12 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center"
        >
          <Home size={20} className="text-[#0f172a]" />
        </button>
        {game && (
          <button
            onClick={() => dispatch({ type: 'NEXT_LEVEL' })}
            className="flex-1 h-12 rounded-xl bg-[#f1f5f9] flex items-center justify-center gap-2 font-semibold text-sm text-[#0f172a]"
          >
            <SkipForward size={16} />
            Skip Level
          </button>
        )}
      </div>
    </div>
  );
}

function LeaveConfirmModal() {
  const { state, dispatch } = useStore();
  const game = state.game;

  return (
    <div className="text-center">
      <h2 className="text-2xl font-bold text-[#0f172a] mb-2">Leave this level?</h2>
      <p className="text-sm text-[#94a3b8] mb-6">
        Your progress on Level {game?.levelId} won't be saved.
      </p>

      <button
        onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
        className="w-full btn-primary text-white font-bold text-base py-3.5 rounded-2xl mb-3"
      >
        Leave Level
      </button>

      <button
        onClick={() => dispatch({ type: 'SET_MODAL', modal: 'none' })}
        className="text-[#0f172a] font-semibold text-sm hover:underline"
      >
        Cancel
      </button>
    </div>
  );
}
