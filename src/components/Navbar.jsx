import { useState, useEffect, useCallback } from 'react';
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
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  CircularProgress,
  Avatar
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import CreateIcon from '@mui/icons-material/Create';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import LoginIcon from '@mui/icons-material/Login';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LogoutIcon from '@mui/icons-material/Logout';
import HomeIcon from '@mui/icons-material/Home';
import PersonIcon from '@mui/icons-material/Person';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
  const { currentUser, loading, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleNavigation = useCallback((path) => {
    navigate(path);
    setMobileOpen(false);
  }, [navigate]);

  const handleAccountMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleAccountMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogoutClick = () => {
    setLogoutDialogOpen(true);
    handleAccountMenuClose();
  };

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      await logout();
      setLogoutDialogOpen(false);
      navigate('/login', { replace: true });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      setIsLoggingOut(false);
      setMobileOpen(false);
    }
  };

  const isActive = useCallback((path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  }, [location.pathname]);

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
          onClick={() => handleNavigation('/')}
          selected={isActive('/')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <HomeIcon color={isActive('/') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Home" />
        </ListItemButton>

        <ListItemButton 
          onClick={() => handleNavigation('/browse')}
          selected={isActive('/browse')}
          sx={{ py: 1.5 }}
        >
          <ListItemIcon>
            <SearchIcon color={isActive('/browse') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText primary="Browse" />
        </ListItemButton>

        {loading ? (
          <Box sx={{ p: 2, display: 'flex', justifyContent: 'center' }}>
            <CircularProgress size={24} />
          </Box>
        ) : currentUser ? (
          <>
            <ListItemButton 
              onClick={() => handleNavigation('/my-stories')}
              selected={isActive('/my-stories')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <LibraryBooksIcon color={isActive('/my-stories') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="My Stories" />
            </ListItemButton>

            <ListItemButton 
              onClick={() => handleNavigation('/write')}
              selected={isActive('/write')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <CreateIcon color={isActive('/write') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Write Story" />
            </ListItemButton>

            <ListItemButton 
              onClick={() => handleNavigation('/create')}
              selected={isActive('/create')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <AutoStoriesIcon color={isActive('/create') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="AI Generate" />
            </ListItemButton>

            <ListItemButton 
              onClick={() => handleNavigation('/account')}
              selected={isActive('/account')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonIcon color={isActive('/account') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Account Settings" />
            </ListItemButton>

            <Divider sx={{ my: 2 }} />

            <ListItemButton 
              onClick={handleLogoutClick}
              sx={{ py: 1.5 }}
              disabled={isLoggingOut}
            >
              <ListItemIcon>
                {isLoggingOut ? (
                  <CircularProgress size={20} />
                ) : (
                  <LogoutIcon color="error" />
                )}
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                primaryTypographyProps={{
                  color: 'error.main'
                }}
              />
            </ListItemButton>
          </>
        ) : (
          <>
            <ListItemButton 
              onClick={() => handleNavigation('/login')}
              selected={isActive('/login')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <LoginIcon color={isActive('/login') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Login" />
            </ListItemButton>

            <ListItemButton 
              onClick={() => handleNavigation('/signup')}
              selected={isActive('/signup')}
              sx={{ py: 1.5 }}
            >
              <ListItemIcon>
                <PersonAddIcon color={isActive('/signup') ? 'primary' : 'inherit'} />
              </ListItemIcon>
              <ListItemText primary="Sign Up" />
            </ListItemButton>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        sx={{ 
          backgroundColor: 'white',
          boxShadow: 1
        }}
      >
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
                  fontWeight: 'bold',
                  '&:hover': {
                    color: 'primary.dark'
                  }
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
                      color={isActive('/browse') ? 'primary' : 'default'}
                      size="large"
                    >
                      <SearchIcon />
                    </IconButton>
                  </Tooltip>

                  {loading ? (
                    <CircularProgress size={24} />
                  ) : currentUser ? (
                    <>
                      <Tooltip title="My Stories">
                        <IconButton
                          component={Link}
                          to="/my-stories"
                          color={isActive('/my-stories') ? 'primary' : 'default'}
                          size="large"
                        >
                          <LibraryBooksIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Write Story">
                        <IconButton
                          component={Link}
                          to="/write"
                          color={isActive('/write') ? 'primary' : 'default'}
                          size="large"
                        >
                          <CreateIcon />
                        </IconButton>
                      </Tooltip>

                      <Button
                        component={Link}
                        to="/create"
                        variant={isActive('/create') ? 'contained' : 'outlined'}
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
                          component={Link}
                          to="/login"
                          color={isActive('/login') ? 'primary' : 'default'}
                          size="large"
                        >
                          <LoginIcon />
                        </IconButton>
                      </Tooltip>

                      <Tooltip title="Sign Up">
                        <IconButton
                          component={Link}
                          to="/signup"
                          color={isActive('/signup') ? 'primary' : 'default'}
                          size="large"
                        >
                          <PersonAddIcon />
                        </IconButton>
                      </Tooltip>
                    </>
                  )}
                </>
              )}

              {currentUser && !loading && (
                <>
                  <Tooltip title="Account Menu">
                    <Box 
                      onClick={handleAccountMenuOpen}
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    >
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          border: '2px solid',
                          borderColor: isActive('/account') ? 'primary.main' : 'transparent',
                          transition: 'all 0.2s',
                          bgcolor: 'grey.200',
                          color: 'grey.700',
                          fontWeight: 'bold'
                        }}
                      >
                        {currentUser.username.charAt(0).toUpperCase()}
                      </Avatar>
                    </Box>
                  </Tooltip>
                  <Menu
                    anchorEl={anchorEl}
                    open={Boolean(anchorEl)}
                    onClose={handleAccountMenuClose}
                    onClick={handleAccountMenuClose}
                    PaperProps={{
                      elevation: 0,
                      sx: {
                        overflow: 'visible',
                        filter: 'drop-shadow(0px 2px 8px rgba(0,0,0,0.32))',
                        mt: 1.5,
                        '& .MuiAvatar-root': {
                          width: 32,
                          height: 32,
                          ml: -0.5,
                          mr: 1,
                        },
                        '&:before': {
                          content: '""',
                          display: 'block',
                          position: 'absolute',
                          top: 0,
                          right: 14,
                          width: 10,
                          height: 10,
                          bgcolor: 'background.paper',
                          transform: 'translateY(-50%) rotate(45deg)',
                          zIndex: 0,
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                    anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                  >
                    <MenuItem 
                      onClick={() => {
                        handleAccountMenuClose();
                        navigate('/account');
                      }}
                    >
                      <ListItemIcon>
                        <PersonIcon fontSize="small" />
                      </ListItemIcon>
                      Account Settings
                    </MenuItem>
                    <MenuItem 
                      onClick={() => {
                        handleAccountMenuClose();
                        handleLogoutClick();
                      }}
                      sx={{ color: 'error.main' }}
                    >
                      <ListItemIcon>
                        <LogoutIcon fontSize="small" color="error" />
                      </ListItemIcon>
                      Logout
                    </MenuItem>
                  </Menu>
                </>
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
          keepMounted: true // Better open performance on mobile
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

      <Dialog
        open={logoutDialogOpen}
        onClose={() => !isLoggingOut && setLogoutDialogOpen(false)}
      >
        <DialogTitle>Confirm Logout</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to log out?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={() => setLogoutDialogOpen(false)}
            disabled={isLoggingOut}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleLogout}
            color="error"
            disabled={isLoggingOut}
          >
            {isLoggingOut ? 'Logging out...' : 'Logout'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default Navbar;
