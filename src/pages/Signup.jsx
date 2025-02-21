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
  CircularProgress,
  IconButton,
  InputAdornment,
  FormHelperText
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { register, error, loading, clearError } = useAuth();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear errors when user types
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    if (name === 'password' || name === 'confirmPassword') {
      if (name === 'password' && value.length > 0 && value.length < 6) {
        setValidationErrors(prev => ({
          ...prev,
          password: 'Password must be at least 6 characters long'
        }));
      }
      if (name === 'confirmPassword' && value !== formData.password) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }
    if (name === 'username' && value) {
      const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;
      if (!usernameRegex.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          username: 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const usernameRegex = /^[a-zA-Z0-9_-]{3,20}$/;

    if (!formData.username) {
      errors.username = 'Username is required';
    } else if (!usernameRegex.test(formData.username)) {
      errors.username = 'Username must be 3-20 characters and can only contain letters, numbers, underscores, and hyphens';
    }

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      errors.password = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
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

  const handleClickShowPassword = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
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

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={clearError}
          >
            {error}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
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
              error={!!validationErrors.username}
              helperText={validationErrors.username}
              inputProps={{
                'aria-label': 'Username',
                maxLength: 20
              }}
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
              error={!!validationErrors.email}
              helperText={validationErrors.email}
              inputProps={{
                'aria-label': 'Email address'
              }}
            />

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
              error={!!validationErrors.password}
              helperText={validationErrors.password || "Password must be at least 6 characters long"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={() => handleClickShowPassword('password')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm Password"
              type={showConfirmPassword ? "text" : "password"}
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="new-password"
              disabled={loading}
              error={!!validationErrors.confirmPassword}
              helperText={validationErrors.confirmPassword}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle confirm password visibility"
                      onClick={() => handleClickShowPassword('confirm')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
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
