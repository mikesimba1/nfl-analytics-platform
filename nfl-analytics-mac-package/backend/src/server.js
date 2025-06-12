const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const rateLimit = require('express-rate-limit')
require('dotenv').config()

// Import routes
const nflDataRoutes = require('./routes/nflData')
const oddsRoutes = require('./routes/odds')
const injuryRoutes = require('./routes/injuries')
const predictionRoutes = require('./routes/predictions')
const analyticsRoutes = require('./routes/analytics')
const rosterRoutes = require('./routes/rosters')
const enhancedAnalyticsRoutes = require('./routes/enhancedAnalytics')

const app = express()
const PORT = process.env.PORT || 3001

// Security middleware
app.use(helmet())
app.use(compression())

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}))

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Logging
app.use(morgan('combined'))

// Body parsing
app.use(express.json({ limit: '10mb' }))
app.use(express.urlencoded({ extended: true }))

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development'
  })
})

// API routes
app.use('/api/nfl-data', nflDataRoutes)
app.use('/api/nfl', nflDataRoutes)
app.use('/api/odds', oddsRoutes)
app.use('/api/injuries', injuryRoutes)
app.use('/api/predictions', predictionRoutes)
app.use('/api/analytics', analyticsRoutes)
app.use('/api/rosters', rosterRoutes)
app.use('/api/enhanced-analytics', enhancedAnalyticsRoutes)

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    analytics: {
      standard: 'Available',
      enhanced: 'Available - v2.0',
      features: [
        'EPA Analysis',
        'Success Rate Metrics',
        'CPOE Calculations',
        'Ensemble Modeling',
        'Market Inefficiency Detection'
      ]
    }
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.originalUrl} not found`,
    timestamp: new Date().toISOString()
  })
})

// Global error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.stack)
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    timestamp: new Date().toISOString(),
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  })
})

// Start server
app.listen(PORT, () => {
  console.log(`🏈 NFL Analytics Backend running on port ${PORT}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🔗 Health check: http://localhost:${PORT}/health`)
  console.log(`🧠 Enhanced Analytics: http://localhost:${PORT}/api/enhanced-analytics/model-performance`)
}) 