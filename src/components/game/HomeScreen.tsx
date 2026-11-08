'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';

interface HomeScreenProps {
  onCreateRoom: (playerName: string) => Promise<void>;
  onJoinRoom: (roomCode: string, playerName: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export default function HomeScreen({
  onCreateRoom,
  onJoinRoom,
  isLoading,
  error,
}: HomeScreenProps) {
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>('initial');
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState('');
  const [localError, setLocalError] = useState<string | null>(null);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    setLocalError(null);
    await onCreateRoom(name.trim());
  };

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setLocalError('Please enter your name');
      return;
    }
    if (!roomCode.trim()) {
      setLocalError('Please enter the 6-character room code');
      return;
    }
    setLocalError(null);
    await onJoinRoom(roomCode.trim().toUpperCase(), name.trim());
  };

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center">
      {/* Decorative Diwali Diya Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-4"
      >
        <span className="text-6xl diya-glow">🪔</span>
      </motion.div>

      {/* Title */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, delay: 0.1 }}
      >
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-orange-400 to-amber-200 bg-clip-text text-transparent glow-text">
          Diwali Lanterns
        </h1>
        <p className="mt-2 text-lg md:text-xl text-amber-200/80 font-medium">
          A Romantic Trivia Game for Couples ✨
        </p>
        <p className="mt-1 text-sm text-purple-200/60 max-w-md mx-auto">
          Answer questions about each other. Every matching answer lights up a lantern in your shared Diwali skyline!
        </p>
      </motion.div>

      {/* Main Card */}
      <motion.div
        initial={{ opacity: 0, y: 25 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className="w-full max-w-md mt-8 glass-panel border border-amber-500/20 shadow-2xl backdrop-blur-xl bg-purple-950/60"
      >
        {(error || localError) && (
          <div className="mb-4 p-3 bg-red-500/20 border border-red-500/40 rounded-xl text-red-200 text-sm">
            {localError || error}
          </div>
        )}

        {mode === 'initial' && (
          <div className="space-y-4">
            <button
              onClick={() => setMode('create')}
              className="w-full btn-gold text-lg py-3.5 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.02]"
            >
              <span>🪔</span>
              <span>Create New Room</span>
            </button>
            <button
              onClick={() => setMode('join')}
              className="w-full btn-secondary text-lg py-3.5 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.02]"
            >
              <span>✨</span>
              <span>Join Partner&apos;s Room</span>
            </button>

            <div className="pt-4 border-t border-purple-500/20 text-xs text-amber-200/50 flex items-center justify-center gap-2">
              <span>🎆 200+ Couples Questions</span>
              <span>•</span>
              <span>GIF Skyline Export</span>
            </div>
          </div>
        )}

        {mode === 'create' && (
          <form onSubmit={handleCreate} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-amber-200/90 mb-1.5">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Priya or Rahul"
                maxLength={20}
                required
                className="input-diwali"
                autoFocus
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim()}
              className="w-full btn-gold text-lg py-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="animate-spin">✨</span>
              ) : (
                <>
                  <span>Create Room & Get Code</span>
                  <span>➔</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode('initial'); setLocalError(null); }}
              className="w-full text-center text-sm text-purple-300 hover:text-amber-200 transition"
            >
              ← Back
            </button>
          </form>
        )}

        {mode === 'join' && (
          <form onSubmit={handleJoin} className="space-y-4 text-left">
            <div>
              <label className="block text-sm font-medium text-amber-200/90 mb-1.5">
                Your Name / Nickname
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Ananya or Rohan"
                maxLength={20}
                required
                className="input-diwali"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-amber-200/90 mb-1.5">
                6-Digit Room Code
              </label>
              <input
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="e.g. DL7K9X"
                maxLength={6}
                required
                className="input-diwali uppercase tracking-widest text-center font-mono font-bold text-lg"
              />
            </div>

            <button
              type="submit"
              disabled={isLoading || !name.trim() || !roomCode.trim()}
              className="w-full btn-gold text-lg py-3 flex items-center justify-center gap-2 cursor-pointer"
            >
              {isLoading ? (
                <span className="animate-spin">✨</span>
              ) : (
                <>
                  <span>Join Partner</span>
                  <span>➔</span>
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => { setMode('initial'); setLocalError(null); }}
              className="w-full text-center text-sm text-purple-300 hover:text-amber-200 transition"
            >
              ← Back
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}
