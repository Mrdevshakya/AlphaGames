import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { useAuth } from './contexts/AuthContext';

// Components
import Dashboard from './pages/Dashboard';
import Login from './pages/Login';
import Tournaments from './pages/Tournaments';
import CreateTournament from './pages/CreateTournament';
import EditTournament from './pages/EditTournament';
import Analyzer from './pages/Analyzer';
import Sidebar from './components/Sidebar';
import Topbar from './components/Topbar';

// Create theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#6200ea',
    },
    secondary: {
      main: '#03dac6',
    },
    background: {
      default: '#f5f5f5',
    },
  },
});

// Protected route component
const ProtectedRoute = ({ children }) => {
  const { currentUser, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  if (!currentUser) {
    return <Navigate to="/login" />;
  }
  
  return children;
};

function App() {
  const { currentUser } = useAuth();

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div className="app-container">
        {currentUser && <Sidebar />}
        <div className="content">
          {currentUser && <Topbar />}
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            } />
            <Route path="/tournaments" element={
              <ProtectedRoute>
                <Tournaments />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/create" element={
              <ProtectedRoute>
                <CreateTournament />
              </ProtectedRoute>
            } />
            <Route path="/tournaments/edit/:id" element={
              <ProtectedRoute>
                <EditTournament />
              </ProtectedRoute>
            } />
            <Route path="/analyzer" element={
              <ProtectedRoute>
                <Analyzer />
              </ProtectedRoute>
            } />
          </Routes>
        </div>
      </div>
    </ThemeProvider>
  );
}

export default App;