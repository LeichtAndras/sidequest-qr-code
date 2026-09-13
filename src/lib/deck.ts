import { deckConfig, type Card } from "./cards";

/** Ennyi kártyát húzunk betöltéskor (a cards.json `deckSize` mezőjéből). */
export const DECK_SIZE = deckConfig.deckSize;
/** Ebből ennyi partneres (a cards.json `partnersPerDeal` mezőjéből). */
export const PARTNER_COUNT = deckConfig.partnersPerDeal;
/**
 * Ha a `v` paraméter egy partner id-je, az a partner ezekre a pozíciókra
 * kerülhet (0-alapú indexek = 4. és 5. kártya).
 */
export const VENUE_SLOTS = [3, 4];

type Random = () => number;

const shuffle = <T,>(items: readonly T[], rnd: Random): T[] => {
  const out = items.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
};

const pick = <T,>(items: readonly T[], rnd: Random): T | undefined =>
  items.length === 0 ? undefined : items[Math.floor(rnd() * items.length)];

/** Minden olyan slot, ami legalább 2 távolságra van az eddig kiosztottaktól. */
const nonAdjacentSlots = (slotCount: number, taken: readonly number[]): number[] => {
  const free: number[] = [];
  for (let slot = 0; slot < slotCount; slot++) {
    if (taken.every((other) => Math.abs(other - slot) >= 2)) free.push(slot);
  }
  return free;
};

export type DeckResult = {
  deck: Card[];
  /** A `v` paraméterhez tartozó partner, ha sikerült beilleszteni. */
  venueCard: Card | null;
};

/**
 * `DECK_SIZE` kártya véletlenszerű húzása a teljes pakliból:
 * - pontosan `PARTNER_COUNT` partneres kártya (ha van elég), a többi nem partneres,
 * - két partnerkártya soha nem kerül egymás mellé,
 * - ha `venueId` egy partner id-je, az a partner kötelezően bekerül a 4–5. helyre.
 *
 * Ha a forrás pakli kisebb a kelleténél, annyit ad vissza, amennyi kitelik —
 * a nem-szomszédos szabály ilyenkor is érvényben marad.
 */
export const buildDeck = (
  allCards: readonly Card[],
  venueId?: string | null,
  rnd: Random = Math.random
): DeckResult => {
  const partners = allCards.filter((card) => card.partner);
  const regulars = allCards.filter((card) => !card.partner);

  const venueCard =
    (venueId && partners.find((card) => card.id === venueId)) || null;

  const otherPartners = shuffle(
    partners.filter((card) => card.id !== venueCard?.id),
    rnd
  );
  const chosenPartners = [
    ...(venueCard ? [venueCard] : []),
    ...otherPartners.slice(0, PARTNER_COUNT - (venueCard ? 1 : 0)),
  ];

  const regularTarget = DECK_SIZE - chosenPartners.length;
  const chosenRegulars = shuffle(regulars, rnd).slice(0, regularTarget);

  const slotCount = Math.min(
    DECK_SIZE,
    chosenPartners.length + chosenRegulars.length
  );
  const slots: (Card | null)[] = new Array(slotCount).fill(null);
  const partnerSlots: number[] = [];

  // 1. A helyszín partnere fixen a 4–5. pozícióra megy.
  if (venueCard) {
    const venueSlot =
      pick(
        VENUE_SLOTS.filter((slot) => slot < slotCount),
        rnd
      ) ?? 0;
    slots[venueSlot] = venueCard;
    partnerSlots.push(venueSlot);
  }

  // 2. A többi partner csak nem szomszédos slotra kerülhet.
  for (const partner of chosenPartners) {
    if (partner === venueCard) continue;
    const free = nonAdjacentSlots(slotCount, partnerSlots).filter(
      (slot) => slots[slot] === null
    );
    const slot = pick(free, rnd);
    if (slot === undefined) continue; // nincs szabályos hely — kihagyjuk
    slots[slot] = partner;
    partnerSlots.push(slot);
  }

  // 3. A maradék helyeket a nem partneres kártyák töltik ki.
  let next = 0;
  for (let slot = 0; slot < slotCount; slot++) {
    if (slots[slot] === null) slots[slot] = chosenRegulars[next++] ?? null;
  }

  const deck = slots.filter((card): card is Card => card !== null);
  return { deck, venueCard: venueCard && deck.includes(venueCard) ? venueCard : null };
};
