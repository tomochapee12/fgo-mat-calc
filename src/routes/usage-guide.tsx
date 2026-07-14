import { Link } from 'react-router';
import { Breadcrumbs, PublicPageLayout } from '@/components/seo/PublicPageLayout';
import { SeoHead } from '@/components/seo/SeoHead';

export default function UsageGuideRoute() {
  const title = 'FGO素材シミュレーターの使い方｜育成計画・所持素材・不足数';
  const description = 'FGO素材シミュレーターでサーヴァントの育成目標を設定し、必要素材とQP、所持素材との差分、フリクエ候補、クラススコアを確認する手順を解説します。';
  return (
    <PublicPageLayout>
      <SeoHead title={title} description={description} path="/guide/usage/" type="article" />
      <Breadcrumbs items={[{ label: '使い方' }]} />
      <article className="mx-auto max-w-3xl space-y-10">
        <header className="space-y-3"><h1 className="text-2xl font-bold text-white sm:text-3xl">FGO素材シミュレーターの使い方</h1><p className="leading-7 text-gray-300">育成したいサーヴァントを複数登録し、現在の進捗から目標までに必要な素材とQPをまとめて計算できます。入力内容はブラウザ内に保存され、サーバーへ送信されません。</p></header>
        <GuideStep number="1" title="サーヴァントを選ぶ"><p>トップページの「サーヴァント」タブで名前、クラス、レアリティから絞り込みます。カードを選ぶと育成設定画面が開きます。</p></GuideStep>
        <GuideStep number="2" title="現在と目標を設定する"><p>霊基再臨、通常スキル3種、アペンドスキル3種について、現在値と目標値を入力します。設定したサーヴァントは自動的に計算対象になります。</p></GuideStep>
        <GuideStep number="3" title="所持素材を登録する"><p>「所持素材」タブで現在の素材数を入力します。素材計算結果に必要数・所持数・不足数が表示されます。</p></GuideStep>
        <GuideStep number="4" title="不足素材と行動計画を確認する"><p>「素材計算」で全育成目標の合計を確認し、「行動計画」で不足素材、フリクエ候補、必要APの目安を確認します。実際のイベント交換やドロップ率もあわせて判断してください。</p></GuideStep>
        <GuideStep number="5" title="クラススコアを追加する"><p>「クラススコア」で解放済みサインと目標サインを選ぶと、サーヴァント育成分と合算して必要素材を管理できます。</p></GuideStep>
        <section className="rounded-lg bg-gray-800 p-5"><h2 className="text-lg font-semibold text-white">データのバックアップ</h2><p className="mt-2 leading-7 text-gray-300">「入出力」タブから設定を文字データまたはファイルとして保存できます。ブラウザのデータを消去する前や別端末へ移す際に利用してください。</p></section>
        <Link to="/" className="inline-block rounded bg-yellow-400 px-5 py-3 font-bold text-gray-900 hover:bg-yellow-300">素材計算を始める</Link>
      </article>
    </PublicPageLayout>
  );
}

function GuideStep({ number, title, children }: { number: string; title: string; children: React.ReactNode }) {
  return <section><h2 className="text-xl font-semibold text-white"><span className="mr-2 text-yellow-300">{number}.</span>{title}</h2><div className="mt-3 leading-7 text-gray-300">{children}</div></section>;
}
