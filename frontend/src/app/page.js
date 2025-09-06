'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { createMatch, joinMatch } from '@/lib/api';

// Reusable notebook modal component with same styling
function NotebookModal({ isOpen, onClose, onCreate }) {
  const [overs, setOvers] = useState(1);
  const [wickets, setWickets] = useState(2);

  if (!isOpen) return null;

  const handleCreate = () => {
    onCreate(overs, wickets);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
      <div className="bg-white border-4 border-gray-400 p-8 rounded-lg shadow-2xl w-full max-w-md notebook-paper">
        <div className="handwritten-title text-3xl ink-red text-center mb-6 border-b-2 border-red-500 pb-3">
          📝 Match Settings
        </div>
        
        {/* Overs Selection */}
        <div className="mb-6">
          <div className="handwritten text-xl ink-black font-bold mb-3">📏 Overs:</div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 5, 10].map(o => (
              <button 
                key={o} 
                onClick={() => setOvers(o)} 
                className={`handwritten p-3 rounded-lg font-bold border-2 transition-all duration-200 hover:scale-105 ${
                  overs === o 
                    ? 'bg-yellow-200 border-yellow-500 ink-black circle-answer' 
                    : 'bg-blue-50 border-blue-300 ink-blue hover:bg-blue-100'
                }`}
              >
                {o}
              </button>
            ))}
          </div>
        </div>

        {/* Wickets Selection */}
        <div className="mb-8">
          <div className="handwritten text-xl ink-black font-bold mb-3">🏏 Wickets:</div>
          <div className="grid grid-cols-4 gap-3">
            {[1, 2, 3, 5].map(w => (
              <button 
                key={w} 
                onClick={() => setWickets(w)} 
                className={`handwritten p-3 rounded-lg font-bold border-2 transition-all duration-200 hover:scale-105 ${
                  wickets === w 
                    ? 'bg-yellow-200 border-yellow-500 ink-black circle-answer' 
                    : 'bg-red-50 border-red-300 ink-red hover:bg-red-100'
                }`}
              >
                {w}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-4">
          <button 
            onClick={onClose} 
            className="flex-1 handwritten text-lg font-bold py-3 px-4 bg-gray-200 hover:bg-gray-300 ink-black rounded-lg border-2 border-gray-400 transition-all duration-200 hover:scale-105"
          >
            Cancel
          </button>
          <button 
            onClick={handleCreate} 
            className="flex-1 handwritten text-lg font-bold py-3 px-4 bg-green-200 hover:bg-green-300 ink-black rounded-lg border-2 border-green-500 transition-all duration-200 hover:scale-105"
          >
            Create Match!
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
  const [isModalOpen, setIsModalOpen] = useState(false);

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
    } catch (err) {
      setError(err.message || 'An error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInitiateCreateGame = async (overs, wickets) => {
    setIsModalOpen(false);
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
    return (
      <div className="min-h-screen bg-blue-50 flex items-center justify-center">
        <div className="handwritten-title text-3xl ink-blue">Loading your notebook...</div>
      </div>
    );
  }

  return (
    <>
      <NotebookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onCreate={handleInitiateCreateGame} 
      />
      
      <div className="min-h-screen bg-blue-50 relative overflow-hidden">
        
        {/* Same CSS styles from GameClient */}
        <style jsx global>{`
          @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Caveat:wght@400;600;700&display=swap');
          
          .notebook-paper {
            background: 
              linear-gradient(90deg, transparent 0px, transparent 79px, rgba(239, 68, 68, 0.3) 79px, rgba(239, 68, 68, 0.3) 81px, transparent 81px),
              repeating-linear-gradient(
                0deg,
                transparent,
                transparent 39px,
                rgba(59, 130, 246, 0.1) 39px,
                rgba(59, 130, 246, 0.1) 40px
              ),
              radial-gradient(circle at 20% 80%, rgba(0,0,0,0.02) 0%, transparent 50%),
              radial-gradient(circle at 80% 20%, rgba(0,0,0,0.02) 0%, transparent 50%),
              #fefefe;
          }
          
          .handwritten { 
            font-family: 'Kalam', cursive; 
            line-height: 1.6;
          }
          .handwritten-title { 
            font-family: 'Caveat', cursive; 
            font-weight: 700;
          }
          
          .ink-blue { color: #1e40af; }
          .ink-red { color: #dc2626; }
          .ink-green { color: #059669; }
          .ink-black { color: #1f2937; }
          
          .spiral-holes {
            background: 
              radial-gradient(circle at 50% 10%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
              radial-gradient(circle at 50% 30%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
              radial-gradient(circle at 50% 50%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
              radial-gradient(circle at 50% 70%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
              radial-gradient(circle at 50% 90%, #ffffff 30%, #e5e7eb 35%, transparent 40%),
              #f3f4f6;
          }
          
          @keyframes gentle-bounce {
            0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
            40% { transform: translateY(-8px); }
            60% { transform: translateY(-3px); }
          }
          
          @keyframes cricket-ball-bounce {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            25% { transform: translateY(-15px) rotate(90deg); }
            50% { transform: translateY(-25px) rotate(180deg); }
            75% { transform: translateY(-15px) rotate(270deg); }
          }
          
          @keyframes pencil-wiggle {
            0%, 100% { transform: rotate(0deg); }
            25% { transform: rotate(2deg); }
            75% { transform: rotate(-2deg); }
          }
          
          @keyframes paper-rustle {
            0%, 100% { transform: rotate(0deg) translateY(0px); }
            25% { transform: rotate(1deg) translateY(-2px); }
            50% { transform: rotate(0deg) translateY(-4px); }
            75% { transform: rotate(-1deg) translateY(-2px); }
          }
          
          .gentle-bounce { animation: gentle-bounce 2s infinite; }
          .cricket-ball-bounce { animation: cricket-ball-bounce 2s infinite; }
          .pencil-wiggle { animation: pencil-wiggle 2s infinite; }
          .paper-rustle { animation: paper-rustle 3s infinite; }
          
          .circle-answer {
            border: 2px solid #dc2626;
            border-radius: 50%;
            background: rgba(252, 165, 165, 0.3);
          }
          
          .underline-wavy {
            text-decoration: underline;
            text-decoration-style: wavy;
            text-decoration-color: #dc2626;
          }
          
          .paper-torn {
            clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 90%, 100% 95%, 95% 100%, 0 100%);
          }
          
          .code-highlight {
            background: linear-gradient(45deg, #fef3c7, #fde68a);
            border: 2px solid #f59e0b;
            box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
          }
        `}</style>

        {/* Notebook binding */}
        <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 spiral-holes border-r border-gray-300"></div>

        {/* Main notebook page */}
        <div className="notebook-paper min-h-screen">
          <div className="pt-12 pb-8 px-4 lg:pl-24 lg:pr-8">
            <div className="max-w-4xl mx-auto">
              
              {/* Header - Notebook Cover Style */}
              <div className="text-center mb-12">
                <h1 className="handwritten-title text-6xl lg:text-8xl ink-red mb-4 underline-wavy paper-rustle">
                  PAPER CRICKET
                </h1>
                <div className="handwritten text-xl ink-blue">
                  📔 The classic notebook game, now online
                </div>
                {user && (
                  <div className="handwritten text-lg ink-green mt-4 bg-green-100 inline-block px-4 py-2 rounded-lg border-2 border-green-400">
                    Welcome back, {user.username}! 👋
                    <button 
                      onClick={logout} 
                      className="ml-4 px-2 py-1 text-sm bg-red-200 hover:bg-red-300 ink-red rounded border border-red-400 transition-colors"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>

              {user ? (
                /* Logged in view - Notebook style */
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  
                  {/* Left side - Quick Actions */}
                  <div className="space-y-6">
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg border-2 border-blue-400">
                      <div className="handwritten-title text-2xl ink-red mb-4 border-b border-red-300 pb-2">
                        🎮 Quick Actions
                      </div>
                      
                      <button
                        onClick={() => setIsModalOpen(true)}
                        disabled={isLoading}
                        className="w-full handwritten text-xl font-bold py-4 px-6 mb-4 bg-blue-200 hover:bg-blue-300 ink-black rounded-lg border-2 border-blue-500 transition-all duration-200 hover:scale-105 disabled:opacity-50 paper-rustle"
                      >
                        ✏️ Create New Match
                      </button>

                      <div className="handwritten text-center ink-blue mb-4">
                        <span className="bg-yellow-200 px-3 py-1 rounded border border-yellow-400">OR</span>
                      </div>

                      <div className="space-y-3">
                        <input 
                          type="text" 
                          value={matchCode} 
                          onChange={(e) => setMatchCode(e.target.value.toUpperCase())} 
                          placeholder="Enter Match Code..." 
                          className="w-full handwritten px-4 py-3 bg-yellow-100 border-2 border-yellow-400 rounded-lg text-center tracking-widest font-bold ink-black focus:ring-2 focus:ring-yellow-500 focus:outline-none code-highlight" 
                          disabled={isLoading} 
                        />
                        <button 
                          onClick={handleJoinGame} 
                          disabled={isLoading || !matchCode} 
                          className="w-full handwritten text-xl font-bold py-4 px-6 bg-green-200 hover:bg-green-300 ink-black rounded-lg border-2 border-green-500 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        >
                          {isLoading ? '🔍 Joining...' : '🏃 Join Match'}
                        </button>
                      </div>
                    </div>

                    {/* How to Play section */}
                    <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg paper-torn">
                      <div className="handwritten-title text-xl ink-red mb-3">
                        🏏 How to Play:
                      </div>
                      <div className="handwritten text-sm ink-black space-y-2">
                        <div>• Both players pick a letter (A-G)</div>
                        <div>• Same letter = OUT! 💥</div>
                        <div>• Different letters = Runs scored!</div>
                        <div>• A=1, B=2, C=3, D=4, E=6, F=4, G=6</div>
                        <div>• Score more runs than your opponent!</div>
                      </div>
                    </div>
                  </div>

                  {/* Right side - Future features placeholder */}
                  <div className="space-y-6">
                    
                    {/* Stats placeholder */}
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg border-2 border-green-400">
                      <div className="handwritten-title text-2xl ink-red mb-4 border-b border-red-300 pb-2">
                        📊 Your Stats
                      </div>
                      <div className="handwritten text-center ink-blue py-8">
                        <div className="text-4xl mb-4 cricket-ball-bounce">🏏</div>
                        <div>Coming Soon!</div>
                        <div className="text-sm mt-2">Track your wins, losses, and best scores</div>
                      </div>
                    </div>

                    {/* Leaderboard placeholder */}
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg border-2 border-purple-400">
                      <div className="handwritten-title text-2xl ink-red mb-4 border-b border-red-300 pb-2">
                        🏆 Leaderboard
                      </div>
                      <div className="handwritten text-center ink-blue py-8">
                        <div className="text-4xl mb-4 gentle-bounce">🥇</div>
                        <div>Coming Soon!</div>
                        <div className="text-sm mt-2">See who's the Paper Cricket champion</div>
                      </div>
                    </div>

                    {/* Recent matches placeholder */}
                    <div className="bg-white/90 p-6 rounded-lg shadow-lg border-2 border-orange-400">
                      <div className="handwritten-title text-2xl ink-red mb-4 border-b border-red-300 pb-2">
                        📝 Recent Matches
                      </div>
                      <div className="handwritten text-center ink-blue py-8">
                        <div className="text-4xl mb-4 pencil-wiggle">✏️</div>
                        <div>Coming Soon!</div>
                        <div className="text-sm mt-2">Review your match history</div>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Not logged in view - Auth form with notebook styling */
                <div className="max-w-md mx-auto">
                  <div className="bg-white/95 p-8 rounded-lg shadow-lg border-4 border-gray-400 paper-torn">
                    <form onSubmit={handleAuthSubmit}>
                      <div className="handwritten-title text-3xl ink-red text-center mb-6 border-b-2 border-red-500 pb-3">
                        {isLogin ? '📖 Login' : '✏️ Register'}
                      </div>
                      
                      {error && (
                        <div className="handwritten text-center mb-4 p-3 bg-red-100 border-2 border-red-400 rounded-lg ink-red">
                          {error}
                        </div>
                      )}
                      
                      <div className="space-y-4">
                        <div>
                          <div className="handwritten text-lg ink-black font-bold mb-2">👤 Username:</div>
                          <input 
                            type="text" 
                            value={username} 
                            onChange={(e) => setUsername(e.target.value)} 
                            placeholder="Enter your username..." 
                            required 
                            className="w-full handwritten px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg ink-black focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                          />
                        </div>
                        <div>
                          <div className="handwritten text-lg ink-black font-bold mb-2">🔒 Password:</div>
                          <input 
                            type="password" 
                            value={password} 
                            onChange={(e) => setPassword(e.target.value)} 
                            placeholder="Enter your password..." 
                            required 
                            className="w-full handwritten px-4 py-3 bg-blue-50 border-2 border-blue-300 rounded-lg ink-black focus:ring-2 focus:ring-blue-500 focus:outline-none" 
                          />
                        </div>
                        <button 
                          type="submit" 
                          disabled={isLoading} 
                          className="w-full handwritten text-xl font-bold py-4 px-6 bg-yellow-200 hover:bg-yellow-300 ink-black rounded-lg border-2 border-yellow-500 transition-all duration-200 hover:scale-105 disabled:opacity-50"
                        >
                          {isLoading ? '📝 Processing...' : (isLogin ? '📖 Login' : '✏️ Create Account')}
                        </button>
                      </div>
                    </form>
                    
                    <button 
                      onClick={() => { setIsLogin(!isLogin); setError(''); }} 
                      className="w-full mt-6 handwritten text-lg ink-blue hover:ink-red transition-colors border-b border-blue-300 hover:border-red-300 pb-1"
                    >
                      {isLogin ? "Need an account? Register here" : "Already have an account? Login here"}
                    </button>
                  </div>
                </div>
              )}

              {/* Decorative elements */}
              <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none">
                <div className="handwritten text-lg ink-blue transform rotate-12 space-y-1">
                  <div>🏏 vs 🏏</div>
                  <div className="text-xs">let's play!</div>
                </div>
              </div>
              
              <div className="fixed top-20 right-8 opacity-30 pointer-events-none gentle-bounce">
                <div className="text-2xl">🦗</div>
              </div>
              
              <div className="fixed bottom-32 left-8 opacity-25 pointer-events-none gentle-bounce" style={{animationDelay: '2.5s'}}>
                <div className="text-xl">📓</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}