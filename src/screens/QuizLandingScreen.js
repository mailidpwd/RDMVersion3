import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';

export default function QuizLandingScreen({ navigation }) {
  const categories = [
    {
      id: 'mindfulness',
      title: 'Mindfulness',
      emoji: '🧘',
      description: 'Assess your ability to stay present and focused',
      color: ['#10B981', '#059669'],
    },
    {
      id: 'purposefulness',
      title: 'Purposefulness',
      emoji: '🎯',
      description: 'Discover your sense of meaning and direction',
      color: ['#F59E0B', '#E58306'],
    },
    {
      id: 'empathy',
      title: 'Empathy',
      emoji: '❤️',
      description: 'Understand your emotional intelligence',
      color: ['#EF4444', '#DC2626'],
    },
  ];

  const handleStartQuiz = (category) => {
    navigation.navigate('Quiz', { category });
  };

  const handleContinueToDashboard = () => {
    navigation.navigate('Dashboard');
  };

  return (
    <ScrollView style={styles.container}>
      {/* Discover Your Leadership Profile Card */}
      <View style={styles.discoverCard}>
        <View style={styles.discoverContent}>
          {/* Icon on Left - Changed to star */}
          <Text style={styles.discoverIcon}>⭐</Text>

          {/* Center Content */}
          <View style={styles.discoverCenter}>
            <Text style={styles.discoverTitle}>Discover your Leadership Profile</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Quick Assessment</Text>
            </View>
            <Text style={styles.discoverDescription} numberOfLines={1}>
              Uncover your true leadership potential. Our advanced insights reveal your core strengths.
            </Text>
          </View>

          {/* Right Icons */}
          <View style={styles.rightIconsContainer}>
            <Text style={styles.rightIcon}>⚡</Text>
            <Text style={styles.rightIcon}>⏱️</Text>
          </View>
        </View>
      </View>

      {/* Quiz Categories */}
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryCard}
          onPress={() => handleStartQuiz(category.id)}
          activeOpacity={0.8}
        >
          <View style={styles.categoryContent}>
            <Text style={styles.categoryEmoji}>{category.emoji}</Text>
            <View style={styles.categoryTextContainer}>
              <Text style={styles.categoryTitle} numberOfLines={1}>{category.title}</Text>
              <Text style={styles.categoryDescription} numberOfLines={2}>
                {category.description}
              </Text>
            </View>
            
            {/* START Button on Right - Green background */}
            <View style={styles.startBadge}>
              <Text style={styles.startBadgeText}>Start →</Text>
            </View>
          </View>
        </TouchableOpacity>
      ))}

      {/* Continue Button */}
      <TouchableOpacity
        style={styles.continueButton}
        onPress={handleContinueToDashboard}
      >
        <Text style={styles.continueButtonText}>
          Continue to Dashboard
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  discoverCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 180,
  },
  discoverContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 160,
  },
  discoverIcon: {
    fontSize: 52,
    marginRight: 16,
  },
  discoverCenter: {
    flex: 1,
    marginRight: 12,
  },
  discoverTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    lineHeight: 26,
  },
  tagContainer: {
    backgroundColor: '#F3F4F6',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  tagText: {
    color: '#000000',
    fontSize: 11,
    fontWeight: '600',
  },
  discoverDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  rightIconsContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  rightIcon: {
    fontSize: 28,
    marginBottom: 6,
  },
  categoryCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    minHeight: 160,
  },
  categoryContent: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    minHeight: 160,
  },
  categoryEmoji: {
    fontSize: 48,
    marginRight: 16,
  },
  categoryTextContainer: {
    flex: 1,
    paddingRight: 12,
    minWidth: 0,
  },
  categoryTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 8,
    flexShrink: 0,
  },
  categoryDescription: {
    fontSize: 14,
    color: '#000000',
    lineHeight: 20,
  },
  startBadge: {
    backgroundColor: '#20C997',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 16,
    flexShrink: 0,
  },
  startBadgeText: {
    color: '#000000',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: '#20C997',
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#000000',
    fontSize: 16,
    fontWeight: '600',
  },
});

