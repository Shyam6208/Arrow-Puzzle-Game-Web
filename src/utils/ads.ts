/**
 * Centralized Ad Configuration & Monetization Service for Arrow Puzzle.
 * Supports Google AdSense, H5 Game Ads, AdMob Web, and Rewarded Video Ads.
 */

export interface AdConfig {
  /** Master toggle to enable or disable all ads */
  enabled: boolean;
  /** Google AdSense Publisher Client ID (e.g., 'ca-pub-1234567890123456') */
  adSenseClientId: string;
  /** When true, runs an interactive high-conversion ad player simulation. Set to false when your AdSense account is approved. */
  testMode: boolean;
  /** Frequency capping: show interstitial ad every N level completions */
  interstitialFrequency: number;
  /** Ad unit slot IDs from your Google AdSense dashboard */
  slots: {
    bannerBottom: string;
    interstitial: string;
    rewarded: string;
  };
}

export const AD_CONFIG: AdConfig = {
  enabled: true,
  adSenseClientId: 'ca-pub-XXXXXXXXXXXXXXXX', // <-- Replace with your real Google AdSense Publisher ID
  testMode: true, // <-- Change to false once AdSense is approved and live
  interstitialFrequency: 2, // Every 2 levels
  slots: {
    bannerBottom: '1234567890',
    interstitial: '0987654321',
    rewarded: '1122334455',
  },
};

export type RewardType = 'hint' | 'coins' | 'revive' | 'double_win';

export interface RewardedAdRequest {
  rewardType: RewardType;
  title: string;
  rewardDescription: string;
  onReward: () => void;
  onDismiss?: () => void;
}

class AdService {
  private levelClearCount: number = 0;

  /** Check if live Google AdSense SDK is available in the window */
  isAdSenseAvailable(): boolean {
    if (typeof window === 'undefined') return false;
    return !!(window as unknown as { adsbygoogle?: unknown[] }).adsbygoogle;
  }

  /** Track level completion and determine if an interstitial ad should show */
  recordLevelCleared(): boolean {
    if (!AD_CONFIG.enabled) return false;
    this.levelClearCount++;
    return this.levelClearCount % AD_CONFIG.interstitialFrequency === 0;
  }

  /** Trigger refresh of standard Google AdSense banners */
  refreshBanner() {
    if (typeof window === 'undefined' || !AD_CONFIG.enabled || AD_CONFIG.testMode) return;
    try {
      const adsbygoogle = (window as unknown as { adsbygoogle: unknown[] }).adsbygoogle || [];
      adsbygoogle.push({});
    } catch (e) {
      console.warn('[AdService] Banner push note:', e);
    }
  }
}

export const adService = new AdService();
