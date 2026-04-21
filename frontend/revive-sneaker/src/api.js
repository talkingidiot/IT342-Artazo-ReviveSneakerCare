// API Configuration
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

// Log API URL for debugging
console.log('API Base URL:', API_BASE_URL);

// Auth API calls
export const authAPI = {
  login: async (email, password) => {
    try {
      console.log('Logging in with:', email);
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      console.log('Login response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Login error response:', errorData);
        throw new Error(errorData.message || `Login failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Login successful, received data:', data);
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role
        }));
        console.log('User stored in localStorage:', data);
      } else {
        console.warn('No token received in login response');
      }
      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  },

  register: async (name, email, password) => {
    try {
      console.log('Registering user:', email);
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
      });

      console.log('Register response status:', response.status);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error('Register error response:', errorData);
        throw new Error(errorData.message || `Registration failed: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Register successful, received data:', data);
      
      // Store token if provided
      if (data.token) {
        localStorage.setItem('authToken', data.token);
        localStorage.setItem('user', JSON.stringify({
          name: data.name,
          email: data.email,
          role: data.role
        }));
        console.log('User stored in localStorage:', data);
      } else {
        console.warn('No token received in register response');
      }
      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  },

  logout: () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    console.log('User logged out');
  },

  getAuthToken: () => {
    return localStorage.getItem('authToken');
  },

  getCurrentUser: () => {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('authToken');
  },

  // Test connection to backend
  testConnection: async () => {
    try {
      console.log('Testing connection to:', `${API_BASE_URL}/health`);
      const response = await fetch(`${API_BASE_URL}/health`);
      const status = response.status;
      console.log('Health check status:', status);
      return { connected: response.ok, status };
    } catch (error) {
      console.error('Connection test failed:', error);
      return { connected: false, error: error.message };
    }
  }
};

export const adminAPI = {
  getOrders: async () => {
    const token = authAPI.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const response = await fetch(`${API_BASE_URL}/admin/orders`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to load orders: ${response.statusText}`);
    }

    return response.json();
  },

  getMonthlySales: async (month) => {
    const token = authAPI.getAuthToken();
    if (!token) {
      throw new Error('Not authenticated');
    }

    const params = new URLSearchParams();
    if (month) {
      params.set('month', month);
    }

    const response = await fetch(`${API_BASE_URL}/admin/orders/sales/monthly?${params.toString()}`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Failed to load monthly sales: ${response.statusText}`);
    }

    return response.json();
  },
};
