'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Player } from '@/lib/types';

interface LobbyScreenProps {
  roomCode: string;
  players: Player[];
  isHost: boolean;
  onProceedToSettings: () => void;
  onLeaveRoom: () => void;
}

export default function LobbyScreen({
  roomCode,
  players,
  isHost,
  onProceedToSettings,
  onLeaveRoom,
}: LobbyScreenProps) {
  const [copied, setCopied] = useState(false);

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(roomCode);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleCopyLink = async () => {
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const partnerJoined = players.length >= 2;

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 text-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md glass-panel border border-amber-500/25 shadow-2xl backdrop-blur-xl bg-purple-950/70"
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/20">
          <span className="text-xs uppercase tracking-wider text-amber-300 font-semibold">
            Game Lobby
          </span>
          <button
            onClick={onLeaveRoom}
            className="text-xs text-purple-300 hover:text-red-300 transition"
          >
            Leave Room
          </button>
        </div>

        {/* Room Code Card */}
        <div className="my-6 p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <p className="text-xs text-amber-200/70 uppercase tracking-wider font-medium">
            Share this Room Code with your Partner
          </p>
          <div className="mt-2 flex items-center justify-center gap-3">
            <span className="text-4xl font-mono font-black tracking-widest text-amber-300 glow-text-gold">
              {roomCode}
            </span>
          </div>

          <div className="mt-3 flex justify-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3 py-1.5 text-xs rounded-lg bg-amber-500/20 text-amber-200 border border-amber-500/40 hover:bg-amber-500/30 transition flex items-center gap-1.5"
            >
              <span>{copied ? '✓ Copied Code!' : '📋 Copy Code'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3 py-1.5 text-xs rounded-lg bg-purple-500/20 text-purple-200 border border-purple-500/40 hover:bg-purple-500/30 transition flex items-center gap-1.5"
            >
              <span>🔗 Copy Link</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3 mb-6 text-left">
          <p className="text-xs text-amber-200/70 uppercase tracking-wider font-semibold">
            Couple Connection ({players.length}/2)
          </p>

          <div className="space-y-2">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3 rounded-xl bg-purple-900/30 border border-purple-500/30"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-xl">
                    {player.isHost ? '👑' : '💖'}
                  </span>
                  <div>
                    <p className="font-semibold text-amber-100 text-sm">
                      {player.name}
                    </p>
                    <p className="text-[11px] text-purple-300/70">
                      {player.isHost ? 'Host' : 'Partner'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <span className="text-xs text-emerald-300 font-medium">
                    Ready
                  </span>
                </div>
              </div>
            ))}

            {!partnerJoined && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-black/20 border border-dashed border-amber-500/30">
                <div className="flex items-center gap-2.5 text-amber-200/50">
                  <span className="text-xl animate-pulse">🕯️</span>
                  <p className="text-sm italic">Waiting for your partner to join...</p>
                </div>
                <div className="w-4 h-4 border-2 border-amber-400/40 border-t-amber-400 rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {partnerJoined ? (
          isHost ? (
            <button
              onClick={onProceedToSettings}
              className="w-full btn-gold text-base py-3 flex items-center justify-center gap-2 cursor-pointer transition hover:scale-[1.02]"
            >
              <span>⚙️ Game Settings & Questions</span>
              <span>➔</span>
            </button>
          ) : (
            <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm flex items-center justify-center gap-2">
              <span className="animate-spin">✨</span>
              <span>Partner connected! Host is setting up the game...</span>
            </div>
          )
        ) : (
          <p className="text-xs text-purple-200/60 italic">
            Send the code to your partner so they can join on their phone or laptop!
          </p>
        )}
      </motion.div>
    </div>
  );
}
