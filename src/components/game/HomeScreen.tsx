'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface HomeScreenProps {
  onCreateRoom: (playerName: string) => Promise<void>;
  onJoinRoom: (roomCode: string, playerName: string) => Promise<void>;
  onStartPassAndPlay?: () => void;
  isLoading: boolean;
  error: string | null;
  initialRoomCode?: string;
}

export default function HomeScreen({
  onCreateRoom,
  onJoinRoom,
  onStartPassAndPlay,
  isLoading,
  error,
  initialRoomCode = '',
}: HomeScreenProps) {
  const [mode, setMode] = useState<'initial' | 'create' | 'join'>(
    initialRoomCode ? 'join' : 'initial'
  );
  const [name, setName] = useState('');
  const [roomCode, setRoomCode] = useState(initialRoomCode ? initialRoomCode.toUpperCase() : '');
  const [localError, setLocalError] = useState<string | null>(null);

  useEffect(() => {
    if (initialRoomCode) {
      setRoomCode(initialRoomCode.toUpperCase());
      setMode('join');
    }
  }, [initialRoomCode]);

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
      {/* Decorative Golden Mandala Sparkle */}
      <div className="mb-3">
        <span className="text-6xl md:text-7xl diya-flame inline-block">🪔</span>
      </div>

      {/* Main Title Banner */}
      <div className="max-w-2xl mx-auto">
        <h1 className="text-5xl md:text-7xl font-bold font-display tracking-tight glow-title drop-shadow-2xl">
          Diwali Lanterns
        </h1>
        <p className="mt-2 text-xl md:text-2xl text-[#FFE082] font-display italic font-semibold drop-shadow-md">
          A Romantic Skyline Trivia for Couples ✨
        </p>
        <p className="mt-3 text-sm md:text-base text-purple-100 max-w-lg mx-auto font-medium leading-relaxed drop-shadow">
          Answer intimate questions about each other. With every matching answer, a warm paper lantern floats from the city into your shared midnight skyline!
        </p>
      </div>

      {/* Central Glassmorphism Card */}
      <div className="w-full max-w-md mt-8 p-7 md:p-9 glow-card relative overflow-hidden shadow-2xl">
        {/* Subtle decorative golden corner accents */}
        <div className="absolute top-2 left-2 text-[#FFE082]/30 text-xs">✦</div>
        <div className="absolute top-2 right-2 text-[#FFE082]/30 text-xs">✦</div>
        <div className="absolute bottom-2 left-2 text-[#FFE082]/30 text-xs">✦</div>
        <div className="absolute bottom-2 right-2 text-[#FFE082]/30 text-xs">✦</div>

        {(error || localError) && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            className="mb-5 p-3 rounded-xl bg-red-950/70 border border-red-500/40 text-red-200 text-xs md:text-sm text-left"
          >
            {localError || error}
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {mode === 'initial' && (
            <motion.div
              key="initial"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 10 }}
              className="space-y-4"
            >
              <button
                onClick={() => setMode('create')}
                className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="text-2xl">🪔</span>
                <span className="tracking-wide">Create New Room</span>
                <span className="text-xl">➔</span>
              </button>

              <button
                onClick={() => setMode('join')}
                className="w-full btn-royal-amethyst py-4 px-6 text-lg flex items-center justify-center gap-3 cursor-pointer"
              >
                <span className="text-2xl">✨</span>
                <span className="tracking-wide">Join Partner&apos;s Room</span>
                <span className="text-xl">➔</span>
              </button>

              {onStartPassAndPlay && (
                <button
                  type="button"
                  onClick={onStartPassAndPlay}
                  className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold text-amber-200/90 hover:text-amber-100 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 transition cursor-pointer flex items-center justify-center gap-2"
                >
                  <span>📱 Sitting together? Play Pass &amp; Play on 1 phone</span>
                </button>
              )}

              <div className="pt-4 border-t border-purple-500/20 text-xs text-amber-200/60 flex items-center justify-center gap-3">
                <span>🎆 200+ Questions</span>
                <span>•</span>
                <span>✨ Fuzzy Match</span>
                <span>•</span>
                <span>🎁 GIF Export</span>
              </div>
            </motion.div>
          )}

          {mode === 'create' && (
            <motion.form
              key="create"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleCreate}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-2">
                  Your Name / Sweet Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Priya or Rahul"
                  maxLength={20}
                  required
                  className="input-royal font-medium"
                  autoFocus
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim()}
                className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="animate-spin text-2xl">✨</span>
                ) : (
                  <>
                    <span>Generate Room Code</span>
                    <span>➔</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('initial'); setLocalError(null); }}
                className="w-full text-center text-xs text-purple-300 hover:text-amber-200 transition py-2 cursor-pointer"
              >
                ← Back to Menu
              </button>
            </motion.form>
          )}

          {mode === 'join' && (
            <motion.form
              key="join"
              initial={{ opacity: 0, x: 10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              onSubmit={handleJoin}
              className="space-y-4 text-left"
            >
              <div>
                <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-2">
                  Your Name / Sweet Nickname
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Ananya or Rohan"
                  maxLength={20}
                  required
                  className="input-royal font-medium"
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-amber-200/90 uppercase tracking-wider mb-2">
                  6-Letter Room Code
                </label>
                <input
                  type="text"
                  value={roomCode}
                  onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                  placeholder="e.g. DL7K9X"
                  maxLength={6}
                  required
                  className="input-royal uppercase tracking-widest text-center font-mono font-bold text-2xl text-[#FFE082]"
                />
              </div>

              <button
                type="submit"
                disabled={isLoading || !name.trim() || !roomCode.trim()}
                className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer mt-4"
              >
                {isLoading ? (
                  <span className="animate-spin text-2xl">✨</span>
                ) : (
                  <>
                    <span>Enter Partner&apos;s Room</span>
                    <span>➔</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => { setMode('initial'); setLocalError(null); }}
                className="w-full text-center text-xs text-purple-300 hover:text-amber-200 transition py-2 cursor-pointer"
              >
                ← Back to Menu
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
