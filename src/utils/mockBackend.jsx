// Mock backend service for testing frontend without actual backend
export const mockBackendService = {
  // Simulate successful registration
  register: async (userData) => {
    console.log('Mock backend: Registering user:', userData);
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate successful response
    return {
      user: {
        id: 'mock-user-' + Date.now(),
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  },

  // Simulate successful login
  login: async (credentials) => {
    console.log('Mock backend: Logging in user:', credentials);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    return {
      user: {
        id: 'mock-user-' + Date.now(),
        email: credentials.email,
        firstName: 'Mock',
        lastName: 'User',
        role: 'USER',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
      accessToken: 'mock-access-token-' + Date.now(),
      refreshToken: 'mock-refresh-token-' + Date.now(),
    };
  },

  // Simulate getting rooms
  getRooms: async () => {
    console.log('Mock backend: Getting rooms');
    
    await new Promise(resolve => setTimeout(resolve, 500));
    
    return {
      data: [
        {
          id: '1',
          name: 'Conference Room A',
          description: 'Spacious conference room with modern amenities',
          capacity: 20,
          location: 'Floor 1',
          pricePerHour: 50,
          equipment: ['Projector', 'Whiteboard', 'Video Conference'],
          images: ['/api/placeholder/300/200'],
          availability: [],
          rating: 4.5,
          reviews: [],
        },
        {
          id: '2',
          name: 'Meeting Room B',
          description: 'Cozy meeting room perfect for small teams',
          capacity: 8,
          location: 'Floor 2',
          pricePerHour: 30,
          equipment: ['TV', 'Whiteboard'],
          images: ['/api/placeholder/300/200'],
          availability: [],
          rating: 4.2,
          reviews: [],
        },
      ],
      page: 1,
      limit: 10,
      total: 2,
      totalPages: 1,
    };
  },

  getCurrentUser: async () => {
    return {
      id: 'mock-user-1',
      email: 'mock@example.com',
      firstName: 'Mock',
      lastName: 'User',
      role: 'USER',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  },
};


