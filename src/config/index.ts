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
      /**
       * The header "Commencer" button. Points at the worker link on purpose:
       * it is the same entry point, and the short link carries its own
       * prefilled message, so there is nothing generic to send instead.
       */
      start: "https://wa.me/message/U54TM7P5VLMBE1",
    },
    /**
     * Still used where a prefilled message is built from a raw number — only
     * the KYC support links now. `worker` and `employer` are kept because the
     * short links above can be revoked in WhatsApp Manager, and these are what
     * the CTAs fall back to.
     *
     * `start` was removed: the header button uses `links.start`, and a
     * prefilled message nothing sends is a trap for the next reader.
     */
    messages: {
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
