import { useState } from 'react'
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  useTheme,
  useMediaQuery,
  Divider,
  ListItem,
  Container,
  Tooltip
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import SearchIcon from '@mui/icons-material/Search'
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks'
import CreateIcon from '@mui/icons-material/Create'
import AutoStoriesIcon from '@mui/icons-material/AutoStories'
import LoginIcon from '@mui/icons-material/Login'
import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

const Navbar = () => {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen)
  }

  const handleNavigation = (path) => {
    navigate(path)
    setMobileOpen(false)
  }

  const drawerLinkStyle = {
    fontSize: '1.1rem',
    fontWeight: 'medium',
    color: 'primary.main'
  }

  const drawer = (
    <Box sx={{ width: { xs: '100vw', sm: 300 } }} role="presentation">
      <List sx={{ py: 2 }}>
        <ListItem sx={{ mb: 2 }}>
          <Typography
            variant="h6"
            component={Link}
            to="/"
            sx={{
              color: 'primary.main',
              textDecoration: 'none',
              fontWeight: 'bold'
            }}
            onClick={() => setMobileOpen(false)}
          >
            NovelAI Hub
          </Typography>
        </ListItem>
        <Divider sx={{ mb: 2 }} />
        <ListItemButton 
          onClick={() => handleNavigation('/browse')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <SearchIcon color="primary" />
          </ListItemIcon>
          <ListItemText 
            primary="Browse" 
            primaryTypographyProps={drawerLinkStyle}
          />
        </ListItemButton>
        {currentUser ? (
          <>
            <ListItemButton 
              onClick={() => handleNavigation('/my-stories')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <LibraryBooksIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="My Stories" 
                primaryTypographyProps={drawerLinkStyle}
              />
            </ListItemButton>
            <ListItemButton 
              onClick={() => handleNavigation('/write')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <CreateIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Write Story" 
                primaryTypographyProps={drawerLinkStyle}
              />
            </ListItemButton>
            <ListItemButton 
              onClick={() => handleNavigation('/create')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <AutoStoriesIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="AI Generate" 
                primaryTypographyProps={drawerLinkStyle}
              />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton 
              onClick={() => handleNavigation('/login')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <LoginIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Login" 
                primaryTypographyProps={drawerLinkStyle}
              />
            </ListItemButton>
            <ListItemButton 
              onClick={() => handleNavigation('/signup')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonAddIcon color="primary" />
              </ListItemIcon>
              <ListItemText 
                primary="Sign Up" 
                primaryTypographyProps={drawerLinkStyle}
              />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  )

  return (
    <>
      <AppBar position="static" sx={{ backgroundColor: 'white' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              {isMobile && (
                <IconButton
                  color="primary"
                  aria-label="open drawer"
                  edge="start"
                  onClick={handleDrawerToggle}
                  sx={{ mr: 2 }}
                >
                  <MenuIcon />
                </IconButton>
              )}
              <Typography
                variant="h6"
                component={Link}
                to="/"
                sx={{
                  color: 'primary.main',
                  textDecoration: 'none',
                  fontWeight: 'bold'
                }}
              >
                NovelAI Hub
              </Typography>
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {!isMobile && (
                <>
                  <Tooltip title="Browse Stories">
                    <IconButton
                      component={Link}
                      to="/browse"
                      color="primary"
                      size="large"
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>

                  {currentUser ? (
                    <>
                      <Tooltip title="My Stories">
                        <IconButton
                          component={Link}
                          to="/my-stories"
                          color="primary"
                          size="large"
                        >
                          <LibraryBooksIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Write Story">
                        <IconButton
                          component={Link}
                          to="/write"
                          color="primary"
                          size="large"
                        >
                          <CreateIcon />
                        </IconButton>
                      </Tooltip>
                      <Button
                        component={Link}
                        to="/create"
                        variant="contained"
                        color="primary"
                        startIcon={<AutoStoriesIcon />}
                        sx={{ fontSize: '1rem' }}
                      >
                        AI Generate
                      </Button>
                    </>
                  ) : (
                    <>
                      <Tooltip title="Login">
                        <IconButton
                          color="primary"
                          onClick={() => navigate('/login')}
                          size="large"
                        >
                          <LoginIcon />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Sign Up">
                        <IconButton
                          color="primary"
                          onClick={() => navigate('/signup')}
                          size="large"
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </>
              )}

              {currentUser && (
                <Tooltip title="Account Settings">
                  <Box 
                    component={Link}
                    to="/account"
                    sx={{ 
                      display: 'flex', 
                      alignItems: 'center',
                      textDecoration: 'none'
                    }}
                  >
                    <Box
                      component="img"
                      src={currentUser.profilePicture}
                      alt={currentUser.username}
                      sx={{
                        width: 40,
                        height: 40,
                        borderRadius: '50%',
                        objectFit: 'cover',
                        border: '2px solid',
                        borderColor: 'primary.main',
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'scale(1.1)'
                        }
                      }}
                    />
                  </Box>
                </Tooltip>
              )}
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
      <Drawer
        variant="temporary"
        anchor="left"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true // Better open performance on mobile.
        }}
        sx={{
          display: { xs: 'block' },
          '& .MuiDrawer-paper': {
            boxSizing: 'border-box',
            width: { xs: '100%', sm: 300 },
          },
        }}
      >
        {drawer}
      </Drawer>
    </>
  )
}

export default Navbar
