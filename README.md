# FGO素材シミュレーター

Fate/Grand Order の素材計算ツール。育成に必要な素材を一括計算し、所持数との差分を確認できる。

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
```

## データ更新

```bash
# 差分更新（新規サーヴァントのみ取得）
npm run data:update
```

## クレジット

- 本サイトはFate/Grand Orderの非公式ファンツールです
- ©TYPE-MOON / FGO PROJECT
- Game data provided by [Atlas Academy](https://atlasacademy.io/) ([ODC-BY 1.0](https://opendatacommons.org/licenses/by/1-0/))