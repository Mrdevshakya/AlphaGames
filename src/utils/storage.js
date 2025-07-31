import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS, DEFAULT_VALUES } from './constants';

// Storage utility class for managing AsyncStorage operations
class StorageManager {
  // User Data Management
  async getUserData() {
    try {
      const userData = await AsyncStorage.getItem(STORAGE_KEYS.USER_DATA);
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting user data:', error);
      return null;
    }
  }

  async setUserData(userData) {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_DATA, JSON.stringify(userData));
      return true;
    } catch (error) {
      console.error('Error setting user data:', error);
      return false;
    }
  }

  async updateUserData(updates) {
    try {
      const currentData = await this.getUserData();
      if (currentData) {
        const updatedData = { ...currentData, ...updates };
        await this.setUserData(updatedData);
        return updatedData;
      }
      return null;
    } catch (error) {
      console.error('Error updating user data:', error);
      return null;
    }
  }

  async clearUserData() {
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.USER_DATA);
      return true;
    } catch (error) {
      console.error('Error clearing user data:', error);
      return false;
    }
  }

  // Wallet Management
  async getWalletBalance() {
    try {
      const userData = await this.getUserData();
      return userData?.walletBalance || DEFAULT_VALUES.WALLET_BALANCE;
    } catch (error) {
      console.error('Error getting wallet balance:', error);
      return DEFAULT_VALUES.WALLET_BALANCE;
    }
  }

  async updateWalletBalance(amount, operation = 'add') {
    try {
      const userData = await this.getUserData();
      if (userData) {
        const currentBalance = userData.walletBalance || 0;
        const newBalance = operation === 'add' 
          ? currentBalance + amount 
          : currentBalance - amount;
        
        const updatedData = await this.updateUserData({ 
          walletBalance: Math.max(0, newBalance) 
        });
        return updatedData?.walletBalance || 0;
      }
      return 0;
    } catch (error) {
      console.error('Error updating wallet balance:', error);
      return 0;
    }
  }

  // Game Statistics
  async updateGameStats(won = false) {
    try {
      const userData = await this.getUserData();
      if (userData) {
        const gamesPlayed = (userData.gamesPlayed || 0) + 1;
        const gamesWon = won ? (userData.gamesWon || 0) + 1 : (userData.gamesWon || 0);
        
        return await this.updateUserData({
          gamesPlayed,
          gamesWon,
        });
      }
      return null;
    } catch (error) {
      console.error('Error updating game stats:', error);
      return null;
    }
  }

  // Room Management
  async saveRoom(roomCode, roomData) {
    try {
      const key = `${STORAGE_KEYS.ROOM_PREFIX}${roomCode}`;
      await AsyncStorage.setItem(key, JSON.stringify(roomData));
      return true;
    } catch (error) {
      console.error('Error saving room:', error);
      return false;
    }
  }

  async getRoom(roomCode) {
    try {
      const key = `${STORAGE_KEYS.ROOM_PREFIX}${roomCode}`;
      const roomData = await AsyncStorage.getItem(key);
      return roomData ? JSON.parse(roomData) : null;
    } catch (error) {
      console.error('Error getting room:', error);
      return null;
    }
  }

  async updateRoom(roomCode, updates) {
    try {
      const currentRoom = await this.getRoom(roomCode);
      if (currentRoom) {
        const updatedRoom = { ...currentRoom, ...updates };
        await this.saveRoom(roomCode, updatedRoom);
        return updatedRoom;
      }
      return null;
    } catch (error) {
      console.error('Error updating room:', error);
      return null;
    }
  }

  async deleteRoom(roomCode) {
    try {
      const key = `${STORAGE_KEYS.ROOM_PREFIX}${roomCode}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting room:', error);
      return false;
    }
  }

  // Game State Management
  async saveGameState(gameId, gameState) {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${gameId}`;
      await AsyncStorage.setItem(key, JSON.stringify(gameState));
      return true;
    } catch (error) {
      console.error('Error saving game state:', error);
      return false;
    }
  }

  async getGameState(gameId) {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${gameId}`;
      const gameState = await AsyncStorage.getItem(key);
      return gameState ? JSON.parse(gameState) : null;
    } catch (error) {
      console.error('Error getting game state:', error);
      return null;
    }
  }

  async deleteGameState(gameId) {
    try {
      const key = `${STORAGE_KEYS.GAME_STATE}_${gameId}`;
      await AsyncStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Error deleting game state:', error);
      return false;
    }
  }

  // Settings Management
  async getSettings() {
    try {
      const settings = await AsyncStorage.getItem(STORAGE_KEYS.SETTINGS);
      return settings ? JSON.parse(settings) : {
        soundEnabled: true,
        notificationsEnabled: true,
        theme: 'dark',
        language: 'en',
      };
    } catch (error) {
      console.error('Error getting settings:', error);
      return {};
    }
  }

  async updateSettings(newSettings) {
    try {
      const currentSettings = await this.getSettings();
      const updatedSettings = { ...currentSettings, ...newSettings };
      await AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updatedSettings));
      return updatedSettings;
    } catch (error) {
      console.error('Error updating settings:', error);
      return null;
    }
  }

  // Transaction History
  async addTransaction(transaction) {
    try {
      const transactions = await this.getTransactions();
      const newTransaction = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        ...transaction,
      };
      transactions.unshift(newTransaction);
      
      // Keep only last 100 transactions
      const limitedTransactions = transactions.slice(0, 100);
      
      await AsyncStorage.setItem('transactions', JSON.stringify(limitedTransactions));
      return newTransaction;
    } catch (error) {
      console.error('Error adding transaction:', error);
      return null;
    }
  }

  async getTransactions() {
    try {
      const transactions = await AsyncStorage.getItem('transactions');
      return transactions ? JSON.parse(transactions) : [];
    } catch (error) {
      console.error('Error getting transactions:', error);
      return [];
    }
  }

  // Tournament Management
  async saveTournament(tournamentId, tournamentData) {
    try {
      const key = `${STORAGE_KEYS.TOURNAMENT_PREFIX}${tournamentId}`;
      await AsyncStorage.setItem(key, JSON.stringify(tournamentData));
      return true;
    } catch (error) {
      console.error('Error saving tournament:', error);
      return false;
    }
  }

  async getTournament(tournamentId) {
    try {
      const key = `${STORAGE_KEYS.TOURNAMENT_PREFIX}${tournamentId}`;
      const tournament = await AsyncStorage.getItem(key);
      return tournament ? JSON.parse(tournament) : null;
    } catch (error) {
      console.error('Error getting tournament:', error);
      return null;
    }
  }

  // Utility Methods
  async clearAllData() {
    try {
      await AsyncStorage.clear();
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }

  async getAllKeys() {
    try {
      return await AsyncStorage.getAllKeys();
    } catch (error) {
      console.error('Error getting all keys:', error);
      return [];
    }
  }

  async getStorageSize() {
    try {
      const keys = await this.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          totalSize += value.length;
        }
      }
      
      return {
        keys: keys.length,
        sizeInBytes: totalSize,
        sizeInKB: Math.round(totalSize / 1024),
      };
    } catch (error) {
      console.error('Error calculating storage size:', error);
      return { keys: 0, sizeInBytes: 0, sizeInKB: 0 };
    }
  }

  // Backup and Restore
  async exportData() {
    try {
      const keys = await this.getAllKeys();
      const data = {};
      
      for (const key of keys) {
        const value = await AsyncStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      }
      
      return {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data,
      };
    } catch (error) {
      console.error('Error exporting data:', error);
      return null;
    }
  }

  async importData(backupData) {
    try {
      if (!backupData || !backupData.data) {
        throw new Error('Invalid backup data');
      }
      
      // Clear existing data
      await this.clearAllData();
      
      // Import new data
      for (const [key, value] of Object.entries(backupData.data)) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      }
      
      return true;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  }
}

// Export singleton instance
export const storage = new StorageManager();
export default storage;