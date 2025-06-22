import pandas as pd
import os

def check_data_structure():
    print('🔍 DATA STRUCTURE ANALYSIS')
    print('='*40)
    
    # Check 2024 games
    games_file = '../nfl_data/games/2024_schedule.csv'
    if os.path.exists(games_file):
        games_df = pd.read_csv(games_file)
        print(f'✅ 2024 Games: {len(games_df)} records')
        
        # Check for completed games
        regular_season = games_df[games_df['game_type'] == 'REG']
        completed = regular_season.dropna(subset=['away_score', 'home_score'])
        print(f'   Regular season: {len(regular_season)} games')
        print(f'   Completed: {len(completed)} games')
        
        # Check week distribution
        week_counts = completed['week'].value_counts().sort_index()
        print(f'   Week range: {week_counts.index.min()} to {week_counts.index.max()}')
        
        return len(completed) > 200  # Need substantial data
    
    return False

if __name__ == '__main__':
    check_data_structure()
