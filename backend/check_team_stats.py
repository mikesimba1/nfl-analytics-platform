import json

with open('data/real-current/team-stats.json', 'r') as f:
    team_list = json.load(f)
    
sample_team = team_list[0]
print('Team:', sample_team['abbreviation'])
print('Stats keys:', list(sample_team['stats'].keys()))

if 'team' in sample_team['stats']:
    team_stats = sample_team['stats']['team']
    print('Team stats keys:', list(team_stats.keys())[:10])
    
    # Check for common NFL stats
    stat_keys = ['pointsPerGame', 'totalYardsPerGame', 'yardsAllowedPerGame', 'turnoverDifferential']
    for key in stat_keys:
        if key in team_stats:
            print(f'{key}: {team_stats[key]}')
        else:
            print(f'{key}: NOT FOUND') 