const SITE_URL = 'https://fgo-mat-calc.t12jp.org';
const SITE_NAME = 'FGO素材シミュレーター';

interface SeoHeadProps {
  title: string;
  description: string;
  path: string;
  type?: 'website' | 'article';
  structuredData?: Record<string, unknown> | Record<string, unknown>[];
}

export function SeoHead({
  title,
  description,
  path,
  type = 'website',
  structuredData,
}: SeoHeadProps) {
  const canonical = new URL(path, SITE_URL).toString();
  const jsonLd = structuredData ?? {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title,
    description,
    url: canonical,
    isPartOf: {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      url: `${SITE_URL}/`,
    },
    inLanguage: 'ja-JP',
  };

  return (
    <>
      <title>{title}</title>
      <meta name="description" content={description} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <link rel="canonical" href={canonical} />
      <meta property="og:type" content={type} />
      <meta property="og:locale" content="ja_JP" />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={`${SITE_URL}/ogp.png`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:alt" content="FGO素材シミュレーター - 再臨・スキル・アペンド・QPをまとめて計算" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:image" content={`${SITE_URL}/ogp.png`} />
      <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
    </>
  );
}

export { SITE_NAME, SITE_URL };
