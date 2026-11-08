'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { exportCanvasAsGif, downloadBlob, downloadCanvasAsPng } from '@/lib/gifExport';

interface ResultsScreenProps {
  totalLanterns: number;
  totalQuestions: number;
  getCanvas: () => HTMLCanvasElement | null;
  onPlayAgain: () => void;
  player1Name: string;
  player2Name: string;
}

export default function ResultsScreen({
  totalLanterns,
  totalQuestions,
  getCanvas,
  onPlayAgain,
  player1Name,
  player2Name,
}: ResultsScreenProps) {
  const [isExportingGif, setIsExportingGif] = useState(false);
  const [exportProgress, setExportProgress] = useState(0);
  const [exportedSuccess, setExportedSuccess] = useState(false);

  const percentage = Math.round((totalLanterns / Math.max(1, totalQuestions)) * 100);

  // Romantic title based on match percentage
  const getCoupleTitle = () => {
    if (percentage >= 80) return { title: 'Eternal Flame Soulmates 🪔✨', desc: 'Your minds and hearts beat in complete harmony! The Diwali sky is blazing with your love.' };
    if (percentage >= 60) return { title: 'Cosmic Stargazers 🌟', desc: 'Incredible connection! You know each other intimately and celebrate each other’s quirks.' };
    if (percentage >= 40) return { title: 'Sparkler Sweethearts 🎆', desc: 'Beautiful chemistry! You bring warmth, laughter, and spontaneous joy into each other’s lives.' };
    return { title: 'Playful Companions 💕', desc: 'Opposites attract! A relationship filled with endless surprises and sweet new discoveries.' };
  };

  const titleInfo = getCoupleTitle();

  const handleDownloadGif = async () => {
    const canvas = getCanvas();
    if (!canvas) {
      alert('Canvas not ready for export');
      return;
    }

    try {
      setIsExportingGif(true);
      setExportProgress(0);
      setExportedSuccess(false);

      const blob = await exportCanvasAsGif(
        canvas,
        {
          width: 640,
          height: 480,
          quality: 10,
          frameDelay: 100,
          totalFrames: 30, // 3 seconds loop
        },
        (progress) => {
          setExportProgress(Math.round(progress * 100));
        }
      );

      downloadBlob(blob, `diwali-skyline-${player1Name}-${player2Name}.gif`);
      setExportedSuccess(true);
    } catch (err) {
      console.error('GIF export error:', err);
      // Fallback to PNG
      alert('GIF generation took too long; downloading high-res PNG instead!');
      downloadCanvasAsPng(canvas, `diwali-skyline-${player1Name}-${player2Name}.png`);
    } finally {
      setIsExportingGif(false);
    }
  };

  const handleDownloadPng = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    downloadCanvasAsPng(canvas, `diwali-skyline-${player1Name}-${player2Name}.png`);
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center pointer-events-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-lg glass-panel border border-amber-500/40 shadow-2xl backdrop-blur-xl bg-purple-950/85 p-6 md:p-8 pointer-events-auto glow-border-gold"
      >
        <div className="mb-2">
          <span className="text-5xl diya-glow">🪔</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-black bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-transparent glow-text">
          {titleInfo.title}
        </h1>

        <p className="mt-2 text-xs md:text-sm text-amber-200/80 max-w-sm mx-auto">
          {titleInfo.desc}
        </p>

        {/* Score Card */}
        <div className="my-6 p-4 rounded-2xl bg-black/40 border border-amber-500/30 flex items-center justify-around">
          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-amber-300 glow-text-gold">
              {totalLanterns}
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-wider font-semibold">
              Lanterns Floating
            </p>
          </div>

          <div className="w-[1px] h-10 bg-purple-500/30" />

          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-orange-400">
              {percentage}%
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-wider font-semibold">
              Couples Sync
            </p>
          </div>

          <div className="w-[1px] h-10 bg-purple-500/30" />

          <div>
            <p className="text-3xl md:text-4xl font-extrabold text-amber-200">
              {totalQuestions}
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-wider font-semibold">
              Total Questions
            </p>
          </div>
        </div>

        <p className="text-xs text-purple-200/80 mb-6">
          Look at your personalized Diwali night sky behind this card! Each lantern floating in the cosmos represents a matched bond between {player1Name} &amp; {player2Name}.
        </p>

        {/* Download Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadGif}
            disabled={isExportingGif}
            className="w-full btn-gold text-base py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-xl transition hover:scale-[1.02]"
          >
            {isExportingGif ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">✨</span>
                <span>Generating Animated GIF ({exportProgress}%)...</span>
              </span>
            ) : (
              <>
                <span>🎁 Download Skyline as Animated GIF</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPng}
            className="w-full btn-secondary text-sm py-2.5 flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📸 Download High-Res Image (PNG)</span>
          </button>

          {exportedSuccess && (
            <p className="text-xs text-emerald-300 font-medium">
              ✓ Download started! Share your glowing Diwali skyline on Instagram/WhatsApp! 🪔
            </p>
          )}

          <div className="pt-4 border-t border-purple-500/20">
            <button
              onClick={onPlayAgain}
              className="text-sm font-semibold text-amber-300 hover:text-amber-100 transition cursor-pointer"
            >
              🔄 Play Another Round with New Questions
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
