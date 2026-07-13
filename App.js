import React, { useEffect } from 'react';
import { View, ActivityIndicator, StyleSheet, StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Icon, ToastProvider } from './src/ui/components';
import { C } from './src/ui/theme';
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
        <View style={styles.splashLogo}>
          <Icon name="airplane" size={40} color={C.blue} />
        </View>
        <ActivityIndicator color={C.blue} style={{ marginTop: 20 }} />
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
      <StatusBar barStyle="dark-content" backgroundColor={C.bg} />
      <ToastProvider>
        <SplashGate />
      </ToastProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  splash: { flex: 1, backgroundColor: C.bg, alignItems: 'center', justifyContent: 'center' },
  splashLogo: {
    width: 84, height: 84, borderRadius: 42, backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
});
