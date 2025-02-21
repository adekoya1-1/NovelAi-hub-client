import { API_ENDPOINTS, getAuthHeader } from '../config/api';

const handleResponse = async (response) => {
  const data = await response.json();
  if (!response.ok) {
    // Check if it's a network error
    if (!response.status) {
      throw new Error('Network error - Unable to connect to server');
    }
    // Handle specific error cases
    switch (response.status) {
      case 400:
        throw new Error(data.message || 'Invalid request');
      case 401:
        throw new Error(data.message || 'Authentication failed');
      case 403:
        throw new Error(data.message || 'Access denied');
      case 404:
        throw new Error(data.message || 'Resource not found');
      case 429:
        throw new Error(data.message || 'Too many requests - please try again later');
      case 500:
        throw new Error(data.message || 'Server error - please try again later');
      default:
        throw new Error(data.message || 'An error occurred');
    }
  }
  return data;
};

export const authService = {
  async register(userData) {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      
      // Store token and user data only if they exist
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        throw new Error('Invalid response format');
      }
      
      return data.data;
    } catch (error) {
      console.error('Registration error:', error);
      // Check if it's a network error
      if (!error.response && !navigator.onLine) {
        throw new Error('Network error - Please check your internet connection');
      }
      throw error;
    }
  },

  async login(credentials) {
    try {
      const response = await fetch(API_ENDPOINTS.LOGIN, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      
      // Store token and user data only if they exist
      if (data.data?.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
      } else {
        throw new Error('Invalid response format');
      }
      
      return data.data;
    } catch (error) {
      console.error('Login error:', error);
      // Check if it's a network error
      if (!error.response && !navigator.onLine) {
        throw new Error('Network error - Please check your internet connection');
      }
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          ...getAuthHeader(),
        },
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  },

  async updateProfile(profileData) {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(profileData),
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      
      // Update stored user data
      if (data.data) {
        localStorage.setItem('user', JSON.stringify(data.data));
      }
      
      return data.data;
    } catch (error) {
      console.error('Update profile error:', error);
      throw error;
    }
  },

  async uploadProfilePicture(imageFile) {
    try {
      const formData = new FormData();
      formData.append('image', imageFile);

      const response = await fetch(API_ENDPOINTS.PROFILE_PICTURE, {
        method: 'POST',
        headers: {
          ...getAuthHeader(),
        },
        body: formData,
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);

      // Update stored user data with new profile picture
      if (data.data?.profilePicture) {
        const user = JSON.parse(localStorage.getItem('user'));
        user.profilePicture = data.data.profilePicture;
        localStorage.setItem('user', JSON.stringify(user));
      }
      
      return data.data;
    } catch (error) {
      console.error('Upload profile picture error:', error);
      throw error;
    }
  },

  logout() {
    try {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      // Clear any other auth-related data
      sessionStorage.clear();
    } catch (error) {
      console.error('Logout error:', error);
    }
  },

  getCurrentUser() {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user) : null;
    } catch (error) {
      console.error('Error parsing user data:', error);
      this.logout(); // Clear invalid data
      return null;
    }
  },

  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = this.getCurrentUser();
    return !!(token && user);
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Forgot password error:', error);
      throw error;
    }
  },

  async resetPassword(token, newPassword) {
    try {
      const response = await fetch(API_ENDPOINTS.RESET_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token, newPassword }),
        credentials: 'include', // Include cookies if any
      });
      
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Reset password error:', error);
      throw error;
    }
  },
};
