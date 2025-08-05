import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { firebaseService } from '../../src/services/firebaseService';

const { width } = Dimensions.get('window');

const LudoModesScreen = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedMode, setSelectedMode] = useState(null);

  // Ludo game modes
  const gameModes = [
    {
      id: '1v1',
      title: '1 vs 1',
      players: '2 Players',
      duration: '10-15 min',
      entryFee: 50,
      prize: 200,
      difficulty: 'Easy',
      description: 'Classic head-to-head Ludo battle',
    },
    {
      id: '2v2',
      title: '2 vs 2',
      players: '4 Players',
      duration: '15-20 min',
      entryFee: 100,
      prize: 400,
      difficulty: 'Medium',
      description: 'Team-based Ludo with strategic gameplay',
    },
    {
      id: '3-player',
      title: '3 Players',
      players: '3 Players',
      duration: '12-18 min',
      entryFee: 75,
      prize: 300,
      difficulty: 'Medium',
      description: 'Three-player Ludo with unique dynamics',
    },
    {
      id: '4-player',
      title: '4 Players',
      players: '4 Players',
      duration: '20-25 min',
      entryFee: 150,
      prize: 600,
      difficulty: 'Hard',
      description: 'Full four-player Ludo experience',
    }
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const handleSelectMode = async (mode) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to play games');
      return;
    }

    // Check if user has sufficient balance
    if (currentUser.walletBalance < mode.entryFee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ₹${mode.entryFee} to play ${mode.title}. Please add money to your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Money', onPress: () => router.push('/add-money') }
        ]
      );
      return;
    }

    setSelectedMode(mode);
    
    Alert.alert(
      'Join Game',
      `Do you want to play ${mode.title}?

Entry Fee: ₹${mode.entryFee}
Prize Pool: ₹${mode.prize}
Players: ${mode.players}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Play Now', onPress: () => startGame(mode) }
      ]
    );
  };

  const startGame = async (mode) => {
    try {
      // Redirect to the actual Ludo game
      router.push('/ludo');
      
      // In a real implementation, you would:
      // 1. Create a game room in Firebase
      // 2. Deduct entry fee from user's wallet
      // 3. Handle matchmaking
    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const renderModeCard = (mode) => (
    <TouchableOpacity 
      key={mode.id} 
      style={styles.modeCard}
      onPress={() => handleSelectMode(mode)}
    >
      <View style={styles.modeCardContent}>
        <View style={styles.modeHeader}>
          <View style={styles.modeInfo}>
            <Text style={styles.modeTitle}>{mode.title}</Text>
            <Text style={styles.modePlayers}>{mode.players}</Text>
            <Text style={styles.modeDescription}>{mode.description}</Text>
          </View>
          <View style={[
            styles.difficultyBadge, 
            {
              backgroundColor: 
                mode.difficulty === 'Easy' ? '#4ecdc4' : 
                mode.difficulty === 'Medium' ? '#ffb62d' : 
                '#ff6b6b'
            }
          ]}>
            <Text style={styles.difficultyText}>{mode.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.modeDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>{mode.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              Entry: {mode.entryFee === 0 ? 'Free' : `₹${mode.entryFee}`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="trophy-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              Prize: {mode.prize === 0 ? 'Experience' : `₹${mode.prize}`}
            </Text>
          </View>
        </View>
        
        <View style={styles.playButton}>
          <Text style={styles.playButtonText}>Play Now</Text>
          <Ionicons name="play" size={16} color="#000000" />
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <View style={styles.headerSafeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Ludo Game Modes</Text>
          {currentUser && (
            <View style={styles.balanceContainer}>
              <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
              <Text style={styles.balanceText}>₹{(currentUser.walletBalance || 0).toLocaleString()}</Text>
            </View>
          )}
        </View>
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.content}
      >
        <Text style={styles.sectionTitle}>Select a Game Mode</Text>
        <Text style={styles.sectionSubtitle}>
          Choose from different Ludo variations to play with friends or other players
        </Text>
        
        <View style={styles.modesContainer}>
          {gameModes.map(renderModeCard)}
        </View>
        
        <View style={styles.footerSpacing} />
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerSafeArea: {
    backgroundColor: '#000000',
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 20,
    backgroundColor: '#000000',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 22,
    fontWeight: 'bold',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  balanceText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 16,
    color: '#888888',
    marginBottom: 24,
    lineHeight: 22,
  },
  modesContainer: {
    marginBottom: 20,
  },
  modeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  modeCardContent: {
    padding: 15,
  },
  modeHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  modeInfo: {
    flex: 1,
    marginRight: 8,
  },
  modeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  modePlayers: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  modeDescription: {
    fontSize: 13,
    color: '#888888',
    lineHeight: 18,
  },
  difficultyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  difficultyText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  modeDetails: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    marginBottom: 16,
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 13,
    color: '#AAAAAA',
    marginLeft: 4,
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  footerSpacing: {
    height: 20,
  },
});

export default LudoModesScreen;
