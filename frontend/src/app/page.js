'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createMatch, joinMatch } from '@/lib/api';

// A new, separate component for our modal
function CreateMatchModal({ isOpen, onClose, onCreate }) {
  const [overs, setOvers] = useState(1);
  const [wickets, setWickets] = useState(2);

  if (!isOpen) return null;

  const handleCreate = () => {
    onCreate(overs, wickets);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-8 rounded-lg shadow-2xl w-full max-w-sm">
        <h2 className="text-2xl font-bold text-center mb-6">Match Settings</h2>
        
        {/* Overs Selection */}
        <div className="mb-6">
          <label className="block mb-3 text-lg font-semibold text-gray-300">Overs</label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 5, 10].map(o => (
              <button key={o} onClick={() => setOvers(o)} className={`p-3 rounded-md font-bold transition-colors ${overs === o ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Wickets Selection */}
        <div className="mb-8">
          <label className="block mb-3 text-lg font-semibold text-gray-300">Wickets</label>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 5].map(w => (
              <button key={w} onClick={() => setWickets(w)} className={`p-3 rounded-md font-bold transition-colors ${wickets === w ? 'bg-yellow-500 text-gray-900' : 'bg-gray-700 hover:bg-gray-600'}`}>
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button onClick={onClose} className="w-full px-6 py-3 text-lg font-semibold bg-gray-600 hover:bg-gray-500 rounded-md">
            Cancel
          </button>
          <button onClick={handleCreate} className="w-full px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-md">
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}


export default function HomePage() {
  const { user, login, register, logout, loading } = useAuth();
  const router = useRouter();

  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [matchCode, setMatchCode] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // State to control the modal

  const handleAuthSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    try {
      if (isLogin) { await login(username, password); } 
      else { await register(username, password); }
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateCreateGame = async (overs, wickets) => {
    setIsModalOpen(false); // Close the modal
    setIsLoading(true);
    try {
      const newMatch = await createMatch(overs, wickets);
      router.push(`/game/${newMatch.match_code}`);
    } catch (err) {
      alert(err.message);
      setIsLoading(false);
    }
  };
  
  const handleJoinGame = async () => {
    if (!user || !matchCode) return;
    setIsLoading(true);
    try {
      const match = await joinMatch(matchCode);
      router.push(`/game/${match.match_code}`);
    } catch (err) {
      alert(err.message);
      setIsLoading(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Loading...</div>;
  }

  return (
    <>
      <CreateMatchModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleInitiateCreateGame} 
      />
      <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md space-y-8">
          <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold">Paper Cricket</h1>
            <div className="text-gray-400 mt-2 flex justify-center items-center gap-4">
              {user ? (
                <>
                  <span>Welcome, {user.username}!</span>
                  <button onClick={logout} className="px-3 py-1 text-sm bg-red-600 hover:bg-red-700 rounded-md">
                    Logout
                  </button>
                </>
              ) : ( "The classic notebook game, now online." )}
            </div>
          </header>

          {user ? (
            <div className="bg-gray-800 p-8 rounded-lg shadow-lg">
              <button
                onClick={() => setIsModalOpen(true)} // This button now opens the modal
                disabled={isLoading}
                className="w-full px-6 py-3 text-lg font-semibold bg-blue-600 hover:bg-blue-700 rounded-md transition-transform transform hover:scale-105 disabled:bg-gray-600"
              >
                Create New Game
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
    </>
  );
}

