import { ThemeProvider, createTheme, CssBaseline } from '@mui/material'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import PrivateRoute from './components/PrivateRoute'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Browse from './pages/Browse'
import CreateStory from './pages/CreateStory'
import WriteStory from './pages/WriteStory'
import EditStory from './pages/EditStory'
import ViewStory from './pages/ViewStory'
import MyStories from './pages/MyStories'
import Account from './pages/Account'
import Login from './pages/Login'
import Signup from './pages/Signup'
import ResetPassword from './pages/ResetPassword'

const theme = createTheme({
  palette: {
    primary: {
      main: '#1a237e', // Dark blue from Material UI's indigo palette
      light: '#534bae',
      dark: '#000051',
    },
    secondary: {
      main: '#283593', // A complementary dark blue
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
})

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/browse" element={<Browse />} />
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
            <Route path="/story/:id" element={<ViewStory />} />
            <Route
              path="/account"
              element={
                <PrivateRoute>
                  <Account />
                </PrivateRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
