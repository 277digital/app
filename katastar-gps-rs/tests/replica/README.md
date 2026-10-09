# Test replika ekatastar stranice

Playwright testovi na replici njihove stranice (ekatastar.rgurs.org je blokiran u cloud okruženju). `ekatastar*.html` su varijante: osnovna, adresa, greška, bez vlasnika, dugi nazivi, više parcela/duplikati, otvoren dropdown, modal sa dimmerom, modal čije dugme ne radi.

```
npm install
npm run qa        # puni test (raspored 4 veličine x 7 stranica, 5 ciklusa mape, GPS scenariji, rotacija, latinica)
node t17.mjs      # reCAPTCHA i "zamrzavanje" (slojevi koji gutaju dodire)
node t19.mjs      # detalji parcele (GetFeatureInfo: gml/html/json/prazno), dugme Detalji, strelica pravca, doktor skrola (pravi dodiri preko CDP-a)
node t27.mjs      # njihov tooltip kao izvor podataka, dijagnostika, fixed slojevi UNUTAR stranice (pravi dodiri)
node t31.mjs      # tok "Vlasnici": kartica (povrsina/vrsta/vlasnici), popuna njihove pretrage, automatska pretraga nakon sto korisnik rijesi captchu, otvaranje parcele
node t29.mjs      # zivi marker: zelena tacka, glatkoca kompasa pod sumom, odziv, kasnjenje pri hodanju, GFI sastavljen iz adrese plocica
```
Napomena: postavi `PW_CHROMIUM=/putanja/do/chromium` ako Playwright ne nađe browser (u cloud okruženju: `/opt/pw-browsers/chromium`).
