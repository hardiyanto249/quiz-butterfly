
import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../hooks/useApi';
import type { User } from '../types';

interface LeaderboardScreenProps {
  onBack: () => void;
}

export const LeaderboardScreen: React.FC<LeaderboardScreenProps> = ({ onBack }) => {
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // For now, show only current user in leaderboard since we don't have a global users endpoint
    // In a real app, you'd have an endpoint to fetch all users' high scores
    if (currentUser) {
      // Transform current user to match the expected format
      const leaderboardUser = {
        username: currentUser.username,
        highScores: {
          easy: currentUser.highScores?.easy || 0,
          medium: currentUser.highScores?.medium || 0,
          advance: currentUser.highScores?.advance || 0,
        }
      };
      setUsers([leaderboardUser]);
    }
    setLoading(false);
  }, [currentUser]);

  const sortedUsers = [...users]
    .map(user => ({
      ...user,
      totalScore: user.highScores.easy + user.highScores.medium + user.highScores.advance,
    }))
    .sort((a, b) => b.totalScore - a.totalScore);

  return (
    <div className="bg-slate-800 p-6 md:p-8 rounded-2xl shadow-2xl w-full max-w-2xl animate-fade-in">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-cyan-400">Leaderboard</h1>
        <button onClick={onBack} className="bg-slate-600 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-full transition-colors">
            Back to Menu
        </button>
      </div>
      
      <div className="max-h-96 overflow-y-auto pr-2">
        <table className="w-full text-left">
            <thead className="sticky top-0 bg-slate-800">
                <tr className="text-slate-300 border-b border-slate-600">
                    <th className="p-2">Rank</th>
                    <th className="p-2">User</th>
                    <th className="p-2 text-center">Total Score</th>
                    <th className="p-2 text-center hidden sm:table-cell">Easy</th>
                    <th className="p-2 text-center hidden sm:table-cell">Medium</th>
                    <th className="p-2 text-center hidden sm:table-cell">Advance</th>
                </tr>
            </thead>
            <tbody>
                {loading ? (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                            Loading leaderboard...
                        </td>
                    </tr>
                ) : sortedUsers.length === 0 ? (
                    <tr>
                        <td colSpan={6} className="p-8 text-center text-slate-400">
                            No users found
                        </td>
                    </tr>
                ) : (
                    sortedUsers.map((user, index) => (
                        <tr
                            key={user.username}
                            className={`border-b border-slate-700 ${user.username === currentUser?.username ? 'bg-cyan-900/40' : ''}`}
                        >
                            <td className="p-3 font-bold">{index + 1}</td>
                            <td className="p-3 font-semibold">{user.username}</td>
                            <td className="p-3 text-center font-bold text-cyan-300">{user.totalScore}</td>
                            <td className="p-3 text-center hidden sm:table-cell">{user.highScores.easy}</td>
                            <td className="p-3 text-center hidden sm:table-cell">{user.highScores.medium}</td>
                            <td className="p-3 text-center hidden sm:table-cell">{user.highScores.advance}</td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
};
