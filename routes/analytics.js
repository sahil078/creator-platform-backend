// routes/analytics.js
const router = require('express').Router();
const analyticsController = require('../controllers/analyticsController');
const authMiddleware = require('../middleware/authMiddleware');

// Add middleware to clear any accidental request body
router.use((req, res, next) => {
  if (req.body && Object.keys(req.body).length > 0) {
    console.warn('Warning: GET request received with body - ignoring');
    req.body = {};
  }
  next();
});

// GET analytics data
router.get('/', authMiddleware.protect, analyticsController.getAnalytics);

module.exports = router;