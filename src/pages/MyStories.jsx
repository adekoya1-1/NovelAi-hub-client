import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Box,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Chip
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    fetchStories();
  }, [currentUser._id]); // Add dependency to re-fetch if user changes

  const fetchStories = async () => {
    try {
      setLoading(true);
      const response = await storyService.getUserStories(currentUser._id);
      setStories(response.stories || []);
    } catch (err) {
      setError('Failed to load your stories. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (storyId) => {
    navigate(`/story/${storyId}/edit`);
  };

  const handleDelete = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      await storyService.deleteStory(storyToDelete._id);
      setStories(stories.filter(story => story._id !== storyToDelete._id));
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    } catch (err) {
      setError('Failed to delete story. Please try again.');
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
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
          My Stories
        </Typography>
        <Button
          variant="contained"
          color="primary"
          onClick={() => navigate('/write')}
          sx={{ mb: 3 }}
        >
          Write New Story
        </Button>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 3 }}
        >
          {error}
        </Alert>
      )}

      {stories.length === 0 ? (
        <Box sx={{ 
          textAlign: 'center', 
          py: 8,
          backgroundColor: 'background.paper',
          borderRadius: 2
        }}>
          <Typography variant="h6" color="text.secondary" gutterBottom>
            You haven't written any stories yet
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            Start writing your first story now!
          </Typography>
          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/write')}
          >
            Write a Story
          </Button>
        </Box>
      ) : (
        <Grid container spacing={3}>
          {stories.map(story => (
            <Grid item xs={12} sm={6} md={4} key={story._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)'
                  }
                }}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h5" component="h2" gutterBottom>
                    {story.title}
                  </Typography>
                  <Box sx={{ mb: 2 }}>
                    <Chip 
                      label={story.genre}
                      size="small"
                      sx={{ mr: 1 }}
                    />
                    <Chip 
                      label={`${storyService.calculateReadingTime(story.content)} min read`}
                      size="small"
                    />
                  </Box>
                  <Typography color="text.secondary" sx={{ mb: 2 }}>
                    {storyService.formatStoryPreview(story.content)}
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0 }}>
                  <Button 
                    size="small"
                    onClick={() => navigate(`/story/${story._id}`)}
                  >
                    View
                  </Button>
                  <Button 
                    size="small" 
                    onClick={() => handleEdit(story._id)}
                  >
                    Edit
                  </Button>
                  <Button 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(story)}
                  >
                    Delete
                  </Button>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Story?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{storyToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
          <Button onClick={confirmDelete} color="error">Delete</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default MyStories;
