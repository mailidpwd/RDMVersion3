import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GoalsService } from '../services/GoalsService';
import BottomNavigationBar from '../components/BottomNavigationBar';

const generateId = () => {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export default function AdditionalHabitsScreen({ navigation }) {
  const [customHabits, setCustomHabits] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [habitDescription, setHabitDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCustomHabits();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCustomHabits();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCustomHabits = async () => {
    try {
      setIsLoading(true);
      const allGoals = await GoalsService.getUserGoals();
      // Filter ONLY for dashboard Additional Habits - exclude Quiz Hub habits
      const custom = allGoals.filter(goal => {
        // Only include habits with 'Custom Habits' category (from dashboard Additional Habits)
        if (goal.category === 'Custom Habits') {
          // Exclude Quiz Hub categories (long-term habits)
          const quizHubCategories = ['Mindfulness', 'Purposefulness', 'Empathy & Philanthropy', 'Empathy'];
          if (quizHubCategories.includes(goal.category)) {
            return false;
          }
          // Exclude mood assessment habits
          if (goal.category === 'Mood Assessment') {
            return false;
          }
          // Exclude dashboard short-term habits (hardcoded ones)
          const title = (goal.title || goal.habitName || goal.description || '').toLowerCase();
          const excludedTitles = ['2-min meditate', '5k steps', 'no sugar'];
          return !excludedTitles.some(excluded => title === excluded);
        }
        return false;
      });
      setCustomHabits(custom);
    } catch (error) {
      console.error('Error loading custom habits:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddHabit = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setHabitDescription('');
  };

  const handleSaveHabit = async () => {
    if (!habitDescription.trim()) {
      Alert.alert('Required', 'Please enter a habit description');
      return;
    }

    setIsSaving(true);
    try {
      const goal = {
        id: generateId(),
        title: habitDescription.trim(),
        description: habitDescription.trim(),
        category: 'Custom Habits',
        activityFrequency: 'Daily',
        reflections: 'Everyday',
        pledgeRdm: 1,
        createdAt: new Date(),
      };

      await GoalsService.addGoal(goal);
      setHabitDescription('');
      setShowAddForm(false);
      loadCustomHabits();
      Alert.alert('Success', 'Habit added successfully!');
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteHabit = async (habitId) => {
    Alert.alert(
      'Delete Habit',
      'Are you sure you want to delete this habit?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoalsService.deleteGoal(habitId);
              loadCustomHabits();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete habit');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#8B5CF6" />
      
      {/* Header */}
      <LinearGradient colors={['#8B5CF6', '#7C3AED']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Habits</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Add Habit Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddHabit}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#8B5CF6', '#7C3AED']} 
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>+ Add your custom habits</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Habits List */}
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : customHabits.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="checkmark-circle-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyTitle}>No Custom Habits Yet</Text>
            <Text style={styles.emptyText}>
              Tap the button above to add your first custom habit
            </Text>
          </View>
        ) : (
          <View style={styles.habitsList}>
            {customHabits.map((habit) => (
              <View key={habit.id} style={styles.habitCard}>
                <View style={styles.habitContent}>
                  <Ionicons name="checkmark-circle" size={20} color="#8B5CF6" />
                  <View style={styles.habitTextContainer}>
                    <Text style={styles.habitTitle}>{habit.title || habit.habitName || habit.description || 'Untitled Habit'}</Text>
                    {habit.description && habit.description !== habit.title && (
                      <Text style={styles.habitDescription}>{habit.description}</Text>
                    )}
                    {habit.category && (
                      <Text style={styles.habitCategory}>{habit.category}</Text>
                    )}
                    {habit.activityFrequency && (
                      <Text style={styles.habitMeta}>Frequency: {habit.activityFrequency}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteHabit(habit.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Habit Modal */}
      <Modal
        visible={showAddForm}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Habit</Text>
              <TouchableOpacity onPress={handleCancelAdd}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Habit Description *</Text>
              <Text style={styles.modalHelperText}>Write your own custom habit description</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your custom habit (e.g., 'Drink 8 glasses of water daily')"
                value={habitDescription}
                onChangeText={setHabitDescription}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
              
              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalCancelButton}
                  onPress={handleCancelAdd}
                  disabled={isSaving}
                >
                  <Text style={styles.modalCancelButtonText}>Cancel</Text>
                </TouchableOpacity>
                
                <TouchableOpacity
                  style={[styles.modalSaveButton, (!habitDescription.trim() || isSaving) && styles.modalSaveButtonDisabled]}
                  onPress={handleSaveHabit}
                  disabled={!habitDescription.trim() || isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>Save Habit</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigationBar navigation={navigation} currentRoute="AdditionalHabits" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#FFF',
  },
  placeholder: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  addButton: {
    margin: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#FFF',
  },
  habitsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  habitCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  habitContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  habitTextContainer: {
    flex: 1,
  },
  habitTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  habitDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  habitCategory: {
    fontSize: 12,
    color: '#8B5CF6',
    fontWeight: '500',
    marginBottom: 2,
  },
  habitMeta: {
    fontSize: 12,
    color: '#94A3B8',
  },
  deleteButton: {
    padding: 8,
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    backgroundColor: '#FFF',
    borderRadius: 16,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A202C',
  },
  modalContent: {
    padding: 20,
    gap: 16,
  },
  modalLabel: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
  },
  modalHelperText: {
    fontSize: 13,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: -8,
  },
  modalInput: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    color: '#1A202C',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    minHeight: 120,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  modalCancelButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF',
  },
  modalCancelButtonText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#64748B',
  },
  modalSaveButton: {
    flex: 1,
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#8B5CF6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSaveButtonDisabled: {
    opacity: 0.5,
  },
  modalSaveButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFF',
  },
});

