import { API_ENDPOINTS, getAuthHeader } from '../config/api';

export const authService = {
  async register(userData) {
    try {
      const response = await fetch(API_ENDPOINTS.REGISTER, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Store token
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
      }
      
      return data.data;
    } catch (error) {
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
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Store token
      if (data.data.token) {
        localStorage.setItem('token', data.data.token);
        localStorage.setItem('user', JSON.stringify(data.data));
      }
      
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getProfile() {
    try {
      const response = await fetch(API_ENDPOINTS.PROFILE, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
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
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(data.data));
      
      return data.data;
    } catch (error) {
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
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);

      // Update stored user data with new profile picture
      const user = JSON.parse(localStorage.getItem('user'));
      user.profilePicture = data.data.profilePicture;
      localStorage.setItem('user', JSON.stringify(user));
      
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },

  getCurrentUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  isAuthenticated() {
    return !!localStorage.getItem('token');
  },

  async forgotPassword(email) {
    try {
      const response = await fetch(API_ENDPOINTS.FORGOT_PASSWORD, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
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
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },
};
