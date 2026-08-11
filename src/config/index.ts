export const config = {
  apiUrl: "/api/v1",
  whatsapp: {
    phoneNumber: "16182786934",
    /**
     * Short links from WhatsApp Manager, for the two landing CTAs.
     *
     * These are complete URLs, NOT messages — WhatsApp holds both the
     * destination number and the prefilled text on its side, so they must not
     * go through `whatsappLink()`, which would percent-encode a whole URL into
     * a `?text=` parameter.
     *
     * The number they resolve to is whichever account generated them, so it is
     * not necessarily `phoneNumber` above. That is the point: the short link
     * can be repointed in WhatsApp Manager without a deploy.
     */
    links: {
      worker: "https://wa.me/message/U54TM7P5VLMBE1",
      employer: "https://wa.me/message/MZNTEVCDNUKDC1",
    },
    /** Still used where a prefilled message is built from a raw number. */
    messages: {
      start: "Commencer",
      worker: "Bonjour, je cherche du travail",
      employer: "Bonjour, je cherche un travailleur",
    },
  },
};

export function whatsappLink(message: string): string {
  return `https://wa.me/${config.whatsapp.phoneNumber}?text=${encodeURIComponent(
    message,
  )}`;
}
