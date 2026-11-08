'use client';

import { useEffect } from 'react';
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
  // Map player answers with their display names
  const playerAnswers = answers.map((ans) => {
    const player = players.find((p) => p.id === ans.playerId);
    return {
      playerName: player?.name || 'Partner',
      isHost: player?.isHost || false,
      answer: ans.answer,
    };
  });

  // Auto advance after 6 seconds if host
  useEffect(() => {
    if (!isHost) return;
    const timer = setTimeout(() => {
      onNextQuestion();
    }, 6000);
    return () => clearTimeout(timer);
  }, [isHost, onNextQuestion]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.4 }}
      className={`w-full max-w-xl glass-panel border shadow-2xl backdrop-blur-xl p-6 md:p-8 text-center ${
        matched
          ? 'border-amber-400/50 bg-gradient-to-b from-purple-950/90 to-amber-950/40 glow-border-gold'
          : 'border-purple-500/30 bg-purple-950/85'
      }`}
    >
      {/* Match Result Banner */}
      <motion.div
        initial={{ y: -15, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.1 }}
        className="mb-4"
      >
        {matched ? (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-gradient-to-r from-amber-500/30 to-orange-500/30 border border-amber-400 text-amber-200 font-extrabold text-lg md:text-xl shadow-lg glow-text-gold">
            <span>🪔</span>
            <span>IT&apos;S A MATCH!</span>
            <span>✨</span>
          </div>
        ) : (
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-purple-500/20 border border-purple-400/40 text-purple-200 font-bold text-base md:text-lg">
            <span>💫</span>
            <span>DIFFERENT MINDS, SAME HEARTS</span>
            <span>💖</span>
          </div>
        )}
      </motion.div>

      {/* Subtitle */}
      <p className="text-sm md:text-base text-amber-100/90 mb-6 font-medium">
        {matched
          ? 'Your minds are in sync! A warm Diwali lantern is ascending into the night sky! 🎆'
          : 'Opposites attract! No lantern lit this round, but the night is young! 🌟'}
      </p>

      {/* Original Question */}
      <div className="p-3 mb-6 rounded-xl bg-black/30 border border-purple-500/20 text-xs md:text-sm text-purple-200/80">
        “{question.text}”
      </div>

      {/* Answers Comparison */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        {playerAnswers.map((pa, idx) => (
          <motion.div
            key={idx}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 + idx * 0.15 }}
            className={`p-4 rounded-2xl border ${
              matched
                ? 'bg-amber-500/15 border-amber-400/40'
                : 'bg-purple-900/30 border-purple-500/20'
            }`}
          >
            <p className="text-xs text-amber-300/80 uppercase font-semibold mb-1">
              {pa.playerName} {pa.isHost ? '👑' : '💖'}
            </p>
            <p className="text-xl md:text-2xl font-extrabold text-amber-100 break-words">
              {pa.answer}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Next Question Control */}
      {isHost ? (
        <button
          onClick={onNextQuestion}
          className="w-full btn-gold text-lg py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-xl"
        >
          <span>{isLastQuestion ? 'View Final Diwali Skyline 🎆' : 'Next Question ➔'}</span>
        </button>
      ) : (
        <p className="text-xs text-amber-200/70 italic">
          Host will advance to next question in a few seconds...
        </p>
      )}
    </motion.div>
  );
}
