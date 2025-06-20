import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  Pressable,
  Animated,
  Alert,
  Platform,
  KeyboardAvoidingView
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { toast } from 'sonner-native';
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

const CategoryButton = ({ icon, title, description, isSelected, onPress, color }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Animated.spring(scaleAnim, {
      toValue: 0.96,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={[
          styles.categoryButton,
          isSelected && { borderColor: color, borderWidth: 2 }
        ]}
      >
        <BlurView intensity={isSelected ? 25 : 15} style={styles.categoryBlur}>
          {isSelected && (
            <LinearGradient
              colors={[`${color}20`, `${color}10`]}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 15 }]}
            />
          )}
          <Ionicons 
            name={icon} 
            size={28} 
            color={isSelected ? color : 'rgba(255,255,255,0.7)'} 
          />
          <Text style={[
            styles.categoryTitle,
            isSelected && { color: color }
          ]}>
            {title}
          </Text>
          <Text style={styles.categoryDescription}>{description}</Text>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

export default function ReportScamScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { content, result } = route.params || {};

  const [selectedCategory, setSelectedCategory] = useState('');
  const [reportText, setReportText] = useState(content || '');
  const [additionalInfo, setAdditionalInfo] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const scamCategories = [
    {
      id: 'phishing',
      icon: 'mail',
      title: 'Phishing',
      description: 'Fake emails, messages asking for personal info',
      color: '#EF4444'
    },
    {
      id: 'financial',
      icon: 'card',
      title: 'Financial Fraud',
      description: 'Fake banking, loan, or payment scams',
      color: '#F59E0B'
    },
    {
      id: 'romance',
      icon: 'heart',
      title: 'Romance Scam',
      description: 'Fake dating profiles asking for money',
      color: '#EC4899'
    },
    {
      id: 'job',
      icon: 'briefcase',
      title: 'Job Scam',
      description: 'Fake job offers or work-from-home schemes',
      color: '#10B981'
    },
    {
      id: 'crypto',
      icon: 'logo-bitcoin',
      title: 'Crypto Scam',
      description: 'Fake investment or trading platforms',
      color: '#F97316'
    },
    {
      id: 'tech_support',
      icon: 'desktop',
      title: 'Tech Support',
      description: 'Fake Microsoft, Apple support calls',
      color: '#8B5CF6'
    },
    {
      id: 'lottery',
      icon: 'trophy',
      title: 'Lottery/Prize',
      description: 'Fake lottery wins or prize notifications',
      color: '#06B6D4'
    },
    {
      id: 'other',
      icon: 'help-circle',
      title: 'Other',
      description: 'Different type of scam not listed above',
      color: '#6B7280'
    }
  ];

  const handleSubmit = async () => {
    if (!selectedCategory) {
      toast.error('Please select a scam category');
      return;
    }

    if (!reportText.trim()) {
      toast.error('Please provide the scam content to report');
      return;
    }

    setIsSubmitting(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      // Simulate API call to submit report
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      toast.success('Report submitted successfully!');
      Alert.alert(
        'Report Submitted',
        'Thank you for helping keep others safe. Our team will review your report and take appropriate action.',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      toast.error('Failed to submit report. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getCategoryColor = () => {
    const category = scamCategories.find(cat => cat.id === selectedCategory);
    return category ? category.color : '#00D4FF';
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[{ opacity: fadeAnim, flex: 1 }]}>
        <ScrollView showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Pressable
              onPress={() => navigation.goBack()}
              style={styles.backButton}
            >
              <BlurView intensity={15} style={styles.backButtonBlur}>
                <Ionicons name="arrow-back" size={24} color="white" />
              </BlurView>
            </Pressable>
            
            <View style={styles.headerText}>
              <Text style={styles.title}>Report Scam</Text>
              <Text style={styles.subtitle}>Help protect others from fraud</Text>
            </View>
            
            <View style={styles.headerIcon}>
              <LinearGradient
                colors={['#EF4444', '#DC2626']}
                style={styles.headerIconGradient}
              >
                <Ionicons name="flag" size={24} color="white" />
              </LinearGradient>
            </View>
          </View>

          <GlassmorphicCard style={styles.infoCard}>
            <View style={styles.infoHeader}>
              <Ionicons name="shield-checkmark" size={24} color="#22C55E" />
              <Text style={styles.infoTitle}>Your Report Matters</Text>
            </View>
            <Text style={styles.infoText}>
              By reporting scams, you help us protect millions of users worldwide. 
              All reports are confidential and help improve our detection algorithms.
            </Text>
          </GlassmorphicCard>

          <GlassmorphicCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>What type of scam is this?</Text>
            <View style={styles.categoriesGrid}>
              {scamCategories.map(category => (
                <CategoryButton
                  key={category.id}
                  icon={category.icon}
                  title={category.title}
                  description={category.description}
                  isSelected={selectedCategory === category.id}
                  onPress={() => {
                    setSelectedCategory(category.id);
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                  }}
                  color={category.color}
                />
              ))}
            </View>
          </GlassmorphicCard>

          <GlassmorphicCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Scam Content</Text>
            <Text style={styles.sectionSubtitle}>
              Paste the suspicious message, email, or describe what happened
            </Text>
            <BlurView intensity={10} style={styles.textAreaBlur}>
              <TextInput
                style={styles.textArea}
                placeholder="Paste the scam content here..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={reportText}
                onChangeText={setReportText}
                multiline
                numberOfLines={8}
                textAlignVertical="top"
              />
            </BlurView>
          </GlassmorphicCard>

          <GlassmorphicCard style={styles.sectionCard}>
            <Text style={styles.sectionTitle}>Additional Information</Text>
            <Text style={styles.sectionSubtitle}>
              Any extra details that might help us investigate (optional)
            </Text>
            <BlurView intensity={10} style={styles.textAreaBlur}>
              <TextInput
                style={[styles.textArea, { minHeight: 100 }]}
                placeholder="Platform where you encountered this scam, how they contacted you, etc..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={additionalInfo}
                onChangeText={setAdditionalInfo}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </BlurView>
          </GlassmorphicCard>

          <View style={styles.submitContainer}>
            <Pressable
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[
                styles.submitButton,
                isSubmitting && styles.submitButtonDisabled
              ]}
            >
              <LinearGradient
                colors={
                  isSubmitting 
                    ? ['#666', '#444'] 
                    : ['#EF4444', '#DC2626']
                }
                style={styles.submitButtonGradient}
              >
                {isSubmitting ? (
                  <Ionicons name="hourglass" size={24} color="white" />
                ) : (
                  <Ionicons name="send" size={24} color="white" />
                )}
                <Text style={styles.submitButtonText}>
                  {isSubmitting ? 'Submitting...' : 'Submit Report'}
                </Text>
              </LinearGradient>
            </Pressable>
          </View>

          <GlassmorphicCard style={styles.bottomCard}>
            <View style={styles.bottomHeader}>
              <Ionicons name="lock-closed" size={20} color="#00D4FF" />
              <Text style={styles.bottomTitle}>Privacy Protected</Text>
            </View>
            <Text style={styles.bottomText}>
              Your personal information is never shared. Reports are processed 
              anonymously to maintain your privacy while helping others stay safe.
            </Text>
          </GlassmorphicCard>
        </ScrollView>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    overflow: 'hidden',
    marginRight: 15,
  },
  backButtonBlur: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.6)',
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  headerIconGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  infoCard: {
    marginBottom: 25,
  },
  infoHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 10,
  },
  infoText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
    marginBottom: 20,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  categoryButton: {
    width: '47%',
    borderRadius: 15,
    overflow: 'hidden',
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  categoryBlur: {
    padding: 15,
    alignItems: 'center',
  },
  categoryTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: 'rgba(255,255,255,0.8)',
    marginTop: 8,
    marginBottom: 4,
    textAlign: 'center',
  },
  categoryDescription: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    lineHeight: 14,
  },
  textAreaBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  textArea: {
    padding: 15,
    color: 'white',
    fontSize: 16,
    minHeight: 120,
  },
  submitContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  submitButton: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  submitButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  bottomCard: {
    marginBottom: 120,
  },
  bottomHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  bottomTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: 'white',
    marginLeft: 8,
  },
  bottomText: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
    lineHeight: 18,
  },
});