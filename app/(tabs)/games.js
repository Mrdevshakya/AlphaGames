import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
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
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const categories = [
    { id: 'all', name: 'All Games', icon: 'grid-outline' },
    { id: 'quick', name: 'Quick Match', icon: 'flash-outline' },
  ];

  // Game modes available in the app
  const games = [
    {
      id: 1,
      title: 'Ludo Classic',
      category: 'quick',
      players: '2-4 Players',
      difficulty: 'Easy',
      icon: 'grid-outline',
      description: 'Traditional Ludo game with modern features',
      hasSubcategories: true,
      subcategories: [
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
      ]
    },
    {
      id: 2,
      title: 'Mines Game',
      category: 'quick',
      players: '1 Player',
      difficulty: 'Medium',
      icon: 'nuclear-outline',
      description: '5x5 grid Minesweeper - find all safe cells!',
    },
    {
      id: 3,
      title: 'Limbo',
      category: 'quick',
      players: '1 Player',
      difficulty: 'Medium',
      icon: 'analytics-outline',
      description: 'Test your luck with multipliers - how high can you go?',
      entryFee: 10,
      prize: 50,
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

    // Check if the game has subcategories (like Ludo Classic)
    if (game.hasSubcategories) {
      // Redirect to Ludo modes page
      router.push('/ludo/modes');
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

    // For Mines Game, go directly to the game without showing entry fees
    if (game.title === 'Mines Game') {
      router.push('/mines');
      return;
    }
    
    // For Limbo Game, go directly to the game without showing entry fees
    if (game.title === 'limbo') {
      router.push('/limbo');
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
      `Do you want to play ${game.title}?

Entry Fee: ₹${game.entryFee}
Prize Pool: ₹${game.prize}
Players: ${game.players}`,
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
      if (game.title === 'Ludo Classic' || game.title === 'Speed Ludo') {
        router.push('/ludo');
      } else if (game.title === 'Mines Game') {
        router.push('/mines');
      } else if (game.title === 'Limbo') {
        router.push('/limbo');
      } else {
        Alert.alert(
          'Game Starting',
          `Looking for players for ${game.title}...

This feature will be fully implemented soon!`,
          [{ text: 'OK' }]
        );
      }
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
    <View key={game.id} style={styles.gameCard}>
      <View style={styles.gameCardContent}>
        <View style={styles.gameHeader}>
          <View style={styles.gameIconContainer}>
            <Ionicons name={game.icon} size={24} color="#FFFFFF" />
          </View>
          <View style={styles.gameInfo}>
            <Text style={styles.gameTitle}>{game.title}</Text>
            <Text style={styles.gamePlayers}>{game.players}</Text>
            <Text style={styles.gameDescription}>{game.description}</Text>
            {game.hasSubcategories && (
              <Text style={styles.gameDescription}>Tap to see game modes</Text>
            )}
          </View>
          <View style={[
            styles.difficultyBadge, 
            {
              backgroundColor: 
                game.difficulty === 'Easy' ? '#4ecdc4' : 
                game.difficulty === 'Medium' ? '#ffb62d' : 
                '#ff6b6b'
            }
          ]}>
            <Text style={styles.difficultyText}>{game.difficulty}</Text>
          </View>
        </View>
        
        <View style={styles.gameDetails}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>{game.players}</Text>
          </View>
        </View>
        
        <TouchableOpacity 
          style={styles.playButton}
          onPress={() => handlePlayGame(game)}
        >
          <Text style={styles.playButtonText}>
            {game.hasSubcategories ? 'Select Mode' : 'Play Now'}
          </Text>
          <Ionicons 
            name={game.hasSubcategories ? "chevron-forward" : "play"} 
            size={16} 
            color="#000000" 
          />
        </TouchableOpacity>
      </View>
    </View>
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
    paddingTop: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 30,
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