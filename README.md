# NISA Lens Mock (MVP)

静的HTML/CSS/JSで作成した、NISA匿名投稿サイトのMVPモックです。  
画面確認と主要フロー検証（投稿→審査→公開→通報→非公開）を目的にしています。

## 画面一覧
- `index.html`: トップページ
- `login.html`: ログイン（メール/Google + TOTPモック）
- `nisa_user_mock.html`: 利用者画面（検索・投稿）
- `nisa_post_detail.html`: 投稿詳細
- `nisa_admin_mock.html`: 管理者画面（審査・通報・CSV）

## 使い方
PowerShell:

```powershell
cd C:\Users\tamot\.vscode\nisa_pj_1
Start-Process .\index.html
```

## 主要フロー
1. `nisa_user_mock.html` で投稿内容確認 (`投稿内容確認`)
2. `審査キューへ送信` で投稿をキューへ追加
3. `nisa_admin_mock.html` で `承認` または `却下`
4. 承認後、`nisa_user_mock.html` の検索一覧に反映
5. `詳細を見る` で `nisa_post_detail.html?id=...` へ遷移
6. 詳細から通報送信 → 管理者通報管理に反映
7. 管理者で `非公開化` → 利用者一覧/詳細から非表示

## 並び替え・検索
- 並び替え:
  - `新着順`
  - `過去1年成績順`
  - `開始来成績順`
  - `あなたに近い順`
- 検索条件は `localStorage` に保存され、再訪時に復元されます。

## CSV出力（管理者）
- `承認済み投稿CSV`
- `通報CSV`

## localStorage キー
- `nisaQueuedPosts`: 審査待ち投稿
- `nisaPublishedPosts`: 承認済み投稿
- `nisaReports`: 通報データ
- `nisaHiddenPostIds`: 非公開投稿ID
- `nisaSearchPreferences`: 検索条件/並び替え

## 注意
- バックエンドなしのモック実装です。
- データはブラウザごとの `localStorage` に保存されます。
- 別ブラウザ/シークレットモードではデータ共有されません。
