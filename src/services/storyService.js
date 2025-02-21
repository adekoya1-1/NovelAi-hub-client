import { API_ENDPOINTS, getAuthHeader } from '../config/api';

// Constants for validation
const MAX_CONTENT_LENGTH = 50000; // 50KB
const MAX_TITLE_LENGTH = 100;
const MAX_COMMENT_LENGTH = 1000;
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];

// Helper function to handle API responses
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
        throw new Error(data.message || 'Authentication required');
      case 403:
        throw new Error(data.message || 'Access denied');
      case 404:
        throw new Error(data.message || 'Story not found');
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

// Validation helpers
const validateStoryData = (storyData) => {
  if (storyData instanceof FormData) {
    const title = storyData.get('title');
    const content = storyData.get('content');
    const image = storyData.get('image');

    if (!title?.trim()) throw new Error('Title is required');
    if (title.length > MAX_TITLE_LENGTH) throw new Error(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
    if (!content?.trim()) throw new Error('Content is required');
    if (content.length > MAX_CONTENT_LENGTH) throw new Error(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
    
    if (image && image instanceof File) {
      if (!ALLOWED_IMAGE_TYPES.includes(image.type)) {
        throw new Error('Invalid image type. Allowed types: JPG, PNG, GIF');
      }
      if (image.size > MAX_IMAGE_SIZE) {
        throw new Error('Image size must be less than 5MB');
      }
    }
  } else {
    if (!storyData.title?.trim()) throw new Error('Title is required');
    if (storyData.title.length > MAX_TITLE_LENGTH) throw new Error(`Title must be less than ${MAX_TITLE_LENGTH} characters`);
    if (!storyData.content?.trim()) throw new Error('Content is required');
    if (storyData.content.length > MAX_CONTENT_LENGTH) throw new Error(`Content must be less than ${MAX_CONTENT_LENGTH} characters`);
  }
};

export const storyService = {
  async createStory(storyData) {
    try {
      validateStoryData(storyData);

      const headers = getAuthHeader();
      if (!(storyData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        storyData = JSON.stringify(storyData);
      }
      
      const response = await fetch(API_ENDPOINTS.STORIES, {
        method: 'POST',
        headers,
        body: storyData,
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Create story error:', error);
      throw error;
    }
  },

  async getStories(params = {}) {
    try {
      // Validate and sanitize params
      const sanitizedParams = {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10,
        genre: params.genre?.trim(),
        search: params.search?.trim()
      };

      const queryParams = new URLSearchParams();
      Object.entries(sanitizedParams).forEach(([key, value]) => {
        if (value) queryParams.append(key, value);
      });

      const url = `${API_ENDPOINTS.STORIES}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get stories error:', error);
      throw error;
    }
  },

  async getStoryById(id) {
    try {
      if (!id) throw new Error('Story ID is required');

      const response = await fetch(API_ENDPOINTS.STORY(id), {
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Get story error:', error);
      throw error;
    }
  },

  async updateStory(id, storyData) {
    try {
      if (!id) throw new Error('Story ID is required');
      validateStoryData(storyData);

      const headers = getAuthHeader();
      if (!(storyData instanceof FormData)) {
        headers['Content-Type'] = 'application/json';
        storyData = JSON.stringify(storyData);
      }

      const response = await fetch(API_ENDPOINTS.STORY(id), {
        method: 'PUT',
        headers,
        body: storyData,
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Update story error:', error);
      throw error;
    }
  },

  async deleteStory(id) {
    try {
      if (!id) throw new Error('Story ID is required');

      const response = await fetch(API_ENDPOINTS.STORY(id), {
        method: 'DELETE',
        headers: getAuthHeader(),
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data;
    } catch (error) {
      console.error('Delete story error:', error);
      throw error;
    }
  },

  async toggleLike(id) {
    try {
      if (!id) throw new Error('Story ID is required');

      const response = await fetch(API_ENDPOINTS.LIKE_STORY(id), {
        method: 'POST',
        headers: getAuthHeader(),
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Toggle like error:', error);
      throw error;
    }
  },

  async addComment(id, content) {
    try {
      if (!id) throw new Error('Story ID is required');
      if (!content?.trim()) throw new Error('Comment content is required');
      if (content.length > MAX_COMMENT_LENGTH) {
        throw new Error(`Comment must be less than ${MAX_COMMENT_LENGTH} characters`);
      }

      const response = await fetch(API_ENDPOINTS.COMMENT_STORY(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ content: content.trim() }),
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Add comment error:', error);
      throw error;
    }
  },

  async getUserStories(userId, params = {}) {
    try {
      if (!userId) throw new Error('User ID is required');

      // Validate and sanitize params
      const sanitizedParams = {
        page: Number(params.page) || 1,
        limit: Number(params.limit) || 10
      };

      const queryParams = new URLSearchParams(sanitizedParams);
      const url = `${API_ENDPOINTS.USER_STORIES(userId)}${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
      
      const response = await fetch(url, {
        headers: getAuthHeader(),
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      
      // Ensure we always return an array of stories
      if (!data.data) return { stories: [] };
      if (Array.isArray(data.data)) return { stories: data.data };
      if (data.data.stories) return data.data;
      return { stories: [data.data] };
    } catch (error) {
      console.error('Get user stories error:', error);
      // Return empty array on error to prevent reduce errors
      return { stories: [] };
    }
  },

  async generateAIStory(prompt) {
    try {
      if (!prompt?.trim()) throw new Error('Story prompt is required');
      if (prompt.length > 1000) throw new Error('Prompt must be less than 1000 characters');

      const response = await fetch(API_ENDPOINTS.GENERATE_STORY, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ prompt: prompt.trim() }),
        credentials: 'include'
      });
      
      const data = await handleResponse(response);
      return data.data;
    } catch (error) {
      console.error('Generate AI story error:', error);
      throw error;
    }
  },

  // Helper methods for story formatting
  formatStoryPreview(content, maxLength = 150) {
    if (!content) return '';
    content = content.trim();
    if (content.length <= maxLength) return content;
    
    // Try to end at a complete sentence
    const truncated = content.substring(0, maxLength);
    const lastPeriod = truncated.lastIndexOf('.');
    const lastQuestion = truncated.lastIndexOf('?');
    const lastExclamation = truncated.lastIndexOf('!');
    
    const lastSentenceEnd = Math.max(lastPeriod, lastQuestion, lastExclamation);
    if (lastSentenceEnd > maxLength * 0.7) { // Only use sentence end if it's not too short
      return content.substring(0, lastSentenceEnd + 1);
    }
    
    // Otherwise end at a word boundary
    const lastSpace = truncated.lastIndexOf(' ');
    return content.substring(0, lastSpace) + '...';
  },

  calculateReadingTime(content) {
    if (!content) return 1;
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.max(1, Math.ceil(wordCount / wordsPerMinute));
    return readingTime;
  }
};
