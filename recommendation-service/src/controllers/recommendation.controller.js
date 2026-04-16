const recommendationService = require('../services/recommendation.service');

exports.recommend = async (req, res) => {
  try {
    const { roomId, preferences, limit } = req.body;

    if (!preferences) {
      return res.status(400).json({
        success: false,
        message: 'Preferences are required for recommendation.'
      });
    }

    const recommendations = await recommendationService.getRecommendations({
      roomId,
      preferences,
      limit: limit || 5
    });

    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error during recommendation.',
      error: error.message
    });
  }
};

exports.getEquipmentSuggestions = async (req, res) => {
  try {
    const { type } = req.query;
    
    // Normalize type (e.g., AUDITORIUM -> event_hall)
    const normalizedType = type === 'AUDITORIUM' ? 'event_hall' : type;
    
    const suggestions = await recommendationService.getEquipmentSuggestions(normalizedType);
    
    res.status(200).json(suggestions);
  } catch (error) {
    console.error('Equipment Suggestion Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching equipment suggestions',
      error: error.message
    });
  }
};

exports.getRecommendationsByRoom = async (req, res) => {
  try {
    const { roomId } = req.params;
    const { limit } = req.query;
    
    const recommendations = await recommendationService.getRecommendationsByRoom({
      roomId,
      limit: parseInt(limit) || 5
    });
    
    res.status(200).json({
      success: true,
      recommendations
    });
  } catch (error) {
    console.error('Room Recommendation Error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching room recommendations',
      error: error.message
    });
  }
};
