/**
 * French lines on work for the home band's title. Each one is checked against
 * its source — the web is full of misattributed "citations sur le travail",
 * so add a quote here only with the work it comes from.
 */
export const WORK_QUOTES = [
  {
    text: "Le travail éloigne de nous trois grands maux : l’ennui, le vice et le besoin.",
    source: "Voltaire, Candide",
  },
  {
    text: "Travaillez, prenez de la peine : c’est le fonds qui manque le moins.",
    source: "La Fontaine, Le Laboureur et ses enfants",
  },
  {
    text: "Vingt fois sur le métier remettez votre ouvrage.",
    source: "Boileau, L’Art poétique",
  },
  {
    text: "La grandeur d’un métier est peut-être, avant tout, d’unir des hommes.",
    source: "Saint-Exupéry, Terre des hommes",
  },
  {
    text: "Travailler est donc un devoir indispensable à l’homme social.",
    source: "Rousseau, Émile",
  },
  {
    text: "Travailler est moins ennuyeux que s’amuser.",
    source: "Baudelaire, Mon cœur mis à nu",
  },
  {
    text: "C’est en forgeant qu’on devient forgeron.",
    source: "Proverbe français",
  },
] as const;

/** One quote per local calendar day, so the header changes daily, not per visit. */
export function quoteOfTheDay(date: Date = new Date()) {
  const day = Math.floor(
    Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86_400_000,
  );
  return WORK_QUOTES[day % WORK_QUOTES.length];
}

/** Phrasing only, so it can sit inside BrandHero's <h1>. */
export function WorkQuote() {
  const quote = quoteOfTheDay();
  return (
    <>
      <span className="block text-lg leading-snug">« {quote.text} »</span>
      <span className="mt-1 block text-xs font-medium text-lime-muted">
        {quote.source}
      </span>
    </>
  );
}
