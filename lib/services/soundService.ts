/**
 * Enhanced Sound Service for Ludo Game
 * Provides comprehensive audio management with dynamic sound effects
 */

import { Audio } from 'expo-av';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { SOUNDS } from '../../assets/sfx';

export class SoundService {
  private static instance: SoundService;
  private soundObjects: Map<string, Audio.Sound> = new Map();
  private isEnabled: boolean = true;
  private masterVolume: number = 1.0;
  private sfxVolume: number = 1.0;
  private musicVolume: number = 0.7;
  private currentBackgroundMusic: Audio.Sound | null = null;
  private soundQueue: Array<{ soundName: string; priority: number }> = [];
  private isProcessingQueue: boolean = false;

  static getInstance(): SoundService {
    if (!SoundService.instance) {
      SoundService.instance = new SoundService();
    }
    return SoundService.instance;
  }

  /**
   * Initialize sound service
   */
  async initialize(): Promise<void> {
    try {
      // Set audio mode for games
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: false,
        staysActiveInBackground: false,
        playsInSilentModeIOS: true,
        shouldDuckAndroid: true,
        playThroughEarpieceAndroid: false,
      });

      // Load user preferences
      await this.loadSoundPreferences();

      // Preload essential sounds
      await this.preloadEssentialSounds();

      console.log('Sound service initialized');
    } catch (error) {
      console.error('Error initializing sound service:', error);
    }
  }

  /**
   * Preload essential game sounds
   */
  private async preloadEssentialSounds(): Promise<void> {
    const essentialSounds = [
      'dice_roll',
      'pile_move',
      'ui',
      'collide',
      'safe_spot',
      'home_win'
    ];

    for (const soundName of essentialSounds) {
      try {
        await this.loadSound(soundName);
      } catch (error) {
        console.warn(`Failed to preload sound: ${soundName}`, error);
      }
    }
  }

  /**
   * Load a sound file
   */
  private async loadSound(soundName: string): Promise<Audio.Sound> {
    try {
      if (this.soundObjects.has(soundName)) {
        return this.soundObjects.get(soundName)!;
      }

      const soundAsset = this.getSoundAsset(soundName);
      if (!soundAsset) {
        throw new Error(`Sound asset not found: ${soundName}`);
      }

      const { sound } = await Audio.Sound.createAsync(soundAsset, {
        shouldPlay: false,
        volume: this.sfxVolume * this.masterVolume,
      });

      this.soundObjects.set(soundName, sound);
      return sound;
    } catch (error) {
      console.error(`Error loading sound ${soundName}:`, error);
      throw error;
    }
  }

  /**
   * Get sound asset by name
   */
  private getSoundAsset(soundName: string): any {
    const soundMap: { [key: string]: any } = {
      dice_roll: SOUNDS.DiceRoll,
      cheer: SOUNDS.Cheer,
      collide: SOUNDS.Collide,
      game_start: SOUNDS.GameStart,
      sound_girl1: SOUNDS.Girl1,
      sound_girl2: SOUNDS.Girl2,
      sound_girl3: SOUNDS.Girl3,
      sound_girl4: SOUNDS.Girl4,
      home: SOUNDS.Home,
      home_win: SOUNDS.HomeWin,
      pile_move: SOUNDS.PileMove,
      safe_spot: SOUNDS.SafeSpot,
      ui: SOUNDS.UI,
    };

    return soundMap[soundName];
  }

  /**
   * Play a sound effect
   */
  async playSound(
    soundName: string,
    options: {
      volume?: number;
      rate?: number;
      loop?: boolean;
      priority?: number;
      interrupt?: boolean;
    } = {}
  ): Promise<void> {
    if (!this.isEnabled) return;

    try {
      const {
        volume = 1.0,
        rate = 1.0,
        loop = false,
        priority = 1,
        interrupt = false
      } = options;

      // Add to queue if not interrupting
      if (!interrupt && this.isProcessingQueue) {
        this.soundQueue.push({ soundName, priority });
        this.soundQueue.sort((a, b) => b.priority - a.priority);
        return;
      }

      this.isProcessingQueue = true;

      const sound = await this.loadSound(soundName);
      
      // Stop current playback if interrupting
      if (interrupt) {
        await sound.stopAsync();
      }

      // Set playback options
      await sound.setVolumeAsync(volume * this.sfxVolume * this.masterVolume);
      await sound.setRateAsync(rate, true);
      await sound.setIsLoopingAsync(loop);

      // Play the sound
      await sound.replayAsync();

      // Process queue after sound completes (if not looping)
      if (!loop) {
        sound.setOnPlaybackStatusUpdate((status) => {
          if (status.isLoaded && status.didJustFinish) {
            this.processNextInQueue();
          }
        });
      }

      console.log(`Playing sound: ${soundName}`);
    } catch (error) {
      console.error(`Error playing sound ${soundName}:`, error);
      this.isProcessingQueue = false;
    }
  }

  /**
   * Process next sound in queue
   */
  private async processNextInQueue(): Promise<void> {
    if (this.soundQueue.length === 0) {
      this.isProcessingQueue = false;
      return;
    }

    const nextSound = this.soundQueue.shift();
    if (nextSound) {
      await this.playSound(nextSound.soundName, { priority: nextSound.priority });
    }
  }

  /**
   * Play contextual game sounds
   */
  async playGameSound(context: string, data?: any): Promise<void> {
    switch (context) {
      case 'dice_roll':
        await this.playSound('dice_roll', { volume: 0.8 });
        break;

      case 'piece_move':
        await this.playSound('pile_move', { volume: 0.6, rate: 1.2 });
        break;

      case 'piece_capture':
        await this.playSound('collide', { volume: 0.9 });
        // Add dramatic pause then celebration
        setTimeout(() => {
          this.playSound('cheer', { volume: 0.7 });
        }, 500);
        break;

      case 'piece_safe':
        await this.playSound('safe_spot', { volume: 0.7 });
        break;

      case 'piece_home':
        await this.playSound('home_win', { volume: 0.8 });
        break;

      case 'game_start':
        await this.playSound('game_start', { volume: 0.9 });
        break;

      case 'game_win':
        await this.playSound('cheer', { volume: 1.0 });
        // Play victory fanfare
        setTimeout(() => {
          this.playRandomVictorySound();
        }, 1000);
        break;

      case 'ui_click':
        await this.playSound('ui', { volume: 0.5, rate: 1.5 });
        break;

      case 'turn_change':
        await this.playSound('ui', { volume: 0.4, rate: 0.8 });
        break;

      case 'invalid_move':
        // Play error sound (could be a short buzz)
        await this.playSound('ui', { volume: 0.3, rate: 0.5 });
        break;

      case 'achievement_unlock':
        await this.playSound('cheer', { volume: 0.8, rate: 1.3 });
        break;

      case 'countdown':
        await this.playSound('ui', { volume: 0.6, rate: 2.0 });
        break;

      default:
        console.warn(`Unknown game sound context: ${context}`);
    }
  }

  /**
   * Play random victory sound
   */
  private async playRandomVictorySound(): Promise<void> {
    const victorySounds = ['sound_girl1', 'sound_girl2', 'sound_girl3', 'sound_girl4'];
    const randomSound = victorySounds[Math.floor(Math.random() * victorySounds.length)];
    await this.playSound(randomSound, { volume: 0.8 });
  }

  /**
   * Play background music
   */
  async playBackgroundMusic(musicName: string, loop: boolean = true): Promise<void> {
    try {
      // Stop current background music
      if (this.currentBackgroundMusic) {
        await this.currentBackgroundMusic.stopAsync();
        await this.currentBackgroundMusic.unloadAsync();
      }

      // Load and play new music
      const musicAsset = this.getSoundAsset(musicName);
      if (!musicAsset) return;

      const { sound } = await Audio.Sound.createAsync(musicAsset, {
        shouldPlay: true,
        volume: this.musicVolume * this.masterVolume,
        isLooping: loop,
      });

      this.currentBackgroundMusic = sound;
      console.log(`Playing background music: ${musicName}`);
    } catch (error) {
      console.error(`Error playing background music ${musicName}:`, error);
    }
  }

  /**
   * Stop background music
   */
  async stopBackgroundMusic(): Promise<void> {
    if (this.currentBackgroundMusic) {
      try {
        await this.currentBackgroundMusic.stopAsync();
        await this.currentBackgroundMusic.unloadAsync();
        this.currentBackgroundMusic = null;
        console.log('Background music stopped');
      } catch (error) {
        console.error('Error stopping background music:', error);
      }
    }
  }

  /**
   * Pause all sounds
   */
  async pauseAllSounds(): Promise<void> {
    try {
      for (const [name, sound] of this.soundObjects) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && status.isPlaying) {
          await sound.pauseAsync();
        }
      }

      if (this.currentBackgroundMusic) {
        await this.currentBackgroundMusic.pauseAsync();
      }

      console.log('All sounds paused');
    } catch (error) {
      console.error('Error pausing sounds:', error);
    }
  }

  /**
   * Resume all sounds
   */
  async resumeAllSounds(): Promise<void> {
    try {
      for (const [name, sound] of this.soundObjects) {
        const status = await sound.getStatusAsync();
        if (status.isLoaded && !status.isPlaying) {
          await sound.playAsync();
        }
      }

      if (this.currentBackgroundMusic) {
        await this.currentBackgroundMusic.playAsync();
      }

      console.log('All sounds resumed');
    } catch (error) {
      console.error('Error resuming sounds:', error);
    }
  }

  /**
   * Stop all sounds
   */
  async stopAllSounds(): Promise<void> {
    try {
      for (const [name, sound] of this.soundObjects) {
        await sound.stopAsync();
      }

      await this.stopBackgroundMusic();
      this.soundQueue = [];
      this.isProcessingQueue = false;

      console.log('All sounds stopped');
    } catch (error) {
      console.error('Error stopping sounds:', error);
    }
  }

  /**
   * Set master volume
   */
  async setMasterVolume(volume: number): Promise<void> {
    this.masterVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveSoundPreferences();
  }

  /**
   * Set SFX volume
   */
  async setSFXVolume(volume: number): Promise<void> {
    this.sfxVolume = Math.max(0, Math.min(1, volume));
    await this.updateAllVolumes();
    await this.saveSoundPreferences();
  }

  /**
   * Set music volume
   */
  async setMusicVolume(volume: number): Promise<void> {
    this.musicVolume = Math.max(0, Math.min(1, volume));
    
    if (this.currentBackgroundMusic) {
      await this.currentBackgroundMusic.setVolumeAsync(this.musicVolume * this.masterVolume);
    }
    
    await this.saveSoundPreferences();
  }

  /**
   * Update volumes for all loaded sounds
   */
  private async updateAllVolumes(): Promise<void> {
    try {
      for (const [name, sound] of this.soundObjects) {
        await sound.setVolumeAsync(this.sfxVolume * this.masterVolume);
      }

      if (this.currentBackgroundMusic) {
        await this.currentBackgroundMusic.setVolumeAsync(this.musicVolume * this.masterVolume);
      }
    } catch (error) {
      console.error('Error updating volumes:', error);
    }
  }

  /**
   * Enable/disable sounds
   */
  async setSoundEnabled(enabled: boolean): Promise<void> {
    this.isEnabled = enabled;
    
    if (!enabled) {
      await this.stopAllSounds();
    }
    
    await this.saveSoundPreferences();
  }

  /**
   * Get current sound settings
   */
  getSoundSettings(): {
    isEnabled: boolean;
    masterVolume: number;
    sfxVolume: number;
    musicVolume: number;
  } {
    return {
      isEnabled: this.isEnabled,
      masterVolume: this.masterVolume,
      sfxVolume: this.sfxVolume,
      musicVolume: this.musicVolume,
    };
  }

  /**
   * Load sound preferences from storage
   */
  private async loadSoundPreferences(): Promise<void> {
    try {
      const preferences = await AsyncStorage.getItem('sound_preferences');
      if (preferences) {
        const parsed = JSON.parse(preferences);
        this.isEnabled = parsed.isEnabled ?? true;
        this.masterVolume = parsed.masterVolume ?? 1.0;
        this.sfxVolume = parsed.sfxVolume ?? 1.0;
        this.musicVolume = parsed.musicVolume ?? 0.7;
      }
    } catch (error) {
      console.error('Error loading sound preferences:', error);
    }
  }

  /**
   * Save sound preferences to storage
   */
  private async saveSoundPreferences(): Promise<void> {
    try {
      const preferences = {
        isEnabled: this.isEnabled,
        masterVolume: this.masterVolume,
        sfxVolume: this.sfxVolume,
        musicVolume: this.musicVolume,
      };
      
      await AsyncStorage.setItem('sound_preferences', JSON.stringify(preferences));
    } catch (error) {
      console.error('Error saving sound preferences:', error);
    }
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    try {
      await this.stopAllSounds();
      
      for (const [name, sound] of this.soundObjects) {
        await sound.unloadAsync();
      }
      
      this.soundObjects.clear();
      this.soundQueue = [];
      this.isProcessingQueue = false;
      
      console.log('Sound service cleaned up');
    } catch (error) {
      console.error('Error cleaning up sound service:', error);
    }
  }
}

// Export singleton instance
export const soundService = SoundService.getInstance();
export default soundService;