import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  Alert,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { GoalsService } from '../services/GoalsService';
import { GeminiService } from '../services/GeminiService';

const generateId = () => {
  return `goal_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

const CATEGORIES = ['Fitness', 'Mental Wellness', 'Desirable Behaviour', 'Environment-Friendly', 'Improve Potential', 'Custom'];
const SUBCATEGORIES = {
  'Fitness': ['Yoga', 'Jogging', 'Pilates', 'TaiChi', 'Strength Training', 'Cardio', 'Stretching', 'Custom'],
  'Mental Wellness': ['Meditation', 'Confidence', 'Positive Attitude', 'Mindfulness', 'Stress Management', 'Self-Care', 'Custom'],
  'Desirable Behaviour': ['Kindness', 'Patience', 'Empathy', 'Communication', 'Leadership', 'Teamwork', 'Custom'],
  'Environment-Friendly': ['Recycling', 'Conserving Energy', 'Sustainable Transport', 'Water Conservation', 'Reducing Waste', 'Green Living', 'Custom'],
  'Improve Potential': ['Learning', 'Networking', 'Skill Building', 'Professional Development', 'Creativity', 'Productivity', 'Custom'],
  'Custom': ['Personal Growth', 'Health', 'Relationships', 'Career', 'Hobbies', 'Other', 'Custom'],
};

const FREQUENCIES = ['Daily', 'Every 2 Days', 'Every 3 Days', 'Weekly'];
const REFLECTIONS = ['Every 2 Days', 'Every 3 Days', 'Weekly', 'Monthly'];

export default function AddCustomHabitScreen({ navigation, route }) {
  const [category, setCategory] = useState('Fitness');
  const [subcategory, setSubcategory] = useState('Yoga');
  const [customCategory, setCustomCategory] = useState('');
  const [customSubcategory, setCustomSubcategory] = useState('');
  const [title, setTitle] = useState('Fitness - Yoga');
  const [description, setDescription] = useState('');
  const [targetDate, setTargetDate] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [frequency, setFrequency] = useState('Daily');
  const [reflection, setReflection] = useState('Every 2 Days');
  const [pledgeRdm, setPledgeRdm] = useState('1');
  const [showCategoryPicker, setShowCategoryPicker] = useState(false);
  const [showSubcategoryPicker, setShowSubcategoryPicker] = useState(false);
  const [showFrequencyPicker, setShowFrequencyPicker] = useState(false);
  const [showReflectionPicker, setShowReflectionPicker] = useState(false);
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [selectedSuggestion, setSelectedSuggestion] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // Auto-update title when category/subcategory changes
  useEffect(() => {
    if (category === 'Custom') {
      if (customCategory.trim()) {
        if (subcategory === 'Custom' && customSubcategory.trim()) {
          setTitle(`${customCategory.trim()} - ${customSubcategory.trim()}`);
        } else if (subcategory !== 'Custom') {
          setTitle(`${customCategory.trim()} - ${subcategory}`);
        }
      }
    } else if (subcategory === 'Custom') {
      if (customSubcategory.trim()) {
        setTitle(`${category} - ${customSubcategory.trim()}`);
      }
    } else {
      setTitle(`${category} - ${subcategory}`);
    }
  }, [category, subcategory, customCategory, customSubcategory]);

  // Generate AI descriptions
  const handleGenerateAISuggestions = async () => {
    if (!description.trim()) {
      Alert.alert('Input Required', 'Please enter a description first.');
      return;
    }

    setIsGeneratingAI(true);
    setAiSuggestions([]);
    setSelectedSuggestion(null);

    try {
      console.log('🤖 Generating AI descriptions...');
      
      const suggestions = await GeminiService.generateGoalDescriptions({
        title,
        category,
        subcategory,
        userDescription: description.trim(),
      });

      console.log(`✅ Received ${suggestions.length} suggestions:`, suggestions);
      setAiSuggestions(suggestions);
      setIsGeneratingAI(false);
    } catch (error) {
      console.error('❌ Failed to generate suggestions:', error);
      Alert.alert('Error', 'Could not generate AI suggestions. Please try again.');
      setIsGeneratingAI(false);
    }
  };

  // Select an AI suggestion
  const handleSelectSuggestion = (suggestion) => {
    setDescription(suggestion);
    setSelectedSuggestion(suggestion);
    setAiSuggestions([]);
  };

  // Save the goal
  const handleSaveGoal = async () => {
    if (!title || !description) {
      Alert.alert('Validation Error', 'Please fill in required fields.');
      return;
    }

    setIsSaving(true);
    try {
      const goal = {
        id: generateId(),
        title: description.trim(),
        description: description.trim(),
        category: 'Custom Habits',
        subcategory: subcategory,
        frequency: frequency,
        reflection: reflection,
        pledgeAmount: parseInt(pledgeRdm) || 1,
        targetDate: targetDate || new Date(),
        createdAt: new Date(),
      };

      console.log('💾 Saving goal:', goal);
      await GoalsService.addGoal(goal);

      setIsSaving(false);
      
      // Navigate back to dashboard
      navigation.goBack();
    } catch (error) {
      console.error('❌ Failed to save goal:', error);
      setIsSaving(false);
      Alert.alert('Error', 'Could not save goal. Please try again.');
    }
  };

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setTargetDate(selectedDate);
    }
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.rdmLogo}>
            <Text style={styles.rdmText}>RDM</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>Add Custom Habit</Text>
            <Text style={styles.headerSubtitle}>Create a meaningful goal to track</Text>
          </View>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
            <Ionicons name="close" size={24} color="#333" />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Category */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Category</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShowCategoryPicker(true)}
          >
            <Text style={[styles.inputText, styles.greenText]}>{category}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Subcategory */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Subcategory</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShowSubcategoryPicker(true)}
          >
            <Text style={[styles.inputText, styles.greenText]}>{subcategory}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Custom Category Input - shows when category is Custom */}
        {category === 'Custom' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enter Custom Category</Text>
            <TextInput
              style={styles.inputFieldText}
              placeholder="Enter your custom category"
              value={customCategory}
              onChangeText={setCustomCategory}
            />
          </View>
        )}

        {/* Custom Subcategory Input - shows when subcategory is Custom */}
        {subcategory === 'Custom' && (
          <View style={styles.formGroup}>
            <Text style={styles.label}>Enter Custom Subcategory</Text>
            <TextInput
              style={styles.inputFieldText}
              placeholder="Enter your custom subcategory"
              value={customSubcategory}
              onChangeText={setCustomSubcategory}
            />
          </View>
        )}

        {/* Title display (auto-generated) */}
        <View style={styles.titleCard}>
          <Text style={styles.titleCardText}>
            {title || 'Select category and subcategory to generate title...'}
          </Text>
        </View>

        {/* Description with AI Button */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Description</Text>
          <View style={styles.descriptionContainer}>
            <TextInput
              style={styles.descriptionInput}
              placeholder="Description"
              multiline
              numberOfLines={3}
              value={description}
              onChangeText={setDescription}
            />
            <TouchableOpacity
              style={[styles.aiButton, isGeneratingAI && styles.aiButtonDisabled]}
              onPress={handleGenerateAISuggestions}
              disabled={isGeneratingAI}
            >
              {isGeneratingAI ? (
                <ActivityIndicator color="#FFF" size="small" />
              ) : (
                <Text style={styles.aiButtonText}>AI</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* AI Suggestions */}
          {aiSuggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
              {aiSuggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.suggestionItem,
                    selectedSuggestion === suggestion && styles.selectedSuggestion
                  ]}
                  onPress={() => handleSelectSuggestion(suggestion)}
                >
                  <View style={styles.radioButton}>
                    {selectedSuggestion === suggestion && (
                      <View style={styles.radioButtonSelected} />
                    )}
                  </View>
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        {/* Target Date */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Target Date</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.inputText, !targetDate && styles.placeholderText]}>
              {targetDate ? targetDate.toLocaleDateString() : 'Select target date'}
            </Text>
            <MaterialIcons name="event" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Activity Frequency */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Activity Frequency</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShowFrequencyPicker(true)}
          >
            <Text style={styles.inputText}>{frequency}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Reflections */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Reflections</Text>
          <TouchableOpacity
            style={styles.inputField}
            onPress={() => setShowReflectionPicker(true)}
          >
            <Text style={styles.inputText}>{reflection}</Text>
            <Ionicons name="chevron-down" size={20} color="#666" />
          </TouchableOpacity>
        </View>

        {/* Pledge RDM per day */}
        <View style={styles.formGroup}>
          <Text style={styles.label}>Pledge RDM per day</Text>
          <TextInput
            style={styles.inputField}
            value={pledgeRdm}
            onChangeText={setPledgeRdm}
            keyboardType="numeric"
          />
        </View>

        {/* Add Habit Button */}
        <TouchableOpacity
          style={[styles.addButton, (isSaving || !description.trim()) && styles.addButtonDisabled]}
          onPress={handleSaveGoal}
          disabled={isSaving || !description.trim()}
        >
          <LinearGradient colors={['#20C997', '#17A085']} style={styles.addButtonGradient}>
            {isSaving ? (
              <ActivityIndicator color="#FFF" size="small" />
            ) : (
              <>
                <Ionicons name="add-circle-outline" size={20} color="#FFF" />
                <Text style={styles.addButtonText}>Add Habit</Text>
              </>
            )}
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>

      {/* Pickers */}
      <PickerModal
        visible={showCategoryPicker}
        onClose={() => setShowCategoryPicker(false)}
        options={CATEGORIES}
        selectedValue={category}
        onSelect={(value) => {
          setCategory(value);
          // Reset custom category when switching away from Custom
          if (value !== 'Custom') {
            setCustomCategory('');
          }
          // Reset subcategory when category changes
          const newSubcategories = SUBCATEGORIES[value] || SUBCATEGORIES['Custom'];
          setSubcategory(newSubcategories[0]);
        }}
      />

      <PickerModal
        visible={showSubcategoryPicker}
        onClose={() => setShowSubcategoryPicker(false)}
        options={SUBCATEGORIES[category] || []}
        selectedValue={subcategory}
        onSelect={(value) => {
          setSubcategory(value);
          // Reset custom subcategory when switching away from Custom
          if (value !== 'Custom') {
            setCustomSubcategory('');
          }
        }}
      />

      <PickerModal
        visible={showFrequencyPicker}
        onClose={() => setShowFrequencyPicker(false)}
        options={FREQUENCIES}
        selectedValue={frequency}
        onSelect={setFrequency}
      />

      <PickerModal
        visible={showReflectionPicker}
        onClose={() => setShowReflectionPicker(false)}
        options={REFLECTIONS}
        selectedValue={reflection}
        onSelect={setReflection}
      />

      {showDatePicker && (
        <Modal visible={showDatePicker} transparent animationType="slide" onRequestClose={() => setShowDatePicker(false)}>
          <View style={styles.datePickerOverlay}>
            <View style={styles.datePickerContainer}>
              <View style={styles.datePickerHeader}>
                <Text style={styles.datePickerTitle}>Select Target Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color="#333" />
                </TouchableOpacity>
              </View>
              <ScrollView>
                {[...Array(365)].map((_, index) => {
                  const date = new Date();
                  date.setDate(date.getDate() + index);
                  const isSelected = targetDate && targetDate.toDateString() === date.toDateString();
                  return (
                    <TouchableOpacity
                      key={index}
                      style={[styles.dateOption, isSelected && styles.dateOptionSelected]}
                      onPress={() => {
                        setTargetDate(date);
                        setShowDatePicker(false);
                      }}
                    >
                      <Text style={styles.dateOptionText}>
                        {date.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                      </Text>
                      {isSelected && (
                        <Ionicons name="checkmark-circle" size={24} color="#20C997" />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

// Simple Picker Modal Component
const PickerModal = ({ visible, onClose, options, selectedValue, onSelect }) => {
  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.pickerModalOverlay}>
        <View style={styles.pickerModalContainer}>
          <View style={styles.pickerModalHeader}>
              <Text style={styles.pickerModalTitle}>Select Option</Text>
              <TouchableOpacity onPress={onClose}>
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>
            <ScrollView>
              {options.map((option, index) => (
                <TouchableOpacity
                  key={index}
                  style={[
                    styles.pickerOption,
                    selectedValue === option && styles.pickerOptionSelected
                  ]}
                  onPress={() => {
                    onSelect(option);
                    onClose();
                    // Reset custom inputs when changing to non-custom
                    if (option !== 'Custom' && option !== selectedValue) {
                      if (typeof setCustomCategory === 'function') setCustomCategory('');
                      if (typeof setCustomSubcategory === 'function') setCustomSubcategory('');
                    }
                  }}
                >
                  <Text style={styles.pickerOptionText}>{option}</Text>
                  {selectedValue === option && (
                    <Ionicons name="checkmark" size={20} color="#20C997" />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    );
  };

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    backgroundColor: '#F8F9FA',
    paddingTop: 50,
    paddingBottom: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  rdmLogo: {
    width: 44,
    height: 44,
    borderRadius: 10,
    backgroundColor: '#20C997',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  rdmText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
    letterSpacing: 0.5,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#1A202C',
    marginBottom: 4,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '500',
  },
  closeButton: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  formGroup: {
    marginHorizontal: 20,
    marginBottom: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  inputField: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    minHeight: 56,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  inputText: {
    fontSize: 16,
    color: '#334155',
    flex: 1,
    fontWeight: '500',
  },
  greenText: {
    color: '#20C997',
    fontWeight: '700',
  },
  placeholderText: {
    color: '#94A3B8',
    fontWeight: '400',
  },
  inputFieldText: {
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    padding: 18,
    minHeight: 56,
    fontSize: 16,
    color: '#334155',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  titleCard: {
    backgroundColor: '#ECFDF5',
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#20C997',
    padding: 18,
    marginHorizontal: 20,
    marginBottom: 18,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  titleCardText: {
    fontSize: 17,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  descriptionContainer: {
    position: 'relative',
    backgroundColor: '#FFF',
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    minHeight: 140,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  descriptionInput: {
    padding: 18,
    paddingRight: 70,
    fontSize: 16,
    color: '#334155',
    minHeight: 140,
    textAlignVertical: 'top',
    fontWeight: '400',
    lineHeight: 24,
  },
  aiButton: {
    position: 'absolute',
    right: 12,
    top: 12,
    backgroundColor: '#20C997',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    elevation: 10,
  },
  aiButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  aiButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '900',
    letterSpacing: 1,
  },
  suggestionsContainer: {
    marginTop: 16,
    backgroundColor: '#F8F9FA',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  suggestionsTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  suggestionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 2,
  },
  selectedSuggestion: {
    borderColor: '#20C997',
    backgroundColor: '#ECFDF5',
    borderWidth: 2,
  },
  radioButton: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2.5,
    borderColor: '#CBD5E0',
    marginRight: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioButtonSelected: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#20C997',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#334155',
    fontWeight: '500',
    lineHeight: 22,
  },
  addButton: {
    marginHorizontal: 20,
    marginBottom: 40,
    marginTop: 8,
    borderRadius: 16,
    overflow: 'hidden',
  },
  addButtonDisabled: {
    opacity: 0.6,
  },
  addButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 18,
    gap: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  // Picker Modal Styles - Premium Redesign
  pickerModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  pickerModalContainer: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '60%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  pickerModalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  pickerModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 18,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF',
  },
  pickerOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  pickerOptionText: {
    fontSize: 17,
    color: '#334155',
    fontWeight: '600',
  },
  // Date Picker Modal Styles - Premium Redesign
  datePickerOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
  },
  datePickerContainer: {
    backgroundColor: '#FAFAFA',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingBottom: 40,
    maxHeight: '70%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 20,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 24,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#FFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
  },
  datePickerTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#1A202C',
    letterSpacing: -0.3,
  },
  dateOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 0.5,
    borderBottomColor: '#F1F5F9',
    backgroundColor: '#FFF',
  },
  dateOptionSelected: {
    backgroundColor: '#ECFDF5',
    borderLeftWidth: 4,
    borderLeftColor: '#20C997',
    shadowColor: '#20C997',
    shadowOffset: { width: -2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  dateOptionText: {
    fontSize: 16,
    color: '#475569',
    fontWeight: '500',
  },
});
