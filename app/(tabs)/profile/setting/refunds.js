import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

const RefundsScreen = () => {
  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      <Text style={styles.lastUpdated}>Last updated: July 31, 2025</Text>

      <Text style={styles.heading}>Our Refund Policy</Text>
      <Text style={styles.paragraph}>
        This policy outlines the terms for refunds for digital products and services purchased through the AlphaGames application.
      </Text>

      <Text style={styles.heading}>1. General Policy</Text>
      <Text style={styles.paragraph}>
        All sales of in-app currency, virtual items, and other digital content are final. We do not offer refunds or credits for any purchases unless required by law or as explicitly stated in this policy.
      </Text>

      <Text style={styles.heading}>2. Eligibility for a Refund</Text>
      <Text style={styles.paragraph}>
        A refund may be considered under the following circumstances:
        {`\n`}- Unauthorized purchases made from your account.
        {`\n`}- Technical issues preventing you from accessing or using the purchased content.
        {`\n`}- The purchased content was not delivered to your account.
      </Text>

      <Text style={styles.heading}>3. How to Request a Refund</Text>
      <Text style={styles.paragraph}>
        To request a refund, please contact our support team through the "Help & Support" section of the app within 14 days of the purchase. You will need to provide your username, purchase details, and a clear explanation of the issue.
      </Text>

      <Text style={styles.heading}>4. Processing Refunds</Text>
      <Text style={styles.paragraph}>
        Refund requests are reviewed on a case-by-case basis. If your request is approved, the refund will be processed to your original payment method within 7-10 business days. We reserve the right to deny any refund request that we believe to be fraudulent or abusive.
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

export default RefundsScreen;
