import { Helmet } from "react-helmet-async";
import { env } from "@/env";

const SITE_URL = env.VITE_SITE_URL ?? "https://rabotka.africa";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
};

export function Seo({
  title = "Rabotka - Trouvez du travail et de l'aide sur WhatsApp",
  description = "Rabotka connecte les travailleurs informels et les employeurs grâce à un assistant WhatsApp simple. Trouvez du travail ou de l'aide directement sur WhatsApp, sans application à télécharger.",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  noIndex = false,
  jsonLd,
}: SeoProps) {
  const canonicalUrl = canonical
    ? `${SITE_URL}${canonical}`
    : typeof window !== "undefined"
      ? window.location.href
      : SITE_URL;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      {noIndex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {/* JSON-LD */}
      {jsonLd &&
        (Array.isArray(jsonLd) ? jsonLd : [jsonLd]).map((schema) => (
          <script key={(schema as Record<string, string>)["@type"]} type="application/ld+json">
            {JSON.stringify(schema)}
          </script>
        ))}
    </Helmet>
  );
}
