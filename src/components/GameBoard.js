import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { Svg, Rect, Circle, Path, Text as SvgText } from 'react-native-svg';

const { width } = Dimensions.get('window');
const BOARD_SIZE = width - 40;
const CELL_SIZE = BOARD_SIZE / 15;

const GameBoard = ({ gameState, onCellPress }) => {
  // Define colors for each player
  const playerColors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f',
  };

  // Define home positions for each color
  const homePositions = {
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

  // Define the main path positions
  const pathPositions = [
    // Bottom row (red to green)
    { row: 6, col: 1 }, { row: 6, col: 2 }, { row: 6, col: 3 }, { row: 6, col: 4 }, { row: 6, col: 5 },
    // Right column (bottom to top)
    { row: 5, col: 6 }, { row: 4, col: 6 }, { row: 3, col: 6 }, { row: 2, col: 6 }, { row: 1, col: 6 }, { row: 0, col: 6 },
    // Top row (right to left)
    { row: 0, col: 7 }, { row: 0, col: 8 },
    // Left column (top to bottom)
    { row: 1, col: 8 }, { row: 2, col: 8 }, { row: 3, col: 8 }, { row: 4, col: 8 }, { row: 5, col: 8 },
    // Top row continued
    { row: 6, col: 9 }, { row: 6, col: 10 }, { row: 6, col: 11 }, { row: 6, col: 12 }, { row: 6, col: 13 },
    // Right column
    { row: 7, col: 14 }, { row: 8, col: 14 },
    // Bottom row (right to left)
    { row: 8, col: 13 }, { row: 8, col: 12 }, { row: 8, col: 11 }, { row: 8, col: 10 }, { row: 8, col: 9 },
    // Left column
    { row: 9, col: 8 }, { row: 10, col: 8 }, { row: 11, col: 8 }, { row: 12, col: 8 }, { row: 13, col: 8 },
    // Bottom row continued
    { row: 14, col: 7 }, { row: 14, col: 6 },
    // Right column (bottom to top)
    { row: 13, col: 6 }, { row: 12, col: 6 }, { row: 11, col: 6 }, { row: 10, col: 6 }, { row: 9, col: 6 },
    // Bottom row (left to right)
    { row: 8, col: 5 }, { row: 8, col: 4 }, { row: 8, col: 3 }, { row: 8, col: 2 }, { row: 8, col: 1 },
    // Left column
    { row: 7, col: 0 }
  ];

  // Define safe positions (star positions)
  const safePositions = [
    { row: 6, col: 2 }, // Red safe
    { row: 2, col: 6 }, // Green safe
    { row: 6, col: 12 }, // Yellow safe
    { row: 12, col: 6 }, // Blue safe
    { row: 6, col: 8 }, // Center safe positions
    { row: 8, col: 6 },
  ];

  // Define home stretch positions for each color
  const homeStretchPositions = {
    red: [
      { row: 7, col: 1 }, { row: 7, col: 2 }, { row: 7, col: 3 }, { row: 7, col: 4 }, { row: 7, col: 5 }
    ],
    green: [
      { row: 1, col: 7 }, { row: 2, col: 7 }, { row: 3, col: 7 }, { row: 4, col: 7 }, { row: 5, col: 7 }
    ],
    yellow: [
      { row: 7, col: 9 }, { row: 7, col: 10 }, { row: 7, col: 11 }, { row: 7, col: 12 }, { row: 7, col: 13 }
    ],
    blue: [
      { row: 9, col: 7 }, { row: 10, col: 7 }, { row: 11, col: 7 }, { row: 12, col: 7 }, { row: 13, col: 7 }
    ],
  };

  const renderCell = (row, col) => {
    const cellKey = `${row}-${col}`;
    const x = col * CELL_SIZE;
    const y = row * CELL_SIZE;
    
    // Determine cell type and color
    let cellColor = '#2c3e50'; // Default dark color
    let isPath = false;
    let isSafe = false;
    let isHome = false;
    let homeColor = null;
    let isHomeStretch = false;
    let homeStretchColor = null;

    // Check if it's a home position
    Object.keys(homePositions).forEach(color => {
      homePositions[color].forEach(pos => {
        if (pos.row === row && pos.col === col) {
          isHome = true;
          homeColor = color;
          cellColor = playerColors[color];
        }
      });
    });

    // Check if it's a home stretch position
    Object.keys(homeStretchPositions).forEach(color => {
      homeStretchPositions[color].forEach(pos => {
        if (pos.row === row && pos.col === col) {
          isHomeStretch = true;
          homeStretchColor = color;
          cellColor = playerColors[color];
        }
      });
    });

    // Check if it's a path position
    pathPositions.forEach(pos => {
      if (pos.row === row && pos.col === col) {
        isPath = true;
        cellColor = '#ecf0f1';
      }
    });

    // Check if it's a safe position
    safePositions.forEach(pos => {
      if (pos.row === row && pos.col === col) {
        isSafe = true;
        cellColor = '#f39c12';
      }
    });

    // Center position
    if (row === 7 && col === 7) {
      cellColor = '#e74c3c';
    }

    return (
      <Rect
        key={cellKey}
        x={x}
        y={y}
        width={CELL_SIZE}
        height={CELL_SIZE}
        fill={cellColor}
        stroke="#34495e"
        strokeWidth={1}
        onPress={() => onCellPress && onCellPress(row, col)}
      />
    );
  };

  const renderTokens = () => {
    if (!gameState || !gameState.tokens) return null;

    return Object.keys(gameState.tokens).map(color => {
      return gameState.tokens[color].map((token, index) => {
        const tokenKey = `${color}-${index}`;
        const x = token.col * CELL_SIZE + CELL_SIZE / 2;
        const y = token.row * CELL_SIZE + CELL_SIZE / 2;
        const radius = CELL_SIZE / 3;

        return (
          <Circle
            key={tokenKey}
            cx={x}
            cy={y}
            r={radius}
            fill={playerColors[color]}
            stroke="#fff"
            strokeWidth={2}
            onPress={() => onCellPress && onCellPress(token.row, token.col, color, index)}
          />
        );
      });
    });
  };

  const renderStars = () => {
    return safePositions.map((pos, index) => {
      const x = pos.col * CELL_SIZE + CELL_SIZE / 2;
      const y = pos.row * CELL_SIZE + CELL_SIZE / 2;
      const starSize = CELL_SIZE / 4;

      // Simple star path
      const starPath = `M ${x} ${y - starSize} L ${x + starSize * 0.3} ${y - starSize * 0.3} L ${x + starSize} ${y} L ${x + starSize * 0.3} ${y + starSize * 0.3} L ${x} ${y + starSize} L ${x - starSize * 0.3} ${y + starSize * 0.3} L ${x - starSize} ${y} L ${x - starSize * 0.3} ${y - starSize * 0.3} Z`;

      return (
        <Path
          key={`star-${index}`}
          d={starPath}
          fill="#fff"
          stroke="#34495e"
          strokeWidth={1}
        />
      );
    });
  };

  return (
    <View style={styles.container}>
      <Svg width={BOARD_SIZE} height={BOARD_SIZE} style={styles.board}>
        {/* Render all cells */}
        {Array.from({ length: 15 }, (_, row) =>
          Array.from({ length: 15 }, (_, col) => renderCell(row, col))
        )}
        
        {/* Render stars on safe positions */}
        {renderStars()}
        
        {/* Render tokens */}
        {renderTokens()}
      </Svg>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  board: {
    backgroundColor: '#2c3e50',
    borderRadius: 10,
  },
});

export default GameBoard;