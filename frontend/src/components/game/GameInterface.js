// src/components/game/GameInterface.js
'use client';

export default function GameInterface({ 
  gameState, 
  user, 
  playerChoice, 
  onChoiceSubmit, 
  log, 
  lastBallOutcome 
}) {
  if (!gameState) return null;

  const letterChoices = [
    { letter: 'A', runs: 1 }, { letter: 'B', runs: 2 },
    { letter: 'C', runs: 3 }, { letter: 'D', runs: 4 },
    { letter: 'E', runs: 6 }, { letter: 'F', runs: 4 },
    { letter: 'G', runs: 6 }
  ];

  const isMyTurn = user && gameState.status === 'ongoing' && gameState.turn === user.username;

  return (
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
                onClick={() => onChoiceSubmit(letter)}
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

      {/* My Choices Record - Only show user's own data */}
      <div className="bg-white/95 border-2 border-gray-400 rounded-lg p-4 shadow-sm">
        <div className="handwritten-title text-xl ink-red font-bold mb-4 border-b border-red-300 pb-2">
          📝 My Record:
        </div>
        
        <div className="space-y-6">
          
          {/* Show Bowling Record if user is the bowler */}
          {gameState.bowling_player === user.username && (
            <div>
              <div className="handwritten-title text-lg ink-red font-bold mb-3 underline">
                ⚾ MY BOWLING:
              </div>
              
              <div className="space-y-2">
                {(() => {
                  // Extract user's bowling choices from log (FIXED LOGIC)
                  const userBowlingChoices = [];
                  log.forEach((entry) => {
                    const match = entry.match(/Bowler: (\w), Batsman: (\w) → (.+)/);
                    if (match) {
                      const [, bowlerChoice, batsmanChoice, outcome] = match;
                      const isWicket = outcome.includes('OUT');
                      userBowlingChoices.push({ choice: bowlerChoice, isWicket });
                    }
                  });

                  // Group choices by over (6 balls each)
                  const ballsByOver = {};
                  userBowlingChoices.forEach((ball, index) => {
                    const overNo = Math.floor(index / 6) + 1;
                    if (!ballsByOver[overNo]) ballsByOver[overNo] = [];
                    ballsByOver[overNo].push(ball);
                  });

                  return Object.entries(ballsByOver).map(([overNo, balls]) => (
                    <div key={overNo} className="handwritten text-sm ink-black">
                      <span className="font-bold ink-blue">Over {overNo} (Me):</span>
                      <span className="ml-2">
                        {balls.map((ball, idx) => (
                          <span key={idx}>
                            {ball.isWicket ? (
                              <span className="inline-block w-6 h-6 border-2 border-red-600 rounded-full text-center leading-5 text-xs font-bold ink-red bg-red-100 mx-1">
                                {ball.choice}
                              </span>
                            ) : (
                              <span className="handwritten-title text-base ink-red font-bold">{ball.choice}</span>
                            )}
                            {idx < balls.length - 1 && <span className="ink-black">, </span>}
                          </span>
                        ))}
                        
                        {/* Current ball if in this over and it's user's turn */}
                        {Math.floor(userBowlingChoices.length / 6) + 1 === parseInt(overNo) && 
                         gameState.status === 'ongoing' && 
                         gameState.turn === user.username && (
                          <span>
                            {balls.length > 0 && <span className="ink-black">, </span>}
                            {playerChoice ? (
                              <span className="handwritten-title text-base ink-red font-bold bg-red-100 px-1 rounded">{playerChoice}</span>
                            ) : (
                              <span className="ink-gray text-sm">writing...</span>
                            )}
                          </span>
                        )}
                      </span>
                    </div>
                  ));
                })()}
                
                {/* Current over if no balls bowled yet */}
                {gameState.status === 'ongoing' && 
                 log.length === 0 && 
                 gameState.turn === user.username && (
                  <div className="handwritten text-sm ink-black">
                    <span className="font-bold ink-blue">Over 1 (Me):</span>
                    <span className="ml-2">
                      {playerChoice ? (
                        <span className="handwritten-title text-base ink-red font-bold bg-red-100 px-1 rounded">{playerChoice}</span>
                      ) : (
                        <span className="ink-gray text-sm">writing...</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Show Batting Record if user is the batsman */}
          {gameState.batting_player === user.username && (
            <div>
              <div className="handwritten-title text-lg ink-blue font-bold mb-3 underline">
                🏏 MY BATTING:
              </div>
              
              <div className="space-y-2">
                {(() => {
                  // Convert user's batting choices to run values (FIXED LOGIC)
                  const runMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 6, 'F': 4, 'G': 6 };
                  const myBattingData = [];
                  let isOut = false;
                  
                  log.forEach((entry) => {
                    const match = entry.match(/Bowler: (\w), Batsman: (\w) → (.+)/);
                    if (match) {
                      const [, bowlerChoice, batsmanChoice, outcome] = match;
                      const isWicket = outcome.includes('OUT');
                      
                      if (isWicket) {
                        isOut = true;
                      } else {
                        const runs = runMap[batsmanChoice] || 0;
                        myBattingData.push(runs);
                      }
                    }
                  });
                  
                  return (
                    <div className="handwritten text-sm ink-black">
                      <span className="font-bold ink-green">{user.username}:</span>
                      <span className="ml-2">
                        {myBattingData.map((run, runIdx) => (
                          <span key={runIdx}>
                            <span className="handwritten-title text-base ink-green font-bold">{run}</span>
                            {runIdx < myBattingData.length - 1 && <span className="ink-black">, </span>}
                          </span>
                        ))}
                        
                        {/* Current ball for batting */}
                        {gameState.status === 'ongoing' && 
                         !isOut && 
                         gameState.turn === user.username && (
                          <span>
                            {myBattingData.length > 0 && <span className="ink-black">, </span>}
                            {playerChoice ? (
                              <span className="handwritten-title text-base ink-green font-bold bg-green-100 px-1 rounded">
                                {runMap[playerChoice] || 0}
                              </span>
                            ) : (
                              <span className="ink-gray text-sm">writing...</span>
                            )}
                          </span>
                        )}
                        
                        {isOut && (
                          <span className="ink-red font-bold ml-2">(OUT)</span>
                        )}
                      </span>
                      
                      {/* Show total runs */}
                      {myBattingData.length > 0 && (
                        <div className="text-xs ink-green mt-1">
                          Total: {myBattingData.reduce((sum, run) => sum + run, 0)} runs
                        </div>
                      )}
                    </div>
                  );
                })()}
                
                {/* Show if no batting data yet */}
                {log.length === 0 && 
                 gameState.status === 'ongoing' && 
                 gameState.turn === user.username && (
                  <div className="handwritten text-sm ink-black">
                    <span className="font-bold ink-green">{user.username}:</span>
                    <span className="ml-2">
                      {playerChoice ? (
                        (() => {
                          const runMap = { 'A': 1, 'B': 2, 'C': 3, 'D': 4, 'E': 6, 'F': 4, 'G': 6 };
                          return <span className="handwritten-title text-base ink-green font-bold bg-green-100 px-1 rounded">{runMap[playerChoice] || 0}</span>;
                        })()
                      ) : (
                        <span className="ink-gray text-sm">writing...</span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Show message if user is not currently playing */}
          {gameState.bowling_player !== user.username && gameState.batting_player !== user.username && (
            <div className="text-center handwritten ink-gray py-8">
              <div className="text-lg mb-2">📝</div>
              <div>Your choices will appear here when it's your turn</div>
            </div>
          )}
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