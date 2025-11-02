import AsyncStorage from '@react-native-async-storage/async-storage';

const WATER_KEY = 'daily_water_intake';

class WaterTrackingService {
  /**
   * Get today's water intake in milliliters
   */
  static async getTodayWaterIntake() {
    try {
      const today = new Date().toDateString();
      const data = await AsyncStorage.getItem(WATER_KEY);
      
      if (!data) return 0;
      
      const waterData = JSON.parse(data);
      
      // Check if it's today's data
      if (waterData.date === today) {
        return waterData.amount || 0;
      }
      
      // If it's old data, reset to 0
      return 0;
    } catch (error) {
      console.error('Error getting water intake:', error);
      return 0;
    }
  }

  /**
   * Set today's water intake in milliliters
   */
  static async setTodayWaterIntake(amount) {
    try {
      const today = new Date().toDateString();
      const waterData = {
        date: today,
        amount: amount,
        updatedAt: new Date().toISOString()
      };
      
      await AsyncStorage.setItem(WATER_KEY, JSON.stringify(waterData));
      return true;
    } catch (error) {
      console.error('Error setting water intake:', error);
      return false;
    }
  }

  /**
   * Add water to today's intake (in ml)
   */
  static async addWater(ml) {
    let current = 0;
    try {
      current = await this.getTodayWaterIntake();
      const newAmount = Math.min(current + ml, 3000); // Max 3L (12 glasses)
      await this.setTodayWaterIntake(newAmount);
      return newAmount;
    } catch (error) {
      console.error('Error adding water:', error);
      return current;
    }
  }

  /**
   * Remove water from today's intake (in ml)
   */
  static async removeWater(ml) {
    let current = 0;
    try {
      current = await this.getTodayWaterIntake();
      const newAmount = Math.max(current - ml, 0); // Min 0ml
      await this.setTodayWaterIntake(newAmount);
      return newAmount;
    } catch (error) {
      console.error('Error removing water:', error);
      return current;
    }
  }

  /**
   * Get water intake in glasses (1 glass = 250ml)
   */
  static async getGlassesCount() {
    const ml = await this.getTodayWaterIntake();
    return Math.floor(ml / 250);
  }

  /**
   * Check if daily goal is complete (12 glasses = 3000ml)
   */
  static async isGoalComplete() {
    const ml = await this.getTodayWaterIntake();
    return ml >= 3000;
  }

  /**
   * Reset water intake (for testing or new day)
   */
  static async reset() {
    try {
      await AsyncStorage.removeItem(WATER_KEY);
      return true;
    } catch (error) {
      console.error('Error resetting water:', error);
      return false;
    }
  }
}

export default WaterTrackingService;

