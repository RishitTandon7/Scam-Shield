import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  Pressable,
  FlatList,
  Animated,
  Keyboard,
  Platform,
  KeyboardAvoidingView
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

const ChatMessage = ({ message, index }) => {
  const slideAnim = useRef(new Animated.Value(50)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        delay: index * 50,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 400,
        delay: index * 50,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const isUser = message.role === 'user';
  const isTyping = message.isTyping;

  return (
    <Animated.View style={[
      styles.messageContainer,
      isUser ? styles.userMessageContainer : styles.aiMessageContainer,
      { 
        opacity: fadeAnim,
        transform: [{ 
          translateX: slideAnim.interpolate({
            inputRange: [0, 50],
            outputRange: [0, isUser ? 50 : -50]
          })
        }]
      }
    ]}>
      {!isUser && (
        <View style={styles.aiAvatar}>
          <LinearGradient
            colors={['#00D4FF', '#FF00FF']}
            style={styles.avatarGradient}
          >
            <Ionicons name="shield-checkmark" size={16} color="white" />
          </LinearGradient>
        </View>
      )}
      
      <View style={[
        styles.messageBubble,
        isUser ? styles.userBubble : styles.aiBubble
      ]}>
        <BlurView intensity={isUser ? 25 : 20} style={styles.bubbleBlur}>
          {isUser ? (
            <LinearGradient
              colors={['rgba(0, 212, 255, 0.3)', 'rgba(0, 212, 255, 0.1)']}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
            />
          ) : (
            <LinearGradient
              colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
              style={[StyleSheet.absoluteFillObject, { borderRadius: 20 }]}
            />
          )}
          
          {isTyping ? (
            <View style={styles.typingIndicator}>
              <Text style={styles.messageText}>AI is thinking</Text>
              <View style={styles.typingDots}>
                <View style={[styles.dot, styles.dot1]} />
                <View style={[styles.dot, styles.dot2]} />
                <View style={[styles.dot, styles.dot3]} />
              </View>
            </View>
          ) : (
            <Text style={[
              styles.messageText,
              isUser ? styles.userMessageText : styles.aiMessageText
            ]}>
              {message.content}
            </Text>
          )}
        </BlurView>
      </View>

      {isUser && (
        <View style={styles.userAvatar}>
          <Ionicons name="person" size={16} color="#00D4FF" />
        </View>
      )}
    </Animated.View>
  );
};

const QuickPrompt = ({ text, onPress }) => {
  const scaleAnim = useRef(new Animated.Value(1)).current;

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
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
    <Animated.View style={[{ transform: [{ scale: scaleAnim }] }, styles.quickPromptContainer]}>
      <Pressable
        onPress={() => onPress(text)}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        style={styles.quickPrompt}
      >
        <BlurView intensity={15} style={styles.quickPromptBlur}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.05)']}
            style={[StyleSheet.absoluteFillObject, { borderRadius: 15 }]}
          />
          <Text style={styles.quickPromptText}>{text}</Text>
        </BlurView>
      </Pressable>
    </Animated.View>
  );
};

export default function AIAssistantScreen() {
  const [messages, setMessages] = useState([
    {
      id: '1',
      role: 'assistant',
      content: '👋 Hi! I\'m your AI security assistant. I can help you identify scams, verify suspicious content, and answer questions about online safety. What would you like to know?',
      timestamp: new Date().toISOString(),
    }
  ]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const flatListRef = useRef(null);
  const fadeAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 800,
      useNativeDriver: true,
    }).start();
  }, []);

  const quickPrompts = [
    "Is this job offer real?",
    "How to spot phishing emails?",
    "Is this website safe?",
    "Check this message for scams",
    "What are romance scam signs?",
    "Is this crypto offer legit?"
  ];

  const sendMessage = async (message) => {
    if (!message.trim() && !inputText.trim()) return;

    const userMessage = message || inputText;
    const newUserMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
    };

    const typingMessage = {
      id: (Date.now() + 1).toString(),
      role: 'assistant',
      content: '',
      isTyping: true,
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, newUserMessage, typingMessage]);
    setInputText('');
    setIsLoading(true);
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    // Scroll to bottom
    setTimeout(() => {
      flatListRef.current?.scrollToEnd({ animated: true });
    }, 100);

    try {
      const response = await fetch('https://api.a0.dev/ai/llm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            {
              role: 'system',
              content: 'You are ScamShield AI, a friendly and knowledgeable security assistant specializing in scam detection and online safety. Provide helpful, accurate advice about identifying scams, staying safe online, and verifying suspicious content. Keep responses conversational and informative. Use emojis appropriately to make responses engaging.'
            },
            ...messages.filter(m => !m.isTyping).map(m => ({
              role: m.role,
              content: m.content
            })),
            {
              role: 'user',
              content: userMessage
            }
          ]
        })
      });

      const data = await response.json();
      
      const aiMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: data.completion || 'I apologize, but I encountered an issue processing your request. Please try again.',
        timestamp: new Date().toISOString(),
      };

      // Remove typing indicator and add AI response
      setMessages(prev => [...prev.slice(0, -1), aiMessage]);

    } catch (error) {
      const errorMessage = {
        id: (Date.now() + 2).toString(),
        role: 'assistant',
        content: '❌ Sorry, I encountered an error. Please check your connection and try again.',
        timestamp: new Date().toISOString(),
      };

      setMessages(prev => [...prev.slice(0, -1), errorMessage]);
      toast.error('Failed to get AI response');
    } finally {
      setIsLoading(false);
      // Scroll to bottom after response
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  };

  const handleQuickPrompt = (prompt) => {
    sendMessage(prompt);
  };

  const renderMessage = ({ item, index }) => (
    <ChatMessage message={item} index={index} />
  );

  const renderQuickPrompts = () => (
    <View style={styles.quickPromptsContainer}>
      <Text style={styles.quickPromptsTitle}>Quick Questions</Text>
      <View style={styles.quickPromptsGrid}>
        {quickPrompts.map((prompt, index) => (
          <QuickPrompt 
            key={index} 
            text={prompt} 
            onPress={handleQuickPrompt}
          />
        ))}
      </View>
    </View>
  );

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Animated.View style={[styles.content, { opacity: fadeAnim }]}>
        <View style={styles.header}>
          <LinearGradient
            colors={['#00D4FF', '#FF00FF']}
            style={styles.headerIcon}
          >
            <Ionicons name="chatbubbles" size={24} color="white" />
          </LinearGradient>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>AI Assistant</Text>
            <Text style={styles.headerSubtitle}>Ask me about scams & online safety</Text>
          </View>
          <View style={styles.statusIndicator}>
            <View style={styles.onlineIndicator} />
            <Text style={styles.statusText}>Online</Text>
          </View>
        </View>

        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={(item) => item.id}
          style={styles.messagesList}
          contentContainerStyle={styles.messagesContent}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={messages.length <= 1 ? renderQuickPrompts : null}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
        />

        <GlassmorphicCard style={styles.inputContainer}>
          <View style={styles.inputRow}>
            <BlurView intensity={10} style={styles.textInputContainer}>
              <TextInput
                style={styles.textInput}
                placeholder="Ask me anything about scams..."
                placeholderTextColor="rgba(255,255,255,0.5)"
                value={inputText}
                onChangeText={setInputText}
                multiline
                maxLength={500}
              />
            </BlurView>
            
            <Pressable
              onPress={() => sendMessage()}
              disabled={!inputText.trim() || isLoading}
              style={[
                styles.sendButton,
                (!inputText.trim() || isLoading) && styles.sendButtonDisabled
              ]}
            >
              <LinearGradient
                colors={
                  !inputText.trim() || isLoading 
                    ? ['#666', '#444'] 
                    : ['#00D4FF', '#0099CC']
                }
                style={styles.sendButtonGradient}
              >
                <Ionicons 
                  name={isLoading ? "hourglass" : "send"} 
                  size={20} 
                  color="white" 
                />
              </LinearGradient>
            </Pressable>
          </View>
        </GlassmorphicCard>
      </Animated.View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.6)',
  },
  statusIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  onlineIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#22C55E',
    fontWeight: '600',
  },
  messagesList: {
    flex: 1,
  },
  messagesContent: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  quickPromptsContainer: {
    marginBottom: 30,
  },
  quickPromptsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 15,
  },
  quickPromptsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  quickPromptContainer: {
    marginBottom: 10,
  },
  quickPrompt: {
    borderRadius: 15,
    overflow: 'hidden',
  },
  quickPromptBlur: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  quickPromptText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  messageContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'flex-end',
  },
  userMessageContainer: {
    justifyContent: 'flex-end',
  },
  aiMessageContainer: {
    justifyContent: 'flex-start',
  },
  aiAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    marginRight: 10,
    overflow: 'hidden',
  },
  userAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0, 212, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  avatarGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageBubble: {
    maxWidth: '75%',
    borderRadius: 20,
    overflow: 'hidden',
  },
  userBubble: {},
  aiBubble: {},
  bubbleBlur: {
    padding: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  userMessageText: {
    color: 'rgba(255,255,255,0.9)',
  },
  aiMessageText: {
    color: 'rgba(255,255,255,0.8)',
  },
  typingIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  typingDots: {
    flexDirection: 'row',
    marginLeft: 8,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.5)',
    marginHorizontal: 2,
  },
  dot1: {
    animationDelay: '0s',
  },
  dot2: {
    animationDelay: '0.2s',
  },
  dot3: {
    animationDelay: '0.4s',
  },
  glassCard: {
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  inputContainer: {
    margin: 20,
    padding: 15,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
  },
  textInputContainer: {
    flex: 1,
    borderRadius: 15,
    marginRight: 15,
    overflow: 'hidden',
  },
  textInput: {
    padding: 15,
    color: 'white',
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    overflow: 'hidden',
  },
  sendButtonDisabled: {
    opacity: 0.5,
  },
  sendButtonGradient: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});