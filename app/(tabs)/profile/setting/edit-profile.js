import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const EditProfileScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phoneNumber: '',
    bio: '',
  });
  const router = useRouter();

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setFormData({
          fullName: user.fullName || '',
          email: user.email || '',
          phoneNumber: user.phoneNumber || '',
          bio: user.bio || '',
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      Alert.alert('Error', 'Failed to load profile data');
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const validateForm = () => {
    if (!formData.fullName.trim()) {
      Alert.alert('Validation Error', 'Please enter your full name');
      return false;
    }
    if (!formData.email.trim() || !formData.email.includes('@')) {
      Alert.alert('Validation Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const saveProfile = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // Update user profile in Firebase
      await firebaseService.updateUser(currentUser.uid, {
        fullName: formData.fullName.trim(),
        email: formData.email.trim(),
        bio: formData.bio.trim(),
        updatedAt: new Date().toISOString(),
      });

      Alert.alert(
        'Success',
        'Profile updated successfully!',
        [
          {
            text: 'OK',
            onPress: () => router.back()
          }
        ]
      );
    } catch (error) {
      console.error('Error updating profile:', error);
      Alert.alert('Error', 'Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
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
        <Text style={styles.headerTitle}>Edit Profile</Text>
        <TouchableOpacity 
          style={styles.saveButton} 
          onPress={saveProfile}
          disabled={loading}
        >
          <Text style={[styles.saveButtonText, loading && styles.disabledText]}>
            {loading ? 'Saving...' : 'Save'}
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Profile Picture Section */}
        <View style={styles.avatarSection}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatarPlaceholder}>
              <Ionicons name="person" size={60} color="#666666" />
            </View>
          </View>
          <Text style={styles.avatarText}>Profile Picture</Text>
        </View>

        {/* Form Fields */}
        <View style={styles.formSection}>
          {/* Full Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#666666" />
              <TextInput
                style={styles.textInput}
                value={formData.fullName}
                onChangeText={(value) => handleInputChange('fullName', value)}
                placeholder="Enter your full name"
                placeholderTextColor="#666666"
                editable={!loading}
              />
            </View>
          </View>

          {/* Email */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email Address *</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#666666" />
              <TextInput
                style={styles.textInput}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                placeholder="Enter your email"
                placeholderTextColor="#666666"
                keyboardType="email-address"
                autoCapitalize="none"
                editable={!loading}
              />
            </View>
          </View>

          {/* Phone Number (Read Only) */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <View style={[styles.inputContainer, styles.disabledInput]}>
              <Ionicons name="call-outline" size={20} color="#666666" />
              <TextInput
                style={[styles.textInput, styles.disabledText]}
                value={formData.phoneNumber}
                placeholder="Phone number"
                placeholderTextColor="#666666"
                editable={false}
              />
              <Ionicons name="lock-closed-outline" size={16} color="#666666" />
            </View>
            <Text style={styles.helperText}>
              Phone number cannot be changed for security reasons
            </Text>
          </View>

          {/* Bio */}
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Bio</Text>
            <View style={[styles.inputContainer, styles.textAreaContainer]}>
              <TextInput
                style={[styles.textInput, styles.textArea]}
                value={formData.bio}
                onChangeText={(value) => handleInputChange('bio', value)}
                placeholder="Tell us about yourself..."
                placeholderTextColor="#666666"
                multiline
                numberOfLines={4}
                textAlignVertical="top"
                editable={!loading}
                maxLength={200}
              />
            </View>
            <Text style={styles.characterCount}>
              {formData.bio.length}/200 characters
            </Text>
          </View>
        </View>

        {/* Account Information */}
        <View style={styles.infoSection}>
          <Text style={styles.sectionTitle}>Account Information</Text>
          
          <View style={styles.infoItem}>
            <Ionicons name="calendar-outline" size={20} color="#666666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {currentUser?.createdAt ? 
                  new Date(currentUser.createdAt).toLocaleDateString('en-US', { 
                    month: 'long', 
                    year: 'numeric' 
                  }) : 
                  'Recently'
                }
              </Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="trophy-outline" size={20} color="#666666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Games Won</Text>
              <Text style={styles.infoValue}>{currentUser?.gamesWon || 0}</Text>
            </View>
          </View>

          <View style={styles.infoItem}>
            <Ionicons name="stats-chart-outline" size={20} color="#666666" />
            <View style={styles.infoContent}>
              <Text style={styles.infoLabel}>Win Rate</Text>
              <Text style={styles.infoValue}>
                {currentUser?.gamesPlayed > 0 ? 
                  Math.round((currentUser.gamesWon / currentUser.gamesPlayed) * 100) : 0
                }%
              </Text>
            </View>
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
  saveButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
  },
  saveButtonText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  avatarContainer: {
    marginBottom: 10,
  },
  avatarPlaceholder: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  avatarText: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  formSection: {
    marginBottom: 30,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  disabledInput: {
    backgroundColor: '#0F0F0F',
    opacity: 0.7,
  },
  textInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  textArea: {
    height: 80,
    marginLeft: 0,
  },
  helperText: {
    color: '#666666',
    fontSize: 12,
    marginTop: 5,
  },
  characterCount: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'right',
    marginTop: 5,
  },
  infoSection: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoContent: {
    flex: 1,
    marginLeft: 15,
  },
  infoLabel: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 2,
  },
  infoValue: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  footerSpacing: {
    height: 50,
  },
});

export default EditProfileScreen;
