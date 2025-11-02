import AsyncStorage from '@react-native-async-storage/async-storage';

class UserSessionService {
  static CURRENT_USER_KEY = 'current_user';
  static IS_FIRST_TIME_KEY = 'is_first_time';
  static USER_DATA_PREFIX = 'user_data_';

  // Check if this is first time user
  static async isFirstTimeUser() {
    const value = await AsyncStorage.getItem(this.IS_FIRST_TIME_KEY);
    return value === null;
  }

  // Mark user as returning
  static async markUserAsReturning() {
    await AsyncStorage.setItem(this.IS_FIRST_TIME_KEY, 'false');
  }

  // Get current user email
  static async getCurrentUserEmail() {
    return await AsyncStorage.getItem(this.CURRENT_USER_KEY);
  }

  // Set current user email
  static async setCurrentUserEmail(email) {
    await AsyncStorage.setItem(this.CURRENT_USER_KEY, email);
  }

  // Switch user
  static async switchUser(newEmail) {
    console.log('UserSessionService: Switching to user:', newEmail);
    const currentEmail = await this.getCurrentUserEmail();
    
    // Clear old user data if switching
    if (currentEmail && currentEmail !== newEmail) {
      await this.clearUserData(currentEmail);
    }
    
    await this.setCurrentUserEmail(newEmail);
    await this.markUserAsReturning();
  }

  // Logout
  static async logout() {
    await AsyncStorage.removeItem(this.CURRENT_USER_KEY);
  }

  // Check if current user is signed in
  static async isCurrentUserSignedIn() {
    const email = await this.getCurrentUserEmail();
    return email !== null && email !== undefined && email !== '';
  }

  // Save user-specific data
  static async saveUserData(email, key, value) {
    const userKey = `${this.USER_DATA_PREFIX}${email}_${key}`;
    
    if (typeof value === 'object') {
      await AsyncStorage.setItem(userKey, JSON.stringify(value));
    } else {
      await AsyncStorage.setItem(userKey, value.toString());
    }
  }

  // Get user-specific data
  static async getUserData(email, key, defaultValue = null) {
    const userKey = `${this.USER_DATA_PREFIX}${email}_${key}`;
    const value = await AsyncStorage.getItem(userKey);
    
    if (value === null) return defaultValue;
    
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }

  // Clear user data
  static async clearUserData(email) {
    const keys = await AsyncStorage.getAllKeys();
    const prefix = `${this.USER_DATA_PREFIX}${email}_`;
    
    const userKeys = keys.filter(key => key.startsWith(prefix));
    await AsyncStorage.multiRemove(userKeys);
  }

  // Get AsyncStorage item (generic)
  static async getAsyncStorageItem(key) {
    return await AsyncStorage.getItem(key);
  }

  // Set AsyncStorage item (generic)
  static async setAsyncStorageItem(key, value) {
    await AsyncStorage.setItem(key, value);
  }
}

export { UserSessionService };

