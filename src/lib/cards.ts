import deckFile from "../data/cards.json";

/**
 * Egy kártya a QR-ról indított pakliban.
 * A mezők a `src/data/cards.json` fájlból jönnek — a tartalmat SOHA ne ide írjuk.
 */
export type Card = {
  id: string;
  title: string;
  description: string;
  /** Besorolás a JSON-ból (pl. "partner", "osz", "ingyenes"). Jelenleg nem jelenik meg. */
  category?: string;
  /** Kép a `public/cards/` mappából — fájlnév vagy kész útvonal ("/cards/x.jpg"). */
  image: string;
  partner: boolean;
  /** Csak partnerkártyán: a felajánlott kedvezmény. */
  offer?: string;
  /** Csak partnerkártyán: beváltó kód, ha van. */
  code?: string;
  /** A kódhoz tartozó magyarázó szöveg. */
  codeNote?: string;
};

const asString = (value: unknown): string =>
  typeof value === "string" ? value.trim() : "";

const optionalString = (value: unknown): string | undefined => {
  const text = asString(value);
  return text.length > 0 ? text : undefined;
};

/**
 * A nyers JSON-t elnézően normalizáljuk: hiányzó opcionális mezők kimaradnak,
 * a `partner` bármilyen igaz értékből boolean lesz. Így a cards.json cseréjekor
 * nem dől el az oldal egy apró eltérésen.
 */
const normalize = (value: unknown, index: number): Card | null => {
  if (!value || typeof value !== "object") return null;
  const card = value as Record<string, unknown>;
  const id = asString(card.id) || `card-${index}`;
  const title = asString(card.title);
  if (!title) return null;

  return {
    id,
    title,
    description: asString(card.description),
    category: optionalString(card.category),
    image: asString(card.image),
    partner: card.partner === true || card.partner === "true",
    offer: optionalString(card.offer),
    code: optionalString(card.code),
    codeNote: optionalString(card.codeNote),
  };
};

/**
 * A fájl kétféle alakot tűr: sima kártyatömböt, vagy a jelenlegi
 * `{ version, deckSize, partnersPerDeal, cards: [...] }` burkot.
 */
const file = deckFile as unknown;
const rawCards: unknown[] = Array.isArray(file)
  ? file
  : Array.isArray((file as { cards?: unknown }).cards)
    ? ((file as { cards: unknown[] }).cards)
    : [];

const readNumber = (value: unknown, fallback: number): number =>
  typeof value === "number" && Number.isFinite(value) && value > 0
    ? Math.floor(value)
    : fallback;

/** A húzás paraméterei — a cards.json-ból, ésszerű tartalékértékekkel. */
export const deckConfig = {
  /** Hány kártyát húzunk betöltéskor. */
  deckSize: readNumber((file as { deckSize?: unknown })?.deckSize, 12),
  /** Ebből hány partneres. */
  partnersPerDeal: readNumber(
    (file as { partnersPerDeal?: unknown })?.partnersPerDeal,
    2
  ),
};

export const cards: Card[] = rawCards
  .map(normalize)
  .filter((card): card is Card => card !== null);

/** A `public/cards/` mappára mutató útvonal a JSON `image` mezőjéből. */
export const cardImageSrc = (image: string): string | null => {
  if (!image) return null;
  if (/^(https?:)?\/\//.test(image) || image.startsWith("/")) return image;
  return `/cards/${image}`;
};

if (import.meta.env?.DEV) {
  const partnerCount = cards.filter((card) => card.partner).length;
  if (
    cards.length < deckConfig.deckSize ||
    partnerCount < deckConfig.partnersPerDeal
  ) {
    console.warn(
      `[qr] A pakli túl kicsi: ${cards.length} kártya, ebből ${partnerCount} partneres. ` +
        `Legalább ${deckConfig.deckSize} kártya és ${deckConfig.partnersPerDeal} partner kell a teljes húzáshoz.`
    );
  }
  const missingOffer = cards.filter((card) => card.partner && !card.offer);
  if (missingOffer.length > 0) {
    console.warn(
      "[qr] Partnerkártya offer nélkül:",
      missingOffer.map((card) => card.id).join(", ")
    );
  }
}
