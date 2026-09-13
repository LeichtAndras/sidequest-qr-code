# Kártyaképek

Ide kerülnek a QR-oldal (`/q?v=...`) kártyaképei.

- A fájlnevek pontosan a `src/data/cards.json` `image` mezőjéből jönnek
  (pl. `"image": "/cards/magic-rooms.jpg"` → `public/cards/magic-rooms.jpg`).
  A mező kész útvonal és puszta fájlnév alakban is jó.
- Álló formátum ajánlott (kb. 3:4), mobilra optimalizálva: hosszabb oldal
  max. ~1200px, 150–250 kB alatt, hogy gyenge térerőn is gyorsan töltsön.
- Amíg egy kép hiányzik, a kártya automatikusan a beépített SideQuest
  placeholderre vált — az oldal nem törik el tőle.
