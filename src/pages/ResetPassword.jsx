import { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
  Link
} from '@mui/material';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Link as RouterLink } from 'react-router-dom';
import { authService } from '../services/authService';

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get('token');
  
  const [showPassword, setShowPassword] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const [formData, setFormData] = useState({
    newPassword: '',
    confirmPassword: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Validate token on mount
  useEffect(() => {
    if (!token) {
      setError('Invalid or missing reset token');
    }
  }, [token]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear errors
    if (error) setError('');
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    if (name === 'newPassword' && value) {
      if (value.length < 6) {
        setValidationErrors(prev => ({
          ...prev,
          newPassword: 'Password must be at least 6 characters long'
        }));
      } else if (formData.confirmPassword && value !== formData.confirmPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }

    if (name === 'confirmPassword' && value) {
      if (value !== formData.newPassword) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: 'Passwords do not match'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData.newPassword) {
      errors.newPassword = 'New password is required';
    } else if (formData.newPassword.length < 6) {
      errors.newPassword = 'Password must be at least 6 characters long';
    }

    if (!formData.confirmPassword) {
      errors.confirmPassword = 'Please confirm your password';
    } else if (formData.newPassword !== formData.confirmPassword) {
      errors.confirmPassword = 'Passwords do not match';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      setError('');
      await authService.resetPassword(token, formData.newPassword);
      setSuccess('Password reset successful! Redirecting to login...');
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err) {
      setError(err.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleClickShowPassword = (field) => {
    setShowPassword(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleMouseDownPassword = (e) => {
    e.preventDefault();
  };

  if (!token) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          action={
            <Button 
              color="inherit" 
              size="small" 
              component={RouterLink} 
              to="/login"
            >
              Back to Login
            </Button>
          }
        >
          Invalid or missing reset token. Please request a new password reset link.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="sm" sx={{ py: { xs: 4, sm: 6, md: 8 } }}>
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
          Reset Password
        </Typography>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 3 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        {success && (
          <Alert 
            severity="success" 
            sx={{ mb: 3 }}
          >
            {success}
          </Alert>
        )}

        <form onSubmit={handleSubmit} noValidate>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <TextField
              label="New Password"
              type={showPassword.newPassword ? "text" : "password"}
              name="newPassword"
              value={formData.newPassword}
              onChange={handleInputChange}
              required
              fullWidth
              autoComplete="new-password"
              disabled={loading}
              error={!!validationErrors.newPassword}
              helperText={validationErrors.newPassword || "Password must be at least 6 characters long"}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle new password visibility"
                      onClick={() => handleClickShowPassword('newPassword')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword.newPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <TextField
              label="Confirm New Password"
              type={showPassword.confirmPassword ? "text" : "password"}
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
                      onClick={() => handleClickShowPassword('confirmPassword')}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword.confirmPassword ? <VisibilityOff /> : <Visibility />}
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
              ) : 'Reset Password'}
            </Button>

            <Typography 
              align="center" 
              sx={{ mt: 2 }}
            >
              Remember your password?{' '}
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

export default ResetPassword;
