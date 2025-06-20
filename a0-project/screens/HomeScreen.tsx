import React, { useState, useRef } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  Pressable, 
  ScrollView, 
  Animated,
  Alert,
  Dimensions,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { toast } from 'sonner-native';
import * as Haptics from 'expo-haptics';

const { width, height } = Dimensions.get('window');

const GlassmorphicCard = ({ children, style = {} }) => {
  return (
    <BlurView intensity={20} style={[styles.glassCard, style]}>
      <LinearGradient
        colors={['rgba(255,255,255,0.15)', 'rgba(255,255,255,0.08)']}
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

export default function HomeScreen() {
  const [inputText, setInputText] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const navigation = useNavigation();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(1)).current;

  React.useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 1000,
      useNativeDriver: true,
    }).start();
  }, []);

  const scanContent = async (content, scanType = 'text') => {
    if (!content.trim()) {
      toast.error('Please enter content to scan');
      return;
    }

    console.log('Starting scan:', { content: content.substring(0, 50), scanType });
    setIsScanning(true);
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

    try {
      const apiKey = 'AIzaSyCH4e3uW1SuQXUY7DaNAzrURAo88XMutzo';
      const prompt = `Analyze this ${scanType} content for scam detection:
      
"${content}"

Return a JSON response with:
{
  "status": "real|fake|possibly_fake|unverified",
  "confidence": 0-100,
  "type": "phishing|financial_fraud|fake_news|job_scam|crypto_scam|lottery_scam|romance_scam|tech_support|other",
  "explanation": "Clear explanation of why this is/isn't a scam",
  "safetyTip": "Practical safety advice",
  "riskLevel": "critical|high|medium|low"
}`;

      console.log('Making API call to Gemini...');
      
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.1,
            topK: 1,
            topP: 1,
            maxOutputTokens: 1000,
          }
        })
      });

      console.log('Response status:', response.status);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`);
      }

      const data = await response.json();
      console.log('API Response:', data);

      let result;
      try {
        const aiText = data.candidates?.[0]?.content?.parts?.[0]?.text;
        console.log('AI Text:', aiText);
        
        if (!aiText) {
          throw new Error('No response from AI');
        }

        // Extract JSON from the response
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          result = JSON.parse(jsonMatch[0]);
          console.log('Parsed result:', result);
        } else {
          throw new Error('No JSON found');
        }
      } catch (parseError) {
        console.log('Parse error:', parseError);
        // Fallback if AI doesn't return proper JSON
        result = {
          status: 'unverified',
          confidence: 50,
          type: 'other',
          explanation: 'Content analyzed but requires manual verification.',
          safetyTip: 'Always verify suspicious content through official sources.',
          riskLevel: 'medium'
        };
      }

      console.log('Final result:', result);
      console.log('Navigating to ScanResult...');

      // Navigate to result screen
      navigation.navigate('ScanResult', {
        content: content,
        result: result,
        timestamp: new Date().toISOString(),
        scanType: scanType
      });

      toast.success('Scan completed!');

    } catch (error) {
      console.error('Scan error:', error);
      toast.error(`Scan failed: ${error.message}`);
      
      // Navigate with error result
      navigation.navigate('ScanResult', {
        content: content,
        result: {
          status: 'unverified',
          confidence: 0,
          type: 'other',
          explanation: 'Unable to complete scan due to technical issue.',
          safetyTip: 'Please try again or verify manually.',
          riskLevel: 'medium'
        },
        timestamp: new Date().toISOString(),
        scanType: scanType,
        error: error.message
      });
    } finally {
      setIsScanning(false);
    }
  };

  const features = [
    { 
      id: 'textScanner', 
      icon: 'document-text', 
      title: 'Text Scanner', 
      description: 'Paste any message or link for analysis',
      color: '#00D4FF',
      action: () => {
        console.log('Text Scanner clicked, inputText:', inputText);
        if (inputText.trim()) {
          scanContent(inputText, 'text');
        } else {
          toast.info('Enter text above to scan');
        }
      }
    },
    { 
      id: 'whatsappForward', 
      icon: 'logo-whatsapp', 
      title: 'WhatsApp Forward Scanner', 
      description: 'Check forwarded messages for authenticity',
      color: '#25D366',
      action: () => {
        console.log('WhatsApp Scanner clicked');
        const sampleWhatsApp = "🎉 CONGRATULATIONS! You've been selected for a lottery prize of ₹50,00,000! Click here to claim your reward within 24 hours. Limited time offer!";
        scanContent(sampleWhatsApp, 'WhatsApp forward');
      }
    },
    { 
      id: 'imageScanner', 
      icon: 'image', 
      title: 'Image Scam Detector', 
      description: 'Scan suspicious images for fake content',
      color: '#9B59B6',
      action: () => {
        console.log('Image Scanner clicked');
        const sampleImage = "Image shows: 'Earn ₹5000 daily from home! No investment required. Join our WhatsApp group for instant money making opportunities. 100% genuine work.'";
        scanContent(sampleImage, 'image-based scam');
      }
    },
    { 
      id: 'jobVerifier', 
      icon: 'briefcase', 
      title: 'Job Scam Verifier', 
      description: 'Verify job offers and work-from-home schemes',
      color: '#F39C12',
      action: () => {
        console.log('Job Verifier clicked');
        const sampleJob = "URGENT HIRING! Work from home data entry job. Earn ₹25,000/month. No experience needed. Pay registration fee of ₹2,000 to confirm your position. Contact immediately!";
        scanContent(sampleJob, 'job offer');
      }
    },
    { 
      id: 'cryptoScanner', 
      icon: 'logo-bitcoin', 
      title: 'Crypto Scam Checker', 
      description: 'Check crypto investments and trading offers',
      color: '#FF6B35',
      action: () => {
        console.log('Crypto Scanner clicked');
        const sampleCrypto = "🚀 NEW CRYPTO OPPORTUNITY! Invest in BitCoin2.0 now! Guaranteed 500% returns in 30 days. Early bird bonus: Invest ₹10,000 get ₹50,000 back! Limited slots available.";
        scanContent(sampleCrypto, 'cryptocurrency investment');
      }
    },
    { 
      id: 'loanScanner', 
      icon: 'card', 
      title: 'Loan Scam Detector', 
      description: 'Verify loan offers and financial schemes',
      color: '#1ABC9C',
      action: () => {
        console.log('Loan Scanner clicked');
        const sampleLoan = "Instant loan approval! Get ₹5 lakh loan in 2 hours. No documents required. Only pay ₹5,000 processing fee first. 100% approval guaranteed regardless of credit score.";
        scanContent(sampleLoan, 'loan offer');
      }
    },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scrollContent}>
      {/* Header with Logo */}
      <Animated.View style={[styles.header, { opacity: fadeAnim }]}>
        <LinearGradient
          colors={['#00D4FF', '#FF00FF']}
          style={styles.logoGradient}
        >
          <Ionicons name="shield-checkmark" size={40} color="white" />
        </LinearGradient>
        <Text style={styles.title}>ScamShield</Text>
        <Text style={styles.subtitle}>AI-Powered Protection Against Scams</Text>
      </Animated.View>

      {/* Main Scanner */}
      <Animated.View style={[{ opacity: fadeAnim }]}>
        <GlassmorphicCard style={styles.scanCard}>
          <View style={styles.scanHeader}>
            <Ionicons name="scan" size={24} color="#00D4FF" />
            <Text style={styles.cardTitle}>Quick Scan</Text>
          </View>
          <Text style={styles.cardSubtitle}>Paste any suspicious content below to analyze</Text>
          
          <View style={styles.inputContainer}>
            <BlurView intensity={15} style={styles.inputBlur}>
              <TextInput
                style={styles.textInput}
                placeholder="Paste message, link, or forwarded content here..."
                placeholderTextColor="rgba(255,255,255,0.6)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                numberOfLines={4}
                textAlignVertical="top"
              />
            </BlurView>
          </View>

          <AnimatedButton
            onPress={() => scanContent()}
            style={styles.scanButton}
            glowColor="#00D4FF"
          >
            <LinearGradient
              colors={isScanning ? ['#666', '#444'] : ['#00D4FF', '#0099CC']}
              style={styles.scanButtonGradient}
            >
              {isScanning ? (
                <Ionicons name="sync" size={24} color="white" />
              ) : (
                <Ionicons name="scan" size={24} color="white" />
              )}
              <Text style={styles.scanButtonText}>
                {isScanning ? 'Scanning...' : 'Scan Now'}
              </Text>
            </LinearGradient>
          </AnimatedButton>
        </GlassmorphicCard>

        {/* Features List */}
        <GlassmorphicCard style={styles.featuresCard}>
          <View style={styles.featuresHeader}>
            <Ionicons name="apps" size={24} color="#00D4FF" />
            <Text style={styles.cardTitle}>Specialized Scanners</Text>
          </View>
          <Text style={styles.cardSubtitle}>Choose a specific type of scam detection</Text>
          
          <View style={styles.featuresList}>
            {features.map((feature, index) => (
              <AnimatedButton
                key={feature.id}
                onPress={feature.action}
                style={styles.featureItem}
                glowColor={feature.color}
              >
                <BlurView intensity={15} style={styles.featureBlur}>
                  <LinearGradient
                    colors={[`${feature.color}25`, `${feature.color}15`]}
                    style={styles.featureGradient}
                  >
                    <View style={[styles.featureIcon, { backgroundColor: `${feature.color}20` }]}>
                      <Ionicons name={feature.icon} size={28} color={feature.color} />
                    </View>
                    <View style={styles.featureContent}>
                      <Text style={styles.featureTitle}>{feature.title}</Text>
                      <Text style={styles.featureDescription}>{feature.description}</Text>
                    </View>
                    <Ionicons name="chevron-forward" size={20} color="rgba(255,255,255,0.7)" />
                  </LinearGradient>
                </BlurView>
              </AnimatedButton>
            ))}
          </View>
        </GlassmorphicCard>

        {/* Status Tags Legend */}
        <GlassmorphicCard style={styles.statusCard}>
          <View style={styles.statusHeader}>
            <Ionicons name="flag" size={24} color="#00D4FF" />
            <Text style={styles.cardTitle}>Status Guide</Text>
          </View>
          <Text style={styles.cardSubtitle}>Understanding your scan results</Text>
          
          <View style={styles.statusList}>
            <View style={styles.statusItem}>
              <Text style={[styles.statusTag, { backgroundColor: '#4CAF50' }]}>✅ Real</Text>
              <Text style={styles.statusDescription}>Content appears legitimate and safe</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusTag, { backgroundColor: '#F44336' }]}>❌ Fake</Text>
              <Text style={styles.statusDescription}>Confirmed scam - avoid completely!</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusTag, { backgroundColor: '#FF9800' }]}>⚠️ Possibly Fake</Text>
              <Text style={styles.statusDescription}>Suspicious content - proceed with caution</Text>
            </View>
            <View style={styles.statusItem}>
              <Text style={[styles.statusTag, { backgroundColor: '#9E9E9E' }]}>🤔 Unverified</Text>
              <Text style={styles.statusDescription}>Requires manual verification</Text>
            </View>
          </View>
        </GlassmorphicCard>
      </Animated.View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingHorizontal: 20,
    paddingBottom: 120,
  },
  header: {
    alignItems: 'center',
    marginBottom: 30,
  },
  logoGradient: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 10,
  },
  title: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
    textAlign: 'center',
    textShadowColor: '#00D4FF',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#C0C0C0',
    textAlign: 'center',
  },
  glassCard: {
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
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
  scanCard: {
    marginBottom: 20,
  },
  scanHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginLeft: 10,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#B0B0B0',
    marginBottom: 20,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputBlur: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  textInput: {
    padding: 15,
    color: '#FFFFFF',
    fontSize: 16,
    minHeight: 100,
  },
  scanButton: {
    borderRadius: 15,
    overflow: 'hidden',
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
  scanButtonGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
    borderRadius: 15,
  },
  scanButtonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  featuresCard: {
    marginBottom: 20,
  },
  featuresHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  featuresList: {
    gap: 12,
  },
  featureItem: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  featureBlur: {
    borderRadius: 15,
  },
  featureGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 15,
  },
  featureIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  featureContent: {
    flex: 1,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  featureDescription: {
    fontSize: 14,
    color: '#B0B0B0',
  },
  statusCard: {
    marginBottom: 20,
  },
  statusHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusList: {
    gap: 12,
  },
  statusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  statusTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    fontSize: 14,
    fontWeight: '600',
    color: 'white',
    minWidth: 120,
    textAlign: 'center',
  },
  statusDescription: {
    fontSize: 14,
    color: '#C0C0C0',
    flex: 1,
    marginLeft: 15,
  },
});