import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import firebaseService from '../../src/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface Cell {
  id: number;
  isMine: boolean;
  isRevealed: boolean;
  isFlagged: boolean;
  neighborMines: number;
  hasGem: boolean;
}

const GRID_SIZE = 5;
const MIN_MINES = 1;
const MAX_MINES = 24;

export default function MinesBoardScreen() {
  const [grid, setGrid] = useState<Cell[]>([]);
  const [gameStatus, setGameStatus] = useState<'playing' | 'won' | 'lost'>('playing');
  const [selectedMines, setSelectedMines] = useState(3);
  const [currentWinnings, setCurrentWinnings] = useState(0);
  const [revealedCells, setRevealedCells] = useState(0);
  const [betAmount, setBetAmount] = useState(10);
  const [totalProfit, setTotalProfit] = useState(0);
  const [walletBalance, setWalletBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [betPlaced, setBetPlaced] = useState(false);
  const [firstCellRevealed, setFirstCellRevealed] = useState(false);

  // Auto-initialize game and load user data on component mount
  useEffect(() => {
    initializeGame();
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const user = await firebaseService.getCurrentUser();
      if (user) {
        setCurrentUser(user);
        setWalletBalance(user.walletBalance || 0);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
      setWalletBalance(0);
    }
  };

  const startNewGame = () => {
    initializeGame();
    setGameStatus('playing');
    setCurrentWinnings(0);
    setRevealedCells(0);
    setTotalProfit(0);
    setGameStarted(false);
    setBetPlaced(false);
    setFirstCellRevealed(false);
  };

  const placeBet = async () => {
    if (betPlaced) return;
    
    // Check if user has enough balance
    if (walletBalance < betAmount) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to place this bet.');
      return;
    }
    
    // Set bet placed and start the game
    setBetPlaced(true);
    setGameStarted(true);
    
    // No alert needed when game starts
  };

  const adjustBetAmount = (multiplier: number) => {
    if (betPlaced) return; // Can't change bet after bet is placed
    
    const newAmount = Math.max(1, Math.min(walletBalance, betAmount * multiplier));
    setBetAmount(newAmount);
  };

  const updateWalletBalance = async (newBalance: number) => {
    try {
      if (currentUser) {
        // For in-game currency, we still update the wallet balance in the database
        // but this represents virtual currency, not real money
        await firebaseService.updateUser(currentUser.uid, { walletBalance: newBalance });
        setWalletBalance(newBalance);
      }
    } catch (error) {
      console.error('Error updating wallet:', error);
    }
  };

  const awardGameXp = async (gameResult: 'win' | 'loss', earnings: number) => {
    try {
      if (currentUser) {
        // Award XP based on game result
        // Win: 100 XP, Loss: 50 XP
        const xpAmount = gameResult === 'win' ? 100 : 50;
        await firebaseService.awardGameXp(currentUser.uid, gameResult);
        
        // Update total earnings
        if (earnings > 0) {
          const newTotalEarnings = (currentUser.totalEarnings || 0) + earnings;
          await firebaseService.updateUser(currentUser.uid, { totalEarnings: newTotalEarnings });
        }
        
        // Store a flag to indicate that stats have changed
        await AsyncStorage.setItem('statsUpdated', 'true');
      }
    } catch (error) {
      console.error('Error awarding XP:', error);
    }
  };

  const initializeGame = () => {
    // Create empty grid - all cells are safe boxes with gems by default
    const newGrid: Cell[] = [];
    for (let i = 0; i < GRID_SIZE * GRID_SIZE; i++) {
      newGrid.push({
        id: i,
        isMine: false,
        isRevealed: false,
        isFlagged: false,
        neighborMines: 0,
        hasGem: true, // All cells have gems by default
      });
    }

    // Place exact number of mines based on user selection
    const minePositions = new Set<number>();
    while (minePositions.size < selectedMines) {
      const randomPos = Math.floor(Math.random() * (GRID_SIZE * GRID_SIZE));
      // Only add position if it's not already a mine
      if (!minePositions.has(randomPos)) {
        minePositions.add(randomPos);
      }
    }

    // Set the selected positions as mines
    minePositions.forEach(pos => {
      newGrid[pos].isMine = true;
      newGrid[pos].hasGem = false; // Mines don't have gems
    });

    setGrid(newGrid);
  };

  const countNeighborMines = (index: number, grid: Cell[]): number => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;
    let count = 0;

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const neighborIndex = r * GRID_SIZE + c;
          if (neighborIndex !== index && grid[neighborIndex].isMine) {
            count++;
          }
        }
      }
    }
    return count;
  };

  const revealCell = async (index: number) => {
    if (gameStatus !== 'playing' || grid[index].isRevealed || grid[index].isFlagged) {
      return;
    }

    // Check if bet is placed before allowing cell reveals
    if (!betPlaced) {
      Alert.alert('Place Your Bet First!', 'Please place your bet before revealing cells.');
      return;
    }

    // Track first cell reveal for cashout button switch
    if (!firstCellRevealed) {
      setFirstCellRevealed(true);
    }

    const newGrid = [...grid];
    newGrid[index].isRevealed = true;

    if (newGrid[index].isMine) {
      // Game over - reveal all mines
      newGrid.forEach(cell => {
        if (cell.isMine) {
          cell.isRevealed = true;
        }
      });
      setGameStatus('lost');
      Alert.alert('Game Over!', 'You hit a mine! Game over.', [
        { text: 'OK', onPress: async () => {
          // Award XP for loss
          // Bet amount was already deducted, so no additional wallet update needed
          await awardGameXp('loss', 0);
          startNewGame();
        }}
      ]);
    } else {
      // Calculate winnings for revealing a safe cell
      const newRevealedCells = revealedCells + 1;
      setRevealedCells(newRevealedCells);
      
      // Base amount per cell + bonus for gems
      let cellValue = 5; // Base value per safe cell
      if (newGrid[index].hasGem) {
        cellValue = 15; // Bonus for gem cells
      }
      
      const newWinnings = currentWinnings + cellValue;
      setCurrentWinnings(newWinnings);
      
      // Check win condition (all safe cells revealed)
      const unrevealedSafeCells = newGrid.filter(cell => !cell.isRevealed && !cell.isMine).length;
      if (unrevealedSafeCells === 0) {
        setGameStatus('won');
        // Add winnings to wallet (add both bet and winnings since user won the game)
        const totalPayout = betAmount + newWinnings;
        const newBalance = walletBalance + totalPayout;
        await updateWalletBalance(newBalance);
        Alert.alert('Congratulations!', `You won ₹${totalPayout.toFixed(2)}!`, [
          { text: 'OK', onPress: () => {
            // Award XP for win and update earnings
            awardGameXp('win', totalPayout);
            startNewGame();
          }}
        ]);
      }
    }

    setGrid(newGrid);
  };

  const revealNeighbors = (index: number, grid: Cell[]) => {
    const row = Math.floor(index / GRID_SIZE);
    const col = index % GRID_SIZE;

    for (let r = row - 1; r <= row + 1; r++) {
      for (let c = col - 1; c <= col + 1; c++) {
        if (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE) {
          const neighborIndex = r * GRID_SIZE + c;
          if (!grid[neighborIndex].isRevealed && !grid[neighborIndex].isFlagged && !grid[neighborIndex].isMine) {
            grid[neighborIndex].isRevealed = true;
            if (grid[neighborIndex].neighborMines === 0) {
              revealNeighbors(neighborIndex, grid);
            }
          }
        }
      }
    }
  };

  const toggleFlag = (index: number) => {
    if (gameStatus !== 'playing' || grid[index].isRevealed) {
      return;
    }

    const newGrid = [...grid];
    newGrid[index].isFlagged = !newGrid[index].isFlagged;
    
    const flagChange = newGrid[index].isFlagged ? -1 : 1;
    setMinesLeft(minesLeft + flagChange);
    setGrid(newGrid);
  };

  const getCellContent = (cell: Cell) => {
    if (!cell) return null;
    if (cell.isFlagged) return <Text style={styles.flagText}>🚩</Text>;
    if (!cell.isRevealed) return null;
    
    if (cell.isMine) {
      return (
        <Image 
          source={require('../../assets/images/mines/bomb.png')} 
          style={styles.cellImage}
          resizeMode="contain"
        />
      );
    }
    
    if (cell.hasGem) {
      return (
        <Image 
          source={require('../../assets/images/mines/gems.png')} 
          style={styles.cellImage}
          resizeMode="contain"
        />
      );
    }
    
    return null;
  };

  const getCellStyle = (cell: Cell) => {
    if (!cell) return [styles.cell, styles.cellHidden];
    
    if (cell.isRevealed) {
      if (cell.isMine) {
        return [styles.cell, styles.cellRevealed, styles.cellMine];
      }
      return [styles.cell, styles.cellRevealed];
    }
    return [styles.cell, styles.cellHidden];
  };

  const renderGrid = () => {
    // Don't render if grid is not initialized
    if (!grid || grid.length === 0) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Initializing game...</Text>
        </View>
      );
    }

    const rows = [];
    for (let i = 0; i < GRID_SIZE; i++) {
      const row = [];
      for (let j = 0; j < GRID_SIZE; j++) {
        const index = i * GRID_SIZE + j;
        const cell = grid[index];
        
        // Skip if cell is undefined
        if (!cell) continue;
        
        row.push(
          <TouchableOpacity
            key={index}
            style={getCellStyle(cell)}
            onPress={() => revealCell(index)}
            onLongPress={() => toggleFlag(index)}
            activeOpacity={0.7}
          >
            {getCellContent(cell)}
          </TouchableOpacity>
        );
      }
      rows.push(
        <View key={i} style={styles.row}>
          {row}
        </View>
      );
    }
    return rows;
  };



  return (
    <View style={styles.container}>
      {/* Stake-style header */}
      <View style={styles.stakeHeader}>
        <View style={styles.headerLeft}>
          <Text style={styles.stakeTitle}>AlphaGame Mines</Text>
        </View>
        <View style={styles.walletContainer}>
          <Ionicons name="wallet" size={16} color="#4ecdc4" />
          <Text style={styles.walletBalance}>₹{walletBalance.toFixed(0)}</Text>
        </View>
      </View>

      {/* Game board */}
      <View style={styles.stakeGameBoard}>
        {renderGrid()}
      </View>

      {/* Bet Amount Section */}
      <View style={styles.betSection}>
        <Text style={styles.betLabel}>Bet Amount</Text>
        <View style={styles.betAmountContainer}>
          <Text style={styles.betAmount}>₹{betAmount.toFixed(0)}</Text>
          <View style={styles.betControls}>
            <TouchableOpacity 
              style={[styles.betControlButton, { opacity: betPlaced ? 0.5 : 1 }]}
              onPress={() => adjustBetAmount(0.5)}
              disabled={betPlaced}
            >
              <Text style={styles.betControlText}>1/2</Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.betControlButton, { opacity: betPlaced ? 0.5 : 1 }]}
              onPress={() => adjustBetAmount(2)}
              disabled={betPlaced}
            >
              <Text style={styles.betControlText}>2x</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Mines Selector */}
      <View style={styles.minesSelectorContainer}>
        <Text style={styles.minesSelectorLabel}>Mines</Text>
        <View style={styles.minesSelectorControls}>
          <TouchableOpacity 
            style={[styles.minesControlButton, { opacity: betPlaced ? 0.5 : 1 }]}
            onPress={() => setSelectedMines(Math.max(1, selectedMines - 1))}
            disabled={betPlaced}
          >
            <Text style={styles.minesControlText}>-</Text>
          </TouchableOpacity>
          <Text style={styles.minesCount}>{selectedMines}</Text>
          <TouchableOpacity 
            style={[styles.minesControlButton, { opacity: betPlaced ? 0.5 : 1 }]}
            onPress={() => setSelectedMines(Math.min(24, selectedMines + 1))}
            disabled={betPlaced}
          >
            <Text style={styles.minesControlText}>+</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Bet/Cashout Button */}
      <TouchableOpacity 
        style={[
          styles.stakeCashoutButton, 
          { 
            opacity: (!betPlaced || (firstCellRevealed && currentWinnings > 0)) ? 1 : 0.5,
            backgroundColor: !betPlaced ? '#4ecdc4' : '#00d4aa'
          }
        ]}
        disabled={betPlaced && (!firstCellRevealed || currentWinnings === 0)}
        onPress={async () => {
          if (!betPlaced) {
            // Check if user has enough balance
            if (walletBalance < betAmount) {
              Alert.alert('Insufficient Balance', 'You do not have enough balance to place this bet.');
              return;
            }
            
            // Deduct bet amount from wallet when placing bet
            const newBalance = walletBalance - betAmount;
            await updateWalletBalance(newBalance);
            
            // Place bet
            await placeBet();
          } else if (firstCellRevealed && currentWinnings > 0) {
            // Cashout with in-game currency - add winnings to wallet
            const totalPayout = currentWinnings;
            const newBalance = walletBalance + totalPayout;
            await updateWalletBalance(newBalance);
            Alert.alert('Cashout Successful!', `You won ₹${Math.floor(totalPayout)}!\n\nWinnings: ₹${Math.floor(currentWinnings)}`);
            // Award XP for win and update earnings
            awardGameXp('win', totalPayout);
            startNewGame();
          }
        }}
      >
        <Text style={styles.stakeCashoutText}>
          {!betPlaced 
            ? `Play with ₹${betAmount.toFixed(0)}` 
            : firstCellRevealed && currentWinnings > 0 
              ? `Cashout ₹${Math.floor(betAmount + currentWinnings)}` 
              : 'Start Playing'
          }
        </Text>
      </TouchableOpacity>

      {/* Stats Section */}
      <View style={styles.statsSection}>
        <View style={styles.statRow}>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Mines</Text>
            <Text style={styles.statValue}>{selectedMines}</Text>
          </View>
          <View style={styles.statColumn}>
            <Text style={styles.statLabel}>Gems</Text>
            <Text style={styles.statValue}>{25 - selectedMines}</Text>
          </View>
        </View>
        
        <View style={styles.profitSection}>
          <Text style={styles.profitLabel}>Total profit (1.48x)</Text>
          <View style={styles.profitContainer}>
            <Text style={styles.profitAmount}>₹{currentWinnings.toFixed(0)}</Text>
            <TouchableOpacity style={styles.profitInfo}>
              <Ionicons name="information-circle" size={16} color="#666" />
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* Manual/Auto Toggle */}
      <View style={styles.toggleSection}>
        <TouchableOpacity style={[styles.toggleButton, styles.toggleActive]}>
          <Text style={[styles.toggleText, styles.toggleTextActive]}>Manual</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.toggleButton}>
          <Text style={styles.toggleText}>Auto</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default MinesBoardScreen;
