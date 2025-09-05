# backend/game/views.py
from django.utils.crypto import get_random_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, generics, permissions
from django.contrib.auth.models import User

from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
# --- THIS IS THE FIX ---
# We now import the entire logic module, not a specific class
from . import logic
# ------------------------

from .models import Player, Match, Inning
from .serializers import (
    MatchCreateSerializer, MatchDisplaySerializer, MatchJoinSerializer, 
    RegisterSerializer, UserSerializer
)

class CreateMatchView(APIView):
    """
    Creates a new match for the currently authenticated user.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        input_serializer = MatchCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data

        player = Player.objects.get(username=request.user.username)
        
        match_code = get_random_string(6).upper()
        while Match.objects.filter(match_code=match_code).exists():
            match_code = get_random_string(6).upper()

        match = Match.objects.create(
            match_code=match_code,
            match_type=validated_data.get('match_type'),
            overs=validated_data.get('overs'),
            wickets=validated_data.get('wickets'),
            player1=player
        )
        output_serializer = MatchDisplaySerializer(match)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
class JoinMatchView(APIView):
    """
    Allows the currently authenticated user to join an existing match.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        input_serializer = MatchJoinSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        match_code = input_serializer.validated_data.get('match_code')

        try:
            match = Match.objects.get(match_code=match_code)
        except Match.DoesNotExist:
            return Response({"error": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        if match.status != 'waiting':
            return Response({"error": "This match is not waiting for players."}, status=status.HTTP_400_BAD_REQUEST)

        player2 = Player.objects.get(username=request.user.username)

        if match.player1 == player2:
            return Response({"error": "You cannot join your own game."}, status=status.HTTP_400_BAD_REQUEST)

        match.player2 = player2
        match.status = 'ongoing'
        match.save()

        first_inning = Inning.objects.create(
            match=match,
            batting_player=match.player1,
            bowling_player=player2,
            innings_order=1
        )
        first_inning.turn = first_inning.bowling_player
        first_inning.save()

        # --- THIS IS THE FIX ---
        # We now call the stateless get_game_state function from our logic module
        game_state = logic.get_game_state(match)
        # ------------------------
        
        channel_layer = get_channel_layer()
        async_to_sync(channel_layer.group_send)(
            f'game_{match.match_code}',
            {'type': 'game_state_update', 'payload': game_state}
        )

        output_serializer = MatchDisplaySerializer(match)
        return Response(output_serializer.data, status=status.HTTP_200_OK)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [permissions.AllowAny]  # Allow registration without authentication

class UserDetailView(APIView):
    permission_classes = [permissions.IsAuthenticated]
    def get(self, request, *args, **kwargs):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)

