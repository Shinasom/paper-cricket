'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

export default function GameClient({ matchId }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [lastBallOutcome, setLastBallOutcome] = useState(null); // State for the overlay

  const letterChoices = [
    { letter: 'A', runs: 1 }, { letter: 'B', runs: 2 },
    { letter: 'C', runs: 3 }, { letter: 'D', runs: 4 },
    { letter: 'E', runs: 6 }, { letter: 'F', runs: 4 },
    { letter: 'G', runs: 6 }
  ];

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
          const outcomeText = lastBall.is_wicket ? "OUT!" : `${lastBall.runs_scored}`;
          const outcomeRuns = lastBall.is_wicket ? null : lastBall.runs_scored;
          // Set the state for the overlay
          setLastBallOutcome({ text: outcomeText, runs: outcomeRuns, isWicket: lastBall.is_wicket });
          setLog(prev => [...prev, `Ball Result: ${lastBall.is_wicket ? "OUT!" : `${lastBall.runs_scored} runs!`}`]);
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

  // This effect makes the overlay disappear after a short time
  useEffect(() => {
    if (lastBallOutcome) {
      const timer = setTimeout(() => {
        setLastBallOutcome(null);
      }, 1500); // Overlay will be visible for 1.5 seconds
      return () => clearTimeout(timer);
    }
  }, [lastBallOutcome]);

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
  
  if (!gameState) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Connecting to game...</div>;
  }
  
  const isMyTurn = user && gameState.status === 'ongoing' && gameState.turn === user.username;
  const runsNeeded = gameState.target ? Math.max(0, gameState.target - gameState.score) : null;
  const totalBalls = gameState.total_overs * 6;
  const ballsRemaining = totalBalls - gameState.balls_played;

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-8 relative overflow-hidden">
      {/* --- ADDED CSS FOR THE ANIMATION --- */}
      <style jsx global>{`
        @keyframes fade-in-out-scale {
          0% { opacity: 0; transform: scale(0.8); }
          20% { opacity: 1; transform: scale(1.1); }
          80% { opacity: 1; transform: scale(1.0); }
          100% { opacity: 0; transform: scale(0.9); }
        }
        .animate-pop-up {
          animation: fade-in-out-scale 1.5s ease-in-out forwards;
        }
      `}</style>
      
      <div className="w-full max-w-2xl space-y-6 z-10">
        {/* ... (header and scoreboard remain the same) ... */}
        <header className="text-center">
            <h1 className="text-4xl sm:text-5xl font-bold">Paper Cricket</h1>
            <p className="text-gray-400 mt-1">Match ID: {gameState.match_code} | Playing as: <strong className="text-yellow-400">{user.username}</strong></p>
        </header>

        <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-2xl font-semibold">Inning {gameState.current_inning} <span className="text-gray-400 text-lg">({gameState.total_overs} overs)</span></h3>
            {gameState.current_inning === 2 && gameState.target && (
              <h4 className="text-xl font-bold text-yellow-400">Target: {gameState.target}</h4>
            )}
          </div>
          <div className="text-center my-4">
            <p className="text-lg text-gray-300">Batting: <strong className="text-white">{gameState.batting_player}</strong></p>
            <p className="text-5xl font-mono my-2">{gameState.score}<span className="text-gray-400">/</span>{gameState.wickets}</p>
            <p className="text-gray-400">{Math.floor(gameState.balls_played / 6)}.{gameState.balls_played % 6} overs</p>
          </div>
          
          {gameState.current_inning === 2 && gameState.target && gameState.status === 'ongoing' && (
            <div className="text-center mt-4 border-t border-gray-700 pt-4">
              <p className="text-lg">
                Needs <strong className="text-green-400 text-xl">{runsNeeded}</strong> runs in <strong className="text-green-400 text-xl">{ballsRemaining}</strong> balls to win.
              </p>
            </div>
          )}
        </div>

        {gameState.status === 'ongoing' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4 text-center">{isMyTurn ? `Your Turn (${user.username})` : `Waiting for ${gameState.turn}...`}</h3>
            <div className="grid grid-cols-4 gap-3 my-4">
              {letterChoices.map(({ letter, runs }) => (
                <button
                  key={letter}
                  onClick={() => handleChoiceAndSubmit(letter)}
                  disabled={!isMyTurn}
                  className={`p-3 rounded-lg text-center font-bold transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed ${
                    playerChoice === letter ? 'bg-yellow-500 text-gray-900 ring-2 ring-white' : 'bg-gray-700 hover:bg-gray-600'
                  }`}
                >
                  <div className="text-2xl">{letter}</div>
                  <div className="text-xs">{runs} {runs === 1 ? 'run' : 'runs'}</div>
                </button>
              ))}
              <div className="col-start-2"></div>
            </div>
          </div>
        )}

        {/* ... (log and winner display remain the same) ... */}
        {gameState.status === 'completed' ? (
          <div className="text-center p-6 bg-green-800 rounded-lg shadow-lg">
            <h2 className="text-3xl font-bold">Match Over!</h2>
            <h4 className="text-xl mt-2">{gameState.winner ? `${gameState.winner} wins!` : "It's a tie!"}</h4>
          </div>
        ) : (
          <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h4 className="font-semibold mb-2">Game Log</h4>
            <div className="text-sm text-gray-300 h-24 overflow-y-scroll space-y-1">
              {log.map((msg, index) => <p key={index} className="font-mono">{msg}</p>)}
            </div>
          </div>
        )}
      </div>

      {/* --- NEW OUTCOME OVERLAY --- */}
      {lastBallOutcome && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-20">
          <div
            key={gameState.balls_played} // Re-triggers the animation on each ball
            className={`px-10 py-6 rounded-lg shadow-2xl animate-pop-up flex flex-col items-center ${
              lastBallOutcome.isWicket ? 'bg-red-600' : 'bg-green-600'
            }`}
          >
            <span className="text-7xl font-black text-white">{lastBallOutcome.text}</span>
            {!lastBallOutcome.isWicket && (
              <span className="text-2xl font-semibold text-white mt-1">
                {lastBallOutcome.runs === 1 ? 'RUN' : 'RUNS'}
              </span>
            )}
          </div>
        </div>
      )}
    </main>
  );
}

