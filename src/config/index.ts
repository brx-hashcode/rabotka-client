export const config = {
  apiUrl: "/api/v1",
  whatsapp: {
    phoneNumber: "16182786934",
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
