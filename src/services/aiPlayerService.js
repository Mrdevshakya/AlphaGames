/**
 * AI Player Service for Ludo Game
 * Provides intelligent computer players with different difficulty levels
 */

import { safeSpots, starSpots, startingPoints, turningPoints, victoryStart } from '../../app/helpers/PlotData';

export class AIPlayerService {
  constructor() {
    this.difficultySettings = {
      easy: {
        thinkingTime: 1000,
        randomFactor: 0.7,
        strategicDepth: 1
      },
      medium: {
        thinkingTime: 1500,
        randomFactor: 0.3,
        strategicDepth: 2
      },
      hard: {
        thinkingTime: 2000,
        randomFactor: 0.1,
        strategicDepth: 3
      }
    };
  }

  /**
   * Make an AI move for the given player
   */
  async makeAIMove(gameState, playerId, difficulty = 'medium') {
    const player = gameState.players.find(p => p.id === playerId);
    if (!player || !player.isAI) {
      throw new Error('Invalid AI player');
    }

    const settings = this.difficultySettings[difficulty];
    
    // Simulate thinking time
    await this.delay(settings.thinkingTime);

    // Get possible moves (this would integrate with your game logic)
    const possibleMoves = this.getPossibleMoves(player, gameState);
    
    if (possibleMoves.length === 0) {
      return {
        action: 'no_move',
        message: 'AI has no valid moves'
      };
    }

    // Select best move based on difficulty
    const selectedMove = this.selectMove(
      possibleMoves,
      player,
      gameState,
      difficulty
    );

    return {
      action: 'move',
      move: selectedMove,
      message: this.generateMoveMessage(selectedMove)
    };
  }

  /**
   * Get all possible moves for a player
   */
  getPossibleMoves(player, gameState) {
    const possibleMoves = [];
    const diceValue = gameState.diceValue || 1;

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
        if (this.isValidMove(piece, newPosition, player, gameState)) {
          const moveType = this.getMoveType(piece, newPosition, player, gameState);
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
   * Select the best move based on AI difficulty
   */
  selectMove(possibleMoves, player, gameState, difficulty) {
    if (possibleMoves.length === 0) return null;

    const settings = this.difficultySettings[difficulty];

    // Add randomness based on difficulty
    if (Math.random() < settings.randomFactor) {
      return this.selectRandomMove(possibleMoves);
    }

    switch (difficulty) {
      case 'easy':
        return this.selectEasyMove(possibleMoves, player, gameState);
      case 'medium':
        return this.selectMediumMove(possibleMoves, player, gameState);
      case 'hard':
        return this.selectHardMove(possibleMoves, player, gameState);
      default:
        return possibleMoves[0];
    }
  }

  /**
   * Easy AI: Basic move selection with some randomness
   */
  selectEasyMove(possibleMoves, player, gameState) {
    // Simple priority: Home > Capture > Progress > Start
    
    const homeMoves = possibleMoves.filter(move => move.moveType === 'home');
    if (homeMoves.length > 0) {
      return homeMoves[Math.floor(Math.random() * homeMoves.length)];
    }

    const captureMoves = possibleMoves.filter(move => move.moveType === 'capture');
    if (captureMoves.length > 0) {
      return captureMoves[Math.floor(Math.random() * captureMoves.length)];
    }

    // Random selection from remaining moves
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  /**
   * Medium AI: Strategic move selection with position evaluation
   */
  selectMediumMove(possibleMoves, player, gameState) {
    let bestMove = null;
    let bestScore = -Infinity;

    possibleMoves.forEach(move => {
      const score = this.evaluateMove(move, player, gameState, 'medium');
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove || possibleMoves[0];
  }

  /**
   * Hard AI: Advanced move selection with lookahead
   */
  selectHardMove(possibleMoves, player, gameState) {
    let bestMove = null;
    let bestScore = -Infinity;

    possibleMoves.forEach(move => {
      const score = this.evaluateMoveWithLookahead(move, player, gameState);
      if (score > bestScore) {
        bestScore = score;
        bestMove = move;
      }
    });

    return bestMove || possibleMoves[0];
  }

  /**
   * Evaluate a move's quality
   */
  evaluateMove(move, player, gameState, difficulty = 'medium') {
    let score = 0;
    const piece = player.pieces.find(p => p.id === move.pieceId);

    // Base score for progress
    score += piece.travelCount * 2;

    // Move type bonuses
    switch (move.moveType) {
      case 'home':
        score += 100;
        break;
      case 'capture':
        score += 50;
        break;
      case 'start':
        score += 20;
        break;
      case 'safe':
        score += 10;
        break;
    }

    // Position-based scoring
    if (move.moveType !== 'home') {
      // Bonus for reaching safe spots
      if (this.isSafePosition(move.toPosition)) {
        score += 15;
      }

      // Penalty for vulnerable positions
      if (!this.isSafePosition(move.toPosition) && this.isVulnerablePosition(move.toPosition, player, gameState)) {
        score -= 20;
      }
    }

    return score;
  }

  /**
   * Advanced move evaluation with lookahead
   */
  evaluateMoveWithLookahead(move, player, gameState) {
    let score = this.evaluateMove(move, player, gameState, 'hard');

    // Add strategic considerations
    if (this.isBlockingMove(move, player, gameState)) {
      score += 25;
    }

    if (this.isGroupingMove(move, player)) {
      score += 10;
    }

    return score;
  }

  /**
   * Utility methods
   */
  calculateNewPosition(piece, diceValue, player) {
    let newPosition = piece.position + diceValue;
    
    // Handle board wrapping
    if (newPosition > 52) {
      newPosition = newPosition - 52;
    }

    // Check if entering home stretch
    const homeEntry = turningPoints[player.id - 1];
    if (piece.travelCount + diceValue > 50) {
      const homePosition = victoryStart[player.id - 1] + (piece.travelCount + diceValue - 51);
      if (homePosition <= victoryStart[player.id - 1] + 5) {
        return homePosition;
      }
    }

    return newPosition;
  }

  isValidMove(piece, newPosition, player, gameState) {
    if (newPosition === -1) return false;

    // Check if position is occupied by same player's piece
    const occupyingPiece = this.getPieceAtPosition(newPosition, gameState);
    if (occupyingPiece && occupyingPiece.playerId === player.id) {
      return false;
    }

    return true;
  }

  getMoveType(piece, newPosition, player, gameState) {
    if (piece.status === 'in_yard') return 'start';
    if (this.isHomePosition(newPosition, player)) return 'home';
    if (this.getPieceAtPosition(newPosition, gameState)) return 'capture';
    if (this.isSafePosition(newPosition)) return 'safe';
    return 'normal';
  }

  isSafePosition(position) {
    return safeSpots.includes(position) || starSpots.includes(position);
  }

  isHomePosition(position, player) {
    const homeStart = victoryStart[player.id - 1];
    return position >= homeStart && position <= homeStart + 5;
  }

  isVulnerablePosition(position, player, gameState) {
    if (this.isSafePosition(position)) return false;

    // Check if any opponent piece can reach this position
    for (const opponent of gameState.players) {
      if (opponent.id === player.id) continue;

      for (const piece of opponent.pieces) {
        if (piece.status === 'on_board') {
          // Check if opponent can reach this position with dice rolls 1-6
          for (let dice = 1; dice <= 6; dice++) {
            const reachablePos = this.calculateNewPosition(piece, dice, opponent);
            if (reachablePos === position) {
              return true;
            }
          }
        }
      }
    }

    return false;
  }

  isBlockingMove(move, player, gameState) {
    return this.getPieceAtPosition(move.toPosition, gameState) !== null;
  }

  isGroupingMove(move, player) {
    const nearbyPositions = [move.toPosition - 1, move.toPosition + 1];
    return player.pieces.some(piece => 
      piece.status === 'on_board' && nearbyPositions.includes(piece.position)
    );
  }

  getPieceAtPosition(position, gameState) {
    for (const player of gameState.players) {
      for (const piece of player.pieces) {
        if (piece.position === position && piece.status !== 'in_yard') {
          return { ...piece, playerId: player.id };
        }
      }
    }
    return null;
  }

  getStartPosition(player) {
    return startingPoints[player.id - 1];
  }

  selectRandomMove(possibleMoves) {
    return possibleMoves[Math.floor(Math.random() * possibleMoves.length)];
  }

  generateMoveMessage(move) {
    const messages = {
      capture: ["Nice capture!", "Gotcha!", "Back to the yard you go!"],
      home: ["Piece reached home!", "Safe at home!", "One step closer to victory!"],
      start: ["New piece on the board!", "Let's get moving!", "Out of the yard!"],
      safe: ["Safe spot secured!", "Protected position!", "Good defensive move!"],
      normal: ["Moving forward!", "Making progress!", "Steady advance!"]
    };

    const moveMessages = messages[move.moveType] || messages.normal;
    return moveMessages[Math.floor(Math.random() * moveMessages.length)];
  }

  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const aiPlayerService = new AIPlayerService();
export default aiPlayerService;