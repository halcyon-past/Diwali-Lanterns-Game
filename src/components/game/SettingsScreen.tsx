'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameSettings, Question, QuestionType } from '@/lib/types';

interface SettingsScreenProps {
  settings: GameSettings;
  isHost: boolean;
  onUpdateSettings: (settings: Partial<GameSettings>) => void;
  onStartGame: () => void;
  onBackToLobby: () => void;
}

export default function SettingsScreen({
  settings,
  isHost,
  onUpdateSettings,
  onStartGame,
  onBackToLobby,
}: SettingsScreenProps) {
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [newQuestionText, setNewQuestionText] = useState('');
  const [newQuestionType, setNewQuestionType] = useState<QuestionType>('option');
  const [newOption1, setNewOption1] = useState('Him');
  const [newOption2, setNewOption2] = useState('Her');

  const handleToggleType = (type: QuestionType) => {
    if (!isHost) return;
    const currentTypes = [...settings.questionTypes];
    let nextTypes: QuestionType[];

    if (currentTypes.includes(type)) {
      if (currentTypes.length === 1) return;
      nextTypes = currentTypes.filter((t) => t !== type);
    } else {
      nextTypes = [...currentTypes, type];
    }

    onUpdateSettings({ questionTypes: nextTypes });
  };

  const handleAddCustomQuestion = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuestionText.trim()) return;

    const newQ: Question = {
      id: Date.now(),
      text: newQuestionText.trim(),
      type: newQuestionType,
      options: newQuestionType === 'option' ? [newOption1.trim() || 'Him', newOption2.trim() || 'Her'] : undefined,
      category: 'Custom Couple Question',
    };

    onUpdateSettings({
      customQuestions: [...settings.customQuestions, newQ],
    });

    setNewQuestionText('');
    setShowCustomModal(false);
  };

  const handleRemoveCustomQuestion = (id: number) => {
    if (!isHost) return;
    onUpdateSettings({
      customQuestions: settings.customQuestions.filter((q) => q.id !== id),
    });
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-lg p-7 md:p-9 glow-card text-left relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/25">
          <div>
            <h2 className="text-2xl font-bold font-display text-[#FFE082] glow-text-gold">
              Game Settings
            </h2>
            <p className="text-xs text-purple-200/70 mt-0.5">
              {isHost ? 'Tune questions and rules for your session' : 'Host is configuring the game'}
            </p>
          </div>
          <button
            onClick={onBackToLobby}
            className="text-xs text-purple-300 hover:text-amber-200 transition cursor-pointer"
          >
            ← Back
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Question Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-bold text-[#FFF9C4] flex items-center gap-1.5">
                <span>🎯</span>
                <span>Question Count</span>
              </label>
              <span className="px-3 py-1 text-xs font-black rounded-lg bg-amber-500/25 text-[#FFE082] border border-amber-400/50 shadow-sm">
                {settings.questionCount} Questions
              </span>
            </div>
            {isHost ? (
              <input
                type="range"
                min="5"
                max="50"
                step="5"
                value={settings.questionCount}
                onChange={(e) =>
                  onUpdateSettings({ questionCount: parseInt(e.target.value) })
                }
                className="w-full accent-amber-400 cursor-pointer h-2 bg-purple-950 rounded-lg"
              />
            ) : (
              <div className="h-2 bg-purple-950 rounded-full overflow-hidden border border-purple-500/30">
                <div
                  className="h-full bg-gradient-to-r from-amber-400 to-orange-400 rounded-full"
                  style={{ width: `${(settings.questionCount / 50) * 100}%` }}
                />
              </div>
            )}
            <div className="flex justify-between text-[11px] text-amber-200/50 mt-1.5">
              <span>Quick (5)</span>
              <span>Classic (15)</span>
              <span>Marathon (50)</span>
            </div>
          </div>

          {/* Question Formats */}
          <div>
            <label className="text-sm font-bold text-[#FFF9C4] block mb-2 flex items-center gap-1.5">
              <span>🎲</span>
              <span>Question Formats Included</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleType('option')}
                disabled={!isHost}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.questionTypes.includes('option')
                    ? 'bg-amber-500/20 border-amber-400/80 text-[#FFF9C4] shadow-[0_0_15px_rgba(255,183,77,0.2)]'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-300/50'
                } ${isHost ? 'cursor-pointer hover:border-amber-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-display">Him / Her Choices</span>
                  <span className="text-amber-400 font-bold">{settings.questionTypes.includes('option') ? '✓' : ''}</span>
                </div>
                <p className="text-[11px] mt-1 text-purple-200/70">
                  Pick between Him or Her for fun couple debates
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleType('text')}
                disabled={!isHost}
                className={`p-4 rounded-xl border text-left transition-all ${
                  settings.questionTypes.includes('text')
                    ? 'bg-amber-500/20 border-amber-400/80 text-[#FFF9C4] shadow-[0_0_15px_rgba(255,183,77,0.2)]'
                    : 'bg-purple-950/40 border-purple-500/20 text-purple-300/50'
                } ${isHost ? 'cursor-pointer hover:border-amber-400' : ''}`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm font-display">1-Word Answers</span>
                  <span className="text-amber-400 font-bold">{settings.questionTypes.includes('text') ? '✓' : ''}</span>
                </div>
                <p className="text-[11px] mt-1 text-purple-200/70">
                  Type 1 word (fuzzy typo tolerance included)
                </p>
              </button>
            </div>
          </div>

          {/* Question Bank & Custom Questions */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-bold text-[#FFF9C4] flex items-center gap-1.5">
                <span>📚</span>
                <span>Question Bank</span>
              </label>
              {isHost && (
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-3 py-1 text-xs font-semibold rounded-lg bg-amber-500/20 text-[#FFE082] border border-amber-400/40 hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1"
                >
                  <span>+ Add Custom</span>
                </button>
              )}
            </div>

            <div className="p-3.5 rounded-xl bg-purple-950/60 border border-purple-500/25 space-y-2 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-purple-200 font-medium">
                  Default 200 Questions Bank:
                </span>
                <span className="text-[#FFE082] font-bold">Enabled</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-purple-200 font-medium">Custom Questions:</span>
                <span className="text-[#FFE082] font-bold">
                  {settings.customQuestions.length} added
                </span>
              </div>
            </div>

            {settings.customQuestions.length > 0 && (
              <div className="mt-2.5 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {settings.customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between text-xs p-2.5 rounded-lg bg-black/40 border border-amber-500/25 text-amber-100"
                  >
                    <span className="truncate max-w-[280px]">“{q.text}”</span>
                    {isHost && (
                      <button
                        onClick={() => handleRemoveCustomQuestion(q.id)}
                        className="text-red-400 hover:text-red-300 ml-2 font-bold cursor-pointer"
                      >
                        ✕
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Start Game Button */}
        {isHost ? (
          <button
            onClick={onStartGame}
            className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>🪔 Start Diwali Trivia</span>
            <span>➔</span>
          </button>
        ) : (
          <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-center text-amber-200 text-sm font-medium">
            Host is finalizing settings. Game will start shortly! ✨
          </div>
        )}
      </motion.div>

      {/* Custom Question Modal */}
      <AnimatePresence>
        {showCustomModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md p-6 md:p-8 glow-card glow-card-gold text-left space-y-4"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-bold font-display text-[#FFE082] text-xl">
                  Add Custom Couple Question
                </h3>
                <button
                  onClick={() => setShowCustomModal(false)}
                  className="text-purple-300 hover:text-white cursor-pointer text-lg"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleAddCustomQuestion} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5">
                    Question Text
                  </label>
                  <input
                    type="text"
                    value={newQuestionText}
                    onChange={(e) => setNewQuestionText(e.target.value)}
                    placeholder="e.g. Who hogs the blanket at night?"
                    required
                    className="input-royal text-sm"
                    autoFocus
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-1.5">
                    Answer Format
                  </label>
                  <select
                    value={newQuestionType}
                    onChange={(e) =>
                      setNewQuestionType(e.target.value as QuestionType)
                    }
                    className="input-royal text-sm cursor-pointer"
                  >
                    <option value="option">Choice (Him / Her or Custom Options)</option>
                    <option value="text">1-Word Written Answer (Fuzzy Match)</option>
                  </select>
                </div>

                {newQuestionType === 'option' && (
                  <div className="grid grid-cols-2 gap-2.5">
                    <div>
                      <label className="block text-[11px] text-amber-200/80 mb-1">
                        Option 1
                      </label>
                      <input
                        type="text"
                        value={newOption1}
                        onChange={(e) => setNewOption1(e.target.value)}
                        placeholder="Him"
                        className="input-royal text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] text-amber-200/80 mb-1">
                        Option 2
                      </label>
                      <input
                        type="text"
                        value={newOption2}
                        onChange={(e) => setNewOption2(e.target.value)}
                        placeholder="Her"
                        className="input-royal text-xs"
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-3 pt-3">
                  <button
                    type="button"
                    onClick={() => setShowCustomModal(false)}
                    className="w-1/2 btn-royal-amethyst py-3 text-sm cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={!newQuestionText.trim()}
                    className="w-1/2 btn-royal-gold py-3 text-sm font-bold cursor-pointer"
                  >
                    Add Question
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
