// src/components/GameClient.js
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Import our modular components
import EnhancedLobby from './game/EnhancedLobby';
import Scoreboard from './game/Scoreboard';
import GameInterface from './game/GameInterface';
import NotebookStyles from './game/NotebookStyles';

export default function GameClient({ matchId }) {
  const { user } = useAuth();
  const router = useRouter();
  
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null);
  const [log, setLog] = useState([]);
  const [playerChoice, setPlayerChoice] = useState(null);
  const [lastBallOutcome, setLastBallOutcome] = useState(null);

  // WebSocket connection logic
  useEffect(() => {
    if (!matchId || !user) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        router.push('/');
        return;
    }

    // --- BEFORE ---
    // const wsUrl = `ws://127.0.0.1:8000/ws/game/${matchId}/?token=${accessToken}`;

    // --- AFTER ---
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || '127.0.0.1:8000';
    const protocol = wsHost.includes('localhost') ? 'ws://' : 'wss://';
    const wsUrl = `${protocol}${wsHost}/ws/game/${matchId}/?token=${accessToken}`;
    
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => setLog(prev => ['Status: Connected!']);
    newSocket.onclose = () => setLog(prev => [...prev, 'Status: Disconnected.']);
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);

      if (data.type === 'game_state_update') {
        setGameState(prevGameState => {
          const newGameState = data.payload;
          setPlayerChoice(null); 
          
          // Check for new ball using previous state
          const lastBall = newGameState.last_ball;
          if (lastBall && newGameState.balls_played > (prevGameState?.balls_played ?? -1)) {
            const outcomeText = lastBall.is_wicket ? "OUT!" : `${lastBall.runs_scored} RUNS!`;
            const outcomeRuns = lastBall.is_wicket ? null : lastBall.runs_scored;
            setLastBallOutcome({ text: outcomeText, runs: outcomeRuns, isWicket: lastBall.is_wicket });
            
            // Format log entry like notebook style
            const logEntry = lastBall.is_wicket 
              ? `Bowler: ${lastBall.bowler_choice}, Batsman: ${lastBall.batsman_choice} → OUT!`
              : `Bowler: ${lastBall.bowler_choice}, Batsman: ${lastBall.batsman_choice} → ${lastBall.runs_scored} runs`;
            setLog(prev => [...prev, logEntry]);
          }
          
          return newGameState;
        });
      } else if (data.type === 'info_message') {
        setLog(prev => [...prev, `Info: ${data.message}`]);
      } else if (data.error) {
        alert(`Error: ${data.error}`);
      }
    };

    setSocket(newSocket);
    return () => newSocket.close();
  }, [matchId, user, router]);

  // Ball outcome overlay timeout
  useEffect(() => {
    if (lastBallOutcome) {
      const timer = setTimeout(() => {
        setLastBallOutcome(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [lastBallOutcome]);

  // Handle player choice and send to server
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
  
  // Show lobby while waiting for game to start
  if (!gameState) {
    return <EnhancedLobby matchId={matchId} gameState={gameState} />;
  }

  return (
    <div className="min-h-screen bg-blue-50 relative overflow-hidden">
      <NotebookStyles />

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
            
            {/* Desktop Layout - Three Column Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              
              {/* Left Column - Scoreboard */}
              <Scoreboard gameState={gameState} user={user} />
              
              {/* Right Columns - Game Interface */}
              <GameInterface 
                gameState={gameState}
                user={user}
                playerChoice={playerChoice}
                onChoiceSubmit={handleChoiceAndSubmit}
                log={log}
                lastBallOutcome={lastBallOutcome}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}