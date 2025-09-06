// src/app/game/[matchId]/page.js

import GameClient from '@/components/GameClient';

export default async function GamePage({ params }) {
  // Await the params object before accessing its properties
  const { matchId } = await params;

  return (
    <GameClient matchId={matchId} />
  );
}