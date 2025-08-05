import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import {
  Alert,
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

const { width } = Dimensions.get('window');

const TournamentsScreen = () => {
  const [selectedTab, setSelectedTab] = useState('live');
  const [tournaments, setTournaments] = useState({
    live: [],
    upcoming: [],
    completed: []
  });
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);

  const tabs = [
    { id: 'live', name: 'Live', icon: 'radio-outline' },
    { id: 'upcoming', name: 'Upcoming', icon: 'time-outline' },
    { id: 'completed', name: 'Completed', icon: 'checkmark-circle-outline' },
  ];

  useEffect(() => {
    loadTournaments();
    loadCurrentUser();
  }, []);

  const loadCurrentUser = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      setCurrentUser(user);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const loadTournaments = async () => {
    try {
      setLoading(true);
      const allTournaments = await firebaseService.getAllTournaments();
      
      // Group tournaments by status
      const groupedTournaments = {
        live: allTournaments.filter(t => t.status === 'started'),
        upcoming: allTournaments.filter(t => t.status === 'open'),
        completed: allTournaments.filter(t => t.status === 'completed' || t.status === 'cancelled')
      };

      setTournaments(groupedTournaments);
    } catch (error) {
      console.error('Error loading tournaments:', error);
      setTournaments({ live: [], upcoming: [], completed: [] });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTournaments();
    setRefreshing(false);
  }, []);

  const getStatusColor = (status) => {
    switch (status) {
      case 'started':
        return '#00FF00';
      case 'open':
        return '#FFA500';
      case 'completed':
        return '#666666';
      case 'cancelled':
        return '#FF0000';
      default:
        return '#FFFFFF';
    }
  };

  const handleJoinTournament = async (tournament) => {
    if (!currentUser) {
      Alert.alert('Login Required', 'Please login to join tournaments');
      return;
    }
    
    // Only allow joining tournaments with 'open' status
    if (tournament.status !== 'open') {
      if (tournament.status === 'started') {
        Alert.alert('Tournament Already Started', 'This tournament is already in progress.');
      } else if (tournament.status === 'completed') {
        Alert.alert('Tournament Completed', 'This tournament has already been completed.');
      } else if (tournament.status === 'cancelled') {
        Alert.alert('Tournament Cancelled', 'This tournament has been cancelled.');
      }
      return;
    }

    // Check if user has sufficient balance
    if (currentUser.walletBalance < tournament.entryFee) {
      Alert.alert(
        'Insufficient Balance', 
        'Please add money to your wallet to join this tournament.',
        [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Add Money', onPress: () => {
            Alert.alert('Add Money', 'Payment gateway integration coming soon!');
          }}
        ]
      );
      return;
    }

    Alert.alert(
      'Join Tournament',
      `Do you want to join ${tournament.title}?\nEntry Fee: ₹${tournament.entryFee}`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Join', onPress: () => joinTournament(tournament) }
      ]
    );
  };

  const joinTournament = async (tournament) => {
    try {
      // Here you would implement the actual tournament joining logic
      // For now, we'll just show a success message
      Alert.alert('Success', 'Tournament join request submitted!');
      
      // In a real implementation, you would:
      // 1. Deduct entry fee from user's wallet
      // 2. Add user to tournament participants
      // 3. Update tournament data in Firebase
      // 4. Create a transaction record
      
    } catch (error) {
      console.error('Error joining tournament:', error);
      Alert.alert('Error', 'Failed to join tournament. Please try again.');
    }
  };

  const formatTimeLeft = (tournament) => {
    if (tournament.status === 'started') {
      return 'Live Now';
    } else if (tournament.status === 'open') {
      return 'Starting Soon';
    } else if (tournament.status === 'completed') {
      return 'Completed';
    } else if (tournament.status === 'cancelled') {
      return 'Cancelled';
    } else {
      return 'Unknown';
    }
  };

  const renderTournamentCard = (tournament) => (
    <TouchableOpacity 
      key={tournament.id} 
      style={styles.tournamentCard}
      onPress={() => tournament.status === 'open' && handleJoinTournament(tournament)}
    >
      <View style={styles.tournamentHeader}>
        <View style={styles.tournamentInfo}>
          <Text style={styles.tournamentTitle}>{tournament.name || tournament.title}</Text>
          <Text style={styles.tournamentGame}>{tournament.gameType || tournament.game || 'Ludo Game'}</Text>
        </View>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(tournament.status) }]}>
          <Text style={[styles.statusText, { color: tournament.status === 'completed' || tournament.status === 'cancelled' ? '#FFFFFF' : '#000000' }]}>
            {tournament.status === 'started' ? 'LIVE' : 
             tournament.status === 'open' ? 'UPCOMING' : 
             tournament.status === 'completed' ? 'COMPLETED' : 
             tournament.status === 'cancelled' ? 'CANCELLED' : tournament.status.toUpperCase()}
          </Text>
        </View>
      </View>

      <View style={styles.tournamentDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="trophy-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>Prize: ₹{(tournament.prizePool || tournament.prizeMoney || 0).toLocaleString()}</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="card-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>Entry: ₹{tournament.entryFee || 0}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              {(tournament.participants?.length || 0)}/{tournament.maxParticipants || 100} Players
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="time-outline" size={16} color="#666666" />
            <Text style={styles.detailText}>
              {formatTimeLeft(tournament)}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View 
            style={[
              styles.progressFill, 
              { width: `${((tournament.participants?.length || 0) / (tournament.maxParticipants || 100)) * 100}%` }
            ]} 
          />
        </View>
        <Text style={styles.progressText}>
          {Math.round(((tournament.participants?.length || 0) / (tournament.maxParticipants || 100)) * 100)}% Full
        </Text>
      </View>

      {tournament.status !== 'completed' && (
        <TouchableOpacity 
          style={styles.joinButton}
          onPress={() => handleJoinTournament(tournament)}
        >
          <Text style={styles.joinButtonText}>
            {tournament.status === 'live' ? 'Join Now' : 'Register'}
          </Text>
          <Ionicons name="arrow-forward" size={16} color="#000000" />
        </TouchableOpacity>
      )}
    </TouchableOpacity>
  );

  const currentTournaments = tournaments[selectedTab] || [];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />
      
      {/* Tabs - No header */}
      <View style={styles.tabsContainer}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.id}
            style={[
              styles.tabButton,
              selectedTab === tab.id && styles.activeTabButton
            ]}
            onPress={() => setSelectedTab(tab.id)}
          >
            <Ionicons 
              name={tab.icon} 
              size={20} 
              color={selectedTab === tab.id ? '#000000' : '#666666'} 
            />
            <Text style={[
              styles.tabText,
              selectedTab === tab.id && styles.activeTabText
            ]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tournaments List */}
      <ScrollView 
        style={styles.tournamentsContainer}
        contentContainerStyle={styles.tournamentsContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <Text style={styles.sectionTitle}>
          {tabs.find(t => t.id === selectedTab)?.name} Tournaments
        </Text>
        
        {loading ? (
          <View style={styles.loadingContainer}>
            <Text style={styles.loadingText}>Loading tournaments...</Text>
          </View>
        ) : currentTournaments.length > 0 ? (
          currentTournaments.map(renderTournamentCard)
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="trophy-outline" size={64} color="#333333" />
            <Text style={styles.emptyText}>No {selectedTab} tournaments</Text>
            <Text style={styles.emptySubtext}>
              {selectedTab === 'live' && 'Check back later for live tournaments!'}
              {selectedTab === 'upcoming' && 'New tournaments will be announced soon!'}
              {selectedTab === 'completed' && 'No completed tournaments yet.'}
            </Text>
          </View>
        )}
        
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
  tabsContainer: {
    flexDirection: 'row',
    backgroundColor: '#000000',
    paddingHorizontal: 20,
    paddingTop: 25,
    paddingBottom: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  tabButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#333333',
    paddingVertical: 10,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeTabButton: {
    backgroundColor: '#FFFFFF',
  },
  tabText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 6,
  },
  activeTabText: {
    color: '#000000',
  },
  tournamentsContainer: {
    flex: 1,
  },
  tournamentsContent: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 24,
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
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
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
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  tournamentInfo: {
    flex: 1,
  },
  tournamentTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  tournamentGame: {
    fontSize: 14,
    color: '#666666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  tournamentDetails: {
    marginBottom: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  detailText: {
    fontSize: 12,
    color: '#666666',
    marginLeft: 4,
  },
  progressContainer: {
    marginBottom: 16,
  },
  progressBar: {
    height: 6,
    backgroundColor: '#333333',
    borderRadius: 3,
    marginBottom: 4,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'right',
  },
  joinButton: {
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    borderRadius: 8,
  },
  joinButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#000000',
    marginRight: 8,
  },
  footerSpacing: {
    height: 20,
  },
});

export default TournamentsScreen;