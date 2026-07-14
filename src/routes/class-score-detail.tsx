import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead, SITE_URL } from '@/components/seo/SeoHead';
import { getClassScoreDetailData } from '@/utils/seo-data.server';

export function loader({ params }: LoaderFunctionArgs) { const data = getClassScoreDetailData(Number(params.boardId)); if (!data) throw new Response('Not Found', { status: 404 }); return data; }

export default function ClassScoreDetailRoute() {
  const { board, updatedAt } = useLoaderData<typeof loader>();
  const title = `FGO ${board.name}クラススコアの必要素材・QP・効果一覧`;
  const description = `FGOの${board.name}クラススコア全${board.squareCount}サインを解放するために必要な素材とQP、各サインの効果を一覧で確認できます。`;
  const path = `/class-score/${board.id}/`;
  return <PublicPageLayout><SeoHead title={title} description={description} path={path} type="article" structuredData={{ '@context': 'https://schema.org', '@type': 'Dataset', name: `${board.name}クラススコア素材データ`, description, url: `${SITE_URL}${path}`, dateModified: updatedAt, inLanguage: 'ja-JP' }} /><Breadcrumbs items={[{ label: 'クラススコア', href: '/class-score/' }, { label: board.name }]} /><header className="mb-8 space-y-3"><h1 className="text-2xl font-bold text-white sm:text-3xl">{board.name}クラススコアの必要素材</h1><p className="text-gray-300">全{board.squareCount}サインを解放した場合の合計です。</p><p className="text-sm text-gray-500">データ更新: {new Date(updatedAt).toLocaleDateString('ja-JP')}</p></header><section className="mb-10 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-5"><h2 className="text-xl font-semibold text-white">全解放時の合計</h2><p className="mt-3 text-yellow-300">QP: {board.qp.toLocaleString()}</p><ul className="mt-4 grid gap-3 sm:grid-cols-2 md:grid-cols-3">{board.materials.map((material) => <li key={material.itemId} className="flex items-center gap-3 rounded bg-gray-800 p-3"><img src={material.icon} alt="" width="40" height="40" /><Link className="hover:text-yellow-300" to={`/materials/${material.itemId}/`}>{material.name}</Link><span className="ml-auto text-yellow-300">×{material.amount}</span></li>)}</ul></section><section><h2 className="mb-4 text-xl font-semibold text-white">サイン別の効果と素材</h2><div className="grid gap-4 lg:grid-cols-2">{board.squares.map((square) => <article key={square.id} className="rounded-lg bg-gray-800 p-4"><h3 className="font-semibold text-white">{square.name}</h3><p className="mt-1 text-sm leading-6 text-gray-400">{square.detail}</p><p className="mt-3 text-sm text-gray-300">QP: {square.qp.toLocaleString()}</p><ul className="mt-2 flex flex-wrap gap-3">{square.materials.map((material) => <li key={material.itemId} className="text-sm"><Link className="text-gray-200 hover:text-yellow-300" to={`/materials/${material.itemId}/`}>{material.name}</Link> <span className="text-yellow-300">×{material.amount}</span></li>)}</ul></article>)}</div></section></PublicPageLayout>;
}
