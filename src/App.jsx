import { ThemeProvider, createTheme, CssBaseline } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import PrivateRoute from './components/PrivateRoute';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Browse from './pages/Browse';
import CreateStory from './pages/CreateStory';
import WriteStory from './pages/WriteStory';
import EditStory from './pages/EditStory';
import ViewStory from './pages/ViewStory';
import MyStories from './pages/MyStories';
import Account from './pages/Account';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ResetPassword from './pages/ResetPassword';
import { useAuth } from './context/AuthContext';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e',
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#283593',
      light: '#5f5fc4',
      dark: '#001064',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: 'Inter, system-ui, sans-serif',
  },
});

// AuthWrapper component to handle auth-dependent redirects
const AuthWrapper = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // Redirect authenticated users away from auth pages
  const isAuthPage = window.location.pathname === '/login' || 
                    window.location.pathname === '/signup' ||
                    window.location.pathname === '/reset-password';

  if (isAuthenticated() && isAuthPage) {
    // Get the intended destination from state, or default to home
    const from = window.location.state?.from || '/';
    return <Navigate to={from} replace />;
  }

  return children;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<Home />} />
            <Route path="/browse" element={<Browse />} />
            <Route path="/story/:id" element={<ViewStory />} />

            {/* Auth Routes */}
            <Route 
              path="/login" 
              element={
                <AuthWrapper>
                  <Login />
                </AuthWrapper>
              } 
            />
            <Route 
              path="/signup" 
              element={
                <AuthWrapper>
                  <Signup />
                </AuthWrapper>
              } 
            />
            <Route 
              path="/reset-password" 
              element={
                <AuthWrapper>
                  <ResetPassword />
                </AuthWrapper>
              } 
            />

            {/* Protected Routes */}
            <Route 
              path="/create" 
              element={
                <PrivateRoute>
                  <CreateStory />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/write" 
              element={
                <PrivateRoute>
                  <WriteStory />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/story/:id/edit" 
              element={
                <PrivateRoute>
                  <EditStory />
                </PrivateRoute>
              } 
            />
            <Route 
              path="/my-stories" 
              element={
                <PrivateRoute>
                  <MyStories />
                </PrivateRoute>
              } 
            />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />

            {/* Catch-all route for 404s */}
            <Route 
              path="*" 
              element={
                <Navigate 
                  to="/" 
                  replace 
                />
              } 
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
