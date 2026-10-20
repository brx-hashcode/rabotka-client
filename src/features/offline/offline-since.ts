const time = (d: Date) =>
  d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" }).replace(":", " h ");

function dayStart(d: Date): number {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime();
}

/** « aujourd'hui à 14 h 30 », « hier à 09 h 05 », « 18 oct. à 14 h 30 ». */
export function offlineSince(timestamp: number, now: Date = new Date()): string {
  const d = new Date(timestamp);
  const days = Math.round((dayStart(now) - dayStart(d)) / 86_400_000);
  if (days <= 0) return `aujourd'hui à ${time(d)}`;
  if (days === 1) return `hier à ${time(d)}`;
  return `${d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" })} à ${time(d)}`;
}

/** The whole banner line: « Hors ligne · données d'aujourd'hui à 14 h 30 ». */
export function offlineLabel(timestamp: number | null, now: Date = new Date()): string {
  if (!timestamp) return "Hors ligne";
  const since = offlineSince(timestamp, now);
  const article = /^(aujourd|hier)/.test(since) ? "d'" : "du ";
  return `Hors ligne · données ${article}${since}`;
}
