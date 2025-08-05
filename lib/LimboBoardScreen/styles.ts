import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

// Responsive font sizes
const responsiveFontSize = {
  small: isSmallScreen ? 12 : isMediumScreen ? 14 : 16,
  medium: isSmallScreen ? 14 : isMediumScreen ? 16 : 18,
  large: isSmallScreen ? 18 : isMediumScreen ? 20 : 24,
  xlarge: isSmallScreen ? 20 : isMediumScreen ? 24 : 28,
};

// Responsive spacing
const responsiveSpacing = {
  xs: isSmallScreen ? 4 : 6,
  sm: isSmallScreen ? 8 : 12,
  md: isSmallScreen ? 12 : 16,
  lg: isSmallScreen ? 16 : 20,
  xl: isSmallScreen ? 20 : 24,
};

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0c1821',
    paddingHorizontal: responsiveSpacing.md,
  },
  
  // Header
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isSmallScreen ? 45 : 55,
    paddingBottom: responsiveSpacing.xl,
    paddingHorizontal: responsiveSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  headerTitle: {
    fontSize: responsiveFontSize.xlarge + 2,
    fontWeight: '800',
    color: '#ffffff',
    letterSpacing: 0.5,
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(26, 44, 56, 0.8)',
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    borderRadius: 20,
    gap: responsiveSpacing.sm,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  walletBalance: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium,
    fontWeight: '700',
  },
  
  // Game Card
  gameCard: {
    backgroundColor: 'rgba(26, 44, 56, 0.95)',
    borderRadius: 20,
    padding: responsiveSpacing.xl,
    marginBottom: responsiveSpacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 10,
  },
  
  // Multiplier Display
  multiplierDisplay: {
    alignItems: 'center',
    marginBottom: responsiveSpacing.xl,
    paddingVertical: responsiveSpacing.xl * 1.5,
    backgroundColor: 'rgba(0, 231, 1, 0.05)',
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0, 231, 1, 0.2)',
    position: 'relative',
    overflow: 'hidden',
  },
  multiplierValue: {
    color: '#00e701',
    fontSize: 56,
    fontWeight: '900',
    textShadowColor: 'rgba(0, 231, 1, 0.5)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 20,
    letterSpacing: 2,
  },
  
  // Controls Row
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.xl,
    gap: responsiveSpacing.lg,
  },
  controlGroup: {
    flex: 1,
  },
  controlLabel: {
    color: '#a0b3c7',
    fontSize: responsiveFontSize.small + 1,
    marginBottom: responsiveSpacing.sm,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputContainer: {
    backgroundColor: 'rgba(42, 52, 65, 0.8)',
    borderRadius: 12,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  inputValue: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium + 2,
    fontWeight: '700',
    flex: 1,
  },
  inputSuffix: {
    color: '#a0b3c7',
    fontSize: responsiveFontSize.medium + 1,
    marginLeft: responsiveSpacing.sm,
    fontWeight: '600',
  },
  textInput: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium + 2,
    fontWeight: '700',
    flex: 1,
    paddingVertical: 0,
  },
  
  // Bet Section
  betSection: {
    marginBottom: responsiveSpacing.xl,
  },
  betInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: responsiveSpacing.lg,
  },
  betInputContainer: {
    backgroundColor: 'rgba(42, 52, 65, 0.8)',
    borderRadius: 12,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    flex: 1,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  betInputValue: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium + 2,
    fontWeight: '700',
    flex: 1,
  },
  currencySymbol: {
    color: '#a0b3c7',
    fontSize: responsiveFontSize.medium + 1,
    marginLeft: responsiveSpacing.sm,
    fontWeight: '600',
  },
  betControls: {
    flexDirection: 'row',
    gap: responsiveSpacing.sm,
  },
  betControlButton: {
    backgroundColor: 'rgba(58, 70, 83, 0.8)',
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    borderRadius: 10,
    minWidth: 44,
    minHeight: 44,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
  },
  betControlText: {
    color: '#a0b3c7',
    fontSize: 14,
    fontWeight: '700',
  },
  
  // Bet Button
  betButton: {
    backgroundColor: '#00e701',
    borderRadius: 16,
    paddingVertical: responsiveSpacing.lg,
    alignItems: 'center',
    marginBottom: responsiveSpacing.xl,
    minHeight: 56,
    shadowColor: '#00e701',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(0, 231, 1, 0.3)',
  },
  betButtonDisabled: {
    backgroundColor: 'rgba(58, 70, 83, 0.6)',
    shadowColor: 'transparent',
    shadowOpacity: 0,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  betButtonText: {
    color: '#ffffff',
    fontSize: responsiveFontSize.large,
    fontWeight: '800',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  
  // Profit Section
  profitSection: {
    marginBottom: responsiveSpacing.xl,
  },
  profitContainer: {
    backgroundColor: 'rgba(42, 52, 65, 0.8)',
    borderRadius: 12,
    paddingHorizontal: responsiveSpacing.lg,
    paddingVertical: responsiveSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 52,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  profitValue: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium + 2,
    fontWeight: '700',
    flex: 1,
  },
  

  
  // Bottom Section
  bottomSection: {
    marginTop: 'auto',
    paddingBottom: responsiveSpacing.xl,
    paddingTop: responsiveSpacing.lg,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: responsiveSpacing.lg,
  },
  bottomButton: {
    padding: responsiveSpacing.md,
    borderRadius: 12,
    backgroundColor: 'rgba(42, 52, 65, 0.3)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  fairnessText: {
    color: '#a0b3c7',
    fontSize: responsiveFontSize.small + 1,
    fontWeight: '600',
    marginLeft: 'auto',
    letterSpacing: 0.5,
  },
  brandSection: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(16, 28, 36, 0.4)',
    padding: responsiveSpacing.md,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  brandText: {
    color: '#ffffff',
    fontSize: responsiveFontSize.medium + 1,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  brandSubtext: {
    color: '#a0b3c7',
    fontSize: responsiveFontSize.small + 1,
    marginLeft: responsiveSpacing.sm,
    fontWeight: '600',
  },
  
  // Settings Section
  settingsSection: {
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    padding: responsiveSpacing.md,
    marginBottom: responsiveSpacing.lg,
  },
  settingsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: responsiveSpacing.sm,
  },
  settingsLabel: {
    color: '#8b9bb4',
    fontSize: responsiveFontSize.small,
  },
  settingsValue: {
    color: '#fff',
    fontSize: responsiveFontSize.medium,
    fontWeight: '600',
  },
  
  // Loading Styles
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#8b9bb4',
    fontSize: 16,
    textAlign: 'center',
  },
});