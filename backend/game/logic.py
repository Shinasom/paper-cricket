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
        """Finds the current active inning, creates the next one, or raises an error if the game is over."""
        latest_inning = self.match.innings.order_by('-innings_order').first()

        # Case 1: No innings exist yet. Create the first one.
        if latest_inning is None:
            # SIMPLIFICATION: We assume player1 bats first. A full implementation would use toss data.
            print(f"Creating first inning for match {self.match.match_code}")
            return Inning.objects.create(
                match=self.match,
                batting_player=self.match.player1,
                bowling_player=self.match.player2,
                innings_order=1
            )

        # Case 2: An inning exists. Check if it's over.
        is_over = self._is_inning_over(latest_inning)
        if not is_over:
            # The latest inning is still in progress.
            return latest_inning
        
        # Case 3: The latest inning is over. Decide what's next.
        if latest_inning.innings_order == 1:
            # First innings just finished. Create the second one.
            print(f"Creating second inning for match {self.match.match_code}")
            return Inning.objects.create(
                match=self.match,
                batting_player=self.match.player2, # Players swap roles
                bowling_player=self.match.player1,
                innings_order=2
            )
        else: # The second innings is over.
            # The game is complete. No more innings can be played.
            raise ValueError("This match has already been completed.")


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
            # Should not happen in a normal game flow
            return

        winner = None
        if inning2_score > inning1_score:
            winner = self.inning.batting_player # Chasing team won
        elif inning1_score > inning2_score:
            winner = self.inning.bowling_player # First team won
        
        self.match.winner = winner
        self.match.status = 'completed'
        self.match.save()
        print(f"Match {self.match.match_code} completed. Winner: {winner}")

    # In backend/game/logic.py

    def process_turn(self, bowler_choice, batsman_choice):
        """Processes a single ball, updates state, and returns the new state."""
        if self.match.status != 'ongoing':
            raise ValueError("This match is not ongoing.")

        # --- Core Game Logic (This part is correct) ---
        self.inning.balls_played += 1
        runs_scored = RUN_MAP.get(batsman_choice, 0)
        is_wicket = bowler_choice == batsman_choice

        if is_wicket:
            self.inning.wickets += 1
            runs_scored = 0
        else:
            self.inning.runs += runs_scored
        
        # --- Database Logging (This part is correct) ---
        over_no = (self.inning.balls_played - 1) // 6 + 1
        ball_no = (self.inning.balls_played - 1) % 6 + 1
        Ball.objects.create(
            inning=self.inning, over_no=over_no, ball_no=ball_no,
            bowler_choice=bowler_choice, batsman_choice=batsman_choice,
            outcome='out' if is_wicket else 'runs', runs_scored=runs_scored
        )

        # --- FIX IS HERE: Corrected End of Game Check ---
        inning_is_over = self._is_inning_over(self.inning)

        if self.inning.innings_order == 1 and inning_is_over:
            # The first innings is now over.
            # The logic in _get_or_create_inning() will handle creating the next inning
            # when the next move comes in. We don't need to do anything else here.
            print(f"End of Inning 1 for match {self.match.match_code}. Score: {self.inning.runs}")
        
        elif self.inning.innings_order == 2:
            # We are in the second innings, so we must check for a winner.
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
        # Refresh objects from DB to ensure they are the latest
        self.match.refresh_from_db()
        self.inning.refresh_from_db()
        last_ball = Ball.objects.filter(inning=self.inning).last()
        last_ball_data = None # Default to None

        # Only if a last_ball actually exists, create the data dictionary
        if last_ball:
            last_ball_data = {
                'bowler_choice': last_ball.bowler_choice,
                'batsman_choice': last_ball.batsman_choice,
                'runs_scored': last_ball.runs_scored,
                'is_wicket': last_ball.outcome == 'out'
            }
        # --- END OF FIX ---

        return {
            'match_code': self.match.match_code,
            'status': self.match.status,
            'current_inning': self.inning.innings_order,
            'batting_player': self.inning.batting_player.username,
            'bowling_player': self.inning.bowling_player.username,
            'score': self.inning.runs,
            'wickets': self.inning.wickets,
            'balls_played': self.inning.balls_played,
            'total_overs': self.match.overs,
            'target': self.match.target_runs,
            'winner': self.match.winner.username if self.match.winner else None,
            'last_ball': last_ball_data # Use the safe variable
        }
