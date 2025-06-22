#!/usr/bin/env python3
"""
Test nfl-data-py functionality
This verifies we can access EPA data (critical for Step 2)
"""

print("🏈 Testing NFL Data Access...")
print("=" * 50)

try:
    import nfl_data_py as nfl
    print("✅ nfl-data-py imported successfully")
    
    # Test available data functions
    print("📊 Available data functions:")
    functions = [attr for attr in dir(nfl) if not attr.startswith('_')]
    for func in functions[:10]:  # Show first 10 functions
        print(f"   - {func}")
    
    print(f"\n📈 Total available functions: {len(functions)}")
    
    # Test if we can access play-by-play data (contains EPA)
    print("\n🎯 Testing EPA data access...")
    print("   Attempting to load 2024 play-by-play data sample...")
    
    # This will test if we can access the EPA data we need
    pbp_2024 = nfl.import_pbp_data([2024], columns=['game_id', 'posteam', 'epa'])
    print(f"✅ Successfully loaded {len(pbp_2024)} plays from 2024")
    print(f"✅ EPA column available: {'epa' in pbp_2024.columns}")
    
    if len(pbp_2024) > 0:
        print(f"✅ Sample EPA values: {pbp_2024['epa'].head().tolist()}")
    
except Exception as e:
    print(f"❌ Error accessing NFL data: {e}")
    print("   This might be normal on first run - data downloads in background")

print("=" * 50)
print("🎯 NFL Data Test Complete!") 