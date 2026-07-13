// Home screen: full (non-abbreviated) cash header + pill-shaped profile
// capsule + full-screen HQ map + bottom pill nav — same visual shape as the
// Truck Manager sibling app's GameScreen. Tabs are mockups only for now
// (Phase 2); each becomes real once its backend feature exists (Fleet in
// Phase 3, Routes in Phase 4, etc — see context/03_ROADMAP.md).
import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, SafeAreaView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { C, FONT } from '../ui/theme';
import { Row, Pill } from '../ui/components';
import { inr } from '../engine/economy';
import { useSession } from '../store/session';
import HQMap from '../ui/HQMap';
import FleetScreen from './FleetScreen';

const TABS = [
  { id: 'fleet', icon: 'airplane', label: 'Fleet' },
  { id: 'routes', icon: 'map-marker-path', label: 'Routes' },
  { id: 'economy', icon: 'chart-areaspline', label: 'Economy' },
  { id: 'staff', icon: 'account-group', label: 'Staff' },
  { id: 'rewards', icon: 'gift-outline', label: 'Rewards' },
];

function MockTabPanel({ tab }) {
  return (
    <View style={styles.mockPanel}>
      <Icon name="hammer-wrench" size={36} color="#475569" />
      <Text style={[FONT.h3, { color: '#94A3B8', marginTop: 10 }]}>{tab.label} — coming in a later phase</Text>
      <Text style={[FONT.tiny, { color: '#64748B', marginTop: 4, textAlign: 'center', paddingHorizontal: 30 }]}>
        This tab is a placeholder. See context/03_ROADMAP.md for when it goes live.
      </Text>
    </View>
  );
}

export default function HomeScreen() {
  const airline = useSession(s => s.airline);
  const logout = useSession(s => s.logout);
  const [tab, setTab] = useState(null);

  const activeTab = TABS.find(t => t.id === tab);

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.mapWrap}>
        <HQMap
          lat={airline?.hq_lat} lng={airline?.hq_lng}
          name={airline?.hq_airport_name} iata={airline?.hq_iata}
          style={styles.map}
        />
        {/* Header — full cash amount, never abbreviated */}
        <View style={styles.headerPill}>
          <View style={{ flex: 1 }}>
            <Text style={[FONT.h2, { color: '#F8FAFC' }]}>{inr(Number(airline?.cash_balance || 0))}</Text>
            <Row style={{ marginTop: 2 }}>
              <Icon name="star-four-points" size={11} color={C.gold} />
              <Text style={[FONT.tiny, { color: '#94A3B8', marginLeft: 4 }]}>Reputation {airline?.reputation ?? 50}</Text>
              <Text style={[FONT.tiny, { color: '#475569', marginHorizontal: 5 }]}>·</Text>
              <Text style={[FONT.tiny, { color: '#94A3B8' }]}>{airline?.premium_currency ?? 0} Premium</Text>
            </Row>
          </View>
          <Pressable onPress={logout} hitSlop={8}>
            <Icon name="cog-outline" size={20} color="#94A3B8" />
          </Pressable>
        </View>

        {/* Pill-shaped profile capsule */}
        <View style={styles.profileCap}>
          <View style={[styles.logoCircle, { backgroundColor: airline?.primary_color || '#1E293B' }]}>
            <Icon name="airplane" size={16} color="#fff" />
          </View>
          <View style={{ marginLeft: 8, flexShrink: 1 }}>
            <Text style={[FONT.tiny, { color: '#F8FAFC', fontWeight: '800' }]} numberOfLines={1}>{airline?.name}</Text>
            <Text style={[FONT.tiny, { color: '#94A3B8' }]} numberOfLines={1}>{airline?.hq_iata} · {airline?.hq_city_name}</Text>
          </View>
        </View>

        {airline?.plan_name ? (
          <View style={styles.planPill}>
            <Pill text={airline.plan_name} icon="shield-check" color={C.blue} bg="rgba(37,99,235,0.16)" />
          </View>
        ) : null}
      </View>

      {tab === 'fleet' ? (
        <View style={styles.mockPanel}><FleetScreen /></View>
      ) : activeTab ? <MockTabPanel tab={activeTab} /> : null}

      {/* Bottom pill nav */}
      <View style={styles.nav}>
        {TABS.map(t => (
          <Pressable key={t.id} style={styles.navItem} onPress={() => setTab(t.id === tab ? null : t.id)}>
            <Icon name={t.icon} size={22} color={tab === t.id ? C.blue : '#64748B'} />
            <Text style={[styles.navTxt, tab === t.id && { color: C.blue }]}>{t.label}</Text>
          </Pressable>
        ))}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0B1220' },
  mapWrap: { flex: 1 },
  map: { flex: 1 },
  headerPill: {
    position: 'absolute', top: 14, left: 14, right: 14,
    backgroundColor: 'rgba(17,24,39,0.92)', borderRadius: 22, paddingHorizontal: 16, paddingVertical: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  profileCap: {
    position: 'absolute', bottom: 14, left: 14, right: 14,
    backgroundColor: 'rgba(17,24,39,0.92)', borderRadius: 26, paddingHorizontal: 12, paddingVertical: 8,
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.08)',
  },
  planPill: { position: 'absolute', top: 76, left: 14 },
  logoCircle: { width: 34, height: 34, borderRadius: 17, alignItems: 'center', justifyContent: 'center' },
  mockPanel: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: '#0B1220', alignItems: 'center', justifyContent: 'center' },
  nav: {
    flexDirection: 'row', backgroundColor: '#111827', borderTopWidth: 1, borderTopColor: '#1E293B',
    paddingTop: 8, paddingBottom: 10,
  },
  navItem: { flex: 1, alignItems: 'center' },
  navTxt: { fontSize: 10.5, fontWeight: '700', color: '#64748B', marginTop: 2 },
});
