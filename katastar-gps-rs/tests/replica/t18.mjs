import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8121);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
const p = await ctx.newPage();
await p.goto('http://localhost:8121/ekatastar-hostile.html');
const col = () => p.evaluate(() => [...document.querySelectorAll('.ui.pointing.menu .item')].map(i => i.textContent.trim() + ': ' + getComputedStyle(i).backgroundColor + ' / ' + getComputedStyle(i).color + (i.classList.contains('active') ? ' [aktivan]' : '')));
console.log('BEZ skripte (neprijateljski CSS):', await col());
await p.addScriptTag({ path: new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname }); await p.waitForTimeout(900);
console.log('SA skriptom:', await col());
await p.screenshot({ path: 'tab-hostile.png', clip: { x: 0, y: 150, width: 390, height: 140 } });
// prebacivanje taba (njihov kod mijenja klase) -> boje moraju pratiti
await p.evaluate(() => { const [a, c] = document.querySelectorAll('.ui.pointing.menu .item'); a.classList.remove('active'); c.classList.add('active'); });
await p.click('.ui.pointing.menu .item >> nth=1'); await p.waitForTimeout(500);
console.log('nakon prebacivanja:', await col());
await b.close(); srv.close();
