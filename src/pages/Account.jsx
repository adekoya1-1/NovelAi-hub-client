import { useState, useEffect, useCallback } from 'react';
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
  CardContent,
  Avatar
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const Account = () => {
  const { currentUser, updateProfile, updateProfilePicture } = useAuth();
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
  const [statsLoading, setStatsLoading] = useState(true);

  const calculateStats = useCallback((stories) => {
    if (!Array.isArray(stories)) return { totalStories: 0, totalLikes: 0, totalWords: 0 };

    return stories.reduce((acc, story) => {
      // Count story
      acc.totalStories += 1;

      // Count likes
      if (Array.isArray(story.likes)) {
        acc.totalLikes += story.likes.length;
      }

      // Count words
      if (story.content) {
        const words = story.content.trim().split(/\s+/);
        acc.totalWords += words.length;
      }

      return acc;
    }, {
      totalStories: 0,
      totalLikes: 0,
      totalWords: 0
    });
  }, []);

  const fetchUserStats = useCallback(async () => {
    if (!currentUser?._id) return;

    try {
      setStatsLoading(true);
      setError('');
      const { stories } = await storyService.getUserStories(currentUser._id);
      const calculatedStats = calculateStats(stories);
      setStats(calculatedStats);
    } catch (err) {
      console.error('Failed to load user statistics:', err);
      setError('Failed to load user statistics');
    } finally {
      setStatsLoading(false);
    }
  }, [currentUser?._id, calculateStats]);

  useEffect(() => {
    fetchUserStats();
  }, [fetchUserStats]);

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
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError('Image size should be less than 5MB');
        return;
      }
      if (!['image/jpeg', 'image/png', 'image/gif'].includes(file.type)) {
        setError('Please upload a valid image file (JPEG, PNG, or GIF)');
        return;
      }
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
      setError('');
    }
  };

  const handleImageUpload = async () => {
    if (!selectedImage) return;

    try {
      setImageUploading(true);
      setError('');
      await updateProfilePicture(selectedImage);
      setSuccess('Profile picture updated successfully');
      setSelectedImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error('Failed to update profile picture:', err);
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
      setError('');
      await updateProfile({
        username: formData.username.trim(),
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
      console.error('Failed to update profile:', err);
      setError(err.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const renderProfileInfo = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 3 }}>
        <Avatar
          sx={{
            width: 120,
            height: 120,
            border: '2px solid',
            borderColor: 'primary.main',
            fontSize: '3rem',
            bgcolor: 'grey.200',
            color: 'grey.700'
          }}
        >
          {currentUser.username.charAt(0).toUpperCase()}
        </Avatar>
        {!showEditForm && (
          <Button
            variant="outlined"
            onClick={() => setShowEditForm(true)}
            startIcon={<EditIcon />}
          >
            Edit Profile
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
            <Avatar
              src={imagePreview}
              alt="Profile Preview"
              sx={{
                width: 150,
                height: 150,
                border: '2px solid',
                borderColor: 'primary.main',
                cursor: 'pointer',
                fontSize: '3.5rem',
                bgcolor: 'grey.200',
                color: 'grey.700',
                '&:hover': {
                  opacity: 0.8
                }
              }}
            >
              {currentUser.username.charAt(0).toUpperCase()}
            </Avatar>
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
          <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ position: 'relative' }}
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
              ) : 'Save Changes'}
            </Button>
            <Button
              variant="outlined"
              onClick={() => {
                setShowEditForm(false);
                setError('');
                setSuccess('');
              }}
              disabled={loading}
            >
              Cancel
            </Button>
          </Box>
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
              {statsLoading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
                  <CircularProgress size={24} />
                </Box>
              ) : (
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
              )}
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
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
        </Grid>
      </Grid>
    </Container>
  );
};

export default Account;
