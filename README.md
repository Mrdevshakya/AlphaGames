# 🎲 Ludo King - Full-Featured Gaming App

A comprehensive Ludo game application built with React Native and Expo, similar to Zupee, featuring multiplayer gameplay, tournaments, wallet system, and real-money gaming capabilities.

## 📱 Features

### ✅ Phase 1 - Core Features (Completed)
- **Authentication System**
  - Phone OTP login/registration
  - User profile management
  - Auto-login functionality

- **Game Board & Logic**
  - Complete Ludo board with proper layout
  - 4-player support with different colors
  - Dice rolling with animations
  - Token movement with game rules
  - Turn-based gameplay
  - Win/lose detection

- **Room System**
  - Create private rooms with custom settings
  - Join rooms using 6-digit codes
  - Room management and player lobby

- **Tournament System**
  - Browse available tournaments
  - Join tournaments with entry fees
  - Tournament brackets and progression
  - Prize pool distribution

- **Wallet System**
  - Add money via payment gateway simulation
  - Withdraw money to UPI
  - Transaction history
  - Balance management

- **User Interface**
  - Modern dark theme design
  - Smooth animations and transitions
  - Responsive layout for all screen sizes
  - Intuitive navigation

### 🚧 Phase 2 - Advanced Features (Planned)
- **Firebase Integration**
  - Real-time multiplayer gameplay
  - Cloud data synchronization
  - User authentication with Firebase Auth
  - Firestore database integration

- **Payment Integration**
  - Razorpay/Cashfree integration
  - Real money transactions
  - Secure payment processing

- **Enhanced Features**
  - Push notifications
  - Sound effects and music
  - Chat system
  - Friend system
  - Leaderboards

## 🛠 Tech Stack

- **Frontend**: React Native with Expo
- **Navigation**: React Navigation 6
- **State Management**: React Context API
- **Storage**: AsyncStorage (Phase 1) → Firebase (Phase 2)
- **UI Components**: Custom components with React Native
- **Graphics**: React Native SVG for game board
- **Animations**: React Native Animated API
- **Notifications**: Expo Notifications

## 📁 Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── GameBoard.js     # Main Ludo board component
│   └── DiceRoller.js    # Dice rolling component
├── screens/             # App screens
│   ├── LoginScreen.js   # Authentication screens
│   ├── RegisterScreen.js
│   ├── HomeScreen.js    # Main lobby/dashboard
│   ├── GameScreen.js    # Game playing screen
│   ├── CreateRoomScreen.js
│   ├── JoinRoomScreen.js
│   ├── TournamentsScreen.js
│   └── WalletScreen.js
├── services/            # Business logic services
│   ├── gameLogic.js     # Ludo game rules and logic
│   └── notificationService.js
├── utils/               # Utility functions
│   ├── constants.js     # App constants
│   └── storage.js       # AsyncStorage wrapper
└── assets/              # Images, sounds, fonts
    ├── images/
    └── sounds/
```

## 🚀 Getting Started

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
   cd ludo-game-app
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

## 🎮 How to Play

### Game Rules
1. Each player has 4 tokens that start in their home area
2. Roll a 6 to move a token out of home
3. Move tokens clockwise around the board
4. Land on opponent tokens to capture them (send back to home)
5. Safe positions (marked with stars) protect tokens from capture
6. First player to get all 4 tokens to the center wins

### App Features
1. **Login/Register**: Use phone number and OTP verification
2. **Home Screen**: View wallet balance, join tournaments, create/join rooms
3. **Create Room**: Set up custom games with entry fees
4. **Join Room**: Enter 6-digit room codes to join games
5. **Tournaments**: Participate in scheduled tournaments
6. **Wallet**: Add money, withdraw winnings, view transaction history

## 💰 Monetization Features

### Wallet System
- **Add Money**: Minimum ₹10, Maximum ₹10,000
- **Withdraw**: Minimum ₹50, processed within 24 hours
- **Transaction History**: Complete record of all transactions

### Tournament System
- **Entry Fees**: Configurable tournament entry fees
- **Prize Pools**: Distributed among winners
- **Tournament Types**: Daily, Weekly, Special events

### Room System
- **Entry Fees**: Optional entry fees for private rooms
- **Winner Takes All**: Prize pool goes to the winner

## 🔧 Configuration

### Environment Variables
Create a `.env` file in the root directory:
```env
EXPO_PUBLIC_API_URL=your_api_url
EXPO_PUBLIC_RAZORPAY_KEY=your_razorpay_key
EXPO_PUBLIC_FIREBASE_CONFIG=your_firebase_config
```

### App Configuration
Edit `src/utils/constants.js` to modify:
- Minimum/maximum wallet amounts
- Tournament settings
- Game rules
- UI themes

## 📱 Screenshots

[Add screenshots of different screens here]

## 🧪 Testing

### Manual Testing Checklist
- [ ] User registration and login
- [ ] Game board rendering
- [ ] Dice rolling functionality
- [ ] Token movement
- [ ] Room creation and joining
- [ ] Tournament participation
- [ ] Wallet operations
- [ ] Navigation between screens

### Automated Testing
```bash
# Run tests (when implemented)
npm test
```

## 🚀 Deployment

### Android APK Build
```bash
expo build:android
```

### iOS IPA Build
```bash
expo build:ios
```

### Web Deployment
```bash
expo build:web
npm run deploy
```

## 🔮 Future Enhancements

### Phase 2 Features
- [ ] Firebase real-time multiplayer
- [ ] Voice chat during games
- [ ] Spectator mode
- [ ] Replay system
- [ ] Advanced statistics
- [ ] Social features (friends, chat)
- [ ] Multiple game variants
- [ ] AI opponents
- [ ] Offline mode

### Phase 3 Features
- [ ] Cross-platform play
- [ ] Esports tournaments
- [ ] Streaming integration
- [ ] NFT integration
- [ ] Cryptocurrency payments
- [ ] VR/AR support

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
- Email: support@ludoking.com
- Discord: [Join our community]

## 🙏 Acknowledgments

- React Native team for the amazing framework
- Expo team for simplifying development
- Ludo game rules and traditional gameplay
- Community contributors and testers

## 📊 Project Status

- **Phase 1**: ✅ Completed (Core features)
- **Phase 2**: 🚧 In Progress (Firebase integration)
- **Phase 3**: 📋 Planned (Advanced features)

---

**Built with ❤️ using React Native and Expo**

*Ready to play? Download the app and start your Ludo journey!* 🎲
