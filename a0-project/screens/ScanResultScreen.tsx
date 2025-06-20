import React, { useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Animated,
  Dimensions,
  Platform,
  Share
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';

const { width } = Dimensions.get('window');

const getStatusConfig = (status) => {
  switch (status) {
    case 'real':
      return {
        emoji: '✅',
        label: 'Real',
        color: '#4CAF50',
        bgColor: 'rgba(76, 175, 80, 0.2)',
        icon: 'checkmark-circle'
      };
    case 'fake':
      return {
        emoji: '❌',
        label: 'Fake',
        color: '#F44336',
        bgColor: 'rgba(244, 67, 54, 0.2)',
        icon: 'close-circle'
      };
    case 'possibly_fake':
      return {
        emoji: '⚠️',
        label: 'Possibly Fake',
        color: '#FF9800',
        bgColor: 'rgba(255, 152, 0, 0.2)',
        icon: 'warning'
      };
    default:
      return {
        emoji: '🤔',
        label: 'Unverified',
        color: '#9E9E9E',
        bgColor: 'rgba(158, 158, 158, 0.2)',
        icon: 'help-circle'
      };
  }
};

const getRiskLevelConfig = (riskLevel) => {
  switch (riskLevel) {
    case 'critical':
      return { color: '#D32F2F', label: 'Critical Risk', icon: 'alert-circle' };
    case 'high':
      return { color: '#F57C00', label: 'High Risk', icon: 'warning' };
    case 'medium':
      return { color: '#FBC02D', label: 'Medium Risk', icon: 'alert' };
    default:
      return { color: '#388E3C', label: 'Low Risk', icon: 'checkmark-circle' };
  }
};

const GlassmorphicCard = ({ children, style = {} }) => {
  return (
    <BlurView intensity={20} style={[styles.glassCard, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
        style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
      />
      <View style={styles.glowBorder} />
      {children}
    </BlurView>
  );
};

const AnimatedButton = ({ onPress, children, style = {}, glowColor = '#00D4FF' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 0.96,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  const handlePressOut = () => {
    Animated.parallel([
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }),
      Animated.timing(glowAnim, {
        toValue: 0,
        duration: 150,
        useNativeDriver: false,
      }),
    ]).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, style]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.animatedButton}
      >
        <Animated.View style={[
          styles.buttonGlow,
          {
            shadowColor: glowColor,
            shadowOpacity: glowAnim,
          }
        ]} />
        {children}
      </Pressable>
    </Animated.View>
  );
};

export default function ScanResultScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { content, result, timestamp } = route.params;
  
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const statusConfig = getStatusConfig(result.status);
  const riskConfig = getRiskLevelConfig(result.riskLevel);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `ScamShield Analysis:\n\nStatus: ${statusConfig.emoji} ${statusConfig.label}\nConfidence: ${result.confidence}%\nType: ${result.type}\n\nAnalysis: ${result.explanation}\n\nStay safe with ScamShield!`,
        title: 'ScamShield Analysis Report'
      });
    } catch (error) {
      toast.error('Failed to share result');
    }
  };

  const handleReportIssue = () => {
    navigation.navigate('ReportScam', { 
      originalContent: content,
      originalResult: result 
    });
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <AnimatedButton
          onPress={() => navigation.goBack()}
          style={styles.backButton}
          glowColor="#00D4FF"
        >
          <BlurView intensity={15} style={styles.backButtonBlur}>
            <Ionicons name="arrow-back" size={24} color="#00D4FF" />
          </BlurView>
        </AnimatedButton>
        
        <Text style={styles.headerTitle}>Scan Result</Text>
        
        <AnimatedButton
          onPress={handleShare}
          style={styles.shareButton}
          glowColor="#00D4FF"
        >
          <BlurView intensity={15} style={styles.shareButtonBlur}>
            <Ionicons name="share-outline" size={24} color="#00D4FF" />
          </BlurView>
        </AnimatedButton>
      </View>

      <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
        <Animated.View style={[
          styles.content,
          { 
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}>
          {/* Status Card */}
          <GlassmorphicCard style={styles.statusCard}>
            <View style={[styles.statusHeader, { backgroundColor: statusConfig.bgColor }]}>
              <LinearGradient
                colors={[statusConfig.color, `${statusConfig.color}80`]}
                style={styles.statusIconGradient}
              >
                <Ionicons name={statusConfig.icon} size={40} color="white" />
              </LinearGradient>
              <View style={styles.statusInfo}>
                <Text style={[styles.statusLabel, { color: statusConfig.color }]}>
                  {statusConfig.emoji} {statusConfig.label}
                </Text>
                <Text style={styles.confidenceText}>
                  {result.confidence}% Confidence
                </Text>
              </View>
            </View>
            
            <View style={styles.confidenceBar}>
              <View style={styles.confidenceBarBg}>
                <LinearGradient
                  colors={[statusConfig.color, `${statusConfig.color}60`]}
                  style={[styles.confidenceBarFill, { width: `${result.confidence}%` }]}
                />
              </View>
            </View>
          </GlassmorphicCard>

          {/* Content Card */}
          <GlassmorphicCard style={styles.contentCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="document-text" size={24} color="#00D4FF" />
              <Text style={styles.cardTitle}>Analyzed Content</Text>
            </View>
            <View style={styles.contentBox}>
              <BlurView intensity={10} style={styles.contentBlur}>
                <Text style={styles.contentText} numberOfLines={4}>
                  {content}
                </Text>
              </BlurView>
            </View>
            <Text style={styles.timestamp}>
              Scanned on {new Date(timestamp).toLocaleString()}
            </Text>
          </GlassmorphicCard>

          {/* Analysis Card */}
          <GlassmorphicCard style={styles.analysisCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="analytics" size={24} color="#00D4FF" />
              <Text style={styles.cardTitle}>Analysis</Text>
            </View>
            
            <View style={styles.analysisSection}>
              <View style={styles.analysisItem}>
                <Ionicons name="flag" size={20} color="#FF9800" />
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisLabel}>Type</Text>
                  <Text style={styles.analysisValue}>{result.type?.replace(/_/g, ' ').toUpperCase()}</Text>
                </View>
              </View>
              
              <View style={styles.analysisItem}>
                <Ionicons name={riskConfig.icon} size={20} color={riskConfig.color} />
                <View style={styles.analysisContent}>
                  <Text style={styles.analysisLabel}>Risk Level</Text>
                  <Text style={[styles.analysisValue, { color: riskConfig.color }]}>
                    {riskConfig.label}
                  </Text>
                </View>
              </View>
            </View>
          </GlassmorphicCard>

          {/* Explanation Card */}
          <GlassmorphicCard style={styles.explanationCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color="#00D4FF" />
              <Text style={styles.cardTitle}>Why</Text>
            </View>
            <Text style={styles.explanationText}>
              {result.explanation}
            </Text>
          </GlassmorphicCard>

          {/* Safety Tip Card */}
          <GlassmorphicCard style={styles.safetyCard}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#4CAF50" />
              <Text style={styles.cardTitle}>Safety Tip</Text>
            </View>
            <Text style={styles.safetyText}>
              {result.safetyTip}
            </Text>
          </GlassmorphicCard>

          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <AnimatedButton
              onPress={() => navigation.navigate('Scanner')}
              style={styles.actionButton}
              glowColor="#00D4FF"
            >
              <LinearGradient
                colors={['#00D4FF', '#0099CC']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="scan" size={24} color="white" />
                <Text style={styles.actionButtonText}>Scan Again</Text>
              </LinearGradient>
            </AnimatedButton>

            <AnimatedButton
              onPress={handleReportIssue}
              style={styles.actionButton}
              glowColor="#FF6B6B"
            >
              <LinearGradient
                colors={['#FF6B6B', '#CC5555']}
                style={styles.actionButtonGradient}
              >
                <Ionicons name="flag" size={24} color="white" />
                <Text style={styles.actionButtonText}>Report Issue</Text>
              </LinearGradient>
            </AnimatedButton>
          </View>
        </Animated.View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  shareButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
  },
  shareButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  content: {
    flex: 1,
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    position: 'relative',
  },
  glowBorder: {
    position: 'absolute',
    top: -1,
    left: -1,
    right: -1,
    bottom: -1,
    borderRadius: 20,
    padding: 1,
    background: 'linear-gradient(45deg, #00D4FF, #FF00FF)',
    opacity: 0.3,
  },
  statusCard: {
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    borderRadius: 15,
    marginBottom: 15,
  },
  statusIconGradient: {
    width: 70,
    height: 70,
    borderRadius: 35,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  statusInfo: {
    flex: 1,
  },
  statusLabel: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  confidenceText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
  },
  confidenceBar: {
    marginTop: 10,
  },
  confidenceBarBg: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  confidenceBarFill: {
    height: '100%',
    borderRadius: 4,
  },
  contentCard: {
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  contentBox: {
    marginBottom: 10,
  },
  contentBlur: {
    borderRadius: 10,
    overflow: 'hidden',
  },
  contentText: {
    padding: 15,
    color: 'white',
    fontSize: 16,
    lineHeight: 24,
  },
  timestamp: {
    fontSize: 12,
    color: 'rgba(255,255,255,0.5)',
    fontStyle: 'italic',
  },
  analysisCard: {
    marginBottom: 20,
  },
  analysisSection: {
    gap: 15,
  },
  analysisItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  analysisContent: {
    marginLeft: 15,
    flex: 1,
  },
  analysisLabel: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 2,
  },
  analysisValue: {
    fontSize: 16,
    color: 'white',
    fontWeight: '600',
  },
  explanationCard: {
    marginBottom: 20,
  },
  explanationText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  safetyCard: {
    marginBottom: 30,
    borderColor: 'rgba(76,175,80,0.3)',
  },
  safetyText: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.8)',
    lineHeight: 24,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  actionButton: {
    flex: 1,
    borderRadius: 15,
    overflow: 'hidden',
  },
  actionButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 15,
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  animatedButton: {
    position: 'relative',
  },
  buttonGlow: {
    position: 'absolute',
    top: -5,
    left: -5,
    right: -5,
    bottom: -5,
    borderRadius: 20,
    shadowOffset: { width: 0, height: 0 },
    shadowRadius: 15,
    elevation: 10,
  },
});