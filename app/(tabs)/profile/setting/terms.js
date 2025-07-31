import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const TermsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.lastUpdated}>Last updated: July 31, 2025</Text>

      <Text style={styles.heading}>1. Acceptance of Terms</Text>
      <Text style={styles.paragraph}>
        By accessing and using the AlphaGames application (the "Service"), you agree to be bound by these Terms & Conditions. If you do not agree with any part of these terms, you may not use our Service.
      </Text>

      <Text style={styles.heading}>2. User Accounts</Text>
      <Text style={styles.paragraph}>
        To use certain features of the Service, you must create an account. You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
      </Text>

      <Text style={styles.heading}>3. User Conduct</Text>
      <Text style={styles.paragraph}>
        You agree not to use the Service for any unlawful purpose or to engage in any conduct that is harmful, offensive, or disruptive. Cheating, exploiting bugs, or engaging in any form of unfair play is strictly prohibited.
      </Text>

      <Text style={styles.heading}>4. Intellectual Property</Text>
      <Text style={styles.paragraph}>
        The Service and its original content, features, and functionality are and will remain the exclusive property of AlphaGames and its licensors. The Service is protected by copyright, trademark, and other laws.
      </Text>

      <Text style={styles.heading}>5. Termination</Text>
      <Text style={styles.paragraph}>
        We may terminate or suspend your account at any time, without prior notice or liability, for any reason, including if you breach these Terms & Conditions.
      </Text>

      <Text style={styles.heading}>6. Changes to Terms</Text>
      <Text style={styles.paragraph}>
        We reserve the right to modify or replace these Terms at any time. We will provide at least 30 days' notice before any new terms take effect. By continuing to use the Service after those revisions become effective, you agree to be bound by the revised terms.
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  contentContainer: {
    padding: 20,
  },
  lastUpdated: {
    color: '#666666',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 20,
  },
  heading: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
  },
  paragraph: {
    color: '#FFFFFF',
    fontSize: 14,
    lineHeight: 22,
  },
});

export default TermsScreen;
