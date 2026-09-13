# Kártyaképek — promptcsomag

50 kép a `public/cards/` mappába. A lényeg, hogy egy sorozatnak nézzenek ki:
a swipe során a felhasználó **közvetlenül egymás után** látja őket.

## Döntés: fotórealisztikus, nem illusztráció

Azért ez, mert a 9 partnerkép később **valódi fotóra cserélődik**. Ha a
generált készlet illusztrációs, minden egyes csere kilóg majd a sorból. Fotós
stílussal a csere észrevétlen.

## Közös stílusblokk

Ezt fűzd **minden** prompt végére (vagy állítsd be stílus-presetként):

```
documentary editorial photograph, natural available light, muted warm color grade,
soft autumn palette, subtle film grain, 35mm lens, shallow depth of field,
subject centered with breathing room at the edges, clean uncluttered composition,
no text, no letters, no signage, no logos, no brand names, no recognizable faces,
vertical 3:4 portrait
```

Negatív prompt (ahol a generátor támogatja):

```
text, letters, watermark, logo, brand name, signage, poster, collage,
illustration, cartoon, anime, 3d render, cgi, oversaturated, hdr, plastic skin,
distorted hands, extra fingers, recognizable faces, celebrity, crowd of faces
```

### Miért pont ezek a megkötések

- **Se szöveg, se felirat** — a generátorok elrontják a betűket, és a kártyán
  amúgy is ott van a cím a kép alatt. Dupla szöveg zavaros.
- **Se logó, se márkanév** — a partnereknél kifejezetten káros lenne kitalált
  brandinget mutatni egy valódi helyszín nevével.
- **Ne legyenek felismerhető arcok** — hátulról, sziluettben, kézzel jobb.
  Kevesebb kísérteties AI-arc, és nincs jogi kérdés sem.
- **Álló 3:4** — a kártya képterülete függőleges, a fekvő képet levágja.
- **Őszies paletta végig** — 7 kártya kifejezetten őszi, a többinek ehhez kell
  illeszkednie, különben kettéesik a sorozat.

## Kimeneti formátum

- **Arány:** 3:4 álló (9:16 is jó, csak több lesz levágva a tetejéből/aljából)
- **Méret:** hosszabb oldal 1200–1600 px (ennél nagyobbnak nincs értelme mobilon)
- **Fájl:** JPEG, ~80-as minőség, cél 250 kB alatt
- **Név:** pontosan a lenti fájlnév, kisbetűvel

## Hova kerülnek a fájlok

A `public/cards/` mappába. A fájlnevek pontosan a `src/data/cards.json` `image`
mezőjéből jönnek: `"image": "/cards/magic-rooms.jpg"` → `public/cards/magic-rooms.jpg`.
A mező kész útvonal és puszta fájlnév alakban is jó.

Amíg egy kép hiányzik, a kártya automatikusan a beépített SideQuest
placeholderre vált — az oldal nem törik el tőle. Élesben a hiányzó kép rendes
404-et ad, szóval egy elgépelt fájlnév azonnal látszik a hálózati fülön.

---

# Partnerek (9)

Ezeknél **szándékosan általános** a prompt — nem próbáljuk a valódi helyszínt
utánozni. Hangulat, nem portré a helyről. Így a valódi fotóra cserélés nem lesz
zavaró ugrás, és nem is állítunk semmit a helyszínről, ami nem igaz.

| # | Fájlnév | Prompt |
|---|---|---|
| 1 | `sugar-bowling.jpg` | empty bowling lane in a neighbourhood bowling alley, pins standing at the far end, a ball mid-lane, warm overhead lights reflecting on polished wood |
| 2 | `timeheist.jpg` | dim escape room interior, wooden desk with a brass padlock, old clock and scattered paper clues, single hanging bulb, mysterious warm light |
| 3 | `magic-rooms.jpg` | escape room door with a heavy combination lock, dark room with props on shelves, a shaft of light from the doorway |
| 4 | `base-bar.jpg` | small neighbourhood bar counter in the evening, backlit bottles, two cocktails on the wooden bar, warm amber light, no faces |
| 5 | `baltadobalas.jpg` | axe throwing lane, wooden target board with an axe stuck near the bullseye, caged lane, warm industrial lighting |
| 6 | `sugarmozi.jpg` | empty cinema auditorium seen from the back row, red velvet seats, screen faintly glowing, dim warm light |
| 7 | `szelfimuzeum.jpg` | playful interactive photo studio room, pastel and neon backdrop wall, colourful props, empty, bright even light |
| 8 | `leonoria-kvizbox.jpg` | pub table set for a team quiz, answer sheets and pens, a buzzer, glasses of drink, hands only, warm pub lighting |
| 9 | `pixity.jpg` | hands holding a phone photographing small printed photos laid out on a table, soft daylight, minimal desk |

# Ősz (7)

| # | Fájlnév | Prompt |
|---|---|---|
| 10 | `szureti-fesztivalok.jpg` | autumn harvest festival street stall, grapes and wine glasses on a wooden counter, string lights overhead, late afternoon sun, blurred figures behind |
| 11 | `oszi-gellerthegy.jpg` | view over a river city from a wooded hillside at sunset, autumn foliage framing the foreground, warm low sun ⚠️ |
| 12 | `utolso-szabadteri-mozis-estek.jpg` | open air cinema at dusk, rows of empty folding chairs facing a large blank screen, string lights, deep blue evening sky |
| 13 | `termalfurdo-huvos-esten.jpg` | steam rising from an outdoor thermal bath at dusk, warm turquoise water, lamps glowing through the mist, nobody in the water |
| 14 | `muzeumi-oszi-nyitoszezon.jpg` | museum hall with a freshly installed exhibition, soft spotlights on framed works, polished floor, a single distant visitor silhouette |
| 15 | `oszi-piknik-takaroval.jpg` | picnic blanket on autumn grass, thermos and two enamel mugs, fallen leaves scattered, park in golden hour |
| 16 | `kabatszezon-nyito-second-hand-kor.jpg` | vintage clothing shop interior, densely packed coat rack, wooden floor, warm lamp light |

# Ingyenes (6)

| # | Fájlnév | Prompt |
|---|---|---|
| 17 | `filozofusok-kertje.jpg` | small weathered stone statue group on a quiet hillside path among autumn trees, soft morning light, nobody around ⚠️ |
| 18 | `kopaszi-gat.jpg` | grassy riverside promenade with a wooden pier, calm water, autumn trees, soft overcast light |
| 19 | `romai-part.jpg` | riverside gravel path with a bicycle leaning against a tree, river and small boats behind, warm autumn light |
| 20 | `karolyi-kert.jpg` | small enclosed city garden with benches and trimmed hedges, plane trees, empty in the early morning |
| 21 | `vajdahunyad-vara-udvara.jpg` | courtyard of an old European castle-style building, stone arches and ivy, autumn light, few people ⚠️ |
| 22 | `rozsadombi-kilatopontok.jpg` | quiet residential hillside street with villas, city panorama opening up below at dusk, warm streetlights ⚠️ |

# Program (11)

| # | Fájlnév | Prompt |
|---|---|---|
| 23 | `libego-a-janos-hegyre.jpg` | empty chairlift seat suspended over a forested hillside, autumn canopy below, cable and pylon, soft daylight ⚠️ |
| 24 | `tarsasjatek-bar.jpg` | board game cafe table covered with games, cards and wooden tokens, hands mid-move, warm lamp light |
| 25 | `kalandpark-kotelpalya.jpg` | forest rope course, wooden platforms and cables strung between tall trees, a harness hanging, dappled light |
| 26 | `bolhapiac-hetvegen.jpg` | flea market stall with old cameras, books and ceramics laid out on a cloth, morning light |
| 27 | `second-hand-korut.jpg` | second hand shop rail packed with clothes, blank paper price tags, warm interior light |
| 28 | `naplementes-hajozas.jpg` | river boat deck railing at sunset, water reflecting orange light, blurred city skyline behind |
| 29 | `bicikli-a-duna-menten.jpg` | bicycle resting on a riverside path at golden hour, long shadows, river and autumn trees |
| 30 | `szinhaz-diakjeggyel.jpg` | theatre auditorium seen from the upper balcony, rows of red seats, closed curtain, warm house lights |
| 31 | `standup-este.jpg` | small club stage with a microphone stand and a wooden stool under a single spotlight, brick wall, dark room |
| 32 | `koncert-kis-klubban.jpg` | small music club stage seen from the crowd, silhouetted heads in the foreground, coloured stage lights, hazy air |
| 33 | `ejszakai-seta-a-varban.jpg` | empty cobblestone street in an old castle district at night, lamplight pooling on the stones, long shadows, nobody ⚠️ |

# Játék (8)

| # | Fájlnév | Prompt |
|---|---|---|
| 34 | `36-kerdes.jpg` | two mugs and a folded blank sheet of paper on a cafe table, hands resting nearby, soft window light |
| 35 | `valassz-helyettem.jpg` | cafe table with two plates of food and a closed menu pushed aside, hands only, natural daylight |
| 36 | `idegen-fotos.jpg` | hands passing a small camera to someone on a city street, blurred pedestrians behind, afternoon daylight |
| 37 | `buszos-rulett.jpg` | interior of a city bus, empty seats and a large window with the blurred street outside, afternoon light |
| 38 | `playlist-csere.jpg` | two phones lying on a table with earphones coiled between them, screens glowing faintly, no readable text, evening lamp light |
| 39 | `melyik-ablak.jpg` | row of old apartment windows on a facade at dusk, a few lit from inside, seen from across the street |
| 40 | `a-kedvenc-helyed.jpg` | person seen from behind sitting on a bench looking out over a city view, autumn, golden hour |
| 41 | `terkep-nelkuli-hazaut.jpg` | empty city sidewalk at night, streetlights, wet asphalt reflections, a single figure walking away from camera |

# Otthon (9)

| # | Fájlnév | Prompt |
|---|---|---|
| 42 | `filmmaraton-egy-temara.jpg` | living room at night lit only by the glow of a tv screen, blanket thrown over the sofa, snacks on a low table |
| 43 | `rossz-filmek-esteje.jpg` | sofa seen from behind, two silhouetted heads against a glowing screen, popcorn bowl between them |
| 44 | `kozos-fozes-recept-nelkul.jpg` | open fridge at night casting light on a kitchen counter with random ingredients, hands reaching in, warm dark kitchen |
| 45 | `sutis-kihivas.jpg` | two homemade cakes side by side on a kitchen table, dusting of flour, hands in frame, daylight |
| 46 | `playlist-epites-kozosen.jpg` | phone on a table connected to a small speaker, several hands around it, evening lamp light, no readable text |
| 47 | `regi-fotok-atnezese.jpg` | old printed photographs spread out on a rug, hands sorting through them, warm lamp light |
| 48 | `rajzverseny.jpg` | two open sketchbooks with quick pencil portraits, pencils scattered, hands drawing, daylight |
| 49 | `telefonmentes-este.jpg` | phones stacked face down on a wooden table, a lit candle beside them, warm evening light |
| 50 | `csillagnezes-a-hegyen.jpg` | starry night sky over a dark hilltop, two silhouettes sitting on a blanket, faint city glow on the horizon |

---

## ⚠️ A hat kockázatos kártya

A megjelölt hatnál (11, 17, 21, 22, 23, 33) **valódi, felismerhető budapesti
helyszín** a téma. A generátorok ezeket rendre elrontják: a Vajdahunyad vára
„majdnem olyan" lesz, a Libegő sífelvonóvá változik. Aki ismeri a várost —
márpedig a célközönség ismeri —, annak ez azonnal feltűnik.

Két járható út:

1. **Hangulatkép** a fenti prompttal: nem a konkrét helyet mutatja, hanem a
   jellegét. Biztonságos, de kevésbé konkrét.
2. **Valódi fotó** stock oldalról (Unsplash/Pexels ingyenes, Budapestre bőven
   van anyag), vagy saját telefonos kép. Ezeknél ez a jobb — ráadásul ugyanaz
   a fotós stílus, amit a többinél is kérünk.

## Utómunka (macOS, telepítés nélkül)

Ha a generált kép nem pont 3:4, ez középre vágja és jóra méretezi az egészet:

```bash
cd /Users/leicht/Documents/sidequest-qr/public/cards
for f in *.jpg; do sips -c 1600 1200 "$f" --out "$f" >/dev/null; done
```

Aztán ellenőrizd, hiányzik-e még valami:

```bash
cd /Users/leicht/Documents/sidequest-qr && python3 -c "import json,os;n=[c['image'].rsplit('/',1)[-1] for c in json.load(open('src/data/cards.json'))['cards']];m=[x for x in n if not os.path.exists('public/cards/'+x)];print('hiányzik:',len(m));print(*sorted(m),sep='\n')"
```
