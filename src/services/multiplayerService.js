import { firebaseService } from './firebaseService';
import { ludoGame } from './gameLogic';
import { notificationService } from './notificationService';

class MultiplayerService {
  constructor() {
    this.currentGameId = null;
    this.currentRoomCode = null;
    this.gameStateListener = null;
    this.roomListener = null;
    this.playerId = null;
  }

  // Initialize multiplayer service
  async initialize(userId) {
    this.playerId = userId;
    return true;
  }

  // Create a multiplayer room
  async createRoom(roomSettings, hostId) {
    try {
      const roomCode = firebaseService.generateRoomCode();
      const gameId = firebaseService.generateGameId();

      const roomData = {
        ...roomSettings,
        roomCode,
        gameId,
        hostId,
        players: [hostId],
        status: 'waiting', // waiting, playing, finished
        createdAt: Date.now(),
        maxPlayers: roomSettings.maxPlayers || 4,
        currentPlayers: 1,
      };

      await firebaseService.createGameRoom(roomCode, roomData);
      
      this.currentRoomCode = roomCode;
      this.currentGameId = gameId;

      return { roomCode, gameId };
    } catch (error) {
      console.error('Error creating room:', error);
      throw error;
    }
  }

  // Join a multiplayer room
  async joinRoom(roomCode, playerId) {
    try {
      const roomData = await firebaseService.getGameRoom(roomCode);
      
      if (!roomData) {
        throw new Error('Room not found');
      }

      if (roomData.status !== 'waiting') {
        throw new Error('Game already started');
      }

      if (roomData.players.length >= roomData.maxPlayers) {
        throw new Error('Room is full');
      }

      if (roomData.players.includes(playerId)) {
        throw new Error('Already in room');
      }

      const updatedPlayers = [...roomData.players, playerId];
      
      await firebaseService.updateGameRoom(roomCode, {
        players: updatedPlayers,
        currentPlayers: updatedPlayers.length,
      });

      this.currentRoomCode = roomCode;
      this.currentGameId = roomData.gameId;

      // Notify other players
      await this.notifyRoomPlayers(roomCode, {
        type: 'player_joined',
        playerId,
        message: `Player ${playerId} joined the room`,
      });

      return roomData;
    } catch (error) {
      console.error('Error joining room:', error);
      throw error;
    }
  }

  // Leave a room
  async leaveRoom(roomCode, playerId) {
    try {
      const roomData = await firebaseService.getGameRoom(roomCode);
      
      if (!roomData) return;

      const updatedPlayers = roomData.players.filter(id => id !== playerId);
      
      if (updatedPlayers.length === 0) {
        // Delete room if empty
        await firebaseService.deleteGameRoom(roomCode);
      } else {
        // Update room
        let updates = {
          players: updatedPlayers,
          currentPlayers: updatedPlayers.length,
        };

        // If host left, assign new host
        if (roomData.hostId === playerId && updatedPlayers.length > 0) {
          updates.hostId = updatedPlayers[0];
        }

        await firebaseService.updateGameRoom(roomCode, updates);

        // Notify other players
        await this.notifyRoomPlayers(roomCode, {
          type: 'player_left',
          playerId,
          message: `Player ${playerId} left the room`,
        });
      }

      this.cleanup();
    } catch (error) {
      console.error('Error leaving room:', error);
      throw error;
    }
  }

  // Start a multiplayer game
  async startGame(roomCode, hostId) {
    try {
      const roomData = await firebaseService.getGameRoom(roomCode);
      
      if (!roomData) {
        throw new Error('Room not found');
      }

      if (roomData.hostId !== hostId) {
        throw new Error('Only host can start the game');
      }

      if (roomData.players.length < 2) {
        throw new Error('Need at least 2 players to start');
      }

      // Assign colors to players
      const playerColors = ['red', 'blue', 'green', 'yellow'];
      const gamePlayerColors = roomData.players.slice(0, 4).map((playerId, index) => ({
        playerId,
        color: playerColors[index],
      }));

      // Initialize game state
      const gameState = ludoGame.initializeGame(gamePlayerColors.map(p => p.color));
      gameState.playerMapping = gamePlayerColors.reduce((acc, p) => {
        acc[p.color] = p.playerId;
        return acc;
      }, {});
      gameState.roomCode = roomCode;

      // Create game in Firebase
      await firebaseService.createGameState(roomData.gameId, gameState);

      // Update room status
      await firebaseService.updateGameRoom(roomCode, {
        status: 'playing',
        gameStarted: Date.now(),
      });

      // Notify all players
      await this.notifyRoomPlayers(roomCode, {
        type: 'game_started',
        gameId: roomData.gameId,
        message: 'Game has started!',
      });

      return { gameId: roomData.gameId, gameState };
    } catch (error) {
      console.error('Error starting game:', error);
      throw error;
    }
  }

  // Make a move in multiplayer game
  async makeMove(gameId, playerId, move) {
    try {
      const gameState = await firebaseService.getGameState(gameId);
      
      if (!gameState) {
        throw new Error('Game not found');
      }

      if (gameState.gameStatus !== 'playing') {
        throw new Error('Game is not active');
      }

      // Verify it's player's turn
      const currentPlayerColor = gameState.players[gameState.currentPlayerIndex];
      const currentPlayerId = gameState.playerMapping[currentPlayerColor];
      
      if (currentPlayerId !== playerId) {
        throw new Error('Not your turn');
      }

      // Execute move using game logic
      const result = ludoGame.executeMove(gameState, currentPlayerColor, move);
      
      if (!result.success) {
        throw new Error('Invalid move');
      }

      // Update game state in Firebase
      await firebaseService.updateGameState(gameId, result.gameState);

      // Record the move
      await firebaseService.makeMove(gameId, {
        playerId,
        playerColor: currentPlayerColor,
        move,
        timestamp: Date.now(),
      });

      // Check for game end
      if (result.gameState.gameStatus === 'finished') {
        await this.handleGameEnd(gameId, result.gameState);
      }

      return result;
    } catch (error) {
      console.error('Error making move:', error);
      throw error;
    }
  }

  // Roll dice in multiplayer game
  async rollDice(gameId, playerId) {
    try {
      const gameState = await firebaseService.getGameState(gameId);
      
      if (!gameState) {
        throw new Error('Game not found');
      }

      // Verify it's player's turn
      const currentPlayerColor = gameState.players[gameState.currentPlayerIndex];
      const currentPlayerId = gameState.playerMapping[currentPlayerColor];
      
      if (currentPlayerId !== playerId) {
        throw new Error('Not your turn');
      }

      // Generate dice value
      const diceValue = Math.floor(Math.random() * 6) + 1;

      // Update game state
      await firebaseService.rollDice(gameId, playerId, diceValue);

      return diceValue;
    } catch (error) {
      console.error('Error rolling dice:', error);
      throw error;
    }
  }

  // Handle game end
  async handleGameEnd(gameId, gameState) {
    try {
      const winner = gameState.winner;
      const winnerId = gameState.playerMapping[winner];

      // Update room status
      if (this.currentRoomCode) {
        await firebaseService.updateGameRoom(this.currentRoomCode, {
          status: 'finished',
          winner: winnerId,
          gameEnded: Date.now(),
        });
      }

      // Notify all players
      await this.notifyGamePlayers(gameId, {
        type: 'game_ended',
        winner: winnerId,
        winnerColor: winner,
        message: `${winner.toUpperCase()} wins!`,
      });

      // Handle rewards/prizes if applicable
      await this.handleGameRewards(gameId, gameState);

    } catch (error) {
      console.error('Error handling game end:', error);
    }
  }

  // Handle game rewards
  async handleGameRewards(gameId, gameState) {
    try {
      const roomData = await firebaseService.getGameRoom(this.currentRoomCode);
      
      if (roomData && roomData.entryFee > 0) {
        const winner = gameState.winner;
        const winnerId = gameState.playerMapping[winner];
        const totalPrize = roomData.entryFee * roomData.players.length;
        const platformFee = totalPrize * 0.1; // 10% platform fee
        const winnerPrize = totalPrize - platformFee;

        // Credit winner's wallet
        await firebaseService.updateWalletBalance(
          winnerId,
          winnerPrize,
          'add',
          `Won game ${gameId}`
        );

        // Send notification
        await notificationService.notifyGameWin(winnerPrize);
      }
    } catch (error) {
      console.error('Error handling game rewards:', error);
    }
  }

  // Listen to game state changes
  listenToGameState(gameId, callback) {
    this.gameStateListener = firebaseService.onGameStateChange(gameId, (snapshot) => {
      const gameState = snapshot.val();
      if (gameState) {
        callback(gameState);
      }
    });
    return this.gameStateListener;
  }

  // Listen to room changes
  listenToRoom(roomCode, callback) {
    this.roomListener = firebaseService.onRoomChange(roomCode, (snapshot) => {
      const roomData = snapshot.val();
      if (roomData) {
        callback(roomData);
      }
    });
    return this.roomListener;
  }

  // Notify room players
  async notifyRoomPlayers(roomCode, notification) {
    try {
      const roomData = await firebaseService.getGameRoom(roomCode);
      if (roomData) {
        // In a real implementation, you'd send push notifications to all players
        console.log('Room notification:', notification);
      }
    } catch (error) {
      console.error('Error notifying room players:', error);
    }
  }

  // Notify game players
  async notifyGamePlayers(gameId, notification) {
    try {
      const gameState = await firebaseService.getGameState(gameId);
      if (gameState) {
        // In a real implementation, you'd send push notifications to all players
        console.log('Game notification:', notification);
      }
    } catch (error) {
      console.error('Error notifying game players:', error);
    }
  }

  // Get current game state
  async getCurrentGameState() {
    if (!this.currentGameId) return null;
    return await firebaseService.getGameState(this.currentGameId);
  }

  // Get current room data
  async getCurrentRoomData() {
    if (!this.currentRoomCode) return null;
    return await firebaseService.getGameRoom(this.currentRoomCode);
  }

  // Check if player is in game
  async isPlayerInGame(playerId) {
    if (!this.currentGameId) return false;
    
    const gameState = await firebaseService.getGameState(this.currentGameId);
    if (!gameState) return false;
    
    return Object.values(gameState.playerMapping || {}).includes(playerId);
  }

  // Get player's color in current game
  async getPlayerColor(playerId) {
    if (!this.currentGameId) return null;
    
    const gameState = await firebaseService.getGameState(this.currentGameId);
    if (!gameState || !gameState.playerMapping) return null;
    
    for (const [color, id] of Object.entries(gameState.playerMapping)) {
      if (id === playerId) return color;
    }
    
    return null;
  }

  // Cleanup listeners and state
  cleanup() {
    if (this.gameStateListener) {
      this.gameStateListener();
      this.gameStateListener = null;
    }
    
    if (this.roomListener) {
      this.roomListener();
      this.roomListener = null;
    }
    
    this.currentGameId = null;
    this.currentRoomCode = null;
  }

  // Reconnect to game (for handling app restarts)
  async reconnectToGame(gameId, playerId) {
    try {
      const gameState = await firebaseService.getGameState(gameId);
      
      if (!gameState) {
        throw new Error('Game not found');
      }

      if (!Object.values(gameState.playerMapping || {}).includes(playerId)) {
        throw new Error('Player not in this game');
      }

      this.currentGameId = gameId;
      this.currentRoomCode = gameState.roomCode;
      this.playerId = playerId;

      return gameState;
    } catch (error) {
      console.error('Error reconnecting to game:', error);
      throw error;
    }
  }

  // Get game statistics
  async getGameStats(gameId) {
    try {
      const gameState = await firebaseService.getGameState(gameId);
      if (!gameState) return null;

      return ludoGame.getGameStats(gameState);
    } catch (error) {
      console.error('Error getting game stats:', error);
      return null;
    }
  }
}

// Export singleton instance
export const multiplayerService = new MultiplayerService();
export default multiplayerService;