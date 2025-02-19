import { useState } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Link,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationError, setValidationError] = useState('');
  const { register, error, loading, clearError } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) clearError();
    if (validationError) setValidationError('');
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match');
      return false;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters long');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await register({
        username: formData.username,
        email: formData.email,
        password: formData.password
      });
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Registration failed:', err);
    }
  };

  return (
    <Container 
      maxWidth="sm" 
      sx={{ 
        py: { xs: 4, sm: 6, md: 8 },
        px: { xs: 2, sm: 3 }
      }}
    >
      <Paper 
        elevation={3} 
        sx={{ 
          p: { xs: 3, sm: 4 },
          borderRadius: { xs: 2, sm: 3 }
        }}
      >
        <Typography 
          variant="h4" 
          component="h1" 
          gutterBottom 
          align="center"
          sx={{ 
            fontSize: { xs: '1.75rem', sm: '2.125rem' },
            fontWeight: 'bold',
            mb: { xs: 3, sm: 4 }
          }}
        >
          Sign Up
        </Typography>

        {(error || validationError) && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => {
              clearError();
              setValidationError('');
            }}
          >
            {error || validationError}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="Username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="username"
              disabled={loading}
            />

            <TextField
              label="Email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="email"
              disabled={loading}
            />

            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                checked={showPassword}
                onChange={() => setShowPassword(prev => !prev)}
              />
              <Typography variant="body2" sx={{ ml: 1 }}>
                Show Password
              </Typography>
            </Box>
            <TextField
              label="Password"
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="new-password"
              disabled={loading}
              helperText="Password must be at least 6 characters long"
            />
            <TextField
              label="Confirm Password"
              type={showPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="new-password"
              disabled={loading}
            />

            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              fullWidth
              disabled={loading}
              sx={{ 
                mt: 2,
                py: 1.5,
                position: 'relative'
              }}
            >
              {loading ? (
                <CircularProgress 
                  size={24} 
                  sx={{ 
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    marginTop: '-12px',
                    marginLeft: '-12px'
                  }}
                />
              ) : 'Sign Up'}
            </Button>

            <Typography 
              align="center" 
              sx={{ mt: 2 }}
            >
              Already have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/login"
                sx={{ 
                  fontWeight: 'medium',
                  '&:hover': { textDecoration: 'none' }
                }}
              >
                Login
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>
    </Container>
  );
};

export default Signup;
