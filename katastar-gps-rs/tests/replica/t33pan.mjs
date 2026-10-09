import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8163);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const PNG = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64');
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } });
const p = await ctx.newPage(); p.on('pageerror', e => console.log('ERR', e.message));
await p.route(/\/wms\?/, r => r.fulfill({ status: 200, contentType: 'image/png', body: PNG }));
await p.goto('http://localhost:8163/ekatastar-wms.html'); await p.addScriptTag({ path: USER }); await p.waitForTimeout(800);
await p.click('#kgrs-mapbtn'); await p.waitForTimeout(3000);
const cdp = await ctx.newCDPSession(p);
const ctr = () => p.evaluate(() => map.getView().getCenter().map(Math.round));
const drag = async (x0, y0, x1, y1) => { const pt = (x, y) => [{ x, y }];
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchStart', touchPoints: pt(x0, y0) });
  for (let i = 1; i <= 10; i++) await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: pt(x0 + (x1 - x0) * i / 10, y0 + (y1 - y0) * i / 10) });
  await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] }); await p.waitForTimeout(600); };
for (const [n, a] of [['sredina', [200, 300, 100, 250]], ['preko hinta/vrha', [200, 120, 100, 200]], ['preko sheet-a', [200, 700, 100, 600]]]) {
  const c0 = await ctr(); await drag(...a); const c1 = await ctr(); console.log(n, 'prije', c0, 'poslije', c1, Math.hypot(c1[0]-c0[0], c1[1]-c0[1]) > 3 ? 'PAN OK' : 'NEMA PANA'); }
console.log(await p.evaluate(() => ({ inter: map.getInteractions().getArray().map(i => i.constructor.name + ':' + i.getActive()), ta: getComputedStyle(document.querySelector('#kgrsmap .ol-viewport')).touchAction, f: typeof follow !== 'undefined' })));
await b.close(); srv.close();
