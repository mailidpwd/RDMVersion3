import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import BottomNavigationBar from '../components/BottomNavigationBar';

export default function TransferScreen({ navigation }) {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Transfer</Text>
        <View style={styles.headerActions}>
          <Ionicons name="notifications-outline" size={24} color="#2D3748" />
          <Ionicons name="settings-outline" size={24} color="#2D3748" />
        </View>
      </View>

      <ScrollView style={styles.content}>
        {/* Coming Soon Card */}
        <View style={styles.comingSoonCard}>
          <View style={styles.iconContainer}>
            <Ionicons name="swap-horizontal" size={48} color="#3B82F6" />
          </View>
          <Text style={styles.comingSoonTitle}>Transfer Feature</Text>
          <Text style={styles.comingSoonSubtitle}>
            Coming Soon
          </Text>
          <Text style={styles.comingSoonDescription}>
            Transfer your RDM tokens between wallets, send to friends, or manage your digital assets easily.
          </Text>
        </View>

        {/* Features Grid */}
        <View style={styles.featuresGrid}>
          <View style={styles.featureCard}>
            <Ionicons name="wallet-outline" size={32} color="#3B82F6" />
            <Text style={styles.featureTitle}>Wallet Transfer</Text>
            <Text style={styles.featureDescription}>
              Send and receive RDM tokens
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="people-outline" size={32} color="#3B82F6" />
            <Text style={styles.featureTitle}>Peer to Peer</Text>
            <Text style={styles.featureDescription}>
              Transfer to friends and family
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="shield-checkmark-outline" size={32} color="#3B82F6" />
            <Text style={styles.featureTitle}>Secure</Text>
            <Text style={styles.featureDescription}>
              Blockchain secured transfers
            </Text>
          </View>

          <View style={styles.featureCard}>
            <Ionicons name="flash-outline" size={32} color="#3B82F6" />
            <Text style={styles.featureTitle}>Fast</Text>
            <Text style={styles.featureDescription}>
              Instant transaction processing
            </Text>
          </View>
        </View>
      </ScrollView>

      <BottomNavigationBar navigation={navigation} currentRoute="Transfer" />
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
  comingSoonCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 32,
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  iconContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  comingSoonTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1A202C',
    marginBottom: 8,
  },
  comingSoonSubtitle: {
    fontSize: 16,
    color: '#3B82F6',
    fontWeight: '600',
    marginBottom: 16,
  },
  comingSoonDescription: {
    fontSize: 14,
    color: '#718096',
    textAlign: 'center',
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

