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
  CircularProgress,
  Stepper,
  Step,
  StepLabel
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const steps = ['Story Details', 'Generate Story', 'Review & Save'];

const CreateStory = () => {
  const [activeStep, setActiveStep] = useState(0);
  const [formData, setFormData] = useState({
    title: '',
    genre: '',
    prompt: '',
    length: 'medium'
  });
  const [generatedStory, setGeneratedStory] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (error) setError('');
  };

  const validateStep = () => {
    switch (activeStep) {
      case 0:
        if (!formData.title.trim()) {
          setError('Please provide a title');
          return false;
        }
        if (!formData.genre) {
          setError('Please select a genre');
          return false;
        }
        break;
      case 1:
        if (!formData.prompt.trim()) {
          setError('Please provide a story prompt');
          return false;
        }
        break;
      default:
        break;
    }
    return true;
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
  };

  const generateStory = async () => {
    try {
      setLoading(true);
      setError('');
      const result = await storyService.generateAIStory(formData.prompt);
      setGeneratedStory(result.content);
      setActiveStep(prev => prev + 1);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      const newStory = await storyService.createStory({
        title: formData.title,
        genre: formData.genre,
        content: generatedStory,
        isAIGenerated: true
      });
      navigate(`/story/${newStory._id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderStepContent = () => {
    switch (activeStep) {
      case 0:
        return (
          <>
            <TextField
              label="Story Title"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              fullWidth
              required
              disabled={loading}
            />

            <FormControl fullWidth required>
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
          </>
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
            placeholder="Describe your story idea or provide specific elements you want to include..."
          />
        );
      case 2:
        return (
          <Paper 
            elevation={2} 
            sx={{ p: 3, mt: 2, backgroundColor: 'white' }}
          >
            <Typography 
              variant="h5" 
              gutterBottom
              sx={{ fontWeight: 'bold' }}
            >
              {formData.title}
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
