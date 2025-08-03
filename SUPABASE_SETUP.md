# Supabase プロジェクトセットアップガイド

## 1. Supabase プロジェクトの作成

1. [Supabase Dashboard](https://supabase.com/dashboard) にアクセス
2. 「New project」をクリック
3. プロジェクト名: `kyou-nani-tabeyou`
4. データベースパスワードを設定（安全な場所に保存）
5. Region: `Northeast Asia (Tokyo)` を選択
6. 「Create new project」をクリック

## 2. 環境変数の設定

プロジェクトが作成されたら、以下の手順で環境変数を設定します：

1. Supabase Dashboard で作成したプロジェクトを開く
2. 左サイドバーの「Settings」→「API」をクリック
3. 以下の値をコピー：
   - `Project URL` → `NEXT_PUBLIC_SUPABASE_URL`
   - `anon public` キー → `NEXT_PUBLIC_SUPABASE_ANON_KEY`

4. `.env.local` ファイルを作成し、以下の内容を貼り付け：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_project_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## 3. データベースのセットアップ

1. Supabase Dashboard で「SQL Editor」を開く
2. 以下のSQLファイルを順番に実行：
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`

## 4. 認証の設定

1. Dashboard の「Authentication」→「Providers」を開く
2. Email認証を有効化（デフォルトで有効）
3. Google認証を設定する場合：
   - Google OAuth を有効化
   - [Google Cloud Console](https://console.cloud.google.com/) でOAuth 2.0クライアントIDを作成
   - Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
   - Client IDとClient Secretを Supabase に設定

## 5. ローカル開発の開始

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev
```

## 6. 動作確認

1. http://localhost:3000 にアクセス
2. 右上の「サインイン」ボタンをクリック
3. 新規登録またはサインインを試す
4. プロフィール設定画面が表示されれば成功

## トラブルシューティング

### npm install でエラーが出る場合

```bash
# npm キャッシュをクリア
npm cache clean --force

# node_modules を削除
rm -rf node_modules package-lock.json

# 再インストール
npm install
```

### Supabase 接続エラー

- 環境変数が正しく設定されているか確認
- Supabase プロジェクトがアクティブか確認
- ネットワーク接続を確認

### 認証エラー

- Email認証の場合、確認メールが届いているか確認
- スパムフォルダも確認
- Supabase Dashboard の「Authentication」→「Users」で確認