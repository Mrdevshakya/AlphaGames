import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  RefreshControl,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { firebaseService } from '../../src/services/firebaseService';

const TransactionsScreen = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const router = useRouter();

  const filterOptions = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'credit', label: 'Credits', icon: 'arrow-down-circle' },
    { id: 'debit', label: 'Debits', icon: 'arrow-up-circle' },
    { id: 'withdrawal', label: 'Withdrawals', icon: 'cash' },
    { id: 'refund', label: 'Refunds', icon: 'refresh-circle' },
  ];

  useEffect(() => {
    loadTransactions();
  }, []);

  useEffect(() => {
    filterTransactions();
  }, [transactions, selectedFilter, searchQuery]);

  const loadTransactions = async () => {
    try {
      setLoading(true);
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        const userTransactions = await firebaseService.getUserTransactions(user.uid);
        setTransactions(userTransactions);
      }
    } catch (error) {
      console.error('Error loading transactions:', error);
      Alert.alert('Error', 'Failed to load transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = React.useCallback(async () => {
    setRefreshing(true);
    await loadTransactions();
    setRefreshing(false);
  }, []);

  const filterTransactions = () => {
    let filtered = transactions;

    // Apply type filter
    if (selectedFilter !== 'all') {
      filtered = filtered.filter(transaction => transaction.type === selectedFilter);
    }

    // Apply search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(transaction =>
        transaction.description?.toLowerCase().includes(query) ||
        transaction.transactionId?.toLowerCase().includes(query) ||
        transaction.method?.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
  };

  const formatTransactionDate = (timestamp) => {
    if (!timestamp) return 'Unknown';
    
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffInMs = now - date;
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInDays === 0) {
      if (diffInHours === 0) {
        const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
        return diffInMinutes <= 1 ? 'Just now' : `${diffInMinutes} minutes ago`;
      }
      return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      });
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

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'failed':
        return '#FF5722';
      case 'cancelled':
        return '#666666';
      default:
        return '#666666';
    }
  };

  const handleTransactionPress = (transaction) => {
    Alert.alert(
      'Transaction Details',
      `Transaction ID: ${transaction.transactionId}\n` +
      `Type: ${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}\n` +
      `Amount: ₹${transaction.amount}\n` +
      `Status: ${transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}\n` +
      `Method: ${transaction.method || 'N/A'}\n` +
      `Date: ${formatTransactionDate(transaction.timestamp)}\n` +
      `Description: ${transaction.description || 'No description'}`,
      [{ text: 'OK' }]
    );
  };

  const renderTransaction = (transaction) => {
    const icon = getTransactionIcon(transaction);
    const isCredit = transaction.type === 'credit';
    const amount = isCredit ? `+₹${transaction.amount}` : `-₹${transaction.amount}`;

    return (
      <TouchableOpacity
        key={transaction.id}
        style={styles.transactionItem}
        onPress={() => handleTransactionPress(transaction)}
      >
        <View style={[styles.transactionIcon, { backgroundColor: icon.color + '20' }]}>
          <Ionicons name={icon.name} size={24} color={icon.color} />
        </View>
        
        <View style={styles.transactionDetails}>
          <Text style={styles.transactionTitle}>
            {transaction.description || `${transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}`}
          </Text>
          <Text style={styles.transactionId}>
            ID: {transaction.transactionId}
          </Text>
          <Text style={styles.transactionTime}>
            {formatTransactionDate(transaction.timestamp)}
          </Text>
          <View style={styles.transactionMeta}>
            <Text style={[styles.transactionStatus, {
              color: getStatusColor(transaction.status)
            }]}>
              {transaction.status?.charAt(0).toUpperCase() + transaction.status?.slice(1)}
            </Text>
            {transaction.method && (
              <Text style={styles.transactionMethod}>
                via {transaction.method.toUpperCase()}
              </Text>
            )}
          </View>
        </View>
        
        <View style={styles.transactionRight}>
          <Text style={[styles.transactionAmount, {
            color: isCredit ? '#4CAF50' : '#FF5722'
          }]}>
            {amount}
          </Text>
          <Ionicons name="chevron-forward" size={16} color="#666666" />
        </View>
      </TouchableOpacity>
    );
  };

  const renderFilterButton = (filter) => (
    <TouchableOpacity
      key={filter.id}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.selectedFilterButton,
      ]}
      onPress={() => setSelectedFilter(filter.id)}
    >
      <Ionicons 
        name={filter.icon} 
        size={16} 
        color={selectedFilter === filter.id ? '#FFFFFF' : '#666666'} 
      />
      <Text style={[
        styles.filterButtonText,
        selectedFilter === filter.id && styles.selectedFilterButtonText,
      ]}>
        {filter.label}
      </Text>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.loadingContainer]}>
        <StatusBar barStyle="light-content" backgroundColor="#000000" />
        <Text style={styles.loadingText}>Loading transactions...</Text>
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
        <Text style={styles.headerTitle}>Transaction History</Text>
        <TouchableOpacity 
          style={styles.refreshButton} 
          onPress={onRefresh}
        >
          <Ionicons name="refresh-outline" size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <Ionicons name="search" size={20} color="#666666" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search transactions..."
            placeholderTextColor="#666666"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="#666666" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Buttons */}
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filterOptions.map(renderFilterButton)}
      </ScrollView>

      {/* Transactions List */}
      <ScrollView 
        style={styles.content}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Summary Stats */}
        <View style={styles.summarySection}>
          <Text style={styles.summaryTitle}>
            {selectedFilter === 'all' ? 'All Transactions' : 
             filterOptions.find(f => f.id === selectedFilter)?.label} 
            ({filteredTransactions.length})
          </Text>
          {filteredTransactions.length > 0 && (
            <Text style={styles.summaryAmount}>
              Total: ₹{filteredTransactions.reduce((sum, t) => {
                return sum + (t.type === 'credit' ? t.amount : -t.amount);
              }, 0).toLocaleString()}
            </Text>
          )}
        </View>

        {filteredTransactions.length > 0 ? (
          <View style={styles.transactionsList}>
            {filteredTransactions.map(renderTransaction)}
          </View>
        ) : (
          <View style={styles.emptyTransactions}>
            <Ionicons name="receipt-outline" size={64} color="#333333" />
            <Text style={styles.emptyText}>
              {searchQuery ? 'No matching transactions' : 'No transactions found'}
            </Text>
            <Text style={styles.emptySubtext}>
              {searchQuery 
                ? 'Try adjusting your search or filter criteria'
                : selectedFilter === 'all' 
                  ? 'Start playing to see your transaction history!'
                  : `No ${filterOptions.find(f => f.id === selectedFilter)?.label.toLowerCase()} found`
              }
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  searchInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 16,
    marginLeft: 10,
  },
  filtersContainer: {
    paddingVertical: 4,
  },
  filtersContent: {
    paddingHorizontal: 12,
  },
  filterButton: {
    height: 30,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    marginRight: 6,
  },
  selectedFilterButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterButtonText: {
    color: '#666666',
    fontSize: 10,
    fontWeight: '600',
    marginLeft: 3,
  },
  selectedFilterButtonText: {
    color: '#FFFFFF',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  summarySection: {
    marginBottom: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  summaryAmount: {
    fontSize: 14,
    color: '#4CAF50',
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
  transactionId: {
    fontSize: 11,
    color: '#666666',
    marginBottom: 4,
    fontFamily: 'monospace',
  },
  transactionTime: {
    fontSize: 12,
    color: '#666666',
    marginBottom: 4,
  },
  transactionMeta: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  transactionStatus: {
    fontSize: 12,
    fontWeight: '600',
    marginRight: 10,
  },
  transactionMethod: {
    fontSize: 10,
    color: '#666666',
    backgroundColor: '#333333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  transactionRight: {
    alignItems: 'flex-end',
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
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
    lineHeight: 20,
  },
  footerSpacing: {
    height: 50,
  },
});

export default TransactionsScreen;