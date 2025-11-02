import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigationBar from '../components/BottomNavigationBar';

export default function MedaaAIScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Medaa AI</Text>
        <View style={styles.headerActions}>
          <Ionicons name="chatbubbles-outline" size={24} color="#8B5CF6" />
          <Ionicons name="settings-outline" size={24} color="#2D3748" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#8B5CF6', '#7C3AED']}
            style={styles.heroGradient}
          >
            <Ionicons name="sparkles" size={48} color="#FFFFFF" />
            <Text style={styles.heroTitle}>AI Assistant</Text>
            <Text style={styles.heroSubtitle}>
              Your intelligent companion for habits and productivity
            </Text>
          </LinearGradient>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>AI Features</Text>
          <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            Experience the power of AI to track your habits, provide personalized insights, and help you achieve your goals more effectively.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Ionicons name="analytics-outline" size={32} color="#8B5CF6" />
            <Text style={styles.featureTitle}>Insights</Text>
            <Text style={styles.featureDescription}>
              Get AI-powered analytics
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="bulb-outline" size={32} color="#8B5CF6" />
            <Text style={styles.featureTitle}>Suggestions</Text>
            <Text style={styles.featureDescription}>
              Personalized recommendations
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="flash-outline" size={32} color="#8B5CF6" />
            <Text style={styles.featureTitle}>Smart Tracking</Text>
            <Text style={styles.featureDescription}>
              Automatic habit detection
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="trending-up-outline" size={32} color="#8B5CF6" />
            <Text style={styles.featureTitle}>Progress</Text>
            <Text style={styles.featureDescription}>
              AI-powered progress tracking
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigationBar navigation={navigation} currentRoute="MedaaAI" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F5F5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 48,
    backgroundColor: '#FFFFFF',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#1A202C',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 16,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  heroCard: {
    borderRadius: 20,
    overflow: 'hidden',
    marginBottom: 24,
  },
  heroGradient: {
    padding: 32,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginTop: 16,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    opacity: 0.9,
    lineHeight: 20,
  },
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  comingSoonTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#8B5CF6',
    fontWeight: '600',
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  featureCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 12,
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
});

