import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  FlatList,
  RefreshControl,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
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
    case 'active':
      return { icon: 'warning', color: '#EF4444', label: 'Active Threat', bg: 'rgba(239, 68, 68, 0.2)' };
    case 'rising':
      return { icon: 'trending-up', color: '#F59E0B', label: 'Rising Alert', bg: 'rgba(245, 158, 11, 0.2)' };
    case 'contained':
      return { icon: 'shield-checkmark', color: '#22C55E', label: 'Contained', bg: 'rgba(34, 197, 94, 0.2)' };
    default:
      return { icon: 'information-circle', color: '#6B7280', label: 'Monitoring', bg: 'rgba(107, 114, 128, 0.2)' };
  }
};

const getSeverityColor = (severity) => {
  switch (severity) {
    case 'critical': return '#DC2626';
    case 'high': return '#EA580C';
    case 'medium': return '#D97706';
    case 'low': return '#16A34A';
    default: return '#6B7280';
  }
};

// Mock trending scams data
const generateTrendingScams = () => [
  {
    id: '1',
    title: 'Fake COVID-19 Vaccination Certificates',
    description: 'Scammers are selling fake vaccination certificates online, targeting travelers and job seekers.',
    type: 'document_fraud',
    status: 'active',
    severity: 'high',
    reportCount: 2450,
    firstSeen: '2024-01-15',
    lastUpdated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    regions: ['Global'],
    platforms: ['Telegram', 'WhatsApp', 'Dark Web'],
    indicators: [
      'Requests for payment via cryptocurrency',
      'Claims of "official" government certificates',
      'Urgency tactics for quick purchase'
    ]
  },
  {
    id: '2',
    title: 'AI-Generated Romance Scam Profiles',
    description: 'Sophisticated romance scams using AI-generated photos and chatbots to deceive victims.',
    type: 'romance_scam',
    status: 'rising',
    severity: 'critical',
    reportCount: 1890,
    firstSeen: '2024-01-10',
    lastUpdated: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    regions: ['North America', 'Europe', 'Australia'],
    platforms: ['Dating Apps', 'Social Media', 'Instagram'],
    indicators: [
      'AI-generated profile photos',
      'Quick emotional attachment',
      'Financial emergencies after few weeks'
    ]
  },
  {
    id: '3',
    title: 'Fake Crypto Investment Platforms',
    description: 'Fraudulent cryptocurrency platforms promising guaranteed returns, targeting new investors.',
    type: 'crypto_scam',
    status: 'active',
    severity: 'critical',
    reportCount: 3200,
    firstSeen: '2024-01-08',
    lastUpdated: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    regions: ['Global'],
    platforms: ['Fake Websites', 'Social Media Ads', 'YouTube'],
    indicators: [
      'Guaranteed high returns (20%+ weekly)',
      'Celebrity endorsements (often fake)',
      'Pressure to invest quickly'
    ]
  },
  {
    id: '4',
    title: 'Tech Support Phone Scams 2.0',
    description: 'Advanced tech support scams using legitimate-looking websites and remote access tools.',
    type: 'tech_support',
    status: 'contained',
    severity: 'medium',
    reportCount: 1250,
    firstSeen: '2024-01-05',
    lastUpdated: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    regions: ['United States', 'Canada', 'UK'],
    platforms: ['Cold Calls', 'Pop-up Ads', 'Fake Websites'],
    indicators: [
      'Unsolicited calls about computer issues',
      'Requests for remote access',
      'Payment via gift cards or wire transfer'
    ]
  },
  {
    id: '5',
    title: 'Scholarship Grant Fraud',
    description: 'Fake scholarship offers targeting students, requiring upfront fees for processing.',
    type: 'scholarship_scam',
    status: 'rising',
    severity: 'medium',
    reportCount: 980,
    firstSeen: '2024-01-12',
    lastUpdated: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    regions: ['India', 'Philippines', 'Nigeria'],
    platforms: ['Email', 'SMS', 'WhatsApp'],
    indicators: [
      'Unsolicited scholarship offers',
      'Requests for processing fees',
      'Fake government agency claims'
    ]
  }
];

const TrendingScamCard = ({ item, onPress }) => {
  const statusInfo = getStatusInfo(item.status);
  const severityColor = getSeverityColor(item.severity);
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
      return 'Just updated';
    } else if (diffHours < 24) {
      return `Updated ${diffHours}h ago`;
    } else if (diffDays === 1) {
      return 'Updated yesterday';
    } else {
      return `Updated ${diffDays} days ago`;
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={() => onPress(item)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.scamCardContainer}
      >
        <BlurView intensity={15} style={styles.scamCard}>
          <LinearGradient
            colors={['rgba(255,255,255,0.08)', 'rgba(255,255,255,0.03)']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 15 }]}
          />
          
          <View style={styles.cardHeader}>
            <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
              <Ionicons name={statusInfo.icon} size={14} color={statusInfo.color} />
              <Text style={[styles.statusText, { color: statusInfo.color }]}>
                {statusInfo.label}
              </Text>
            </View>
            <View style={[styles.severityBadge, { backgroundColor: `${severityColor}20` }]}>
              <Text style={[styles.severityText, { color: severityColor }]}>
                {item.severity.toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.scamTitle} numberOfLines={2}>
            {item.title}
          </Text>
          
          <Text style={styles.scamDescription} numberOfLines={3}>
            {item.description}
          </Text>

          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Ionicons name="flag" size={16} color="#EF4444" />
              <Text style={styles.statText}>{item.reportCount.toLocaleString()} reports</Text>
            </View>
            <Text style={styles.lastUpdated}>{formatDate(item.lastUpdated)}</Text>
          </View>

          <View style={styles.platformsContainer}>
            <Text style={styles.platformsLabel}>Platforms:</Text>
            <View style={styles.platformTags}>
              {item.platforms.slice(0, 2).map((platform, index) => (
                <View key={index} style={styles.platformTag}>
                  <Text style={styles.platformTagText}>{platform}</Text>
                </View>
              ))}
              {item.platforms.length > 2 && (
                <Text style={styles.morePlatforms}>+{item.platforms.length - 2} more</Text>
              )}
            </View>
          </View>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

const StatsCard = ({ title, value, icon, color }) => (
  <GlassmorphicCard style={styles.statCard}>
    <LinearGradient
      colors={[`${color}20`, 'transparent']}
      style={styles.statCardBackground}
    />
    <Ionicons name={icon} size={24} color={color} />
    <Text style={styles.statValue}>{value}</Text>
    <Text style={styles.statTitle}>{title}</Text>
  </GlassmorphicCard>
);

export default function TrendingScamsScreen() {
  const [trendingData, setTrendingData] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    loadTrendingData();
    
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const loadTrendingData = () => {
    setTrendingData(generateTrendingScams());
  };

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      loadTrendingData();
      setRefreshing(false);
    }, 1500);
  };

  const filters = [
    { id: 'all', label: 'All Threats', icon: 'list' },
    { id: 'active', label: 'Active', icon: 'warning', color: '#EF4444' },
    { id: 'rising', label: 'Rising', icon: 'trending-up', color: '#F59E0B' },
    { id: 'critical', label: 'Critical', icon: 'alert-circle', color: '#DC2626' },
  ];

  const filteredData = selectedFilter === 'all' 
    ? trendingData 
    : selectedFilter === 'critical'
      ? trendingData.filter(item => item.severity === 'critical')
      : trendingData.filter(item => item.status === selectedFilter);

  const handleItemPress = (item) => {
    // Navigate to detailed scam view - for now show a summary
    navigation.navigate('ScanResult', {
      content: `${item.title}\n\n${item.description}\n\nIndicators:\n${item.indicators.join('\n• ')}`,
      result: {
        status: 'fake',
        confidence: 98,
        type: item.type,
        explanation: `This is a known trending scam with ${item.reportCount} reports. ${item.description}`,
        safetyTip: `Avoid platforms like ${item.platforms.join(', ')}. Be cautious of: ${item.indicators[0]}`,
        riskLevel: item.severity
      },
      timestamp: item.lastUpdated
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
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#00D4FF" />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View style={styles.headerTop}>
            <View>
              <Text style={styles.title}>Trending Scams</Text>
              <Text style={styles.subtitle}>Real-time threat intelligence</Text>
            </View>
            <View style={styles.alertIndicator}>
              <Ionicons name="pulse" size={20} color="#EF4444" />
              <Text style={styles.alertText}>Live</Text>
            </View>
          </View>
        </View>

        <View style={styles.statsContainer}>
          <StatsCard
            title="Active Threats"
            value={trendingData.filter(item => item.status === 'active').length}
            icon="warning"
            color="#EF4444"
          />
          <StatsCard
            title="Rising Alerts"
            value={trendingData.filter(item => item.status === 'rising').length}
            icon="trending-up"
            color="#F59E0B"
          />
          <StatsCard
            title="Total Reports"
            value={trendingData.reduce((sum, item) => sum + item.reportCount, 0).toLocaleString()}
            icon="flag"
            color="#00D4FF"
          />
        </View>

        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          style={styles.filtersContainer}
          contentContainerStyle={styles.filtersContent}
        >
          {filters.map(renderFilterButton)}
        </ScrollView>

        <View style={styles.listContainer}>
          <Text style={styles.sectionTitle}>
            {selectedFilter === 'all' ? 'All Threats' : filters.find(f => f.id === selectedFilter)?.label} 
            ({filteredData.length})
          </Text>
          
          {filteredData.map((item, index) => (
            <TrendingScamCard 
              key={item.id} 
              item={item} 
              onPress={handleItemPress}
            />
          ))}
        </View>

        <GlassmorphicCard style={styles.infoCard}>
          <View style={styles.infoHeader}>
            <Ionicons name="information-circle" size={24} color="#00D4FF" />
            <Text style={styles.infoTitle}>How We Track Scams</Text>
          </View>
          <Text style={styles.infoText}>
            Our AI system analyzes reports from users worldwide, monitors social media platforms, 
            and tracks emerging threats in real-time to keep you protected.
          </Text>
        </GlassmorphicCard>
      </ScrollView>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 25,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
  alertIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
  },
  alertText: {
    color: '#EF4444',
    fontSize: 12,
    fontWeight: 'bold',
    marginLeft: 6,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    marginBottom: 20,
    gap: 15,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    padding: 15,
    position: 'relative',
  },
  statCardBackground: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 20,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 8,
    marginBottom: 4,
  },
  statTitle: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
  filtersContainer: {
    marginBottom: 20,
    paddingLeft: 20,
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
  listContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  scamCardContainer: {
    marginBottom: 15,
  },
  scamCard: {
    borderRadius: 15,
    padding: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
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
    fontSize: 11,
    fontWeight: '600',
  },
  severityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  severityText: {
    fontSize: 10,
    fontWeight: 'bold',
  },
  scamTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  scamDescription: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 12,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    marginLeft: 6,
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
  },
  lastUpdated: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
  },
  platformsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  platformsLabel: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.6)',
    marginRight: 8,
  },
  platformTags: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  platformTag: {
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginRight: 6,
  },
  platformTagText: {
    fontSize: 10,
    color: '#00D4FF',
    fontWeight: '500',
  },
  morePlatforms: {
    fontSize: 10,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoCard: {
    marginHorizontal: 20,
    marginBottom: 120,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
});