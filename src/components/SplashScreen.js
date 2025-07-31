import React, { useEffect, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  Animated, 
  Dimensions,
  StatusBar 
} from 'react-native';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const pulseAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // Start all animations
    Animated.parallel([
      // Fade in animation
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1500,
        useNativeDriver: true,
      }),
      // Scale animation
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      // Slide up animation
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 1200,
        useNativeDriver: true,
      }),
    ]).start();

    // Continuous rotation animation
    Animated.loop(
      Animated.timing(rotateAnim, {
        toValue: 1,
        duration: 3000,
        useNativeDriver: true,
      })
    ).start();

    // Pulse animation for loading text
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      {/* Background gradient effect */}
      <View style={styles.backgroundGradient} />
      
      {/* Animated background elements */}
      <View style={styles.backgroundElements}>
        <Animated.View style={[styles.floatingElement, styles.element1, {
          transform: [{ rotate: spin }]
        }]} />
        <Animated.View style={[styles.floatingElement, styles.element2]} />
        <Animated.View style={[styles.floatingElement, styles.element3]} />
        <Animated.View style={[styles.floatingElement, styles.element4]} />
      </View>

      {/* Main content */}
      <Animated.View style={[
        styles.content,
        {
          opacity: fadeAnim,
          transform: [
            { scale: scaleAnim },
            { translateY: slideAnim }
          ]
        }
      ]}>
        {/* Logo container */}
        <Animated.View style={[
          styles.logoContainer,
          { transform: [{ rotate: spin }] }
        ]}>
          <Text style={styles.logoIcon}>🎲</Text>
        </Animated.View>

        {/* App title */}
        <Text style={styles.title}>ALPHAGAMES</Text>
        <Text style={styles.subtitle}>Play & Win Real Money</Text>

        {/* Feature highlights */}
        <View style={styles.featuresContainer}>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>🏆</Text>
            <Text style={styles.featureText}>Tournaments</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>💰</Text>
            <Text style={styles.featureText}>Real Money</Text>
          </View>
          <View style={styles.feature}>
            <Text style={styles.featureIcon}>⚡</Text>
            <Text style={styles.featureText}>Instant Play</Text>
          </View>
        </View>

        {/* Loading indicator */}
        <Animated.View style={[
          styles.loadingContainer,
          { transform: [{ scale: pulseAnim }] }
        ]}>
          <View style={styles.loadingDots}>
            <Animated.View style={[styles.dot, styles.dot1]} />
            <Animated.View style={[styles.dot, styles.dot2]} />
            <Animated.View style={[styles.dot, styles.dot3]} />
          </View>
          <Text style={styles.loadingText}>Loading Amazing Experience...</Text>
        </Animated.View>
      </Animated.View>

      {/* Footer */}
      <Animated.View style={[
        styles.footer,
        { opacity: fadeAnim }
      ]}>
        <Text style={styles.footerText}>🎮 Get Ready to Play! 🎮</Text>
        <Text style={styles.versionText}>Version 1.0.0</Text>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
    backgroundColor: '#1a1a2e',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
  },
  floatingElement: {
    position: 'absolute',
    borderRadius: 50,
    opacity: 0.1,
  },
  element1: {
    width: 120,
    height: 120,
    backgroundColor: '#ff6b6b',
    top: '15%',
    right: '10%',
  },
  element2: {
    width: 80,
    height: 80,
    backgroundColor: '#10ac84',
    top: '60%',
    left: '5%',
  },
  element3: {
    width: 100,
    height: 100,
    backgroundColor: '#ffd700',
    bottom: '25%',
    right: '15%',
  },
  element4: {
    width: 60,
    height: 60,
    backgroundColor: '#a55eea',
    bottom: '10%',
    left: '20%',
  },
  content: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 107, 107, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    borderWidth: 3,
    borderColor: '#ff6b6b',
    shadowColor: '#ff6b6b',
    shadowOffset: {
      width: 0,
      height: 0,
    },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  logoIcon: {
    fontSize: 60,
  },
  title: {
    fontSize: 42,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 10,
    letterSpacing: 3,
    textShadowColor: 'rgba(255, 255, 255, 0.3)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 18,
    color: '#ffd700',
    fontWeight: '600',
    marginBottom: 40,
    textAlign: 'center',
  },
  featuresContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: width * 0.8,
    marginBottom: 50,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 28,
    marginBottom: 8,
  },
  featureText: {
    color: '#ccc',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  loadingContainer: {
    alignItems: 'center',
  },
  loadingDots: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#10ac84',
    marginHorizontal: 4,
  },
  dot1: {
    backgroundColor: '#ff6b6b',
  },
  dot2: {
    backgroundColor: '#ffd700',
  },
  dot3: {
    backgroundColor: '#10ac84',
  },
  loadingText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  footer: {
    position: 'absolute',
    bottom: 50,
    alignItems: 'center',
  },
  footerText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  versionText: {
    color: '#666',
    fontSize: 12,
  },
});

export default SplashScreen;