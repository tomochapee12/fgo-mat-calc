# FGO素材シミュレーター

Fate/Grand Order の素材計算ツール。育成に必要な素材を一括計算し、所持数との差分を確認できる。

公開サイト: [https://fgo-mat-calc.t12jp.org/](https://fgo-mat-calc.t12jp.org/)

## 機能

- サーヴァント一覧（検索・クラス/レアリティフィルタ対応、ひらがな↔カタカナ変換検索）
- 育成計画設定（霊基再臨・スキル・アペンドスキル・霊衣）
- 必要素材の自動計算・不足数表示
- 所持素材の管理（localStorage保存、サーバー不要）
- Atlas Academy API による自動データ更新（GitHub Actions）

## 技術スタック

- React 19 + TypeScript + Vite
- Tailwind CSS v4
- Cloudflare Pages（ホスティング）
- React Router Framework Mode（静的プリレンダ・ルーティング）
- GitHub Actions（データ更新 + デプロイ）

## データソース

[Atlas Academy API](https://api.atlasacademy.io/) からサーヴァント・アイテムデータを取得。
画像（サーヴァントface、アイテムアイコン）はリポジトリに保存。

## 開発

```bash
# 依存関係インストール
npm install

# 初回データ取得（全サーヴァント + アイテム + 画像）
npm run data:init

# 開発サーバー起動
npm run dev

# ビルド
npm run build

# lint・テスト・全SEOページの検証をまとめて実行
npm run check
```

ビルド時にサーヴァント・素材・クラススコアの個別ページと `sitemap.xml` を自動生成し、全ページのcanonical、H1、description、OGP、JSON-LD、サイトマップ対応を検証します。Cloudflare Pages の出力ディレクトリは `dist/client` です。公開後の確認手順は [docs/seo-operations.md](docs/seo-operations.md) を参照してください。

## データ更新

```bash
# 差分更新（新規サーヴァントのみ取得）
npm run data:update
```

## クレジット

- 本サイトはFate/Grand Orderの非公式ファンツールです
- ©TYPE-MOON / FGO PROJECT
- Game data provided by [Atlas Academy](https://atlasacademy.io/) ([ODC-BY 1.0](https://opendatacommons.org/licenses/by/1-0/))
