import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead } from '@/components/seo/SeoHead';
import { getClassScoreIndexData } from '@/utils/seo-data.server';

export function loader() { return getClassScoreIndexData(); }

export default function ClassScoreIndexRoute() {
  const data = useLoaderData<typeof loader>();
  const title = 'FGOクラススコア必要素材一覧｜クラス別素材・QP計算';
  const description = 'FGOのクラススコア9種について、全サイン解放に必要な素材とQP、各サインの効果をクラス別に確認できます。';
  return <PublicPageLayout><SeoHead title={title} description={description} path="/class-score/" /><Breadcrumbs items={[{ label: 'クラススコア' }]} /><header className="mb-8 space-y-3"><h1 className="text-2xl font-bold text-white sm:text-3xl">FGOクラススコア必要素材一覧</h1><p className="max-w-3xl leading-7 text-gray-300">クラスごとに全サイン解放時の必要素材・QPと各サインの効果を掲載しています。</p><p className="text-sm text-gray-500">データ更新: {new Date(data.updatedAt).toLocaleDateString('ja-JP')}</p></header><ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{data.boards.map((board) => <li key={board.id}><Link className="block rounded-lg border border-gray-700 bg-gray-800 p-5 hover:border-yellow-400" to={`/class-score/${board.id}/`}><h2 className="text-lg font-semibold text-white">{board.name}</h2><p className="mt-2 text-sm text-gray-400">{board.squareCount}サインの必要素材を確認</p></Link></li>)}</ul></PublicPageLayout>;
}
