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

## Izgled i funkcije (v0.2)
- Tamna tema za cijeli ekatastar (pretraga, rezultati) prilagođena telefonu, bez horizontalnog skrola; veliko dugme „Прикажи на мапи“.
- Mapa preko cijelog ekrana: gore status GPS-a, dolje panel sa parcelom (broj, KO, površina, list, način korišćenja), vlasnicima i velikim dugmetom Kreni/Stop.
- Filter pozicije (Kalman, uz težinu po tačnosti) i **kalibracija**: stanite na poznatu tačku, dodirnite je na mapi (blizu ćoška parcele se poravna na ćošak); pomak se primjenjuje na sve naredne pozicije.
- UNUTAR/IZVAN parcele i rastojanje do međe, ako sajt drži označenu parcelu kao vektorski sloj.
- Podaci o vlasnicima se samo prikazuju iz rezultata pretrage; ne čuvaju se i ne šalju nigdje.

## Detalji, pravac i zaštita skrola (v0.8)
- **Detalji parcele:** dodir na mapu (ili dugme „Detalji ovdje“ kad stojite na drugoj parceli) šalje GetFeatureInfo njihovom WMS sloju parcela (svi formati odjednom) i prikazuje što sajt vrati (broj, površina, KO…). Vlasnici su samo u njihovoj pretrazi: dugme „Pretraži parcelu …“ upisuje broj u njihovo polje.
- **Strelica pravca** na GPS tački: kompas (senzor orijentacije) dok stojite, smjer kretanja dok hodate.
- **Doktor skrola:** ako prevlačenje prstom ne skrola stranicu, skripta traži uzrok (`touch-action`, providni sloj, `overflow`), popravlja ga i ispisuje šta je našla.
- **Podaci sa njihovog tooltipa:** ako GetFeatureInfo ništa ne vrati, čita se tekst njihovog OL overlay-a koji sajt prikaže na dodir parcele (ćirilični nazivi se prepoznaju) i prikazuje u našoj kartici. Ako ništa ne stigne, kartica ispisuje dijagnostiku (odgovori po formatima).
- **Zamrzavanje skrola:** uzrok je bio providni `position:fixed` sloj (dimmer) unutar same stranice, koji ne propušta skrol roditelju. Zaštita ga traži i unutar stranice, a na mjestu dodira i svaki mali sloj iznad nje.
- Dugme Kreni/Stop: staklasti disk sa kružnim lukom, ▶ / spinner / ■ i zeleni puls.

## Živa tačka i filter (v1.0)
- Zelena tačka je DOM overlay (ne vektor): animira se na 60 fps nezavisno od GPS-a, klizi između očitavanja (predviđanje po brzini), a mapa se pomjera tek kad tačka ode ~70 px od centra. Petlja staje kad sve konvergira.
- Filter pozicije sa brzinom (konstantna brzina po osi): kašnjenje pri hodanju ~0.4 m (ranije ~5 m).
- Kompas: zbir vektora gornje ivice i zadnje kamere (nema skoka pri nagibu), glađenje vremenskom konstantom (brzo pri okretu, jako pri šumu), korekcija za rotaciju ekrana.
- Podaci parcele na dodir: ako njihov sloj nije standardni WMS izvor, GetFeatureInfo se sastavlja iz adrese pločica (isti `authkey`, BBOX oko dodira); dijagnostika u kartici maskira ključ.

## Preciznost (v0.3)
- Filter pozicije prilagođen brzini (mirovanje = jače glađenje, hodanje = brza reakcija) i odbacivanje naglih skokova.
- Kalibracija sa više tačaka (težinski prosjek), upozorenje ako se tačke ne slažu, ističe nakon 12 h.
- Upozorenje ako sajtova projekcija nema `towgs84` (pomak datuma).
- **RTK (centimetri):** spoljni Bluetooth RTK prijemnik + njegova aplikacija koja šalje „mock location“ (Podešavanja → Opcije za programere → Izaberi aplikaciju za lažnu lokaciju). WebView tada dobija tačnu poziciju bez izmjena u kodu. Ograničenje je i sam katastar: granice na planu mogu odstupati od terena za metar i više.

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
