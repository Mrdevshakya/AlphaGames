import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Dimensions,
  ImageBackground,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const { width, height } = Dimensions.get('window');

//AlphaGames -style Gradient Button
export const AlphaGamesButton = ({ 
  title, 
  onPress, 
  colors = ['#FF6B35', '#F7931E'], 
  style = {}, 
  textStyle = {},
  disabled = false,
  icon = null,
  size = 'medium'
}) => {
  const buttonSizes = {
    small: { paddingVertical: 8, paddingHorizontal: 16, fontSize: 14 },
    medium: { paddingVertical: 12, paddingHorizontal: 24, fontSize: 16 },
    large: { paddingVertical: 16, paddingHorizontal: 32, fontSize: 18 },
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      activeOpacity={0.8}
      style={[styles.buttonContainer, style]}
    >
      <LinearGradient
        colors={disabled ? ['#666', '#888'] : colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.gradientButton,
          {
            paddingVertical: buttonSizes[size].paddingVertical,
            paddingHorizontal: buttonSizes[size].paddingHorizontal,
          }
        ]}
      >
        <View style={styles.buttonContent}>
          {icon && <View style={styles.buttonIcon}>{icon}</View>}
          <Text style={[
            styles.buttonText,
            { fontSize: buttonSizes[size].fontSize },
            textStyle
          ]}>
            {title}
          </Text>
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// AlphaGames-style Card Component
export const AlphaGamesCard = ({ 
  children, 
  style = {}, 
  gradient = false,
  colors = ['#1a1a2e', '#16213e'],
  elevation = 5
}) => {
  if (gradient) {
    return (
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.card, { elevation }, style]}
      >
        {children}
      </LinearGradient>
    );
  }

  return (
    <View style={[styles.card, { elevation }, style]}>
      {children}
    </View>
  );
};

// AlphaGames-style Game Mode Card
export const GameModeCard = ({ 
  title, 
  subtitle, 
  icon, 
  onPress, 
  colors = ['#FF6B35', '#F7931E'],
  prize = null,
  players = null,
  entryFee = null
}) => {
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.gameModeCard}
      >
        <View style={styles.gameModeHeader}>
          <View style={styles.gameModeIcon}>
            <Text style={styles.gameModeIconText}>{icon}</Text>
          </View>
          <View style={styles.gameModeInfo}>
            <Text style={styles.gameModeTitle}>{title}</Text>
            <Text style={styles.gameModeSubtitle}>{subtitle}</Text>
          </View>
        </View>
        
        {(prize || players || entryFee) && (
          <View style={styles.gameModeDetails}>
            {prize && (
              <View style={styles.gameModeDetail}>
                <Text style={styles.gameModeDetailLabel}>Prize</Text>
                <Text style={styles.gameModeDetailValue}>₹{prize}</Text>
              </View>
            )}
            {players && (
              <View style={styles.gameModeDetail}>
                <Text style={styles.gameModeDetailLabel}>Players</Text>
                <Text style={styles.gameModeDetailValue}>{players}</Text>
              </View>
            )}
            {entryFee && (
              <View style={styles.gameModeDetail}>
                <Text style={styles.gameModeDetailLabel}>Entry</Text>
                <Text style={styles.gameModeDetailValue}>₹{entryFee}</Text>
              </View>
            )}
          </View>
        )}
      </LinearGradient>
    </TouchableOpacity>
  );
};

// ZupAlphaGamesee-style Stats Card
export const StatsCard = ({ 
  icon, 
  value, 
  label, 
  colors = ['#1a1a2e', '#16213e'],
  iconColor = '#FF6B35'
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.statsCard}
    >
      <View style={[styles.statsIcon, { backgroundColor: iconColor + '20' }]}>
        <Text style={[styles.statsIconText, { color: iconColor }]}>{icon}</Text>
      </View>
      <Text style={styles.statsValue}>{value}</Text>
      <Text style={styles.statsLabel}>{label}</Text>
    </LinearGradient>
  );
};

// AlphaGames-style Header
export const AlphaGamesHeader = ({ 
  title, 
  subtitle = null, 
  leftIcon = null, 
  rightIcon = null, 
  onLeftPress = null, 
  onRightPress = null,
  colors = ['#1a1a2e', '#16213e']
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.header}
    >
      <View style={styles.headerContent}>
        {leftIcon && (
          <TouchableOpacity onPress={onLeftPress} style={styles.headerButton}>
            {leftIcon}
          </TouchableOpacity>
        )}
        
        <View style={styles.headerTitleContainer}>
          <Text style={styles.headerTitle}>{title}</Text>
          {subtitle && <Text style={styles.headerSubtitle}>{subtitle}</Text>}
        </View>
        
        {rightIcon && (
          <TouchableOpacity onPress={onRightPress} style={styles.headerButton}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
    </LinearGradient>
  );
};

// AlphaGames-style Tournament Card
export const TournamentCard = ({ 
  title, 
  prize, 
  entryFee, 
  participants, 
  maxParticipants,
  timeLeft,
  onPress,
  status = 'upcoming' // upcoming, live, completed
}) => {
  const statusColors = {
    upcoming: ['#3498db', '#2980b9'],
    live: ['#e74c3c', '#c0392b'],
    completed: ['#95a5a6', '#7f8c8d']
  };

  const statusText = {
    upcoming: '🕐 Starting Soon',
    live: '🔴 Live Now',
    completed: '✅ Completed'
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
      <LinearGradient
        colors={statusColors[status]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tournamentCard}
      >
        <View style={styles.tournamentHeader}>
          <Text style={styles.tournamentTitle}>{title}</Text>
          <Text style={styles.tournamentStatus}>{statusText[status]}</Text>
        </View>
        
        <View style={styles.tournamentDetails}>
          <View style={styles.tournamentDetail}>
            <Text style={styles.tournamentDetailLabel}>Prize Pool</Text>
            <Text style={styles.tournamentDetailValue}>₹{prize}</Text>
          </View>
          <View style={styles.tournamentDetail}>
            <Text style={styles.tournamentDetailLabel}>Entry Fee</Text>
            <Text style={styles.tournamentDetailValue}>₹{entryFee}</Text>
          </View>
        </View>
        
        <View style={styles.tournamentFooter}>
          <Text style={styles.tournamentParticipants}>
            👥 {participants}/{maxParticipants} Players
          </Text>
          {timeLeft && (
            <Text style={styles.tournamentTime}>⏰ {timeLeft}</Text>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

// AlphaGames-style Wallet Balance Card
export const WalletCard = ({ 
  balance, 
  onAddMoney, 
  onWithdraw,
  colors = ['#27ae60', '#2ecc71']
}) => {
  return (
    <LinearGradient
      colors={colors}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.walletCard}
    >
      <View style={styles.walletHeader}>
        <Text style={styles.walletTitle}>💰 Wallet Balance</Text>
        <Text style={styles.walletBalance}>₹{balance}</Text>
      </View>
      
      <View style={styles.walletActions}>
        <TouchableOpacity onPress={onAddMoney} style={styles.walletButton}>
          <Text style={styles.walletButtonText}>+ Add Money</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onWithdraw} style={[styles.walletButton, styles.walletButtonSecondary]}>
          <Text style={styles.walletButtonText}>↗ Withdraw</Text>
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  // Button Styles
  buttonContainer: {
    borderRadius: 25,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  gradientButton: {
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  buttonIcon: {
    marginRight: 8,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },

  // Card Styles
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },

  // Game Mode Card Styles
  gameModeCard: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
  },
  gameModeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  gameModeIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  gameModeIconText: {
    fontSize: 24,
  },
  gameModeInfo: {
    flex: 1,
  },
  gameModeTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  gameModeSubtitle: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  gameModeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  gameModeDetail: {
    alignItems: 'center',
  },
  gameModeDetailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  gameModeDetailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },

  // Stats Card Styles
  statsCard: {
    borderRadius: 15,
    padding: 20,
    alignItems: 'center',
    marginHorizontal: 5,
    minWidth: 100,
    elevation: 5,
  },
  statsIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  statsIconText: {
    fontSize: 20,
  },
  statsValue: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statsLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    textAlign: 'center',
  },

  // Header Styles
  header: {
    paddingTop: 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    color: '#fff',
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerSubtitle: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 14,
    marginTop: 2,
  },

  // Tournament Card Styles
  tournamentCard: {
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    elevation: 8,
  },
  tournamentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  tournamentTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    flex: 1,
  },
  tournamentStatus: {
    color: '#fff',
    fontSize: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  tournamentDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 15,
  },
  tournamentDetail: {
    alignItems: 'center',
  },
  tournamentDetailLabel: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 12,
    marginBottom: 4,
  },
  tournamentDetailValue: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  tournamentFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 15,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  tournamentParticipants: {
    color: 'rgba(255, 255, 255, 0.8)',
    fontSize: 14,
  },
  tournamentTime: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },

  // Wallet Card Styles
  walletCard: {
    borderRadius: 20,
    padding: 25,
    marginVertical: 10,
    elevation: 8,
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitle: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  walletBalance: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  walletActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  walletButton: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 12,
    borderRadius: 15,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  walletButtonSecondary: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  walletButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});