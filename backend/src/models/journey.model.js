const mongoose = require('mongoose');

const journeySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Journey name is required'],
    trim: true
  },
  destination: {
    type: String,
    required: [true, 'Destination is required'],
    trim: true
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Journey creator is required']
  },
  participants: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const Journey = mongoose.model('Journey', journeySchema);

module.exports = Journey;
