// src/app/page.js

'use client';

import { useState, useEffect } from 'react';

// This is our main game component
export default function GamePage() {
  const [socket, setSocket] = useState(null);
  const [gameState, setGameState] = useState(null); // Will hold the full game state object
  const [bowlerChoice, setBowlerChoice] = useState('A');
  const [batsmanChoice, setBatsmanChoice] = useState('A');

  // IMPORTANT: Replace with a real match_code for an 'ongoing' match
  const matchId = 'E632QQ'; 
  const letterChoices = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];

  useEffect(() => {
    const newSocket = new WebSocket(`ws://127.0.0.1:8000/ws/game/${matchId}/`);

    newSocket.onopen = () => {
      console.log('WebSocket connection established!');
    };

    // This is the new "brain" of our client
    newSocket.onmessage = (event) => {
      const data = JSON.parse(event.data);
      console.log('Received data:', data);

      if (data.type === 'game_state_update') {
        setGameState(data.payload); // Update the entire game state
      } else if (data.error) {
        console.error('Error from server:', data.error);
        alert(`An error occurred: ${data.error}`);
      }
    };

    newSocket.onclose = () => {
      console.log('WebSocket connection closed.');
    };

    setSocket(newSocket);

    return () => {
      newSocket.close();
    };
  }, []); // Runs only once on component mount

  const handlePlayBall = () => {
    if (socket) {
      // Send the move to the server in the format the consumer expects
      socket.send(JSON.stringify({
        bowler_choice: bowlerChoice,
        batsman_choice: batsmanChoice
      }));
    }
  };

  // Render a loading state until we get the first game state update
  if (!gameState) {
    return <div>Connecting to game...</div>;
  }

  // Once we have the game state, render the main game UI
  return (
    <div style={{ padding: '20px', fontFamily: 'sans-serif', maxWidth: '600px', margin: 'auto' }}>
      <h1>Paper Cricket</h1>
      <h2>Match: {gameState.match_code} (Status: {gameState.status})</h2>
      
      <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px' }}>
        <h3>Inning {gameState.current_inning} of {gameState.total_overs} overs</h3>
        
        {gameState.target && <h4>Target: {gameState.target}</h4>}

        <div style={{ fontSize: '2rem', margin: '20px 0' }}>
          <span>{gameState.batting_player}: </span>
          <strong>{gameState.score} / {gameState.wickets}</strong>
          <span style={{ fontSize: '1rem', marginLeft: '10px' }}>
            ({Math.floor(gameState.balls_played / 6)}.{gameState.balls_played % 6} overs)
          </span>
        </div>

        <div style={{ marginTop: '10px', color: '#555' }}>
          <strong>Batting:</strong> {gameState.batting_player} | <strong>Bowling:</strong> {gameState.bowling_player}
        </div>
      </div>

      {gameState.status === 'ongoing' && (
        <div style={{ border: '1px solid #ddd', padding: '15px', borderRadius: '8px', marginTop: '20px' }}>
          <h3>Play Your Turn</h3>
          <div>
            <label>Bowler's Choice ({gameState.bowling_player}): </label>
            <select value={bowlerChoice} onChange={(e) => setBowlerChoice(e.target.value)}>
              {letterChoices.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <div style={{ marginTop: '10px' }}>
            <label>Batsman's Choice ({gameState.batting_player}): </label>
            <select value={batsmanChoice} onChange={(e) => setBatsmanChoice(e.target.value)}>
              {letterChoices.map(l => <option key={l} value={l}>{l}</option>)}
            </select>
          </div>
          <button onClick={handlePlayBall} style={{ padding: '10px 20px', marginTop: '20px', fontSize: '1rem' }}>
            Play Ball
          </button>
        </div>
      )}

      {gameState.status === 'completed' && (
        <div style={{ marginTop: '20px', padding: '15px', backgroundColor: '#e0ffe0', borderRadius: '8px' }}>
          <h2>Match Over!</h2>
          <h4>{gameState.winner ? `${gameState.winner} wins!` : "It's a tie!"}</h4>
        </div>
      )}
    </div>
  );
}