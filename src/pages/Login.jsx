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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  InputAdornment
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [validationErrors, setValidationErrors] = useState({});
  const { login, error, loading, clearError } = useAuth();
  const [forgotPasswordOpen, setForgotPasswordOpen] = useState(false);
  const [forgotPasswordEmail, setForgotPasswordEmail] = useState('');
  const [forgotPasswordLoading, setForgotPasswordLoading] = useState(false);
  const [forgotPasswordError, setForgotPasswordError] = useState('');
  const [forgotPasswordSuccess, setForgotPasswordSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value.trim()
    }));
    
    // Clear errors
    if (error) clearError();
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }

    // Real-time validation
    if (name === 'email' && value) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(value)) {
        setValidationErrors(prev => ({
          ...prev,
          email: 'Please enter a valid email address'
        }));
      }
    }
  };

  const validateForm = () => {
    const errors = {};
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!formData.email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(formData.email)) {
      errors.email = 'Please enter a valid email address';
    }

    if (!formData.password) {
      errors.password = 'Password is required';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      await login(formData);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  const handleForgotPassword = async () => {
    try {
      if (!forgotPasswordEmail) {
        setForgotPasswordError('Please enter your email address');
        return;
      }

      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(forgotPasswordEmail)) {
        setForgotPasswordError('Please enter a valid email address');
        return;
      }

      setForgotPasswordLoading(true);
      setForgotPasswordError('');
      setForgotPasswordSuccess('');
      
      await authService.forgotPassword(forgotPasswordEmail);
      setForgotPasswordSuccess('Password reset instructions sent to your email');
      setTimeout(() => {
        setForgotPasswordOpen(false);
        setForgotPasswordEmail('');
        setForgotPasswordSuccess('');
      }, 3000);
    } catch (err) {
      setForgotPasswordError(err.message);
    } finally {
      setForgotPasswordLoading(false);
    }
  };

  const handleClickShowPassword = () => {
    setShowPassword(!showPassword);
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
          Login
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
              autoComplete="current-password"
              disabled={loading}
              error={!!validationErrors.password}
              helperText={validationErrors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      onMouseDown={handleMouseDownPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                onClick={() => setForgotPasswordOpen(true)}
                color="primary"
                sx={{ textTransform: 'none' }}
              >
                Forgot Password?
              </Button>
            </Box>

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
              ) : 'Login'}
            </Button>

            <Typography 
              align="center" 
              sx={{ mt: 2 }}
            >
              Don't have an account?{' '}
              <Link 
                component={RouterLink} 
                to="/signup"
                sx={{ 
                  fontWeight: 'medium',
                  '&:hover': { textDecoration: 'none' }
                }}
              >
                Sign up
              </Link>
            </Typography>
          </Box>
        </form>
      </Paper>

      {/* Forgot Password Dialog */}
      <Dialog 
        open={forgotPasswordOpen} 
        onClose={() => {
          setForgotPasswordOpen(false);
          setForgotPasswordError('');
          setForgotPasswordSuccess('');
          setForgotPasswordEmail('');
        }}
      >
        <DialogTitle>Reset Password</DialogTitle>
        <DialogContent>
          {forgotPasswordError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {forgotPasswordError}
            </Alert>
          )}
          {forgotPasswordSuccess && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {forgotPasswordSuccess}
            </Alert>
          )}
          <Typography variant="body1" sx={{ mb: 2, mt: 1 }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={forgotPasswordEmail}
            onChange={(e) => {
              setForgotPasswordEmail(e.target.value.trim());
              setForgotPasswordError('');
            }}
            disabled={forgotPasswordLoading}
            error={!!forgotPasswordError}
          />
        </DialogContent>
        <DialogActions sx={{ p: 2, pt: 1 }}>
          <Button 
            onClick={() => {
              setForgotPasswordOpen(false);
              setForgotPasswordError('');
              setForgotPasswordSuccess('');
              setForgotPasswordEmail('');
            }} 
            disabled={forgotPasswordLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleForgotPassword} 
            variant="contained" 
            disabled={!forgotPasswordEmail || forgotPasswordLoading}
          >
            {forgotPasswordLoading ? (
              <CircularProgress size={24} />
            ) : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
