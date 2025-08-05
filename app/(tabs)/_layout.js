import { Ionicons } from '@expo/vector-icons';
import { Tabs, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function TabLayout() {
  const router = useRouter();
    const segments = useSegments();
  
  // State for notifications and messages count
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(3);
  const [unreadMessagesCount, setUnreadMessagesCount] = useState(5);

  // Handle notification press
  const handleNotificationPress = () => {
    console.log('Notification pressed');
    // Add navigation logic here
  };

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setUnreadNotificationsCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
      setUnreadMessagesCount(prev => Math.max(0, prev + Math.floor(Math.random() * 3) - 1));
    }, 30000);

    return () => clearInterval(interval);
  }, []);

  return (
    <>
      <StatusBar style="light" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#FFFFFF',
          tabBarInactiveTintColor: '#666666',
          headerShown: !segments.includes('setting') && !segments.includes('tournaments') && !segments.includes('leaderboard'),
          headerStyle: {
            backgroundColor: '#000000',
            borderBottomWidth: 1,
            borderBottomColor: '#333333',
          },
          headerTintColor: '#FFFFFF',
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          tabBarStyle: {
            backgroundColor: '#000000',
            borderTopWidth: 2,
            borderTopColor: '#333333',
            height: 70,
            paddingBottom: 10,
            paddingTop: 10,
            elevation: 15,
            shadowColor: '#FFFFFF',
            shadowOffset: {
              width: 0,
              height: -3,
            },
            shadowOpacity: 0.1,
            shadowRadius: 5,
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: 'bold',
            marginTop: 4,
            textTransform: 'uppercase',
            letterSpacing: 0.5,
          },
          tabBarIconStyle: {
            marginTop: 4,
          },
          tabBarItemStyle: {
            paddingVertical: 4,
          },
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Home',
            headerShown: false,
            headerTitle: 'AlphaGames',
            headerRight: () => (
              <TouchableOpacity
                style={styles.notificationButton}
                onPress={handleNotificationPress}
              >
                <Ionicons name="notifications-outline" size={24} color="#FFFFFF" />
                {unreadNotificationsCount > 0 && (
                  <View style={styles.notificationBadge}>
                    <Text style={styles.notificationBadgeText}>
                      {unreadNotificationsCount > 99 ? '99+' : unreadNotificationsCount}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            ),
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={focused ? "home" : "home-outline"} size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="games"
          options={{
            title: 'Games',
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={focused ? "game-controller" : "game-controller-outline"} size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="tournaments"
          options={{
            title: 'Tournaments',
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={focused ? "trophy" : "trophy-outline"} size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="leaderboard"
          options={{
            title: 'Leaderboard',
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={focused ? "podium" : "podium-outline"} size={size} color={color} />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            title: 'Profile',
            headerShown: false,
            tabBarIcon: ({ color, size, focused }) => (
              <View style={[styles.iconContainer, focused && styles.focusedIconContainer]}>
                <Ionicons name={focused ? "person" : "person-outline"} size={size} color={color} />
                {unreadMessagesCount > 0 && (
                  <View style={styles.badgeContainer}>
                    <Text style={styles.badgeText}>
                      {unreadMessagesCount > 99 ? '99+' : unreadMessagesCount}
                    </Text>
                  </View>
                )}
              </View>
            ),
          }}
        />
      </Tabs>
    </>
  );
}

const styles = StyleSheet.create({
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    width: 50,
    height: 35,
    borderRadius: 15,
    marginBottom: 2,
  },
  focusedIconContainer: {
    backgroundColor: '#333333',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#666666',
    transform: [{ scale: 1.1 }],
    shadowColor: '#FFFFFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeContainer: {
    position: 'absolute',
    right: -6,
    top: -2,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  notificationButton: {
    marginRight: 15,
    position: 'relative',
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  notificationBadge: {
    position: 'absolute',
    right: 0,
    top: 0,
    backgroundColor: '#FF4444',
    borderRadius: 12,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
    borderWidth: 2,
    borderColor: '#000000',
    shadowColor: '#FF4444',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  notificationBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  settingsButton: {
    marginRight: 15,
    position: 'relative',
    padding: 6,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
});