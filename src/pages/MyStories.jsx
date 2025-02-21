import { useState, useEffect, useCallback } from 'react';
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
  Chip,
  IconButton,
  Tooltip,
  Skeleton,
  Pagination,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import VisibilityIcon from '@mui/icons-material/Visibility';
import AddIcon from '@mui/icons-material/Add';
import { useAuth } from '../context/AuthContext';
import { storyService } from '../services/storyService';

const MyStories = () => {
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [storyToDelete, setStoryToDelete] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [sortBy, setSortBy] = useState('newest');
  const [imageErrors, setImageErrors] = useState({});
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const fetchStories = useCallback(async () => {
    try {
      setLoading(true);
      setError('');
      const response = await storyService.getUserStories(currentUser._id, {
        page,
        limit: 9,
        sort: sortBy
      });
      
      setStories(response.stories || []);
      setTotalPages(response.pages || 1);
    } catch (err) {
      console.error('Error fetching stories:', err);
      setError(err.message || 'Failed to load your stories. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [currentUser._id, page, sortBy]);

  useEffect(() => {
    fetchStories();
  }, [fetchStories]);

  const handleEdit = (storyId) => {
    navigate(`/story/${storyId}/edit`);
  };

  const handleDelete = (story) => {
    setStoryToDelete(story);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    try {
      setDeleteLoading(true);
      setError('');
      await storyService.deleteStory(storyToDelete._id);
      setStories(stories.filter(story => story._id !== storyToDelete._id));
      setDeleteDialogOpen(false);
      setStoryToDelete(null);
    } catch (err) {
      console.error('Error deleting story:', err);
      setError(err.message || 'Failed to delete story. Please try again.');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleSortChange = (event) => {
    setSortBy(event.target.value);
    setPage(1); // Reset to first page when sorting changes
  };

  const handleImageError = (storyId) => {
    setImageErrors(prev => ({
      ...prev,
      [storyId]: true
    }));
  };

  const renderSkeletons = () => (
    <>
      {[1, 2, 3].map((n) => (
        <Grid item xs={12} sm={6} md={4} key={n}>
          <Card>
            <Skeleton variant="rectangular" height={200} />
            <CardContent>
              <Skeleton variant="text" height={32} width="80%" />
              <Skeleton variant="text" height={24} width="40%" />
              <Skeleton variant="text" height={80} />
            </CardContent>
            <CardActions>
              <Skeleton variant="rectangular" width={60} height={36} />
              <Skeleton variant="rectangular" width={60} height={36} />
            </CardActions>
          </Card>
        </Grid>
      ))}
    </>
  );

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 8 } }}>
      <Box sx={{ 
        mb: 4,
        display: 'flex',
        flexDirection: { xs: 'column', sm: 'row' },
        alignItems: { xs: 'stretch', sm: 'center' },
        gap: 2
      }}>
        <Typography 
          variant="h3" 
          component="h1"
          sx={{ 
            fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' },
            fontWeight: 'bold'
          }}
        >
          My Stories
        </Typography>

        <Box sx={{ 
          display: 'flex',
          gap: 2,
          ml: { sm: 'auto' },
          flexWrap: 'wrap'
        }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Sort By</InputLabel>
            <Select
              value={sortBy}
              label="Sort By"
              onChange={handleSortChange}
              disabled={loading}
            >
              <MenuItem value="newest">Newest</MenuItem>
              <MenuItem value="oldest">Oldest</MenuItem>
              <MenuItem value="title">Title</MenuItem>
              <MenuItem value="likes">Most Liked</MenuItem>
            </Select>
          </FormControl>

          <Button
            variant="contained"
            color="primary"
            onClick={() => navigate('/write')}
            startIcon={<AddIcon />}
            disabled={loading}
          >
            Write Story
          </Button>
        </Box>
      </Box>

      {error && (
        <Alert 
          severity="error" 
          onClose={() => setError('')}
          sx={{ mb: 3 }}
          action={
            <Button color="inherit" size="small" onClick={fetchStories}>
              Retry
            </Button>
          }
        >
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {loading ? (
          renderSkeletons()
        ) : stories.length === 0 ? (
          <Grid item xs={12}>
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
                startIcon={<AddIcon />}
              >
                Write a Story
              </Button>
            </Box>
          </Grid>
        ) : (
          stories.map(story => (
            <Grid item xs={12} sm={6} md={4} key={story._id}>
              <Card 
                sx={{ 
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: 4
                  }
                }}
              >
                {story.image && !imageErrors[story._id] && (
                  <Box 
                    sx={{ 
                      pt: '56.25%', // 16:9 aspect ratio
                      position: 'relative',
                      overflow: 'hidden'
                    }}
                  >
                    <img
                      src={story.image}
                      alt={story.title}
                      onError={() => handleImageError(story._id)}
                      style={{
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  </Box>
                )}
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography 
                    variant="h5" 
                    component="h2" 
                    gutterBottom
                    sx={{ 
                      fontSize: '1.25rem',
                      fontWeight: 'bold',
                      lineHeight: 1.4
                    }}
                  >
                    {story.title}
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
                    <Chip 
                      label={story.genre}
                      size="small"
                      color="primary"
                      variant="outlined"
                    />
                    <Chip 
                      label={`${storyService.calculateReadingTime(story.content)} min read`}
                      size="small"
                      variant="outlined"
                    />
                    {story.isAIGenerated && (
                      <Chip 
                        label="AI Generated"
                        size="small"
                        color="secondary"
                        variant="outlined"
                      />
                    )}
                  </Box>
                  <Typography 
                    color="text.secondary" 
                    sx={{ 
                      mb: 2,
                      display: '-webkit-box',
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden'
                    }}
                  >
                    {storyService.formatStoryPreview(story.content)}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    color="text.secondary"
                    display="block"
                  >
                    {story.likes?.length || 0} likes
                  </Typography>
                </CardContent>
                <CardActions sx={{ p: 2, pt: 0, justifyContent: 'flex-end' }}>
                  <Tooltip title="View Story">
                    <IconButton 
                      size="small"
                      onClick={() => navigate(`/story/${story._id}`)}
                      color="primary"
                    >
                      <VisibilityIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Edit Story">
                    <IconButton 
                      size="small"
                      onClick={() => handleEdit(story._id)}
                      color="primary"
                    >
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Delete Story">
                    <IconButton 
                      size="small"
                      onClick={() => handleDelete(story)}
                      color="error"
                    >
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </CardActions>
              </Card>
            </Grid>
          ))
        )}
      </Grid>

      {!loading && stories.length > 0 && totalPages > 1 && (
        <Box sx={{ 
          mt: 4, 
          display: 'flex', 
          justifyContent: 'center' 
        }}>
          <Pagination
            count={totalPages}
            page={page}
            onChange={handlePageChange}
            color="primary"
            disabled={loading}
          />
        </Box>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => !deleteLoading && setDeleteDialogOpen(false)}
      >
        <DialogTitle>Delete Story?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete "{storyToDelete?.title}"? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setDeleteDialogOpen(false)}
            disabled={deleteLoading}
          >
            Cancel
          </Button>
          <Button 
            onClick={confirmDelete} 
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

export default MyStories;
