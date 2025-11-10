
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface LoginScreenProps {
  onSwitchToRegister: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({ onSwitchToRegister }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(username, password)) {
      setError('Invalid username or password.');
    } else {
        setError('');
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-fade-in">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Login</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Username"
          className="w-full bg-slate-700 text-white p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password (not required for demo)"
          className="w-full bg-slate-700 text-white p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500"
        />
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          type="submit"
          className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          Login
        </button>
      </form>
      <p className="text-slate-400 mt-6">
        Don't have an account?{' '}
        <button onClick={onSwitchToRegister} className="text-cyan-400 hover:underline font-semibold">
          Register here
        </button>
      </p>
    </div>
  );
};
