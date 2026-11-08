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

  const getCoupleTitle = () => {
    if (percentage >= 80) return { title: 'Eternal Flame Soulmates 🪔✨', desc: 'Your minds and hearts beat in complete harmony! Your shared skyline blazes with luminous love.' };
    if (percentage >= 60) return { title: 'Cosmic Stargazers 🌟', desc: 'Incredible romantic chemistry! You know each other intimately and celebrate each other’s unique magic.' };
    if (percentage >= 40) return { title: 'Sparkler Sweethearts 🎆', desc: 'Dynamic & passionate! You bring endless laughter, warmth, and spontaneous joy into each other’s lives.' };
    return { title: 'Playful Companions 💕', desc: 'Opposites attract! A relationship full of fun surprises, cute banter, and discoveries every day.' };
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
          width: 800,
          height: 600,
          quality: 2,
          frameDelay: 90,
          totalFrames: 36,
          player1Name,
          player2Name,
          matchPercentage: percentage,
        },
        (progress) => {
          setExportProgress(Math.round(progress * 100));
        }
      );

      downloadBlob(blob, `diwali-skyline-${player1Name}-${player2Name}.gif`);
      setExportedSuccess(true);
    } catch (err) {
      console.error('GIF export error:', err);
      downloadCanvasAsPng(
        canvas,
        `diwali-skyline-${player1Name}-${player2Name}.png`,
        player1Name,
        player2Name,
        percentage
      );
    } finally {
      setIsExportingGif(false);
    }
  };

  const handleDownloadPng = () => {
    const canvas = getCanvas();
    if (!canvas) return;
    downloadCanvasAsPng(
      canvas,
      `diwali-skyline-${player1Name}-${player2Name}.png`,
      player1Name,
      player2Name,
      percentage
    );
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center pointer-events-none">
      <div
        className="w-full max-w-lg p-7 md:p-10 glow-card glow-card-gold pointer-events-auto relative overflow-hidden shadow-2xl"
      >
        <div className="mb-2">
          <span className="text-5xl md:text-6xl diya-flame inline-block">🪔</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-bold font-display glow-title">
          {titleInfo.title}
        </h1>

        <p className="mt-2.5 text-xs md:text-sm text-[#FFE082]/90 max-w-sm mx-auto leading-relaxed">
          {titleInfo.desc}
        </p>

        {/* Scorecard Showcase */}
        <div className="my-6 p-5 rounded-2xl bg-black/50 border border-amber-400/30 flex items-center justify-around shadow-inner">
          <div>
            <p className="text-4xl md:text-5xl font-black font-display text-[#FFE082] glow-text-gold">
              {totalLanterns}
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-widest font-bold mt-1">
              Lanterns Floating
            </p>
          </div>

          <div className="w-[1px] h-12 bg-amber-400/20" />

          <div>
            <p className="text-4xl md:text-5xl font-black font-display text-orange-400">
              {percentage}%
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-widest font-bold mt-1">
              Couple Sync
            </p>
          </div>

          <div className="w-[1px] h-12 bg-amber-400/20" />

          <div>
            <p className="text-4xl md:text-5xl font-black font-display text-amber-200">
              {totalQuestions}
            </p>
            <p className="text-[11px] text-amber-200/70 uppercase tracking-widest font-bold mt-1">
              Questions
            </p>
          </div>
        </div>

        <p className="text-xs text-purple-200/80 mb-6">
          Look at your personalized Diwali sky! Each lantern in the cosmos represents a matched bond between <span className="font-bold text-[#FFE082]">{player1Name}</span> &amp; <span className="font-bold text-[#FFE082]">{player2Name}</span>.
        </p>

        {/* Download Actions */}
        <div className="space-y-3">
          <button
            onClick={handleDownloadGif}
            disabled={isExportingGif}
            className="w-full btn-royal-gold py-4 px-6 text-base md:text-lg flex items-center justify-center gap-2 cursor-pointer"
          >
            {isExportingGif ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin text-xl">✨</span>
                <span>Recording Skyline GIF ({exportProgress}%)...</span>
              </span>
            ) : (
              <>
                <span>🎁 Download Animated Skyline GIF</span>
              </>
            )}
          </button>

          <button
            onClick={handleDownloadPng}
            className="w-full btn-royal-amethyst py-3 px-6 text-sm flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>📸 Download High-Res Screenshot (PNG)</span>
          </button>

          {exportedSuccess && (
            <p className="text-xs text-emerald-300 font-bold">
              ✓ Download initiated! Share your glowing Diwali skyline on Instagram/WhatsApp! 🪔
            </p>
          )}

          <div className="pt-4 border-t border-purple-500/20">
            <button
              onClick={onPlayAgain}
              className="text-xs md:text-sm font-semibold text-[#FFE082] hover:text-white transition cursor-pointer"
            >
              🔄 Play Another Round with New Questions
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
