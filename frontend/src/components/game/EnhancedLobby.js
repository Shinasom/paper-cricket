// src/components/game/EnhancedLobby.js
'use client';

import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import NotebookStyles from './NotebookStyles';

export default function EnhancedLobby({ matchId, gameState }) {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  
  // Use actual gameState if available, otherwise show waiting state
  const lobbyState = gameState || {
    match_code: matchId,
    overs: 'Loading...',
    wickets: 'Loading...',
    player1: { username: user?.username || 'You' },
    player2: null,
    status: 'waiting'
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(lobbyState.match_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      const textArea = document.createElement('textarea');
      textArea.value = lobbyState.match_code;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareText = `Join my Paper Cricket match! Code: ${lobbyState.match_code}`;
  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Paper Cricket Match',
          text: shareText,
          url: window.location.href
        });
      } catch (err) {
        handleCopyCode();
      }
    } else {
      handleCopyCode();
    }
  };

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      <NotebookStyles />

      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 spiral-holes border-r border-gray-300"></div>

      <div className="notebook-paper min-h-screen">
        <div className="pt-12 pb-8 px-4 lg:pl-24 lg:pr-8">
          <div className="max-w-4xl mx-auto">
            
            <div className="text-center mb-12">
              <h1 className="handwritten-title text-5xl lg:text-7xl ink-red mb-4 underline-wavy">
                PAPER CRICKET
              </h1>
              <div className="handwritten text-xl ink-blue">
                📔 Waiting for opponent<span className="dots-loading">.</span><span className="dots-loading" style={{animationDelay: '0.5s'}}>.</span><span className="dots-loading" style={{animationDelay: '1s'}}>.</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              
              <div className="space-y-6">
                
                <div className="bg-white/90 p-6 rounded-lg shadow-lg paper-torn waiting-pulse">
                  <div className="handwritten-title text-2xl ink-red mb-4 text-center">
                    🎯 Share This Code
                  </div>
                  <div className="code-highlight p-6 rounded-lg text-center mb-4 paper-rustle">
                    <div className="handwritten-title text-4xl lg:text-6xl ink-black font-bold tracking-widest">
                      {lobbyState.match_code}
                    </div>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      onClick={handleCopyCode}
                      className="flex-1 handwritten text-lg font-bold py-3 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      {copied ? (
                        <span className="ink-spread">✓ Copied!</span>
                      ) : (
                        '📋 Copy Code'
                      )}
                    </button>
                    <button
                      onClick={handleShare}
                      className="flex-1 handwritten text-lg font-bold py-3 px-4 bg-green-500 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 active:scale-95"
                    >
                      📤 Share
                    </button>
                  </div>
                </div>

                <div className="bg-white/90 p-6 rounded-lg shadow-lg">
                  <div className="handwritten-title text-2xl ink-red mb-4 flex items-center">
                    ⚙️ Match Settings
                  </div>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg border-l-4 border-blue-500">
                      <span className="handwritten text-lg ink-black">📏 Overs:</span>
                      <span className="handwritten-title text-2xl ink-blue font-bold">{lobbyState.overs}</span>
                    </div>
                    <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg border-l-4 border-red-500">
                      <span className="handwritten text-lg ink-black">🏏 Wickets:</span>
                      <span className="handwritten-title text-2xl ink-red font-bold">{lobbyState.wickets}</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                
                <div className="bg-white/90 p-6 rounded-lg shadow-lg">
                  <div className="handwritten-title text-2xl ink-red mb-6 text-center">
                    👥 Players
                  </div>
                  
                  <div className="mb-4 p-4 bg-green-100 border-2 border-green-400 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="handwritten text-sm ink-green font-bold">HOST:</div>
                        <div className="handwritten-title text-xl ink-black">
                          {lobbyState.player1.username}
                        </div>
                      </div>
                      <div className="text-2xl">✓</div>
                    </div>
                  </div>

                  <div className="p-4 dashed-box rounded-lg waiting-pulse">
                    {lobbyState.player2 ? (
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="handwritten text-sm ink-blue font-bold">JOINED:</div>
                          <div className="handwritten-title text-xl ink-black">
                            {lobbyState.player2.username}
                          </div>
                        </div>
                        <div className="text-2xl">✓</div>
                      </div>
                    ) : (
                      <div className="text-center">
                        <div className="handwritten text-lg ink-blue mb-3">
                          Waiting for friend to join<span className="dots-loading">.</span><span className="dots-loading" style={{animationDelay: '0.5s'}}>.</span><span className="dots-loading" style={{animationDelay: '1s'}}>.</span>
                        </div>
                        <div className="text-4xl cricket-ball-bounce">⚾</div>
                        <div className="handwritten text-sm ink-blue mt-2">
                          Share the code above!
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-yellow-50 border-2 border-yellow-400 p-6 rounded-lg">
                  <div className="handwritten-title text-xl ink-red mb-3">
                    🏏 How to Play:
                  </div>
                  <div className="handwritten text-sm ink-black space-y-2">
                    <div>• Both players pick a letter (A-G)</div>
                    <div>• Same letter = OUT! 💥</div>
                    <div>• Different letters = Runs scored!</div>
                    <div>• A=1, B=2, C=3, D=4, E=6, F=4, G=6</div>
                    <div>• Try to score more runs than opponent!</div>
                  </div>
                </div>

                <div className="text-center waiting-pulse">
                  <div className="inline-block p-4 rounded-full bg-yellow-200 border-2 border-yellow-500">
                    <div className="handwritten-title text-lg font-bold">
                      📝 Creating match room...
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="fixed bottom-4 right-4 opacity-20 pointer-events-none">
              <div className="handwritten text-lg ink-blue transform rotate-12 space-y-1">
                <div>🏏 vs 🏏</div>
                <div className="text-xs">good luck!</div>
              </div>
            </div>
            
            <div className="fixed top-20 right-8 opacity-30 pointer-events-none gentle-bounce" style={{animationDelay: '1s'}}>
              <div className="text-2xl">🦗</div>
            </div>
            <div className="fixed bottom-32 left-8 opacity-25 pointer-events-none gentle-bounce" style={{animationDelay: '2.5s'}}>
              <div className="text-xl">📓</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}