# backend/game/consumers.py

import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

# Import our new game engine
from .logic import GameLogicEngine

class GameConsumer(WebsocketConsumer):
    def connect(self):
        self.match_code = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'game_{self.match_code}'

        # Join room group
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        self.accept()

        # On connect, send the initial game state to the client
        try:
            engine = GameLogicEngine(self.match_code)
            initial_state = engine.get_game_state()
            self.send(text_data=json.dumps({
                'type': 'game_state_update',
                'payload': initial_state
            }))
            print(f"WebSocket connected for match {self.match_code} and sent initial state.")
        except ValueError as e:
            # Handle cases where match doesn't exist or is already over
            self.send(text_data=json.dumps({'error': str(e)}))
            self.close()


    def disconnect(self, close_code):
        # Leave room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected for match {self.match_code}")


    def receive(self, text_data):
        """
        Receive a message from the client, process it with the game engine,
        and broadcast the new state.
        """
        text_data_json = json.loads(text_data)
        
        # We expect a message format like:
        # { "bowler_choice": "A", "batsman_choice": "D" }
        bowler_choice = text_data_json.get('bowler_choice')
        batsman_choice = text_data_json.get('batsman_choice')
        
        try:
            # Create an engine instance for this match
            engine = GameLogicEngine(self.match_code)
            # Process the turn using the choices from the client
            new_game_state = engine.process_turn(bowler_choice, batsman_choice)

            # Broadcast the new state to the whole group
            async_to_sync(self.channel_layer.group_send)(
                self.room_group_name,
                {
                    'type': 'game_state_update',
                    'payload': new_game_state
                }
            )
        except ValueError as e:
            # Send any errors from the game logic back to the client
            self.send(text_data=json.dumps({'error': str(e)}))


    def game_state_update(self, event):
        """
        This method is called by the group_send in receive().
        It sends the actual message to the client's WebSocket.
        """
        payload = event['payload']

        self.send(text_data=json.dumps({
            'type': 'game_state_update',
            'payload': payload
        }))