import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GoalConfigurationScreen from './GoalConfigurationScreen';

const PURPOSE_HABITS = [
  {
    id: '1',
    title: 'Write down your top 3 priorities each morning before opening email',
    priority: 'HIGH',
    priorityColor: '#FF6B6B',
    score: 2,
  },
  {
    id: '2',
    title: 'Close your laptop lid and silence your phone 2 minutes before meetings',
    priority: 'HIGH',
    priorityColor: '#FF6B6B',
    score: 2,
  },
  {
    id: '3',
    title: 'When triggered, pause and say out loud "I\'m feeling [emotion]"',
    priority: 'MEDIUM',
    priorityColor: '#FFD93D',
    score: 3,
  },
  {
    id: '4',
    title: 'Start every disagreement with "Help me understand your perspective"',
    priority: 'MEDIUM',
    priorityColor: '#FFD93D',
    score: 3,
  },
];

export default function PurposeHabitsScreen({ navigation, route }) {
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [showConfiguration, setShowConfiguration] = useState(false);

  const toggleHabitSelection = (habitTitle) => {
    if (selectedHabits.includes(habitTitle)) {
      setSelectedHabits(selectedHabits.filter(h => h !== habitTitle));
    } else {
      if (selectedHabits.length < 5) {
        setSelectedHabits([...selectedHabits, habitTitle]);
      } else {
        Alert.alert('Limit Reached', 'You can choose a maximum of 5 habits.');
      }
    }
  };

  const handleContinue = () => {
    if (selectedHabits.length >= 2) {
      setShowConfiguration(true);
    } else {
      Alert.alert('Select More Habits', 'Please select at least 2 habits to continue.');
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose minimum 2 habits</Text>
        <View style={styles.debugTag}>
          <Text style={styles.debugText}>DEBUG</Text>
        </View>
      </View>

      {/* Weak Area Message */}
      <View style={styles.weakAreaMessage}>
        <MaterialIcons name="lightbulb-outline" size={16} color="#F57C00" />
        <Text style={styles.weakAreaText}>
          Showing habits to improve your weak areas in Purposefulness
        </Text>
      </View>

      {/* Habits List */}
      <ScrollView style={styles.habitsList} contentContainerStyle={styles.habitsContent}>
        {PURPOSE_HABITS.map((habit) => {
          const isSelected = selectedHabits.includes(habit.title);

          return (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitCard,
                isSelected && { borderColor: habit.priorityColor, borderWidth: 3 },
                !isSelected && { borderColor: `${habit.priorityColor}66`, borderWidth: 2 },
              ]}
              onPress={() => toggleHabitSelection(habit.title)}
            >
              {/* Priority Tag */}
              <View style={[styles.priorityTag, { backgroundColor: `${habit.priorityColor}25` }]}>
                <View style={[styles.priorityDot, { backgroundColor: habit.priorityColor }]} />
                <Text style={[styles.priorityText, { color: habit.priorityColor }]}>
                  {habit.priority}
                </Text>
              </View>

              {/* Habit Title */}
              <Text style={styles.habitTitle}>{habit.title}</Text>

              {/* Reward */}
              <Text style={styles.rewardText}>
                Reward: 1 RDM / day • Streak bonus at 3/7/30 days
              </Text>

              {/* Check Icon */}
              <View style={styles.checkIcon}>
                <MaterialIcons 
                  name={isSelected ? "check-circle" : "add-circle"} 
                  size={32} 
                  color={isSelected ? habit.priorityColor : '#999'} 
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom Bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.bottomBarLabel}>Selected Habits</Text>
          <Text style={styles.bottomBarCount}>{selectedHabits.length} habits selected</Text>
        </View>
        <TouchableOpacity
          style={[
            styles.continueButton,
            selectedHabits.length < 2 && styles.disabledButton,
          ]}
          onPress={handleContinue}
          disabled={selectedHabits.length < 2}
        >
          <Text style={styles.continueButtonText}>Continue</Text>
        </TouchableOpacity>
      </View>

      {/* Goal Configuration Modal */}
      {showConfiguration && (
        <GoalConfigurationScreen
          navigation={{
            ...navigation,
            goBack: () => setShowConfiguration(false),
            replace: (route, params) => {
              setShowConfiguration(false);
              navigation.replace(route, params);
            },
          }}
          route={{ params: { selectedHabits } }}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
  },
  title: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
    textAlign: 'center',
  },
  debugTag: {
    backgroundColor: '#EF4444',
    paddingHorizontal: 8,
    paddingVertical: 2,
    transform: [{ rotate: '15deg' }],
  },
  debugText: {
    color: '#FFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
  weakAreaMessage: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  weakAreaText: {
    fontSize: 12,
    color: '#E65100',
    fontWeight: '500',
    marginLeft: 8,
  },
  habitsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  habitsContent: {
    paddingBottom: 16,
  },
  habitCard: {
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    minHeight: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    position: 'relative',
  },
  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 10,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  priorityText: {
    fontSize: 12,
    fontWeight: '700',
  },
  habitTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1A202C',
    marginBottom: 8,
    lineHeight: 22,
  },
  rewardText: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  checkIcon: {
    position: 'absolute',
    top: 12,
    right: 12,
  },
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#FFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  bottomBarLabel: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '500',
  },
  bottomBarCount: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C',
    marginTop: 2,
  },
  continueButton: {
    backgroundColor: '#1A202C',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  continueButtonText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#FFF',
  },
});

