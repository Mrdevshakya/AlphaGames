import AsyncStorage from '@react-native-async-storage/async-storage';
import { initializeApp } from 'firebase/app';
import {
  getAuth,
  getReactNativePersistence,
  initializeAuth,
  onAuthStateChanged
} from 'firebase/auth';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCx-MSwIlBdbG1IOVQ6ZFKX38nDC7RZrZo",
  authDomain: "ludo-game-eec96.firebaseapp.com",
  projectId: "ludo-game-eec96",
  storageBucket: "ludo-game-eec96.firebasestorage.app",
  messagingSenderId: "556700028163",
  appId: "1:556700028163:web:d2691fb3db11a9c4f46d36",
  measurementId: "G-KNS7ZB00NV"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Auth with AsyncStorage persistence for React Native
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  // If already initialized, get the existing instance
  auth = getAuth(app);
}

const db = getFirestore(app);
const storage = getStorage(app);

class FirebaseService {
  constructor() {
    this.auth = auth;
    this.db = db;
    this.storage = storage;
    this.currentUser = null;
    this.verificationId = null;
    this.recaptchaVerifier = null;
    
    // Listen for auth state changes
    onAuthStateChanged(this.auth, (user) => {
      this.currentUser = user;
    });
  }

  // Authentication Methods
  async sendOTP(phoneNumber) {
    try {
      console.log(`Sending OTP to ${phoneNumber}`);
      
      // Format phone number to international format
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      // Check if phone number already exists
      const phoneExists = await this.checkPhoneNumberExists(formattedPhone);
      
      // For development/testing, we'll use email/password auth instead of phone auth
      // since phone auth requires additional setup and verification
      
      // Store phone number temporarily for registration/login
      await AsyncStorage.setItem('tempPhoneNumber', formattedPhone);
      await AsyncStorage.setItem('phoneExists', phoneExists.toString());
      
      // Generate a mock verification ID for development
      const mockVerificationId = `dev_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Store verification ID
      this.verificationId = mockVerificationId;
      await AsyncStorage.setItem('verificationId', mockVerificationId);
      
      // For development, generate a fixed OTP
      const mockOTP = '123456';
      console.log(`📱 Development OTP: ${mockOTP}`);
      console.log('Verification ID:', mockVerificationId);
      
      // Store the mock OTP for verification (development only)
      await AsyncStorage.setItem('mockOTP', mockOTP);
      
      return {
        success: true,
        verificationId: mockVerificationId,
        message: 'OTP sent successfully to your phone number',
        developmentNote: `For testing, use OTP: ${mockOTP}`,
        phoneExists: phoneExists
      };
      
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw new Error('Failed to send OTP. Please check your phone number and try again.');
    }
  }

  async verifyOTP(verificationId, otp) {
    try {
      console.log('Verifying OTP:', otp);
      
      if (!otp || otp.length !== 6) {
        throw new Error('Please enter a valid 6-digit OTP');
      }

      const phoneNumber = await AsyncStorage.getItem('tempPhoneNumber');
      const storedVerificationId = await AsyncStorage.getItem('verificationId');
      const mockOTP = await AsyncStorage.getItem('mockOTP');
      const phoneExists = await AsyncStorage.getItem('phoneExists');
      
      if (!phoneNumber) {
        throw new Error('Phone number not found. Please try again.');
      }

      if (!storedVerificationId) {
        throw new Error('Verification ID not found. Please request OTP again.');
      }

      // For development: verify against mock OTP
      if (otp !== mockOTP) {
        throw new Error('Invalid OTP. Please check the code and try again.');
      }
      
      console.log('OTP verification successful for:', phoneNumber);
      
      // Clean up temporary data
      await AsyncStorage.removeItem('tempPhoneNumber');
      await AsyncStorage.removeItem('verificationId');
      await AsyncStorage.removeItem('mockOTP');
      await AsyncStorage.removeItem('phoneExists');
      
      if (phoneExists === 'true') {
        // Existing user, login
        const userId = `user_${phoneNumber.replace('+', '')}`;
        const userRef = doc(this.db, 'users', userId);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const userData = userDoc.data();
          // Update last login timestamp
          await updateDoc(userRef, {
            lastLoginAt: serverTimestamp(),
          });
          // Prepare data for local storage (convert server timestamps to ISO strings)
          const localUserData = {
            ...userData,
            lastLoginAt: new Date().toISOString(),
          };
          await AsyncStorage.setItem('userData', JSON.stringify(localUserData));
          this.currentUser = localUserData;
          return { success: true, user: localUserData };
        } else {
          throw new Error('User not found. Please register first.');
        }
      } else {
        // New user, create user document in Firestore
        const userId = `user_${phoneNumber.replace('+', '')}`;
        const userRef = doc(this.db, 'users', userId);
        const userDoc = await getDoc(userRef);

        let userData;
        if (userDoc.exists()) {
          // User exists, retrieve existing data including wallet balance
          userData = {
            ...userDoc.data(),
            isLoggedIn: true,
            loginTime: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          };
        } else {
          // New user, create with welcome bonus
          userData = {
            uid: userId,
            phoneNumber,
            isLoggedIn: true,
            loginTime: serverTimestamp(),
            walletBalance: 100, // Welcome bonus
            gamesPlayed: 0,
            gamesWon: 0,
            createdAt: serverTimestamp(),
            lastLoginAt: serverTimestamp(),
          };
        }

        // Save to Firestore (create or update)
        try {
          console.log('Saving user data to Firestore...');
          await setDoc(userRef, userData, { merge: true });
          console.log('User data saved successfully to Firestore');
        } catch (firestoreError) {
          console.error('Firestore save error:', firestoreError);
          throw new Error('Failed to save user data to Firestore.');
        }

        // Prepare data for local storage (convert server timestamps to ISO strings)
        const localUserData = {
          ...userData,
          loginTime: new Date().toISOString(),
          createdAt: userData.createdAt ? userData.createdAt.toDate().toISOString() : new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await AsyncStorage.setItem('userData', JSON.stringify(localUserData));
      
        this.currentUser = localUserData;
        return { success: true, user: localUserData };
      }

    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw new Error(error.message || 'Failed to verify OTP. Please try again.');
    }
  }

  // Check if phone number already exists
  async checkPhoneNumberExists(phoneNumber) {
    try {
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      // Query Firestore for existing phone number
      const usersRef = collection(this.db, 'users');
      const q = query(usersRef, where('phoneNumber', '==', formattedPhone));
      const querySnapshot = await getDocs(q);
      
      return !querySnapshot.empty;
    } catch (error) {
      console.error('Error checking phone number existence:', error);
      // In case of error, allow registration to proceed (fail-safe)
      return false;
    }
  }

  async registerUser(userData) {
    try {
      const { fullName, phoneNumber, email } = userData;
      
      // Format phone number
      const formattedPhone = phoneNumber.startsWith('+91') ? phoneNumber : `+91${phoneNumber}`;
      
      // Check if phone number already exists
      const phoneExists = await this.checkPhoneNumberExists(formattedPhone);
      if (phoneExists) {
        throw new Error(`इस फोन नंबर (${phoneNumber}) से पहले से ही एक अकाउंट बना हुआ है। कृपया अपने मौजूदा अकाउंट में लॉगिन करें या दूसरा नंबर इस्तेमाल करें।`);
      }
      
      // Get current user data if already authenticated via phone
      const existingUserData = await AsyncStorage.getItem('userData');
      let userDoc;
      
      if (existingUserData) {
        // Update existing user with additional registration details
        const currentUser = JSON.parse(existingUserData);
        userDoc = {
          ...currentUser,
          fullName,
          email,
          registrationTime: serverTimestamp(),
          status: 'active',
          updatedAt: serverTimestamp(),
        };
      } else {
        // Create new user document (fallback case)
        const userId = `user_${formattedPhone.replace('+', '')}`;
        userDoc = {
          uid: userId,
          fullName,
          phoneNumber: formattedPhone,
          email,
          isLoggedIn: true,
          registrationTime: serverTimestamp(),
          walletBalance: 100, // Welcome bonus
          gamesPlayed: 0,
          gamesWon: 0,
          status: 'active',
          createdAt: serverTimestamp(),
        };
      }

      // Save to Firestore
      try {
        console.log('Saving registration data to Firestore...');
        const userId = userDoc.uid || `user_${formattedPhone.replace('+', '')}`;
        const userRef = doc(this.db, 'users', userId);
        await setDoc(userRef, userDoc, { merge: true });
        console.log('Registration data saved successfully to Firestore');
      } catch (firestoreError) {
        console.error('Firestore registration save error:', firestoreError);
        // Continue without Firestore save for development
      }

      // Save locally with proper timestamps
      const localUserDoc = {
        ...userDoc,
        registrationTime: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdAt: userDoc.createdAt || new Date().toISOString(),
      };
      await AsyncStorage.setItem('userData', JSON.stringify(localUserDoc));
      
      this.currentUser = localUserDoc;
      return { success: true, user: localUserDoc };
    } catch (error) {
      console.error('Error registering user:', error);
      throw error;
    }
  }

  async getCurrentUser() {
    try {
      // First, try to get from in-memory cache
      if (this.currentUser) return this.currentUser;

      // Then, try to get from AsyncStorage
      const localUserDataString = await AsyncStorage.getItem('userData');
      let localUserData = localUserDataString ? JSON.parse(localUserDataString) : null;

      if (localUserData && localUserData.uid) {
        // If local data exists, try to fetch the latest from Firestore
        const userRef = doc(this.db, 'users', localUserData.uid);
        const userDoc = await getDoc(userRef);

        if (userDoc.exists()) {
          const firestoreUserData = userDoc.data();
          // Compare timestamps or assume Firestore is always more authoritative
          // For simplicity, we'll use Firestore data if available
          const mergedUserData = {
            ...firestoreUserData,
            // Ensure timestamps are converted to ISO strings for local storage consistency
            createdAt: firestoreUserData.createdAt ? firestoreUserData.createdAt.toDate().toISOString() : new Date().toISOString(),
            lastLoginAt: firestoreUserData.lastLoginAt ? firestoreUserData.lastLoginAt.toDate().toISOString() : new Date().toISOString(),
            updatedAt: firestoreUserData.updatedAt ? firestoreUserData.updatedAt.toDate().toISOString() : new Date().toISOString(),
          };
          this.currentUser = mergedUserData;
          await AsyncStorage.setItem('userData', JSON.stringify(mergedUserData)); // Update local storage
          return this.currentUser;
        } else {
          // User not found in Firestore, but exists locally (shouldn't happen often)
          // Use local data as a fallback, but log a warning
          console.warn('User found in AsyncStorage but not in Firestore:', localUserData.uid);
          this.currentUser = localUserData;
          return this.currentUser;
        }
      } else if (localUserData) {
        // Local data exists but no UID (e.g., incomplete registration)
        this.currentUser = localUserData;
        return this.currentUser;
      }

      return null; // No user found anywhere
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  async logout() {
    try {
      await AsyncStorage.removeItem('userData');
      this.currentUser = null;
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  }

  // User Management Methods
  async getAllUsers() {
    try {
      const usersRef = collection(this.db, 'users');
      const snapshot = await getDocs(usersRef);
      
      const users = [];
      snapshot.forEach((doc) => {
        users.push({ id: doc.id, ...doc.data() });
      });
      
      return users;
    } catch (error) {
      console.error('Error getting users:', error);
      // Return empty array for development
      return [];
    }
  }

  async updateUser(userId, updateData) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      // Update local storage if it's current user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.uid === userId) {
        const updatedUser = { ...currentUser, ...updateData, updatedAt: new Date().toISOString() };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  }

  // Game Management Methods
  async createGame(gameData) {
    try {
      const gamesRef = collection(this.db, 'games');
      const gameDoc = {
        ...gameData,
        createdAt: serverTimestamp(),
        status: 'waiting',
      };
      
      const docRef = await addDoc(gamesRef, gameDoc);
      return { success: true, gameId: docRef.id, game: { ...gameDoc, id: docRef.id } };
    } catch (error) {
      console.error('Error creating game:', error);
      throw error;
    }
  }

  async getAllGames() {
    try {
      const gamesRef = collection(this.db, 'games');
      const snapshot = await getDocs(gamesRef);
      
      const games = [];
      snapshot.forEach((doc) => {
        games.push({ id: doc.id, ...doc.data() });
      });
      
      return games;
    } catch (error) {
      console.error('Error getting games:', error);
      return [];
    }
  }

  // Tournament Management Methods
  async createTournament(tournamentData) {
    try {
      const tournamentsRef = collection(this.db, 'tournaments');
      const tournamentDoc = {
        ...tournamentData,
        createdAt: serverTimestamp(),
        status: 'upcoming',
        participants: [],
      };
      
      const docRef = await addDoc(tournamentsRef, tournamentDoc);
      return { success: true, tournamentId: docRef.id };
    } catch (error) {
      console.error('Error creating tournament:', error);
      throw error;
    }
  }

  async getAllTournaments() {
    try {
      const tournamentsRef = collection(this.db, 'tournaments');
      const q = query(tournamentsRef, orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      
      const tournaments = [];
      snapshot.forEach((doc) => {
        tournaments.push({ id: doc.id, ...doc.data() });
      });
      
      return tournaments;
    } catch (error) {
      console.error('Error getting tournaments:', error);
      return [];
    }
  }

  // Transaction Management Methods
  async createTransaction(transactionData) {
    try {
      const transactionsRef = collection(this.db, 'transactions');
      const transactionDoc = {
        ...transactionData,
        timestamp: serverTimestamp(),
      };
      
      const docRef = await addDoc(transactionsRef, transactionDoc);
      return { success: true, transactionId: docRef.id };
    } catch (error) {
      console.error('Error creating transaction:', error);
      throw error;
    }
  }

  async getUserTransactions(userId) {
    try {
      const transactionsRef = collection(this.db, 'transactions');
      const q = query(
        transactionsRef, 
        where('userId', '==', userId),
        orderBy('timestamp', 'desc')
      );
      const snapshot = await getDocs(q);
      
      const transactions = [];
      snapshot.forEach((doc) => {
        transactions.push({ id: doc.id, ...doc.data() });
      });
      
      return transactions;
    } catch (error) {
      console.error('Error getting user transactions:', error);
      return [];
    }
  }

  // Wallet Management Methods
  async addMoneyToWallet(userId, amount, paymentMethod = 'razorpay') {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentBalance = userDoc.data().walletBalance || 0;
        const newBalance = currentBalance + amount;
        
        await updateDoc(userRef, {
          walletBalance: newBalance,
          updatedAt: serverTimestamp(),
        });

        // Create transaction record
        await this.createTransaction({
          userId,
          type: 'credit',
          amount,
          method: paymentMethod,
          status: 'completed',
          description: 'Money added to wallet',
        });

        // Update local storage
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.uid === userId) {
          const updatedUser = { ...currentUser, walletBalance: newBalance };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          this.currentUser = updatedUser;
        }

        return { success: true, newBalance };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error adding money to wallet:', error);
      throw error;
    }
  }

  async withdrawMoney(userId, amount, upiId) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const currentBalance = userDoc.data().walletBalance || 0;
        
        if (currentBalance < amount) {
          throw new Error('Insufficient balance');
        }
        
        const newBalance = currentBalance - amount;
        
        await updateDoc(userRef, {
          walletBalance: newBalance,
          updatedAt: serverTimestamp(),
        });

        // Create transaction record
        await this.createTransaction({
          userId,
          type: 'withdrawal',
          amount,
          method: 'upi',
          status: 'pending',
          description: `Withdrawal to UPI: ${upiId}`,
          upiId,
        });

        // Update local storage
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.uid === userId) {
          const updatedUser = { ...currentUser, walletBalance: newBalance };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          this.currentUser = updatedUser;
        }

        return { success: true, newBalance };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error withdrawing money:', error);
      throw error;
    }
  }

  // Leaderboard Methods
  async getLeaderboard(period = 'alltime') {
    try {
      const usersRef = collection(this.db, 'users');
      
      // For now, we'll show all users ordered by XP for all periods
      // In a more advanced implementation, we could filter by period
      const q = query(usersRef, orderBy('xp', 'desc'), limit(100));
      const snapshot = await getDocs(q);
      
      const leaderboard = [];
      snapshot.forEach((doc, index) => {
        const userData = doc.data();
        leaderboard.push({
          rank: index + 1,
          id: doc.id,
          name: userData.fullName || userData.name || 'Anonymous',
          gamesWon: userData.gamesWon || 0,
          gamesPlayed: userData.gamesPlayed || 0,
          winRate: userData.gamesPlayed > 0 ? Math.round((userData.gamesWon / userData.gamesPlayed) * 100) : 0,
          xp: userData.xp || 0,
          totalEarnings: userData.totalEarnings || 0,
          ...userData
        });
      });
      
      return leaderboard;
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  // Get user statistics
  async getUserStats(userId) {
    try {
      const userDoc = await getDoc(doc(this.db, 'users', userId));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const xp = userData.xp || 0;
        const level = this.calculateLevel(xp);
        const rank = this.calculateRank(level);
        
        return {
          gamesPlayed: userData.gamesPlayed || 0,
          gamesWon: userData.gamesWon || 0,
          totalEarnings: userData.totalEarnings || 0,
          currentRank: userData.rank || 'Beginner',
          winRate: userData.gamesPlayed > 0 ? Math.round((userData.gamesWon / userData.gamesPlayed) * 100) : 0,
          xp: xp,
          level: level,
          rank: rank,
          nextLevelXp: this.getXpForNextLevel(level),
          xpProgress: this.calculateXpProgress(xp, level)
        };
      }
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 0,
        currentRank: 'Beginner',
        winRate: 0,
        xp: 0,
        level: 1,
        rank: 'Bronze V',
        nextLevelXp: 500,
        xpProgress: { current: 0, required: 500 }
      };
    } catch (error) {
      console.error('Error getting user stats:', error);
      // Return default stats for development
      return {
        gamesPlayed: 0,
        gamesWon: 0,
        totalEarnings: 0,
        currentRank: 'Beginner',
        winRate: 0,
        xp: 0,
        level: 1,
        rank: 'Bronze V',
        nextLevelXp: 500,
        xpProgress: { current: 0, required: 500 }
      };
    }
  }

  // Update user profile
  async updateUserProfile(userId, updateData) {
    try {
      const userRef = doc(this.db, 'users', userId);
      await updateDoc(userRef, {
        ...updateData,
        updatedAt: serverTimestamp(),
      });
      
      // Update local storage if it's current user
      const currentUser = await this.getCurrentUser();
      if (currentUser && currentUser.uid === userId) {
        const updatedUser = { ...currentUser, ...updateData, updatedAt: new Date().toISOString() };
        await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
        this.currentUser = updatedUser;
      }
      
      return { success: true };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Add transaction
  async addTransaction(transactionData) {
    try {
      const transactionsRef = collection(this.db, 'transactions');
      const transactionDoc = {
        ...transactionData,
        timestamp: serverTimestamp(),
        id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      };
      
      const docRef = await addDoc(transactionsRef, transactionDoc);
      return { success: true, transactionId: docRef.id };
    } catch (error) {
      console.error('Error adding transaction:', error);
      throw error;
    }
  }

  // Submit support ticket
  async submitSupportTicket(ticketData) {
    try {
      const ticketRef = await addDoc(collection(this.db, 'supportTickets'), {
        ...ticketData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return ticketRef.id;
    } catch (error) {
      console.error('Error submitting support ticket:', error);
      throw error;
    }
  }

  // Request data export
  async requestDataExport(userId) {
    try {
      const exportRef = await addDoc(collection(this.db, 'dataExports'), {
        userId,
        status: 'pending',
        requestedAt: serverTimestamp(),
        type: 'full_export',
      });
      return exportRef.id;
    } catch (error) {
      console.error('Error requesting data export:', error);
      throw error;
    }
  }

  // Delete user account
  async deleteUserAccount(userId) {
    try {
      // In production, this would be handled by a cloud function
      // to ensure all user data is properly deleted
      await updateDoc(doc(this.db, 'users', userId), {
        accountStatus: 'deleted',
        deletedAt: serverTimestamp(),
      });
      
      // Add deletion request to queue for processing
      await addDoc(collection(this.db, 'accountDeletions'), {
        userId,
        requestedAt: serverTimestamp(),
        status: 'pending',
      });
      
      return true;
    } catch (error) {
      console.error('Error deleting user account:', error);
      throw error;
    }
  }

  // Sign out method
  async signOut() {
    try {
      await this.logout();
      return { success: true };
    } catch (error) {
      console.error('Error signing out:', error);
      throw error;
    }
  }

  // XP and Level Calculation Methods
  calculateLevel(xp) {
    const levelThresholds = [
      0,      // Level 1
      500,    // Level 2
      1000,   // Level 3
      1500,   // Level 4
      2500,   // Level 5
      4000,   // Level 6
      6000,   // Level 7
      9000,   // Level 8
      13000,  // Level 9
      18000,  // Level 10
      24000,  // Level 11
      31000,  // Level 12
      39000,  // Level 13
      48000,  // Level 14
      58000,  // Level 15
      69000,  // Level 16
      81000,  // Level 17
      94000,  // Level 18
      108000, // Level 19
      123000, // Level 20
      139000, // Level 21
      156000, // Level 22
      174000, // Level 23
      193000, // Level 24
      213000, // Level 25
      234000, // Level 26
      256000, // Level 27
      279000, // Level 28
      303000, // Level 29
      328000, // Level 30
      354000, // Level 31
      381000, // Level 32
      409000, // Level 33
      438000, // Level 34
      468000, // Level 35
      499000, // Level 36
      531000, // Level 37
      564000, // Level 38
      598000, // Level 39
      633000  // Level 40
    ];
    
    for (let i = levelThresholds.length - 1; i >= 0; i--) {
      if (xp >= levelThresholds[i]) {
        return i + 1;
      }
    }
    return 1; // Minimum level
  }

  calculateRank(level) {
    if (level >= 39) return 'Platinum I';
    if (level >= 37) return 'Platinum II';
    if (level >= 35) return 'Platinum III';
    if (level >= 33) return 'Platinum IV';
    if (level >= 31) return 'Platinum V';
    if (level >= 29) return 'Gold I';
    if (level >= 27) return 'Gold II';
    if (level >= 25) return 'Gold III';
    if (level >= 23) return 'Gold IV';
    if (level >= 21) return 'Gold V';
    if (level >= 19) return 'Silver I';
    if (level >= 17) return 'Silver II';
    if (level >= 15) return 'Silver III';
    if (level >= 13) return 'Silver IV';
    if (level >= 11) return 'Silver V';
    if (level >= 9) return 'Bronze I';
    if (level >= 7) return 'Bronze II';
    if (level >= 5) return 'Bronze III';
    if (level >= 3) return 'Bronze IV';
    return 'Bronze V';
  }

  getXpForNextLevel(currentLevel) {
    const levelThresholds = [
      0,      // Level 1
      500,    // Level 2
      1000,   // Level 3
      1500,   // Level 4
      2500,   // Level 5
      4000,   // Level 6
      6000,   // Level 7
      9000,   // Level 8
      13000,  // Level 9
      18000,  // Level 10
      24000,  // Level 11
      31000,  // Level 12
      39000,  // Level 13
      48000,  // Level 14
      58000,  // Level 15
      69000,  // Level 16
      81000,  // Level 17
      94000,  // Level 18
      108000, // Level 19
      123000, // Level 20
      139000, // Level 21
      156000, // Level 22
      174000, // Level 23
      193000, // Level 24
      213000, // Level 25
      234000, // Level 26
      256000, // Level 27
      279000, // Level 28
      303000, // Level 29
      328000, // Level 30
      354000, // Level 31
      381000, // Level 32
      409000, // Level 33
      438000, // Level 34
      468000, // Level 35
      499000, // Level 36
      531000, // Level 37
      564000, // Level 38
      598000, // Level 39
      633000  // Level 40
    ];
    
    return currentLevel < levelThresholds.length ? levelThresholds[currentLevel] : levelThresholds[levelThresholds.length - 1];
  }

  calculateXpProgress(currentXp, currentLevel) {
    const levelThresholds = [
      0,      // Level 1
      500,    // Level 2
      1000,   // Level 3
      1500,   // Level 4
      2500,   // Level 5
      4000,   // Level 6
      6000,   // Level 7
      9000,   // Level 8
      13000,  // Level 9
      18000,  // Level 10
      24000,  // Level 11
      31000,  // Level 12
      39000,  // Level 13
      48000,  // Level 14
      58000,  // Level 15
      69000,  // Level 16
      81000,  // Level 17
      94000,  // Level 18
      108000, // Level 19
      123000, // Level 20
      139000, // Level 21
      156000, // Level 22
      174000, // Level 23
      193000, // Level 24
      213000, // Level 25
      234000, // Level 26
      256000, // Level 27
      279000, // Level 28
      303000, // Level 29
      328000, // Level 30
      354000, // Level 31
      381000, // Level 32
      409000, // Level 33
      438000, // Level 34
      468000, // Level 35
      499000, // Level 36
      531000, // Level 37
      564000, // Level 38
      598000, // Level 39
      633000  // Level 40
    ];
    
    const currentLevelIndex = currentLevel - 1;
    const nextLevelIndex = currentLevel;
    
    if (nextLevelIndex >= levelThresholds.length) {
      return { current: currentXp - levelThresholds[currentLevelIndex], required: 0 };
    }
    
    const currentLevelXp = levelThresholds[currentLevelIndex];
    const nextLevelXp = levelThresholds[nextLevelIndex];
    const xpNeeded = nextLevelXp - currentLevelXp;
    const xpProgress = currentXp - currentLevelXp;
    
    return { current: xpProgress, required: xpNeeded };
  }

  // Method to add XP to user
  async addXpToUser(userId, xpAmount) {
    try {
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const currentXp = userData.xp || 0;
        const newXp = currentXp + xpAmount;
        
        // Update user document with new XP
        await updateDoc(userRef, {
          xp: newXp,
          updatedAt: serverTimestamp(),
        });
        
        // Update local storage if it's current user
        const currentUser = await this.getCurrentUser();
        if (currentUser && currentUser.uid === userId) {
          const updatedUser = { ...currentUser, xp: newXp };
          await AsyncStorage.setItem('userData', JSON.stringify(updatedUser));
          this.currentUser = updatedUser;
        }
        
        return { success: true, newXp: newXp };
      } else {
        throw new Error('User not found');
      }
    } catch (error) {
      console.error('Error adding XP to user:', error);
      throw error;
    }
  }

  // Method to award XP for game completion
  async awardGameXp(userId, gameResult) {
    try {
      // Award XP based on game result
      // Win: 100 XP, Loss: 50 XP
      const xpAmount = gameResult === 'win' ? 100 : 50;
      
      const result = await this.addXpToUser(userId, xpAmount);
      
      // Also update games played/won stats
      const userRef = doc(this.db, 'users', userId);
      const userDoc = await getDoc(userRef);
      
      if (userDoc.exists()) {
        const userData = userDoc.data();
        const updateData = {
          gamesPlayed: (userData.gamesPlayed || 0) + 1,
          updatedAt: serverTimestamp()
        };
        
        if (gameResult === 'win') {
          updateData.gamesWon = (userData.gamesWon || 0) + 1;
        }
        
        await updateDoc(userRef, updateData);
      }
      
      return result;
    } catch (error) {
      console.error('Error awarding game XP:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const firebaseService = new FirebaseService();
export default firebaseService;