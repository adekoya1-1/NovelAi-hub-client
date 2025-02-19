import { API_ENDPOINTS, getAuthHeader } from '../config/api';

export const storyService = {
  async createStory(storyData) {
    try {
      const response = await fetch(API_ENDPOINTS.STORIES, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(storyData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getStories(params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_ENDPOINTS.STORIES}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url);
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getStoryById(id) {
    try {
      const response = await fetch(API_ENDPOINTS.STORY(id));
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async updateStory(id, storyData) {
    try {
      const response = await fetch(API_ENDPOINTS.STORY(id), {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify(storyData),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async deleteStory(id) {
    try {
      const response = await fetch(API_ENDPOINTS.STORY(id), {
        method: 'DELETE',
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data;
    } catch (error) {
      throw error;
    }
  },

  async toggleLike(id) {
    try {
      const response = await fetch(API_ENDPOINTS.LIKE_STORY(id), {
        method: 'POST',
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

  async addComment(id, content) {
    try {
      const response = await fetch(API_ENDPOINTS.COMMENT_STORY(id), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ content }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  async getUserStories(userId, params = {}) {
    try {
      const queryParams = new URLSearchParams(params).toString();
      const url = `${API_ENDPOINTS.USER_STORIES(userId)}${queryParams ? `?${queryParams}` : ''}`;
      
      const response = await fetch(url, {
        headers: {
          ...getAuthHeader(),
        },
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data.stories ? data.data : { stories: data.data };
    } catch (error) {
      throw error;
    }
  },

  async generateAIStory(prompt) {
    try {
      const response = await fetch(`${API_ENDPOINTS.STORIES}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeader(),
        },
        body: JSON.stringify({ prompt }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message);
      return data.data;
    } catch (error) {
      throw error;
    }
  },

  // Helper methods for story formatting
  formatStoryPreview(content, maxLength = 150) {
    if (!content) return '';
    if (content.length <= maxLength) return content;
    return content.substring(0, maxLength).trim() + '...';
  },

  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.trim().split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime;
  }
};
