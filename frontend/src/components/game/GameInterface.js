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