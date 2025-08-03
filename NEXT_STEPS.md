# 次のステップ

## 現在の実装状況

✅ **完了した項目:**
- Supabase クライアント設定（client.ts, server.ts）
- 認証ミドルウェア（middleware.ts）
- データベーススキーマ（8テーブル）
- RLSポリシー設定
- 認証UI（/auth ページ）
- プロフィール設定画面（/profile ページ）
- 認証ボタンコンポーネント
- TypeScript型定義
- シードデータ（レシピ10件、レストラン12件）

## 必要な手動作業

### 1. Supabase プロジェクトの作成
1. [Supabase Dashboard](https://supabase.com/dashboard) でプロジェクトを作成
2. `.env.local` ファイルを作成し、環境変数を設定（詳細は SUPABASE_SETUP.md 参照）

### 2. データベースのセットアップ
Supabase SQL Editor で以下を順番に実行：
```sql
-- 1. スキーマ作成
supabase/migrations/001_initial_schema.sql

-- 2. RLSポリシー設定
supabase/migrations/002_rls_policies.sql

-- 3. サンプルデータ（オプション）
supabase/seed/001_seed_recipes.sql
supabase/seed/002_seed_restaurants.sql
```

### 3. npm パッケージのインストール
```bash
# package.json を手動で更新済みなので、以下を実行
npm install
```

## 次の実装タスク（Phase 1 残り）

### Week 3: レシピ・レストラン管理
- [ ] レシピ一覧ページ（/recipes）
- [ ] レシピ詳細ページ（/recipes/[id]）
- [ ] レストラン一覧ページ（/restaurants）
- [ ] レストラン詳細ページ（/restaurants/[id]）
- [ ] 検索・フィルター機能

### Week 4: 食事記録機能
- [ ] 食事記録ページ（/meals）
- [ ] カレンダービュー
- [ ] 統計ダッシュボード
- [ ] 栄養情報の可視化

## Phase 2 以降の計画

### Phase 2: AI機能統合（1ヶ月）
- OpenAI API統合
- レコメンデーション機能
- 画像認識機能
- チャットボット

### Phase 3: 決済・サブスクリプション（2ヶ月）
- Stripe統合
- プレミアムプラン
- 支払い管理

### Phase 4: コミュニティ機能（2ヶ月）
- ユーザー投稿レシピ
- レビュー・評価
- ソーシャル機能

### Phase 5: スケーリング（2ヶ月）
- パフォーマンス最適化
- 多言語対応
- アナリティクス強化

## 開発コマンド

```bash
# 開発サーバー起動
npm run dev

# ビルド
npm run build

# リント
npm run lint

# 型チェック
npx tsc --noEmit
```

## MCP（Model Context Protocol）活用

### GitHub MCP（利用可能）
```bash
# リポジトリ作成（既に存在）
mcp__github__create_repository

# ブランチ作成
mcp__github__create_branch
  owner: "arwg1"
  repo: "kyou-nani-tabeyou"
  branch: "feature/supabase-auth"

# ファイルプッシュ
mcp__github__push_files
  owner: "arwg1"
  repo: "kyou-nani-tabeyou"
  branch: "feature/supabase-auth"
  files: [全ての新規作成ファイル]
  message: "feat: Supabase統合と認証システム実装"

# PR作成
mcp__github__create_pull_request
  title: "feat: Supabase統合と認証システム"
  head: "feature/supabase-auth"
  base: "main"
```

### Supabase MCP（現在エラー）
```bash
# 本来は以下が使用可能（Transport closedエラーで現在使用不可）
mcp__supabase-community-supabase-mcp__create_project
mcp__supabase-community-supabase-mcp__execute_sql
mcp__supabase-community-supabase-mcp__deploy_edge_function
```

## トラブルシューティング

### npm install でエラーが出る場合
Tailwind CSS v4 の問題で npm install が失敗する場合：
1. `node_modules` と `package-lock.json` を削除
2. 管理者権限でコマンドプロンプトを開く
3. `npm install` を再実行

### Supabase 接続エラー
1. `.env.local` の環境変数を確認
2. Supabase プロジェクトがアクティブか確認
3. ブラウザのコンソールでエラーを確認