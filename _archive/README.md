# 🏈 NFL Analytics Platform
## Trustworthy XGBoost Prediction Model

**Professional NFL analytics with transparent performance tracking**

---

## 🎯 **Quick Start**

### **Start Production Server**
```bash
py src/api/production_server.py
```
Server runs on: http://localhost:3000

### **Run EPA System**
```bash
py src/prediction/epa_system.py
```

---

## 📊 **Data Assets**

- **2,956 historical games** (2011-2021) with betting odds
- **4 complete seasons** (2021-2024) player/team stats
- **$0 monthly cost** - 100% free API integration
- **Real-time data** - ESPN, Weather, Odds APIs

---

## 🧠 **XGBoost Model** (In Development)

**Location**: `xgboost_model/`

**Features**: 22 engineered features from research
- EPA differentials, DVOA, success rates
- Weather, injuries, recent form
- Time-series validation (no data leakage)

**Target**: 58-62% accuracy with transparent tracking

---

## 🗂️ **Project Structure**

```
NFL model/
├── data/                    # Historical & current data
├── nfl_data/               # Player stats 2021-2024
├── src/
│   ├── api/                # Production server
│   ├── prediction/         # EPA system
│   └── services/           # API integrations
├── xgboost_model/          # Trustworthy model
└── scripts/                # Data collection
```

---

## 🚀 **Development Status**

✅ **Data Foundation Complete** - All essential data collected
✅ **APIs Integrated** - ESPN, Weather, Odds (free)
✅ **Clean Architecture** - Removed 100+ duplicate files
🔄 **XGBoost Model** - Phase 1 starting
🔄 **Feature Engineering** - 22 research-proven features
🔄 **Validation Framework** - Honest accuracy tracking

---

## 📈 **Commands**

```bash
# Start server
py src/api/production_server.py

# Run predictions
py src/prediction/epa_system.py

# Collect data
node scripts/collect_historical_data.js
```

**Simple. Clean. Trustworthy.** 🎯 