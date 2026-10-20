import { dehydrate, hydrate, type Query, type QueryClient } from "@tanstack/react-query";
import { del, get, set } from "idb-keyval";
import { isUnauthorized } from "@/lib/api/errors";

/**
 * The app's data, kept in IndexedDB so a phone that has used the app can show
 * it again without a network.
 *
 * What is kept is an ALLOW-LIST, not a block-list. Unlocked contacts — the
 * phone numbers someone paid for — come back from several endpoints (missions,
 * recommendations, the contacts list), and a block-list would let the next
 * one slip through. On top of the list, phone and e-mail fields are stripped
 * from everything except the person's own profile.
 *
 * One account per phone at a time: the record carries the profile it belongs
 * to, and it is dropped on logout, when another profile signs in, after
 * MAX_AGE, and when CACHE_SCHEMA changes.
 */

const STORAGE_KEY = "rabotka:query-cache";
/** Bump when a stored response would no longer fit the code reading it. */
export const CACHE_SCHEMA = 1;
export const MAX_AGE_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_DELAY_MS = 1000;

type QueryKey = readonly unknown[];

/** Kept, by the leading parts of the query key. */
const KEPT: readonly (readonly string[])[] = [
  ["profile", "me"],
  ["profile", "wallet"],
  ["profile", "applications"],
  ["profile", "portfolio"],
  ["profile", "invoices"],
  ["profile", "claims"],
  ["job-feed"],
  ["job-search"],
  ["job-detail"],
  ["job-offer"],
  ["saved-jobs"],
  ["job-categories"],
  ["daily-quota"],
  ["worker", "missions"],
  ["worker", "mission"],
  ["worker-feed"],
  ["employer", "job-offers"],
  ["employer", "applications"],
  ["discussions"],
  ["notifications"],
];

/**
 * Never kept, even under a kept prefix: where a phone number someone paid to
 * unlock is the point of the response.
 */
const NEVER: readonly (readonly string[])[] = [
  ["profile", "contacts"],
  ["worker-mission"],
  ["recommended-worker"],
  ["payment"],
];

function startsWith(key: QueryKey, prefix: readonly string[]): boolean {
  return prefix.every((part, i) => key[i] === part);
}

export function isKept(key: QueryKey): boolean {
  if (NEVER.some((p) => startsWith(key, p))) return false;
  return KEPT.some((p) => startsWith(key, p));
}

/** Contact fields, wherever they sit in a response. */
const CONTACT_FIELD = /^(phone|directPhone|direct_phone|email|whatsapp\w*|contactPhone|contact_phone|msisdn)$/i;

/**
 * A copy of `value` with every contact field emptied, at any depth. Set to
 * null rather than removed: screens already handle a contact that is not
 * there (null), while a field gone missing could print « undefined ». The
 * person's own profile keeps its own — it is theirs, and shown to them.
 */
export function withoutContacts<T>(value: T): T {
  if (Array.isArray(value)) return value.map(withoutContacts) as T;
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) {
      out[k] = CONTACT_FIELD.test(k) && v != null ? null : withoutContacts(v);
    }
    return out as T;
  }
  return value;
}

type StoredCache = {
  schema: number;
  savedAt: number;
  profileId: string | null;
  state: ReturnType<typeof dehydrate>;
};

/** Whether a stored record may be restored now. */
export function isUsable(record: StoredCache | undefined, now = Date.now()): boolean {
  return (
    !!record &&
    record.schema === CACHE_SCHEMA &&
    now - record.savedAt <= MAX_AGE_MS
  );
}

function profileIdOf(client: QueryClient): string | null {
  const me = client.getQueryData<{ id?: string }>(["profile", "me"]);
  return me?.id ?? null;
}

/** What would be written now. Exported for the tests that pin what is stored. */
export function snapshot(client: QueryClient): StoredCache {
  const state = dehydrate(client, {
    shouldDehydrateQuery: (q: Query) =>
      q.state.status === "success" && isKept(q.queryKey),
  });
  for (const q of state.queries) {
    if (!startsWith(q.queryKey, ["profile", "me"])) {
      q.state = { ...q.state, data: withoutContacts(q.state.data) };
    }
  }
  return {
    schema: CACHE_SCHEMA,
    savedAt: Date.now(),
    profileId: profileIdOf(client),
    state,
  };
}

/** When the stored data was saved, for the « Hors ligne — données du … » line. */
let restoredAt: number | null = null;
export function offlineDataSavedAt(): number | null {
  return restoredAt;
}

/**
 * Put the stored data back into the cache. Awaited before the first render
 * (with a short ceiling, so a slow IndexedDB never delays the app): screens
 * then open on the last data instead of a loader, online or not. Queries
 * still refetch as usual — this only fills the gap until they answer.
 */
export async function restoreQueryCache(client: QueryClient): Promise<void> {
  try {
    const record = await get<StoredCache>(STORAGE_KEY);
    if (!record) return;
    if (!isUsable(record)) {
      await del(STORAGE_KEY);
      return;
    }
    hydrate(client, record.state);
    restoredAt = record.savedAt;
  } catch {
    // IndexedDB unavailable (private mode, some in-app browsers): no offline
    // data, and nothing else changes.
  }
}

/** Forget the stored data — on logout, or when another account signs in. */
export async function clearQueryCache(): Promise<void> {
  restoredAt = null;
  await del(STORAGE_KEY).catch(() => undefined);
}

/**
 * Keep the stored copy up to date as the cache changes — a beat after the
 * last change, and only with something worth storing. Returns the
 * unsubscribe.
 */
export function persistQueryCache(client: QueryClient): () => void {
  let timer: ReturnType<typeof setTimeout> | undefined;
  let lastProfile = profileIdOf(client);

  const save = () => {
    // The server ended the session (401): the profile still in memory is that
    // of a session that no longer exists. Store nothing, and drop what was.
    const me = client.getQueryState(["profile", "me"]);
    if (me?.status === "error" && isUnauthorized(me.error)) {
      void clearQueryCache();
      return;
    }
    const current = profileIdOf(client);
    // Another account on this phone: nothing of the previous one may remain.
    if (lastProfile && current && current !== lastProfile) {
      void clearQueryCache();
    }
    lastProfile = current ?? lastProfile;
    // Signed out (no profile): nothing is stored.
    if (!current) return;
    void set(STORAGE_KEY, snapshot(client)).catch(() => undefined);
  };

  const unsubscribe = client.getQueryCache().subscribe((event) => {
    if (event.type !== "updated" && event.type !== "removed") return;
    clearTimeout(timer);
    timer = setTimeout(save, SAVE_DELAY_MS);
  });
  return () => {
    clearTimeout(timer);
    unsubscribe();
  };
}
