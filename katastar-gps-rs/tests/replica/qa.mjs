import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8120);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const mk = (w = 390, h = 844, geo = true) => b.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, ...(geo ? { permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } } : {}) });
const fails = []; const note = (ok, msg) => { if (!ok) fails.push(msg); console.log(ok ? '  ok  ' : '  FAIL', msg); };
const open = async (ctx, page, user = true) => { const p = await ctx.newPage(); p.errs = []; p.on('pageerror', e => p.errs.push(e.message)); await p.goto('http://localhost:8120/' + page); if (user) await p.addScriptTag({ path: USER }); await p.waitForTimeout(700); return p; };

console.log('A) STRANICE I RASPORED (4 velicine x 7 stranica)');
for (const [w, h] of [[320,568],[360,640],[390,844],[412,915]]) {
  for (const page of ['ekatastar.html','ekatastar-addr.html','ekatastar-err.html','ekatastar-empty.html','ekatastar-long.html','ekatastar-multi.html','ekatastar-dd.html']) {
    const ctx = await mk(w, h); const p = await open(ctx, page);
    const r = await p.evaluate(() => { const da = document.getElementById('d_all'); const vw = innerWidth;
      const wide = [...da.querySelectorAll('*')].filter(e => { if (!e.getClientRects().length) return false; const r = e.getBoundingClientRect(); return r.right > vw + 1 && !e.closest('.ui.dropdown .menu'); }).slice(0, 3).map(e => (e.id || e.className || e.tagName).toString().slice(0, 30) + ':' + Math.round(e.getBoundingClientRect().right));
      return { hx: da.scrollWidth - da.clientWidth, docGrow: document.scrollingElement.scrollHeight - innerHeight, wide, heights: da.scrollHeight }; });
    const ok = r.hx <= 0 && r.docGrow <= 0 && r.wide.length === 0 && p.errs.length === 0;
    note(ok, `${page} ${w}x${h} ${ok ? '' : JSON.stringify({ ...r, errs: p.errs })}`);
    if (w === 390) { await p.screenshot({ path: `qa-${page.replace('.html','')}.png` }); }
    await ctx.close();
  }
}

console.log('A2) AKTIVNI TAB');
for (const page of ['ekatastar.html','ekatastar-addr.html']) { const ctx = await mk(); const p = await open(ctx, page);
  const c = await p.evaluate(() => { const a = document.querySelector('.ui.pointing.menu .active.item'); const cs = getComputedStyle(a); return [cs.backgroundColor, cs.color]; });
  note(c[0] === 'rgb(217, 242, 68)', page + ' aktivni tab: ' + c.join(' / ')); await ctx.close(); }
console.log('B) PETLJE U DOM-u (mutacije u mirovanju)');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-multi.html');
  const n = await p.evaluate(() => new Promise(res => { let c = 0; const mo = new MutationObserver(m => { c += m.length; }); mo.observe(document.body, { childList: true, subtree: true }); setTimeout(() => { mo.disconnect(); res(c); }, 3000); }));
  note(n < 3, 'mutacija u 3 s mirovanja: ' + n); await ctx.close(); }

console.log('C) 5 CIKLUSA OTVORI/ZATVORI MAPU');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-close.html');
  const base = await p.evaluate(() => map.getLayers().getArray().length);
  for (let i = 0; i < 5; i++) {
    await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' }));
    await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(800);
    if (i % 2 === 0) { await p.click('#kgrs .go'); await p.waitForTimeout(500); }
    await p.click('#kgrs .top .rb'); await p.waitForTimeout(1100);
  }
  await p.waitForTimeout(3600);
  const st = await p.evaluate(() => ({ layers: map.getLayers().getArray().length, kmap: document.querySelectorAll('#kgrsmap').length, roots: document.querySelectorAll('#kgrs').length, left: document.querySelectorAll('.kgrs-rc-wrap,.kgrs-force-hide').length, target: map.getTargetElement().id, on: document.getElementById('kgrs').classList.contains('on'), modal: document.getElementById('mm').classList.contains('show'), scroll: (() => { const d = document.getElementById('d_all'); const y = d.scrollTop; d.scrollTo(0, 0); const a = d.scrollTop; d.scrollTo(0, 150); return d.scrollTop !== a; })() }));
  note(st.layers === base && st.kmap === 0 && st.roots === 1 && st.left === 0 && st.target === 'mapdiv' && !st.on && !st.modal && st.scroll, 'nakon 5 ciklusa ' + JSON.stringify({ base, ...st }) + ' greske:' + p.errs.length);
  await ctx.close(); }

console.log('D) MAPA: KONTROLE');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-close.html');
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' }));
  await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900);
  const z0 = await p.evaluate(() => map.getView().getZoom());
  await p.click('#kgrs .rail .rb:nth-child(2)'); await p.waitForTimeout(400); const z1 = await p.evaluate(() => map.getView().getZoom());
  await p.click('#kgrs .rail .rb:nth-child(3)'); await p.waitForTimeout(400); const z2 = await p.evaluate(() => map.getView().getZoom());
  note(Math.abs(z1 - z0 - 1) < 0.05 && Math.abs(z2 - z0) < 0.05, `zoom + / - (${z0.toFixed(1)} -> ${z1.toFixed(1)} -> ${z2.toFixed(1)})`);
  await p.click('#kgrs .go'); await p.waitForTimeout(1500);
  note(await p.evaluate(() => document.querySelector('#kgrs .go').classList.contains('run')), 'GPS start -> zeleno (run)');
  // drag mape prekida pracenje, dugme centriraj vraca
  await p.mouse.move(195, 300); await p.mouse.down(); await p.mouse.move(120, 380, { steps: 6 }); await p.mouse.up(); await p.waitForTimeout(400);
  const c1 = await p.evaluate(() => map.getView().getCenter());
  const op = await p.evaluate(() => document.querySelector('#kgrs .top .rb:last-child').style.opacity);
  await p.click('#kgrs .top .rb:last-child'); await p.waitForTimeout(500);
  const c2 = await p.evaluate(() => map.getView().getCenter());
  note(op === '1' && Math.hypot(c2[0] - c1[0], c2[1] - c1[1]) > 3, 'drag prekida pracenje, centriraj vraca (pomak ' + Math.round(Math.hypot(c2[0] - c1[0], c2[1] - c1[1])) + ' m)');
  // sklapanje panela i vlasnici
  await p.click('#kgrs .handle'); const mini = await p.evaluate(() => document.querySelector('#kgrs .sheet').classList.contains('mini')); await p.click('#kgrs .handle');
  await p.click('#kgrs .owners-toggle'); const own = await p.evaluate(() => getComputedStyle(document.querySelector('#kgrs ul.owners')).display);
  note(mini && own === 'block', 'handle sklapa/rasklapa, vlasnici se otvaraju');
  // podloga + linije + trajnost izbora
  await p.click('#kgrs .rail .rb:nth-child(1)'); await p.click('#kgrs .lrow.radio >> nth=1'); await p.waitForTimeout(300);
  await p.click('#kgrs .lrow >> nth=-1', { trial: true }).catch(() => {});
  const bk = await p.evaluate(() => localStorage.getItem('kgrs.base.v1'));
  await p.click('#kgrs .top .rb'); await p.waitForTimeout(1200);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').click()); await p.waitForTimeout(900);
  const vis = await p.evaluate(() => map.getLayers().getArray().filter(l => !l.get('title') && l.getSource().getUrls).map(l => l.getSource().getUrls()[0].slice(8, 22) + ':' + l.getVisible()).join(','));
  note(bk === '"osm"' && /tile\.openstre\w*:true/.test(vis), 'izbor podloge se pamti: ' + vis);
  await ctx.close(); }

console.log('E) GPS SCENARIJI');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-close.html');
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' }));
  await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900); await p.click('#kgrs .go'); await p.waitForTimeout(1200);
  const stt = async () => (await p.evaluate(() => document.querySelector('#kgrs .st').innerText.replace(/\n/g, ' | ')));
  const geo = async (lat, lng, acc) => { await ctx.setGeolocation({ latitude: lat, longitude: lng, accuracy: acc }); await p.waitForTimeout(1500); };
  note(/UNUTAR/.test(await stt()), 'unutar: ' + await stt());
  // pomjeri izvan parcele (juzno ~60 m), vise puta da Kalman stigne
  for (let i = 0; i < 4; i++) await geo(44.72940, 18.0807, 3);
  note(/IZVAN/.test(await stt()), 'izvan: ' + await stt());
  for (let i = 0; i < 4; i++) await geo(44.72999, 18.0807, 6);
  note(/Na međi|IZVAN|UNUTAR/.test(await stt()), 'uz medju (sirok GPS): ' + await stt());
  await geo(44.73045, 18.0807, 95); note(await p.evaluate(() => /GPS ±/.test(document.querySelector('#kgrs .pill').innerText)), 'lose mjerenje (±95 m) ne rusi prikaz: ' + await p.evaluate(() => document.querySelector('#kgrs .pill').innerText));
  await p.click('#kgrs .go'); await p.waitForTimeout(400);
  note(await p.evaluate(() => /isključen/.test(document.querySelector('#kgrs .pill').innerText) && !document.querySelector('#kgrs .go').classList.contains('run')), 'stop vraca na "GPS iskljucen"');
  await ctx.close();
  // odbijena dozvola
  const c2 = await mk(390, 844, false); const q = await open(c2, 'ekatastar-close.html');
  await q.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await q.click('button[onclick*="jumpTo"]'); await q.waitForTimeout(900); await q.click('#kgrs .go'); await q.waitForTimeout(21500);
  note(await q.evaluate(() => /Nema signala|greška/.test(document.querySelector('#kgrs .pill').innerText) && document.querySelector('#kgrs .hint').classList.contains('on')), 'bez GPS-a/dozvole nakon 20 s: pill = ' + await q.evaluate(() => document.querySelector('#kgrs .pill').innerText));
  await c2.close(); }

console.log('F) ROTACIJA ZA VRIJEME MAPE');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-close.html');
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900);
  await p.setViewportSize({ width: 844, height: 390 }); await p.waitForTimeout(800);
  const sz = await p.evaluate(() => { const c = map.getTargetElement().querySelector('canvas').getBoundingClientRect(); return [Math.round(c.width), Math.round(c.height), innerWidth, innerHeight]; });
  note(sz[0] === sz[2] && sz[1] === sz[3], 'mapa prati rotaciju: ' + JSON.stringify(sz)); await p.screenshot({ path: 'qa-landscape.png' }); await ctx.close(); }

console.log('G) LATINICA -> CIRILICA (obje pretrage, brisanje)');
{ const ctx = await mk(); const p = await open(ctx, 'ekatastar-addr.html');
  const inp = p.locator('.ui.tab.active .ui.search.dropdown input.search').first(); await inp.click();
  await p.keyboard.type('Doboj'); const a = await inp.inputValue(); await p.keyboard.press('Backspace'); await p.keyboard.press('Backspace'); const bsp = await inp.inputValue();
  await inp.fill(''); await p.keyboard.type('Дрин'); const cyr = await inp.inputValue(); await p.keyboard.type('ić'); const mixed = await inp.inputValue();
  note(a === 'Добој' && bsp === 'Доб' && cyr === 'Дрин' && mixed === 'Дринић', `${a} / ${bsp} / ${cyr} / ${mixed}`);
  const kb = p.locator('#i_kb'); await kb.fill(''); await kb.type('14/a'); note(await kb.inputValue() === '14/a', 'kucni broj nije dirnut: ' + await kb.inputValue());
  await ctx.close(); }

console.log('\nUKUPNO PROBLEMA:', fails.length); fails.forEach(f => console.log(' -', f));
await b.close(); srv.close();
