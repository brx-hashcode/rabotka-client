import { Helmet } from "react-helmet-async";
import { env } from "@/env";

const SITE_URL = env.VITE_SITE_URL ?? "https://rabotka.work";
const DEFAULT_OG_IMAGE = `${SITE_URL}/og-image.jpg`;

type SeoProps = {
  title?: string;
  description?: string;
  canonical?: string;
  ogImage?: string;
  ogImageAlt?: string;
  noIndex?: boolean;
  jsonLd?: object | object[];
};

export function Seo({
  title = "Rabotka – Trouvez du travail et de l'aide sur WhatsApp",
  description = "Rabotka connecte les travailleurs informels et les employeurs grâce à un assistant WhatsApp simple. Trouvez du travail ou de l'aide directement sur WhatsApp, sans application à télécharger.",
  canonical,
  ogImage = DEFAULT_OG_IMAGE,
  ogImageAlt = "Rabotka – Trouvez du travail sur WhatsApp au Congo",
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
      <meta
        name="robots"
        content={
          noIndex
            ? "noindex, nofollow"
            : "index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1"
        }
      />
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:type" content="website" />
      <meta property="og:site_name" content="Rabotka" />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:image" content={ogImage} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="fr_CG" />

      {/* Twitter / X */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@Rabotka" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />
      <meta name="twitter:image:alt" content={ogImageAlt} />

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
