const express = require('express');
const router = express.Router();
const healthController = require('../controllers/health.controller');

// Route for health check
// GET /api/health
router.get('/health', healthController.checkHealth);

module.exports = router;
