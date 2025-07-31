import { Alert } from 'react-native';
import { firebaseService } from './firebaseService';
import { storage } from '../utils/storage';

class PaymentService {
  constructor() {
    this.razorpayKey = 'rzp_test_your_key_here'; // Replace with actual key
    this.isInitialized = false;
  }

  // Initialize payment service
  async initialize() {
    try {
      // In a real implementation, you would initialize Razorpay SDK here
      this.isInitialized = true;
      return true;
    } catch (error) {
      console.error('Error initializing payment service:', error);
      return false;
    }
  }

  // Add money to wallet
  async addMoney(userId, amount, paymentMethod = 'razorpay') {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      // Validate amount
      if (amount < 10) {
        throw new Error('Minimum amount is ₹10');
      }

      if (amount > 50000) {
        throw new Error('Maximum amount is ₹50,000');
      }

      // Create payment order
      const order = await this.createPaymentOrder(amount, userId);

      // Process payment based on method
      let paymentResult;
      switch (paymentMethod) {
        case 'razorpay':
          paymentResult = await this.processRazorpayPayment(order, amount);
          break;
        case 'upi':
          paymentResult = await this.processUPIPayment(order, amount);
          break;
        case 'card':
          paymentResult = await this.processCardPayment(order, amount);
          break;
        default:
          throw new Error('Unsupported payment method');
      }

      if (paymentResult.success) {
        // Update wallet balance
        await this.updateWalletAfterPayment(userId, amount, paymentResult);
        
        // Record transaction
        await this.recordTransaction(userId, {
          type: 'credit',
          amount,
          method: paymentMethod,
          orderId: order.id,
          paymentId: paymentResult.paymentId,
          status: 'completed',
          description: 'Money added to wallet',
        });

        return {
          success: true,
          amount,
          paymentId: paymentResult.paymentId,
          orderId: order.id,
        };
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }

    } catch (error) {
      console.error('Error adding money:', error);
      
      // Record failed transaction
      await this.recordTransaction(userId, {
        type: 'credit',
        amount,
        method: paymentMethod,
        status: 'failed',
        error: error.message,
        description: 'Failed to add money to wallet',
      });

      throw error;
    }
  }

  // Create payment order
  async createPaymentOrder(amount, userId) {
    try {
      // In a real implementation, this would call your backend API
      // which would create a Razorpay order
      const order = {
        id: `order_${Date.now()}`,
        amount: amount * 100, // Razorpay expects amount in paise
        currency: 'INR',
        receipt: `receipt_${userId}_${Date.now()}`,
        status: 'created',
      };

      return order;
    } catch (error) {
      console.error('Error creating payment order:', error);
      throw error;
    }
  }

  // Process Razorpay payment
  async processRazorpayPayment(order, amount) {
    try {
      // Simulate Razorpay payment flow
      // In a real implementation, you would use Razorpay SDK
      
      return new Promise((resolve) => {
        Alert.alert(
          'Razorpay Payment',
          `Pay ₹${amount} using Razorpay?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled by user'
              })
            },
            {
              text: 'Pay',
              onPress: () => {
                // Simulate successful payment
                setTimeout(() => {
                  resolve({
                    success: true,
                    paymentId: `pay_${Date.now()}`,
                    orderId: order.id,
                    method: 'razorpay',
                  });
                }, 2000);
              }
            }
          ]
        );
      });

    } catch (error) {
      console.error('Error processing Razorpay payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process UPI payment
  async processUPIPayment(order, amount) {
    try {
      // Simulate UPI payment flow
      return new Promise((resolve) => {
        Alert.alert(
          'UPI Payment',
          `Pay ₹${amount} using UPI?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled by user'
              })
            },
            {
              text: 'Pay',
              onPress: () => {
                setTimeout(() => {
                  resolve({
                    success: true,
                    paymentId: `upi_${Date.now()}`,
                    orderId: order.id,
                    method: 'upi',
                  });
                }, 1500);
              }
            }
          ]
        );
      });

    } catch (error) {
      console.error('Error processing UPI payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Process card payment
  async processCardPayment(order, amount) {
    try {
      // Simulate card payment flow
      return new Promise((resolve) => {
        Alert.alert(
          'Card Payment',
          `Pay ₹${amount} using Credit/Debit Card?`,
          [
            {
              text: 'Cancel',
              style: 'cancel',
              onPress: () => resolve({
                success: false,
                error: 'Payment cancelled by user'
              })
            },
            {
              text: 'Pay',
              onPress: () => {
                setTimeout(() => {
                  resolve({
                    success: true,
                    paymentId: `card_${Date.now()}`,
                    orderId: order.id,
                    method: 'card',
                  });
                }, 2500);
              }
            }
          ]
        );
      });

    } catch (error) {
      console.error('Error processing card payment:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Update wallet after successful payment
  async updateWalletAfterPayment(userId, amount, paymentResult) {
    try {
      // Update in Firebase if available
      if (firebaseService.getCurrentUser()) {
        await firebaseService.updateWalletBalance(
          userId,
          amount,
          'add',
          'Money added via payment gateway'
        );
      }

      // Update local storage
      await storage.updateWalletBalance(amount, 'add');

      return true;
    } catch (error) {
      console.error('Error updating wallet after payment:', error);
      throw error;
    }
  }

  // Record transaction
  async recordTransaction(userId, transactionData) {
    try {
      const transaction = {
        ...transactionData,
        userId,
        timestamp: new Date().toISOString(),
        id: `txn_${Date.now()}`,
      };

      // Record in Firebase if available
      if (firebaseService.getCurrentUser()) {
        await firebaseService.addTransaction(userId, transaction);
      }

      // Record locally
      await storage.addTransaction(transaction);

      return transaction;
    } catch (error) {
      console.error('Error recording transaction:', error);
    }
  }

  // Withdraw money from wallet
  async withdrawMoney(userId, amount, upiId) {
    try {
      // Validate withdrawal
      const currentBalance = await storage.getWalletBalance();
      
      if (amount < 50) {
        throw new Error('Minimum withdrawal amount is ₹50');
      }

      if (amount > currentBalance) {
        throw new Error('Insufficient wallet balance');
      }

      if (!this.validateUPI(upiId)) {
        throw new Error('Invalid UPI ID');
      }

      // Create withdrawal request
      const withdrawalRequest = {
        userId,
        amount,
        upiId,
        status: 'pending',
        requestedAt: new Date().toISOString(),
        id: `wd_${Date.now()}`,
      };

      // Deduct amount from wallet (will be refunded if withdrawal fails)
      await storage.updateWalletBalance(amount, 'subtract');

      // Record withdrawal transaction
      await this.recordTransaction(userId, {
        type: 'withdrawal',
        amount,
        status: 'pending',
        description: `Withdrawal to ${upiId}`,
        withdrawalId: withdrawalRequest.id,
      });

      // In a real implementation, this would be sent to backend for processing
      // For now, we'll simulate the process
      setTimeout(async () => {
        await this.processWithdrawal(withdrawalRequest);
      }, 5000);

      return withdrawalRequest;

    } catch (error) {
      console.error('Error withdrawing money:', error);
      throw error;
    }
  }

  // Process withdrawal (simulated)
  async processWithdrawal(withdrawalRequest) {
    try {
      // Simulate withdrawal processing
      const success = Math.random() > 0.1; // 90% success rate

      if (success) {
        // Update withdrawal status
        await this.updateWithdrawalStatus(
          withdrawalRequest.id,
          'completed',
          'Withdrawal processed successfully'
        );

        // Send notification
        Alert.alert(
          'Withdrawal Successful',
          `₹${withdrawalRequest.amount} has been transferred to ${withdrawalRequest.upiId}`
        );

      } else {
        // Refund amount to wallet
        await storage.updateWalletBalance(withdrawalRequest.amount, 'add');

        // Update withdrawal status
        await this.updateWithdrawalStatus(
          withdrawalRequest.id,
          'failed',
          'Withdrawal failed. Amount refunded to wallet.'
        );

        Alert.alert(
          'Withdrawal Failed',
          'Your withdrawal request failed. Amount has been refunded to your wallet.'
        );
      }

    } catch (error) {
      console.error('Error processing withdrawal:', error);
    }
  }

  // Update withdrawal status
  async updateWithdrawalStatus(withdrawalId, status, message) {
    try {
      // Update transaction record
      const transactions = await storage.getTransactions();
      const updatedTransactions = transactions.map(txn => {
        if (txn.withdrawalId === withdrawalId) {
          return {
            ...txn,
            status,
            statusMessage: message,
            updatedAt: new Date().toISOString(),
          };
        }
        return txn;
      });

      // Save updated transactions
      await storage.setItem('transactions', JSON.stringify(updatedTransactions));

    } catch (error) {
      console.error('Error updating withdrawal status:', error);
    }
  }

  // Validate UPI ID
  validateUPI(upiId) {
    const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
    return upiRegex.test(upiId);
  }

  // Get payment methods
  getPaymentMethods() {
    return [
      {
        id: 'razorpay',
        name: 'Razorpay',
        description: 'Pay using Razorpay (UPI, Cards, Net Banking)',
        icon: '💳',
        enabled: true,
      },
      {
        id: 'upi',
        name: 'UPI',
        description: 'Pay directly using UPI',
        icon: '📱',
        enabled: true,
      },
      {
        id: 'card',
        name: 'Credit/Debit Card',
        description: 'Pay using your card',
        icon: '💳',
        enabled: true,
      },
    ];
  }

  // Get transaction history
  async getTransactionHistory(userId, limit = 50) {
    try {
      // Get from Firebase if available
      if (firebaseService.getCurrentUser()) {
        return await firebaseService.getTransactions(userId, limit);
      }

      // Get from local storage
      return await storage.getTransactions();

    } catch (error) {
      console.error('Error getting transaction history:', error);
      return [];
    }
  }

  // Verify payment status
  async verifyPayment(paymentId, orderId) {
    try {
      // In a real implementation, this would verify with Razorpay
      // For now, we'll simulate verification
      
      return {
        verified: true,
        status: 'captured',
        amount: 0, // Would be actual amount
        method: 'razorpay',
      };

    } catch (error) {
      console.error('Error verifying payment:', error);
      return {
        verified: false,
        error: error.message,
      };
    }
  }

  // Handle payment failure
  async handlePaymentFailure(userId, orderId, error) {
    try {
      // Record failed transaction
      await this.recordTransaction(userId, {
        type: 'credit',
        amount: 0,
        status: 'failed',
        orderId,
        error: error.message,
        description: 'Payment failed',
      });

      // Send notification
      Alert.alert(
        'Payment Failed',
        'Your payment could not be processed. Please try again.'
      );

    } catch (err) {
      console.error('Error handling payment failure:', err);
    }
  }

  // Get wallet balance
  async getWalletBalance(userId) {
    try {
      // Get from Firebase if available
      if (firebaseService.getCurrentUser()) {
        const user = await firebaseService.getUser(userId);
        return user?.walletBalance || 0;
      }

      // Get from local storage
      return await storage.getWalletBalance();

    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return 0;
    }
  }

  // Calculate platform fee
  calculatePlatformFee(amount, feePercentage = 2) {
    return Math.round(amount * (feePercentage / 100));
  }

  // Get supported currencies
  getSupportedCurrencies() {
    return [
      {
        code: 'INR',
        symbol: '₹',
        name: 'Indian Rupee',
        default: true,
      }
    ];
  }

  // Cleanup
  cleanup() {
    this.isInitialized = false;
  }
}

// Export singleton instance
export const paymentService = new PaymentService();
export default paymentService;