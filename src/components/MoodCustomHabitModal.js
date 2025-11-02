import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { GeminiService } from '../services/GeminiService';
import { GoalsService } from '../services/GoalsService';

// Simple UUID generator for React Native
const generateId = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

export default function MoodCustomHabitModal({ visible, onClose, moodEmoji, moodName, moodKey, navigation, parentModalClose }) {
  const [description, setDescription] = useState('');
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const generateAISuggestions = async () => {
    if (!description.trim()) {
      Alert.alert('Please enter a description first');
      return;
    }

    setIsGeneratingAI(true);
    console.log('🤖 AI Button Clicked!');
    console.log('📊 Mood Data:', {
      moodKey: moodKey,
      moodName: moodName,
      userDescription: description.trim()
    });

    try {
      const suggestions = await GeminiService.generatePersonalizedHabitSuggestions(
        moodKey,      // e.g., "cheerful", "neutral", "sad"
        moodName,     // e.g., "CHEERFUL", "NEUTRAL", "SAD"
        description.trim()  // User's custom input
      );
      
      console.log('✅ AI Generated Suggestions:', suggestions);
      setAiSuggestions(suggestions);
      setShowSuggestions(true);
    } catch (error) {
      console.error('❌ AI Error:', error);
      Alert.alert('Error', 'Failed to generate AI suggestions');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const addCustomHabit = async () => {
    if (!description.trim()) {
      Alert.alert('Please enter a description');
      return;
    }

    try {
      const goal = {
        id: generateId(),
        title: description.trim(),
        description: description.trim(),
        category: 'Custom Habits',
        subcategory: moodName || 'Custom',
        frequency: 'Daily',
        reflection: 'Everyday',
        pledgeAmount: 1,
        targetDate: new Date(),
        createdAt: new Date(),
      };

      console.log('🔍 Saving habit with:', goal);

      console.log('💾 Saving custom habit:', goal);
      await GoalsService.addGoal(goal);
      console.log('✅ Custom habit saved successfully');

      // Reset state
      setDescription('');
      setAiSuggestions([]);
      setShowSuggestions(false);

      // Close this modal and parent modal
      onClose();
      if (parentModalClose) {
        parentModalClose();
      }

      // Navigate directly to Dashboard
      if (navigation) {
        console.log('🔄 Navigating to Dashboard after adding custom habit...');
        // Use setTimeout to ensure modals close before navigation
        setTimeout(() => {
          navigation.navigate('Dashboard');
        }, 200);
      }
    } catch (error) {
      console.error('❌ Error adding custom habit:', error);
      Alert.alert('Error', 'Failed to add habit');
    }
  };

  const selectSuggestion = (suggestion) => {
    setDescription(suggestion);
    setShowSuggestions(false);
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color="#2D3748" />
            </TouchableOpacity>
            <Text style={styles.moodEmojiHeader}>{moodEmoji}</Text>
            <Text style={styles.headerTitle}>Add Custom Habit</Text>
          </View>

          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
            {/* Category Card */}
            <View style={styles.categoryCard}>
              <Text style={styles.categoryEmoji}>{moodEmoji}</Text>
              <View style={styles.categoryText}>
                <Text style={styles.categoryTitle}>Category: {moodName}</Text>
                <Text style={styles.categorySubtitle}>
                  Automatically set based on your mood.
                </Text>
              </View>
            </View>

            {/* Description Section */}
            <View style={styles.inputSection}>
              <Text style={styles.inputLabel}>Description</Text>
              <View style={styles.inputContainer}>
                <TextInput
                  style={styles.textInput}
                  value={description}
                  onChangeText={setDescription}
                  placeholder="Whatever inside your mind present it and modify with AI"
                  placeholderTextColor="#999"
                  multiline
                  numberOfLines={4}
                />
                <TouchableOpacity
                  style={[styles.aiButton, isGeneratingAI && styles.aiButtonDisabled]}
                  onPress={generateAISuggestions}
                  disabled={isGeneratingAI}
                >
                  {isGeneratingAI ? (
                    <ActivityIndicator size="small" color="#FFF" />
                  ) : (
                    <Text style={styles.aiButtonText}>AI</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* AI Suggestions */}
            {showSuggestions && aiSuggestions.length > 0 && (
              <View style={styles.suggestionsSection}>
                <Text style={styles.suggestionsTitle}>AI Suggestions:</Text>
                {aiSuggestions.map((suggestion, index) => (
                  <TouchableOpacity
                    key={index}
                    style={styles.suggestionCard}
                    onPress={() => selectSuggestion(suggestion)}
                  >
                    <View style={styles.suggestionNumber}>
                      <Text style={styles.suggestionNumberText}>{index + 1}</Text>
                    </View>
                    <Text style={styles.suggestionText}>{suggestion}</Text>
                    <Ionicons name="touch-app" size={18} color="#808080" />
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>

          {/* Add Button */}
          <View style={styles.footer}>
            <TouchableOpacity 
              style={[
                styles.addButton,
                !description.trim() && styles.addButtonDisabled
              ]} 
              onPress={addCustomHabit}
              disabled={!description.trim()}
            >
              <Text style={styles.addButtonIcon}>+</Text>
              <Text style={styles.addButtonText}>Add Custom Habit</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  modalContainer: {
    width: '92%',
    height: '82%',
    backgroundColor: '#FFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 24,
    elevation: 24,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#ECFDF5',
    borderBottomWidth: 0.5,
    borderBottomColor: '#D1FAE5',
  },
  moodEmojiHeader: {
    fontSize: 28,
    marginHorizontal: 10,
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: '700',
    color: '#1A202C',
    flex: 1,
    letterSpacing: -0.3,
  },
  scrollView: {
    flex: 1,
    padding: 20,
  },
  categoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 18,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#10B981',
    marginBottom: 24,
    shadowColor: '#10B981',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  categoryEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  categoryText: {
    flex: 1,
  },
  categoryTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 6,
    letterSpacing: -0.3,
  },
  categorySubtitle: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '500',
  },
  inputSection: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2D3748',
    marginBottom: 12,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: '#D0D0D0',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
    minHeight: 140,
  },
  textInput: {
    padding: 16,
    paddingRight: 70,
    fontSize: 15,
    color: '#2D3748',
    textAlignVertical: 'top',
    minHeight: 140,
  },
  aiButton: {
    position: 'absolute',
    right: 8,
    top: 8,
    backgroundColor: '#20C997',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 8,
  },
  aiButtonDisabled: {
    backgroundColor: '#CBD5E0',
  },
  aiButtonText: {
    color: '#FFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  suggestionsSection: {
    marginTop: 16,
    backgroundColor: '#FAFCFD',
    padding: 16,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#ECFDF5',
  },
  suggestionsTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginBottom: 14,
    letterSpacing: -0.2,
  },
  suggestionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
    marginBottom: 12,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  suggestionNumber: {
    width: 32,
    height: 32,
    backgroundColor: '#20C997',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  suggestionNumberText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFF',
  },
  suggestionText: {
    flex: 1,
    fontSize: 15,
    color: '#2D3748',
    lineHeight: 22,
    fontWeight: '500',
  },
  footer: {
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderTopWidth: 0,
    borderTopColor: 'transparent',
    backgroundColor: '#FAFCFD',
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#20C997',
    borderWidth: 0,
    paddingVertical: 16,
    borderRadius: 16,
    gap: 10,
    shadowColor: '#20C997',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  addButtonDisabled: {
    backgroundColor: '#CBD5E0',
    shadowOpacity: 0,
  },
  addButtonIcon: {
    fontSize: 28,
    color: '#FFF',
    fontWeight: '300',
  },
  addButtonText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFF',
    letterSpacing: -0.3,
  },
});
