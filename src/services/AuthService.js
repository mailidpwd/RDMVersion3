import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserSessionService } from './UserSessionService';

class AuthService {
  // Sign up with email and password
  static async signUp(email, password, fullName) {
    try {
      console.log('AuthService: Signing up user with email:', email);
      
      // Simulated sign up - In production, replace with actual Supabase/backend call
      // For demo purposes, we'll simulate a successful sign up
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Create a mock user object
      const mockUser = {
        id: `user_${Date.now()}`,
        email: email,
        full_name: fullName
      };
      
      // Switch user session
      await UserSessionService.switchUser(email);
      await this.saveUserSession(mockUser.id);
      
      // Store user credentials locally for demo
      await AsyncStorage.setItem('user_email', email);
      await AsyncStorage.setItem('user_name', fullName);
      
      console.log('AuthService: User session switched successfully');
      return { user: mockUser };
    } catch (error) {
      console.error('Sign up error:', error);
      throw error;
    }
  }

  // Sign in with email and password
  static async signIn(email, password) {
    try {
      console.log('AuthService: Signing in user with email:', email);
      
      // Simulated sign in - In production, replace with actual Supabase/backend call
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Check if user exists (for demo, accept any credentials)
      const mockUser = {
        id: `user_${Date.now()}`,
        email: email
      };
      
      await UserSessionService.switchUser(email);
      await this.saveUserSession(mockUser.id);
      
      console.log('AuthService: User signed in successfully');
      return { user: mockUser };
    } catch (error) {
      console.error('Sign in error:', error);
      throw error;
    }
  }

  // Sign out
  static async signOut() {
    try {
      await AsyncStorage.removeItem('user_id');
      await AsyncStorage.setItem('is_logged_in', 'false');
      await UserSessionService.logout();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  }

  // Check if user is logged in
  static async isLoggedIn() {
    try {
      const isLoggedIn = await AsyncStorage.getItem('is_logged_in');
      return isLoggedIn === 'true';
    } catch (error) {
      return false;
    }
  }

  // Get current user ID
  static async getCurrentUserId() {
    try {
      return await AsyncStorage.getItem('user_id');
    } catch (error) {
      return null;
    }
  }

  // Save user session
  static async saveUserSession(userId) {
    try {
      await AsyncStorage.setItem('user_id', userId);
      await AsyncStorage.setItem('is_logged_in', 'true');
    } catch (error) {
      console.error('Error saving session:', error);
    }
  }
}

export default AuthService;

