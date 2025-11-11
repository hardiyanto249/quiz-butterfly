
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';

interface RegisterScreenProps {
  onSwitchToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onSwitchToLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const success = await register(username, password);
      if (!success) {
        setError('Username is already taken or registration failed.');
      }
    } catch (err) {
      setError('Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-slate-800 p-8 rounded-2xl shadow-2xl text-center max-w-sm w-full animate-fade-in">
      <h1 className="text-3xl font-bold text-cyan-400 mb-6">Register</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choose a Username"
          className="w-full bg-slate-700 text-white p-3 rounded-lg mb-4 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          className="w-full bg-slate-700 text-white p-3 rounded-lg mb-6 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          required
        />
        {error && <p className="text-red-400 mb-4">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-violet-600 hover:bg-violet-700 disabled:bg-violet-800 disabled:cursor-not-allowed text-white font-bold py-3 px-6 rounded-full text-lg transition-transform transform hover:scale-105"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>
      <p className="text-slate-400 mt-6">
        Already have an account?{' '}
        <button onClick={onSwitchToLogin} className="text-cyan-400 hover:underline font-semibold">
          Login here
        </button>
      </p>
    </div>
  );
};
