// Ludo Game Logic Service
export class LudoGameLogic {
  constructor() {
    this.BOARD_SIZE = 15;
    this.TOKENS_PER_PLAYER = 4;
    this.WINNING_POSITION = { row: 7, col: 7 }; // Center of the board
    
    // Define the main path that tokens follow around the board
    this.mainPath = [
      // Starting from red's exit
      { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
      // Turn up (green's entry column)
      { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
      // Turn right (top row)
      { row: 0, col: 7 }, { row: 0, col: 8 },
      // Turn down (green's exit)
      { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
      // Continue right (yellow's entry row)
      { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
      // Turn down (right column)
      { row: 7, col: 14 }, { row: 8, col: 14 },
      // Turn left (yellow's exit)
      { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
      // Continue down (blue's entry column)
      { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 },
      // Turn left (bottom row)
      { row: 14, col: 7 }, { row: 14, col: 6 },
      // Turn up (blue's exit)
      { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
      // Continue left (red's entry row)
      { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 },
      // Turn up (left column)
      { row: 7, col: 0 }
    ];

    // Define starting positions for each player's tokens
    this.startingPositions = {
      red: [
        { row: 1, col: 1 }, { row: 1, col: 2 },
        { row: 2, col: 1 }, { row: 2, col: 2 }
      ],
      green: [
        { row: 1, col: 9 }, { row: 1, col: 10 },
        { row: 2, col: 9 }, { row: 2, col: 10 }
      ],
      yellow: [
        { row: 9, col: 1 }, { row: 9, col: 2 },
        { row: 10, col: 1 }, { row: 10, col: 2 }
      ],
      blue: [
        { row: 9, col: 9 }, { row: 9, col: 10 },
        { row: 10, col: 9 }, { row: 10, col: 10 }
      ],
    };

    // Define entry points for each player
    this.entryPoints = {
      red: { row: 6, col: 1 },
      green: { row: 1, col: 8 },
      yellow: { row: 8, col: 13 },
      blue: { row: 13, col: 6 },
    };

    // Define home stretch paths for each player
    this.homeStretchPaths = {
      red: [
        { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, 
        { row: 7, col: 4 }, { row: 7, col: 5 }, { row: 7, col: 6 }
      ],
      green: [
        { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, 
        { row: 4, col: 7 }, { row: 5, col: 7 }, { row: 6, col: 7 }
      ],
      yellow: [
        { row: 7, col: 13 }, { row: 7, col: 12 }, { row: 7, col: 11 }, 
        { row: 7, col: 10 }, { row: 7, col: 9 }, { row: 7, col: 8 }
      ],
      blue: [
        { row: 13, col: 7 }, { row: 12, col: 7 }, { row: 11, col: 7 }, 
        { row: 10, col: 7 }, { row: 9, col: 7 }, { row: 8, col: 7 }
      ],
    };

    // Define safe positions where tokens cannot be captured
    this.safePositions = [
      { row: 6, col: 2 },   // Red safe
      { row: 2, col: 6 },   // Green safe
      { row: 6, col: 12 },  // Yellow safe
      { row: 12, col: 6 },  // Blue safe
      { row: 6, col: 8 },   // Center cross safe positions
      { row: 8, col: 6 },
      { row: 0, col: 6 },   // Corner safe positions
      { row: 6, col: 14 },
      { row: 14, col: 8 },
      { row: 8, col: 0 },
    ];
  }

  // Initialize a new game state
  initializeGame(players) {
    const gameState = {
      players: players,
      currentPlayerIndex: 0,
      tokens: {},
      gameStatus: 'playing', // 'playing', 'finished'
      winner: null,
      lastDiceRoll: null,
      moveCount: 0,
    };

    // Initialize tokens for each player
    players.forEach(player => {
      gameState.tokens[player] = this.startingPositions[player].map((pos, index) => ({
        id: index,
        row: pos.row,
        col: pos.col,
        position: -1, // -1 means in starting area, 0+ means on main path
        isInHomeStretch: false,
        isFinished: false,
      }));
    });

    return gameState;
  }

  // Get valid moves for a player given a dice roll
  getValidMoves(gameState, player, diceRoll) {
    const validMoves = [];
    const playerTokens = gameState.tokens[player];

    playerTokens.forEach((token, tokenIndex) => {
      if (token.isFinished) return;

      // If token is in starting area
      if (token.position === -1) {
        // Can only move out with a 6
        if (diceRoll === 6) {
          validMoves.push({
            tokenIndex,
            from: { row: token.row, col: token.col },
            to: this.entryPoints[player],
            type: 'entry',
          });
        }
      } else {
        // Token is on the board
        const newPosition = this.calculateNewPosition(token, diceRoll, player);
        if (newPosition) {
          const moveType = this.getMoveType(token, newPosition, player);
          validMoves.push({
            tokenIndex,
            from: { row: token.row, col: token.col },
            to: newPosition,
            type: moveType,
          });
        }
      }
    });

    return validMoves;
  }

  // Calculate new position for a token after dice roll
  calculateNewPosition(token, diceRoll, player) {
    if (token.isInHomeStretch) {
      // Token is in home stretch
      const homeStretch = this.homeStretchPaths[player];
      const currentIndex = homeStretch.findIndex(pos => 
        pos.row === token.row && pos.col === token.col
      );
      
      const newIndex = currentIndex + diceRoll;
      
      if (newIndex === homeStretch.length) {
        // Reached center (winning position)
        return this.WINNING_POSITION;
      } else if (newIndex < homeStretch.length) {
        // Still in home stretch
        return homeStretch[newIndex];
      } else {
        // Overshoot - invalid move
        return null;
      }
    } else {
      // Token is on main path
      const newPathPosition = token.position + diceRoll;
      
      // Check if token should enter home stretch
      const homeStretchEntry = this.getHomeStretchEntry(player);
      if (newPathPosition >= homeStretchEntry) {
        const homeStretchIndex = newPathPosition - homeStretchEntry;
        const homeStretch = this.homeStretchPaths[player];
        
        if (homeStretchIndex === homeStretch.length) {
          // Reached center
          return this.WINNING_POSITION;
        } else if (homeStretchIndex < homeStretch.length) {
          // Enter home stretch
          return homeStretch[homeStretchIndex];
        } else {
          // Overshoot - invalid move
          return null;
        }
      } else {
        // Continue on main path
        const pathIndex = newPathPosition % this.mainPath.length;
        return this.mainPath[pathIndex];
      }
    }
  }

  // Get the position where a player enters their home stretch
  getHomeStretchEntry(player) {
    const playerStartIndex = {
      red: 0,
      green: 13,
      yellow: 26,
      blue: 39,
    };
    
    return playerStartIndex[player] + 50; // After one full round
  }

  // Determine the type of move
  getMoveType(token, newPosition, player) {
    if (newPosition.row === this.WINNING_POSITION.row && 
        newPosition.col === this.WINNING_POSITION.col) {
      return 'finish';
    }
    
    if (this.homeStretchPaths[player].some(pos => 
      pos.row === newPosition.row && pos.col === newPosition.col)) {
      return 'homeStretch';
    }
    
    return 'normal';
  }

  // Execute a move
  executeMove(gameState, player, move) {
    const token = gameState.tokens[player][move.tokenIndex];
    
    // Check for captures
    const capturedTokens = this.checkForCaptures(gameState, move.to, player);
    
    // Move the token
    token.row = move.to.row;
    token.col = move.to.col;
    
    // Update token state based on move type
    switch (move.type) {
      case 'entry':
        token.position = 0;
        break;
      case 'homeStretch':
        token.isInHomeStretch = true;
        break;
      case 'finish':
        token.isFinished = true;
        break;
      case 'normal':
        if (token.position >= 0) {
          token.position += gameState.lastDiceRoll;
        }
        break;
    }
    
    // Handle captures
    capturedTokens.forEach(capturedToken => {
      this.sendTokenHome(capturedToken);
    });
    
    // Update game state
    gameState.moveCount++;
    
    // Check for win condition
    if (this.checkWinCondition(gameState, player)) {
      gameState.gameStatus = 'finished';
      gameState.winner = player;
    }
    
    return {
      success: true,
      capturedTokens: capturedTokens.length,
      gameState,
    };
  }

  // Check if any opponent tokens are captured
  checkForCaptures(gameState, position, currentPlayer) {
    const capturedTokens = [];
    
    // Skip if position is safe
    if (this.isSafePosition(position)) {
      return capturedTokens;
    }
    
    // Check all other players' tokens
    Object.keys(gameState.tokens).forEach(player => {
      if (player === currentPlayer) return;
      
      gameState.tokens[player].forEach(token => {
        if (token.row === position.row && 
            token.col === position.col && 
            !token.isFinished) {
          capturedTokens.push({ player, token });
        }
      });
    });
    
    return capturedTokens;
  }

  // Send a token back to starting position
  sendTokenHome(capturedToken) {
    const { player, token } = capturedToken;
    const startingPos = this.startingPositions[player][token.id];
    
    token.row = startingPos.row;
    token.col = startingPos.col;
    token.position = -1;
    token.isInHomeStretch = false;
    token.isFinished = false;
  }

  // Check if a position is safe
  isSafePosition(position) {
    return this.safePositions.some(safePos => 
      safePos.row === position.row && safePos.col === position.col
    );
  }

  // Check if a player has won
  checkWinCondition(gameState, player) {
    const playerTokens = gameState.tokens[player];
    return playerTokens.every(token => token.isFinished);
  }

  // Get next player's turn
  getNextPlayer(gameState, diceRoll) {
    // Player gets another turn if they rolled a 6
    if (diceRoll === 6) {
      return gameState.currentPlayerIndex;
    }
    
    // Move to next player
    const nextIndex = (gameState.currentPlayerIndex + 1) % gameState.players.length;
    return nextIndex;
  }

  // Validate if a move is legal
  isValidMove(gameState, player, tokenIndex, diceRoll) {
    const validMoves = this.getValidMoves(gameState, player, diceRoll);
    return validMoves.some(move => move.tokenIndex === tokenIndex);
  }

  // Get game statistics
  getGameStats(gameState) {
    const stats = {};
    
    Object.keys(gameState.tokens).forEach(player => {
      const tokens = gameState.tokens[player];
      stats[player] = {
        tokensInHome: tokens.filter(t => t.position === -1).length,
        tokensOnBoard: tokens.filter(t => t.position >= 0 && !t.isFinished).length,
        tokensFinished: tokens.filter(t => t.isFinished).length,
      };
    });
    
    return stats;
  }
}

// Export singleton instance
export const ludoGame = new LudoGameLogic();