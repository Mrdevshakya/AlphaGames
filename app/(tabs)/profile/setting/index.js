import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { Alert, FlatList, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const settingsOptions = [
  { key: 'edit-profile', title: 'Edit Profile', icon: 'person-circle-outline' },
  { key: 'notifications', title: 'Notifications', icon: 'notifications-outline' },
  { key: 'privacy', title: 'Privacy', icon: 'lock-closed-outline' },
  { key: 'terms', title: 'Terms & Conditions', icon: 'document-text-outline' },
  { key: 'refunds', title: 'Refund Policy', icon: 'cash-outline' },
  { key: 'help', title: 'Help & Support', icon: 'help-circle-outline' },
  { key: 'logout', title: 'Logout', icon: 'log-out-outline', color: '#FF4444' },
];

const SettingsScreen = () => {
  const router = useRouter();

  const handlePress = (key) => {
    if (key === 'logout') {
      Alert.alert(
        'Logout',
        'Are you sure you want to log out?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'OK',
            onPress: () => {
              console.log('User logged out');
              // In a real app, you would clear user session and navigate to a login screen.
              // For now, we'll navigate back to the main profile screen.
              router.replace('/(auth)/LoginScreen');
            },
          },
        ],
        { cancelable: false }
      );
    } else {
      router.push(`/profile/setting/${key}`);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity style={styles.settingItem} onPress={() => handlePress(item.key)}>
      <Ionicons name={item.icon} size={24} color={item.color || '#FFFFFF'} />
      <Text style={[styles.settingText, { color: item.color || '#FFFFFF' }]}>{item.title}</Text>
      <Ionicons name="chevron-forward" size={24} color="#666666" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <FlatList
        data={settingsOptions}
        renderItem={renderItem}
        keyExtractor={(item) => item.key}
        contentContainerStyle={styles.listContainer}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  settingItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  settingText: {
    flex: 1,
    fontSize: 16,
    marginLeft: 16,
  },
});

export default SettingsScreen;
