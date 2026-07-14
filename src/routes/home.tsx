import App from '@/App';
import { SeoHead, SITE_URL } from '@/components/seo/SeoHead';

const title = 'FGO素材計算・育成計画シミュレーター｜再臨・スキル・アペンド対応';
const description = 'FGOのサーヴァント育成に必要な再臨・スキル・アペンド・霊衣素材とQPを一括計算。所持素材との差分、育成計画、クラススコア、フリクエ候補も確認できます。';

export default function HomeRoute() {
  return (
    <>
      <SeoHead
        title={title}
        description={description}
        path="/"
        structuredData={{
          '@context': 'https://schema.org',
          '@graph': [
            { '@type': 'WebSite', '@id': `${SITE_URL}/#website`, url: `${SITE_URL}/`, name: 'FGO素材シミュレーター', inLanguage: 'ja-JP' },
            { '@type': 'WebApplication', '@id': `${SITE_URL}/#app`, url: `${SITE_URL}/`, name: 'FGO素材シミュレーター', description, applicationCategory: 'UtilitiesApplication', operatingSystem: 'Web', isAccessibleForFree: true, inLanguage: 'ja-JP' },
          ],
        }}
      />
      <App />
    </>
  );
}
