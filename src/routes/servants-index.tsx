import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { getServantIndexData } from '@/utils/seo-data.server';

export function loader() {
  return getServantIndexData();
}

export default function ServantsIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const title = 'FGOサーヴァント別 必要素材一覧｜再臨・スキル・アペンド';
  const description = `FGOのサーヴァント${data.servants.length}騎を一覧から選び、霊基再臨・スキル強化・アペンドスキル・霊衣の必要素材とQPを確認できます。`;

  return (
    <PublicPageLayout>
      <SeoHead title={title} description={description} path="/servants/" />
      <Breadcrumbs items={[{ label: 'サーヴァント' }]} />
      <header className="mb-8 space-y-3">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">FGOサーヴァント別 必要素材一覧</h1>
        <p className="max-w-3xl leading-7 text-gray-300">各サーヴァントの再臨、通常スキル3種、アペンドスキル、霊衣に必要な素材とQPを掲載しています。個別ページから素材計算ツールへ移動できます。</p>
        <p className="text-sm text-gray-500">データ更新: {formatDate(data.updatedAt)} / {data.servants.length}騎</p>
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
        {data.servants.map((servant) => (
          <li key={servant.collectionNo}>
            <Link className="block h-full rounded-lg border border-gray-700 bg-gray-800 p-3 transition hover:border-yellow-400" to={`/servants/${servant.collectionNo}/`}>
              <img className="mx-auto rounded" src={servant.face} alt="" width="96" height="96" loading="lazy" />
              <span className="mt-2 block text-sm font-medium text-white">{servant.name}</span>
              <span className="mt-1 block text-xs text-gray-400">{'★'.repeat(servant.rarity)} {servant.className}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PublicPageLayout>
  );
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('ja-JP');
}
