const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { protect } = require('../middleware/auth.middleware');

// PATCH /api/users/me (Protected Route)
router.patch('/me', protect, userController.updateMe);

module.exports = router;
