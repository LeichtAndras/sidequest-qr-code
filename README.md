# SideQuest QR

Önálló mobilweb oldal: QR-kódos matricáról érkező, swipe-olós kártyajáték.
Külön projekt, külön deploy — nem függ a fő SideQuest apptól, és előbb mehet élesbe.

## Útvonal

```
/q?v=<helyszin>
```

A `v` paraméter azonosítja, melyik matricáról jöttek. A `/` is ugyanezt az
oldalt tölti be, szóval egy rossz rewrite sem hagyja üres képernyővel a
felhasználót.

## Működés

- Betöltéskor 12 kártya véletlenszerű húzása a teljes pakliból
- Ebből pontosan 2 partneres (`partner: true`), 10 nem partneres
- Két partnerkártya soha nem kerül egymás mellé
- Ha a `v` egy partner id-je, az a partner kötelezően bekerül, a 4–5. pozícióba
- Jobbra swipe (drag, Framer Motion) = mentés, balra = tovább; gombokkal is megy
- A 12. kártya után végképernyő a mentett kártyákkal és a partnerkódokkal
- Nincs regisztráció, nincs letöltés, nincs onboarding — az első kártya azonnal jön

## Adat

Minden kártya a [`src/data/cards.json`](src/data/cards.json) fájlból jön,
a kódban nincs kártyatartalom. Jelenleg 50 kártya, ebből 9 partneres.

```jsonc
{
  "version": 1,
  "deckSize": 12,          // ennyi kártyát húzunk betöltéskor
  "partnersPerDeal": 2,    // ebből ennyi partneres
  "cards": [
    {
      "id": "magic-rooms",        // a ?v= paraméter ezzel egyezik partnereknél
      "category": "partner",      // jelenleg nem jelenik meg a felületen
      "title": "Magic Rooms",
      "description": "Szabadulószoba csapatban",
      "image": "/cards/magic-rooms.jpg",
      "partner": true,
      "offer": "Hétköznap 25% az első foglalásodra",  // csak partnernél
      "code": "1kvd25",                               // lehet null is
      "codeNote": "Írd a közleménybe"                 // a kód mellé
    }
  ]
}
```

A `deckSize` és a `partnersPerDeal` a fájlból jön (tartalék: 12 és 2), szóval a
pakli mérete adatból hangolható, kódmódosítás nélkül.

A betöltő elnéző: elfogad sima kártyatömböt is a burok helyett, a hiányzó
opcionális mezők (`code: null`) kimaradnak, a hiányzó kép helyére beépített
placeholder kerül. DEV módban figyelmeztet, ha kevés a kártya vagy egy
partnernek nincs `offer`-e.

### Képek

A `public/cards/` mappába kerülnek, a fájlnevek a JSON `image` mezőjéből jönnek.
Részletek: [`public/cards/README.md`](public/cards/README.md).

## Tracking

Két esemény megy ki (`src/lib/tracking.ts`):

| esemény | mikor | adat |
| --- | --- | --- |
| `qr_page_view` | oldalbetöltéskor, betöltésenként egyszer | `v`, `has_venue`, `deck_size` |
| `qr_instagram_click` | az Instagram-gombra | `v`, `saved_count` |

Célpontok, ami épp elérhető: `window.gtag` / `window.dataLayer` (ha beteszel egy
GA4/GTM snippetet az `index.html`-be), és/vagy `VITE_QR_TRACK_ENDPOINT`
(sendBeacon, JSON body) a `.env`-ből. Ha egyik sincs, csak DEV konzolra logol.
Soha nem dob hibát és nem blokkolja a rendert.

## Futtatás

```bash
npm install
npm run dev        # http://localhost:3001/q?v=kek-macska
npm run dev:lan    # telefonról, ugyanazon a wifin
npm run build      # tsc + vite build -> dist/
npm run preview
```

## Deploy

A build egy statikus `dist/` mappa. Egyetlen követelmény: a hosztnak a `/q`
útvonalra az `index.html`-t kell adnia, hogy a `/q?v=...` betöltsön.

A rewrite szándékosan **csak** a `/q`-ra vonatkozik, nem mindenre. Mindent elkapó
szabállyal a hiányzó képek 200-as státusszal, az index.html tartalmával térnének
vissza 404 helyett — az oldal ettől még működne (placeholderre vált), de egy
elgépelt képfájlnév örökre észrevétlen maradna, és minden hiányzó kép egy teljes
HTML oldalt töltene le feleslegesen.

- **Vercel** — [`vercel.json`](vercel.json) már tartalmazza a rewrite-ot és a
  cache fejléceket. `vercel --prod`
- **Netlify / Cloudflare Pages** — [`public/_redirects`](public/_redirects)
  kezeli. Build parancs: `npm run build`, publish dir: `dist`
- **Firebase Hosting** — [`firebase.json`](firebase.json) készen áll.
  `npm run build && firebase deploy --only hosting` (előtte `firebase use <projekt>`)

## Kapcsolat a fő apphoz

Nincs — se közös kód, se közös build. A `src/components/SwipeCardFrame.tsx`
a SideQuest app Swipe Mode-jából származik, de ennek a projektnek a saját,
független másolata: itt szabadon módosítható anélkül, hogy az appot érintené.
