'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { Channel, PresenceChannel } from 'pusher-js';
import { getPusherClient, triggerEvent, disconnectPusher } from '@/lib/pusher-client';
import { answersMatch } from '@/lib/fuzzyMatch';
import { getRandomQuestions } from '@/lib/questions';
import {
  GameState,
  GameSettings,
  Player,
  Question,
  PlayerAnswer,
  PUSHER_EVENTS,
  DEFAULT_SETTINGS,
  LanternPosition,
  LANTERN_COLORS,
} from '@/lib/types';

interface UseGameRoomReturn {
  gameState: GameState;
  playerId: string;
  playerName: string;
  isHost: boolean;
  isConnected: boolean;
  error: string | null;
  createRoom: (name: string) => Promise<string>;
  joinRoom: (roomCode: string, name: string) => Promise<void>;
  updateSettings: (settings: Partial<GameSettings>) => void;
  startGame: () => void;
  submitAnswer: (answer: string) => void;
  nextQuestion: () => void;
  leaveRoom: () => void;
}

const initialGameState: GameState = {
  roomId: '',
  phase: 'lobby',
  players: [],
  settings: DEFAULT_SETTINGS,
  questions: [],
  currentQuestionIndex: 0,
  answers: {},
  matchedQuestions: [],
  lanterns: [],
  totalQuestions: 0,
};

export function useGameRoom(): UseGameRoomReturn {
  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [playerId, setPlayerId] = useState<string>('');
  const [playerName, setPlayerName] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const channelRef = useRef<Channel | null>(null);
  const gameStateRef = useRef<GameState>(initialGameState);
  const answersStoreRef = useRef<Map<number, Map<string, PlayerAnswer>>>(new Map());
  const revealedQuestionsRef = useRef<Set<number>>(new Set());
  const isHostRef = useRef(false);
  const playerIdRef = useRef('');

  // Keep refs in sync with state
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    playerIdRef.current = playerId;
  }, [playerId]);

  const recordAnswerAndCheckReveal = useCallback(
    (ansPlayerId: string, questionIndex: number, answerText: string) => {
      if (!answersStoreRef.current.has(questionIndex)) {
        answersStoreRef.current.set(questionIndex, new Map());
      }
      const qMap = answersStoreRef.current.get(questionIndex)!;
      const answerObj: PlayerAnswer = {
        playerId: ansPlayerId,
        questionId: questionIndex,
        answer: answerText,
        timestamp: Date.now(),
      };
      qMap.set(ansPlayerId, answerObj);

      if (!isHostRef.current) return;
      if (revealedQuestionsRef.current.has(questionIndex)) return;

      if (qMap.size < 2) {
        return;
      }

      revealedQuestionsRef.current.add(questionIndex);

      const state = gameStateRef.current;
      const question = state.questions[questionIndex];
      if (!question) return;

      const answersList = Array.from(qMap.values());
      const p1Answer = answersList[0];
      const p2Answer = answersList[1];

      const matched = answersMatch(p1Answer.answer, p2Answer.answer, question.type);

      let lantern: LanternPosition | undefined;
      if (matched) {
        lantern = {
          x: Math.random() * 0.8 + 0.1,
          y: Math.random() * 0.4 + 0.05,
          size: 18 + Math.random() * 12,
          color: LANTERN_COLORS[questionIndex % LANTERN_COLORS.length],
          questionIndex,
        };
      }

      // Update Host local state immediately so Host transitions to reveal with zero delay
      setGameState((prev) => ({
        ...prev,
        phase: 'reveal',
        answers: {
          ...prev.answers,
          [questionIndex]: answersList,
        },
        matchedQuestions: matched
          ? [...prev.matchedQuestions, questionIndex]
          : prev.matchedQuestions,
        lanterns: lantern
          ? [...prev.lanterns, lantern]
          : prev.lanterns,
      }));

      const chName = channelRef.current?.name || `presence-room-${state.roomId}`;
      triggerEvent(chName, PUSHER_EVENTS.ANSWER_REVEAL, {
        questionIndex,
        answers: answersList,
        matched,
        lantern,
        senderId: playerIdRef.current,
      });
    },
    []
  );

  const bindGameEvents = useCallback(
    (channel: Channel, myId: string) => {
      channel.bind(PUSHER_EVENTS.SETTINGS_UPDATED, (data: { settings: GameSettings; senderId?: string }) => {
        if (data.senderId === myId) return;
        setGameState((prev) => ({ ...prev, settings: data.settings }));
      });

      channel.bind(PUSHER_EVENTS.PLAYER_JOINED, (data: { id: string; name: string }) => {
        setGameState((prev) => {
          const existing = prev.players.find((p) => p.id === data.id);
          if (existing) return prev;
          return {
            ...prev,
            players: [
              ...prev.players,
              { id: data.id, name: data.name, isHost: false, connected: true },
            ],
          };
        });
      });

      channel.bind(PUSHER_EVENTS.GAME_STARTED, (data: { questions: Question[]; settings: GameSettings; senderId?: string }) => {
        if (data.senderId === myId) return;
        answersStoreRef.current.clear();
        revealedQuestionsRef.current.clear();
        setGameState((prev) => ({
          ...prev,
          phase: 'playing',
          questions: data.questions,
          settings: data.settings,
          currentQuestionIndex: 0,
          answers: {},
          matchedQuestions: [],
          lanterns: [],
          totalQuestions: data.questions.length,
        }));
      });

      channel.bind(
        PUSHER_EVENTS.ANSWER_SUBMITTED,
        (data: { playerId: string; questionIndex: number; answer: string }) => {
          if (data.playerId !== myId) {
            setGameState((prev) => {
              const existingAnswers = prev.answers[data.questionIndex] || [];
              const hasExisting = existingAnswers.some((a) => a.playerId === data.playerId);
              if (hasExisting) return prev;

              return {
                ...prev,
                answers: {
                  ...prev.answers,
                  [data.questionIndex]: [
                    ...existingAnswers,
                    { playerId: data.playerId, questionId: data.questionIndex, answer: '***', timestamp: Date.now() },
                  ],
                },
              };
            });

            recordAnswerAndCheckReveal(data.playerId, data.questionIndex, data.answer);
          }
        }
      );

      channel.bind(
        PUSHER_EVENTS.ANSWER_REVEAL,
        (data: {
          questionIndex: number;
          answers: PlayerAnswer[];
          matched: boolean;
          lantern?: LanternPosition;
          senderId?: string;
        }) => {
          if (data.senderId === myId) return;
          setGameState((prev) => ({
            ...prev,
            phase: 'reveal',
            answers: {
              ...prev.answers,
              [data.questionIndex]: data.answers,
            },
            matchedQuestions: data.matched
              ? [...prev.matchedQuestions, data.questionIndex]
              : prev.matchedQuestions,
            lanterns: data.lantern
              ? [...prev.lanterns, data.lantern]
              : prev.lanterns,
          }));
        }
      );

      channel.bind(PUSHER_EVENTS.NEXT_QUESTION, (data: { questionIndex: number; senderId?: string }) => {
        if (data.senderId === myId) return;
        setGameState((prev) => ({
          ...prev,
          phase: 'playing',
          currentQuestionIndex: data.questionIndex,
        }));
      });

      channel.bind(PUSHER_EVENTS.GAME_OVER, (data: { senderId?: string }) => {
        if (data?.senderId === myId) return;
        setGameState((prev) => ({
          ...prev,
          phase: 'results',
        }));
      });
    },
    [recordAnswerAndCheckReveal]
  );

  const createRoom = useCallback(async (name: string): Promise<string> => {
    try {
      const response = await fetch('/api/room/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ playerName: name }),
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      const { roomCode, channelName } = data;
      const id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      setPlayerId(id);
      setPlayerName(name);
      setIsHost(true);
      isHostRef.current = true;
      playerIdRef.current = id;

      const pusher = getPusherClient({
        user_data: JSON.stringify({ id, name }),
      });

      const channel = pusher.subscribe(channelName) as PresenceChannel;
      channelRef.current = channel;

      channel.bind('pusher:subscription_succeeded', () => {
        setIsConnected(true);
        setGameState((prev) => ({
          ...prev,
          roomId: roomCode,
          players: [{ id, name, isHost: true, connected: true }],
        }));
      });

      channel.bind('pusher:member_added', (member: { id: string; info: { name: string } }) => {
        setGameState((prev) => {
          const existing = prev.players.find((p) => p.id === member.id);
          if (existing) return prev;
          return {
            ...prev,
            players: [
              ...prev.players,
              { id: member.id, name: member.info.name, isHost: false, connected: true },
            ],
          };
        });
      });

      channel.bind('pusher:member_removed', (member: { id: string }) => {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === member.id ? { ...p, connected: false } : p
          ),
        }));
      });

      bindGameEvents(channel, id);

      return roomCode;
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to create room';
      setError(msg);
      throw err;
    }
  }, [bindGameEvents]);

  const joinRoom = useCallback(async (roomCode: string, name: string): Promise<void> => {
    try {
      const channelName = `presence-room-${roomCode.toUpperCase()}`;
      const id = `player_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;

      setPlayerId(id);
      setPlayerName(name);
      setIsHost(false);
      isHostRef.current = false;
      playerIdRef.current = id;

      const pusher = getPusherClient({
        user_data: JSON.stringify({ id, name }),
      });

      const channel = pusher.subscribe(channelName) as PresenceChannel;
      channelRef.current = channel;

      channel.bind('pusher:subscription_succeeded', (members: { count: number; each: (cb: (member: { id: string; info: { name: string } }) => void) => void }) => {
        setIsConnected(true);

        const playerList: Player[] = [];
        members.each((member: { id: string; info: { name: string } }) => {
          playerList.push({
            id: member.id,
            name: member.info.name,
            isHost: playerList.length === 0,
            connected: true,
          });
        });

        setGameState((prev) => ({
          ...prev,
          roomId: roomCode.toUpperCase(),
          players: playerList,
        }));

        triggerEvent(channelName, PUSHER_EVENTS.PLAYER_JOINED, { id, name });
      });

      channel.bind('pusher:member_added', (member: { id: string; info: { name: string } }) => {
        setGameState((prev) => {
          const existing = prev.players.find((p) => p.id === member.id);
          if (existing) return prev;
          return {
            ...prev,
            players: [
              ...prev.players,
              { id: member.id, name: member.info.name, isHost: false, connected: true },
            ],
          };
        });
      });

      channel.bind('pusher:member_removed', (member: { id: string }) => {
        setGameState((prev) => ({
          ...prev,
          players: prev.players.map((p) =>
            p.id === member.id ? { ...p, connected: false } : p
          ),
        }));
      });

      bindGameEvents(channel, id);

      channel.bind('pusher:subscription_error', () => {
        setError('Failed to join room. Check the room code and try again.');
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to join room';
      setError(msg);
      throw err;
    }
  }, [bindGameEvents]);

  const updateSettings = useCallback((settings: Partial<GameSettings>) => {
    if (!channelRef.current || !isHostRef.current) return;

    const newSettings = { ...gameStateRef.current.settings, ...settings };
    setGameState((prev) => ({ ...prev, settings: newSettings }));

    const channelName = channelRef.current?.name || `presence-room-${gameStateRef.current.roomId}`;
    triggerEvent(channelName, PUSHER_EVENTS.SETTINGS_UPDATED, {
      settings: newSettings,
      senderId: playerIdRef.current,
    });
  }, []);

  const startGame = useCallback(() => {
    if (!channelRef.current || !isHostRef.current) return;

    answersStoreRef.current.clear();
    revealedQuestionsRef.current.clear();

    const state = gameStateRef.current;
    const questions = getRandomQuestions(
      state.settings.questionCount,
      state.settings.questionTypes,
      state.settings.useDefaultQuestions ? [] : state.settings.customQuestions
    );

    setGameState((prev) => ({
      ...prev,
      phase: 'playing',
      questions,
      settings: state.settings,
      currentQuestionIndex: 0,
      answers: {},
      matchedQuestions: [],
      lanterns: [],
      totalQuestions: questions.length,
    }));

    const channelName = channelRef.current?.name || `presence-room-${state.roomId}`;
    triggerEvent(channelName, PUSHER_EVENTS.GAME_STARTED, {
      questions,
      settings: state.settings,
      senderId: playerIdRef.current,
    });
  }, []);

  const submitAnswer = useCallback(
    (answer: string) => {
      if (!channelRef.current) return;

      const state = gameStateRef.current;
      const channelName = channelRef.current?.name || `presence-room-${state.roomId}`;
      const questionIndex = state.currentQuestionIndex;
      const currentId = playerIdRef.current;

      const myAnswer: PlayerAnswer = {
        playerId: currentId,
        questionId: questionIndex,
        answer,
        timestamp: Date.now(),
      };

      setGameState((prev) => {
        const existingAnswers = prev.answers[questionIndex] || [];
        return {
          ...prev,
          answers: {
            ...prev.answers,
            [questionIndex]: [
              ...existingAnswers.filter((a) => a.playerId !== currentId),
              myAnswer,
            ],
          },
        };
      });

      triggerEvent(channelName, PUSHER_EVENTS.ANSWER_SUBMITTED, {
        playerId: currentId,
        questionIndex,
        answer,
      });

      recordAnswerAndCheckReveal(currentId, questionIndex, answer);
    },
    [recordAnswerAndCheckReveal]
  );

  const nextQuestion = useCallback(() => {
    if (!channelRef.current || !isHostRef.current) return;

    const state = gameStateRef.current;
    const nextIdx = state.currentQuestionIndex + 1;

    if (nextIdx >= state.questions.length) {
      setGameState((prev) => ({ ...prev, phase: 'results' }));
      const channelName = channelRef.current?.name || `presence-room-${state.roomId}`;
      triggerEvent(channelName, PUSHER_EVENTS.GAME_OVER, { senderId: playerIdRef.current });
    } else {
      setGameState((prev) => ({
        ...prev,
        phase: 'playing',
        currentQuestionIndex: nextIdx,
      }));
      const channelName = channelRef.current?.name || `presence-room-${state.roomId}`;
      triggerEvent(channelName, PUSHER_EVENTS.NEXT_QUESTION, {
        questionIndex: nextIdx,
        senderId: playerIdRef.current,
      });
    }
  }, []);

  const leaveRoom = useCallback(() => {
    if (channelRef.current) {
      const channelName = channelRef.current.name;
      const pusher = getPusherClient();
      pusher.unsubscribe(channelName);
      channelRef.current = null;
    }
    disconnectPusher();
    setGameState(initialGameState);
    setIsConnected(false);
    setIsHost(false);
    setPlayerId('');
    setPlayerName('');
    setError(null);
    answersStoreRef.current.clear();
    revealedQuestionsRef.current.clear();
  }, []);

  useEffect(() => {
    return () => {
      leaveRoom();
    };
  }, [leaveRoom]);

  return {
    gameState,
    playerId,
    playerName,
    isHost,
    isConnected,
    error,
    createRoom,
    joinRoom,
    updateSettings,
    startGame,
    submitAnswer,
    nextQuestion,
    leaveRoom,
  };
}
