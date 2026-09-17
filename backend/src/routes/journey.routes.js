const express = require('express');
const router = express.Router();
const journeyController = require('../controllers/journey.controller');
const { authenticateToken } = require('../middleware/auth.middleware');

// Route for creating a new journey
// POST /api/journeys
router.post('/', authenticateToken, journeyController.createJourney);

// Route for fetching the authenticated user's journeys
// GET /api/journeys
router.get('/', authenticateToken, journeyController.getMyJourneys);

// Route for fetching a specific journey by ID
// GET /api/journeys/:journeyId
router.get('/:journeyId', authenticateToken, journeyController.getJourneyById);

// Route for joining an existing journey
// POST /api/journeys/:journeyId/join
router.post('/:journeyId/join', authenticateToken, journeyController.joinJourney);

module.exports = router;
