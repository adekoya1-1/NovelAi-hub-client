import { Navigate, useLocation } from 'react-router-dom';
import { Box, CircularProgress, Typography, Button } from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { useEffect, useState } from 'react';

const PrivateRoute = ({ children }) => {
  const { currentUser, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  const [retryCount, setRetryCount] = useState(0);
  const [error, setError] = useState(null);

  // Effect to handle user data refresh
  useEffect(() => {
    let timeoutId;

    const refreshUserData = async () => {
      try {
        if (isAuthenticated() && !currentUser && retryCount < 3) {
          // Wait for a short delay before retrying
          timeoutId = setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 1000);
        } else if (retryCount >= 3) {
          setError('Failed to load user data. Please try logging in again.');
        }
      } catch (err) {
        console.error('Error refreshing user data:', err);
        setError('An error occurred while loading user data.');
      }
    };

    refreshUserData();

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isAuthenticated, currentUser, retryCount]);

  // Show loading spinner while checking auth state
  if (loading) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading...
        </Typography>
      </Box>
    );
  }

  // If not authenticated, redirect to login with return URL
  if (!isAuthenticated()) {
    // Store the current location for redirect after login
    return (
      <Navigate 
        to="/login" 
        state={{ from: location.pathname }}
        replace 
      />
    );
  }

  // Handle error state when user data refresh fails
  if (error) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 3,
          p: 3,
          textAlign: 'center'
        }}
      >
        <Typography variant="h6" color="error">
          {error}
        </Typography>
        <Button 
          variant="contained" 
          color="primary"
          onClick={() => {
            // Clear error and retry count
            setError(null);
            setRetryCount(0);
          }}
        >
          Retry
        </Button>
        <Button 
          variant="outlined"
          color="primary"
          onClick={() => {
            // Navigate to login with current location as return URL
            window.location.href = `/login?redirect=${encodeURIComponent(location.pathname)}`;
          }}
        >
          Back to Login
        </Button>
      </Box>
    );
  }

  // If authenticated but no user data, show loading state
  if (isAuthenticated() && !currentUser && retryCount < 3) {
    return (
      <Box 
        sx={{ 
          display: 'flex', 
          flexDirection: 'column',
          justifyContent: 'center', 
          alignItems: 'center', 
          minHeight: '100vh',
          gap: 2,
          p: 3
        }}
      >
        <CircularProgress />
        <Typography variant="body1" color="text.secondary">
          Loading user data... (Attempt {retryCount + 1}/3)
        </Typography>
      </Box>
    );
  }

  // If we have both authentication and user data, render the protected route
  if (isAuthenticated() && currentUser) {
    return children;
  }

  // Fallback redirect to login
  return (
    <Navigate 
      to="/login" 
      state={{ from: location.pathname }}
      replace 
    />
  );
};

export default PrivateRoute;
