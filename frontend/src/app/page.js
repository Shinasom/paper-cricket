// src/app/page.js

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext'; // Import our custom auth hook
import { createMatch, joinMatch } from '@/lib/api'; // Import our API functions

export default function HomePage() {
  const { user, login, register, loading } = useAuth(); // Get user and functions from context
  const router = useRouter();

  // State for the forms
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [matchCode, setMatchCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) {
        await login(username, password);
      } else {
        await register(username, password);
      }
      // The context will handle redirecting after successful login/register
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGame = async () => {
    if (!user) {
      alert("Please log in to create a game.");
      return;
    }
    setIsLoading(true);
    try {
      const newMatch = await createMatch(user.username, 1, 2); // Using logged-in user's name
      router.push(`/game/${newMatch.match_code}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };
  
  const handleJoinGame = async () => {
    if (!user) {
      alert("Please log in to join a game.");
      return;
    }
    setIsLoading(true);
    try {
      const match = await joinMatch(user.username, matchCode);
      router.push(`/game/${match.match_code}`);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8">
        <header className="text-center">
          <h1 className="text-4xl sm:text-5xl font-bold">Paper Cricket</h1>
          <p className="text-gray-400 mt-2">{user ? `Welcome, ${user.username}!` : "The classic notebook game, now online."}</p>
        </header>

        {/* --- CONDITIONAL RENDERING --- */}
        {user ? (
          // SHOW THIS IF USER IS LOGGED IN
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <button
              onClick={handleCreateGame}
              disabled={isLoading}
              className="w-full px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-transform transform hover:scale-105 disabled:bg-gray-600"
            >
              {isLoading ? 'Creating...' : 'Create New Game'}
            </button>
            <div className="my-6 flex items-center text-center"><hr className="flex-grow border-gray-600" /><span className="px-4 text-gray-400">OR</span><hr className="flex-grow border-gray-600" /></div>
            <div className="space-y-4">
              <input type="text" value={matchCode} onChange={(e) => setMatchCode(e.target.value.toUpperCase())} placeholder="Enter Match Code" className="w-full px-4 py-2 bg-gray-700 rounded-md text-center tracking-widest font-mono focus:ring-2 focus:ring-yellow-400 focus:outline-none" disabled={isLoading} />
              <button onClick={handleJoinGame} disabled={isLoading} className="w-full px-6 py-3 text-lg font-semibold bg-green-600 hover:bg-green-700 rounded-md transition-transform transform hover:scale-105 disabled:bg-gray-600">
                {isLoading ? 'Joining...' : 'Join Game'}
              </button>
            </div>
          </div>
        ) : (
          // SHOW THIS IF USER IS LOGGED OUT
          <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
            <form onSubmit={handleAuthSubmit}>
              <h2 className="text-2xl font-bold text-center mb-4">{isLogin ? 'Login' : 'Register'}</h2>
              {error && <p className="text-red-500 text-center mb-4">{error}</p>}
              <div className="space-y-4">
                <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username" required className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required className="w-full px-4 py-2 bg-gray-700 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none" />
                <button type="submit" disabled={isLoading} className="w-full px-6 py-3 text-lg font-semibold bg-yellow-500 hover:bg-yellow-600 text-gray-900 rounded-md disabled:bg-gray-600">
                  {isLoading ? 'Submitting...' : (isLogin ? 'Login' : 'Register')}
                </button>
              </div>
            </form>
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="w-full mt-4 text-sm text-yellow-400 hover:underline">
              {isLogin ? "Need an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        )}
      </div>
    </main>
  );
}