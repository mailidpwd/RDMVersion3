import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import BottomNavigationBar from '../components/BottomNavigationBar';

export default function DonateScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Donate</Text>
        <View style={styles.headerActions}>
          <Ionicons name="search-outline" size={24} color="#2D3748" />
          <Ionicons name="heart-outline" size={24} color="#EC4899" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <LinearGradient
            colors={['#EC4899', '#DB2777']}
            style={styles.heroGradient}
          >
            <Ionicons name="heart" size={48} color="#FFFFFF" />
            <Text style={styles.heroTitle}>Make a Difference</Text>
            <Text style={styles.heroSubtitle}>
              Donate your RDM tokens to support meaningful causes
            </Text>
          </LinearGradient>
        </View>

        {/* Coming Soon Section */}
        <View style={styles.comingSoonCard}>
          <Text style={styles.comingSoonTitle}>Donation Feature</Text>
          <Text style={styles.comingSoonSubtitle}>Coming Soon</Text>
          <Text style={styles.comingSoonDescription}>
            We're building a platform to connect you with charities, education initiatives, and environmental causes that align with your values.
          </Text>
        </View>

        {/* Causes Grid */}
        <View style={styles.causesGrid}>
          <View style={styles.causeCard}>
            <Ionicons name="school-outline" size={32} color="#EC4899" />
            <Text style={styles.causeTitle}>Education</Text>
            <Text style={styles.causeDescription}>
              Support learning initiatives
            </Text>
          </View>

          <View style={styles.causeCard}>
            <Ionicons name="heart-outline" size={32} color="#EC4899" />
            <Text style={styles.causeTitle}>Healthcare</Text>
            <Text style={styles.causeDescription}>
              Help those in need
            </Text>
          </View>

          <View style={styles.causeCard}>
            <Ionicons name="leaf-outline" size={32} color="#EC4899" />
            <Text style={styles.causeTitle}>Environment</Text>
            <Text style={styles.causeDescription}>
              Protect our planet
            </Text>
          </View>

          <View style={styles.causeCard}>
            <Ionicons name="people-outline" size={32} color="#EC4899" />
            <Text style={styles.causeTitle}>Community</Text>
            <Text style={styles.causeDescription}>
              Build stronger societies
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigationBar navigation={navigation} currentRoute="Donate" />
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
    color: '#EC4899',
    fontWeight: '600',
    marginBottom: 12,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#718096',
    lineHeight: 20,
  },
  causesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
  },
  causeCard: {
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
  causeTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1A202C',
    marginTop: 12,
    marginBottom: 4,
  },
  causeDescription: {
    fontSize: 12,
    color: '#718096',
    textAlign: 'center',
    lineHeight: 16,
  },
});

