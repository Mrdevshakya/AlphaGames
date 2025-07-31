import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const WithdrawScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [selectedBank, setSelectedBank] = useState(null);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [showAddBank, setShowAddBank] = useState(false);
  const [newBankDetails, setNewBankDetails] = useState({
    accountNumber: '',
    ifscCode: '',
    accountHolderName: '',
    bankName: '',
  });
  const router = useRouter();

  const quickAmounts = [100, 500, 1000, 2000, 5000];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        // Load user's saved bank accounts
        const accounts = user.bankAccounts || [];
        setBankAccounts(accounts);
        if (accounts.length > 0) {
          setSelectedBank(accounts[0]);
        }
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const validateWithdrawAmount = (amount) => {
    const numAmount = parseFloat(amount);
    const currentBalance = currentUser?.walletBalance || 0;

    if (!amount || isNaN(numAmount)) {
      Alert.alert('Invalid Amount', 'Please enter a valid amount');
      return false;
    }
    if (numAmount < 50) {
      Alert.alert('Invalid Amount', 'Minimum withdrawal amount is ₹50');
      return false;
    }
    if (numAmount > currentBalance) {
      Alert.alert('Insufficient Balance', 'You don\'t have enough balance to withdraw this amount');
      return false;
    }
    if (numAmount > 50000) {
      Alert.alert('Invalid Amount', 'Maximum withdrawal amount is ₹50,000 per transaction');
      return false;
    }
    return true;
  };

  const validateBankDetails = (details) => {
    if (!details.accountNumber || details.accountNumber.length < 9) {
      Alert.alert('Invalid Details', 'Please enter a valid account number');
      return false;
    }
    if (!details.ifscCode || details.ifscCode.length !== 11) {
      Alert.alert('Invalid Details', 'Please enter a valid IFSC code');
      return false;
    }
    if (!details.accountHolderName || details.accountHolderName.length < 2) {
      Alert.alert('Invalid Details', 'Please enter account holder name');
      return false;
    }
    if (!details.bankName || details.bankName.length < 2) {
      Alert.alert('Invalid Details', 'Please enter bank name');
      return false;
    }
    return true;
  };

  const handleQuickAmountSelect = (amount) => {
    setWithdrawAmount(amount.toString());
  };

  const handleAddBankAccount = async () => {
    if (!validateBankDetails(newBankDetails)) {
      return;
    }

    try {
      setLoading(true);
      
      const bankAccount = {
        id: Date.now().toString(),
        ...newBankDetails,
        addedAt: new Date(),
        isVerified: false, // In production, implement bank verification
      };

      const updatedBankAccounts = [...bankAccounts, bankAccount];
      setBankAccounts(updatedBankAccounts);
      setSelectedBank(bankAccount);

      // Update user profile with new bank account
      await firebaseService.updateUserProfile(currentUser.uid, {
        bankAccounts: updatedBankAccounts
      });

      setShowAddBank(false);
      setNewBankDetails({
        accountNumber: '',
        ifscCode: '',
        accountHolderName: '',
        bankName: '',
      });

      Alert.alert('Success', 'Bank account added successfully!');
    } catch (error) {
      console.error('Error adding bank account:', error);
      Alert.alert('Error', 'Failed to add bank account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const processWithdrawal = async () => {
    const amount = parseFloat(withdrawAmount);
    
    if (!validateWithdrawAmount(withdrawAmount)) {
      return;
    }

    if (!selectedBank) {
      Alert.alert('No Bank Account', 'Please add a bank account to proceed with withdrawal');
      return;
    }

    try {
      setLoading(true);

      // Create withdrawal transaction
      const transactionData = {
        userId: currentUser.uid,
        type: 'withdrawal',
        amount: amount,
        status: 'pending',
        description: `Withdrawal to ${selectedBank.bankName} (****${selectedBank.accountNumber.slice(-4)})`,
        timestamp: new Date(),
        transactionId: `WTH${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
        bankDetails: {
          accountNumber: selectedBank.accountNumber,
          ifscCode: selectedBank.ifscCode,
          accountHolderName: selectedBank.accountHolderName,
          bankName: selectedBank.bankName,
        },
        processingTime: '1-3 business days',
      };

      await firebaseService.addTransaction(transactionData);

      // Deduct amount from wallet (will be refunded if withdrawal fails)
      const newBalance = (currentUser.walletBalance || 0) - amount;
      await firebaseService.updateUserProfile(currentUser.uid, {
        walletBalance: newBalance
      });

      Alert.alert(
        'Withdrawal Initiated!',
        `Your withdrawal request of ₹${amount} has been submitted successfully. The amount will be credited to your bank account within 1-3 business days.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error('Withdrawal error:', error);
      Alert.alert(
        'Withdrawal Failed',
        'There was an error processing your withdrawal request. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const handleProceedWithdraw = () => {
    Alert.alert(
      'Confirm Withdrawal',
      `You are about to withdraw ₹${withdrawAmount} to your ${selectedBank?.bankName} account. This action cannot be undone. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Confirm',
          onPress: processWithdrawal,
        },
      ]
    );
  };

  const renderBankAccount = (account) => (
    <TouchableOpacity
      key={account.id}
      style={[
        styles.bankAccount,
        selectedBank?.id === account.id && styles.selectedBankAccount,
      ]}
      onPress={() => setSelectedBank(account)}
    >
      <View style={styles.bankAccountLeft}>
        <View style={[
          styles.bankIcon,
          selectedBank?.id === account.id && styles.selectedBankIcon,
        ]}>
          <Ionicons 
            name="business" 
            size={24} 
            color={selectedBank?.id === account.id ? '#FFFFFF' : '#4CAF50'} 
          />
        </View>
        <View style={styles.bankDetails}>
          <Text style={styles.bankName}>{account.bankName}</Text>
          <Text style={styles.accountNumber}>
            ****{account.accountNumber.slice(-4)}
          </Text>
          <Text style={styles.accountHolder}>{account.accountHolderName}</Text>
        </View>
      </View>
      <View style={[
        styles.radioButton,
        selectedBank?.id === account.id && styles.selectedRadioButton,
      ]}>
        {selectedBank?.id === account.id && (
          <View style={styles.radioButtonInner} />
        )}
      </View>
    </TouchableOpacity>
  );

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
        <Text style={styles.headerTitle}>Withdraw Money</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{(currentUser?.walletBalance || 0).toLocaleString()}
          </Text>
          <Text style={styles.balanceNote}>
            Minimum withdrawal: ₹50 | Maximum: ₹50,000
          </Text>
        </View>

        {/* Withdrawal Amount */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Withdrawal Amount</Text>
          <View style={styles.amountInputContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="Enter amount to withdraw"
              placeholderTextColor="#666666"
              value={withdrawAmount}
              onChangeText={setWithdrawAmount}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          
          {/* Quick Amount Buttons */}
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={styles.quickAmountButton}
                onPress={() => handleQuickAmountSelect(amount)}
                disabled={(currentUser?.walletBalance || 0) < amount}
              >
                <Text style={[
                  styles.quickAmountText,
                  (currentUser?.walletBalance || 0) < amount && styles.disabledText,
                ]}>
                  ₹{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Bank Accounts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Select Bank Account</Text>
            <TouchableOpacity 
              style={styles.addBankButton}
              onPress={() => setShowAddBank(!showAddBank)}
            >
              <Ionicons name="add-circle" size={20} color="#4CAF50" />
              <Text style={styles.addBankText}>Add Bank</Text>
            </TouchableOpacity>
          </View>

          {bankAccounts.length > 0 ? (
            <View style={styles.bankAccountsList}>
              {bankAccounts.map(renderBankAccount)}
            </View>
          ) : (
            <View style={styles.noBankAccounts}>
              <Ionicons name="business-outline" size={64} color="#333333" />
              <Text style={styles.noBankText}>No bank accounts added</Text>
              <Text style={styles.noBankSubtext}>Add a bank account to withdraw money</Text>
            </View>
          )}
        </View>

        {/* Add Bank Form */}
        {showAddBank && (
          <View style={styles.addBankForm}>
            <Text style={styles.formTitle}>Add Bank Account</Text>
            
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Holder Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter account holder name"
                placeholderTextColor="#666666"
                value={newBankDetails.accountHolderName}
                onChangeText={(text) => setNewBankDetails({
                  ...newBankDetails,
                  accountHolderName: text
                })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Bank Name</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter bank name"
                placeholderTextColor="#666666"
                value={newBankDetails.bankName}
                onChangeText={(text) => setNewBankDetails({
                  ...newBankDetails,
                  bankName: text
                })}
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Account Number</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter account number"
                placeholderTextColor="#666666"
                value={newBankDetails.accountNumber}
                onChangeText={(text) => setNewBankDetails({
                  ...newBankDetails,
                  accountNumber: text
                })}
                keyboardType="numeric"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>IFSC Code</Text>
              <TextInput
                style={styles.textInput}
                placeholder="Enter IFSC code"
                placeholderTextColor="#666666"
                value={newBankDetails.ifscCode}
                onChangeText={(text) => setNewBankDetails({
                  ...newBankDetails,
                  ifscCode: text.toUpperCase()
                })}
                autoCapitalize="characters"
                maxLength={11}
              />
            </View>

            <TouchableOpacity
              style={styles.addBankSubmitButton}
              onPress={handleAddBankAccount}
              disabled={loading}
            >
              <LinearGradient
                colors={['#4CAF50', '#45a049']}
                style={styles.addBankSubmitGradient}
              >
                {loading ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.addBankSubmitText}>Add Bank Account</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        )}

        {/* Processing Info */}
        <View style={styles.processingInfo}>
          <Ionicons name="information-circle" size={20} color="#4CAF50" />
          <View style={styles.processingText}>
            <Text style={styles.processingTitle}>Processing Time</Text>
            <Text style={styles.processingDescription}>
              Withdrawals are processed within 1-3 business days. You'll receive a confirmation once the amount is credited to your account.
            </Text>
          </View>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Withdraw Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.withdrawButton,
            (!withdrawAmount || !selectedBank || loading) && styles.disabledButton,
          ]}
          onPress={handleProceedWithdraw}
          disabled={!withdrawAmount || !selectedBank || loading}
        >
          <LinearGradient
            colors={
              !withdrawAmount || !selectedBank || loading
                ? ['#666666', '#555555']
                : ['#FF9800', '#F57C00']
            }
            style={styles.withdrawButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.withdrawButtonText}>
                  Withdraw {withdrawAmount ? `₹${withdrawAmount}` : ''}
                </Text>
                <Ionicons name="cash" size={20} color="#FFFFFF" />
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
  placeholder: {
    width: 34,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  balanceSection: {
    alignItems: 'center',
    marginBottom: 30,
    padding: 20,
    backgroundColor: '#1A1A1A',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
  },
  balanceLabel: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 5,
  },
  balanceAmount: {
    color: '#4CAF50',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  balanceNote: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
  },
  section: {
    marginBottom: 25,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  addBankButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  addBankText: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 5,
  },
  amountInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    paddingHorizontal: 15,
    marginBottom: 15,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  amountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 15,
  },
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  quickAmountButton: {
    width: '18%',
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
  },
  quickAmountText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  disabledText: {
    color: '#666666',
  },
  bankAccountsList: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  bankAccount: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  selectedBankAccount: {
    backgroundColor: '#4CAF50' + '10',
  },
  bankAccountLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  bankIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  selectedBankIcon: {
    backgroundColor: '#4CAF50',
  },
  bankDetails: {
    flex: 1,
  },
  bankName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  accountNumber: {
    color: '#666666',
    fontSize: 14,
    marginBottom: 2,
  },
  accountHolder: {
    color: '#666666',
    fontSize: 12,
  },
  radioButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    justifyContent: 'center',
  },
  selectedRadioButton: {
    borderColor: '#4CAF50',
  },
  radioButtonInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#4CAF50',
  },
  noBankAccounts: {
    alignItems: 'center',
    padding: 40,
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  noBankText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 15,
    marginBottom: 5,
  },
  noBankSubtext: {
    color: '#666666',
    fontSize: 14,
    textAlign: 'center',
  },
  addBankForm: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
    marginBottom: 20,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
  },
  addBankSubmitButton: {
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 10,
  },
  addBankSubmitGradient: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  addBankSubmitText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  processingInfo: {
    flexDirection: 'row',
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50' + '30',
  },
  processingText: {
    flex: 1,
    marginLeft: 10,
  },
  processingTitle: {
    color: '#4CAF50',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  processingDescription: {
    color: '#666666',
    fontSize: 12,
    lineHeight: 16,
  },
  footerSpacing: {
    height: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  withdrawButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  withdrawButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  withdrawButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default WithdrawScreen;