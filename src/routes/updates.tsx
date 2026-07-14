import { useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { getUpdateData } from '@/utils/seo-data.server';

export function loader() { return getUpdateData(); }

export default function UpdatesRoute() {
  const data = useLoaderData<typeof loader>();
  const title = 'FGO素材シミュレーター データ更新情報';
  const description = `FGO素材シミュレーターのサーヴァント、素材、フリークエスト、クラススコアの収録件数と最終更新日を掲載しています。現在${data.servantCount}騎、${data.itemCount}素材に対応。`;
  return <PublicPageLayout><SeoHead title={title} description={description} path="/updates/" type="article" /><Breadcrumbs items={[{ label: '更新情報' }]} /><article className="mx-auto max-w-3xl space-y-8"><header className="space-y-3"><h1 className="text-2xl font-bold text-white sm:text-3xl">データ更新情報</h1><p className="leading-7 text-gray-300">公開データの収録状況と最終更新日です。サーヴァントと素材はAtlas Academyの公開APIをもとに定期更新しています。</p></header><dl className="grid gap-4 sm:grid-cols-2"><UpdateCard title="サーヴァント・素材" date={data.servantUpdatedAt} detail={`${data.servantCount}騎 / ${data.itemCount}素材`} /><UpdateCard title="フリークエスト" date={data.questUpdatedAt} detail={`${data.questCount}クエスト`} /><UpdateCard title="クラススコア" date={data.classScoreUpdatedAt} detail="9クラス対応" /></dl><section className="rounded-lg bg-gray-800 p-5"><h2 className="text-lg font-semibold text-white">更新方法とデータ出典</h2><p className="mt-3 leading-7 text-gray-300">サーヴァント・アイテムデータはGitHub Actionsで定期的に差分確認し、新規データがある場合にサイトを再ビルドします。ゲームデータはAtlas Academy提供の公開データを使用しています。</p><p className="mt-3 text-sm text-gray-400">ゲーム内で直近に追加された内容は反映まで時間がかかる場合があります。計算前にページ上部の更新日をご確認ください。</p></section></article></PublicPageLayout>;
}

function UpdateCard({ title, date, detail }: { title: string; date: string; detail: string }) {
  return <div className="rounded-lg border border-gray-700 bg-gray-800 p-5"><dt className="font-semibold text-white">{title}</dt><dd className="mt-2 text-yellow-300">{new Date(date).toLocaleString('ja-JP')}</dd><dd className="mt-1 text-sm text-gray-400">{detail}</dd></div>;
}
