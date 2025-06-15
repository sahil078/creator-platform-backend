const router = require('express').Router();
const ideaController = require('../controllers/ideaController');
const authMiddleware = require('../middleware/authMiddleware');

// Changed to use authMiddleware.protect explicitly
router.post('/', authMiddleware.protect, ideaController.generateIdea);

module.exports = router;