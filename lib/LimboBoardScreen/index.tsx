import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { styles } from './styles';
import firebaseService from '../../src/services/firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LimboBoardScreen() {
  const [walletBalance, setWalletBalance] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);
  const [betAmount, setBetAmount] = useState(10);
  const [multiplierTarget, setMultiplierTarget] = useState(2.0);
  const [currentMultiplier, setCurrentMultiplier] = useState(0);
  const [gameStatus, setGameStatus] = useState<'idle' | 'playing' | 'won' | 'lost'>('idle');
  
  // Auto-initialize game and load user data on component mount
  useEffect(() => {
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
  
  const updateWalletBalance = async (newBalance: number) => {
    try {
      if (currentUser) {
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
  
  const startGame = async () => {
    // Check if user has enough balance
    if (walletBalance < betAmount) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance to place this bet.');
      return;
    }
    
    // Deduct bet amount from wallet
    const newBalance = walletBalance - betAmount;
    await updateWalletBalance(newBalance);
    
    // Set game status to playing
    setGameStatus('playing');
    setCurrentMultiplier(0);
    
    // Animate the multiplier from 0 to 10
    let currentAnimValue = 0;
    const animateMultiplier = () => {
      if (currentAnimValue <= 10) {
        setCurrentMultiplier(parseFloat(currentAnimValue.toFixed(2)));
        currentAnimValue += 0.1;
        setTimeout(animateMultiplier, 0.0001); // 15x faster animation speed
      }
    };
    
    animateMultiplier();
    
    // Finish game after 3 seconds
    setTimeout(() => {
      finishGame();
    }, 3000);
  };
  
  const finishGame = () => {
    // Generate random multiplier result (between 1.0x and 10.0x)
    const maxMultiplier = 10.0;
    const resultMultiplier = Math.random() * maxMultiplier + 1;
    
    setCurrentMultiplier(parseFloat(resultMultiplier.toFixed(2)));
    
    // Check if player won
    if (resultMultiplier >= multiplierTarget) {
      // Player wins
      const winnings = betAmount * multiplierTarget;
      const newBalance = walletBalance + winnings;
      updateWalletBalance(newBalance);
      
      setGameStatus('won');
      awardGameXp('win', winnings);
      
      Alert.alert(
        'Congratulations!',
        `You won ₹${winnings.toFixed(2)}!\n\nMultiplier: ${resultMultiplier.toFixed(2)}x\nTarget: ${multiplierTarget}x`,
        [{ text: 'OK' }]
      );
    } else {
      // Player loses
      setGameStatus('lost');
      awardGameXp('loss', 0);
      
      Alert.alert(
        'Game Over',
        `You lost ₹${betAmount.toFixed(2)}\n\nMultiplier: ${resultMultiplier.toFixed(2)}x\nTarget: ${multiplierTarget}x`,
        [{ text: 'OK' }]
      );
    }
  };
  
  const adjustBetAmount = (multiplier: number) => {
    if (gameStatus === 'playing') return; // Can't change bet during game
    
    const newAmount = Math.max(1, Math.min(walletBalance, betAmount * multiplier));
    setBetAmount(newAmount);
  };
  
  const adjustMultiplierTarget = (adjustment: number) => {
    if (gameStatus === 'playing') return; // Can't change target during game
    
    const newTarget = Math.max(1.01, Math.min(100.0, multiplierTarget + adjustment));
    setMultiplierTarget(parseFloat(newTarget.toFixed(2)));
  };
  
  const adjustWinChance = (adjustment: number) => {
    if (gameStatus === 'playing') return; // Can't change during game
    
    const currentWinChance = 100 / multiplierTarget;
    const newWinChance = Math.max(1, Math.min(99, currentWinChance + adjustment));
    const newMultiplier = 100 / newWinChance;
    setMultiplierTarget(parseFloat(newMultiplier.toFixed(2)));
  };
  
  const resetGame = () => {
    setGameStatus('idle');
    setCurrentMultiplier(0);
  };
  
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Limbo</Text>
        <View style={styles.walletContainer}>
          <Ionicons name="wallet" size={16} color="#8b9bb4" />
          <Text style={styles.walletBalance}>₹{walletBalance.toFixed(2)}</Text>
        </View>
      </View>
      
      {/* Main Game Card */}
      <View style={styles.gameCard}>
        {/* Multiplier Display */}
        <View style={styles.multiplierDisplay}>
          <Text style={styles.multiplierValue}>{currentMultiplier.toFixed(2)}x</Text>
        </View>
        
        {/* Game Controls Row */}
        <View style={styles.controlsRow}>
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Target Multiplier</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={multiplierTarget.toFixed(2)}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 1.01;
                  if (value >= 1.01 && value <= 100) {
                    setMultiplierTarget(value);
                  }
                }}
                keyboardType="numeric"
                editable={gameStatus !== 'playing'}
                placeholder="2.00"
                placeholderTextColor="#8b9bb4"
              />
              <Text style={styles.inputSuffix}>x</Text>
            </View>
          </View>
          
          <View style={styles.controlGroup}>
            <Text style={styles.controlLabel}>Win Chance</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.textInput}
                value={(100 / multiplierTarget).toFixed(2)}
                onChangeText={(text) => {
                  const value = parseFloat(text) || 1;
                  if (value >= 1 && value <= 99) {
                    const newMultiplier = 100 / value;
                    setMultiplierTarget(parseFloat(newMultiplier.toFixed(2)));
                  }
                }}
                keyboardType="numeric"
                editable={gameStatus !== 'playing'}
                placeholder="50.00"
                placeholderTextColor="#8b9bb4"
              />
              <Text style={styles.inputSuffix}>%</Text>
            </View>
          </View>
        </View>
        
        {/* Bet Amount Section */}
        <View style={styles.betSection}>
          <Text style={styles.controlLabel}>Bet Amount</Text>
          <View style={styles.betInputRow}>
            <View style={styles.betInputContainer}>
              <Text style={styles.betInputValue}>{betAmount.toFixed(2)}</Text>
              <Text style={styles.currencySymbol}>₹</Text>
            </View>
            <View style={styles.betControls}>
              <TouchableOpacity 
                style={styles.betControlButton}
                onPress={() => adjustBetAmount(0.5)}
                disabled={gameStatus === 'playing'}
              >
                <Text style={styles.betControlText}>½</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.betControlButton}
                onPress={() => adjustBetAmount(2)}
                disabled={gameStatus === 'playing'}
              >
                <Text style={styles.betControlText}>2×</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
        
        {/* Bet Button */}
        <TouchableOpacity 
          style={[
            styles.betButton, 
            gameStatus === 'playing' && styles.betButtonDisabled
          ]}
          onPress={gameStatus === 'playing' ? resetGame : startGame}
          disabled={gameStatus === 'playing'}
        >
          <Text style={styles.betButtonText}>
            {gameStatus === 'playing' ? 'Playing...' : 'Bet'}
          </Text>
        </TouchableOpacity>
        
        {/* Profit Section */}
        <View style={styles.profitSection}>
          <Text style={styles.controlLabel}>Profit on Win</Text>
          <View style={styles.profitContainer}>
            <Text style={styles.profitValue}>{((betAmount * multiplierTarget) - betAmount).toFixed(2)}</Text>
            <Text style={styles.currencySymbol}>₹</Text>
          </View>
        </View>
        

      </View>
      
    
      </View>
    
  );
}