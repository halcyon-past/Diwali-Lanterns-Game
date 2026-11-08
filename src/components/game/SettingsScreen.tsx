'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
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
      if (currentTypes.length === 1) return; // Must have at least one type
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
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-lg glass-panel border border-amber-500/25 shadow-2xl backdrop-blur-xl bg-purple-950/75 text-left"
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <div>
            <h2 className="text-xl font-bold text-amber-200 glow-text-gold">
              Game Settings
            </h2>
            <p className="text-xs text-purple-300/80">
              {isHost ? 'Configure trivia rules for your session' : 'Host is configuring the game'}
            </p>
          </div>
          <button
            onClick={onBackToLobby}
            className="text-xs text-purple-300 hover:text-amber-200 transition"
          >
            ← Lobby
          </button>
        </div>

        <div className="py-5 space-y-6">
          {/* Question Count Slider */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-semibold text-amber-100 flex items-center gap-1.5">
                <span>🎯</span>
                <span>Number of Questions</span>
              </label>
              <span className="px-2.5 py-1 text-xs font-bold rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40">
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
                className="w-full accent-amber-500 cursor-pointer"
              />
            ) : (
              <div className="h-2 bg-purple-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-amber-500 rounded-full"
                  style={{ width: `${(settings.questionCount / 50) * 100}%` }}
                />
              </div>
            )}
            <div className="flex justify-between text-[11px] text-purple-300/60 mt-1">
              <span>Quick (5)</span>
              <span>Standard (15)</span>
              <span>Marathon (50)</span>
            </div>
          </div>

          {/* Question Types */}
          <div>
            <label className="text-sm font-semibold text-amber-100 block mb-2 flex items-center gap-1.5">
              <span>🎲</span>
              <span>Question Formats</span>
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleToggleType('option')}
                disabled={!isHost}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.questionTypes.includes('option')
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-100 shadow-md'
                    : 'bg-purple-900/20 border-purple-500/20 text-purple-300/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">Him / Her Choices</span>
                  <span>{settings.questionTypes.includes('option') ? '✓' : ''}</span>
                </div>
                <p className="text-[11px] mt-1 text-purple-200/70">
                  Pick between Him or Her for fun debates
                </p>
              </button>

              <button
                type="button"
                onClick={() => handleToggleType('text')}
                disabled={!isHost}
                className={`p-3 rounded-xl border text-left transition ${
                  settings.questionTypes.includes('text')
                    ? 'bg-amber-500/20 border-amber-500/60 text-amber-100 shadow-md'
                    : 'bg-purple-900/20 border-purple-500/20 text-purple-300/60'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-sm">1-Word Answers</span>
                  <span>{settings.questionTypes.includes('text') ? '✓' : ''}</span>
                </div>
                <p className="text-[11px] mt-1 text-purple-200/70">
                  Type 1 word (fuzzy typo matching included)
                </p>
              </button>
            </div>
          </div>

          {/* Question Source: Default vs Custom */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm font-semibold text-amber-100 flex items-center gap-1.5">
                <span>📚</span>
                <span>Question Bank</span>
              </label>
              {isHost && (
                <button
                  onClick={() => setShowCustomModal(true)}
                  className="px-2.5 py-1 text-xs rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/40 hover:bg-purple-500/30 transition flex items-center gap-1"
                >
                  <span>+ Add Custom</span>
                </button>
              )}
            </div>

            <div className="p-3 rounded-xl bg-purple-900/30 border border-purple-500/20 space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-200">
                  Default 200 Questions Bank:
                </span>
                <span className="text-amber-300 font-semibold">Enabled</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-purple-200">Custom Couple Questions:</span>
                <span className="text-amber-300 font-semibold">
                  {settings.customQuestions.length} added
                </span>
              </div>
            </div>

            {settings.customQuestions.length > 0 && (
              <div className="mt-2 space-y-1.5 max-h-32 overflow-y-auto pr-1">
                {settings.customQuestions.map((q) => (
                  <div
                    key={q.id}
                    className="flex items-center justify-between text-xs p-2 rounded-lg bg-black/30 border border-amber-500/20 text-amber-100"
                  >
                    <span className="truncate max-w-[280px]">“{q.text}”</span>
                    {isHost && (
                      <button
                        onClick={() => handleRemoveCustomQuestion(q.id)}
                        className="text-red-400 hover:text-red-300 ml-2"
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
            className="w-full btn-gold text-lg py-3.5 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.02] shadow-xl"
          >
            <span>🪔 Start Diwali Trivia</span>
            <span>➔</span>
          </button>
        ) : (
          <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-center text-amber-200 text-sm">
            Host is adjusting settings. Game will start shortly! ✨
          </div>
        )}
      </motion.div>

      {/* Custom Question Modal */}
      {showCustomModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md glass-panel border border-amber-500/40 p-6 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-amber-200 text-lg">
                Add Custom Couple Question
              </h3>
              <button
                onClick={() => setShowCustomModal(false)}
                className="text-purple-300 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAddCustomQuestion} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  Question Text
                </label>
                <input
                  type="text"
                  value={newQuestionText}
                  onChange={(e) => setNewQuestionText(e.target.value)}
                  placeholder="e.g. Who takes longer in the shower?"
                  required
                  className="input-diwali text-sm"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200/90 mb-1">
                  Answer Type
                </label>
                <select
                  value={newQuestionType}
                  onChange={(e) =>
                    setNewQuestionType(e.target.value as QuestionType)
                  }
                  className="input-diwali text-sm"
                >
                  <option value="option">Multiple Choice (Options)</option>
                  <option value="text">1-Word Written Answer (Fuzzy Match)</option>
                </select>
              </div>

              {newQuestionType === 'option' && (
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] text-purple-200 mb-1">
                      Option 1
                    </label>
                    <input
                      type="text"
                      value={newOption1}
                      onChange={(e) => setNewOption1(e.target.value)}
                      placeholder="Him"
                      className="input-diwali text-xs"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-purple-200 mb-1">
                      Option 2
                    </label>
                    <input
                      type="text"
                      value={newOption2}
                      onChange={(e) => setNewOption2(e.target.value)}
                      placeholder="Her"
                      className="input-diwali text-xs"
                    />
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(false)}
                  className="w-1/2 btn-secondary py-2 text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!newQuestionText.trim()}
                  className="w-1/2 btn-gold py-2 text-sm font-semibold"
                >
                  Add Question
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
