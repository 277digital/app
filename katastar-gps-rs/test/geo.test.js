import test from 'node:test';
import assert from 'node:assert/strict';
import { ringAreaM2, pointInRing, distanceToRingM, searchParcels, toFeatures } from '../js/geo.js';

// ~100m x ~100m kvadrat kod Doboja (44.73N)
const dLat = 100 / 111195;
const dLng = 100 / (111195 * Math.cos((44.73 * Math.PI) / 180));
const sq = [[18.08, 44.73], [18.08 + dLng, 44.73], [18.08 + dLng, 44.73 + dLat], [18.08, 44.73 + dLat]];

test('povrsina ~ 10000 m2', () => {
  assert.ok(Math.abs(ringAreaM2(sq) - 10000) < 50);
});
test('tacka unutra/izvan', () => {
  assert.equal(pointInRing([18.08 + dLng / 2, 44.73 + dLat / 2], sq), true);
  assert.equal(pointInRing([18.07, 44.73], sq), false);
});
test('rastojanje do ivice ~ 50 m iz centra', () => {
  const d = distanceToRingM([18.08 + dLng / 2, 44.73 + dLat / 2], sq);
  assert.ok(Math.abs(d - 50) < 1);
});
test('pretraga: osnovni broj pogadja podbrojeve, podbroj samo tacno', () => {
  const f = ['512', '512/1', '512/2', '5120'].map((p) => ({ properties: { parcela: p, ko: 'Doboj' } }));
  assert.equal(searchParcels(f, '512').length, 3);
  assert.equal(searchParcels(f, '512/1').length, 1);
  assert.equal(searchParcels(f, '512', 'Drugo').length, 0);
});
test('toFeatures prihvata Feature i geometriju', () => {
  assert.equal(toFeatures({ type: 'Polygon', coordinates: [] }).length, 1);
});
