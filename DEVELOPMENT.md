# 開発ドキュメント - BOGs (BOGCOM AI Assistant) 🤖

## 📋 プロジェクト概要

BOGCOM社内AIアシスタント「BOGs」。
LINEアカウントでログインし、リアルタイムチャット、AI RAG（ドキュメント分析）、Web検索が可能なエンタープライズグレードのAIシステム。

**公開URL:** http://43.207.102.107

---

## 🏗️ 技術スタック

### バックエンド
- **Node.js** v20.x
- **Express** 4.18.2 - Webフレームワーク
- **Socket.io** 4.6.1 - リアルタイム通信（WebSocket）
- **express-session** 1.17.3 - セッション管理
- **axios** 1.6.2 - HTTP通信（LINE API、SERPER API呼び出し）
- **dotenv** 16.3.1 - 環境変数管理
- **mongoose** 8.0.3 - MongoDB ODM
- **multer** 1.4.5 - ファイルアップロード処理
- **openai** 4.20.1 - OpenAI API統合
- **pdf-parse** 1.1.1 - PDFテキスト抽出
- **mammoth** 1.6.0 - Wordテキスト抽出

### フロントエンド
- HTML5 + CSS3（モダンレスポンシブデザイン）
- JavaScript（ES6+、Vanilla）
- Socket.io Client

### データベース
- **MongoDB Atlas** - クラウドNoSQLデータベース
  - ユーザー情報
  - 会話履歴
  - アップロードドキュメント

### AI & 検索
- **OpenAI API** - GPT-4o-mini（コスト効率良）
- **SERPER API** - Google検索API（リアルタイムWeb検索）

### インフラ
- **AWS EC2** - Ubuntu 22.04 LTS（t2.micro）
- **Nginx** - リバースプロキシ（ポート80 → 3000）
- **PM2** - Node.jsプロセスマネージャー
- **GitHub Actions** - CI/CD自動デプロイ

### 認証
- **LINE Login** (OAuth 2.0)
- LINE Channel ID: `2008398258`

---

## 📁 ファイル構造

```
hello-vibe/
├── .github/
│   └── workflows/
│       └── deploy.yml           # GitHub Actionsワークフロー
├── models/
│   ├── User.js                  # Mongooseユーザースキーマ
│   ├── Conversation.js          # 会話履歴スキーマ
│   └── Document.js              # ドキュメントスキーマ
├── public/
│   ├── index.html               # トップページ（チャット）
│   └── chat.html                # AIチャットページ
├── uploads/                     # ファイルアップロード先（.gitignore済み）
├── server.js                    # バックエンドサーバー（メインファイル）
├── package.json                 # Node.js依存関係
├── .env                         # 環境変数（ローカル、.gitignore済み）
├── .gitignore                   # Git除外ファイル
├── README.md                    # プロジェクト概要
└── DEVELOPMENT.md              # この開発ドキュメント
```

---

## 🔐 環境変数

### ローカル開発用 (.env)
```env
# LINE Login設定
LINE_CHANNEL_ID=2008398258
LINE_CHANNEL_SECRET=b93e218ea1d09df54f6f7d0c6b21ce53
LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback

# セッション設定
SESSION_SECRET=hello-vibe-super-secret-key-2024

# MongoDB設定
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hello-vibe?retryWrites=true&w=majority

# OpenAI API設定
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SERPER API設定（Web検索用）
SERPER_API_KEY=your-serper-api-key

# サーバー設定
PORT=3000
```

### 本番環境（EC2）
GitHub Secretsから自動的に設定される：
- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CALLBACK_URL` (自動生成: `http://43.207.102.107/auth/line/callback`)
- `SESSION_SECRET`
- `MONGODB_URI`
- `OPENAI_API_KEY`
- `SERPER_API_KEY`

---

## 🖥️ AWS EC2環境情報

### インスタンス情報
- **パブリックIP:** `43.207.102.107`
- **OS:** Ubuntu 22.04 LTS
- **インスタンスタイプ:** t2.micro
- **リージョン:** ap-northeast-1（東京）
- **インスタンスID:** `i-0443f4a8fc8e46781`

### セキュリティグループ
- **名前:** `hello-vibe-sg`
- **ポート開放:**
  - 22 (SSH)
  - 80 (HTTP)
  - 443 (HTTPS)

### SSH接続
```bash
ssh -i hello-vibe-key.pem ubuntu@43.207.102.107
```

**注意:** `hello-vibe-key.pem`はローカルにある秘密鍵。GitHub Secretsに保存済み。

### デプロイ先ディレクトリ
```
/home/ubuntu/hello-vibe/
```

---

## 🔑 GitHub Secrets設定

以下のSecretsが設定されている（Settings → Secrets and variables → Actions）：

| Secret名 | 説明 | 例 |
|---------|------|-----|
| `EC2_SSH_KEY` | EC2接続用SSH秘密鍵（PEM形式） | -----BEGIN RSA PRIVATE KEY----- ... |
| `EC2_HOST` | EC2のパブリックIP | `43.207.102.107` |
| `LINE_CHANNEL_ID` | LINEチャネルID | `2008398258` |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット | `b93e218ea1d09df54f6f7d0c6b21ce53` |
| `SESSION_SECRET` | セッション暗号化キー | `hello-vibe-super-secret-key-2024` |
| `MONGODB_URI` | MongoDB Atlas接続URI | `mongodb+srv://...` |
| `OPENAI_API_KEY` | OpenAI APIキー | `sk-...` |
| `SERPER_API_KEY` | SERPER APIキー（Web検索用） | `...` |

---

## 📱 LINE Developers設定

### チャネル情報
- **プロバイダー名:** HelloVibe（またはユーザーが設定した名前）
- **チャネル名:** ハロー！バイブ！チャット
- **チャネルタイプ:** LINEログイン
- **チャネルID:** `2008398258`
- **チャネルシークレット:** `b93e218ea1d09df54f6f7d0c6b21ce53`

### コールバックURL設定
LINE Login タブで以下の2つが設定されている：
- ローカル: `http://localhost:3000/auth/line/callback`
- 本番: `http://43.207.102.107/auth/line/callback`

### アクセス方法
https://developers.line.biz/console/

---

## 🗄️ MongoDB Atlas設定

### データベース名
`hello-vibe`

### コレクション
1. **users** - LINEユーザー情報
2. **conversations** - AI会話履歴
3. **documents** - アップロードドキュメント

### Network Access
EC2のIP (`43.207.102.107`) または "ALLOW ACCESS FROM ANYWHERE" を設定

---

## 💻 ローカル開発環境セットアップ

### 1. リポジトリクローン
```bash
git clone https://github.com/noorbogcom-ux/hello-vibe.git
cd hello-vibe
```

### 2. 依存パッケージインストール
```bash
npm install
```

### 3. アップロードディレクトリ作成
```bash
mkdir uploads
```

### 4. 環境変数ファイル作成
プロジェクトルートに`.env`ファイルを作成（上記の環境変数セクション参照）

### 5. サーバー起動
```bash
npm start
```

### 6. ブラウザでアクセス
```
http://localhost:3000
```

### 7. 開発モード（ファイル変更時に自動再起動）
```bash
npm run dev
```

---

## 🚀 デプロイ方法

### 自動デプロイ（推奨）
```bash
git add .
git commit -m "Your commit message"
git push origin main
```
→ GitHub Actionsが自動的にEC2にデプロイ

### GitHub Actionsの流れ
1. コードをチェックアウト
2. SSH鍵をセットアップ
3. ファイルをEC2にコピー（`scp`）
   - `public/`
   - `server.js`
   - `package.json`
   - `models/`
4. EC2上で以下を実行：
   - `uploads/`ディレクトリ作成
   - `.env`ファイル作成（GitHub Secretsから）
   - `npm install --production`
   - PM2でアプリ再起動

### 手動デプロイ（緊急時）
```bash
# ファイルアップロード
scp -i hello-vibe-key.pem -r public server.js package.json models ubuntu@43.207.102.107:/home/ubuntu/hello-vibe/

# SSH接続
ssh -i hello-vibe-key.pem ubuntu@43.207.102.107

# サーバー上で
cd /home/ubuntu/hello-vibe
mkdir -p uploads
npm install --production
pm2 restart hello-vibe
```

---

## 🔧 サーバー管理コマンド

### PM2コマンド
```bash
# 状態確認
pm2 status

# ログ確認
pm2 logs hello-vibe

# リアルタイムログ
pm2 logs hello-vibe --lines 50

# 再起動
pm2 restart hello-vibe

# 停止
pm2 stop hello-vibe

# 削除
pm2 delete hello-vibe

# 新規起動
pm2 start server.js --name hello-vibe
pm2 save
```

### Nginxコマンド
```bash
# 設定テスト
sudo nginx -t

# 再起動
sudo systemctl restart nginx

# ログ確認
sudo tail -f /var/log/nginx/error.log
```

---

## 🐛 トラブルシューティング

### チャットが動かない
1. PM2でプロセスが起動しているか確認
   ```bash
   pm2 status
   ```
2. ログを確認
   ```bash
   pm2 logs hello-vibe
   ```
3. 環境変数が設定されているか確認
   ```bash
   cat /home/ubuntu/hello-vibe/.env
   ```

### LINEログインできない
1. LINE Developersでコールバック URLが正しく設定されているか確認
2. `.env`ファイルの`LINE_CALLBACK_URL`が正しいか確認
3. ブラウザのコンソールでエラーを確認

### MongoDB接続エラー
1. MongoDB AtlasのNetwork Accessに EC2のIPが追加されているか確認
2. `.env`ファイルの`MONGODB_URI`が正しいか確認
3. ログで接続エラーを確認
   ```bash
   pm2 logs hello-vibe | grep MongoDB
   ```

### OpenAI APIエラー
1. APIキーが有効か確認（https://platform.openai.com/）
2. 利用制限・クォータを確認
3. `.env`ファイルの`OPENAI_API_KEY`が正しいか確認

### SERPER API エラー
1. APIキーが有効か確認（https://serper.dev/）
2. 検索クォータ残量を確認（無料: 2,500検索/月）
3. `.env`ファイルの`SERPER_API_KEY`が正しいか確認

### デプロイが失敗する
1. GitHub Actionsのログを確認
2. GitHub Secretsが全て設定されているか確認
3. SSH鍵が正しいか確認

---

## 📝 API エンドポイント

### 認証関連
- `GET /auth/line` - LINE認証開始
- `GET /auth/line/callback` - LINEコールバック
- `GET /auth/logout` - ログアウト
- `GET /api/user` - 現在のユーザー情報取得

### AIチャット
- `POST /api/chat` - AIチャット（RAGモード / Webモード）
  ```json
  {
    "message": "質問内容",
    "mode": "rag" または "web"
  }
  ```

### ファイル管理
- `POST /api/upload` - ファイルアップロード（PDF/Word/Text）
- `GET /api/documents` - アップロードドキュメント一覧

### Socket.io イベント
- `connection` - クライアント接続
- `chat message` - メッセージ送信
- `user count` - オンライン人数更新
- `disconnect` - クライアント切断

---

## 🎨 UI/UXの特徴

### デザインシステム
- **カラースキーム:** プロフェッショナルなブルー系グラデーション
- **タイポグラフィ:** システムフォント（-apple-system, Roboto, Segoe UI）
- **レスポンシブ:** モバイルファースト設計

### インタラクション
- **Enter改行、Shift+Enter送信**
- **ローディングアニメーション:** 波打つ丸
- **スムーズトランジション:** 0.3s ease
- **ホバーエフェクト:** translateY(-2px)

### モバイル対応
- ビューポート最適化
- タッチ操作対応
- iOS zoom防止（input font-size: 16px）
- フレキシブルレイアウト

---

## 🎯 次のステップアイデア

### 機能追加
- [ ] ドキュメント削除機能
- [ ] チャット履歴エクスポート（CSV/JSON）
- [ ] 音声入力対応
- [ ] 画像アップロード & マルチモーダルAI
- [ ] チーム機能（部署別チャット）
- [ ] 管理画面（ユーザー管理、統計）
- [ ] ダークモード
- [ ] 複数ファイルアップロード対応
- [ ] ドキュメントプレビュー機能

### AI機能拡張
- [ ] ストリーミング応答（リアルタイム表示）
- [ ] 音声合成（Text-to-Speech）
- [ ] 要約機能
- [ ] 翻訳機能
- [ ] コード生成機能

### インフラ改善
- [ ] HTTPS化（Let's Encrypt SSL証明書）
- [ ] 独自ドメイン設定（Route 53）
- [ ] CDN設定（CloudFront）
- [ ] Auto Scaling設定
- [ ] ロードバランサー設定（ALB）
- [ ] CloudWatch監視設定
- [ ] バックアップ自動化
- [ ] Redis Session Store

### セキュリティ強化
- [ ] CSRF対策強化
- [ ] XSS対策強化
- [ ] レート制限（Rate Limiting）
- [ ] IPホワイトリスト
- [ ] 入力バリデーション強化
- [ ] ファイルスキャン（ウイルス対策）

---

## 📚 参考リンク

- **GitHub リポジトリ:** https://github.com/noorbogcom-ux/hello-vibe
- **LINE Developers:** https://developers.line.biz/console/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **OpenAI Platform:** https://platform.openai.com/
- **SERPER API:** https://serper.dev/
- **Socket.io ドキュメント:** https://socket.io/docs/
- **Express ドキュメント:** https://expressjs.com/
- **PM2 ドキュメント:** https://pm2.keymetrics.io/

---

## 👥 開発者向けメモ

### コーディングスタイル
- インデント: 2スペース
- セミコロン: 必須
- 命名規則: camelCase
- 非同期処理: async/await推奨

### Gitワークフロー
- メインブランチ: `main`
- コミットメッセージ形式: `[Add/Fix/Update]: 説明`

### 注意事項
- `.env`ファイルは絶対にGitにコミットしない
- 秘密鍵（.pem）も絶対にコミットしない
- 本番環境の環境変数を変更したらEC2上の`.env`も更新する
- デプロイ前にローカルでテストする
- APIキーは定期的にローテーションする

---

## 🎊 プロジェクト進化の歴史

### 2025年10月31日 - Phase 1
- AWS EC2環境構築
- リアルタイムチャットアプリ開発
- LINE認証実装
- CI/CD自動デプロイ構築

### 2025年10月31日 - Phase 2 (AI RAG)
- MongoDB Atlas統合
- OpenAI API統合
- ファイルアップロード機能（PDF/Word/Text）
- RAGシステム実装
- 会話履歴記憶機能

### 2025年10月31日 - Phase 3 (UI/UX & Web検索)
- BOGCOMブランドデザイン刷新
- モバイルファースト レスポンシブデザイン
- SERPER API統合
- Web検索モード実装
- ローディングアニメーション追加
- UX改善（Enter改行、Shift+Enter送信）

---

**お疲れ様でした！🎉**

非エンジニアからスタートして、1日でエンタープライズグレードのAIシステムを構築！
これぞ、バイブコーディング！💪🔥
