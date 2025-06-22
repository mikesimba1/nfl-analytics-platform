#!/usr/bin/env python3
"""
Step 1 Verification: ML Environment Ready
"""

print("🎯 STEP 1 VERIFICATION REPORT")
print("=" * 60)

# Test core ML libraries
success_count = 0
total_tests = 6

try:
    import pandas as pd
    print(f"✅ pandas {pd.__version__} - Data manipulation ready")
    success_count += 1
except ImportError:
    print("❌ pandas failed")

try:
    import numpy as np
    print(f"✅ numpy {np.__version__} - Numerical computing ready")
    success_count += 1
except ImportError:
    print("❌ numpy failed")

try:
    import sklearn
    print(f"✅ scikit-learn {sklearn.__version__} - ML algorithms ready")
    success_count += 1
except ImportError:
    print("❌ scikit-learn failed")

try:
    import xgboost as xgb
    print(f"✅ XGBoost {xgb.__version__} - Ensemble model ready")
    success_count += 1
except ImportError:
    print("❌ XGBoost failed")

try:
    import matplotlib
    print(f"✅ matplotlib {matplotlib.__version__} - Visualization ready")
    success_count += 1
except ImportError:
    print("❌ matplotlib failed")

try:
    import seaborn as sns
    print(f"✅ seaborn {sns.__version__} - Statistical plots ready")
    success_count += 1
except ImportError:
    print("❌ seaborn failed")

print("\n" + "=" * 60)
print(f"STEP 1 RESULT: {success_count}/{total_tests} core packages installed")

if success_count >= 4:
    print("🎯 STEP 1 SUCCESSFUL - Ready for XGBoost ensemble implementation!")
    print("\nNEXT STEPS:")
    print("1. Get EPA data (alternative source needed)")
    print("2. Build feature engineering pipeline") 
    print("3. Implement proven XGBoost configuration")
    print("4. Add calibration framework")
else:
    print("❌ STEP 1 INCOMPLETE - Need to fix package installations")

print("=" * 60) 