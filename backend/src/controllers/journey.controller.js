const mongoose = require('mongoose');
const Journey = require('../models/journey.model');

/**
 * Create a new journey
 * Allows an authenticated user to start a new ride
 */
const createJourney = async (req, res) => {
  try {
    const { name, destination } = req.body;

    // 1. Validate required fields
    if (!name || !destination) {
      return res.status(400).json({
        success: false,
        message: 'Journey name and destination are required'
      });
    }

    // 2. Get creator ID from the authenticated token
    const creatorId = req.user.sub;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity missing'
      });
    }

    // 3. Create the journey
    const newJourney = await Journey.create({
      name,
      destination,
      creator: creatorId
    });

    // 4. Return success response
    return res.status(201).json({
      success: true,
      data: {
        _id: newJourney._id,
        name: newJourney.name,
        destination: newJourney.destination,
        creator: newJourney.creator,
        createdAt: newJourney.createdAt
      }
    });

  } catch (error) {
    console.error('Create journey error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get all journeys for the authenticated user
 * Allows a user to see the rides they have created
 */
const getMyJourneys = async (req, res) => {
  try {
    const creatorId = req.user.sub;

    if (!creatorId) {
      return res.status(401).json({
        success: false,
        message: 'Unauthorized: User identity missing'
      });
    }

    // Find journeys where the creator matches the authenticated user's ID
    const journeys = await Journey.find({ creator: creatorId }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      data: journeys
    });

  } catch (error) {
    console.error('Get my journeys error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Get a specific journey by ID
 * Ensures the requested journey belongs to the authenticated user
 */
const getJourneyById = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const creatorId = req.user.sub;

    // 1. Validate if the journeyId is a valid MongoDB ObjectId
    if (!mongoose.Types.ObjectId.isValid(journeyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journey ID'
      });
    }

    // 2. Find the journey by both ID and creator
    const journey = await Journey.findOne({
      _id: journeyId,
      creator: creatorId
    });

    // 3. Handle not found securely
    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    // 4. Return success
    return res.status(200).json({
      success: true,
      data: journey
    });

  } catch (error) {
    console.error('Get journey by id error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

/**
 * Join an existing journey
 */
const joinJourney = async (req, res) => {
  try {
    const { journeyId } = req.params;
    const userId = req.user.sub;

    if (!mongoose.Types.ObjectId.isValid(journeyId)) {
      return res.status(400).json({
        success: false,
        message: 'Invalid journey ID'
      });
    }

    const journey = await Journey.findById(journeyId);

    if (!journey) {
      return res.status(404).json({
        success: false,
        message: 'Journey not found'
      });
    }

    // Creator cannot join their own journey (they are already the creator)
    if (journey.creator.toString() === userId) {
      return res.status(400).json({
        success: false,
        message: 'Creator cannot join their own journey'
      });
    }

    // Check if user is already in the participants array
    if (journey.participants.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: 'You have already joined this journey'
      });
    }

    // Add user to participants
    journey.participants.push(userId);
    await journey.save();

    return res.status(200).json({
      success: true,
      message: 'Successfully joined journey',
      data: journey
    });

  } catch (error) {
    console.error('Join journey error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error'
    });
  }
};

module.exports = {
  createJourney,
  getMyJourneys,
  getJourneyById,
  joinJourney
};
