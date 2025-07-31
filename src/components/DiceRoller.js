import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';

const { width } = Dimensions.get('window');

const DiceRoller = ({ onRoll, disabled, currentPlayer }) => {
  const [diceValue, setDiceValue] = useState(1);
  const [isRolling, setIsRolling] = useState(false);
  const [rollCount, setRollCount] = useState(0);
  
  // Animation values
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const bounceAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;
  const shakeAnim = useRef(new Animated.Value(0)).current;

  const playerColors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f',
  };

  useEffect(() => {
    // Start glow animation when it's player's turn
    if (!disabled) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(glowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: false,
          }),
          Animated.timing(glowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: false,
          }),
        ])
      ).start();
    } else {
      glowAnim.setValue(0);
    }
  }, [disabled]);

  const rollDice = () => {
    if (disabled || isRolling) return;

    setIsRolling(true);
    setRollCount(prev => prev + 1);

    // Start complex rolling animation
    const rollAnimation = Animated.parallel([
      // Rotation animation
      Animated.loop(
        Animated.timing(rotateAnim, {
          toValue: 1,
          duration: 80,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        { iterations: 15 }
      ),
      // Scale animation
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 600,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 0.9,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      // Bounce animation
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: -20,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 10,
          duration: 200,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 0,
          duration: 200,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // Shake animation
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -10,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: -5,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 50,
          useNativeDriver: true,
        }),
      ]),
    ]);

    rollAnimation.start(() => {
      // Generate random number between 1-6
      const newValue = Math.floor(Math.random() * 6) + 1;
      setDiceValue(newValue);
      setIsRolling(false);
      
      // Reset rotation
      rotateAnim.setValue(0);
      
      // Success celebration animation
      if (newValue === 6) {
        Animated.sequence([
          Animated.timing(scaleAnim, {
            toValue: 1.2,
            duration: 200,
            useNativeDriver: true,
          }),
          Animated.timing(scaleAnim, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true,
          }),
        ]).start();
      }
      
      // Call the onRoll callback with the dice value
      if (onRoll) {
        onRoll(newValue);
      }
    });
  };

  const getDiceFace = (value) => {
    const faces = {
      1: '⚀',
      2: '⚁',
      3: '⚂',
      4: '⚃',
      5: '⚄',
      6: '⚅',
    };
    return faces[value] || '⚀';
  };

  const getDiceEmoji = (value) => {
    const emojis = {
      1: '🎲',
      2: '🎲',
      3: '🎲',
      4: '🎲',
      5: '🎲',
      6: '🎲',
    };
    return emojis[value] || '🎲';
  };

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.8],
  });

  const currentPlayerColor = currentPlayer ? playerColors[currentPlayer] : '#ffd700';

  return (
    <View style={styles.container}>
      {/* Player turn indicator */}
      <View style={styles.playerTurnContainer}>
        <Text style={[styles.playerTurn, { color: currentPlayerColor }]}>
          {currentPlayer ? `${currentPlayer.toUpperCase()}'s Turn` : 'Your Turn'}
        </Text>
        {!disabled && (
          <View style={styles.turnIndicator}>
            <Text style={styles.turnIndicatorText}>🎯 Roll Now!</Text>
          </View>
        )}
      </View>
      
      {/* Dice container with glow effect */}
      <Animated.View style={[
        styles.diceGlow,
        {
          opacity: disabled ? 0 : glowOpacity,
          shadowColor: currentPlayerColor,
        }
      ]}>
        <TouchableOpacity
          style={[
            styles.diceContainer,
            disabled && styles.diceDisabled,
            { borderColor: currentPlayerColor },
            diceValue === 6 && !disabled && styles.diceLucky,
          ]}
          onPress={rollDice}
          disabled={disabled || isRolling}
          activeOpacity={0.8}
        >
          <Animated.View
            style={[
              styles.dice,
              {
                transform: [
                  { rotate: spin },
                  { scale: scaleAnim },
                  { translateY: bounceAnim },
                  { translateX: shakeAnim },
                ],
              },
            ]}
          >
            <Text style={[
              styles.diceText,
              { color: isRolling ? currentPlayerColor : '#2c3e50' }
            ]}>
              {isRolling ? getDiceEmoji(diceValue) : getDiceFace(diceValue)}
            </Text>
          </Animated.View>

          {/* Dice value overlay */}
          {!isRolling && (
            <View style={styles.diceValueOverlay}>
              <Text style={[styles.diceValueText, { color: currentPlayerColor }]}>
                {diceValue}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </Animated.View>

      {/* Instructions and status */}
      <View style={styles.statusContainer}>
        <Text style={[styles.instruction, { color: currentPlayerColor }]}>
          {isRolling 
            ? 'Rolling...' 
            : disabled 
              ? 'Wait for your turn' 
              : 'Tap to roll dice'
          }
        </Text>

        {!isRolling && diceValue && (
          <View style={styles.resultContainer}>
            <Text style={[styles.diceResult, { color: currentPlayerColor }]}>
              You rolled: {diceValue}
            </Text>
            {diceValue === 6 && (
              <Text style={styles.luckyText}>🍀 Lucky Six! Roll Again! 🍀</Text>
            )}
          </View>
        )}

        {/* Roll counter */}
        <Text style={styles.rollCounter}>
          Rolls: {rollCount}
        </Text>
      </View>

      {/* Decorative elements */}
      <View style={styles.decorativeElements}>
        <View style={[styles.decorativeCircle, styles.circle1]} />
        <View style={[styles.decorativeCircle, styles.circle2]} />
        <View style={[styles.decorativeCircle, styles.circle3]} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(22, 33, 62, 0.9)',
    borderRadius: 20,
    margin: 10,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    position: 'relative',
    overflow: 'hidden',
  },
  decorativeElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  decorativeCircle: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.05,
  },
  circle1: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    top: -20,
    right: -20,
  },
  circle2: {
    width: 40,
    height: 40,
    backgroundColor: '#10ac84',
    bottom: -10,
    left: -10,
  },
  circle3: {
    width: 30,
    height: 30,
    backgroundColor: '#ffd700',
    top: '50%',
    right: -15,
  },
  playerTurnContainer: {
    alignItems: 'center',
    marginBottom: 15,
  },
  playerTurn: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  turnIndicator: {
    backgroundColor: 'rgba(16, 172, 132, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#10ac84',
  },
  turnIndicatorText: {
    color: '#10ac84',
    fontSize: 12,
    fontWeight: 'bold',
  },
  diceGlow: {
    borderRadius: 20,
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 1,
    shadowRadius: 20,
    elevation: 10,
  },
  diceContainer: {
    width: 100,
    height: 100,
    borderRadius: 20,
    borderWidth: 4,
    borderColor: '#ffd700',
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 15,
    position: 'relative',
  },
  diceDisabled: {
    opacity: 0.5,
    borderColor: '#666',
    backgroundColor: '#f0f0f0',
  },
  diceLucky: {
    borderColor: '#ffd700',
    backgroundColor: '#fffbf0',
    shadowColor: '#ffd700',
  },
  dice: {
    justifyContent: 'center',
    alignItems: 'center',
    width: '100%',
    height: '100%',
  },
  diceText: {
    fontSize: 50,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  diceValueOverlay: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  diceValueText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  statusContainer: {
    alignItems: 'center',
  },
  instruction: {
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 10,
    fontWeight: '600',
  },
  resultContainer: {
    alignItems: 'center',
    marginBottom: 10,
  },
  diceResult: {
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 5,
  },
  luckyText: {
    color: '#ffd700',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#ffd700',
  },
  rollCounter: {
    color: '#666',
    fontSize: 12,
    marginTop: 5,
  },
});

export default DiceRoller;