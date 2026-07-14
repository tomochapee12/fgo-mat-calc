# SEO・検索流入の公開後運用

## 1. Cloudflareで正規ドメインを統一する

リポジトリ内のcanonical、OG URL、構造化データ、robots.txt、sitemap.xmlは `https://fgo-mat-calc.t12jp.org/` に統一済みです。

Cloudflareダッシュボードで次のBulk Redirectを1件設定します。この設定はリポジトリからは変更できません。

| 項目 | 値 |
| --- | --- |
| Source URL | `https://fgo-mat-calc.pages.dev` |
| Target URL | `https://fgo-mat-calc.t12jp.org` |
| Status | `301` |
| Options | Preserve query string / Subpath matching / Preserve path suffix |

設定後、以下が301と独自ドメインのLocationを返すことを確認します。

```powershell
curl.exe -I https://fgo-mat-calc.pages.dev/
curl.exe -I https://fgo-mat-calc.pages.dev/servants/1/
```

## 2. Search Consoleを設定する

1. `t12jp.org` のドメインプロパティ、または `https://fgo-mat-calc.t12jp.org/` のURLプレフィックスプロパティを登録する。
2. `https://fgo-mat-calc.t12jp.org/sitemap.xml` を送信する。
3. `/`、`/servants/1/`、`/materials/6501/`、`/class-score/1/` をURL検査する。
4. 公開URLテストで、H1、説明文、固有データ、canonicalがレンダリング前HTMLにも含まれることを確認する。
5. ユーザー指定canonicalとGoogle選択canonicalが独自ドメインで一致するまで週1回確認する。

## 3. 公開直後のHTTP確認

```powershell
curl.exe -I https://fgo-mat-calc.t12jp.org/
curl.exe -I https://fgo-mat-calc.t12jp.org/servants/1/
curl.exe -I https://fgo-mat-calc.t12jp.org/materials/6501/
curl.exe -I https://fgo-mat-calc.t12jp.org/class-score/1/
curl.exe -I https://fgo-mat-calc.t12jp.org/not-a-real-page
curl.exe https://fgo-mat-calc.t12jp.org/robots.txt
curl.exe https://fgo-mat-calc.t12jp.org/sitemap.xml
```

期待値は、公開ページが200、存在しないページが404、robots.txtとsitemap.xmlが200です。

## 4. アクセス計測

Cloudflare Web Analyticsを有効にしてページビューと参照元を計測します。ユーザー操作の計測が必要な場合はCloudflare ZarazまたはGA4を接続してください。アプリは以下のイベントを送信できる状態です。

- `select_servant`: サーヴァントを選択
- `change_tab`: 素材計算、所持素材、行動計画などへ移動

サーヴァント名、所持素材数、エクスポート内容などのユーザーデータはイベントへ含めません。

## 5. 30・60・90日レビュー

### 30日

- Google選択canonicalの一致率100%
- sitemap送信URLの検出状況
- 非指名検索の表示回数が発生しているページとクエリ
- クロール済み・インデックス未登録ページの共通点

### 60日

- 順位11〜30位のページを優先してtitle、説明、本文、内部リンクを改善
- 表示回数があるのにCTRが低いページのタイトルを調整
- 新規サーヴァントと新素材の追加から24時間以内に再ビルドされているか確認

### 90日

- 最初の28日を基準に、非指名表示回数2倍、自然検索クリック50〜100%増を目標に評価
- 検索ランディングから `select_servant` までの到達率25%以上を目標に評価
- 成果のない薄い素材ページは統合またはnoindexを検討

## 6. 検索向けコンテンツの品質ルール

- 個別ページにはURL固有の素材数、QP、使用先、フリクエ情報を掲載する。
- データがないページを検索流入目的で生成しない。
- `lastmod` はデータが実際に更新された日だけ変更する。
- 架空の評価・レビュー・`aggregateRating`を構造化データへ追加しない。
- 外部コミュニティへの投稿は機能追加や更新情報として行い、無関係な場所への大量投稿を行わない。
