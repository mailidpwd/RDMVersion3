# Setup Guide for RDM Assistant

## Quick Start

### Step 1: Install Dependencies

```bash
npm install
```

### Step 2: Start the App

```bash
npm start
```

### Step 3: Connect Your Android Device

**Option A: Using USB Debugging**
1. Enable USB debugging on your Android device
2. Connect device via USB
3. Run: `npm run android`

**Option B: Using Expo Go**
1. Install Expo Go app from Play Store
2. Scan QR code from terminal with Expo Go
3. App will launch automatically

## Testing the App

### 1. First Launch
- App will show Leadership Intro screen (first-time users)
- Tap "Unlock Potential" to see quiz categories
- Skip to go directly to Dashboard

### 2. Sign Up
- Tap "Sign Up" on login screen
- Enter any email and password (demo mode)
- Create your account

### 3. Dashboard Features
- **Mood Assessment**: Tap any emoji to select your mood
- **Add Habit**: Tap "+" button to add custom habits
- **Goal Meter**: See your progress

### 4. Take Quiz
- Navigate to Leadership Assessment
- Choose a category (Mindfulness, Purposefulness, Empathy)
- Answer 10 questions on a 1-5 scale
- Tap help button (?) to see explanations
- Submit to see your score

### 5. Custom Habits
- Add new habits from Dashboard
- View all your habits
- Track progress over time

## Configuration

### Gemini API Key (Optional)
To enable AI-powered suggestions:
1. Get API key from https://makersuite.google.com/app/apikey
2. Update `src/services/GeminiService.js`:
```javascript
static API_KEY = 'YOUR_ACTUAL_API_KEY';
```

## Troubleshooting

### Issue: App won't start
```bash
# Clear cache and reinstall
rm -rf node_modules
npm install
npm start -- --clear
```

### Issue: Can't connect to device
- Check USB debugging is enabled
- Try using Expo Go instead
- Restart development server

### Issue: Navigation errors
- Check that all screen files exist in `src/screens/`
- Verify imports in `App.js`

## Development Tips

1. **Hot Reload**: Enabled by default - save files to see changes instantly
2. **Debug**: Shake device and select "Debug" for React Native debugger
3. **Reload**: Shake device and tap "Reload" to restart app
4. **Console**: Check terminal for logs and errors

## File Structure

```
src/
├── screens/          # All UI screens
├── services/          # Business logic
├── constants/       # App constants
└── components/     # Reusable components
```

## Next Steps

1. Add more quiz categories
2. Implement habit tracking
3. Connect to backend API
4. Add data visualization charts
5. Implement social features

## Support

For issues, check:
- Terminal logs
- Expo documentation: https://docs.expo.dev
- React Native docs: https://reactnative.dev

