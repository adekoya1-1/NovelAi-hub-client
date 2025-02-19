import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Typography,
  TextField,
  Button,
  Stack,
  Paper,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Alert,
  Chip,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions
} from '@mui/material';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [story, setStory] = useState({
    title: '',
    genre: '',
    content: ''
  });
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialStory, setInitialStory] = useState(null);

  useEffect(() => {
    const fetchStory = async () => {
      try {
        const fetchedStory = await storyService.getStoryById(id);
        // Verify that the current user is the author
        if (fetchedStory.author._id !== currentUser?._id) {
          navigate('/');
          return;
        }
        const storyData = {
          title: fetchedStory.title,
          genre: fetchedStory.genre,
          content: fetchedStory.content
        };
        setStory(storyData);
        setInitialStory(storyData);
        const words = fetchedStory.content.trim().split(/\s+/).filter(word => word.length > 0);
        setWordCount(words.length);
      } catch (err) {
        setError('Failed to load story. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchStory();
  }, [id, currentUser, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setStory(prev => ({
      ...prev,
      [name]: value
    }));

    if (name === 'content') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }

    if (error) setError('');
  };

  const validateStory = () => {
    if (!story.title.trim()) {
      setError('Please provide a title for your story');
      return false;
    }
    if (!story.genre) {
      setError('Please select a genre for your story');
      return false;
    }
    if (wordCount < 100) {
      setError('Story must be at least 100 words long');
      return false;
    }
    return true;
  };

  const handleSubmit = async () => {
    if (!validateStory()) return;
    
    try {
      setLoading(true);
      const updatedStory = await storyService.updateStory(id, {
        title: story.title,
        genre: story.genre,
        content: story.content
      });
      navigate(`/story/${updatedStory._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (
      story.title !== initialStory.title ||
      story.genre !== initialStory.genre ||
      story.content !== initialStory.content
    ) {
      setShowConfirmDialog(true);
    } else {
      navigate(`/story/${id}`);
    }
  };

  if (initialLoading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  return (
    <Container 
      maxWidth="md" 
      sx={{ 
        py: { xs: 4, md: 8 },
        px: { xs: 2, sm: 3, md: 4 }
      }}
    >
      <Stack spacing={{ xs: 3, md: 4 }}>
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          flexDirection: { xs: 'column', sm: 'row' },
          gap: { xs: 2, sm: 0 }
        }}>
          <Typography 
            variant="h3" 
            component="h1"
            sx={{ 
              fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
              fontWeight: 'bold'
            }}
          >
            Edit Story
          </Typography>
          <Chip 
            label={`${wordCount} words`}
            color="primary"
            variant="outlined"
            size="medium"
            sx={{ 
              fontSize: { xs: '0.875rem', sm: '1rem' },
              height: { xs: 28, sm: 32 }
            }}
          />
        </Box>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <TextField
          label="Story Title"
          name="title"
          value={story.title}
          onChange={handleInputChange}
          fullWidth
          required
          disabled={loading}
          sx={{ backgroundColor: 'white' }}
        />

        <FormControl fullWidth required>
          <InputLabel>Genre</InputLabel>
          <Select
            name="genre"
            value={story.genre}
            onChange={handleInputChange}
            label="Genre"
            disabled={loading}
            sx={{ backgroundColor: 'white' }}
          >
            <MenuItem value="fantasy">Fantasy</MenuItem>
            <MenuItem value="romance">Romance</MenuItem>
            <MenuItem value="mystery">Mystery</MenuItem>
            <MenuItem value="science-fiction">Science Fiction</MenuItem>
            <MenuItem value="horror">Horror</MenuItem>
            <MenuItem value="thriller">Thriller</MenuItem>
            <MenuItem value="historical-fiction">Historical Fiction</MenuItem>
            <MenuItem value="adventure">Adventure</MenuItem>
            <MenuItem value="young-adult">Young Adult</MenuItem>
            <MenuItem value="literary-fiction">Literary Fiction</MenuItem>
            <MenuItem value="dystopian">Dystopian</MenuItem>
            <MenuItem value="paranormal">Paranormal</MenuItem>
            <MenuItem value="contemporary">Contemporary</MenuItem>
            <MenuItem value="crime">Crime</MenuItem>
            <MenuItem value="drama">Drama</MenuItem>
            <MenuItem value="comedy">Comedy</MenuItem>
            <MenuItem value="action">Action</MenuItem>
            <MenuItem value="slice-of-life">Slice of Life</MenuItem>
            <MenuItem value="supernatural">Supernatural</MenuItem>
            <MenuItem value="psychological">Psychological</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Write your story here"
          name="content"
          value={story.content}
          onChange={handleInputChange}
          multiline
          rows={15}
          fullWidth
          required
          disabled={loading}
          sx={{ 
            backgroundColor: 'white',
            '& .MuiOutlinedInput-root': {
              '& fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.23)',
              },
              '&:hover fieldset': {
                borderColor: 'rgba(0, 0, 0, 0.5)',
              },
            }
          }}
        />

        <Box sx={{ 
          display: 'flex', 
          gap: 2,
          flexDirection: { xs: 'column', sm: 'row' }
        }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            disabled={loading}
            fullWidth={false}
            sx={{ 
              py: { xs: 1.5, md: 2 },
              px: { xs: 3, md: 4 },
              fontSize: { xs: '1rem', md: '1.1rem' },
              position: 'relative',
              minWidth: '120px'
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
            ) : 'Save Changes'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleCancel}
            disabled={loading}
            fullWidth={false}
            sx={{ 
              py: { xs: 1.5, md: 2 },
              px: { xs: 3, md: 4 }
            }}
          >
            Cancel
          </Button>
        </Box>
      </Stack>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to discard your changes? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Keep Editing</Button>
          <Button 
            onClick={() => navigate(`/story/${id}`)} 
            color="error"
          >
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditStory;
