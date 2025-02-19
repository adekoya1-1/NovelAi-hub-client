import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  Box,
  CircularProgress,
  Alert,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Pagination
} from '@mui/material';
import { Link } from 'react-router-dom';
import { storyService } from '../services/storyService';

const StoryCard = ({ story }) => {
  const readingTime = storyService.calculateReadingTime(story.content);

  return (
    <Card 
      component={Link} 
      to={`/story/${story._id}`}
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        transition: 'transform 0.2s, box-shadow 0.2s',
        '&:hover': {
          transform: 'translateY(-4px)',
          boxShadow: 4
        }
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 }, flexGrow: 1 }}>
        <Typography 
          variant="h5" 
          component="h2" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '1.25rem', sm: '1.5rem' },
            fontWeight: 'bold'
          }}
        >
          {story.title}
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
          <Chip 
            label={story.genre}
            color="primary"
            size="small"
          />
          {story.isAIGenerated && (
            <Chip 
              label="AI Generated"
              color="secondary"
              size="small"
            />
          )}
        </Box>

        <Typography 
          variant="body2" 
          color="text.secondary" 
          paragraph
          sx={{ 
            fontSize: { xs: '0.875rem', sm: '1rem' },
            mb: 2
          }}
        >
          {storyService.formatStoryPreview(story.content)}
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          mt: 'auto'
        }}>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            By {story.author.username}
          </Typography>
          <Typography 
            variant="caption" 
            color="text.secondary"
            sx={{ fontSize: { xs: '0.75rem', sm: '0.875rem' } }}
          >
            {readingTime} min read • {story.likes.length} likes
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );
};

const Browse = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    genre: '',
    search: '',
    page: 1
  });
  const [pagination, setPagination] = useState({
    page: 1,
    pages: 1,
    total: 0
  });

  useEffect(() => {
    fetchStories();
  }, [filters]);

  const fetchStories = async () => {
    try {
      setLoading(true);
      const result = await storyService.getStories(filters);
      setStories(result.stories);
      setPagination({
        page: result.page,
        pages: result.pages,
        total: result.total
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value,
      page: 1 // Reset page when filters change
    }));
  };

  const handlePageChange = (event, value) => {
    setFilters(prev => ({
      ...prev,
      page: value
    }));
  };

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ mb: { xs: 4, md: 6 } }}>
        <Typography 
          variant="h3" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 'bold'
          }}
        >
          Browse Stories
        </Typography>

        <Grid container spacing={2} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              label="Search Stories"
              name="search"
              value={filters.search}
              onChange={handleFilterChange}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <FormControl fullWidth>
              <InputLabel>Genre</InputLabel>
              <Select
                name="genre"
                value={filters.genre}
                onChange={handleFilterChange}
                label="Genre"
              >
                <MenuItem value="">All Genres</MenuItem>
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
          </Grid>
        </Grid>

        {error && (
          <Alert 
            severity="error" 
            sx={{ mb: 4 }}
            onClose={() => setError('')}
          >
            {error}
          </Alert>
        )}
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : stories.length > 0 ? (
        <>
          <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
            {stories.map((story) => (
              <Grid item key={story._id} xs={12} sm={6} md={4}>
                <StoryCard story={story} />
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ 
            display: 'flex', 
            justifyContent: 'center',
            mt: 6 
          }}>
            <Pagination
              count={pagination.pages}
              page={pagination.page}
              onChange={handlePageChange}
              color="primary"
              size={pagination.pages > 10 ? "small" : "medium"}
            />
          </Box>
        </>
      ) : (
        <Typography 
          variant="h6" 
          align="center" 
          color="text.secondary"
          sx={{ py: 8 }}
        >
          No stories found
        </Typography>
      )}
    </Container>
  );
};

export default Browse;
