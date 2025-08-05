import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

// Import screens
import SplashScreen from '$components/SplashScreen';
import { firebaseService } from '../src/services/firebaseService';
import LoginScreen from './(auth)/LoginScreen';
import RegisterScreen from './(auth)/RegisterScreen';

export default function MainApp() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState('Login');
  const router = useRouter();

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const checkLoginStatus = async () => {
    try {
      // Check if user is logged in using Firebase service
      const currentUser = await firebaseService.getCurrentUser();
      
      if (currentUser && currentUser.isLoggedIn) {
        setIsLoggedIn(true);
        // Redirect to tabs
        router.replace('/(tabs)');
        return;
      } else {
        setIsLoggedIn(false);
      }
    } catch (error) {
      console.error('Error checking login status:', error);
      setIsLoggedIn(false);
    } finally {
      // Add a delay to show the splash screen
      setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }
  };

  // Navigation object to pass to screens
  const navigation = {
    navigate: (screenName, params) => {
      if (screenName === 'Home') {
        router.replace('/(tabs)');
      } else {
        setCurrentScreen(screenName);
      }
    },
    replace: (screenName, params) => {
      if (screenName === 'Home') {
        router.replace('/(tabs)');
      } else {
        setCurrentScreen(screenName);
      }
    },
    goBack: () => {
      // Simple back navigation
      if (currentScreen === 'Register') {
        setCurrentScreen('Login');
      } else if (currentScreen === 'Home') {
        setCurrentScreen('Login');
      } else {
        setCurrentScreen('Login');
      }
    }
  };

  if (isLoading) {
    return <SplashScreen />;
  }

  // If user is already logged in, redirect to tabs
  if (isLoggedIn) {
    return <View style={styles.container} />;
  }

  // Render the appropriate screen based on current state
  const renderScreen = () => {
    switch (currentScreen) {
      case 'Login':
        return <LoginScreen navigation={navigation} />;
      case 'Register':
        return <RegisterScreen navigation={navigation} />;
      default:
        return <LoginScreen navigation={navigation} />;
    }
  };

  return <View style={styles.container}>{renderScreen()}</View>;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
});