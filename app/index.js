import { Redirect } from 'expo-router';
import { useEffect, useState } from 'react';
import { firebaseService } from '../src/services/firebaseService';

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      // Check if user is logged in
      const currentUser = await firebaseService.getCurrentUser();
      
      if (currentUser && currentUser.isLoggedIn) {
        setIsAuthenticated(true);
      } else {
        setIsAuthenticated(false);
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    // Show splash screen while checking auth
    return <Redirect href="/main" />;
  }

  // Redirect based on authentication status
  if (isAuthenticated) {
    return <Redirect href="/(tabs)" />;
  } else {
    return <Redirect href="/main" />;
  }
}