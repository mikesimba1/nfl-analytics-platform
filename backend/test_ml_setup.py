#!/usr/bin/env python3
"""
Test script to verify ML environment setup
This validates that Step 1 was completed successfully
"""

print("🔍 Testing ML Environment Setup...")
print("=" * 50)

try:
    import pandas as pd
    print("✅ pandas imported successfully - version:", pd.__version__)
except ImportError as e:
    print("❌ pandas failed:", e)

try:
    import numpy as np
    print("✅ numpy imported successfully - version:", np.__version__)
except ImportError as e:
    print("❌ numpy failed:", e)

try:
    import sklearn
    print("✅ scikit-learn imported successfully - version:", sklearn.__version__)
except ImportError as e:
    print("❌ scikit-learn failed:", e)

try:
    import xgboost as xgb
    print("✅ XGBoost imported successfully - version:", xgb.__version__)
except ImportError as e:
    print("❌ XGBoost failed:", e)

try:
    import matplotlib
    print("✅ matplotlib imported successfully - version:", matplotlib.__version__)
except ImportError as e:
    print("❌ matplotlib failed:", e)

try:
    import seaborn as sns
    print("✅ seaborn imported successfully - version:", sns.__version__)
except ImportError as e:
    print("❌ seaborn failed:", e)

try:
    import nfl_data_py as nfl
    print("✅ nfl-data-py imported successfully")
    print("   Available seasons:", nfl.see_weekly_data())
except ImportError as e:
    print("❌ nfl-data-py failed:", e)
except Exception as e:
    print("⚠️ nfl-data-py imported but data access failed:", e)

print("=" * 50)
print("🎯 Step 1 Verification Complete!") 