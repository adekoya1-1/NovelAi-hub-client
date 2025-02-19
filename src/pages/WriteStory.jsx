import { useState } from 'react';
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
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const WriteStory = () => {
  const [story, setStory] = useState({
    title: '',
    genre: '',
    content: ''
  });
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

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
      const newStory = await storyService.createStory({
        ...story,
        isAIGenerated: false
      });
      navigate(`/story/${newStory._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    if (story.content.trim() || story.title.trim()) {
      setShowConfirmDialog(true);
    }
  };

  const confirmClear = () => {
    setStory({ title: '', genre: '', content: '' });
    setWordCount(0);
    setShowConfirmDialog(false);
  };

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
            Write Your Story
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
          placeholder="Once upon a time..."
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
            ) : 'Submit Story'}
          </Button>
          <Button
            variant="outlined"
            onClick={handleClear}
            disabled={loading}
            fullWidth={false}
            sx={{ 
              py: { xs: 1.5, md: 2 },
              px: { xs: 3, md: 4 }
            }}
          >
            Clear
          </Button>
        </Box>
      </Stack>

      <Dialog
        open={showConfirmDialog}
        onClose={() => setShowConfirmDialog(false)}
      >
        <DialogTitle>Clear Story?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to clear your story? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowConfirmDialog(false)}>Cancel</Button>
          <Button onClick={confirmClear} color="error">Clear</Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default WriteStory;
