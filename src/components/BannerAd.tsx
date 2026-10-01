import { useEffect, useRef } from 'react';
import { AD_CONFIG, adService } from '../utils/ads';

interface BannerAdProps {
  className?: string;
}

export default function BannerAd({ className = '' }: BannerAdProps) {
  const adRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!AD_CONFIG.enabled) return;
    if (!AD_CONFIG.testMode && adService.isAdSenseAvailable()) {
      adService.refreshBanner();
    }
  }, []);

  if (!AD_CONFIG.enabled) return null;

  return (
    <div
      ref={adRef}
      className={`w-full max-w-[340px] mx-auto flex flex-col items-center justify-center my-2 ${className}`}
    >
      {/* Top tiny label */}
      <span className="text-[9px] font-black tracking-widest uppercase text-slate-400 mb-0.5">
        Advertisement
      </span>

      {/* Actual Banner or Test Frame */}
      {!AD_CONFIG.testMode && adService.isAdSenseAvailable() ? (
        <ins
          className="adsbygoogle"
          style={{ display: 'inline-block', width: '320px', height: '50px' }}
          data-ad-client={AD_CONFIG.adSenseClientId}
          data-ad-slot={AD_CONFIG.slots.bannerBottom}
        />
      ) : (
        <div className="w-[320px] h-[50px] rounded-xl bg-gradient-to-r from-slate-100 via-slate-50 to-slate-100 border border-dashed border-slate-300 flex items-center justify-between px-3 select-none">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-blue-600/10 text-blue-600 flex items-center justify-center text-[10px] font-black">
              AD
            </div>
            <div className="flex flex-col text-left">
              <span className="text-[11px] font-extrabold text-slate-700 leading-tight">
                Sponsor Banner
              </span>
              <span className="text-[9px] font-medium text-slate-400 leading-tight">
                Google AdSense 320x50 Slot
              </span>
            </div>
          </div>
          <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-100">
            Active
          </span>
        </div>
      )}
    </div>
  );
}
