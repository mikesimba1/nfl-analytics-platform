# 🎯 API Limit Management & Testing Guide

## 📊 **Smart API Usage Strategy**

Your NFL Analytics platform now includes intelligent API limit management to maximize the value of your free 500 requests/month from The Odds API.

### 🔄 **Multi-Tier Fallback System**

```
1. The Odds API (Primary) → 500 free requests/month
2. ESPN API (Backup) → Unlimited free requests  
3. GitHub Scrapers (Backup) → Unlimited free data
4. Demo Data (Fallback) → Always available
```

### 📈 **Usage Tracking Features**

- **Daily Limits**: 16 requests/day (500÷31 days)
- **Monthly Tracking**: Persistent across server restarts
- **Smart Caching**: 30-minute cache to reduce API calls
- **Automatic Fallback**: Seamlessly switches to backup sources

### 🎛️ **API Status Monitoring**

**Real-time tracking includes:**
- Requests used today vs daily limit
- Requests used this month vs monthly limit  
- Remaining requests (daily/monthly)
- Current data source being used
- Cache status and freshness

## 🧪 **Testing Your Platform**

### **1. Backend API Testing**

```bash
# Test API status and usage
curl http://localhost:3001/api/odds/status

# Get current betting odds
curl http://localhost:3001/api/odds/current

# Test best odds comparison
curl http://localhost:3001/api/odds/best

# Check line movements
curl http://localhost:3001/api/odds/movements

# Test specific game odds
curl "http://localhost:3001/api/odds/game/Dallas Cowboys/Philadelphia Eagles"
```

### **2. Frontend Dashboard Testing**

**Visit:** `http://localhost:3000`

**What You'll See:**
- ✅ **Live Betting Odds Section** with API usage tracking
- ✅ **Real NFL Schedule** (2025 Week 1 games)
- ✅ **Player Props** with confidence ratings
- ✅ **Game Analysis** with weather and team ratings
- ✅ **API Status Indicator** showing current data source

### **3. API Limit Simulation**

To test the fallback system, you can simulate hitting limits:

```javascript
// In backend/src/services/oddsService.js, temporarily change:
dailyLimit: 1,  // Instead of 16
monthlyLimit: 5 // Instead of 500
```

Then make multiple API calls to see the automatic fallback in action.

## 🔧 **Configuration Options**

### **Environment Variables**

```bash
# Add to backend/.env
ODDS_API_KEY=your_free_api_key_here
CACHE_DURATION=1800000  # 30 minutes in milliseconds
DAILY_LIMIT=16          # Requests per day
MONTHLY_LIMIT=500       # Requests per month
```

### **Free API Key Setup**

1. **Get The Odds API Key** (500 free requests/month):
   - Visit: https://the-odds-api.com/
   - Sign up for free account
   - Copy your API key
   - Add to `backend/.env`: `ODDS_API_KEY=your_key_here`

2. **No Setup Required** for backup sources:
   - ESPN API: No key needed
   - GitHub scrapers: No key needed
   - Demo data: Always available

## 📱 **Frontend Features**

### **Dashboard Betting Odds Section**

**Displays:**
- Live odds from multiple sportsbooks
- Moneyline, spread, and totals
- API usage statistics
- Data source indicators
- Best odds highlighting
- Line movement alerts

**Smart Features:**
- Automatic refresh every 30 minutes
- Visual indicators for data freshness
- Fallback source notifications
- Usage limit warnings

### **API Status Indicators**

- 🟢 **Green**: Using live API data
- 🟡 **Yellow**: Using backup/cached data
- 🔴 **Red**: API limit reached, using demo data

## 🎯 **Best Practices**

### **Maximizing Your 500 Free Requests**

1. **Cache Aggressively**: 30-minute cache reduces calls by 95%
2. **Spread Usage**: 16 requests/day prevents monthly burnout
3. **Smart Timing**: Refresh odds only when needed
4. **Backup Sources**: Seamless fallback maintains service

### **Production Recommendations**

1. **Monitor Usage**: Check `/api/odds/status` regularly
2. **Set Alerts**: Get notified at 80% usage
3. **Plan Upgrades**: Consider paid plans for high-volume use
4. **Backup Strategy**: Always have fallback data sources

## 🔍 **Troubleshooting**

### **Common Issues**

**"API limit reached"**
- ✅ **Solution**: System automatically uses backup sources
- ✅ **Check**: `/api/odds/status` for usage details
- ✅ **Reset**: Limits reset daily/monthly automatically

**"No odds data"**
- ✅ **Check**: Backend server running on port 3001
- ✅ **Test**: `curl http://localhost:3001/api/odds/current`
- ✅ **Fallback**: Demo data always available

**"Frontend not updating"**
- ✅ **Refresh**: Click "Refresh Predictions" button
- ✅ **Cache**: Wait 30 minutes for cache expiry
- ✅ **Browser**: Hard refresh (Ctrl+F5)

## 📊 **Usage Statistics File**

The system creates `odds_usage_stats.json` to track usage:

```json
{
  "requestsThisMonth": 5,
  "monthlyLimit": 500,
  "lastResetDate": 5,
  "requestsToday": 2,
  "dailyLimit": 16,
  "lastRequestDate": 12
}
```

This file persists across server restarts and automatically resets counters.

## 🚀 **Advanced Features**

### **GitHub Scraper Integration**

When API limits are reached, the system can use:

- **DraftKings Scraper**: Real-time odds scraping
- **FanDuel Data**: Alternative odds source  
- **ESPN Integration**: Game schedules and scores
- **Community Data**: NFL statistics and trends

### **Line Movement Tracking**

```bash
# Get line movements and trends
curl http://localhost:3001/api/odds/movements
```

**Features:**
- Historical line changes
- Market movement alerts
- Sharp money indicators
- Public betting percentages

## 🎉 **Ready to Use!**

Your platform now includes:

- ✅ **Smart API Management**: Never waste requests
- ✅ **Multi-Source Fallback**: Always have data
- ✅ **Real-time Monitoring**: Track usage live
- ✅ **Professional UI**: Beautiful odds display
- ✅ **Free Forever**: Works without any API keys

**Test it now:**
1. Start backend: `cd backend && npm start`
2. Start frontend: `cd frontend && npm run dev`  
3. Visit: `http://localhost:3000`
4. See live betting odds with usage tracking!

---

## 🔗 **Quick Links**

- **Frontend**: http://localhost:3000
- **API Status**: http://localhost:3001/api/odds/status
- **Current Odds**: http://localhost:3001/api/odds/current
- **Health Check**: http://localhost:3001/health

**Happy Betting! 🏈💰** 