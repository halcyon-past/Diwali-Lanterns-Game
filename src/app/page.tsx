'use client';

import { useRef, useState, useEffect } from 'react';
import SkylineCanvas, { SkylineCanvasHandle } from '@/components/canvas/SkylineCanvas';
import HomeScreen from '@/components/game/HomeScreen';
import LobbyScreen from '@/components/game/LobbyScreen';
import SettingsScreen from '@/components/game/SettingsScreen';
import GameScreen from '@/components/game/GameScreen';
import ResultsScreen from '@/components/game/ResultsScreen';
import { useGameRoom } from '@/hooks/useGameRoom';
import { GameState, GameSettings, DEFAULT_SETTINGS, Question } from '@/lib/types';
import { getRandomQuestions } from '@/lib/questions';
import { answersMatch } from '@/lib/fuzzyMatch';
import { diwaliAudio } from '@/lib/diwaliAudio';

export default function Page() {
  const skylineRef = useRef<SkylineCanvasHandle>(null);

  // Online Multiplayer state (via WebSockets / Pusher)
  const {
    gameState: onlineState,
    playerId: onlinePlayerId,
    playerName: onlinePlayerName,
    isHost: onlineIsHost,
    error: onlineError,
    createRoom,
    joinRoom,
    updateSettings: updateOnlineSettings,
    startGame: startOnlineGame,
    submitAnswer: submitOnlineAnswer,
    nextQuestion: nextOnlineQuestion,
    leaveRoom: leaveOnlineRoom,
  } = useGameRoom();

  // Mode: 'online' or 'local' (Pass-and-play / Demo mode on 1 device)
  const [playMode, setPlayMode] = useState<'online' | 'local'>('online');
  const [inLobbySettings, setInLobbySettings] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Local Pass & Play State
  const [localPlayer1, setLocalPlayer1] = useState('Partner 1');
  const [localPlayer2, setLocalPlayer2] = useState('Partner 2');
  const [localTurn, setLocalTurn] = useState<1 | 2>(1);
  const [localSettings, setLocalSettings] = useState<GameSettings>(DEFAULT_SETTINGS);
  const [localQuestions, setLocalQuestions] = useState<Question[]>([]);
  const [localCurrentIndex, setLocalCurrentIndex] = useState(0);
  const [localPhase, setLocalPhase] = useState<'home' | 'settings' | 'p1_answering' | 'p2_answering' | 'reveal' | 'results'>('home');
  const [localP1Answer, setLocalP1Answer] = useState('');
  const [localP2Answer, setLocalP2Answer] = useState('');
  const [localMatchedQuestions, setLocalMatchedQuestions] = useState<number[]>([]);
  const [localLanternCount, setLocalLanternCount] = useState(0);
  const [isMusicPlaying, setIsMusicPlaying] = useState(false);

  const handleToggleMusic = () => {
    const playing = diwaliAudio.toggle();
    setIsMusicPlaying(playing);
  };

  // Auto-launch lantern in canvas when match happens in online mode
  const prevMatchedCountRef = useRef(0);
  useEffect(() => {
    if (playMode === 'online') {
      const currentMatched = onlineState.matchedQuestions.length;
      if (currentMatched > prevMatchedCountRef.current) {
        const lastIdx = onlineState.matchedQuestions[currentMatched - 1];
        skylineRef.current?.addLantern(lastIdx);
        diwaliAudio.playCelebrationChime();
        diwaliAudio.playLanternAscent();
        prevMatchedCountRef.current = currentMatched;
      }
    }
  }, [onlineState.matchedQuestions, playMode]);

  // Clear lanterns if room resets or leaves
  useEffect(() => {
    if (playMode === 'online' && (!onlineState.roomId || onlineState.phase === 'lobby')) {
      prevMatchedCountRef.current = 0;
      skylineRef.current?.clearLanterns();
    }
  }, [onlineState.roomId, onlineState.phase, playMode]);

  // URL room invite param
  const [invitedRoomCode, setInvitedRoomCode] = useState('');

  // Handle URL pre-fill for ?room=XXXXXX
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const roomParam = params.get('room');
      if (roomParam) {
        setInvitedRoomCode(roomParam.trim().toUpperCase());
      }
    }
  }, []);

  // Online actions
  const handleCreateRoom = async (name: string) => {
    setIsLoading(true);
    try {
      setPlayMode('online');
      await createRoom(name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleJoinRoom = async (code: string, name: string) => {
    setIsLoading(true);
    try {
      setPlayMode('online');
      await joinRoom(code, name);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Local Mode Handlers
  const handleStartLocalMode = () => {
    setPlayMode('local');
    setLocalPhase('settings');
  };

  const handleStartLocalGame = () => {
    skylineRef.current?.clearLanterns();
    const qs = getRandomQuestions(
      localSettings.questionCount,
      localSettings.questionTypes,
      localSettings.customQuestions
    );
    setLocalQuestions(qs);
    setLocalCurrentIndex(0);
    setLocalMatchedQuestions([]);
    setLocalLanternCount(0);
    setLocalTurn(1);
    setLocalP1Answer('');
    setLocalP2Answer('');
    setLocalPhase('p1_answering');
  };

  const handleLocalSubmitAnswer = (answer: string) => {
    if (localTurn === 1) {
      setLocalP1Answer(answer);
      setLocalTurn(2);
      setLocalPhase('p2_answering');
    } else {
      setLocalP2Answer(answer);
      const currentQ = localQuestions[localCurrentIndex];
      const matched = answersMatch(localP1Answer, answer, currentQ.type);

      if (matched) {
        setLocalMatchedQuestions((prev) => [...prev, localCurrentIndex]);
        setLocalLanternCount((prev) => prev + 1);
        skylineRef.current?.addLantern(localCurrentIndex);
        diwaliAudio.playCelebrationChime();
        diwaliAudio.playLanternAscent();
      }

      setLocalPhase('reveal');
    }
  };

  const handleLocalNextQuestion = () => {
    const nextIdx = localCurrentIndex + 1;
    if (nextIdx >= localQuestions.length) {
      setLocalPhase('results');
    } else {
      setLocalCurrentIndex(nextIdx);
      setLocalTurn(1);
      setLocalP1Answer('');
      setLocalP2Answer('');
      setLocalPhase('p1_answering');
    }
  };

  const handlePlayAgain = () => {
    skylineRef.current?.clearLanterns();
    if (playMode === 'online') {
      leaveOnlineRoom();
    }
    setLocalPhase('home');
    setPlayMode('online');
    setInLobbySettings(false);
  };

  // Determine current active view
  const isOnlineActive = playMode === 'online' && onlineState.roomId;

  return (
    <main className="relative w-screen h-screen overflow-hidden select-none bg-[#0a0015]">
      {/* Background Skyline Canvas with Stars & Floating Lanterns */}
      <div className="absolute inset-0 z-0">
        <SkylineCanvas
          ref={skylineRef}
          showLanternCount={
            isOnlineActive
              ? onlineState.phase === 'playing' || onlineState.phase === 'reveal'
              : localPhase === 'p1_answering' || localPhase === 'p2_answering' || localPhase === 'reveal'
          }
          lanternCount={
            isOnlineActive
              ? onlineState.matchedQuestions.length
              : localLanternCount
          }
          totalQuestions={
            isOnlineActive
              ? onlineState.totalQuestions
              : localQuestions.length
          }
        />
      </div>

      {/* Top Header Navigation */}
      <header className="absolute top-4 inset-x-4 md:inset-x-8 z-20 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-2 md:gap-3">
          <div className="px-3.5 py-1.5 rounded-full bg-black/55 border border-amber-400/35 backdrop-blur-md text-xs text-[#FFE082] flex items-center gap-2 shadow-lg">
            <span className="diya-flame">🪔</span>
            <span className="font-semibold tracking-widest uppercase font-display text-[11px]">Happy Diwali ✨</span>
          </div>

          {/* Lanterns Score Badge - Positioned cleanly on left header, never covered by music button */}
          {((isOnlineActive && (onlineState.phase === 'playing' || onlineState.phase === 'reveal')) ||
            (!isOnlineActive && (localPhase === 'p1_answering' || localPhase === 'p2_answering' || localPhase === 'reveal'))) && (
            <div className="px-3.5 py-1.5 rounded-full bg-amber-950/70 border border-amber-400/50 backdrop-blur-md text-xs flex items-center gap-2 shadow-[0_0_15px_rgba(255,183,77,0.35)] transition-all">
              <span className="text-sm animate-pulse">🏮</span>
              <span className="font-bold font-mono text-[#FFE082] text-xs md:text-sm">
                {isOnlineActive ? onlineState.matchedQuestions.length : localLanternCount} /{' '}
                {isOnlineActive ? onlineState.totalQuestions : localQuestions.length}
              </span>
              <span className="text-[10px] md:text-[11px] text-amber-200/90 font-medium hidden sm:inline">
                Lanterns Floating
              </span>
            </div>
          )}
        </div>

        <div className="pointer-events-auto flex items-center gap-3">
          <button
            onClick={handleToggleMusic}
            aria-label="Toggle festive background music"
            className={`px-3.5 py-1.5 rounded-full border backdrop-blur-md text-xs flex items-center gap-2 shadow-lg transition active:scale-95 cursor-pointer ${
              isMusicPlaying
                ? 'bg-amber-500/20 border-amber-400/60 text-amber-200 shadow-amber-500/20'
                : 'bg-black/55 hover:bg-black/75 border-amber-400/35 hover:border-amber-400/60 text-[#FFE082]'
            }`}
          >
            <span className={isMusicPlaying ? 'animate-bounce text-sm' : 'text-sm'}>
              {isMusicPlaying ? '🎶' : '🔇'}
            </span>
            <span className="font-medium text-[11px] tracking-wide">
              {isMusicPlaying ? 'Diwali Music: Playing ✨' : 'Play Diwali Music 🎵'}
            </span>
          </button>
        </div>
      </header>


      {/* Online Flow Screens */}
      {playMode === 'online' && (
        <>
          {/* Home / Landing */}
          {!onlineState.roomId && (
            <HomeScreen
              onCreateRoom={handleCreateRoom}
              onJoinRoom={handleJoinRoom}
              onStartPassAndPlay={handleStartLocalMode}
              isLoading={isLoading}
              error={onlineError}
              initialRoomCode={invitedRoomCode}
            />
          )}

          {/* Lobby */}
          {onlineState.roomId && onlineState.phase === 'lobby' && !inLobbySettings && (
            <LobbyScreen
              roomCode={onlineState.roomId}
              players={onlineState.players}
              isHost={onlineIsHost}
              onProceedToSettings={() => setInLobbySettings(true)}
              onLeaveRoom={leaveOnlineRoom}
            />
          )}

          {/* Settings */}
          {onlineState.roomId && (onlineState.phase === 'settings' || (onlineState.phase === 'lobby' && inLobbySettings)) && (
            <SettingsScreen
              settings={onlineState.settings}
              isHost={onlineIsHost}
              onUpdateSettings={updateOnlineSettings}
              onStartGame={() => {
                setInLobbySettings(false);
                startOnlineGame();
              }}
              onBackToLobby={() => setInLobbySettings(false)}
            />
          )}

          {/* Game Playing & Reveal */}
          {onlineState.roomId && (onlineState.phase === 'playing' || onlineState.phase === 'reveal') && (
            <GameScreen
              gameState={onlineState}
              playerId={onlinePlayerId}
              isHost={onlineIsHost}
              onSubmitAnswer={submitOnlineAnswer}
              onNextQuestion={nextOnlineQuestion}
            />
          )}

          {/* Results */}
          {onlineState.roomId && onlineState.phase === 'results' && (
            <ResultsScreen
              totalLanterns={onlineState.matchedQuestions.length}
              totalQuestions={onlineState.totalQuestions}
              getCanvas={() => skylineRef.current?.getCanvas() || null}
              onPlayAgain={handlePlayAgain}
              player1Name={onlineState.players[0]?.name || 'Partner 1'}
              player2Name={onlineState.players[1]?.name || 'Partner 2'}
            />
          )}
        </>
      )}

      {/* Local Pass & Play Flow Screens */}
      {playMode === 'local' && (
        <>
          {localPhase === 'settings' && (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
              <div className="w-full max-w-lg mb-4 glass-panel border border-amber-500/20 p-4">
                <p className="text-xs uppercase text-amber-300 font-semibold mb-2">
                  📱 Pass &amp; Play Mode Setup
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] text-amber-200/80 mb-1">Partner 1</label>
                    <input
                      type="text"
                      value={localPlayer1}
                      onChange={(e) => setLocalPlayer1(e.target.value)}
                      className="input-diwali text-xs"
                      placeholder="e.g. Him / Priya"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-amber-200/80 mb-1">Partner 2</label>
                    <input
                      type="text"
                      value={localPlayer2}
                      onChange={(e) => setLocalPlayer2(e.target.value)}
                      className="input-diwali text-xs"
                      placeholder="e.g. Her / Rahul"
                    />
                  </div>
                </div>
              </div>

              <SettingsScreen
                settings={localSettings}
                isHost={true}
                onUpdateSettings={(s) => setLocalSettings((prev) => ({ ...prev, ...s }))}
                onStartGame={handleStartLocalGame}
                onBackToLobby={() => setLocalPhase('home')}
              />
            </div>
          )}

          {(localPhase === 'p1_answering' || localPhase === 'p2_answering' || localPhase === 'reveal') && (
            <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8">
              {/* Turn Banner */}
              {localPhase !== 'reveal' && (
                <div className="mb-4 px-5 py-2 rounded-full bg-purple-900/80 border border-amber-500/40 text-sm text-amber-200 font-bold backdrop-blur-md shadow-lg animate-pulse">
                  {localTurn === 1 ? `✨ ${localPlayer1}'s Turn to Answer (No peeking!)` : `💖 Pass phone to ${localPlayer2} to Answer!`}
                </div>
              )}

              {/* Render Local Game Card */}
              {localQuestions[localCurrentIndex] && (
                <div className="w-full flex justify-center">
                  {localPhase !== 'reveal' ? (
                    <div className="w-full max-w-xl">
                      <GameScreen
                        gameState={{
                          roomId: 'LOCAL',
                          phase: 'playing',
                          players: [
                            { id: 'p1', name: localPlayer1, isHost: true, connected: true },
                            { id: 'p2', name: localPlayer2, isHost: false, connected: true },
                          ],
                          settings: localSettings,
                          questions: localQuestions,
                          currentQuestionIndex: localCurrentIndex,
                          answers: {},
                          matchedQuestions: localMatchedQuestions,
                          lanterns: [],
                          totalQuestions: localQuestions.length,
                        }}
                        playerId={localTurn === 1 ? 'p1' : 'p2'}
                        isHost={true}
                        onSubmitAnswer={handleLocalSubmitAnswer}
                        onNextQuestion={handleLocalNextQuestion}
                      />
                    </div>
                  ) : (
                    <div className="w-full max-w-xl">
                      <GameScreen
                        gameState={{
                          roomId: 'LOCAL',
                          phase: 'reveal',
                          players: [
                            { id: 'p1', name: localPlayer1, isHost: true, connected: true },
                            { id: 'p2', name: localPlayer2, isHost: false, connected: true },
                          ],
                          settings: localSettings,
                          questions: localQuestions,
                          currentQuestionIndex: localCurrentIndex,
                          answers: {
                            [localCurrentIndex]: [
                              { playerId: 'p1', questionId: localCurrentIndex, answer: localP1Answer, timestamp: Date.now() },
                              { playerId: 'p2', questionId: localCurrentIndex, answer: localP2Answer, timestamp: Date.now() },
                            ],
                          },
                          matchedQuestions: localMatchedQuestions,
                          lanterns: [],
                          totalQuestions: localQuestions.length,
                        }}
                        playerId="p1"
                        isHost={true}
                        onSubmitAnswer={() => {}}
                        onNextQuestion={handleLocalNextQuestion}
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {localPhase === 'results' && (
            <ResultsScreen
              totalLanterns={localLanternCount}
              totalQuestions={localQuestions.length}
              getCanvas={() => skylineRef.current?.getCanvas() || null}
              onPlayAgain={handlePlayAgain}
              player1Name={localPlayer1}
              player2Name={localPlayer2}
            />
          )}
        </>
      )}

      {/* Footer */}
      <footer className="absolute bottom-3 inset-x-0 z-20 flex items-center justify-center pointer-events-none">
        <div className="pointer-events-auto px-4 py-1.5 rounded-full bg-black/50 border border-amber-400/25 backdrop-blur-md text-[11px] text-amber-200/80 font-medium tracking-wide flex items-center gap-1.5 shadow-lg">
          <span>Crafted with 🪔 by</span>
          <a
            href="https://aritro.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#FFE082] hover:text-white font-semibold underline decoration-amber-400/50 hover:decoration-amber-300 transition"
          >
            Aritro Saha
          </a>
          <span>•</span>
          <a
            href="https://aritro.cloud"
            target="_blank"
            rel="noopener noreferrer"
            className="text-purple-300 hover:text-amber-200 transition"
          >
            aritro.cloud
          </a>
          <span>•</span>
          <span>© {new Date().getFullYear()}</span>
        </div>
      </footer>
    </main>
  );
}
