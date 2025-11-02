import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';

import LoginScreen from './src/screens/LoginScreen';
import SignUpScreen from './src/screens/SignUpScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import LeadershipIntroScreen from './src/screens/LeadershipIntroScreen';
import QuizLandingScreen from './src/screens/QuizLandingScreen';
import QuizScreen from './src/screens/QuizScreen';
import AddGoalScreen from './src/screens/AddGoalScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import CookiePolicyScreen from './src/screens/CookiePolicyScreen';
import TermsConditionsScreen from './src/screens/TermsConditionsScreen';
import ActionPickerScreen from './src/screens/ActionPickerScreen';
import GoalConfigurationScreen from './src/screens/GoalConfigurationScreen';
import QuizHubScreen from './src/screens/QuizHubScreen';
import PurposeHabitsScreen from './src/screens/PurposeHabitsScreen';
import TransferScreen from './src/screens/TransferScreen';
import DonateScreen from './src/screens/DonateScreen';
import MedaaAIScreen from './src/screens/MedaaAIScreen';
import AddCustomHabitScreen from './src/screens/AddCustomHabitScreen';
import CustomHabitsScreen from './src/screens/CustomHabitsScreen';

import { UserSessionService } from './src/services/UserSessionService';

const Stack = createStackNavigator();

function App() {
  const [initialRoute, setInitialRoute] = useState(null);
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    checkInitialRoute();
  }, []);

  const checkInitialRoute = async () => {
    try {
      // Check if user is signed in
      const isSignedIn = await UserSessionService.isCurrentUserSignedIn();
      const isFirstTime = await UserSessionService.isFirstTimeUser();
      
      if (isSignedIn) {
        // User is signed in - go directly to Dashboard
        console.log('✅ User is signed in, going to Dashboard');
        setInitialRoute('Dashboard');
      } else if (isFirstTime) {
        // First time user - show Leadership Intro
        console.log('👋 First time user, showing Leadership Intro');
        setInitialRoute('LeadershipIntro');
      } else {
        // Returning user but not signed in - show Leadership Intro
        console.log('🔄 Returning user, showing Leadership Intro');
        setInitialRoute('LeadershipIntro');
      }
      setIsReady(true);
    } catch (error) {
      console.error('Error checking auth status:', error);
      setInitialRoute('LeadershipIntro');
      setIsReady(true);
    }
  };

  if (!isReady) {
    return null; // Or a loading screen
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator 
        initialRouteName={initialRoute}
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: '#20C997',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen 
          name="Login" 
          component={LoginScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="SignUp" 
          component={SignUpScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Dashboard" 
          component={DashboardScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="LeadershipIntro" 
          component={LeadershipIntroScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="QuizLanding" 
          component={QuizLandingScreen} 
          options={{ title: 'Leadership Assessment' }}
        />
        <Stack.Screen 
          name="Quiz" 
          component={QuizScreen} 
          options={{ title: 'Assessment' }}
        />
        <Stack.Screen 
          name="AddGoal" 
          component={AddGoalScreen} 
          options={{ title: 'Add Habit' }}
        />
        <Stack.Screen 
          name="Profile" 
          component={ProfileScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="PrivacyPolicy" 
          component={PrivacyPolicyScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CookiePolicy" 
          component={CookiePolicyScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="TermsConditions" 
          component={TermsConditionsScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="ActionPicker" 
          component={ActionPickerScreen} 
          options={{ 
            title: 'Choose Habits',
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="GoalConfiguration" 
          component={GoalConfigurationScreen} 
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="QuizHub" 
          component={QuizHubScreen} 
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="PurposeHabits" 
          component={PurposeHabitsScreen} 
          options={{ 
            headerShown: false 
          }}
        />
        <Stack.Screen 
          name="Transfer" 
          component={TransferScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="Donate" 
          component={DonateScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="MedaaAI" 
          component={MedaaAIScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="AddCustomHabit" 
          component={AddCustomHabitScreen} 
          options={{ headerShown: false }}
        />
        <Stack.Screen 
          name="CustomHabits" 
          component={CustomHabitsScreen} 
          options={{ headerShown: false }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
export default App;


