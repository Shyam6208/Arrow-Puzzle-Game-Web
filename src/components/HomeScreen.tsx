import { Settings, ChevronRight, LayoutGrid, Trophy } from 'lucide-react';
import { useStore } from '../hooks/useStore';
import { getTotalLevels } from '../game/levels';
import BannerAd from './BannerAd';

export default function HomeScreen() {
  const { state, dispatch } = useStore();
  const { player } = state;

  const totalLevels = getTotalLevels();
  const continueLevel = Math.min(player.currentLevel || 1, totalLevels);
  const completedCount = Object.values(player.levelProgress || {}).filter((p) => p.completed).length;
  const totalStars = Object.values(player.levelProgress || {}).reduce((sum, p) => sum + (p.stars || 0), 0);

  return (
    <div className="landing-page">
      {/* Top Bar: Coin badge on left, Settings button on right */}
      <div className="landing-topbar">
        {/* Clickable Coin Pill */}
        <button
          onClick={() => dispatch({ type: 'SET_MODAL', modal: 'coin-shop' })}
          className="landing-coin-pill hover:shadow-md cursor-pointer transition-all active:scale-95 border border-slate-200"
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

      {/* Center Hero & Action Menu with spacious layout */}
      <div className="landing-center">
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
          >
            <div className="btn-continue-title">Continue Game</div>
            <div className="btn-continue-sub">Level {continueLevel}</div>
          </button>

          {/* 2-Column Cards Grid */}
          <div className="landing-menu-grid">
            {/* All Levels */}
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

            {/* Coin Shop */}
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

            {/* Leaderboard */}
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
          </div>
        </div>
      </div>

      {/* Monetization: Bottom Banner Ad */}
      <BannerAd className="mt-3 shrink-0" />

      {/* Bottom Spacer */}
      <div className="h-4 shrink-0" />
    </div>
  );
}
