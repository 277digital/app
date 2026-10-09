// Cista geometrija u metrima. Za male povrsine (plac) koristimo lokalnu
// ekvirektangularnu projekciju oko referentne tacke, sto je dovoljno tacno.
const R = 6371008.8;
const rad = (d) => (d * Math.PI) / 180;

/** Pretvara [lng, lat] u lokalne metre [x, y] u odnosu na ref [lng, lat]. */
export function toLocal([lng, lat], [rlng, rlat]) {
  return [rad(lng - rlng) * R * Math.cos(rad(rlat)), rad(lat - rlat) * R];
}

function localRing(ring) {
  const ref = ring[0];
  return ring.map((p) => toLocal(p, ref));
}

/** Povrsina prstena [[lng,lat],...] u m2 (shoelace). */
export function ringAreaM2(ring) {
  const pts = localRing(ring);
  let s = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x1, y1] = pts[i];
    const [x2, y2] = pts[(i + 1) % pts.length];
    s += x1 * y2 - x2 * y1;
  }
  return Math.abs(s) / 2;
}

/** Ray casting; ring je [[lng,lat],...] (zatvaranje nije obavezno). */
export function pointInRing(pt, ring) {
  const [x, y] = pt;
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i];
    const [xj, yj] = ring[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
}

/** Rastojanje (m) od tacke do najblize ivice prstena. */
export function distanceToRingM(pt, ring) {
  const p = [0, 0];
  const pts = ring.map((q) => toLocal(q, pt));
  let best = Infinity;
  for (let i = 0; i < pts.length; i++) {
    const a = pts[i];
    const b = pts[(i + 1) % pts.length];
    const dx = b[0] - a[0];
    const dy = b[1] - a[1];
    const len2 = dx * dx + dy * dy;
    let t = len2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    best = Math.min(best, Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]));
  }
  return best;
}

/** Spoljasnji prsten iz GeoJSON Polygon/MultiPolygon feature-a (prvi poligon). */
export function outerRing(feature) {
  const g = feature.geometry;
  if (!g) return null;
  if (g.type === 'Polygon') return g.coordinates[0];
  if (g.type === 'MultiPolygon') return g.coordinates[0][0];
  return null;
}

/** Normalizuje broj parcele za poredjenje: "512 / 1" -> "512/1". */
export function normParcel(s) {
  return String(s ?? '').replace(/\s+/g, '').toLowerCase();
}

/**
 * Pretraga parcela. "512" pogadja 512, 512/1, 512/2...; "512/1" samo tacno.
 * Opciono sa filterom po katastarskoj opstini.
 */
export function searchParcels(features, query, ko = '') {
  const q = normParcel(query);
  if (!q) return [];
  const k = ko.trim().toLowerCase();
  return features.filter((f) => {
    const n = normParcel(f.properties?.parcela ?? f.properties?.broj);
    if (!n) return false;
    if (k && String(f.properties?.ko ?? '').toLowerCase() !== k) return false;
    return q.includes('/') ? n === q : n === q || n.startsWith(q + '/');
  });
}

/** Valjan GeoJSON (FeatureCollection/Feature/geometrija) -> niz Feature-a. */
export function toFeatures(gj) {
  if (!gj) return [];
  if (gj.type === 'FeatureCollection') return gj.features ?? [];
  if (gj.type === 'Feature') return [gj];
  if (gj.type) return [{ type: 'Feature', properties: {}, geometry: gj }];
  return [];
}
