import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, Sparkles, Volume2, VolumeX, Play } from 'lucide-react';
import { sounds, triggerHaptic } from '../utils/audio';
import { triggerConfetti } from '../utils/confetti';
import type { RewardedAdRequest } from '../utils/ads';

interface RewardedAdModalProps {
  request: RewardedAdRequest | null;
  onClose: () => void;
}

export default function RewardedAdModal({ request, onClose }: RewardedAdModalProps) {
  if (!request) return null;

  return <RewardedAdDialog key={request.rewardType} request={request} onClose={onClose} />;
}

function RewardedAdDialog({ request, onClose }: { request: RewardedAdRequest; onClose: () => void }) {
  const [countdown, setCountdown] = useState(5);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const modalRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    sounds.playTap();
    triggerHaptic(20);

    timerRef.current = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsCompleted(true);
          sounds.playWin();
          triggerHaptic([30, 60, 40]);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleClaim = () => {
    if (modalRef.current) {
      triggerConfetti(modalRef.current);
    }
    request.onReward();
    onClose();
  };

  const handleDismiss = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (request.onDismiss) {
      request.onDismiss();
    }
    onClose();
  };

  const progressPercent = Math.min(100, Math.round(((5 - countdown) / 5) * 100));

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md">
        <motion.div
          ref={modalRef}
          initial={{ scale: 0.94, opacity: 0, y: 16 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.94, opacity: 0, y: 16 }}
          className="relative w-full max-w-[420px] bg-slate-900 text-white rounded-[28px] overflow-hidden shadow-2xl border border-slate-800 font-['Nunito']"
        >
          {/* Top Bar */}
          <div className="flex items-center justify-between px-5 py-3.5 bg-slate-950/60 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <span className="bg-blue-600 text-white text-[10px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider">
                Ad
              </span>
              <span className="text-xs font-bold text-slate-300">
                {isCompleted ? 'Reward Ready!' : `Reward in ${countdown}s`}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer transition-colors"
                aria-label="Toggle Ad Audio"
              >
                {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
              </button>

              <button
                onClick={handleDismiss}
                className="w-8 h-8 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center text-slate-300 cursor-pointer transition-colors"
                aria-label="Close"
              >
                <X size={16} strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* Video Player Area */}
          <div className="relative aspect-[16/10] bg-gradient-to-br from-indigo-950 via-slate-900 to-blue-950 flex flex-col items-center justify-center p-6 text-center overflow-hidden">
            {/* Ambient Background Circles */}
            <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -right-12 w-48 h-48 rounded-full bg-purple-500/10 blur-2xl pointer-events-none" />

            {/* Video Creative Mock */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-500 shadow-lg flex items-center justify-center mb-3">
                <Play size={28} fill="white" className="text-white ml-1" />
              </div>
              <h3 className="text-xl font-black text-white leading-tight mb-1">
                {request.title || 'Arrow Puzzle Pro'}
              </h3>
              <p className="text-xs font-semibold text-slate-300 max-w-[260px]">
                Watch this short sponsor video to claim your reward
              </p>
            </div>

            {/* Video Progress Bar */}
            <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-slate-800">
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                style={{ width: `${progressPercent}%` }}
                transition={{ ease: 'linear' }}
              />
            </div>
          </div>

          {/* Reward Footer */}
          <div className="p-5 bg-slate-900 border-t border-slate-800 flex flex-col gap-3">
            <div className="flex items-center justify-between text-xs">
              <span className="font-extrabold text-slate-400 uppercase tracking-wider">
                Reward Offering
              </span>
              <span className="font-black text-amber-400 flex items-center gap-1">
                <Sparkles size={14} />
                {request.rewardDescription}
              </span>
            </div>

            {isCompleted ? (
              <button
                onClick={handleClaim}
                className="w-full h-12 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white font-black text-base shadow-lg shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-98 transition-all"
              >
                <CheckCircle size={20} strokeWidth={2.5} />
                Claim Reward
              </button>
            ) : (
              <div className="w-full h-12 rounded-2xl bg-slate-800 text-slate-400 font-extrabold text-sm flex items-center justify-center gap-2 border border-slate-700/60 select-none">
                <span>Please wait {countdown}s to claim</span>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
