# 🧹 PROJECT CLEANUP PLAN
## Building Trustworthy XGBoost Model - What to Keep vs Delete

---

## ✅ **KEEP - Essential for XGBoost Model**

### **Core Data (CRITICAL)**
- `data/consolidated/` - Historical betting odds (2,956 games)
- `nfl_data/` - Player stats 2021-2024, game schedules
- `data/current-season/` - 2025 current games and injury data
- `data/2024-complete/` - Complete 2024 season results

### **Production Infrastructure**
- `src/api/production_server.py` - Single production server
- `src/prediction/epa_system.py` - EPA calculation framework
- `src/services/` - Core data services (ESPN, weather, odds APIs)

### **Essential Scripts**
- `scripts/collect_historical_data.js` - Data collection from APIs
- Core package files: `package.json`, `requirements.txt`

---

## 🗑️ **DELETE - Cleanup Targets**

### **Multiple Conflicting Servers**
- `server.js` ❌ (deleted but referenced in terminal)
- `server.mjs` ❌ (port conflicts)
- `nfl-betting-site.mjs` ❌ (temporary testing)
- `nfl-research-proven-site.mjs` ❌ (broken JSON)
- `backend/server.js` ❌ (duplicate)
- `src/api/advanced_analytics_server.py` ❌ (duplicate functionality)

### **Outdated Analysis Files (100+ files)**
- `backend/` - Most analysis files (keep only essential data)
- All the `*_analyzer.py` files (dozens of them)
- All the `SUMMARY.md` files (50+ duplicates)
- All the `*_research_*.py` files
- All the `*_validation_*.py` files
- All the `*_audit_*.py` files

### **Temporary/Test Files**
- `web-demo.html` ❌
- `honest-nfl-tracker.mjs` ❌
- `real-nfl-model.mjs` ❌
- All `*-demo.js` files
- All `test_*.py` files
- All `quick_*.py` files

### **Documentation Overflow**
- 50+ markdown files with duplicate information
- Keep only: `README.md` and essential docs

---

## 🎯 **FINAL STRUCTURE (Clean & Focused)**

```
NFL model/
├── data/                          # All data sources
│   ├── consolidated/              # Historical betting odds
│   ├── current-season/            # 2025 live data  
│   └── 2024-complete/             # Last season results
├── nfl_data/                      # Player/team stats 2021-2024
├── src/
│   ├── api/
│   │   └── production_server.py   # Single server
│   ├── prediction/
│   │   └── epa_system.py          # EPA calculations
│   └── services/                  # API integrations
├── scripts/
│   └── collect_historical_data.js # Data collection
├── xgboost_model/                 # NEW - Our trustworthy model
├── package.json
├── requirements.txt
└── README.md
```

---

## 🚀 **CLEANUP EXECUTION PLAN**

1. **Stop all running processes** ✅
2. **Delete duplicate servers and test files**
3. **Clean up backend/ directory (keep only essential data)**
4. **Remove 50+ duplicate markdown files**
5. **Create clean xgboost_model/ directory**
6. **Update README with simple instructions**
7. **Commit clean structure to GitHub**

**Result**: Clean foundation for building trustworthy XGBoost model 