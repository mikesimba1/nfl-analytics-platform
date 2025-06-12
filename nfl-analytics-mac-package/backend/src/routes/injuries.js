const express = require('express')
const router = express.Router()

// Get current injury reports
router.get('/current', async (req, res) => {
  try {
    res.json({
      success: true,
      data: {
        message: 'Live injury data integration coming soon',
        placeholder: true
      },
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    })
  }
})

module.exports = router 