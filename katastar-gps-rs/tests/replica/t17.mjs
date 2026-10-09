import { chromium } from 'playwright-core'; import http from 'http'; import fs from 'fs';
const types={'.js':'text/javascript','.css':'text/css','.html':'text/html'};
const srv = http.createServer((q, r) => { let u=decodeURIComponent(q.url.split('?')[0]); const f='.'+u; try { const e=f.slice(f.lastIndexOf('.')); r.setHeader('content-type',types[e]||'application/octet-stream'); r.end(fs.readFileSync(f)); } catch { r.statusCode = 404; r.end(); } }).listen(8115);
const b = await chromium.launch({ ...(process.env.PW_CHROMIUM ? { executablePath: process.env.PW_CHROMIUM } : {}), args: ['--no-sandbox'] });
const mk = () => b.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true, permissions: ['geolocation'], geolocation: { latitude: 44.73045, longitude: 18.0807, accuracy: 4 } });
const USER = new URL('../../userscript/katastar-gps-rs.user.js', import.meta.url).pathname;
const top = (p) => p.evaluate(() => { const e = document.elementFromPoint(195, 420); const da = document.getElementById('d_all'); return e ? (da.contains(e) ? 'sadrzaj' : (e.id || e.className || e.tagName).toString().slice(0, 40)) : null; });
const RC = `<div id="rcw" style="visibility:visible;position:absolute;top:900px;left:0;width:100%;height:100%;z-index:2000000000"><div style="position:fixed;top:0;left:0;width:100%;height:100%;background:#fff;opacity:.5"></div><div style="position:absolute;top:80px;left:350px;width:400px;height:580px"><div style="width:400px;height:580px"><iframe src="/recaptcha/api2/bframe" width="400" height="580"></iframe></div></div></div>`;
// --- reCAPTCHA: razliciti nacini na koje njihov kod zatvara izazov ---
for (const [name, close] of [['display:none', w => w.style.display = 'none'], ['visibility:hidden', w => w.style.visibility = 'hidden'], ['opacity:0', w => w.style.opacity = '0'], ['top:-10000px', w => { w.style.top = '-10000px'; w.style.left = '-10000px'; }]]) {
  const ctx = await mk(); const p = await ctx.newPage();
  await p.goto('http://localhost:8115/ekatastar.html'); await p.addScriptTag({ path: USER }); await p.waitForTimeout(600);
  await p.evaluate((h) => document.body.insertAdjacentHTML('beforeend', h), RC); await p.waitForTimeout(900);
  const opened = await p.evaluate(() => document.getElementById('rcw').classList.contains('kgrs-rc-wrap'));
  await p.evaluate(`(${close.toString()})(document.getElementById('rcw'))`); await p.waitForTimeout(1000);
  console.log(`reCAPTCHA zatvoren preko ${name}:`, 'bio otvoren u nasem rasporedu:', opened, '| nasa klasa ostala:', await p.evaluate(() => document.getElementById('rcw').classList.contains('kgrs-rc-wrap')), '| ispod dodira:', await top(p));
  await ctx.close();
}
// --- providni sloj koji ostane nakon zatvaranja mape ---
{
  const ctx = await mk(); const p = await ctx.newPage();
  await p.goto('http://localhost:8115/ekatastar-close.html'); await p.addScriptTag({ path: USER }); await p.waitForTimeout(600);
  await p.evaluate(() => document.querySelector('button[onclick*="jumpTo"]').scrollIntoView({ block: 'center' }));
  await p.click('button[onclick*="jumpTo"]'); await p.waitForTimeout(900);
  await p.click('#kgrs .top .rb'); await p.waitForTimeout(200);
  await p.evaluate(() => document.body.insertAdjacentHTML('beforeend', '<div id="ghost" class="ui dimmer" style="position:fixed;inset:0;z-index:99999;background:transparent"></div>'));
  console.log('blokiran odmah nakon zatvaranja:', await top(p));
  await p.waitForTimeout(4200);
  const res = await p.evaluate(() => { const da = document.getElementById('d_all'); const y0 = da.scrollTop; da.scrollTo(0, y0 - 120); return { top: null, scrolled: da.scrollTop !== y0 }; });
  console.log('nakon ~4 s: ispod dodira:', await top(p), '| skrol radi:', res.scrolled);
  await ctx.close();
}
await b.close(); srv.close();
