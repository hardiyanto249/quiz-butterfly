
import React, { useState } from 'react';
import type { Question } from '../types';

interface QuestionScreenProps {
  question: Question;
  onAnswer: (isCorrect: boolean, selectedOption: string) => void;
  onNext: () => void;
  onPause: () => void;
  questionNumber: number;
  totalQuestions: number;
  currentScore: number;
}

export const QuestionScreen: React.FC<QuestionScreenProps> = ({
  question,
  onAnswer,
  onNext,
  onPause,
  questionNumber,
  totalQuestions,
  currentScore,
}) => {
  const [selectedAnswerIndex, setSelectedAnswerIndex] = useState<number | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);

  const handleOptionClick = (index: number) => {
    if (isAnswered) return;

    const isCorrect = index === question.correctAnswerIndex;
    setSelectedAnswerIndex(index);
    setIsAnswered(true);
    onAnswer(isCorrect, question.options[index]);
  };

  const getButtonClass = (index: number) => {
    if (!isAnswered) {
      return 'bg-slate-700 hover:bg-slate-600';
    }
    if (index === question.correctAnswerIndex) {
      return 'bg-green-500/80 border-green-400';
    }
    if (index === selectedAnswerIndex) {
      return 'bg-red-500/80 border-red-400';
    }
    return 'bg-slate-700 opacity-60';
  };

  const progressPercentage = (questionNumber / totalQuestions) * 100;

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-3xl animate-fade-in">
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2 text-slate-300">
          <p>Question {questionNumber} of {totalQuestions}</p>
          <p className="font-bold text-cyan-400">Score: {currentScore}</p>
        </div>
        <div className="w-full bg-slate-700 rounded-full h-2.5">
          <div className="bg-cyan-400 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progressPercentage}%` }}></div>
        </div>
      </div>
      
      <h2 className="text-2xl md:text-3xl font-bold mb-6 text-slate-100">{question.questionText}</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {question.options.map((option, index) => (
          <button
            key={option}
            onClick={() => handleOptionClick(index)}
            disabled={isAnswered}
            className={`w-full p-4 rounded-lg text-left text-lg font-medium border-2 border-transparent transition-all duration-300 ${getButtonClass(index)} ${!isAnswered ? 'cursor-pointer' : 'cursor-default'}`}
          >
            {option}
          </button>
        ))}
      </div>

      {isAnswered && (
        <div className="mt-6 p-4 bg-slate-700/50 rounded-lg border border-slate-600 animate-fade-in">
          <h3 className="text-lg font-semibold text-cyan-400 mb-2">Explanation:</h3>
          <p className="text-slate-200 mb-3">
            The correct answer is: <span className="font-bold text-green-400">{question.options[question.correctAnswerIndex]}</span>
          </p>
          {question.reference && (
            <div className="text-sm text-slate-400">
              <span className="font-medium">Reference:</span> {question.reference}
            </div>
          )}
        </div>
      )}
      
      <div className="mt-8 flex justify-between items-center">
         <button
            onClick={onPause}
            className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-all"
          >
            Pause & Go to Menu
          </button>
        {isAnswered && (
          <button
            onClick={onNext}
            className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-400 animate-fade-in"
          >
            {questionNumber === totalQuestions ? 'Finish Quiz' : 'Next Question'}
          </button>
        )}
      </div>
    </div>
  );
};
