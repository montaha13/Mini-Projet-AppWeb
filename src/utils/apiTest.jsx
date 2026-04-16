// Simple API test to check backend connection
export const testBackendConnection = async () => {
  try {
    // Test if backend is reachable
    const response = await fetch('/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
      }),
    });
    
    console.log('Backend response status:', response.status);
    console.log('Backend response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Backend response body:', text);
    
    return { status: response.status, body: text };
  } catch (error) {
    console.error('Backend connection error:', error);
    return { error: error.message };
  }
};

// Test direct connection to backend (bypass proxy)
export const testDirectBackendConnection = async () => {
  try {
    console.log('Testing direct connection to backend...');
    const response = await fetch('http://localhost:8080/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        firstName: 'Test',
        lastName: 'User',
        email: 'test@example.com',
        password: 'test123',
      }),
    });
    
    console.log('Direct backend response status:', response.status);
    console.log('Direct backend response headers:', [...response.headers.entries()]);
    
    const text = await response.text();
    console.log('Direct backend response body:', text);
    
    return { status: response.status, body: text };
  } catch (error) {
    console.error('Direct backend connection error:', error);
    return { error: error.message };
  }
};

// Test if backend is running at all
export const testBackendHealth = async () => {
  try {
    console.log('Testing backend health...');
    const response = await fetch('http://localhost:8080/');
    console.log('Backend health status:', response.status);
    const text = await response.text();
    console.log('Backend health response:', text);
    return { status: response.status, body: text };
  } catch (error) {
    console.error('Backend health error:', error);
    return { error: error.message };
  }
};


