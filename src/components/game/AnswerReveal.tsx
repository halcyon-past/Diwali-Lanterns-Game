'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Player, PlayerAnswer, Question } from '@/lib/types';

interface AnswerRevealProps {
  question: Question;
  answers: PlayerAnswer[];
  players: Player[];
  matched: boolean;
  isHost: boolean;
  isLastQuestion: boolean;
  onNextQuestion: () => void;
}

export default function AnswerReveal({
  question,
  answers,
  players,
  matched,
  isHost,
  isLastQuestion,
  onNextQuestion,
}: AnswerRevealProps) {
  const [countdown, setCountdown] = useState(6);

  const playerAnswers = answers.map((ans) => {
    const player = players.find((p) => p.id === ans.playerId);
    return {
      playerName: player?.name || 'Partner',
      isHost: player?.isHost || false,
      answer: ans.answer,
    };
  });

  useEffect(() => {
    const interval = setInterval(() => {
      setCountdown((prev) => Math.max(0, prev - 1));
    }, 1000);

    const timer = setTimeout(() => {
      if (isHost) {
        onNextQuestion();
      }
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, [isHost, onNextQuestion]);

  return (
    <motion.div
      initial={{ scale: 0.98 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0.98 }}
      transition={{ duration: 0.3 }}
      className={`w-full max-w-xl p-7 md:p-10 glow-card relative overflow-hidden ${
        matched ? 'glow-card-gold' : ''
      }`}
    >
      {/* Result Badge */}
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.15 }}
        className="mb-4"
      >
        {matched ? (
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-gradient-to-r from-amber-500/30 via-orange-500/30 to-amber-500/30 border border-amber-400 text-[#FFE082] font-black text-xl md:text-2xl shadow-[0_0_30px_rgba(255,183,77,0.4)] tracking-wide">
            <span className="text-2xl animate-bounce">🪔</span>
            <span className="font-display">IT&apos;S A MATCH!</span>
            <span className="text-2xl">✨</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-900/40 border border-purple-400/40 text-purple-200 font-bold text-base md:text-lg">
            <span>💫</span>
            <span>DIFFERENT PERSPECTIVES, SAME LOVE</span>
            <span>💖</span>
          </div>
        )}
      </motion.div>

      {/* Romantic Commentary */}
      <p className="text-sm md:text-base text-amber-100 font-medium mb-6">
        {matched
          ? 'Your connection shines bright! A warm Diwali lantern is ascending into the sky above! 🎆'
          : 'Opposites make every moment exciting! Onward to the next spark! 🌟'}
      </p>

      {/* Question Recall */}
      <div className="p-3.5 mb-6 rounded-xl bg-black/40 border border-purple-500/25 text-xs md:text-sm text-purple-200/90 font-display italic">
        “{question.text}”
      </div>

      {/* Side-by-Side Answers */}
      <div className="grid grid-cols-2 gap-4 mb-7">
        {playerAnswers.map((pa, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.15 }}
            className={`p-4 md:p-5 rounded-2xl border text-center ${
              matched
                ? 'bg-amber-500/15 border-amber-400/50 shadow-[0_0_20px_rgba(255,183,77,0.15)]'
                : 'bg-purple-950/50 border-purple-500/30'
            }`}
          >
            <p className="text-xs text-[#FFE082] uppercase font-bold tracking-wider mb-1.5">
              {pa.playerName} {pa.isHost ? '👑' : '💖'}
            </p>
            <p className="text-xl md:text-3xl font-extrabold font-display text-[#FFF9C4] break-words">
              {pa.answer}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Host Controls & Countdown */}
      {isHost ? (
        <button
          onClick={onNextQuestion}
          className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer"
        >
          <span>{isLastQuestion ? 'View Illuminated Skyline 🎆' : 'Next Question'}</span>
          <span className="text-sm font-normal opacity-80">({countdown}s) ➔</span>
        </button>
      ) : (
        <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/20 text-xs text-amber-200/80">
          Host will advance to next question in {countdown}s... ✨
        </div>
      )}
    </motion.div>
  );
}
