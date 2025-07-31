import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Animated,
  Dimensions,
  StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../src/services/firebaseService';
import { AlphaGamesButton, AlphaGamesCard } from '../../src/components/AlphaGamesComponents';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const router = useRouter();

  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const logoRotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();

    // Logo rotation animation
    Animated.loop(
      Animated.timing(logoRotateAnim, {
        toValue: 1,
        duration: 10000,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  useEffect(() => {
    let interval;
    if (countdown > 0) {
      interval = setInterval(() => {
        setCountdown(countdown - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [countdown]);

  const validateForm = () => {
    if (!fullName.trim()) {
      Alert.alert('❌ Error', 'Please enter your full name');
      return false;
    }
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('❌ Error', 'Please enter a valid 10-digit phone number');
      return false;
    }
    if (!email.trim() || !email.includes('@')) {
      Alert.alert('❌ Error', 'Please enter a valid email address');
      return false;
    }
    return true;
  };

  const sendOTP = async () => {
    if (!validateForm()) return;

    setLoading(true);
    
    // Animate button press
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    try {
      const result = await firebaseService.sendOTP(phoneNumber);
      if (result.success) {
        setIsOtpSent(true);
        setLoading(false);
        setCountdown(60);
        Alert.alert(
          '✅ OTP Sent!', 
          result.developmentNote || result.message || 'Please check your phone for the verification code'
        );
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('❌ Error', error.message || 'Failed to send OTP. Please try again.');
    }
  };

  const verifyOTPAndRegister = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('❌ Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      // First verify the OTP
      const storedVerificationId = await AsyncStorage.getItem('verificationId');
      const verifyResult = await firebaseService.verifyOTP(storedVerificationId, otp);
      
      if (verifyResult.success) {
        // Then register the user with additional details
        const result = await firebaseService.registerUser({
          fullName,
          phoneNumber,
          email,
        });
        
        if (result.success) {
          setLoading(false);
          
          // Success animation
          Animated.timing(scaleAnim, {
            toValue: 1.1,
            duration: 200,
            useNativeDriver: true,
          }).start(() => {
            Alert.alert(
              '🎉 Welcome!',
              `Registration successful! You've received ₹100 welcome bonus.`,
              [
                {
                  text: 'Start Playing',
                  onPress: () => {
                    // Navigate to tabs using router
                    router.replace('/(tabs)');
                  }
                }
              ]
            );
          });
        }
      }
    } catch (error) {
      setLoading(false);
      Alert.alert('❌ Registration Failed', error.message || 'Please try again.');
    }
  };

  const resendOTP = async () => {
    if (countdown > 0) return;
    
    try {
      setLoading(true);
      const result = await firebaseService.sendOTP(phoneNumber);
      if (result.success) {
        setCountdown(60);
        Alert.alert('📱 OTP Resent', 'A new OTP has been sent to your phone');
      }
    } catch (error) {
      Alert.alert('❌ Error', 'Failed to resend OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const navigateToLogin = () => {
    if (navigation) {
      navigation.navigate('Login');
    } else {
      // Fallback for expo-router
      router.push('/(auth)/LoginScreen');
    }
  };

  const logoRotate = logoRotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg'],
  });

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <Animated.View style={[
            styles.content,
            {
              opacity: fadeAnim,
              transform: [
                { translateY: slideAnim },
                { scale: scaleAnim }
              ]
            }
          ]}>
            
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <View style={styles.logoContainer}>
                <View style={styles.logoGradient}>
                  <Text style={styles.logoIcon}>🎲</Text>
                </View>
              </View>
              <Text style={styles.appName}>ALPHAGAMES</Text>
              <Text style={styles.tagline}>Join & Win Real Money</Text>
              <Text style={styles.welcomeBonus}>🎁 Get ₹100 Welcome Bonus!</Text>
            </View>

            {/* Form Section */}
            <AlphaGamesCard style={styles.formSection}>
              {!isOtpSent ? (
                <>
                  <Text style={styles.welcomeText}>Create Your Account 🚀</Text>
                  <Text style={styles.instructionText}>
                    Join millions of players and start winning today!
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputIcon}>👤</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Full Name"
                        placeholderTextColor="#888888"
                        value={fullName}
                        onChangeText={setFullName}
                        autoCapitalize="words"
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.inputWrapper}>
                      <Text style={styles.inputIcon}>�</Text>
                      <TextInput
                        style={styles.input}
                        placeholder="Email Address"
                        placeholderTextColor="#888888"
                        value={email}
                        onChangeText={setEmail}
                        keyboardType="email-address"
                        autoCapitalize="none"
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <View style={styles.inputContainer}>
                    <View style={styles.phoneInputWrapper}>
                      <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                      </View>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter mobile number"
                        placeholderTextColor="#888888"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="numeric"
                        maxLength={10}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <AlphaGamesButton
                    title={loading ? "Sending..." : "Send OTP & Join"}
                    onPress={sendOTP}
                    disabled={loading}
                    colors={['#333333', '#555555']}
                    size="large"
                    style={styles.primaryButton}
                  />
                </>
              ) : (
                <>
                  <Text style={styles.welcomeText}>Verify Your Number 📱</Text>
                  <Text style={styles.instructionText}>
                    Enter the 6-digit code sent to
                  </Text>
                  <Text style={styles.phoneDisplay}>+91 {phoneNumber}</Text>
                  <Text style={styles.developmentNote}>
                    For testing, use OTP: 123456
                  </Text>

                  <View style={styles.otpContainer}>
                    <View style={styles.otpInputWrapper}>
                      <TextInput
                        style={styles.otpInput}
                        placeholder="Enter OTP"
                        placeholderTextColor="#888888"
                        value={otp}
                        onChangeText={setOtp}
                        keyboardType="numeric"
                        maxLength={6}
                        textAlign="center"
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <AlphaGamesButton
                    title={loading ? "Verifying..." : "Verify & Start Playing"}
                    onPress={verifyOTPAndRegister}
                    disabled={loading}
                    colors={['#333333', '#555555']}
                    size="large"
                    style={styles.primaryButton}
                  />

                  <View style={styles.resendContainer}>
                    {countdown > 0 ? (
                      <Text style={styles.countdownText}>
                        Resend OTP in {countdown}s
                      </Text>
                    ) : (
                      <TouchableOpacity onPress={resendOTP} disabled={loading}>
                        <Text style={[styles.resendText, loading && styles.disabledText]}>
                          Resend OTP
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <TouchableOpacity
                    style={styles.changeNumberButton}
                    onPress={() => {
                      setIsOtpSent(false);
                      setOtp('');
                      setCountdown(0);
                    }}
                    disabled={loading}
                  >
                    <Text style={[styles.changeNumberText, loading && styles.disabledText]}>
                      Change Details
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Login Link */}
              <View style={styles.loginSection}>
                <Text style={styles.loginText}>Already have an account? </Text>
                <TouchableOpacity onPress={navigateToLogin} disabled={loading}>
                  <Text style={[styles.loginLink, loading && styles.disabledText]}>
                    Login Here
                  </Text>
                </TouchableOpacity>
              </View>
            </AlphaGamesCard>

            {/* Features Section */}
            <View style={styles.featuresSection}>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>🏆</Text>
                <Text style={styles.featureText}>Win Tournaments</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>💰</Text>
                <Text style={styles.featureText}>Real Money</Text>
              </View>
              <View style={styles.feature}>
                <Text style={styles.featureIcon}>⚡</Text>
                <Text style={styles.featureText}>Instant Payouts</Text>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By registering, you agree to our Terms & Conditions
              </Text>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
  },
  backgroundGradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    bottom: 0,
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
    width: 100,
    height: 100,
    backgroundColor: '#10ac84',
    top: '10%',
    right: '10%',
  },
  element2: {
    width: 60,
    height: 60,
    backgroundColor: '#ff6b6b',
    top: '60%',
    left: '5%',
  },
  element3: {
    width: 80,
    height: 80,
    backgroundColor: '#ffd700',
    bottom: '20%',
    right: '20%',
  },
  element4: {
    width: 40,
    height: 40,
    backgroundColor: '#e74c3c',
    top: '30%',
    left: '15%',
  },
  element5: {
    width: 60,
    height: 60,
    backgroundColor: '#9b59b6',
    bottom: '40%',
    left: '10%',
  },
  keyboardView: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    alignItems: 'center',
  },
  logoSection: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginBottom: 15,
    elevation: 10,
    shadowColor: '#10ac84',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#fff',
  },
  logoIcon: {
    fontSize: 40,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 5,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#10ac84',
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeBonus: {
    fontSize: 16,
    color: '#ffd700',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 20,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 14,
    color: '#ccc',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 20,
  },
  phoneDisplay: {
    fontSize: 16,
    color: '#ffd700',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  developmentNote: {
    fontSize: 14,
    color: '#ffd700',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 215, 0, 0.1)',
    padding: 8,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 15,
  },
  inputIcon: {
    fontSize: 20,
    marginRight: 10,
  },
  input: {
    flex: 1,
    height: 55,
    color: '#fff',
    fontSize: 16,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden',
  },
  countryCode: {
    backgroundColor: 'rgba(16, 172, 132, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 18,
    justifyContent: 'center',
  },
  countryCodeText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  phoneInput: {
    flex: 1,
    height: 55,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 16,
  },
  otpContainer: {
    marginBottom: 25,
  },
  otpInputWrapper: {
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(16, 172, 132, 0.3)',
  },
  otpInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    height: 60,
    paddingHorizontal: 20,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 8,
  },
  primaryButton: {
    marginVertical: 10,
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: 15,
  },
  countdownText: {
    color: '#666',
    fontSize: 14,
  },
  resendText: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeNumberButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  changeNumberText: {
    color: '#10ac84',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  loginSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 25,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  loginText: {
    color: '#ccc',
    fontSize: 16,
  },
  loginLink: {
    color: '#ffd700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  featuresSection: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(16, 172, 132, 0.1)',
    marginHorizontal: 5,
  },
  featureIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  featureText: {
    color: '#fff',
    fontSize: 12,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  footerText: {
    color: '#666',
    fontSize: 12,
    textAlign: 'center',
    lineHeight: 18,
  },
});

export default RegisterScreen;