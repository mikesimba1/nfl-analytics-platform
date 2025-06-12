# 🏈 NFL Analytics Pro - Restructured & Optimized

A professional-grade NFL analytics platform built with modern architecture and focused on accurate data analysis.

## ✨ **What's New**

### 🎯 **Data Strategy Fixed**
- **2024 Season Focus**: Uses complete 2024 NFL season as historical baseline
- **Live Data Integration**: Real-time injury reports and roster updates
- **Predictive Analytics**: AI predictions based on 2024 patterns
- **No More Confusion**: Clear separation between historical data and predictions

### 🏗️ **Project Restructure**
- **Clean Architecture**: Separate frontend and backend
- **Modern Stack**: Next.js + Express.js + Node.js
- **60+ Files Removed**: Eliminated redundant code and bloat
- **Professional Structure**: Industry-standard project organization

## 📁 **New Project Structure**

```
nfl-analytics-pro/
├── frontend/                # Next.js React App
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   │   ├── components/     # Reusable UI components  
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── backend/                 # Express.js API Server
│   │   ├── src/
│   │   │   ├── routes/         # API endpoints
│   │   │   ├── services/       # Business logic
│   │   │   ├── middleware/     # Express middleware
│   │   │   └── ...
│   │   └── package.json
│   │
│   ├── scripts/                # Development & deployment scripts
│   └── docs/                   # Documentation
│
└── nfl_data/              # 2024 NFL season data (CSV files)
```

## 🚀 **Quick Start**

### **Option 1: Development Mode (Recommended)**
```bash
# Start both frontend and backend
node scripts/start-dev.js
```

### **Option 2: Manual Start**
```bash
# Terminal 1 - Backend API
cd backend
npm install
npm run dev

# Terminal 2 - Frontend App  
cd frontend
npm install
npm run dev
```

## 🌐 **Access Points**

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Health Check**: http://localhost:3001/health

## 📊 **Features**

### 🎯 **Dashboard**
- Real-time system status
- 2024 season overview
- Top predictions with confidence ratings
- Key performance metrics

### 📈 **Game Analysis**
- Complete 2024 season breakdown
- Team performance analytics
- Historical matchup data
- Trend analysis

### 👤 **Player Props**
- Individual player statistics
- Performance predictions
- Injury impact analysis
- Position-specific insights

### 💰 **Live Odds**
- Real-time betting lines
- Line movement tracking
- Value bet identification
- Market analysis

### 🏥 **Injury Center**
- Live injury reports
- Impact on fantasy/betting
- Recovery timelines
- Replacement analysis

### 📡 **Data Center**
- System health monitoring
- Data quality metrics
- API connection status
- Performance analytics

## 🔧 **Technical Stack**

### **Frontend**
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Custom + Lucide React icons
- **State Management**: React hooks
- **Charts**: Recharts

### **Backend**
- **Runtime**: Node.js
- **Framework**: Express.js
- **Caching**: Node-Cache
- **Validation**: Express-validator
- **Security**: Helmet, CORS, Rate limiting
- **Logging**: Morgan + Winston

### **Data Sources**
- **Historical**: 2024 NFL season data (local CSV files)
- **Live Data**: ESPN API (injuries, rosters)
- **Predictions**: Machine learning models
- **Odds**: Multiple sportsbook APIs (coming soon)

## 📈 **Data Strategy**

### **Historical Analysis (2024 Season)**
- ✅ Complete regular season (272 games)
- ✅ Playoff games (13 games)  
- ✅ Player statistics by position
- ✅ Team performance metrics
- ✅ Weather and injury data

### **Live Data Integration**
- ✅ Current rosters and transactions
- ✅ Injury reports and status updates
- ✅ Live scores during games
- 🔄 Real-time odds (coming soon)

### **Predictive Models**
- 🤖 Machine learning trained on 2024 data
- 📊 Player performance projections
- 🎲 Game outcome predictions
- 💡 Betting value identification

## 🛠️ **Development**

### **Environment Setup**
```bash
# Backend environment variables
cd backend
cp .env.example .env
# Edit .env with your API keys

# Frontend environment variables  
cd frontend
cp .env.local.example .env.local
# Edit .env.local with backend URL
```

### **Available Scripts**

#### **Frontend (frontend/)**
```bash
npm run dev          # Development server
npm run build        # Production build
npm run start        # Production server
npm run lint         # ESLint check
npm run type-check   # TypeScript check
```

#### **Backend (backend/)**
```bash
npm run dev          # Development server (nodemon)
npm start            # Production server
npm test             # Run tests
npm run lint         # ESLint check
```

#### **Root Scripts**
```bash
node scripts/start-dev.js     # Start both frontend & backend
node scripts/cleanup-project.js  # Clean up old files
```

## 📚 **API Documentation**

### **2024 Season Data**
```bash
GET /api/nfl-data/season/2024      # Season overview
GET /api/nfl-data/games/2024       # All 2024 games
GET /api/nfl-data/teams/2024/:team # Team statistics
GET /api/nfl-data/players/2024     # Player statistics
```

### **Live Data**
```bash
GET /api/nfl-data/rosters/current  # Current rosters
GET /api/injuries/current          # Live injury reports
GET /api/odds/live                 # Live betting odds
GET /api/predictions/current       # AI predictions
```

### **System**
```bash
GET /health                        # System health
GET /api/nfl-data/status          # Data system status
```

## 🔐 **Production Deployment**

### **Environment Variables**
```bash
# Backend
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-domain.com
ESPN_API_KEY=your_key_here
ODDS_API_KEY=your_key_here

# Frontend  
BACKEND_URL=https://api.your-domain.com
NEXT_PUBLIC_API_URL=https://api.your-domain.com
```

### **Build Commands**
```bash
# Frontend
cd frontend && npm run build

# Backend
cd backend && npm install --production
```

## 🎯 **Key Improvements**

1. ✅ **Fixed Data Confusion**: Clear 2024 historical vs. live data
2. ✅ **Eliminated Bloat**: Removed 60+ redundant files  
3. ✅ **Modern Architecture**: Separate frontend/backend
4. ✅ **Better Performance**: Proper caching and optimization
5. ✅ **Real Data Sources**: ESPN API integration
6. ✅ **Professional Structure**: Industry-standard organization
7. ✅ **Type Safety**: Full TypeScript implementation
8. ✅ **Error Handling**: Comprehensive error management
9. ✅ **Documentation**: Clear setup and usage instructions
10. ✅ **Development Experience**: Easy local development setup

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 **License**

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 **Support**

- 📧 **Issues**: GitHub Issues
- 📖 **Documentation**: `/docs` directory
- 🔧 **Development**: Start with `node scripts/start-dev.js`

---

## 🎉 **Ready to Use!**

Your NFL Analytics Pro platform is now properly structured and ready for development. The new architecture provides:

- **Clear separation** between frontend and backend
- **Accurate data strategy** focused on 2024 season
- **Modern development experience** with hot reload
- **Professional codebase** ready for production
- **Scalable architecture** for future enhancements

**Happy Analyzing! 🏈** 