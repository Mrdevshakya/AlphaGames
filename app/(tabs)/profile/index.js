import { Ionicons } from '@expo/vector-icons';
import React, { useState, useEffect } from 'react';
import {
  Dimensions,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  RefreshControl,
  Alert
} from 'react-native';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../src/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

const { width } = Dimensions.get('window');

const ProfileScreen = () => {
  const [activeTab, setActiveTab] = useState('stats');
  const [currentUser, setCurrentUser] = useState(null);
  const [userTransactions, setUserTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();

  const tabs = [
    { id: 'stats', name: 'Stats', icon: 'stats-chart-outline' },
    { id: 'games', name: 'Recent Games', icon: 'game-controller-outline' },
    { id: 'achievements', name: 'Achievements', icon: 'trophy-outline' },
  ];

  useEffect(() => {
    loadUserData();
    
    // Check for stats updates periodically
    const interval = setInterval(async () => {
      const statsUpdated = await AsyncStorage.getItem('statsUpdated');
      if (statsUpdated === 'true') {
        await loadUserData();
        await AsyncStorage.removeItem('statsUpdated');
      }
    }, 5000); // Check every 5 seconds
    
    return () => clearInterval(interval);
  }, []);

  const loadUserData = async () => {
    try {
      setLoading(true);
      const user = await firebaseService.getCurrentUser();
      if (user) {
        // Get updated user stats with XP and level information
        const userStats = await firebaseService.getUserStats(user.uid);
        
        // Get user's global rank from leaderboard
        const leaderboard = await firebaseService.getLeaderboard();
        const userRank = leaderboard.findIndex(player => player.id === user.uid) + 1;
        
        // Merge stats with user data
        const userWithStats = {
          ...user,
          ...userStats,
          globalRank: userRank > 0 ? userRank : 'Not ranked'
        };
        
        setCurrentUser(userWithStats);
        
        // Load user transactions for recent games
        const transactions = await firebaseService.getUserTransactions(user.uid);
        setUserTransactions(transactions.slice(0, 10)); // Show last 10 transactions
      }
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

  const handleAddMoney = () => {
    router.push('wallet');
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', style: 'destructive', onPress: performLogout }
      ]
    );
  };

  const performLogout = async () => {
    try {
      await firebaseService.logout();
      // Navigation will be handled by the auth state change in the main app
    } catch (error) {
      console.error('Error logging out:', error);
      Alert.alert('Error', 'Failed to logout. Please try again.');
    }
  };

  // Calculate user stats from current user data
  const userStats = currentUser ? {
    gamesPlayed: currentUser.gamesPlayed || 0,
    gamesWon: currentUser.gamesWon || 0,
    winRate: currentUser.gamesPlayed > 0 ? Math.round((currentUser.gamesWon / currentUser.gamesPlayed) * 100) : 0,
    totalEarnings: currentUser.totalEarnings || 0,
    currentBalance: currentUser.walletBalance || 0,
    rank: currentUser.rank || 0,
    achievements: 0, // Will be calculated based on actual achievements
    tournaments: 0, // Will be calculated based on tournament participation
    xp: currentUser.xp || 0,
    level: currentUser.level || 1,
    userRank: currentUser.userRank || 'Bronze V',
    nextLevelXp: currentUser.nextLevelXp || 500,
    xpProgress: currentUser.xpProgress || { current: 0, required: 500 },
    globalRank: currentUser.globalRank || 'Not ranked'
  } : {};

  // Generate recent games from transactions
  const recentGames = userTransactions
    .filter(t => (t.type === 'credit' || t.type === 'debit') && (t.game === 'Ludo Classic' || t.game === 'Speed Ludo')) // Filter for Ludo games
    .map((transaction, index) => ({
      id: transaction.id || index,
      game: transaction.game || 'Ludo Game',
      result: transaction.type === 'credit' ? 'Won' : 'Lost',
      earnings: transaction.type === 'credit' ? `+₹${transaction.amount}` : `-₹${transaction.amount}`,
      time: formatTimeAgo(transaction.timestamp)
    }))
    .slice(0, 5);

  // Sample achievements (in a real app, these would come from Firebase)
  const achievements = [
    { 
      id: 1, 
      title: 'First Ludo Win', 
      description: 'Win your first Ludo game', 
      icon: 'trophy-outline', 
      earned: (currentUser?.gamesWon || 0) > 0 
    },
    { 
      id: 2, 
      title: 'Ludo Streak', 
      description: 'Win 5 Ludo games in a row', 
      icon: 'flame-outline', 
      earned: (currentUser?.gamesWon || 0) >= 5 
    },
    { 
      id: 3, 
      title: 'Ludo Tournament Champion', 
      description: 'Win a Ludo tournament', 
      icon: 'medal-outline', 
      earned: false // Would be calculated from tournament data
    },
    { 
      id: 4, 
      title: 'Ludo High Roller', 
      description: 'Earn ₹10,000 in Ludo games', 
      icon: 'diamond-outline', 
      earned: (currentUser?.totalEarnings || 0) >= 10000 
    },
  ];

  function formatTimeAgo(timestamp) {
    if (!timestamp) return 'Unknown';
    
    const now = new Date();
    const time = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diffInMs = now - time;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  }

  const renderStatsTab = () => (
    <View style={styles.tabContent}>
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
          <Text style={styles.statValue}>₹{userStats.totalEarnings}</Text>
          <Text style={styles.statLabel}>Total Earnings</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.globalRank}</Text>
          <Text style={styles.statLabel}>Global Rank</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userStats.tournaments}</Text>
          <Text style={styles.statLabel}>Tournaments</Text>
        </View>
      </View>
    </View>
  );

  const renderGamesTab = () => (
    <View style={styles.tabContent}>
      {recentGames.length > 0 ? (
        recentGames.map((game) => (
          <View key={game.id} style={styles.gameItem}>
            <View style={styles.gameInfo}>
              <Text style={styles.gameName}>{game.game}</Text>
              <Text style={styles.gameTime}>{game.time}</Text>
            </View>
            <View style={styles.gameResult}>
              <Text style={[
                styles.gameResultText,
                { color: game.result === 'Won' ? '#00FF00' : '#FF4444' }
              ]}>
                {game.result}
              </Text>
              <Text style={[
                styles.gameEarnings,
                { color: game.earnings.startsWith('+') ? '#00FF00' : '#FF4444' }
              ]}>
                {game.earnings}
              </Text>
            </View>
          </View>
        ))
      ) : (
        <View style={styles.emptyContainer}>
          <Ionicons name="game-controller-outline" size={64} color="#333333" />
          <Text style={styles.emptyText}>No recent games</Text>
          <Text style={styles.emptySubtext}>Start playing to see your game history!</Text>
        </View>
      )}
    </View>
  );

  const renderAchievementsTab = () => (
    <View style={styles.tabContent}>
      {achievements.map((achievement) => (
        <View key={achievement.id} style={[
          styles.achievementItem,
          !achievement.earned && styles.lockedAchievement
        ]}>
          <View style={styles.achievementIcon}>
            <Ionicons 
              name={achievement.icon} 
              size={24} 
              color={achievement.earned ? '#FFFFFF' : '#666666'} 
            />
          </View>
          <View style={styles.achievementInfo}>
            <Text style={[
              styles.achievementTitle,
              !achievement.earned && styles.lockedText
            ]}>
              {achievement.title}
            </Text>
            <Text style={[
              styles.achievementDescription,
              !achievement.earned && styles.lockedText
            ]}>
              {achievement.description}
            </Text>
          </View>
          {achievement.earned && (
            <Ionicons name="checkmark-circle" size={20} color="#00FF00" />
          )}
        </View>
      ))}
    </View>
  );

  const renderTabContent = () => {
    switch (activeTab) {
      case 'stats':
        return renderStatsTab();
      case 'games':
        return renderGamesTab();
      case 'achievements':
        return renderAchievementsTab();
      default:
        return renderStatsTab();
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  if (!currentUser) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Please login to view profile</Text>
      </View>
    );
  }

  const userProfile = {
    name: currentUser.fullName || 'Anonymous',
    username: `@${(currentUser.fullName || 'user').toLowerCase().replace(/\s+/g, '')}`,
    level: userStats.level || 1,
    rank: userStats.userRank || 'Bronze V',
    experience: userStats.xp || 0,
    nextLevelExp: userStats.nextLevelXp || 500,
    xpProgress: userStats.xpProgress || { current: 0, required: 500 },
    joinDate: currentUser.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) : 'Recently',
    bio: 'Gaming enthusiast and tournament player.',
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Profile Header */}
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={40} color="#666666" />
            </View>
            <View style={styles.levelBadge}>
              <Text style={styles.levelText}>{userProfile.level}</Text>
            </View>
          </View>
          
          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userProfile.name}</Text>
            <Text style={styles.profileUsername}>{userProfile.username}</Text>
            <Text style={styles.profileBio}>{userProfile.bio}</Text>
            <Text style={styles.joinDate}>Joined {userProfile.joinDate}</Text>
            <View style={styles.levelRankContainer}>
              <Text style={styles.levelText}>Level {userProfile.level}</Text>
              <Text style={styles.rankText}>{userProfile.rank}</Text>
            </View>
          </View>
        </View>

        {/* Experience Bar */}
        <View style={styles.experienceContainer}>
          <View style={styles.experienceHeader}>
            <Text style={styles.experienceLabel}>Level Progress</Text>
            <Text style={styles.experienceText}>
              {userProfile.experience}/{userProfile.nextLevelExp} XP
            </Text>
          </View>
          <View style={styles.experienceBar}>
            <View 
              style={[
                styles.experienceFill,
                { 
                  width: userProfile.xpProgress && userProfile.xpProgress.required > 0 
                    ? `${Math.min((userProfile.xpProgress.current / userProfile.xpProgress.required) * 100, 100)}%` 
                    : '0%'
                }
              ]}
            />
          </View>
        </View>

        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <View style={styles.balanceInfo}>
            <Text style={styles.balanceLabel}>Current Balance</Text>
            <Text style={styles.balanceAmount}>₹{userStats.currentBalance.toLocaleString()}</Text>
          </View>
          <TouchableOpacity style={styles.addMoneyButton} onPress={handleAddMoney}>
            <Ionicons name="add" size={20} color="#000000" />
            <Text style={styles.addMoneyText}>Add Money</Text>
          </TouchableOpacity>
        </View>

        {/* Tabs */}
        <View style={styles.tabsContainer}>
          {tabs.map((tab) => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Ionicons 
                name={tab.icon} 
                size={20} 
                color={activeTab === tab.id ? '#000000' : '#666666'} 
              />
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Tab Content */}
        {renderTabContent()}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  scrollContainer: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
  },
  profileHeader: {
    alignItems: 'center',
    marginBottom: 24,
  },
  avatarContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3,
    borderColor: '#FFFFFF',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    backgroundColor: '#FFFFFF',
    borderRadius: 15,
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#000000',
  },
  levelRankContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  levelText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFFFFF',
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 8,
  },
  rankText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFD700',
    backgroundColor: '#333333',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  profileUsername: {
    fontSize: 16,
    color: '#666666',
    marginBottom: 8,
  },
  profileBio: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 4,
  },
  joinDate: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  experienceContainer: {
    marginBottom: 24,
  },
  experienceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  experienceLabel: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  experienceText: {
    fontSize: 14,
    color: '#666666',
  },
  experienceBar: {
    height: 8,
    backgroundColor: '#333333',
    borderRadius: 4,
  },
  experienceFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 4,
  },
  balanceCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 16,
    padding: 20,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
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
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  addMoneyButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  addMoneyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 4,
  },
  tabsContainer: {
    flexDirection: 'row',
    marginBottom: 24,
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    paddingVertical: 12,
    marginHorizontal: 2,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    fontSize: 12,
    color: '#666666',
    fontWeight: '600',
    marginLeft: 4,
  },
  activeTabText: {
    color: '#000000',
  },
  tabContent: {
    marginBottom: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
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
  gameItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  gameInfo: {
    flex: 1,
  },
  gameName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  gameTime: {
    fontSize: 12,
    color: '#666666',
  },
  gameResult: {
    alignItems: 'flex-end',
  },
  gameResultText: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  gameEarnings: {
    fontSize: 14,
    fontWeight: 'bold',
  },
  achievementItem: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  lockedAchievement: {
    opacity: 0.5,
  },
  achievementIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  achievementInfo: {
    flex: 1,
  },
  achievementTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  achievementDescription: {
    fontSize: 12,
    color: '#666666',
  },
  lockedText: {
    color: '#666666',
  },
  footerSpacing: {
    height: 20,
  },
});

export default ProfileScreen;