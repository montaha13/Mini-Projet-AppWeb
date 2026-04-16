const express = require('express');
const router = express.Router();
const recommendationController = require('../controllers/recommendation.controller');

// POST /api/recommendations/recommend
router.post('/recommend', recommendationController.recommend);

// GET /api/recommendations/equipment-suggestions
router.get('/equipment-suggestions', recommendationController.getEquipmentSuggestions);

// GET /api/recommendations/room/:roomId
router.get('/room/:roomId', recommendationController.getRecommendationsByRoom);

module.exports = router;
