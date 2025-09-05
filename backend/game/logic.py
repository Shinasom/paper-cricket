# backend/game/logic.py

from .models import Match, Inning, Ball, Player

RUN_MAP = {
    'A': 1, 'B': 2, 'C': 3,
    'D': 4, 'E': 6, 'F': 4, 'G': 6
}

class GameLogicEngine:
    """
    Manages the state and rules for a single match of Paper Cricket.
    """

    def __init__(self, match_code):
        try:
            self.match = Match.objects.select_related('player1', 'player2').get(match_code=match_code)
            self.inning = self._get_or_create_inning()
        except Match.DoesNotExist:
            raise ValueError(f"Match with code {match_code} not found.")

    def _get_or_create_inning(self):
        """
        Finds the current active inning for an ongoing match.
        If the first inning is over, it creates the second one.
        """
        if self.match.status != 'ongoing':
            raise ValueError("Match is not in an ongoing state.")

        latest_inning = self.match.innings.order_by('-innings_order').first()

        if latest_inning is None:
            # This is an error state. An 'ongoing' match must have an inning created by the JoinMatchView.
            raise ValueError("No innings found for this ongoing match.")

        # If the latest inning is over and it was the first, create the second inning.
        if self._is_inning_over(latest_inning) and latest_inning.innings_order == 1:
            print(f"Creating second inning for match {self.match.match_code}")
            inning = Inning.objects.create(
                match=self.match,
                batting_player=self.match.player2,
                bowling_player=self.match.player1,
                innings_order=2
            )
            inning.turn = inning.bowling_player
            inning.save()
            return inning
        
        # Otherwise, the latest inning is the one we're currently playing.
        return latest_inning

    def _is_inning_over(self, inning):
        """Checks if an inning has concluded based on wickets or overs."""
        overs_played = inning.balls_played // 6
        return (inning.wickets >= self.match.wickets or overs_played >= self.match.overs)

    def _handle_match_end(self):
        """Determines the winner and marks the match as completed."""
        try:
            inning1_score = self.match.innings.get(innings_order=1).runs
            inning2_score = self.inning.runs
        except Inning.DoesNotExist:
            return

        winner = None
        if inning2_score > inning1_score:
            winner = self.inning.batting_player
        elif inning1_score > inning2_score:
            winner = self.inning.bowling_player
        
        self.match.winner = winner
        self.match.status = 'completed'
        self.match.save()
        print(f"Match {self.match.match_code} completed. Winner: {winner}")

    def process_turn(self, bowler_choice, batsman_choice):
        """Processes a single ball, updates state, and returns the new state."""
        if self._is_inning_over(self.inning) and self.inning.innings_order == 2:
             raise ValueError("This match has already been completed.")

        self.inning.balls_played += 1
        runs_scored = RUN_MAP.get(batsman_choice, 0)
        is_wicket = bowler_choice == batsman_choice

        if is_wicket:
            self.inning.wickets += 1
            runs_scored = 0
        else:
            self.inning.runs += runs_scored
        
        over_no = (self.inning.balls_played - 1) // 6 + 1
        ball_no = (self.inning.balls_played - 1) % 6 + 1
        Ball.objects.create(
            inning=self.inning, over_no=over_no, ball_no=ball_no,
            bowler_choice=bowler_choice, batsman_choice=batsman_choice,
            outcome='out' if is_wicket else 'runs', runs_scored=runs_scored
        )

        inning_is_over = self._is_inning_over(self.inning)
        if self.inning.innings_order == 2:
            target_reached = False
            target = self.match.target_runs
            if target and self.inning.runs >= target:
                target_reached = True
            if inning_is_over or target_reached:
                self._handle_match_end()
        
        self.inning.save()
        return self.get_game_state()

    def get_game_state(self):
        """Constructs a dictionary representing the current game state."""
        self.match.refresh_from_db()
        self.inning.refresh_from_db()
        
        last_ball = Ball.objects.filter(inning=self.inning).last()
        last_ball_data = None
        if last_ball:
            last_ball_data = {
                'bowler_choice': last_ball.bowler_choice,
                'batsman_choice': last_ball.batsman_choice,
                'runs_scored': last_ball.runs_scored,
                'is_wicket': last_ball.outcome == 'out'
            }
        
        return {
            'match_code': self.match.match_code,
            'status': self.match.status,
            'current_inning': self.inning.innings_order,
            'batting_player': self.inning.batting_player.username,
            'bowling_player': self.inning.bowling_player.username,
            'turn': self.inning.turn.username if self.inning.turn else None,
            'score': self.inning.runs,
            'wickets': self.inning.wickets,
            'balls_played': self.inning.balls_played,
            'total_overs': self.match.overs,
            'target': self.match.target_runs,
            'winner': self.match.winner.username if self.match.winner else None,
            'last_ball': last_ball_data
        }