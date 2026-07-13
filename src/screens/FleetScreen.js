// Fleet tab — two sub-tabs, same shape as the Truck Manager sibling app's
// Fleet/Buy split: "My Fleet" (owned aircraft) and "Buy Aircraft" (full
// catalog with search + category filter). Aircraft detail here is
// deliberately simple (status/condition/specs) — the full flight timeline
// and the 3D theater-style cabin/seat editor are real, deliberately
// deferred features (Phase 5-6, see context/03_ROADMAP.md), not cut
// corners on this screen.
import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, TextInput, Pressable, FlatList, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { C, FONT, RADIUS } from '../ui/theme';
import { Card, Btn, Row, Pill, Progress, useToast, Sheet } from '../ui/components';
import { inr } from '../engine/economy';
import * as api from '../services/api';
import { useSession } from '../store/session';

const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'regional', label: 'Regional' },
  { key: 'narrowbody', label: 'Narrowbody' },
  { key: 'widebody', label: 'Widebody' },
  { key: 'cargo', label: 'Cargo' },
];

function StatusPill({ status }) {
  const meta = {
    building: { label: 'Building', color: C.amber, bg: C.amberSoft, icon: 'factory' },
    parked: { label: 'Parked', color: C.blue, bg: C.blueSoft, icon: 'parking' },
    scheduled: { label: 'Scheduled', color: C.green, bg: C.greenSoft, icon: 'calendar-clock' },
    in_flight: { label: 'In Flight', color: C.green, bg: C.greenSoft, icon: 'airplane' },
    maintenance: { label: 'Maintenance', color: C.red, bg: C.redSoft, icon: 'wrench' },
    retired: { label: 'Retired', color: '#64748B', bg: '#1E293B', icon: 'archive' },
  }[status] || { label: status, color: C.faint, bg: '#1E293B', icon: 'help' };
  return <Pill text={meta.label} color={meta.color} bg={meta.bg} icon={meta.icon} />;
}

function AircraftDetailSheet({ aircraft, visible, onClose }) {
  if (!aircraft) return <Sheet visible={false} onClose={onClose} title="Aircraft"><View /></Sheet>;
  const buildPct = aircraft.status === 'building' && aircraft.build_completes_at
    ? Math.min(100, Math.max(0, 100 - ((new Date(aircraft.build_completes_at) - Date.now()) / (20 * 60 * 1000)) * 100))
    : 100;
  return (
    <Sheet visible={visible} onClose={onClose} title={aircraft.registration} height="70%">
      <Card style={{ backgroundColor: '#111827', borderColor: '#1E293B', marginBottom: 12 }}>
        <Row style={{ justifyContent: 'space-between' }}>
          <Text style={[FONT.h3, { color: '#F8FAFC' }]}>{aircraft.manufacturer} {aircraft.model}</Text>
          <StatusPill status={aircraft.status} />
        </Row>
        <Text style={[FONT.tiny, { color: '#64748B', marginTop: 4 }]}>{aircraft.nickname || 'No nickname set'} · {aircraft.aircraft_type}</Text>
      </Card>

      {aircraft.status === 'building' ? (
        <Card style={{ marginBottom: 12 }}>
          <Text style={[FONT.body, { fontWeight: '700' }]}>Build progress</Text>
          <Progress pct={buildPct} color={C.amber} style={{ marginTop: 8 }} />
          <Text style={[FONT.tiny, { marginTop: 6 }]}>Ready around {new Date(aircraft.build_completes_at).toLocaleTimeString()}</Text>
        </Card>
      ) : null}

      <Card style={{ marginBottom: 12 }}>
        <Text style={[FONT.body, { fontWeight: '700', marginBottom: 8 }]}>Condition</Text>
        {[['Engine', aircraft.condition_engine], ['Airframe', aircraft.condition_airframe], ['Cabin', aircraft.condition_cabin]].map(([label, v]) => (
          <View key={label} style={{ marginBottom: 8 }}>
            <Row style={{ justifyContent: 'space-between', marginBottom: 3 }}>
              <Text style={FONT.tiny}>{label}</Text>
              <Text style={[FONT.tiny, { fontWeight: '700' }]}>{Number(v).toFixed(0)}%</Text>
            </Row>
            <Progress pct={Number(v)} color={Number(v) > 60 ? C.green : Number(v) > 30 ? C.amber : C.red} />
          </View>
        ))}
      </Card>

      <Card>
        <Text style={[FONT.body, { fontWeight: '700', marginBottom: 8 }]}>Specs</Text>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}><Text style={FONT.tiny}>Passenger capacity</Text><Text style={FONT.tiny}>{aircraft.passenger_capacity}</Text></Row>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}><Text style={FONT.tiny}>Cargo capacity</Text><Text style={FONT.tiny}>{aircraft.cargo_capacity_kg} kg</Text></Row>
        <Row style={{ justifyContent: 'space-between', marginBottom: 6 }}><Text style={FONT.tiny}>Max range</Text><Text style={FONT.tiny}>{aircraft.max_range_km} km</Text></Row>
        <Row style={{ justifyContent: 'space-between' }}><Text style={FONT.tiny}>Current value</Text><Text style={FONT.tiny}>{inr(Number(aircraft.current_value))}</Text></Row>
      </Card>
      <Text style={[FONT.tiny, { color: '#475569', textAlign: 'center', marginTop: 14 }]}>
        Full flight timeline & the visual seat/cabin editor arrive in a later phase.
      </Text>
    </Sheet>
  );
}

function MyFleetTab() {
  const [fleet, setFleet] = useState(null);
  const [selected, setSelected] = useState(null);

  const load = () => api.getMyFleet().then(setFleet).catch(() => setFleet([]));
  useEffect(() => { load(); }, []);

  if (fleet === null) return <Text style={[FONT.sub, { color: '#64748B', padding: 20 }]}>Loading fleet…</Text>;
  if (fleet.length === 0) {
    return (
      <View style={styles.empty}>
        <Icon name="airplane-off" size={36} color="#475569" />
        <Text style={[FONT.h3, { color: '#94A3B8', marginTop: 10 }]}>No aircraft yet</Text>
      </View>
    );
  }

  return (
    <>
      <FlatList
        data={fleet}
        keyExtractor={a => a.id}
        contentContainerStyle={{ padding: 14 }}
        renderItem={({ item }) => (
          <Pressable onPress={() => setSelected(item)}>
            <Card style={{ marginBottom: 10, padding: 12 }}>
              <Row style={{ justifyContent: 'space-between' }}>
                <View style={{ flex: 1 }}>
                  <Text style={[FONT.body, { fontWeight: '700' }]} numberOfLines={1}>{item.manufacturer} {item.model}</Text>
                  <Text style={FONT.tiny}>{item.registration} · {item.passenger_capacity} seats</Text>
                </View>
                <StatusPill status={item.status} />
              </Row>
            </Card>
          </Pressable>
        )}
      />
      <AircraftDetailSheet aircraft={selected} visible={!!selected} onClose={() => setSelected(null)} />
    </>
  );
}

function BuyAircraftTab() {
  const [models, setModels] = useState([]);
  const [query, setQuery] = useState('');
  const [filter, setFilter] = useState('all');
  const [busy, setBusy] = useState(null);
  const toast = useToast();
  const refreshAirlineStatus = useSession(s => s.refreshAirlineStatus);
  const loadFullAirline = useSession(s => s.loadFullAirline);

  useEffect(() => { api.getAircraftModels().then(setModels).catch(() => {}); }, []);

  const filtered = useMemo(() => {
    let list = models;
    if (filter !== 'all') list = list.filter(m => m.aircraft_type === filter);
    const q = query.trim().toLowerCase();
    if (q) list = list.filter(m => m.manufacturer.toLowerCase().includes(q) || m.model.toLowerCase().includes(q));
    return list;
  }, [models, filter, query]);

  const purchase = async (model) => {
    setBusy(model.id);
    try {
      await api.buyAircraft(model.id);
      await loadFullAirline(); // refresh cash balance
      toast && toast(`${model.manufacturer} ${model.model} ordered — in the hangar now`, 'success');
    } catch (e) {
      toast && toast(e.message, 'error');
    } finally { setBusy(null); }
  };

  return (
    <View style={{ flex: 1 }}>
      <View style={{ padding: 14, paddingBottom: 0 }}>
        <TextInput value={query} onChangeText={setQuery} placeholder="Search manufacturer or model…" placeholderTextColor={C.faint} style={styles.search} />
        <Row style={{ gap: 6, marginTop: 10, marginBottom: 10, flexWrap: 'wrap' }}>
          {FILTERS.map(f => (
            <Pressable key={f.key} onPress={() => setFilter(f.key)} style={[styles.chip, filter === f.key && styles.chipActive]}>
              <Text style={[FONT.tiny, { fontWeight: '700', color: filter === f.key ? '#fff' : '#94A3B8' }]}>{f.label}</Text>
            </Pressable>
          ))}
        </Row>
      </View>
      <FlatList
        data={filtered}
        keyExtractor={m => String(m.id)}
        contentContainerStyle={{ padding: 14, paddingTop: 0 }}
        renderItem={({ item }) => (
          <Card style={{ marginBottom: 10, padding: 12 }}>
            <Row style={{ justifyContent: 'space-between' }}>
              <View style={{ flex: 1 }}>
                <Text style={[FONT.body, { fontWeight: '700' }]} numberOfLines={1}>{item.manufacturer} {item.model}</Text>
                <Text style={FONT.tiny}>{item.passenger_capacity} seats · {item.aircraft_type} · range {item.max_range_km} km</Text>
              </View>
              <Text style={[FONT.body, { fontWeight: '800', color: C.green }]}>{inr(Number(item.purchase_price))}</Text>
            </Row>
            <Btn title={busy === item.id ? 'Ordering…' : 'Buy'} kind="blue" small disabled={busy === item.id} onPress={() => purchase(item)} style={{ marginTop: 10 }} />
          </Card>
        )}
      />
    </View>
  );
}

export default function FleetScreen() {
  const [tab, setTab] = useState('my');
  return (
    <View style={styles.flex}>
      <Row style={{ padding: 14, paddingBottom: 0, gap: 8 }}>
        <Btn title="My Fleet" kind={tab === 'my' ? 'blue' : 'ghost'} small onPress={() => setTab('my')} style={{ flex: 1 }} />
        <Btn title="Buy Aircraft" kind={tab === 'buy' ? 'blue' : 'ghost'} small onPress={() => setTab('buy')} style={{ flex: 1 }} />
      </Row>
      {tab === 'my' ? <MyFleetTab /> : <BuyAircraftTab />}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: '#0B1220' },
  empty: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  search: {
    backgroundColor: '#111827', borderRadius: RADIUS.md, borderWidth: 1, borderColor: '#1E293B',
    paddingHorizontal: 14, paddingVertical: 10, color: '#F8FAFC',
  },
  chip: { paddingHorizontal: 12, paddingVertical: 7, borderRadius: 18, backgroundColor: '#111827', borderWidth: 1, borderColor: '#1E293B' },
  chipActive: { backgroundColor: C.blue, borderColor: C.blue },
});
