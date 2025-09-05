# backend/game/views.py
from django.contrib.auth import authenticate, login, logout
from django.utils.crypto import get_random_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.contrib.auth.models import User
from rest_framework import generics

# --- IMPORTS FOR DECORATORS ---
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
# -----------------------------

# --- IMPORTS for broadcasting ---
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync
from .logic import GameLogicEngine
# ------------------------------------

from .models import Player, Match, Inning
from .serializers import MatchCreateSerializer, MatchSerializer, MatchJoinSerializer, UserSerializer


@method_decorator(csrf_exempt, name='dispatch')
class CreateMatchView(APIView):
    """
    View to create a new match.
    """
    def post(self, request, *args, **kwargs):
        input_serializer = MatchCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        
        validated_data = input_serializer.validated_data
        username = validated_data.get('username')
        overs = validated_data.get('overs')
        wickets = validated_data.get('wickets')

        player, _ = Player.objects.get_or_create(username=username)
        
        match_code = get_random_string(6).upper()
        while Match.objects.filter(match_code=match_code).exists():
            match_code = get_random_string(6).upper()

        match = Match.objects.create(
            match_code=match_code,
            match_type='multi',
            overs=overs,
            wickets=wickets,
            player1=player
        )
        output_serializer = MatchSerializer(match)
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)

@method_decorator(csrf_exempt, name='dispatch')
class JoinMatchView(APIView):
    """
    View for a second player to join an existing match.
    This view now also creates the first inning and broadcasts the game start.
    """
    def post(self, request, *args, **kwargs):
        input_serializer = MatchJoinSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data
        username = validated_data.get('username')
        match_code = validated_data.get('match_code')

        try:
            match = Match.objects.get(match_code=match_code)
        except Match.DoesNotExist:
            return Response({"error": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        if match.status != 'waiting':
            return Response({"error": "This match is not waiting for players."}, status=status.HTTP_400_BAD_REQUEST)

        player2, _ = Player.objects.get_or_create(username=username)

        if match.player1 == player2:
            return Response({"error": "You cannot join your own game."}, status=status.HTTP_400_BAD_REQUEST)

        match.player2 = player2
        match.status = 'ongoing'
        match.save()

        first_inning = Inning.objects.create(
            match=match,
            batting_player=match.player1,
            bowling_player=match.player2,
            innings_order=1
        )
        first_inning.turn = first_inning.bowling_player
        first_inning.save()

        channel_layer = get_channel_layer()
        engine = GameLogicEngine(match.match_code)
        game_state = engine.get_game_state()

        async_to_sync(channel_layer.group_send)(
            f'game_{match.match_code}',
            {
                'type': 'game_state_update',
                'payload': game_state
            }
        )
        
        output_serializer = MatchSerializer(match)
        return Response(output_serializer.data, status=status.HTTP_200_OK)

@method_decorator(csrf_exempt, name='dispatch')
class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer

@method_decorator(csrf_exempt, name='dispatch')
class LoginView(APIView):
    def post(self, request, *args, **kwargs):
        username = request.data.get('username')
        password = request.data.get('password')

        if not username or not password:
            return Response({'error': 'Please provide both username and password'}, status=status.HTTP_400_BAD_REQUEST)

        user = authenticate(request=request, username=username, password=password)

        if user is not None:
            login(request, user)
            serializer = UserSerializer(user)
            return Response(serializer.data, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid Credentials'}, status=status.HTTP_401_UNAUTHORIZED)

@method_decorator(csrf_exempt, name='dispatch')
class LogoutView(APIView):
    """
    View for user logout.
    """
    def post(self, request, *args, **kwargs):
        logout(request)
        return Response(status=status.HTTP_204_NO_CONTENT)

class UserDetailView(APIView):
    def get(self, request, *args, **kwargs):
        if request.user.is_authenticated:
            serializer = UserSerializer(request.user)
            return Response(serializer.data)
        return Response({}, status=status.HTTP_401_UNAUTHORIZED)

