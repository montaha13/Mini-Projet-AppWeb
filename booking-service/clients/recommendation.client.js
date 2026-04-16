const axios = require('axios');

const RECOMMENDATION_SERVICE_URL = process.env.RECOMMENDATION_SERVICE_URL || 'http://localhost:3003/api/recommendations';

const recommendationClient = axios.create({
  baseURL: RECOMMENDATION_SERVICE_URL,
  timeout: 5000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Interceptor for logging requests
recommendationClient.interceptors.request.use(config => {
  console.log(`[RecommendationClient] Sending request to: ${config.url}`);
  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor for error handling
recommendationClient.interceptors.response.use(response => {
  return response;
}, error => {
  const errorMessage = error.response ? error.response.data.message : error.message;
  console.error(`[RecommendationClient] Error: ${errorMessage}`);
  return Promise.reject(new Error(errorMessage));
});

/**
 * Fetch room recommendations based on user preferences.
 * 
 * @param {Object} params - { roomId, preferences, limit }
 * @returns {Promise<Array>} - List of recommended rooms.
 */
const getRecommendations = async ({ roomId, preferences, limit }) => {
  try {
    const response = await recommendationClient.post('/recommend', {
      roomId,
      preferences,
      limit
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

module.exports = {
  getRecommendations
};
