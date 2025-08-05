export const gameLogic = {
  initializeGame: () => {
    // Complete Ludo game state initialization
    return {
      board: [], // Represents the Ludo board, e.g., an array of positions
      players: [
        { id: 1, color: 'red', pieces: [
           { id: 'r1', position: 'yard_red_1', status: 'in_yard' },
           { id: 'r2', position: 'yard_red_2', status: 'in_yard' },
           { id: 'r3', position: 'yard_red_3', status: 'in_yard' },
           { id: 'r4', position: 'yard_red_4', status: 'in_yard' },
         ] },
         { id: 2, color: 'blue', pieces: [
           { id: 'b1', position: 'yard_blue_1', status: 'in_yard' },
           { id: 'b2', position: 'yard_blue_2', status: 'in_yard' },
           { id: 'b3', position: 'yard_blue_3', status: 'in_yard' },
           { id: 'b4', position: 'yard_blue_4', status: 'in_yard' },
         ] },
         { id: 3, color: 'green', pieces: [
           { id: 'g1', position: 'yard_green_1', status: 'in_yard' },
           { id: 'g2', position: 'yard_green_2', status: 'in_yard' },
           { id: 'g3', position: 'yard_green_3', status: 'in_yard' },
           { id: 'g4', position: 'yard_green_4', status: 'in_yard' },
         ] },
         { id: 4, color: 'yellow', pieces: [
           { id: 'y1', position: 'yard_yellow_1', status: 'in_yard' },
           { id: 'y2', position: 'yard_yellow_2', status: 'in_yard' },
           { id: 'y3', position: 'yard_yellow_3', status: 'in_yard' },
           { id: 'y4', position: 'yard_yellow_4', status: 'in_yard' },
         ] },
      ],
      currentPlayerIndex: 0,
      diceValue: null,
      gameStatus: 'waiting', // waiting, playing, finished
      winner: null,
      lastMove: null,
    };
  },

  handleDiceRoll: (gameState, player, roll) => {
    console.log(`Player ${player.id} rolled a ${roll}`);
    
    // Update game state with the new dice value
    const newGameState = { 
      ...gameState, 
      diceValue: roll,
      lastMove: `Player ${player.id} rolled a ${roll}`
    };
    
    // Check if player can move any piece
    const canMove = gameLogic.canPlayerMove(newGameState, player, roll);
    
    // If player rolled a 6, they can take a piece out of the yard
    if (roll === 6) {
      // Player gets another turn if they roll a 6
      return newGameState;
    }
    
    // If player can't move any piece, move to next player
    if (!canMove) {
      const nextPlayerIndex = (gameState.players.indexOf(player) + 1) % gameState.players.length;
      return {
        ...newGameState,
        currentPlayerIndex: nextPlayerIndex,
        lastMove: `Player ${player.id} rolled a ${roll} but couldn't move`
      };
    }
    
    return newGameState;
  },

  movePiece: (gameState, player, pieceId, targetPosition) => {
    console.log(`Player ${player.id} moving piece ${pieceId} to ${targetPosition}`);
    
    // Find the piece to move
    const playerIndex = gameState.players.findIndex(p => p.id === player.id);
    if (playerIndex === -1) return gameState;
    
    const pieceIndex = gameState.players[playerIndex].pieces.findIndex(p => p.id === pieceId);
    if (pieceIndex === -1) return gameState;
    
    // Create a deep copy of the game state
    const newGameState = JSON.parse(JSON.stringify(gameState));
    const piece = newGameState.players[playerIndex].pieces[pieceIndex];
    
    // If piece is in yard and dice roll is 6, move to start position
    if (piece.status === 'in_yard' && gameState.diceValue === 6) {
      const startPosition = `start_${player.color}`;
      piece.position = startPosition;
      piece.status = 'on_board';
      newGameState.lastMove = `Player ${player.id} moved piece ${pieceId} out of yard`;
      return newGameState;
    }
    
    // If piece is on board, move it according to dice roll
    if (piece.status === 'on_board') {
      // Calculate new position based on current position and dice roll
      const newPosition = gameLogic.calculateNewPosition(piece.position, gameState.diceValue, player.color);
      
      // Check if the move is valid
      if (gameLogic.isValidMove(newGameState, player, piece, newPosition)) {
        // Check if there's an opponent piece at the new position
        const capturedPiece = gameLogic.checkForCapture(newGameState, player, newPosition);
        
        // Update piece position
        piece.position = newPosition;
        
        // If a piece was captured, update its position
        if (capturedPiece) {
          const capturedPlayerIndex = newGameState.players.findIndex(p => p.id === capturedPiece.playerId);
          const capturedPieceIndex = newGameState.players[capturedPlayerIndex].pieces.findIndex(p => p.id === capturedPiece.pieceId);
          
          if (capturedPlayerIndex !== -1 && capturedPieceIndex !== -1) {
            const capturedPieceObj = newGameState.players[capturedPlayerIndex].pieces[capturedPieceIndex];
            capturedPieceObj.position = `yard_${newGameState.players[capturedPlayerIndex].color}_${capturedPieceIndex + 1}`;
            capturedPieceObj.status = 'in_yard';
            
            newGameState.lastMove = `Player ${player.id} captured Player ${capturedPiece.playerId}'s piece`;
          }
        } else {
          newGameState.lastMove = `Player ${player.id} moved piece ${pieceId} to ${newPosition}`;
        }
        
        // Check if the piece has reached home
        if (gameLogic.hasReachedHome(newPosition, player.color)) {
          piece.status = 'finished';
          newGameState.lastMove = `Player ${player.id}'s piece ${pieceId} reached home!`;
          
          // Check if player has won
          if (gameLogic.hasPlayerWon(newGameState, player)) {
            newGameState.gameStatus = 'finished';
            newGameState.winner = player.id;
            newGameState.lastMove = `Player ${player.id} has won the game!`;
          }
        }
        
        // If player didn't roll a 6 and didn't reach home, move to next player
        if (gameState.diceValue !== 6 && !gameLogic.hasReachedHome(newPosition, player.color)) {
          const nextPlayerIndex = (playerIndex + 1) % newGameState.players.length;
          newGameState.currentPlayerIndex = nextPlayerIndex;
        }
      }
    }
    
    return newGameState;
  },

  isGameOver: (gameState) => {
    // Game is over if any player has won
    return gameState.gameStatus === 'finished' && gameState.winner !== null;
  },
  
  canPlayerMove: (gameState, player, diceValue) => {
    // Check if player can move any piece with the current dice value
    const playerPieces = player.pieces;
    
    // If player rolled a 6, they can take a piece out of the yard
    if (diceValue === 6) {
      // Check if any piece is in the yard
      const hasYardPiece = playerPieces.some(piece => piece.status === 'in_yard');
      if (hasYardPiece) return true;
    }
    
    // Check if any piece on the board can move
    for (const piece of playerPieces) {
      if (piece.status === 'on_board') {
        const newPosition = gameLogic.calculateNewPosition(piece.position, diceValue, player.color);
        if (gameLogic.isValidMove(gameState, player, piece, newPosition)) {
          return true;
        }
      }
    }
    
    return false;
  },
  
  calculateNewPosition: (currentPosition, diceValue, playerColor) => {
    // This is a simplified implementation
    // In a real game, you would need to map the board positions and handle special cases
    
    // If the piece is at the start position, move it to the first position on the track
    if (currentPosition.startsWith('start_')) {
      return `track_${playerColor}_1`;
    }
    
    // If the piece is on the track, move it forward by the dice value
    if (currentPosition.startsWith('track_')) {
      const parts = currentPosition.split('_');
      const color = parts[1];
      const position = parseInt(parts[2]);
      
      // Calculate new position
      const newPosition = position + diceValue;
      
      // Check if the piece is entering the home stretch
      if (color === playerColor && newPosition > 50) {
        const homePosition = newPosition - 50;
        if (homePosition <= 6) { // 6 is the maximum home position
          return `home_${playerColor}_${homePosition}`;
        }
        // If the dice value is too high, the piece can't move
        return currentPosition;
      }
      
      return `track_${color}_${newPosition}`;
    }
    
    // If the piece is in the home stretch, move it forward
    if (currentPosition.startsWith('home_')) {
      const parts = currentPosition.split('_');
      const position = parseInt(parts[2]);
      
      // Calculate new position
      const newPosition = position + diceValue;
      
      // Check if the piece has reached home
      if (newPosition === 6) {
        return 'finished';
      }
      
      // If the dice value is too high, the piece can't move
      if (newPosition > 6) {
        return currentPosition;
      }
      
      return `home_${playerColor}_${newPosition}`;
    }
    
    return currentPosition;
  },
  
  isValidMove: (gameState, player, piece, newPosition) => {
    // Check if the move is valid
    
    // If the position didn't change, the move is invalid
    if (newPosition === piece.position) return false;
    
    // Check if the new position is already occupied by another piece of the same player
    const playerPieces = player.pieces;
    const isOccupiedBySamePlayer = playerPieces.some(p => 
      p.id !== piece.id && p.position === newPosition && p.status !== 'finished'
    );
    
    if (isOccupiedBySamePlayer) return false;
    
    return true;
  },
  
  checkForCapture: (gameState, player, position) => {
    // Check if there's an opponent piece at the position
    for (const p of gameState.players) {
      if (p.id === player.id) continue; // Skip current player
      
      for (const piece of p.pieces) {
        if (piece.position === position && piece.status === 'on_board') {
          // Found an opponent piece at the position
          return { playerId: p.id, pieceId: piece.id };
        }
      }
    }
    
    return null;
  },
  
  hasReachedHome: (position, playerColor) => {
    // Check if the piece has reached home
    return position === 'finished';
  },
  
  hasPlayerWon: (gameState, player) => {
    // Check if all pieces of the player have reached home
    return player.pieces.every(piece => piece.status === 'finished');
  },

  getBoardPosition: (logicalPosition) => {
    // Map logical game positions to board coordinates
    
    // Handle yard positions
    if (logicalPosition.startsWith('yard_')) {
      const parts = logicalPosition.split('_');
      const color = parts[1];
      const position = parseInt(parts[2]);
      
      switch (color) {
        case 'red':
          switch (position) {
            case 1: return { row: 1, col: 1 };
            case 2: return { row: 1, col: 2 };
            case 3: return { row: 2, col: 1 };
            case 4: return { row: 2, col: 2 };
          }
          break;
        case 'green':
          switch (position) {
            case 1: return { row: 1, col: 12 };
            case 2: return { row: 1, col: 13 };
            case 3: return { row: 2, col: 12 };
            case 4: return { row: 2, col: 13 };
          }
          break;
        case 'yellow':
          switch (position) {
            case 1: return { row: 12, col: 1 };
            case 2: return { row: 12, col: 2 };
            case 3: return { row: 13, col: 1 };
            case 4: return { row: 13, col: 2 };
          }
          break;
        case 'blue':
          switch (position) {
            case 1: return { row: 12, col: 12 };
            case 2: return { row: 12, col: 13 };
            case 3: return { row: 13, col: 12 };
            case 4: return { row: 13, col: 13 };
          }
          break;
      }
    }
    
    // Handle start positions
    if (logicalPosition.startsWith('start_')) {
      const color = logicalPosition.split('_')[1];
      switch (color) {
        case 'red': return { row: 6, col: 1 };
        case 'green': return { row: 1, col: 8 };
        case 'yellow': return { row: 8, col: 13 };
        case 'blue': return { row: 13, col: 6 };
      }
    }
    
    // Handle track positions
    if (logicalPosition.startsWith('track_')) {
      const parts = logicalPosition.split('_');
      const position = parseInt(parts[2]);
      
      // Define the main path coordinates
      const mainPath = [
        // Red start to Green (0-12)
        { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
        { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 },
        { row: 1, col: 7 }, { row: 1, col: 8 },
        // Green to Yellow (13-25)
        { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 }, { row: 6, col: 8 },
        { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
        { row: 7, col: 13 }, { row: 8, col: 13 },
        // Yellow to Blue (26-38)
        { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 }, { row: 8, col: 8 },
        { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 },
        { row: 13, col: 7 }, { row: 13, col: 6 },
        // Blue to Red (39-51)
        { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 }, { row: 8, col: 6 },
        { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 },
        { row: 7, col: 1 }, { row: 6, col: 1 },
      ];
      
      // Each player starts at a different position on the main path
      const startOffsets = {
        red: 0,
        green: 13,
        yellow: 26,
        blue: 39
      };
      
      const color = parts[1];
      const adjustedPosition = (position + startOffsets[color]) % 52;
      
      return mainPath[adjustedPosition];
    }
    
    // Handle home stretch positions
    if (logicalPosition.startsWith('home_')) {
      const parts = logicalPosition.split('_');
      const color = parts[1];
      const position = parseInt(parts[2]);
      
      switch (color) {
        case 'red':
          return { row: 7, col: 1 + position };
        case 'green':
          return { row: 1 + position, col: 7 };
        case 'yellow':
          return { row: 7, col: 13 - position };
        case 'blue':
          return { row: 13 - position, col: 7 };
      }
    }
    
    // Handle finished position (center of the board)
    if (logicalPosition === 'finished') {
      return { row: 7, col: 7 };
    }
    
    console.warn(`Unknown position: ${logicalPosition}`);
    return { row: 7, col: 7 }; // Default to center if position is unknown
  },

  // Add more Ludo game logic functions as needed
};