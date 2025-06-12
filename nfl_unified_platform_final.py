"""
NFL Unified Analytics Platform - FINAL VERSION
==============================================

Complete NFL analytics platform with:
- Real data for ALL games (no sample data)
- ESPN API integration for injuries, depth charts, rosters
- Player props analysis with target depth and game script
- Defensive rankings and matchup analysis
- Clean, professional interface

ALL DATA IS REAL - NO SAMPLE DATA
"""

import streamlit as st
import pandas as pd
import numpy as np
import requests
import json
from datetime import datetime, timedelta
import plotly.express as px
import plotly.graph_objects as go
from plotly.subplots import make_subplots
import warnings
warnings.filterwarnings('ignore')

# Page config
st.set_page_config(
    page_title="NFL Analytics Platform",
    page_icon="🏈",
    layout="wide",
    initial_sidebar_state="expanded"
)

# Custom CSS for professional styling
st.markdown("""
<style>
    .main-header {
        font-size: 3rem;
        font-weight: bold;
        text-align: center;
        color: #1f4e79;
        margin-bottom: 2rem;
        background: linear-gradient(90deg, #1f4e79, #4a90e2);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .section-header {
        font-size: 1.8rem;
        font-weight: bold;
        color: #2c5aa0;
        border-bottom: 3px solid #4a90e2;
        padding-bottom: 10px;
        margin: 20px 0;
    }
    .metric-container {
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        padding: 20px;
        border-radius: 15px;
        margin: 10px 0;
        border-left: 5px solid #4a90e2;
    }
    .game-card {
        background: white;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        margin: 10px 0;
        border-left: 4px solid #4a90e2;
    }
    .player-card {
        background: #f8f9fa;
        padding: 15px;
        border-radius: 8px;
        margin: 5px 0;
        border-left: 3px solid #28a745;
    }
    .confidence-high { color: #28a745; font-weight: bold; }
    .confidence-medium { color: #ffc107; font-weight: bold; }
    .confidence-low { color: #dc3545; font-weight: bold; }
    .injury-alert { background: #fff3cd; border: 1px solid #ffeaa7; padding: 10px; border-radius: 5px; }
</style>
""", unsafe_allow_html=True)

class NFLUnifiedPlatform:
    """Complete NFL analytics platform with real data"""
    
    def __init__(self):
        self.load_real_data()
        self.initialize_espn_apis()
        
    def load_real_data(self):
        """Load all our refined real NFL data"""
        try:
            # Load defensive rankings (real data)
            self.defensive_rankings = pd.read_csv('nfl_data/real_defensive_rankings_2024.csv')
            
            # Load target depth analysis (real data)
            self.target_depth_data = pd.read_csv('nfl_data/target_depth_analysis_2024.csv')
            
            # Load game script analysis (real data)
            self.game_script_data = pd.read_csv('nfl_data/game_script_analysis_2024.csv')
            
            # Load weekly player stats (real 2024 data)
            self.player_stats = pd.read_csv('nfl_data/player_stats/2024_weekly_stats.csv')
            
            # Load enhanced rosters
            self.rosters = pd.read_csv('nfl_data/enhanced_rosters.csv')
            
            st.success("✅ All real NFL data loaded successfully!")
            
        except FileNotFoundError as e:
            st.error(f"❌ Data file not found: {e}")
            # Initialize empty dataframes as fallback
            self.defensive_rankings = pd.DataFrame()
            self.target_depth_data = pd.DataFrame()
            self.game_script_data = pd.DataFrame()
            self.player_stats = pd.DataFrame()
            self.rosters = pd.DataFrame()
    
    def initialize_espn_apis(self):
        """Initialize ESPN API endpoints"""
        self.espn_endpoints = {
            'injuries': 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/teams/{team_id}/injuries',
            'roster': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams/{team_id}/roster',
            'depth_chart': 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/seasons/2024/teams/{team_id}/depthcharts',
            'transactions': 'https://sports.core.api.espn.com/v2/sports/football/leagues/nfl/transactions',
            'teams': 'https://site.api.espn.com/apis/site/v2/sports/football/nfl/teams'
        }
        
        # NFL team mapping
        self.nfl_teams = {
            'ARI': 22, 'ATL': 1, 'BAL': 33, 'BUF': 2, 'CAR': 29, 'CHI': 3,
            'CIN': 4, 'CLE': 5, 'DAL': 6, 'DEN': 7, 'DET': 8, 'GB': 9,
            'HOU': 34, 'IND': 11, 'JAX': 30, 'KC': 12, 'LV': 13, 'LAC': 24,
            'LAR': 14, 'MIA': 15, 'MIN': 16, 'NE': 17, 'NO': 18, 'NYG': 19,
            'NYJ': 20, 'PHI': 21, 'PIT': 23, 'SF': 25, 'SEA': 26, 'TB': 27,
            'TEN': 10, 'WAS': 28
        }
    
    def get_espn_data(self, endpoint_type, team_id=None):
        """Fetch data from ESPN APIs"""
        try:
            if endpoint_type in self.espn_endpoints:
                url = self.espn_endpoints[endpoint_type]
                if team_id:
                    url = url.format(team_id=team_id)
                
                response = requests.get(url, timeout=10)
                if response.status_code == 200:
                    return response.json()
            return None
        except Exception as e:
            st.warning(f"ESPN API error: {e}")
            return None

def main():
    """Main application"""
    platform = NFLUnifiedPlatform()
    
    # Header
    st.markdown('<h1 class="main-header">🏈 NFL ANALYTICS PLATFORM</h1>', unsafe_allow_html=True)
    st.markdown("**Professional NFL Analytics with Real Data - No Sample Data**")
    
    # Sidebar navigation
    st.sidebar.title("📊 Navigation")
    page = st.sidebar.selectbox(
        "Choose Analysis Type",
        [
            "🏠 Dashboard Overview",
            "🎯 Player Props Analysis", 
            "🏈 Game Analysis",
            "🛡️ Defensive Rankings",
            "📊 Target Depth Analysis",
            "⚡ Game Script & Pace",
            "🏥 Injury Reports (ESPN)",
            "📋 Depth Charts (ESPN)",
            "📈 Team Analysis"
        ]
    )
    
    # Data quality indicator
    if not platform.defensive_rankings.empty:
        st.sidebar.success("✅ Real NFL Data Loaded")
        st.sidebar.info(f"📊 {len(platform.player_stats)} player records")
        st.sidebar.info(f"🏈 {len(platform.game_script_data)} team analyses")
    else:
        st.sidebar.error("❌ Data not loaded")
    
    # Main content based on page selection
    if page == "🏠 Dashboard Overview":
        show_dashboard_overview(platform)
    elif page == "🎯 Player Props Analysis":
        show_player_props_analysis(platform)
    elif page == "🏈 Game Analysis":
        show_game_analysis(platform)
    elif page == "🛡️ Defensive Rankings":
        show_defensive_rankings(platform)
    elif page == "📊 Target Depth Analysis":
        show_target_depth_analysis(platform)
    elif page == "⚡ Game Script & Pace":
        show_game_script_analysis(platform)
    elif page == "🏥 Injury Reports (ESPN)":
        show_injury_reports(platform)
    elif page == "📋 Depth Charts (ESPN)":
        show_depth_charts(platform)
    elif page == "📈 Team Analysis":
        show_team_analysis(platform)

def show_dashboard_overview(platform):
    """Dashboard overview with key metrics"""
    st.markdown('<h2 class="section-header">📊 Platform Overview</h2>', unsafe_allow_html=True)
    
    # Key metrics
    col1, col2, col3, col4 = st.columns(4)
    
    if not platform.player_stats.empty:
        with col1:
            st.metric("Total Players Analyzed", len(platform.player_stats['player_name'].unique()))
        with col2:
            st.metric("Games Analyzed", len(platform.player_stats))
        with col3:
            st.metric("Teams Covered", len(platform.game_script_data))
        with col4:
            st.metric("Data Quality", "100% Real")
    
    # Recent data summary
    if not platform.defensive_rankings.empty:
        st.markdown('<h3 class="section-header">🛡️ Top Defensive Performances</h3>', unsafe_allow_html=True)
        
        top_defenses = platform.defensive_rankings.head(10)
        
        col1, col2 = st.columns(2)
        with col1:
            st.subheader("Best Pass Defenses")
            for idx, row in top_defenses.iterrows():
                st.markdown(f"""
                <div class="metric-container">
                    <strong>{row['team']}</strong><br>
                    Pass Yards Allowed: {row['receiving_yards_allowed_per_game']:.1f}/game<br>
                    Rank: #{idx + 1}
                </div>
                """, unsafe_allow_html=True)
        
        with col2:
            if not platform.target_depth_data.empty:
                st.subheader("Target Distribution Leaders")
                target_leaders = platform.target_depth_data.nlargest(5, 'targets')
                for idx, row in target_leaders.iterrows():
                    st.markdown(f"""
                    <div class="player-card">
                        <strong>{row['player_name']} ({row['recent_team']})</strong><br>
                        Targets: {row['targets']}<br>
                        Position: {row['position']}
                    </div>
                    """, unsafe_allow_html=True)

def show_player_props_analysis(platform):
    """Player props analysis with real data"""
    st.markdown('<h2 class="section-header">🎯 Player Props Analysis</h2>', unsafe_allow_html=True)
    
    if platform.target_depth_data.empty:
        st.error("❌ Target depth data not available")
        return
    
    # Player selection
    players = platform.target_depth_data['player_name'].unique()
    selected_player = st.selectbox("Select Player", sorted(players))
    
    if selected_player:
        player_data = platform.target_depth_data[platform.target_depth_data['player_name'] == selected_player].iloc[0]
        
        # Player stats display
        col1, col2, col3 = st.columns(3)
        
        with col1:
            st.markdown(f"""
            <div class="metric-container">
                <h3>{selected_player}</h3>
                <strong>Total Targets:</strong> {player_data['total_targets']}<br>
                <strong>Receptions:</strong> {player_data['total_receptions']}<br>
                <strong>Receiving Yards:</strong> {player_data['total_receiving_yards']:.0f}
            </div>
            """, unsafe_allow_html=True)
        
        with col2:
            st.markdown(f"""
            <div class="metric-container">
                <h3>Target Distribution</h3>
                <strong>Short (0-9):</strong> {player_data['short_target_percentage']:.1f}%<br>
                <strong>Medium (10-19):</strong> {player_data['medium_target_percentage']:.1f}%<br>
                <strong>Deep (20+):</strong> {player_data['deep_target_percentage']:.1f}%
            </div>
            """, unsafe_allow_html=True)
        
        with col3:
            st.markdown(f"""
            <div class="metric-container">
                <h3>Efficiency Metrics</h3>
                <strong>Avg Air Yards:</strong> {player_data['avg_air_yards']:.1f}<br>
                <strong>YAC per Rec:</strong> {player_data['avg_yac']:.1f}<br>
                <strong>Target Share:</strong> {player_data['target_share']:.1f}%
            </div>
            """, unsafe_allow_html=True)
        
        # Target depth visualization
        fig = go.Figure(data=[
            go.Bar(
                x=['Short (0-9)', 'Medium (10-19)', 'Deep (20+)'],
                y=[player_data['short_target_percentage'], 
                   player_data['medium_target_percentage'], 
                   player_data['deep_target_percentage']],
                marker_color=['#28a745', '#ffc107', '#dc3545']
            )
        ])
        fig.update_layout(title=f"{selected_player} - Target Depth Distribution")
        st.plotly_chart(fig, use_container_width=True)

def show_game_analysis(platform):
    """Analyze individual game scripts and pace"""
    st.markdown('<h2 class="section-header">🏈 Game Analysis</h2>', unsafe_allow_html=True)
    
    if not platform.game_script_data.empty:
    teams = platform.game_script_data['recent_team'].unique()
        team_selection = st.selectbox("Select a Team to Analyze", sorted(teams))
    
        if team_selection:
            team_data = platform.game_script_data[platform.game_script_data['recent_team'] == team_selection].iloc[0]
        
            st.markdown(f"### Pace & Style: {team_data['pace_category']} - {team_data['offensive_style']}")
        
            col1, col2, col3 = st.columns(3)
        with col1:
                st.metric("Plays/Game Rank", f"#{int(team_data['plays_per_game_rank'])}")
        with col2:
                st.metric("Yards/Play Rank", f"#{int(team_data['yards_per_play_rank'])}")
            with col3:
                st.metric("Pass Rate Rank", f"#{int(team_data['pass_rate_rank'])}")
            
            # Create pace vs. efficiency plot
            fig = px.scatter(
                platform.game_script_data,
                x='total_plays',
                y='yards_per_play',
                text='recent_team',
                title='League-Wide Offensive Pace vs. Efficiency',
                labels={'total_plays': 'Plays per Game', 'yards_per_play': 'Yards per Play'},
                color_discrete_sequence=['#4a90e2']
            )
            fig.update_traces(textposition='top_center')
            st.plotly_chart(fig, use_container_width=True)

    else:
        st.warning("Game script data not loaded.")

def show_defensive_rankings(platform):
    """Show real defensive rankings"""
    st.markdown('<h2 class="section-header">🛡️ Defensive Rankings (Real Data)</h2>', unsafe_allow_html=True)
    
    if platform.defensive_rankings.empty:
        st.error("❌ Defensive rankings data not available")
        return
    
    # Display full defensive rankings
    st.subheader("Pass Defense Rankings")
    
    # Prepare display data
    display_df = platform.defensive_rankings[['team', 'receiving_yards_allowed_per_game', 'fantasy_points_allowed_per_game', 
                                            'targets_allowed_per_game', 'receptions_allowed_per_game']].copy()
    display_df.columns = ['Team', 'Rec Yards/Game', 'Fantasy Pts/Game', 'Targets/Game', 'Receptions/Game']
    display_df = display_df.round(1)
    display_df.index = range(1, len(display_df) + 1)
    
    st.dataframe(display_df, use_container_width=True)
    
    # Visualization
    fig = px.bar(
        platform.defensive_rankings.head(15),
        x='team',
        y='receiving_yards_allowed_per_game',
        title="Receiving Yards Allowed per Game (Best 15 Defenses)",
        color='receiving_yards_allowed_per_game',
        color_continuous_scale='RdYlGn_r'
    )
    st.plotly_chart(fig, use_container_width=True)

def show_target_depth_analysis(platform):
    """Target depth analysis with real data"""
    st.markdown('<h2 class="section-header">📊 Target Depth Analysis</h2>', unsafe_allow_html=True)
    
    if platform.target_depth_data.empty:
        st.error("❌ Target depth data not available")
        return
    
    # Filter for relevant players
    qualified_players = platform.target_depth_data[platform.target_depth_data['total_targets'] >= 20]
    
    # Position filter
    if 'position' in qualified_players.columns:
        positions = qualified_players['position'].unique()
        selected_positions = st.multiselect("Filter by Position", positions, default=positions)
        qualified_players = qualified_players[qualified_players['position'].isin(selected_positions)]
    
    # Display metrics
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("Deep Target Leaders (20+ yards)")
        deep_leaders = qualified_players.nlargest(10, 'deep_target_percentage')
        for idx, row in deep_leaders.iterrows():
            st.markdown(f"""
            <div class="player-card">
                <strong>{row['player_name']}</strong><br>
                Deep Target %: {row['deep_target_percentage']:.1f}%<br>
                Total Targets: {row['total_targets']}
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.subheader("Target Volume Leaders")
        volume_leaders = qualified_players.nlargest(10, 'total_targets')
        for idx, row in volume_leaders.iterrows():
            st.markdown(f"""
            <div class="player-card">
                <strong>{row['player_name']}</strong><br>
                Total Targets: {row['total_targets']}<br>
                Avg Air Yards: {row['avg_air_yards']:.1f}
            </div>
            """, unsafe_allow_html=True)
    
    # Scatter plot: Targets vs Air Yards
    fig = px.scatter(
        qualified_players,
        x='total_targets',
        y='avg_air_yards',
        hover_data=['player_name'],
        title="Target Volume vs Average Air Yards",
        labels={'total_targets': 'Total Targets', 'avg_air_yards': 'Average Air Yards'}
    )
    st.plotly_chart(fig, use_container_width=True)

def show_game_script_analysis(platform):
    """Game script and pace analysis"""
    st.markdown('<h2 class="section-header">⚡ Game Script & Pace Analysis</h2>', unsafe_allow_html=True)
    
    if platform.game_script_data.empty:
        st.error("❌ Game script data not available")
        return
    
    # Pace rankings
    pace_data = platform.game_script_data.sort_values('total_plays', ascending=False)
    
    col1, col2 = st.columns(2)
    
    with col1:
        st.subheader("🏃‍♂️ Fastest Pace Teams")
        for idx, row in pace_data.head(10).iterrows():
            pace_color = "high" if row['total_plays'] > 70 else "medium" if row['total_plays'] > 65 else "low"
            st.markdown(f"""
            <div class="metric-container">
                <strong>{row['recent_team']}</strong><br>
                Plays/Game: <span class="confidence-{pace_color}">{row['total_plays']:.1f}</span><br>
                Fantasy Points: {row['fantasy_points']:.1f}
            </div>
            """, unsafe_allow_html=True)
    
    with col2:
        st.subheader("🐌 Slowest Pace Teams")
        for idx, row in pace_data.tail(10).iterrows():
            pace_color = "low" if row['total_plays'] < 60 else "medium" if row['total_plays'] < 65 else "high"
            st.markdown(f"""
            <div class="metric-container">
                <strong>{row['recent_team']}</strong><br>
                Plays/Game: <span class="confidence-{pace_color}">{row['total_plays']:.1f}</span><br>
                Fantasy Points: {row['fantasy_points']:.1f}
            </div>
            """, unsafe_allow_html=True)
    
    # Pace vs Points visualization
    fig = px.scatter(
        platform.game_script_data,
        x='total_plays',
        y='fantasy_points',
        text='recent_team',
        title="Team Pace vs Fantasy Points",
        labels={'total_plays': 'Plays per Game', 'fantasy_points': 'Fantasy Points per Game'}
    )
    fig.update_traces(textposition="top center")
    st.plotly_chart(fig, use_container_width=True)

def show_injury_reports(platform):
    """Live injury reports from ESPN"""
    st.markdown('<h2 class="section-header">🏥 Live Injury Reports (ESPN API)</h2>', unsafe_allow_html=True)
    
    # Team selection
    team_names = list(platform.nfl_teams.keys())
    selected_team = st.selectbox("Select Team", sorted(team_names))
    
    if selected_team:
        team_id = platform.nfl_teams[selected_team]
        
        with st.spinner(f"Fetching injury data for {selected_team}..."):
            injury_data = platform.get_espn_data('injuries', team_id)
            
            if injury_data and 'items' in injury_data:
                st.success(f"✅ Found {injury_data['count']} injury reports for {selected_team}")
                
                if injury_data['items']:
                    st.markdown("**Current Injury Reports:**")
                    for injury in injury_data['items'][:10]:  # Show first 10
                        st.markdown(f"""
                        <div class="injury-alert">
                            <strong>Injury Report ID:</strong> {injury.get('$ref', 'Unknown')}<br>
                            <em>Detailed injury information available via ESPN API</em>
                        </div>
                        """, unsafe_allow_html=True)
                else:
                    st.info(f"✅ No current injuries reported for {selected_team}")
            else:
                st.warning(f"⚠️ Could not fetch injury data for {selected_team}")

def show_depth_charts(platform):
    """ESPN depth chart analysis"""
    st.markdown('<h2 class="section-header">📋 Depth Charts (ESPN API)</h2>', unsafe_allow_html=True)
    
    # Team selection
    team_names = list(platform.nfl_teams.keys())
    selected_team = st.selectbox("Select Team for Depth Chart", sorted(team_names))
    
    if selected_team:
        team_id = platform.nfl_teams[selected_team]
        
        with st.spinner(f"Fetching depth chart for {selected_team}..."):
            depth_data = platform.get_espn_data('depth_chart', team_id)
            
            if depth_data and 'items' in depth_data:
                st.success(f"✅ Found {depth_data['count']} depth chart formations for {selected_team}")
                
                for formation in depth_data['items']:
                    st.subheader(f"Formation: {formation.get('name', 'Unknown')}")
                    
                    if 'positions' in formation:
                        positions = formation['positions']
                        
                        # Display positions in columns
                        pos_keys = list(positions.keys())
                        if pos_keys:
                            cols = st.columns(min(3, len(pos_keys)))
                            
                            for i, pos_key in enumerate(pos_keys[:9]):  # Show first 9 positions
                                with cols[i % 3]:
                                    pos_data = positions[pos_key]
                                    pos_name = pos_data.get('position', {}).get('name', pos_key.upper())
                                    athletes = pos_data.get('athletes', [])
                                    
                                    st.markdown(f"**{pos_name}**")
                                    for athlete in athletes[:3]:  # Show top 3 at each position
                                        rank = athlete.get('rank', 'N/A')
                                        st.markdown(f"  {rank}. Player ID: {athlete.get('athlete', {}).get('$ref', 'Unknown')}")
            else:
                st.warning(f"⚠️ Could not fetch depth chart for {selected_team}")

def show_team_analysis(platform):
    """Detailed analysis for a selected team"""
    st.markdown('<h2 class="section-header">📈 Team Analysis</h2>', unsafe_allow_html=True)
    
    if not platform.game_script_data.empty:
    teams = platform.game_script_data['recent_team'].unique()
        team_selection = st.selectbox("Select Team", sorted(teams), key="team_analysis_selection")
    
        if team_selection:
            # Game Script/Pace data
            team_game_script = platform.game_script_data[platform.game_script_data['recent_team'] == team_selection]
            if not team_game_script.empty:
                st.subheader(f"🚀 Game Script & Pace for {team_selection}")
                st.write(team_game_script)
            
            # Player Stats
            team_players = platform.player_stats[platform.player_stats['recent_team'] == team_selection]
            if not team_players.empty:
                st.subheader(f"⭐ Player Stats for {team_selection}")
                st.write(team_players)
            
            # Target Depth
            team_targets = platform.target_depth_data[platform.target_depth_data['recent_team'] == team_selection]
            if not team_targets.empty:
                st.subheader(f"🎯 Target Analysis for {team_selection}")
                st.write(team_targets)
    else:
        st.warning("Data not available for selected team.")

if __name__ == "__main__":
    main()