/**
 * Minimál tracking a QR-oldalhoz. Szándékosan nem húzzuk be ide a Firebase-t:
 * a /q útvonalnak gyenge térerőn is azonnal indulnia kell.
 *
 * Az események oda mennek, ami épp elérhető:
 *  - `window.dataLayer` / `gtag` (GTM vagy GA4, ha be van kötve az index.html-be),
 *  - `VITE_QR_TRACK_ENDPOINT` (sendBeacon, ha van beállítva .env-ben),
 *  - fejlesztői konzol DEV módban.
 * Soha nem dob hibát és soha nem blokkolja a rendert.
 */

type QrEventName = "qr_page_view" | "qr_instagram_click";

type QrEventParams = Record<string, string | number | boolean | null | undefined>;

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

const endpoint = import.meta.env?.VITE_QR_TRACK_ENDPOINT as string | undefined;

const send = (name: QrEventName, params: QrEventParams) => {
  const payload = { event: name, ...params, ts: Date.now() };

  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", name, params);
    } else if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(payload);
    }
  } catch {
    /* a tracking soha ne törje el az oldalt */
  }

  try {
    if (endpoint && typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        endpoint,
        new Blob([JSON.stringify(payload)], { type: "application/json" })
      );
    }
  } catch {
    /* ignore */
  }

  if (import.meta.env?.DEV) {
    console.info("[qr:track]", name, params);
  }
};

let viewLogged = false;

/**
 * Oldalbetöltés naplózása a `v` paraméterrel együtt.
 * Betöltésenként csak egyszer fut le (a StrictMode dupla effektje ellen).
 */
export const trackPageView = (venue: string | null, deckSize: number) => {
  if (viewLogged) return;
  viewLogged = true;
  send("qr_page_view", {
    v: venue ?? "(none)",
    has_venue: Boolean(venue),
    deck_size: deckSize,
  });
};

/** Az Instagram-gomb kattintásának külön naplózása. */
export const trackInstagramClick = (venue: string | null, savedCount: number) => {
  send("qr_instagram_click", {
    v: venue ?? "(none)",
    saved_count: savedCount,
  });
};
