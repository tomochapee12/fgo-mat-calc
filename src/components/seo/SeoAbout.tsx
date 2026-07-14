import { Link } from 'react-router';

export function SeoAbout() {
  return (
    <section aria-labelledby="about-tool-title" className="border-t border-gray-700 bg-gray-900 px-4 py-8 text-gray-200">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="space-y-2">
          <h2 id="about-tool-title" className="text-xl font-bold text-white sm:text-2xl">
            FGO素材計算・育成計画シミュレーター
          </h2>
          <p className="leading-7 text-gray-300">
            Fate/Grand Orderのサーヴァント育成に必要な霊基再臨、スキル強化、アペンドスキル、
            霊衣、QPをまとめて計算できる無料の非公式ファンツールです。所持素材を登録すると、
            育成目標までに不足している素材数も確認できます。
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <div>
            <h2 className="mb-2 text-base font-semibold text-white">使い方</h2>
            <ol className="list-decimal space-y-1 pl-5 leading-6 text-gray-300">
              <li>育成したいサーヴァントを選択します。</li>
              <li>現在と目標の再臨段階・スキルレベルを設定します。</li>
              <li>「素材計算」で必要素材、QP、所持数との差分を確認します。</li>
            </ol>
          </div>
          <div>
            <h2 className="mb-2 text-base font-semibold text-white">対応している育成項目</h2>
            <ul className="list-disc space-y-1 pl-5 leading-6 text-gray-300">
              <li>霊基再臨・通常スキル・アペンドスキル・霊衣</li>
              <li>複数サーヴァントの必要素材とQPの一括集計</li>
              <li>所持素材との差分、育成優先度、フリクエ候補</li>
              <li>クラススコアの素材計算と進捗管理</li>
            </ul>
          </div>
        </div>
        <nav aria-label="関連データ" className="flex flex-wrap gap-3">
          {[
            ['/servants/', 'サーヴァント別必要素材'],
            ['/materials/', '素材別使用先'],
            ['/class-score/', 'クラススコア必要素材'],
            ['/guide/usage/', '詳しい使い方'],
            ['/updates/', 'データ更新情報'],
          ].map(([href, label]) => (
            <Link key={href} to={href} className="rounded border border-gray-600 px-3 py-2 text-sm text-gray-200 hover:border-yellow-400 hover:text-yellow-300">
              {label}
            </Link>
          ))}
        </nav>
        <div className="space-y-2 text-sm leading-6 text-gray-400">
          <h2 className="font-semibold text-gray-200">データと更新について</h2>
          <p>サーヴァントと素材データはAtlas Academyの公開データをもとに定期更新しています。各データの更新日はページ上部に表示しています。</p>
          <p>本サイトはFate/Grand Orderの非公式ファンツールであり、TYPE-MOONおよびFGO PROJECTとは関係ありません。</p>
        </div>
      </div>
    </section>
  );
}
