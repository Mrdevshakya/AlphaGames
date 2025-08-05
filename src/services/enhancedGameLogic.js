/**
 * Enhanced Ludo Game Logic Service
 * Provides comprehensive game mechanics, AI players, and multiplayer support
 */

import { safeSpots, starSpots, startingPoints, turningPoints, victoryStart } from '../../app/helpers/PlotData';

export class EnhancedGameLogic {
  constructor() {
    this.gameState = null;
    this.gameSettings = {
      gameMode: 'single',
      playerCount: 4,
      aiDifficulty: 'medium',
      soundEnabled: true,
      animationsEnabled: true,
      gameSpeed: 'normal'
    };
  }

  /**
   * Initialize a new game with enhanced features
   */
  initializeGame(settings = {}) {
    this.gameSettings = { ...this.gameSettings, ...settings };
    
    const players = [];
    for (let i = 1; i <= this.gameSettings.playerCount; i++) {
      const colors = ['red', 'green', 'yellow', 'blue'];
      players.push({
        id: i,
        color: colors[i - 1],
        name: settings.playerNames?.[i - 1] || `Player ${i}`,
        isAI: settings.aiPlayers?.includes(i) || false,
        pieces: this.initializePlayerPieces(i),
        score: 0,
        finishedPieces: 0
      });
    }

    this.gameState = {
      players,
      currentPlayerIndex: 0,
      diceValue: null,
      gameStatus: 'waiting',
      winner: null,
      lastMove: null,
      moveHistory: [],
      gameStartTime: Date.now(),
      consecutiveSixes: 0,
      capturedPieces: 0,
      totalMoves: 0,
      settings: this.gameSettings
    };

    return this.gameState;
  }

  /**
   * Initialize pieces for a player
   */
  initializePlayerPieces(playerId) {
    const pieceIds = ['A', 'B', 'C', 'D'];
    return pieceIds.map((id, index) => ({
      id: `${pieceIds[playerId - 1]}${index + 1}`,
      position: 0, // 0 means in yard
      status: 'in_yard',
      travelCount: 0,
      isSelected: false,
      lastMoveTime: null
    }));
  }

  /**
   * Enhanced dice roll with proper validation
   */
  rollDice(playerId = null) {
    if (!this.gameState || this.gameState.gameStatus !== 'playing') {
      throw new Error('Game is not in playing state');
    }

    const currentPlayer = this.getCurrentPlayer();
    if (playerId && currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    // Generate dice value (1-6)
    const diceValue = Math.floor(Math.random() * 6) + 1;
    this.gameState.diceValue = diceValue;
    this.gameState.totalMoves++;

    // Track consecutive sixes
    if (diceValue === 6) {
      this.gameState.consecutiveSixes++;
      if (this.gameState.consecutiveSixes >= 3) {
        // Three consecutive sixes - lose turn
        this.gameState.consecutiveSixes = 0;
        this.nextPlayer();
        return {
          diceValue,
          message: 'Three consecutive sixes! Turn skipped.',
          canMove: false,
          nextTurn: true
        };
      }
    } else {
      this.gameState.consecutiveSixes = 0;
    }

    // Check if player can move any piece
    const canMove = this.canPlayerMove(currentPlayer, diceValue);
    
    return {
      diceValue,
      canMove,
      possibleMoves: canMove ? this.getPossibleMoves(currentPlayer, diceValue) : [],
      message: canMove ? 'Choose a piece to move' : 'No valid moves available'
    };
  }

  /**
   * Check if player can move any piece
   */
  canPlayerMove(player, diceValue) {
    // If dice is 6, can always move (either from yard or on board)
    if (diceValue === 6) {
      return true;
    }

    // Check if any piece on board can move
    return player.pieces.some(piece => {
      if (piece.status === 'on_board') {
        const newPosition = this.calculateNewPosition(piece, diceValue, player);
        return this.isValidMove(piece, newPosition, player);
      }
      return false;
    });
  }

  /**
   * Get all possible moves for a player
   */
  getPossibleMoves(player, diceValue) {
    const possibleMoves = [];

    player.pieces.forEach(piece => {
      if (piece.status === 'in_yard' && diceValue === 6) {
        // Can move from yard to start position
        possibleMoves.push({
          pieceId: piece.id,
          fromPosition: 0,
          toPosition: this.getStartPosition(player),
          moveType: 'start'
        });
      } else if (piece.status === 'on_board') {
        const newPosition = this.calculateNewPosition(piece, diceValue, player);
        if (this.isValidMove(piece, newPosition, player)) {
          const moveType = this.getMoveType(piece, newPosition, player);
          possibleMoves.push({
            pieceId: piece.id,
            fromPosition: piece.position,
            toPosition: newPosition,
            moveType
          });
        }
      }
    });

    return possibleMoves;
  }

  /**
   * Calculate new position for a piece
   */
  calculateNewPosition(piece, diceValue, player) {
    let newPosition = piece.position + diceValue;
    
    // Handle board wrapping and home entry
    if (piece.travelCount + diceValue > 57) {
      return -1; // Invalid move - would overshoot home
    }

    // Check if entering home stretch
    const homeEntryPosition = this.getHomeEntryPosition(player);
    if (piece.travelCount + diceValue > 50 && piece.travelCount <= 50) {
      // Entering home stretch
      const homePosition = (piece.travelCount + diceValue) - 50;
      return this.getHomePosition(player, homePosition);
    }

    // Handle board wrapping
    if (newPosition > 52) {
      newPosition = newPosition - 52;
    }

    return newPosition;
  }

  /**
   * Validate if a move is legal
   */
  isValidMove(piece, newPosition, player) {
    if (newPosition === -1) return false;

    // Check if position is occupied by same player's piece
    const occupyingPiece = this.getPieceAtPosition(newPosition);
    if (occupyingPiece && occupyingPiece.playerId === player.id) {
      return false;
    }

    // Check if it's a valid home position
    if (this.isHomePosition(newPosition, player)) {
      const homeSlot = this.getHomeSlot(newPosition, player);
      return homeSlot <= 6 && homeSlot > 0;
    }

    return true;
  }

  /**
   * Execute a move
   */
  makeMove(playerId, pieceId, targetPosition) {
    const player = this.getPlayerById(playerId);
    const piece = player.pieces.find(p => p.id === pieceId);
    
    if (!piece) {
      throw new Error('Piece not found');
    }

    const currentPlayer = this.getCurrentPlayer();
    if (currentPlayer.id !== playerId) {
      throw new Error('Not your turn');
    }

    // Validate move
    const possibleMoves = this.getPossibleMoves(player, this.gameState.diceValue);
    const validMove = possibleMoves.find(move => 
      move.pieceId === pieceId && move.toPosition === targetPosition
    );

    if (!validMove) {
      throw new Error('Invalid move');
    }

    // Execute the move
    const moveResult = this.executePieceMove(piece, validMove, player);
    
    // Update game state
    this.gameState.lastMove = {
      playerId,
      pieceId,
      fromPosition: validMove.fromPosition,
      toPosition: validMove.toPosition,
      diceValue: this.gameState.diceValue,
      moveType: validMove.moveType,
      timestamp: Date.now()
    };

    this.gameState.moveHistory.push(this.gameState.lastMove);

    // Check for game end
    if (this.checkWinCondition(player)) {
      this.gameState.winner = playerId;
      this.gameState.gameStatus = 'finished';
      return {
        success: true,
        moveResult,
        gameEnded: true,
        winner: playerId
      };
    }

    // Handle turn progression
    if (this.gameState.diceValue !== 6 && validMove.moveType !== 'capture') {
      this.nextPlayer();
    }

    return {
      success: true,
      moveResult,
      gameEnded: false,
      nextPlayer: this.getCurrentPlayer().id
    };
  }

  /**
   * Execute the actual piece movement
   */
  executePieceMove(piece, move, player) {
    const result = {
      moved: true,
      captured: false,
      reachedHome: false,
      capturedPiece: null
    };

    // Check for capture
    const targetPiece = this.getPieceAtPosition(move.toPosition);
    if (targetPiece && targetPiece.playerId !== player.id) {
      // Capture opponent piece
      if (!this.isSafePosition(move.toPosition)) {
        this.capturePiece(targetPiece);
        result.captured = true;
        result.capturedPiece = targetPiece;
        this.gameState.capturedPieces++;
      }
    }

    // Move the piece
    piece.position = move.toPosition;
    piece.travelCount += this.gameState.diceValue;
    piece.lastMoveTime = Date.now();

    // Update piece status
    if (move.moveType === 'start') {
      piece.status = 'on_board';
    } else if (move.moveType === 'home') {
      piece.status = 'finished';
      player.finishedPieces++;
      result.reachedHome = true;
    }

    return result;
  }

  /**
   * Capture an opponent's piece
   */
  capturePiece(piece) {
    const player = this.getPlayerById(piece.playerId);
    const playerPiece = player.pieces.find(p => p.id === piece.id);
    
    if (playerPiece) {
      playerPiece.position = 0;
      playerPiece.status = 'in_yard';
      playerPiece.travelCount = 0;
    }
  }

  /**
   * AI Player Logic
   */
  makeAIMove(player) {
    if (!player.isAI) return null;

    const diceResult = this.rollDice(player.id);
    if (!diceResult.canMove) {
      return { action: 'no_move', diceValue: diceResult.diceValue };
    }

    // AI decision making based on difficulty
    const move = this.selectAIMove(player, diceResult.possibleMoves);
    if (move) {
      const moveResult = this.makeMove(player.id, move.pieceId, move.toPosition);
      return {
        action: 'move',
        diceValue: diceResult.diceValue,
        move,
        result: moveResult
      };
    }

    return { action: 'no_move', diceValue: diceResult.diceValue };
  }

  /**
   * AI move selection based on difficulty
   */
  selectAIMove(player, possibleMoves) {
    if (possibleMoves.length === 0) return null;

    switch (this.gameSettings.aiDifficulty) {
      case 'easy':
        return this.selectRandomMove(possibleMoves);
      case 'medium':
        return this.selectStrategicMove(possibleMoves, player);
      case 'hard':
        return this.selectOptimalMove(possibleMoves, player);
      default:
        return possibleMoves[0];
    }
  }

  /**
   * Random move selection for easy AI
   */
  selectRandomMove(possibleMoves) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  /**
   * Strategic move selection for medium AI
   */
  selectStrategicMove(possibleMoves, player) {
    // Priority: Capture > Home > Progress > Start
    
    // 1. Look for capture opportunities
    const captureMoves = possibleMoves.filter(move => move.moveType === 'capture');
    if (captureMoves.length > 0) {
      return captureMoves[0];
    }

    // 2. Look for home moves
    const homeMoves = possibleMoves.filter(move => move.moveType === 'home');
    if (homeMoves.length > 0) {
      return homeMoves[0];
    }

    // 3. Move pieces closest to home
    const progressMoves = possibleMoves.filter(move => move.moveType === 'normal');
    if (progressMoves.length > 0) {
      return progressMoves.reduce((best, current) => {
        const bestPiece = player.pieces.find(p => p.id === best.pieceId);
        const currentPiece = player.pieces.find(p => p.id === current.pieceId);
        return currentPiece.travelCount > bestPiece.travelCount ? current : best;
      });
    }

    // 4. Start new pieces
    const startMoves = possibleMoves.filter(move => move.moveType === 'start');
    if (startMoves.length > 0) {
      return startMoves[0];
    }

    return possibleMoves[0];
  }

  /**
   * Optimal move selection for hard AI
   */
  selectOptimalMove(possibleMoves, player) {
    // Advanced AI logic with lookahead and position evaluation
    let bestMove = null;
    let bestScore = -Infinity;

    possibleMoves.forEach(move => {
      const score = this.evaluateMove(move, player);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove || possibleMoves[0];
  }

  /**
   * Evaluate move quality for AI
   */
  evaluateMove(move, player) {
    let score = 0;

    // Base score for progress
    const piece = player.pieces.find(p => p.id === move.pieceId);
    score += piece.travelCount * 2;

    // Bonus for different move types
    switch (move.moveType) {
      case 'capture':
        score += 50;
        break;
      case 'home':
        score += 100;
        break;
      case 'start':
        score += 20;
        break;
      case 'safe':
        score += 10;
        break;
    }

    // Penalty for vulnerable positions
    if (!this.isSafePosition(move.toPosition)) {
      score -= 5;
    }

    return score;
  }

  /**
   * Utility methods
   */
  getCurrentPlayer() {
    return this.gameState.players[this.gameState.currentPlayerIndex];
  }

  getPlayerById(playerId) {
    return this.gameState.players.find(p => p.id === playerId);
  }

  nextPlayer() {
    this.gameState.currentPlayerIndex = 
      (this.gameState.currentPlayerIndex + 1) % this.gameState.players.length;
  }

  getPieceAtPosition(position) {
    for (const player of this.gameState.players) {
      for (const piece of player.pieces) {
        if (piece.position === position && piece.status !== 'in_yard') {
          return { ...piece, playerId: player.id };
        }
      }
    }
    return null;
  }

  isSafePosition(position) {
    return safeSpots.includes(position) || starSpots.includes(position);
  }

  getStartPosition(player) {
    return startingPoints[player.id - 1];
  }

  getHomeEntryPosition(player) {
    return turningPoints[player.id - 1];
  }

  getHomePosition(player, slot) {
    return victoryStart[player.id - 1] + slot - 1;
  }

  isHomePosition(position, player) {
    const homeStart = victoryStart[player.id - 1];
    return position >= homeStart && position < homeStart + 6;
  }

  getHomeSlot(position, player) {
    return position - victoryStart[player.id - 1] + 1;
  }

  getMoveType(piece, newPosition, player) {
    if (piece.status === 'in_yard') return 'start';
    if (this.isHomePosition(newPosition, player)) return 'home';
    if (this.getPieceAtPosition(newPosition)) return 'capture';
    if (this.isSafePosition(newPosition)) return 'safe';
    return 'normal';
  }

  checkWinCondition(player) {
    return player.pieces.every(piece => piece.status === 'finished');
  }

  /**
   * Game state management
   */
  getGameState() {
    return { ...this.gameState };
  }

  updateGameSettings(newSettings) {
    this.gameSettings = { ...this.gameSettings, ...newSettings };
    if (this.gameState) {
      this.gameState.settings = this.gameSettings;
    }
  }

  pauseGame() {
    if (this.gameState) {
      this.gameState.gameStatus = 'paused';
    }
  }

  resumeGame() {
    if (this.gameState) {
      this.gameState.gameStatus = 'playing';
    }
  }

  resetGame() {
    this.gameState = null;
  }

  /**
   * Statistics and analytics
   */
  getGameStatistics() {
    if (!this.gameState) return null;

    const gameTime = Date.now() - this.gameState.gameStartTime;
    return {
      gameTime,
      totalMoves: this.gameState.totalMoves,
      capturedPieces: this.gameState.capturedPieces,
      playerStats: this.gameState.players.map(player => ({
        id: player.id,
        name: player.name,
        finishedPieces: player.finishedPieces,
        piecesOnBoard: player.pieces.filter(p => p.status === 'on_board').length,
        averageTravelCount: player.pieces.reduce((sum, p) => sum + p.travelCount, 0) / 4
      }))
    };
  }
}

// Export singleton instance
export const enhancedGameLogic = new EnhancedGameLogic();
export default enhancedGameLogic;