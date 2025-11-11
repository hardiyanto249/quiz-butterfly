
import React, { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { api } from '../hooks/useApi';
import type { User, Difficulty } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password: string) => Promise<boolean>;
  register: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateHighScore: (difficulty: Difficulty, score: number) => Promise<void>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Check for existing auth token on mount
  useEffect(() => {
    const token = localStorage.getItem('authToken');
    if (token) {
      // Validate token by fetching profile
      api.get('/api/profile')
        .then((profile: any) => {
          // Transform backend user format to frontend format
          const user = {
            id: profile.user.id,
            username: profile.user.username,
            highScores: {
              easy: 0,
              medium: 0,
              advance: 0,
            },
            created_at: profile.user.created_at,
            updated_at: profile.user.updated_at,
          };

          // Add high scores from the profile response
          if (profile.high_scores) {
            profile.high_scores.forEach((hs: any) => {
              if (hs.difficulty === 'easy') user.highScores.easy = hs.score;
              if (hs.difficulty === 'medium') user.highScores.medium = hs.score;
              if (hs.difficulty === 'advance') user.highScores.advance = hs.score;
            });
          }

          setCurrentUser(user);
        })
        .catch(() => {
          localStorage.removeItem('authToken');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/login', { username, password });
      if (response.token) {
        localStorage.setItem('authToken', response.token);

        // Transform backend user format to frontend format
        const user = {
          id: response.user.id,
          username: response.user.username,
          highScores: {
            easy: 0,
            medium: 0,
            advance: 0,
          },
          created_at: response.user.created_at,
          updated_at: response.user.updated_at,
        };

        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (username: string, password: string): Promise<boolean> => {
    try {
      const response = await api.post('/auth/register', { username, password });
      if (response.token) {
        localStorage.setItem('authToken', response.token);

        // Transform backend user format to frontend format
        const user = {
          id: response.user.id,
          username: response.user.username,
          highScores: {
            easy: 0,
            medium: 0,
            advance: 0,
          },
          created_at: response.user.created_at,
          updated_at: response.user.updated_at,
        };

        setCurrentUser(user);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Register error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setCurrentUser(null);
  };

  const updateHighScore = async (difficulty: Difficulty, score: number): Promise<void> => {
    // High scores are updated automatically in the backend when quiz finishes
    // We can fetch the updated profile to refresh local state
    try {
      const profile = await api.get('/api/profile');

      // Transform backend user format to frontend format
      const user = {
        id: profile.user.id,
        username: profile.user.username,
        highScores: {
          easy: 0,
          medium: 0,
          advance: 0,
        },
        created_at: profile.user.created_at,
        updated_at: profile.user.updated_at,
      };

      // Add high scores from the profile response
      if (profile.high_scores) {
        profile.high_scores.forEach((hs: any) => {
          if (hs.difficulty === 'easy') user.highScores.easy = hs.score;
          if (hs.difficulty === 'medium') user.highScores.medium = hs.score;
          if (hs.difficulty === 'advance') user.highScores.advance = hs.score;
        });
      }

      setCurrentUser(user);
    } catch (error) {
      console.error('Error updating high score:', error);
    }
  };


  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateHighScore, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
