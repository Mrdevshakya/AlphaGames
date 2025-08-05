import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  Animated,
  Dimensions,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { firebaseService } from '../../src/services/firebaseService';

const { width, height } = Dimensions.get('window');

const HomeScreen = () => {
  const router = useRouter();
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState({
    balance: 0,
    gamesPlayed: 0,
    gamesWon: 0,
    winRate: 0,
    totalEarnings: 0,
    rank: 0,
  });
  const [liveTournaments, setLiveTournaments] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const scaleAnim = useRef(new Animated.Value(0.95)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;
  
  // Font loading state
  const [fontLoaded, setFontLoaded] = useState(false);

  useEffect(() => {
    async function loadFonts() {
      await Font.loadAsync({
        'TheBigmaker': require('../../assets/fonts/The Bigmaker PersonalUseOnly.ttf'),
      });
      setFontLoaded(true);
    }
    
    loadFonts();
    loadUserData();
    loadTournaments();
    
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for live tournaments
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.05,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setUserStats({
          balance: user.walletBalance || 0,
          gamesPlayed: user.gamesPlayed || 0,
          gamesWon: user.gamesWon || 0,
          winRate: user.gamesPlayed > 0 ? Math.round((user.gamesWon / user.gamesPlayed) * 100) : 0,
          totalEarnings: user.totalEarnings || 0,
          rank: user.rank || 0,
        });
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTournaments = async () => {
    try {
      const tournaments = await firebaseService.getAllTournaments();
      // Filter for live and upcoming Ludo tournaments
      const activeLudoTournaments = tournaments.filter(t => 
        (t.status === 'live' || t.status === 'upcoming') && (t.game === 'Ludo Classic' || t.game === 'Speed Ludo')
      ).slice(0, 3); // Show only top 3 Ludo tournaments
      
      setLiveTournaments(activeLudoTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      // Set empty array on error
      setLiveTournaments([]);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadUserData(), loadTournaments()]);
    setRefreshing(false);
  }, []);

  const handleAddMoney = () => {
    router.push('wallet/add-money');
  };

  const handleWithdrawMoney = () => {
    if ((currentUser?.walletBalance || 0) < 50) {
      Alert.alert(
        'Insufficient Balance',
        'Minimum withdrawal amount is ₹50. Please add money to your wallet first.',
        [{ text: 'OK' }]
      );
      return;
    }
    router.push('wallet/withdraw');
  };

  const handlePlayGame = (gameMode) => {
    Alert.alert(
      'Game Mode',
      `${gameMode} will be available soon!`,
      [{ text: 'OK' }]
    );
  };

  const handleJoinTournament = (tournament) => {
    Alert.alert(
      'Join Tournament',
      `Do you want to join ${tournament.title}?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => joinTournament(tournament) }
      ]
    );
  };

  const joinTournament = async (tournament) => {
    try {
      if (!currentUser) {
        Alert.alert('Error', 'Please login to join tournaments');
        return;
      }

      // Check if user has sufficient balance
      if (userStats.balance < tournament.entryFee) {
        Alert.alert('Insufficient Balance', 'Please add money to your wallet to join this tournament.');
        return;
      }

      // Here you would implement the actual tournament joining logic
      Alert.alert('Success', 'Tournament join request submitted!');
    } catch (error) {
      console.error('Error joining tournament:', error);
      Alert.alert('Error', 'Failed to join tournament. Please try again.');
    }
  };

  const gameModesData = [
    {
      id: 1,
      title: 'Ludo Quick Match',
      subtitle: 'Fast-paced 5-minute Ludo games',
      icon: 'flash-outline',
      prize: '500',
      players: '2-4',
      entryFee: '50',
    },
    {
      id: 2,
      title: 'Ludo Tournament',
      subtitle: 'Compete with 100+ players in Ludo',
      icon: 'trophy-outline',
      prize: '10,000',
      players: '100',
      entryFee: '100',
    },
    {
      id: 3,
      title: 'Ludo Practice',
      subtitle: 'Improve your Ludo skills for free',
      icon: 'school-outline',
      prize: '0',
      players: '1',
      entryFee: '0',
    },
  ];

  const renderGameModeCard = (gameMode) => (
    <TouchableOpacity 
      key={gameMode.id} 
      style={styles.gameModeCard}
      onPress={() => handlePlayGame(gameMode.title)}
    >
      <View style={styles.gameModeHeader}>
        <View style={styles.gameModeIcon}>
          <Ionicons name={gameMode.icon} size={24} color="#FFFFFF" />
        </View>
        <View style={styles.gameModeInfo}>
          <Text style={styles.gameModeTitle}>{gameMode.title}</Text>
          <Text style={styles.gameModeSubtitle}>{gameMode.subtitle}</Text>
        </View>
      </View>
      <View style={styles.gameModeDetails}>
        <Text style={styles.gameModeDetail}>Prize: ₹{gameMode.prize}</Text>
        <Text style={styles.gameModeDetail}>Players: {gameMode.players}</Text>
        <Text style={styles.gameModeDetail}>Entry: {gameMode.entryFee === 'Free' ? 'Free' : `₹${gameMode.entryFee}`}</Text>
      </View>
      <TouchableOpacity 
        style={styles.playButton}
        onPress={() => handlePlayGame(gameMode.title)}
      >
        <Text style={styles.playButtonText}>Play Now</Text>
      </TouchableOpacity>
    </TouchableOpacity>
  );

  const renderTournamentCard = (tournament) => (
    <TouchableOpacity 
      key={tournament.id} 
      style={styles.tournamentCard}
      onPress={() => handleJoinTournament(tournament)}
    >
      <View style={styles.tournamentHeader}>
        <Text style={styles.tournamentTitle}>{tournament.title || 'Tournament'}</Text>
        <View style={[
          styles.statusBadge, 
          { backgroundColor: tournament.status === 'live' ? '#00FF00' : '#FFA500' }
        ]}>
          <Text style={styles.statusText}>{(tournament.status || 'upcoming').toUpperCase()}</Text>
        </View>
      </View>
      <View style={styles.tournamentDetails}>
        <Text style={styles.tournamentDetail}>Prize: ₹{tournament.prizePool || '1000'}</Text>
        <Text style={styles.tournamentDetail}>Entry: ₹{tournament.entryFee || '50'}</Text>
        <Text style={styles.tournamentDetail}>
          Players: {tournament.participants?.length || 0}/{tournament.maxParticipants || 100}
        </Text>
        <Text style={styles.tournamentDetail}>
          {tournament.status === 'live' ? 'Live Now' : 'Starting Soon'}
        </Text>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        <Animated.View style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [
              { translateY: slideAnim },
              { scale: scaleAnim }
            ]
          }
        ]}>

          {/* AlphaGames Title */}
          <View style={styles.titleSection}>
            <Text style={styles.alphaGamesTitle}>
              AlphaGames
            </Text>
          </View>
          
          {/* Welcome Section */}
          <View style={styles.welcomeSection}>
            <Text style={styles.welcomeText}>
              Welcome back, {currentUser?.fullName || 'Champion'}! 🎉
            </Text>
            <Text style={styles.welcomeSubtext}>
              Ready to dominate the leaderboards?
            </Text>
          </View>

          {/* Balance Card */}
          <View style={styles.balanceCard}>
            <View style={styles.balanceInfo}>
              <Text style={styles.balanceLabel}>Current Balance</Text>
              <Text style={styles.balanceAmount}>₹{userStats.balance.toLocaleString()}</Text>
            </View>
            <TouchableOpacity style={styles.addMoneyButton} onPress={handleAddMoney}>
              <Ionicons name="add" size={20} color="#000000" />
              <Text style={styles.addMoneyText}>Add Money</Text>
            </TouchableOpacity>
          </View>

          {/* Stats Section */}
          <View style={styles.statsSection}>
            <Text style={styles.sectionTitle}>Your Performance 📊</Text>
            <View style={styles.statsGrid}>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{userStats.gamesPlayed}</Text>
                <Text style={styles.statLabel}>Games Played</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{userStats.gamesWon}</Text>
                <Text style={styles.statLabel}>Games Won</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>{userStats.winRate}%</Text>
                <Text style={styles.statLabel}>Win Rate</Text>
              </View>
              <View style={styles.statCard}>
                <Text style={styles.statValue}>#{userStats.rank || 'N/A'}</Text>
                <Text style={styles.statLabel}>Global Rank</Text>
              </View>
            </View>
          </View>

          {/* Game Modes Section */}
          <View style={styles.gameModesSection}>
            <Text style={styles.sectionTitle}>Choose Your Battle 🎲</Text>
            {gameModesData.map(renderGameModeCard)}
          </View>

          {/* Live Tournaments Section */}
          <View style={styles.tournamentsSection}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Live Tournaments 🔥</Text>
              <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
                <Text style={styles.liveIndicator}>● LIVE</Text>
              </Animated.View>
            </View>
            {liveTournaments.length > 0 ? (
              liveTournaments.map(renderTournamentCard)
            ) : (
              <View style={styles.noTournamentsContainer}>
                <Text style={styles.noTournamentsText}>No active tournaments at the moment</Text>
                <Text style={styles.noTournamentsSubtext}>Check back later for exciting tournaments!</Text>
              </View>
            )}
          </View>

          {/* Footer Spacing */}
          <View style={styles.footerSpacing} />
        </Animated.View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 100,
  },
  content: {
    padding: 20,
  },
  titleSection: {
    marginBottom: 15,
    alignItems: 'center',
  },
  alphaGamesTitle: {
    fontFamily: 'TheBigmaker',
    fontSize: 80,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 10,
  },
  welcomeSection: {
    marginBottom: 25,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  welcomeSubtext: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 25,
    borderWidth: 1,
    borderColor: '#333333',
  },
  balanceInfo: {
    flex: 1,
  },
  balanceLabel: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 4,
  },
  balanceAmount: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addMoneyButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  addMoneyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  statsSection: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  statCard: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  gameModesSection: {
    marginBottom: 25,
  },
  gameModeCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gameModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  gameModeIcon: {
    width: 50,
    height: 50,
    backgroundColor: '#333333',
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  gameModeInfo: {
    flex: 1,
  },
  gameModeTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameModeSubtitle: {
    fontSize: 14,
    color: '#666666',
  },
  gameModeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  gameModeDetail: {
    fontSize: 12,
    color: '#666666',
  },
  playButton: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  playButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
  },
  tournamentsSection: {
    marginBottom: 25,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  liveIndicator: {
    color: '#00FF00',
    fontSize: 14,
    fontWeight: 'bold',
  },
  tournamentCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#333333',
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#000000',
  },
  tournamentDetails: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  tournamentDetail: {
    fontSize: 12,
    color: '#666666',
    width: '48%',
    marginBottom: 4,
  },
  noTournamentsContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  noTournamentsText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
    marginBottom: 8,
    textAlign: 'center',
  },
  noTournamentsSubtext: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
  },
  footerSpacing: {
    height: 80,
  },
});

export default HomeScreen;