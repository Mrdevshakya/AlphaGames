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

const AddMoneyScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [customAmount, setCustomAmount] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('razorpay');
  const router = useRouter();

  const quickAmounts = [100, 200, 500, 1000, 2000, 5000];
  
  const paymentMethods = [
    {
      id: 'razorpay',
      name: 'Razorpay',
      icon: 'card',
      description: 'Credit/Debit Card, UPI, Net Banking',
      enabled: true,
    },
    {
      id: 'upi',
      name: 'UPI Direct',
      icon: 'phone-portrait',
      description: 'Pay directly via UPI apps',
      enabled: true,
    },
    {
      id: 'paytm',
      name: 'Paytm Wallet',
      icon: 'wallet',
      description: 'Pay using Paytm wallet',
      enabled: false, // Will be enabled in production
    },
  ];

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  const getSelectedAmount = () => {
    if (customAmount && !isNaN(parseFloat(customAmount))) {
      return parseFloat(customAmount);
    }
    return selectedAmount;
  };

  const validateAmount = (amount) => {
    if (!amount || amount < 10) {
      Alert.alert('Invalid Amount', 'Minimum deposit amount is ₹10');
      return false;
    }
    if (amount > 100000) {
      Alert.alert('Invalid Amount', 'Maximum deposit amount is ₹1,00,000');
      return false;
    }
    return true;
  };

  const handleAmountSelect = (amount) => {
    setSelectedAmount(amount);
    setCustomAmount('');
  };

  const handleCustomAmountChange = (text) => {
    setCustomAmount(text);
    setSelectedAmount(null);
  };

  const handlePaymentMethodSelect = (methodId) => {
    const method = paymentMethods.find(m => m.id === methodId);
    if (!method.enabled) {
      Alert.alert('Coming Soon', 'This payment method will be available soon!');
      return;
    }
    setSelectedPaymentMethod(methodId);
  };

  const processPayment = async (amount, method) => {
    try {
      setLoading(true);

      // In production, integrate with actual payment gateway
      // For now, simulate payment process
      
      if (method === 'razorpay') {
        // Simulate Razorpay payment
        await simulateRazorpayPayment(amount);
      } else if (method === 'upi') {
        // Simulate UPI payment
        await simulateUPIPayment(amount);
      }

      // Add transaction to Firebase
      const transactionData = {
        userId: currentUser.uid,
        type: 'credit',
        amount: amount,
        method: method,
        status: 'completed',
        description: `Wallet top-up via ${method}`,
        timestamp: new Date(),
        transactionId: `TXN${Date.now()}${Math.random().toString(36).substr(2, 9)}`,
      };

      await firebaseService.addTransaction(transactionData);

      // Update user wallet balance
      const newBalance = (currentUser.walletBalance || 0) + amount;
      await firebaseService.updateUserProfile(currentUser.uid, {
        walletBalance: newBalance
      });

      Alert.alert(
        'Payment Successful!',
        `₹${amount} has been added to your wallet successfully.`,
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          },
        ]
      );

    } catch (error) {
      console.error('Payment error:', error);
      Alert.alert(
        'Payment Failed',
        'There was an error processing your payment. Please try again.',
        [{ text: 'OK' }]
      );
    } finally {
      setLoading(false);
    }
  };

  const simulateRazorpayPayment = async (amount) => {
    // Simulate payment processing delay
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // In production, integrate with Razorpay SDK
    // const options = {
    //   description: 'AlphaGames Wallet Top-up',
    //   image: 'https://your-logo-url.com/logo.png',
    //   currency: 'INR',
    //   key: 'your_razorpay_key',
    //   amount: amount * 100, // Amount in paise
    //   name: 'AlphaGames',
    //   prefill: {
    //     email: currentUser.email,
    //     contact: currentUser.phoneNumber,
    //     name: currentUser.displayName,
    //   },
    //   theme: { color: '#4CAF50' }
    // };
    
    // return RazorpayCheckout.open(options);
    
    return Promise.resolve({ razorpay_payment_id: 'pay_' + Date.now() });
  };

  const simulateUPIPayment = async (amount) => {
    // Simulate UPI payment processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // In production, integrate with UPI payment gateway
    return Promise.resolve({ upi_transaction_id: 'UPI' + Date.now() });
  };

  const handleProceedToPay = () => {
    const amount = getSelectedAmount();
    
    if (!validateAmount(amount)) {
      return;
    }

    Alert.alert(
      'Confirm Payment',
      `You are about to add ₹${amount} to your wallet using ${paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}. Do you want to proceed?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Proceed',
          onPress: () => processPayment(amount, selectedPaymentMethod),
        },
      ]
    );
  };

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
        <Text style={styles.headerTitle}>Add Money</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Current Balance */}
        <View style={styles.balanceSection}>
          <Text style={styles.balanceLabel}>Current Balance</Text>
          <Text style={styles.balanceAmount}>
            ₹{(currentUser?.walletBalance || 0).toLocaleString()}
          </Text>
        </View>

        {/* Quick Amount Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Select Amount</Text>
          <View style={styles.quickAmounts}>
            {quickAmounts.map((amount) => (
              <TouchableOpacity
                key={amount}
                style={[
                  styles.amountButton,
                  selectedAmount === amount && styles.selectedAmountButton,
                ]}
                onPress={() => handleAmountSelect(amount)}
              >
                <Text
                  style={[
                    styles.amountButtonText,
                    selectedAmount === amount && styles.selectedAmountButtonText,
                  ]}
                >
                  ₹{amount}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount Input */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Or Enter Custom Amount</Text>
          <View style={styles.customAmountContainer}>
            <Text style={styles.currencySymbol}>₹</Text>
            <TextInput
              style={styles.customAmountInput}
              placeholder="Enter amount"
              placeholderTextColor="#666666"
              value={customAmount}
              onChangeText={handleCustomAmountChange}
              keyboardType="numeric"
              maxLength={6}
            />
          </View>
          <Text style={styles.amountLimits}>
            Minimum: ₹10 | Maximum: ₹1,00,000
          </Text>
        </View>

        {/* Payment Methods */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Payment Method</Text>
          {paymentMethods.map((method) => (
            <TouchableOpacity
              key={method.id}
              style={[
                styles.paymentMethod,
                selectedPaymentMethod === method.id && styles.selectedPaymentMethod,
                !method.enabled && styles.disabledPaymentMethod,
              ]}
              onPress={() => handlePaymentMethodSelect(method.id)}
              disabled={!method.enabled}
            >
              <View style={styles.paymentMethodLeft}>
                <View style={[
                  styles.paymentMethodIcon,
                  selectedPaymentMethod === method.id && styles.selectedPaymentMethodIcon,
                  !method.enabled && styles.disabledPaymentMethodIcon,
                ]}>
                  <Ionicons 
                    name={method.icon} 
                    size={24} 
                    color={
                      !method.enabled ? '#666666' :
                      selectedPaymentMethod === method.id ? '#FFFFFF' : '#4CAF50'
                    } 
                  />
                </View>
                <View style={styles.paymentMethodDetails}>
                  <Text style={[
                    styles.paymentMethodName,
                    !method.enabled && styles.disabledText,
                  ]}>
                    {method.name}
                    {!method.enabled && ' (Coming Soon)'}
                  </Text>
                  <Text style={[
                    styles.paymentMethodDescription,
                    !method.enabled && styles.disabledText,
                  ]}>
                    {method.description}
                  </Text>
                </View>
              </View>
              <View style={[
                styles.radioButton,
                selectedPaymentMethod === method.id && styles.selectedRadioButton,
              ]}>
                {selectedPaymentMethod === method.id && (
                  <View style={styles.radioButtonInner} />
                )}
              </View>
            </TouchableOpacity>
          ))}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark" size={20} color="#4CAF50" />
          <Text style={styles.securityText}>
            Your payment is secured with 256-bit SSL encryption
          </Text>
        </View>

        <View style={styles.footerSpacing} />
      </ScrollView>

      {/* Proceed Button */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[
            styles.proceedButton,
            (!getSelectedAmount() || loading) && styles.disabledButton,
          ]}
          onPress={handleProceedToPay}
          disabled={!getSelectedAmount() || loading}
        >
          <LinearGradient
            colors={
              !getSelectedAmount() || loading
                ? ['#666666', '#555555']
                : ['#4CAF50', '#45a049']
            }
            style={styles.proceedButtonGradient}
          >
            {loading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <>
                <Text style={styles.proceedButtonText}>
                  Proceed to Pay {getSelectedAmount() ? `₹${getSelectedAmount()}` : ''}
                </Text>
                <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
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
  quickAmounts: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  amountButton: {
    width: '30%',
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    alignItems: 'center',
    marginBottom: 10,
    backgroundColor: '#1A1A1A',
  },
  selectedAmountButton: {
    borderColor: '#4CAF50',
    backgroundColor: '#4CAF50',
  },
  amountButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  selectedAmountButtonText: {
    color: '#FFFFFF',
  },
  customAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    paddingHorizontal: 15,
  },
  currencySymbol: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
  customAmountInput: {
    flex: 1,
    color: '#FFFFFF',
    fontSize: 18,
    paddingVertical: 15,
  },
  amountLimits: {
    color: '#666666',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  },
  paymentMethod: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#333333',
    marginBottom: 10,
  },
  selectedPaymentMethod: {
    borderColor: '#4CAF50',
  },
  disabledPaymentMethod: {
    opacity: 0.5,
  },
  paymentMethodLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  paymentMethodIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  selectedPaymentMethodIcon: {
    backgroundColor: '#4CAF50',
  },
  disabledPaymentMethodIcon: {
    backgroundColor: '#333333',
  },
  paymentMethodDetails: {
    flex: 1,
  },
  paymentMethodName: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  paymentMethodDescription: {
    color: '#666666',
    fontSize: 12,
  },
  disabledText: {
    color: '#666666',
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
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 15,
    backgroundColor: '#1A1A1A',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#4CAF50' + '30',
  },
  securityText: {
    color: '#4CAF50',
    fontSize: 12,
    marginLeft: 8,
  },
  footerSpacing: {
    height: 20,
  },
  footer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  proceedButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  disabledButton: {
    opacity: 0.6,
  },
  proceedButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
  },
  proceedButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
    marginRight: 10,
  },
});

export default AddMoneyScreen;