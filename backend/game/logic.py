RUN_MAP = {
    'A': 1, 'B': 2, 'C': 3,
    'D': 4, 'E': 6, 'F': 4, 'G': 6
}

# --- STATE CHECKING FUNCTIONS ---

def is_inning_over(inning):
    from .models import Match  # Lazy import
    match = inning.match
    overs_played = inning.balls_played // 6
    is_over = (inning.wickets >= match.wickets or overs_played >= match.overs)
    if is_over:
        print(f"[Logic] Inning {inning.innings_order} is over. Wickets: {inning.wickets}/{match.wickets}, Overs: {overs_played}/{match.overs}")
    return is_over

def is_match_over(match, current_inning):
    from .models import Inning  # Lazy import
    if current_inning.innings_order == 1:
        return False
    
    target = match.target_runs
    if target and current_inning.runs >= target:
        print("[Logic] Match is over: Target reached.")
        return True
        
    if is_inning_over(current_inning):
        print("[Logic] Match is over: Second innings complete.")
        return True
        
    return False

# --- STATE MODIFICATION FUNCTIONS ---

def process_ball(inning, bowler_choice, batsman_choice):
    from .models import Ball  # Lazy import
    print(f"\n[Logic] Processing Ball for Inning {inning.innings_order}:")
    print(f"  - Bowler ({inning.bowling_player.username}) chose: {bowler_choice}")
    print(f"  - Batsman ({inning.batting_player.username}) chose: {batsman_choice}")

    inning.balls_played += 1
    is_wicket = bowler_choice == batsman_choice
    runs_scored = 0
    
    if is_wicket:
        inning.wickets += 1
        print("  - Outcome: WICKET!")
    else:
        runs_scored = RUN_MAP.get(batsman_choice, 0)
        inning.runs += runs_scored
        print(f"  - Outcome: {runs_scored} RUNS!")
        
    Ball.objects.create(
        inning=inning,
        over_no=(inning.balls_played - 1) // 6 + 1,
        ball_no=(inning.balls_played - 1) % 6 + 1,
        bowler_choice=bowler_choice,
        batsman_choice=batsman_choice,
        outcome='out' if is_wicket else 'runs',
        runs_scored=runs_scored
    )
    inning.save()

def conclude_match(match, second_inning):
    from .models import Inning  # Lazy import
    print("[Logic] Concluding match...")
    try:
        inning1_score = match.innings.get(innings_order=1).runs
        inning2_score = second_inning.runs
    except Inning.DoesNotExist:
        return

    winner = None
    if inning2_score > inning1_score:
        winner = second_inning.batting_player
    elif inning1_score > inning2_score:
        winner = second_inning.bowling_player
    
    match.winner = winner
    match.status = 'completed'
    match.save()
    second_inning.turn = None
    second_inning.save()
    print(f"[Logic] Match {match.match_code} completed. Winner: {winner}")

# --- STATE RETRIEVAL FUNCTION ---

def get_game_state(match):
    from .models import Ball  # Lazy import
    match.refresh_from_db()
    inning = match.innings.order_by('-innings_order').first()
    if not inning:
        return {'status': match.status, 'message': 'Waiting for game to start.'}
    
    inning.refresh_from_db()
    
    last_ball = Ball.objects.filter(inning=inning).last()
    last_ball_data = None
    if last_ball:
        last_ball_data = {
            'bowler_choice': last_ball.bowler_choice, 'batsman_choice': last_ball.batsman_choice,
            'runs_scored': last_ball.runs_scored, 'is_wicket': last_ball.outcome == 'out'
        }
    
    return {
        'match_code': match.match_code, 'status': match.status,
        'current_inning': inning.innings_order, 'batting_player': inning.batting_player.username,
        'bowling_player': inning.bowling_player.username, 'turn': inning.turn.username if inning.turn else None,
        'score': inning.runs, 'wickets': inning.wickets,
        'balls_played': inning.balls_played, 'total_overs': match.overs,
        'target': match.target_runs, 'winner': match.winner.username if match.winner else None,
        'last_ball': last_ball_data
    }
