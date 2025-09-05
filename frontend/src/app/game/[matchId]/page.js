// src/app/game/[matchId]/page.js

import GameClient from '@/components/GameClient';

export default function GamePage({ params }) {
  // The `params` object is automatically passed by Next.js
  // and contains the dynamic parts of the URL.
  const matchId = params.matchId;

  return (
    <GameClient matchId={matchId} />
  );
}