'use client';

import { AnimatePresence } from 'framer-motion';
import { GameState, Player } from '@/lib/types';
import QuestionCard from './QuestionCard';
import AnswerReveal from './AnswerReveal';

interface GameScreenProps {
  gameState: GameState;
  playerId: string;
  isHost: boolean;
  onSubmitAnswer: (answer: string) => void;
  onNextQuestion: () => void;
}

export default function GameScreen({
  gameState,
  playerId,
  isHost,
  onSubmitAnswer,
  onNextQuestion,
}: GameScreenProps) {
  const currentQ = gameState.questions[gameState.currentQuestionIndex];
  const currentAnswers = gameState.answers[gameState.currentQuestionIndex] || [];
  const myAnswerObj = currentAnswers.find((a) => a.playerId === playerId);
  const myAnswer = myAnswerObj?.answer;
  const hasAnswered = !!myAnswer && myAnswer !== '***';

  const otherPlayerAnswered = currentAnswers.some(
    (a) => a.playerId !== playerId
  );

  const isMatched = gameState.matchedQuestions.includes(
    gameState.currentQuestionIndex
  );

  const isLastQuestion =
    gameState.currentQuestionIndex >= gameState.questions.length - 1;

  if (!currentQ) {
    return (
      <div className="relative z-10 flex items-center justify-center min-h-screen text-amber-200">
        Loading question...
      </div>
    );
  }

  return (
    <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-4 py-8 pointer-events-none">
      <div className="pointer-events-auto w-full flex justify-center">
        <AnimatePresence mode="wait">
          {gameState.phase === 'playing' ? (
            <QuestionCard
              key={`q-${currentQ.id}`}
              question={currentQ}
              questionNumber={gameState.currentQuestionIndex + 1}
              totalQuestions={gameState.totalQuestions}
              hasAnswered={hasAnswered}
              mySubmittedAnswer={myAnswer}
              partnerHasAnswered={otherPlayerAnswered}
              onSubmitAnswer={onSubmitAnswer}
            />
          ) : (
            <AnswerReveal
              key={`reveal-${currentQ.id}`}
              question={currentQ}
              answers={currentAnswers}
              players={gameState.players}
              matched={isMatched}
              isHost={isHost}
              isLastQuestion={isLastQuestion}
              onNextQuestion={onNextQuestion}
            />
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
