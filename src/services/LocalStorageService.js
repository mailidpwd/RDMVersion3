import AsyncStorage from '@react-native-async-storage/async-storage';

class LocalStorageService {
  // User session management
  static async getCurrentUserEmail() {
    try {
      const email = await AsyncStorage.getItem('current_user');
      return email;
    } catch (error) {
      console.error('Error getting current user:', error);
      return null;
    }
  }

  static async setCurrentUserEmail(email) {
    try {
      await AsyncStorage.setItem('current_user', email);
    } catch (error) {
      console.error('Error setting current user:', error);
    }
  }

  static async isFirstTimeUser() {
    try {
      const value = await AsyncStorage.getItem('is_first_time');
      return value === null || value === 'true';
    } catch (error) {
      console.error('Error checking first time user:', error);
      return true;
    }
  }

  static async markUserAsReturning() {
    try {
      await AsyncStorage.setItem('is_first_time', 'false');
    } catch (error) {
      console.error('Error marking user as returning:', error);
    }
  }

  static async clearUserData(email) {
    try {
      const allKeys = await AsyncStorage.getAllKeys();
      const prefix = `user_data_${email}_`;
      
      const keysToRemove = allKeys.filter(key => key.startsWith(prefix));
      await AsyncStorage.multiRemove(keysToRemove);
    } catch (error) {
      console.error('Error clearing user data:', error);
    }
  }

  // Save user-specific data with email prefix
  static async saveUserData(email, key, value) {
    try {
      const userKey = `user_data_${email}_${key}`;
      
      if (typeof value === 'string') {
        await AsyncStorage.setItem(userKey, value);
      } else if (typeof value === 'number') {
        await AsyncStorage.setItem(userKey, value.toString());
      } else if (typeof value === 'boolean') {
        await AsyncStorage.setItem(userKey, value.toString());
      } else {
        // For complex objects, convert to JSON
        await AsyncStorage.setItem(userKey, JSON.stringify(value));
      }
    } catch (error) {
      console.error('Error saving user data:', error);
    }
  }

  // Get user-specific data with email prefix
  static async getUserData(email, key, defaultValue = null) {
    try {
      const userKey = `user_data_${email}_${key}`;
      const value = await AsyncStorage.getItem(userKey);
      
      if (value === null) return defaultValue;
      
      // Try to parse as JSON
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (error) {
      console.error('Error getting user data:', error);
      return defaultValue;
    }
  }

  // Save generic key-value data (for backward compatibility)
  static async saveData(key, value) {
    try {
      if (typeof value === 'object') {
        await AsyncStorage.setItem(key, JSON.stringify(value));
      } else {
        await AsyncStorage.setItem(key, value);
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  // Get generic key-value data (for backward compatibility)
  static async getData(key, defaultValue = null) {
    try {
      const value = await AsyncStorage.getItem(key);
      if (value === null) return defaultValue;
      
      try {
        return JSON.parse(value);
      } catch (e) {
        return value;
      }
    } catch (error) {
      console.error('Error getting data:', error);
      return defaultValue;
    }
  }
}

export default LocalStorageService;

