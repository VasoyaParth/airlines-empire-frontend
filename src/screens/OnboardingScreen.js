// The 5-step resumable wizard, mirroring the backend's onboarding_step
// exactly: profile -> country -> headquarters -> plan -> aircraft ->
// complete. Whatever step the server says the airline is on is where this
// screen starts — never restarts from scratch (see useSession.bootstrap /
// the step prop).
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, ScrollView, Pressable, StyleSheet } from 'react-native';
import { C, FONT, RADIUS } from '../ui/theme';
import { Card, Btn, Icon, Row, useToast, Pill } from '../ui/components';
import { useSession } from '../store/session';
import * as api from '../services/api';

const LOGO_KEYS = ['airplane', 'airplane-takeoff', 'airplane-landing', 'earth', 'shield-airplane', 'star-four-points'];
const COLOR_SWATCHES = ['#1E3A8A', '#0F172A', '#DC2626', '#059669', '#7C3AED', '#EA580C', '#0891B2', '#BE185D'];

function StepDots({ step }) {
  const steps = ['profile', 'country', 'headquarters', 'plan', 'aircraft'];
  const idx = steps.indexOf(step);
  return (
    <Row style={{ justifyContent: 'center', gap: 8, marginBottom: 18 }}>
      {steps.map((s, i) => (
        <View key={s} style={{
          width: i === idx ? 22 : 8, height: 8, borderRadius: 4,
          backgroundColor: i <= idx ? C.blue : C.border,
        }} />
      ))}
    </Row>
  );
}

function ProfileStep({ onDone }) {
  const [name, setName] = useState('');
  const [slogan, setSlogan] = useState('');
  const [primary, setPrimary] = useState(COLOR_SWATCHES[0]);
  const [secondary, setSecondary] = useState(COLOR_SWATCHES[3]);
  const [logoKey, setLogoKey] = useState(LOGO_KEYS[0]);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  const submit = async () => {
    if (name.trim().length < 2) { toast && toast('Give your airline a name (2+ characters)', 'error'); return; }
    setBusy(true);
    try {
      const airline = await api.saveProfile({ name: name.trim(), slogan: slogan.trim() || undefined, primaryColor: primary, secondaryColor: secondary, logoKey });
      onDone(airline);
    } catch (e) { toast && toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card style={styles.card}>
      <Text style={FONT.h2}>Name your airline</Text>
      <TextInput value={name} onChangeText={setName} placeholder="e.g. Monsoon Air" placeholderTextColor={C.faint} style={styles.input} />
      <TextInput value={slogan} onChangeText={setSlogan} placeholder="Slogan (optional)" placeholderTextColor={C.faint} style={styles.input} />

      <Text style={[FONT.sub, { marginTop: 10, marginBottom: 6 }]}>Primary color</Text>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {COLOR_SWATCHES.map(c => (
          <Pressable key={c} onPress={() => setPrimary(c)} style={[styles.swatch, { backgroundColor: c }, primary === c && styles.swatchActive]} />
        ))}
      </Row>
      <Text style={[FONT.sub, { marginTop: 14, marginBottom: 6 }]}>Secondary color</Text>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {COLOR_SWATCHES.map(c => (
          <Pressable key={c} onPress={() => setSecondary(c)} style={[styles.swatch, { backgroundColor: c }, secondary === c && styles.swatchActive]} />
        ))}
      </Row>

      <Text style={[FONT.sub, { marginTop: 14, marginBottom: 6 }]}>Logo (custom upload coming later)</Text>
      <Row style={{ gap: 8, flexWrap: 'wrap' }}>
        {LOGO_KEYS.map(k => (
          <Pressable key={k} onPress={() => setLogoKey(k)} style={[styles.logoChip, logoKey === k && styles.logoChipActive]}>
            <Icon name={k} size={20} color={logoKey === k ? C.blue : C.sub} />
          </Pressable>
        ))}
      </Row>

      <Btn title={busy ? 'Saving…' : 'Continue'} kind="blue" disabled={busy} onPress={submit} style={{ marginTop: 18 }} />
    </Card>
  );
}

function CountryStep({ onDone }) {
  const [countries, setCountries] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => { api.getCountries().then(setCountries).catch(() => {}); }, []);

  const submit = async () => {
    if (!selected) { toast && toast('Pick your home country', 'error'); return; }
    setBusy(true);
    try {
      const airline = await api.saveCountry(selected);
      onDone(airline);
    } catch (e) { toast && toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card style={styles.card}>
      <Text style={FONT.h2}>Choose your home country</Text>
      <Text style={[FONT.sub, { marginTop: 4, marginBottom: 12 }]}>Only India has full airport coverage right now — every other country will unlock more airports over time.</Text>
      <ScrollView style={{ maxHeight: 360 }}>
        {countries.map(c => (
          <Pressable key={c.code} onPress={() => setSelected(c.code)} style={[styles.row, selected === c.code && styles.rowActive]}>
            <View style={{ flex: 1 }}>
              <Text style={[FONT.body, { fontWeight: '700' }]}>{c.name}</Text>
              <Text style={FONT.tiny}>{c.airport_count} airport{c.airport_count === 1 ? '' : 's'} · {c.continent_name}</Text>
            </View>
            {c.unlocked_by_default ? <Pill text="Home base" color={C.green} bg={C.greenSoft} /> : null}
          </Pressable>
        ))}
      </ScrollView>
      <Btn title={busy ? 'Saving…' : 'Continue'} kind="blue" disabled={busy || !selected} onPress={submit} style={{ marginTop: 14 }} />
    </Card>
  );
}

function HeadquartersStep({ countryId, onDone }) {
  const [airports, setAirports] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => {
    // We only have countryId from the airline row, but the airports lookup
    // is keyed by country code — refetch countries once to map id -> code.
    api.getCountries().then(async (countries) => {
      const country = countries.find(c => c.id === countryId);
      if (!country) return;
      const list = await api.getCountryAirports(country.code);
      setAirports(list);
    }).catch(() => {});
  }, [countryId]);

  const submit = async () => {
    if (!selected) { toast && toast('Pick your headquarters airport', 'error'); return; }
    setBusy(true);
    try {
      const airline = await api.saveHeadquarters(selected);
      onDone(airline);
    } catch (e) { toast && toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card style={styles.card}>
      <Text style={FONT.h2}>Pick your headquarters airport</Text>
      <Text style={[FONT.sub, { marginTop: 4, marginBottom: 12 }]}>This becomes your airline's permanent home base.</Text>
      <ScrollView style={{ maxHeight: 360 }}>
        {airports.map(a => (
          <Pressable key={a.id} onPress={() => setSelected(a.id)} style={[styles.row, selected === a.id && styles.rowActive]}>
            <View style={{ flex: 1 }}>
              <Text style={[FONT.body, { fontWeight: '700' }]}>{a.city_name} — {a.iata_code}</Text>
              <Text style={FONT.tiny} numberOfLines={1}>{a.name}</Text>
            </View>
            {a.is_capital ? <Pill text="Capital" color={C.blue} bg={C.blueSoft} /> : null}
          </Pressable>
        ))}
        {airports.length === 0 && <Text style={[FONT.sub, { padding: 12 }]}>Loading airports…</Text>}
      </ScrollView>
      <Btn title={busy ? 'Saving…' : 'Continue'} kind="blue" disabled={busy || !selected} onPress={submit} style={{ marginTop: 14 }} />
    </Card>
  );
}

function PlanStep({ onDone }) {
  const [plans, setPlans] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => { api.getPlans().then(setPlans).catch(() => {}); }, []);

  const submit = async () => {
    if (!selected) { toast && toast('Pick a starter plan', 'error'); return; }
    setBusy(true);
    try {
      const airline = await api.savePlan(selected);
      onDone(airline);
    } catch (e) { toast && toast(e.message, 'error'); } finally { setBusy(false); }
  };

  const fmt = (n) => `₹${(Number(n) / 10000000).toFixed(2)} Cr`;

  return (
    <Card style={styles.card}>
      <Text style={FONT.h2}>Choose your starter plan</Text>
      <Text style={[FONT.sub, { marginTop: 4, marginBottom: 12 }]}>Every airline starts with a ₹50 Cr grant — your plan's cost comes out of that, the rest is your opening cash.</Text>
      {plans.map(p => (
        <Pressable key={p.code} onPress={() => setSelected(p.code)} style={[styles.planCard, selected === p.code && styles.planCardActive]}>
          <Row style={{ justifyContent: 'space-between' }}>
            <Text style={[FONT.body, { fontWeight: '800' }]}>{p.name}</Text>
            <Text style={[FONT.body, { color: C.amber, fontWeight: '800' }]}>−{fmt(p.cost)}</Text>
          </Row>
          <Text style={[FONT.tiny, { marginTop: 4 }]}>{p.description}</Text>
          <Row style={{ marginTop: 8, gap: 10 }}>
            <Text style={FONT.tiny}>Reputation {p.starting_reputation}</Text>
            <Text style={FONT.tiny}>Premium {p.starting_premium_currency}</Text>
            <Text style={[FONT.tiny, { color: C.green, fontWeight: '700' }]}>Cash left: {fmt(500000000 - p.cost)}</Text>
          </Row>
        </Pressable>
      ))}
      <Btn title={busy ? 'Launching…' : 'Launch Airline'} kind="blue" disabled={busy || !selected} onPress={submit} style={{ marginTop: 14 }} />
    </Card>
  );
}

function AircraftStep({ onDone }) {
  const [models, setModels] = useState([]);
  const [selected, setSelected] = useState(null);
  const [busy, setBusy] = useState(false);
  const toast = useToast();

  useEffect(() => { api.getStarterAircraftChoices().then(setModels).catch(() => {}); }, []);

  const submit = async () => {
    if (!selected) { toast && toast('Pick your first aircraft', 'error'); return; }
    setBusy(true);
    try {
      const airline = await api.saveStarterAircraft(selected);
      onDone(airline);
    } catch (e) { toast && toast(e.message, 'error'); } finally { setBusy(false); }
  };

  return (
    <Card style={styles.card}>
      <Text style={FONT.h2}>Pick your first aircraft</Text>
      <Text style={[FONT.sub, { marginTop: 4, marginBottom: 12 }]}>Free — already covered by your plan. It'll start in the hangar and be ready to fly shortly.</Text>
      {models.map(m => (
        <Pressable key={m.id} onPress={() => setSelected(m.id)} style={[styles.planCard, selected === m.id && styles.planCardActive]}>
          <Text style={[FONT.body, { fontWeight: '800' }]}>{m.manufacturer} {m.model}</Text>
          <Row style={{ marginTop: 6, gap: 10, flexWrap: 'wrap' }}>
            <Text style={FONT.tiny}>{m.passenger_capacity} seats</Text>
            <Text style={FONT.tiny}>Range {m.max_range_km.toLocaleString()} km</Text>
            <Text style={FONT.tiny}>{m.aircraft_type}</Text>
          </Row>
        </Pressable>
      ))}
      {models.length === 0 && <Text style={FONT.sub}>Loading choices…</Text>}
      <Btn title={busy ? 'Finishing…' : 'Complete Setup'} kind="blue" disabled={busy || !selected} onPress={submit} style={{ marginTop: 14 }} />
    </Card>
  );
}

export default function OnboardingScreen() {
  const airline = useSession(s => s.airline);
  const loadFullAirline = useSession(s => s.loadFullAirline);
  const step = airline?.onboarding_step || 'profile';

  const onDone = async (updatedAirline) => {
    if (updatedAirline.onboarding_step === 'complete') {
      await loadFullAirline();
    } else {
      useSession.setState({ airline: updatedAirline });
    }
  };

  return (
    <View style={styles.flex}>
      <ScrollView contentContainerStyle={{ padding: 20, paddingTop: 40 }}>
        <Text style={[FONT.h1, { textAlign: 'center', marginBottom: 4 }]}>Set Up Your Airline</Text>
        <StepDots step={step} />
        {step === 'profile' && <ProfileStep onDone={onDone} />}
        {step === 'country' && <CountryStep onDone={onDone} />}
        {step === 'headquarters' && <HeadquartersStep countryId={airline?.country_id} onDone={onDone} />}
        {step === 'plan' && <PlanStep onDone={onDone} />}
        {step === 'aircraft' && <AircraftStep onDone={onDone} />}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: C.bg },
  card: { padding: 18 },
  input: {
    backgroundColor: C.bgSoft, borderRadius: RADIUS.md, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 12, marginTop: 10, color: C.text, fontSize: 15,
  },
  swatch: { width: 34, height: 34, borderRadius: 17, borderWidth: 2, borderColor: 'transparent' },
  swatchActive: { borderColor: C.text },
  logoChip: {
    width: 44, height: 44, borderRadius: 12, backgroundColor: C.bgSoft, alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: 'transparent',
  },
  logoChipActive: { borderColor: C.blue, backgroundColor: C.blueSoft },
  row: {
    flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: RADIUS.md,
    backgroundColor: C.bgSoft, marginBottom: 6, borderWidth: 1, borderColor: C.border,
  },
  rowActive: { borderColor: C.blue, backgroundColor: C.blueSoft },
  planCard: {
    padding: 14, borderRadius: RADIUS.md, backgroundColor: C.bgSoft, marginBottom: 10,
    borderWidth: 1, borderColor: C.border,
  },
  planCardActive: { borderColor: C.green, backgroundColor: C.greenSoft },
});
