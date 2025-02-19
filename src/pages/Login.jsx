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
  DialogActions
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { authService } from '../services/authService';

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
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
      [name]: value
    }));
    if (error) clearError();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(formData);
    } catch (err) {
      // Error is handled by AuthContext
      console.error('Login failed:', err);
    }
  };

  const handleForgotPassword = async () => {
    try {
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

        <form onSubmit={handleSubmit}>
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
            <Typography 
              variant="body2" 
              sx={{ 
                ml: 'auto', 
                color: 'primary.main',
                cursor: 'pointer',
                '&:hover': { textDecoration: 'underline' }
              }}
              onClick={() => setForgotPasswordOpen(true)}
            >
              Forgot Password?
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
              autoComplete="current-password"
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
      <Dialog open={forgotPasswordOpen} onClose={() => setForgotPasswordOpen(false)}>
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
          <Typography variant="body1" sx={{ mb: 2 }}>
            Enter your email address and we'll send you instructions to reset your password.
          </Typography>
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            value={forgotPasswordEmail}
            onChange={(e) => setForgotPasswordEmail(e.target.value)}
            disabled={forgotPasswordLoading}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setForgotPasswordOpen(false)} disabled={forgotPasswordLoading}>
            Cancel
          </Button>
          <Button 
            onClick={handleForgotPassword} 
            variant="contained" 
            disabled={!forgotPasswordEmail || forgotPasswordLoading}
          >
            {forgotPasswordLoading ? <CircularProgress size={24} /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Login;
