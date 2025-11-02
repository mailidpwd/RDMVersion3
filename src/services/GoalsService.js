import AsyncStorage from '@react-native-async-storage/async-storage';
import LocalStorageService from './LocalStorageService';

// Generate UUID - React Native compatible
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

class GoalsService {
  static GOALS_KEY = 'user_goals';

  // Get user-specific goals key
  static async getUserGoalsKey() {
    const email = await LocalStorageService.getCurrentUserEmail();
    return email ? `user_goals_${email}` : 'user_goals';
  }

  // Add a new goal
  static async addGoal(goal) {
    try {
      console.log('GoalsService: Adding goal:', goal.title);
      const goalsKey = await this.getUserGoalsKey();
      const goalsJson = await AsyncStorage.getItem(goalsKey);

      let goals = [];
      if (goalsJson) {
        goals = JSON.parse(goalsJson);
      }

      const newGoal = {
        id: goal.id || uuidv4(),
        title: goal.title,
        habitName: goal.habitName || goal.title,
        description: goal.description || '',
        category: goal.category || 'general',
        subcategory: goal.subcategory || '',
        targetDate: goal.targetDate || null,
        frequency: goal.frequency || 'daily',
        activityFrequency: goal.activityFrequency || goal.frequency || 'Daily',
        reflection: goal.reflection || '',
        reflections: goal.reflections || goal.reflection || 'Everyday',
        pledgeAmount: goal.pledgeAmount || 0,
        pledgeRdm: goal.pledgeRdm || goal.pledgeAmount || 1,
        createdAt: typeof goal.createdAt === 'string' ? goal.createdAt : (goal.createdAt ? goal.createdAt.toISOString() : new Date().toISOString()),
        completed: false
      };

      goals.push(newGoal);

      await AsyncStorage.setItem(goalsKey, JSON.stringify(goals));
      console.log('GoalsService: ✅ Goal saved successfully');
      return newGoal;
    } catch (error) {
      console.error('GoalsService: Error adding goal:', error);
      throw new Error(`Failed to add goal: ${error.message}`);
    }
  }

  // Get all goals for current user
  static async getUserGoals() {
    try {
      const goalsKey = await this.getUserGoalsKey();
      const goalsJson = await AsyncStorage.getItem(goalsKey);

      if (!goalsJson) {
        return [];
      }

      return JSON.parse(goalsJson).map(data => ({
        id: data.id,
        title: data.title,
        habitName: data.habitName || data.title,
        description: data.description,
        category: data.category,
        subcategory: data.subcategory,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        frequency: data.frequency,
        activityFrequency: data.activityFrequency || data.frequency,
        reflection: data.reflection,
        reflections: data.reflections || data.reflection,
        pledgeAmount: data.pledgeAmount,
        pledgeRdm: data.pledgeRdm || data.pledgeAmount,
        createdAt: new Date(data.createdAt),
        completed: data.completed || false
      }));
    } catch (error) {
      console.error('GoalsService: Error fetching goals:', error);
      return [];
    }
  }

  // Update a goal
  static async updateGoal(goal) {
    try {
      const goalsKey = await this.getUserGoalsKey();
      const goalsJson = await AsyncStorage.getItem(goalsKey);

      if (!goalsJson) {
        throw new Error('No goals found');
      }

      let goals = JSON.parse(goalsJson);
      const goalIndex = goals.findIndex(g => g.id === goal.id);

      if (goalIndex === -1) {
        throw new Error('Goal not found');
      }

      goals[goalIndex] = {
        id: goal.id,
        title: goal.title,
        habitName: goal.habitName || goal.title,
        description: goal.description || '',
        category: goal.category || 'general',
        subcategory: goal.subcategory || '',
        targetDate: goal.targetDate ? (typeof goal.targetDate === 'string' ? goal.targetDate : goal.targetDate.toISOString()) : null,
        frequency: goal.frequency || 'daily',
        activityFrequency: goal.activityFrequency || goal.frequency || 'Daily',
        reflection: goal.reflection || '',
        reflections: goal.reflections || goal.reflection || 'Everyday',
        pledgeAmount: goal.pledgeAmount || 0,
        pledgeRdm: goal.pledgeRdm || goal.pledgeAmount || 1,
        createdAt: typeof goal.createdAt === 'string' ? goal.createdAt : (goal.createdAt ? goal.createdAt.toISOString() : new Date().toISOString()),
        completed: goal.completed || false
      };

      await AsyncStorage.setItem(goalsKey, JSON.stringify(goals));
      return goal;
    } catch (error) {
      throw new Error(`Failed to update goal: ${error.message}`);
    }
  }

  // Delete a goal
  static async deleteGoal(goalId) {
    try {
      const goalsKey = await this.getUserGoalsKey();
      const goalsJson = await AsyncStorage.getItem(goalsKey);

      if (!goalsJson) {
        throw new Error('No goals found');
      }

      let goals = JSON.parse(goalsJson);
      goals = goals.filter(g => g.id !== goalId);

      await AsyncStorage.setItem(goalsKey, JSON.stringify(goals));
    } catch (error) {
      throw new Error(`Failed to delete goal: ${error.message}`);
    }
  }
}

export { GoalsService };

