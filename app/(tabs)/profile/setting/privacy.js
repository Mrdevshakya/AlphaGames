import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Switch,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const PrivacySettingsScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [privacySettings, setPrivacySettings] = useState({
    profileVisibility: 'public', // public, friends, private
    showOnlineStatus: true,
    showGameHistory: true,
    showEarnings: false,
    allowFriendRequests: true,
    allowMessages: true,
    showInLeaderboard: true,
    dataCollection: true,
    marketingEmails: false,
    analyticsTracking: true,
  });
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Load user privacy settings
        const userPrivacySettings = user.privacySettings || {};
        setPrivacySettings(prev => ({
          ...prev,
          ...userPrivacySettings
        }));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load privacy settings');
    } finally {
      setLoading(false);
    }
  };

  const updatePrivacySetting = async (key, value) => {
    try {
      const updatedSettings = {
        ...privacySettings,
        [key]: value
      };
      
      setPrivacySettings(updatedSettings);
      
      // Update in Firebase
      await firebaseService.updateUserProfile(currentUser.uid, {
        privacySettings: updatedSettings
      });
      
    } catch (error) {
      console.error('Error updating privacy setting:', error);
      Alert.alert('Error', 'Failed to update privacy setting');
      // Revert the change
      setPrivacySettings(prev => ({
        ...prev,
        [key]: !value
      }));
    }
  };

  const handleProfileVisibilityChange = () => {
    const options = [
      { label: 'Public', value: 'public', description: 'Anyone can see your profile' },
      { label: 'Friends Only', value: 'friends', description: 'Only your friends can see your profile' },
      { label: 'Private', value: 'private', description: 'Only you can see your profile' },
    ];

    Alert.alert(
      'Profile Visibility',
      'Choose who can see your profile information',
      [
        ...options.map(option => ({
          text: option.label,
          onPress: () => updatePrivacySetting('profileVisibility', option.value),
          style: privacySettings.profileVisibility === option.value ? 'default' : 'cancel'
        })),
        { text: 'Cancel', style: 'cancel' }
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Account',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Final Confirmation',
              'This will permanently delete your account and all associated data. Type "DELETE" to confirm.',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Confirm Delete',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      setLoading(true);
                      await firebaseService.deleteUserAccount(currentUser.uid);
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been successfully deleted.',
                        [{ text: 'OK', onPress: () => router.replace('/') }]
                      );
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    } finally {
                      setLoading(false);
                    }
                  }
                }
              ]
            );
          }
        }
      ]
    );
  };

  const handleExportData = () => {
    Alert.alert(
      'Export Data',
      'We will prepare your data export and send it to your registered email address within 24 hours.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Request Export',
          onPress: async () => {
            try {
              setLoading(true);
              // In production, this would trigger a data export process
              await firebaseService.requestDataExport(currentUser.uid);
              Alert.alert(
                'Export Requested',
                'Your data export has been requested. You will receive an email with download instructions within 24 hours.'
              );
            } catch (error) {
              console.error('Error requesting data export:', error);
              Alert.alert('Error', 'Failed to request data export. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const renderSettingItem = (title, description, value, onToggle, type = 'switch') => (
    <View style={styles.settingItem}>
      <View style={styles.settingContent}>
        <Text style={styles.settingTitle}>{title}</Text>
        <Text style={styles.settingDescription}>{description}</Text>
      </View>
      {type === 'switch' ? (
        <Switch
          value={value}
          onValueChange={onToggle}
          trackColor={{ false: '#333333', true: '#4CAF50' }}
          thumbColor={value ? '#FFFFFF' : '#666666'}
        />
      ) : (
        <TouchableOpacity onPress={onToggle} style={styles.settingButton}>
          <Text style={styles.settingButtonText}>
            {value === 'public' ? 'Public' : 
             value === 'friends' ? 'Friends' : 'Private'}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#666666" />
        </TouchableOpacity>
      )}
    </View>
  );

  const renderSectionHeader = (title, icon) => (
    <View style={styles.sectionHeader}>
      <Ionicons name={icon} size={20} color="#4CAF50" />
      <Text style={styles.sectionTitle}>{title}</Text>
    </View>
  );

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
        <Text style={styles.headerTitle}>Privacy & Security</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Privacy */}
        <View style={styles.section}>
          {renderSectionHeader('Profile Privacy', 'person-outline')}
          
          {renderSettingItem(
            'Profile Visibility',
            'Control who can see your profile information',
            privacySettings.profileVisibility,
            handleProfileVisibilityChange,
            'button'
          )}
          
          {renderSettingItem(
            'Show Online Status',
            'Let others see when you are online',
            privacySettings.showOnlineStatus,
            (value) => updatePrivacySetting('showOnlineStatus', value)
          )}
          
          {renderSettingItem(
            'Show Game History',
            'Display your recent games on your profile',
            privacySettings.showGameHistory,
            (value) => updatePrivacySetting('showGameHistory', value)
          )}
          
          {renderSettingItem(
            'Show Earnings',
            'Display your total earnings publicly',
            privacySettings.showEarnings,
            (value) => updatePrivacySetting('showEarnings', value)
          )}
        </View>

        {/* Social Privacy */}
        <View style={styles.section}>
          {renderSectionHeader('Social Privacy', 'people-outline')}
          
          {renderSettingItem(
            'Allow Friend Requests',
            'Let other players send you friend requests',
            privacySettings.allowFriendRequests,
            (value) => updatePrivacySetting('allowFriendRequests', value)
          )}
          
          {renderSettingItem(
            'Allow Messages',
            'Let other players send you messages',
            privacySettings.allowMessages,
            (value) => updatePrivacySetting('allowMessages', value)
          )}
          
          {renderSettingItem(
            'Show in Leaderboard',
            'Display your ranking in public leaderboards',
            privacySettings.showInLeaderboard,
            (value) => updatePrivacySetting('showInLeaderboard', value)
          )}
        </View>

        {/* Data Privacy */}
        <View style={styles.section}>
          {renderSectionHeader('Data Privacy', 'shield-outline')}
          
          {renderSettingItem(
            'Data Collection',
            'Allow collection of usage data to improve the app',
            privacySettings.dataCollection,
            (value) => updatePrivacySetting('dataCollection', value)
          )}
          
          {renderSettingItem(
            'Marketing Emails',
            'Receive promotional emails and offers',
            privacySettings.marketingEmails,
            (value) => updatePrivacySetting('marketingEmails', value)
          )}
          
          {renderSettingItem(
            'Analytics Tracking',
            'Allow anonymous analytics tracking',
            privacySettings.analyticsTracking,
            (value) => updatePrivacySetting('analyticsTracking', value)
          )}
        </View>

        {/* Data Management */}
        <View style={styles.section}>
          {renderSectionHeader('Data Management', 'document-outline')}
          
          <TouchableOpacity style={styles.actionButton} onPress={handleExportData}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="download-outline" size={24} color="#4CAF50" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Export My Data</Text>
                <Text style={styles.actionButtonDescription}>
                  Download a copy of all your data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Account Security */}
        <View style={styles.section}>
          {renderSectionHeader('Account Security', 'lock-closed-outline')}
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="key-outline" size={24} color="#FF9800" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Change Password</Text>
                <Text style={styles.actionButtonDescription}>
                  Update your account password
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666666" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <View style={styles.actionButtonContent}>
              <Ionicons name="phone-portrait-outline" size={24} color="#2196F3" />
              <View style={styles.actionButtonText}>
                <Text style={styles.actionButtonTitle}>Two-Factor Authentication</Text>
                <Text style={styles.actionButtonDescription}>
                  Add an extra layer of security
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#666666" />
          </TouchableOpacity>
        </View>

        {/* Danger Zone */}
        <View style={styles.section}>
          {renderSectionHeader('Danger Zone', 'warning-outline')}
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.dangerButton]} 
            onPress={handleDeleteAccount}
          >
            <View style={styles.actionButtonContent}>
              <Ionicons name="trash-outline" size={24} color="#FF5722" />
              <View style={styles.actionButtonText}>
                <Text style={[styles.actionButtonTitle, styles.dangerText]}>
                  Delete Account
                </Text>
                <Text style={styles.actionButtonDescription}>
                  Permanently delete your account and all data
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#FF5722" />
          </TouchableOpacity>
        </View>

        {/* Privacy Policy */}
        <View style={styles.section}>
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Privacy Policy</Text>
            <Ionicons name="open-outline" size={16} color="#4CAF50" />
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.linkButton}>
            <Text style={styles.linkText}>Terms of Service</Text>
            <Ionicons name="open-outline" size={16} color="#4CAF50" />
          </TouchableOpacity>
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 30,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingContent: {
    flex: 1,
    marginRight: 15,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  settingDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  settingButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333333',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  settingButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 5,
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  dangerButton: {
    borderColor: '#FF5722' + '30',
    backgroundColor: '#FF5722' + '10',
  },
  actionButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  actionButtonText: {
    marginLeft: 15,
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  actionButtonDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  dangerText: {
    color: '#FF5722',
  },
  linkButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  linkText: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
  },
  footerSpacing: {
    height: 50,
  },
});

export default PrivacySettingsScreen;
