# backend/game/consumers.py

import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

from .logic import GameLogicEngine
from .models import Player, Inning, Match # <-- Make sure Match is imported

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.match_code = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'game_{self.match_code}'

        try:
            match = Match.objects.get(match_code=self.match_code)
        except Match.DoesNotExist:
            self.close()
            return

        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        self.accept()
        
        # --- THIS IS THE NEW, SMARTER LOGIC ---
        # Check the match status to decide what message to send on connect
        if match.status == 'waiting':
            self.send(text_data=json.dumps({
                'type': 'info_message',
                'message': f"Match lobby created. Waiting for an opponent... Share code: {self.match_code}"
            }))
        
        elif match.status in ['ongoing', 'completed']:
            # If the game is ready, create an engine and send the full state
            try:
                engine = GameLogicEngine(self.match_code)
                self._broadcast_game_state(engine)
                print(f"WebSocket connected for match {self.match_code} and sent initial state.")
            except ValueError as e:
                self.send(text_data=json.dumps({'error': str(e)}))
                self.close()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)
        print(f"WebSocket disconnected for match {self.match_code}")

    def receive(self, text_data):
        # This receive method with the turn-based logic is correct.
        user = self.scope['user']
        if not user.is_authenticated:
            self.send(text_data=json.dumps({'error': 'You must be logged in to play.'}))
            return

        try:
            player = Player.objects.get(username=user.username)
        except Player.DoesNotExist:
            self.send(text_data=json.dumps({'error': 'Player profile not found for the logged in user.'}))
            return

        data = json.loads(text_data)
        action = data.get('action')
        choice = data.get('choice')

        try:
            engine = GameLogicEngine(self.match_code)
            inning = engine.inning

            if action == 'bowl' and inning.turn == player and inning.bowling_player == player:
                inning.pending_bowler_choice = choice
                inning.turn = inning.batting_player
                inning.save()
                self._broadcast_info(f"Waiting for {inning.batting_player.username} to bat...")

            elif action == 'bat' and inning.turn == player and inning.batting_player == player:
                if inning.pending_bowler_choice is None:
                    raise ValueError("Bowler has not made a choice yet.")
                
                bowler_choice = inning.pending_bowler_choice
                batsman_choice = choice
                
                # We need to get the latest engine state before processing
                engine = GameLogicEngine(self.match_code)
                new_game_state = engine.process_turn(bowler_choice, batsman_choice)

                # Reset for the next ball
                # Re-fetch the engine to get the latest inning object after the turn
                engine = GameLogicEngine(self.match_code)
                updated_inning = engine.inning
                updated_inning.pending_bowler_choice = None

                if updated_inning.match.status == 'ongoing':
                    updated_inning.turn = updated_inning.bowling_player
                else:
                    updated_inning.turn = None
                updated_inning.save()
                
                self._broadcast_game_state(engine)

            else:
                raise ValueError("Not your turn or invalid action.")

        except (ValueError, KeyError, Player.DoesNotExist) as e:
            self.send(text_data=json.dumps({'error': str(e)}))

    def _broadcast_game_state(self, engine):
        state = engine.get_game_state()
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {'type': 'game_state_update', 'payload': state}
        )

    def _broadcast_info(self, message):
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {'type': 'info_message', 'message': message}
        )

    def game_state_update(self, event):
        self.send(text_data=json.dumps(event))

    def info_message(self, event):
        self.send(text_data=json.dumps(event))