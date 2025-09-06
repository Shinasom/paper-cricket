// src/components/game/Scoreboard.js
'use client';

export default function Scoreboard({ gameState, user }) {
  if (!gameState) return null;

  const runsNeeded = gameState.target ? Math.max(0, gameState.target - gameState.score) : null;
  const totalBalls = gameState.total_overs * 6;
  const ballsRemaining = totalBalls - gameState.balls_played;
  const currentOver = Math.floor(gameState.balls_played / 6);
  const ballInOver = gameState.balls_played % 6;

  return (
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

      {/* Target - Notebook Style Chase Calculation */}
      {gameState.current_inning === 2 && gameState.target && gameState.status === 'ongoing' && (
        <div className="border-2 border-dashed border-green-600 bg-green-50 relative overflow-visible">
          
          {/* Main target box content */}
          <div className="p-4 pr-20">
            <div className="handwritten-title text-xl ink-green font-bold text-center mb-3">
              TARGET: {gameState.target}
            </div>
            
            {/* Main need calculation */}
            <div className="handwritten text-center ink-black text-lg">
              Need <span className="ink-green font-bold text-2xl">{runsNeeded}</span> runs
              <br />
              in <span className="ink-green font-bold text-2xl">{ballsRemaining}</span> balls
            </div>
            
            {/* Contextual message at bottom */}
            <div className="mt-3 text-center">
              {runsNeeded > ballsRemaining && ballsRemaining > 0 && (
                <div className="handwritten text-sm ink-red font-bold">
                  Need {(runsNeeded / ballsRemaining).toFixed(1)} per ball! 😰
                </div>
              )}
              
              {runsNeeded <= ballsRemaining && ballsRemaining > 0 && runsNeeded > 0 && (
                <div className="handwritten text-sm ink-blue">
                  Just singles needed! 😌
                </div>
              )}
            </div>
          </div>
          
          {/* Right margin calculations - rough notebook scribbles */}
          <div className="absolute right-2 top-4 bottom-4 w-16 flex flex-col justify-start space-y-4">
            
            {/* Simple subtraction - exactly like notebook */}
            <div className="handwritten text-sm ink-black transform rotate-1">
              <div className="text-right space-y-1">
                <div>{gameState.target}</div>
                <div className="border-b border-black pb-1">
                  -{gameState.score}
                </div>
                <div>{runsNeeded}</div>
              </div>
            </div>
            
            {/* Run rate rough calculation */}
            <div className="handwritten text-xs ink-black transform -rotate-2">
              <div className="text-right">
                <div>{runsNeeded}÷{Math.ceil(ballsRemaining/6)}</div>
                <div>=</div>
                <div>{ballsRemaining > 0 ? Math.ceil(runsNeeded / (ballsRemaining / 6)) : '∞'}</div>
              </div>
            </div>
            
          </div>
        </div>
      )}
    </div>
  );
}