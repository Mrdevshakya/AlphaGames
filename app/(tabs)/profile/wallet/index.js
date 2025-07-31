import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const WalletScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [walletStats, setWalletStats] = useState({
    totalDeposits: 0,
    totalWithdrawals: 0,
    totalEarnings: 0,
    pendingWithdrawals: 0,
  });
  const router = useRouter();

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        
        // Load user transactions
        const userTransactions = await firebaseService.getUserTransactions(user.uid);
        setTransactions(userTransactions.slice(0, 10)); // Show last 10 transactions
        
        // Calculate wallet stats
        const stats = calculateWalletStats(userTransactions);
        setWalletStats(stats);
      }
    } catch (error) {
      console.error('Error loading wallet data:', error);
      Alert.alert('Error', 'Failed to load wallet data');
    } finally {
      setLoading(false);
    }
  };

  const calculateWalletStats = (transactions) => {
    const stats = {
      totalDeposits: 0,
      totalWithdrawals: 0,
      totalEarnings: 0,
      pendingWithdrawals: 0,
    };

    transactions.forEach(transaction => {
      switch (transaction.type) {
        case 'credit':
          if (transaction.method === 'razorpay' || transaction.method === 'upi') {
            stats.totalDeposits += transaction.amount;
          } else {
            stats.totalEarnings += transaction.amount;
          }
          break;
        case 'withdrawal':
          stats.totalWithdrawals += transaction.amount;
          if (transaction.status === 'pending') {
            stats.pendingWithdrawals += transaction.amount;
          }
          break;
      }
    });

    return stats;
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  }, []);

  const handleAddMoney = () => {
    router.push('/wallet/add-money');
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
    router.push('/wallet/withdraw');
  };

  const handleViewAllTransactions = () => {
    router.push('/wallet/transactions');
  };

  const formatTransactionTime = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays > 0) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else if (diffInHours > 0) {
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else {
      return 'Just now';
    }
  };

  const getTransactionIcon = (transaction) => {
    switch (transaction.type) {
      case 'credit':
        return { name: 'arrow-down-circle', color: '#4CAF50' };
      case 'debit':
        return { name: 'arrow-up-circle', color: '#FF5722' };
      case 'withdrawal':
        return { name: 'cash-outline', color: '#FF9800' };
      case 'refund':
        return { name: 'refresh-circle', color: '#2196F3' };
      default:
        return { name: 'swap-horizontal', color: '#666666' };
    }
  };

  const renderTransaction = (transaction) => {
    const icon = getTransactionIcon(transaction);
    const isCredit = transaction.type === 'credit';
    const amount = isCredit ? `+₹${transaction.amount}` : `-₹${transaction.amount}`;

    return (
      <View key={transaction.id} style={styles.transactionItem}>
        <View style={[styles.transactionIcon, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
          </Text>
          <Text style={styles.transactionTime}>
            {formatTransactionTime(transaction.timestamp)}
          </Text>
          <Text style={[styles.transactionStatus, {
            color: transaction.status === 'completed' ? '#4CAF50' : 
                  transaction.status === 'pending' ? '#FF9800' : '#FF5722'
          }]}>
            {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
          </Text>
        </View>
        
        <Text style={[styles.transactionAmount, {
          color: isCredit ? '#4CAF50' : '#FF5722'
        }]}>
          {amount}
        </Text>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

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
        <Text style={styles.headerTitle}>My Wallet</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Balance Card */}
        <LinearGradient
          colors={['#4CAF50', '#45a049']}
          style={styles.balanceCard}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.balanceHeader}>
            <Text style={styles.balanceLabel}>Available Balance</Text>
            <Ionicons name="wallet" size={24} color="#FFFFFF" />
          </View>
          <Text style={styles.balanceAmount}>
            ₹{(currentUser?.walletBalance || 0).toLocaleString()}
          </Text>
          <Text style={styles.balanceSubtext}>
            Ready to play and win more!
          </Text>
        </LinearGradient>

        {/* Action Buttons */}
        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.actionButton} onPress={handleAddMoney}>
            <LinearGradient
              colors={['#2196F3', '#1976D2']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="add-circle" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Add Money</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={handleWithdrawMoney}>
            <LinearGradient
              colors={['#FF9800', '#F57C00']}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="cash" size={24} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Withdraw</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Wallet Stats */}
        <View style={styles.statsSection}>
          <Text style={styles.sectionTitle}>Wallet Statistics</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statCard}>
              <Ionicons name="trending-up" size={24} color="#4CAF50" />
              <Text style={styles.statValue}>₹{walletStats.totalDeposits.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Deposits</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trending-down" size={24} color="#FF9800" />
              <Text style={styles.statValue}>₹{walletStats.totalWithdrawals.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Total Withdrawals</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="trophy" size={24} color="#FFD700" />
              <Text style={styles.statValue}>₹{walletStats.totalEarnings.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Game Earnings</Text>
            </View>
            
            <View style={styles.statCard}>
              <Ionicons name="time" size={24} color="#666666" />
              <Text style={styles.statValue}>₹{walletStats.pendingWithdrawals.toLocaleString()}</Text>
              <Text style={styles.statLabel}>Pending</Text>
            </View>
          </View>
        </View>

        {/* Recent Transactions */}
        <View style={styles.transactionsSection}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Recent Transactions</Text>
            <TouchableOpacity onPress={handleViewAllTransactions}>
              <Text style={styles.viewAllText}>View All</Text>
            </TouchableOpacity>
          </View>
          
          {transactions.length > 0 ? (
            <View style={styles.transactionsList}>
              {transactions.map(renderTransaction)}
            </View>
          ) : (
            <View style={styles.emptyTransactions}>
              <Ionicons name="receipt-outline" size={64} color="#333333" />
              <Text style={styles.emptyText}>No transactions yet</Text>
              <Text style={styles.emptySubtext}>Start playing to see your transaction history!</Text>
            </View>
          )}
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
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
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
  refreshButton: {
    padding: 5,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceCard: {
    borderRadius: 20,
    padding: 25,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  balanceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  balanceLabel: {
    color: '#FFFFFF',
    fontSize: 16,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#FFFFFF',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  balanceSubtext: {
    color: '#FFFFFF',
    fontSize: 14,
    opacity: 0.8,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    borderRadius: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  statsSection: {
    marginBottom: 30,
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
    padding: 15,
    alignItems: 'center',
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginVertical: 5,
  },
  statLabel: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  transactionsSection: {
    marginBottom: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  viewAllText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
  },
  transactionsList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  transactionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  transactionTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 2,
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  emptyTransactions: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  emptyText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  emptySubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  footerSpacing: {
    height: 50,
  },
});

export default WalletScreen;