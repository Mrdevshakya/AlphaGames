import { firebaseService } from './firebaseService';
import { enhancedGameLogic } from './enhancedGameLogic';

/**
 * Enhanced Multiplayer Service for Ludo Game
 * Provides real-time multiplayer functionality with Firebase integration
 */

export class MultiplayerService {
  constructor() {
    this.activeGames = new Map();
    this.gameSubscriptions = new Map();
    this.playerSubscriptions = new Map();
    this.connectionStatus = 'disconnected';
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
  }

  /**
   * Initialize multiplayer service
   */
  async initialize() {
    try {
      // Set up connection monitoring
      this.setupConnectionMonitoring();
      this.connectionStatus = 'connected';
      console.log('Multiplayer service initialized');
      return { success: true };
    } catch (error) {
      console.error('Failed to initialize multiplayer service:', error);
      throw error;
    }
  }

  /**
   * Create a new multiplayer game room
   */
  async createGameRoom(hostId, gameSettings) {
    try {
      const roomId = `room_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      const gameRoom = {
        id: roomId,
        hostId,
        players: [{
          userId: hostId,
          userName: gameSettings.hostName || 'Host',
          isReady: false,
          color: null,
          isHost: true,
          joinedAt: new Date().toISOString()
        }],
        gameSettings: {
          maxPlayers: gameSettings.maxPlayers || 4,
          gameMode: gameSettings.gameMode || 'multiplayer',
          isPrivate: gameSettings.isPrivate || false,
          allowSpectators: gameSettings.allowSpectators || false,
          timeLimit: gameSettings.timeLimit || 30, // seconds per turn
          ...gameSettings
        },
        status: 'waiting',
        createdAt: new Date().toISOString(),
        gameState: null,
        lastActivity: new Date().toISOString()
      };

      // Save to Firebase
      await firebaseService.createGame(gameRoom);
      
      // Store locally
      this.activeGames.set(roomId, gameRoom);
      
      // Set up real-time updates
      this.subscribeToGameRoom(roomId);

      console.log(`Game room created: ${roomId}`);
      return { success: true, roomId, gameRoom };
    } catch (error) {
      console.error('Error creating game room:', error);
      throw error;
    }
  }

  /**
   * Join an existing game room
   */
  async joinGameRoom(playerId, roomId, playerName) {
    try {
      const gameRoom = this.activeGames.get(roomId);
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      if (gameRoom.status !== 'waiting') {
        throw new Error('Game room is not accepting new players');
      }

      if (gameRoom.players.length >= gameRoom.gameSettings.maxPlayers) {
        throw new Error('Game room is full');
      }

      // Check if player is already in the room
      const existingPlayer = gameRoom.players.find(p => p.userId === playerId);
      if (existingPlayer) {
        return { success: true, roomId, gameRoom, message: 'Already in room' };
      }

      // Add player to room
      const newPlayer = {
        userId: playerId,
        userName: playerName,
        isReady: false,
        color: this.assignPlayerColor(gameRoom.players),
        isHost: false,
        joinedAt: new Date().toISOString()
      };

      gameRoom.players.push(newPlayer);
      gameRoom.lastActivity = new Date().toISOString();

      // Update Firebase
      await this.updateGameRoom(roomId, gameRoom);

      // Notify other players
      this.broadcastToRoom(roomId, {
        type: 'player_joined',
        player: newPlayer,
        timestamp: new Date().toISOString()
      });

      console.log(`Player ${playerId} joined room ${roomId}`);
      return { success: true, roomId, gameRoom };
    } catch (error) {
      console.error('Error joining game room:', error);
      throw error;
    }
  }

  /**
   * Leave a game room
   */
  async leaveGameRoom(playerId, roomId) {
    try {
      const gameRoom = this.activeGames.get(roomId);
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      // Remove player from room
      gameRoom.players = gameRoom.players.filter(p => p.userId !== playerId);
      gameRoom.lastActivity = new Date().toISOString();

      // If host left, assign new host
      if (gameRoom.hostId === playerId && gameRoom.players.length > 0) {
        const newHost = gameRoom.players[0];
        newHost.isHost = true;
        gameRoom.hostId = newHost.userId;
      }

      // If no players left, delete room
      if (gameRoom.players.length === 0) {
        await this.deleteGameRoom(roomId);
        return { success: true, roomDeleted: true };
      }

      // Update Firebase
      await this.updateGameRoom(roomId, gameRoom);

      // Notify other players
      this.broadcastToRoom(roomId, {
        type: 'player_left',
        playerId,
        newHost: gameRoom.hostId,
        timestamp: new Date().toISOString()
      });

      console.log(`Player ${playerId} left room ${roomId}`);
      return { success: true };
    } catch (error) {
      console.error('Error leaving game room:', error);
      throw error;
    }
  }

  /**
   * Start a multiplayer game
   */
  async startGame(hostId, roomId) {
    try {
      const gameRoom = this.activeGames.get(roomId);
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      if (gameRoom.hostId !== hostId) {
        throw new Error('Only host can start the game');
      }

      // Check if all players are ready
      const unreadyPlayers = gameRoom.players.filter(p => !p.isReady);
      if (unreadyPlayers.length > 0) {
        throw new Error('Not all players are ready');
      }

      if (gameRoom.players.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      // Initialize game state
      const gameState = enhancedGameLogic.initializeGame({
        playerCount: gameRoom.players.length,
        playerNames: gameRoom.players.map(p => p.userName),
        gameMode: 'multiplayer'
      });

      // Assign colors to players
      gameRoom.players.forEach((player, index) => {
        if (gameState.players[index]) {
          gameState.players[index].userId = player.userId;
          gameState.players[index].userName = player.userName;
          player.color = gameState.players[index].color;
        }
      });

      gameRoom.status = 'active';
      gameRoom.gameState = gameState;
      gameRoom.startedAt = new Date().toISOString();
      gameRoom.lastActivity = new Date().toISOString();

      // Update Firebase
      await this.updateGameRoom(roomId, gameRoom);

      // Notify all players
      this.broadcastToRoom(roomId, {
        type: 'game_started',
        gameState,
        timestamp: new Date().toISOString()
      });

      console.log(`Game started in room ${roomId}`);
      return { success: true, gameState };
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  /**
   * Send a move to other players
   */
  async sendMove(playerId, roomId, moveData) {
    try {
      const gameRoom = this.activeGames.get(roomId);
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      if (gameRoom.status !== 'active') {
        throw new Error('Game is not active');
      }

      // Validate move
      const currentPlayer = gameRoom.gameState.players[gameRoom.gameState.currentPlayerIndex];
      if (currentPlayer.userId !== playerId) {
        throw new Error('Not your turn');
      }

      // Process move through game logic
      const moveResult = enhancedGameLogic.makeMove(
        currentPlayer.id,
        moveData.pieceId,
        moveData.targetPosition
      );

      // Update game room state
      gameRoom.gameState = enhancedGameLogic.getGameState();
      gameRoom.lastActivity = new Date().toISOString();

      // Check for game end
      if (moveResult.gameEnded) {
        gameRoom.status = 'finished';
        gameRoom.finishedAt = new Date().toISOString();
        gameRoom.winner = moveResult.winner;
      }

      // Update Firebase
      await this.updateGameRoom(roomId, gameRoom);

      // Broadcast move to all players
      this.broadcastToRoom(roomId, {
        type: 'move_made',
        playerId,
        moveData,
        moveResult,
        gameState: gameRoom.gameState,
        timestamp: new Date().toISOString()
      });

      console.log(`Move sent by ${playerId} in room ${roomId}`);
      return { success: true, moveResult };
    } catch (error) {
      console.error('Error sending move:', error);
      throw error;
    }
  }

  /**
   * Set player ready status
   */
  async setPlayerReady(playerId, roomId, isReady) {
    try {
      const gameRoom = this.activeGames.get(roomId);
      if (!gameRoom) {
        throw new Error('Game room not found');
      }

      const player = gameRoom.players.find(p => p.userId === playerId);
      if (!player) {
        throw new Error('Player not found in room');
      }

      player.isReady = isReady;
      gameRoom.lastActivity = new Date().toISOString();

      // Update Firebase
      await this.updateGameRoom(roomId, gameRoom);

      // Notify other players
      this.broadcastToRoom(roomId, {
        type: 'player_ready_changed',
        playerId,
        isReady,
        timestamp: new Date().toISOString()
      });

      return { success: true };
    } catch (error) {
      console.error('Error setting player ready:', error);
      throw error;
    }
  }

  /**
   * Subscribe to game room updates
   */
  subscribeToGameRoom(roomId, callback) {
    try {
      // Unsubscribe from existing subscription
      this.unsubscribeFromGameRoom(roomId);

      // Set up new subscription (mock implementation)
      const subscription = {
        unsubscribe: () => {
          console.log(`Unsubscribed from room ${roomId}`);
        }
      };

      this.gameSubscriptions.set(roomId, subscription);

      // Simulate real-time updates (in production, this would be Firebase listeners)
      const interval = setInterval(() => {
        const gameRoom = this.activeGames.get(roomId);
        if (gameRoom && callback) {
          callback({
            type: 'room_update',
            gameRoom,
            timestamp: new Date().toISOString()
          });
        }
      }, 1000);

      subscription.interval = interval;

      console.log(`Subscribed to room updates: ${roomId}`);
      return subscription;
    } catch (error) {
      console.error('Error subscribing to game room:', error);
      throw error;
    }
  }

  /**
   * Unsubscribe from game room updates
   */
  unsubscribeFromGameRoom(roomId) {
    const subscription = this.gameSubscriptions.get(roomId);
    if (subscription) {
      if (subscription.interval) {
        clearInterval(subscription.interval);
      }
      subscription.unsubscribe();
      this.gameSubscriptions.delete(roomId);
    }
  }

  /**
   * Get list of available game rooms
   */
  async getAvailableRooms() {
    try {
      // In production, this would query Firebase
      const availableRooms = Array.from(this.activeGames.values())
        .filter(room => room.status === 'waiting' && !room.gameSettings.isPrivate)
        .map(room => ({
          id: room.id,
          hostName: room.players.find(p => p.isHost)?.userName || 'Unknown',
          playerCount: room.players.length,
          maxPlayers: room.gameSettings.maxPlayers,
          createdAt: room.createdAt,
          gameSettings: room.gameSettings
        }));

      return availableRooms;
    } catch (error) {
      console.error('Error getting available rooms:', error);
      throw error;
    }
  }

  /**
   * Utility methods
   */
  assignPlayerColor(existingPlayers) {
    const colors = ['red', 'green', 'yellow', 'blue'];
    const usedColors = existingPlayers.map(p => p.color).filter(Boolean);
    return colors.find(color => !usedColors.includes(color)) || colors[0];
  }

  async updateGameRoom(roomId, gameRoom) {
    try {
      // Update local storage
      this.activeGames.set(roomId, gameRoom);
      
      // Update Firebase (mock implementation)
      console.log(`Updated game room ${roomId} in Firebase`);
    } catch (error) {
      console.error('Error updating game room:', error);
      throw error;
    }
  }

  async deleteGameRoom(roomId) {
    try {
      // Remove from local storage
      this.activeGames.delete(roomId);
      
      // Unsubscribe from updates
      this.unsubscribeFromGameRoom(roomId);
      
      // Delete from Firebase (mock implementation)
      console.log(`Deleted game room ${roomId} from Firebase`);
    } catch (error) {
      console.error('Error deleting game room:', error);
      throw error;
    }
  }

  broadcastToRoom(roomId, message) {
    // In production, this would send to all connected clients
    console.log(`Broadcasting to room ${roomId}:`, message);
  }

  setupConnectionMonitoring() {
    // Monitor connection status and handle reconnection
    setInterval(() => {
      if (this.connectionStatus === 'disconnected' && this.reconnectAttempts < this.maxReconnectAttempts) {
        this.attemptReconnection();
      }
    }, 5000);
  }

  async attemptReconnection() {
    try {
      this.reconnectAttempts++;
      console.log(`Attempting reconnection (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
      
      // Attempt to reconnect
      await this.initialize();
      this.reconnectAttempts = 0;
      
      console.log('Reconnection successful');
    } catch (error) {
      console.error('Reconnection failed:', error);
    }
  }

  /**
   * Clean up resources
   */
  cleanup() {
    // Unsubscribe from all game rooms
    this.gameSubscriptions.forEach((subscription, roomId) => {
      this.unsubscribeFromGameRoom(roomId);
    });

    // Clear active games
    this.activeGames.clear();
    
    console.log('Multiplayer service cleaned up');
  }
}

// Export singleton instance
export const multiplayerService = new MultiplayerService();
export default multiplayerService;