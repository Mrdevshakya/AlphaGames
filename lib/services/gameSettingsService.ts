/**
 * Game Settings and Customization Service for Ludo Game
 * Provides comprehensive game configuration and user preferences
 */

import AsyncStorage from '@react-native-async-storage/async-storage';
import { soundService } from './soundService';
import { animationService } from './animationService';

export interface GameSettings {
  // Audio Settings
  soundEnabled: boolean;
  masterVolume: number;
  sfxVolume: number;
  musicVolume: number;
  
  // Visual Settings
  animationsEnabled: boolean;
  animationSpeed: 'slow' | 'normal' | 'fast';
  theme: 'classic' | 'modern' | 'dark' | 'colorful';
  boardStyle: 'traditional' | 'minimal' | 'premium';
  pieceStyle: 'classic' | '3d' | 'flat' | 'custom';
  
  // Gameplay Settings
  gameSpeed: 'slow' | 'normal' | 'fast';
  autoRoll: boolean;
  autoMove: boolean;
  showHints: boolean;
  confirmMoves: boolean;
  skipAnimations: boolean;
  
  // AI Settings
  aiDifficulty: 'easy' | 'medium' | 'hard';
  aiPersonality: 'aggressive' | 'defensive' | 'balanced' | 'random';
  aiThinkingTime: number;
  
  // Multiplayer Settings
  allowSpectators: boolean;
  chatEnabled: boolean;
  voiceChatEnabled: boolean;
  autoMatchmaking: boolean;
  preferredRegion: string;
  
  // Accessibility Settings
  colorBlindSupport: boolean;
  highContrast: boolean;
  largeText: boolean;
  screenReader: boolean;
  hapticFeedback: boolean;
  
  // Notification Settings
  gameNotifications: boolean;
  tournamentNotifications: boolean;
  friendNotifications: boolean;
  achievementNotifications: boolean;
  
  // Privacy Settings
  profileVisibility: 'public' | 'friends' | 'private';
  showOnlineStatus: boolean;
  allowFriendRequests: boolean;
  shareStatistics: boolean;
  
  // Advanced Settings
  debugMode: boolean;
  performanceMode: boolean;
  dataUsageOptimization: boolean;
  offlineMode: boolean;
}

export class GameSettingsService {
  private static instance: GameSettingsService;
  private settings: GameSettings;
  private settingsListeners: Array<(settings: GameSettings) => void> = [];

  static getInstance(): GameSettingsService {
    if (!GameSettingsService.instance) {
      GameSettingsService.instance = new GameSettingsService();
    }
    return GameSettingsService.instance;
  }

  constructor() {
    this.settings = this.getDefaultSettings();
  }

  /**
   * Initialize settings service
   */
  async initialize(): Promise<void> {
    try {
      await this.loadSettings();
      await this.applySettings();
      console.log('Game settings service initialized');
    } catch (error) {
      console.error('Error initializing game settings service:', error);
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): GameSettings {
    return {
      // Audio Settings
      soundEnabled: true,
      masterVolume: 1.0,
      sfxVolume: 0.8,
      musicVolume: 0.6,
      
      // Visual Settings
      animationsEnabled: true,
      animationSpeed: 'normal',
      theme: 'classic',
      boardStyle: 'traditional',
      pieceStyle: 'classic',
      
      // Gameplay Settings
      gameSpeed: 'normal',
      autoRoll: false,
      autoMove: false,
      showHints: true,
      confirmMoves: false,
      skipAnimations: false,
      
      // AI Settings
      aiDifficulty: 'medium',
      aiPersonality: 'balanced',
      aiThinkingTime: 1500,
      
      // Multiplayer Settings
      allowSpectators: true,
      chatEnabled: true,
      voiceChatEnabled: false,
      autoMatchmaking: true,
      preferredRegion: 'auto',
      
      // Accessibility Settings
      colorBlindSupport: false,
      highContrast: false,
      largeText: false,
      screenReader: false,
      hapticFeedback: true,
      
      // Notification Settings
      gameNotifications: true,
      tournamentNotifications: true,
      friendNotifications: true,
      achievementNotifications: true,
      
      // Privacy Settings
      profileVisibility: 'public',
      showOnlineStatus: true,
      allowFriendRequests: true,
      shareStatistics: true,
      
      // Advanced Settings
      debugMode: false,
      performanceMode: false,
      dataUsageOptimization: false,
      offlineMode: false,
    };
  }

  /**
   * Load settings from storage
   */
  async loadSettings(): Promise<void> {
    try {
      const savedSettings = await AsyncStorage.getItem('game_settings');
      if (savedSettings) {
        const parsed = JSON.parse(savedSettings);
        this.settings = { ...this.getDefaultSettings(), ...parsed };
      }
    } catch (error) {
      console.error('Error loading settings:', error);
      this.settings = this.getDefaultSettings();
    }
  }

  /**
   * Save settings to storage
   */
  async saveSettings(): Promise<void> {
    try {
      await AsyncStorage.setItem('game_settings', JSON.stringify(this.settings));
      await this.applySettings();
      this.notifyListeners();
    } catch (error) {
      console.error('Error saving settings:', error);
      throw error;
    }
  }

  /**
   * Apply settings to relevant services
   */
  private async applySettings(): Promise<void> {
    try {
      // Apply audio settings
      await soundService.setSoundEnabled(this.settings.soundEnabled);
      await soundService.setMasterVolume(this.settings.masterVolume);
      await soundService.setSFXVolume(this.settings.sfxVolume);
      await soundService.setMusicVolume(this.settings.musicVolume);

      // Apply visual settings would go here
      // This would involve updating theme, animations, etc.
      
      console.log('Settings applied successfully');
    } catch (error) {
      console.error('Error applying settings:', error);
    }
  }

  /**
   * Get current settings
   */
  getSettings(): GameSettings {
    return { ...this.settings };
  }

  /**
   * Update specific setting
   */
  async updateSetting<K extends keyof GameSettings>(
    key: K,
    value: GameSettings[K]
  ): Promise<void> {
    this.settings[key] = value;
    await this.saveSettings();
  }

  /**
   * Update multiple settings
   */
  async updateSettings(updates: Partial<GameSettings>): Promise<void> {
    this.settings = { ...this.settings, ...updates };
    await this.saveSettings();
  }

  /**
   * Reset settings to default
   */
  async resetSettings(): Promise<void> {
    this.settings = this.getDefaultSettings();
    await this.saveSettings();
  }

  /**
   * Reset specific category of settings
   */
  async resetCategory(category: 'audio' | 'visual' | 'gameplay' | 'ai' | 'multiplayer' | 'accessibility' | 'notifications' | 'privacy' | 'advanced'): Promise<void> {
    const defaultSettings = this.getDefaultSettings();
    
    switch (category) {
      case 'audio':
        this.settings.soundEnabled = defaultSettings.soundEnabled;
        this.settings.masterVolume = defaultSettings.masterVolume;
        this.settings.sfxVolume = defaultSettings.sfxVolume;
        this.settings.musicVolume = defaultSettings.musicVolume;
        break;
        
      case 'visual':
        this.settings.animationsEnabled = defaultSettings.animationsEnabled;
        this.settings.animationSpeed = defaultSettings.animationSpeed;
        this.settings.theme = defaultSettings.theme;
        this.settings.boardStyle = defaultSettings.boardStyle;
        this.settings.pieceStyle = defaultSettings.pieceStyle;
        break;
        
      case 'gameplay':
        this.settings.gameSpeed = defaultSettings.gameSpeed;
        this.settings.autoRoll = defaultSettings.autoRoll;
        this.settings.autoMove = defaultSettings.autoMove;
        this.settings.showHints = defaultSettings.showHints;
        this.settings.confirmMoves = defaultSettings.confirmMoves;
        this.settings.skipAnimations = defaultSettings.skipAnimations;
        break;
        
      case 'ai':
        this.settings.aiDifficulty = defaultSettings.aiDifficulty;
        this.settings.aiPersonality = defaultSettings.aiPersonality;
        this.settings.aiThinkingTime = defaultSettings.aiThinkingTime;
        break;
        
      case 'multiplayer':
        this.settings.allowSpectators = defaultSettings.allowSpectators;
        this.settings.chatEnabled = defaultSettings.chatEnabled;
        this.settings.voiceChatEnabled = defaultSettings.voiceChatEnabled;
        this.settings.autoMatchmaking = defaultSettings.autoMatchmaking;
        this.settings.preferredRegion = defaultSettings.preferredRegion;
        break;
        
      case 'accessibility':
        this.settings.colorBlindSupport = defaultSettings.colorBlindSupport;
        this.settings.highContrast = defaultSettings.highContrast;
        this.settings.largeText = defaultSettings.largeText;
        this.settings.screenReader = defaultSettings.screenReader;
        this.settings.hapticFeedback = defaultSettings.hapticFeedback;
        break;
        
      case 'notifications':
        this.settings.gameNotifications = defaultSettings.gameNotifications;
        this.settings.tournamentNotifications = defaultSettings.tournamentNotifications;
        this.settings.friendNotifications = defaultSettings.friendNotifications;
        this.settings.achievementNotifications = defaultSettings.achievementNotifications;
        break;
        
      case 'privacy':
        this.settings.profileVisibility = defaultSettings.profileVisibility;
        this.settings.showOnlineStatus = defaultSettings.showOnlineStatus;
        this.settings.allowFriendRequests = defaultSettings.allowFriendRequests;
        this.settings.shareStatistics = defaultSettings.shareStatistics;
        break;
        
      case 'advanced':
        this.settings.debugMode = defaultSettings.debugMode;
        this.settings.performanceMode = defaultSettings.performanceMode;
        this.settings.dataUsageOptimization = defaultSettings.dataUsageOptimization;
        this.settings.offlineMode = defaultSettings.offlineMode;
        break;
    }
    
    await this.saveSettings();
  }

  /**
   * Get settings for specific category
   */
  getCategorySettings(category: string): Partial<GameSettings> {
    switch (category) {
      case 'audio':
        return {
          soundEnabled: this.settings.soundEnabled,
          masterVolume: this.settings.masterVolume,
          sfxVolume: this.settings.sfxVolume,
          musicVolume: this.settings.musicVolume,
        };
        
      case 'visual':
        return {
          animationsEnabled: this.settings.animationsEnabled,
          animationSpeed: this.settings.animationSpeed,
          theme: this.settings.theme,
          boardStyle: this.settings.boardStyle,
          pieceStyle: this.settings.pieceStyle,
        };
        
      case 'gameplay':
        return {
          gameSpeed: this.settings.gameSpeed,
          autoRoll: this.settings.autoRoll,
          autoMove: this.settings.autoMove,
          showHints: this.settings.showHints,
          confirmMoves: this.settings.confirmMoves,
          skipAnimations: this.settings.skipAnimations,
        };
        
      default:
        return {};
    }
  }

  /**
   * Import settings from JSON
   */
  async importSettings(settingsJson: string): Promise<void> {
    try {
      const importedSettings = JSON.parse(settingsJson);
      
      // Validate imported settings
      const validatedSettings = this.validateSettings(importedSettings);
      
      this.settings = { ...this.getDefaultSettings(), ...validatedSettings };
      await this.saveSettings();
    } catch (error) {
      console.error('Error importing settings:', error);
      throw new Error('Invalid settings format');
    }
  }

  /**
   * Export settings to JSON
   */
  exportSettings(): string {
    return JSON.stringify(this.settings, null, 2);
  }

  /**
   * Validate settings object
   */
  private validateSettings(settings: any): Partial<GameSettings> {
    const validated: Partial<GameSettings> = {};
    const defaults = this.getDefaultSettings();
    
    // Validate each setting
    Object.keys(defaults).forEach(key => {
      const settingKey = key as keyof GameSettings;
      if (settings.hasOwnProperty(key)) {
        const value = settings[key];
        const defaultValue = defaults[settingKey];
        
        // Type validation
        if (typeof value === typeof defaultValue) {
          // Additional validation for specific types
          if (typeof value === 'number') {
            if (key.includes('Volume') && (value < 0 || value > 1)) {
              return; // Skip invalid volume values
            }
          }
          
          validated[settingKey] = value;
        }
      }
    });
    
    return validated;
  }

  /**
   * Get setting value with type safety
   */
  getSetting<K extends keyof GameSettings>(key: K): GameSettings[K] {
    return this.settings[key];
  }

  /**
   * Check if setting exists
   */
  hasSetting(key: string): boolean {
    return key in this.settings;
  }

  /**
   * Get settings schema for UI generation
   */
  getSettingsSchema(): Array<{
    category: string;
    title: string;
    settings: Array<{
      key: keyof GameSettings;
      title: string;
      description: string;
      type: 'boolean' | 'number' | 'string' | 'select';
      options?: string[];
      min?: number;
      max?: number;
      step?: number;
    }>;
  }> {
    return [
      {
        category: 'audio',
        title: 'Audio Settings',
        settings: [
          {
            key: 'soundEnabled',
            title: 'Enable Sound',
            description: 'Turn game sounds on or off',
            type: 'boolean'
          },
          {
            key: 'masterVolume',
            title: 'Master Volume',
            description: 'Overall volume level',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.1
          },
          {
            key: 'sfxVolume',
            title: 'Sound Effects Volume',
            description: 'Volume for game sound effects',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.1
          },
          {
            key: 'musicVolume',
            title: 'Music Volume',
            description: 'Volume for background music',
            type: 'number',
            min: 0,
            max: 1,
            step: 0.1
          }
        ]
      },
      {
        category: 'visual',
        title: 'Visual Settings',
        settings: [
          {
            key: 'animationsEnabled',
            title: 'Enable Animations',
            description: 'Turn game animations on or off',
            type: 'boolean'
          },
          {
            key: 'animationSpeed',
            title: 'Animation Speed',
            description: 'Speed of game animations',
            type: 'select',
            options: ['slow', 'normal', 'fast']
          },
          {
            key: 'theme',
            title: 'Game Theme',
            description: 'Visual theme for the game',
            type: 'select',
            options: ['classic', 'modern', 'dark', 'colorful']
          },
          {
            key: 'boardStyle',
            title: 'Board Style',
            description: 'Style of the game board',
            type: 'select',
            options: ['traditional', 'minimal', 'premium']
          }
        ]
      },
      {
        category: 'gameplay',
        title: 'Gameplay Settings',
        settings: [
          {
            key: 'gameSpeed',
            title: 'Game Speed',
            description: 'Overall speed of gameplay',
            type: 'select',
            options: ['slow', 'normal', 'fast']
          },
          {
            key: 'autoRoll',
            title: 'Auto Roll Dice',
            description: 'Automatically roll dice when it\'s your turn',
            type: 'boolean'
          },
          {
            key: 'autoMove',
            title: 'Auto Move Pieces',
            description: 'Automatically move pieces when only one move is possible',
            type: 'boolean'
          },
          {
            key: 'showHints',
            title: 'Show Move Hints',
            description: 'Highlight possible moves',
            type: 'boolean'
          },
          {
            key: 'confirmMoves',
            title: 'Confirm Moves',
            description: 'Ask for confirmation before making moves',
            type: 'boolean'
          }
        ]
      }
    ];
  }

  /**
   * Subscribe to settings changes
   */
  subscribe(listener: (settings: GameSettings) => void): () => void {
    this.settingsListeners.push(listener);
    
    // Return unsubscribe function
    return () => {
      const index = this.settingsListeners.indexOf(listener);
      if (index > -1) {
        this.settingsListeners.splice(index, 1);
      }
    };
  }

  /**
   * Notify all listeners of settings changes
   */
  private notifyListeners(): void {
    this.settingsListeners.forEach(listener => {
      try {
        listener(this.getSettings());
      } catch (error) {
        console.error('Error in settings listener:', error);
      }
    });
  }

  /**
   * Get performance optimized settings
   */
  getPerformanceSettings(): Partial<GameSettings> {
    return {
      animationsEnabled: false,
      animationSpeed: 'fast',
      skipAnimations: true,
      performanceMode: true,
      dataUsageOptimization: true
    };
  }

  /**
   * Apply performance optimizations
   */
  async enablePerformanceMode(): Promise<void> {
    const performanceSettings = this.getPerformanceSettings();
    await this.updateSettings(performanceSettings);
  }

  /**
   * Get accessibility optimized settings
   */
  getAccessibilitySettings(): Partial<GameSettings> {
    return {
      colorBlindSupport: true,
      highContrast: true,
      largeText: true,
      hapticFeedback: true,
      showHints: true
    };
  }

  /**
   * Apply accessibility optimizations
   */
  async enableAccessibilityMode(): Promise<void> {
    const accessibilitySettings = this.getAccessibilitySettings();
    await this.updateSettings(accessibilitySettings);
  }

  /**
   * Clean up resources
   */
  cleanup(): void {
    this.settingsListeners = [];
  }
}

// Export singleton instance
export const gameSettingsService = GameSettingsService.getInstance();
export default gameSettingsService;