# 🆓 FREE NFL API SETUP GUIDE
## Get All Your Data Without Paying Anything!

This guide shows you how to set up all the free APIs we're using for your NFL analytics platform.

## 📊 **WHAT WE GET FOR FREE**

### ✅ **ESPN APIs (100% FREE - No Keys Required)**
- **Injury Reports**: Real-time injury status for all players
- **Player Data**: Complete roster with positions, stats
- **Team Schedules**: All games, dates, opponents
- **Game Data**: Scores, stats, live updates

### ✅ **OpenWeatherMap (FREE TIER)**
- **1,000 API calls per day FREE**
- **Stadium Weather**: Temperature, wind, rain, humidity
- **Game Forecasts**: Weather predictions for future games
- **Historical Data**: Past weather conditions

### ✅ **The Odds API (FREE TIER)**
- **500 API calls per month FREE**
- **Multiple Sportsbooks**: DraftKings, FanDuel, BetMGM, etc.
- **All Market Types**: Spreads, totals, moneylines, props
- **Live Odds**: Real-time line movements

---

## 🚀 **SETUP STEPS**

### **Step 1: OpenWeatherMap API (FREE)**

1. **Sign up**: Go to [openweathermap.org/api](https://openweathermap.org/api)
2. **Create account**: 100% free, no credit card required
3. **Get API key**: Available immediately after signup
4. **Free tier includes**: 1,000 calls/day, current weather, 5-day forecast

**Your free tier gets you:**
- Current weather for all 32 NFL stadiums
- 5-day forecasts for upcoming games
- Historical weather data
- Perfect for game-day predictions!

### **Step 2: Verify Your Odds API**

You mentioned you already have an odds API with 500 calls/month. Let's check if it's The Odds API:

1. **Find your API key**: Check your email or account dashboard
2. **Verify it works**: We'll test it in the next step
3. **If you don't have one**: Sign up at [the-odds-api.com](https://the-odds-api.com) (FREE tier)

### **Step 3: Create Environment File**

Create a `.env` file in your `backend` folder:

```env
# OpenWeatherMap API (FREE - 1000 calls/day)
OPENWEATHER_API_KEY=your_openweather_key_here

# The Odds API (FREE - 500 calls/month)
ODDS_API_KEY=your_odds_api_key_here

# ESPN APIs require no keys! 🎉
```

---

## 🧪 **TEST YOUR SETUP**

Run this command to test all APIs:

```bash
cd backend
node test_free_apis.js
```

**Expected results:**
- ✅ ESPN Injury Data: 20-50 injury reports
- ✅ Weather Data: Temperature, wind, conditions for Buffalo stadium
- ✅ Betting Odds: 0-15 games (depending on season)
- ✅ Player Data: 1000+ active NFL players
- ✅ Team Schedule: 17 games for any team

---

## 🎯 **WHAT THIS GETS YOU**

### **Real Injury Impact Analysis**
```javascript
// Example injury data from ESPN (FREE)
{
  playerName: "Josh Allen",
  team: "BUF",
  injuryStatus: "Questionable",
  injuryType: "Shoulder",
  impact: { severity: 0.4, description: "Game-time decision" }
}
```

### **Real Weather Impact**
```javascript
// Example weather data for Highmark Stadium (FREE)
{
  stadium: "Highmark Stadium",
  temperature: 28,
  windSpeed: 18,
  conditions: "Snow",
  gameImpact: { level: "High", factors: ["Cold affects passing", "High winds affect kicking"] }
}
```

### **Real Betting Odds**
```javascript
// Example odds data from multiple sportsbooks (FREE)
{
  homeTeam: "Buffalo Bills",
  awayTeam: "Miami Dolphins", 
  bookmakers: [
    { name: "DraftKings", spreads: [-3.5, +3.5], totals: [47.5] },
    { name: "FanDuel", spreads: [-3.0, +3.0], totals: [48.0] }
  ]
}
```

---

## 💡 **PRO TIPS**

### **Maximize Your Free Limits**
- **Cache data**: Our system caches results to minimize API calls
- **Batch requests**: Get all teams at once instead of individual calls
- **Smart timing**: Update injury data once per day, odds every 15 minutes

### **API Call Budget**
- **Weather**: ~50 calls per game day (all stadiums)
- **Odds**: ~100 calls per week (all games)
- **ESPN**: Unlimited! No keys required!

### **Seasonal Strategy**
- **Preseason**: Focus on injury data and roster changes
- **Regular Season**: Full weather + odds + injury analysis
- **Playoffs**: Maximum accuracy with all data sources

---

## 🔧 **TROUBLESHOOTING**

### **Common Issues**

**Weather API 401 Error**
- Check your API key in `.env` file
- Verify key is active on OpenWeatherMap dashboard
- Make sure no extra spaces in the key

**Odds API 401 Error** 
- Verify your odds API key
- Check if you've exceeded 500 monthly calls
- Confirm the API service (The Odds API vs others)

**ESPN APIs Not Working**
- These require no keys and should always work
- Check your internet connection
- ESPN may have temporary outages

### **Getting Help**
- ESPN API docs: No documentation needed (public APIs)
- OpenWeatherMap docs: [openweathermap.org/api](https://openweathermap.org/api)
- The Odds API docs: [the-odds-api.com/liveapi/guides](https://the-odds-api.com/liveapi/guides)

---

## 🎉 **YOU'RE READY!**

Once your APIs are working, you'll have:
- ✅ Real injury data for accurate predictions
- ✅ Weather conditions affecting game outcomes  
- ✅ Live betting odds for value identification
- ✅ Complete player and team data
- ✅ Zero monthly costs!

**Next step**: Run the test script and let's get your platform making real predictions! 