import { motion } from 'framer-motion';
import { ChevronLeft, Lock, CheckCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getTotalLevels } from '../game/levels';

export default function LevelSelectScreen() {
  const { state, dispatch } = useStore();
  const { player } = state;
  const totalLevels = getTotalLevels();

  return (
    <div className="flex flex-col h-full bg-[#edf2f7] overflow-y-auto no-scrollbar">
      {/* Header */}
      <div className="flex items-center px-4 pt-4 pb-2">
        <button
          onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'home' })}
          className="w-10 h-10 flex items-center justify-center rounded-full hover:bg-white/50 transition-colors"
        >
          <ChevronLeft size={24} strokeWidth={2.5} className="text-[#0f172a]" />
        </button>
        <h1 className="flex-1 text-center text-xl font-bold text-[#0f172a] -ml-10">Levels</h1>
        <div className="w-10" />
      </div>

      {/* Level grid */}
      <div className="flex-1 px-4 py-2">
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: totalLevels }, (_, i) => {
            const levelId = i + 1;
            const progress = player.levelProgress[levelId];
            const isUnlocked = levelId <= Math.max(player.currentLevel || 1, 2);
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
                className={`relative aspect-square rounded-2xl flex flex-col items-center justify-center transition-all
                  ${isUnlocked
                    ? 'bg-white shadow-sm hover:shadow-md active:scale-95'
                    : 'bg-[#e2e8f0]/60'
                  }`}
                whileTap={isUnlocked ? { scale: 0.95 } : {}}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
              >
                {isUnlocked ? (
                  <>
                    {/* Completed badge */}
                    {isCompleted && (
                      <div className="absolute -top-1 -right-1">
                        <CheckCircle size={18} className="text-[#2289f2] fill-[#2289f2]" />
                      </div>
                    )}
                    <span className="text-xl font-bold text-[#0f172a]">{levelId}</span>
                    {/* Stars */}
                    {isCompleted && (
                      <div className="flex gap-0.5 mt-1">
                        {[1, 2, 3].map((s) => (
                          <span
                            key={s}
                            className={`text-xs ${s <= stars ? 'text-[#f59e0b]' : 'text-[#d1d5db]'}`}
                          >
                            ★
                          </span>
                        ))}
                      </div>
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
