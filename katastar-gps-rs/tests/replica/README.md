# Test replika ekatastar stranice

Playwright testovi na replici njihove stranice (ekatastar.rgurs.org je blokiran u cloud okruženju). `ekatastar*.html` su varijante: osnovna, adresa, greška, bez vlasnika, dugi nazivi, više parcela/duplikati, otvoren dropdown, modal sa dimmerom, modal čije dugme ne radi.

```
npm install
npm run qa        # puni test (raspored 4 veličine x 7 stranica, 5 ciklusa mape, GPS scenariji, rotacija, latinica)
node t17.mjs      # reCAPTCHA i "zamrzavanje" (slojevi koji gutaju dodire)
```
Napomena: postavi `PW_CHROMIUM=/putanja/do/chromium` ako Playwright ne nađe browser (u cloud okruženju: `/opt/pw-browsers/chromium`).
