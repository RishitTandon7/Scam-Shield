import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Switch,
  Animated,
  Alert,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
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

const SettingItem = ({ icon, title, subtitle, value, onPress, type = 'arrow', color = '#00D4FF' }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    if (type === 'arrow') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      Animated.spring(scaleAnim, {
        toValue: 0.98,
        useNativeDriver: true,
      }).start();
    }
  };

  const handlePressOut = () => {
    if (type === 'arrow') {
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
      }).start();
    }
  };

  return (
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }]}>
      <Pressable
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.settingItem}
        disabled={type === 'switch'}
      >
        <View style={styles.settingLeft}>
          <View style={[styles.settingIcon, { backgroundColor: `${color}20` }]}>
            <Ionicons name={icon} size={20} color={color} />
          </View>
          <View style={styles.settingText}>
            <Text style={styles.settingTitle}>{title}</Text>
            {subtitle && <Text style={styles.settingSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        <View style={styles.settingRight}>
          {type === 'switch' ? (
            <Switch
              value={value}
              onValueChange={onPress}
              trackColor={{ false: 'rgba(255,255,255,0.2)', true: `${color}40` }}
              thumbColor={value ? color : 'rgba(255,255,255,0.8)'}
            />
          ) : type === 'value' ? (
            <Text style={styles.settingValue}>{value}</Text>
          ) : (
            <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.5)" />
          )}
        </View>
      </Pressable>
    </Animated.View>
  );
};

export default function SettingsScreen() {
  const [settings, setSettings] = useState({
    darkMode: true,
    notifications: true,
    scamAlerts: true,
    biometric: false,
    analytics: true,
    autoScan: false,
    language: 'English',
    fontSize: 'Medium',
  });

  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    
    if (key === 'notifications' && value) {
      toast.success('Notifications enabled');
    } else if (key === 'scamAlerts' && value) {
      toast.success('Scam alerts enabled');
    }
  };

  const showLanguageSelector = () => {
    const languages = ['English', 'Hindi', 'Tamil', 'Telugu', 'Bengali', 'Marathi', 'Gujarati'];
    Alert.alert(
      'Select Language',
      'Choose your preferred language',
      languages.map(lang => ({
        text: lang,
        onPress: () => handleSettingChange('language', lang)
      }))
    );
  };

  const showFontSizeSelector = () => {
    const sizes = ['Small', 'Medium', 'Large', 'Extra Large'];
    Alert.alert(
      'Font Size',
      'Choose your preferred text size',
      sizes.map(size => ({
        text: size,
        onPress: () => handleSettingChange('fontSize', size)
      }))
    );
  };

  const handleExportData = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    toast.success('Data export started - check your downloads');
  };

  const handleClearHistory = () => {
    Alert.alert(
      'Clear History',
      'Are you sure you want to clear all scan history? This action cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Clear',
          style: 'destructive',
          onPress: () => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            toast.success('History cleared');
          }
        }
      ]
    );
  };

  const handleRateApp = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.info('Redirecting to app store...');
  };

  const handleContactSupport = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    toast.info('Opening support chat...');
  };

  return (
    <Animated.View style={[styles.container, { opacity: fadeAnim }]}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#00D4FF', '#FF00FF']}
            style={styles.headerIcon}
          >
            <Ionicons name="settings" size={24} color="white" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.title}>Settings</Text>
            <Text style={styles.subtitle}>Customize your ScamShield experience</Text>
          </View>
        </View>

        {/* Protection Settings */}
        <GlassmorphicCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Protection</Text>
          <SettingItem
            icon="shield-checkmark"
            title="Scam Alerts"
            subtitle="Get notified about new threats"
            value={settings.scamAlerts}
            onPress={(value) => handleSettingChange('scamAlerts', value)}
            type="switch"
            color="#22C55E"
          />
          <SettingItem
            icon="scan"
            title="Auto-Scan"
            subtitle="Automatically scan clipboard content"
            value={settings.autoScan}
            onPress={(value) => handleSettingChange('autoScan', value)}
            type="switch"
            color="#F59E0B"
          />
          <SettingItem
            icon="analytics"
            title="Anonymous Analytics"
            subtitle="Help improve scam detection"
            value={settings.analytics}
            onPress={(value) => handleSettingChange('analytics', value)}
            type="switch"
            color="#8B5CF6"
          />
        </GlassmorphicCard>

        {/* Privacy & Security */}
        <GlassmorphicCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Privacy & Security</Text>
          <SettingItem
            icon="notifications"
            title="Push Notifications"
            subtitle="Receive important security updates"
            value={settings.notifications}
            onPress={(value) => handleSettingChange('notifications', value)}
            type="switch"
            color="#00D4FF"
          />
          <SettingItem
            icon="finger-print"
            title="Biometric Lock"
            subtitle="Protect app with fingerprint/face"
            value={settings.biometric}
            onPress={(value) => handleSettingChange('biometric', value)}
            type="switch"
            color="#EF4444"
          />
          <SettingItem
            icon="download"
            title="Export Data"
            subtitle="Download your scan history"
            onPress={handleExportData}
            color="#10B981"
          />
          <SettingItem
            icon="trash"
            title="Clear History"
            subtitle="Remove all saved scans"
            onPress={handleClearHistory}
            color="#EF4444"
          />
        </GlassmorphicCard>

        {/* Appearance */}
        <GlassmorphicCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Appearance</Text>
          <SettingItem
            icon="moon"
            title="Dark Mode"
            subtitle="Always enabled for better security"
            value={settings.darkMode}
            onPress={(value) => handleSettingChange('darkMode', value)}
            type="switch"
            color="#6366F1"
          />
          <SettingItem
            icon="text"
            title="Font Size"
            subtitle="Adjust text readability"
            value={settings.fontSize}
            onPress={showFontSizeSelector}
            type="value"
            color="#F59E0B"
          />
        </GlassmorphicCard>

        {/* Language & Region */}
        <GlassmorphicCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Language & Region</Text>
          <SettingItem
            icon="language"
            title="Language"
            subtitle="Select your preferred language"
            value={settings.language}
            onPress={showLanguageSelector}
            type="value"
            color="#10B981"
          />
        </GlassmorphicCard>

        {/* Support */}
        <GlassmorphicCard style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Support</Text>
          <SettingItem
            icon="help-circle"
            title="Help & FAQ"
            subtitle="Get answers to common questions"
            onPress={handleContactSupport}
            color="#00D4FF"
          />
          <SettingItem
            icon="chatbubbles"
            title="Contact Support"
            subtitle="Chat with our security experts"
            onPress={handleContactSupport}
            color="#8B5CF6"
          />
          <SettingItem
            icon="star"
            title="Rate ScamShield"
            subtitle="Help us improve with your feedback"
            onPress={handleRateApp}
            color="#F59E0B"
          />
        </GlassmorphicCard>

        {/* About */}
        <GlassmorphicCard style={styles.aboutCard}>
          <View style={styles.aboutHeader}>
            <LinearGradient
              colors={['#00D4FF', '#FF00FF']}
              style={styles.aboutLogo}
            >
              <Ionicons name="shield-checkmark" size={24} color="white" />
            </LinearGradient>
            <View>
              <Text style={styles.aboutTitle}>ScamShield</Text>
              <Text style={styles.aboutVersion}>Version 1.0.0</Text>
            </View>
          </View>
          <Text style={styles.aboutText}>
            Protecting millions of users worldwide from online scams and fraud with 
            advanced AI technology and real-time threat intelligence.
          </Text>
          <View style={styles.aboutStats}>
            <View style={styles.aboutStat}>
              <Text style={styles.aboutStatNumber}>2.4M+</Text>
              <Text style={styles.aboutStatLabel}>Scams Blocked</Text>
            </View>
            <View style={styles.aboutStat}>
              <Text style={styles.aboutStatNumber}>99.7%</Text>
              <Text style={styles.aboutStatLabel}>Accuracy</Text>
            </View>
            <View style={styles.aboutStat}>
              <Text style={styles.aboutStatNumber}>150+</Text>
              <Text style={styles.aboutStatLabel}>Countries</Text>
            </View>
          </View>
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
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  headerIcon: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
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
    marginHorizontal: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  sectionCard: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.6)',
  },
  settingRight: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  settingValue: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    marginRight: 5,
  },
  aboutCard: {
    marginBottom: 120,
  },
  aboutHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  aboutLogo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  aboutTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  aboutVersion: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  aboutText: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.7)',
    lineHeight: 20,
    marginBottom: 20,
  },
  aboutStats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  aboutStat: {
    alignItems: 'center',
  },
  aboutStatNumber: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00D4FF',
    marginBottom: 4,
  },
  aboutStatLabel: {
    fontSize: 11,
    color: 'rgba(255,255,255,0.6)',
    textAlign: 'center',
  },
});