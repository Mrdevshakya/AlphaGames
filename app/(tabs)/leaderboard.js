import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  StatusBar,
  SafeAreaView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { firebaseService } from '../../src/services/firebaseService';

const { width } = Dimensions.get('window');

const LeaderboardScreen = () => {
  const [selectedPeriod, setSelectedPeriod] = useState('weekly');
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [currentUserRank, setCurrentUserRank] = useState(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const periods = [
    { id: 'daily', name: 'Daily', icon: 'today-outline' },
    { id: 'weekly', name: 'Weekly', icon: 'calendar-outline' },
    { id: 'monthly', name: 'Monthly', icon: 'calendar-number-outline' },
    { id: 'alltime', name: 'All Time', icon: 'trophy-outline' },
  ];

  useEffect(() => {
    loadLeaderboardData();
  }, [selectedPeriod]);

  // Load current user and update rank when leaderboard data changes
  useEffect(() => {
    loadCurrentUser();
  }, [leaderboardData]);

  const loadLeaderboardData = async () => {
    try {
      setLoading(true);
      console.log('Loading leaderboard for period:', selectedPeriod);
      const data = await firebaseService.getLeaderboard(selectedPeriod);
      console.log('Leaderboard data received:', data);
      setLeaderboardData(data);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setLeaderboardData([]);
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      console.log('Current user:', user);
      if (user) {
        setCurrentUser(user);
        // Find user's rank in leaderboard
        const userRank = leaderboardData.findIndex(player => player.id === user.uid) + 1;
        console.log('User rank calculated:', userRank);
        setCurrentUserRank(userRank > 0 ? userRank : 0); // 0 if not found
      }
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await Promise.all([loadLeaderboardData(), loadCurrentUser()]);
    setRefreshing(false);
  }, [selectedPeriod]);

  const getRankIcon = (rank) => {
    switch (rank) {
      case 1:
        return { name: 'trophy', color: '#FFD700' };
      case 2:
        return { name: 'medal', color: '#C0C0C0' };
      case 3:
        return { name: 'medal', color: '#CD7F32' };
      default:
        return { name: 'person-circle-outline', color: '#666666' };
    }
  };

  const renderLeaderboardItem = (player, index) => {
    const rankIcon = getRankIcon(player.rank);
    const isCurrentUser = currentUser && player.id === currentUser.uid;
    
    return (
      <View 
        key={player.id || index} 
        style={[
          styles.leaderboardItem,
          isCurrentUser && styles.currentUserItem,
          player.rank <= 3 && styles.topThreeItem
        ]}
      >
        <View style={styles.rankContainer}>
          <Ionicons name={rankIcon.name} size={22} color={rankIcon.color} />
          <Text style={[styles.rankText, { color: rankIcon.color }]}>
            #{player.rank}
          </Text>
        </View>

        <View style={styles.playerInfo}>
          <Text style={[styles.playerName, isCurrentUser && styles.currentUserName]}>
            {isCurrentUser ? 'You' : (player.name || 'Anonymous')}
          </Text>
          <View style={styles.playerStats}>
            <View style={styles.statItem}>
              <Ionicons name="trophy-outline" size={14} color="#666666" />
              <Text style={styles.statText}>{player.gamesWon || 0} Wins</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="game-controller-outline" size={14} color="#666666" />
              <Text style={styles.statText}>{player.gamesPlayed || 0} games</Text>
            </View>
            <View style={styles.statItem}>
              <Ionicons name="trending-up-outline" size={14} color="#666666" />
              <Text style={styles.statText}>{player.winRate || 0}% win</Text>
            </View>
          </View>
        </View>

        <View style={styles.earningsContainer}>
          <Text style={styles.earningsText}>₹{(player.totalEarnings || 0).toLocaleString()}</Text>
        </View>
      </View>
    );
  };

  const currentUserData = currentUser ? {
    name: 'You',
    score: (currentUser.gamesWon || 0) * 100, // Simple scoring system
    earnings: `₹${(currentUser.totalEarnings || 0).toLocaleString()}`,
    games: currentUser.gamesPlayed || 0,
    winRate: currentUser.gamesPlayed > 0 ? Math.round((currentUser.gamesWon / currentUser.gamesPlayed) * 100) : 0,
  } : null;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      <SafeAreaView style={styles.headerSafeArea}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Rankings</Text>
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
          {/* Period Selector */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.periodsContainer}
            contentContainerStyle={styles.periodsContent}
          >
            {periods.map((period) => {
              const isActive = selectedPeriod === period.id;
              const buttonContent = (
                <View style={styles.periodButtonContent}>
                  <Ionicons 
                    name={period.icon} 
                    size={20} 
                    color={isActive ? '#000000' : '#FFFFFF'} 
                  />
                  <Text style={[styles.periodText, isActive && styles.activePeriodText]}>
                    {period.name}
                  </Text>
                </View>
              );

              return (
                <TouchableOpacity
                  key={period.id}
                  onPress={() => setSelectedPeriod(period.id)}
                  style={{ marginHorizontal: 4 }}
                >
                  {isActive ? (
                    <LinearGradient
                      colors={['#FFFFFF', '#E0E0E0']}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      style={styles.periodButton}
                    >
                      {buttonContent}
                    </LinearGradient>
                  ) : (
                    <View style={[styles.periodButton, styles.inactivePeriodButton]}>
                      {buttonContent}
                    </View>
                  )}
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Scrollable Content */}
        <View style={styles.content}>
          {/* Current User Stats */}
          {currentUserData && (
            <View style={styles.currentUserContainer}>
              <Text style={styles.sectionTitle}>Your Ranking</Text>
              <View style={styles.currentUserCard}>
                <View style={styles.currentUserRank}>
                  <Text style={styles.currentUserRankNumber}>#{currentUserRank}</Text>
                  <Text style={styles.currentUserRankLabel}>Global Rank</Text>
                </View>
                <View style={styles.currentUserStats}>
                  <View style={styles.userStatItem}>
                    <Text style={styles.userStatValue}>{currentUserData.score.toLocaleString()}</Text>
                    <Text style={styles.userStatLabel}>Score</Text>
                  </View>
                  <View style={styles.userStatItem}>
                    <Text style={styles.userStatValue}>{currentUserData.earnings}</Text>
                    <Text style={styles.userStatLabel}>Earnings</Text>
                  </View>
                  <View style={styles.userStatItem}>
                    <Text style={styles.userStatValue}>{currentUserData.winRate}%</Text>
                    <Text style={styles.userStatLabel}>Win Rate</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Leaderboard */}
          <View style={styles.leaderboardSection}>
            <Text style={styles.sectionTitle}>
              {periods.find(p => p.id === selectedPeriod)?.name} Leaderboard
            </Text>
            
            {loading ? (
              <View style={styles.loadingContainer}>
                <Text style={styles.loadingText}>Loading leaderboard...</Text>
              </View>
            ) : leaderboardData.length > 0 ? (
              leaderboardData.map(renderLeaderboardItem)
            ) : (
              <View style={styles.emptyContainer}>
                <Text style={styles.emptyText}>No leaderboard data available</Text>
                <Text style={styles.emptySubtext}>Play some games to see rankings!</Text>
              </View>
            )}
            
            <View style={styles.footerSpacing} />
          </View>
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
    paddingHorizontal: 20,
    paddingTop: 30,
    paddingBottom: 5,
    backgroundColor: '#000000',
  },
  headerTitle: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
  },
  stickyHeader: {
    backgroundColor: '#000000',
    paddingTop: 15,
  },
  content: {
    paddingHorizontal: 20,
  },
  periodsContainer: {
    backgroundColor: '#000000',
    paddingVertical: 5,
  },
  periodsContent: {
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  periodButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
  },
  inactivePeriodButton: {
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
  },
  periodButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  periodText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '500',
    marginLeft: 8,
  },
  activePeriodText: {
    color: '#000000',
    fontWeight: 'bold',
  },
  currentUserContainer: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  currentUserCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 15,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  currentUserRank: {
    alignItems: 'center',
    marginRight: 20,
  },
  currentUserRankNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  currentUserRankLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  currentUserStats: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  userStatItem: {
    alignItems: 'center',
  },
  userStatValue: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  userStatLabel: {
    fontSize: 12,
    color: '#666666',
    marginTop: 4,
  },
  leaderboardSection: {
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 16,
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
    fontWeight: '600',
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  leaderboardItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#333333',
  },
  topThreeItem: {
    borderColor: '#FFD700',
    borderWidth: 2,
  },
  currentUserItem: {
    borderColor: '#FFFFFF',
    borderWidth: 2,
  },
  rankContainer: {
    alignItems: 'center',
    marginRight: 12,
    minWidth: 50,
  },
  rankText: {
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 4,
  },
  playerInfo: {
    flex: 1,
  },
  playerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  currentUserName: {
    color: '#FFFFFF',
  },
  playerStats: {
    flexDirection: 'row',
    gap: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  earningsContainer: {
    alignItems: 'flex-end',
  },
  earningsText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  footerSpacing: {
    height: 20,
  },
});

export default LeaderboardScreen;