'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
function EnhancedLobby({ matchId, gameState }) {
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
        
        @keyframes waiting-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.7; transform: scale(1.05); }
        }
        
        @keyframes dots-loading {
          0%, 20% { opacity: 0; }
          50% { opacity: 1; }
          100% { opacity: 0; }
        }
        
        @keyframes paper-rustle {
          0%, 100% { transform: rotate(0deg) translateY(0px); }
          25% { transform: rotate(1deg) translateY(-2px); }
          50% { transform: rotate(0deg) translateY(-4px); }
          75% { transform: rotate(-1deg) translateY(-2px); }
        }
        
        @keyframes cricket-ball-bounce {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-15px) rotate(90deg); }
          50% { transform: translateY(-25px) rotate(180deg); }
          75% { transform: translateY(-15px) rotate(270deg); }
        }
        
        @keyframes ink-spread {
          0% { transform: scale(0.8); opacity: 0; }
          50% { transform: scale(1.1); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        
        @keyframes pencil-wiggle {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(2deg); }
          75% { transform: rotate(-2deg); }
        }
        
        .gentle-bounce { animation: gentle-bounce 2s infinite; }
        .waiting-pulse { animation: waiting-pulse 2s infinite; }
        .dots-loading { animation: dots-loading 1.5s infinite; }
        .paper-rustle { animation: paper-rustle 3s infinite; }
        .cricket-ball-bounce { animation: cricket-ball-bounce 2s infinite; }
        .ink-spread { animation: ink-spread 0.5s ease-out; }
        .pencil-wiggle { animation: pencil-wiggle 2s infinite; }
        
        .dashed-box {
          border: 2px dashed #3b82f6;
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%), 
                      linear-gradient(-45deg, rgba(59, 130, 246, 0.05) 25%, transparent 25%);
          background-size: 20px 20px;
        }
        
        .code-highlight {
          background: linear-gradient(45deg, #fef3c7, #fde68a);
          border: 2px solid #f59e0b;
          box-shadow: inset 0 2px 4px rgba(0,0,0,0.1);
        }
        
        .paper-torn {
          clip-path: polygon(0 0, 100% 0, 100% 85%, 95% 90%, 100% 95%, 95% 100%, 0 100%);
        }
        
        .underline-wavy {
          text-decoration: underline;
          text-decoration-style: wavy;
          text-decoration-color: #dc2626;
        }
      `}</style>

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
export default function GameClient({ matchId }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [lastBallOutcome, setLastBallOutcome] = useState(null);

  const letterChoices = [
    { letter: 'A', runs: 1 }, { letter: 'B', runs: 2 },
    { letter: 'C', runs: 3 }, { letter: 'D', runs: 4 },
    { letter: 'E', runs: 6 }, { letter: 'F', runs: 4 },
    { letter: 'G', runs: 6 }
  ];

  // Your existing WebSocket logic
  useEffect(() => {
    if (!matchId || !user) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        router.push('/');
        return;
    }

    const wsUrl = `ws://127.0.0.1:8000/ws/game/${matchId}/?token=${accessToken}`;
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => setLog(prev => ['Status: Connected!']);
    newSocket.onclose = () => setLog(prev => [...prev, 'Status: Disconnected.']);
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);

      if (data.type === 'game_state_update') {
        setGameState(data.payload);
        setPlayerChoice(null); 
        const lastBall = data.payload.last_ball;
        if (lastBall && data.payload.balls_played > (gameState?.balls_played ?? -1)) {
          const outcomeText = lastBall.is_wicket ? "OUT!" : `${lastBall.runs_scored} RUNS!`;
          const outcomeRuns = lastBall.is_wicket ? null : lastBall.runs_scored;
          setLastBallOutcome({ text: outcomeText, runs: outcomeRuns, isWicket: lastBall.is_wicket });
          
          // Format log entry like notebook style
          const logEntry = lastBall.is_wicket 
            ? `Bowler: ${lastBall.bowler_choice}, Batsman: ${lastBall.batsman_choice} → OUT!`
            : `Bowler: ${lastBall.bowler_choice}, Batsman: ${lastBall.batsman_choice} → ${lastBall.runs_scored} runs`;
          setLog(prev => [...prev, logEntry]);
        }
      } else if (data.type === 'info_message') {
        setLog(prev => [...prev, `Info: ${data.message}`]);
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [matchId, user, router, gameState?.balls_played]);

  // Overlay timeout effect
  useEffect(() => {
    if (lastBallOutcome) {
      const timer = setTimeout(() => {
        setLastBallOutcome(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastBallOutcome]);

  // Your existing choice handler
  const handleChoiceAndSubmit = (choice) => {
    setPlayerChoice(choice);
    if (socket && user && gameState) {
      let action = '';
      if (gameState.turn === user.username && gameState.batting_player === user.username) {
        action = 'bat';
      } else if (gameState.turn === user.username && gameState.bowling_player === user.username) {
        action = 'bowl';
      }
      if (action) {
        socket.send(JSON.stringify({ action: action, choice: choice }));
      }
    }
  };
  
  // Loading state with notebook feel
 // Loading state - only show when no gameState exists yet
if (!gameState) {
  return (
    <EnhancedLobby matchId={matchId} gameState={gameState} />
  );
}

  
  const isMyTurn = user && gameState.status === 'ongoing' && gameState.turn === user.username;
  const runsNeeded = gameState.target ? Math.max(0, gameState.target - gameState.score) : null;
  const totalBalls = gameState.total_overs * 6;
  const ballsRemaining = totalBalls - gameState.balls_played;
  const currentOver = Math.floor(gameState.balls_played / 6);
  const ballInOver = gameState.balls_played % 6;

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      
      {/* Notebook styling */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Kalam:wght@300;400;700&family=Caveat:wght@400;600;700&display=swap');
        
        .notebook-paper {
          background: 
            /* Red margin line - subtle */
            linear-gradient(90deg, transparent 0px, transparent 79px, rgba(239, 68, 68, 0.3) 79px, rgba(239, 68, 68, 0.3) 81px, transparent 81px),
            /* Very subtle ruled lines */
            repeating-linear-gradient(
              0deg,
              transparent,
              transparent 39px,
              rgba(59, 130, 246, 0.1) 39px,
              rgba(59, 130, 246, 0.1) 40px
            ),
            /* Paper color with slight texture */
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
        
        @keyframes pen-bounce {
          0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
          40% { transform: translateY(-10px); }
          60% { transform: translateY(-5px); }
        }
        
        @keyframes ink-blot {
          0% { 
            opacity: 0; 
            transform: scale(0.5) rotate(-5deg);
            filter: blur(2px);
          }
          50% { 
            opacity: 1; 
            transform: scale(1.2) rotate(2deg);
            filter: blur(1px);
          }
          100% { 
            opacity: 1; 
            transform: scale(1) rotate(0deg);
            filter: blur(0px);
          }
        }
        
        .pen-bounce { animation: pen-bounce 2s infinite; }
        .ink-blot { animation: ink-blot 1.5s cubic-bezier(0.68, -0.55, 0.265, 1.55); }
        
        .underline-red {
          background-image: linear-gradient(transparent 50%, #dc2626 50%, #dc2626 60%, transparent 60%);
          background-size: 100% 20px;
        }
        
        .circle-answer {
          border: 2px solid #dc2626;
          border-radius: 50%;
          background: rgba(252, 165, 165, 0.3);
        }
        
        .pen-selection {
          background: linear-gradient(45deg, rgba(59, 130, 246, 0.1) 0%, rgba(59, 130, 246, 0.3) 100%);
          border: 2px dashed #3b82f6;
        }
      `}</style>

      {/* Notebook Binding/Spiral */}
      <div className="hidden lg:block absolute left-0 top-0 bottom-0 w-16 spiral-holes border-r border-gray-300"></div>

      {/* Main Notebook Page */}
      <div className="notebook-paper min-h-screen">
        
        {/* Header */}
        <div className="pt-12 pb-6 px-4 lg:pl-24 lg:pr-8">
          <div className="text-center lg:text-left max-w-6xl mx-auto">
            <h1 className="handwritten-title text-4xl lg:text-6xl ink-red mb-2 underline-red">
              PAPER CRICKET
            </h1>
            <div className="handwritten text-lg ink-blue">
              <span className="bg-yellow-200 px-2 py-1 rounded">Match: {gameState.match_code}</span>
              <span className="mx-4">•</span>
              <span className="bg-blue-100 px-2 py-1 rounded">Playing as: {user.username}</span>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="px-4 lg:pl-24 lg:pr-8 pb-8">
          <div className="max-w-6xl mx-auto">
            
            {/* Desktop Layout - Two Column */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Scorebook */}
              <div className="lg:col-span-1 space-y-6">
                
                {/* Match Header */}
                <div className="handwritten text-lg ink-black bg-white/80 p-4 rounded-lg shadow-sm">
                  <div className="border-b-2 border-red-500 pb-2 mb-4">
                    <span className="handwritten-title text-2xl ink-red">Inning {gameState.current_inning}</span>
                    <span className="handwritten ml-4 ink-blue">({gameState.total_overs} overs)</span>
                  </div>
                </div>

                {/* Players */}
                <div className="space-y-4">
                  <div className="handwritten bg-white/90 p-3 rounded-lg shadow-sm">
                    <div className="ink-blue font-bold text-lg mb-1">🏏 BATTING:</div>
                    <div className="text-xl ink-black font-bold bg-blue-50 px-3 py-2 rounded border-l-4 border-blue-500">
                      {gameState.batting_player}
                      {gameState.turn === gameState.batting_player && (
                        <span className="text-sm ink-green ml-2 pen-bounce">← Your turn!</span>
                      )}
                    </div>
                  </div>
                  
                  <div className="handwritten bg-white/90 p-3 rounded-lg shadow-sm">
                    <div className="ink-red font-bold text-lg mb-1">⚾ BOWLING:</div>
                    <div className="text-xl ink-black font-bold bg-red-50 px-3 py-2 rounded border-l-4 border-red-500">
                      {gameState.bowling_player}
                      {gameState.turn === gameState.bowling_player && (
                        <span className="text-sm ink-green ml-2 pen-bounce">← Your turn!</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Score Box */}
                <div className="border-4 border-black p-6 bg-yellow-50 relative">
                  <div className="absolute -top-3 -left-3 bg-yellow-200 px-2 py-1 handwritten-title text-lg ink-red transform -rotate-2">
                    SCORE
                  </div>
                  <div className="text-center">
                    <div className="handwritten-title text-6xl lg:text-8xl font-bold mb-2">
                      <span className="ink-green">{gameState.score}</span>
                      <span className="ink-red mx-2">/</span>
                      <span className="ink-red">{gameState.wickets}</span>
                    </div>
                    <div className="handwritten text-lg ink-blue">
                      Overs: {currentOver}.{ballInOver}
                    </div>
                  </div>
                </div>

                {/* Target */}
                {gameState.current_inning === 2 && gameState.target && gameState.status === 'ongoing' && (
                  <div className="border-2 border-dashed border-green-600 p-4 bg-green-50">
                    <div className="handwritten-title text-xl ink-green font-bold text-center mb-2">
                      TARGET: {gameState.target}
                    </div>
                    <div className="handwritten text-center ink-black">
                      Need <span className="ink-green font-bold text-xl">{runsNeeded}</span> runs
                      <br />
                      in <span className="ink-green font-bold text-xl">{ballsRemaining}</span> balls
                    </div>
                    
                    <div className="mt-3 h-6 border-2 border-green-600 rounded-full bg-white overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-green-300 to-green-500 transition-all duration-500 rounded-full"
                        style={{ width: `${Math.min((gameState.score / gameState.target) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Game Actions & Commentary */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Choice Buttons */}
                {gameState.status === 'ongoing' && (
                  <div className="space-y-4">
                    <div className="handwritten-title text-2xl ink-red text-center lg:text-left">
                      {isMyTurn ? '✏️ Choose your letter:' : `⏳ Waiting for ${gameState.turn}...`}
                    </div>
                    
                    <div className="grid grid-cols-4 lg:grid-cols-7 gap-3 lg:gap-4">
                      {letterChoices.map(({ letter, runs }) => (
                        <button
                          key={letter}
                          onClick={() => handleChoiceAndSubmit(letter)}
                          disabled={!isMyTurn}
                          className={`group relative aspect-square rounded-lg text-center handwritten font-bold transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                            playerChoice === letter 
                              ? 'circle-answer scale-110 bg-red-50' 
                              : isMyTurn 
                                ? 'pen-selection hover:bg-blue-100 border-2 border-gray-300' 
                                : 'bg-gray-100 border border-gray-300'
                          }`}
                        >
                          <div className="absolute inset-0 flex flex-col items-center justify-center">
                            <div className="text-2xl lg:text-4xl font-bold ink-black">{letter}</div>
                            <div className="text-xs lg:text-sm ink-blue">
                              {runs} {runs === 1 ? 'run' : 'runs'}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Match Over */}
                {gameState.status === 'completed' && (
                  <div className="text-center p-8 bg-green-100 border-4 border-green-500 rounded-lg">
                    <div className="handwritten-title text-4xl ink-green font-bold mb-4">
                      🏆 MATCH OVER! 🏆
                    </div>
                    <div className="handwritten text-2xl ink-black">
                      {gameState.winner ? `${gameState.winner} WINS!` : "IT'S A TIE!"}
                    </div>
                  </div>
                )}

                {/* Ball-by-Ball Record */}
                <div className="bg-white/95 border-2 border-gray-400 rounded-lg p-4 shadow-sm">
                  <div className="handwritten-title text-xl ink-red font-bold mb-3 border-b border-red-300 pb-2">
                    📝 Ball by Ball Record:
                  </div>
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-2 max-h-48 lg:max-h-64 overflow-y-auto">
                    {log.map((entry, index) => (
                      <div key={index} className="handwritten text-sm ink-black p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                        <span className="font-bold">Ball {index + 1}:</span> {entry}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ball Outcome Overlay */}
      {lastBallOutcome && (
        <div className="fixed inset-0 flex items-center justify-center pointer-events-none z-50 p-4">
          <div className={`ink-blot handwritten-title font-bold text-center p-8 lg:p-12 rounded-3xl border-4 transform rotate-2 ${
            lastBallOutcome.isWicket 
              ? 'bg-red-100 border-red-600 text-red-800' 
              : 'bg-green-100 border-green-600 text-green-800'
          }`}>
            <div className="text-6xl lg:text-8xl mb-2">
              {lastBallOutcome.text}
            </div>
            {lastBallOutcome.isWicket && (
              <div className="text-2xl lg:text-3xl">WICKET!</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}