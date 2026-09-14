#!/usr/bin/env node
/**
 * Emberi nyelvű jelentés a swipe-adatokból.
 *
 * Futtatás:  npm run report
 * Ehhez kell egy .env.local az Upstash adataival:  npx vercel env pull .env.local
 */

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const url =
  process.env.UPSTASH_REDIS_REST_URL ??
  process.env.KV_REST_API_URL ??
  process.env.REDIS_REST_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  process.env.KV_REST_API_TOKEN ??
  process.env.REDIS_REST_TOKEN;

if (!url || !token) {
  console.error(
    "Hiányoznak az Upstash adatok.\n" +
      "Futtasd előbb:  npx vercel link  majd  npx vercel env pull .env.local"
  );
  process.exit(1);
}

/** Legalább ennyiszer kellett megjelennie egy kártyának, hogy arányt közöljünk. */
const MIN_SHOWS = 5;
const TOP = 5;

const cardsFile = JSON.parse(
  readFileSync(join(root, "src/data/cards.json"), "utf8")
);
const titles = new Map(cardsFile.cards.map((c) => [c.id, c.title]));
const isPartner = new Map(cardsFile.cards.map((c) => [c.id, Boolean(c.partner)]));

const redis = async (command) => {
  const res = await fetch(url, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify(command),
  });
  if (!res.ok) throw new Error(`Upstash ${res.status}: ${await res.text()}`);
  return (await res.json()).result;
};

const raw = await redis(["HGETALL", "sq:sessions"]);

// A HGETALL váltakozva adja a kulcsot és az értéket.
const sessions = [];
for (let i = 1; i < (raw?.length ?? 0); i += 2) {
  try {
    sessions.push(typeof raw[i] === "string" ? JSON.parse(raw[i]) : raw[i]);
  } catch {
    /* sérült rekordot kihagyunk */
  }
}

if (sessions.length === 0) {
  console.log("Még nincs egyetlen menet sem.");
  process.exit(0);
}

// ─── összesítés ────────────────────────────────────────────────────────────
const stats = new Map(); // cardId -> { shown, saved }
const bump = (id, key) => {
  const s = stats.get(id) ?? { shown: 0, saved: 0 };
  s[key] += 1;
  stats.set(id, s);
};

let completed = 0;
let decisionsTotal = 0;
const dropAt = new Map(); // hányadik kártyánál álltak meg (csak félbehagyók)
const byVariant = new Map(); // matrica kód -> { menetek, vegigment }

for (const s of sessions) {
  if (s.completed) completed += 1;
  decisionsTotal += s.decisions?.length ?? 0;

  const v = s.v ?? "(nincs)";
  const stat = byVariant.get(v) ?? { menetek: 0, vegigment: 0, dontesek: 0 };
  stat.menetek += 1;
  if (s.completed) stat.vegigment += 1;
  stat.dontesek += s.decisions?.length ?? 0;
  byVariant.set(v, stat);

  for (const d of s.decisions ?? []) {
    bump(d.id, "shown");
    if (d.dir === "save") bump(d.id, "saved");
  }
  if (!s.completed) {
    dropAt.set(s.stoppedAt, (dropAt.get(s.stoppedAt) ?? 0) + 1);
  }
}

const pct = (n, total) => (total === 0 ? 0 : Math.round((n / total) * 100));
const pad = (s, n) => String(s).padEnd(n).slice(0, n);
const bar = (n, max, width = 24) =>
  "█".repeat(Math.max(n > 0 ? 1 : 0, Math.round((n / (max || 1)) * width)));

const ranked = [...stats.entries()]
  .map(([id, s]) => ({
    id,
    title: titles.get(id) ?? `(ismeretlen: ${id})`,
    partner: isPartner.get(id) ?? false,
    ...s,
    rate: s.shown === 0 ? 0 : s.saved / s.shown,
  }))
  .filter((c) => c.shown >= MIN_SHOWS);

const line = (ch = "─") => console.log(ch.repeat(64));

// ─── kiírás ────────────────────────────────────────────────────────────────
console.log();
console.log("  SideQuest QR — swipe jelentés");
console.log(`  ${new Date().toLocaleString("hu-HU")}`);
line("═");

const avgCards = (decisionsTotal / sessions.length).toFixed(1);
console.log(`  Menetek:        ${sessions.length}`);
console.log(
  `  Végigment:      ${completed} (${pct(completed, sessions.length)}%)`
);
console.log(`  Átlagosan:      ${avgCards} kártya / menet`);
console.log(`  Összes döntés:  ${decisionsTotal}`);

if (byVariant.size > 1) {
  line();
  console.log("  MATRICA-VÁLTOZATOK");
  console.log();
  for (const [v, s] of [...byVariant.entries()].sort((a, b) => b[1].menetek - a[1].menetek)) {
    console.log(
      `  ${pad(v, 16)} ${String(s.menetek).padStart(4)} menet   ` +
        `végigment ${String(pct(s.vegigment, s.menetek)).padStart(3)}%   ` +
        `átlag ${(s.dontesek / s.menetek).toFixed(1)} kártya`
    );
  }
}

line();
console.log(`  LEGTÖBBSZÖR MENTETT KÁRTYÁK`);
console.log(`  (legalább ${MIN_SHOWS} megjelenés)`);
console.log();
const best = [...ranked].sort((a, b) => b.rate - a.rate || b.saved - a.saved).slice(0, TOP);
best.forEach((c, i) => {
  console.log(
    `  ${i + 1}. ${pad(c.title + (c.partner ? " ★" : ""), 34)} ` +
      `${String(Math.round(c.rate * 100)).padStart(3)}%   ${c.saved}/${c.shown}`
  );
});

line();
console.log(`  LEGGYAKRABBAN ELDOBOTT KÁRTYÁK`);
console.log();
const worst = [...ranked]
  .sort((a, b) => a.rate - b.rate || b.shown - a.shown)
  .slice(0, TOP);
worst.forEach((c, i) => {
  const dobott = c.shown - c.saved;
  console.log(
    `  ${i + 1}. ${pad(c.title + (c.partner ? " ★" : ""), 34)} ` +
      `${String(100 - Math.round(c.rate * 100)).padStart(3)}%   ${dobott}/${c.shown}`
  );
});

line();
console.log("  HOL MORZSOLÓDNAK LE");
console.log();
const deckSize = Math.max(...sessions.map((s) => s.deckSize || 0), 12);
const maxDrop = Math.max(...dropAt.values(), 0);
let elerte = sessions.length;
for (let i = 1; i <= deckSize; i++) {
  const kiszallt = dropAt.get(i) ?? 0;
  console.log(
    `  ${String(i).padStart(2)}. kártya  ` +
      `${pad(bar(kiszallt, maxDrop), 24)} ` +
      `${String(kiszallt).padStart(3)} kiszállt   ` +
      `(idáig eljutott: ${pct(elerte, sessions.length)}%)`
  );
  elerte -= kiszallt;
}
console.log();
console.log(
  `  A végképernyőig eljutott: ${completed} menet (${pct(completed, sessions.length)}%)`
);
line("═");
console.log();
