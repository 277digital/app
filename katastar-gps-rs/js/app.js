import { ringAreaM2, pointInRing, distanceToRingM, outerRing, searchParcels, toFeatures } from './geo.js';

const $ = (id) => document.getElementById(id);
const STORE = 'kgrs.parcels.v1';
const WMS_STORE = 'kgrs.wms.v1';

// ---------- skladiste (localStorage, sa zastitom) ----------
const load = (k, d) => { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch { alert('Nema dovoljno mjesta za čuvanje podataka.'); return false; } };
let parcels = load(STORE, []);

// ---------- mapa ----------
const map = L.map('map', { zoomControl: false }).setView([44.2, 17.9], 8);
const osm = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19, attribution: '© OpenStreetMap' });
const sat = L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', { maxZoom: 19, attribution: 'Esri' });
sat.addTo(map);
L.control.layers({ Satelit: sat, Mapa: osm }, {}, { position: 'topleft' }).addTo(map);
L.control.scale({ imperial: false }).addTo(map);

const parcelLayer = L.geoJSON(null, { style: { color: '#ffd400', weight: 2, fillOpacity: 0.08 } }).addTo(map);
const selectedLayer = L.geoJSON(null, { style: { color: '#ff3b30', weight: 3, fillOpacity: 0.15 } }).addTo(map);
let selected = null;

function renderParcels() {
  parcelLayer.clearLayers();
  parcelLayer.addData({ type: 'FeatureCollection', features: parcels });
  $('count').textContent = `Učitano parcela: ${parcels.length}`;
  const kos = [...new Set(parcels.map((f) => f.properties?.ko).filter(Boolean))];
  $('ko-list').innerHTML = kos.map((k) => `<option value="${k.replace(/"/g, '&quot;')}">`).join('');
}

function select(f) {
  selected = f;
  selectedLayer.clearLayers();
  selectedLayer.addData(f);
  map.fitBounds(selectedLayer.getBounds(), { maxZoom: 20, padding: [30, 30] });
  updateStatus();
}

// ---------- GPS ----------
let watchId = null, pos = null;
const me = L.circleMarker([0, 0], { radius: 8, color: '#fff', weight: 3, fillColor: '#0b57d0', fillOpacity: 1 });
const acc = L.circle([0, 0], { radius: 0, color: '#0b57d0', weight: 1, fillOpacity: 0.1 });
let followed = false;

function setStatus(text, cls = '') { const s = $('status'); s.textContent = text; s.className = cls; }

function updateStatus() {
  if (!pos) return setStatus('GPS isključen');
  const a = Math.round(pos.accuracy);
  let t = `GPS ±${a} m`;
  let cls = a <= 5 ? 'good' : a <= 15 ? 'warn' : 'bad';
  const ring = selected && outerRing(selected);
  if (ring) {
    const p = [pos.lng, pos.lat];
    const d = Math.round(distanceToRingM(p, ring) * 10) / 10;
    const label = selected.properties?.parcela ? `parcela ${selected.properties.parcela}` : 'parcela';
    t += pointInRing(p, ring) ? ` · UNUTAR ${label}, ${d} m od granice` : ` · IZVAN ${label}, ${d} m od granice`;
    if (d < pos.accuracy) t += ' (unutar greške GPS-a)';
  }
  setStatus(t, cls);
}

function onPos(p) {
  pos = { lat: p.coords.latitude, lng: p.coords.longitude, accuracy: p.coords.accuracy };
  me.setLatLng([pos.lat, pos.lng]); acc.setLatLng([pos.lat, pos.lng]).setRadius(pos.accuracy);
  if (!followed) { map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 18)); followed = true; }
  updateStatus();
}

function toggleGps() {
  if (watchId !== null) {
    navigator.geolocation.clearWatch(watchId); watchId = null; pos = null; followed = false;
    me.remove(); acc.remove(); $('btn-locate').classList.remove('on'); return updateStatus();
  }
  if (!('geolocation' in navigator)) return setStatus('Uređaj ne podržava GPS', 'bad');
  acc.addTo(map); me.addTo(map); $('btn-locate').classList.add('on'); setStatus('Tražim GPS signal…');
  watchId = navigator.geolocation.watchPosition(onPos,
    (e) => { setStatus(`GPS greška: ${e.message}`, 'bad'); },
    { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
}
$('btn-locate').onclick = () => (watchId === null ? toggleGps() : pos && map.setView([pos.lat, pos.lng], Math.max(map.getZoom(), 18)));
$('btn-gps-off').onclick = () => watchId !== null && toggleGps();

// ---------- paneli ----------
const panels = ['panel-search', 'panel-menu'];
function openPanel(id) { panels.forEach((p) => ($(p).hidden = p !== id || !$(p).hidden)); }
$('btn-search').onclick = () => openPanel('panel-search');
$('btn-menu').onclick = () => openPanel('panel-menu');
document.querySelectorAll('[data-close]').forEach((b) => (b.onclick = () => panels.forEach((p) => ($(p).hidden = true))));

// ---------- pretraga ----------
function doSearch() {
  const res = searchParcels(parcels, $('q-parcel').value, $('q-ko').value);
  const ul = $('results'); ul.innerHTML = '';
  if (!$('q-parcel').value.trim()) return;
  if (!res.length) { ul.innerHTML = '<li class="hint">Nema rezultata u učitanim podacima.</li>'; return; }
  res.slice(0, 50).forEach((f) => {
    const li = document.createElement('li'); const b = document.createElement('button');
    const p = f.properties || {};
    const area = outerRing(f) ? Math.round(ringAreaM2(outerRing(f))) : null;
    b.innerHTML = `<b></b><small></small>`;
    b.firstChild.textContent = `Parcela ${p.parcela ?? '?'}`;
    b.lastChild.textContent = [p.ko, p.opstina, area ? `${area} m²` : ''].filter(Boolean).join(' · ');
    b.onclick = () => { select(f); $('panel-search').hidden = true; };
    li.append(b); ul.append(li);
  });
}
$('q-parcel').oninput = doSearch; $('q-ko').oninput = doSearch;

// ---------- uvoz / izvoz ----------
$('file-import').onchange = async (e) => {
  const file = e.target.files[0]; if (!file) return;
  try {
    const feats = toFeatures(JSON.parse(await file.text())).filter((f) => outerRing(f));
    if (!feats.length) throw new Error('Nema poligona u fajlu');
    parcels = parcels.concat(feats.map((f) => ({ ...f, properties: normProps(f.properties || {}) })));
    if (save(STORE, parcels)) { renderParcels(); map.fitBounds(parcelLayer.getBounds()); }
  } catch (err) { alert('Uvoz nije uspio: ' + err.message); }
  e.target.value = '';
};
// Podrzava razlicite nazive svojstava u fajlovima koje dobijemo.
function normProps(p) {
  return { ...p, parcela: p.parcela ?? p.broj ?? p.PARCELA ?? p.BROJ ?? p.brparc ?? p.name, ko: p.ko ?? p.KO ?? p.kat_opstina ?? p.katastarska_opstina };
}
$('btn-export').onclick = () => download('katastar-gps-rs.geojson', { type: 'FeatureCollection', features: parcels });
$('btn-clear').onclick = () => { if (confirm('Obrisati sve učitane i snimljene parcele?')) { parcels = []; save(STORE, parcels); selected = null; selectedLayer.clearLayers(); renderParcels(); } };
function download(name, obj) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([JSON.stringify(obj)], { type: 'application/geo+json' }));
  a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(a.href), 1000);
}

// ---------- snimanje granice ----------
let rec = null; // { pts: [[lng,lat]], line }
const recLine = L.polyline([], { color: '#00e5ff', weight: 3 }).addTo(map);
const recPts = L.layerGroup().addTo(map);
function recRender() {
  recLine.setLatLngs(rec.pts.map(([x, y]) => [y, x]));
  recPts.clearLayers(); rec.pts.forEach(([x, y]) => L.circleMarker([y, x], { radius: 5, color: '#00e5ff', fillOpacity: 1 }).addTo(recPts));
  const n = rec.pts.length;
  $('recinfo').textContent = `${n} tač.` + (n >= 3 ? ` · ${Math.round(ringAreaM2(rec.pts))} m²` : '');
}
function recStop() { rec = null; $('recbar').hidden = true; $('btn-record').classList.remove('on'); recLine.setLatLngs([]); recPts.clearLayers(); }
$('btn-record').onclick = () => {
  if (rec) return recStop();
  rec = { pts: [] }; $('recbar').hidden = false; $('btn-record').classList.add('on'); recRender();
  if (watchId === null) toggleGps();
};
$('rec-add').onclick = () => {
  if (!pos) return alert('Nema GPS pozicije. Sačekajte signal.');
  if (pos.accuracy > 15 && !confirm(`GPS tačnost je samo ±${Math.round(pos.accuracy)} m. Dodati tačku svejedno?`)) return;
  rec.pts.push([pos.lng, pos.lat]); recRender();
};
$('rec-undo').onclick = () => { rec.pts.pop(); recRender(); };
$('rec-cancel').onclick = recStop;
$('rec-done').onclick = () => {
  if (rec.pts.length < 3) return alert('Potrebne su najmanje 3 tačke.');
  const name = prompt('Naziv/broj parcele:', '') ?? '';
  const ring = [...rec.pts, rec.pts[0]];
  const f = { type: 'Feature', properties: { parcela: name || 'snimljeno', izvor: 'snimljeno GPS-om', povrsina_m2: Math.round(ringAreaM2(rec.pts)), snimljeno: new Date().toISOString() },
    geometry: { type: 'Polygon', coordinates: [ring] } };
  parcels.push(f); save(STORE, parcels); renderParcels(); recStop(); select(f);
};

// ---------- opcioni WMS ----------
let wmsLayer = null;
function applyWms(cfg) {
  if (wmsLayer) { wmsLayer.remove(); wmsLayer = null; }
  if (!cfg?.url) return;
  const extra = Object.fromEntries(new URLSearchParams(cfg.extra || ''));
  wmsLayer = L.tileLayer.wms(cfg.url, { layers: cfg.layers, format: 'image/png', transparent: true, ...extra }).addTo(map);
}
const w = load(WMS_STORE, {});
$('wms-url').value = w.url || ''; $('wms-layers').value = w.layers || ''; $('wms-extra').value = w.extra || '';
$('wms-apply').onclick = () => {
  const cfg = { url: $('wms-url').value.trim(), layers: $('wms-layers').value.trim(), extra: $('wms-extra').value.trim() };
  if (cfg.url && !/^https:\/\//i.test(cfg.url)) return alert('WMS URL mora počinjati sa https://');
  save(WMS_STORE, cfg); applyWms(cfg);
};
applyWms(w);

renderParcels();
if (parcels.length) map.fitBounds(parcelLayer.getBounds());
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
