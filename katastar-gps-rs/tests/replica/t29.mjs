import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8150);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const fails = []; const note = (ok, msg) => { if (!ok) fails.push(msg); console.log(ok ? '  ok  ' : '  FAIL', msg); };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const mk = () => b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 3 } });
const boot = async (page, onGfi) => { const ctx = await mk(); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  p.gfi = []; await p.route(/\/wms\?/, r => { const u = r.request().url(); if (!/GetFeatureInfo/i.test(u)) return r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); p.gfi.push(u); return onGfi ? onGfi(r, u) : r.fulfill({ status: 200, contentType: 'text/plain', body: '' }); });
  await p.goto('http://localhost:8150/' + page); await p.addScriptTag({ path: USER }); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900); return { ctx, p }; };

console.log('1) GetFeatureInfo SASTAVLJEN IZ ADRESE PLOCICA (izvor nije TileWMS)');
{ const JSONR = JSON.stringify({ features: [{ properties: { PARCELA: '6501/1', POVRSINA: '2412', KO: 'Bijeljina 1' } }] });
  const { ctx, p } = await boot('ekatastar-wms2.html', (r, u) => /authkey=SECRETKEY123/.test(u) && /QUERY_LAYERS=parcele/.test(u) && /application%2Fjson/.test(u) ? r.fulfill({ status: 200, contentType: 'application/json', body: JSONR }) : r.fulfill({ status: 400, body: 'x' }));
  await p.evaluate(() => map.once('singleclick', (e) => { window.__tap = e.coordinate; })); await p.mouse.click(120, 300); const tapXY = await p.evaluate(() => new Promise((res) => { const t = setInterval(() => { if (window.__tap) { clearInterval(t); res(window.__tap); } }, 50); })); await p.waitForTimeout(3000);
  const d = await p.evaluate(() => { const e = document.querySelector('#kgrs .detail'); return e.classList.contains('on') ? e.innerText.replace(/\n+/g, ' | ') : null; });
  note(!!d && /6501\/1/.test(d) && /2412 m²/.test(d) && /Bijeljina 1/.test(d), 'kartica: ' + (d || 'nema'));
  const u = new URL(p.gfi.find(x => /application%2Fjson/.test(x))); const bb = u.searchParams.get('BBOX').split(',').map(Number); const cx = (bb[0] + bb[2]) / 2, cy = (bb[1] + bb[3]) / 2;
  console.log('   [debug]', 'razlika centra od dodira:', Math.hypot(cx - tapXY[0], cy - tapXY[1]).toFixed(3), 'X', u.searchParams.get('X'), 'Y', u.searchParams.get('Y'), 'SRS', u.searchParams.get('SRS'), 'LAYERS', u.searchParams.get('LAYERS'), 'authkey', u.searchParams.get('authkey'));
  note(Math.hypot(cx - tapXY[0], cy - tapXY[1]) < 0.3 && u.searchParams.get('X') === '50' && u.searchParams.get('Y') === '50' && u.searchParams.get('SRS') === 'EPSG:31276' && u.searchParams.get('LAYERS') === 'parcele' && u.searchParams.get('authkey') === 'SECRETKEY123', `parametri upita: BBOX centar = tacka dodira, X=Y=50, SRS, LAYERS i originalni "authkey" ocuvani`);
  note(p.errs.length === 0, 'bez JS gresaka ' + p.errs.join(';')); await ctx.close(); }
{ const { ctx, p } = await boot('ekatastar-wms2.html'); await p.mouse.click(120, 300); await p.waitForTimeout(9000);
  const d = await p.evaluate(() => document.querySelector('#kgrs .detail').innerText.replace(/\n+/g, ' | '));
  note(/slojeva za upit: 1 \(Парцеле \[iz adrese pločica\]\)/.test(d) && /primjer: .*authkey=SECR…/.test(d) && !/SECRETKEY123/.test(d), 'dijagnostika pokazuje nacin + primjer upita sa SAKRIVENIM kljucem: ' + d.slice(150, 420)); await ctx.close(); }

console.log('2) ZIVA TACKA: izgled, glatkoca, odziv');
{ const { ctx, p } = await boot('ekatastar-wms2.html'); await p.click('#kgrs .go'); await p.waitForTimeout(1500);
  const info = await p.evaluate(() => { const dot = document.querySelector('.kgrs-me-dot'); const l = map.getLayers().getArray().find(l => l.getZIndex() === 9999); return { has: !!dot, bg: dot && getComputedStyle(dot).backgroundImage, feats: l.getSource().getFeatures().map(f => f.get('k')).join(',') }; });
  note(info.has && /52, 210, 122/.test(info.bg), 'zelena tacka (DOM overlay): ' + (info.bg || '').slice(0, 60)); const accPx = await p.evaluate(() => { const a = document.querySelector('.kgrs-me-acc'); return [parseFloat(a.style.width), map.getView().getResolution()]; });
  note(info.feats === '' && Math.abs(accPx[0] - 2 * 3 / accPx[1]) < 2, `krug tacnosti je DOM (r=3 m -> ${accPx[0].toFixed(0)} px), vektorski sloj prazan bez dodira ('${info.feats}')`);
  // pozicija = GPS
  const err = await p.evaluate(() => { const ov = map.getOverlays().getArray().find(o => o.getElement().classList.contains('kgrs-me')); const c = ov.getPosition(); const g = ol.proj.transform([18.0807, 44.73045], 'EPSG:4326', map.getView().getProjection()); return Math.hypot(c[0] - g[0], c[1] - g[1]); });
  note(err < 1.5, 'pozicija tacke = GPS (odstupanje ' + err.toFixed(2) + ' m)');
  // kompas: dogadjaji iz same stranice na ~30 Hz (kao pravi senzor), uzorak po kadru
  const feed = (center, noise) => p.evaluate(([c, n]) => { clearInterval(window.__feed); window.__feed = setInterval(() => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { alpha: c + (Math.random() * 2 - 1) * n, beta: 0, gamma: 0, absolute: true }); window.dispatchEvent(e); }, 33); }, [center, noise]);
  const feedStop = () => p.evaluate(() => clearInterval(window.__feed));
  const sampler = () => p.evaluate(() => { window.__s = []; window.__run = true; (function s() { const el = document.querySelector('.kgrs-me-dir'); const m = el && /rotate\(([-\d.]+)deg\)/.exec(el.style.transform); window.__s.push(m ? [performance.now(), +m[1]] : null); if (window.__run) requestAnimationFrame(s); })(); });
  const stopSampler = () => p.evaluate(() => { window.__run = false; return window.__s.filter(x => x); });
  await feed(90, 0); await p.waitForTimeout(900);
  await feed(90, 5); await sampler(); await p.waitForTimeout(1800); const s1 = (await stopSampler()).map(x => x[1]);
  const dl = s1.slice(1).map((v, i) => Math.abs(((v - s1[i] + 540) % 360) - 180)); const mean = s1.slice(-20).reduce((a, v) => a + v, 0) / Math.min(20, s1.length);
  note(Math.max(...dl) < 1.5 && Math.abs(mean - 270) < 5, `sum +-5 stepeni @30 Hz: najveci skok izmedju kadrova ${Math.max(...dl).toFixed(2)}° (cilj < 1.5°), srednji kurs ${mean.toFixed(0)}° (cilj 270°), kadrova: ${s1.length}`);
  await feed(180, 0); await sampler(); const tFeed = await p.evaluate(() => performance.now()); await p.waitForTimeout(1200); const s2 = await stopSampler();
  const hit = s2.find(x => Math.abs(((x[1] - 180 + 540) % 360) - 180) < 5); const reach = hit ? Math.round(hit[0] - tFeed) : -1;
  note(reach >= 0 && reach < 500, `odziv na nagli okret (270° -> 180°): ${reach} ms do 5° (cilj < 500 ms)`); await feedStop();
  // hodanje 1.4 m/s prema sjeveru: marker ne smije kasniti vise od ~2 m, bez skokova
  const g0 = await p.evaluate(() => ol.proj.transform([18.0807, 44.73045], 'EPSG:4326', map.getView().getProjection()));
  const dlat = 1.4 / 111195; const markerPos = () => p.evaluate(() => { const ov = map.getOverlays().getArray().find(o => o.getElement().classList.contains('kgrs-me')); return ov.getPosition(); });
  const errs = [];
  for (let i = 1; i <= 9; i++) { await ctx.setGeolocation({ latitude: 44.73045 + i * dlat, longitude: 18.0807, accuracy: 3 }); await p.waitForTimeout(500); const m = await markerPos(); errs.push(Math.hypot(m[0] - g0[0], m[1] - (g0[1] + (i + 0.5) * 1.4))); await p.waitForTimeout(500); }
  const late = errs.slice(-4); const avg = late.reduce((a, v) => a + v, 0) / late.length;
  note(avg < 2.2, `hodanje 1.4 m/s: prosjecno kasnjenje markera posljednjih 4 s = ${avg.toFixed(2)} m (cilj < 2.2 m; raniji filter ~5 m); greske po sekundi: ${errs.map(e => e.toFixed(1)).join(' ')}`);
  // skok od 10 m (npr. GPS ispravi poziciju): prihvaceno u najvise 2 ocitavanja
  const jump = 44.73045 + 9 * dlat + 0.00009; await ctx.setGeolocation({ latitude: jump, longitude: 18.0807, accuracy: 3 }); await p.waitForTimeout(1200); await ctx.setGeolocation({ latitude: jump, longitude: 18.0807, accuracy: 3 }); await p.waitForTimeout(1500);
  const mj = await markerPos(); const tgtJ = ol_toProj(jump); function ol_toProj(la) { return la; }
  const jy = await p.evaluate((la) => ol.proj.transform([18.0807, la], 'EPSG:4326', map.getView().getProjection()), jump);
  note(Math.hypot(mj[0] - jy[0], mj[1] - jy[1]) < 3, 'skok od 10 m: marker stize u 2 ocitavanja (odstupanje ' + Math.hypot(mj[0] - jy[0], mj[1] - jy[1]).toFixed(1) + ' m)');
  // mirovanje: nasa petlja staje
  await p.waitForTimeout(1500); const frames = await p.evaluate(() => new Promise((res) => { let n = 0; const orig = window.requestAnimationFrame; window.requestAnimationFrame = function (cb) { n++; return orig.call(window, cb); }; setTimeout(() => { window.requestAnimationFrame = orig; res(n); }, 1000); }));
  note(frames <= 12, 'u mirovanju petlja crtanja ne trosi bateriju: rAF poziva u 1 s = ' + frames);
  await p.screenshot({ path: 'me-green.png', clip: { x: 85, y: 330, width: 220, height: 200 } });
  await p.click('#kgrs .go'); await p.waitForTimeout(400); note(await p.evaluate(() => document.querySelectorAll('.kgrs-me').length === 0), 'stop uklanja tacku');
  note(p.errs.length === 0, 'bez JS gresaka ' + p.errs.join(';')); await ctx.close(); }

console.log('\nUKUPNO PROBLEMA:', fails.length); fails.forEach(f => console.log(' -', f));
await b.close(); srv.close();
