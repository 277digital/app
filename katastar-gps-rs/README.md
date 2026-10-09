# Katastar GPS RS

Mobilna web aplikacija (PWA) za hodanje po placu uz GPS: prikaz parcela na satelitskoj mapi, pretraga po broju parcele i snimanje granica.

## Šta radi
- Satelitska i OSM podloga, plava tačka (GPS) sa krugom tačnosti.
- **Pretraga parcele** po broju i katastarskoj opštini u učitanim podacima (`512` daje i `512/1`, `512/2`…).
- **Unutar/izvan parcele** i rastojanje do najbliže međe u metrima, u realnom vremenu.
- **Snimanje granice hodanjem**: "Dodaj tačku ovdje" na svakom uglu, površina uživo, čuvanje i izvoz u GeoJSON.
- Uvoz i izvoz GeoJSON-a. Podaci ostaju u browseru (localStorage).
- Instalacija na početni ekran, radi i bez mreže (osim mapnih pločica).
- Opcioni WMS sloj: unosi se URL/ključ koji korisnik sam ima pravo da koristi.

## Glavni tok: GPS direktno na ekatastar mapi
`userscript/katastar-gps-rs.user.js` dodaje dugme ◎ na mapu sajta `ekatastar.rgurs.org`. Parcelu nađeš na njihovom sajtu (captchu rješavaš ti), klikneš „Прикажи на мапи“, pa uključiš GPS i hodaš: na njihovoj mapi se crta tvoja tačka sa krugom tačnosti i koordinate u EPSG:31276.
- Brzi test: zalijepi cijeli fajl u konzolu (F12) na otvorenoj mapi.
- Telefon: Firefox za Android + Tampermonkey, pa instaliraj fajl.
- Koristi `map` i `ol` koje sajt već ima; ništa se ne preuzima i ne zaobilazi.

## Pokretanje
```
npm start      # http://localhost:8080
npm test       # testovi geometrije
```
GPS u browseru traži HTTPS (ili localhost). Za telefon objavi na bilo kojem HTTPS hostingu (npr. GitHub Pages).

## Tačnost
GPS u telefonu je ±3–10 m. Za centimetre treba RTK prijemnik; neki RTK prijemnici (preko aplikacije koja daje "mock location") mogu da napajaju telefon tačnom pozicijom, pa browser dobija bolju tačnost bez izmjena u kodu. Prikaz je **orijentacioni i nije pravno važeća međa**.

## Izvor podataka o parcelama
Aplikacija **ne preuzima** podatke sa `ekatastar.rgurs.org`: taj servis je zaštićen reCAPTCHA-om i vraća lične podatke, pa treba službeni pristup (RGURS). Dok se to ne riješi, parcele se unose uvozom GeoJSON-a ili snimanjem. Uvoz je u `js/app.js`, a pretraga u `js/geo.js`, pa se kasnije može dodati provajder za službeni API.

Podaci o vlasnicima se u aplikaciji ne koriste i ne treba ih unositi.

## Android aplikacija (ugrađeni browser)
`android/` sadrži malu Android aplikaciju (WebView) koja otvara ekatastar i sama ubacuje GPS skript. Gotov APK: `android/katastar-gps-rs.apk`.
- Instalacija: preuzmi APK na telefon, dozvoli „Instaliraj nepoznate aplikacije“ za browser/Fajlove, otvori APK.
- Gradnja: `android/build.sh` (bez Gradle-a; paketi su navedeni u skripti). `debug.keystore` je standardni debug ključ, ne tajna.
- Test na uređaju još nije obavljen u ovom okruženju (nema emulatora).
