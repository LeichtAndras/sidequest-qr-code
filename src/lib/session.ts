/**
 * Menetenként egy rekordot gyűjt a swipe-okról, és pontosan egyszer küldi el.
 *
 * Miért így:
 *  - A rekord a memóriában épül, és a menet VÉGÉN megy ki egyben — nem
 *    swipe-onként. Egy menet egy hálózati kérés.
 *  - A kiváltó a végképernyő VAGY a `visibilitychange` → hidden. Mobilon ez az
 *    egyetlen megbízható jel: a `beforeunload` telefonon rendszeresen elmarad.
 *    Ez fogja el az app-váltást, a képernyőzárat és a visszagombot is.
 *  - `sendBeacon`, mert az túléli az oldal lebontását; a `fetch(keepalive)`
 *    csak tartalék, ha nincs beacon.
 *  - Ha valaki app-ot vált, majd visszajön és végigcsinálja, a rekord újra
 *    kimegy ugyanazzal az azonosítóval — a szerver kulcs szerint felülírja,
 *    így a végleges állapot marad, és mégsem lesz két rekord.
 *
 * Amit nem kapunk el: kényszerített app-bezárás, lemerült telefon, hálózat
 * nélküli eltűnés. Ez best effort adat.
 */

const ENDPOINT = "/api/session";

type Direction = "save" | "skip";

type Decision = { id: string; dir: Direction; ms: number };

type Session = {
  id: string;
  v: string | null;
  startedAt: number;
  deckSize: number;
  decisions: Decision[];
  completed: boolean;
};

let session: Session | null = null;
/** A legutóbb elküldött állapot ujjlenyomata — változatlanul nem küldünk újra. */
let lastSent = "";
let lastCardShownAt = 0;

const newId = (): string => {
  try {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 32);
  } catch {
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 12)}`;
  }
};

/** Új menet indul (betöltéskor és „Új pakli" gombra). */
export const startSession = (venue: string | null, deckSize: number) => {
  session = {
    id: newId(),
    v: venue,
    startedAt: Date.now(),
    deckSize,
    decisions: [],
    completed: false,
  };
  lastSent = "";
  lastCardShownAt = Date.now();
};

/** Egy kártya elintézve: melyik, merre, és mennyi ideig nézte. */
export const recordDecision = (cardId: string, dir: Direction) => {
  if (!session) return;
  const now = Date.now();
  session.decisions.push({
    id: cardId,
    dir,
    ms: Math.max(0, now - (lastCardShownAt || now)),
  });
  lastCardShownAt = now;
};

/** A végképernyő elérésekor hívjuk. */
export const markCompleted = () => {
  if (session) session.completed = true;
};

const payload = () =>
  session && {
    id: session.id,
    v: session.v,
    startedAt: session.startedAt,
    endedAt: Date.now(),
    completed: session.completed,
    deckSize: session.deckSize,
    decisions: session.decisions,
  };

/**
 * Elküldi a menetet, ha van mit. Ugyanazt az állapotot nem küldi kétszer.
 * Az `endedAt` kimarad az ujjlenyomatból, különben minden hívás újnak tűnne.
 */
export const flushSession = () => {
  const data = payload();
  if (!data) return;

  const signature = JSON.stringify([
    data.id,
    data.completed,
    data.decisions.length,
  ]);
  if (signature === lastSent) return;
  lastSent = signature;

  const body = JSON.stringify(data);

  try {
    if (typeof navigator.sendBeacon === "function") {
      navigator.sendBeacon(
        ENDPOINT,
        new Blob([body], { type: "application/json" })
      );
    } else {
      void fetch(ENDPOINT, {
        method: "POST",
        body,
        headers: { "Content-Type": "application/json" },
        keepalive: true,
      }).catch(() => undefined);
    }
  } catch {
    /* a mérés soha ne törje el az oldalt */
  }

  if (import.meta.env?.DEV) {
    console.info("[qr:session]", data);
  }
};

/**
 * Feliratkozás a lapelhagyásra. A `visibilitychange` a megbízható jel mobilon;
 * a `pagehide` desktopon ad még egy esélyt.
 */
export const watchSessionEnd = (): (() => void) => {
  const onHidden = () => {
    if (document.visibilityState === "hidden") flushSession();
  };
  const onPageHide = () => flushSession();

  document.addEventListener("visibilitychange", onHidden);
  window.addEventListener("pagehide", onPageHide);
  return () => {
    document.removeEventListener("visibilitychange", onHidden);
    window.removeEventListener("pagehide", onPageHide);
  };
};
