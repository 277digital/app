import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8143);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const fails = []; const note = (ok, msg) => { if (!ok) fails.push(msg); console.log(ok ? '  ok  ' : '  FAIL', msg); };
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const mkctx = () => b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } });
const fresh = async (page) => { const ctx = await mkctx(); const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message));
  await p.route(/\/wms\?/, r => { const u = new URL(r.request().url()); if (u.searchParams.get('REQUEST') !== 'GetFeatureInfo') return r.fulfill({ status: 200, contentType: 'image/png', body: PNG }); return r.fulfill({ status: 200, contentType: 'text/plain', body: '' }); });
  await p.goto('http://localhost:8143/' + page); await p.addScriptTag({ path: USER }); await p.waitForTimeout(700);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900); return { ctx, p }; };
const detail = (p) => p.evaluate(() => { const d = document.querySelector('#kgrs .detail'); return d.classList.contains('on') ? d.innerText.replace(/\n+/g, ' | ') : null; });

console.log('1) NJIHOV TOOLTIP KAO IZVOR (GetFeatureInfo prazan)');
{ const { ctx, p } = await fresh('ekatastar-ovl.html?tip'); await p.mouse.click(120, 300); await p.waitForTimeout(3500);
  const d = await detail(p); note(!!d && /Parcela 6452/.test(d) && /812/.test(d) && /Lipac|Липац/.test(d), 'kartica iz njihovog tooltipa: ' + (d || 'nema'));
  note(await p.evaluate(() => map.getOverlays().getArray().filter(o => !o.getElement().classList.contains('kgrs-me')).every(o => o.getElement().style.visibility === 'hidden')), 'njihov tooltip se sakriva nakon sto je procitan (nasa tacka ostaje)');
  await p.screenshot({ path: 'tip-card.png' }); await p.mouse.click(300, 250); await p.waitForTimeout(1800);
  note(true, 'drugi dodir radi ponovo (' + ((await detail(p)) || '').slice(0, 40) + ')');
  note(p.errs.length === 0, 'bez JS gresaka ' + p.errs.join(';')); await ctx.close(); }

console.log('2) NISTA NE STIZE: dijagnostika u kartici');
{ const { ctx, p } = await fresh('ekatastar-ovl.html'); await p.mouse.click(120, 300); await p.waitForTimeout(9000);
  const d = await detail(p); note(!!d && /Sajt ne vraća/.test(d) && /slojeva za upit: 1/.test(d) && /tooltip/.test(d), 'prazno stanje + dijagnostika: ' + (d || 'nema').slice(0, 230)); await p.screenshot({ path: 'tip-empty.png' }); await ctx.close(); }

console.log('3) BLOKER UNUTAR STRANICE (fixed sloj u #d_all)');
const swipe = async (ctx, p, y0, y1) => { const c = await ctx.newCDPSession(p); const T = (type, y) => c.send('Input.dispatchTouchEvent', { type, touchPoints: type === 'touchEnd' ? [] : [{ x: 195, y }] }); await T('touchStart', y0); for (let i = 1; i <= 10; i++) { await T('touchMove', y0 + (y1 - y0) * i / 10); await p.waitForTimeout(16); } await T('touchEnd', y1); await p.waitForTimeout(700); await c.detach(); };
for (const [name, html, delayMs, doctor] of [
  ['puni providni dimmer unutar #d_all (hvata unfreeze)', '<div class="ui dimmer modals page active" style="position:fixed;inset:0;background:transparent"></div>', 0, false],
  ['manji fixed sloj unutar #d_all na mjestu dodira (hvata doktor)', '<div id="gh" style="position:fixed;left:15%;top:40%;width:70%;height:40%;background:transparent"></div>', 9000, true]]) {
  const { ctx, p } = await fresh('ekatastar-close.html'); await p.click('#kgrs .top .rb'); await p.waitForTimeout(800);
  await p.evaluate((h) => document.getElementById('d_all').insertAdjacentHTML('beforeend', h), html);
  if (!doctor) { await p.waitForTimeout(8000); }   // unfreeze se vrti na 1.7 s, 3.5 s i 7 s nakon zatvaranja
  await p.evaluate(() => document.getElementById('d_all').scrollTo(0, 300)); await p.waitForTimeout(200);
  const top = () => p.evaluate(() => document.getElementById('d_all').scrollTop); const t0 = await top();
  await swipe(ctx, p, 650, 450); await swipe(ctx, p, 650, 450); await swipe(ctx, p, 650, 450);
  const toast = await p.evaluate(() => { const t = document.getElementById('kgrs-toast'); return t && t.classList.contains('on') ? t.innerText.slice(0, 90) : null; });
  await p.evaluate(() => document.getElementById('d_all').scrollTo(0, 300)); await p.waitForTimeout(200); const t1 = await top(); await swipe(ctx, p, 650, 450); const t2 = await top();
  note(t2 > t1, `${name}: skrol radi (${t0} -> ${t1} -> ${t2})${toast ? ' | poruka: ' + toast : ''}`); await ctx.close(); }

console.log('\nUKUPNO PROBLEMA:', fails.length); fails.forEach(f => console.log(' -', f));
await b.close(); srv.close();
