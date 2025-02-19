import { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  TextField,
  Button,
  Box,
  Alert,
  CircularProgress,
  Divider,
  Grid,
  Card,
  CardContent
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';
import { authService } from '../services/authService';

const Account = () => {
  const { currentUser, updateProfile, updateProfilePicture, logout } = useAuth();
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageUploading, setImageUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: currentUser?.username || '',
    email: currentUser?.email || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [stats, setStats] = useState({
    totalStories: 0,
    totalLikes: 0,
    totalWords: 0
  });

  useEffect(() => {
    fetchUserStats();
  }, []);

  const fetchUserStats = async () => {
    try {
      const stories = await storyService.getUserStories(currentUser._id);
      const totalStories = stories.length;
      const totalLikes = stories.reduce((sum, story) => sum + (story.likes?.length || 0), 0);
      const totalWords = stories.reduce((sum, story) => sum + (story.wordCount || 0), 0);
      
      setStats({
        totalStories,
        totalLikes,
        totalWords
      });
    } catch (err) {
      setError('Failed to load user statistics');
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
    if (success) setSuccess('');
  };

  const validateForm = () => {
    if (formData.newPassword && formData.newPassword.length < 6) {
      setError('New password must be at least 6 characters long');
      return false;
    }
    if (formData.newPassword !== formData.confirmPassword) {
      setError('New passwords do not match');
      return false;
    }
    return true;
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setImageUploading(true);
      await updateProfilePicture(selectedImage);
      setSuccess('Profile picture updated successfully');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      setError(err.message || 'Failed to update profile picture');
    } finally {
      setImageUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setLoading(true);
      await updateProfile({
        username: formData.username,
        currentPassword: formData.currentPassword,
        newPassword: formData.newPassword
      });
      setSuccess('Profile updated successfully');
      setFormData(prev => ({
        ...prev,
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      }));
      setShowEditForm(false);
    } catch (err) {
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileInfo = () => (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
              <Box
                component="img"
                src={currentUser.profilePicture}
                alt="Profile"
                sx={{
                  width: 120,
                  height: 120,
                  borderRadius: '50%',
                  objectFit: 'cover',
                  border: '2px solid',
                  borderColor: 'primary.main'
                }}
              />
              {!showEditForm && (
                <Button
                  variant="outlined"
                  onClick={() => setShowEditForm(true)}
                  startIcon={<EditIcon />}
                >
                  Change Picture
                </Button>
              )}
            </Box>
            <Box>
              <Typography color="text.secondary" gutterBottom>
                Username
              </Typography>
              <Typography variant="h6">
                {currentUser.username}
              </Typography>
            </Box>
            <Box>
              <Typography color="text.secondary" gutterBottom>
                Email
              </Typography>
              <Typography variant="h6">
                {currentUser.email}
              </Typography>
            </Box>
          </Box>
  );

  const renderEditForm = () => (
    <>
      {error && (
        <Alert severity="error" onClose={() => setError('')} sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      {success && (
        <Alert severity="success" onClose={() => setSuccess('')} sx={{ mb: 3 }}>
          {success}
        </Alert>
      )}
                <Box sx={{ mb: 4 }}>
                  <input
                    accept="image/*"
                    style={{ display: 'none' }}
                    id="profile-picture-input"
                    type="file"
                    onChange={handleImageChange}
                  />
                  <label htmlFor="profile-picture-input">
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                      <Box
                        component="img"
                        src={imagePreview || currentUser.profilePicture}
                        alt="Profile Preview"
                        sx={{
                          width: 150,
                          height: 150,
                          borderRadius: '50%',
                          objectFit: 'cover',
                          border: '2px solid',
                          borderColor: 'primary.main',
                          cursor: 'pointer',
                          '&:hover': {
                            opacity: 0.8
                          }
                        }}
                      />
                      <Button
                        component="span"
                        variant="outlined"
                        disabled={imageUploading}
                      >
                        Choose New Picture
                      </Button>
                    </Box>
                  </label>
                  {selectedImage && !imageUploading && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <Button
                        variant="contained"
                        onClick={handleImageUpload}
                        disabled={imageUploading}
                      >
                        Upload Picture
                      </Button>
                    </Box>
                  )}
                  {imageUploading && (
                    <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                      <CircularProgress size={24} />
                    </Box>
                  )}
                </Box>
                <form onSubmit={handleSubmit}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          <TextField
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleInputChange}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            disabled
            fullWidth
            helperText="Email cannot be changed"
          />
          <Divider sx={{ my: 2 }}>
            <Typography variant="body2" color="text.secondary">
              Change Password
            </Typography>
          </Divider>
          <TextField
            label="Current Password"
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleInputChange}
            fullWidth
            disabled={loading}
          />
          <TextField
            label="New Password"
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleInputChange}
            fullWidth
            disabled={loading}
            helperText="Leave blank to keep current password"
          />
          <TextField
            label="Confirm New Password"
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleInputChange}
            fullWidth
            disabled={loading}
          />
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            disabled={loading}
            sx={{ mt: 2, py: 1.5, position: 'relative' }}
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
            ) : 'Update Profile'}
          </Button>
        </Box>
      </form>
    </>
  );

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Typography 
        variant="h3" 
        component="h1"
        sx={{ 
          fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
          fontWeight: 'bold',
          mb: 4
        }}
      >
        Account Settings
      </Typography>

      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Statistics
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Stories
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalStories}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Likes
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalLikes}
                  </Typography>
                </Box>
                <Box>
                  <Typography color="text.secondary" gutterBottom>
                    Total Words Written
                  </Typography>
                  <Typography variant="h4">
                    {stats.totalWords.toLocaleString()}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5">
                Profile Information
              </Typography>
              <Button
                variant="outlined"
                onClick={() => setShowEditForm(prev => !prev)}
                startIcon={showEditForm ? null : <EditIcon />}
              >
                {showEditForm ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>
            {showEditForm ? renderEditForm() : renderProfileInfo()}
          </Paper>
          <Button
            variant="contained"
            color="primary"
            size="large"
            onClick={logout}
            sx={{ py: 1.5 }}
          >
            Logout
          </Button>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Account;
