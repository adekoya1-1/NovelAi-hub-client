const API_BASE_URL = process.env.NODE_ENV === 'production'
  ? '/api'
  : 'http://localhost:5000/api';  // Changed from 50001 to 5000 to match server port

export const API_ENDPOINTS = {
  // Auth endpoints
  REGISTER: `${API_BASE_URL}/users/register`,
  LOGIN: `${API_BASE_URL}/users/login`,
  FORGOT_PASSWORD: `${API_BASE_URL}/users/forgot-password`,
  RESET_PASSWORD: `${API_BASE_URL}/users/reset-password`,
  PROFILE: `${API_BASE_URL}/users/profile`,
  PROFILE_PICTURE: `${API_BASE_URL}/users/profile/picture`,
  
  // Story endpoints
  STORIES: `${API_BASE_URL}/stories`,
  STORY: (id) => `${API_BASE_URL}/stories/${id}`,
  USER_STORIES: (userId) => `${API_BASE_URL}/stories/user/${userId}`,
  LIKE_STORY: (id) => `${API_BASE_URL}/stories/${id}/like`,
  COMMENT_STORY: (id) => `${API_BASE_URL}/stories/${id}/comments`,
  GENERATE_STORY: `${API_BASE_URL}/stories/generate`, // Added AI story generation endpoint
};

export const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return token ? { Authorization: `Bearer ${token}` } : {};
};
