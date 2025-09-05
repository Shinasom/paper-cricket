# backend/game/views.py

from django.utils.crypto import get_random_string
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status

from .models import Player, Match
from .serializers import MatchCreateSerializer, MatchSerializer
from .serializers import MatchJoinSerializer

class CreateMatchView(APIView):
    """
    View to create a new match.
    """
    def post(self, request, *args, **kwargs):
        # 1. Use the "create" serializer to validate the incoming data
        input_serializer = MatchCreateSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        
        # If validation passes, validated_data will contain the clean input
        validated_data = input_serializer.validated_data
        username = validated_data.get('username')
        overs = validated_data.get('overs')
        wickets = validated_data.get('wickets')

        # 2. Get or create the player
        # This is a handy Django shortcut: it finds the player if they exist,
        # or creates a new one if they don't.
        player, _ = Player.objects.get_or_create(username=username)

        # 3. Create the match
        # We generate a random 6-character string for the match code.
        match_code = get_random_string(6).upper()
        
        match = Match.objects.create(
            match_code=match_code,
            match_type='single', # For now, we'll default to single player
            overs=overs,
            wickets=wickets,
            player1=player
        )

        # 4. Use the "display" serializer to format the response
        output_serializer = MatchSerializer(match)

        # 5. Send back the successful response
        return Response(output_serializer.data, status=status.HTTP_201_CREATED)
    
class JoinMatchView(APIView):
    """
    View for a second player to join an existing match.
    """
    def post(self, request, *args, **kwargs):
        # 1. Validate the incoming data (username, match_code)
        input_serializer = MatchJoinSerializer(data=request.data)
        input_serializer.is_valid(raise_exception=True)
        validated_data = input_serializer.validated_data
        username = validated_data.get('username')
        match_code = validated_data.get('match_code')

        # 2. Find the match and handle potential errors
        try:
            match = Match.objects.get(match_code=match_code)
        except Match.DoesNotExist:
            return Response({"error": "Match not found."}, status=status.HTTP_404_NOT_FOUND)

        # 3. Perform business logic checks
        if match.status != 'waiting':
            return Response({"error": "This match is not waiting for players."}, status=status.HTTP_400_BAD_REQUEST)

        # 4. Get or create the second player
        player2, _ = Player.objects.get_or_create(username=username)

        # Another check: a player cannot join their own game
        if match.player1 == player2:
            return Response({"error": "You cannot join your own game."}, status=status.HTTP_400_BAD_REQUEST)

        # 5. Update the match
        match.player2 = player2
        match.status = 'ongoing'
        match.save() # Commit the changes to the database

        # 6. Serialize and return the updated match data
        output_serializer = MatchSerializer(match)
        return Response(output_serializer.data, status=status.HTTP_200_OK)