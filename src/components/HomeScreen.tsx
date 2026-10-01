import { Settings, ChevronRight, LayoutGrid, Trophy, Play, Sparkles, HelpCircle } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getTotalLevels } from '../game/levels';

export default function HomeScreen() {
  const { state, dispatch } = useStore();
  const { player } = state;

  const totalLevels = getTotalLevels();
  const continueLevel = Math.min(player.currentLevel || 1, totalLevels);
  const completedCount = Object.values(player.levelProgress || {}).filter((p) => p.completed).length;
  const totalStars = Object.values(player.levelProgress || {}).reduce((sum, p) => sum + (p.stars || 0), 0);

  return (
    <div className="landing-page-stage">
      <div className="landing-page">
        {/* Top Bar: Coin badge on left, Settings button on right */}
        <div className="landing-topbar">
          {/* Clickable Coin Pill */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
            className="landing-coin-pill hover:shadow-md cursor-pointer transition-all active:scale-95"
            aria-label="Coin Shop"
          >
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-inner shrink-0">
              <span className="text-white text-[10px] font-black leading-none">★</span>
            </div>
            <span className="font-extrabold text-sm text-[#0f172a]">{player.coins}</span>
            <span className="text-amber-500 text-xs font-black">+</span>
          </button>

          {/* Settings Button */}
          <button
            onClick={() => dispatch({ type: 'SET_MODAL', modal: 'pause' })}
            className="landing-settings-btn"
            aria-label="Settings"
          >
            <Settings size={20} strokeWidth={2} />
          </button>
        </div>

        {/* Center Hero & Action Menu with balanced spacing */}
        <div className="landing-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/85 border border-slate-200/90 shadow-2xs text-[11px] font-extrabold text-blue-600 mb-2 uppercase tracking-wider">
            <Sparkles size={12} className="text-amber-500 fill-amber-400" />
            <span>Logic Puzzle Game</span>
          </div>

          {/* Title: Arrow Puzzle */}
          <h1 className="title-text">
            <span className="title-arrow">Arrow</span>
            <span className="title-puzzle">Puzzle</span>
          </h1>

          {/* Tagline */}
          <p className="tagline-text">
            TAP · SLIDE · SOLVE
          </p>

          {/* Action Buttons with comfortable spacing */}
          <div className="landing-actions">
            {/* Continue Game Button */}
            <button
              onClick={() => dispatch({ type: 'START_LEVEL', levelId: continueLevel })}
              className="btn-continue"
              aria-label={`Continue Game Level ${continueLevel}`}
            >
              <div>
                <div className="btn-continue-title">Continue Game</div>
                <div className="btn-continue-sub">Level {continueLevel} of {totalLevels}</div>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-xs flex items-center justify-center text-white shrink-0 shadow-inner">
                <Play size={20} className="fill-white translate-x-0.5" />
              </div>
            </button>

            {/* Balanced 2x2 Cards Grid */}
            <div className="landing-menu-grid">
              {/* 1. All Levels */}
              <button
                onClick={() => dispatch({ type: 'SET_SCREEN', screen: 'levels' })}
                className="landing-menu-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#eff6ff] flex items-center justify-center text-[#2563eb]">
                    <LayoutGrid size={20} strokeWidth={2.5} />
                  </div>
                  <ChevronRight size={16} className="text-[#cbd5e1]" />
                </div>
                <div>
                  <div className="card-title">All Levels</div>
                  <div className="card-sub">{completedCount} of {totalLevels}</div>
                </div>
              </button>

              {/* 2. Coin Shop */}
              <button
                onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
                className="landing-menu-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#fffbeb] flex items-center justify-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-amber-500 to-amber-300 flex items-center justify-center shadow-inner">
                      <span className="text-white text-[11px] font-black leading-none">★</span>
                    </div>
                  </div>
                  <ChevronRight size={16} className="text-[#cbd5e1]" />
                </div>
                <div>
                  <div className="card-title">Coin Shop</div>
                  <div className="card-sub">Get Free Coins</div>
                </div>
              </button>

              {/* 3. Leaderboard */}
              <button
                onClick={() => dispatch({ type: 'SET_MODAL', modal: 'leaderboard' })}
                className="landing-menu-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#faf5ff] flex items-center justify-center text-[#9333ea]">
                    <Trophy size={20} strokeWidth={2.5} />
                  </div>
                  <ChevronRight size={16} className="text-[#cbd5e1]" />
                </div>
                <div>
                  <div className="card-title">Leaderboard</div>
                  <div className="card-sub">{totalStars} ★ earned</div>
                </div>
              </button>

              {/* 4. How to Play (completes 2x2 grid symmetry) */}
              <button
                onClick={() => dispatch({ type: 'SET_MODAL', modal: 'how-to-play' })}
                className="landing-menu-card"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#ecfdf5] flex items-center justify-center text-[#059669]">
                    <HelpCircle size={20} strokeWidth={2.5} />
                  </div>
                  <ChevronRight size={16} className="text-[#cbd5e1]" />
                </div>
                <div>
                  <div className="card-title">How to Play</div>
                  <div className="card-sub">Rules & Guide</div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
