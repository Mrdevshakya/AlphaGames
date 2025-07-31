import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Switch,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const NotificationSettingsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [settings, setSettings] = useState({
    pushNotifications: true,
    emailNotifications: true,
    smsNotifications: false,
    gameInvites: true,
    tournamentUpdates: true,
    walletUpdates: true,
    promotionalOffers: false,
    friendRequests: true,
    gameResults: true,
    dailyReminders: false,
  });
  const router = useRouter();

  useEffect(() => {
    loadNotificationSettings();
  }, []);

  const loadNotificationSettings = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Load user's notification settings from Firebase
        if (user.notificationSettings) {
          setSettings(prev => ({
            ...prev,
            ...user.notificationSettings
          }));
        }
      }
    } catch (error) {
      console.error('Error loading notification settings:', error);
    }
  };

  const updateSetting = async (key, value) => {
    const newSettings = {
      ...settings,
      [key]: value
    };
    
    setSettings(newSettings);

    try {
      // Update settings in Firebase
      await firebaseService.updateUser(currentUser.uid, {
        notificationSettings: newSettings,
        updatedAt: new Date().toISOString(),
      });
    } catch (error) {
      console.error('Error updating notification settings:', error);
      // Revert the change if Firebase update fails
      setSettings(settings);
      Alert.alert('Error', 'Failed to update notification settings');
    }
  };

  const renderSettingItem = (key, title, description, icon) => (
    <View key={key} style={styles.settingItem}>
      <View style={styles.settingIcon}>
        <Ionicons name={icon} size={24} color="#FFFFFF" />
      </View>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      <Switch
        value={settings[key]}
        onValueChange={(value) => updateSetting(key, value)}
        trackColor={{ false: '#333333', true: '#4CAF50' }}
        thumbColor={settings[key] ? '#FFFFFF' : '#666666'}
        disabled={loading}
      />
    </View>
  );

  const resetToDefaults = () => {
    Alert.alert(
      'Reset to Defaults',
      'Are you sure you want to reset all notification settings to default values?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: async () => {
            const defaultSettings = {
              pushNotifications: true,
              emailNotifications: true,
              smsNotifications: false,
              gameInvites: true,
              tournamentUpdates: true,
              walletUpdates: true,
              promotionalOffers: false,
              friendRequests: true,
              gameResults: true,
              dailyReminders: false,
            };
            
            setSettings(defaultSettings);
            
            try {
              await firebaseService.updateUser(currentUser.uid, {
                notificationSettings: defaultSettings,
                updatedAt: new Date().toISOString(),
              });
              Alert.alert('Success', 'Notification settings reset to defaults');
            } catch (error) {
              console.error('Error resetting settings:', error);
              Alert.alert('Error', 'Failed to reset settings');
            }
          }
        }
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Notifications</Text>
        <TouchableOpacity 
          style={styles.resetButton} 
          onPress={resetToDefaults}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* General Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>General Notifications</Text>
          <Text style={styles.sectionDescription}>
            Control how you receive notifications from AlphaGames
          </Text>
          
          {renderSettingItem(
            'pushNotifications',
            'Push Notifications',
            'Receive notifications on your device',
            'notifications-outline'
          )}
          
          {renderSettingItem(
            'emailNotifications',
            'Email Notifications',
            'Receive notifications via email',
            'mail-outline'
          )}
          
          {renderSettingItem(
            'smsNotifications',
            'SMS Notifications',
            'Receive important updates via SMS',
            'chatbubble-outline'
          )}
        </View>

        {/* Game Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Game Notifications</Text>
          <Text style={styles.sectionDescription}>
            Stay updated about your games and matches
          </Text>
          
          {renderSettingItem(
            'gameInvites',
            'Game Invites',
            'Get notified when friends invite you to games',
            'game-controller-outline'
          )}
          
          {renderSettingItem(
            'gameResults',
            'Game Results',
            'Receive notifications about game outcomes',
            'trophy-outline'
          )}
          
          {renderSettingItem(
            'tournamentUpdates',
            'Tournament Updates',
            'Get updates about tournaments you joined',
            'medal-outline'
          )}
        </View>

        {/* Account Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Account Notifications</Text>
          <Text style={styles.sectionDescription}>
            Important updates about your account and wallet
          </Text>
          
          {renderSettingItem(
            'walletUpdates',
            'Wallet Updates',
            'Notifications for deposits, withdrawals, and transactions',
            'wallet-outline'
          )}
          
          {renderSettingItem(
            'friendRequests',
            'Friend Requests',
            'Get notified about new friend requests',
            'people-outline'
          )}
        </View>

        {/* Marketing Notifications */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Marketing & Promotions</Text>
          <Text style={styles.sectionDescription}>
            Optional notifications about offers and updates
          </Text>
          
          {renderSettingItem(
            'promotionalOffers',
            'Promotional Offers',
            'Receive notifications about special offers and bonuses',
            'gift-outline'
          )}
          
          {renderSettingItem(
            'dailyReminders',
            'Daily Reminders',
            'Get reminded to play daily and claim bonuses',
            'time-outline'
          )}
        </View>

        {/* Information Section */}
        <View style={styles.infoSection}>
          <View style={styles.infoItem}>
            <Ionicons name="information-circle-outline" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>
              You can change these settings anytime. Some notifications are required for security and account updates.
            </Text>
          </View>
          
          <View style={styles.infoItem}>
            <Ionicons name="shield-checkmark-outline" size={20} color="#4CAF50" />
            <Text style={styles.infoText}>
              Critical security notifications cannot be disabled to protect your account.
            </Text>
          </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  backButton: {
    padding: 5,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  resetButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  sectionDescription: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 20,
    lineHeight: 20,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingContent: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 18,
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 15,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    color: '#CCCCCC',
    lineHeight: 20,
    marginLeft: 10,
  },
  footerSpacing: {
    height: 50,
  },
});

export default NotificationSettingsScreen;
