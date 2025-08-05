// Image assets index
export const IMAGES = {
  // Dice images
  Dice1: require('./dice/1.png'),
  Dice2: require('./dice/2.png'),
  Dice3: require('./dice/3.png'),
  Dice4: require('./dice/4.png'),
  Dice5: require('./dice/5.png'),
  Dice6: require('./dice/6.png'),
  
  // Pile/Piece images
  RedPile: require('./piles/red.png'),
  GreenPile: require('./piles/green.png'),
  YellowPile: require('./piles/yellow.png'),
  BluePile: require('./piles/blue.png'),
  
  // Board and UI images
  LudoBoard: require('./LudoBase.jpg'),
  
  // UI Elements (these would need to be created)
  Menu: require('./ui/menu.png'),
  Arrow: require('./ui/arrow.png'),
  Start: require('./ui/start.png'),
  Crown: require('./ui/crown.png'),
  Trophy: require('./ui/trophy.png'),
  
  // Player avatars (using available screenshots)
  Player1: require('./avatars/Screenshot 2025-08-02 003507.png'),
  Player2: require('./avatars/Screenshot 2025-08-02 003517.png'),
  Player3: require('./avatars/Screenshot 2025-08-02 003527.png'),
  Player4: require('./avatars/Screenshot 2025-08-02 003534.png'),
};

// Default fallback images
const defaultDice = require('./dice/1.png');
const defaultPile = require('./piles/red.png');

// Helper function to get dice image
export const getDiceImage = (number) => {
  switch (number) {
    case 1: return IMAGES.Dice1;
    case 2: return IMAGES.Dice2;
    case 3: return IMAGES.Dice3;
    case 4: return IMAGES.Dice4;
    case 5: return IMAGES.Dice5;
    case 6: return IMAGES.Dice6;
    default: return defaultDice;
  }
};

// Helper function to get pile image by color
export const getPileImage = (color) => {
  switch (color.toLowerCase()) {
    case 'red': return IMAGES.RedPile;
    case 'green': return IMAGES.GreenPile;
    case 'yellow': return IMAGES.YellowPile;
    case 'blue': return IMAGES.BluePile;
    default: return defaultPile;
  }
};

export default IMAGES;