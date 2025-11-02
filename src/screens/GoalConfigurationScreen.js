import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { MaterialIcons } from '@expo/vector-icons';
import { GoalsService } from '../services/GoalsService';

// Generate UUID - React Native compatible
function uuidv4() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0;
    var v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

export default function GoalConfigurationScreen({ route, navigation }) {
  const selectedHabits = route.params?.selectedHabits || [];
  
  const [currentHabitIndex, setCurrentHabitIndex] = useState(0);
  const [activityFrequency, setActivityFrequency] = useState('Daily');
  const [reflections, setReflections] = useState('Everyday');
  const [showActivityDropdown, setShowActivityDropdown] = useState(false);
  const [showReflectionsDropdown, setShowReflectionsDropdown] = useState(false);

  const activityFrequencyOptions = ['Daily', 'Weekly', 'Monthly', 'Custom'];
  const reflectionOptions = ['Everyday', 'Every 2 Days', 'Every 3 Days', 'Weekly', 'Monthly'];

  const currentHabit = selectedHabits[currentHabitIndex];
  const isLastHabit = currentHabitIndex === selectedHabits.length - 1;
  const nextHabit = !isLastHabit ? selectedHabits[currentHabitIndex + 1] : null;

  // Save current habit and move to next
  const handleAddHabit = async () => {
    try {
      console.log('💾 Saving habit configuration...');
      console.log('   Habit:', currentHabit);
      console.log('   Frequency:', activityFrequency);
      console.log('   Reflections:', reflections);
      
      // Validate required fields
      if (!currentHabit || !activityFrequency || !reflections) {
        Alert.alert('Missing Details', 'Please ensure all fields are filled out.');
        return;
      }

      // Save current habit configuration
      const goal = {
        id: `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        title: currentHabit,
        habitName: currentHabit,
        description: currentHabit,
        category: 'Custom Habits', // Changed to match Dashboard filter
        subcategory: 'User Selected',
        activityFrequency: activityFrequency, // Match dashboard field name
        reflections: reflections, // Match dashboard field name
        pledgeRdm: 1, // Match dashboard field name
        pledgeAmount: 1,
        createdAt: new Date().toISOString(),
        targetDate: new Date().toISOString(),
      };

      await GoalsService.addGoal(goal);
      console.log('✅ Habit saved successfully:', currentHabit);

      // Check if there are more habits
      if (currentHabitIndex < selectedHabits.length - 1) {
        // Move to next habit
        setCurrentHabitIndex(currentHabitIndex + 1);
        // Reset to defaults for next habit
        setActivityFrequency('Daily');
        setReflections('Everyday');
      } else {
        // All habits configured successfully
        Alert.alert(
          'Success',
          'All habits configured successfully!',
          [
            {
              text: 'OK',
              onPress: () => navigation.replace('Dashboard'),
            },
          ],
          { cancelable: false }
        );
      }
    } catch (error) {
      console.error('Error saving habit:', error);
      Alert.alert('Error', 'Failed to save habit configuration');
    }
  };

  const handleBack = () => {
    navigation.goBack();
  };

  return (
    <Modal
      visible={true}
      transparent={true}
      animationType="slide"
      onRequestClose={handleBack}
      presentationStyle="overFullScreen"
    >
      <View style={styles.modalOverlay} pointerEvents="box-none">
        <View style={styles.container}>
          {/* Handle Bar */}
          <View style={styles.handleBar} />

          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={handleBack}>
              <MaterialIcons name="arrow-back" size={24} color="#1A202C" />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>
              Configure Habit {currentHabitIndex + 1} of {selectedHabits.length}
            </Text>
            <View style={styles.headerPlaceholder} />
          </View>

          {/* Content */}
          <ScrollView style={styles.content} contentContainerStyle={styles.contentContainer}>
        {/* Habit Title Card */}
        <View style={styles.habitCard}>
          <Text style={styles.habitText}>{currentHabit}</Text>
        </View>
        
        {/* Info Message */}
        <View style={styles.infoCard}>
          <MaterialIcons name="info-outline" size={18} color="#20C997" />
          <Text style={styles.infoText}>
            Configure how often you'll do this habit and track your progress
          </Text>
        </View>

        {/* Activity Frequency */}
        <Text style={styles.label}>Activity Frequency</Text>
        <TouchableOpacity
          style={styles.pickerContainer}
          onPress={() => setShowActivityDropdown(!showActivityDropdown)}
        >
          <Text style={styles.pickerText}>{activityFrequency}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#1A202C" />
        </TouchableOpacity>

        {/* Dropdown for Activity Frequency */}
        {showActivityDropdown && (
          <View style={styles.dropdownList}>
            {activityFrequencyOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setActivityFrequency(option);
                  setShowActivityDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{option}</Text>
                {activityFrequency === option && (
                  <MaterialIcons name="check" size={20} color="#20C997" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Reflections */}
        <Text style={styles.label}>Reflections</Text>
        <TouchableOpacity
          style={[styles.pickerContainer, styles.reflectionsBorder]}
          onPress={() => setShowReflectionsDropdown(!showReflectionsDropdown)}
        >
          <Text style={styles.pickerText}>{reflections}</Text>
          <MaterialIcons name="keyboard-arrow-down" size={24} color="#1A202C" />
        </TouchableOpacity>

        {/* Dropdown for Reflections */}
        {showReflectionsDropdown && (
          <View style={styles.dropdownList}>
            {reflectionOptions.map((option) => (
              <TouchableOpacity
                key={option}
                style={styles.dropdownItem}
                onPress={() => {
                  setReflections(option);
                  setShowReflectionsDropdown(false);
                }}
              >
                <Text style={styles.dropdownText}>{option}</Text>
                {reflections === option && (
                  <MaterialIcons name="check" size={20} color="#20C997" />
                )}
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Pledge RDM */}
        <Text style={styles.label}>Pledge RDM per day</Text>
        <View style={styles.rdmContainer}>
          <Text style={styles.rdmText}>1</Text>
        </View>
      </ScrollView>

      {/* Bottom Button */}
      <View style={styles.buttonContainer}>
        <TouchableOpacity onPress={handleAddHabit} style={styles.button}>
          <LinearGradient
            colors={['#20C997', '#17A2B8']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.buttonGradient}
          >
            <MaterialIcons name="add" size={24} color="#FFF" />
            <Text style={styles.buttonText}>
              {isLastHabit 
                ? 'Add Habit' 
                : `Next: ${nextHabit.substring(0, 30)}${nextHabit.length > 30 ? '...' : ''}`
              }
            </Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
      </View>
    </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    justifyContent: 'flex-end',
  },
  container: {
    height: '85%',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -8 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 15,
  },
  handleBar: {
    width: 60,
    height: 6,
    backgroundColor: '#20C997',
    borderRadius: 3,
    alignSelf: 'center',
    marginTop: 8,
    marginBottom: 12,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  headerPlaceholder: {
    width: 24,
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 20,
    paddingBottom: 40,
  },
  habitCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#C6F6D5',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.03,
    shadowRadius: 8,
    elevation: 1,
  },
  habitText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    textAlign: 'center',
    lineHeight: 20,
  },
  infoCard: {
    flexDirection: 'row',
    backgroundColor: '#E6FCF5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 16,
    gap: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#B8F2E6',
  },
  infoText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#0D9488',
    flex: 1,
    lineHeight: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3748',
    marginTop: 6,
    marginBottom: 6,
    letterSpacing: -0.2,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 8,
    backgroundColor: '#FFF',
    paddingHorizontal: 16,
    paddingVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  reflectionsBorder: {
    borderWidth: 2,
    borderColor: '#20C997',
    backgroundColor: '#F0FDF4',
  },
  pickerText: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '500',
  },
  dropdownList: {
    backgroundColor: '#FFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: -16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  dropdownText: {
    fontSize: 16,
    color: '#1A202C',
  },
  rdmContainer: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1,
  },
  rdmText: {
    fontSize: 16,
    color: '#1A202C',
    fontWeight: '600',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8F9FA',
  },
  button: {
    borderRadius: 14,
    overflow: 'hidden',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 10,
  },
  buttonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 8,
  },
  buttonText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: 'bold',
    color: '#FFF',
    flex: 1,
  },
});

