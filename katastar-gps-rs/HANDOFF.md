# Katastar GPS RS: beleške za nastavak rada

## Cilj
Hodati po placu uz GPS i vidjeti sebe na katastarskoj mapi RS; pretraga parcele preko službenog sajta ekatastar.rgurs.org; panel sa parcelom, vlasnicima i velikim dugmetom; kalibracija pozicije.

## Šta je gotovo (v0.2.1)
- `userscript/katastar-gps-rs.user.js`: tema za ekatastar, panel na mapi, GPS + Kalman filter, kalibracija, UNUTAR/IZVAN parcele (ako je parcela vektorski sloj).
- `android/`: WebView aplikacija koja otvara ekatastar i ubacuje skript. `build.sh` gradi APK bez Gradle-a (Gradle/Google Maven su bili blokirani u cloud okruženju). Isti `debug.keystore` pa se nove verzije instaliraju preko starih.
- Korijen projekta: samostalna PWA (mapa, uvoz GeoJSON-a, snimanje granica hodanjem).

## Šta smo saznali o ekatastaru (iz konzole stranice)
- ASP.NET WebForms + Semantic UI + OpenLayers. Pretraga: opština (ID, npr. Doboj = 34), katastarska opština, broj parcele, reCAPTCHA. Ključ parcele: `34_KZ_20112_Доња Пакленица_1`; „Прикажи на мапи“ zove `jumpTo(key); showMap();`.
- Globalno dostupni: `map` (OpenLayers), `ol`, `proj4`. Projekcija mape **EPSG:31276** (MGI 1901 / Balkan zona 6), centar ≈ E 6508386, N 4942511.
- Slojevi: `Орто 5000`, `Катастарска општина`, `Парцеле`, `Зграде`, `Q` (zahtjevi su WMS sa `authkey`, token po sesiji; **ne koristiti ga izvan sajta**). Najvjerovatnije je `Q` označena parcela.
- Podatke ne preuzimamo sami (captcha, lični podaci). Za pravi API treba pitati RGURS.

## Otvorena pitanja / sljedeći koraci
1. **Datum**: provjeriti `proj4.defs('EPSG:31276')` na stranici. Ako nema `+towgs84`, tačka može biti pomjerena; dodati ispravne parametre.
2. Da li je parcela („Q“) vektor? Ako jeste, radi UNUTAR/IZVAN; ako nije, razmotriti druge načine ili samo koordinate.
3. Terenski test: tačnost, kalibracija, ponašanje reCAPTCHE u WebView-u, potrošnja baterije.
4. Ideje: snimanje staze/tačaka uz parcelu, izvoz u GeoJSON/KML, RTK preko eksterne aplikacije (mock location), tamna/svijetla tema, ikona aplikacije.
5. Razmotriti zvaničan pristup podacima (RGURS) umjesto oslanjanja na izgled sajta.

## Gradnja APK-a (Ubuntu)
```
apt-get install aapt apksigner zipalign dalvik-exchange android-sdk-platform-23 openjdk-17-jdk-headless
android/build.sh
```
Testovi PWA: `npm test`. Test skripte radimo na replici stranice (Playwright + semantic-ui-css + ol), jer je ekatastar blokiran u cloud okruženju.
