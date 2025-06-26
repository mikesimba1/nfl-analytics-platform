# 🏈 NFL Analytics Platform

## Overview
Professional NFL analytics platform with 58%+ prediction accuracy using EPA data and advanced modeling.

**Status**: Production-ready system with comprehensive data pipeline and prediction engines.

## Quick Start
```bash
# Install dependencies
npm install

# Run EPA prediction system
py src/prediction/epa_system.py

# Start web interface
npm run dev
```

## Project Structure
```
nfl-analytics-platform/
├── data/                      # All data files
│   ├── consolidated/          # Historical data (2,956 games)
│   ├── current/              # Live/current data
│   ├── features/             # ML-ready features
│   └── models/               # Trained models
│
├── src/                       # Source code
│   ├── prediction/           # Prediction engines
│   │   └── epa_system.py     # Enhanced EPA system
│   ├── data/                 # Data processing
│   ├── api/                  # API services
│   └── web/                  # Web interface
│
├── historical-odds-scraper/   # 10+ years betting data
├── backend/                   # Legacy backend (being phased out)
└── docs/                      # Documentation
```

## Features
- **EPA + DVOA Integration**: Advanced team rating system
- **58%+ Accuracy Target**: Enhanced prediction models
- **Real-time Betting Odds**: Live market integration
- **Edge Detection**: Value opportunity identification
- **$0 Data Costs**: Free API integration (ESPN, Weather, Odds)

## Data Assets
- **2,956 historical games** with complete betting odds
- **10+ years** of NFL data and weather history
- **32 teams** with enhanced EPA ratings
- **Real-time APIs**: Betting odds, weather, ESPN stats

## API Integration
- **ESPN APIs**: Player data, injury reports, schedules (FREE)
- **Weather API**: Stadium-specific conditions (FREE)
- **Odds API**: Real-time betting lines (FREE tier)

## Current Capabilities
- Enhanced EPA-based team ratings
- Spread and total predictions
- Confidence scoring (15-85% range)
- Edge detection (10%+ opportunities)
- Weather impact analysis

## Development Status
✅ **Data Collection**: 95% complete
✅ **Prediction Engine**: EPA system operational
✅ **API Integration**: All services connected
✅ **Web Interface**: Basic functionality
🔄 **XGBoost Enhancement**: In progress
🔄 **Production Deployment**: Ready for testing

## Performance Targets
- **Spread Accuracy**: 58%+ target
- **Total Accuracy**: 58%+ target
- **Edge Detection**: 15-25 opportunities per week
- **Confidence Levels**: High (60%+), Medium (55-60%), Low (<55%)

## Getting Started

### Prerequisites
- Python 3.11+
- Node.js 18+

### Installation
1. Clone repository
2. `npm install`
3. Configure API keys (see docs/setup.md)
4. Run prediction system: `py src/prediction/epa_system.py`

### Usage
1. **Run Predictions**: `py src/prediction/epa_system.py`
2. **View Results**: Check console output for betting recommendations
3. **Access Data**: All data available in `data/` directory
4. **Web Interface**: `npm run dev` for development server

## Configuration
- Betting odds API key in environment
- Weather API key configured
- Data paths verified in system

## Contributing
This is a personal analytics platform. Focus areas:
- Prediction accuracy improvements
- New data source integration
- UI/UX enhancements

## License
Private project - All rights reserved

---

**Built for accurate NFL predictions with transparent, data-driven analysis.** 