import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8130);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const fails = []; const note = (ok, msg) => { if (!ok) fails.push(msg); console.log(ok ? '  ok  ' : '  FAIL', msg); };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const GML = `<?xml version="1.0"?><wfs:FeatureCollection xmlns:wfs="http://www.opengis.net/wfs" xmlns:gml="http://www.opengis.net/gml"><gml:featureMember><parcele fid="parcele.1"><gml:boundedBy><gml:Box><gml:coordinates>1,2 3,4</gml:coordinates></gml:Box></gml:boundedBy><the_geom><gml:Polygon><gml:coordinates>1,2 3,4</gml:coordinates></gml:Polygon></the_geom><PARCELA>6452</PARCELA><KO>Доња Пакленица</KO><POVRSINA>812</POVRSINA><OBJECTID>77</OBJECTID></parcele></gml:featureMember></wfs:FeatureCollection>`;
const HTML = `<html><body><table><tr><th>Parcela</th><th>Površina</th><th>KO</th></tr><tr><td>1/3</td><td>455</td><td>Доња Пакленица</td></tr></table></body></html>`;
const JSONR = JSON.stringify({ type: 'FeatureCollection', features: [{ type: 'Feature', properties: { br_parc: '88/2', povrsina: '1200.5', ko: 'Липац', geom: 'x' }, geometry: null }] });
const mode = { v: 'gml' }; const asked = [];
const mkctx = () => b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } });
const fresh = async (page = 'ekatastar-wms.html') => { const ctx = await mkctx(); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.route(/\/wms\?/, r => { const u = new URL(r.request().url()); if (u.searchParams.get('REQUEST') !== 'GetFeatureInfo') return r.fulfill({ status: 200, contentType: 'image/png', body: PNG });
    const f = u.searchParams.get('INFO_FORMAT'); asked.push(f);
    if (mode.v === 'empty') return r.fulfill({ status: 200, contentType: 'text/plain', body: '' });
    if (mode.v === 'gml') return f === 'application/vnd.ogc.gml' ? r.fulfill({ status: 200, contentType: 'application/vnd.ogc.gml', body: GML }) : r.fulfill({ status: 400, body: 'unsupported' });
    if (mode.v === 'html') return f === 'text/html' ? r.fulfill({ status: 200, contentType: 'text/html', body: HTML }) : r.fulfill({ status: 400, body: 'unsupported' });
    if (mode.v === 'json') return r.fulfill({ status: 200, contentType: 'application/json', body: JSONR }); });
  await p.goto('http://localhost:8130/' + page); await p.addScriptTag({ path: USER }); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900); return { ctx, p }; };
const detail = (p) => p.evaluate(() => { const d = document.querySelector('#kgrs .detail'); return d.classList.contains('on') ? d.innerText.replace(/\n+/g, ' | ') : null; });

console.log('1) DETALJI NA DODIR NA MAPU (razni odgovori servera)');
for (const [m, expect] of [['gml', /Površina \| 812 m².*Vlasnici/s], ['html', /455 m²/s], ['json', /1200\.5 m²/s], ['empty', /Sajt ne vraća podatke/]]) {
  mode.v = m; asked.length = 0; const { ctx, p } = await fresh();
  await p.mouse.click(120, 300); await p.waitForTimeout(m === 'empty' ? 9000 : 2800);
  const d = await detail(p); note(!!d && expect.test(d), `${m}: ${d ? d.slice(0, 150) : 'nema kartice'} [format upiti: ${asked.join(', ')}]`);
  if (m === 'gml') { await p.screenshot({ path: 'det-gml.png' });
    note(!/OBJECTID|boundedBy|the_geom/i.test(d), 'tehnicka polja (geometrija/OBJECTID) sakrivena');
    await p.click('#kgrs .detail .chip-btn.acc'); await p.waitForTimeout(1500);
    note(await p.evaluate(() => document.getElementById('i_parc').value === '6452' && !document.getElementById('kgrs').classList.contains('on')), 'Vlasnici: broj upisan u njihovu pretragu, mapa zatvorena');
  }
  note(p.errs.length === 0, m + ': bez JS gresaka ' + p.errs.join(';')); await ctx.close(); }

console.log('2) DUGME "Detalji ovdje" (druga parcela)');
mode.v = 'gml';
{ const { ctx, p } = await fresh(); await p.click('#kgrs .go'); await p.waitForTimeout(1500);
  const vis = () => p.evaluate(() => [...document.querySelectorAll('#kgrs .actions .chip-btn')].find(b => /Detalji/.test(b.textContent)).style.display !== 'none');
  note(!(await vis()), 'unutar trazene parcele: dugme sakriveno');
  for (let i = 0; i < 4; i++) { await ctx.setGeolocation({ latitude: 44.72940, longitude: 18.0807, accuracy: 3 }); await p.waitForTimeout(1300); }
  note(await vis(), 'izvan trazene parcele (na drugoj): dugme vidljivo');
  await p.screenshot({ path: 'det-btn.png' });
  await p.click('#kgrs .actions .chip-btn >> text=Detalji'); await p.waitForTimeout(1500);
  note(/812/.test((await detail(p)) || ''), 'klik na Detalji ovdje otvara podatke: ' + ((await detail(p)) || '').slice(0, 60));
  await p.click('#kgrs .detail .chip-btn.x'); note(!(await detail(p)), 'zatvaranje kartice'); await ctx.close(); }

console.log('3) STRELICA PRAVCA');
{ const { ctx, p } = await fresh(); await p.click('#kgrs .go'); await p.waitForTimeout(1400);
  const rot = () => p.evaluate(() => { const el = document.querySelector('.kgrs-me-dir'); const m = el && /rotate\(([-\d.]+)deg\)/.exec(el.style.transform); return document.querySelector('.kgrs-me.has-dir') && m ? +m[1] : null; });
  note((await rot()) === null, 'bez orijentacije nema strelice');
  const feed = (alpha) => p.evaluate((a) => { clearInterval(window.__f); window.__f = setInterval(() => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { alpha: a, beta: 0, gamma: 0, absolute: true }); window.dispatchEvent(e); }, 33); }, alpha);
  await feed(90); await p.waitForTimeout(1200); const r1 = await rot(); note(r1 !== null && Math.abs(angd(r1, 270)) < 5, `kompas alpha=90 -> kurs ~270 (dobijeno ${r1 && r1.toFixed(0)})`);
  await feed(270); await p.waitForTimeout(1200); const r2 = await rot(); note(r2 !== null && Math.abs(angd(r2, 90)) < 5, `kompas alpha=270 -> kurs ~90 (dobijeno ${r2 && r2.toFixed(0)})`);
  await p.evaluate(() => clearInterval(window.__f));
  for (let i = 0; i < 6; i++) { await ctx.setGeolocation({ latitude: 44.73045 + 0.00005 * (i + 1), longitude: 18.0807, accuracy: 3 }); await p.waitForTimeout(1100); }
  const r3 = await rot(); note(r3 !== null && Math.abs(angd(r3, 0)) < 20, `kretanje prema sjeveru -> kurs ~0 (dobijeno ${r3 && r3.toFixed(0)})`);
  await p.click('#kgrs .go'); await p.waitForTimeout(400); note(await p.evaluate(() => !document.querySelector('.kgrs-me')), 'stop uklanja tacku i strelicu'); await ctx.close();
  function angd(a, b) { return ((a - b + 540) % 360) - 180; } }

console.log('4) DOKTOR SKROLA');
const cdpSwipe = async (ctx, p, dy) => { const c = await ctx.newCDPSession(p); const x = 195, y0 = dy > 0 ? 650 : 350, y1 = y0 - dy; const T = (type, y) => c.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x, y }] });
  await T('touchStart', y0); for (let i = 1; i <= 10; i++) { await T('touchMove', y0 + (y1 - y0) * i / 10); await p.waitForTimeout(16); } await T('touchEnd', y1); await p.waitForTimeout(700); await c.detach(); };
for (const [name, breakIt, expectRe] of [
  ['touch-action:none na stranici', () => { const s = document.createElement('style'); s.id = 'brk'; s.textContent = '#d_all,#d_all *{touch-action:none!important}'; document.head.appendChild(s); }, /touch-action:none|popravljeno/i],
  ['providni sloj preko sredine ekrana', () => { document.body.insertAdjacentHTML('beforeend', '<div id="ghost" style="position:fixed;left:35%;top:72%;width:30%;height:10%;z-index:99999;background:transparent"></div>'); }, /sloj preko stranice/i]]) {
  const { ctx, p } = await fresh('ekatastar-close.html');
  await p.click('#kgrs .top .rb'); await p.waitForTimeout(1500);
  await p.evaluate(() => document.getElementById('d_all').scrollTo(0, 400));
  await p.evaluate(breakIt); await p.waitForTimeout(300);
  const top = () => p.evaluate(() => document.getElementById('d_all').scrollTop);
  const t0 = await top(); await cdpSwipe(ctx, p, 200); await cdpSwipe(ctx, p, 200); await cdpSwipe(ctx, p, 200); await p.waitForTimeout(600);
  const toast = await p.evaluate(() => { const t = document.getElementById('kgrs-toast'); return t && t.classList.contains('on') ? t.innerText : null; });
  note(!!toast && expectRe.test(toast), `${name}: doktor javio -> ${toast ? toast.slice(0, 110) : 'nista'}`);
  await p.evaluate(() => document.getElementById('d_all').scrollTo(0, 300)); await p.waitForTimeout(200);
  const t1 = await top(); await cdpSwipe(ctx, p, 200); const t2 = await top(); await cdpSwipe(ctx, p, -200); const t3 = await top();
  note(t2 !== t1 || t3 !== t2, `${name}: nakon popravke skrol radi (${t0} -> ${t1} -> ${t2} -> ${t3})`); await ctx.close(); }

console.log('\nUKUPNO PROBLEMA:', fails.length); fails.forEach(f => console.log(' -', f));
await b.close(); srv.close();
