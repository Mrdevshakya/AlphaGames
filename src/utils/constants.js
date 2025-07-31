// App Constants
export const APP_CONFIG = {
  APP_NAME: 'AlphaGames',
  VERSION: '1.0.0',
  MIN_WALLET_BALANCE: 10,
  MAX_WALLET_BALANCE: 50000,
  MIN_WITHDRAWAL_AMOUNT: 50,
  MAX_WITHDRAWAL_AMOUNT: 10000,
};

// Game Constants
export const GAME_CONFIG = {
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  TOKENS_PER_PLAYER: 4,
  DICE_MIN: 1,
  DICE_MAX: 6,
  BOARD_SIZE: 15,
  WINNING_DICE_ROLL: 6, // Required to start from home
};

// Player Colors
export const PLAYER_COLORS = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
};

// Game Status
export const GAME_STATUS = {
  WAITING: 'waiting',
  PLAYING: 'playing',
  FINISHED: 'finished',
  CANCELLED: 'cancelled',
};

// Tournament Types
export const TOURNAMENT_TYPES = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  SPECIAL: 'special',
  BEGINNER: 'beginner',
  QUICK: 'quick',
};

// Transaction Types
export const TRANSACTION_TYPES = {
  CREDIT: 'credit',
  DEBIT: 'debit',
  WITHDRAWAL: 'withdrawal',
  REFUND: 'refund',
};

// Transaction Status
export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  CANCELLED: 'cancelled',
};

// Room Types
export const ROOM_TYPES = {
  PUBLIC: 'public',
  PRIVATE: 'private',
};

// Game Modes
export const GAME_MODES = {
  CLASSIC: 'classic',
  QUICK: 'quick',
  TOURNAMENT: 'tournament',
};

// Notification Types
export const NOTIFICATION_TYPES = {
  GAME_INVITE: 'game_invite',
  TOURNAMENT_START: 'tournament_start',
  GAME_WIN: 'game_win',
  WALLET_CREDIT: 'wallet_credit',
  WITHDRAWAL_SUCCESS: 'withdrawal_success',
};

// API Endpoints (for future Firebase integration)
export const API_ENDPOINTS = {
  AUTH: '/auth',
  USERS: '/users',
  GAMES: '/games',
  TOURNAMENTS: '/tournaments',
  WALLET: '/wallet',
  NOTIFICATIONS: '/notifications',
};

// Storage Keys
export const STORAGE_KEYS = {
  USER_DATA: 'userData',
  GAME_STATE: 'gameState',
  SETTINGS: 'appSettings',
  ROOM_PREFIX: 'room_',
  TOURNAMENT_PREFIX: 'tournament_',
};

// Error Messages
export const ERROR_MESSAGES = {
  NETWORK_ERROR: 'Network error. Please check your connection.',
  INVALID_CREDENTIALS: 'Invalid credentials. Please try again.',
  INSUFFICIENT_BALANCE: 'Insufficient wallet balance.',
  ROOM_NOT_FOUND: 'Room not found. Please check the room code.',
  ROOM_FULL: 'Room is full. Please try another room.',
  GAME_IN_PROGRESS: 'Game is already in progress.',
  INVALID_MOVE: 'Invalid move. Please try again.',
  SERVER_ERROR: 'Server error. Please try again later.',
};

// Success Messages
export const SUCCESS_MESSAGES = {
  LOGIN_SUCCESS: 'Login successful!',
  REGISTRATION_SUCCESS: 'Account created successfully!',
  ROOM_CREATED: 'Room created successfully!',
  ROOM_JOINED: 'Joined room successfully!',
  TOURNAMENT_JOINED: 'Tournament joined successfully!',
  MONEY_ADDED: 'Money added to wallet successfully!',
  WITHDRAWAL_REQUESTED: 'Withdrawal request submitted successfully!',
};

// App Theme Colors
export const THEME_COLORS = {
  PRIMARY: '#1a1a2e',
  SECONDARY: '#16213e',
  ACCENT: '#e94560',
  SUCCESS: '#2ecc71',
  WARNING: '#f39c12',
  ERROR: '#e74c3c',
  INFO: '#3498db',
  GOLD: '#ffd700',
  WHITE: '#ffffff',
  LIGHT_GRAY: '#cccccc',
  DARK_GRAY: '#666666',
  TRANSPARENT: 'transparent',
};

// Animation Durations
export const ANIMATION_DURATIONS = {
  FAST: 200,
  NORMAL: 300,
  SLOW: 500,
  DICE_ROLL: 1000,
  TOKEN_MOVE: 800,
};

// Sound Effects (for future implementation)
export const SOUND_EFFECTS = {
  DICE_ROLL: 'dice_roll.mp3',
  TOKEN_MOVE: 'token_move.mp3',
  TOKEN_CAPTURE: 'token_capture.mp3',
  GAME_WIN: 'game_win.mp3',
  BUTTON_CLICK: 'button_click.mp3',
  NOTIFICATION: 'notification.mp3',
};

// Validation Rules
export const VALIDATION_RULES = {
  PHONE_NUMBER: {
    MIN_LENGTH: 10,
    MAX_LENGTH: 10,
    PATTERN: /^[0-9]{10}$/,
  },
  OTP: {
    LENGTH: 6,
    PATTERN: /^[0-9]{6}$/,
  },
  ROOM_CODE: {
    LENGTH: 6,
    PATTERN: /^[A-Z0-9]{6}$/,
  },
  UPI_ID: {
    PATTERN: /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/,
  },
  NAME: {
    MIN_LENGTH: 2,
    MAX_LENGTH: 50,
    PATTERN: /^[a-zA-Z\s]+$/,
  },
};

// Default Values
export const DEFAULT_VALUES = {
  WALLET_BALANCE: 0,
  GAMES_PLAYED: 0,
  GAMES_WON: 0,
  TOURNAMENT_ENTRY_FEE: 50,
  ROOM_MAX_PLAYERS: 4,
  DICE_VALUE: 1,
};