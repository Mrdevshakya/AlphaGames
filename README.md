# 🎲 AlphaGames - Multi-Game Mobile App

A comprehensive mobile gaming application built with React Native and Expo, featuring multiple games including Ludo, Minesweeper, and more. The app includes a wallet system, user authentication, and real-money gaming capabilities.

## 📱 Features

### ✅ Core Features
- **Authentication System**
  - Phone OTP login/registration
  - User profile management
  - Auto-login functionality

- **Game Collection**
  - Ludo Classic with multiple modes (1v1, 2v2, 3 Players, 4 Players)
  - Mines Game (Minesweeper variant with betting system)
  - More games to be added

- **Wallet System**
  - In-app currency management
  - Balance display across all game screens
  - Transaction history

- **User Interface**
  - Modern dark theme design
  - Responsive layout for all screen sizes
  - Intuitive navigation with tab-based interface

### 🎮 Game Features

#### Ludo Classic
- Multiple game modes with different player counts
- Entry fees and prize pools for each mode
- Dedicated mode selection screen
- Smooth gameplay experience

#### Mines Game
- 5x5 grid Minesweeper variant
- Adjustable mine count (1-24 mines)
- Bet amount customization
- In-app currency system (no real money transactions)
- Gem collection mechanics
- Cashout functionality
- XP earning system

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: Expo Router
- **State Management**: React Context API
- **Database**: Firebase Firestore
- **Authentication**: Firebase Authentication
- **Storage**: AsyncStorage
- **UI Components**: React Native Elements, Expo Vector Icons
- **Animations**: React Native Animated API

## Complete Project Structure

```
gamin-app/
├── app/                 # App screens and routes
│   ├── (auth)/          # Authentication screens
│   │   ├── LoginScreen.js
│   │   ├── RegisterScreen.js
│   │   └── _layout.js
│   ├── (tabs)/          # Tab-based navigation screens
│   │   ├── games.js     # Games listing screen
│   │   ├── index.js
│   │   ├── leaderboard.js
│   │   ├── tournaments.js
│   │   └── profile/     # Profile section
│   │       ├── index.js
│   │       ├── _layout.js
│   │       └── setting/ # Settings section
│   │           ├── about.js
│   │           ├── edit-profile.js
│   │           ├── help.js
│   │           ├── index.js
│   │           ├── notifications.js
│   │           ├── privacy.js
│   │           ├── refunds.js
│   │           └── terms.js
│   ├── ludo/            # Ludo game screens
│   │   └── modes.js     # Ludo game modes selection
│   ├── wallet/          # Wallet section
│   │   ├── add-money.js
│   │   ├── index.js
│   │   ├── transactions.js
│   │   └── withdraw.js
│   ├── _layout.js       # App layout configuration
│   ├── index.js         # App entry point
│   ├── ludo.js          # Ludo game board
│   ├── main.js          # Main app screen
│   └── mines.js         # Mines game screen
├── lib/                 # Game logic and components
│   ├── LudoBoardScreen/ # Ludo game implementation
│   │   ├── index.tsx
│   │   └── styles.ts
│   ├── MinesBoardScreen/# Mines game implementation
│   │   ├── index.tsx
│   │   └── styles.ts
│   └── components/      # Reusable UI components
│       ├── AlphaGamesButton.tsx
│       ├── AlphaGamesCard.tsx
│       ├── Cell.tsx
│       ├── Dice.tsx
│       ├── FourTriangle.tsx
│       ├── GradientButton.tsx
│       ├── HorizontalPath.tsx
│       ├── MenuModal.tsx
│       ├── Pile.tsx
│       ├── Pocket.tsx
│       ├── SplashScreen.tsx
│       ├── VerticalPath.tsx
│       ├── WinnerModal.tsx
│       └── Wrapper.tsx
├── src/                 # Services and utilities
│   ├── services/        # Firebase and API services
│   │   ├── aiPlayerService.js
│   │   ├── enhancedGameLogic.js
│   │   ├── firebaseService.js
│   │   ├── gameLogic.js
│   │   ├── multiplayerService.js
│   │   ├── notificationService.js
│   │   ├── paymentService.js
│   │   ├── statisticsService.js
│   │   └── tournamentService.js
│   └── utils/           # Utility functions
├── assets/              # Images, sounds, fonts
└── admin/               # Admin panel (if applicable)
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn
- Expo CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gamin-app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   # or
   expo start
   ```

4. **Run on device/simulator**
   - For Android: `npm run android` or scan QR code with Expo Go
   - For iOS: `npm run ios` or scan QR code with Expo Go
   - For Web: `npm run web`

## 🎮 Game Descriptions

### Ludo Classic
Ludo is a strategy board game for 2 to 4 players. Each player has 4 tokens that start in their home area. Players take turns rolling a dice to move their tokens around the board. The first player to get all 4 tokens to the center wins.

#### Game Modes
1. **1 vs 1**: Two-player competitive mode
2. **2 vs 2**: Team-based gameplay
3. **3 Players**: Three-player variant
4. **4 Players**: Classic four-player mode

### Mines Game
A variant of Minesweeper with a betting system. Players select the number of mines on a 5x5 grid and place bets. The goal is to reveal as many safe cells (with gems) as possible without hitting a mine.

#### Game Mechanics
- Adjustable mine count (1-24)
- Bet amount customization
- All safe cells contain gems
- Cashout at any time during gameplay
- Winnings based on revealed cells and gems

## 💰 Wallet System

The app uses an in-app currency system:
- Displayed as ₹ (Rupees) throughout the app
- Used for entry fees in games
- Updated in real-time through Firebase
- No real money transactions (for now)

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_FIREBASE_API_KEY=your_firebase_api_key
EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN=your_firebase_auth_domain
EXPO_PUBLIC_FIREBASE_PROJECT_ID=your_firebase_project_id
EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET=your_firebase_storage_bucket
EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_firebase_messaging_sender_id
EXPO_PUBLIC_FIREBASE_APP_ID=your_firebase_app_id
```

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Game board rendering
- [ ] Ludo gameplay
- [ ] Mines game gameplay
- [ ] Wallet balance updates
- [ ] Navigation between screens
- [ ] Mode selection for Ludo

### Automated Testing
```bash
# Run tests (when implemented)
npm test
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Expo team for simplifying development
- Community contributors and testers

---

**Built with ❤️ using React Native and Expo**

*Ready to play? Download the app and start your gaming journey!* 🎲
