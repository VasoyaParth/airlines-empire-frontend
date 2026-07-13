import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { C, FONT, RADIUS } from '../ui/theme';
import { Btn, Card, useToast } from '../ui/components';
import { useSession } from '../store/session';
import { ApiError } from '../services/api';

export default function AuthScreen() {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [busy, setBusy] = useState(false);
  const toast = useToast();
  const login = useSession(s => s.login);
  const signup = useSession(s => s.signup);

  const submit = async () => {
    if (!email.trim() || password.length < 8) {
      toast && toast('Enter a valid email and an 8+ character password', 'error');
      return;
    }
    setBusy(true);
    try {
      if (mode === 'login') await login({ email: email.trim(), password });
      else await signup({ email: email.trim(), password, displayName: displayName.trim() || undefined });
    } catch (e) {
      toast && toast(e instanceof ApiError ? e.message : 'Something went wrong', 'error');
    } finally {
      setBusy(false);
    }
  };

  return (
    <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.brand}>
          <View style={styles.logoCircle}><Text style={styles.logoEmoji}>✈️</Text></View>
          <Text style={[FONT.h1, { color: '#F8FAFC', marginTop: 14 }]}>Airlines Empire</Text>
          <Text style={[FONT.sub, { color: '#94A3B8', marginTop: 4 }]}>Build. Fly. Compete.</Text>
        </View>

        <Card style={styles.card}>
          <View style={styles.tabRow}>
            <Btn title="Log In" kind={mode === 'login' ? 'blue' : 'ghost'} small onPress={() => setMode('login')} style={styles.tabBtn} />
            <Btn title="Sign Up" kind={mode === 'signup' ? 'blue' : 'ghost'} small onPress={() => setMode('signup')} style={styles.tabBtn} />
          </View>

          {mode === 'signup' && (
            <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your name (optional)"
              placeholderTextColor={C.faint} style={styles.input} />
          )}
          <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
            placeholderTextColor={C.faint} style={styles.input} />
          <TextInput value={password} onChangeText={setPassword} placeholder="Password (min 8 characters)" secureTextEntry
            placeholderTextColor={C.faint} style={styles.input} />

          <Btn title={busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Airline Account'}
            kind="green" disabled={busy} onPress={submit} style={{ marginTop: 6 }} />
        </Card>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0B1220' },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logoCircle: { width: 72, height: 72, borderRadius: 36, backgroundColor: '#1E293B', alignItems: 'center', justifyContent: 'center' },
  logoEmoji: { fontSize: 32 },
  card: { padding: 18 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 14 },
  tabBtn: { flex: 1 },
  input: {
    backgroundColor: C.bgSoft, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, marginBottom: 10, color: C.text, fontSize: 15,
  },
});
