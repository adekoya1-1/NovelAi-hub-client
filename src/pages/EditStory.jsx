import { useState, useEffect, useCallback } from 'react';
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
  DialogActions,
  IconButton,
  Tooltip,
  Skeleton
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const MAX_TITLE_LENGTH = 100;
const MIN_WORD_COUNT = 100;
const MAX_WORD_COUNT = 5000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const EditStory = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  
  const [story, setStory] = useState({
    title: '',
    genre: '',
    content: '',
    image: null,
    currentImage: null
  });
  const [wordCount, setWordCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialStory, setInitialStory] = useState(null);
  const [imageError, setImageError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});

  const fetchStory = useCallback(async () => {
    try {
      setInitialLoading(true);
      setError('');
      const fetchedStory = await storyService.getStoryById(id);
      
      // Verify that the current user is the author
      if (fetchedStory.author._id !== currentUser?._id) {
        navigate('/', { replace: true });
        return;
      }

      const storyData = {
        title: fetchedStory.title,
        genre: fetchedStory.genre,
        content: fetchedStory.content,
        image: null,
        currentImage: fetchedStory.image
      };
      setStory(storyData);
      setInitialStory(storyData);
      
      const words = fetchedStory.content.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    } catch (err) {
      console.error('Error fetching story:', err);
      setError(err.message || 'Failed to load story. Please try again.');
    } finally {
      setInitialLoading(false);
    }
  }, [id, currentUser, navigate]);

  useEffect(() => {
    fetchStory();
  }, [fetchStory]);

  const validateImage = (file) => {
    if (!file) return null;
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      return 'Please upload a valid image file (JPEG, PNG, or GIF)';
    }
    if (file.size > MAX_IMAGE_SIZE) {
      return 'Image size should be less than 5MB';
    }
    return null;
  };

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      if (files && files[0]) {
        const imageValidationError = validateImage(files[0]);
        if (imageValidationError) {
          setImageError(imageValidationError);
          return;
        }
        setStory(prev => ({
          ...prev,
          image: files[0]
        }));
        setImageError('');
      }
    } else {
      if (name === 'title' && value.length > MAX_TITLE_LENGTH) {
        return;
      }
      
      setStory(prev => ({
        ...prev,
        [name]: value
      }));

      // Clear validation error for the field
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: ''
        }));
      }
    }

    if (name === 'content') {
      const words = value.trim().split(/\s+/).filter(word => word.length > 0);
      setWordCount(words.length);
    }

    if (error) setError('');
  };

  const validateStory = () => {
    const errors = {};

    if (!story.title.trim()) {
      errors.title = 'Please provide a title for your story';
    } else if (story.title.length > MAX_TITLE_LENGTH) {
      errors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
    }

    if (!story.genre) {
      errors.genre = 'Please select a genre for your story';
    }

    if (wordCount < MIN_WORD_COUNT) {
      errors.content = `Story must be at least ${MIN_WORD_COUNT} words long`;
    } else if (wordCount > MAX_WORD_COUNT) {
      errors.content = `Story cannot exceed ${MAX_WORD_COUNT} words`;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateStory()) return;
    
    try {
      setLoading(true);
      setError('');
      
      const formData = new FormData();
      formData.append('title', story.title.trim());
      formData.append('genre', story.genre);
      formData.append('content', story.content.trim());
      if (story.image) {
        formData.append('image', story.image);
      }
      
      const updatedStory = await storyService.updateStory(id, formData);
      navigate(`/story/${updatedStory._id}`);
    } catch (err) {
      console.error('Error updating story:', err);
      setError(err.message || 'Failed to update story. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setStory(prev => ({
      ...prev,
      image: null,
      currentImage: null
    }));
    setImageError('');
  };

  const handleCancel = () => {
    const hasChanges = 
      story.title !== initialStory.title ||
      story.genre !== initialStory.genre ||
      story.content !== initialStory.content ||
      story.image !== initialStory.image ||
      story.currentImage !== initialStory.currentImage;

    if (hasChanges) {
      setShowConfirmDialog(true);
    } else {
      navigate(`/story/${id}`);
    }
  };

  if (initialLoading) {
    return (
      <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
        <Stack spacing={3}>
          <Skeleton variant="text" height={60} width="50%" />
          <Skeleton variant="rectangular" height={200} />
          <Skeleton variant="rectangular" height={56} />
          <Skeleton variant="rectangular" height={400} />
        </Stack>
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
            color={wordCount < MIN_WORD_COUNT ? 'error' : 'primary'}
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
            action={
              <Button color="inherit" size="small" onClick={fetchStory}>
                Retry
              </Button>
            }
          >
            {error}
          </Alert>
        )}

        <Stack spacing={2}>
          <TextField
            label="Story Title"
            name="title"
            value={story.title}
            onChange={handleInputChange}
            fullWidth
            required
            disabled={loading}
            error={!!validationErrors.title}
            helperText={validationErrors.title || `${story.title.length}/${MAX_TITLE_LENGTH}`}
            sx={{ backgroundColor: 'white' }}
          />

          <Box>
            {(story.currentImage || story.image) && (
              <Box sx={{ 
                mb: 2,
                position: 'relative',
                display: 'inline-block'
              }}>
                <Typography variant="subtitle1" gutterBottom>
                  Story Image:
                </Typography>
                <Box sx={{ position: 'relative', display: 'inline-block' }}>
                  <img 
                    src={story.image ? URL.createObjectURL(story.image) : story.currentImage} 
                    alt="Story" 
                    style={{ 
                      maxWidth: '100%', 
                      maxHeight: '200px', 
                      objectFit: 'contain',
                      borderRadius: '4px'
                    }} 
                  />
                  <IconButton
                    onClick={handleRemoveImage}
                    sx={{
                      position: 'absolute',
                      top: 8,
                      right: 8,
                      backgroundColor: 'rgba(0, 0, 0, 0.5)',
                      '&:hover': {
                        backgroundColor: 'rgba(0, 0, 0, 0.7)'
                      }
                    }}
                  >
                    <DeleteIcon sx={{ color: 'white' }} />
                  </IconButton>
                </Box>
              </Box>
            )}
            
            <input
              accept={ALLOWED_IMAGE_TYPES.join(',')}
              style={{ display: 'none' }}
              id="story-image"
              type="file"
              name="image"
              onChange={handleInputChange}
              disabled={loading}
            />
            <label htmlFor="story-image">
              <Button
                variant="outlined"
                component="span"
                disabled={loading}
                fullWidth
              >
                {story.image ? 'Change Image' : (story.currentImage ? 'Replace Image' : 'Upload Image')}
              </Button>
            </label>
            {imageError && (
              <Typography 
                color="error" 
                variant="caption" 
                sx={{ display: 'block', mt: 1 }}
              >
                {imageError}
              </Typography>
            )}
          </Box>

          <FormControl 
            fullWidth 
            required
            error={!!validationErrors.genre}
          >
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
            {validationErrors.genre && (
              <Typography color="error" variant="caption">
                {validationErrors.genre}
              </Typography>
            )}
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
            error={!!validationErrors.content}
            helperText={validationErrors.content}
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
        </Stack>

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
        onClose={() => !loading && setShowConfirmDialog(false)}
      >
        <DialogTitle>Discard Changes?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to discard your changes? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setShowConfirmDialog(false)}
            disabled={loading}
          >
            Keep Editing
          </Button>
          <Button 
            onClick={() => navigate(`/story/${id}`)} 
            color="error"
            disabled={loading}
          >
            Discard Changes
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default EditStory;
