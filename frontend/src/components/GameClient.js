// UPDATED GameClient.js - Fix lobby transition issue

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
  const [connectionStatus, setConnectionStatus] = useState('connecting'); // Add connection status

  // WebSocket connection logic
  useEffect(() => {
    if (!matchId || !user) return;

    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
        router.push('/');
        return;
    }

    // Improved WebSocket URL construction
    const isDevelopment = process.env.NODE_ENV === 'development';
    const wsHost = process.env.NEXT_PUBLIC_WS_HOST || 
      (isDevelopment ? '127.0.0.1:8000' : 'paper-cricket.onrender.com');
    const protocol = isDevelopment || wsHost.includes('localhost') ? 'ws://' : 'wss://';
    const wsUrl = `${protocol}${wsHost}/ws/game/${matchId}/?token=${accessToken}`;
    
    console.log('🔌 Connecting to WebSocket:', wsUrl);
    
    const newSocket = new WebSocket(wsUrl);

    newSocket.onopen = () => {
      console.log('✅ WebSocket Connected!');
      setConnectionStatus('connected');
      setLog(['Status: Connected to match room!']);
    };

    newSocket.onclose = () => {
      console.log('❌ WebSocket Disconnected');
      setConnectionStatus('disconnected');
      setLog(prev => [...prev, 'Status: Disconnected from match room.']);
    };

    newSocket.onerror = (error) => {
      console.error('🚨 WebSocket Error:', error);
      setConnectionStatus('error');
    };

    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('📨 Received WebSocket message:', data);

      if (data.type === 'game_state_update') {
        console.log('🎮 Game state update received:', data.payload);
        
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
        console.log('ℹ️ Info message:', data.message);
        setLog(prev => [...prev, `Info: ${data.message}`]);
      } else if (data.error) {
        console.error('🚨 WebSocket Error:', data.error);
        alert(`Error: ${data.error}`);
      }
    };

    setSocket(newSocket);
    return () => {
      console.log('🔌 Closing WebSocket connection');
      newSocket.close();
    };
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
        console.log(`🎯 Sending choice: ${choice} (action: ${action})`);
        socket.send(JSON.stringify({ action: action, choice: choice }));
      }
    }
  };

  // Debug: Log current state
  console.log('🔍 Current gameState:', gameState);
  console.log('🔍 Connection status:', connectionStatus);
  
  // Show connection status if there's an issue
  if (connectionStatus === 'error') {
    return (
      <div className="min-h-screen bg-red-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-lg shadow-lg">
          <div className="text-4xl mb-4">❌</div>
          <div className="text-xl font-bold text-red-600 mb-4">Connection Failed</div>
          <div className="text-gray-600 mb-4">Unable to connect to game server</div>
          <button 
            onClick={() => window.location.reload()} 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Retry Connection
          </button>
        </div>
      </div>
    );
  }

  // Show lobby while waiting for game to start OR if no gameState yet
  // FIXED: Only show lobby if status is 'waiting' or gameState doesn't exist
  if (!gameState || gameState.status === 'waiting') {
    console.log('🏠 Showing lobby - gameState:', gameState);
    return <EnhancedLobby matchId={matchId} gameState={gameState} />;
  }

  // FIXED: Show game interface for 'ongoing' and 'completed' status
  console.log('🎮 Showing game interface - status:', gameState.status);

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
              <span className="mx-4">•</span>
              <span className={`px-2 py-1 rounded ${
                gameState.status === 'ongoing' ? 'bg-green-100 text-green-800' : 
                gameState.status === 'completed' ? 'bg-red-100 text-red-800' : 'bg-yellow-100'
              }`}>
                Status: {gameState.status.toUpperCase()}
              </span>
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
