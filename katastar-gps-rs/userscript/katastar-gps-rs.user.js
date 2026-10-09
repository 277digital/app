// ==UserScript==
// @name         Katastar GPS RS
// @namespace    https://github.com/277digital
// @version      0.2.0
// @description  Moderan izgled ekatastar.rgurs.org + GPS uživo na mapi (panel parcele, vlasnici, kalibracija)
// @match        https://ekatastar.rgurs.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
// Radi i kad se zalijepi u konzolu. Captchu i pretragu rješava korisnik; skripta samo mijenja
// izgled stranice i crta GPS poziciju na mapi koju je korisnik već otvorio ("Прикажи на мапи").
(function () {
  if (window.__kgrs2) return;
  window.__kgrs2 = true;

  /* ------------------------------------------------------------------ */
  /* 1. TEMA (CSS)                                                       */
  /* ------------------------------------------------------------------ */
  const CSS = `
:root{--bg:#101114;--s1:#1a1b21;--s2:#23252d;--line:#2e3039;--fg:#f2f3f5;--mut:#9aa0ac;--acc:#d9f244;--accfg:#141507;--bad:#ff6b5e;--ok:#58e08a;--warn:#ffb84d;--r:18px}
html{color-scheme:dark}
html,body{background:var(--bg)!important;color:var(--fg)!important;overflow-x:hidden!important;max-width:100vw!important;margin:0!important}
body,#d_all,.ui,.ui.form,.ui.input input,.ui.dropdown{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important}
#d_all{height:auto!important;min-height:100vh;overflow-x:hidden!important;overflow-y:auto!important;background:var(--bg)!important}
*{-webkit-tap-highlight-color:transparent}
#wrapper,#content_m,.maincol,.items-row,.item,.ui.container{width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important;float:none!important;box-sizing:border-box!important;background:transparent!important}
.items-row{padding:0 16px!important}
.items-row+.items-row{margin-top:6px!important}
#header{background:linear-gradient(180deg,#1b1e12,var(--bg))!important;height:auto!important;padding:calc(14px + env(safe-area-inset-top)) 16px 12px!important;border:0!important;text-align:center}
#headerlogo{display:inline-block;background:#fff;border-radius:14px;padding:8px 14px;max-width:calc(100% - 8px);box-sizing:border-box}
#headerlogo img{display:block;max-width:100%;height:auto;max-height:46px}
#content_m h2{color:var(--fg)!important;font-size:22px!important;line-height:1.2;letter-spacing:-.01em;margin:14px 0 6px!important}
#content_m h2 span,#content_m h2 strong{font-size:inherit!important}
#content_m .item p,#content_m .item p span{color:var(--mut)!important;font-size:13px!important;text-align:left!important;line-height:1.45}
table{max-width:100%!important}
/* prijava */
#login{background:var(--s1)!important;color:var(--fg)!important;border-radius:999px!important;box-shadow:none!important;border:1px solid var(--line)!important;font-weight:600}
td[style*="text-align: right"],td[style*="text-align:right"]{padding:6px 0 0!important}
/* tabovi */
.ui.pointing.menu{display:flex!important;width:100%!important;background:var(--s1)!important;border:0!important;border-radius:16px!important;padding:4px!important;box-shadow:none!important;margin:8px 0 14px!important;min-height:0!important}
.ui.pointing.menu .item{flex:1!important;justify-content:center!important;color:var(--mut)!important;font-weight:600!important;border-radius:12px!important;padding:13px 8px!important;margin:0!important;border:0!important;background:transparent!important}
.ui.pointing.menu .item:before,.ui.pointing.menu .item:after{display:none!important}
.ui.pointing.menu .active.item{background:var(--acc)!important;color:var(--accfg)!important}
.ui.tab.segment,.ui.attached.tab.segment{background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0!important}
/* forma */
.ui.form{width:100%!important;max-width:100%!important}
.ui.form .field{width:100%!important;max-width:100%!important;margin:0 0 14px!important}
.ui.form .field>label{color:var(--mut)!important;font-size:11px!important;font-weight:700!important;letter-spacing:.09em;text-transform:uppercase;margin-bottom:6px!important}
.ui.form input[type=text],.ui.input input,.ui.form input{background:var(--s1)!important;color:var(--fg)!important;border:1px solid var(--line)!important;border-radius:14px!important;min-height:52px;font-size:16px!important;padding:0 16px!important;box-shadow:none!important;width:100%!important}
.ui.form input:focus,.ui.input input:focus{border-color:var(--acc)!important;box-shadow:0 0 0 3px rgba(217,242,68,.18)!important}
.ui.input{width:100%!important}
.ui.selection.dropdown{background:var(--s1)!important;color:var(--fg)!important;border:1px solid var(--line)!important;border-radius:14px!important;min-height:52px!important;padding:16px 38px 16px 16px!important;box-shadow:none!important;width:100%!important;min-width:0!important}
.ui.selection.dropdown>.search{padding:16px!important;min-height:0!important;border:0!important;background:transparent!important}
.ui.dropdown .text,.ui.dropdown>.text{color:var(--fg)!important}
.ui.dropdown>.dropdown.icon{color:var(--mut)!important;padding-top:17px!important}
.ui.dropdown .menu{background:var(--s2)!important;border:1px solid var(--line)!important;border-radius:14px!important;box-shadow:0 12px 32px #000a!important;max-height:42vh!important;overflow-x:hidden!important}
.ui.dropdown .menu>.item{color:var(--fg)!important;border-top:1px solid var(--line)!important;padding:14px 16px!important;font-size:16px!important}
.ui.dropdown .menu>.item:hover,.ui.dropdown .menu>.selected.item{background:rgba(217,242,68,.1)!important;color:var(--acc)!important}
.ui.dropdown>select{display:none!important}
/* poruke */
.ui.message.kgrs-hide{display:none!important}
.ui.message{background:var(--s1)!important;color:var(--mut)!important;border-radius:14px!important;box-shadow:none!important;border:1px solid var(--line)!important;font-size:13px!important}
.ui.message .header{color:var(--fg)!important}
.ui.error.message{background:rgba(255,107,94,.12)!important;border-color:rgba(255,107,94,.4)!important;color:#ffc4be!important}
/* captcha */
#ReCaptchContainer1,#ReCaptchContainer2{max-width:100%;overflow:hidden}
/* dugmad */
.ui.blue.button,.ui.blue.buttons .button{background:var(--acc)!important;color:var(--accfg)!important;border-radius:16px!important;font-weight:800!important;min-height:56px;font-size:17px!important;box-shadow:0 6px 24px rgba(217,242,68,.25)!important}
.ui.button.disabled,.ui.disabled.button{opacity:.35!important;box-shadow:none!important}
.ui.button{border-radius:14px!important;box-shadow:none!important}
.ui.basic.button,.ui.button:not(.blue):not(.kgrs-btn){background:var(--s2)!important;color:var(--fg)!important}
/* rezultati */
#d_info{margin:18px 0 28px}
#d_info .ui.blue.segment{background:var(--s1)!important;border:1px solid var(--line)!important;border-radius:var(--r) var(--r) 0 0!important;box-shadow:none!important;color:var(--mut)!important;font-size:12px!important;padding:12px 16px!important;margin:0!important;gap:8px;flex-wrap:wrap}
#d_info .ui.blue.segment b{color:var(--fg)}
#d_info .ui.attached.message{background:var(--s1)!important;border:0!important;border-left:1px solid var(--line)!important;border-right:1px solid var(--line)!important;border-radius:0!important;margin:0!important;padding:8px 16px!important;color:var(--mut)!important;font-size:13px!important}
#d_info .ui.attached.message b{color:var(--fg)!important}
#d_info .ui.mini.attached.message{padding:16px 16px 6px!important;background:var(--s1)!important}
#d_info .ui.mini.attached.message .header{color:var(--acc)!important;font-size:11px!important;font-weight:800;letter-spacing:.1em;text-transform:uppercase}
#d_info table{display:block!important;width:100%!important;table-layout:auto!important;background:var(--s1)!important;border:0!important;border-left:1px solid var(--line)!important;border-right:1px solid var(--line)!important;border-radius:0!important;color:var(--fg)!important;margin:0!important;box-shadow:none!important}
#d_info thead{display:none!important}
#d_info tbody{display:block!important}
#d_info tr{display:block!important;border:0!important}
#d_info td{display:block!important;border:0!important;padding:0!important;color:var(--fg)!important;background:transparent!important;text-align:left!important;width:auto!important}
#d_info sup{font-size:.7em}
#d_info table[id^=parc_] tr{display:grid!important;grid-template-columns:1fr 1fr 1.4fr;gap:8px;padding:6px 16px 16px!important}
#d_info table[id^=parc_] td:nth-child(-n+3){background:var(--s2)!important;border-radius:12px;padding:10px 12px!important;font-size:17px;font-weight:700}
#d_info table[id^=parc_] td:nth-child(-n+3):before{display:block;font-size:10px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:var(--mut);margin-bottom:2px}
#d_info table[id^=parc_] td:nth-child(1):before{content:"Парцела"}
#d_info table[id^=parc_] td:nth-child(2):before{content:"Лист"}
#d_info table[id^=parc_] td:nth-child(3):before{content:"Површина"}
#d_info table[id^=parc_] td:nth-child(5){display:none!important}
#d_info table[id^=parc_] td:nth-child(6){grid-column:1/-1;order:1}
#d_info table[id^=parc_] td:nth-child(4){grid-column:1/-1;order:2}
#d_info table[id^=parc_] td button{width:100%!important;float:none!important;margin:0!important;display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:54px;font-size:16px!important;font-weight:800!important}
#d_info table[id^=parc_] td:nth-child(6) button{background:var(--acc)!important;color:var(--accfg)!important;box-shadow:0 6px 24px rgba(217,242,68,.22)!important}
#d_info table[id^=parc_] td:nth-child(4) button{background:var(--s2)!important;color:var(--fg)!important;min-height:44px;font-weight:600!important}
#d_info table[id^=parc_] td button i.icon{margin:0!important;background:transparent!important;opacity:1!important}
#d_info table.kgrs-owners tr{display:flex!important;justify-content:space-between;gap:12px;padding:11px 16px!important;border-top:1px solid var(--line)!important}
#d_info table.kgrs-owners td:first-child{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:600}
#d_info table.kgrs-owners td:last-child{color:var(--acc)!important;font-weight:800;white-space:nowrap}
#d_info table.kgrs-parts tr{display:flex!important;flex-wrap:wrap;gap:4px 12px;padding:11px 16px!important;border-top:1px solid var(--line)!important}
#d_info table.kgrs-parts td:nth-child(1){display:none!important}
#d_info table.kgrs-parts td:nth-child(2){flex:1;font-weight:600}
#d_info table.kgrs-parts td:nth-child(3){color:var(--mut)!important}
#d_info>table:last-of-type,#d_info>table.kgrs-parts{border-radius:0 0 var(--r) var(--r)!important;border-bottom:1px solid var(--line)!important;padding-bottom:6px!important}
#d_info br{display:none}
#footer{background:transparent!important;border:0!important;padding:10px 16px calc(24px + env(safe-area-inset-bottom))!important}
#footer p{color:var(--mut)!important;font-size:12px!important;padding:0!important}
.ui.modal,.ui.dimmer{background:rgba(0,0,0,.6)!important}
.ui.modal>.header,.ui.modal>.content,.ui.modal>.actions{background:var(--s1)!important;color:var(--fg)!important}
`;

  /* ------------------------------------------------------------------ */
  /* 2. CSS ZA PREKRIVAC NA MAPI                                         */
  /* ------------------------------------------------------------------ */
  const UI_CSS = `
#kgrs{position:fixed;inset:0;z-index:2147483000;pointer-events:none;font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif;color:#f2f3f5;display:none}
#kgrs.on{display:block}
#kgrs *{box-sizing:border-box}
#kgrs button{font:inherit;color:inherit;border:0;cursor:pointer;pointer-events:auto;-webkit-tap-highlight-color:transparent}
#kgrs .glass{background:rgba(22,23,28,.92);-webkit-backdrop-filter:blur(16px);backdrop-filter:blur(16px);border:1px solid rgba(255,255,255,.08);box-shadow:0 8px 30px rgba(0,0,0,.45)}
#kgrs .top{position:absolute;left:12px;right:12px;top:calc(10px + env(safe-area-inset-top));display:flex;gap:10px;align-items:center}
#kgrs .rb{width:46px;height:46px;border-radius:50%;display:grid;place-items:center;font-size:20px;flex:none}
#kgrs .pill{flex:1;min-width:0;height:46px;border-radius:999px;display:flex;align-items:center;gap:10px;padding:0 16px;font-weight:700;font-size:14px;white-space:nowrap;overflow:hidden}
#kgrs .pill .dot{width:10px;height:10px;border-radius:50%;background:#9aa0ac;flex:none}
#kgrs .pill.ok .dot{background:#58e08a;box-shadow:0 0 0 4px rgba(88,224,138,.2)}
#kgrs .pill.warn .dot{background:#ffb84d;box-shadow:0 0 0 4px rgba(255,184,77,.2)}
#kgrs .pill.bad .dot{background:#ff6b5e;box-shadow:0 0 0 4px rgba(255,107,94,.2)}
#kgrs .pill small{color:#9aa0ac;font-weight:600;overflow:hidden;text-overflow:ellipsis}
#kgrs .hint{position:absolute;left:12px;right:12px;top:calc(68px + env(safe-area-inset-top));padding:12px 14px;border-radius:16px;font-size:14px;line-height:1.35;display:none}
#kgrs .hint.on{display:block}
#kgrs .hint b{color:#d9f244}
#kgrs .hint button{margin-top:8px;background:#23252d;border-radius:10px;padding:8px 12px;font-weight:700}
#kgrs .sheet{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));border-radius:26px;padding:6px 16px 10px;max-height:60vh;display:flex;flex-direction:column}
#kgrs .handle{align-self:center;width:100%;height:20px;background:transparent;position:relative;flex:none}
#kgrs .handle:after{content:'';position:absolute;left:50%;top:8px;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:rgba(255,255,255,.25)}
#kgrs .sheet.mini .chips,#kgrs .sheet.mini .owners-toggle,#kgrs .sheet.mini .owners-wrap,#kgrs .sheet.mini .t2{display:none}
#kgrs .sheet.mini .row1{min-height:56px}
#kgrs .row1{display:flex;gap:12px;align-items:center;padding-right:112px;min-height:74px}
#kgrs .ico{width:46px;height:46px;border-radius:50%;background:#23252d;display:grid;place-items:center;font-size:20px;flex:none}
#kgrs .t1{font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.15}
#kgrs .t2{font-size:13px;color:#9aa0ac;margin-top:2px;line-height:1.3}
#kgrs .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#kgrs .chips span{background:#23252d;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;color:#d6d9df}
#kgrs .chips span.a{background:rgba(217,242,68,.14);color:#d9f244}
#kgrs .divider{height:1px;background:rgba(255,255,255,.09);margin:8px -16px 8px}
#kgrs .row2{display:flex;align-items:center;gap:10px;padding-right:112px;min-height:70px}
#kgrs .st{flex:1;min-width:0}
#kgrs .s1{font-size:16px;font-weight:800}
#kgrs .s2{font-size:12px;color:#9aa0ac;margin-top:2px}
#kgrs .st.ok .s1{color:#58e08a}#kgrs .st.bad .s1{color:#ff6b5e}#kgrs .st.warn .s1{color:#ffb84d}
#kgrs .go{position:absolute;right:14px;top:50px;width:100px;height:100px;border-radius:50%;background:radial-gradient(circle at 50% 35%,#34363f,#1a1b20 70%);box-shadow:0 0 0 5px #121317,0 0 0 7px #2e3039,0 10px 28px rgba(0,0,0,.6);display:grid;place-items:center;align-content:center;gap:6px;font-weight:800;font-size:19px;color:#f2f3f5;transition:box-shadow .2s}
#kgrs .go i{display:block;width:26px;height:4px;border-radius:2px;background:#9aa0ac}
#kgrs .go.run{box-shadow:0 0 0 5px #121317,0 0 0 8px #d9f244,0 0 34px 6px rgba(217,242,68,.38),0 10px 28px rgba(0,0,0,.6)}
#kgrs .go.run i{background:#d9f244}
#kgrs .go.wait i{background:#ffb84d;animation:kp 1s infinite}
@keyframes kp{50%{opacity:.25}}
#kgrs .actions{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}
#kgrs .chip-btn{background:#23252d;border-radius:12px;padding:10px 14px;font-weight:700;font-size:13px;display:inline-flex;gap:6px;align-items:center}
#kgrs .chip-btn.acc{background:#d9f244;color:#141507}
#kgrs .chip-btn.x{padding:10px 12px}
#kgrs .owners-wrap{margin-top:10px;overflow:auto;-webkit-overflow-scrolling:touch}
#kgrs .owners-toggle{width:100%;display:flex;justify-content:space-between;align-items:center;background:transparent;padding:10px 2px;font-weight:700;font-size:14px;border-top:1px solid rgba(255,255,255,.09)}
#kgrs .owners-toggle span{color:#9aa0ac;font-weight:600}
#kgrs ul.owners{list-style:none;margin:0;padding:0 0 4px;display:none;pointer-events:auto}
#kgrs ul.owners.open{display:block}
#kgrs ul.owners li{display:flex;justify-content:space-between;gap:12px;padding:9px 2px;font-size:14px;border-top:1px solid rgba(255,255,255,.06)}
#kgrs ul.owners li b{color:#d9f244;white-space:nowrap}
#kgrs .none{color:#9aa0ac;font-size:13px;padding:6px 2px}
.kgrs-fs{position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;max-width:none!important;max-height:none!important;min-height:0!important;margin:0!important;padding:0!important;border:0!important;border-radius:0!important;transform:none!important;overflow:hidden!important;z-index:2147482000!important;background:#000!important}
.kgrs-fs-hide{display:none!important}
.kgrs-fs .ol-overlaycontainer-stopevent{top:72px!important;height:calc(100% - 72px)!important}
`;

  const addStyle = (id, css) => {
    if (document.getElementById(id)) return;
    const s = document.createElement('style'); s.id = id; s.textContent = css; document.head.appendChild(s);
  };

  /* ------------------------------------------------------------------ */
  /* 3. UREDJIVANJE STRANICE                                             */
  /* ------------------------------------------------------------------ */
  function prepPage() {
    if (!document.querySelector('meta[name=viewport]')) {
      const m = document.createElement('meta'); m.name = 'viewport'; m.content = 'width=device-width, initial-scale=1, viewport-fit=cover';
      document.head.appendChild(m);
    }
    addStyle('kgrs-theme', CSS);
  }
  function tidy() {
    document.querySelectorAll('.ui.message').forEach((m) => {
      if (m.querySelector('ol.ui.list')) m.classList.add('kgrs-hide');
    });
    document.querySelectorAll('#d_info .ui.mini.attached.message .header').forEach((h) => {
      const t = h.textContent.trim();
      const tbl = h.closest('.ui.message').nextElementSibling && h.closest('.ui.message').nextElementSibling.nextElementSibling;
      const table = h.closest('.ui.message').nextElementSibling;
      const tb = table && table.tagName === 'TABLE' ? table : tbl && tbl.tagName === 'TABLE' ? tbl : null;
      if (!tb) return;
      if (/^Носиоци/.test(t)) tb.classList.add('kgrs-owners');
      if (/^Дијелови/.test(t)) tb.classList.add('kgrs-parts');
    });
  }

  /* ------------------------------------------------------------------ */
  /* 4. PODACI O PARCELI IZ REZULTATA PRETRAGE                           */
  /* ------------------------------------------------------------------ */
  let parcel = null; // {broj, list, povrsina, ko, opstina, vlasnici:[[ime,udio]], dijelovi:[[naci,pov]]}
  const txt = (e) => (e ? e.textContent.replace(/\s+/g, ' ').trim() : '');

  function captureParcel(btn) {
    const tr = btn.closest('tr'); const tbl = tr && tr.closest('table');
    if (!tbl) return;
    const cells = [...tr.children].map(txt);
    const key = ((btn.getAttribute('onclick') || '').match(/jumpTo\(\s*["']([^"']+)["']/) || [])[1] || '';
    const p = { broj: cells[0] || key.split('_').pop(), list: cells[1] || '', povrsina: cells[2] || '', ko: '', opstina: '', vlasnici: [], dijelovi: [] };
    document.querySelectorAll('#d_info .ui.attached.message').forEach((m) => {
      const t = txt(m);
      if (/^Град\/општина/.test(t)) p.opstina = txt(m.querySelector('b'));
      if (/^Катастарска општина/.test(t)) p.ko = txt(m.querySelector('b'));
    });
    // sekcije ispod kliknute tabele, do sljedece parcele
    let el = tbl.nextElementSibling, section = '';
    while (el) {
      if (el.matches && el.matches('.ui.attached.message')) {
        const h = txt(el.querySelector('.header'));
        if (/^Парцела$/.test(h)) break;
        section = h;
      } else if (el.tagName === 'TABLE') {
        const rows = [...el.querySelectorAll('tbody tr')].map((r) => [...r.children].map(txt));
        if (/^Носиоци/.test(section)) p.vlasnici = rows.map((r) => [r[0], r[1] || '']);
        if (/^Дијелови/.test(section)) p.dijelovi = rows.map((r) => [r[1] || '', r[2] || '']);
      }
      el = el.nextElementSibling;
    }
    parcel = p;
    renderParcel();
  }
  document.addEventListener('click', (e) => {
    const b = e.target.closest && e.target.closest('button[onclick*="jumpTo"]');
    if (b) { try { captureParcel(b); } catch (err) { /* nije kriticno */ } }
  }, true);

  /* ------------------------------------------------------------------ */
  /* 5. GEOMETRIJA (u jedinicama mape = metri u EPSG:31276)               */
  /* ------------------------------------------------------------------ */
  const getMap = () => (window.map && typeof window.map.getView === 'function' ? window.map : null);

  function inRing(p, ring) {
    let ins = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
      const [xi, yi] = ring[i], [xj, yj] = ring[j];
      if ((yi > p[1]) !== (yj > p[1]) && p[0] < ((xj - xi) * (p[1] - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  }
  function distRing(p, ring) {
    let best = Infinity;
    for (let i = 0; i < ring.length; i++) {
      const a = ring[i], b = ring[(i + 1) % ring.length];
      const dx = b[0] - a[0], dy = b[1] - a[1], l2 = dx * dx + dy * dy;
      let t = l2 ? ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / l2 : 0; t = Math.max(0, Math.min(1, t));
      best = Math.min(best, Math.hypot(a[0] + t * dx - p[0], a[1] + t * dy - p[1]));
    }
    return best;
  }
  function allLayers(coll, out) {
    coll.getArray().forEach((l) => { if (l.getLayers) allLayers(l.getLayers(), out); else out.push(l); });
    return out;
  }
  /** Spoljasnji prstenovi poligona iz vektorskih slojeva (ako ih sajt drzi kao vektor). */
  function parcelRings(map) {
    const rings = [];
    allLayers(map.getLayers(), []).forEach((l) => {
      const s = l.getSource && l.getSource();
      if (!s || typeof s.getFeatures !== 'function' || l === gpsLayer) return;
      s.getFeatures().forEach((f) => {
        const g = f.getGeometry && f.getGeometry(); if (!g || !g.getType) return;
        if (g.getType() === 'Polygon') rings.push(g.getCoordinates()[0]);
        else if (g.getType() === 'MultiPolygon') g.getCoordinates().forEach((poly) => rings.push(poly[0]));
      });
    });
    if (rings.length <= 1) return rings;
    const c = map.getView().getCenter();
    rings.sort((a, b) => (inRing(c, b) - inRing(c, a)) || distRing(c, a) - distRing(c, b));
    return rings.slice(0, 1);
  }

  /* ------------------------------------------------------------------ */
  /* 6. GPS, FILTER, KALIBRACIJA                                         */
  /* ------------------------------------------------------------------ */
  const CAL_KEY = 'kgrs.cal.v1';
  let watchId = null, wakeLock = null, follow = true, calMode = false;
  let gpsSource = null, gpsLayer = null;
  let raw = null;        // filtrirana pozicija bez kalibracije {x,y,acc,t}
  let cal = null;        // {dx,dy,t}
  try { cal = JSON.parse(localStorage.getItem(CAL_KEY)); } catch (e) { cal = null; }
  const KF = { x: null, y: null, P: 0, t: 0 };

  function kalman(x, y, acc, t) {
    const R = Math.max(acc, 1) ** 2;
    if (KF.x === null || t - KF.t > 15000) { KF.x = x; KF.y = y; KF.P = R; KF.t = t; return; }
    KF.P += ((t - KF.t) / 1000) * 2.25;          // hodanje ~1.5 m/s
    const g = KF.P / (KF.P + R);
    KF.x += g * (x - KF.x); KF.y += g * (y - KF.y); KF.P *= 1 - g; KF.t = t;
  }
  const calibrated = () => (cal ? [raw.x + cal.dx, raw.y + cal.dy] : [raw.x, raw.y]);

  function ensureGpsLayer(map) {
    if (gpsLayer && allLayers(map.getLayers(), []).includes(gpsLayer)) return;
    gpsSource = new ol.source.Vector();
    gpsLayer = new ol.layer.Vector({
      source: gpsSource, zIndex: 9999,
      style: (f) => {
        const k = f.get('k');
        if (k === 'acc') return new ol.style.Style({ fill: new ol.style.Fill({ color: 'rgba(25,181,255,.14)' }), stroke: new ol.style.Stroke({ color: 'rgba(25,181,255,.75)', width: 1.5 }) });
        if (k === 'halo') return new ol.style.Style({ image: new ol.style.Circle({ radius: 17, fill: new ol.style.Fill({ color: 'rgba(25,181,255,.28)' }) }) });
        return new ol.style.Style({ image: new ol.style.Circle({ radius: 8.5, fill: new ol.style.Fill({ color: '#19b5ff' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3.5 }) }) });
      },
    });
    map.addLayer(gpsLayer);
    map.on('pointerdrag', () => { if (follow && watchId !== null) { follow = false; refs.recenter.style.opacity = '1'; } });
  }

  function onPos(p) {
    const map = getMap();
    if (!map) return;
    let xy;
    try { xy = ol.proj.transform([p.coords.longitude, p.coords.latitude], 'EPSG:4326', map.getView().getProjection()); }
    catch (e) { return setPill('bad', 'Greška koordinata', e.message); }
    const acc = p.coords.accuracy || 99;
    if (acc > 60 && raw) return;                  // odbaci jako loša mjerenja kad već imamo poziciju
    kalman(xy[0], xy[1], acc, p.timestamp || Date.now());
    raw = { x: KF.x, y: KF.y, acc, t: Date.now() };
    drawGps(map);
    refreshStatus();
  }

  function drawGps(map) {
    ensureGpsLayer(map);
    const c = calibrated();
    gpsSource.clear();
    const a = new ol.Feature(new ol.geom.Circle(c, Math.max(raw.acc, 0.5))); a.set('k', 'acc');
    const h = new ol.Feature(new ol.geom.Point(c)); h.set('k', 'halo');
    const d = new ol.Feature(new ol.geom.Point(c)); d.set('k', 'dot');
    gpsSource.addFeatures([a, h, d]);
    if (follow) map.getView().animate({ center: c, duration: 250 });
  }

  function start() {
    const map = getMap();
    if (!map) return;
    if (!navigator.geolocation) return setPill('bad', 'GPS nije podržan', '');
    refs.go.className = 'go wait'; refs.goT.textContent = 'Traži…';
    setPill('warn', 'Tražim signal…', '');
    follow = true;
    watchId = navigator.geolocation.watchPosition(onPos, (e) => { setPill('bad', 'GPS greška', e.message); },
      { enableHighAccuracy: true, maximumAge: 500, timeout: 25000 });
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then((w) => { wakeLock = w; }).catch(() => {}); } catch (e) { /* ok */ }
  }
  function stop() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null; raw = null; KF.x = null;
    if (gpsSource) gpsSource.clear();
    try { wakeLock && wakeLock.release(); } catch (e) { /* ok */ }
    refs.go.className = 'go'; refs.goT.textContent = 'Kreni';
    setPill('', 'GPS isključen', ''); refreshStatus();
  }

  function beginCalibration() {
    const map = getMap();
    if (!map || !raw) return setHint('Prvo uključite GPS (dugme <b>Kreni</b>) i sačekajte signal.', true);
    calMode = true;
    setHint('Stanite na <b>poznatu tačku</b> (ćošak parcele, međni kamen) i <b>dodirnite tu tačku na mapi</b>. Blizu ćoška se poravna na ćošak.<br><button id="kgrs-cal-x">Odustani</button>');
    document.getElementById('kgrs-cal-x').onclick = () => { calMode = false; setHint(''); map.un('singleclick', onCalTap); };
    map.once('singleclick', onCalTap);
  }
  function onCalTap(e) {
    if (!calMode || !raw) return;
    calMode = false;
    let t = e.coordinate, snapped = false;
    const rings = parcelRings(getMap());
    let best = 6;
    rings.forEach((r) => r.forEach((v) => { const d = Math.hypot(v[0] - t[0], v[1] - t[1]); if (d < best) { best = d; t = v; snapped = true; } }));
    cal = { dx: t[0] - raw.x, dy: t[1] - raw.y, t: Date.now() };
    try { localStorage.setItem(CAL_KEY, JSON.stringify(cal)); } catch (err) { /* ok */ }
    drawGps(getMap()); refreshStatus();
    setHint(`Kalibracija postavljena: pomak <b>${Math.hypot(cal.dx, cal.dy).toFixed(1)} m</b>${snapped ? ' (poravnato na ćošak)' : ''}.`, true);
  }
  function resetCalibration() {
    cal = null; try { localStorage.removeItem(CAL_KEY); } catch (e) { /* ok */ }
    if (raw) drawGps(getMap()); refreshStatus(); setHint('Kalibracija uklonjena.', true);
  }
  let hintTimer = 0;
  function setHint(html, auto) {
    refs.hint.innerHTML = html; refs.hint.classList.toggle('on', !!html);
    clearTimeout(hintTimer); if (auto && html) hintTimer = setTimeout(() => refs.hint.classList.remove('on'), 4500);
  }

  /* ------------------------------------------------------------------ */
  /* 7. PREKRIVAC (UI)                                                   */
  /* ------------------------------------------------------------------ */
  const refs = {};
  const h = (tag, cls, text) => { const e = document.createElement(tag); if (cls) e.className = cls; if (text != null) e.textContent = text; return e; };

  function buildUi() {
    addStyle('kgrs-ui-css', UI_CSS);
    const root = h('div'); root.id = 'kgrs';

    const top = h('div', 'top');
    const close = h('button', 'rb glass', '✕'); close.title = 'Zatvori mapu';
    const pill = h('div', 'pill glass'); const dot = h('span', 'dot'); const pt = h('span'); const ps = h('small');
    pill.append(dot, pt, ps);
    const recenter = h('button', 'rb glass', '◎'); recenter.title = 'Centriraj na mene'; recenter.style.opacity = '.55';
    top.append(close, pill, recenter);

    const hint = h('div', 'hint glass');

    const sheet = h('div', 'sheet glass');
    const row1 = h('div', 'row1');
    const ico = h('div', 'ico', '⬡');
    const tt = h('div'); tt.style.minWidth = 0;
    const t1 = h('div', 't1', 'Parcela'); const t2 = h('div', 't2'); const chips = h('div', 'chips');
    tt.append(t1, t2, chips); row1.append(ico, tt);
    const divider = h('div', 'divider');
    const row2 = h('div', 'row2');
    const st = h('div', 'st'); const s1 = h('div', 's1', 'GPS isključen'); const s2 = h('div', 's2', 'Pritisnite „Kreni“ i hodajte po placu');
    const actions = h('div', 'actions');
    const calBtn = h('button', 'chip-btn', '⌖ Kalibriši');
    const calX = h('button', 'chip-btn x', '✕'); calX.style.display = 'none'; calX.title = 'Ukloni kalibraciju';
    actions.append(calBtn, calX);
    st.append(s1, s2, actions); row2.append(st);
    const handle = h('button', 'handle'); handle.title = 'Sklopi/rasklopi';
    const ownersBtn = h('button', 'owners-toggle'); const ownersL = h('b', null, 'Vlasnici'); const ownersC = h('span', null, '');
    ownersBtn.append(ownersL, ownersC);
    const owners = h('ul', 'owners'); const ownersWrap = h('div', 'owners-wrap'); ownersWrap.append(owners);
    const go = h('button', 'go'); const goT = h('span', null, 'Kreni'); go.append(goT, h('i'));
    sheet.append(handle, row1, divider, row2, ownersBtn, ownersWrap, go);

    root.append(top, hint, sheet);
    document.body.appendChild(root);
    Object.assign(refs, { root, close, pill, pt, ps, recenter, hint, t1, t2, chips, s1, s2, st, calBtn, calX, ownersBtn, ownersL, ownersC, owners, go, goT });

    go.onclick = () => (watchId === null ? start() : stop());
    handle.onclick = () => sheet.classList.toggle('mini');
    recenter.onclick = () => { follow = true; recenter.style.opacity = '.55'; if (raw) getMap().getView().animate({ center: calibrated(), duration: 250 }); };
    calBtn.onclick = beginCalibration; calX.onclick = resetCalibration;
    ownersBtn.onclick = () => { owners.classList.toggle('open'); ownersBtn.lastChild.textContent = owners.classList.contains('open') ? 'sakrij ▴' : 'prikaži ▾'; };
    close.onclick = () => {
      const b = [...document.querySelectorAll('.ui.modal .button, .modal .button, button, .button')].find((x) => /^Затвори$/.test(x.textContent.trim()));
      if (b) b.click(); else leaveFullscreen();
    };
    setPill('', 'GPS isključen', '');
    renderParcel();
  }

  function setPill(cls, a, b) {
    refs.pill.className = 'pill glass ' + cls; refs.pt.textContent = a; refs.ps.textContent = b || '';
  }

  function renderParcel() {
    if (!refs.root) return;
    const p = parcel;
    refs.t1.textContent = p ? 'Парцела ' + p.broj : 'Парцела';
    refs.t2.textContent = p ? [p.ko, p.opstina].filter(Boolean).join(' · ') : 'Претражите парцелу па „Прикажи на мапи“';
    refs.chips.textContent = '';
    if (p) {
      if (p.povrsina) { const c = h('span', 'a', p.povrsina); refs.chips.append(c); }
      if (p.list) refs.chips.append(h('span', null, 'Лист ' + p.list));
      p.dijelovi.slice(0, 2).forEach((d) => d[0] && refs.chips.append(h('span', null, d[0])));
    }
    refs.owners.textContent = '';
    const n = p ? p.vlasnici.length : 0;
    refs.ownersC.textContent = n ? (refs.owners.classList.contains('open') ? 'sakrij ▴' : 'prikaži ▾') : '';
    refs.ownersL.textContent = 'Власници' + (n ? ' (' + n + ')' : '');
    if (n) p.vlasnici.forEach(([ime, udio]) => { const li = h('li'); li.append(h('span', null, ime), h('b', null, udio)); refs.owners.append(li); });
    else refs.owners.append(h('li', 'none', p ? 'Нема података о власницима' : '—'));
    refs.ownersBtn.style.display = p ? '' : 'none';
  }

  function refreshStatus() {
    if (!refs.root) return;
    refs.calX.style.display = cal ? '' : 'none';
    refs.calBtn.textContent = cal ? '⌖ Kalibrisano · ' + Math.hypot(cal.dx, cal.dy).toFixed(1) + ' m' : '⌖ Kalibriši';
    refs.calBtn.className = 'chip-btn' + (cal ? ' acc' : '');
    if (watchId === null) {
      refs.st.className = 'st'; refs.s1.textContent = 'GPS isključen'; refs.s2.textContent = 'Pritisnite „Kreni“ i hodajte po placu'; return;
    }
    if (!raw) { refs.st.className = 'st warn'; refs.s1.textContent = 'Tražim GPS signal…'; refs.s2.textContent = 'Izađite na otvoreno'; return; }
    const acc = Math.round(raw.acc), c = calibrated();
    setPill(acc <= 5 ? 'ok' : acc <= 15 ? 'warn' : 'bad', 'GPS ±' + acc + ' m', cal ? 'kalibrisano' : acc <= 5 ? 'odlično' : acc <= 15 ? 'dobro' : 'slabo');
    refs.go.className = 'go run'; refs.goT.textContent = 'Stop';
    const rings = parcelRings(getMap());
    if (!rings.length) { refs.st.className = 'st'; refs.s1.textContent = 'Pozicija prikazana'; refs.s2.textContent = 'E ' + c[0].toFixed(1) + ' · N ' + c[1].toFixed(1); return; }
    const ring = rings[0], inside = inRing(c, ring), d = distRing(c, ring);
    const near = d < raw.acc;
    refs.st.className = 'st ' + (near ? 'warn' : inside ? 'ok' : 'bad');
    refs.s1.textContent = near ? 'Na međi parcele' : inside ? 'UNUTAR parcele' : 'IZVAN parcele';
    refs.s2.textContent = d.toFixed(1) + ' m od najbliže međe' + (near ? ' (unutar greške GPS-a)' : '');
  }

  /* ------------------------------------------------------------------ */
  /* 8. PRIKAZ PREKRIVACA KAD JE MAPA OTVORENA                           */
  /* ------------------------------------------------------------------ */
  let fsEls = [], fsHidden = [], fsTarget = null;
  function enterFullscreen(t) {
    // Prosirimo cijeli modal (a ne samo mapu): fixed element unutar transformisanog modala ne bi popunio ekran.
    let top = t.closest('.ui.dimmer') || t.closest('.ui.modal') || t.closest('[class*=modal]') || t;
    const chain = []; for (let e = t; e && e !== document.body; e = e.parentElement) { chain.push(e); if (e === top) break; }
    chain.forEach((e) => { e.classList.add('kgrs-fs'); fsEls.push(e); });
    chain.forEach((e) => { [...(e.parentElement ? e.parentElement.children : [])].forEach((sib) => {
      if (!chain.includes(sib) && sib.id !== 'kgrs' && e !== top) { sib.classList.add('kgrs-fs-hide'); fsHidden.push(sib); } }); });
    fsTarget = t;
  }
  function leaveFullscreen() {
    fsEls.forEach((e) => e.classList.remove('kgrs-fs')); fsHidden.forEach((e) => e.classList.remove('kgrs-fs-hide'));
    fsEls = []; fsHidden = []; fsTarget = null;
  }
  function sync() {
    const map = getMap();
    const t = map && map.getTargetElement && map.getTargetElement();
    if (!refs.root) return;
    const wasOn = refs.root.classList.contains('on');
    // "vidljivo" = mapa se iscrtava (display ne forsiramo, pa kad sajt sakrije modal, mapa nestaje)
    const visible = !!(t && t.getClientRects().length);
    if (visible && !fsTarget) { enterFullscreen(t); map.updateSize(); }
    if (!visible && fsTarget) leaveFullscreen();
    refs.root.classList.toggle('on', visible);
    if (visible && !wasOn) { renderParcel(); refreshStatus(); }
    if (!visible && wasOn && watchId !== null) stop();
  }

  function boot() {
    if (!(window.ol && ol.source && ol.layer && ol.proj && document.body)) return setTimeout(boot, 400);
    prepPage(); tidy(); buildUi();
    setInterval(tidy, 700);
    setInterval(() => { try { sync(); } catch (e) { /* ok */ } }, 500);
    setInterval(() => { if (watchId !== null && raw) { try { refreshStatus(); } catch (e) { /* ok */ } } }, 1500);
  }
  // tema se postavlja odmah (prije cekanja na ol), da stranica ne "bljesne" bijelo
  if (document.head) { prepPage(); }
  boot();
})();
