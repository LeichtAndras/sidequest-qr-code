import { useCallback, useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { Analytics } from "@vercel/analytics/react";
import { Heart, X } from "lucide-react";
import { cardImageSrc, cards, type Card } from "./lib/cards";
import { buildDeck } from "./lib/deck";
import { CardView } from "./components/CardView";
import { EndScreen } from "./components/EndScreen";
import { trackInstagramClick, trackPageView } from "./lib/tracking";

/** Ennyi kártyával előre töltjük a képeket. */
const PRELOAD_AHEAD = 2;

/**
 * A matrica azonosítója. Két alak működik:
 *  - `/q/<helyszin>` — ez a kanonikus, ezt tesszük a QR-kódokba. Azért útvonal
 *    és nem query, mert a Vercel Web Analytics útvonalanként számol: így a
 *    dashboardon külön sorban látszik, melyik matrica hány embert hozott,
 *    custom event és fizetős csomag nélkül.
 *  - `/q?v=<helyszin>` — a régi alak, visszafelé kompatibilisen megmarad.
 */
const readVenue = (): string | null => {
  try {
    const fromPath = window.location.pathname.match(/^\/q\/([^/]+)\/?$/);
    if (fromPath) {
      const value = decodeURIComponent(fromPath[1]).trim();
      if (value) return value;
    }
    const fromQuery = new URLSearchParams(window.location.search).get("v");
    return fromQuery && fromQuery.trim() ? fromQuery.trim() : null;
  } catch {
    return null;
  }
};

/**
 * Önálló, QR-kódról nyíló swipe-oldal. Nincs regisztráció, nincs letöltés:
 * betöltéskor kihúz 12 kártyát, és rögtön az első kártyán indul.
 */
export const App = () => {
  const venue = useMemo(readVenue, []);
  const [deck, setDeck] = useState<Card[]>(() => buildDeck(cards, venue).deck);
  const [index, setIndex] = useState(0);
  const [saved, setSaved] = useState<Card[]>([]);

  useEffect(() => {
    document.title = "SideQuest — Húzd le a paklit";
  }, []);

  useEffect(() => {
    trackPageView(venue, deck.length);
  }, [venue, deck.length]);

  /**
   * A soron következő kártyák képének előtöltése, amíg az aktuálisat nézik.
   * Enélkül minden swipe után csak akkor indul el a letöltés, amikor a kártya
   * már látszik — jó wifin észrevehetetlen, mobilneten kártyánként egy pislogás.
   * Fire-and-forget: nincs takarítás, mert az megszakítaná a félig letöltött
   * képet pont akkor, amikor gyorsan pörgetik a paklit.
   */
  useEffect(() => {
    deck
      .slice(index + 1, index + 1 + PRELOAD_AHEAD)
      .map((card) => cardImageSrc(card.image))
      .filter((src): src is string => src !== null)
      .forEach((src) => {
        const image = new Image();
        image.src = src;
      });
  }, [deck, index]);

  const advance = useCallback(() => setIndex((prev) => prev + 1), []);

  const handleSwipeRight = useCallback(
    (card: Card) => {
      setSaved((prev) =>
        prev.some((item) => item.id === card.id) ? prev : [...prev, card]
      );
      advance();
    },
    [advance]
  );

  const handleRestart = useCallback(() => {
    setDeck(buildDeck(cards, venue).deck);
    setIndex(0);
    setSaved([]);
  }, [venue]);

  const handleInstagramClick = useCallback(() => {
    trackInstagramClick(venue, saved.length);
  }, [venue, saved.length]);

  const current = deck[index];
  const next = deck[index + 1];
  const isFinished = index >= deck.length;

  return (
    <div className="flex min-h-[100svh] flex-col bg-[#F7F7F7] text-[#1A2B3C]">
      {isFinished ? (
        <EndScreen
          savedCards={saved}
          onRestart={handleRestart}
          onInstagramClick={handleInstagramClick}
        />
      ) : (
        <div className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-6 pt-5">
          {/* Fejléc: haladásjelző */}
          <div className="mb-4 flex shrink-0 items-center gap-3">
            <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
              <motion.div
                className="h-full rounded-full bg-[#48C0FF]"
                initial={{ width: 0 }}
                animate={{
                  width: `${deck.length ? (index / deck.length) * 100 : 0}%`,
                }}
                transition={{ duration: 0.25, ease: "easeOut" }}
              />
            </div>
            <span className="shrink-0 font-mono text-xs font-bold text-gray-400">
              {Math.min(index + 1, deck.length)}/{deck.length}
            </span>
          </div>

          {/* Kártyapakli */}
          <div className="relative min-h-0 w-full flex-1">
            {next && (
              <div className="absolute inset-0 translate-y-3 scale-[0.96] rounded-[2rem] border border-gray-100 bg-white shadow-lg" />
            )}
            <AnimatePresence mode="popLayout">
              {current && (
                <motion.div
                  key={current.id}
                  className="absolute inset-0"
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.16 }}
                >
                  <CardView
                    card={current}
                    isTop
                    eager={index < 2}
                    onSwipeRight={() => handleSwipeRight(current)}
                    onSwipeLeft={advance}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Gombok — a swipe mellett koppintásra is megy */}
          <div className="mt-5 flex shrink-0 items-center justify-center gap-8">
            <button
              type="button"
              aria-label="Tovább"
              onClick={advance}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-gray-100 bg-white text-rose-500 shadow-lg transition-transform active:scale-90"
            >
              <X size={26} />
            </button>
            <button
              type="button"
              aria-label="Mentés"
              onClick={() => current && handleSwipeRight(current)}
              className="flex h-16 w-16 items-center justify-center rounded-full bg-[#48C0FF] text-white shadow-xl shadow-[#48C0FF]/30 transition-transform active:scale-90"
            >
              <Heart size={30} fill="currentColor" />
            </button>
          </div>

          <p className="mt-3 shrink-0 text-center text-xs text-gray-400">
            Húzd jobbra, amit megjegyeznél · balra, ami nem kell
          </p>
        </div>
      )}
      <Analytics />
    </div>
  );
};

export default App;
