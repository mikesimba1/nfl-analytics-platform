#!/usr/bin/env python3
"""
Simple test for nfl-data-py
"""

print("🏈 Testing NFL Data Access (Simple)...")

try:
    import nfl_data_py as nfl
    print("✅ nfl-data-py imported successfully")
    
    # Try to get a small sample of 2024 data
    print("📊 Attempting to load 2024 play-by-play data...")
    pbp_data = nfl.import_pbp_data([2024])
    
    print(f"✅ Successfully loaded {len(pbp_data)} plays")
    print(f"✅ Columns available: {list(pbp_data.columns)[:10]}...")
    
    # Check if EPA column exists
    if 'epa' in pbp_data.columns:
        print("✅ EPA data is available!")
        print(f"✅ Sample EPA values: {pbp_data['epa'].dropna().head(5).tolist()}")
    else:
        print("❌ EPA column not found")
    
except ImportError as e:
    print(f"❌ Import error: {e}")
except Exception as e:
    print(f"❌ Data access error: {e}")
    print("   This might be normal - data may need to download first")

print("�� Test Complete!") 