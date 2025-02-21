import { useState, useCallback } from 'react';
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
  CircularProgress,
  Stepper,
  Step,
  StepLabel,
  IconButton
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Close as CloseIcon } from '@mui/icons-material';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const steps = ['Story Details', 'Generate Story', 'Review & Save'];

const MAX_TITLE_LENGTH = 100;
const MAX_PROMPT_LENGTH = 1000;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif'];
const MAX_IMAGE_SIZE = 5 * 1024 * 1024; // 5MB

const CreateStory = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    prompt: '',
    length: 'medium',
    image: null
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const validateImage = useCallback((file) => {
    if (file) {
      if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
        return 'Please upload a valid image file (JPEG, PNG, or GIF)';
      }
      if (file.size > MAX_IMAGE_SIZE) {
        return 'Image size should be less than 5MB';
      }
    }
    return null;
  }, []);

  const handleInputChange = (e) => {
    const { name, value, files } = e.target;
    
    if (name === 'image') {
      if (files && files[0]) {
        const imageError = validateImage(files[0]);
        if (imageError) {
          setValidationErrors(prev => ({
            ...prev,
            image: imageError
          }));
          return;
        }
        setFormData(prev => ({
          ...prev,
          image: files[0]
        }));
        setValidationErrors(prev => ({
          ...prev,
          image: null
        }));
      }
    } else {
      // Trim input and enforce length limits
      const trimmedValue = value.trim();
      if (name === 'title' && trimmedValue.length > MAX_TITLE_LENGTH) {
        return;
      }
      if (name === 'prompt' && trimmedValue.length > MAX_PROMPT_LENGTH) {
        return;
      }
      
      setFormData(prev => ({
        ...prev,
        [name]: trimmedValue
      }));
      
      // Clear validation errors for the field
      if (validationErrors[name]) {
        setValidationErrors(prev => ({
          ...prev,
          [name]: null
        }));
      }
    }
    
    if (error) setError('');
  };

  const validateStep = () => {
    const errors = {};

    switch (activeStep) {
      case 0:
        if (!formData.title.trim()) {
          errors.title = 'Please provide a title';
        } else if (formData.title.length > MAX_TITLE_LENGTH) {
          errors.title = `Title must be less than ${MAX_TITLE_LENGTH} characters`;
        }
        
        if (!formData.genre) {
          errors.genre = 'Please select a genre';
        }
        
        if (formData.image) {
          const imageError = validateImage(formData.image);
          if (imageError) {
            errors.image = imageError;
          }
        }
        break;
        
      case 1:
        if (!formData.prompt.trim()) {
          errors.prompt = 'Please provide a story prompt';
        } else if (formData.prompt.length > MAX_PROMPT_LENGTH) {
          errors.prompt = `Prompt must be less than ${MAX_PROMPT_LENGTH} characters`;
        }
        break;
        
      default:
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNext = async () => {
    if (!validateStep()) return;

    if (activeStep === 1) {
      await generateStory();
    } else {
      setActiveStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setActiveStep(prev => prev - 1);
    setError('');
    setValidationErrors({});
  };

  const generateStory = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Include genre and length in the prompt
      const enhancedPrompt = `Generate a ${formData.length} ${formData.genre} story about: ${formData.prompt}`;
      const result = await storyService.generateAIStory(enhancedPrompt);
      
      if (!result?.content) {
        throw new Error('Failed to generate story content');
      }
      
      setGeneratedStory(result.content);
      setActiveStep(prev => prev + 1);
    } catch (err) {
      setError(err.message || 'Failed to generate story');
      console.error('Story generation error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      if (!generatedStory) {
        setError('No story content to save');
        return;
      }

      setLoading(true);
      const formDataToSend = new FormData();
      formDataToSend.append('title', formData.title);
      formDataToSend.append('genre', formData.genre);
      formDataToSend.append('content', generatedStory);
      formDataToSend.append('isAIGenerated', 'true');
      formDataToSend.append('length', formData.length);
      if (formData.image) {
        formDataToSend.append('image', formData.image);
      }
      
      const newStory = await storyService.createStory(formDataToSend);
      if (!newStory?._id) {
        throw new Error('Failed to save story');
      }
      
      navigate(`/story/${newStory._id}`);
    } catch (err) {
      setError(err.message || 'Failed to save story');
      console.error('Story save error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({
      ...prev,
      image: null
    }));
    setValidationErrors(prev => ({
      ...prev,
      image: null
    }));
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <Stack spacing={3}>
            <TextField
              label="Story Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
              error={!!validationErrors.title}
              helperText={validationErrors.title || `${formData.title.length}/${MAX_TITLE_LENGTH} characters`}
              inputProps={{
                maxLength: MAX_TITLE_LENGTH
              }}
            />

            <Box>
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
                  {formData.image ? 'Change Image' : 'Upload Image'}
                </Button>
              </label>
              {formData.image && (
                <Box sx={{ 
                  mt: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <Typography variant="body2">
                    Selected: {formData.image.name}
                  </Typography>
                  <IconButton 
                    size="small" 
                    onClick={handleRemoveImage}
                    aria-label="remove image"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              )}
              {validationErrors.image && (
                <Typography 
                  color="error" 
                  variant="caption" 
                  sx={{ display: 'block', mt: 0.5 }}
                >
                  {validationErrors.image}
                </Typography>
              )}
            </Box>

            <FormControl fullWidth required error={!!validationErrors.genre}>
              <InputLabel>Genre</InputLabel>
              <Select
                name="genre"
                value={formData.genre}
                onChange={handleInputChange}
                label="Genre"
                disabled={loading}
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

            <FormControl fullWidth required>
              <InputLabel>Story Length</InputLabel>
              <Select
                name="length"
                value={formData.length}
                onChange={handleInputChange}
                label="Story Length"
                disabled={loading}
              >
                <MenuItem value="short">Short (~500 words)</MenuItem>
                <MenuItem value="medium">Medium (~1000 words)</MenuItem>
                <MenuItem value="long">Long (~2000 words)</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        );

      case 1:
        return (
          <TextField
            label="Story Prompt"
            name="prompt"
            value={formData.prompt}
            onChange={handleInputChange}
            multiline
            rows={6}
            fullWidth
            required
            disabled={loading}
            error={!!validationErrors.prompt}
            helperText={validationErrors.prompt || `${formData.prompt.length}/${MAX_PROMPT_LENGTH} characters`}
            placeholder="Describe your story idea or provide specific elements you want to include..."
            inputProps={{
              maxLength: MAX_PROMPT_LENGTH
            }}
          />
        );

      case 2:
        return (
          <Paper 
            elevation={2} 
            sx={{ 
              p: 3, 
              mt: 2, 
              backgroundColor: 'white',
              maxHeight: '60vh',
              overflow: 'auto'
            }}
          >
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {formData.title}
            </Typography>
            <Typography 
              variant="body2" 
              color="text.secondary" 
              gutterBottom
            >
              {formData.genre.charAt(0).toUpperCase() + formData.genre.slice(1)} • {
                storyService.calculateReadingTime(generatedStory)
              } min read
            </Typography>
            <Typography sx={{ whiteSpace: 'pre-wrap' }}>
              {generatedStory}
            </Typography>
          </Paper>
        );

      default:
        return null;
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 8 } }}>
      <Stack spacing={4}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 'bold'
          }}
        >
          Create AI Story
        </Typography>

        <Stepper 
          activeStep={activeStep} 
          sx={{ 
            display: { xs: 'none', sm: 'flex' }
          }}
        >
          {steps.map((label) => (
            <Step key={label}>
              <StepLabel>{label}</StepLabel>
            </Step>
          ))}
        </Stepper>

        {error && (
          <Alert 
            severity="error" 
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 4 }}>
          {renderStepContent()}
        </Box>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          gap: 2,
          mt: 4 
        }}>
          <Button
            variant="outlined"
            onClick={handleBack}
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          <Button
            variant="contained"
            onClick={activeStep === 2 ? handleSave : handleNext}
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
            ) : activeStep === 2 ? 'Save Story' : 'Next'}
          </Button>
        </Box>
      </Stack>
    </Container>
  );
};

export default CreateStory;
