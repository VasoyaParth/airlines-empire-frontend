import React, { useEffect } from 'react';
import { View, Text, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ToastProvider } from './src/ui/components';
import { useSession } from './src/store/session';
import AuthScreen from './src/screens/AuthScreen';
import OnboardingScreen from './src/screens/OnboardingScreen';
import HomeScreen from './src/screens/HomeScreen';

function SplashGate() {
  const bootstrapped = useSession(s => s.bootstrapped);
  const isAuthenticated = useSession(s => s.isAuthenticated);
  const airline = useSession(s => s.airline);
  const bootstrap = useSession(s => s.bootstrap);

  useEffect(() => { bootstrap(); }, [bootstrap]);

  if (!bootstrapped) {
    return (
      <View style={styles.splash}>
        <Text style={styles.splashEmoji}>✈️</Text>
        <ActivityIndicator color="#38BDF8" style={{ marginTop: 16 }} />
      </View>
    );
  }
  if (!isAuthenticated) return <AuthScreen />;
  if (airline?.onboarding_step !== 'complete') return <OnboardingScreen />;
  return <HomeScreen />;
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor="#0B1220" />
      <ToastProvider>
        <SplashGate />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: '#0B1220', alignItems: 'center', justifyContent: 'center' },
  splashEmoji: { fontSize: 48 },
});
