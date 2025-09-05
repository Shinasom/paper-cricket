# backend/game/serializers.py

from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Player, Match

# --- AUTHENTICATION SERIALIZERS (no change needed) ---
class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'username']
        # Note: We removed the password field logic as the RegisterView handles creation.
        # A more robust UserSerializer would handle password updates carefully.

class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('username', 'password')
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        user = User.objects.create_user(
            username=validated_data['username'],
            password=validated_data['password']
        )
        return user


# --- MATCH SERIALIZERS (UPDATED) ---

# Serializer for handling the CREATION of a new match.
# It no longer requires a username.
class MatchCreateSerializer(serializers.Serializer):
    overs = serializers.IntegerField(min_value=1, max_value=50)
    wickets = serializers.IntegerField(min_value=1, max_value=10)
    match_type = serializers.ChoiceField(choices=Match.MatchType.choices, default=Match.MatchType.MULTIPLAYER)


# Serializer for JOINING an existing match.
# It no longer requires a username.
class MatchJoinSerializer(serializers.Serializer):
    match_code = serializers.CharField(max_length=10)


# Serializer for DISPLAYING detailed Match data.
# This remains the same as it's for output.
class PlayerDisplaySerializer(serializers.ModelSerializer):
    class Meta:
        model = Player
        fields = ['id', 'username']

class MatchDisplaySerializer(serializers.ModelSerializer):
    player1 = PlayerDisplaySerializer(read_only=True)
    player2 = PlayerDisplaySerializer(read_only=True, allow_null=True)

    class Meta:
        model = Match
        fields = [
            'id', 'match_code', 'match_type', 'status', 
            'overs', 'wickets', 'player1', 'player2', 'created_at'
        ]
