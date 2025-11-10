
import React, { useState, useEffect, useCallback } from 'react';
import { QuestionScreen } from './QuestionScreen';
import { ResultScreen } from './ResultScreen';
import { QUIZ_DATA } from '../constants';
import { useAuth } from '../contexts/AuthContext';
import type { Difficulty, QuizState, UserAnswer, QuizProgress } from '../types';

interface QuizProps {
  difficulty: Difficulty;
  onFinish: () => void;
}

const Quiz: React.FC<QuizProps> = ({ difficulty, onFinish }) => {
  const { currentUser, updateHighScore } = useAuth();
  const questions = QUIZ_DATA[difficulty];
  const totalQuestions = questions.length;

  const getInitialState = (): QuizProgress => {
      if(currentUser) {
          const savedProgress = localStorage.getItem(`quizProgress_${currentUser.username}`);
          if(savedProgress) {
              const parsed = JSON.parse(savedProgress) as QuizProgress;
              if (parsed.difficulty === difficulty) {
                  return parsed;
              }
          }
      }
      return {
        difficulty,
        currentQuestionIndex: 0,
        score: 0,
        userAnswers: [],
      };
  };

  const [quizState, setQuizState] = useState<QuizState>('playing');
  const [progress, setProgress] = useState<QuizProgress>(getInitialState);

  useEffect(() => {
    if (currentUser && quizState === 'playing') {
      localStorage.setItem(`quizProgress_${currentUser.username}`, JSON.stringify(progress));
    }
  }, [progress, currentUser, quizState]);

  const handleAnswer = useCallback((isCorrect: boolean, selectedOption: string) => {
    const currentQuestion = questions[progress.currentQuestionIndex];
    setProgress(prev => ({
      ...prev,
      score: isCorrect ? prev.score + 1 : prev.score,
      userAnswers: [
        ...prev.userAnswers,
        {
          question: currentQuestion.questionText,
          userAnswer: selectedOption,
          correctAnswer: currentQuestion.options[currentQuestion.correctAnswerIndex],
          isCorrect,
          reference: currentQuestion.reference,
        },
      ],
    }));
  }, [progress.currentQuestionIndex, questions]);

  const handleNextQuestion = useCallback(() => {
    if (progress.currentQuestionIndex < totalQuestions - 1) {
      setProgress(prev => ({ ...prev, currentQuestionIndex: prev.currentQuestionIndex + 1 }));
    } else {
      setQuizState('finished');
      updateHighScore(difficulty, progress.score);
      if(currentUser) {
          localStorage.removeItem(`quizProgress_${currentUser.username}`);
      }
    }
  }, [progress.currentQuestionIndex, totalQuestions, difficulty, progress.score, updateHighScore, currentUser]);

  const handlePause = () => {
    onFinish();
  };

  if (quizState === 'finished') {
    return (
      <ResultScreen
        score={progress.score}
        totalQuestions={totalQuestions}
        userAnswers={progress.userAnswers}
        onRestart={onFinish}
      />
    );
  }

  return (
    <QuestionScreen
      key={progress.currentQuestionIndex}
      question={questions[progress.currentQuestionIndex]}
      onAnswer={handleAnswer}
      onNext={handleNextQuestion}
      onPause={handlePause}
      questionNumber={progress.currentQuestionIndex + 1}
      totalQuestions={totalQuestions}
      currentScore={progress.score}
    />
  );
};

export default Quiz;
