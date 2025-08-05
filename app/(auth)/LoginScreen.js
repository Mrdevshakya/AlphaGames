import { AlphaGamesButton } from '$components/AlphaGamesButton';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';
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
import { firebaseService } from '../../src/services/firebaseService';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [phoneNumber, setPhoneNumber] = useState('');
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

  const sendOTP = async () => {
    if (!phoneNumber || phoneNumber.length !== 10) {
      Alert.alert('❌ Invalid Number', 'Please enter a valid 10-digit phone number');
      return;
    }

    setLoading(true);
    
    // No animation for cleaner UI

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

  const verifyOTP = async () => {
    if (!otp || otp.length !== 6) {
      Alert.alert('❌ Invalid OTP', 'Please enter the complete 6-digit OTP');
      return;
    }

    setLoading(true);
    
    try {
      // Get the stored verification ID
      const storedVerificationId = await AsyncStorage.getItem('verificationId');
      const result = await firebaseService.verifyOTP(storedVerificationId, otp);
      
      if (result.success) {
        setLoading(false);
        
        // No animation for cleaner UI
          Alert.alert(
            '🎉 Login Successful!',
            'Welcome back to AlphaGames!',
            [
              {
                text: 'Continue',
                onPress: () => {
                  // Navigate to tabs using router
                  router.replace('/(tabs)');
                }
              }
            ]
          );

      }
    } catch (error) {
      setLoading(false);
      Alert.alert('❌ Verification Failed', error.message || 'Please check your OTP and try again.');
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

  const navigateToRegister = () => {
    if (navigation) {
      navigation.navigate('Register');
    } else {
      // Fallback for expo-router
      router.push('/(auth)/RegisterScreen');
    }
  };



  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0a0a1a" />
      
      {/* Background Gradient */}
      <View style={styles.backgroundGradient} />

      {/* No background elements for cleaner UI */}

      <KeyboardAvoidingView
        style={styles.keyboardView}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContainer}>
          <View style={styles.content}>
            
            {/* Logo Section */}
            <View style={styles.logoSection}>
              <Text style={styles.appName}>AlphaGames</Text>
              <Text style={styles.tagline}>Win Real Money • Play Smart</Text>
            </View>

            {/* Form Section */}
            <View style={styles.formCard}>
              {!isOtpSent ? (
                <>
                  <Text style={styles.welcomeText}>Welcome Back! 🎉</Text>
                  <Text style={styles.instructionText}>
                    Enter your phone number to get started
                  </Text>

                  <View style={styles.inputContainer}>
                    <View style={styles.phoneInputWrapper}>
                      <View style={styles.countryCode}>
                        <Text style={styles.countryCodeText}>🇮🇳 +91</Text>
                      </View>
                      <TextInput
                        style={styles.phoneInput}
                        placeholder="Enter mobile number"
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
                        value={phoneNumber}
                        onChangeText={setPhoneNumber}
                        keyboardType="numeric"
                        maxLength={10}
                        editable={!loading}
                      />
                    </View>
                  </View>

                  <AlphaGamesButton
                    title={loading ? "Sending..." : "Send OTP"}
                    onPress={sendOTP}
                    disabled={loading}
                    colors={['#333333', '#444444']}
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
                        placeholderTextColor="rgba(255, 255, 255, 0.5)"
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
                    title={loading ? "Verifying..." : "Verify & Login"}
                    onPress={verifyOTP}
                    disabled={loading}
                    colors={['#333333', '#444444']}
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
                      ← Change Number
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* Register Link */}
              <View style={styles.registerSection}>
                <Text style={styles.registerText}>New to AlphaGames? </Text>
                <TouchableOpacity onPress={navigateToRegister} disabled={loading}>
                  <Text style={[styles.registerLink, loading && styles.disabledText]}>
                    Create Account
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Footer */}
            <View style={styles.footer}>
              <Text style={styles.footerText}>
                By continuing, you agree to our Terms & Conditions
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
    backgroundColor: '#000000',
  },
  backgroundElements: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    backgroundColor: '#111111',
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
    marginBottom: 40,
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    elevation: 10,
    shadowColor: '#333333',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#333333',
    backgroundColor: '#111111',
  },
  logoIcon: {
    fontSize: 60,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    letterSpacing: 2,
  },
  tagline: {
    fontSize: 14,
    color: '#ffffff',
    fontWeight: '600',
    textAlign: 'center',
    marginTop: 5,
    letterSpacing: 1,
  },
  formCard: {
    marginVertical: 30,
    width: '100%',
    maxWidth: 350,
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
    marginBottom: 10,
  },
  instructionText: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    marginBottom: 25,
    lineHeight: 22,
  },
  phoneDisplay: {
    fontSize: 18,
    color: '#ffffff',
    textAlign: 'center',
    fontWeight: 'bold',
    marginBottom: 15,
  },
  developmentNote: {
    fontSize: 14,
    color: '#cccccc',
    textAlign: 'center',
    fontWeight: '600',
    marginBottom: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 8,
    borderRadius: 8,
  },
  inputContainer: {
    marginBottom: 25,
  },
  phoneInputWrapper: {
    flexDirection: 'row',
    borderRadius: 15,
    borderWidth: 2,
    borderColor: 'rgba(51, 51, 51, 0.3)',
    overflow: 'hidden',
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
  },
  countryCode: {
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    paddingHorizontal: 15,
    paddingVertical: 18,
    justifyContent: 'center',
    borderRightWidth: 1,
    borderRightColor: 'rgba(0, 0, 0, 0.3)',
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
    borderColor: 'rgba(51, 51, 51, 0.3)',
    backgroundColor: 'rgba(51, 51, 51, 0.1)',
  },
  otpInput: {
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
    marginTop: 20,
  },
  countdownText: {
    color: '#888888',
    fontSize: 14,
  },
  resendText: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  changeNumberButton: {
    alignItems: 'center',
    marginTop: 15,
  },
  changeNumberText: {
    color: '#666666',
    fontSize: 14,
    fontWeight: '600',
  },
  disabledText: {
    opacity: 0.5,
  },
  registerSection: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  registerText: {
    color: '#ccc',
    fontSize: 16,
  },
  registerLink: {
    color: '#666666',
    fontSize: 16,
    fontWeight: 'bold',
  },
  trustSection: {
    alignItems: 'center',
    marginTop: 30,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  trustTitle: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  trustIndicators: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    width: '100%',
  },
  trustItem: {
    alignItems: 'center',
    flex: 1,
  },
  trustIcon: {
    fontSize: 20,
    marginBottom: 5,
  },
  trustText: {
    color: 'rgba(255, 255, 255, 0.7)',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
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

export default LoginScreen;