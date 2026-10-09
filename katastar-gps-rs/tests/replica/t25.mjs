import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8141);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const png = (c) => Buffer.from(c, 'base64');
for (const mode of ['icon', 'triangle', 'nostyle']) {
  const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 3, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } });
  const p = await ctx.newPage(); const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8141/ekatastar-close.html');
  if (mode !== 'icon') await p.evaluate((m) => { delete ol.style.Icon; if (m === 'nostyle') delete ol.style.RegularShape; }, mode);
  await p.addScriptTag({ path: new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' })); await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900);
  await p.click('#kgrs .go'); await p.waitForTimeout(1300);
  for (let i = 0; i < 12; i++) { await p.evaluate(() => { const e = new Event('deviceorientationabsolute'); Object.assign(e, { alpha: 315, beta: 0, gamma: 0, absolute: true }); window.dispatchEvent(e); }); await p.waitForTimeout(140); }
  await p.waitForTimeout(600);
  const feats = await p.evaluate(() => { const l = map.getLayers().getArray().find(l => l.getZIndex() === 9999); return l.getSource().getFeatures().map(f => f.get('k') + (f.get('rot') != null ? ':' + Math.round(f.get('rot')) : '')).join(','); });
  console.log(mode, '| greske:', errs.length, errs[0] || '', '| elementi:', feats);
  await p.screenshot({ path: `arrow-${mode}.png`, clip: { x: 105, y: 340, width: 180, height: 170 } }); await ctx.close();
}
await b.close(); srv.close();
