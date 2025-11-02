# RDM (Rewards for Daily Mindfulness) - Version 3

A beautiful React Native mobile application that rewards users for every mindful action. Track your goals, habits, streaks, and earn tokens while making a positive impact on the environment and charity.

![React Native](https://img.shields.io/badge/React_Native-0.74.5-blue.svg)
![Expo](https://img.shields.io/badge/Expo-~51.0.28-black.svg)
![License](https://img.shields.io/badge/License-MIT-green.svg)

## 📱 Features

### 🎯 Core Features
- **Dashboard**: Beautiful overview of all your activities and progress
- **Goals Tracking**: Set and track daily goals (3L Water, Projects, 30m Reading)
- **Habits Management**: Build and maintain healthy habits (Meditation, Steps, No Sugar)
- **Streak Counter**: Track your consecutive days of achievement
- **Token System**: Earn tokens (245+) for completing tasks
- **Charity Integration**: Contribute to charity through your achievements
- **CO₂ Tracking**: Monitor your environmental impact (32kg+)

### 📊 Advanced Features
- **Leadership Score**: Track your overall progress with a 51% score system
- **Goal Meter**: Visual bar chart showing daily achievements
- **Portfolio Management**: Track your USDT/RDM portfolio value
- **Daily Bundles**: 
  - Morning Warmup (6-10 AM)
  - Afternoon Booster (1-3 PM)
  - Evening Winddown (7-10 PM)
- **Water Tracking**: Track your daily 3L water intake with visual feedback
- **Custom Goals & Habits**: Create personalized goals and habits

## 🚀 Getting Started

### Prerequisites

Before you begin, make sure you have the following installed on your computer:

1. **Node.js** (v18 or higher)
   - Download from: https://nodejs.org/
   - Verify installation: Open terminal and type `node --version`

2. **npm** (comes with Node.js)
   - Verify installation: `npm --version`

3. **Expo CLI**
   ```bash
   npm install -g expo-cli
   ```

4. **Git**
   - Download from: https://git-scm.com/
   - Verify installation: `git --version`

5. **Code Editor**
   - Recommended: [Visual Studio Code](https://code.visualstudio.com/)
   - Or use: Cursor, Sublime Text, Atom, etc.

6. **Mobile Device or Emulator**
   - **For Testing on Phone**: Install "Expo Go" app from App Store (iOS) or Play Store (Android)
   - **For Emulator**: 
     - Android: [Android Studio](https://developer.android.com/studio)
     - iOS: Xcode (Mac only)

---

## 📥 Installation Guide

### Step 1: Clone the Repository

Open your terminal (Command Prompt on Windows, Terminal on Mac/Linux) and run:

```bash
git clone https://github.com/mailidpwd/RDMVersion3.git
```

### Step 2: Navigate to Project Folder

```bash
cd RDMVersion3
```

### Step 3: Install Dependencies

```bash
npm install
```

This will install all required packages. It may take a few minutes.

### Step 4: Start the Development Server

```bash
npx expo start
```

Or if you want to use tunnel mode (for testing on different networks):

```bash
npx expo start --tunnel
```

---

## 📱 Running the App

After running `npx expo start`, you'll see a QR code in your terminal.

### Option 1: Test on Your Phone (Easiest!)

1. Install **Expo Go** app on your phone:
   - iOS: https://apps.apple.com/app/expo-go/id982107779
   - Android: https://play.google.com/store/apps/details?id=host.exp.exponent

2. Open Expo Go app

3. Scan the QR code from your terminal:
   - **iOS**: Use the camera app
   - **Android**: Use the Expo Go app scanner

4. Wait for the app to load (first time may take a minute)

### Option 2: Test on Android Emulator

1. Start Android Studio
2. Open AVD Manager
3. Start an emulator
4. Press `a` in the terminal where Expo is running

### Option 3: Test on iOS Simulator (Mac only)

1. Press `i` in the terminal where Expo is running
2. Xcode will open and launch the simulator

---

## 📂 Project Structure

```
RDMVersion3/
├── src/
│   ├── screens/              # All app screens
│   │   ├── DashboardScreen.js       # Main dashboard
│   │   ├── CustomHabitsScreen.js    # Custom habits
│   │   ├── ActionPickerScreen.js    # Habit picker
│   │   └── GoalConfigurationScreen.js
│   ├── components/           # Reusable UI components
│   │   ├── MorningBundleModal.js
│   │   ├── AfternoonBundleModal.js
│   │   ├── EveningBundleModal.js
│   │   └── BottomNavigationBar.js
│   ├── services/             # Business logic & data
│   │   ├── GoalsService.js
│   │   ├── UserSessionService.js
│   │   ├── WaterTrackingService.js
│   │   └── MoodAssessmentService.js
│   └── navigation/           # Navigation configuration
├── assets/                   # Images, fonts, icons
├── App.js                    # Root component
├── package.json              # Dependencies
└── README.md                 # This file!
```

---

## 🛠️ Technologies Used

- **React Native**: Mobile app framework
- **Expo**: Development platform
- **React Navigation**: Screen navigation
- **AsyncStorage**: Local data storage
- **Expo Linear Gradient**: Beautiful gradients
- **Expo AV**: Video playback
- **React Native WebView**: Web content display
- **Vector Icons**: Beautiful icons (Ionicons, MaterialIcons)

---

## 🎨 Key Components

### Dashboard Features
- **Goal Meter**: 7-day bar chart visualization
- **Portfolio Card**: USDT/RDM portfolio tracking
- **Leadership Score**: Overall progress indicator
- **Water Tracking**: 3L daily water intake tracker
- **Mini Metrics**: Goals, Habits, Streak, Tokens, Charity, CO₂

### Bundle Modals
- **Morning Warmup** (6-10 AM): Quote, Puzzle, Meditation
- **Afternoon Booster** (1-3 PM): Joke, Puzzle, Focus Video
- **Evening Winddown** (7-10 PM): Reflection, Gratitude, Sleep prep

---

## 🐛 Troubleshooting

### Problem: "Cannot find module" error
**Solution**: Run `npm install` again

### Problem: Expo won't start
**Solution**: 
```bash
npx expo start --clear
```

### Problem: App not loading on phone
**Solution**: Make sure your phone and computer are on the same WiFi network, or use tunnel mode:
```bash
npx expo start --tunnel
```

### Problem: "Port 8081 already in use"
**Solution**: 
```bash
# Kill the process
npx kill-port 8081
# Or start on different port
npx expo start --port 8082
```

### Problem: Changes not reflecting
**Solution**: 
1. Press `r` in terminal to reload
2. Or shake your phone and press "Reload"

---

## 📝 Common Commands

```bash
# Start development server
npm start

# Start with cleared cache
npx expo start --clear

# Start with tunnel (for different networks)
npx expo start --tunnel

# Install a new package
npm install package-name

# Check for issues
npx expo-doctor

# Build for production (requires Expo account)
npx expo build:android
npx expo build:ios
```

---

## 🔧 Development Workflow

### 1. Open Project in Editor

```bash
# If using VS Code
code .

# If using Cursor
cursor .
```

### 2. Make Changes

Edit any file in the `src/` folder. The app will automatically reload!

### 3. Test Your Changes

- Save the file (Ctrl+S / Cmd+S)
- Wait 2-3 seconds for auto-reload
- Or press `r` in terminal for manual reload

### 4. Check for Errors

Look at:
- Terminal output (where you ran `npx expo start`)
- Red error screen on your phone/emulator
- Console logs: Add `console.log('Test')` in your code

---

## 📤 Pushing to GitHub

### First Time Setup

```bash
# Configure Git (only needed once)
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### Commit Your Changes

```bash
# Check what files changed
git status

# Add all changes
git add .

# Or add specific files
git add README.md
git add src/screens/DashboardScreen.js

# Commit with a message
git commit -m "Add README file with setup instructions"

# Push to GitHub
git push origin main
```

### If Repository is Empty

```bash
# Initialize git (if not already done)
git init

# Add remote repository
git remote add origin https://github.com/mailidpwd/RDMVersion3.git

# Add all files
git add .

# Commit
git commit -m "Initial commit: RDM Version 3 with full features"

# Push to main branch
git push -u origin main
```

---

## 📚 Learning Resources

### React Native Basics
- Official Docs: https://reactnative.dev/docs/getting-started
- Expo Docs: https://docs.expo.dev/

### Tutorials
- React Native Tutorial: https://reactnative.dev/docs/tutorial
- JavaScript ES6: https://www.w3schools.com/js/js_es6.asp

### Community
- Stack Overflow: https://stackoverflow.com/questions/tagged/react-native
- Reddit: https://reddit.com/r/reactnative

---

## 🤝 Contributing

Contributions are welcome! To contribute:

1. Fork the repository
2. Create a new branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Commit: `git commit -m "Add amazing feature"`
5. Push: `git push origin feature/amazing-feature`
6. Open a Pull Request

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 🙏 Acknowledgments

- Icons by [Expo Vector Icons](https://icons.expo.fyi/)
- UI Design inspired by modern wellness apps
- Built with ❤️ using React Native & Expo

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the [Troubleshooting](#-troubleshooting) section
2. Search existing issues on GitHub
3. Create a new issue with:
   - Clear description of the problem
   - Steps to reproduce
   - Screenshots (if applicable)
   - Your environment (OS, Node version, etc.)

---

## 🎯 Roadmap

- [ ] Add authentication (login/signup)
- [ ] Backend integration for data sync
- [ ] Social features (share achievements)
- [ ] More customization options
- [ ] Dark mode support
- [ ] Multi-language support
- [ ] Push notifications
- [ ] Analytics dashboard

---

## 📸 Screenshots

*(Add screenshots of your app here once deployed)*

---

**Made with 💚 for mindful living**

**Version**: 3.0.0  
**Last Updated**: 2025  
**Status**: Active Development  

---

### Quick Start Summary

```bash
# 1. Clone
git clone https://github.com/mailidpwd/RDMVersion3.git

# 2. Install
cd RDMVersion3
npm install

# 3. Run
npx expo start

# 4. Scan QR code with Expo Go app on your phone!
```

**That's it! You're ready to start building! 🚀**
