import { motion } from 'framer-motion';
import { ChevronLeft, Lock, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getTotalLevels } from '../game/levels';

export default function LevelSelectScreen() {
  const { state, dispatch } = useStore();
  const { player } = state;
  const totalLevels = getTotalLevels();

  const totalStars = Object.values(player.levelProgress || {}).reduce(
    (acc, p) => acc + (p.stars || 0),
    0
  );
  const completedCount = Object.values(player.levelProgress || {}).filter((p) => p.completed).length;

  return (
    <div className="flex flex-col h-full min-h-screen bg-[#edf2f7] overflow-y-auto no-scrollbar font-['Nunito']">
      {/* Top Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-white/70 hover:bg-white text-[#0f172a] shadow-xs transition-all active:scale-95 cursor-pointer"
          aria-label="Back to Home"
        >
          <ChevronLeft size={24} strokeWidth={2.5} />
        </button>

        <h1 className="text-xl font-black text-[#0f172a]">Select Level</h1>

        {/* Coin Pill */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
          className="flex items-center gap-1.5 bg-white/80 hover:bg-white px-3 py-1.5 rounded-full shadow-xs border border-slate-200 text-xs font-black text-[#0f172a] active:scale-95 cursor-pointer transition-all"
        >
          <div className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-inner">
            <span className="text-white text-[9px] font-black leading-none">★</span>
          </div>
          <span>{player.coins}</span>
          <span className="text-amber-500 font-black">+</span>
        </button>
      </div>

      {/* Progress summary banner */}
      <div className="px-4 py-2">
        <div className="bg-white/80 border border-slate-200 rounded-2xl px-4 py-2.5 flex items-center justify-around shadow-xs">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569]">
            <span className="text-[#f59e0b] text-sm">★</span>
            <span>{totalStars} / {totalLevels * 3} Stars</span>
          </div>
          <div className="w-[1px] h-4 bg-slate-200" />
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#475569]">
            <span className="text-[#2563eb] text-sm">🏁</span>
            <span>{completedCount} / {totalLevels} Solved</span>
          </div>
        </div>
      </div>

      {/* Level grid */}
      <div className="flex-1 px-4 py-3">
        <div className="grid grid-cols-5 gap-3 max-w-[420px] mx-auto">
          {Array.from({ length: totalLevels }, (_, i) => {
            const levelId = i + 1;
            const progress = player.levelProgress[levelId];
            // Unlocked if previous completed or level 1, or within player currentLevel
            const isUnlocked = levelId <= Math.max(player.currentLevel || 1, 1);
            const isCompleted = progress?.completed;
            const stars = progress?.stars || 0;

            return (
              <motion.button
                key={levelId}
                onClick={() => {
                  if (isUnlocked) {
                    dispatch({ type: 'START_LEVEL', levelId });
                  }
                }}
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all ${
                  isUnlocked
                    ? 'bg-white shadow-sm hover:shadow-md active:scale-95 cursor-pointer border border-slate-100'
                    : 'bg-[#e2e8f0]/60 cursor-not-allowed border border-transparent opacity-70'
                }`}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.03 }}
              >
                {isUnlocked ? (
                  <>
                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle size={16} className="text-[#2563eb] fill-[#2563eb] text-white" />
                      </div>
                    )}
                    <span className="text-lg font-black text-[#0f172a]">{levelId}</span>
                    {/* Stars */}
                    {isCompleted ? (
                      <div className="flex gap-0.5 mt-0.5">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-[10px] leading-none ${
                              s <= stars ? 'text-[#f59e0b]' : 'text-[#d1d5db]'
                            }`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-[10px] font-bold text-[#94a3b8] mt-0.5">Play</span>
                    )}
                  </>
                ) : (
                  <Lock size={18} className="text-[#94a3b8]" />
                )}
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
