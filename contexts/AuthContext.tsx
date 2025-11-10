
import React, { createContext, useContext, ReactNode } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';
import type { User, Difficulty } from '../types';

interface AuthContextType {
  currentUser: User | null;
  users: User[];
  login: (username: string, password_not_used: string) => boolean;
  register: (username: string, password_not_used: string) => boolean;
  logout: () => void;
  updateHighScore: (difficulty: Difficulty, score: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [users, setUsers] = useLocalStorage<User[]>('users', []);
  const [currentUser, setCurrentUser] = useLocalStorage<User | null>('currentUser', null);

  const login = (username: string, password_not_used: string): boolean => {
    const user = users.find(u => u.username.toLowerCase() === username.toLowerCase());
    if (user) {
      // In a real app, you would compare hashed passwords.
      // For this simple case, we'll just log them in.
      setCurrentUser(user);
      return true;
    }
    return false;
  };

  const register = (username: string, password_not_used: string): boolean => {
    if (users.some(u => u.username.toLowerCase() === username.toLowerCase())) {
      return false; // Username already exists
    }
    const newUser: User = {
      username,
      highScores: { easy: 0, medium: 0, advance: 0 },
    };
    setUsers([...users, newUser]);
    setCurrentUser(newUser);
    return true;
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const updateHighScore = (difficulty: Difficulty, score: number) => {
    if (currentUser) {
      const userIndex = users.findIndex(u => u.username === currentUser.username);
      if (userIndex !== -1) {
        const updatedUsers = [...users];
        const userToUpdate = { ...updatedUsers[userIndex] };
        
        if (score > userToUpdate.highScores[difficulty]) {
            userToUpdate.highScores[difficulty] = score;
            updatedUsers[userIndex] = userToUpdate;
            setUsers(updatedUsers);
            setCurrentUser(userToUpdate);
        }
      }
    }
  };


  return (
    <AuthContext.Provider value={{ currentUser, users, login, register, logout, updateHighScore }}>
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
