import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { getMaterialIndexData } from '@/utils/seo-data.server';

export function loader() {
  return getMaterialIndexData();
}

export default function MaterialsIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const title = 'FGO素材一覧｜使用サーヴァント・必要数・おすすめフリクエ';
  const description = `FGOの育成で使用する素材${data.items.length}種を一覧掲載。素材ごとに使用するサーヴァント、最大育成時の必要数、クラススコア必要数、ドロップするフリクエを確認できます。`;
  return (
    <PublicPageLayout>
      <SeoHead title={title} description={description} path="/materials/" />
      <Breadcrumbs items={[{ label: '素材' }]} />
      <header className="mb-8 space-y-3">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">FGO素材一覧</h1>
        <p className="max-w-3xl leading-7 text-gray-300">霊基再臨、スキル、アペンドスキル、霊衣、クラススコアで使う素材を掲載しています。素材を選ぶと使用サーヴァントとフリクエ候補を確認できます。</p>
        <p className="text-sm text-gray-500">データ更新: {new Date(data.updatedAt).toLocaleDateString('ja-JP')} / {data.items.length}種</p>
      </header>
      <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-7">
        {data.items.map((item) => (
          <li key={item.id}>
            <Link className="flex h-full items-center gap-3 rounded-lg border border-gray-700 bg-gray-800 p-3 hover:border-yellow-400" to={`/materials/${item.id}/`}>
              <img src={item.icon} alt="" width="48" height="48" loading="lazy" />
              <span className="text-sm font-medium text-white">{item.name}</span>
            </Link>
          </li>
        ))}
      </ul>
    </PublicPageLayout>
  );
}
