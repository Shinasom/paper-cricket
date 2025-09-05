# backend/game/consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync
from django.db import transaction

from . import logic # Import our new stateless logic module
from .models import Player, Match, Inning

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.match_code = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'game_{self.match_code}'
        
        try:
            # Load the match object into the consumer instance
            self.match = Match.objects.get(match_code=self.match_code)
        except Match.DoesNotExist:
            self.close()
            return
            
        async_to_sync(self.channel_layer.group_add)(self.room_group_name, self.channel_name)
        self.accept()
        print(f"[Consumer] WebSocket connected for match '{self.match_code}'")

        if self.match.status == 'waiting':
            self._send_info_message(f"Match lobby created. Waiting for an opponent... Share code: {self.match_code}")
        else:
            self._broadcast_game_state()

    def disconnect(self, close_code):
        async_to_sync(self.channel_layer.group_discard)(self.room_group_name, self.channel_name)

    @transaction.atomic
    def receive(self, text_data):
        user = self.scope['user']
        if not user.is_authenticated: return

        try:
            player = Player.objects.get(username=user.username)
        except Player.DoesNotExist: return

        data = json.loads(text_data)
        action = data.get('action')
        choice = data.get('choice')

        try:
            # Get the current, up-to-date inning from the database
            inning = self.match.innings.order_by('-innings_order').first()
            if not inning or not inning.turn: return

            is_bowler_turn = (action == 'bowl' and inning.turn.id == player.id)
            is_batsman_turn = (action == 'bat' and inning.turn.id == player.id)

            if is_bowler_turn:
                inning.pending_bowler_choice = choice
                inning.turn = inning.batting_player
                inning.save()
                self._broadcast_game_state()

            elif is_batsman_turn:
                bowler_choice = inning.pending_bowler_choice
                if bowler_choice is None: raise ValueError("Bowler has not made a choice yet.")
                
                # --- THIS IS THE FIX ---
                batsman_choice = choice # Assign the value from the message
                # -----------------------

                # Use the logic module to process the ball
                logic.process_ball(inning, bowler_choice, batsman_choice)
                
                # Check if the first inning is now over
                if inning.innings_order == 1 and logic.is_inning_over(inning):
                    # Create the second inning
                    new_inning = Inning.objects.create(
                        match=self.match, batting_player=self.match.player2,
                        bowling_player=self.match.player1, innings_order=2
                    )
                    new_inning.turn = new_inning.bowling_player
                    new_inning.save()
                
                # Check if the match is now over
                current_inning = self.match.innings.order_by('-innings_order').first()
                if logic.is_match_over(self.match, current_inning):
                    logic.conclude_match(self.match, current_inning)
                
                # Reset for next ball (if match is not over)
                if self.match.status == 'ongoing':
                    # Refetch the current inning in case it changed
                    current_inning = self.match.innings.order_by('-innings_order').first()
                    current_inning.pending_bowler_choice = None
                    current_inning.turn = current_inning.bowling_player
                    current_inning.save()

                self._broadcast_game_state()
            else:
                raise ValueError("Not your turn.")
        except Exception as e:
            self._send_error_message(str(e))

    # --- HELPER METHODS ---
    def _broadcast_game_state(self):
        """Fetches the latest state from logic and broadcasts it."""
        state = logic.get_game_state(self.match)
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name, {'type': 'game_state_update', 'payload': state}
        )

    def _send_info_message(self, message):
        self.send(text_data=json.dumps({'type': 'info_message', 'message': message}))
        
    def _send_error_message(self, message):
        self.send(text_data=json.dumps({'error': message}))

    # --- CHANNEL LAYER HANDLERS ---
    def game_state_update(self, event):
        self.send(text_data=json.dumps(event))

