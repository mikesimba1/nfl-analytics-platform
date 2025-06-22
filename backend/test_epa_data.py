#!/usr/bin/env python3
"""
Test EPA data access - Step 1 verification
"""

print("🏈 Testing EPA Data Access...")
print("=" * 50)

try:
    import nfl_data_py as nfl
    import pandas as pd
    print("✅ Libraries imported successfully")
    
    # Test with just a small sample first
    print("📊 Loading 2024 play-by-play data (this may take a moment)...")
    
    # Get play-by-play data for 2024
    pbp_data = nfl.import_pbp_data([2024])
    
    print(f"✅ Successfully loaded {len(pbp_data)} plays from 2024")
    
    # Check available columns
    print(f"📈 Total columns available: {len(pbp_data.columns)}")
    
    # Check specifically for EPA
    if 'epa' in pbp_data.columns:
        print("✅ EPA column found!")
        
        # Get some basic EPA stats
        epa_data = pbp_data['epa'].dropna()
        print(f"✅ EPA data points: {len(epa_data)}")
        print(f"✅ EPA range: {epa_data.min():.3f} to {epa_data.max():.3f}")
        print(f"✅ Average EPA: {epa_data.mean():.3f}")
        
        # Show sample EPA values
        print(f"✅ Sample EPA values: {epa_data.head(5).tolist()}")
        
    else:
        print("❌ EPA column not found!")
        print(f"Available columns: {list(pbp_data.columns)[:20]}...")
    
    print("\n🎯 Step 1 SUCCESSFUL: We can access EPA data!")
    
except Exception as e:
    print(f"❌ Error: {e}")
    print("   Trying alternative approach...")
    
    try:
        # Try with specific columns only
        pbp_data = nfl.import_pbp_data([2024], columns=['game_id', 'epa', 'posteam'])
        if len(pbp_data) > 0:
            print("✅ Alternative approach worked!")
            print(f"✅ Loaded {len(pbp_data)} plays with EPA data")
        
    except Exception as e2:
        print(f"❌ Alternative also failed: {e2}")

print("=" * 50) 