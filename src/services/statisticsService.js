/**
 * Statistics and Achievements Service for Ludo Game
 * Tracks player performance, achievements, and game analytics
 */

import { firebaseService } from './firebaseService';
import AsyncStorage from '@react-native-async-storage/async-storage';

export class StatisticsService {
  constructor() {
    this.achievements = this.initializeAchievements();
    this.statisticsCache = new Map();
    this.sessionStats = this.initializeSessionStats();
  }

  /**
   * Initialize achievement definitions
   */
  initializeAchievements() {
    return [
      {
        id: 'first_win',
        name: 'First Victory',
        description: 'Win your first game',
        icon: '🏆',
        type: 'milestone',
        requirement: { gamesWon: 1 },
        reward: { coins: 100, xp: 50 }
      },
      {
        id: 'winning_streak_5',
        name: 'Hot Streak',
        description: 'Win 5 games in a row',
        icon: '🔥',
        type: 'streak',
        requirement: { winStreak: 5 },
        reward: { coins: 500, xp: 200 }
      },
      {
        id: 'games_played_10',
        name: 'Getting Started',
        description: 'Play 10 games',
        icon: '🎮',
        type: 'milestone',
        requirement: { gamesPlayed: 10 },
        reward: { coins: 200, xp: 100 }
      },
      {
        id: 'games_played_100',
        name: 'Veteran Player',
        description: 'Play 100 games',
        icon: '🎖️',
        type: 'milestone',
        requirement: { gamesPlayed: 100 },
        reward: { coins: 1000, xp: 500 }
      },
      {
        id: 'perfect_game',
        name: 'Perfect Game',
        description: 'Win without any pieces being captured',
        icon: '💎',
        type: 'special',
        requirement: { perfectGame: true },
        reward: { coins: 300, xp: 150 }
      },
      {
        id: 'speed_demon',
        name: 'Speed Demon',
        description: 'Win a game in under 10 minutes',
        icon: '⚡',
        type: 'special',
        requirement: { gameTimeUnder: 600 }, // 10 minutes in seconds
        reward: { coins: 250, xp: 125 }
      },
      {
        id: 'capture_master',
        name: 'Capture Master',
        description: 'Capture 50 opponent pieces',
        icon: '🎯',
        type: 'milestone',
        requirement: { totalCaptures: 50 },
        reward: { coins: 400, xp: 200 }
      },
      {
        id: 'lucky_roller',
        name: 'Lucky Roller',
        description: 'Roll three 6s in a row',
        icon: '🎲',
        type: 'special',
        requirement: { consecutiveSixes: 3 },
        reward: { coins: 150, xp: 75 }
      },
      {
        id: 'tournament_winner',
        name: 'Tournament Champion',
        description: 'Win a tournament',
        icon: '👑',
        type: 'tournament',
        requirement: { tournamentsWon: 1 },
        reward: { coins: 1000, xp: 500 }
      },
      {
        id: 'social_player',
        name: 'Social Butterfly',
        description: 'Play 20 multiplayer games',
        icon: '👥',
        type: 'social',
        requirement: { multiplayerGames: 20 },
        reward: { coins: 300, xp: 150 }
      },
      {
        id: 'ai_destroyer',
        name: 'AI Destroyer',
        description: 'Beat hard AI 10 times',
        icon: '🤖',
        type: 'ai',
        requirement: { hardAIWins: 10 },
        reward: { coins: 600, xp: 300 }
      },
      {
        id: 'daily_player',
        name: 'Daily Dedication',
        description: 'Play for 7 consecutive days',
        icon: '📅',
        type: 'daily',
        requirement: { consecutiveDays: 7 },
        reward: { coins: 500, xp: 250 }
      }
    ];
  }

  /**
   * Initialize session statistics
   */
  initializeSessionStats() {
    return {
      sessionStartTime: Date.now(),
      gamesPlayedThisSession: 0,
      gamesWonThisSession: 0,
      totalPlayTimeThisSession: 0,
      capturesThisSession: 0,
      perfectGamesThisSession: 0
    };
  }

  /**
   * Record game start
   */
  async recordGameStart(gameId, gameMode, playerCount) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      const gameStartData = {
        gameId,
        userId,
        gameMode,
        playerCount,
        startTime: Date.now(),
        status: 'started'
      };

      // Update session stats
      this.sessionStats.gamesPlayedThisSession++;

      // Store game start data
      await AsyncStorage.setItem(`game_${gameId}`, JSON.stringify(gameStartData));

      console.log('Game start recorded:', gameStartData);
    } catch (error) {
      console.error('Error recording game start:', error);
    }
  }

  /**
   * Record game completion
   */
  async recordGameEnd(gameId, gameResult) {
    try {
      const userId = await this.getCurrentUserId();
      if (!userId) return;

      // Get game start data
      const gameStartDataStr = await AsyncStorage.getItem(`game_${gameId}`);
      if (!gameStartDataStr) return;

      const gameStartData = JSON.parse(gameStartDataStr);
      const gameEndTime = Date.now();
      const gameDuration = gameEndTime - gameStartData.startTime;

      const gameEndData = {
        ...gameStartData,
        endTime: gameEndTime,
        duration: gameDuration,
        result: gameResult,
        status: 'completed'
      };

      // Update user statistics
      await this.updateUserStatistics(userId, gameEndData);

      // Check for achievements
      await this.checkAchievements(userId, gameEndData);

      // Update session stats
      if (gameResult.winner === userId) {
        this.sessionStats.gamesWonThisSession++;
      }
      this.sessionStats.totalPlayTimeThisSession += gameDuration;

      // Clean up game data
      await AsyncStorage.removeItem(`game_${gameId}`);

      console.log('Game end recorded:', gameEndData);
    } catch (error) {
      console.error('Error recording game end:', error);
    }
  }

  /**
   * Update user statistics
   */
  async updateUserStatistics(userId, gameData) {
    try {
      // Get current stats
      const currentStats = await this.getUserStatistics(userId);
      
      // Calculate new stats
      const newStats = {
        ...currentStats,
        gamesPlayed: currentStats.gamesPlayed + 1,
        totalPlayTime: currentStats.totalPlayTime + gameData.duration,
        lastGameDate: new Date().toISOString()
      };

      // Update game mode specific stats
      const gameMode = gameData.gameMode || 'single';
      newStats[`${gameMode}GamesPlayed`] = (newStats[`${gameMode}GamesPlayed`] || 0) + 1;

      // Update win/loss stats
      if (gameData.result.winner === userId) {
        newStats.gamesWon = currentStats.gamesWon + 1;
        newStats[`${gameMode}GamesWon`] = (newStats[`${gameMode}GamesWon`] || 0) + 1;
        
        // Update win streak
        newStats.currentWinStreak = currentStats.currentWinStreak + 1;
        newStats.longestWinStreak = Math.max(newStats.longestWinStreak, newStats.currentWinStreak);
      } else {
        newStats.currentWinStreak = 0;
      }

      // Update other game-specific stats
      if (gameData.result.captures) {
        newStats.totalCaptures = currentStats.totalCaptures + gameData.result.captures;
        this.sessionStats.capturesThisSession += gameData.result.captures;
      }

      if (gameData.result.perfectGame) {
        newStats.perfectGames = currentStats.perfectGames + 1;
        this.sessionStats.perfectGamesThisSession++;
      }

      // Calculate derived stats
      newStats.winRate = newStats.gamesPlayed > 0 ? (newStats.gamesWon / newStats.gamesPlayed) * 100 : 0;
      newStats.averageGameTime = newStats.gamesPlayed > 0 ? newStats.totalPlayTime / newStats.gamesPlayed : 0;

      // Update fastest game time
      if (gameData.result.winner === userId) {
        if (!newStats.fastestWin || gameData.duration < newStats.fastestWin) {
          newStats.fastestWin = gameData.duration;
        }
      }

      // Save to local storage and Firebase
      await this.saveUserStatistics(userId, newStats);

      console.log('User statistics updated:', newStats);
      return newStats;
    } catch (error) {
      console.error('Error updating user statistics:', error);
      throw error;
    }
  }

  /**
   * Get user statistics
   */
  async getUserStatistics(userId) {
    try {
      // Check cache first
      if (this.statisticsCache.has(userId)) {
        return this.statisticsCache.get(userId);
      }

      // Try to get from local storage
      const localStats = await AsyncStorage.getItem(`user_stats_${userId}`);
      if (localStats) {
        const stats = JSON.parse(localStats);
        this.statisticsCache.set(userId, stats);
        return stats;
      }

      // Get from Firebase
      const firebaseStats = await firebaseService.getUserStats(userId);
      
      // Merge with default stats
      const defaultStats = this.getDefaultUserStatistics();
      const mergedStats = { ...defaultStats, ...firebaseStats };

      // Cache and return
      this.statisticsCache.set(userId, mergedStats);
      return mergedStats;
    } catch (error) {
      console.error('Error getting user statistics:', error);
      return this.getDefaultUserStatistics();
    }
  }

  /**
   * Get default user statistics
   */
  getDefaultUserStatistics() {
    return {
      gamesPlayed: 0,
      gamesWon: 0,
      winRate: 0,
      currentWinStreak: 0,
      longestWinStreak: 0,
      totalPlayTime: 0,
      averageGameTime: 0,
      fastestWin: null,
      totalCaptures: 0,
      perfectGames: 0,
      singleGamesPlayed: 0,
      singleGamesWon: 0,
      multiplayerGamesPlayed: 0,
      multiplayerGamesWon: 0,
      tournamentGamesPlayed: 0,
      tournamentGamesWon: 0,
      tournamentsWon: 0,
      hardAIWins: 0,
      consecutiveDays: 0,
      lastGameDate: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  /**
   * Save user statistics
   */
  async saveUserStatistics(userId, stats) {
    try {
      stats.updatedAt = new Date().toISOString();
      
      // Update cache
      this.statisticsCache.set(userId, stats);
      
      // Save to local storage
      await AsyncStorage.setItem(`user_stats_${userId}`, JSON.stringify(stats));
      
      // Save to Firebase
      await firebaseService.updateUser(userId, { stats });
      
      console.log('User statistics saved');
    } catch (error) {
      console.error('Error saving user statistics:', error);
      throw error;
    }
  }

  /**
   * Check and unlock achievements
   */
  async checkAchievements(userId, gameData) {
    try {
      const userStats = await this.getUserStatistics(userId);
      const unlockedAchievements = await this.getUserAchievements(userId);
      const newlyUnlocked = [];

      for (const achievement of this.achievements) {
        // Skip if already unlocked
        if (unlockedAchievements.some(a => a.id === achievement.id)) {
          continue;
        }

        // Check if achievement requirements are met
        if (this.checkAchievementRequirement(achievement, userStats, gameData)) {
          // Unlock achievement
          const unlockedAchievement = {
            ...achievement,
            unlockedAt: new Date().toISOString(),
            gameId: gameData.gameId
          };

          newlyUnlocked.push(unlockedAchievement);
          
          // Award rewards
          await this.awardAchievementReward(userId, achievement.reward);
        }
      }

      if (newlyUnlocked.length > 0) {
        // Save newly unlocked achievements
        await this.saveUserAchievements(userId, [...unlockedAchievements, ...newlyUnlocked]);
        
        console.log('New achievements unlocked:', newlyUnlocked);
        return newlyUnlocked;
      }

      return [];
    } catch (error) {
      console.error('Error checking achievements:', error);
      return [];
    }
  }

  /**
   * Check if achievement requirement is met
   */
  checkAchievementRequirement(achievement, userStats, gameData) {
    const req = achievement.requirement;

    // Check different types of requirements
    if (req.gamesWon && userStats.gamesWon >= req.gamesWon) return true;
    if (req.gamesPlayed && userStats.gamesPlayed >= req.gamesPlayed) return true;
    if (req.winStreak && userStats.currentWinStreak >= req.winStreak) return true;
    if (req.totalCaptures && userStats.totalCaptures >= req.totalCaptures) return true;
    if (req.perfectGame && gameData.result.perfectGame) return true;
    if (req.gameTimeUnder && gameData.duration <= req.gameTimeUnder * 1000) return true;
    if (req.consecutiveSixes && gameData.result.consecutiveSixes >= req.consecutiveSixes) return true;
    if (req.tournamentsWon && userStats.tournamentsWon >= req.tournamentsWon) return true;
    if (req.multiplayerGames && userStats.multiplayerGamesPlayed >= req.multiplayerGames) return true;
    if (req.hardAIWins && userStats.hardAIWins >= req.hardAIWins) return true;
    if (req.consecutiveDays && userStats.consecutiveDays >= req.consecutiveDays) return true;

    return false;
  }

  /**
   * Get user achievements
   */
  async getUserAchievements(userId) {
    try {
      const achievementsStr = await AsyncStorage.getItem(`user_achievements_${userId}`);
      return achievementsStr ? JSON.parse(achievementsStr) : [];
    } catch (error) {
      console.error('Error getting user achievements:', error);
      return [];
    }
  }

  /**
   * Save user achievements
   */
  async saveUserAchievements(userId, achievements) {
    try {
      await AsyncStorage.setItem(`user_achievements_${userId}`, JSON.stringify(achievements));
      
      // Also save to Firebase
      await firebaseService.updateUser(userId, { achievements });
      
      console.log('User achievements saved');
    } catch (error) {
      console.error('Error saving user achievements:', error);
      throw error;
    }
  }

  /**
   * Award achievement reward
   */
  async awardAchievementReward(userId, reward) {
    try {
      if (reward.coins) {
        // Add coins to user wallet (integrate with wallet service)
        console.log(`Awarded ${reward.coins} coins to user ${userId}`);
      }

      if (reward.xp) {
        // Add XP to user (implement XP system)
        console.log(`Awarded ${reward.xp} XP to user ${userId}`);
      }
    } catch (error) {
      console.error('Error awarding achievement reward:', error);
    }
  }

  /**
   * Get leaderboard data
   */
  async getLeaderboard(type = 'wins', limit = 50) {
    try {
      // This would typically query Firebase for all users' stats
      // For now, return mock data
      return await firebaseService.getLeaderboard(type);
    } catch (error) {
      console.error('Error getting leaderboard:', error);
      return [];
    }
  }

  /**
   * Get session statistics
   */
  getSessionStatistics() {
    const sessionDuration = Date.now() - this.sessionStats.sessionStartTime;
    return {
      ...this.sessionStats,
      sessionDuration,
      sessionWinRate: this.sessionStats.gamesPlayedThisSession > 0 
        ? (this.sessionStats.gamesWonThisSession / this.sessionStats.gamesPlayedThisSession) * 100 
        : 0
    };
  }

  /**
   * Reset session statistics
   */
  resetSessionStatistics() {
    this.sessionStats = this.initializeSessionStats();
  }

  /**
   * Get current user ID
   */
  async getCurrentUserId() {
    try {
      const user = await firebaseService.getCurrentUser();
      return user?.uid || user?.id;
    } catch (error) {
      console.error('Error getting current user ID:', error);
      return null;
    }
  }

  /**
   * Export user data
   */
  async exportUserData(userId) {
    try {
      const stats = await this.getUserStatistics(userId);
      const achievements = await this.getUserAchievements(userId);
      
      return {
        statistics: stats,
        achievements: achievements,
        exportedAt: new Date().toISOString()
      };
    } catch (error) {
      console.error('Error exporting user data:', error);
      throw error;
    }
  }

  /**
   * Clear all cached data
   */
  clearCache() {
    this.statisticsCache.clear();
    console.log('Statistics cache cleared');
  }
}

// Export singleton instance
export const statisticsService = new StatisticsService();
export default statisticsService;