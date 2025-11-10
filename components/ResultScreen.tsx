
import React from 'react';
import type { UserAnswer } from '../types';

interface ResultScreenProps {
  score: number;
  totalQuestions: number;
  userAnswers: UserAnswer[];
  onRestart: () => void;
}

const CheckIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-green-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
    </svg>
);

const XIcon: React.FC = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 inline-block mr-2 text-red-400" viewBox="0 0 20 20" fill="currentColor">
        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
    </svg>
);

export const ResultScreen: React.FC<ResultScreenProps> = ({ score, totalQuestions, userAnswers, onRestart }) => {
  const percentage = Math.round((score / totalQuestions) * 100);

  const getFeedback = () => {
    if (percentage === 100) return { message: 'Perfect Score!', color: 'text-cyan-400' };
    if (percentage >= 80) return { message: 'Excellent Work!', color: 'text-green-400' };
    if (percentage >= 50) return { message: 'Good Effort!', color: 'text-yellow-400' };
    return { message: 'Keep Studying!', color: 'text-orange-400' };
  };

  const feedback = getFeedback();

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-4xl animate-fade-in">
      <div className="text-center mb-8">
        <h2 className={`text-4xl font-bold ${feedback.color}`}>{feedback.message}</h2>
        <p className="text-slate-200 text-2xl mt-2">You scored {score} out of {totalQuestions} ({percentage}%)</p>
      </div>
      
      <div className="mb-8 max-h-80 overflow-y-auto pr-4">
        <h3 className="text-2xl font-semibold text-slate-100 mb-4 sticky top-0 bg-slate-800 py-2">Academic Review</h3>
        {userAnswers.map((answer, index) => (
          <div key={index} className="bg-slate-900/50 p-4 rounded-lg mb-4">
            <p className="font-semibold text-slate-200">{index + 1}. {answer.question}</p>
            <div className={`mt-2 flex items-center ${answer.isCorrect ? 'text-green-400' : 'text-red-400'}`}>
              {answer.isCorrect ? <CheckIcon /> : <XIcon />}
              <span>Your answer: {answer.userAnswer}</span>
            </div>
            {!answer.isCorrect && (
              <div className="mt-1 flex items-center text-slate-400">
                 <span className="font-bold w-5 h-5 inline-block mr-2"></span>
                <span >Correct answer: {answer.correctAnswer}</span>
              </div>
            )}
            <div className="mt-2 text-xs text-cyan-400/80 border-t border-slate-700 pt-2">
                <strong>Reference:</strong> {answer.reference}
            </div>
          </div>
        ))}
      </div>

      <div className="text-center">
        <button
          onClick={onRestart}
          className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-4 focus:ring-violet-400"
        >
          Back to Menu
        </button>
      </div>
    </div>
  );
};
