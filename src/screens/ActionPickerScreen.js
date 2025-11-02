import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  Dimensions,
  Modal,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import GoalConfigurationScreen from './GoalConfigurationScreen';

const { width } = Dimensions.get('window');

// ALL HABITS DATA (Fallback when no priority habits)
const ALL_HABITS = [
  { id: '1', title: 'Put phone on silent and face-down during conversations', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '2', title: 'Take 3 deep belly breaths when noticing tension', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '3', title: 'Wait 10 seconds after criticism, ask "What can I learn?"', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '4', title: 'Check in with one team member daily asking "How are you really doing?"', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '5', title: 'Count to five silently and ask one clarifying question before disagreeing', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '6', title: 'Maintain eye contact and summarize what you heard before responding', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '7', title: 'Set phone to "Do Not Disturb" mode during meals and after 8 PM', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '8', title: 'Label your emotion out loud ("I\'m feeling frustrated") before responding', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '9', title: 'Replace harsh self-criticism with curious questions', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '10', title: 'Review weekly calendar every Sunday and delete one non-value commitment', category: 'Mindfulness', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '11', title: 'Write down your top 3 priorities each morning before opening email', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '12', title: 'Close your laptop lid and silence your phone 2 minutes before meetings', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '13', title: 'When triggered, pause and say out loud "I\'m feeling [emotion]"', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '14', title: 'Start every disagreement with "Help me understand your perspective"', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '15', title: 'Notice when distracted within 30 seconds and gently guide attention back', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '16', title: 'Take three conscious breaths before responding when stressed', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '17', title: 'Pause for 10 seconds to sense team energy before giving direction', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '18', title: 'Put pen down, turn body toward speaker, maintain eye contact', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '19', title: 'After errors, ask "What\'s one useful thing I learned?" immediately', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '20', title: 'Write tomorrow\'s top 3 tasks, close browser tabs, reflect before logging off', category: 'Purpose', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '21', title: 'Repeat back what you heard by saying "So what I\'m hearing is..."', category: 'Empathy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '22', title: 'Ask "How are you feeling about this situation?" before stating opposing view', category: 'Empathy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '23', title: 'Send one thoughtful "thinking of you" message weekly to someone stressed', category: 'Empathy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '24', title: 'Within 24 hours of hurting someone, say "I\'m sorry for [specific action]"', category: 'Empathy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '25', title: 'When overwhelmed, say "I care about this and need to [set boundary]"', category: 'Empathy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '26', title: 'In every team win, publicly name 2-3 specific people who contributed', category: 'Philanthropy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '27', title: 'Volunteer for one task outside your formal job description weekly', category: 'Philanthropy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '28', title: 'Before decisions, ask "Who else is affected by this choice?"', category: 'Philanthropy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '29', title: 'Set up monthly recurring donation or volunteer hours as non-negotiable', category: 'Philanthropy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
  { id: '30', title: 'Introduce one junior colleague to valuable contact in your network monthly', category: 'Philanthropy', reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days' },
];

export default function ActionPickerScreen({ navigation, route }) {
  const { habitsWithPriority, selectedCategory } = route?.params || {};
  
  const [selectedHabits, setSelectedHabits] = useState([]);
  const [expandedTitles, setExpandedTitles] = useState(new Set());
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [filteredHabits, setFilteredHabits] = useState([]);
  const [showWeakAreaMessage, setShowWeakAreaMessage] = useState(false);

  useEffect(() => {
    loadHabits();
  }, []);

  const loadHabits = () => {
    console.log('🔍 ActionPicker.loadHabits called');
    console.log('   habitsWithPriority:', habitsWithPriority);
    console.log('   habitsWithPriority type:', typeof habitsWithPriority);
    console.log('   Is array?', Array.isArray(habitsWithPriority));
    console.log('   Length:', habitsWithPriority?.length);
    
    // CRITICAL: If habitsWithPriority exists and has items, use ONLY those
    if (habitsWithPriority && Array.isArray(habitsWithPriority) && habitsWithPriority.length > 0) {
      console.log('✅ FOUND habitsWithPriority! Using priority habits.');
      console.log('   Count:', habitsWithPriority.length);
      console.log('   First habit:', habitsWithPriority[0]);
      
      setShowWeakAreaMessage(true);
      
      // Convert priority habits to standard habit format
      const priorityHabitsList = habitsWithPriority.map((priorityHabit, index) => ({
        id: `priority-${index}`,
        title: priorityHabit.habit,
        description: priorityHabit.habit,
        category: selectedCategory || 'Mindfulness',
        reward: 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days',
        priority: priorityHabit.priority,
        priorityColor: priorityHabit.priorityColor,
        score: priorityHabit.score,
      }));
      
      console.log('✅ Converted to', priorityHabitsList.length, 'habits');
      console.log('   First converted:', priorityHabitsList[0]?.title?.substring(0, 40));
      
      setFilteredHabits(priorityHabitsList);
    } else {
      console.log('⚠️ No habitsWithPriority, loading ALL habits');
      setShowWeakAreaMessage(false);
      setFilteredHabits(ALL_HABITS);
    }
  };

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

  const toggleTitleExpansion = (habitTitle) => {
    const newExpanded = new Set(expandedTitles);
    if (newExpanded.has(habitTitle)) {
      newExpanded.delete(habitTitle);
    } else {
      newExpanded.add(habitTitle);
    }
    setExpandedTitles(newExpanded);
  };

  const handleContinue = () => {
    if (selectedHabits.length >= 1) {
      setShowConfiguration(true);
    } else {
      Alert.alert('Select Habit', 'Please select at least 1 habit to continue.');
    }
  };

  const getCategoryColor = (category, opacity = 1) => {
    const colors = {
      'Mindfulness': `rgba(32, 201, 151, ${opacity})`,
      'Purpose': `rgba(108, 99, 255, ${opacity})`,
      'Empathy': `rgba(255, 107, 107, ${opacity})`,
      'Philanthropy': `rgba(255, 167, 38, ${opacity})`,
    };
    return colors[category] || `rgba(128, 128, 128, ${opacity})`;
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={24} color="#1A202C" />
        </TouchableOpacity>
        <Text style={styles.title}>Choose habits</Text>
        <View style={styles.debugTag}>
          <Text style={styles.debugText}>DEBUG</Text>
        </View>
      </View>

      {/* Weak Area Message - ONLY when showing priority habits */}
      {showWeakAreaMessage && (
        <View style={styles.weakAreaMessage}>
          <MaterialIcons name="lightbulb-outline" size={16} color="#F57C00" />
          <Text style={styles.weakAreaText}>
            Showing habits to improve your weak areas
          </Text>
        </View>
      )}

      {/* NO FILTER TABS when showing priority habits */}
      {!habitsWithPriority || habitsWithPriority.length === 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.filterContainer}
          contentContainerStyle={styles.filterContent}
        >
          {['All', 'Mindfulness', 'Purpose', 'Empathy', 'Philanthropy'].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                false && styles.filterButtonSelected,
              ]}
            >
              <Text style={styles.filterText}>{filter}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      ) : null}

      {/* Habits List - Show ONLY priority habits OR all habits */}
      <ScrollView style={styles.gridContainer} contentContainerStyle={styles.gridContent}>
        {filteredHabits.map((habit) => {
          const isSelected = selectedHabits.includes(habit.title);
          const isExpanded = expandedTitles.has(habit.title);

          return (
            <TouchableOpacity
              key={habit.id}
              style={[
                styles.habitCard,
                isSelected && styles.habitCardSelected,
                habit.priorityColor && !isSelected && { borderColor: `${habit.priorityColor}66`, borderWidth: 1.5 },
              ]}
              onPress={() => toggleHabitSelection(habit.title)}
            >
              {/* Priority/Category Tag */}
              <View style={styles.habitCardHeader}>
                {habit.priority ? (
                  <View style={[styles.priorityTag, { backgroundColor: `${habit.priorityColor}25` }]}>
                    <View style={[styles.priorityDot, { backgroundColor: habit.priorityColor }]} />
                    <Text style={[styles.priorityText, { color: habit.priorityColor }]}>
                      {habit.priority}
                    </Text>
                  </View>
                ) : (
                  <View style={[styles.categoryTag, { backgroundColor: getCategoryColor(habit.category, 0.1) }]}>
                    <Text style={[styles.categoryText, { color: getCategoryColor(habit.category) }]}>
                      {habit.category}
                    </Text>
                  </View>
                )}
                
                <TouchableOpacity
                  style={[
                    styles.addButton,
                    isSelected && {
                      backgroundColor: habit.priorityColor || getCategoryColor(habit.category),
                    },
                  ]}
                  onPress={(e) => {
                    e.stopPropagation();
                    toggleHabitSelection(habit.title);
                  }}
                >
                  <Text style={[styles.addButtonText, isSelected && { color: '#FFF' }]}>
                    {isSelected ? '✓' : '+'}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Habit Title */}
              <TouchableOpacity
                onPress={() => toggleTitleExpansion(habit.title)}
                activeOpacity={0.7}
              >
                <Text
                  style={styles.habitTitle}
                  numberOfLines={isExpanded ? 0 : 2}
                >
                  {habit.title}
                </Text>
              </TouchableOpacity>

              {/* Reward */}
              <Text style={styles.rewardText}>
                {habit.reward || 'Reward: 1 RDM / day • Streak bonus at 3/7/30 days'}
              </Text>

              {habit.priorityColor && (
                <View style={[
                  styles.priorityIndicator,
                  { backgroundColor: `${habit.priorityColor}33` }
                ]} />
              )}
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
          style={[styles.continueButton, selectedHabits.length < 1 && styles.disabledButton]}
          onPress={handleContinue}
          disabled={selectedHabits.length < 1}
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
  filterContainer: {
    maxHeight: 50,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 6,
  },
  filterButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    marginRight: 6,
  },
  filterButtonSelected: {
    backgroundColor: '#1A202C',
    borderColor: '#1A202C',
  },
  filterText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#1A202C',
  },
  gridContainer: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  gridContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    paddingBottom: 80,
    gap: 4, // Add small gap between cards
  },
  habitCard: {
    width: '48%', // 2 columns instead of 3
    backgroundColor: '#FFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    minHeight: 200,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
    position: 'relative',
    borderWidth: 2,
    borderColor: '#E5E7EB',
  },
  habitCardSelected: {
    borderWidth: 3,
    borderColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
    backgroundColor: '#F0FDF9',
  },
  habitCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  priorityTag: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 5,
  },
  priorityText: {
    fontSize: 11,
    fontWeight: '700',
  },
  categoryTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  categoryText: {
    fontSize: 9,
    fontWeight: '600',
  },
  addButton: {
    backgroundColor: '#E0E0E0',
    borderRadius: 8,
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  habitTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1A202C',
    lineHeight: 20,
    marginBottom: 8,
  },
  rewardText: {
    fontSize: 11,
    color: '#20C997',
    lineHeight: 15,
    marginTop: 6,
    fontWeight: '500',
  },
  priorityIndicator: {
    height: 3,
    borderRadius: 2,
    marginTop: 6,
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
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
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
  },
  disabledButton: {
    backgroundColor: '#BDBDBD',
  },
  continueButtonText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#FFF',
  },
});
