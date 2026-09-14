import { Redis } from "@upstash/redis";

/**
 * Menetenként EGY rekordot fogad a QR-oldaltól, és Redis hash-be írja.
 *
 * Hash és nem lista, mert a kulcs a menet azonosítója: ha valaki app-ot vált,
 * majd visszajön és végigcsinálja, a második küldés felülírja az elsőt —
 * így egy menetből sosem lesz két rekord.
 */

/** A Vercel Marketplace integráció többféle néven injektálhatja ugyanazt. */
const url =
  process.env.UPSTASH_REDIS_REST_URL ??
  process.env.KV_REST_API_URL ??
  process.env.REDIS_REST_URL;
const token =
  process.env.UPSTASH_REDIS_REST_TOKEN ??
  process.env.KV_REST_API_TOKEN ??
  process.env.REDIS_REST_TOKEN;

export const SESSIONS_KEY = "sq:sessions";

const MAX_BODY_BYTES = 16 * 1024;
const MAX_DECISIONS = 60;
const MAX_STRING = 64;

type Direction = "save" | "skip";

type Decision = { id: string; dir: Direction; ms: number };

export type SessionRecord = {
  id: string;
  v: string | null;
  startedAt: number;
  endedAt: number;
  completed: boolean;
  deckSize: number;
  stoppedAt: number;
  savedCount: number;
  decisions: Decision[];
};

const str = (value: unknown, max = MAX_STRING): string =>
  typeof value === "string" ? value.slice(0, max) : "";

const num = (value: unknown, fallback = 0): number =>
  typeof value === "number" && Number.isFinite(value) ? Math.trunc(value) : fallback;

/**
 * A kliensből érkező adat sosem megbízható: minden mezőt levágunk és
 * normalizálunk, mielőtt tárolnánk.
 */
export const normalize = (input: unknown): SessionRecord | null => {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;

  // A minta a VÁGATLAN értéket nézi: ha előbb levágnánk 64 karakterre, két
  // különböző hosszú azonosító ugyanarra a kulcsra esne, és felülírnák egymást.
  const id = typeof raw.id === "string" ? raw.id : "";
  if (!/^[A-Za-z0-9_-]{8,64}$/.test(id)) return null;

  const decisions: Decision[] = Array.isArray(raw.decisions)
    ? raw.decisions
        .slice(0, MAX_DECISIONS)
        .map((item) => {
          const d = (item ?? {}) as Record<string, unknown>;
          const cardId = str(d.id);
          const dir: Direction = d.dir === "save" ? "save" : "skip";
          if (!cardId) return null;
          return { id: cardId, dir, ms: Math.max(0, num(d.ms)) };
        })
        .filter((d): d is Decision => d !== null)
    : [];

  const deckSize = Math.max(0, num(raw.deckSize));
  const completed = raw.completed === true;

  return {
    id,
    v: str(raw.v) || null,
    startedAt: num(raw.startedAt),
    endedAt: num(raw.endedAt),
    completed,
    deckSize,
    // Hányadik kártyánál állt meg, 1-alapon. Végigmenetnél a pakli mérete.
    stoppedAt: completed
      ? deckSize
      : Math.min(decisions.length + 1, deckSize || decisions.length + 1),
    savedCount: decisions.filter((d) => d.dir === "save").length,
    decisions,
  };
};

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return new Response("Method Not Allowed", { status: 405 });
    }
    if (!url || !token) {
      console.error("[session] hiányzó Upstash env változók");
      return new Response(null, { status: 204 });
    }

    let body: string;
    try {
      body = await request.text();
    } catch {
      return new Response(null, { status: 204 });
    }
    if (body.length > MAX_BODY_BYTES) {
      return new Response("Payload Too Large", { status: 413 });
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(body);
    } catch {
      return new Response("Bad Request", { status: 400 });
    }

    const record = normalize(parsed);
    if (!record) return new Response("Bad Request", { status: 400 });

    try {
      const redis = new Redis({ url, token });
      await redis.hset(SESSIONS_KEY, { [record.id]: JSON.stringify(record) });
    } catch (error) {
      // A mérés sosem ronthatja el a felhasználó élményét — a beacon amúgy
      // sem nézi meg a választ.
      console.error("[session] írás nem sikerült:", error);
    }

    return new Response(null, { status: 204 });
  },
};
