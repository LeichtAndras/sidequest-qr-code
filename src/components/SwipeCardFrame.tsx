import React from "react";
import {
  motion,
  useMotionValue,
  useTransform,
  type MotionValue,
} from "motion/react";

/** Ennyi pixel elhúzás után számít swipe-nak a gesztus. */
export const SWIPE_THRESHOLD = 100;

export type SwipeOverlays = {
  /** 0 → 1, ahogy jobbra (mentés felé) húzzák a kártyát. */
  likeOpacity: MotionValue<number>;
  /** 0 → 1, ahogy balra (tovább felé) húzzák a kártyát. */
  nopeOpacity: MotionValue<number>;
};

type SwipeCardFrameProps = {
  /** Csak a legfelső kártya húzható. */
  isTop: boolean;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  className?: string;
  children: React.ReactNode | ((overlays: SwipeOverlays) => React.ReactNode);
};

/**
 * A swipe-kártya drag-gesztusa: x motion value, döntés, elhalványulás és a
 * MENTÉS/TOVÁBB overlay-opacitások. A kártya tartalmát a hívó adja gyerekként.
 *
 * Ez a komponens a SideQuest app Swipe Mode-jából származik, de szándékosan
 * ennek a projektnek a saját, független másolata — a két oldal külön deployol,
 * és külön is fejlődhet.
 */
export const SwipeCardFrame = ({
  isTop,
  onSwipeRight,
  onSwipeLeft,
  className = "absolute w-full h-full cursor-grab active:cursor-grabbing",
  children,
}: SwipeCardFrameProps) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: unknown, info: { offset?: { x: number } }) => {
    const ox = info.offset?.x ?? 0;
    if (ox > SWIPE_THRESHOLD) {
      onSwipeRight();
    } else if (ox < -SWIPE_THRESHOLD) {
      onSwipeLeft();
    }
  };

  return (
    <motion.div
      style={{ x, rotate, opacity, zIndex: isTop ? 10 : 0 }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={className}
    >
      {typeof children === "function"
        ? children({ likeOpacity, nopeOpacity })
        : children}
    </motion.div>
  );
};
