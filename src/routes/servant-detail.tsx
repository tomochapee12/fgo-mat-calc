import type { LoaderFunctionArgs } from 'react-router';
import { Link, useLoaderData } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead, SITE_URL } from '@/components/seo/SeoHead';
import { getServantDetailData, type SeoCost, type SeoMaterialAmount } from '@/utils/seo-data.server';

export function loader({ params }: LoaderFunctionArgs) {
  const data = getServantDetailData(Number(params.collectionNo));
  if (!data) throw new Response('Not Found', { status: 404 });
  return data;
}

export default function ServantDetailRoute() {
  const { servant, updatedAt } = useLoaderData<typeof loader>();
  const title = `${servant.name}（${servant.className}・No.${servant.collectionNo}）の必要素材｜FGO素材計算`;
  const description = `FGOの${servant.name}（${servant.className}）に必要な霊基再臨、スキル強化、アペンドスキル、霊衣素材とQPをレベル別・合計で確認できます。`;
  const path = `/servants/${servant.collectionNo}/`;

  return (
    <PublicPageLayout>
      <SeoHead
        title={title}
        description={description}
        path={path}
        type="article"
        structuredData={{
          '@context': 'https://schema.org',
          '@type': 'Dataset',
          name: `${servant.name}のFGO育成素材データ`,
          description,
          url: `${SITE_URL}${path}`,
          dateModified: updatedAt,
          inLanguage: 'ja-JP',
        }}
      />
      <Breadcrumbs items={[{ label: 'サーヴァント', href: '/servants/' }, { label: servant.name }]} />
      <header className="mb-8 flex items-center gap-4">
        <img className="rounded-lg" src={servant.face} alt={servant.name} width="112" height="112" />
        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-white sm:text-3xl">{servant.name}の必要素材</h1>
          <p className="text-gray-300">{'★'.repeat(servant.rarity)} {servant.className} / No.{servant.collectionNo}</p>
          <p className="text-sm text-gray-500">データ更新: {new Date(updatedAt).toLocaleDateString('ja-JP')}</p>
        </div>
      </header>

      <section className="mb-10 rounded-lg border border-yellow-500/30 bg-yellow-500/5 p-4">
        <h2 className="text-lg font-semibold text-white">最大育成時の合計</h2>
        <p className="mt-1 text-sm text-gray-400">通常スキル3種・アペンドスキル3種をすべてLv.10にした場合を含みます。</p>
        <p className="mt-3 font-medium text-yellow-300">QP: {servant.totals.qp.toLocaleString()}</p>
        <MaterialGrid materials={servant.totals.materials} />
      </section>

      <div className="grid gap-8 lg:grid-cols-2">
        <CostSection title="霊基再臨素材" rows={servant.ascension} />
        <CostSection title="スキル強化素材（1スキル分）" rows={servant.skills} />
        <CostSection title="アペンドスキル素材（1スキル分）" rows={servant.appendSkills} />
        {servant.costumes.length > 0 && <CostSection title="霊衣開放素材" rows={servant.costumes} />}
      </div>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to={`/?servant=${servant.collectionNo}`} className="rounded bg-yellow-400 px-4 py-3 font-bold text-gray-900 hover:bg-yellow-300">このサーヴァントを計算機で設定する</Link>
        <Link to="/servants/" className="rounded border border-gray-600 px-4 py-3 text-gray-200 hover:border-yellow-400">一覧へ戻る</Link>
      </div>
    </PublicPageLayout>
  );
}

function CostSection({ title, rows }: { title: string; rows: SeoCost[] }) {
  return (
    <section>
      <h2 className="mb-3 text-lg font-semibold text-white">{title}</h2>
      <div className="space-y-3">
        {rows.map((row) => (
          <div key={row.label} className="rounded-lg bg-gray-800 p-4">
            <h3 className="mb-2 text-sm font-medium text-yellow-300">{row.label}</h3>
            <MaterialGrid materials={row.materials} />
            <p className="mt-2 text-right text-sm text-gray-400">QP: {row.qp.toLocaleString()}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

function MaterialGrid({ materials }: { materials: SeoMaterialAmount[] }) {
  return (
    <ul className="mt-3 grid gap-2 sm:grid-cols-2">
      {materials.map((material) => (
        <li key={material.itemId} className="flex items-center gap-2 rounded bg-gray-900/60 p-2">
          <img src={material.icon} alt="" width="36" height="36" loading="lazy" />
          <Link className="text-sm text-gray-200 hover:text-yellow-300" to={`/materials/${material.itemId}/`}>{material.name}</Link>
          <span className="ml-auto text-sm text-yellow-300">×{material.amount}</span>
        </li>
      ))}
    </ul>
  );
}
