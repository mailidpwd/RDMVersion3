import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Colors } from '../constants/Colors';

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
        <LinearGradient
          colors={['#9B7EDE', '#764BA2']}
          style={styles.discoverGradient}
        >
          {/* Target Icon on Left */}
          <Text style={styles.targetIcon}>🎯</Text>

          {/* Center Content */}
          <View style={styles.discoverCenter}>
            <Text style={styles.discoverTitle}>Discover your Leadership Profile</Text>
            <View style={styles.tagContainer}>
              <Text style={styles.tagText}>Quick Assessment</Text>
            </View>
            <Text style={styles.discoverDescription}>
              Uncover your true leadership potential. Our advanced insights reveal your core strengths.
            </Text>
          </View>

          {/* Right Icons */}
          <View style={styles.rightIconsContainer}>
            <Text style={styles.rightIcon}>⚡</Text>
            <Text style={styles.rightIcon}>⏱️</Text>
          </View>
        </LinearGradient>
      </View>

      {/* Quiz Categories */}
      {categories.map((category) => (
        <TouchableOpacity
          key={category.id}
          style={styles.categoryCard}
          onPress={() => handleStartQuiz(category.id)}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={category.color}
            style={styles.categoryGradient}
          >
            <View style={styles.categoryContent}>
              <Text style={styles.categoryEmoji}>{category.emoji}</Text>
              <View style={styles.categoryTextContainer}>
                <Text style={styles.categoryTitle}>{category.title}</Text>
                <Text style={styles.categoryDescription} numberOfLines={2}>
                  {category.description}
                </Text>
              </View>
              
              {/* START Button on Right */}
              <View style={styles.startBadge}>
                <Text style={styles.startBadgeText}>Start →</Text>
              </View>
            </View>
          </LinearGradient>
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
    backgroundColor: Colors.BACKGROUND,
  },
  discoverCard: {
    marginHorizontal: 16,
    marginTop: 16,
    marginBottom: 20,
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#667eea',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    minHeight: 180,
  },
  discoverGradient: {
    padding: 24,
    flexDirection: 'row',
    alignItems: 'flex-start',
    minHeight: 160,
  },
  targetIcon: {
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
    color: '#FFF',
    marginBottom: 8,
    lineHeight: 26,
  },
  tagContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  tagText: {
    color: '#FFF',
    fontSize: 11,
    fontWeight: '600',
  },
  discoverDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
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
    overflow: 'hidden',
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    minHeight: 160,
  },
  categoryGradient: {
    padding: 24,
    minHeight: 160,
    justifyContent: 'center',
  },
  categoryContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryEmoji: {
    fontSize: 56,
    marginRight: 20,
  },
  categoryTextContainer: {
    flex: 1,
    paddingRight: 12,
  },
  categoryTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#FFF',
    marginBottom: 8,
    flexWrap: 'nowrap',
  },
  categoryDescription: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.95)',
    lineHeight: 20,
  },
  startBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.98)',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
  },
  startBadgeText: {
    color: '#1A202C',
    fontSize: 14,
    fontWeight: 'bold',
  },
  continueButton: {
    marginHorizontal: 16,
    marginVertical: 24,
    paddingVertical: 16,
    backgroundColor: Colors.PRIMARY,
    borderRadius: 12,
    alignItems: 'center',
  },
  continueButtonText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '600',
  },
});

