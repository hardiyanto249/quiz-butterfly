
import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
import { LoginScreen } from './components/LoginScreen';
import { RegisterScreen } from './components/RegisterScreen';
import { LevelSelectScreen } from './components/LevelSelectScreen';
import Quiz from './components/Quiz';
import { LeaderboardScreen } from './components/LeaderboardScreen';
import type { Difficulty } from './types';

type AppState = 'auth' | 'level_select' | 'quiz' | 'leaderboard';
type AuthView = 'login' | 'register';

const App: React.FC = () => {
  const { currentUser } = useAuth();
  const [appState, setAppState] = useState<AppState>('level_select');
  const [authView, setAuthView] = useState<AuthView>('login');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | null>(null);

  const handleStartQuiz = (difficulty: Difficulty) => {
    setSelectedDifficulty(difficulty);
    setAppState('quiz');
  };

  const handleQuizFinish = () => {
    setSelectedDifficulty(null);
    setAppState('level_select');
  };

  const handleShowLeaderboard = () => {
    setAppState('leaderboard');
  };

  const handleBackToMenu = () => {
    setAppState('level_select');
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen text-white font-sans flex items-center justify-center p-4">
        {authView === 'login' ? (
          <LoginScreen onSwitchToRegister={() => setAuthView('register')} />
        ) : (
          <RegisterScreen onSwitchToLogin={() => setAuthView('login')} />
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white font-sans flex items-center justify-center p-4">
      {appState === 'level_select' && <LevelSelectScreen onStartQuiz={handleStartQuiz} onShowLeaderboard={handleShowLeaderboard} />}
      {appState === 'quiz' && selectedDifficulty && <Quiz difficulty={selectedDifficulty} onFinish={handleQuizFinish} />}
      {appState === 'leaderboard' && <LeaderboardScreen onBack={handleBackToMenu} />}
    </div>
  );
};

export default App;
