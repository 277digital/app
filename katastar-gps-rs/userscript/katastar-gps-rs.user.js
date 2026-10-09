// ==UserScript==
// @name         Katastar GPS RS
// @namespace    https://github.com/277digital
// @version      1.4.0
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
html{background:var(--bg)!important;height:100%!important;overflow:hidden!important}
body{background:var(--bg)!important;color:var(--fg)!important;overflow:hidden!important;height:100%!important;max-width:100vw!important;margin:0!important;padding:0!important;border:0!important;position:relative!important}
body,#d_all,.ui,.ui.form,.ui.input input,.ui.dropdown{font-family:system-ui,-apple-system,"Segoe UI",Roboto,sans-serif!important}
#d_all{touch-action:pan-y pinch-zoom;position:fixed!important;top:0!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;height:auto!important;min-height:0!important;margin:0!important;border:0!important;overflow-x:hidden!important;overflow-y:auto!important;-webkit-overflow-scrolling:touch;overscroll-behavior-y:contain;background:var(--bg)!important;box-sizing:border-box!important}
*{-webkit-tap-highlight-color:transparent}
#wrapper,#content_m,.maincol,.items-row,.item,.ui.container{border:0!important;outline:0!important;box-shadow:none!important;width:100%!important;max-width:100%!important;min-width:0!important;margin:0!important;padding:0!important;float:none!important;box-sizing:border-box!important;background:transparent!important}
.items-row{padding:0 16px!important}
.items-row+.items-row{margin-top:6px!important}
#header,#headerlogo{display:none!important}
#d_all{padding-top:calc(12px + env(safe-area-inset-top))!important;padding-bottom:calc(28px + env(safe-area-inset-bottom))!important}
/* naslovi/tekst: bez bijele pozadine koju sajt stavlja iza njih */
#content_m h1,#content_m h2,#content_m h3,#content_m h2 *,#content_m h3 *,#content_m .item p,#content_m .item p *,#content_m .items-row>.item,#content_m .items-row,#content_m .maincol,#content_m [style*="background"]:not(.ui):not(.button):not(.label):not(.item){background:none!important;background-color:transparent!important;background-image:none!important;text-shadow:none!important;box-shadow:none!important}
#content_m h2,#content_m h2 *,#content_m h3{color:var(--fg)!important}
html,body{-webkit-text-size-adjust:100%;touch-action:manipulation}
#content_m .ui.button,#content_m .ui.dropdown,#content_m .ui.menu .item{transition:none!important}
#d_info .ui.blue.segment,#d_info table,#d_info .ui.attached.message{will-change:auto}
#content_m h2{color:var(--fg)!important;font-size:22px!important;line-height:1.2;letter-spacing:-.01em;margin:14px 0 6px!important}
#content_m h2 span,#content_m h2 strong{font-size:inherit!important}
#content_m .item p,#content_m .item p span{color:var(--mut)!important;font-size:13px!important;text-align:left!important;line-height:1.45}
table{max-width:100%!important}
/* prijava */
#login,#login~*,.ui.special.popup{display:none!important}
#login{background:var(--s1)!important;color:var(--fg)!important;border-radius:999px!important;box-shadow:none!important;border:1px solid var(--line)!important;font-weight:600}
td[style*="text-align: right"],td[style*="text-align:right"]{padding:6px 0 0!important}
/* tabovi */
.ui.pointing.menu{display:flex!important;width:100%!important;background:var(--s1)!important;border:0!important;border-radius:16px!important;padding:4px!important;box-shadow:none!important;margin:8px 0 14px!important;min-height:0!important}
.ui.pointing.menu .item{flex:1!important;justify-content:center!important;color:var(--mut)!important;font-weight:600!important;border-radius:12px!important;padding:13px 8px!important;margin:0!important;border:0!important;background:transparent!important}
.ui.pointing.menu .item:before,.ui.pointing.menu .item:after{display:none!important}
#content_m .ui.pointing.menu .active.item,.ui.pointing.menu .active.item{background:var(--acc)!important;color:var(--accfg)!important}
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
/* captcha: prozor sa slikama je kod njih apsolutno pozicioniran i izlazi van ekrana; centriramo ga i skaliramo */
.kgrs-rc-off,.kgrs-rc-off *{pointer-events:none!important}
.kgrs-rc-wrap{position:fixed!important;top:0!important;left:0!important;width:100vw!important;height:100vh!important;height:100dvh!important;display:flex!important;align-items:center!important;justify-content:center!important;overflow:visible!important;z-index:2147483600!important}
.kgrs-rc-box{position:relative!important;left:auto!important;top:auto!important;right:auto!important;bottom:auto!important;margin:0!important;transform:scale(var(--rcs,1))!important;transform-origin:center center!important}
/* captcha */
#ReCaptchContainer1,#ReCaptchContainer2{max-width:100%;overflow:hidden}
/* dugmad */
#content_m .ui.blue.button,#content_m .ui.blue.buttons .button{background:var(--acc)!important;color:var(--accfg)!important;border-radius:16px!important;font-weight:800!important;min-height:56px;font-size:17px!important;box-shadow:0 4px 14px rgba(217,242,68,.22)!important}
#content_m .ui.button.disabled,#content_m .ui.disabled.button{opacity:.35!important;box-shadow:none!important}
#content_m .ui.button{border-radius:14px!important;box-shadow:none!important}
#content_m .ui.basic.button,#content_m .ui.button:not(.blue){background:var(--s2)!important;color:var(--fg)!important}
/* rezultati */
#d_info{margin:18px 0 28px;display:block}
.kgrs-dup{display:none!important}
#d_info section.kgrs-dup,#d_info table[id^=parc_] tr.kgrs-dup,#d_info table[id^=parc_] tbody tr.kgrs-dup{display:none!important}
#d_info section{display:block!important;border:1px solid var(--line);border-radius:18px;overflow:hidden;margin:0 0 12px;background:var(--s1)}
#d_info section .ui.attached.message,#d_info section table,#d_info section .ui.blue.segment{border-left:0!important;border-right:0!important;border-radius:0!important}
#d_info section .ui.blue.segment{border-top:0!important}
#d_info table[id^=parc_] tr+tr{border-top:1px solid var(--line)!important}
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
#d_info table[id^=parc_] td:nth-child(5),#d_info table[id^=parc_] td:nth-child(4){display:none!important}
#d_info table[id^=parc_] td:nth-child(6){grid-column:1/-1;order:1}
#d_info table[id^=parc_] td:nth-child(4){grid-column:1/-1;order:2}
#d_info table[id^=parc_] td button{width:100%!important;float:none!important;margin:0!important;display:flex!important;align-items:center;justify-content:center;gap:8px;min-height:54px;font-size:16px!important;font-weight:800!important}
#d_info table[id^=parc_] td:nth-child(6) button{background:var(--acc)!important;color:var(--accfg)!important;box-shadow:0 6px 24px rgba(217,242,68,.22)!important}
#d_info table[id^=parc_] td:nth-child(4) button{background:var(--s2)!important;color:var(--fg)!important;min-height:44px;font-weight:600!important}
#d_info table[id^=parc_] td button{padding:0 16px!important}
#d_info table[id^=parc_] td button i.icon,#d_info table[id^=parc_] td button .icon{display:none!important}
#d_info table[id^=parc_] td button{justify-content:center!important;text-align:center!important}
#d_info table[id^=parc_] td button i.icon{position:static!important;width:auto!important;height:auto!important;line-height:1!important;margin:0 4px 0 0!important;padding:0!important;background:transparent!important;box-shadow:none!important;opacity:1!important}
#d_info table.kgrs-owners tr{display:flex!important;justify-content:space-between;gap:12px;padding:11px 16px!important;border-top:1px solid var(--line)!important}
#d_info table.kgrs-owners td:first-child{flex:1;min-width:0;overflow-wrap:anywhere;font-weight:600}
#d_info table.kgrs-owners td:last-child{color:var(--acc)!important;font-weight:800;white-space:nowrap}
#d_info table.kgrs-parts tr{display:flex!important;flex-wrap:wrap;gap:4px 12px;padding:11px 16px!important;border-top:1px solid var(--line)!important}
#d_info table.kgrs-parts td:nth-child(1){display:none!important}
#d_info table.kgrs-parts td:nth-child(2){flex:1;font-weight:600}
#d_info table.kgrs-parts td:nth-child(3){color:var(--mut)!important}
#d_info>table:last-of-type,#d_info>table.kgrs-parts{border-radius:0 0 var(--r) var(--r)!important;border-bottom:1px solid var(--line)!important;padding-bottom:6px!important}
#d_info br{display:none}
#footer{display:none!important}
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
#kgrs .top{position:absolute;left:10px;right:10px;top:calc(8px + env(safe-area-inset-top));display:flex;gap:8px;align-items:center;justify-content:space-between}
#kgrs .right{display:flex;gap:8px;align-items:center;min-width:0}
#kgrs .rb{width:40px;height:40px;border-radius:50%;display:grid;place-items:center;font-size:17px;flex:none}
#kgrs .pill{flex:none;max-width:56vw;height:30px;border-radius:999px;display:flex;align-items:center;gap:7px;padding:0 11px;font-weight:600;font-size:12px;white-space:nowrap;overflow:hidden;opacity:.92}
#kgrs .pill .dot{width:8px;height:8px;border-radius:50%;background:#9aa0ac;flex:none}
#kgrs .pill.ok .dot{background:#58e08a;box-shadow:0 0 0 4px rgba(88,224,138,.2)}
#kgrs .pill.warn .dot{background:#ffb84d;box-shadow:0 0 0 4px rgba(255,184,77,.2)}
#kgrs .pill.bad .dot{background:#ff6b5e;box-shadow:0 0 0 4px rgba(255,107,94,.2)}
#kgrs .pill small{display:none}
#kgrs .hint{position:absolute;left:12px;right:12px;top:calc(56px + env(safe-area-inset-top));right:60px;padding:12px 14px;border-radius:16px;font-size:14px;line-height:1.35;display:none}
#kgrs .hint.on{display:block}
#kgrs .hint b{color:#d9f244}
#kgrs .hint button{margin-top:8px;background:#23252d;border-radius:10px;padding:8px 12px;font-weight:700}
#kgrs .sheet{position:absolute;left:12px;right:12px;bottom:calc(12px + env(safe-area-inset-bottom));border-radius:26px;padding:6px 16px 10px;max-height:56vh;display:flex;flex-direction:column;overflow-y:auto;overflow-x:hidden;-webkit-overflow-scrolling:touch}
#kgrs .sheet>*{flex:none}
#kgrs .handle{align-self:center;width:100%;height:20px;background:transparent;position:relative;flex:none}
#kgrs .handle:after{content:'';position:absolute;left:50%;top:8px;width:40px;height:4px;margin-left:-20px;border-radius:2px;background:rgba(255,255,255,.25)}
#kgrs .sheet.mini .chips,#kgrs .sheet.mini .owners-toggle,#kgrs .sheet.mini .owners-wrap,#kgrs .sheet.mini .t2{display:none}
#kgrs .sheet.mini .row1{min-height:56px}
#kgrs .row1{display:flex;gap:12px;align-items:center;padding:2px 112px 0 4px;min-height:70px}
#kgrs .ico{width:46px;height:46px;border-radius:50%;background:#23252d;display:grid;place-items:center;font-size:20px;flex:none}
#kgrs .t1{font-size:21px;font-weight:800;letter-spacing:-.01em;line-height:1.15;overflow-wrap:anywhere}
#kgrs .t1.num{font-size:30px;font-weight:900;letter-spacing:.01em}
#kgrs .dhead h3.num{font-size:22px;font-weight:900;letter-spacing:.01em}
#kgrs .t2{font-size:13px;color:#9aa0ac;margin-top:2px;line-height:1.3;overflow-wrap:anywhere}
#kgrs .chips{display:flex;flex-wrap:wrap;gap:6px;margin-top:8px}
#kgrs .chips span{background:#23252d;border-radius:999px;padding:4px 10px;font-size:12px;font-weight:700;color:#d6d9df}
#kgrs .chips span.a{background:rgba(217,242,68,.14);color:#d9f244}
#kgrs .divider{height:1px;background:rgba(255,255,255,.09);margin:8px -16px 8px}
#kgrs .row2{display:flex;align-items:center;gap:10px;padding-right:112px;min-height:60px}
#kgrs .st{flex:1;min-width:0}
#kgrs .s1{font-size:16px;font-weight:800}
#kgrs .s2{font-size:12px;color:#9aa0ac;margin-top:2px}
#kgrs .st.off .s1,#kgrs .st.off .s2{display:none}
#kgrs .st.off .actions{margin-top:0}
#kgrs .st.ok .s1{color:#58e08a}#kgrs .st.bad .s1{color:#ff6b5e}#kgrs .st.warn .s1{color:#ffb84d}
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
#kgrs .detail{position:absolute;left:10px;right:10px;bottom:calc(190px + env(safe-area-inset-bottom));max-height:42vh;overflow-y:auto;-webkit-overflow-scrolling:touch;border-radius:20px;padding:10px 14px 12px;display:none;pointer-events:auto}
#kgrs .detail.on{display:block}
#kgrs .dhead{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:4px}
#kgrs .dhead h3{margin:0;font-size:16px;font-weight:700;color:#f2f3f5!important;font-family:inherit!important;letter-spacing:0}
#kgrs h3,#kgrs h4{color:#f2f3f5}
#kgrs .dsub{font-size:12px;color:#9aa0ac;margin:-2px 0 6px}
#kgrs .owners-box{margin-top:6px;padding-top:6px;border-top:1px solid rgba(255,255,255,.07)}
#kgrs .okey{font-size:11px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#9aa0ac;margin-bottom:4px}
#kgrs .dnote{font-size:11px;line-height:1.4;color:#6f737e;margin-top:6px}
#kgrs .dmore{width:100%;margin-top:8px;padding:8px 2px;background:transparent;color:#6f737e;font-size:12px;text-align:left}
#kgrs .dall .kv{font-size:11px}
#kgrs .diag{margin-top:8px;font-size:10px;line-height:1.4;color:#6f737e;overflow-wrap:anywhere}
#kgrs .kv{display:flex;justify-content:space-between;gap:14px;padding:8px 0;border-top:1px solid rgba(255,255,255,.07);font-size:13px;color:#9aa0ac}
#kgrs .kv b{color:#f2f3f5;text-align:right;overflow-wrap:anywhere;font-weight:600}
#kgrs .detail .chip-btn.acc{margin-top:8px;width:100%;justify-content:center}
/* ziva tacka (overlay na mapi) */
.kgrs-me{position:relative;width:0;height:0;pointer-events:none}
.kgrs-me-acc{position:absolute;left:-10px;top:-10px;width:20px;height:20px;box-sizing:border-box;border-radius:50%;background:rgba(52,210,122,.10);border:1.25px solid rgba(52,210,122,.5)}
.kgrs-me-dot{position:absolute;left:-8px;top:-8px;width:16px;height:16px;box-sizing:border-box;border-radius:50%;border:2.5px solid #fff;
  background:radial-gradient(circle at 35% 30%,#b4ffd3,#34d27a 58%,#1da95c);box-shadow:0 0 0 1px rgba(0,0,0,.16),0 2px 7px rgba(0,0,0,.38)}
.kgrs-me-pulse{position:absolute;left:-9px;top:-9px;width:18px;height:18px;border-radius:50%;background:rgba(52,210,122,.38);animation:kmepulse 2.6s ease-out infinite}
.kgrs-me-dir{position:absolute;left:-60px;top:-60px;width:120px;height:120px;opacity:0;transition:opacity .3s;will-change:transform;pointer-events:none}
.kgrs-me.has-dir .kgrs-me-dir{opacity:1}
@keyframes kmepulse{0%{transform:scale(.7);opacity:.85}65%{transform:scale(3.1);opacity:0}100%{transform:scale(3.1);opacity:0}}
#kgrs-head{display:flex;align-items:center;justify-content:center;gap:10px;padding:6px 16px 14px;margin:0 0 6px}
#kgrs-head svg{width:30px;height:30px;flex:none}
#kgrs-head .hd-tx{display:flex;flex-direction:column;gap:5px}
#kgrs-head .hd-tx>b{font:800 18px/1 system-ui,-apple-system,Roboto,sans-serif;letter-spacing:-.01em;color:#f2f3f5}
#kgrs-head b i{font-style:normal;color:#d9f244}
#kgrs-head em{font:600 11px/1 system-ui,-apple-system,Roboto,sans-serif;font-style:normal;letter-spacing:.08em;color:#6c7280}
#kgrs-head em b{color:#9aa0ac;font-weight:700}
#kgrs-mapbtn{position:relative;display:flex;align-items:center;gap:16px;width:calc(100% - 32px);margin:4px 16px 0;padding:20px 18px;border:1px solid rgba(217,242,68,.28);border-radius:24px;text-align:left;cursor:pointer;color:#f2f3f5;overflow:hidden;font-family:system-ui,-apple-system,Roboto,sans-serif;background:linear-gradient(120deg,#1b2111 0%,#1a1b21 55%,#17240f 100%);background-size:200% 200%;animation:khbg 9s ease-in-out infinite;box-shadow:0 10px 30px rgba(0,0,0,.35)}
#kgrs-mapbtn:active{transform:scale(.985)}
@keyframes khbg{0%,100%{background-position:0 50%}50%{background-position:100% 50%}}
#kgrs-mapbtn:before{content:'';position:absolute;inset:0;background:radial-gradient(circle at 18% 50%,rgba(217,242,68,.16),transparent 55%);pointer-events:none}
.kh-ic{position:relative;flex:none;width:58px;height:58px;display:flex;align-items:center;justify-content:center}
.kh-ic svg{position:relative;width:30px;height:30px;color:#141507;z-index:2}
.kh-ic:before{content:'';position:absolute;inset:6px;border-radius:50%;background:#d9f244;z-index:1;box-shadow:0 0 18px rgba(217,242,68,.45)}
.kh-ic i{position:absolute;inset:6px;border-radius:50%;border:2px solid rgba(217,242,68,.55);animation:khr 2.8s ease-out infinite}
.kh-ic i+i{animation-delay:1.4s}
@keyframes khr{0%{transform:scale(1);opacity:.8}100%{transform:scale(2.1);opacity:0}}
.kh-tx{position:relative;flex:1;min-width:0;display:flex;flex-direction:column;gap:4px}
.kh-tx b{font-size:20px;font-weight:800;letter-spacing:-.01em}
.kh-tx small{font-size:13px;line-height:1.35;color:#9aa0ac}
.kh-go{position:relative;flex:none;font-size:26px;color:#d9f244;animation:khgo 2.2s ease-in-out infinite}
@keyframes khgo{0%,100%{transform:translateX(0)}50%{transform:translateX(4px)}}
#kgrs-sh{position:relative;display:flex;align-items:center;gap:12px;margin:22px 16px 6px;padding:14px 16px;border-radius:20px;border:1px solid rgba(255,255,255,.07);overflow:hidden;background:linear-gradient(110deg,rgba(255,255,255,.045),rgba(255,255,255,.015))}
#kgrs-sh:before{content:'';position:absolute;right:-30px;top:-40px;width:130px;height:130px;border-radius:50%;background:radial-gradient(circle,rgba(217,242,68,.13),transparent 70%);pointer-events:none}
#kgrs-sh .sh-ic{flex:none;width:38px;height:38px;border-radius:12px;display:flex;align-items:center;justify-content:center;background:#23252d;color:#d9f244}
#kgrs-sh .sh-ic svg{width:20px;height:20px}
#kgrs-sh b{display:block;font:700 15px/1.2 system-ui,-apple-system,Roboto,sans-serif;color:#f2f3f5}
#kgrs-rcsw{display:block;margin:8px 0 0;padding:0;border:0;background:none;color:#d9f244;font:600 12px system-ui,-apple-system,Roboto,sans-serif;text-decoration:underline;text-underline-offset:3px;opacity:.85}
#kgrs-sh small{display:block;margin-top:3px;font:12px/1.3 system-ui,-apple-system,Roboto,sans-serif;color:#9aa0ac}
#kgrs-foot{margin:auto 0 0;padding:28px 16px 4px;text-align:center;font:600 11px/1 system-ui,-apple-system,Roboto,sans-serif;letter-spacing:.08em;color:#6c7280}
#kgrs-foot b{color:#9aa0ac;font-weight:700}
#d_all.kgrs-col{display:flex!important;flex-direction:column}
#d_all.kgrs-col>*{flex:none}
#d_all.kgrs-col>#kgrs-foot{margin-top:auto}
#kgrs .s0{font-size:13px;font-weight:700;color:#d9f244;margin-bottom:3px}
#kgrs .s0:empty{display:none}
#kgrs .st.off .s0{display:none}
#kgrsmap,#kgrsmap .ol-viewport,#kgrsmap .ol-viewport canvas{touch-action:none!important}
#kgrs-load{position:fixed;inset:0;z-index:2147483100;pointer-events:none;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:20px;background:radial-gradient(circle at 50% 42%,#1a2112 0%,#0c0d10 62%);opacity:1;transition:opacity .5s ease;font-family:system-ui,-apple-system,Roboto,sans-serif}
#kgrs-load.off{opacity:0;pointer-events:none}
#kgrs-load svg{width:54px;height:54px;animation:klpulse 1.8s ease-in-out infinite}
@keyframes klpulse{0%,100%{transform:scale(1);opacity:.85}50%{transform:scale(1.08);opacity:1}}
#kgrs-load .lb{width:132px;height:3px;border-radius:3px;overflow:hidden;background:rgba(255,255,255,.09)}
#kgrs-load .lb i{display:block;width:45%;height:100%;border-radius:3px;background:linear-gradient(90deg,transparent,#d9f244,transparent);animation:klbar 1.25s ease-in-out infinite}
@keyframes klbar{0%{transform:translateX(-110%)}100%{transform:translateX(250%)}}
#kgrs-load small{font-size:12px;letter-spacing:.06em;color:#9aa0ac}
#kgrs-toast{position:fixed;left:12px;right:12px;bottom:calc(16px + env(safe-area-inset-bottom));z-index:2147483200;padding:12px 14px;border-radius:16px;background:rgba(20,21,26,.94);color:#f2f3f5;font:13px/1.4 system-ui,-apple-system,Roboto,sans-serif;border:1px solid rgba(255,255,255,.1);box-shadow:0 6px 24px rgba(0,0,0,.5);display:none}
#kgrs-toast.on{display:block}
#kgrs-toast b{color:#d9f244}
#kgrs-toast button{margin-top:8px;font:inherit;font-weight:700;padding:8px 12px;border-radius:10px;border:0;background:#d9f244;color:#141507}
.kgrs-ta-fix{touch-action:pan-y!important}
/* v0.6: kompaktan, suptilan panel */
#kgrs .glass{background:rgba(20,21,26,.82);box-shadow:0 4px 18px rgba(0,0,0,.35);border:1px solid rgba(255,255,255,.07)}
#kgrs .sheet{left:10px;right:10px;bottom:calc(10px + env(safe-area-inset-bottom));border-radius:22px;padding:2px 14px 6px;max-height:46vh}
#kgrs .handle{height:14px}
#kgrs .handle:after{top:5px;width:32px;height:3px;margin-left:-16px;background:rgba(255,255,255,.18)}
#kgrs .row1{padding:0 96px 0 2px;min-height:0;gap:0}
#kgrs .t1{font-size:17px;font-weight:700;letter-spacing:0}
#kgrs .t2{font-size:12px;margin-top:1px}
#kgrs .chips{gap:5px;margin-top:6px}
#kgrs .chips span{padding:3px 9px;font-size:11px;font-weight:600;background:rgba(255,255,255,.07)}
#kgrs .chips span.a{background:rgba(217,242,68,.12)}
#kgrs .divider{margin:8px -14px 6px;background:rgba(255,255,255,.07)}
#kgrs .row2{padding-right:96px;min-height:0}
#kgrs .st{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 8px}
#kgrs .s1{font-size:14px;font-weight:700}
#kgrs .s2{font-size:12px;margin:0}
#kgrs .actions{margin-top:6px;flex-basis:100%}
#kgrs .st.off .actions{margin-top:0}
#kgrs .chip-btn{padding:7px 11px;font-size:12px;border-radius:10px;background:rgba(255,255,255,.07);font-weight:600}
#kgrs .chip-btn.acc{background:#d9f244;color:#141507}
#kgrs .owners-toggle{padding:8px 2px;font-size:13px;font-weight:600;border-top:1px solid rgba(255,255,255,.07)}
/* ---- dugme Kreni / Stop ---- */
#kgrs .go{position:absolute;right:12px;top:38px;width:96px;height:66px;border-radius:14px;border:1px solid rgba(217,242,68,.38);overflow:hidden;
  background:linear-gradient(160deg,#30323b 0%,#1b1c22 62%,#141519 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.2),inset 0 -10px 18px rgba(0,0,0,.35),0 8px 20px rgba(0,0,0,.5);
  display:grid;place-items:center;align-content:center;gap:5px;padding:0;font-weight:800;font-size:14px;letter-spacing:.04em;color:#f2f3f5;
  transition:background .4s,border-color .4s,box-shadow .4s,transform .12s}
#kgrs .go:active{transform:scale(.95)}
#kgrs .go:before{content:'';position:absolute;top:-10%;bottom:-10%;left:-70%;width:55%;pointer-events:none;transform:skewX(-20deg);
  background:linear-gradient(90deg,transparent,rgba(217,242,68,.28),transparent);animation:ksweep 3.4s ease-in-out infinite}
#kgrs .go:after{content:'';position:absolute;inset:0;border-radius:inherit;border:1.5px solid transparent;pointer-events:none}
#kgrs .go i{display:block;width:0;height:0;border-style:solid;border-width:7px 0 7px 12px;border-color:transparent transparent transparent #d9f244;margin-left:3px;border-radius:2px;filter:drop-shadow(0 0 6px rgba(217,242,68,.55));transition:all .25s}
/* traži signal */
#kgrs .go.wait{border-color:rgba(255,184,77,.55)}
#kgrs .go.wait:before{background:linear-gradient(90deg,transparent,rgba(255,184,77,.35),transparent);animation:ksweep 1.3s ease-in-out infinite}
#kgrs .go.wait i{width:14px;height:14px;margin:0;border:2px solid rgba(255,184,77,.3);border-top-color:#ffb84d;border-radius:50%;filter:none;animation:kspin .9s linear infinite}
/* radi */
#kgrs .go.run{border-color:rgba(130,255,181,.55);background:linear-gradient(160deg,#35b872 0%,#1a7a45 55%,#0d3f24 100%);
  box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 -10px 18px rgba(0,0,0,.3),0 0 18px 2px rgba(52,210,122,.4),0 8px 20px rgba(0,0,0,.5);animation:kglow 2.4s ease-in-out infinite}
#kgrs .go.run:before{background:linear-gradient(90deg,transparent,rgba(255,255,255,.34),transparent);animation:ksweep 2.4s ease-in-out infinite}
#kgrs .go.run:after{border-color:rgba(166,255,203,.8);animation:kbord 2.4s ease-in-out infinite}
#kgrs .go.run i{width:12px;height:12px;margin:0;border:0;border-radius:3px;background:#fff;filter:drop-shadow(0 0 5px rgba(255,255,255,.5));animation:kbeat 1.6s ease-in-out infinite}
@keyframes ksweep{0%{left:-70%}55%,100%{left:130%}}
@keyframes kbord{0%,100%{opacity:.25}50%{opacity:1}}
@keyframes kspin{to{transform:rotate(360deg)}}
@keyframes krip{0%{transform:scale(1);opacity:.9}100%{transform:scale(1.2);opacity:0}}
@keyframes kbeat{0%,100%{transform:scale(1)}50%{transform:scale(.82)}}
@keyframes kglow{0%,100%{box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 -12px 20px rgba(0,0,0,.35),0 0 14px 1px rgba(52,210,122,.3),0 8px 20px rgba(0,0,0,.5)}50%{box-shadow:inset 0 1px 0 rgba(255,255,255,.3),inset 0 -12px 20px rgba(0,0,0,.35),0 0 28px 6px rgba(52,210,122,.55),0 8px 20px rgba(0,0,0,.5)}}
@media (max-width:350px){#kgrs .t1{font-size:18px}#kgrs .go{width:84px;height:60px;font-size:13px;top:40px}#kgrs .go i{border-width:6px 0 6px 10px}#kgrs .row1,#kgrs .row2{padding-right:86px}#kgrs .pill{font-size:11px;padding:0 9px}}
@media (max-height:700px) and (orientation:portrait){#kgrs .sheet{max-height:50vh}}
@media (orientation:landscape) and (max-height:520px){#kgrs .sheet{left:auto;width:min(460px,58vw);max-height:calc(100vh - 78px - env(safe-area-inset-bottom))}#kgrs .hint{left:auto;width:min(460px,58vw)}#kgrs .rail{right:auto;left:10px;top:calc(56px + env(safe-area-inset-top))}#kgrs .layers{right:auto;left:58px;top:calc(56px + env(safe-area-inset-top))}}
#kgrs .none{color:#9aa0ac;font-size:13px;padding:6px 2px}
#kgrsmap{position:fixed;top:0;left:0;right:0;bottom:0;z-index:2147482000;background:#0c0d10;overflow:hidden}
body .kgrs-force-hide{display:none!important}
#kgrsmap .ol-rotate,#kgrsmap .ol-attribution,#kgrsmap .ol-zoom{display:none!important}
#kgrs .rail{position:absolute;right:10px;top:calc(60px + env(safe-area-inset-top));display:flex;flex-direction:column;gap:8px}
#kgrs .rail .rb{font-size:20px;font-weight:600}
#kgrs .layers{position:absolute;right:58px;top:calc(60px + env(safe-area-inset-top));min-width:210px;max-width:calc(100vw - 80px);border-radius:18px;padding:8px;display:none}
#kgrs .layers.on{display:block}
#kgrs .layers h4{margin:6px 8px 4px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:#9aa0ac;font-weight:700}
#kgrs .lrow{display:flex;align-items:center;justify-content:space-between;gap:14px;width:100%;background:transparent;padding:12px 8px;border-radius:0;font-size:14px;font-weight:600;text-align:left}
#kgrs .lrow+.lrow{border-top:1px solid rgba(255,255,255,.07)}
#kgrs .sw{width:38px;height:22px;border-radius:11px;background:#33353d;position:relative;flex:none;transition:background .15s}
#kgrs .sw:after{content:'';position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#9aa0ac;transition:left .15s,background .15s}
#kgrs .lrow.on .sw{background:rgba(217,242,68,.35)}
#kgrs .lrow.on .sw:after{left:19px;background:#d9f244}
#kgrs .layers{width:max-content;overflow-y:auto;-webkit-overflow-scrolling:touch}
#kgrs .rd{width:20px;height:20px;border-radius:50%;border:2px solid #4a4d57;position:relative;flex:none}
#kgrs .lrow.radio.on .rd{border-color:#d9f244}
#kgrs .lrow.radio.on .rd:after{content:'';position:absolute;inset:3px;border-radius:50%;background:#d9f244}
#kgrs .credit{margin:6px 8px 2px;font-size:10px;color:#6f737e;line-height:1.3}
@media (orientation:landscape) and (max-height:520px){#kgrs .layers{right:auto;left:58px;max-width:280px}#kgrs .detail{left:58px;right:auto;width:min(340px,40vw);bottom:10px!important}}
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
  function groupResults(d) {
    const kids = [...d.children];
    if (!kids.length || kids.every((e) => e.tagName === 'SECTION')) return;
    const isP = (e) => e && e.matches && e.matches('.ui.attached.message') && /^Парцела$/.test((e.querySelector('.header') || {}).textContent ? e.querySelector('.header').textContent.trim() : '');
    const groups = []; let cur = null;
    kids.forEach((e, i) => {
      if (e.tagName === 'SECTION') { cur = null; return; }
      if (isP(e) || (e.tagName === 'SPAN' && isP(kids[i + 1]))) { cur = document.createElement('section'); cur.className = 'kgrs-card'; groups.push(cur); }
      else if (!cur) { cur = document.createElement('section'); cur.className = 'kgrs-head'; groups.push(cur); }
      cur.appendChild(e);
    });
    groups.forEach((g) => d.appendChild(g));
  }
  function dedupeResults() {
    // sajt ponekad dodaje novi blok rezultata umjesto da zamijeni stari: prikazujemo samo posljednji
    const infos = [...document.querySelectorAll('div[id="d_info"]')];
    infos.forEach((e, i) => e.classList.toggle('kgrs-dup', i < infos.length - 1));
    const d = infos[infos.length - 1]; if (!d) return;
    groupResults(d);
    // iste parcele (isti jumpTo poziv) prikazujemo jednom
    const seen = new Set();
    d.querySelectorAll('table[id^=parc_] tr').forEach((tr) => {
      const b = tr.querySelector('button[onclick*="jumpTo"]'); if (!b) return;
      const k = b.getAttribute('onclick');
      tr.classList.toggle('kgrs-dup', seen.has(k)); seen.add(k);
    });
    d.querySelectorAll('section.kgrs-card').forEach((sec) => {
      const rows = sec.querySelectorAll('table[id^=parc_] tbody tr');
      sec.classList.toggle('kgrs-dup', rows.length > 0 && [...rows].every((tr) => tr.classList.contains('kgrs-dup')));
    });
  }
  function fixTabs() {
    document.querySelectorAll('.ui.pointing.menu .item, .ui.menu .item[data-tab]').forEach((i) => {
      if (i.classList.contains('active')) { i.style.setProperty('background-color', '#d9f244', 'important'); i.style.setProperty('background-image', 'none', 'important'); i.style.setProperty('color', '#141507', 'important'); }
      else { i.style.removeProperty('background-color'); i.style.removeProperty('background-image'); i.style.removeProperty('color'); }
    });
  }
  document.addEventListener('click', (e) => { if (e.target.closest && e.target.closest('.ui.menu .item')) { setTimeout(fixTabs, 30); setTimeout(fixTabs, 300); } }, true);
  function tidy() {
    fixTabs();
    try { dedupeResults(); } catch (e) { /* nije kriticno */ }
    // dugme „Prijava“ (cijeli red) i „Детаљно“ ne trebaju
    const lg = document.getElementById('login');
    if (lg) { const tb = lg.closest('table'); (tb || lg).style.setProperty('display', 'none', 'important'); }
    document.querySelectorAll('#d_info table[id^=parc_] button').forEach((b) => { if (/^Детаљно$/.test(b.textContent.trim())) (b.closest('td') || b).style.setProperty('display', 'none', 'important'); });
    document.querySelectorAll('#d_all p, #d_all div, #d_all span').forEach((e) => {
      if (e.children.length <= 1 && e.textContent.length < 140 && /^\s*Републичка управа за геодетске/.test(e.textContent) && !e.querySelector('input,button,select')) e.style.setProperty('display', 'none', 'important');
    });
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
  /* 3b. LATINICA -> CIRILICA U POLJIMA ZA PRETRAGU                      */
  /* ------------------------------------------------------------------ */
  const L2C = { a: 'а', b: 'б', c: 'ц', č: 'ч', ć: 'ћ', d: 'д', đ: 'ђ', e: 'е', f: 'ф', g: 'г', h: 'х', i: 'и', j: 'ј', k: 'к', l: 'л', m: 'м', n: 'н', o: 'о', p: 'п', r: 'р', s: 'с', š: 'ш', t: 'т', u: 'у', v: 'в', z: 'з', ž: 'ж' };
  function latToCyr(str) {
    let out = '';
    for (const ch of str) {
      const lo = ch.toLowerCase(), up = ch !== lo, last = out.slice(-1), lastLo = last.toLowerCase();
      let c = null;
      // digrafi: nj, lj, dj, dž (prethodno slovo je vec pretvoreno u cirilicu)
      if (lo === 'j' && lastLo === 'н') { out = out.slice(0, -1); c = last === 'Н' ? 'Њ' : 'њ'; }
      else if (lo === 'j' && lastLo === 'л') { out = out.slice(0, -1); c = last === 'Л' ? 'Љ' : 'љ'; }
      else if (lo === 'j' && lastLo === 'д') { out = out.slice(0, -1); c = last === 'Д' ? 'Ђ' : 'ђ'; }
      else if (lo === 'ž' && lastLo === 'д') { out = out.slice(0, -1); c = last === 'Д' ? 'Џ' : 'џ'; }
      else if (L2C[lo]) c = up ? L2C[lo].toUpperCase() : L2C[lo];
      out += c !== null ? c : ch;
    }
    return out;
  }
  // Kad se u polje za pretragu (opština, katastarska opština, naselje, ulica) ukuca latinica, pretvara se u ćirilicu,
  // da bi sajtov filter pronašao stavku. Hvatamo "input" prije nego što ga obradi njihov kod.
  document.addEventListener('input', (e) => {
    const el = e.target;
    if (!el || el.tagName !== 'INPUT' || !el.classList.contains('search') || !el.closest('.ui.dropdown')) return;
    const v = el.value;
    if (!/[A-Za-zČĆŠŽĐčćšžđ]/.test(v)) return;
    const c = latToCyr(v);
    if (c !== v) { el.value = c; try { el.setSelectionRange(c.length, c.length); } catch (err) { /* ok */ } }
  }, true);

  /* ------------------------------------------------------------------ */
  /* 3c. reCAPTCHA PROZOR: CENTRIRAN I SKALIRAN                          */
  /* ------------------------------------------------------------------ */
  let rcWraps = [];
  const RC_RAW = (() => { try { return localStorage.getItem('kgrs.rc.raw') === '1'; } catch (e) { return false; } })();   // dijagnostika: sajtov izvorni prikaz captche, bez naseg preslagivanja
  function fixRecaptcha() {
    if (RC_RAW) return;
    const frames = document.querySelectorAll('iframe[src*="/bframe"]');
    const active = [];
    frames.forEach((fr) => {
      let wrap = fr; while (wrap.parentElement && wrap.parentElement !== document.body) wrap = wrap.parentElement;
      if (!wrap.parentElement) return;
      const st = wrap.style;   // njihov inline stil; racunati (computed) bi pokazao ono sto smo mi forsirali
      const open = st.display !== 'none' && st.visibility !== 'hidden' && !(st.opacity !== '' && parseFloat(st.opacity) < 0.1)
        && !(parseFloat(st.top) < -1000 || parseFloat(st.left) < -1000) && fr.offsetWidth > 50 && fr.offsetHeight > 50;
      let box = fr; while (box.parentElement && box.parentElement !== wrap) box = box.parentElement;
      wrap.classList.toggle('kgrs-rc-off', !open);
      if (!open) { if (wrap.classList.contains('kgrs-rc-wrap')) { wrap.classList.remove('kgrs-rc-wrap'); box.classList.remove('kgrs-rc-box'); box.style.removeProperty('width'); box.style.removeProperty('height'); } return; }
      const w = fr.offsetWidth, hh = fr.offsetHeight;
      const k = Math.min(1, (innerWidth - 12) / w, (innerHeight - 12) / hh);
      wrap.classList.add('kgrs-rc-wrap'); box.classList.add('kgrs-rc-box');
      box.style.setProperty('width', w + 'px', 'important'); box.style.setProperty('height', hh + 'px', 'important');
      box.style.setProperty('--rcs', String(k)); active.push(wrap);
    });
    rcWraps = active;
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
  // Prekrivac se prikazuje TEK nakon klika na „Прикажи на мапи“ (a ne cim mapa postoji u stranici)
  let mapRequested = 0; // vrijeme zahtjeva, 0 = nije trazena
  document.addEventListener('click', (e) => {
    const t = e.target;
    const b = t.closest && t.closest('button[onclick*="jumpTo"]');
    if (b) { cancelCleanup(); unforce(); try { captureParcel(b); } catch (err) { /* nije kriticno */ } mapRequested = Date.now(); return; }
    const c = t.closest && t.closest('.button, button');
    if (c && /^Затвори$/.test(c.textContent.trim())) mapRequested = 0;
  }, true);
  // Element je stvarno vidljiv: ima dimenzije, a ni on ni roditelji nisu display:none / visibility:hidden / providni
  function isShown(el) {
    if (!el || !el.getClientRects().length) return false;
    for (let e = el; e && e.nodeType === 1; e = e.parentElement) {
      const cs = getComputedStyle(e);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    }
    const r = el.getBoundingClientRect();
    return r.width > 50 && r.height > 50;
  }

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
  let compassH = null, compassVec = null, moveH = null, moveT = 0, trail = [], tapCoord = null, tapFeat = null, lastOri = 0, hiddenOvl = [];
  let raw = null;        // filtrirana pozicija bez kalibracije {x,y,acc,t}
  let cal = null;        // {dx,dy,t}
  try { cal = JSON.parse(localStorage.getItem(CAL_KEY)); } catch (e) { cal = null; }
  if (cal && !cal.pts) cal = { pts: [{ dx: cal.dx, dy: cal.dy, w: 1 }], dx: cal.dx, dy: cal.dy, t: cal.t };
  if (cal && (!cal.t || Date.now() - cal.t > 12 * 3600 * 1000)) cal = null;     // GPS pomak se mijenja tokom dana
  function calMean() {
    const W = cal.pts.reduce((a, q) => a + q.w, 0);
    cal.dx = cal.pts.reduce((a, q) => a + q.dx * q.w, 0) / W; cal.dy = cal.pts.reduce((a, q) => a + q.dy * q.w, 0) / W;
    return Math.max(...cal.pts.map((q) => Math.hypot(q.dx - cal.dx, q.dy - cal.dy)));   // rasipanje
  }
  const KF = { x: null, y: null, vx: 0, vy: 0, P: 0, t: 0, X: null, Y: null };   // X, Y: stanje po osi {p, v, a, b, c} (a=var(p), b=cov, c=var(v))

  let outl = 0;
  const KQ = 0.5;                                  // sum ubrzanja (m²/s³): manje = glatko, vise = brza reakcija na skretanje/zaustavljanje
  function kfNew(z, R) { return { p: z, v: 0, a: R, b: 0, c: 4 }; }
  function kfPredict(s, dt, q) { s.p += s.v * dt; const a = s.a + 2 * dt * s.b + dt * dt * s.c + q * dt * dt * dt / 3, b = s.b + dt * s.c + q * dt * dt / 2; s.a = a; s.b = b; s.c += q * dt; }
  function kfUpdate(s, z, R) { const S = s.a + R, kp = s.a / S, kv = s.b / S, y = z - s.p; s.p += kp * y; s.v += kv * y; s.c -= kv * s.b; s.b *= 1 - kp; s.a *= 1 - kp; }
  /** Filter pozicije sa brzinom: nema kasnjenja pri hodanju (za razliku od modela "stojim"), a u mirovanju glada sum. */
  function kalman(x, y, acc, t) {
    const R = Math.max(acc, 1) ** 2;
    if (KF.X === null || t - KF.t > 15000) { KF.X = kfNew(x, R); KF.Y = kfNew(y, R); KF.t = t; outl = 0; }
    else {
      const dt = Math.min(Math.max((t - KF.t) / 1000, 0.05), 10);
      kfPredict(KF.X, dt, KQ); kfPredict(KF.Y, dt, KQ);
      const ix = x - KF.X.p, iy = y - KF.Y.p, d = Math.hypot(ix, iy), S = (KF.X.a + KF.Y.a) / 2 + R;
      let Reff = R, fresh = false;
      if (d > 8 && d > 4 * Math.sqrt(S)) {                                        // nagli skok: vjerovatno lose mjerenje
        if (++outl < 2) Reff = R * 25;                                             // prvo ga gotovo ignorisi,
        else { outl = 0; KF.X = kfNew(x, R); KF.Y = kfNew(y, R); fresh = true; }   // ako se ponovi, prihvati kao pravo kretanje
      } else outl = 0;
      if (!fresh) { kfUpdate(KF.X, x, Reff); kfUpdate(KF.Y, y, Reff); }
      KF.t = t;
    }
    KF.x = KF.X.p; KF.y = KF.Y.p; KF.vx = KF.X.v; KF.vy = KF.Y.v; KF.P = (KF.X.a + KF.Y.a) / 2;
  }
  const calibrated = () => (cal ? [raw.x + cal.dx, raw.y + cal.dy] : [raw.x, raw.y]);

  /* ---- ZIVA TACKA: zeleni DOM element (overlay) + animacija na 60 fps, nezavisno od ucestalosti GPS-a ---- */
  const ME_HTML = '<div class="kgrs-me-acc"></div><div class="kgrs-me-pulse"></div><div class="kgrs-me-dir"><svg viewBox="0 0 120 120" width="120" height="120"><defs><radialGradient id="kgrs-cone" cx="60" cy="60" r="60" gradientUnits="userSpaceOnUse"><stop offset="0.1" stop-color="#34d27a" stop-opacity="0.5"/><stop offset="1" stop-color="#34d27a" stop-opacity="0"/></radialGradient></defs><path d="M60 60 L35 6 A62 62 0 0 1 85 6 Z" fill="url(#kgrs-cone)"/><path d="M60 15 L66.5 31 L60 27 L53.5 31 Z" fill="#fff" stroke="#34d27a" stroke-width="1.6" stroke-linejoin="round"/></svg></div><div class="kgrs-me-dot"></div>';
  let meOv = null, meEl = null, meDir = null, meAcc = null, resKey = null;
  const cur = { x: 0, y: 0, ok: false };
  let tgt = null, hCur = null, hTgt = null, raf = 0, lastFrame = 0, lastCenter = 0;
  const angDiff = (a, b) => ((a - b + 540) % 360) - 180;

  function ensureGpsLayer(map) {            // vektorski sloj samo za krug tacnosti i oznaku dodira
    if (gpsLayer && allLayers(map.getLayers(), []).includes(gpsLayer)) return;
    gpsSource = new ol.source.Vector();
    gpsLayer = new ol.layer.Vector({
      source: gpsSource, zIndex: 9999,
      style: (f) => {
        try {
          const k = f.get('k');
          if (k === 'acc') return new ol.style.Style({ fill: new ol.style.Fill({ color: 'rgba(52,210,122,.10)' }), stroke: new ol.style.Stroke({ color: 'rgba(52,210,122,.55)', width: 1.25 }) });
          if (k === 'me') return new ol.style.Style({ image: new ol.style.Circle({ radius: 9, stroke: new ol.style.Stroke({ color: '#ffffff', width: 3 }), fill: new ol.style.Fill({ color: '#34d27a' }) }) });
          if (k === 'tap') return new ol.style.Style({ image: new ol.style.Circle({ radius: 10, stroke: new ol.style.Stroke({ color: '#d9f244', width: 3 }), fill: new ol.style.Fill({ color: 'rgba(217,242,68,.18)' }) }) });
        } catch (e) { /* ok */ }
        return new ol.style.Style({});
      },
    });
    map.addLayer(gpsLayer);
    map.on('pointerdrag', onDrag);
  }
  function onDrag() { if (follow && watchId !== null) { follow = false; refs.recenter.style.opacity = '1'; } }

  function ensureMe(map) {
    if (meOv && map.getOverlays().getArray().includes(meOv)) return;
    meEl = document.createElement('div'); meEl.className = 'kgrs-me'; meEl.innerHTML = ME_HTML; meDir = meEl.querySelector('.kgrs-me-dir'); meAcc = meEl.querySelector('.kgrs-me-acc');
    resKey = map.getView().on('change:resolution', updateAcc);
    meOv = new ol.Overlay({ element: meEl, positioning: 'center-center', stopEvent: false });
    map.addOverlay(meOv);
  }
  function destroyMe(map) {
    if (raf) cancelAnimationFrame(raf); raf = 0;
    if (meOv && map) { try { map.removeOverlay(meOv); } catch (e) { /* ok */ } }
    if (resKey && map) { try { map.getView().un('change:resolution', updateAcc); } catch (e) { /* ok */ } } resKey = null;
    if (meFeat && gpsSource) { try { gpsSource.removeFeature(meFeat); } catch (e) { /* ok */ } } meFeat = null;
    meOv = meEl = meDir = meAcc = null; cur.ok = false; tgt = null; hCur = null; hTgt = null;
  }
  /** Krug tacnosti je DOM element velicine iz metara (r / rezolucija): pomjera se zajedno sa tackom, bez ponovnog crtanja mape. */
  function updateAcc() {
    const map = getMap(); if (!meAcc || !raw || !map) return;
    const res = map.getView().getResolution(); if (!res) return;
    const d = Math.max(2 * Math.max(raw.acc, 0.5) / res, 6);
    meAcc.style.width = meAcc.style.height = d.toFixed(1) + 'px'; meAcc.style.left = meAcc.style.top = (-d / 2).toFixed(1) + 'px';
  }
  function kick() { if (!raf) { lastFrame = 0; raf = requestAnimationFrame(frame); } }
  /** Petlja crtanja: tacka klize ka cilju, pravac se glatko okrece; staje cim sve konvergira (stedi bateriju). */
  function frame(t) {
    raf = 0; if (!meOv || !tgt) return;
    const dt = lastFrame ? Math.min(100, t - lastFrame) : 16; lastFrame = t;
    let busy = false;
    if (raw) { tgt = targetNow(); if (Math.hypot(raw.vx || 0, raw.vy || 0) > 0.4 && Date.now() - raw.t < 1700) busy = true; }
    const dx = tgt[0] - cur.x, dy = tgt[1] - cur.y, d = Math.hypot(dx, dy);
    if (d > 60) { cur.x = tgt[0]; cur.y = tgt[1]; }
    else if (d > 0.01) { const k = 1 - Math.exp(-dt / 110); cur.x += dx * k; cur.y += dy * k; busy = true; }
    meOv.setPosition([cur.x, cur.y]);
    if (t - lastMk > 600) { lastMk = t; fallbackMe([cur.x, cur.y]); } else if (meFeat) fallbackMe([cur.x, cur.y]);
    if (hTgt !== null && meDir) {
      if (hCur === null) hCur = hTgt;
      else { const df = angDiff(hTgt, hCur); if (Math.abs(df) > 0.08) { hCur = (hCur + df * (1 - Math.exp(-dt / 65)) + 360) % 360; busy = true; } else hCur = hTgt; }
      meDir.style.transform = 'rotate(' + hCur.toFixed(2) + 'deg)'; meEl.classList.add('has-dir');
    }
    const map = getMap();
    if (follow && map && t - lastCenter >= 200) {                                   // mapu ne crtamo svaki kadar: pomjeramo je mekom animacijom tek kad tacka ode ~70 px od centra
      const v = map.getView(), px = map.getPixelFromCoordinate([cur.x, cur.y]), sz = map.getSize();
      if (px && sz && !v.getAnimating() && Math.hypot(px[0] - sz[0] / 2, px[1] - sz[1] / 2) > 70) { lastCenter = t; v.animate({ center: [cur.x, cur.y], duration: 450 }); }
    }
    if (busy) raf = requestAnimationFrame(frame);
  }
  /** Cilj tacke u ovom trenutku: posljednja pozicija + brzina * proteklo vrijeme (do 1.6 s), pa tacka klizi i izmedju GPS ocitavanja. */
  function targetNow() {
    const c = calibrated(), age = Math.min(1.6, (Date.now() - raw.t) / 1000), sp = Math.hypot(raw.vx || 0, raw.vy || 0);
    return sp > 0.4 ? [c[0] + raw.vx * age, c[1] + raw.vy * age] : c;
  }
  function aim(deg) { hTgt = ((deg % 360) + 360) % 360; kick(); }

  function onPos(p) {
    const map = getMap();
    if (!map) return;
    let xy;
    try { xy = ol.proj.transform([p.coords.longitude, p.coords.latitude], 'EPSG:4326', map.getView().getProjection()); }
    catch (e) { return setPill('bad', 'Greška koordinata', e.message); }
    const acc = p.coords.accuracy || 99;
    if (acc > 60 && raw) return;                  // odbaci jako loša mjerenja kad već imamo poziciju
    kalman(xy[0], xy[1], acc, Date.now());
    raw = { x: KF.x, y: KF.y, vx: KF.vx, vy: KF.vy, acc, t: Date.now() };
    // kurs: iz kretanja (ako se krecemo), inace iz GPS-a (brzina > 0.8 m/s); kad stojimo vlada kompas
    trail.push({ x: raw.x, y: raw.y, t: raw.t }); while (trail.length > 1 && raw.t - trail[0].t > 8000) trail.shift();
    const o = trail[0], mdx = raw.x - o.x, mdy = raw.y - o.y;
    if (Math.hypot(mdx, mdy) >= 3) { moveH = (Math.atan2(mdx, mdy) * 180 / Math.PI + 360) % 360; moveT = raw.t; if (hTgt === null || Math.abs(angDiff(moveH, hTgt)) > 2) aim(moveH); }
    else if (typeof p.coords.heading === 'number' && isFinite(p.coords.heading) && p.coords.speed > 0.8) { moveH = p.coords.heading; moveT = raw.t; if (hTgt === null || Math.abs(angDiff(moveH, hTgt)) > 2) aim(moveH); }
    drawGps(map);
    if (mounted && mounted.direct && !mounted.focused) {
      mounted.focused = true; follow = true;
      try { map.getView().animate({ center: calibrated(), resolution: focusRes(map.getView()), duration: 450 }); } catch (e) { /* ok */ }
      queryMyParcel(true);
    }
    refreshStatus();
  }

  let meFeat = null, lastMk = 0;
  function markerOk() {
    try { const d = meEl && meEl.querySelector('.kgrs-me-dot'); if (!d || !d.isConnected) return false; const r = d.getBoundingClientRect(), cs = getComputedStyle(d); return r.width > 2 && cs.visibility !== 'hidden' && cs.display !== 'none'; } catch (e) { return false; }
  }
  /** Ako DOM oznaka iz bilo kojeg razloga nije vidljiva, pozicija se crta kao tacka na samoj mapi. */
  function fallbackMe(c) {
    try {
      if (!gpsSource) return;
      if (markerOk()) { if (meFeat) { gpsSource.removeFeature(meFeat); meFeat = null; } return; }
      if (!meFeat) { meFeat = new ol.Feature(new ol.geom.Point(c)); meFeat.set('k', 'me'); gpsSource.addFeature(meFeat); }
      else meFeat.getGeometry().setCoordinates(c);
    } catch (e) { /* ok */ }
  }
  function drawGps(map) {
    try { ensureGpsLayer(map); } catch (e) { setHint('Sloj pozicije: ' + e.message, true, 8000); }
    try { ensureMe(map); } catch (e) { setHint('Oznaka pozicije: ' + e.message, true, 8000); }
    const c = raw ? targetNow() : calibrated(); tgt = c;
    updateAcc(); fallbackMe(c);
    if (!cur.ok) { cur.x = c[0]; cur.y = c[1]; cur.ok = true; meOv.setPosition(c); if (follow) map.getView().setCenter(c); }
    kick();
  }
  function addTap() {
    const map = getMap(); if (!map || !tapCoord) return;
    ensureGpsLayer(map);
    if (tapFeat) { try { gpsSource.removeFeature(tapFeat); } catch (e) { /* ok */ } }
    tapFeat = new ol.Feature(new ol.geom.Point(tapCoord)); tapFeat.set('k', 'tap'); gpsSource.addFeature(tapFeat);
  }
  function clearTap() { tapCoord = null; if (tapFeat && gpsSource) { try { gpsSource.removeFeature(tapFeat); } catch (e) { /* ok */ } } tapFeat = null; }

  /* ---- kompas: rotaciona matrica, kontinualno mjesanje gornje ivice i zadnje kamere (bez prekidaca), glađenje po vektoru ---- */
  function compassVector(alpha, beta, gamma) {
    const d = Math.PI / 180, z = alpha * d, x = beta * d, y = gamma * d;
    const cZ = Math.cos(z), sZ = Math.sin(z), cX = Math.cos(x), sX = Math.sin(x), cY = Math.cos(y), sY = Math.sin(y);
    const topE = -cX * sZ, topN = cX * cZ;                                           // y-osa uredjaja (gornja ivica), horizontalna projekcija
    const backE = -(cZ * sY + cY * sZ * sX), backN = -(sZ * sY - cZ * cY * sX);      // -z osa (zadnja kamera)
    return [topE + backE, topN + backN];                                              // oba pokazuju isti kurs; zbir nema "skoka" pri nagibu
  }
  const screenAngle = () => ((screen.orientation && screen.orientation.angle) || window.orientation || 0);
  function onOrient(e) {
    if (e.alpha === null || e.alpha === undefined) return;
    if (e.type === 'deviceorientation' && !e.absolute) return;      // relativni alpha nije sjever
    const now = performance.now(), dt = lastOri ? now - lastOri : 33; if (dt < 20) return; lastOri = now;
    const v = compassVector(e.alpha, e.beta || 0, e.gamma || 0), m = Math.hypot(v[0], v[1]); if (m < 0.05) return;
    const ux = v[0] / m, uy = v[1] / m;
    if (!compassVec) compassVec = [ux, uy];
    else {
      // vremenska konstanta zavisi od velicine promjene: veliki okret = brzo (45 ms), sum = jako glađenje (160 ms); ne zavisi od ucestalosti senzora
      const diff = Math.abs(angDiff(Math.atan2(ux, uy) * 180 / Math.PI, Math.atan2(compassVec[0], compassVec[1]) * 180 / Math.PI));
      const a = 1 - Math.exp(-Math.min(dt, 200) / (diff > 35 ? 45 : diff > 12 ? 90 : 160));
      compassVec = [compassVec[0] + (ux - compassVec[0]) * a, compassVec[1] + (uy - compassVec[1]) * a];
    }
    compassH = (Math.atan2(compassVec[0], compassVec[1]) * 180 / Math.PI + screenAngle() + 720) % 360;
    if (Date.now() - moveT > 3000 && (hTgt === null || Math.abs(angDiff(compassH, hTgt)) > 1.2)) aim(compassH);   // mrtva zona od 1.2 stepena (bez treperenja)
  }

  function datumWarning(map) {
    try {
      const d = window.proj4 && proj4.defs && proj4.defs(map.getView().getProjection().getCode());
      if (!d) return '';
      return d.datum_params || /towgs84|nadgrids/i.test(JSON.stringify(d)) ? '' : 'Sajt ne definiše pomak datuma (towgs84): tačka može biti pomjerena. <b>Obavezno kalibrišite.</b>';
    } catch (e) { return ''; }
  }
  function start() {
    const map = getMap();
    if (!map) return;
    const dw = datumWarning(map); if (dw) setHint(dw, true, 9000);
    if (!navigator.geolocation) return setPill('bad', 'GPS nije podržan', '');
    refs.go.className = 'go wait'; refs.goT.textContent = 'Traži…';
    setPill('warn', 'Tražim signal…', '');
    follow = true;
    setTimeout(() => { if (watchId !== null && !raw) { setPill('bad', 'Nema signala', ''); setHint('GPS ne javlja poziciju. Provjerite da je <b>lokacija uključena</b> i da je aplikaciji <b>dozvoljen pristup lokaciji</b> (Podešavanja → Aplikacije).', true, 10000); } }, 20000);
    window.addEventListener('deviceorientationabsolute', onOrient, true); window.addEventListener('deviceorientation', onOrient, true);
    watchId = navigator.geolocation.watchPosition(onPos, (e) => { setPill('bad', 'GPS greška', e.message); },
      { enableHighAccuracy: true, maximumAge: 500, timeout: 25000 });
    try { navigator.wakeLock && navigator.wakeLock.request('screen').then((w) => { wakeLock = w; }).catch(() => {}); } catch (e) { /* ok */ }
  }
  function stop() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    window.removeEventListener('deviceorientationabsolute', onOrient, true); window.removeEventListener('deviceorientation', onOrient, true);
    watchId = null; raw = null; KF.X = null; KF.x = null; compassH = null; compassVec = null; moveH = null; moveT = 0; trail = [];
    destroyMe(getMap());
    try { wakeLock && wakeLock.release(); } catch (e) { /* ok */ }
    refs.go.className = 'go'; refs.goT.textContent = 'Kreni';
    setPill('', 'GPS isključen', ''); refreshStatus();
  }

  function beginCalibration() {
    const map = getMap();
    if (!map || !raw) return setHint('Prvo uključite GPS (dugme <b>Kreni</b>) i sačekajte signal.', true);
    calMode = true;
    setHint('Stanite na <b>poznatu tačku</b> (ćošak parcele, međni kamen), mirujte par sekundi i <b>dodirnite tu tačku na mapi</b>. Blizu ćoška se poravna na ćošak.' + (cal ? ' <b>Dodajete još jednu tačku</b> (prosjek je tačniji).' : '') + '<br><button id="kgrs-cal-x">Odustani</button>');
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
    const pt = { dx: t[0] - raw.x, dy: t[1] - raw.y, w: 1 / Math.max(KF.P, 1) };
    if (!cal) cal = { pts: [], dx: 0, dy: 0, t: 0 };
    cal.pts.push(pt); if (cal.pts.length > 6) cal.pts.shift();
    cal.t = Date.now();
    const spread = calMean();
    try { localStorage.setItem(CAL_KEY, JSON.stringify(cal)); } catch (err) { /* ok */ }
    drawGps(getMap()); refreshStatus();
    let msg = `Kalibracija: pomak <b>${Math.hypot(cal.dx, cal.dy).toFixed(1)} m</b>${snapped ? ' (poravnato na ćošak)' : ''}, tačaka: ${cal.pts.length}.`;
    if (cal.pts.length > 1 && spread > 4) msg += ` <b>Tačke se ne slažu (±${spread.toFixed(1)} m)</b>: vjerovatno neprecizan dodir. Uklonite kalibraciju (✕) i ponovite.`;
    else if (cal.pts.length === 1) msg += ' Za veću tačnost dodajte još jednu tačku (drugi ćošak).';
    setHint(msg, true, 9000);
  }
  function resetCalibration() {
    cal = null; try { localStorage.removeItem(CAL_KEY); } catch (e) { /* ok */ }
    if (raw) drawGps(getMap()); refreshStatus(); setHint('Kalibracija uklonjena.', true);
  }
  let hintTimer = 0;
  function setHint(html, auto, ms) {
    refs.hint.innerHTML = html; refs.hint.classList.toggle('on', !!html);
    clearTimeout(hintTimer); if (auto && html) hintTimer = setTimeout(() => refs.hint.classList.remove('on'), ms || 4500);
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
    const right = h('div', 'right'); right.append(pill, recenter);
    top.append(close, right);

    const hint = h('div', 'hint glass');
    const rail = h('div', 'rail');
    const bLayers = h('button', 'rb glass', '▦'); bLayers.title = 'Slojevi mape';
    const bZoomIn = h('button', 'rb glass', '+'); bZoomIn.title = 'Približi';
    const bZoomOut = h('button', 'rb glass', '−'); bZoomOut.title = 'Udalji';
    rail.append(bLayers, bZoomIn, bZoomOut);
    const layers = h('div', 'layers glass');

    const sheet = h('div', 'sheet glass');
    const row1 = h('div', 'row1');
    const tt = h('div'); tt.style.minWidth = 0;
    const t1 = h('div', 't1', 'Parcela'); const t2 = h('div', 't2'); const chips = h('div', 'chips');
    tt.append(t1, t2, chips); row1.append(tt);
    const divider = h('div', 'divider');
    const row2 = h('div', 'row2');
    const st = h('div', 'st off'); const s0 = h('div', 's0'); const s1 = h('div', 's1'); const s2 = h('div', 's2');
    const actions = h('div', 'actions');
    const calBtn = h('button', 'chip-btn', '⌖ Kalibriši');
    const calX = h('button', 'chip-btn x', '✕'); calX.style.display = 'none'; calX.title = 'Ukloni kalibraciju';
    const detBtn = h('button', 'chip-btn', 'Detalji ovdje'); detBtn.style.display = 'none';
    actions.append(calBtn, calX, detBtn);
    st.append(s0, s1, s2, actions); row2.append(st);
    const handle = h('button', 'handle'); handle.title = 'Sklopi/rasklopi';
    const ownersBtn = h('button', 'owners-toggle'); const ownersL = h('b', null, 'Vlasnici'); const ownersC = h('span', null, '');
    ownersBtn.append(ownersL, ownersC);
    const owners = h('ul', 'owners'); const ownersWrap = h('div', 'owners-wrap'); ownersWrap.append(owners);
    const go = h('button', 'go'); const goT = h('span', null, 'Kreni'); go.append(h('i'), goT);
    sheet.append(handle, row1, divider, row2, ownersBtn, ownersWrap, go);

    const detail = h('div', 'detail glass');
    root.append(top, rail, layers, hint, detail, sheet);
    document.body.appendChild(root);
    Object.assign(refs, { root, sheet, layers, detail, detBtn, close, pill, pt, ps, recenter, hint, t1, t2, chips, s0, s1, s2, st, calBtn, calX, ownersBtn, ownersL, ownersC, owners, go, goT });

    go.onclick = () => (watchId === null ? start() : stop());
    handle.onclick = () => sheet.classList.toggle('mini');
    recenter.onclick = () => { follow = true; recenter.style.opacity = '.55'; if (raw) getMap().getView().animate({ center: calibrated(), duration: 250 }); };
    calBtn.onclick = beginCalibration; calX.onclick = resetCalibration;
    detBtn.onclick = () => { if (raw) queryAt(calibrated()); };
    ownersBtn.onclick = () => { owners.classList.toggle('open'); ownersBtn.lastChild.textContent = owners.classList.contains('open') ? 'sakrij ▴' : 'prikaži ▾'; };
    close.onclick = closeMap;
    const zoomBy = (d) => { const v = getMap().getView(); v.animate({ zoom: (v.getZoom() || 0) + d, duration: 200 }); };
    bZoomIn.onclick = () => zoomBy(1); bZoomOut.onclick = () => zoomBy(-1);
    bLayers.onclick = () => { if (layers.classList.toggle('on')) renderLayers(); };
    setPill('', 'GPS isključen', '');
    renderParcel();
  }

  function setPill(cls, a, b) {
    refs.pill.className = 'pill glass ' + cls; refs.pt.textContent = a; refs.ps.textContent = b || '';
  }

  function renderParcel() {
    if (!refs.root) return;
    const direct = !!(mounted && mounted.direct), p = direct ? null : parcel;
    const md = direct ? myDetail : null;
    refs.t1.textContent = p ? p.broj : md ? (md.number || 'Parcela') : direct ? 'Mapa' : 'Parcela';
    refs.t1.classList.toggle('num', !!(p || (md && md.number)));
    refs.t2.textContent = p ? [p.ko, p.opstina].filter(Boolean).map((x) => cyrToLat(x)).join(', ') : md ? (md.sub || 'Dodirnite parcelu za više podataka') : direct ? 'Dodirnite parcelu za površinu i način korišćenja' : 'Pretražite parcelu pa „Prikaži na mapi“';
    refs.chips.textContent = '';
    if (md) { if (md.area) refs.chips.append(h('span', 'a', md.area)); if (md.vrsta) refs.chips.append(h('span', null, md.vrsta)); }
    if (p) {
      if (p.povrsina) { const c = h('span', 'a', p.povrsina); refs.chips.append(c); }
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
    refs.calBtn.textContent = cal ? '⌖ Kalibrisano · ' + Math.hypot(cal.dx, cal.dy).toFixed(1) + ' m' + (cal.pts.length > 1 ? ' (' + cal.pts.length + ')' : '') : '⌖ Kalibriši';
    refs.calBtn.className = 'chip-btn' + (cal ? ' acc' : '');
    refs.detBtn.style.display = 'none'; refs.s0.textContent = '';
    if (watchId === null) {
      refs.st.className = 'st off'; refs.s0.textContent = ''; refs.s1.textContent = ''; refs.s2.textContent = ''; return;
    }
    if (!raw) { refs.st.className = 'st warn'; refs.s1.textContent = 'Tražim GPS signal…'; refs.s2.textContent = 'Izađite na otvoreno'; return; }
    const age = Date.now() - raw.t;
    if (age > 8000) { setPill('bad', 'Slab signal', ''); refs.st.className = 'st bad'; refs.s1.textContent = 'Slab GPS signal'; refs.s2.textContent = 'Posljednje mjerenje prije ' + Math.round(age / 1000) + ' s'; return; }
    const acc = Math.round(raw.acc), c = calibrated();
    setPill(acc <= 5 ? 'ok' : acc <= 15 ? 'warn' : 'bad', 'GPS ±' + acc + ' m', cal ? 'kalibrisano' : acc <= 5 ? 'odlično' : acc <= 15 ? 'dobro' : 'slabo');
    refs.go.className = 'go run'; refs.goT.textContent = 'Stop';
    const direct = !!(mounted && mounted.direct), rings = direct ? (myRings || []) : parcelRings(getMap());
    if (direct) queryMyParcel();
    if (direct && rings.length) {
      const d0 = distRing(c, rings[0]), ins = inRing(c, rings[0]);
      refs.s0.textContent = (d0 >= 1000 ? (d0 / 1000).toFixed(1) + ' km' : d0 < 10 ? d0.toFixed(1).replace('.', ',') + ' m' : Math.round(d0) + ' m') + (ins ? ' do najbliže granice parcele' : ' do parcele');
    }
    if (!rings.length || direct) { refs.detBtn.style.display = ''; refs.st.className = 'st'; refs.s1.textContent = 'Pozicija prikazana'; refs.s2.textContent = 'E ' + c[0].toFixed(1) + ' · N ' + c[1].toFixed(1); return; }
    const ring = rings[0], inside = inRing(c, ring), d = distRing(c, ring);
    const near = d < raw.acc;
    const far = d > 3000, dTxt = d >= 1000 ? (d / 1000).toFixed(1) + ' km' : d.toFixed(1) + ' m';
    refs.st.className = 'st ' + (far ? '' : near ? 'warn' : inside ? 'ok' : 'bad');
    refs.s1.textContent = far ? 'Daleko od tražene parcele' : near ? 'Na međi parcele' : inside ? 'UNUTAR parcele' : 'IZVAN parcele';
    refs.s2.textContent = far ? dTxt + ' · dodirnite mapu za podatke o parceli' : dTxt + ' od najbliže međe' + (near ? ' (unutar greške GPS-a)' : '');
    refs.detBtn.style.display = (!inside || near) ? '' : 'none';   // stojimo na drugoj parceli (ili uz među)
  }

  /* ------------------------------------------------------------------ */
  /* 8. PRIKAZ PREKRIVACA KAD JE MAPA OTVORENA                           */
  /* ------------------------------------------------------------------ */
  /* Mapu NE prepravljamo u njihovom modalu: prebacimo je (map.setTarget) u sopstveni fullscreen sloj,
     a pri zatvaranju je vratimo i njihov modal zatvori njihov kod. Tako nema ostataka ni zatamnjenja. */
  let mounted = null;
  /** Uvodni ekran dok se mapa ucitava: logo, tanka traka i tekst; nestaje kad su plocice nacrtane. */
  function showLoader(map, direct) {
    const old = document.getElementById('kgrs-load'); if (old) old.remove();
    const el = document.createElement('div'); el.id = 'kgrs-load';
    el.innerHTML = SVG_LOGO + '<div class="lb"><i></i></div><small>' + (direct ? 'Učitavam mapu i lociram vas…' : 'Učitavam mapu…') + '</small>';
    document.body.appendChild(el);
    const t0 = Date.now(); let done = false;
    const hide = () => { if (done) return; done = true; const w = Math.max(0, 900 - (Date.now() - t0)); setTimeout(() => { el.classList.add('off'); setTimeout(() => el.remove(), 600); }, w); };
    try { setTimeout(() => { if (map.once) map.once('rendercomplete', hide); }, 700); } catch (e) { /* ok */ }
    setTimeout(hide, 5000);
    return el;
  }
  function mountMap(map, t, direct) {
    showLoader(map, direct);
    const c = document.createElement('div'); c.id = 'kgrsmap'; document.body.appendChild(c);
    mounted = { c, orig: map.getTarget(), t, direct: !!direct };
    map.setTarget(c);
    installBases(map);
    map.on('singleclick', onMapTap);
    try { const v = map.getView(); if (v.getMaxZoom && v.getMaxZoom() < 21 && v.setMaxZoom) v.setMaxZoom(21); } catch (e) { /* ok */ }
    // jedan prst mora pomjerati mapu: osiguraj DragPan bez uslova (neki sajtovi ga ogranice na dva prsta / Ctrl)
    try {
      const ia = map.getInteractions(); mounted.dp = ia.getArray().filter((i) => i instanceof ol.interaction.DragPan);
      mounted.dp.forEach((i) => ia.remove(i)); mounted.dpNew = new ol.interaction.DragPan(); ia.push(mounted.dpNew);
    } catch (e) { /* ok */ }
    map.updateSize();
    refs.root.classList.add('on'); const mbt = document.getElementById('kgrs-mapbtn'); if (mbt) mbt.style.display = 'none';
    if (innerHeight < 700 || innerWidth > innerHeight) refs.sheet.classList.add('mini');
    renderParcel(); refreshStatus();
    setTimeout(() => { map.updateSize(); if (direct) { centerOnMe(map); if (watchId === null) start(); } else fitParcel(map); }, 150);
  }
  /** Mapa otvorena bez pretrage: centriraj na korisnika (jednokratno ocitavanje pozicije). */
  /** Pocetni razmjer: oko 150 m sirine ekrana (vidi se cijela parcela), ne maksimalni zum. */
  const focusRes = (v) => Math.max(0.4, (v.getMinResolution && v.getMinResolution()) || 0);
  function centerOnMe(map) {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition((p) => {
      if (!mounted || !mounted.direct) return;
      try { const v = map.getView(), xy = ol.proj.transform([p.coords.longitude, p.coords.latitude], 'EPSG:4326', v.getProjection()); v.animate({ center: xy, resolution: focusRes(v), duration: 400 }); } catch (e) { /* ok */ }
    }, () => { setHint('Mapa je otvorena. Pritisnite <b>Kreni</b> da vas prati GPS, ili dodirnite parcelu za podatke.', true, 6000); }, { enableHighAccuracy: true, timeout: 8000, maximumAge: 15000 });
  }
  /** Dugme „Mapa“ na pocetnoj stranici: otvara mapu odmah, bez pretrage (captcha treba tek za vlasnike). */
  function openMapDirect() {
    if (mounted) return;
    const map = getMap();
    if (!map || !map.getView) { toast('Sajt mapu učitava tek nakon prve pretrage (traži „Нисам робот“). Pretražite bilo koju parcelu jednom, pa pritisnite <b>Mapa</b>.', 9000); return; }
    cancelCleanup(); mapRequested = 0; mountMap(map, (map.getTargetElement && map.getTargetElement()) || document.body, true);
  }
  /** Parcela se centrira iznad donjeg panela (ako je sajt drzi kao vektor). */
  function fitParcel(map) {
    const rings = parcelRings(map); if (!rings.length) return;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    rings[0].forEach(([x, y]) => { x0 = Math.min(x0, x); y0 = Math.min(y0, y); x1 = Math.max(x1, x); y1 = Math.max(y1, y); });
    const sh = refs.sheet.getBoundingClientRect(), wide = sh.width > innerWidth * 0.7;
    const pad = [70, 30, (wide ? innerHeight - sh.top : 0) + 30, wide ? 30 : Math.min(sh.width, innerWidth * 0.6) + 30];
    map.getView().fit([x0, y0, x1, y1], { padding: pad, maxZoom: 21, duration: 250 });
  }
  function unmountMap() {
    if (!mounted) return;
    const map = getMap();
    if (watchId !== null) stop();
    refs.layers.classList.remove('on'); refs.detail.classList.remove('on'); clearTap(); qSeq++; hiddenOvl.forEach((el) => { el.style.visibility = ''; }); hiddenOvl = [];
    if (map) {
      removeBases(map);
      destroyMe(map);
      if (gpsLayer) { map.removeLayer(gpsLayer); gpsLayer = null; gpsSource = null; }
      map.un('pointerdrag', onDrag); map.un('singleclick', onMapTap);
      try { const ia = map.getInteractions(); if (mounted.dpNew) ia.remove(mounted.dpNew); (mounted.dp || []).forEach((i) => ia.push(i)); } catch (e) { /* ok */ }
      map.setTarget(mounted.orig); map.updateSize();
    }
    myRings = null; myDetail = null; myQ.t = 0; myQ.at = null; const ld = document.getElementById('kgrs-load'); if (ld) ld.remove();
    mounted.c.remove(); mounted = null; mapRequested = 0; const mbt = document.getElementById('kgrs-mapbtn'); if (mbt) mbt.style.display = '';
    refs.root.classList.remove('on');
  }
  // vidljivost bez minimalne velicine (dugmad su mala)
  function visibleEl(e) {
    if (!e || !e.getClientRects().length) return false;
    for (let n = e; n && n.nodeType === 1; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.display === 'none' || cs.visibility === 'hidden' || parseFloat(cs.opacity) < 0.05) return false;
    }
    return true;
  }
  let forcedHidden = [], cleanupTimers = [];
  function unforce() { forcedHidden.forEach((e) => e.classList.remove('kgrs-force-hide')); forcedHidden = []; }
  function cancelCleanup() { cleanupTimers.forEach(clearTimeout); cleanupTimers = []; }          // novo otvaranje mape otkazuje zakazano "odmrzavanje" od prethodnog zatvaranja
  /** Sloj koji gutaa dodire: fixed element (unutar stranice bilo koje velicine, izvan nje veci dio ekrana) ili aktivni dimmer. */
  function isBlocker(e, da, precise) {
    if (!e || e === document.body || e === document.documentElement || e === da) return false;
    if (e.closest('#kgrs') || e.closest('#kgrsmap') || e.closest('.kgrs-rc-wrap') || e.closest('#kgrs-toast')) return false;
    const cs = getComputedStyle(e); if (cs.pointerEvents === 'none' || cs.display === 'none' || cs.visibility === 'hidden') return false;
    const r = e.getBoundingClientRect(); if (r.width < 4 || r.height < 4) return false;
    if (precise && !(da && da.contains(e))) return true;                  // tacno na mjestu dodira: sve iznad stranice guta dodir, bez obzira na velicinu
    const big = r.width >= innerWidth * 0.4 && r.height >= innerHeight * 0.25;
    if (cs.position === 'fixed') return da && da.contains(e) ? true : big;   // unutar stranice fixed ne bi trebalo da postoji
    return /(^|\s)dimmer(\s|$)/.test(typeof e.className === 'string' ? e.className : '') && big;
  }
  function hideBlocker(e) { if (!e.classList.contains('kgrs-force-hide')) { e.classList.add('kgrs-force-hide'); forcedHidden.push(e); } }
  function blockersAt(x, y, precise) {
    const da = document.getElementById('d_all'), out = [];
    for (const e of document.elementsFromPoint(x, y)) { if (e === da) break; if (isBlocker(e, da, precise)) out.push(e); }
    return out;
  }
  /** Safety net: nakon zatvaranja mape ne smije ostati nijedan sloj preko stranice koji guta dodire. */
  function unfreeze() {
    if (mounted || mapRequested) return;                       // mapa se upravo otvara: njihov modal je legitimno vidljiv
    const da = document.getElementById('d_all');
    if (da) { da.style.setProperty('overflow-y', 'auto', 'important'); da.style.setProperty('overflow-x', 'hidden', 'important'); }
    document.body.classList.remove('dimmed', 'dimmable', 'scrolling');
    [[0.5, 0.5], [0.5, 0.25], [0.5, 0.8], [0.15, 0.5], [0.85, 0.5]].forEach(([fx, fy]) => blockersAt(innerWidth * fx, innerHeight * fy).forEach(hideBlocker));
    document.querySelectorAll('.ui.dimmer, .dimmer, .ui.modal, .modals, [style*="position: fixed"], [style*="position:fixed"]').forEach((e) => { if (isBlocker(e, da)) hideBlocker(e); });
  }
  function closeMap() {
    const t = mounted && mounted.t;
    const modal = t && (t.closest('.ui.modal') || t.closest('[class*=modal]'));
    const wasDirect = mounted && mounted.direct;
    unmountMap();
    if (wasDirect) return;                                  // njihov modal nije ni otvaran
    // njihov modal zatvara njihov kod: trazimo dugme „Затвори“ unutar TOG modala (na stranici ih ima vise)
    const all = [...document.querySelectorAll('.ui.button, button, .button')].filter((x) => /^Затвори$/.test(x.textContent.trim()));
    const b = (modal && all.find((x) => modal.contains(x))) || all.find(visibleEl) || all[0];
    if (b) b.click();
    cancelCleanup();
    cleanupTimers = [setTimeout(() => ensureClosed(modal, t), 700), setTimeout(unfreeze, 1700), setTimeout(unfreeze, 3500), setTimeout(unfreeze, 7000)];
  }
  // Ako se njihov modal ipak nije zatvorio (a ostavlja zatamnjenje koje blokira dodire), zatvaramo ga preko jQuery-ja, pa na silu.
  function ensureClosed(modal, t) {
    if (!t || !visibleEl(t)) return;
    try { if (window.jQuery && modal) jQuery(modal).modal('hide'); } catch (e) { /* ok */ }
    setTimeout(() => {
      if (!visibleEl(t)) return;
      for (let n = t; n && n !== document.body; n = n.parentElement) {
        if (/(^|\s)(modal|modals|dimmer)(\s|$)/.test(n.className || '')) { n.classList.add('kgrs-force-hide'); forcedHidden.push(n); }
      }
      document.querySelectorAll('.ui.dimmer').forEach((dm) => { if (visibleEl(dm) && !dm.classList.contains('kgrs-force-hide')) { dm.classList.add('kgrs-force-hide'); forcedHidden.push(dm); } });
      document.body.classList.remove('dimmed', 'dimmable', 'scrolling');
    }, 800);
  }
  /* ------------------------------------------------------------------ */
  /* PODLOGE: Esri satelit / OpenStreetMap ispod njihovih slojeva         */
  /* ------------------------------------------------------------------ */
  const BASE_KEY = 'kgrs.base.v1', LINES_KEY = 'kgrs.lines.v1';
  const lsGet = (k, d) => { try { const v = localStorage.getItem(k); return v === null ? d : JSON.parse(v); } catch (e) { return d; } };
  const lsSet = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* ok */ } };
  let baseKey = lsGet(BASE_KEY, 'esri');          // 'esri' | 'osm' | 'rgurs'
  let whiteLines = lsGet(LINES_KEY, true);        // linije granica parcela: bijele sa tamnom ivicom
  let bases = null;                                // { esri, osm, saved:[[layer, visible]], hooks:[[layer, pre, post]] }
  const findLayer = (map, re) => allLayers(map.getLayers(), []).find((l) => re.test(l.get('title') || ''));
  const linesLayers = (map) => allLayers(map.getLayers(), []).filter((l) => /^(Парцеле|Катастарска)/.test(l.get('title') || ''));

  function installBases(map) {
    if (bases) return;
    bases = { saved: [], hooks: [] };
    try {
      bases.esri = new ol.layer.Tile({ zIndex: -20, visible: false, source: new ol.source.XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', maxZoom: 19, crossOrigin: 'anonymous' }) });
      bases.osm = new ol.layer.Tile({ zIndex: -19, visible: false, source: ol.source.OSM ? new ol.source.OSM({ crossOrigin: 'anonymous' })
        : new ol.source.XYZ({ url: 'https://tile.openstreetmap.org/{z}/{x}/{y}.png', maxZoom: 19, crossOrigin: 'anonymous' }) });
      map.addLayer(bases.esri); map.addLayer(bases.osm);
    } catch (e) { bases.esri = bases.osm = null; }
    allLayers(map.getLayers(), []).forEach((l) => bases.saved.push([l, l.getVisible()]));   // za vracanje njihovog stanja pri zatvaranju
    // bijele linije: filter na canvasu samo dok se crtaju njihovi slojevi linija
    linesLayers(map).forEach((l) => {
      const pre = (e) => { if (whiteLines && e.context) e.context.filter = 'invert(1) drop-shadow(0 0 1px rgba(0,0,0,.9))'; };
      const post = (e) => { if (e.context) e.context.filter = 'none'; };
      l.on('prerender', pre); l.on('postrender', post); bases.hooks.push([l, pre, post]);
    });
    applyBase(map);
  }
  function applyBase(map) {
    if (!bases) return;
    const ortho = findLayer(map, /^Орто/);
    const ours = baseKey === 'esri' ? bases.esri : baseKey === 'osm' ? bases.osm : null;
    if (baseKey !== 'rgurs' && !ours) baseKey = 'rgurs';                                  // nasa podloga nije dostupna
    if (bases.esri) bases.esri.setVisible(baseKey === 'esri');
    if (bases.osm) bases.osm.setVisible(baseKey === 'osm');
    if (ortho) ortho.setVisible(baseKey === 'rgurs');
    map.render();
  }
  function removeBases(map) {
    if (!bases) return;
    bases.hooks.forEach(([l, pre, post]) => { l.un('prerender', pre); l.un('postrender', post); });
    [bases.esri, bases.osm].forEach((l) => { if (l) map.removeLayer(l); });
    bases.saved.forEach(([l, v]) => { if (l !== bases.esri && l !== bases.osm) l.setVisible(v); });
    bases = null;
  }

  /** Panel slojeva: podloge (jedna) + njihovi slojevi (prekidaci) + boja linija */
  function renderLayers() {
    const map = getMap(); const box = refs.layers; box.textContent = '';
    const row = (label, on, fn, radio) => {
      const r = h('button', 'lrow' + (on ? ' on' : '') + (radio ? ' radio' : '')); r.append(h('span', null, label), h('span', radio ? 'rd' : 'sw'));
      r.onclick = fn; return r;
    };
    box.append(h('h4', null, 'Podloga'));
    const opts = [];
    if (bases && bases.esri) opts.push(['esri', 'Satelit (Esri)']);
    if (bases && bases.osm) opts.push(['osm', 'Mapa (OpenStreetMap)']);
    if (findLayer(map, /^Орто/)) opts.push(['rgurs', 'Ortofoto RGURS']);
    opts.forEach(([k, label]) => box.append(row(label, baseKey === k, () => { baseKey = k; lsSet(BASE_KEY, k); applyBase(map); renderLayers(); }, true)));
    box.append(h('h4', null, 'Slojevi'));
    let n = 0;
    allLayers(map.getLayers(), []).forEach((l) => {
      const title = l.get('title');
      const vec = l.getSource && l.getSource() && typeof l.getSource().getFeatures === 'function';
      if (!title || vec || l === gpsLayer || (bases && (l === bases.esri || l === bases.osm)) || /^Орто/.test(title)) return;
      n++;
      const r = row(title, l.getVisible(), () => { l.setVisible(!l.getVisible()); r.classList.toggle('on', l.getVisible()); });
      box.append(r);
    });
    if (!n) box.append(h('div', 'none', 'Nema slojeva'));
    box.append(row('Bijele linije parcela', whiteLines, function () { whiteLines = !whiteLines; lsSet(LINES_KEY, whiteLines); this.classList.toggle('on', whiteLines); getMap().render(); }));
    box.append(h('div', 'credit', 'Esri, Maxar, Earthstar Geographics · © OpenStreetMap'));
    // visina panela: do donjeg panela (ili do dna ekrana u landscape-u), sa unutrasnjim skrolom
    const sh = refs.sheet.getBoundingClientRect(), top = box.getBoundingClientRect().top;
    box.style.maxHeight = Math.max(160, (sh.width > innerWidth * 0.7 ? sh.top : innerHeight) - top - 10) + 'px';
  }
  /* ------------------------------------------------------------------ */
  /* DETALJI PARCELE (GetFeatureInfo njihovog WMS-a, kao da kliknemo na mapu) */
  /* ------------------------------------------------------------------ */
  const INFO_FORMATS = ['application/json', 'application/geojson', 'application/vnd.ogc.gml', 'text/html', 'text/plain'];
  const FRIENDLY = [
    [/^(parcela|br_?parc\w*|brparc|parcel\w*|broj|broj_?parc\w*|parc\w*_?broj|parc_?br\w*|парцела|парцеле|број парцеле|бр\.? ?парцеле|парц\w*)$/i, 'Parcela'],
    [/^(ko|kat_?opstina|katastarska_?opstina|ko_?naziv|kat\w*op\w*|ко|кат\.? ?општина|катастарска општина|к\.? ?о\.?)$/i, 'Katastarska opština'],
    [/^(povrsina|površina|pov|area|shape_?area|p_?ukupno|povrsina_?m2|површина|површина парцеле|пов\.?|повр\.?)$/i, 'Površina'],
    [/^(list|br_?lista|brlist\w*|лист|број листа|бр\.? ?листа|пл)$/i, 'List'],
    [/^(opstina|općina|opština|општина|град\/општина|град)$/i, 'Opština'],
    [/^(vlasnik\w*|posjednik\w*|nosilac\w*|власник\w*|носилац\w*|посједник\w*|носиоци права)$/i, 'Vlasnik']];
  const SKIP = /^(geom|geometry|shape|the_geom|boundedby|objectid|fid|gid|id|shape_?length|shape_?len\w*|st_\w+|msgeometry|bbox|featuretype|layer|type|crs|pos|poslist|coordinates|lowercorner|uppercorner)$/i;
  function pairsFromObj(o, out) {
    Object.keys(o || {}).forEach((k) => { const v = o[k]; if (SKIP.test(k) || v === null || v === undefined || typeof v === 'object' || String(v).trim() === '' || String(v).length > 140) return; out.push([k, String(v).trim()]); });
  }
  function parseInfo(text) {
    const t = (text || '').trim(), out = []; if (!t) return out;
    if (t[0] === '{' || t[0] === '[') {
      try { const j = JSON.parse(t); (Array.isArray(j) ? j : (j.features || [j])).slice(0, 3).forEach((f) => pairsFromObj(f.properties || f.attributes || f, out)); return out; } catch (e) { /* nije JSON */ }
    }
    if (t[0] === '<') {
      if (/<(html|body|table)\b/i.test(t)) {
        const d = new DOMParser().parseFromString(t, 'text/html');
        d.querySelectorAll('table').forEach((tb) => {
          const hs = [...tb.querySelectorAll('th')].map((x) => x.textContent.trim());
          let n = 0;
          tb.querySelectorAll('tr').forEach((tr) => {
            const c = [...tr.querySelectorAll('td')].map((x) => x.textContent.trim());
            if (!c.length || n > 2) return;
            if (hs.length >= 2 && c.length === hs.length) { hs.forEach((k, i) => c[i] && out.push([k, c[i]])); n++; }
            else if (c.length === 2 && c[0]) out.push([c[0], c[1]]);
          });
        });
        if (!out.length) { d.body.textContent.split(/\n+/).forEach((l) => { const m = l.match(/^\s*([^:=]{2,40})\s*[:=]\s*(.{1,100})$/); if (m) out.push([m[1].trim(), m[2].trim()]); }); }
        return out;
      }
      const d = new DOMParser().parseFromString(t, 'text/xml');
      if (d.querySelector('parsererror')) return out;
      d.querySelectorAll('*').forEach((e) => {
        if (!e.children.length) { const tx = e.textContent.trim(); if (tx && tx.length <= 140 && !SKIP.test(e.localName)) out.push([e.localName, tx]); }
        [...e.attributes].forEach((a) => { if (!/^(xmlns|xsi|gml|fid|id|srsName|version)/i.test(a.name) && !SKIP.test(a.name) && a.value && a.value.length <= 140 && !/^https?:/.test(a.value)) out.push([a.name, a.value]); });
      });
      return out;
    }
    t.split(/\n+/).forEach((l) => { const m = l.match(/^\s*([^:=]{2,40})\s*[:=]\s*(.{1,100})$/); if (m && !SKIP.test(m[1].trim())) out.push([m[1].trim(), m[2].trim()]); });
    return out;
  }
  const VRSTA_RE = /kultur|klas|vrst|nacin|način|koris|namjen|upotreb|врста|култура|начин|класа/i;
  const cyrOpt = (id, v) => { const sel = document.getElementById(id); if (!sel) return ''; const re = new RegExp('(^|\\D)' + String(v).replace(/[^\w]/g, '') + '(\\D|$)'); const o = [...sel.options].find((x) => x.value === String(v) || (x.value && re.test(x.text))); return o ? o.text.trim() : ''; };
  function buildDetail(pairs) {
    const seen = new Set(), all = []; let area = '', vrsta = '', koName = '', koCode = '', lokacija = '', number = '', kt = '', parcelId = '', derived = false;
    pairs.forEach(([k, v]) => {
      const key = k.toLowerCase(); if (seen.has(key)) return; seen.add(key);
      all.push([k, v]);
      const f = FRIENDLY.find((x) => x[0].test(k)); const label = f ? f[1] : '';
      if (label === 'Površina' && !area) area = /^[\d.,]+$/.test(v) ? v + ' m²' : v;
      else if (label === 'Katastarska opština') { if (/^\d+$/.test(v)) koCode = v; else if (!koName) koName = v; }
      else if (label === 'Parcela' && !number) number = v;
      else if (/^lokacija$/i.test(k) && !lokacija) lokacija = v;
      else if (!parcelId && !/^(pl|list)/i.test(k) && /^\d{12,14}$/.test(String(v).trim())) parcelId = String(v).trim();
      else if (!kt && /^(kt|kc|kč|кт|кч|k_?c|kat_?cest\w*|cestica|čestica)$/i.test(k)) kt = v;
      else if (!vrsta && VRSTA_RE.test(k) && !/_?id$/i.test(k)) vrsta = v;
    });
    if (/^\d{12,14}$/.test(number)) { parcelId = parcelId || number; number = ''; }               // dugi interni ID nije broj parcele
    const okNum = (x) => /^\d{1,6}(\/\d{1,4})?$/.test(x || ''); if (!okNum(number) && okNum(kt)) number = kt;
    // sifra parcele = sifra KO (5 cifara) + broj (5) + podbroj (3): 2001200011022 -> 11/22; ne koristi se ako ne odgovara obliku
    if (!okNum(number) && parcelId) {
      const pre = koCode && parcelId.startsWith(koCode) ? koCode : parcelId.slice(0, 5), rest = parcelId.slice(pre.length);
      if (rest.length === 8) { const n = +rest.slice(0, 5), sb = +rest.slice(5); if (n > 0) { number = sb ? n + '/' + sb : String(n); derived = true; } }
      if (!koCode) koCode = pre;
    }
    const plausible = okNum(number);
    const opName = lokacija ? cyrOpt('ddlPP', lokacija) : '', koDisp = koName || (koCode ? cyrOpt('ddlKO', koCode) : '');
    const place = [koDisp, opName].filter(Boolean).map((x) => cyrToLat(x)).filter((x, i, a) => a.indexOf(x) === i).join(', ');                       // dugi interni ID-evi nisu broj parcele
    return { title: plausible ? number : 'Parcela', sub: place || koName, area, vrsta, number: plausible ? number : '', derived: plausible && derived, parcelId, koName, koCode, lokacija, all };
  }
  function positionDetail() {
    const sh = refs.sheet.getBoundingClientRect();
    refs.detail.style.bottom = sh.width > innerWidth * 0.7 ? Math.round(innerHeight - sh.top + 8) + 'px' : '';
  }
  function showDetail(state, data) {
    const d = refs.detail; d.textContent = ''; d.classList.add('on'); positionDetail();
    const head = h('div', 'dhead'); head.append(h('h3', data && data.number ? 'num' : null, (data && data.title) || 'Parcela ovdje'));
    const x = h('button', 'chip-btn x', '✕'); x.onclick = hideDetail; head.append(x); d.append(head);
    if (state === 'loading') d.append(h('div', 'none', 'Učitavam podatke sa sajta…'));
    else if (state === 'empty') {
      d.append(h('div', 'none', 'Sajt ne vraća podatke za ovu tačku. Dodirnite tačno na parcelu, ili pretražite broj parcele (tamo su i vlasnici).'));
      if (data && data.diag && data.diag.length) d.append(h('div', 'diag', data.diag.slice(0, 12).join(' · ')));
    }
    else {
      if (data.sub) d.append(h('div', 'dsub', data.sub));
      if (data.derived) d.append(h('div', 'dnote', 'Broj izveden iz šifre parcele — uporedite sa brojem na mapi.'));
      const row = (k, v) => { const r = h('div', 'kv'); r.append(h('span', null, k), h('b', null, v)); d.append(r); };
      if (data.area) row('Površina', data.area);
      if (data.vrsta) row('Način korišćenja', data.vrsta);
      const sameP = parcel && data.number && parcel.broj === data.number && data.koName && latToCyr(data.koName).toLowerCase() === (parcel.ko || '').toLowerCase();
      if (sameP && !data.vrsta) parcel.dijelovi.slice(0, 4).forEach((x) => { if (x[0]) row('Način korišćenja', cyrToLat(x[0]) + (x[1] ? ' · ' + x[1] : '')); });
      else if (!data.vrsta) d.append(h('div', 'dnote', 'Način korišćenja sajt ne daje za dodir na mapu; vidi se nakon pretrage (Vlasnici).'));
      if (!data.area && !data.vrsta) d.append(h('div', 'none', 'Sajt nije vratio površinu ni način korišćenja za ovu tačku.'));
      // vlasnici: ako je ovo ista parcela koju smo pretrazili, vec ih imamo; inace idu preko njihove pretrage
      const same = parcel && parcel.vlasnici.length && data.number && parcel.broj === data.number && data.koName && latToCyr(data.koName).toLowerCase() === (parcel.ko || '').toLowerCase();
      const ob = h('div', 'owners-box'); ob.append(h('div', 'okey', 'Vlasnici'));
      if (same) parcel.vlasnici.forEach(([ime, udio]) => { const r = h('div', 'kv'); r.append(h('span', null, ime), h('b', null, udio)); ob.append(r); });
      else {
        const b = h('button', 'chip-btn acc', 'Vlasnici · pretraži'); b.onclick = () => startSearchFlow(data); ob.append(b);
        ob.append(h('div', 'dnote', 'Vlasnici su samo u njihovoj pretrazi: popunim polja, vi potvrdite „Нисам робот“, ostalo ide samo.'));
      }
      d.append(ob);
      const more = h('button', 'dmore', 'Svi podaci sa sajta ▾'); const box = h('div', 'dall'); box.style.display = 'none';
      data.all.forEach(([k, v]) => { const r = h('div', 'kv'); r.append(h('span', null, k), h('b', null, v)); box.append(r); });
      more.onclick = () => { const o = box.style.display === 'none'; box.style.display = o ? '' : 'none'; more.textContent = 'Svi podaci sa sajta ' + (o ? '▴' : '▾'); };
      d.append(more, box);
    }
  }
  let qSeq = 0;
  function hideDetail() { refs.detail.classList.remove('on'); qSeq++; clearTap(); }
  /* ---- tok "Vlasnici": popunimo njihovu pretragu, korisnik potvrdi „Нисам робот“, mi pritisnemo Претражи i otvorimo parcelu ---- */
  let pendingSearch = null;
  const setField = (el, val) => { el.value = val; ['input', 'change'].forEach((t) => el.dispatchEvent(new Event(t, { bubbles: true }))); };
  /** Bira vrijednost u njihovoj Semantic padajucoj listi i PROVJERAVA da se prikazani tekst zaista promijenio (vise nacina, od najvjernijeg). */
  async function setDropdown(id, value) {
    const sel = document.getElementById(id); if (!sel) return false;
    const dd = sel.closest('.ui.dropdown'), $ = window.jQuery, v = String(value), wait = (ms) => new Promise((r) => setTimeout(r, ms));
    const shown = () => { const t = dd && [...dd.children].find((c) => c.classList && c.classList.contains('text')); return t && !t.classList.contains('default') && t.textContent.trim() ? t.textContent.trim() : ''; };
    const ok = () => sel.value === v && (!dd || !!shown());
    const opt = [...sel.options].find((o) => o.value === v);
    if ($ && dd && $.fn && $.fn.dropdown) {
      try { $(dd).dropdown('refresh'); } catch (e) { /* ok */ }
      try { $(dd).dropdown('set selected', v); } catch (e) { /* ok */ }
      await wait(60); if (ok()) return true;
    }
    if (dd) {                                                                                  // klik na stavku liste, kao pravi korisnik
      const it = [...dd.querySelectorAll('.menu .item')].find((e) => e.getAttribute('data-value') === v);
      if (it) { it.click(); await wait(80); if (ok()) return true; }
    }
    sel.value = v; sel.dispatchEvent(new Event('change', { bubbles: true })); await wait(60);
    if (dd && opt && !shown()) {                                                               // lista nema stavku: ispisemo izabrani tekst sami
      const t = [...dd.children].find((c) => c.classList && c.classList.contains('text'));
      if (t) { t.classList.remove('default'); t.textContent = opt.text.trim(); }
    }
    return sel.value === v;
  }
  async function prefillSearch(info) {
    const tab = document.querySelector('.ui.pointing.menu .item[data-tab="first"]'); if (tab && !tab.classList.contains('active')) tab.click();
    const notes = [], inp = document.getElementById('i_parc');
    if (inp && info.number) { setField(inp, info.number); notes.push('parcela ' + info.number); }                       // prvo broj (odmah)
    if (info.lokacija && await setDropdown('ddlPP', info.lokacija)) notes.push('opština');
    if (info.koName || info.koCode) {
      const want = latToCyr(info.koName || '').toLowerCase(), code = String(info.koCode || ''); let ok = false;
      for (let i = 0; i < 28 && !ok; i++) {                                                                  // lista KO se ucitava nakon izbora opstine
        const sel = document.getElementById('ddlKO'), opt = sel && [...sel.options].find((o) => (want && (o.value.toLowerCase() === want || o.text.trim().toLowerCase() === want)) || (code && (o.value === code || new RegExp('(^|\\D)' + code + '(\\D|$)').test(o.text))));
        if (opt) { ok = await setDropdown('ddlKO', opt.value); } else await new Promise((r) => setTimeout(r, 250));
      }
      notes.push(ok ? 'katastarska opština' : '<b>katastarsku opštinu izaberite sami</b> (' + (info.koName || info.koCode) + ')');
    }
    return notes;
  }
  function startSearchFlow(info) {
    hideDetail(); closeMap();
    pendingSearch = { num: info.number || '', id: info.parcelId || '', derived: !!info.derived, t0: Date.now(), clicked: false, sig: '', tc: 0 };
    setTimeout(async () => {
      const da = document.getElementById('d_all'); if (da) da.scrollTo(0, 0);
      const notes = await prefillSearch(info);
      const inp = document.getElementById('i_parc'); if (inp && !inp.value.trim()) { try { inp.focus(); } catch (e) { /* ok */ } }
      const nums = info.number ? '' : ' <small style="opacity:.7">(sa sajta: ' + ((info.all || []).filter(([k, v]) => /\d/.test(v) && String(v).length < 20).slice(0, 8).map(([k, v]) => k + '=' + v).join(', ') || 'nema brojeva') + ')</small>';
      toast('Popunjeno: ' + (notes.join(', ') || 'ništa') + '. Provjerite i potvrdite <b>„Нисам робот“</b>, a pretraga i otvaranje parcele sa vlasnicima idu sami.' + (info.number ? '' : ' <b>Upišite broj parcele</b>.' + nums), 14000);
    }, 1000);
  }
  function searchFlowTick() {
    const ps = pendingSearch; if (!ps) return;
    if (Date.now() - ps.t0 > 240000) { pendingSearch = null; return; }
    const btn = document.getElementById('btnKC'), inp = document.getElementById('i_parc'), box = document.getElementById('d_info');
    if (!ps.clicked) {
      // njihov kod ukljuci dugme tek kad je captcha rijesena; tada ga mi pritisnemo
      if (btn && !btn.classList.contains('disabled') && !btn.disabled && inp && inp.value.trim()) { ps.num = inp.value.trim(); ps.sig = box ? box.innerText : ''; ps.clicked = true; ps.tc = Date.now(); btn.click(); }
      return;
    }
    const rows = [...document.querySelectorAll('#d_info table[id^=parc_] tbody tr')].filter((tr) => tr.querySelector('button[onclick*="jumpTo"]') && !tr.classList.contains('kgrs-dup'));
    if (rows.length && (box ? box.innerText : '') !== ps.sig) {
      const jt = (tr) => tr.querySelector('button[onclick*="jumpTo"]').getAttribute('onclick') || '';
      const row = (ps.id && rows.find((tr) => jt(tr).includes(ps.id))) || rows.find((tr) => ps.num && txt(tr.children[0]) === ps.num) || ((ps.derived || !ps.num) && rows.length > 1 ? null : rows[0]);
      pendingSearch = null;
      if (!row) { toast('Pretraga je vratila više parcela: izaberite pravu iz liste („Prikaži na mapi“).', 9000); return; } if (toastEl) toastEl.classList.remove('on'); row.querySelector('button[onclick*="jumpTo"]').click();     // otvara mapu; panel prikazuje vlasnike
    } else if (Date.now() - ps.tc > 25000) { pendingSearch = null; toast('Pretraga nije vratila rezultat. Pokušajte ponovo.', 6000); }
  }
  /** Tekst iz njihovih OpenLayers overlay-a (tooltip/popup koji njihov kod prikaze na dodir parcele). */
  function overlayTexts(map) {
    const out = [];
    (map.getOverlays ? map.getOverlays().getArray() : []).forEach((o) => {
      const el = o.getElement && o.getElement(); if (!el || el.closest('#kgrs') || el === meEl) return;
      if (o.getPosition && !o.getPosition()) return;                                     // nije prikazan
      const t = ((el.innerText || el.textContent || '').replace(/[ \t]+/g, ' ').replace(/\n\s*\n+/g, '\n')).trim();
      if (t && t.length < 700) out.push(t);
    });
    return out;
  }
  function pairsFromText(text) {
    const out = [];
    text.split(/\n+/).forEach((l, i) => {
      l = l.trim(); if (!l) return;
      const m = l.match(/^([^:=]{2,32})\s*[:=]\s*(.{1,120})$/);
      if (m) out.push([m[1].trim(), m[2].trim()]); else if (out.length < 8) out.push([i === 0 ? 'Sa sajta' : '', l]);
    });
    return out;
  }
  /** Ceka da njihov kod prikaze tooltip (asinhrono) i vraca prvi novi tekst. */
  function waitOverlay(map, before, my) {
    return new Promise((resolve) => {
      const t0 = Date.now();
      const tick = () => {
        if (my !== qSeq) return resolve(null);
        const now = overlayTexts(map).find((t) => !before.includes(t));
        if (now) return resolve(pairsFromText(now));
        if (Date.now() - t0 > 4000) return resolve(null);                                // 4 s po satu
        setTimeout(tick, 250);
      };
      setTimeout(tick, 200);
    });
  }
  /** WMS opis sloja: osnovna adresa + parametri (iz TileWMS/ImageWMS, ili iz probne adrese pločice kad je izvor prilagodjen). */
  function wmsSpec(so, coord, res, proj) {
    let base = null, entries = null;
    try {
      if (typeof so.getParams === 'function') { const pr = so.getParams(); entries = Object.keys(pr).map((k) => [k, pr[k]]); base = (so.getUrls && so.getUrls() && so.getUrls()[0]) || (so.getUrl && so.getUrl()) || null; }
      if (!base && typeof so.getTileUrlFunction === 'function') {
        const g = so.getTileGrid && so.getTileGrid();
        if (g) { const tc = g.getTileCoordForCoordAndResolution(coord, res), u = so.getTileUrlFunction()(tc, 1, proj);
          if (u) { const U = new URL(u, location.href); base = U.origin + U.pathname; entries = []; U.searchParams.forEach((v, k) => entries.push([k, v])); } }
      }
    } catch (e) { return null; }
    if (!base || !entries) return null;
    const P = {}; entries.forEach(([k, v]) => { P[k.toUpperCase()] = v; });
    if (!P.LAYERS && !P.LAYER) return null;
    return { base, entries, P };
  }
  function buildGfi(spec, coord, res, proj, fmt) {
    const P = spec.P, ver = P.VERSION || '1.1.1', v13 = /^1\.3/.test(ver), half = 50, span = (half + 0.5) * res;
    const q = new URLSearchParams();
    spec.entries.forEach(([k, v]) => { if (!/^(BBOX|WIDTH|HEIGHT|REQUEST|FORMAT|TRANSPARENT|TILED|X|Y|I|J|INFO_FORMAT|FEATURE_COUNT|QUERY_LAYERS|SRS|CRS|FORMAT_OPTIONS|TILESORIGIN|MAP_RESOLUTION|DPI|SERVICE|VERSION|STYLES|LAYERS|LAYER)$/i.test(k)) q.set(k, v); });   // zadrzi i njihov authkey
    const layers = P.LAYERS || P.LAYER;
    q.set('SERVICE', 'WMS'); q.set('VERSION', ver); q.set('REQUEST', 'GetFeatureInfo'); q.set('LAYERS', layers); q.set('QUERY_LAYERS', layers); q.set('STYLES', P.STYLES || '');
    q.set(v13 ? 'CRS' : 'SRS', P.SRS || P.CRS || proj.getCode());
    q.set('BBOX', [coord[0] - span, coord[1] - span, coord[0] + span, coord[1] + span].join(','));
    q.set('WIDTH', 2 * half + 1); q.set('HEIGHT', 2 * half + 1); q.set(v13 ? 'I' : 'X', half); q.set(v13 ? 'J' : 'Y', half);
    q.set('INFO_FORMAT', fmt); q.set('FEATURE_COUNT', 5);
    return spec.base + (spec.base.indexOf('?') < 0 ? '?' : '&') + q.toString();
  }
  const maskKey = (u) => u.replace(/((?:auth)?key|token|sid)=([^&]{0,4})[^&]*/ig, '$1=$2…');
  function buildProbes(map, coord) {
    const v = map.getView(), res = v.getResolution(), proj = v.getProjection();
    const rank = (l) => { const t = l.get('title') || ''; return /^Парцеле/.test(t) ? 3 : /^Катастарска/.test(t) ? 2 : l.getVisible() ? 1 : 0; };
    const probes = []; let skipped = 0;
    allLayers(map.getLayers(), []).sort((a, b) => rank(b) - rank(a)).forEach((l) => {
      const so = l.getSource && l.getSource(); if (!so || l === gpsLayer || (bases && (l === bases.esri || l === bases.osm))) return;
      const title = l.get('title') || '?';
      if (typeof so.getFeatureInfoUrl === 'function') { probes.push({ title, kind: 'WMS izvor', url: (fmt) => so.getFeatureInfoUrl(coord, res, proj, { INFO_FORMAT: fmt, FEATURE_COUNT: 5 }) }); return; }
      const spec = wmsSpec(so, coord, res, proj);
      if (spec) probes.push({ title, kind: 'iz adrese pločica', url: (fmt) => buildGfi(spec, coord, res, proj, fmt) });
      else skipped++;
    });
    return { probes, skipped };
  }
  async function gfiQuery(map, coord, my, diag) {
    const { probes, skipped } = buildProbes(map, coord);
    const use = probes.slice(0, 5), acc = [];
    diag.push('slojeva za upit: ' + use.length + (use[0] ? ' (' + use.map((x) => x.title + ' [' + x.kind + ']').join(', ') + ')' : '') + (skipped ? ' · ' + skipped + ' nisu WMS' : ''));
    if (use[0]) { try { diag.push('primjer: ' + maskKey(use[0].url('text/html')).slice(0, 190)); } catch (e) { /* ok */ } }
    const ctl = new AbortController(), to = setTimeout(() => ctl.abort(), 12000);
    try {
      for (const pr of use) {
        if (my !== qSeq) return null;
        const results = await Promise.all(INFO_FORMATS.map(async (fmt) => {
          let url = null;
          try {
            url = pr.url(fmt); if (!url) { diag.push(pr.title + ' ' + fmt.split('/')[1] + ': nema URL'); return []; }
            const r = await fetch(url, { credentials: 'include', signal: ctl.signal });
            const txt = r.ok ? await r.text() : ''; const out = r.ok ? parseInfo(txt) : [];
            diag.push(pr.title + ' ' + fmt.split('/')[1] + ': ' + r.status + ', ' + txt.length + ' B' + (out.length ? ', ' + out.length + ' polja' : '')); return out;
          } catch (e) { diag.push(pr.title + ' ' + fmt.split('/')[1] + ': greška'); return []; }
        }));
        const pairs = results.find((x) => x.length); if (pairs) { acc.push(...pairs); if (buildDetail(acc).number) return acc; }   // trazimo dalje dok se ne nadje broj parcele
      }
    } finally { clearTimeout(to); }
    return acc.length ? acc : null;
  }
  /* ---- parcela ispod nas (direktna mapa): geometrija iz GetFeatureInfo (GeoJSON), samo u memoriji ---- */
  let myRings = null, myDetail = null; const myQ = { busy: false, t: 0, at: null };
  function geomFromInfo(txt, map, c) {
    let j; try { j = JSON.parse((txt || '').trim()); } catch (e) { return null; }
    const feats = (j && j.features) || []; if (!feats.length) return null;
    const v = map.getView(), pr = v.getProjection();
    const cvt = (xy) => (Math.abs(xy[0]) <= 180 && Math.abs(xy[1]) <= 90 ? ol.proj.transform(xy, 'EPSG:4326', pr) : xy);
    const rings = [];
    feats.forEach((f) => {
      const g = f.geometry; if (!g || !g.coordinates) return;
      const polys = g.type === 'Polygon' ? [g.coordinates] : g.type === 'MultiPolygon' ? g.coordinates : [];
      polys.forEach((poly) => { if (poly[0] && poly[0].length > 2) rings.push({ ring: poly[0].map((q) => cvt([q[0], q[1]])), props: f.properties || f.attributes || {} }); });
    });
    const pairs = []; if (feats[0]) pairsFromObj(feats[0].properties || feats[0].attributes || {}, pairs);
    if (!rings.length) return pairs.length ? { rings: null, pairs } : null;
    rings.sort((a, b) => (inRing(c, b.ring) - inRing(c, a.ring)) || distRing(c, a.ring) - distRing(c, b.ring));
    const p2 = []; pairsFromObj(rings[0].props, p2);
    return { rings: [rings[0].ring], pairs: p2.length ? p2 : pairs };
  }
  async function queryMyParcel(force) {
    const map = getMap(); if (!map || !mounted || !mounted.direct || !raw || myQ.busy) return;
    const c = calibrated();
    if (!force) {
      if (myRings && inRing(c, myRings[0])) return;                                    // jos smo na istoj parceli
      if (Date.now() - myQ.t < 4000 || (myQ.at && Math.hypot(c[0] - myQ.at[0], c[1] - myQ.at[1]) < 4)) return;
    }
    myQ.busy = true; myQ.t = Date.now(); myQ.at = c;
    try {
      const { probes } = buildProbes(map, c); let got = null;
      for (const pr of probes.slice(0, 3)) {
        let txt = ''; try { const r = await fetch(pr.url('application/json'), { credentials: 'include' }); txt = r.ok ? await r.text() : ''; } catch (e) { continue; }
        got = geomFromInfo(txt, map, c); if (got) break;
      }
      if (!mounted) return;
      myRings = got && got.rings; myDetail = got && got.pairs.length ? buildDetail(got.pairs) : null;
      renderParcel(); refreshStatus();
    } finally { myQ.busy = false; }
  }
  async function queryAt(coord) {
    const map = getMap(); if (!map) return;
    const my = ++qSeq; tapCoord = coord; addTap();
    hiddenOvl.forEach((el) => { el.style.visibility = ''; }); hiddenOvl = [];             // njihov tooltip mora biti "vidljiv" da ga procitamo
    showDetail('loading');
    const before = overlayTexts(map), diag = []; let shown = false;
    const done = (pairs) => { if (pairs && pairs.length && !shown && my === qSeq) { shown = true; showDetail('ok', buildDetail(pairs)); (map.getOverlays ? map.getOverlays().getArray() : []).forEach((o) => { const el = o.getElement && o.getElement(); if (el && el !== meEl && !el.closest('#kgrs')) { el.style.visibility = 'hidden'; hiddenOvl.push(el); } }); } };
    await Promise.all([gfiQuery(map, coord, my, diag).then(done), waitOverlay(map, before, my).then((p) => { if (!p) diag.push('Njihov tooltip: ništa u 4 s'); else diag.push('Njihov tooltip: pročitan'); done(p); })]).catch(() => {});
    if (!shown && my === qSeq) showDetail('empty', { diag });
  }
  function onMapTap(e) { if (calMode || !mounted) return; queryAt(e.coordinate); }

  /* ------------------------------------------------------------------ */
  /* DOKTOR SKROLA: ako prevlacenje prstom ne skrola stranicu, nadji uzrok i popravi */
  /* ------------------------------------------------------------------ */
  let toastEl = null, toastT = 0;
  function toast(html, ms) {
    if (!toastEl) { toastEl = document.createElement('div'); toastEl.id = 'kgrs-toast'; document.body.appendChild(toastEl); }
    toastEl.innerHTML = html; toastEl.classList.add('on'); clearTimeout(toastT);
    if (ms) toastT = setTimeout(() => toastEl.classList.remove('on'), ms);
  }
  const idOf = (e) => (e.id ? '#' + e.id : '') + (typeof e.className === 'string' && e.className.trim() ? '.' + e.className.trim().split(/\s+/).slice(0, 2).join('.') : '') || e.tagName;
  function runDoctor(t, x, y) {
    const da = document.getElementById('d_all'), notes = []; if (!da) return notes;
    const cs = getComputedStyle(da);
    if (cs.overflowY !== 'auto' && cs.overflowY !== 'scroll') { da.style.setProperty('overflow-y', 'auto', 'important'); notes.push('overflow-y=' + cs.overflowY); }
    if (cs.position !== 'fixed') { da.style.setProperty('position', 'fixed', 'important'); notes.push('position=' + cs.position); }
    if (cs.pointerEvents === 'none') { da.style.setProperty('pointer-events', 'auto', 'important'); notes.push('pointer-events:none na #d_all'); }
    for (let e = t; e && e !== document.documentElement; e = e.parentElement) {
      const c = getComputedStyle(e);
      if (/^(none|pan-x|pinch-zoom)$/.test(c.touchAction)) { e.style.setProperty('touch-action', 'pan-y', 'important'); notes.push('touch-action:' + c.touchAction + ' na ' + idOf(e)); }
    }
    if (notes.some((n) => /^touch-action/.test(n))) addStyle('kgrs-ta-all', 'html body #d_all,html body #d_all *{touch-action:pan-y pinch-zoom!important}');   // cijela stranica, ne samo lanac ispod prsta
    blockersAt(x, y, true).forEach((e) => { hideBlocker(e); notes.push('sloj preko stranice: ' + idOf(e)); });
    document.querySelectorAll('.ui.dimmer, .dimmer, .ui.modal, .modals, [style*="position: fixed"], [style*="position:fixed"]').forEach((e) => { if (isBlocker(e, da)) { hideBlocker(e); notes.push('sloj: ' + idOf(e)); } });
    document.body.classList.remove('dimmed', 'dimmable', 'scrolling');
    return notes;
  }
  let tStart = null, stuckN = 0;
  document.addEventListener('touchstart', (e) => {
    const t = e.touches[0], da = document.getElementById('d_all');
    tStart = { y: t.clientY, x: t.clientX, top: da ? da.scrollTop : 0, target: e.target, time: Date.now() };
  }, { capture: true, passive: true });
  document.addEventListener('touchend', (e) => {
    const s = tStart; tStart = null;
    const da = document.getElementById('d_all'); if (!s || !da || mounted) return;
    const t = e.changedTouches[0], dy = s.y - t.clientY, dx = Math.abs(s.x - t.clientX);
    if (Math.abs(dy) < 60 || dx > Math.abs(dy) || Date.now() - s.time > 1500) return;           // nije brzi vertikalni potez
    if (s.target.closest && s.target.closest('.ui.dropdown .menu, iframe, textarea, #kgrs, #kgrsmap, .kgrs-rc-wrap')) return;
    setTimeout(() => {
      const max = da.scrollHeight - da.clientHeight; if (max <= 4) return;
      const moved = Math.abs(da.scrollTop - s.top) > 1, atEdge = (dy < 0 && s.top <= 1) || (dy > 0 && s.top >= max - 1);
      if (moved || atEdge) { stuckN = 0; return; }
      if (++stuckN < 2) return;
      stuckN = 0;
      const notes = runDoctor(s.target, s.x, s.y);
      toast(notes.length ? 'Skrol je bio blokiran, popravljeno: <b>' + notes.join('; ') + '</b>. Pokušajte ponovo.'
        : 'Skrol ne reaguje (uzrok nije nađen). <button id="kgrs-reload">Osvježi stranicu</button>', notes.length ? 9000 : 0);
      const rb = document.getElementById('kgrs-reload'); if (rb) rb.onclick = () => location.reload();
    }, 250);
  }, { capture: true, passive: true });

  function sync() {
    const map = getMap();
    if (!refs.root || !map) return;
    if (!mounted) {
      if (mapRequested && Date.now() - mapRequested > 8000) mapRequested = 0;           // mapa se nije otvorila
      const t = map.getTargetElement && map.getTargetElement();
      if (mapRequested && isShown(t)) mountMap(map, t);                                  // tek nakon klika na „Прикажи на мапи“
    }
    refs.root.classList.toggle('on', !!mounted);
  }

  /* ---- pocetna: zaglavlje, dugme „Otvori mapu“, naslov pretrage, podnozje ---- */
  const SVG_LOGO = '<svg viewBox="0 0 32 32" aria-hidden="true"><rect width="32" height="32" rx="9" fill="#d9f244"/><path d="M8 21.5 11 9l11.5 3.5L24 22l-8.5 2z" fill="none" stroke="#141507" stroke-width="1.8" stroke-linejoin="round"/><circle cx="16.5" cy="17" r="2.6" fill="#141507"/></svg>';
  const SVG_LOC = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="3.2"/><circle cx="12" cy="12" r="8"/><path d="M12 1.5v3M12 19.5v3M1.5 12h3M19.5 12h3"/></svg>';
  const SVG_SEARCH = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="10.5" cy="10.5" r="6.5"/><path d="m20 20-4.9-4.9"/></svg>';
  const C2L = { а: 'a', б: 'b', в: 'v', г: 'g', д: 'd', ђ: 'đ', е: 'e', ж: 'ž', з: 'z', и: 'i', ј: 'j', к: 'k', л: 'l', љ: 'lj', м: 'm', н: 'n', њ: 'nj', о: 'o', п: 'p', р: 'r', с: 's', т: 't', ћ: 'ć', у: 'u', ф: 'f', х: 'h', ц: 'c', ч: 'č', џ: 'dž', ш: 'š' };
  const cyrToLat = (str) => str.replace(/[Ѐ-ӿ]/g, (ch) => { const lo = ch.toLowerCase(), m = C2L[lo]; if (m === undefined) return ch; return ch === lo ? m : m.length > 1 ? m[0].toUpperCase() + m.slice(1) : m.toUpperCase(); });
  /** Forma za pretragu na latinici (padajuce liste i rezultati ostaju kako ih sajt daje). */
  function latinizeForm() {
    document.querySelectorAll('#d_all form label, #d_all form .header, #d_all form .ui.message p, #d_all form .field>p, #d_all .ui.pointing.menu .item, #btnKC, #t_err, #t_err *').forEach((el) => {
      if (el.closest('.ui.dropdown, select, #d_info, .kgrs-rc-wrap')) return;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      for (let n = w.nextNode(); n; n = w.nextNode()) if (/[Ѐ-ӿ]/.test(n.nodeValue)) n.nodeValue = cyrToLat(n.nodeValue);
    });
    const ip = document.getElementById('i_parc'); if (ip && /[Ѐ-ӿ]/.test(ip.placeholder || '')) ip.placeholder = cyrToLat(ip.placeholder);
  }
  function ensureHome() {
    latinizeForm();
    const da = document.getElementById('d_all'); if (!da) return;
    da.classList.add('kgrs-col');
    if (!document.getElementById('kgrs-head')) {
      const hd = document.createElement('div'); hd.id = 'kgrs-head'; hd.innerHTML = SVG_LOGO + '<span class="hd-tx"><b>Katastar <i>GPS</i> RS</b><em>Developed by <b>277DIGITAL.COM</b></em></span>';
      da.insertBefore(hd, da.firstChild);
    }
    let hero = document.getElementById('kgrs-mapbtn');
    if (!hero) {
      hero = document.createElement('button'); hero.id = 'kgrs-mapbtn'; hero.type = 'button';
      hero.innerHTML = '<span class="kh-ic"><i></i><i></i>' + SVG_LOC + '</span><span class="kh-tx"><b>Otvori mapu</b><small>Odmah te locira i prikaže parcelu na kojoj stojiš</small></span><span class="kh-go">›</span>';
      hero.onclick = openMapDirect;
      da.insertBefore(hero, document.getElementById('kgrs-head').nextSibling);
    }
    if (!document.getElementById('kgrs-sh')) {
      const anchor = document.querySelector('#d_all .ui.pointing.menu, #d_all #ddlPP');
      const row = anchor && (anchor.closest('.items-row') || anchor.closest('.item') || anchor.parentElement);
      if (row && row.parentElement) {
        const sh = document.createElement('div'); sh.id = 'kgrs-sh';
        sh.innerHTML = '<span class="sh-ic">' + SVG_SEARCH + '</span><span><b>Pretraga po broju parcele</b><small>Potrebna potvrda „Nisam robot“ · vlasnici se prikazuju samo ovdje</small><button type="button" id="kgrs-rcsw">' + (RC_RAW ? 'Vrati prilagođeni prikaz potvrde' : 'Potvrda ne prolazi? Isprobaj izvorni prikaz') + '</button></span>';
        const sw = sh.querySelector('#kgrs-rcsw'); if (sw) sw.onclick = () => { try { localStorage.setItem('kgrs.rc.raw', RC_RAW ? '0' : '1'); } catch (e) { /* ok */ } location.reload(); };
        row.parentElement.insertBefore(sh, row);
      }
    }
    if (!document.getElementById('kgrs-foot')) {
      const ft = document.createElement('div'); ft.id = 'kgrs-foot'; ft.innerHTML = 'Developed by <b>277DIGITAL.COM</b>'; da.appendChild(ft);
    } else if (da.lastElementChild.id !== 'kgrs-foot') da.appendChild(document.getElementById('kgrs-foot'));
    // uvodni tekstovi sajta (bez polja za unos) samo odvlace paznju od mape
    document.querySelectorAll('#content_m div.item').forEach((it) => {
      if (it.querySelector('h2') && !it.querySelector('input,select,button,table,form,.menu,#d_info') && it.style.display !== 'none') it.style.setProperty('display', 'none', 'important');
    });
  }

  function boot() {
    if (!(window.ol && ol.source && ol.layer && ol.proj && document.body)) return setTimeout(boot, 400);
    prepPage(); tidy(); buildUi();
    ensureHome();
    let tt = 0; const mo = new MutationObserver(() => { clearTimeout(tt); tt = setTimeout(tidy, 250); });
    mo.observe(document.body, { childList: true, subtree: true });
    setInterval(() => { try { ensureHome(); sync(); fixRecaptcha(); fixTabs(); searchFlowTick(); } catch (e) { /* ok */ } }, 500);
    setInterval(() => { if (watchId !== null && raw) { try { if (meOv) fallbackMe(tgt || calibrated()); refreshStatus(); } catch (e) { /* ok */ } } }, 1500);
  }
  // tema se postavlja odmah (prije cekanja na ol), da stranica ne "bljesne" bijelo
  if (document.head) { prepPage(); }
  boot();
})();
