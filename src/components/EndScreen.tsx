import { motion } from "motion/react";
import { Gift, Instagram, RotateCcw, Ticket } from "lucide-react";
import { cardImageSrc, type Card } from "../lib/cards";

export const INSTAGRAM_HANDLE = "side_quest.bp";
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;

const SavedRow = ({ card }: { card: Card }) => {
  const src = cardImageSrc(card.image);
  return (
    <>
      <div className="h-16 w-16 shrink-0 overflow-hidden rounded-xl bg-gradient-to-br from-[#48C0FF]/25 to-[#A5E1FF]/20">
        {src && (
          <img
            src={src}
            alt=""
            className="h-full w-full object-cover"
            loading="lazy"
            decoding="async"
            onError={(event) => {
              event.currentTarget.style.display = "none";
            }}
          />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <h3 className="line-clamp-2 text-sm font-black leading-snug text-[#1A2B3C]">
          {card.title}
        </h3>

        {card.partner && card.offer && (
          <p className="mt-1 flex items-start gap-1.5 text-xs font-bold leading-snug text-[#1A2B3C]">
            <Gift size={13} className="mt-px shrink-0 text-[#48C0FF]" />
            <span className="min-w-0">{card.offer}</span>
          </p>
        )}

        {card.partner && card.code && (
          <div className="mt-2 rounded-xl border-2 border-dashed border-[#48C0FF] bg-[#F0F9FF] px-2.5 py-1.5">
            <div className="flex items-center gap-1.5">
              <Ticket size={13} className="shrink-0 text-[#48C0FF]" />
              <span className="min-w-0 break-all font-mono text-sm font-black tracking-wider text-[#1A2B3C]">
                {card.code}
              </span>
            </div>
            {card.codeNote && (
              <p className="mt-0.5 text-[11px] leading-snug text-gray-500">
                {card.codeNote}
              </p>
            )}
          </div>
        )}
      </div>
    </>
  );
};

type EndScreenProps = {
  savedCards: Card[];
  onRestart: () => void;
  onInstagramClick: () => void;
};

/** Végképernyő: a jobbra húzott kártyák és az Instagram-gomb. */
export const EndScreen = ({
  savedCards,
  onRestart,
  onInstagramClick,
}: EndScreenProps) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.25, ease: "easeOut" }}
    className="mx-auto flex w-full max-w-md flex-1 flex-col px-5 pb-8 pt-6"
  >
    <h1 className="text-2xl font-black leading-tight text-[#1A2B3C]">
      {savedCards.length > 0 ? "Ezeket mentetted el" : "Ennyi volt a pakli"}
    </h1>
    <p className="mt-1.5 text-sm text-gray-500">
      {savedCards.length > 0
        ? "A partnerkódokat a helyszínen mutasd fel. Ez az oldal nem őrzi meg őket, úgyhogy készíts képernyőképet."
        : "Most semmit nem mentettél el — bármikor újrakezdheted egy friss paklival."}
    </p>

    {savedCards.length > 0 && (
      <ul className="mt-5 flex flex-col gap-3">
        {savedCards.map((card) => (
          <li
            key={card.id}
            className={`flex gap-3 rounded-2xl bg-white p-3 shadow-sm ${
              card.partner
                ? "border-2 border-[#48C0FF]"
                : "border border-gray-100"
            }`}
          >
            <SavedRow card={card} />
          </li>
        ))}
      </ul>
    )}

    <div className="mt-8 flex flex-col gap-3">
      <a
        href={INSTAGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        onClick={onInstagramClick}
        className="flex items-center justify-center gap-2.5 rounded-2xl bg-[#1A2B3C] px-6 py-4 text-base font-black text-white shadow-lg transition-opacity active:opacity-80"
      >
        <Instagram size={20} />@{INSTAGRAM_HANDLE}
      </a>
      <button
        type="button"
        onClick={onRestart}
        className="flex items-center justify-center gap-2 rounded-2xl border border-gray-200 bg-white px-6 py-3.5 text-sm font-bold text-gray-600 transition-colors active:bg-gray-50"
      >
        <RotateCcw size={16} /> Új pakli
      </button>
    </div>
  </motion.div>
);
