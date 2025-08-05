import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import {
  Alert,
  Dimensions,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import { AlphaGamesButton } from '$components/AlphaGamesButton';
import { useRouter } from 'expo-router';
import { firebaseService } from '../../src/services/firebaseService';

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

  // No animations for cleaner UI

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
    
    // Simple button press without animation

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
          
          // No animation for cleaner UI
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

  // No animations for cleaner UI

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#000000" />

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.appName}>AlphaGames</Text>
              <Text style={styles.tagline}>Join & Win Real Money</Text>
              <Text style={styles.welcomeBonus}>🎁 Get ₹100 Welcome Bonus!</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formSection}>
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
                        placeholderTextColor="#444444"
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
                    colors={['#222222', '#333333']}
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
            </View>
            
            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By registering, you agree to our Terms & Conditions
              </Text>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
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
    backgroundColor: '#000000',
    top: '10%',
    right: '10%',
  },
  element2: {
    width: 60,
    height: 60,
    backgroundColor: '#222222',
    top: '60%',
    left: '5%',
  },
  element3: {
    width: 80,
    height: 80,
    backgroundColor: '#444444',
    bottom: '20%',
    right: '20%',
  },
  element4: {
    width: 40,
    height: 40,
    backgroundColor: '#666666',
    top: '30%',
    left: '15%',
  },
  element5: {
    width: 60,
    height: 60,
    backgroundColor: '#888888',
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
    shadowColor: '#000000',
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
    borderColor: '#222222',
    backgroundColor: '#111111',
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
    color: '#ffffff',
    fontWeight: '600',
    marginBottom: 8,
  },
  welcomeBonus: {
    fontSize: 16,
    color: '#666666',
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formSection: {
    width: '100%',
    maxWidth: 350,
    marginBottom: 30,
    backgroundColor: '#111111',
    borderRadius: 15,
    padding: 20,
    borderWidth: 1,
    borderColor: '#222222',
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
    color: '#888888',
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
    backgroundColor: '#111111',
    padding: 8,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#111111',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
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
    backgroundColor: '#111111',
    borderRadius: 15,
    borderWidth: 1,
    borderColor: '#333333',
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
    borderColor: 'rgba(255, 255, 255, 0.1)',
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
    color: '#888888',
    fontSize: 14,
  },
  resendText: {
    color: '#cccccc',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeNumberButton: {
    alignItems: 'center',
    marginTop: 10,
  },
  changeNumberText: {
    color: '#ffffff',
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
    borderTopColor: 'rgba(255, 255, 255, 0.05)',
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
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
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