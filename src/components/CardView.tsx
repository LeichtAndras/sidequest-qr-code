import { useCallback, useEffect, useState } from "react";
import { motion } from "motion/react";
import { Gift, Sparkles, Ticket } from "lucide-react";
import { SwipeCardFrame } from "./SwipeCardFrame";
import { cardImageSrc, type Card } from "../lib/cards";

/** Kép helyett ez látszik, amíg a public/cards/ mappa nincs feltöltve. */
const ImagePlaceholder = ({ title }: { title: string }) => (
  <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-gradient-to-br from-[#48C0FF]/25 via-[#A5E1FF]/20 to-white">
    <span className="flex h-16 w-16 items-center justify-center rounded-3xl bg-white/80 text-2xl font-black text-[#1A2B3C] shadow-sm">
      {title.trim().charAt(0).toUpperCase() || "?"}
    </span>
    <span className="text-[11px] font-semibold uppercase tracking-widest text-[#1A2B3C]/50">
      SideQuest
    </span>
  </div>
);

type CardViewProps = {
  card: Card;
  isTop: boolean;
  /** Az első pár kép azonnal töltsön, a többi csak amikor sorra kerül. */
  eager: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
};

/**
 * Egy álló kártya a QR-oldalon: kép, cím, leírás — partnereknél az ajánlattal
 * és a kiemelt beváltó kóddal. A gesztust a közös SwipeCardFrame adja.
 */
export const CardView = ({
  card,
  isTop,
  eager,
  onSwipeRight,
  onSwipeLeft,
}: CardViewProps) => {
  const [imgFailed, setImgFailed] = useState(false);
  const src = cardImageSrc(card.image);

  useEffect(() => {
    setImgFailed(false);
  }, [card.id]);

  const onImgError = useCallback(() => setImgFailed(true), []);

  return (
    <SwipeCardFrame
      isTop={isTop}
      onSwipeRight={onSwipeRight}
      onSwipeLeft={onSwipeLeft}
    >
      {({ likeOpacity, nopeOpacity }) => (
        <div
          className={`relative flex h-full w-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-2xl ${
            card.partner
              ? "border-2 border-[#48C0FF]"
              : "border border-gray-100"
          }`}
        >
          {/* Kép */}
          <div className="relative min-h-0 flex-[3] w-full overflow-hidden bg-gray-100">
            {src && !imgFailed ? (
              <img
                src={src}
                alt={card.title}
                className="absolute inset-0 h-full w-full object-cover pointer-events-none"
                loading={eager ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                onError={onImgError}
              />
            ) : (
              <ImagePlaceholder title={card.title} />
            )}

            {card.partner && (
              <div className="absolute left-4 top-4 z-20 flex items-center gap-1.5 rounded-full bg-[#48C0FF] px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-white shadow-lg">
                <Sparkles size={11} /> Partner
              </div>
            )}

            <motion.div
              style={{ opacity: likeOpacity }}
              className="pointer-events-none absolute left-5 top-[18%] z-20 rotate-[-18deg] rounded-xl border-4 border-emerald-500 px-3 py-2 text-3xl font-black uppercase tracking-widest text-emerald-500"
            >
              Mentés
            </motion.div>
            <motion.div
              style={{ opacity: nopeOpacity }}
              className="pointer-events-none absolute right-5 top-[18%] z-20 rotate-[18deg] rounded-xl border-4 border-rose-500 px-3 py-2 text-3xl font-black uppercase tracking-widest text-rose-500"
            >
              Tovább
            </motion.div>
          </div>

          {/* Szöveg */}
          <div className="flex shrink-0 flex-col gap-2 border-t border-black/[0.06] px-5 pb-5 pt-4 text-[#1A2B3C]">
            <h2 className="line-clamp-2 break-words text-xl font-black leading-snug sm:text-2xl">
              {card.title}
            </h2>
            <p className="line-clamp-3 text-sm leading-relaxed text-gray-600">
              {card.description}
            </p>

            {card.partner && card.offer && (
              <div className="mt-1 flex items-start gap-2 rounded-2xl bg-[#F0F9FF] px-3 py-2.5">
                <Gift size={16} className="mt-0.5 shrink-0 text-[#48C0FF]" />
                <span className="min-w-0 text-sm font-bold leading-snug">
                  {card.offer}
                </span>
              </div>
            )}

            {card.partner && card.code && (
              <div className="rounded-2xl border-2 border-dashed border-[#48C0FF] bg-white px-3 py-2.5">
                <div className="flex items-center gap-2">
                  <Ticket size={16} className="shrink-0 text-[#48C0FF]" />
                  <span className="min-w-0 break-all font-mono text-lg font-black tracking-wider text-[#1A2B3C]">
                    {card.code}
                  </span>
                </div>
                {card.codeNote && (
                  <p className="mt-1 text-xs leading-snug text-gray-500">
                    {card.codeNote}
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </SwipeCardFrame>
  );
};
