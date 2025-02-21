import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Verify token and user data on mount
  useEffect(() => {
    const verifyAuth = async () => {
      try {
        const token = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          try {
            const user = JSON.parse(storedUser);
            // Verify token is still valid by making a request
            await authService.getProfile();
            setCurrentUser(user);
          } catch (err) {
            console.error('Invalid stored user data:', err);
            // Clear invalid auth state
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        }
      } catch (err) {
        console.error('Auth verification failed:', err);
        // Clear invalid auth state
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();
  }, []);

  const handleAuthError = useCallback((error) => {
    if (error.message.includes('Session expired') || error.message.includes('Invalid token')) {
      logout();
      setError('Your session has expired. Please login again.');
      navigate('/login');
    } else {
      setError(error.message);
    }
  }, [navigate]);

  const register = async (userData) => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.register(userData);
      setCurrentUser(user);
      navigate('/');
      return user;
    } catch (err) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setError(null);
      setLoading(true);
      const user = await authService.login(credentials);
      setCurrentUser(user);
      navigate('/');
      return user;
    } catch (err) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setCurrentUser(null);
    setError(null);
  }, []);

  const updateProfile = async (profileData) => {
    try {
      setError(null);
      setLoading(true);
      const updatedUser = await authService.updateProfile(profileData);
      setCurrentUser(updatedUser);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return updatedUser;
    } catch (err) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const updateProfilePicture = async (imageFile) => {
    try {
      setError(null);
      setLoading(true);
      const result = await authService.uploadProfilePicture(imageFile);
      const updatedUser = {
        ...currentUser,
        profilePicture: result.profilePicture
      };
      setCurrentUser(updatedUser);
      // Update stored user data
      localStorage.setItem('user', JSON.stringify(updatedUser));
      return result;
    } catch (err) {
      handleAuthError(err);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useCallback(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user && currentUser);
  }, [currentUser]);

  const value = {
    currentUser,
    loading,
    error,
    register,
    login,
    logout,
    updateProfile,
    updateProfilePicture,
    clearError,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
