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
  const [playerChoice, setPlayerChoice] = useState('A');

  const letterChoices = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

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
        const lastBall = data.payload.last_ball;
        // Add to log only if a new ball has been played
        if (lastBall && data.payload.balls_played > (gameState?.balls_played ?? -1)) {
          const outcome = lastBall.is_wicket ? "OUT!" : `${lastBall.runs_scored} runs!`;
          setLog(prev => [...prev, `Ball Result: ${outcome}`]);
        }
      } else if (data.type === 'info_message') {
        setLog(prev => [...prev, `Info: ${data.message}`]);
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [matchId, user, router]);

  const handleSendMove = () => {
    if (socket && user && gameState) {
      let action = '';
      if (gameState.turn === user.username && gameState.batting_player === user.username) {
        action = 'bat';
      } else if (gameState.turn === user.username && gameState.bowling_player === user.username) {
        action = 'bowl';
      }

      if (action) {
        socket.send(JSON.stringify({
          action: action,
          choice: playerChoice,
        }));
      }
    }
  };
  
  if (!gameState) {
    return <div className="flex items-center justify-center h-screen bg-gray-900 text-white">Connecting to game...</div>;
  }
  
  const isMyTurn = user && gameState.status === 'ongoing' && gameState.turn === user.username;

  return (
    <main className="bg-gray-900 text-white min-h-screen flex flex-col items-center p-4 sm:p-8">
      <div className="w-full max-w-2xl space-y-6">
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
        </div>

        {gameState.status === 'ongoing' && (
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg">
            <h3 className="text-2xl font-semibold mb-4">{isMyTurn ? `Your Turn (${user.username})` : `Waiting for ${gameState.turn}...`}</h3>
            <div className="flex items-center gap-4">
              <label className="font-bold">Your Choice:</label>
              <select value={playerChoice} onChange={(e) => setPlayerChoice(e.target.value)} disabled={!isMyTurn} className="bg-gray-700 p-2 rounded-md focus:ring-2 focus:ring-yellow-400 focus:outline-none">
                {letterChoices.map(l => <option key={l} value={l}>{l}</option>)}
              </select>
              <button onClick={handleSendMove} disabled={!isMyTurn} className={`px-6 py-2 rounded-md font-bold text-white transition-colors ${!isMyTurn ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-500 hover:bg-yellow-600'}`}>
                Submit Move
              </button>
            </div>
          </div>
        )}

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
    </main>
  );
}

