// Shared types for the Diwali Lanterns game

export type QuestionType = 'option' | 'text';

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options?: string[]; // For 'option' type questions (e.g., ["Him", "Her"])
  category: string;
}

export interface PlayerAnswer {
  playerId: string;
  questionId: number;
  answer: string;
  timestamp: number;
}

export interface Player {
  id: string;
  name: string;
  isHost: boolean;
  connected: boolean;
}

export interface GameSettings {
  questionCount: number;
  questionTypes: QuestionType[]; // which types to include
  customQuestions: Question[];
  useDefaultQuestions: boolean;
  timerSeconds: number; // 0 = no timer
}

export interface LanternPosition {
  x: number; // 0-1 normalized
  y: number; // 0-1 normalized
  size: number;
  color: string;
  questionIndex: number;
}

export interface GameState {
  roomId: string;
  phase: 'lobby' | 'settings' | 'playing' | 'reveal' | 'results';
  players: Player[];
  settings: GameSettings;
  questions: Question[];
  currentQuestionIndex: number;
  answers: Record<number, PlayerAnswer[]>; // questionId -> answers
  matchedQuestions: number[]; // indices of questions where answers matched
  lanterns: LanternPosition[];
  totalQuestions: number;
}

export interface RoomMessage {
  type: 'join' | 'leave' | 'start-game' | 'submit-answer' | 'next-question' |
        'game-state' | 'player-joined' | 'player-left' | 'answer-submitted' |
        'answer-reveal' | 'game-over' | 'error' | 'update-settings' |
        'answers-ready' | 'player-answered';
  payload: Record<string, unknown>;
  senderId?: string;
}

// Pusher event names
export const PUSHER_EVENTS = {
  PLAYER_JOINED: 'player-joined',
  PLAYER_LEFT: 'player-left',
  GAME_STARTED: 'game-started',
  SETTINGS_UPDATED: 'settings-updated',
  QUESTION_SENT: 'question-sent',
  PLAYER_ANSWERED: 'player-answered',
  ANSWER_SUBMITTED: 'answer-submitted',
  ANSWER_REVEAL: 'answer-reveal',
  NEXT_QUESTION: 'next-question',
  GAME_OVER: 'game-over',
  ERROR: 'error',
} as const;

// Lantern color palette - warm glowing festive Diwali colors
export const LANTERN_COLORS = [
  '#FF6B35', // Deep orange
  '#FFB347', // Pastel orange
  '#FF8C42', // Mango
  '#FFA62F', // Dark amber
  '#E8751A', // Burnt orange
  '#FFD700', // Gold
  '#FF4500', // Orange red
  '#FF7518', // Pumpkin
  '#FFAA33', // Warm amber
  '#F4A460', // Sandy brown
  '#FF3E6C', // Festive magenta
  '#FFC107', // Radiant marigold
];

export const DEFAULT_SETTINGS: GameSettings = {
  questionCount: 15,
  questionTypes: ['option', 'text'],
  customQuestions: [],
  useDefaultQuestions: true,
  timerSeconds: 30,
};
