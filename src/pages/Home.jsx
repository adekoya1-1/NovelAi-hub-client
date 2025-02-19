import { Container, Typography, Grid, Button, Box, useTheme, useMediaQuery } from '@mui/material'
import { Link } from 'react-router-dom'

const Home = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'))
  const isTablet = useMediaQuery(theme.breakpoints.down('md'))

  return (
    <Container maxWidth="xl" sx={{ py: { xs: 4, md: 10 } }}>
      <Box sx={{ 
        textAlign: 'center',
        maxWidth: 'md',
        mx: 'auto',
        px: { xs: 2, sm: 4 }
      }}>
        <Typography 
          variant="h1" 
          component="h1" 
          gutterBottom
          sx={{ 
            fontSize: { xs: '2.5rem', sm: '3.5rem', md: '4rem' },
            fontWeight: 'bold',
            mb: { xs: 2, md: 4 }
          }}
        >
          Welcome to NovelAI Hub
        </Typography>
        <Typography 
          variant="h5" 
          color="text.secondary" 
          paragraph
          sx={{ 
            fontSize: { xs: '1.1rem', sm: '1.25rem', md: '1.5rem' },
            mb: { xs: 4, md: 6 }
          }}
        >
          Discover AI-generated stories tailored to your interests
        </Typography>
        <Button
          component={Link}
          to="/create"
          variant="contained"
          color="primary"
          size={isMobile ? "medium" : "large"}
          sx={{ 
            py: { xs: 1.5, md: 2 },
            px: { xs: 4, md: 6 },
            fontSize: { xs: '1rem', md: '1.25rem' }
          }}
        >
          Start Creating
        </Button>
      </Box>

      <Grid 
        container 
        spacing={{ xs: 2, md: 4 }} 
        sx={{ mt: { xs: 4, md: 8 } }}
      >
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: { xs: 3, md: 4 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              Generate Stories
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Create unique stories using AI, tailored to your preferences and ideas.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: { xs: 3, md: 4 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              Write Your Own
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Express your creativity by writing and sharing your own original stories.
            </Typography>
          </Box>
        </Grid>
        <Grid item xs={12} md={4}>
          <Box 
            sx={{ 
              p: { xs: 3, md: 4 },
              border: 1,
              borderColor: 'divider',
              borderRadius: 2,
              height: '100%',
              backgroundColor: 'white'
            }}
          >
            <Typography 
              variant="h5" 
              component="h2" 
              gutterBottom
              sx={{ fontSize: { xs: '1.25rem', md: '1.5rem' } }}
            >
              Browse Stories
            </Typography>
            <Typography sx={{ fontSize: { xs: '1rem', md: '1.1rem' } }}>
              Discover and read stories from our growing community of writers.
            </Typography>
          </Box>
        </Grid>
      </Grid>
    </Container>
  )
}

export default Home
