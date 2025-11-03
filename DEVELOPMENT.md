# 開発ドキュメント - BOGs (BOGCOM AI Assistant) 🤖

**完全版ハンドオーバードキュメント**  
次のAIエンジニアがスムーズに開発を継続できるための包括的ガイド

---

## 📋 プロジェクト概要

BOGCOM社内AIアシスタント「BOGs（ボグス）」。  
非エンジニアのユーザーがバイブコーディングで1日で構築したエンタープライズグレードのAIシステム。

### 🎯 主要機能
1. **💬 リアルタイムチャット**（オープン/アドミン）
2. **🤖 AI RAGモード**（ドキュメント分析）
3. **🌐 AI Webモード**（最新情報検索）
4. **🎤 @BOGsメンション**（AIファシリテーター）
5. **👔 BOGsアドバイザー**（役員専用戦略助言）

### 🌐 公開URL
**本番環境:** http://43.207.102.107

### 📚 ドキュメント構成
- **README.md**: プロジェクト概要（技術者向け）
- **USER_MANUAL.md**: ユーザー向け使い方ガイド
- **DEVELOPMENT.md**: このファイル（開発者向け完全版）

---

## 🏗️ 技術スタック

### バックエンド
- **Node.js** v20.x
- **Express** 4.18.2 - Webフレームワーク
- **Socket.io** 4.6.1 - リアルタイム通信（WebSocket）
- **express-session** 1.17.3 - セッション管理
- **axios** 1.6.2 - HTTP通信（LINE API、SERPER API）
- **dotenv** 16.3.1 - 環境変数管理
- **mongoose** 8.0.3 - MongoDB ODM
- **multer** 1.4.5 - ファイルアップロード処理
- **openai** 4.20.1 - OpenAI API統合
- **pdf-parse** 1.1.1 - PDFテキスト抽出
- **mammoth** 1.6.0 - Wordテキスト抽出
- **encoding-japanese** 2.0.0 - 日本語エンコーディング自動検出（文字化け対策）

### フロントエンド
- **HTML5 + CSS3** - モダンレスポンシブデザイン
- **JavaScript (ES6+, Vanilla)** - フレームワークレス
- **Socket.io Client** - リアルタイム通信クライアント
- **Web Audio API** - 効果音生成

### データベース
- **MongoDB Atlas** - クラウドNoSQLデータベース
  - **users**: LINEユーザー情報、ロール
  - **conversations**: AI会話履歴（RAG/Web）
  - **documents**: アップロードドキュメント（メタデータ + 抽出テキスト）
  - **chatmessages**: チャットメッセージ（論理削除対応）

### AI & 検索
- **OpenAI API** - GPT-4o-mini（コスト効率良）
- **SERPER API** - Google検索API（リアルタイムWeb検索）

### インフラ
- **AWS EC2** - Ubuntu 22.04 LTS（t2.micro）
- **Nginx** - リバースプロキシ（ポート80 → 3000）
- **PM2** - Node.jsプロセスマネージャー（自動再起動）
- **GitHub Actions** - CI/CD自動デプロイ

### 認証
- **LINE Login** (OAuth 2.0)
- **LINE Channel ID:** `2008398258`
- **ロールベースアクセス制御:** `member` / `admin`

---

## 📁 ファイル構造

```
hello-vibe/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actionsワークフロー
├── models/
│   ├── User.js                     # Mongooseユーザースキーマ（role追加）
│   ├── Conversation.js             # AI会話履歴スキーマ
│   ├── Document.js                 # ドキュメントスキーマ
│   └── ChatMessage.js              # チャットメッセージ（deleted, channel）
├── public/
│   ├── index.html                  # トップページ（チャット）
│   └── chat.html                   # AIチャットページ（RAG/Web）
├── uploads/                        # ファイルアップロード先（.gitignore済み）
├── server.js                       # バックエンドサーバー（メインファイル、1000行超）
├── package.json                    # Node.js依存関係
├── .env                            # 環境変数（ローカル、.gitignore済み）
├── .gitignore                      # Git除外ファイル
├── README.md                       # プロジェクト概要
├── USER_MANUAL.md                  # ユーザー向けマニュアル
└── DEVELOPMENT.md                  # このファイル（開発者向け）
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

# MongoDB設定（Atlas）
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hello-vibe?retryWrites=true&w=majority

# OpenAI API設定
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SERPER API設定（Web検索用）
SERPER_API_KEY=your-serper-api-key

# サーバー設定
PORT=3000
```

### 本番環境（EC2）
GitHub Secretsから自動的に`.env`ファイルが生成される：
- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CALLBACK_URL` → `http://43.207.102.107/auth/line/callback`
- `SESSION_SECRET`
- `MONGODB_URI` ← **重要: ローカルの.envから正しいURIをコピーしてGitHub Secretsに設定**
- `OPENAI_API_KEY`
- `SERPER_API_KEY`

---

## 🗄️ データベーススキーマ

### 1. users コレクション
```javascript
{
  _id: ObjectId,
  lineUserId: String,        // LINE UID（ユニーク）
  displayName: String,       // 表示名
  pictureUrl: String,        // プロフィール画像URL
  role: String,              // "member" | "admin" (デフォルト: "member")
  createdAt: Date,           // 登録日時
  lastActiveAt: Date         // 最終ログイン
}
```

### 2. chatmessages コレクション（論理削除対応）
```javascript
{
  _id: ObjectId,
  userId: String,            // LINE UID
  username: String,          // 表示名
  pictureUrl: String,        // プロフィール画像
  text: String,              // メッセージ本文
  channel: String,           // "general" | "admin"
  deleted: Boolean,          // 論理削除フラグ（デフォルト: false）
  timestamp: Date            // 送信日時
}
```

**重要**: 削除されたメッセージは `deleted: true` に設定され、画面からは見えないが、**AIの学習用にDBに保持**される。

### 3. conversations コレクション
```javascript
{
  _id: ObjectId,
  userId: String,            // LINE UID
  messages: [
    {
      role: "user" | "assistant",
      content: String,
      timestamp: Date
    }
  ],
  lastUpdated: Date
}
```

### 4. documents コレクション
```javascript
{
  _id: ObjectId,
  userId: String,            // LINE UID
  filename: String,          // サーバー側ファイル名
  originalName: String,      // 元のファイル名
  mimeType: String,          // MIME type
  fileSize: Number,          // バイト
  filePath: String,          // uploads/内のパス
  extractedText: String,     // 抽出されたテキスト（エンコーディング自動検出済み）
  processed: Boolean,        // 処理完了フラグ
  uploadedAt: Date           // アップロード日時
}
```

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
- **インバウンドルール:**
  - 22 (SSH) - 0.0.0.0/0
  - 80 (HTTP) - 0.0.0.0/0
  - 443 (HTTPS) - 0.0.0.0/0（未使用、将来用）

### SSH接続
```bash
ssh -i hello-vibe-key.pem ubuntu@43.207.102.107
```

**注意:** `hello-vibe-key.pem` は GitHub Secrets (`EC2_SSH_KEY`) に保存済み。

### デプロイ先ディレクトリ
```
/home/ubuntu/hello-vibe/
├── public/
├── models/
├── uploads/
├── server.js
├── package.json
├── .env
└── node_modules/
```

---

## 🔑 GitHub Secrets設定

GitHub リポジトリの Settings → Secrets and variables → Actions に以下が設定済み：

| Secret名 | 説明 | 注意事項 |
|---------|------|---------|
| `EC2_SSH_KEY` | EC2接続用SSH秘密鍵（PEM形式） | 改行を含む、`printf '%s\n'`で展開 |
| `EC2_HOST` | EC2のパブリックIP | `43.207.102.107` |
| `LINE_CHANNEL_ID` | LINEチャネルID | `2008398258` |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット | `b93e218ea1d09df54f6f7d0c6b21ce53` |
| `SESSION_SECRET` | セッション暗号化キー | ランダム文字列 |
| `MONGODB_URI` | MongoDB Atlas接続URI | **ローカルの.envから正確にコピー** |
| `OPENAI_API_KEY` | OpenAI APIキー | `sk-`で始まる |
| `SERPER_API_KEY` | SERPER APIキー | Web検索用 |

---

## 📱 LINE Developers設定

### チャネル情報
- **プロバイダー名:** HelloVibe
- **チャネル名:** ハロー！バイブ！チャット
- **チャネルタイプ:** LINEログイン
- **チャネルID:** `2008398258`
- **チャネルシークレット:** `b93e218ea1d09df54f6f7d0c6b21ce53`

### コールバックURL設定
LINE Login タブで以下の2つが設定されている：
- **ローカル:** `http://localhost:3000/auth/line/callback`
- **本番:** `http://43.207.102.107/auth/line/callback`

### 公開ステータス
- **公開モード** に設定済み（誰でもログイン可能）
- 開発モードの場合、テストユーザー追加が必要

### アクセス方法
https://developers.line.biz/console/

---

## 🗄️ MongoDB Atlas設定

### クラスター情報
- **データベース名:** `hello-vibe`
- **プロバイダー:** AWS
- **リージョン:** ap-northeast-1（東京）

### コレクション
1. **users** - LINEユーザー情報
2. **conversations** - AI会話履歴
3. **documents** - アップロードドキュメント
4. **chatmessages** - チャットメッセージ

### Network Access（重要）
**EC2のIPアドレスをホワイトリストに追加する必要がある:**
- オプション1: `43.207.102.107/32` を追加
- オプション2: `0.0.0.0/0` （ALLOW ACCESS FROM ANYWHERE）

### Database Access
- ユーザー名とパスワードを作成し、`MONGODB_URI` に含める

### 接続URI確認方法
1. MongoDB Atlas → Database → Connect
2. 「Connect your application」を選択
3. Driver: Node.js
4. URIをコピー → `MONGODB_URI` に設定

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
プロジェクトルートに `.env` ファイルを作成（上記の環境変数セクション参照）

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
→ GitHub Actionsが自動的にEC2にデプロイ（約1-2分）

### GitHub Actionsの流れ

1. **トリガー:** `push` to `main` ブランチ
2. **環境:** `ubuntu-latest`
3. **ステップ:**
   ```yaml
   - コードチェックアウト
   - SSH鍵セットアップ（~/.ssh/id_rsa）
   - SCPでファイルコピー
     - public/
     - server.js
     - package.json
     - models/
   - SSHでEC2に接続し以下を実行:
     - uploads/ディレクトリ作成
     - .envファイル作成（GitHub Secretsから）
     - npm install --production
     - PM2でアプリ再起動
   ```

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

### PM2コマンド（必須）
```bash
# 状態確認
pm2 status

# ログ確認（リアルタイム）
pm2 logs hello-vibe

# 最新50行のログ
pm2 logs hello-vibe --lines 50

# 再起動
pm2 restart hello-vibe

# 停止
pm2 stop hello-vibe

# 削除
pm2 delete hello-vibe

# 新規起動
cd /home/ubuntu/hello-vibe
pm2 start server.js --name hello-vibe
pm2 save
pm2 startup
```

### Nginxコマンド
```bash
# 設定テスト
sudo nginx -t

# 再起動
sudo systemctl restart nginx

# ステータス確認
sudo systemctl status nginx

# エラーログ
sudo tail -f /var/log/nginx/error.log

# アクセスログ
sudo tail -f /var/log/nginx/access.log
```

### MongoDB接続確認
```bash
# EC2上で
cd /home/ubuntu/hello-vibe
cat .env | grep MONGODB_URI

# Node.jsコンソールで確認
node
> const mongoose = require('mongoose');
> mongoose.connect('your-mongodb-uri');
```

---

## 🐛 トラブルシューティング履歴

開発中に遭遇した問題と解決策の記録。

### 1. IAM権限エラー（EC2起動時）
**エラー:** `RunInstances UnauthorizedOperation`  
**原因:** IAMユーザーにEC2起動権限がない  
**解決策:** IAMユーザーに `AmazonEC2FullAccess` ポリシーを追加

### 2. GitHub Actions SSH鍵エラー
**エラー:** `Load key "private_key.pem": error in libcrypto`  
**原因:** マルチライン秘密鍵の改行が正しく展開されない  
**解決策:** 
```yaml
# ❌ NG
echo "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/id_rsa

# ✅ OK
printf '%s\n' "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/id_rsa
```

### 3. MongoDB接続タイムアウト
**エラー:** `Operation users.findOne() buffering timed out after 10000ms`  
**原因1:** EC2のIPがMongoDB AtlasのNetwork Accessに追加されていない  
**解決策1:** MongoDB Atlas → Network Access → EC2のIP追加

**原因2:** GitHub Secretの `MONGODB_URI` がプレースホルダー（`username:password@...`）のまま  
**解決策2:** ローカルの `.env` から正しい `MONGODB_URI` をコピーしてGitHub Secretsに設定

### 4. LINE認証エラー
**エラー:** `invalid_grant`, `invalid authorization code`  
**原因:** MongoDB接続エラーの連鎖（ユーザー情報を保存できない）  
**解決策:** MongoDB接続を修正すると解決

### 5. 外部ユーザーがLINEログインできない
**エラー:** 自分はログインできるが、他のユーザーができない  
**原因:** LINEチャネルが「開発モード」のまま  
**解決策1:** LINE Developers → Settings → 公開ステータスを「公開」に変更  
**解決策2:** テストユーザーとして追加

### 6. OpenAI API 401エラー
**エラー:** `401 Incorrect API key provided`  
**原因:** APIキーが無効または期限切れ  
**解決策:** OpenAI Platform で新しいAPIキーを生成

### 7. PowerShell `&&` エラー
**エラー:** `The token '&&' is not a valid statement separator`  
**原因:** PowerShellは `&&` をサポートしない  
**解決策:** コマンドを分割して実行
```bash
# ❌ NG (PowerShell)
git add . && git commit -m "..." && git push

# ✅ OK (PowerShell)
git add .
git commit -m "..."
git push origin main
```

### 8. YAML構文エラー（deploy.yml）
**エラー:** `Invalid workflow file You have an error in your yaml syntax`  
**原因:** ヒアドキュメントやマルチライン文字列の不適切な使用  
**解決策:** 複雑な heredoc を避け、`echo` と `&&` で連結

---

## 📝 API エンドポイント詳細

### 認証関連
- **`GET /auth/line`** - LINE認証開始
  - セッションに `state` を保存
  - LINEのOAuth URLにリダイレクト
  
- **`GET /auth/line/callback`** - LINEコールバック
  - `code` と `state` を検証
  - LINE APIからアクセストークン取得
  - ユーザープロフィール取得
  - MongoDB の `users` コレクションに保存/更新
  - セッションに `user` を保存
  
- **`GET /auth/logout`** - ログアウト
  - セッション破棄
  - ログインページにリダイレクト
  
- **`GET /api/user`** - 現在のユーザー情報取得
  - レスポンス:
    ```json
    {
      "userId": "LINE_UID",
      "displayName": "表示名",
      "pictureUrl": "https://...",
      "role": "member" | "admin"
    }
    ```

### チャット関連

- **`GET /api/chat-history`** - チャット履歴取得
  - クエリパラメータ: `channel=general|admin`, `limit=50`
  - 削除済みメッセージ（`deleted: true`）は除外
  - アドミンチャットは `role=admin` のみアクセス可能
  - レスポンス:
    ```json
    {
      "success": true,
      "messages": [
        {
          "_id": "...",
          "text": "...",
          "username": "...",
          "pictureUrl": "...",
          "timestamp": "...",
          "userId": "..."
        }
      ]
    }
    ```

- **`DELETE /api/chat-message/:messageId`** - メッセージ削除（論理削除）
  - 自分のメッセージのみ削除可能
  - DBから物理削除せず、`deleted: true` に設定
  - レスポンス: `{ "success": true, "messageId": "..." }`

### AIチャット関連

- **`POST /api/chat`** - AIチャット
  - リクエストボディ:
    ```json
    {
      "message": "質問内容",
      "mode": "rag" | "web"
    }
    ```
  - **RAGモード**: ユーザーのアップロードドキュメントから関連情報を検索してプロンプトに追加
  - **Webモード**: SERPER APIで検索してプロンプトに追加
  - レスポンス:
    ```json
    {
      "success": true,
      "response": "AIの回答",
      "sources": ["ソース1", "ソース2"]
    }
    ```

- **`GET /api/conversation-history`** - AI会話履歴取得
  - 現在のユーザーの会話履歴のみ
  - レスポンス:
    ```json
    {
      "success": true,
      "messages": [
        {
          "role": "user" | "assistant",
          "content": "...",
          "timestamp": "..."
        }
      ]
    }
    ```

- **`DELETE /api/conversation-history`** - AI会話履歴クリア
  - 現在のユーザーの `conversations.messages` を空配列に設定
  - レスポンス: `{ "success": true }`

### ファイル管理

- **`POST /api/upload`** - ファイルアップロード
  - Content-Type: `multipart/form-data`
  - フィールド名: `file`
  - 対応形式: PDF, Word (.docx), Text (.txt)
  - サイズ制限: 10MB
  - 処理:
    1. Multerで `uploads/` に保存
    2. テキスト抽出（PDF: pdf-parse, Word: mammoth, Text: encoding-japanese）
    3. MongoDB の `documents` コレクションに保存
  - レスポンス:
    ```json
    {
      "success": true,
      "documentId": "...",
      "filename": "...",
      "textLength": 1234
    }
    ```
  - **文字化け対策**: テキストファイルは `encoding-japanese` で自動検出（Shift-JIS, EUC-JP, UTF-8）

- **`GET /api/documents`** - アップロードドキュメント一覧
  - 現在のユーザーのドキュメントのみ
  - レスポンス:
    ```json
    {
      "success": true,
      "documents": [
        {
          "_id": "...",
          "originalName": "...",
          "fileSize": 1234,
          "uploadedAt": "..."
        }
      ]
    }
    ```

### AIファシリテーター

- **`POST /api/ai-facilitator`** - @BOGsメンション機能
  - リクエストボディ:
    ```json
    {
      "command": "@BOGs 要約",
      "messageCount": 20
    }
    ```
  - 最近の `messageCount` 件のチャットメッセージ（**削除済みも含む**）を取得してAIに渡す
  - AIがコマンドに応じて処理（要約、議事録、検索、質問応答）
  - レスポンス:
    ```json
    {
      "success": true,
      "response": "AIの応答"
    }
    ```

### 役員専用

- **`POST /api/bogs-advice`** - BOGsアドバイザー
  - **アクセス制限**: `role=admin` のみ
  - リクエストボディ:
    ```json
    {
      "messageCount": 30
    }
    ```
  - アドミンチャットの最近の `messageCount` 件（**削除済みも含む**）を取得
  - AIが戦略的アドバイスを生成
  - レスポンス:
    ```json
    {
      "success": true,
      "response": "戦略的アドバイス"
    }
    ```

---

## 🔌 Socket.io イベント詳細

### サーバー側イベント

| イベント名 | 方向 | 説明 |
|-----------|------|------|
| `connection` | ← | クライアント接続時 |
| `chat message` | ← | チャットメッセージ受信 |
| `delete message` | ← | メッセージ削除要求 |
| `disconnect` | ← | クライアント切断時 |

### クライアント側イベント

| イベント名 | 方向 | 説明 |
|-----------|------|------|
| `chat message` | → | 新規メッセージをブロードキャスト |
| `message deleted` | → | メッセージ削除をブロードキャスト |
| `user count` | → | オンラインユーザー数を送信 |

### チャットメッセージの流れ

```
クライアント → socket.emit('chat message', {...})
  ↓
サーバー: MongoDB に保存
  ↓
サーバー: io.emit('chat message', {...}) ← 全員に配信（general）
または
サーバー: 役員にのみ配信（admin）
  ↓
全クライアント: メッセージを画面に表示 + 効果音再生
```

### メッセージ削除の流れ

```
クライアント → DELETE /api/chat-message/:id
  ↓
サーバー: deleted: true に設定
  ↓
クライアント → socket.emit('delete message', {messageId, channel})
  ↓
サーバー → socket.broadcast.emit('message deleted', {messageId})
  ↓
全クライアント: メッセージを画面から削除（フェードアウト）
```

---

## 🎨 UI/UX実装詳細

### デザインシステム

#### カラーパレット
```css
:root {
  --primary-color: #2563eb;      /* メインブルー */
  --primary-light: #3b82f6;      /* ライトブルー */
  --secondary-color: #1e40af;    /* ダークブルー */
  --bg-light: #f8fafc;           /* 背景ライト */
  --bg-dark: #1e293b;            /* 背景ダーク */
  --text-primary: #1e293b;       /* メインテキスト */
  --text-secondary: #64748b;     /* セカンダリテキスト */
  --border-color: #e2e8f0;       /* ボーダー */
  --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);  /* シャドウ */
}
```

#### タイポグラフィ
- **フォントファミリー:** `-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif`
- **ベースサイズ:** 16px（モバイル）、18px（デスクトップ）
- **行高:** 1.6

### インタラクション

#### チャット入力（重要）
```javascript
// Enter: 改行
// Shift+Enter: 送信
messageInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter' && e.shiftKey) {
    e.preventDefault();
    sendMessage();
  }
  // Enterのみの場合は改行（デフォルト動作）
});
```

#### 効果音生成（Web Audio API）
```javascript
function playSoundEffect(type) {
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  if (type === 'send') {
    oscillator.frequency.value = 800;  // 高音
    gainNode.gain.value = 0.1;
  } else {
    oscillator.frequency.value = 600;  // 低音
    gainNode.gain.value = 0.15;
  }
  
  oscillator.start();
  oscillator.stop(audioContext.currentTime + 0.1);
}
```

#### ローディングアニメーション
```css
@keyframes pulse {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 1; }
}

.loading-dot {
  animation: pulse 1.4s infinite ease-in-out;
}

.loading-dot:nth-child(2) { animation-delay: 0.2s; }
.loading-dot:nth-child(3) { animation-delay: 0.4s; }
```

#### メッセージ削除アニメーション
```javascript
messageDiv.style.transition = 'opacity 0.3s';
messageDiv.style.opacity = '0';
setTimeout(() => messageDiv.remove(), 300);
```

### レスポンシブデザイン

```css
/* モバイルファースト */
.container {
  max-width: 100%;
  padding: 1rem;
}

/* タブレット */
@media (min-width: 768px) {
  .container {
    max-width: 720px;
    padding: 2rem;
  }
}

/* デスクトップ */
@media (min-width: 1024px) {
  .container {
    max-width: 960px;
  }
}
```

---

## 🔐 セキュリティとプライバシー

### 実装されているセキュリティ

1. **認証**
   - LINE OAuth 2.0による本人確認
   - セッションベースの認証（express-session）

2. **認可**
   - ロールベースアクセス制御（RBAC）
   - アドミンチャットは `role=admin` のみアクセス可能

3. **データ保護**
   - 環境変数による秘密情報管理（.env）
   - GitHubに秘密情報をコミットしない（.gitignore）
   - セッションシークレットによる暗号化

4. **論理削除**
   - メッセージは物理削除せず、`deleted: true` に設定
   - ユーザーからは見えないが、AI学習用に保持

### 今後のセキュリティ強化案

- [ ] HTTPS化（Let's Encrypt SSL証明書）
- [ ] CSRF対策強化（csurf ミドルウェア）
- [ ] XSS対策強化（Content Security Policy）
- [ ] レート制限（express-rate-limit）
- [ ] IPホワイトリスト
- [ ] ファイルスキャン（ウイルス対策）
- [ ] 入力バリデーション強化（express-validator）

---

## 🎊 プロジェクト進化の歴史

### 2025年10月31日 - Phase 1: 基礎構築
✅ **達成項目:**
- AWS EC2環境構築（Ubuntu 22.04, Nginx, PM2）
- リアルタイムチャットアプリ開発（Socket.io）
- LINE認証実装（OAuth 2.0）
- CI/CD自動デプロイ構築（GitHub Actions）

🐛 **解決した問題:**
- IAM権限エラー → `AmazonEC2FullAccess` 追加
- SSH鍵エラー → `printf '%s\n'` で改行処理
- YAML構文エラー → heredoc回避

### 2025年10月31日 - Phase 2: AI RAG実装
✅ **達成項目:**
- MongoDB Atlas統合（users, conversations, documents）
- OpenAI API統合（GPT-4o-mini）
- ファイルアップロード機能（PDF/Word/Text）
- RAGシステム実装（ドキュメント検索 + AI回答）
- 会話履歴記憶機能

🐛 **解決した問題:**
- MongoDB接続タイムアウト → Network Access設定 + GitHub Secret修正
- OpenAI API 401エラー → APIキー再生成

### 2025年10月31日 - Phase 3: UI/UX刷新 & Web検索
✅ **達成項目:**
- BOGCOMブランドデザイン刷新
- モバイルファースト レスポンシブデザイン
- SERPER API統合（Google検索）
- Web検索モード実装
- ローディングアニメーション追加（波打つ丸）
- UX改善（Enter改行、Shift+Enter送信）
- 効果音追加（Web Audio API）
- チャット履歴永続化

🐛 **解決した問題:**
- 外部ユーザーログインエラー → LINE公開ステータス変更

### 2025年11月3日 - Phase 4: 高度なAI機能
✅ **達成項目:**
- @BOGsメンション機能（AIファシリテーター）
  - 要約、議事録、検索、質問応答
- 2チャンネルシステム（オープン/アドミン）
- ロールベースアクセス制御（member/admin）
- BOGsアドバイザー機能（役員専用戦略助言）
- ChatMessageスキーマ更新（channel フィールド）
- Userスキーマ更新（role フィールド）

### 2025年11月3日 - Phase 5: データ管理強化
✅ **達成項目:**
- メッセージ削除機能（論理削除）
  - 画面から消えるが、AI学習用にDB保持
  - `deleted: true` フラグ追加
  - Socket.ioによるリアルタイム削除通知
- 削除ボタンUI改善（小型アイコンボタン）
- AI会話履歴クリア機能
- ChatMessageスキーマ更新（deleted フィールド）

### 2025年11月3日 - Phase 6: 文字化け対策 & UX改善
✅ **達成項目:**
- 日本語エンコーディング自動検出（encoding-japanese）
  - Shift-JIS、EUC-JP、UTF-8対応
- アップロード成功メッセージ自動非表示（3秒後）
- ユーザーマニュアル作成（USER_MANUAL.md）
- 開発ドキュメント完全版作成（このファイル）

### 2025年11月3日 - Phase 7: @メンション & AI強化
✅ **達成項目:**
- **@メンション機能完全実装**
  - @入力で自動ドロップダウン表示
  - オンラインユーザー一覧表示
  - @BOGsとコマンド選択（要約、議事録、検索）
  - キーボードナビゲーション（↑↓、Tab、Enter、Esc）
  - 自動フィルタリング機能
- **時間表示の修正**
  - ISO形式 → 「14:35」形式に統一
  - `formatTime()` 関数実装
- **コピー機能追加**
  - 全メッセージに📋コピーボタン
  - クリップボード API活用
  - 成功通知表示（2秒間）
- **BOGsメッセージUI統一**
  - 通常メッセージと同じレイアウト
  - 紫の🤖アイコン + 左ボーダーで識別
- **ファイル名エンコーディング完全対応**
  - アップロード時：Latin1→UTF-8自動変換
  - 既存ファイル修正APIの追加と削除
  - 文字化けパターン検出（æ, ¦, è等）
- **Webモードハイブリッド化**
  - RAG情報（社内資料）+ Web検索を統合
  - 社内資料を優先、Web検索で補足
  - 参照ソース表示を両方統合
- **AIプロンプト大幅強化**
  - 曖昧な回答の完全禁止
  - 具体的な数値・事実の抽出を強制
  - 明確な判断（可/不可/条件付き）の要求
  - 回答フォーマットの指定
  - 禁止事項の明確化
- **BOGsメッセージ永続化**
  - @BOGs応答をMongoDBに保存
  - BOGsアドバイスもDB保存
  - `userId: 'bogs-ai'` で識別
  - 再読み込み時も表示される

🐛 **解決した問題:**
- BOGsメッセージが再読み込みで消える → DB保存で解決
- ファイル名文字化け → Latin1→UTF-8変換で解決
- AIが曖昧な回答をする → プロンプト強化で解決
- Web検索結果を活用しない → 禁止事項追加で解決

---

## 🎯 次のステップアイデア

### 🚀 優先度: 高

#### 1. HTTPS化（SSL/TLS）
```bash
# Let's Encrypt 証明書取得
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com
```

#### 2. ドメイン設定
- Route 53でドメイン取得
- A レコードで EC2のIPを指定
- `bogs.bogcom.co.jp` など

#### 3. ストリーミング応答
```javascript
// OpenAI API の stream オプション
const stream = await openai.chat.completions.create({
  model: 'gpt-4o-mini',
  messages: messages,
  stream: true
});

for await (const chunk of stream) {
  // リアルタイムで応答を表示
}
```

#### 4. ファイル削除機能
```javascript
// documents コレクションから削除
// uploads/ からファイル削除
app.delete('/api/document/:id', async (req, res) => {
  const doc = await Document.findById(req.params.id);
  await fs.unlink(doc.filePath);
  await Document.findByIdAndDelete(req.params.id);
});
```

### 🌟 優先度: 中

#### 5. チャット履歴エクスポート
```javascript
// CSV/JSON形式でダウンロード
app.get('/api/export-chat', async (req, res) => {
  const messages = await ChatMessage.find({...});
  res.setHeader('Content-Type', 'text/csv');
  res.send(convertToCSV(messages));
});
```

#### 6. 音声入力対応
```javascript
// Web Speech API
const recognition = new webkitSpeechRecognition();
recognition.onresult = (event) => {
  const transcript = event.results[0][0].transcript;
  messageInput.value = transcript;
};
```

#### 7. マルチモーダルAI（画像解析）
```javascript
// OpenAI Vision API
const response = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    {
      role: "user",
      content: [
        { type: "text", text: "この画像を説明して" },
        { type: "image_url", image_url: { url: imageUrl } }
      ]
    }
  ]
});
```

#### 8. チーム機能（部署別チャット）
```javascript
// Userスキーマに team フィールド追加
team: {
  type: String,
  enum: ['sales', 'dev', 'hr', 'management'],
  default: 'sales'
}

// チャンネルを動的に作成
socket.join(`team-${user.team}`);
```

#### 9. メッセージ編集機能
```javascript
// 既存メッセージを編集（送信後5分以内）
app.put('/api/chat-message/:messageId', async (req, res) => {
  const message = await ChatMessage.findById(req.params.messageId);
  if (Date.now() - message.timestamp > 5 * 60 * 1000) {
    return res.status(403).json({ error: '編集期限を過ぎています' });
  }
  message.text = req.body.text;
  message.edited = true;
  await message.save();
  io.emit('message edited', message);  // リアルタイム更新
});
```

#### 10. リアクション機能（いいね、絵文字）
```javascript
// メッセージにリアクション追加
reactions: [{
  userId: String,
  emoji: String,  // 👍, ❤️, 😄
  timestamp: Date
}]

// Socket.io イベント
socket.on('add reaction', async ({ messageId, emoji }) => {
  const message = await ChatMessage.findById(messageId);
  message.reactions.push({ userId: user.userId, emoji });
  await message.save();
  io.emit('reaction added', { messageId, userId, emoji });
});
```

### 💡 優先度: 低（将来の拡張）

- [ ] **ダークモード** - CSS変数でテーマ切り替え
- [ ] **複数ファイル同時アップロード** - Multer array()
- [ ] **ドキュメントプレビュー機能** - PDF.js統合
- [ ] **管理画面（ユーザー管理、統計）** - ダッシュボードUI
- [ ] **メール通知（重要メッセージ）** - Nodemailer + AWS SES
- [ ] **既読/未読管理** - readBy配列で追跡
- [ ] **検索機能** - MongoDB $text インデックス
- [ ] **ファイルサイズ制限UI** - アップロード前に警告
- [ ] **プロフィール編集** - 表示名、アバター変更
- [ ] **通知音のカスタマイズ** - ユーザー設定に保存
- [ ] **スレッド機能（返信）** - メッセージに返信スレッド
- [ ] **ファイル共有機能（画像、動画）** - メディア対応

---

## 📚 参考リンク

### 公式ドキュメント
- **Socket.io:** https://socket.io/docs/
- **Express.js:** https://expressjs.com/
- **Mongoose:** https://mongoosejs.com/docs/
- **OpenAI API:** https://platform.openai.com/docs/
- **PM2:** https://pm2.keymetrics.io/docs/

### プロジェクト関連
- **GitHub リポジトリ:** https://github.com/noorbogcom-ux/hello-vibe
- **LINE Developers:** https://developers.line.biz/console/
- **MongoDB Atlas:** https://www.mongodb.com/cloud/atlas
- **SERPER API:** https://serper.dev/

### AWS関連
- **EC2 ドキュメント:** https://docs.aws.amazon.com/ec2/
- **Nginx設定:** https://nginx.org/en/docs/

---

## 👥 開発者向けメモ

### コーディングスタイル
```javascript
// インデント: 2スペース
// セミコロン: 必須
// 命名規則: camelCase
// 非同期処理: async/await推奨

// ✅ Good
async function fetchData() {
  const result = await User.findOne({ userId });
  return result;
}

// ❌ Bad
function fetchData() {
  User.findOne({ userId }).then(result => {
    return result
  })
}
```

### Gitワークフロー
```bash
# メインブランチ: main
# コミットメッセージ形式:
git commit -m "Add: 新機能説明"
git commit -m "Fix: バグ修正説明"
git commit -m "Update: 既存機能改善"
git commit -m "Refactor: リファクタリング"
git commit -m "Docs: ドキュメント更新"
```

### 重要な注意事項

#### ❗ 絶対にやってはいけないこと
1. `.env` ファイルをGitにコミット
2. 秘密鍵（.pem）をコミット
3. APIキーをハードコード
4. `node_modules/` をコミット
5. 本番DBで直接テスト

#### ✅ 推奨事項
1. デプロイ前にローカルでテスト
2. APIキーは定期的にローテーション
3. MongoDB Atlas の Network Access を最小限に
4. PM2ログを定期的に確認
5. GitHub Secretsのバックアップを取る

### デバッグ方法

#### ローカル環境
```javascript
// server.js にログ追加
console.log('🔍 デバッグ:', variable);

// Chrome DevTools
// ブラウザコンソールでエラー確認
```

#### 本番環境（EC2）
```bash
# SSH接続
ssh -i hello-vibe-key.pem ubuntu@43.207.102.107

# リアルタイムログ
pm2 logs hello-vibe --lines 100

# エラーのみ
pm2 logs hello-vibe --err

# Nginxエラー
sudo tail -f /var/log/nginx/error.log
```

---

## 🎓 開発で学んだこと

### 技術的知見

1. **Socket.ioのルーム機能**
   ```javascript
   // チャンネル別にメッセージを送信
   io.to('admin').emit('chat message', data);
   ```

2. **Mongooseの論理削除パターン**
   ```javascript
   // 物理削除の代わりに
   message.deleted = true;
   await message.save();
   
   // クエリで除外
   ChatMessage.find({ deleted: false });
   ```

3. **エンコーディング自動検出**
   ```javascript
   const detected = Encoding.detect(buffer);
   const unicode = Encoding.convert(buffer, {
     to: 'UNICODE',
     from: detected
   });
   ```

4. **GitHub Actions の複雑な SSH 処理**
   ```yaml
   # 改行を含む秘密鍵の正しい展開
   printf '%s\n' "${{ secrets.EC2_SSH_KEY }}" > ~/.ssh/id_rsa
   ```

5. **ファイル名エンコーディング問題（Multer）**
   ```javascript
   // Multerが日本語ファイル名をLatin1で解釈する問題
   let originalName = file.originalname;
   try {
     const buffer = Buffer.from(originalName, 'latin1');
     originalName = buffer.toString('utf8');  // 正しくUTF-8に変換
   } catch (e) {
     console.log('変換エラー');
   }
   ```

6. **BOGsメッセージの永続化**
   ```javascript
   // AIの応答を専用ユーザーIDで保存
   const bogsMessage = new ChatMessage({
     userId: 'bogs-ai',  // 特別なID
     username: 'BOGs AI',
     text: aiResponse,
     channel: currentChannel
   });
   await bogsMessage.save();
   
   // フロントで識別
   const isBOGsMessage = msg.userId === 'bogs-ai';
   ```

7. **AIプロンプトエンジニアリング**
   ```javascript
   // ❌ 弱いプロンプト
   systemPrompt = "天気を教えてください";
   
   // ✅ 強化されたプロンプト
   systemPrompt = `
   - 曖昧な回答を禁止: 「提供できません」「わかりません」は使わない
   - 具体的な数値を抽出: 日付、時刻、気温、降水確率
   - 明確な判断: 「可能」「不可」「条件付き可能」
   - フォーマット指定: 構造化された回答
   `;
   ```

8. **@メンション機能の実装**
   ```javascript
   // ドロップダウン表示のキーボードナビゲーション
   if (e.key === 'ArrowDown') {
     selectedIndex = (selectedIndex + 1) % items.length;
   } else if (e.key === 'Enter' || e.key === 'Tab') {
     selectMention(items[selectedIndex]);
     e.preventDefault();  // フォーム送信を防ぐ
   }
   ```

### 開発のベストプラクティス

1. **段階的な開発**: まず基本機能を実装し、徐々に高度な機能を追加
2. **エラーログの重要性**: `console.log` と `pm2 logs` で問題を特定
3. **環境変数の一元管理**: `.env` ファイルとGitHub Secretsの使い分け
4. **ユーザーフィードバック**: 実際のユーザーテストで問題発見（LINE公開ステータス）
5. **ドキュメント化**: 後で見返すための詳細な記録

---

## 📞 トラブル時の連絡先

### EC2へのアクセスが失われた場合
1. AWSコンソールからEC2接続（Session Manager）
2. 新しいキーペアを生成してインスタンスに追加
3. GitHub Secretsを更新

### MongoDB接続が切れた場合
1. MongoDB Atlasコンソールで接続状態確認
2. Network AccessにEC2のIPが含まれているか確認
3. `MONGODB_URI` の有効性を確認

### 全てがダメな場合
1. EC2インスタンスを再起動
2. PM2でアプリを再起動
3. Nginxを再起動

### ファイル名が文字化けする場合
1. `encoding-japanese` がインストールされているか確認
2. Multerのファイル名変換ロジックが動作しているか確認
   ```javascript
   // server.js の /api/upload 内
   const buffer = Buffer.from(originalName, 'latin1');
   originalName = buffer.toString('utf8');
   ```
3. Content-Type ヘッダーに `charset=utf-8` が含まれているか確認

### BOGsメッセージが再読み込みで消える場合
1. `/api/facilitator` と `/api/bogs-advice` でDB保存が実行されているか確認
   ```javascript
   const bogsMessage = new ChatMessage({
     userId: 'bogs-ai',
     // ...
   });
   await bogsMessage.save();
   ```
2. フロントエンドで `isBOGsMessage = msg.userId === 'bogs-ai'` チェックがあるか確認
3. MongoDB で `users` コレクションに `bogs-ai` ユーザーが存在しないことを確認（通常のユーザーではない）

### AIが曖昧な回答をする場合
1. AIプロンプトに禁止事項が含まれているか確認
   ```javascript
   systemPrompt = `
   ❌ 絶対に使用禁止のフレーズ:
   - "提供できません"
   - "確認してください"
   - "わかりません"
   `;
   ```
2. Web検索結果が取得できているか `console.log` で確認
3. `temperature` パラメータを調整（0.7 → 0.3 で厳密に）

---

## 🎉 まとめ

このプロジェクトは、非エンジニアが **バイブコーディング** で構築した、完全に機能するエンタープライズグレードのAIシステムです。

### 📊 最終的な成果物（2025年11月3日現在）

✅ **フルスタックWebアプリケーション**
- フロントエンド（HTML/CSS/JS）- 1,200行超
- バックエンド（Node.js/Express）- 1,000行超
- データベース（MongoDB Atlas）- 4コレクション
- リアルタイム通信（Socket.io）- 双方向イベント

✅ **AI統合（超強化版）**
- RAG（ドキュメント分析）- PDF/Word/Text対応
- Web検索（SERPER API）- Google検索統合
- ハイブリッドモード - RAG + Web統合
- 会話記憶 - パーソナライズ対応
- ファシリテーター機能 - @BOGsメンション
- 戦略アドバイザー - 役員専用
- **強化AIプロンプト** - 曖昧な回答完全禁止

✅ **チャット機能（完全版）**
- 2チャンネルシステム（オープン/アドミン）
- @メンション機能（ドロップダウン選択）
- オンラインユーザー表示
- メッセージコピー
- 論理削除（AI学習用に保持）
- 履歴永続化
- 効果音
- BOGsメッセージ永続化

✅ **インフラ**
- AWS EC2デプロイ（Ubuntu 22.04）
- CI/CD自動化（GitHub Actions）
- プロセス管理（PM2）
- リバースプロキシ（Nginx）
- 自動再起動

✅ **認証・認可**
- LINE OAuth 2.0
- ロールベースアクセス制御（member/admin）
- セッション管理

✅ **UX（プロレベル）**
- モバイルファースト設計
- レスポンシブデザイン
- リアルタイム更新（Socket.io）
- ローディングアニメーション
- 効果音（Web Audio API）
- キーボードナビゲーション
- コピー機能
- 自動スクロール

✅ **文字化け対策（完全版）**
- テキストファイル：Shift-JIS/EUC-JP/UTF-8自動検出
- ファイル名：Latin1→UTF-8自動変換
- API応答：Content-Type明示

### 🚀 次の開発者へ

このドキュメントには、プロジェクトの全てが記録されています：
- 技術スタック
- アーキテクチャ
- API仕様
- トラブルシューティング履歴
- 今後の拡張アイデア

**自信を持って開発を続けてください！** 💪✨

---

**Built with 🔥 by Vibe Coding**  
**Documented with ❤️ for the next engineer**
