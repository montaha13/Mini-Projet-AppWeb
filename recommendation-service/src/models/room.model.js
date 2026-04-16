const mongoose = require('mongoose');

const roomSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: {
    type: String,
    required: true,
    enum: [
      'coworking_desk',
      'meeting_room',
      'fablab_workshop',
      'event_hall',
      'private_office',
      'recording_studio'
    ]
  },
  description: String,
  pricePerHour: { type: Number, required: true },
  pricePerDay: { type: Number, required: true },
  capacity: { type: Number, required: true },
  amenities: [String],
  tags: [String],
  location: String,
  rating: { type: Number, default: 0, min: 0, max: 5 },
  images: [String], // URLs
  isActive: { type: Boolean, default: true },
  bookedSlots: [{
    date: { type: Date, required: true },
    startTime: { type: String, required: true }, // e.g., "09:00"
    endTime: { type: String, required: true },   // e.g., "13:00"
    bookedBy: String
  }]
}, { timestamps: true, collection: 'rooms' });

module.exports = mongoose.model('Room', roomSchema);
