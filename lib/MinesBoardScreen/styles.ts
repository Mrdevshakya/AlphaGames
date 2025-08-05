import { StyleSheet, Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');
const isSmallScreen = width < 375;
const isMediumScreen = width >= 375 && width < 414;
const isLargeScreen = width >= 414;

// Responsive cell size calculation
const getResponsiveCellSize = () => {
  const padding = 60;
  const baseSize = Math.floor((width - padding) / 5);
  
  if (isSmallScreen) {
    return Math.min(baseSize, 55); // Max 55px for small screens
  } else if (isMediumScreen) {
    return Math.min(baseSize, 65); // Max 65px for medium screens
  } else {
    return Math.min(baseSize, 75); // Max 75px for large screens
  }
};

const cellSize = getResponsiveCellSize();

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
    backgroundColor: '#1a2332',
    paddingHorizontal: responsiveSpacing.md,
  },
  
  // Stake Header
  stakeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: isSmallScreen ? 40 : 50,
    paddingBottom: responsiveSpacing.lg,
    paddingHorizontal: responsiveSpacing.sm,
  },
  headerLeft: {
    flex: 1,
    alignItems: 'center',
  },
  stakeTitle: {
    fontSize: responsiveFontSize.xlarge,
    fontWeight: 'bold',
    color: '#fff',
  },
  walletContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#2a3441',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.xs,
    borderRadius: responsiveSpacing.sm,
    gap: responsiveSpacing.xs,
  },
  walletBalance: {
    color: '#fff',
    fontSize: responsiveFontSize.small,
    fontWeight: '600',
  },
  
  // Stake Game Board
  stakeGameBoard: {
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    padding: responsiveSpacing.md,
    marginBottom: responsiveSpacing.lg,
    alignSelf: 'center',
    maxWidth: width - (responsiveSpacing.md * 2),
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  cell: {
    width: cellSize,
    height: cellSize,
    margin: isSmallScreen ? 1 : 2,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: responsiveSpacing.xs,
    backgroundColor: '#3a4653',
    borderWidth: 1,
    borderColor: '#4a5663',
  },
  cellHidden: {
    backgroundColor: '#3a4653',
    borderColor: '#4a5663',
  },
  cellRevealed: {
    backgroundColor: '#2a3441',
    borderColor: '#1a2332',
  },
  cellMine: {
    backgroundColor: '#ff4757',
  },
  cellImage: {
    width: cellSize * 0.5,
    height: cellSize * 0.5,
  },
  flagText: {
    fontSize: cellSize * 0.3,
  },
  
  // Bet Section
  betSection: {
    marginBottom: responsiveSpacing.md,
  },
  betLabel: {
    color: '#8b9bb4',
    fontSize: responsiveFontSize.small,
    marginBottom: responsiveSpacing.sm,
  },
  betAmountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    paddingHorizontal: responsiveSpacing.md,
    paddingVertical: responsiveSpacing.sm,
    minHeight: isSmallScreen ? 44 : 48,
  },
  betAmount: {
    color: '#fff',
    fontSize: responsiveFontSize.medium,
    fontWeight: '600',
  },
  betControls: {
    flexDirection: 'row',
    gap: responsiveSpacing.sm,
  },
  betControlButton: {
    backgroundColor: '#3a4653',
    paddingHorizontal: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.xs,
    borderRadius: responsiveSpacing.xs,
    minWidth: isSmallScreen ? 32 : 36,
    alignItems: 'center',
  },
  betControlText: {
    color: '#8b9bb4',
    fontSize: isSmallScreen ? 10 : 12,
    fontWeight: '600',
  },
  
  // Stake Cashout Button
  stakeCashoutButton: {
    backgroundColor: '#00d4aa',
    borderRadius: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.md,
    alignItems: 'center',
    marginBottom: responsiveSpacing.lg,
    minHeight: isSmallScreen ? 48 : 52,
  },
  stakeCashoutText: {
    color: '#fff',
    fontSize: responsiveFontSize.medium,
    fontWeight: 'bold',
  },
  
  // Stats Section
  statsSection: {
    marginBottom: responsiveSpacing.lg,
  },
  statRow: {
    flexDirection: 'row',
    marginBottom: responsiveSpacing.md,
    gap: responsiveSpacing.sm,
  },
  statColumn: {
    flex: 1,
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    paddingVertical: responsiveSpacing.sm,
    alignItems: 'center',
    minHeight: isSmallScreen ? 60 : 68,
    justifyContent: 'center',
  },
  statLabel: {
    color: '#8b9bb4',
    fontSize: isSmallScreen ? 10 : 12,
    marginBottom: responsiveSpacing.xs,
  },
  statValue: {
    color: '#fff',
    fontSize: responsiveFontSize.large,
    fontWeight: 'bold',
  },
  
  // Profit Section
  profitSection: {
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    padding: responsiveSpacing.md,
  },
  profitLabel: {
    color: '#8b9bb4',
    fontSize: isSmallScreen ? 10 : 12,
    marginBottom: responsiveSpacing.sm,
  },
  profitContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  profitAmount: {
    color: '#fff',
    fontSize: responsiveFontSize.medium,
    fontWeight: '600',
  },
  profitInfo: {
    padding: responsiveSpacing.xs,
  },
  
  // Toggle Section
  toggleSection: {
    flexDirection: 'row',
    backgroundColor: '#2a3441',
    borderRadius: responsiveSpacing.sm,
    padding: responsiveSpacing.xs,
    marginBottom: responsiveSpacing.lg,
  },
  toggleButton: {
    flex: 1,
    paddingVertical: responsiveSpacing.sm,
    alignItems: 'center',
    borderRadius: responsiveSpacing.xs,
    minHeight: isSmallScreen ? 36 : 40,
    justifyContent: 'center',
  },
  toggleActive: {
    backgroundColor: '#3a4653',
  },
  toggleText: {
    color: '#8b9bb4',
    fontSize: responsiveFontSize.small,
    fontWeight: '600',
  },
  toggleTextActive: {
    color: '#fff',
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
  walletBalanceText: {
    color: '#8b9bb4',
    fontSize: 16,
    textAlign: 'center',
  },
  
  // Mines Selector Styles
  minesSelectorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#1a2332',
    borderRadius: 12,
    paddingHorizontal: 20,
    paddingVertical: 15,
    marginBottom: 15,
  },
  minesSelectorLabel: {
    color: '#8b9dc3',
    fontSize: responsiveFontSize.medium,
    fontWeight: '600',
  },
  minesSelectorControls: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  minesControlButton: {
    backgroundColor: '#4ecdc4',
    borderRadius: 8,
    width: 35,
    height: 35,
    justifyContent: 'center',
    alignItems: 'center',
  },
  minesControlText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  minesCount: {
    color: '#ffffff',
    fontSize: responsiveFontSize.large,
    fontWeight: 'bold',
    marginHorizontal: 20,
    minWidth: 30,
    textAlign: 'center',
  },
});
