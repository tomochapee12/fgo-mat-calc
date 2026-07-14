import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead, SITE_URL } from '@/components/seo/SeoHead';
import { getMaterialDetailData } from '@/utils/seo-data.server';

export function loader({ params }: LoaderFunctionArgs) {
  const data = getMaterialDetailData(Number(params.itemId));
  if (!data) throw new Response('Not Found', { status: 404 });
  return data;
}

export default function MaterialDetailRoute() {
  const data = useLoaderData<typeof loader>();
  const { item } = data;
  const title = `${item.name}の必要数・使用サーヴァント・ドロップ場所｜FGO素材`; 
  const description = `FGO素材「${item.name}」を使用するサーヴァントと最大育成時の必要数、クラススコアでの使用数、ドロップ効率のよいフリークエスト候補を掲載しています。`;
  const path = `/materials/${item.id}/`;

  return (
    <PublicPageLayout>
      <SeoHead title={title} description={description} path={path} type="article" structuredData={{ '@context': 'https://schema.org', '@type': 'Dataset', name: `${item.name}のFGO素材データ`, description, url: `${SITE_URL}${path}`, dateModified: data.updatedAt, inLanguage: 'ja-JP' }} />
      <Breadcrumbs items={[{ label: '素材', href: '/materials/' }, { label: item.name }]} />
      <header className="mb-8 flex items-center gap-4">
        <img src={item.icon} alt={item.name} width="96" height="96" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{item.name}の必要数と入手場所</h1>
          <p className="text-sm text-gray-500">素材データ更新: {new Date(data.updatedAt).toLocaleDateString('ja-JP')}</p>
        </div>
      </header>

      <section className="mb-10">
        <h2 className="mb-3 text-xl font-semibold text-white">使用するサーヴァント</h2>
        <p className="mb-4 text-sm leading-6 text-gray-400">表示数は霊基再臨、通常スキル3種、アペンドスキル3種、霊衣を最大まで育成した場合の合計です。</p>
        {data.usage.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800 text-gray-300"><tr><th className="px-4 py-3">サーヴァント</th><th className="px-4 py-3 text-right">必要数</th></tr></thead>
              <tbody className="divide-y divide-gray-800">
                {data.usage.map((usage) => <tr key={usage.collectionNo}><td className="px-4 py-3"><Link className="text-gray-100 hover:text-yellow-300" to={`/servants/${usage.collectionNo}/`}>{usage.name}</Link></td><td className="px-4 py-3 text-right text-yellow-300">{usage.amount}</td></tr>)}
              </tbody>
            </table>
          </div>
        ) : <p className="text-gray-500">サーヴァント育成での使用データはありません。</p>}
      </section>

      {data.classScoreUsage.length > 0 && (
        <section className="mb-10">
          <h2 className="mb-3 text-xl font-semibold text-white">クラススコアでの必要数</h2>
          <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {data.classScoreUsage.map((usage) => <li key={usage.boardId}><Link className="flex justify-between rounded-lg bg-gray-800 p-4 hover:ring-1 hover:ring-yellow-400" to={`/class-score/${usage.boardId}/`}><span>{usage.boardName}</span><span className="text-yellow-300">×{usage.amount}</span></Link></li>)}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-3 text-xl font-semibold text-white">ドロップするフリークエスト候補</h2>
        <p className="mb-4 text-sm leading-6 text-gray-400">Atlas Academyの周回データから、APあたりの期待値を基準に並べています。イベントや最新のゲーム内情報もあわせて確認してください。データ更新: {new Date(data.questUpdatedAt).toLocaleDateString('ja-JP')}</p>
        {data.bestQuests.length > 0 ? (
          <div className="overflow-x-auto rounded-lg border border-gray-700">
            <table className="w-full text-left text-sm"><thead className="bg-gray-800 text-gray-300"><tr><th className="px-4 py-3">場所</th><th className="px-4 py-3">クエスト</th><th className="px-4 py-3 text-right">AP</th><th className="px-4 py-3 text-right">1個あたりAP目安</th></tr></thead><tbody className="divide-y divide-gray-800">{data.bestQuests.map((quest) => <tr key={quest.id}><td className="px-4 py-3 text-gray-400">{quest.warName}<br />{quest.spotName}</td><td className="px-4 py-3">{quest.name}</td><td className="px-4 py-3 text-right">{quest.ap}</td><td className="px-4 py-3 text-right text-yellow-300">{quest.apPerDrop?.toFixed(1) ?? '-'}</td></tr>)}</tbody></table>
          </div>
        ) : <p className="text-gray-500">恒常フリークエストのドロップデータはありません。</p>}
      </section>
    </PublicPageLayout>
  );
}
