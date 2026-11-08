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
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.4 }}
      className="w-full max-w-xl glass-panel border border-amber-500/30 shadow-2xl backdrop-blur-xl bg-purple-950/80 p-6 md:p-8"
    >
      {/* Category and Progress Bar */}
      <div className="flex items-center justify-between mb-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
          ✨ {question.category}
        </span>
        <span className="text-xs text-purple-300 font-medium">
          Question {questionNumber} of {totalQuestions}
        </span>
      </div>

      {/* Progress Line */}
      <div className="w-full h-1.5 bg-purple-900/60 rounded-full mb-6 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-500 rounded-full"
          style={{ width: `${(questionNumber / totalQuestions) * 100}%` }}
        />
      </div>

      {/* Question Text */}
      <div className="my-6 text-center">
        <h2 className="text-2xl md:text-3xl font-extrabold text-amber-100 leading-snug">
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
                  className="py-4 px-6 rounded-2xl bg-gradient-to-br from-purple-900/60 to-purple-950/90 border border-amber-500/30 text-amber-100 font-bold text-lg md:text-xl shadow-lg transition hover:scale-105 hover:border-amber-400 hover:shadow-amber-500/20 active:scale-95 cursor-pointer"
                >
                  <span className="mr-2">
                    {opt.toLowerCase().includes('him') ? '👨' : opt.toLowerCase().includes('her') ? '👩' : '✨'}
                  </span>
                  <span>{opt}</span>
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
                  placeholder="Type your answer (1 word)..."
                  maxLength={35}
                  required
                  autoFocus
                  className="input-diwali text-center text-lg md:text-xl font-bold text-amber-200 placeholder:font-normal placeholder:text-base"
                />
                <p className="text-[12px] text-center text-purple-300/70 mt-2">
                  💡 One-word answer • Minor typos & spelling variations are matched automatically!
                </p>
              </div>

              <button
                type="submit"
                disabled={!typedAnswer.trim()}
                className="w-full btn-gold text-lg py-3.5 flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Lock In Answer</span>
                <span>🔒</span>
              </button>
            </form>
          )}
        </div>
      ) : (
        /* Answer Submitted State */
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 p-6 rounded-2xl bg-purple-900/40 border border-amber-500/30 text-center space-y-3"
        >
          <div className="flex items-center justify-center gap-2 text-amber-300 font-semibold text-lg">
            <span>🔒 Answer Locked:</span>
            <span className="font-bold underline decoration-amber-400 text-amber-100">
              {mySubmittedAnswer || selectedOption || typedAnswer}
            </span>
          </div>

          <div className="pt-2 flex items-center justify-center gap-3">
            {partnerHasAnswered ? (
              <div className="flex items-center gap-2 text-emerald-300 text-sm font-medium">
                <span className="text-xl">✨</span>
                <span>Both answers in! Revealing...</span>
              </div>
            ) : (
              <div className="flex items-center gap-2 text-amber-200/80 text-sm italic">
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                <span>Waiting for your partner to answer...</span>
              </div>
            )}
          </div>
        </motion.div>
      )}
    </motion.div>
  );
}
