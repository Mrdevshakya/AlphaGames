import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  RefreshControl,
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

const GamesScreen = () => {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All Games', icon: 'grid-outline' },
    { id: 'quick', name: 'Quick Match', icon: 'flash-outline' },
    { id: 'tournament', name: 'Tournaments', icon: 'trophy-outline' },
    { id: 'practice', name: 'Practice', icon: 'school-outline' },
  ];

  // Game modes available in the app
  const games = [
    {
      id: 1,
      title: 'Dice Master',
      category: 'quick',
      players: '2-4 Players',
      duration: '5-10 min',
      entryFee: 50,
      prize: 200,
      difficulty: 'Easy',
      icon: 'dice-outline',
      description: 'Classic dice rolling game with strategic moves',
    },
    {
      id: 2,
      title: 'Card Battle',
      category: 'quick',
      players: '2-6 Players',
      duration: '10-15 min',
      entryFee: 100,
      prize: 500,
      difficulty: 'Medium',
      icon: 'card-outline',
      description: 'Strategic card game with multiple rounds',
    },
    {
      id: 3,
      title: 'Strategy Arena',
      category: 'tournament',
      players: '8-16 Players',
      duration: '30-45 min',
      entryFee: 200,
      prize: 2000,
      difficulty: 'Hard',
      icon: 'game-controller-outline',
      description: 'Advanced strategy game for experienced players',
    },
    {
      id: 4,
      title: 'Practice Mode',
      category: 'practice',
      players: '1-4 Players',
      duration: 'Unlimited',
      entryFee: 0,
      prize: 0,
      difficulty: 'All Levels',
      icon: 'school-outline',
      description: 'Practice with AI opponents to improve your skills',
    },
    {
      id: 5,
      title: 'Ludo Classic',
      category: 'quick',
      players: '2-4 Players',
      duration: '15-20 min',
      entryFee: 75,
      prize: 300,
      difficulty: 'Easy',
      icon: 'grid-outline',
      description: 'Traditional Ludo game with modern features',
    },
    {
      id: 6,
      title: 'Speed Ludo',
      category: 'quick',
      players: '2-4 Players',
      duration: '5-8 min',
      entryFee: 25,
      prize: 100,
      difficulty: 'Easy',
      icon: 'flash-outline',
      description: 'Fast-paced Ludo with shorter game time',
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await firebaseService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadUserData();
    setRefreshing(false);
  }, []);

  const filteredGames = games.filter(game => 
    selectedCategory === 'all' || game.category === selectedCategory
  );

  const handlePlayGame = async (game) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to play games');
      return;
    }

    if (game.category === 'practice') {
      // Practice mode is free
      Alert.alert(
        'Practice Mode',
        'Practice mode will be available soon! Perfect for improving your skills.',
        [{ text: 'OK' }]
      );
      return;
    }

    // Check if user has sufficient balance
    if (currentUser.walletBalance < game.entryFee) {
      Alert.alert(
        'Insufficient Balance',
        `You need ₹${game.entryFee} to play ${game.title}. Please add money to your wallet.`,
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Money', onPress: handleAddMoney }
        ]
      );
      return;
    }

    Alert.alert(
      'Join Game',
      `Do you want to play ${game.title}?\n\nEntry Fee: ₹${game.entryFee}\nPrize Pool: ₹${game.prize}\nPlayers: ${game.players}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Play Now', onPress: () => startGame(game) }
      ]
    );
  };

  const startGame = async (game) => {
    try {
      // Here you would implement the actual game creation logic
      // For now, we'll show a success message
      Alert.alert(
        'Game Starting',
        `Looking for players for ${game.title}...\n\nThis feature will be fully implemented soon!`,
        [{ text: 'OK' }]
      );

      // In a real implementation, you would:
      // 1. Create a game room in Firebase
      // 2. Deduct entry fee from user's wallet
      // 3. Navigate to the game screen
      // 4. Handle matchmaking

    } catch (error) {
      console.error('Error starting game:', error);
      Alert.alert('Error', 'Failed to start game. Please try again.');
    }
  };

  const handleAddMoney = () => {
    Alert.alert(
      'Add Money',
      'Payment gateway integration coming soon!',
      [{ text: 'OK' }]
    );
  };

  const renderGameCard = (game) => (
    <TouchableOpacity key={game.id} style={styles.gameCard} onPress={() => handlePlayGame(game)}>
      <View style={styles.gameCardContent}>
        <View style={styles.gameHeader}>
          <View style={styles.gameIconContainer}>
            <Ionicons name={game.icon} size={32} color="#FFFFFF" />
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gamePlayers}>{game.players}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
          </View>
          <View style={[styles.difficultyBadge, {
            backgroundColor: game.difficulty === 'Easy' ? '#2ecc71' : 
                           game.difficulty === 'Medium' ? '#f39c12' : '#e74c3c'
          }]}>
            <Text style={styles.difficultyText}>{game.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.gameDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>{game.duration}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              Entry: {game.entryFee === 0 ? 'Free' : `₹${game.entryFee}`}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="trophy-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              Prize: {game.prize === 0 ? 'Experience' : `₹${game.prize}`}
            </Text>
          </View>
        </View>

        <TouchableOpacity 
          style={[styles.playButton, {
            backgroundColor: game.category === 'practice' ? '#3498db' : '#FFFFFF'
          }]}
          onPress={() => handlePlayGame(game)}
        >
          <Text style={[styles.playButtonText, {
            color: game.category === 'practice' ? '#FFFFFF' : '#000000'
          }]}>
            {game.category === 'practice' ? 'Practice' : 'Play Now'}
          </Text>
          <Ionicons 
            name="play" 
            size={16} 
            color={game.category === 'practice' ? '#FFFFFF' : '#000000'} 
          />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Games</Text>
          {currentUser && (
            <View style={styles.balanceContainer}>
              <Ionicons name="wallet-outline" size={16} color="#FFFFFF" />
              <Text style={styles.balanceText}>₹{(currentUser.walletBalance || 0).toLocaleString()}</Text>
            </View>
          )}
        </View>
      </SafeAreaView>

      <ScrollView
        stickyHeaderIndices={[0]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.stickyHeader}>
          {/* Categories */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category.id;
              const buttonContent = (
                <View style={styles.categoryButtonContent}>
                    <Ionicons 
                      name={category.icon} 
                      size={20} 
                      color={isActive ? '#000000' : '#FFFFFF'} 
                    />
                    <Text style={[styles.categoryText, isActive && styles.activeCategoryText]}>
                      {category.name}
                    </Text>
                </View>
              );

              return (
                <TouchableOpacity
                  key={category.id}
                  onPress={() => setSelectedCategory(category.id)}
                  style={{ marginHorizontal: 5 }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#FFFFFF', '#FFFFFF']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={[styles.categoryButton, { marginHorizontal: 0 }]}
                    >
                      {buttonContent}
                    </LinearGradient>
                  ) : (
                    <View style={[styles.categoryButton, styles.inactiveCategoryButton, { marginHorizontal: 0 }]}>
                      {buttonContent}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })} 
          </ScrollView>
        </View>

        {/* Games List */}
        <View style={styles.content}>
          <Text style={styles.sectionTitle}>
            {selectedCategory === 'all' ? 'All Games' : categories.find(c => c.id === selectedCategory)?.name}
          </Text>
          
          {loading ? (
            <View style={styles.loadingContainer}>
              <Text style={styles.loadingText}>Loading games...</Text>
            </View>
          ) : filteredGames.length > 0 ? (
            filteredGames.map(renderGameCard)
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="game-controller-outline" size={64} color="#333333" />
              <Text style={styles.emptyText}>No games available</Text>
              <Text style={styles.emptySubtext}>Check back later for new games!</Text>
            </View>
          )}
          
          <View style={styles.footerSpacing} />
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  headerSafeArea: {
    backgroundColor: '#000000',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 5,
    backgroundColor: '#000000',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 26,
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
  stickyHeader: {
    backgroundColor: '#000000',
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  categoriesContainer: {
    backgroundColor: '#000000',
    paddingVertical: 10,
  },
  categoriesContent: {
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  inactiveCategoryButton: {
    backgroundColor: '#222222',
    borderWidth: 1,
    borderColor: '#444444',
  },
  categoryButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  categoryText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  activeCategoryText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666666',
    fontSize: 16,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  gameCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gameCardContent: {
    padding: 15,
  },
  gameHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  gameIconContainer: {
    width: 50,
    height: 50,
    backgroundColor: '#333333',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  gameInfo: {
    flex: 1,
    marginRight: 8,
  },
  gameTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gamePlayers: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  gameDescription: {
    fontSize: 12,
    color: '#888888',
    lineHeight: 16,
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
  gameDetails: {
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
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
    borderRadius: 8,
  },
  playButtonText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  footerSpacing: {
    height: 20,
  },
});

export default GamesScreen;