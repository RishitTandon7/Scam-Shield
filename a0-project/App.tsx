import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from "react-native-safe-area-context"
import { Toaster } from 'sonner-native';
import { Ionicons } from '@expo/vector-icons';
import LockScreen from "./screens/LockScreen"
import HomeScreen from "./screens/HomeScreen"
import HistoryScreen from "./screens/HistoryScreen"
import AIAssistantScreen from "./screens/AIAssistantScreen"
import TrendingScamsScreen from "./screens/TrendingScamsScreen"
import SettingsScreen from "./screens/SettingsScreen"
import ScanResultScreen from "./screens/ScanResultScreen"
import ReportScamScreen from "./screens/ReportScamScreen"
import { LinearGradient } from 'expo-linear-gradient';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          
          if (route.name === 'Scanner') {
            iconName = focused ? 'shield-checkmark' : 'shield-checkmark-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'AI Chat') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Trending') {
            iconName = focused ? 'trending-up' : 'trending-up-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          }
          
          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#00D4FF',
        tabBarInactiveTintColor: 'rgba(255,255,255,0.6)',
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: 'rgba(0,0,0,0.2)',
          borderTopWidth: 0,
          elevation: 0,
          height: 90,
          paddingBottom: 20,
          paddingTop: 10,
        },
        tabBarBackground: () => (
          <LinearGradient
            colors={['rgba(0,212,255,0.1)', 'rgba(255,0,255,0.1)']}
            style={{ flex: 1, borderRadius: 20 }}
          />
        ),
      })}
    >
      <Tab.Screen name="Scanner" component={HomeScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="AI Chat" component={AIAssistantScreen} />
      <Tab.Screen name="Trending" component={TrendingScamsScreen} />
      <Tab.Screen name="Settings" component={SettingsScreen} />
    </Tab.Navigator>
  );
}

function RootStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Lock" component={LockScreen} />
      <Stack.Screen name="Main" component={TabNavigator} />
      <Stack.Screen name="ScanResult" component={ScanResultScreen} />
      <Stack.Screen name="ReportScam" component={ReportScamScreen} />
    </Stack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <LinearGradient
        colors={['#0F0F23', '#1A1A3E', '#2D2D5F']}
        style={StyleSheet.absoluteFillObject}
      />
      <Toaster />
      <NavigationContainer>
        <RootStack />
      </NavigationContainer>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    userSelect: "none"
  }
});