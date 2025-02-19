import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
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
  Badge
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
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

  useEffect(() => {
    fetchStory();
  }, [id]);

  const fetchStory = async () => {
    try {
      setLoading(true);
      const fetchedStory = await storyService.getStoryById(id);
      setStory(fetchedStory);
    } catch (err) {
      setError('Failed to load story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async () => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    try {
      setLikeLoading(true);
      const result = await storyService.toggleLike(id);
      setStory(prev => ({
        ...prev,
        likes: result.isLiked 
          ? [...prev.likes, currentUser._id]
          : prev.likes.filter(id => id !== currentUser._id)
      }));
    } catch (err) {
      setError('Failed to update like. Please try again.');
    } finally {
      setLikeLoading(false);
    }
  };

  const handleEdit = () => {
    navigate(`/story/${id}/edit`);
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
        <Button onClick={() => navigate(-1)}>Go Back</Button>
      </Container>
    );
  }

  if (!story) {
    return (
      <Container maxWidth="md" sx={{ py: 4 }}>
        <Alert severity="info">Story not found.</Alert>
        <Button onClick={() => navigate(-1)} sx={{ mt: 2 }}>Go Back</Button>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Paper elevation={2} sx={{ p: { xs: 3, md: 4 }, borderRadius: 2 }}>
        <Box sx={{ mb: 4 }}>
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
          
          <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
            <Chip 
              label={story.genre}
              color="primary"
              variant="outlined"
            />
            <Chip 
              label={`${storyService.calculateReadingTime(story.content)} min read`}
              variant="outlined"
            />
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="subtitle1" color="text.secondary">
              By {story.author.username}
            </Typography>
            <IconButton 
              onClick={handleLike}
              disabled={likeLoading}
              color="primary"
              sx={{ ml: 'auto' }}
            >
              <Badge badgeContent={story.likes ? story.likes.length : 0} color="primary">
                {story.likes && story.likes.includes(currentUser?._id) ? (
                  <FavoriteIcon color="primary" />
                ) : (
                  <FavoriteBorderIcon />
                )}
              </Badge>
            </IconButton>
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

        {currentUser && story.author._id === currentUser._id && (
          <Box sx={{ mt: 4, display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              onClick={handleEdit}
            >
              Edit Story
            </Button>
            <Button
              variant="outlined"
              onClick={() => navigate('/my-stories')}
            >
              Back to My Stories
            </Button>
          </Box>
        )}
      </Paper>
    </Container>
  );
};

export default ViewStory;
