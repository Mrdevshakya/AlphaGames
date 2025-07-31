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
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../../../src/services/firebaseService';

const HelpSupportScreen = () => {
  const [loading, setLoading] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [expandedFAQ, setExpandedFAQ] = useState(null);
  const [supportMessage, setSupportMessage] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('general');
  const router = useRouter();

  const supportCategories = [
    { id: 'general', label: 'General', icon: 'help-circle-outline' },
    { id: 'account', label: 'Account', icon: 'person-outline' },
    { id: 'payment', label: 'Payment', icon: 'card-outline' },
    { id: 'technical', label: 'Technical', icon: 'settings-outline' },
    { id: 'gameplay', label: 'Gameplay', icon: 'game-controller-outline' },
  ];

  const faqData = [
    {
      id: 1,
      category: 'general',
      question: 'How do I start playing games?',
      answer: 'To start playing, go to the Games tab, select a game you want to play, choose your entry fee, and join a match. Make sure you have sufficient balance in your wallet.'
    },
    {
      id: 2,
      category: 'account',
      question: 'How do I verify my account?',
      answer: 'Account verification is done through OTP verification during registration. For additional verification, you may need to provide identity documents as requested.'
    },
    {
      id: 3,
      category: 'payment',
      question: 'How do I add money to my wallet?',
      answer: 'Go to your Profile > Wallet > Add Money. You can add money using various payment methods including UPI, credit/debit cards, and net banking.'
    },
    {
      id: 4,
      category: 'payment',
      question: 'How long does withdrawal take?',
      answer: 'Withdrawals are processed within 1-3 business days. The exact time depends on your bank and the withdrawal method chosen.'
    },
    {
      id: 5,
      category: 'technical',
      question: 'The app is running slowly, what should I do?',
      answer: 'Try closing and reopening the app, check your internet connection, or restart your device. If the problem persists, contact our support team.'
    },
    {
      id: 6,
      category: 'gameplay',
      question: 'What happens if I lose connection during a game?',
      answer: 'If you lose connection during a game, you have 60 seconds to reconnect. If you cannot reconnect within this time, the game will continue without you.'
    },
    {
      id: 7,
      category: 'account',
      question: 'How do I change my password?',
      answer: 'Go to Profile > Settings > Privacy & Security > Change Password. You will need to verify your current password before setting a new one.'
    },
    {
      id: 8,
      category: 'payment',
      question: 'Are there any fees for deposits or withdrawals?',
      answer: 'Deposits are free of charge. Withdrawal fees may apply depending on the method chosen. Check the withdrawal screen for current fee structure.'
    }
  ];

  const quickActions = [
    {
      id: 'chat',
      title: 'Live Chat',
      description: 'Chat with our support team',
      icon: 'chatbubble-outline',
      color: '#4CAF50',
      action: () => handleLiveChat(),
    },
    {
      id: 'email',
      title: 'Email Support',
      description: 'Send us an email',
      icon: 'mail-outline',
      color: '#2196F3',
      action: () => handleEmailSupport(),
    },
    {
      id: 'call',
      title: 'Call Support',
      description: 'Speak with our team',
      icon: 'call-outline',
      color: '#FF9800',
      action: () => handleCallSupport(),
    },
    {
      id: 'feedback',
      title: 'Send Feedback',
      description: 'Share your thoughts',
      icon: 'thumbs-up-outline',
      color: '#9C27B0',
      action: () => handleSendFeedback(),
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

  const handleLiveChat = () => {
    Alert.alert(
      'Live Chat',
      'Live chat feature will be available soon! For immediate assistance, please use email or call support.',
      [{ text: 'OK' }]
    );
  };

  const handleEmailSupport = () => {
    const email = 'support@alphagames.com';
    const subject = 'Support Request - AlphaGames';
    const body = `Hi AlphaGames Support Team,

I need assistance with:

User ID: ${currentUser?.uid || 'N/A'}
Email: ${currentUser?.email || 'N/A'}

Please describe your issue here...

Best regards,
${currentUser?.fullName || 'User'}`;

    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    
    Linking.openURL(mailtoUrl).catch(() => {
      Alert.alert(
        'Email Support',
        `Please send your query to: ${email}`,
        [{ text: 'OK' }]
      );
    });
  };

  const handleCallSupport = () => {
    const phoneNumber = '+91-9876543210';
    Alert.alert(
      'Call Support',
      `Support Hours: 9 AM - 9 PM (Mon-Sun)\nPhone: ${phoneNumber}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => {
            Linking.openURL(`tel:${phoneNumber}`).catch(() => {
              Alert.alert('Error', 'Unable to make phone call');
            });
          }
        }
      ]
    );
  };

  const handleSendFeedback = () => {
    if (!supportMessage.trim()) {
      Alert.alert('Error', 'Please enter your feedback message');
      return;
    }

    Alert.alert(
      'Send Feedback',
      'Are you sure you want to send this feedback?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send',
          onPress: async () => {
            try {
              setLoading(true);
              
              const feedbackData = {
                userId: currentUser?.uid,
                userEmail: currentUser?.email,
                userName: currentUser?.fullName,
                category: selectedCategory,
                message: supportMessage,
                timestamp: new Date(),
                status: 'open',
                type: 'feedback'
              };

              await firebaseService.submitSupportTicket(feedbackData);
              
              Alert.alert(
                'Feedback Sent',
                'Thank you for your feedback! We will review it and get back to you if needed.',
                [{ text: 'OK' }]
              );
              
              setSupportMessage('');
            } catch (error) {
              console.error('Error sending feedback:', error);
              Alert.alert('Error', 'Failed to send feedback. Please try again.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  const toggleFAQ = (faqId) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId);
  };

  const filteredFAQs = faqData.filter(faq => faq.category === selectedCategory);

  const renderQuickAction = (action) => (
    <TouchableOpacity
      key={action.id}
      style={styles.quickActionButton}
      onPress={action.action}
    >
      <View style={[styles.quickActionIcon, { backgroundColor: action.color + '20' }]}>
        <Ionicons name={action.icon} size={24} color={action.color} />
      </View>
      <View style={styles.quickActionText}>
        <Text style={styles.quickActionTitle}>{action.title}</Text>
        <Text style={styles.quickActionDescription}>{action.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#666666" />
    </TouchableOpacity>
  );

  const renderFAQItem = (faq) => (
    <TouchableOpacity
      key={faq.id}
      style={styles.faqItem}
      onPress={() => toggleFAQ(faq.id)}
    >
      <View style={styles.faqHeader}>
        <Text style={styles.faqQuestion}>{faq.question}</Text>
        <Ionicons 
          name={expandedFAQ === faq.id ? "chevron-up" : "chevron-down"} 
          size={20} 
          color="#666666" 
        />
      </View>
      {expandedFAQ === faq.id && (
        <Text style={styles.faqAnswer}>{faq.answer}</Text>
      )}
    </TouchableOpacity>
  );

  const renderCategoryButton = (category) => (
    <TouchableOpacity
      key={category.id}
      style={[
        styles.categoryButton,
        selectedCategory === category.id && styles.selectedCategoryButton
      ]}
      onPress={() => setSelectedCategory(category.id)}
    >
      <Ionicons 
        name={category.icon} 
        size={16} 
        color={selectedCategory === category.id ? '#FFFFFF' : '#666666'} 
      />
      <Text style={[
        styles.categoryButtonText,
        selectedCategory === category.id && styles.selectedCategoryButtonText
      ]}>
        {category.label}
      </Text>
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
        <Text style={styles.headerTitle}>Help & Support</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Get Help</Text>
          <View style={styles.quickActionsGrid}>
            {quickActions.map(renderQuickAction)}
          </View>
        </View>

        {/* FAQ Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          
          {/* Category Filter */}
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            style={styles.categoriesContainer}
            contentContainerStyle={styles.categoriesContent}
          >
            {supportCategories.map(renderCategoryButton)}
          </ScrollView>

          {/* FAQ Items */}
          <View style={styles.faqContainer}>
            {filteredFAQs.length > 0 ? (
              filteredFAQs.map(renderFAQItem)
            ) : (
              <View style={styles.emptyFAQ}>
                <Ionicons name="help-circle-outline" size={64} color="#333333" />
                <Text style={styles.emptyText}>No FAQs available</Text>
                <Text style={styles.emptySubtext}>
                  Try selecting a different category or contact support directly
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Contact Form */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Send us a Message</Text>
          
          <View style={styles.contactForm}>
            <Text style={styles.formLabel}>Category</Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              style={styles.formCategoriesContainer}
            >
              {supportCategories.map(renderCategoryButton)}
            </ScrollView>

            <Text style={styles.formLabel}>Your Message</Text>
            <TextInput
              style={styles.messageInput}
              placeholder="Describe your issue or feedback..."
              placeholderTextColor="#666666"
              value={supportMessage}
              onChangeText={setSupportMessage}
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />

            <TouchableOpacity
              style={[
                styles.sendButton,
                (!supportMessage.trim() || loading) && styles.disabledButton
              ]}
              onPress={handleSendFeedback}
              disabled={!supportMessage.trim() || loading}
            >
              <Text style={styles.sendButtonText}>
                {loading ? 'Sending...' : 'Send Message'}
              </Text>
              <Ionicons name="send" size={16} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* App Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.appInfo}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Version</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Build</Text>
              <Text style={styles.infoValue}>2024.01.31</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Support Hours</Text>
              <Text style={styles.infoValue}>9 AM - 9 PM (Mon-Sun)</Text>
            </View>
          </View>
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
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 15,
  },
  quickActionsGrid: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  quickActionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  quickActionText: {
    flex: 1,
  },
  quickActionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  quickActionDescription: {
    fontSize: 12,
    color: '#666666',
  },
  categoriesContainer: {
    marginBottom: 15,
  },
  categoriesContent: {
    paddingRight: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#1A1A1A',
    borderWidth: 1,
    borderColor: '#333333',
    marginRight: 10,
  },
  selectedCategoryButton: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  categoryButtonText: {
    color: '#666666',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 5,
  },
  selectedCategoryButtonText: {
    color: '#FFFFFF',
  },
  faqContainer: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  faqItem: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  faqHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  faqQuestion: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    flex: 1,
    marginRight: 10,
  },
  faqAnswer: {
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
    marginTop: 12,
  },
  emptyFAQ: {
    alignItems: 'center',
    padding: 40,
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
  contactForm: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 10,
  },
  formCategoriesContainer: {
    marginBottom: 20,
  },
  messageInput: {
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#333333',
    paddingHorizontal: 15,
    paddingVertical: 12,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 120,
    marginBottom: 20,
  },
  sendButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    borderRadius: 10,
    paddingVertical: 15,
  },
  disabledButton: {
    backgroundColor: '#666666',
    opacity: 0.6,
  },
  sendButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  appInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  infoLabel: {
    fontSize: 14,
    color: '#666666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  footerSpacing: {
    height: 50,
  },
});

export default HelpSupportScreen;
