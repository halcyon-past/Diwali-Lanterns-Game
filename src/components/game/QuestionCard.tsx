'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Question } from '@/lib/types';

interface QuestionCardProps {
  question: Question;
  questionNumber: number;
  totalQuestions: number;
  hasAnswered: boolean;
  mySubmittedAnswer?: string;
  partnerHasAnswered: boolean;
  onSubmitAnswer: (answer: string) => void;
}

export default function QuestionCard({
  question,
  questionNumber,
  totalQuestions,
  hasAnswered,
  mySubmittedAnswer,
  partnerHasAnswered,
  onSubmitAnswer,
}: QuestionCardProps) {
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [typedAnswer, setTypedAnswer] = useState<string>('');

  const handleOptionClick = (option: string) => {
    if (hasAnswered) return;
    setSelectedOption(option);
    onSubmitAnswer(option);
  };

  const handleTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAnswered || !typedAnswer.trim()) return;
    onSubmitAnswer(typedAnswer.trim());
  };

  const options = question.options || ['Him', 'Her'];

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.94, y: 20 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.94, y: -20 }}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-xl p-7 md:p-10 glow-card relative overflow-hidden"
    >
      {/* Corner Filigree Sparkles */}
      <div className="absolute top-3 left-3 text-[#FFE082]/40 text-sm">✦</div>
      <div className="absolute top-3 right-3 text-[#FFE082]/40 text-sm">✦</div>

      {/* Category Pill & Progress Tracker */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3.5 py-1 rounded-full text-xs font-semibold bg-gradient-to-r from-amber-500/20 to-orange-500/20 text-[#FFE082] border border-amber-400/40 shadow-sm flex items-center gap-1.5">
          <span className="text-amber-400">✨</span>
          <span>{question.category}</span>
        </span>
        <span className="text-xs font-bold text-amber-200/80 tracking-wider">
          QUESTION {questionNumber} OF {totalQuestions}
        </span>
      </div>

      {/* Glowing Gold Progress Line */}
      <div className="w-full h-1.5 bg-purple-950/80 rounded-full mb-6 overflow-hidden border border-purple-500/20">
        <div
          className="h-full bg-gradient-to-r from-amber-400 via-orange-400 to-amber-300 transition-all duration-500 rounded-full shadow-[0_0_10px_rgba(255,183,77,0.8)]"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="my-6 text-center px-2">
        <h2 className="text-2xl md:text-3xl font-display font-bold text-[#FFF9C4] leading-snug tracking-normal">
          “{question.text}”
        </h2>
      </div>

      {/* Answer Form */}
      {!hasAnswered ? (
        <div>
          {question.type === 'option' ? (
            <div className="grid grid-cols-2 gap-4 mt-6">
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => handleOptionClick(opt)}
                  className="group py-5 px-6 rounded-2xl bg-gradient-to-b from-purple-900/40 to-purple-950/80 border border-amber-400/30 text-amber-100 font-bold text-lg md:text-xl shadow-lg transition-all duration-300 hover:scale-[1.03] hover:border-amber-300 hover:shadow-[0_0_25px_rgba(255,183,77,0.35)] active:scale-95 cursor-pointer flex flex-col items-center justify-center gap-1.5"
                >
                  <span className="text-3xl filter drop-shadow transition-transform group-hover:scale-110">
                    {opt.toLowerCase().includes('him') ? '👨' : opt.toLowerCase().includes('her') ? '👩' : '✨'}
                  </span>
                  <span className="text-[#FFE082] tracking-wide font-display text-xl">{opt}</span>
                </button>
              ))}
            </div>
          ) : (
            <form onSubmit={handleTextSubmit} className="mt-6 space-y-4">
              <div>
                <input
                  type="text"
                  value={typedAnswer}
                  onChange={(e) => setTypedAnswer(e.target.value)}
                  placeholder="Type your 1-word answer..."
                  maxLength={30}
                  required
                  autoFocus
                  className="input-royal text-center text-xl md:text-2xl font-bold text-[#FFE082] placeholder:font-normal placeholder:text-base tracking-wide"
                />
                <p className="text-xs text-center text-amber-200/60 mt-2.5">
                  💡 One-word answer • Minor typos &amp; spelling variations are matched automatically!
                </p>
              </div>

              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer mt-3"
              >
                <span>Lock In Answer</span>
                <span className="text-xl">🔒</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Answer Submitted State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-purple-950/60 border border-amber-400/35 text-center space-y-3 shadow-inner"
        >
          <div className="flex items-center justify-center gap-2 text-amber-300 font-semibold text-base md:text-lg">
            <span>🔒 Your Answer:</span>
            <span className="font-bold font-display text-xl text-[#FFF9C4] underline decoration-amber-400/70">
              {mySubmittedAnswer || selectedOption || typedAnswer}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {partnerHasAnswered ? (
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-semibold animate-pulse">
                <span className="text-xl">✨</span>
                <span>Both answers submitted! Lighting the sky...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-200/80 text-sm font-medium">
                <div className="w-4 h-4 border-2 border-amber-400/80 border-t-transparent rounded-full animate-spin" />
                <span>Waiting for your partner to submit...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
