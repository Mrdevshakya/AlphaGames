// Helper utility functions for the Ludo game app

// Format currency
export const formatCurrency = (amount) => {
  return `₹${amount.toLocaleString('en-IN')}`;
};

// Format date and time
export const formatDateTime = (timestamp) => {
  const date = new Date(timestamp);
  return date.toLocaleString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Generate random room code
export const generateRoomCode = (length = 6) => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// Validate phone number
export const validatePhoneNumber = (phone) => {
  const phoneRegex = /^[0-9]{10}$/;
  return phoneRegex.test(phone);
};

// Validate OTP
export const validateOTP = (otp) => {
  const otpRegex = /^[0-9]{6}$/;
  return otpRegex.test(otp);
};

// Validate room code
export const validateRoomCode = (code) => {
  const codeRegex = /^[A-Z0-9]{6}$/;
  return codeRegex.test(code.toUpperCase());
};

// Validate UPI ID
export const validateUPI = (upiId) => {
  const upiRegex = /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/;
  return upiRegex.test(upiId);
};

// Calculate win percentage
export const calculateWinPercentage = (gamesWon, gamesPlayed) => {
  if (gamesPlayed === 0) return 0;
  return Math.round((gamesWon / gamesPlayed) * 100);
};

// Get player color
export const getPlayerColor = (player) => {
  const colors = {
    red: '#e74c3c',
    blue: '#3498db',
    green: '#2ecc71',
    yellow: '#f1c40f',
  };
  return colors[player] || '#666';
};

// Get time until tournament starts
export const getTimeUntilStart = (startTime) => {
  const now = new Date();
  const start = new Date(startTime);
  const diff = start - now;

  if (diff <= 0) return 'Started';

  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
};

// Shuffle array (for randomizing players)
export const shuffleArray = (array) => {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

// Debounce function
export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

// Deep clone object
export const deepClone = (obj) => {
  return JSON.parse(JSON.stringify(obj));
};

// Check if object is empty
export const isEmpty = (obj) => {
  return Object.keys(obj).length === 0;
};

// Capitalize first letter
export const capitalize = (str) => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

// Generate unique ID
export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

// Format large numbers
export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Get greeting based on time
export const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  return 'Good Evening';
};

// Check if user is online (mock function)
export const isUserOnline = (lastSeen) => {
  const now = new Date();
  const lastSeenDate = new Date(lastSeen);
  const diffMinutes = (now - lastSeenDate) / (1000 * 60);
  return diffMinutes < 5; // Consider online if last seen within 5 minutes
};

// Get tournament status color
export const getTournamentStatusColor = (status) => {
  switch (status) {
    case 'open': return '#2ecc71';
    case 'started': return '#f39c12';
    case 'completed': return '#666';
    default: return '#666';
  }
};

// Calculate tournament prize distribution
export const calculatePrizeDistribution = (prizePool, participants) => {
  const distribution = [];
  const totalPrize = prizePool * 0.9; // 10% platform fee
  
  // Winner gets 60%, Runner-up gets 30%, Third gets 10%
  distribution.push({
    position: 1,
    prize: Math.round(totalPrize * 0.6),
    percentage: 60
  });
  
  if (participants >= 4) {
    distribution.push({
      position: 2,
      prize: Math.round(totalPrize * 0.3),
      percentage: 30
    });
  }
  
  if (participants >= 8) {
    distribution.push({
      position: 3,
      prize: Math.round(totalPrize * 0.1),
      percentage: 10
    });
  }
  
  return distribution;
};