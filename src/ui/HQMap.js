// Minimal OpenStreetMap view (via Leaflet in a WebView) showing the
// player's HQ airport. Deliberately simple for Phase 2 — no live aircraft,
// routes, or weather yet (that's Phase 4+, once flights exist). Includes
// the required OSM attribution, per the GDD ("use OpenStreetMap... with
// proper credit").
import React from 'react';
import { View, StyleSheet } from 'react-native';
import { WebView } from 'react-native-webview';

function buildHtml({ lat, lng, name, iata }) {
  const safeName = JSON.stringify(name || 'Headquarters');
  const safeIata = JSON.stringify(iata || '');
  return `<!doctype html><html><head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"/>
<link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"/>
<style>
  html,body,#map{margin:0;height:100%;width:100%;background:#F6F7F9}
  .hq-pin{width:36px;height:36px;border-radius:18px;background:#FFFFFF;border:3px solid #2563EB;
    display:flex;align-items:center;justify-content:center;box-shadow:0 4px 10px rgba(11,15,20,.25)}
  .hq-pin span{color:#2563EB;font-size:16px;font-weight:800}
  .leaflet-popup-content{font-size:13px;font-weight:600}
</style>
</head><body>
<div id="map"></div>
<script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
<script>
  // World view by default (per the GDD — the whole map should load, not
  // just a zoomed-in HQ close-up) — the player can pinch/scroll-zoom in to
  // their HQ from here. zoomControl re-enabled so it's usable without a
  // trackpad/pinch (useful for testing in an emulator too).
  var map = L.map('map', { zoomControl: true, attributionControl: true, minZoom: 2 }).setView([20, 0], 2);
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 18,
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  }).addTo(map);
  var icon = L.divIcon({ className: '', html: '<div class="hq-pin"><span>&#9992;</span></div>', iconSize: [36,36], iconAnchor: [18,18] });
  var hqMarker = L.marker([${lat}, ${lng}], { icon: icon }).addTo(map)
    .bindPopup('<b>' + ${safeName} + '</b>' + (${safeIata} ? ' (' + ${safeIata} + ')' : ''));

  var RecenterControl = L.Control.extend({
    options: { position: 'bottomright' },
    onAdd: function () {
      var btn = L.DomUtil.create('button');
      btn.innerHTML = '&#9992;';
      btn.style.cssText = 'width:40px;height:40px;border-radius:20px;background:#FFFFFF;color:#2563EB;font-size:18px;border:2px solid #2563EB;box-shadow:0 3px 8px rgba(11,15,20,.25)';
      btn.onclick = function () { map.flyTo([${lat}, ${lng}], 9, { duration: 1.2 }); hqMarker.openPopup(); };
      return btn;
    }
  });
  map.addControl(new RecenterControl());
</script>
</body></html>`;
}

export default function HQMap({ lat, lng, name, iata, style }) {
  if (lat == null || lng == null) return <View style={[styles.fallback, style]} />;
  return (
    <View style={[styles.container, style]}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildHtml({ lat, lng, name, iata }) }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { overflow: 'hidden', backgroundColor: '#F6F7F9' },
  webview: { flex: 1, backgroundColor: 'transparent' },
  fallback: { backgroundColor: '#F6F7F9' },
});
