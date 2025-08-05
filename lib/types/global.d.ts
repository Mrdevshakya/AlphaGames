// Global type definitions for the Ludo game

interface PLAYER_PIECE {
  id: string;
  pos: number;
  travelCount: number;
}

interface INITIAL_STATE {
  player1: PLAYER_PIECE[];
  player2: PLAYER_PIECE[];
  player3: PLAYER_PIECE[];
  player4: PLAYER_PIECE[];
  chancePlayer: number;
  diceNo: number;
  isDiceRolled: boolean;
  pileSelectionPlayer: number;
  cellSelectionPlayer: number;
  touchDiceBlock: boolean;
  currentPosition: Array<{ id: string; pos: number }>;
  fireworks: boolean;
  winner: number | null;
}

type SOUND_NAME = 
  | 'dice_roll'
  | 'cheer'
  | 'collide'
  | 'game_start'
  | 'sound_girl1'
  | 'sound_girl2'
  | 'sound_girl3'
  | 'sound_girl0'
  | 'home'
  | 'home_win'
  | 'pile_move'
  | 'safe_spot'
  | 'ui';

interface GameState {
  board: number[];
  players: Player[];
  currentPlayerIndex: number;
  diceValue: number | null;
  gameStatus: 'waiting' | 'playing' | 'finished';
  winner: number | null;
  lastMove: string | null;
}

interface Player {
  id: number;
  color: 'red' | 'blue' | 'green' | 'yellow';
  pieces: GamePiece[];
  isAI?: boolean;
  name?: string;
}

interface GamePiece {
  id: string;
  position: string | number;
  status: 'in_yard' | 'on_board' | 'finished';
  travelCount?: number;
}

interface GameSettings {
  gameMode: 'single' | 'multiplayer' | 'tournament';
  playerCount: 2 | 3 | 4;
  aiDifficulty: 'easy' | 'medium' | 'hard';
  soundEnabled: boolean;
  animationsEnabled: boolean;
  gameSpeed: 'slow' | 'normal' | 'fast';
}

interface Tournament {
  id: string;
  name: string;
  entryFee: number;
  prizePool: number;
  maxParticipants: number;
  currentParticipants: number;
  status: 'upcoming' | 'active' | 'completed';
  startTime: string;
  endTime?: string;
  participants: TournamentParticipant[];
  brackets?: TournamentBracket[];
}

interface TournamentParticipant {
  userId: string;
  userName: string;
  rank?: number;
  eliminated?: boolean;
  winnings?: number;
}

interface TournamentBracket {
  round: number;
  matches: TournamentMatch[];
}

interface TournamentMatch {
  id: string;
  player1: string;
  player2: string;
  winner?: string;
  status: 'pending' | 'active' | 'completed';
  gameId?: string;
}

interface UserStats {
  gamesPlayed: number;
  gamesWon: number;
  totalEarnings: number;
  currentRank: string;
  winRate: number;
  longestWinStreak: number;
  averageGameTime: number;
  favoriteColor: string;
}

interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  unlocked: boolean;
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

interface WalletTransaction {
  id: string;
  type: 'credit' | 'debit';
  amount: number;
  description: string;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
  method?: string;
}

interface GameRoom {
  id: string;
  hostId: string;
  players: RoomPlayer[];
  gameSettings: GameSettings;
  status: 'waiting' | 'starting' | 'active' | 'finished';
  createdAt: string;
  gameState?: GameState;
}

interface RoomPlayer {
  userId: string;
  userName: string;
  isReady: boolean;
  color?: 'red' | 'blue' | 'green' | 'yellow';
  isHost: boolean;
}

interface MultiplayerMove {
  playerId: string;
  pieceId: string;
  fromPosition: number;
  toPosition: number;
  diceValue: number;
  timestamp: string;
  moveType: 'normal' | 'capture' | 'home' | 'start';
}

declare module '*.png' {
  const value: any;
  export default value;
}

declare module '*.jpg' {
  const value: any;
  export default value;
}

declare module '*.mp3' {
  const value: any;
  export default value;
}

declare module '*.json' {
  const value: any;
  export default value;
}