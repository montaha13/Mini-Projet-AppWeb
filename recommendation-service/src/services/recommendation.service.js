const Room = require('../models/room.model');
const { isAvailable } = require('../utils/availability.util');

/**
 * Main recommendation logic based on preferences and content-based filtering.
 */
exports.getRecommendations = async ({ roomId, preferences, limit = 5 }) => {
  const {
    date, startTime, endTime,
    guests, budget,
    type, amenities, tags,
    pricingMode
  } = preferences;

  // Fetch all potential rooms
  // We'll filter them in-memory to simplify the availability check logic
  let rooms = await Room.find({ isActive: true });

  // --- Step 1: Hard Filters ---
  
  rooms = rooms.filter(room => {
    // 1. Exclude rooms where capacity < guests
    if (guests && room.capacity < guests) return false;

    // 2. Exclude rooms unavailable for the requested date/time
    if (date && startTime && endTime) {
      if (!isAvailable(room, date, startTime, endTime)) return false;
    }

    // 3. Exclude rooms where price exceeds budget
    if (budget) {
      const price = (pricingMode === 'daily') ? room.pricePerDay : room.pricePerHour;
      if (price > budget) return false;
    }

    return true;
  });

  // --- Step 2: Scoring ---
  
  const scoredRooms = rooms.map(room => {
    let score = 0;

    // type match: +4
    if (type && room.type === type) score += 4;

    // each amenity match: +2
    if (amenities && Array.isArray(amenities)) {
      amenities.forEach(prefAmenity => {
        if (room.amenities.includes(prefAmenity)) score += 2;
      });
    }

    // each tag match: +1
    if (tags && Array.isArray(tags)) {
      tags.forEach(prefTag => {
        if (room.tags.includes(prefTag)) score += 1;
      });
    }

    // capacity exact match: +2
    if (guests && room.capacity === guests) {
      score += 2;
    } 
    // capacity slightly above: +1 (capacity <= guests + 2)
    else if (guests && room.capacity <= guests + 2) {
      score += 1;
    }

    // price proximity scoring
    const price = (pricingMode === 'daily') ? room.pricePerDay : room.pricePerHour;
    if (budget) {
      const priceRatio = price / budget;
      // price within 10%: +3
      if (priceRatio >= 0.9 && priceRatio <= 1.1) {
        score += 3;
      }
      // price within 20%: +1
      else if (priceRatio >= 0.8 && priceRatio <= 1.2) {
        score += 1;
      }
    }

    // rating scoring
    // rating >= 4.5: +3, rating >= 4.0: +1
    if (room.rating >= 4.5) {
      score += 3;
    } else if (room.rating >= 4.0) {
      score += 1;
    }

    // Duration calculation for estimatedPrice
    let estimatedPrice = 0;
    if (startTime && endTime) {
        const start = parseInt(startTime.replace(':', ''), 10);
        const end = parseInt(endTime.replace(':', ''), 10);
        const hours = (Math.floor(end/100) + (end%100)/60) - (Math.floor(start/100) + (start%100)/60);
        
        if (pricingMode === 'daily') {
            estimatedPrice = room.pricePerDay; // Assuming 1 day for simplicity if daily
        } else {
            estimatedPrice = Math.round(hours * room.pricePerHour * 100) / 100;
        }
    }

    return {
      ...room.toObject(),
      matchScore: score,
      estimatedPrice,
      availableFrom: 'Now' // Simplified: In a real system, we'd search next free slots
    };
  });

  // --- Step 3: Sort and Output ---
  
  // Sort by matchScore descending
  scoredRooms.sort((a, b) => b.matchScore - a.matchScore);

  // Return top N
  return scoredRooms.slice(0, limit);
};

/**
 * Get equipment suggestions based on room type.
 */
exports.getEquipmentSuggestions = async (type) => {
  const equipmentMap = {
    'coworking_desk': [
      { id: 'desk_lamp', name: 'Ergonomic Desk Lamp', category: 'Lighting' },
      { id: 'extra_monitor', name: '27" Monitor', category: 'Peripheral' }
    ],
    'meeting_room': [
      { id: 'projector', name: '4K Projector', category: 'AV' },
      { id: 'wb', name: 'Digital Whiteboard', category: 'Collaboration' },
      { id: 'conf_phone', name: 'Conference Speakerphone', category: 'AV' }
    ],
    'fablab_workshop': [
      { id: '3d_printer', name: '3D Printer (Ultimaker)', category: 'Manufacturing' },
      { id: 'soldering', name: 'Soldering Station', category: 'Electronics' },
      { id: 'safety_kit', name: 'Safety Equipment Kit', category: 'Safety' }
    ],
    'event_hall': [
      { id: 'pa_system', name: 'PA System w/ Microphones', category: 'AV' },
      { id: 'stage_lighting', name: 'Stage Lighting Kit', category: 'Lighting' },
      { id: 'chairs_100', name: '100 Extra Chairs', category: 'Furniture' }
    ],
    'recording_studio': [
      { id: 'condenser_mic', name: 'Studio Condenser Mic', category: 'AV' },
      { id: 'headphones', name: 'Studio Monitoring Headphones', category: 'AV' }
    ]
  };

  return equipmentMap[type] || [];
};

/**
 * Get recommendations related to a specific room.
 */
exports.getRecommendationsByRoom = async ({ roomId, limit = 5 }) => {
  const room = await Room.findById(roomId);
  if (!room) return [];

  // Recommend rooms of same type or same tags
  const recommendations = await exports.getRecommendations({
    roomId,
    preferences: {
      type: room.type,
      tags: room.tags,
      capacity: room.capacity
    },
    limit: limit + 1 // +1 because the current room will likely be #1
  });

  // Filter out the current room
  return recommendations.filter(r => r._id.toString() !== roomId).slice(0, limit);
};
