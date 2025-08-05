/**
 * Game Integration Service for Ludo Game
 * Coordinates all game services and provides unified game management
 */

import { soundService } from './soundService';
import { animationService } from './animationService';
import { gameSettingsService } from './gameSettingsService';
import { errorHandlingService } from './errorHandlingService';
import { multiplayerService } from '../../src/services/multiplayerService';
import { aiPlayerService } from '../../src/services/aiPlayerService';
import { statisticsService } from '../../src/services/statisticsService';
import { tournamentService } from '../../src/services/tournamentService';
import { enhancedGameLogic } from '../../src/services/enhancedGameLogic';

export interface GameSession {
  id: string;
  type: 'single' | 'multiplayer' | 'tournament';
  players: Array<{
    id: string;
    name: string;
    isAI: boolean;
    isLocal: boolean;
  }>;
  gameState: any;
  startTime: number;
  settings: any;
}

export class GameIntegrationService {
  private static instance: GameIntegrationService;
  private currentSession: GameSession | null = null;
  private isInitialized = false;
  private initializationPromise: Promise<void> | null = null;

  static getInstance(): GameIntegrationService {
    if (!GameIntegrationService.instance) {
      GameIntegrationService.instance = new GameIntegrationService();
    }
    return GameIntegrationService.instance;
  }

  /**
   * Initialize all game services
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (this.initializationPromise) return this.initializationPromise;

    this.initializationPromise = this.performInitialization();
    await this.initializationPromise;
  }

  private async performInitialization(): Promise<void> {
    try {
      errorHandlingService.showLoading('game_init', 'Initializing game services...');

      // Initialize core services in order
      await errorHandlingService.initialize();
      errorHandlingService.updateLoadingProgress('game_init', 0.1, 'Error handling initialized');

      await gameSettingsService.initialize();
      errorHandlingService.updateLoadingProgress('game_init', 0.2, 'Settings loaded');

      await soundService.initialize();
      errorHandlingService.updateLoadingProgress('game_init', 0.4, 'Audio system ready');

      await multiplayerService.initialize();
      errorHandlingService.updateLoadingProgress('game_init', 0.6, 'Multiplayer service ready');

      errorHandlingService.updateLoadingProgress('game_init', 0.8, 'Finalizing initialization');

      // Set up service integrations
      this.setupServiceIntegrations();

      errorHandlingService.updateLoadingProgress('game_init', 1.0, 'Game ready!');
      
      setTimeout(() => {
        errorHandlingService.hideLoading('game_init');
      }, 500);

      this.isInitialized = true;
      console.log('🎮 Game Integration Service initialized successfully');

    } catch (error) {
      errorHandlingService.hideLoading('game_init');
      await errorHandlingService.handleError({
        type: 'error',
        category: 'system',
        message: 'Failed to initialize game services',
        details: error,
        showToUser: true,
        userMessage: 'Failed to initialize the game. Please restart the app.'
      });
      throw error;
    }
  }

  /**
   * Set up integrations between services
   */
  private setupServiceIntegrations(): void {
    // Subscribe to settings changes to update other services
    gameSettingsService.subscribe((settings) => {
      // Update sound service when audio settings change
      soundService.setSoundEnabled(settings.soundEnabled);
      soundService.setMasterVolume(settings.masterVolume);
      soundService.setSFXVolume(settings.sfxVolume);
      soundService.setMusicVolume(settings.musicVolume);
    });

    // Subscribe to errors for game-specific handling
    errorHandlingService.subscribeToErrors((error) => {
      if (error.category === 'game' && this.currentSession) {
        this.handleGameError(error);
      }
    });
  }

  /**
   * Start a new single-player game
   */
  async startSinglePlayerGame(options: {
    playerCount: number;
    aiDifficulty: 'easy' | 'medium' | 'hard';
    gameSettings?: any;
  }): Promise<GameSession> {
    try {
      errorHandlingService.showLoading('start_game', 'Starting single-player game...');

      const settings = gameSettingsService.getSettings();
      
      // Initialize game logic
      const gameState = enhancedGameLogic.initializeGame({
        playerCount: options.playerCount,
        gameMode: 'single',
        aiDifficulty: options.aiDifficulty,
        ...options.gameSettings
      });

      // Create game session
      const session: GameSession = {
        id: `single_${Date.now()}`,
        type: 'single',
        players: gameState.players.map((player: any, index: number) => ({
          id: player.id,
          name: index === 0 ? 'You' : `AI Player ${index}`,
          isAI: index > 0,
          isLocal: true
        })),
        gameState,
        startTime: Date.now(),
        settings: { ...settings, ...options.gameSettings }
      };

      this.currentSession = session;

      // Record game start
      await statisticsService.recordGameStart(session.id, 'single', options.playerCount);

      // Play game start sound
      await soundService.playGameSound('game_start');

      errorHandlingService.hideLoading('start_game');

      console.log('🎮 Single-player game started:', session.id);
      return session;

    } catch (error) {
      errorHandlingService.hideLoading('start_game');
      await errorHandlingService.handleGameError(error, undefined, 'starting single-player game');
      throw error;
    }
  }

  /**
   * Start a multiplayer game
   */
  async startMultiplayerGame(options: {
    maxPlayers: number;
    isPrivate?: boolean;
    gameSettings?: any;
  }): Promise<{ session: GameSession; roomId: string }> {
    try {
      errorHandlingService.showLoading('start_multiplayer', 'Creating multiplayer room...');

      const settings = gameSettingsService.getSettings();
      
      // Create multiplayer room
      const roomResult = await multiplayerService.createGameRoom('current_user', {
        maxPlayers: options.maxPlayers,
        isPrivate: options.isPrivate || false,
        gameMode: 'multiplayer',
        ...options.gameSettings
      });

      // Create game session
      const session: GameSession = {
        id: `multiplayer_${roomResult.roomId}`,
        type: 'multiplayer',
        players: roomResult.gameRoom.players.map((player: any) => ({
          id: player.userId,
          name: player.userName,
          isAI: false,
          isLocal: player.userId === 'current_user'
        })),
        gameState: null, // Will be set when game starts
        startTime: Date.now(),
        settings: { ...settings, ...options.gameSettings }
      };

      this.currentSession = session;

      errorHandlingService.hideLoading('start_multiplayer');

      console.log('🎮 Multiplayer game room created:', roomResult.roomId);
      return { session, roomId: roomResult.roomId };

    } catch (error) {
      errorHandlingService.hideLoading('start_multiplayer');
      await errorHandlingService.handleGameError(error, undefined, 'starting multiplayer game');
      throw error;
    }
  }

  /**
   * Join a multiplayer game
   */
  async joinMultiplayerGame(roomId: string, playerName: string): Promise<GameSession> {
    try {
      errorHandlingService.showLoading('join_game', 'Joining multiplayer game...');

      // Join the room
      const result = await multiplayerService.joinGameRoom('current_user', roomId, playerName);

      // Create game session
      const session: GameSession = {
        id: `multiplayer_${roomId}`,
        type: 'multiplayer',
        players: result.gameRoom.players.map((player: any) => ({
          id: player.userId,
          name: player.userName,
          isAI: false,
          isLocal: player.userId === 'current_user'
        })),
        gameState: result.gameRoom.gameState,
        startTime: Date.now(),
        settings: gameSettingsService.getSettings()
      };

      this.currentSession = session;

      errorHandlingService.hideLoading('join_game');

      console.log('🎮 Joined multiplayer game:', roomId);
      return session;

    } catch (error) {
      errorHandlingService.hideLoading('join_game');
      await errorHandlingService.handleGameError(error, roomId, 'joining multiplayer game');
      throw error;
    }
  }

  /**
   * Make a game move
   */
  async makeMove(pieceId: string, targetPosition: number): Promise<any> {
    if (!this.currentSession) {
      throw new Error('No active game session');
    }

    try {
      let moveResult;

      if (this.currentSession.type === 'single') {
        // Handle single-player move
        moveResult = enhancedGameLogic.makeMove(
          this.getCurrentPlayerId(),
          pieceId,
          targetPosition
        );

        // Play move sound
        await soundService.playGameSound('piece_move');

        // Handle AI turns
        if (!moveResult.gameEnded) {
          await this.handleAITurns();
        }

      } else if (this.currentSession.type === 'multiplayer') {
        // Handle multiplayer move
        moveResult = await multiplayerService.sendMove(
          'current_user',
          this.currentSession.id.replace('multiplayer_', ''),
          { pieceId, targetPosition }
        );

        // Play move sound
        await soundService.playGameSound('piece_move');
      }

      // Handle special move types
      if (moveResult && typeof moveResult === 'object' && 'moveResult' in moveResult) {
        const result = moveResult.moveResult as any;
        if (result?.captured) {
          await soundService.playGameSound('piece_capture');
        }
        if (result?.reachedHome) {
          await soundService.playGameSound('piece_home');
        }
      }

      // Check for game end
      if (moveResult && typeof moveResult === 'object' && 'gameEnded' in moveResult) {
        const result = moveResult as any;
        if (result.gameEnded) {
          await this.handleGameEnd(result.winner);
        }
      }

      return moveResult;

    } catch (error) {
      await errorHandlingService.handleGameError(error, this.currentSession.id, 'making move');
      throw error;
    }
  }

  /**
   * Handle AI turns in single-player mode
   */
  private async handleAITurns(): Promise<void> {
    if (!this.currentSession || this.currentSession.type !== 'single') return;

    const gameState = enhancedGameLogic.getGameState();
    if (!gameState?.players || typeof gameState.currentPlayerIndex !== 'number') return;
    
    const currentPlayer = gameState.players[gameState.currentPlayerIndex];

    if (currentPlayer.isAI) {
      const settings = gameSettingsService.getSettings();
      
      try {
        const aiMove = await aiPlayerService.makeAIMove(
          gameState,
          currentPlayer.id,
          settings.aiDifficulty
        );

        if (aiMove.action === 'move') {
          // Execute AI move
          const moveResult = enhancedGameLogic.makeMove(
            currentPlayer.id,
            aiMove.move.pieceId,
            aiMove.move.toPosition
          );

          // Play appropriate sounds
          await soundService.playGameSound('piece_move');

          if (moveResult.moveResult?.captured) {
            await soundService.playGameSound('piece_capture');
          }

          // Check for game end
          if (moveResult.gameEnded) {
            await this.handleGameEnd(moveResult.winner);
            return;
          }

          // Continue with next AI turn if needed
          await this.handleAITurns();
        }

      } catch (error) {
        await errorHandlingService.handleError({
          type: 'error',
          category: 'game',
          message: 'AI move failed',
          details: error,
          gameId: this.currentSession.id
        });
      }
    }
  }

  /**
   * Handle game end
   */
  private async handleGameEnd(winnerId: string): Promise<void> {
    if (!this.currentSession) return;

    try {
      const isPlayerWinner = this.currentSession.players.find(p => p.id === winnerId)?.isLocal;

      // Play victory/defeat sound
      if (isPlayerWinner) {
        await soundService.playGameSound('game_win');
      }

      // Record game end
      const gameResult = {
        winner: winnerId,
        duration: Date.now() - this.currentSession.startTime,
        players: this.currentSession.players
      };

      await statisticsService.recordGameEnd(this.currentSession.id, gameResult);

      console.log('🎮 Game ended:', this.currentSession.id, 'Winner:', winnerId);

    } catch (error) {
      await errorHandlingService.handleError({
        type: 'error',
        category: 'game',
        message: 'Error handling game end',
        details: error,
        gameId: this.currentSession.id
      });
    }
  }

  /**
   * Handle game-specific errors
   */
  private async handleGameError(error: any): Promise<void> {
    if (!this.currentSession) return;

    // Implement game-specific error recovery
    console.log('🎮 Handling game error for session:', this.currentSession.id);
  }

  /**
   * Get current player ID
   */
  private getCurrentPlayerId(): string {
    if (!this.currentSession) return '';
    
    const localPlayer = this.currentSession.players.find(p => p.isLocal);
    return localPlayer?.id || '';
  }

  /**
   * Get current game session
   */
  getCurrentSession(): GameSession | null {
    return this.currentSession;
  }

  /**
   * End current game session
   */
  async endCurrentSession(): Promise<void> {
    if (!this.currentSession) return;

    try {
      if (this.currentSession.type === 'multiplayer') {
        // Leave multiplayer room
        await multiplayerService.leaveGameRoom(
          'current_user',
          this.currentSession.id.replace('multiplayer_', '')
        );
      }

      // Clean up session
      this.currentSession = null;

      console.log('🎮 Game session ended');

    } catch (error) {
      await errorHandlingService.handleError({
        type: 'error',
        category: 'game',
        message: 'Error ending game session',
        details: error
      });
    }
  }

  /**
   * Get game statistics
   */
  async getGameStatistics(): Promise<any> {
    try {
      return await statisticsService.getUserStatistics('current_user');
    } catch (error) {
      await errorHandlingService.handleError({
        type: 'error',
        category: 'system',
        message: 'Error getting game statistics',
        details: error
      });
      return null;
    }
  }

  /**
   * Test all services integration
   */
  async runIntegrationTest(): Promise<boolean> {
    try {
      console.log('🧪 Running integration test...');

      // Test error handling
      await errorHandlingService.handleError({
        type: 'info',
        category: 'system',
        message: 'Integration test started'
      });

      // Test settings
      const settings = gameSettingsService.getSettings();
      console.log('✅ Settings service working');

      // Test sound
      await soundService.playGameSound('ui_click');
      console.log('✅ Sound service working');

      // Test statistics
      const stats = await statisticsService.getUserStatistics('test_user');
      console.log('✅ Statistics service working');

      // Test game logic
      const gameState = enhancedGameLogic.initializeGame({
        playerCount: 2,
        gameMode: 'single'
      });
      console.log('✅ Game logic working');

      console.log('🎉 All services integration test passed!');
      return true;

    } catch (error) {
      console.error('❌ Integration test failed:', error);
      await errorHandlingService.handleError({
        type: 'error',
        category: 'system',
        message: 'Integration test failed',
        details: error
      });
      return false;
    }
  }

  /**
   * Clean up all services
   */
  async cleanup(): Promise<void> {
    try {
      await this.endCurrentSession();
      
      soundService.cleanup();
      animationService.stopAllAnimations();
      gameSettingsService.cleanup();
      errorHandlingService.cleanup();
      multiplayerService.cleanup();

      this.isInitialized = false;
      this.initializationPromise = null;

      console.log('🎮 Game Integration Service cleaned up');

    } catch (error) {
      console.error('Error during cleanup:', error);
    }
  }
}

// Export singleton instance
export const gameIntegrationService = GameIntegrationService.getInstance();
export default gameIntegrationService;