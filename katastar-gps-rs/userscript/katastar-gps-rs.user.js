// ==UserScript==
// @name         Katastar GPS RS
// @namespace    https://github.com/277digital
// @version      0.1.0
// @description  Dodaje GPS tačku (uživo) na mapu ekatastar.rgurs.org dok hodate po placu
// @match        https://ekatastar.rgurs.org/*
// @grant        none
// @run-at       document-idle
// ==/UserScript==
// Radi i kad se zalijepi u konzolu. Ne dira zaštitu sajta: captchu i pretragu rješavate sami,
// skripta samo crta GPS poziciju na mapi koju ste već otvorili ("Прикажи на мапи").
(function () {
  if (window.__kgrs) return;
  window.__kgrs = true;

  const SRC = 'EPSG:4326';
  let watchId = null, wakeLock = null, followed = false, last = null;
  let source, layer, bar, btn;

  const el = (tag, css, text) => { const e = document.createElement(tag); e.style.cssText = css; if (text) e.textContent = text; return e; };
  const getMap = () => (window.map && typeof window.map.getView === 'function' ? window.map : null);

  function ui() {
    btn = el('button', 'position:fixed;right:14px;bottom:70px;z-index:2147483647;width:56px;height:56px;border-radius:50%;border:0;' +
      'background:#1f6f43;color:#fff;font-size:26px;box-shadow:0 2px 8px #0008;display:none;', '◎');
    btn.title = 'Katastar GPS RS: uključi/isključi GPS';
    bar = el('div', 'position:fixed;left:8px;right:8px;top:8px;z-index:2147483647;padding:8px 12px;border-radius:10px;background:#fff;' +
      'color:#111;box-shadow:0 1px 6px #0006;font:14px system-ui,sans-serif;display:none;');
    document.body.append(btn, bar);
    btn.onclick = () => (watchId === null ? start() : followed && last ? center() : stop());
    btn.ondblclick = stop;
    setInterval(() => {
      const vp = document.querySelector('.ol-viewport');
      const visible = !!(getMap() && vp && vp.offsetWidth > 0 && vp.offsetHeight > 0);
      btn.style.display = visible ? 'block' : 'none';
      if (!visible) bar.style.display = watchId === null ? 'none' : bar.style.display;
    }, 800);
  }

  function ensureLayer(map) {
    if (layer && map.getLayers().getArray().includes(layer)) return;
    source = new ol.source.Vector();
    layer = new ol.layer.Vector({
      source, zIndex: 9999,
      style: (f) => f.get('acc')
        ? new ol.style.Style({ fill: new ol.style.Fill({ color: 'rgba(11,87,208,.12)' }), stroke: new ol.style.Stroke({ color: '#0b57d0', width: 1 }) })
        : new ol.style.Style({ image: new ol.style.Circle({ radius: 8, fill: new ol.style.Fill({ color: '#0b57d0' }), stroke: new ol.style.Stroke({ color: '#fff', width: 3 }) }) }),
    });
    map.addLayer(layer);
  }

  const status = (t, color) => { bar.style.display = 'block'; bar.textContent = t; bar.style.borderLeft = '6px solid ' + (color || '#999'); };

  function center() { const m = getMap(); if (m && last) m.getView().animate({ center: last, duration: 250 }); }

  function onPos(p) {
    const map = getMap();
    if (!map) return status('Mapa nije otvorena. Kliknite „Прикажи на мапи“.', '#d99a00');
    let xy;
    try {
      xy = ol.proj.transform([p.coords.longitude, p.coords.latitude], SRC, map.getView().getProjection());
    } catch (e) { return status('Greška pretvaranja koordinata: ' + e.message, '#c0392b'); }
    ensureLayer(map);
    last = xy;
    source.clear();
    const a = new ol.Feature(new ol.geom.Circle(xy, Math.max(p.coords.accuracy, 0.5))); a.set('acc', true);
    source.addFeatures([a, new ol.Feature(new ol.geom.Point(xy))]);
    if (!followed) { followed = true; const v = map.getView(); v.animate({ center: xy, zoom: Math.max(v.getZoom() || 0, 18), duration: 300 }); }
    const acc = Math.round(p.coords.accuracy);
    status(`GPS ±${acc} m · E ${xy[0].toFixed(1)}  N ${xy[1].toFixed(1)} (${map.getView().getProjection().getCode()})`,
      acc <= 5 ? '#2e9e5b' : acc <= 15 ? '#d99a00' : '#c0392b');
  }

  async function start() {
    if (!navigator.geolocation) return status('Uređaj ne podržava GPS.', '#c0392b');
    status('Tražim GPS signal…');
    btn.style.background = '#0b57d0';
    watchId = navigator.geolocation.watchPosition(onPos, (e) => status('GPS greška: ' + e.message, '#c0392b'),
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 20000 });
    try { wakeLock = await navigator.wakeLock?.request('screen'); } catch { /* nije kriticno */ }
  }

  function stop() {
    if (watchId !== null) navigator.geolocation.clearWatch(watchId);
    watchId = null; followed = false; last = null;
    if (source) source.clear();
    try { wakeLock?.release(); } catch { /* ignore */ }
    btn.style.background = '#1f6f43'; bar.style.display = 'none';
  }

  const boot = () => (window.ol && ol.source && ol.layer && ol.proj ? ui() : setTimeout(boot, 500));
  boot();
})();
