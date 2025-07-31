import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  StatusBar,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';

const AboutScreen = () => {
  const [appInfo, setAppInfo] = useState({
    version: '1.0.0',
    buildNumber: '2024.01.31',
    releaseDate: 'January 31, 2024',
    platform: 'React Native',
  });
  const router = useRouter();

  const teamMembers = [
    {
      name: 'Development Team',
      role: 'Full Stack Development',
      icon: 'code-outline',
      color: '#4CAF50',
    },
    {
      name: 'Design Team',
      role: 'UI/UX Design',
      icon: 'color-palette-outline',
      color: '#2196F3',
    },
    {
      name: 'QA Team',
      role: 'Quality Assurance',
      icon: 'checkmark-circle-outline',
      color: '#FF9800',
    },
    {
      name: 'Support Team',
      role: 'Customer Support',
      icon: 'headset-outline',
      color: '#9C27B0',
    },
  ];

  const features = [
    {
      title: 'Real Money Gaming',
      description: 'Play skill-based games and win real money',
      icon: 'trophy-outline',
    },
    {
      title: 'Secure Payments',
      description: 'Safe and secure payment gateway integration',
      icon: 'shield-checkmark-outline',
    },
    {
      title: 'Live Tournaments',
      description: 'Participate in live tournaments with other players',
      icon: 'people-outline',
    },
    {
      title: 'Instant Withdrawals',
      description: 'Quick and hassle-free money withdrawals',
      icon: 'cash-outline',
    },
    {
      title: '24/7 Support',
      description: 'Round-the-clock customer support',
      icon: 'help-circle-outline',
    },
    {
      title: 'Fair Play',
      description: 'Certified random number generation for fair gameplay',
      icon: 'balance-outline',
    },
  ];

  const socialLinks = [
    {
      name: 'Website',
      url: 'https://alphagames.com',
      icon: 'globe-outline',
      color: '#4CAF50',
    },
    {
      name: 'Facebook',
      url: 'https://facebook.com/alphagames',
      icon: 'logo-facebook',
      color: '#1877F2',
    },
    {
      name: 'Twitter',
      url: 'https://twitter.com/alphagames',
      icon: 'logo-twitter',
      color: '#1DA1F2',
    },
    {
      name: 'Instagram',
      url: 'https://instagram.com/alphagames',
      icon: 'logo-instagram',
      color: '#E4405F',
    },
    {
      name: 'YouTube',
      url: 'https://youtube.com/alphagames',
      icon: 'logo-youtube',
      color: '#FF0000',
    },
  ];

  const legalLinks = [
    {
      title: 'Privacy Policy',
      description: 'How we handle your data',
      url: 'https://alphagames.com/privacy',
    },
    {
      title: 'Terms of Service',
      description: 'Terms and conditions',
      url: 'https://alphagames.com/terms',
    },
    {
      title: 'Responsible Gaming',
      description: 'Play responsibly guidelines',
      url: 'https://alphagames.com/responsible-gaming',
    },
    {
      title: 'Refund Policy',
      description: 'Refund terms and conditions',
      url: 'https://alphagames.com/refund-policy',
    },
  ];

  const handleLinkPress = (url) => {
    Linking.openURL(url).catch(() => {
      Alert.alert('Error', 'Unable to open link');
    });
  };

  const handleRateApp = () => {
    Alert.alert(
      'Rate AlphaGames',
      'Help us improve by rating our app on the store!',
      [
        { text: 'Later', style: 'cancel' },
        {
          text: 'Rate Now',
          onPress: () => {
            // In production, this would open the app store
            Alert.alert('Thank You!', 'This would open the app store for rating.');
          }
        }
      ]
    );
  };

  const handleShareApp = () => {
    Alert.alert(
      'Share AlphaGames',
      'Share this amazing gaming app with your friends!',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Share',
          onPress: () => {
            // In production, this would use the Share API
            Alert.alert('Share', 'This would open the share dialog.');
          }
        }
      ]
    );
  };

  const renderFeature = (feature, index) => (
    <View key={index} style={styles.featureItem}>
      <View style={styles.featureIcon}>
        <Ionicons name={feature.icon} size={24} color="#4CAF50" />
      </View>
      <View style={styles.featureContent}>
        <Text style={styles.featureTitle}>{feature.title}</Text>
        <Text style={styles.featureDescription}>{feature.description}</Text>
      </View>
    </View>
  );

  const renderTeamMember = (member, index) => (
    <View key={index} style={styles.teamMember}>
      <View style={[styles.teamIcon, { backgroundColor: member.color + '20' }]}>
        <Ionicons name={member.icon} size={24} color={member.color} />
      </View>
      <View style={styles.teamContent}>
        <Text style={styles.teamName}>{member.name}</Text>
        <Text style={styles.teamRole}>{member.role}</Text>
      </View>
    </View>
  );

  const renderSocialLink = (link, index) => (
    <TouchableOpacity
      key={index}
      style={styles.socialButton}
      onPress={() => handleLinkPress(link.url)}
    >
      <Ionicons name={link.icon} size={24} color={link.color} />
      <Text style={styles.socialButtonText}>{link.name}</Text>
    </TouchableOpacity>
  );

  const renderLegalLink = (link, index) => (
    <TouchableOpacity
      key={index}
      style={styles.legalLink}
      onPress={() => handleLinkPress(link.url)}
    >
      <View style={styles.legalLinkContent}>
        <Text style={styles.legalLinkTitle}>{link.title}</Text>
        <Text style={styles.legalLinkDescription}>{link.description}</Text>
      </View>
      <Ionicons name="chevron-forward" size={16} color="#666666" />
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
        <Text style={styles.headerTitle}>About AlphaGames</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* App Logo & Info */}
        <View style={styles.appInfoSection}>
          <LinearGradient
            colors={['#4CAF50', '#45a049']}
            style={styles.appLogo}
          >
            <Ionicons name="game-controller" size={40} color="#FFFFFF" />
          </LinearGradient>
          <Text style={styles.appName}>AlphaGames</Text>
          <Text style={styles.appTagline}>Play. Win. Repeat.</Text>
          <Text style={styles.appDescription}>
            The ultimate destination for skill-based real money gaming. 
            Challenge yourself, compete with others, and win exciting prizes!
          </Text>
        </View>

        {/* App Version Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.versionInfo}>
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Version</Text>
              <Text style={styles.versionValue}>{appInfo.version}</Text>
            </View>
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Build</Text>
              <Text style={styles.versionValue}>{appInfo.buildNumber}</Text>
            </View>
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Release Date</Text>
              <Text style={styles.versionValue}>{appInfo.releaseDate}</Text>
            </View>
            <View style={styles.versionItem}>
              <Text style={styles.versionLabel}>Platform</Text>
              <Text style={styles.versionValue}>{appInfo.platform}</Text>
            </View>
          </View>
        </View>

        {/* Key Features */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Key Features</Text>
          <View style={styles.featuresGrid}>
            {features.map(renderFeature)}
          </View>
        </View>

        {/* Development Team */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Our Team</Text>
          <View style={styles.teamGrid}>
            {teamMembers.map(renderTeamMember)}
          </View>
        </View>

        {/* Action Buttons */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Support Us</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.actionButton} onPress={handleRateApp}>
              <LinearGradient
                colors={['#FF9800', '#F57C00']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="star" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Rate App</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.actionButton} onPress={handleShareApp}>
              <LinearGradient
                colors={['#2196F3', '#1976D2']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="share-social" size={20} color="#FFFFFF" />
                <Text style={styles.actionButtonText}>Share App</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>

        {/* Social Media */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Follow Us</Text>
          <View style={styles.socialLinks}>
            {socialLinks.map(renderSocialLink)}
          </View>
        </View>

        {/* Legal Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Legal</Text>
          <View style={styles.legalLinks}>
            {legalLinks.map(renderLegalLink)}
          </View>
        </View>

        {/* Copyright */}
        <View style={styles.copyrightSection}>
          <Text style={styles.copyrightText}>
            © 2024 AlphaGames. All rights reserved.
          </Text>
          <Text style={styles.copyrightSubtext}>
            Made with ❤️ for gaming enthusiasts
          </Text>
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
  appInfoSection: {
    alignItems: 'center',
    marginBottom: 30,
    paddingVertical: 20,
  },
  appLogo: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#4CAF50',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 5,
  },
  appTagline: {
    fontSize: 16,
    color: '#4CAF50',
    fontWeight: '600',
    marginBottom: 15,
  },
  appDescription: {
    fontSize: 14,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 20,
    paddingHorizontal: 20,
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
  versionInfo: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    borderWidth: 1,
    borderColor: '#333333',
  },
  versionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  versionLabel: {
    fontSize: 14,
    color: '#666666',
  },
  versionValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  featuresGrid: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#4CAF50' + '20',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#666666',
    lineHeight: 16,
  },
  teamGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  teamMember: {
    width: '48%',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  teamIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  teamContent: {
    alignItems: 'center',
  },
  teamName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
    textAlign: 'center',
  },
  teamRole: {
    fontSize: 12,
    color: '#666666',
    textAlign: 'center',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  actionButton: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 12,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  socialLinks: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  socialButton: {
    width: '30%',
    alignItems: 'center',
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    paddingVertical: 15,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#333333',
  },
  socialButtonText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    marginTop: 5,
  },
  legalLinks: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#333333',
  },
  legalLink: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#333333',
  },
  legalLinkContent: {
    flex: 1,
  },
  legalLinkTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  legalLinkDescription: {
    fontSize: 12,
    color: '#666666',
  },
  copyrightSection: {
    alignItems: 'center',
    paddingVertical: 20,
    borderTopWidth: 1,
    borderTopColor: '#333333',
  },
  copyrightText: {
    fontSize: 14,
    color: '#666666',
    marginBottom: 5,
  },
  copyrightSubtext: {
    fontSize: 12,
    color: '#666666',
  },
  footerSpacing: {
    height: 50,
  },
});

export default AboutScreen;