# NISA Production App (Next.js + Supabase)

NISA運用者の匿名投稿サイト本番実装です。  
投稿は即時公開、通報と管理者非公開化に対応しています。

## Stack
- Next.js App Router
- Supabase Auth / Postgres / RLS
- Vercel deploy target

## Setup
1. 環境変数を作成
```powershell
copy .env.example .env.local
```
2. Supabase SQL Editor で `supabase/schema.sql` を実行
3. Supabase Auth Provider で `Email` と `Google` を有効化
4. Redirect URL を設定
- `http://localhost:3000/auth/callback`
- `https://<your-vercel-domain>/auth/callback`

## Local Run
```powershell
npm run dev
```

## Main Routes
- `/` 利用者画面（検索・投稿）
- `/post/[id]` 投稿詳細・通報
- `/admin` 管理者画面（投稿管理・通報管理）
- `/login` メール/Google ログイン

## RLS
- `posts`: `published` のみ一般参照可
- `posts` insert: 認証ユーザー本人のみ
- `reports`: 通報者本人のみ参照可、認証ユーザーのみ作成可
- 管理者操作は `SUPABASE_SERVICE_ROLE_KEY` を使用（`/admin`）

## Deploy (Vercel)
1. GitHubへpush
2. Vercelにリポジトリ連携
3. Root Directory を `web` に設定
4. Environment Variables を `.env.example` と同名で登録
5. Deploy

## Notes
- コメント/DMは未実装（仕様どおり）
- リアクションはUIのみ
- TOTPはSupabase MFA運用で有効化可能（UI追加は次フェーズ）
