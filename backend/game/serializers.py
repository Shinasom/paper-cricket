# backend/game/serializers.py

from rest_framework import serializers
from .models import Player, Match

# Serializer for displaying basic Player data.
class PlayerSerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'username']


# Serializer for handling the CREATION of a new match.
# It defines the data we expect from the user.
class MatchCreateSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    overs = serializers.IntegerField(min_value=1, max_value=50)
    wickets = serializers.IntegerField(min_value=1, max_value=10)


# Serializer for DISPLAYING detailed Match data.
# It includes nested player information for a richer response.
class MatchSerializer(serializers.ModelSerializer):
    player1 = PlayerSerializer(read_only=True)
    player2 = PlayerSerializer(read_only=True, allow_null=True)

    class Meta:
        model = Match
        fields = [
            'id', 'match_code', 'match_type', 'status', 
            'overs', 'wickets', 'player1', 'player2', 'created_at'
        ]

# Serializer for JOINING an existing match.
class MatchJoinSerializer(serializers.Serializer):
    username = serializers.CharField(max_length=50)
    match_code = serializers.CharField(max_length=10)