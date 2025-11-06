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

export default function AdditionalGoalsScreen({ navigation }) {
  const [customGoals, setCustomGoals] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [goalTitle, setGoalTitle] = useState('');
  const [goalDescription, setGoalDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadCustomGoals();
    const unsubscribe = navigation.addListener('focus', () => {
      loadCustomGoals();
    });
    return unsubscribe;
  }, [navigation]);

  const loadCustomGoals = async () => {
    try {
      setIsLoading(true);
      const allGoals = await GoalsService.getUserGoals();
      // Filter ONLY for long-term custom goals - exclude dashboard short-term goals
      const custom = allGoals.filter(goal => {
        // Only include goals with 'Custom Goals' category
        if (goal.category === 'Custom Goals') {
          // Exclude dashboard short-term goals
          const title = (goal.title || goal.habitName || '').toLowerCase();
          const excludedTitles = ['3l water', 'project update', '30m reading', '3l', 'water', 'project', 'reading'];
          return !excludedTitles.some(excluded => title.includes(excluded));
        }
        return false;
      });
      setCustomGoals(custom);
    } catch (error) {
      console.error('Error loading custom goals:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddGoal = () => {
    setShowAddForm(true);
  };

  const handleCancelAdd = () => {
    setShowAddForm(false);
    setGoalTitle('');
    setGoalDescription('');
  };

  const handleSaveGoal = async () => {
    if (!goalTitle.trim()) {
      Alert.alert('Required', 'Please enter a goal title');
      return;
    }

    setIsSaving(true);
    try {
      const goal = {
        id: generateId(),
        title: goalTitle.trim(),
        description: goalDescription.trim() || goalTitle.trim(),
        category: 'Custom Goals',
        createdAt: new Date(),
      };

      await GoalsService.addGoal(goal);
      setGoalTitle('');
      setGoalDescription('');
      setShowAddForm(false);
      loadCustomGoals();
      Alert.alert('Success', 'Goal added successfully!');
    } catch (error) {
      console.error('Error saving goal:', error);
      Alert.alert('Error', 'Failed to save goal');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId) => {
    Alert.alert(
      'Delete Goal',
      'Are you sure you want to delete this goal?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await GoalsService.deleteGoal(goalId);
              loadCustomGoals();
            } catch (error) {
              Alert.alert('Error', 'Failed to delete goal');
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#20C997" />
      
      {/* Header */}
      <LinearGradient colors={['#20C997', '#17A085']} style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FFF" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Goals</Text>
        <View style={styles.placeholder} />
      </LinearGradient>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Add Goal Button */}
        <TouchableOpacity 
          style={styles.addButton}
          onPress={handleAddGoal}
          activeOpacity={0.8}
        >
          <LinearGradient 
            colors={['#20C997', '#17A085']} 
            style={styles.addButtonGradient}
          >
            <Ionicons name="add-circle" size={24} color="#FFF" />
            <Text style={styles.addButtonText}>+ Add your custom goals</Text>
          </LinearGradient>
        </TouchableOpacity>

        {/* Goals List */}
        {isLoading ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Loading...</Text>
          </View>
        ) : customGoals.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="flag-outline" size={64} color="#CBD5E0" />
            <Text style={styles.emptyTitle}>No Custom Goals Yet</Text>
            <Text style={styles.emptyText}>
              Tap the button above to add your first custom goal
            </Text>
          </View>
        ) : (
          <View style={styles.goalsList}>
            {customGoals.map((goal) => (
              <View key={goal.id} style={styles.goalCard}>
                <View style={styles.goalContent}>
                  <Ionicons name="flag" size={20} color="#20C997" />
                  <View style={styles.goalTextContainer}>
                    <Text style={styles.goalTitle}>{goal.title || goal.habitName || 'Untitled Goal'}</Text>
                    {goal.description && goal.description !== goal.title && (
                      <Text style={styles.goalDescription}>{goal.description}</Text>
                    )}
                    {goal.category && (
                      <Text style={styles.goalCategory}>{goal.category}</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteGoal(goal.id)}
                >
                  <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>

      {/* Add Goal Modal */}
      <Modal
        visible={showAddForm}
        transparent={true}
        animationType="slide"
        onRequestClose={handleCancelAdd}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Custom Goal</Text>
              <TouchableOpacity onPress={handleCancelAdd}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalContent}>
              <Text style={styles.modalLabel}>Goal Title *</Text>
              <Text style={styles.modalHelperText}>Enter your custom goal title</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Enter your custom goal"
                value={goalTitle}
                onChangeText={setGoalTitle}
              />
              
              <Text style={styles.modalLabel}>Description</Text>
              <Text style={styles.modalHelperText}>Optional description for your goal</Text>
              <TextInput
                style={[styles.modalInput, styles.modalTextArea]}
                placeholder="Enter description (optional)"
                value={goalDescription}
                onChangeText={setGoalDescription}
                multiline
                numberOfLines={3}
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
                  style={[styles.modalSaveButton, (!goalTitle.trim() || isSaving) && styles.modalSaveButtonDisabled]}
                  onPress={handleSaveGoal}
                  disabled={!goalTitle.trim() || isSaving}
                >
                  {isSaving ? (
                    <ActivityIndicator color="#FFF" size="small" />
                  ) : (
                    <Text style={styles.modalSaveButtonText}>Save Goal</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Bottom Navigation */}
      <BottomNavigationBar navigation={navigation} currentRoute="AdditionalGoals" />
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
    shadowColor: '#20C997',
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
  goalsList: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  goalCard: {
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
  goalContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    flex: 1,
    gap: 12,
  },
  goalTextContainer: {
    flex: 1,
  },
  goalTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 4,
  },
  goalDescription: {
    fontSize: 14,
    color: '#64748B',
    marginBottom: 4,
  },
  goalCategory: {
    fontSize: 12,
    color: '#20C997',
    fontWeight: '500',
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
    minHeight: 50,
  },
  modalTextArea: {
    minHeight: 100,
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
    backgroundColor: '#20C997',
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

