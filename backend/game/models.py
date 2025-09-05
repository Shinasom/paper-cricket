# backend/game/models.py

from django.db import models

# --- Model Definitions ---

class Player(models.Model):
    """Represents a registered player in the game."""
    username = models.CharField(max_length=50, unique=True, null=False)
    total_matches = models.IntegerField(default=0)
    wins = models.IntegerField(default=0)
    losses = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.username


class Match(models.Model):
    """Represents a single game match between two players."""

    class MatchType(models.TextChoices):
        SINGLE_PLAYER = 'single', 'Single Player'
        MULTIPLAYER = 'multi', 'Multiplayer'

    class MatchStatus(models.TextChoices):
        WAITING = 'waiting', 'Waiting for Player'
        ONGOING = 'ongoing', 'Ongoing'
        COMPLETED = 'completed', 'Completed'

    match_code = models.CharField(max_length=10, unique=True)
    match_type = models.CharField(max_length=10, choices=MatchType.choices)
    status = models.CharField(max_length=20, choices=MatchStatus.choices, default=MatchStatus.WAITING)
    overs = models.IntegerField()
    wickets = models.IntegerField()

    player1 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player1')
    player2 = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='matches_as_player2', null=True, blank=True) # Can be null for AI
    winner = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='matches_won')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    @property
    def target_runs(self):
        """
        Calculates the target score for the team batting second.
        The target is the score of the first innings + 1.
        """
        # A target only exists if there is a first innings.
        first_inning = self.innings.filter(innings_order=1).first()
        if first_inning:
            return first_inning.runs + 1
        return None # No target yet if first innings isn't played.

    def __str__(self):
        return f"Match {self.match_code} ({self.status})"


class Inning(models.Model):
    """Represents one of the two innings within a match."""
    match = models.ForeignKey(Match, on_delete=models.CASCADE, related_name='innings')
    batting_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='innings_batted')
    bowling_player = models.ForeignKey(Player, on_delete=models.CASCADE, related_name='innings_bowled')
    
    runs = models.IntegerField(default=0)
    wickets = models.IntegerField(default=0)
    balls_played = models.IntegerField(default=0)
    innings_order = models.IntegerField() # 1 for first innings, 2 for second
    turn = models.ForeignKey(Player, on_delete=models.SET_NULL, null=True, blank=True, related_name='current_turns')
    pending_bowler_choice = models.CharField(max_length=1, null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Match {self.match.match_code} - Inning {self.innings_order}"


class Ball(models.Model):
    """Represents a single ball played in an inning."""

    class Outcome(models.TextChoices):
        RUNS = 'runs', 'Runs'
        OUT = 'out', 'Out'

    inning = models.ForeignKey(Inning, on_delete=models.CASCADE, related_name='balls')
    over_no = models.IntegerField()
    ball_no = models.IntegerField()
    bowler_choice = models.CharField(max_length=1)
    batsman_choice = models.CharField(max_length=1)
    outcome = models.CharField(max_length=10, choices=Outcome.choices)
    runs_scored = models.IntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Inning {self.inning.id}: Over {self.over_no}, Ball {self.ball_no} - {self.runs_scored} runs"