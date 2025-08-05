// Ludo board path data and game constants

export const plot1data: Array<number> = [
    13, 14, 15, 16, 17, 18, 12, 221, 222, 223, 224, 225, 11, 10, 9, 8, 7, 6
];

export const plot2data: Array<number> = [
    24, 25, 26, 23, 331, 27, 22, 332, 28, 21, 333, 29, 20, 334, 30, 19, 335, 31
];

export const plot3data: Array<number> = [
    32, 33, 34, 35, 36, 37, 445, 444, 443, 442, 441, 38, 44, 43, 42, 41, 40, 39
];

export const plot4data: Array<number> = [
    5, 115, 45, 4, 114, 46, 3, 113, 47, 2, 112, 48, 1, 111, 49, 52, 51, 50
];

// Safe spots where pieces cannot be captured
export const safeSpots: Array<number> = [
    111, 112, 113, 114, 115, 221, 222, 223, 224, 225, 331, 332, 333, 334, 335, 441, 442, 443, 444, 445, 1, 14, 27, 40
];

// Star spots (special positions)
export const starSpots: Array<number> = [9, 22, 35, 48];

// Arrow spots (directional indicators)
export const arrowSpots: Array<number> = [12, 51, 38, 25];

// Starting positions for each player
export const startingPoints: Array<number> = [1, 14, 27, 40];

// Turning points where pieces enter home stretch
export const turningPoints: Array<number> = [52, 13, 26, 39];

// Victory start positions (home stretch beginning)
export const victoryStart: Array<number> = [111, 221, 331, 441];

// Complete board path (52 positions)
export const boardPath: Array<number> = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13,
    14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26,
    27, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39,
    40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52
];

// Home positions for each player
export const homePositions = {
    player1: [111, 112, 113, 114, 115, 116], // Red
    player2: [221, 222, 223, 224, 225, 226], // Green
    player3: [331, 332, 333, 334, 335, 336], // Yellow
    player4: [441, 442, 443, 444, 445, 446]  // Blue
};

// Yard positions for each player
export const yardPositions = {
    player1: [101, 102, 103, 104], // Red yard
    player2: [201, 202, 203, 204], // Green yard
    player3: [301, 302, 303, 304], // Yellow yard
    player4: [401, 402, 403, 404]  // Blue yard
};

// Player colors mapping
export const playerColors = {
    1: 'red',
    2: 'green',
    3: 'yellow',
    4: 'blue'
};

// Utility functions
export const getPlayerColor = (playerNumber: number): string => {
    return playerColors[playerNumber as keyof typeof playerColors] || 'red';
};

export const isValidPosition = (position: number): boolean => {
    return position >= 0 && position <= 52;
};

export const isSafePosition = (position: number): boolean => {
    return safeSpots.includes(position) || starSpots.includes(position);
};

export const isHomePosition = (position: number, playerNumber: number): boolean => {
    const homePos = homePositions[`player${playerNumber}` as keyof typeof homePositions];
    return homePos ? homePos.includes(position) : false;
};

export const isYardPosition = (position: number, playerNumber: number): boolean => {
    const yardPos = yardPositions[`player${playerNumber}` as keyof typeof yardPositions];
    return yardPos ? yardPos.includes(position) : false;
};

export const getNextPosition = (currentPosition: number, steps: number): number => {
    if (currentPosition === 0) return startingPoints[0]; // Default to player 1 start
    
    let newPosition = currentPosition + steps;
    if (newPosition > 52) {
        newPosition = newPosition - 52;
    }
    return newPosition;
};

export const getDistanceToHome = (position: number, playerNumber: number): number => {
    const startPos = startingPoints[playerNumber - 1];
    const turningPoint = turningPoints[playerNumber - 1];
    
    if (position >= startPos && position <= turningPoint) {
        return (turningPoint - position) + 6; // Distance to turning point + home stretch
    } else if (position > turningPoint) {
        return (52 - position + turningPoint) + 6;
    }
    return 0;
};