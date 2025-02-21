import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Container,
  Typography,
  Box,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Chip,
  Divider,
  IconButton,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Skeleton,
  Tooltip
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const ViewStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [story, setStory] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [likeLoading, setLikeLoading] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [imageError, setImageError] = useState(false);

  const fetchStory = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const fetchedStory = await storyService.getStoryById(id);
      setStory(fetchedStory);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError(err.message || 'Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login', { state: { from: `/story/${id}` } });
      return;
    }

    try {
      setLikeLoading(true);
      setError('');
      const result = await storyService.toggleLike(id);
      setStory(prev => ({
        ...prev,
        likes: result.isLiked 
          ? [...prev.likes, currentUser._id]
          : prev.likes.filter(likeId => likeId !== currentUser._id)
      }));
    } catch (err) {
      console.error('Error toggling like:', err);
      setError(err.message || 'Failed to update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      await storyService.deleteStory(id);
      navigate('/my-stories', { replace: true });
    } catch (err) {
      console.error('Error deleting story:', err);
      setError(err.message || 'Failed to delete story. Please try again.');
      setDeleteDialogOpen(false);
    } finally {
      setDeleteLoading(false);
    }
  };

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
          <Skeleton variant="text" sx={{ fontSize: '3rem', mb: 2 }} />
          <Skeleton variant="rectangular" height={200} sx={{ mb: 3 }} />
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Skeleton variant="rounded" width={100} height={32} />
            <Skeleton variant="rounded" width={100} height={32} />
          </Box>
          <Skeleton variant="text" sx={{ fontSize: '1rem', mb: 2 }} />
          <Skeleton variant="text" sx={{ fontSize: '1rem' }} count={5} />
        </Paper>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert 
          severity="error" 
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchStory}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  if (!story) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Story not found.</Alert>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => navigate(-1)} 
          sx={{ mt: 2 }}
        >
          Go Back
        </Button>
      </Container>
    );
  }

  const isAuthor = currentUser && story.author._id === currentUser._id;
  const isLiked = story.likes && story.likes.includes(currentUser?._id);

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
          <Box sx={{ mb: 3 }}>
            <Typography 
              variant="h3" 
              component="h1"
              sx={{ 
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
                fontWeight: 'bold',
                mb: 2
              }}
            >
              {story.title}
            </Typography>

            {story.image && !imageError && (
              <Box sx={{ 
                mt: 3, 
                mb: 4,
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                position: 'relative'
              }}>
                <img 
                  src={story.image} 
                  alt={story.title}
                  onError={() => setImageError(true)}
                  style={{ 
                    maxWidth: '100%',
                    maxHeight: '400px',
                    objectFit: 'contain',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                  }}
                />
              </Box>
            )}
          </Box>
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3, flexWrap: 'wrap' }}>
            <Chip 
              label={story.genre}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`${storyService.calculateReadingTime(story.content)} min read`}
              variant="outlined"
            />
            {story.isAIGenerated && (
              <Chip 
                label="AI Generated"
                color="secondary"
                variant="outlined"
              />
            )}
          </Box>

          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: 2,
            flexWrap: 'wrap'
          }}>
            <Typography variant="subtitle1" color="text.secondary">
              By {story.author.username}
            </Typography>
            
            <Box sx={{ ml: 'auto', display: 'flex', gap: 1 }}>
              <Tooltip title={currentUser ? (isLiked ? 'Unlike' : 'Like') : 'Login to like'}>
                <IconButton 
                  onClick={handleLike}
                  disabled={likeLoading}
                  color="primary"
                >
                  <Badge badgeContent={story.likes.length} color="primary">
                    {isLiked ? (
                      <FavoriteIcon color="primary" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </Badge>
                </IconButton>
              </Tooltip>

              {isAuthor && (
                <>
                  <Tooltip title="Edit story">
                    <IconButton 
                      onClick={() => navigate(`/story/${id}/edit`)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete story">
                    <IconButton 
                      onClick={() => setDeleteDialogOpen(true)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </>
              )}
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography 
          component="div" 
          sx={{ 
            whiteSpace: 'pre-wrap',
            lineHeight: 1.8,
            fontSize: '1.1rem'
          }}
        >
          {story.content}
        </Typography>

        <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBackIcon />}
            onClick={() => navigate(-1)}
          >
            Back
          </Button>
          {isAuthor && (
            <Button
              variant="contained"
              component={Link}
              to="/my-stories"
            >
              My Stories
            </Button>
          )}
        </Box>
      </Paper>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Story</DialogTitle>
        <DialogContent>
          Are you sure you want to delete this story? This action cannot be undone.
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleDelete}
            color="error"
            disabled={deleteLoading}
            startIcon={deleteLoading ? <CircularProgress size={20} /> : null}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default ViewStory;
