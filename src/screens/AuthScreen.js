import React, { useState } from 'react';
import { View, Text, TextInput, StyleSheet, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { C, FONT, RADIUS, SHADOW } from '../ui/theme';
import { Btn, Card, Icon, useToast } from '../ui/components';
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
          <View style={styles.logoCircle}>
            <Icon name="airplane" size={34} color={C.blue} />
          </View>
          <Text style={[FONT.h1, { marginTop: 16 }]}>Airlines Empire</Text>
          <Text style={[FONT.sub, { marginTop: 4 }]}>Build. Fly. Compete.</Text>
        </View>

        <Card style={[styles.card, SHADOW.pop]}>
          <View style={styles.tabRow}>
            <Btn title="Log In" kind={mode === 'login' ? 'blue' : 'ghost'} small onPress={() => setMode('login')} style={styles.tabBtn} />
            <Btn title="Sign Up" kind={mode === 'signup' ? 'blue' : 'ghost'} small onPress={() => setMode('signup')} style={styles.tabBtn} />
          </View>

          {mode === 'signup' && (
            <View style={styles.inputWrap}>
              <Icon name="account-outline" size={18} color={C.faint} style={styles.inputIcon} />
              <TextInput value={displayName} onChangeText={setDisplayName} placeholder="Your name (optional)"
                placeholderTextColor={C.faint} style={styles.input} />
            </View>
          )}
          <View style={styles.inputWrap}>
            <Icon name="email-outline" size={18} color={C.faint} style={styles.inputIcon} />
            <TextInput value={email} onChangeText={setEmail} placeholder="Email" autoCapitalize="none" keyboardType="email-address"
              placeholderTextColor={C.faint} style={styles.input} />
          </View>
          <View style={styles.inputWrap}>
            <Icon name="lock-outline" size={18} color={C.faint} style={styles.inputIcon} />
            <TextInput value={password} onChangeText={setPassword} placeholder="Password (min 8 characters)" secureTextEntry
              placeholderTextColor={C.faint} style={styles.input} />
          </View>

          <Btn title={busy ? 'Please wait…' : mode === 'login' ? 'Log In' : 'Create Airline Account'}
            kind="blue" disabled={busy} onPress={submit} style={{ marginTop: 8 }} />
        </Card>

        <Text style={styles.footNote}>
          {mode === 'login' ? 'New to Airlines Empire?' : 'Already have an account?'}{' '}
          <Text style={styles.footLink} onPress={() => setMode(mode === 'login' ? 'signup' : 'login')}>
            {mode === 'login' ? 'Create an account' : 'Log in'}
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 22 },
  brand: { alignItems: 'center', marginBottom: 28 },
  logoCircle: {
    width: 80, height: 80, borderRadius: 40, backgroundColor: C.blueSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  card: { padding: 20 },
  tabRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  tabBtn: { flex: 1 },
  inputWrap: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: C.bgSoft, borderRadius: RADIUS.md,
    borderWidth: 1, borderColor: C.border, paddingHorizontal: 12, marginBottom: 10,
  },
  inputIcon: { marginRight: 8 },
  input: { flex: 1, paddingVertical: 12, color: C.text, fontSize: 15 },
  footNote: { textAlign: 'center', marginTop: 20, color: C.sub, fontSize: 13 },
  footLink: { color: C.blue, fontWeight: '700' },
});
