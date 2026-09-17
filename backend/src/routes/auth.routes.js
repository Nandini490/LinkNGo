const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Route for user registration
// POST /api/auth/register
router.post('/register', authController.registerUser);

// Route for user login
// POST /api/auth/login
router.post('/login', authController.loginUser);

// Route for getting current authenticated user
// GET /api/auth/me
router.get('/me', authenticateToken, authController.getCurrentUser);

module.exports = router;
