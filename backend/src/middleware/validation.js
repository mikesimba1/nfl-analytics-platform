const { validationResult, query } = require('express-validator')

const validateQuery = [
  query('week').optional().isInt({ min: 1, max: 18 }).withMessage('Week must be between 1 and 18'),
  query('team').optional().isLength({ min: 2, max: 3 }).withMessage('Team code must be 2-3 characters'),
  query('position').optional().isIn(['QB', 'RB', 'WR', 'TE', 'K', 'DEF']).withMessage('Invalid position'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: errors.array(),
        timestamp: new Date().toISOString()
      })
    }
    next()
  }
]

module.exports = {
  validateQuery
} 