import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  TextInput,
  Animated,
  FlatList,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';

const GlassmorphicCard = ({ children, style = {} }) => {
  return (
    <BlurView intensity={20} style={[styles.glassCard, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
      />
      {children}
    </BlurView>
  );
};

const getStatusInfo = (status) => {
  switch (status) {
    case 'real':
      return { icon: 'checkmark-circle', color: '#22C55E', label: '✅ Real' };
    case 'fake':
      return { icon: 'close-circle', color: '#EF4444', label: '❌ Fake' };
    case 'possibly_fake':
      return { icon: 'warning', color: '#F59E0B', label: '⚠️ Possibly Fake' };
    default:
      return { icon: 'help-circle', color: '#6B7280', label: '🤔 Unverified' };
  }
};

// Mock data for history - in real app this would come from storage/database
const generateMockHistory = () => [
  {
    id: '1',
    content: 'Congratulations! You\'ve won $1,000,000 in our lottery! Click here to claim your prize now!',
    result: {
      status: 'fake',
      confidence: 95,
      type: 'lottery_scam',
      explanation: 'Classic lottery scam with unrealistic prize claims and urgency tactics.',
      safetyTip: 'Never click suspicious links claiming prize wins.',
      riskLevel: 'high'
    },
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '2',
    content: 'Your bank account has been temporarily suspended. Please verify your details immediately.',
    result: {
      status: 'fake',
      confidence: 92,
      type: 'phishing',
      explanation: 'Phishing attempt using urgency and fear tactics to steal banking credentials.',
      safetyTip: 'Banks never ask for credentials via email or text.',
      riskLevel: 'critical'
    },
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '3',
    content: 'Microsoft has detected suspicious activity on your computer. Call this number to fix it.',
    result: {
      status: 'fake',
      confidence: 88,
      type: 'tech_support',
      explanation: 'Tech support scam using Microsoft impersonation.',
      safetyTip: 'Microsoft never contacts users about computer issues.',
      riskLevel: 'high'
    },
    timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '4',
    content: 'Job opportunity: Work from home, earn $5000/month with minimal effort!',
    result: {
      status: 'possibly_fake',
      confidence: 78,
      type: 'job_scam',
      explanation: 'Unrealistic salary promises with minimal qualifications required.',
      safetyTip: 'Research companies thoroughly before applying.',
      riskLevel: 'medium'
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
  },
  {
    id: '5',
    content: 'Your package delivery failed. Please update your address to reschedule delivery.',
    result: {
      status: 'real',
      confidence: 85,
      type: 'other',
      explanation: 'Legitimate delivery notification with proper tracking information.',
      safetyTip: 'Always verify sender details and tracking numbers.',
      riskLevel: 'low'
    },
    timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
  },
];

const HistoryItem = ({ item, onPress }) => {
  const statusInfo = getStatusInfo(item.result.status);
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.98,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) {
      return 'Just now';
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.historyItemContainer}
      >
        <BlurView intensity={15} style={styles.historyItem}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 15 }]}
          />
          
          <View style={styles.historyHeader}>
            <View style={[styles.statusBadge, { backgroundColor: `${statusInfo.color}20` }]}>
              <Ionicons name={statusInfo.icon} size={16} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <Text style={styles.timestamp}>{formatDate(item.timestamp)}</Text>
          </View>

          <Text style={styles.contentPreview} numberOfLines={2}>
            {item.content}
          </Text>

          <View style={styles.historyFooter}>
            <View style={styles.confidenceContainer}>
              <Text style={styles.confidenceLabel}>Confidence: </Text>
              <Text style={[styles.confidenceValue, { color: statusInfo.color }]}>
                {item.result.confidence}%
              </Text>
            </View>
            <Text style={styles.scamType}>
              {item.result.type.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

export default function HistoryScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [historyData, setHistoryData] = useState([]);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Load mock data
    setHistoryData(generateMockHistory());
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const filters = [
    { id: 'all', label: 'All', icon: 'list' },
    { id: 'fake', label: 'Fake', icon: 'close-circle', color: '#EF4444' },
    { id: 'real', label: 'Real', icon: 'checkmark-circle', color: '#22C55E' },
    { id: 'possibly_fake', label: 'Suspicious', icon: 'warning', color: '#F59E0B' },
  ];

  const filteredHistory = historyData.filter(item => {
    const matchesSearch = item.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         item.result.type.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesFilter = selectedFilter === 'all' || item.result.status === selectedFilter;
    return matchesSearch && matchesFilter;
  });

  const handleItemPress = (item) => {
    navigation.navigate('ScanResult', {
      content: item.content,
      result: item.result,
      timestamp: item.timestamp
    });
  };

  const renderFilterButton = (filter) => (
    <Pressable
      key={filter.id}
      onPress={() => {
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        setSelectedFilter(filter.id);
      }}
      style={[
        styles.filterButton,
        selectedFilter === filter.id && styles.filterButtonActive
      ]}
    >
      <BlurView intensity={selectedFilter === filter.id ? 25 : 15} style={styles.filterButtonBlur}>
        {selectedFilter === filter.id && (
          <LinearGradient
            colors={[filter.color || '#00D4FF', (filter.color || '#00D4FF') + '80']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
          />
        )}
        <Ionicons 
          name={filter.icon} 
          size={16} 
          color={selectedFilter === filter.id ? 'white' : (filter.color || 'rgba(255,255,255,0.7)')} 
        />
        <Text style={[
          styles.filterButtonText,
          selectedFilter === filter.id && styles.filterButtonTextActive
        ]}>
          {filter.label}
        </Text>
      </BlurView>
    </Pressable>
  );

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan History</Text>
        <Text style={styles.subtitle}>Review your previous scam checks</Text>
      </View>

      <GlassmorphicCard style={styles.searchCard}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color="rgba(255,255,255,0.5)" />
          <TextInput
            style={styles.searchInput}
            placeholder="Search history..."
            placeholderTextColor="rgba(255,255,255,0.5)"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery ? (
            <Pressable onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={20} color="rgba(255,255,255,0.5)" />
            </Pressable>
          ) : null}
        </View>
      </GlassmorphicCard>

      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        style={styles.filtersContainer}
        contentContainerStyle={styles.filtersContent}
      >
        {filters.map(renderFilterButton)}
      </ScrollView>

      <View style={styles.statsContainer}>
        <Text style={styles.statsText}>
          {filteredHistory.length} {filteredHistory.length === 1 ? 'result' : 'results'}
        </Text>
      </View>

      <FlatList
        data={filteredHistory}
        renderItem={({ item }) => (
          <HistoryItem item={item} onPress={handleItemPress} />
        )}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={() => (
          <GlassmorphicCard style={styles.emptyCard}>
            <Ionicons name="search" size={48} color="rgba(255,255,255,0.3)" />
            <Text style={styles.emptyTitle}>No Results Found</Text>
            <Text style={styles.emptyText}>
              {searchQuery ? 'Try adjusting your search terms' : 'Start scanning content to build your history'}
            </Text>
          </GlassmorphicCard>
        )}
      />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
  },
  header: {
    marginBottom: 25,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  searchCard: {
    marginBottom: 20,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    marginLeft: 12,
    marginRight: 12,
    color: 'white',
    fontSize: 16,
  },
  filtersContainer: {
    marginBottom: 15,
  },
  filtersContent: {
    paddingRight: 20,
  },
  filterButton: {
    marginRight: 12,
    borderRadius: 20,
    overflow: 'hidden',
  },
  filterButtonActive: {},
  filterButtonBlur: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  filterButtonText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.7)',
  },
  filterButtonTextActive: {
    color: 'white',
  },
  statsContainer: {
    marginBottom: 15,
  },
  statsText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  listContent: {
    paddingBottom: 120,
  },
  historyItemContainer: {
    marginBottom: 15,
  },
  historyItem: {
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    marginLeft: 6,
    fontSize: 12,
    fontWeight: '600',
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
  },
  contentPreview: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 20,
    marginBottom: 12,
  },
  historyFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  confidenceLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  confidenceValue: {
    fontSize: 12,
    fontWeight: 'bold',
  },
  scamType: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textTransform: 'uppercase',
  },
  emptyCard: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});