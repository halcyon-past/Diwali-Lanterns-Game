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
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="w-full max-w-md p-7 md:p-9 glow-card relative overflow-hidden"
      >
        <div className="flex items-center justify-between pb-4 border-b border-purple-500/25">
          <span className="text-xs uppercase tracking-wider text-[#FFE082] font-bold">
            ✦ Sacred Room Lobby
          </span>
          <button
            onClick={onLeaveRoom}
            className="text-xs text-purple-300 hover:text-red-300 transition cursor-pointer"
          >
            Leave
          </button>
        </div>

        {/* Room Code Showcase */}
        <div className="my-6 p-5 rounded-2xl bg-black/40 border border-amber-400/30 text-center shadow-inner">
          <p className="text-xs text-amber-200/70 uppercase tracking-widest font-semibold">
            Invite Your Partner With This Code
          </p>
          <div className="mt-2.5 flex items-center justify-center">
            <span className="text-5xl font-mono font-black tracking-widest text-[#FFE082] glow-text-gold">
              {roomCode}
            </span>
          </div>

          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={handleCopyCode}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-amber-500/20 text-[#FFE082] border border-amber-400/40 hover:bg-amber-500/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>{copied ? '✓ Copied!' : '📋 Copy Code'}</span>
            </button>
            <button
              onClick={handleCopyLink}
              className="px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-purple-500/20 text-purple-200 border border-purple-400/40 hover:bg-purple-500/30 transition cursor-pointer flex items-center gap-1.5"
            >
              <span>🔗 Copy Link</span>
            </button>
          </div>
        </div>

        {/* Players List */}
        <div className="space-y-3 mb-6 text-left">
          <p className="text-xs text-amber-200/70 uppercase tracking-wider font-bold">
            Connected Couple ({players.length}/2)
          </p>

          <div className="space-y-2.5">
            {players.map((player) => (
              <div
                key={player.id}
                className="flex items-center justify-between p-3.5 rounded-xl bg-purple-900/40 border border-amber-500/25 shadow-sm"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl filter drop-shadow">
                    {player.isHost ? '👑' : '💖'}
                  </span>
                  <div>
                    <p className="font-bold text-[#FFF9C4] text-sm">
                      {player.name}
                    </p>
                    <p className="text-[11px] text-purple-200/70">
                      {player.isHost ? 'Host' : 'Partner'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(74,222,128,0.9)] animate-pulse" />
                  <span className="text-xs text-emerald-300 font-bold">
                    Connected
                  </span>
                </div>
              </div>
            ))}

            {!partnerJoined && (
              <div className="flex items-center justify-between p-3.5 rounded-xl bg-black/30 border border-dashed border-amber-400/40">
                <div className="flex items-center gap-3 text-amber-200/70">
                  <span className="text-2xl animate-pulse">🕯️</span>
                  <p className="text-xs md:text-sm italic">Waiting for your partner to enter the room...</p>
                </div>
                <div className="w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
              </div>
            )}
          </div>
        </div>

        {/* Action Button */}
        {partnerJoined ? (
          isHost ? (
            <button
              onClick={onProceedToSettings}
              className="w-full btn-royal-gold py-4 px-6 text-lg flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>⚙️ Game Settings &amp; Questions</span>
              <span>➔</span>
            </button>
          ) : (
            <div className="p-3.5 rounded-xl bg-amber-500/15 border border-amber-400/30 text-amber-200 text-sm flex items-center justify-center gap-2 font-medium">
              <span className="animate-spin text-lg">✨</span>
              <span>Both connected! Host is configuring questions...</span>
            </div>
          )
        ) : (
          <p className="text-xs text-purple-200/70 italic">
            Share the code with your partner so they can join on their device!
          </p>
        )}
      </motion.div>
    </div>
  );
}
