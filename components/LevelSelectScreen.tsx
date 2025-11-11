
import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import type { Difficulty, QuizProgress } from '../types';

interface LevelSelectScreenProps {
  onStartQuiz: (difficulty: Difficulty) => void;
  onShowLeaderboard: () => void;
}

const ButterflyIcon: React.FC = () => (
  <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-cyan-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 10.5c-2.28 0-4.5-2-4.5-4.5S9.72 1.5 12 1.5s4.5 2 4.5 4.5-2.22 4.5-4.5 4.5z"/>
    <path d="M12 13.5c-2.28 0-4.5 2-4.5 4.5S9.72 22.5 12 22.5s4.5-2 4.5-4.5-2.22-4.5-4.5-4.5z"/>
    <path d="M18.5 7.5c1.93 0 3.5 1.57 3.5 3.5s-1.57 3.5-3.5 3.5"/>
    <path d="M5.5 7.5c-1.93 0-3.5 1.57-3.5 3.5s1.57 3.5 3.5 3.5"/>
  </svg>
);

export const LevelSelectScreen: React.FC<LevelSelectScreenProps> = ({ onStartQuiz, onShowLeaderboard }) => {
  const { currentUser, logout } = useAuth();

  const getSavedProgress = (): QuizProgress | null => {
    if (!currentUser) return null;
    const saved = localStorage.getItem(`quizProgress_${currentUser.username}`);
    return saved ? JSON.parse(saved) : null;
  };
  
  const savedProgress = getSavedProgress();

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-2xl w-full flex flex-col items-center animate-fade-in">
        <div className="w-full flex justify-between items-start">
            <button onClick={onShowLeaderboard} className="text-sm bg-slate-700 hover:bg-slate-600 text-white font-bold py-2 px-4 rounded-full transition-colors">Leaderboard</button>
            <div className="flex flex-col items-center">
                <ButterflyIcon />
                <h1 className="text-4xl md:text-5xl font-bold text-cyan-400 mt-2">Select a Level</h1>
            </div>
            <button onClick={logout} className="text-sm bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded-full transition-colors">Logout</button>
        </div>

      <p className="text-slate-300 text-lg my-4">Welcome, <span className="font-bold text-white">{currentUser?.username}</span>! Choose your challenge.</p>
      
      {savedProgress && (
           <div className="w-full bg-cyan-900/50 border border-cyan-700 p-4 rounded-lg mb-6 text-center">
             <p className="font-semibold text-cyan-200">You have a quiz in progress!</p>
             <button
              onClick={() => onStartQuiz(savedProgress.difficulty)}
              className="mt-2 bg-cyan-500 hover:bg-cyan-600 text-white font-bold py-2 px-6 rounded-full text-md transition-all"
            >
              Continue {savedProgress.difficulty.charAt(0).toUpperCase() + savedProgress.difficulty.slice(1)} Quiz
            </button>
           </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mt-4">
        {(['easy', 'medium', 'advance'] as Difficulty[]).map(level => (
            <div key={level} className="bg-slate-700/50 p-4 rounded-lg flex flex-col items-center">
                <h2 className="text-2xl font-bold capitalize text-slate-100">{level}</h2>
                <p className="text-sm text-slate-400 mb-4">High Score: {currentUser?.highScores?.[level] ?? 0}</p>
                <button
                    onClick={() => onStartQuiz(level)}
                    className="bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-8 rounded-full text-lg transition-all duration-300 transform hover:scale-105"
                >
                    Start
                </button>
            </div>
        ))}
      </div>
    </div>
  );
};
