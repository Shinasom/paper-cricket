# backend/game/consumers.py
import json
from channels.generic.websocket import WebsocketConsumer
from asgiref.sync import async_to_sync

class GameConsumer(WebsocketConsumer):
    # This method is called when a client first opens a connection
    def connect(self):
        # 1. Get the match ID from the URL
        self.match_id = self.scope['url_route']['kwargs']['match_id']
        self.room_group_name = f'game_{self.match_id}'

        # 2. Join the "room" (or channel layer group)
        async_to_sync(self.channel_layer.group_add)(
            self.room_group_name,
            self.channel_name
        )

        # 3. Accept the connection
        self.accept()
        print(f"WebSocket connected for match {self.match_id}")


    # This method is called when the connection is closed
    def disconnect(self, close_code):
        # Leave the room group
        async_to_sync(self.channel_layer.group_discard)(
            self.room_group_name,
            self.channel_name
        )
        print(f"WebSocket disconnected for match {self.match_id}")


    # This method is called when we receive a message from the client
    def receive(self, text_data):
        text_data_json = json.loads(text_data)
        message = text_data_json['message']

        # Broadcast the message to everyone in the same game group
        async_to_sync(self.channel_layer.group_send)(
            self.room_group_name,
            {
                'type': 'game_message', # This becomes a method call: game_message()
                'message': message
            }
        )

    # This method is called on each consumer when a 'game_message' is sent to the group
    def game_message(self, event):
        message = event['message']

        # Send the message back down to the client's WebSocket
        self.send(text_data=json.dumps({
            'message': message
        }))