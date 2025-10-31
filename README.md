# BOGs - BOGCOM AI Assistant 🤖

BOGCOM社内AIアシスタント。バイブコーディングで構築したエンタープライズグレードのRAG & Web検索システム。

## プロジェクトの歴史

1. ✅ シンプルなホームページを作成してGitHubにプッシュ
2. ✅ EC2でホームページを公開
3. ✅ GitHub Actions で自動デプロイを設定
4. ✅ リアルタイムチャット機能を追加
5. ✅ LINE認証機能を追加
6. ✅ AI RAGシステム実装
7. ✅ プロフェッショナルなUIデザイン & Web検索機能

## 🎨 デザイン

- **ブランド**: BOGCOM
- **プロダクト名**: BOGs (BOGCOM AI Assistant)
- **モバイルファースト**: スマホ完全対応
- **プロフェッショナルなブルーカラースキーム**

## 🚀 機能

### 💬 リアルタイムチャット
- **Socket.io**: リアルタイム双方向通信
- **LINE認証**: LINEアカウントでログイン
- **オンラインユーザー数**: 接続中のユーザーをリアルタイム表示
- **スマートな入力**: Enter改行、Shift+Enter送信

### 🤖 AI RAGモード
- **ドキュメント分析**: PDF、Word、テキストファイルをアップロード
- **RAG (Retrieval-Augmented Generation)**: アップロードしたドキュメントから情報を抽出してAIが回答
- **会話記憶**: MongoDBで会話履歴を保存し、パーソナライズされた応答
- **参照表示**: 回答の根拠となるドキュメントを表示

### 🌐 Web検索モード
- **SERPER API**: Google検索結果をリアルタイムで取得
- **最新情報**: Webから最新の情報を検索してAIが回答
- **情報源表示**: 回答の根拠となるWebサイトを表示

### ⚡ UX
- **ローディングアニメーション**: 波打つ丸で待ち時間を表示
- **レスポンシブデザイン**: PC/タブレット/スマホに完全対応
- **モダンなUI**: グラデーション、シャドウ、アニメーション

## 🛠 技術スタック

### フロントエンド
- **HTML5 / CSS3**: モダンなレスポンシブデザイン
- **JavaScript (Vanilla)**: Socket.io、Fetch API

### バックエンド
- **Node.js**: JavaScript ランタイム
- **Express.js**: Webアプリケーションフレームワーク
- **Socket.io**: リアルタイム通信
- **Multer**: ファイルアップロード処理

### AI & 検索
- **OpenAI API**: GPT-4o-mini (コスト効率良)
- **SERPER API**: Google検索API
- **pdf-parse**: PDFテキスト抽出
- **mammoth**: Wordテキスト抽出

### データベース
- **MongoDB Atlas**: クラウドNoSQLデータベース
- **Mongoose**: MongoDB ODM

### インフラ
- **AWS EC2**: クラウドサーバー
- **GitHub Actions**: CI/CD自動デプロイ
- **PM2**: Node.jsプロセス管理
- **Nginx**: リバースプロキシ

### 認証
- **LINE Login**: OAuth 2.0認証
- **express-session**: セッション管理

## 📦 セットアップ

### 1. 環境変数の設定

ローカル環境で`.env`ファイルを作成：

```bash
# LINE Login設定
LINE_CHANNEL_ID=あなたのLINEチャンネルID
LINE_CHANNEL_SECRET=あなたのLINEチャンネルシークレット
LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback

# セッション設定
SESSION_SECRET=your-random-secret-key-here

# MongoDB設定
MONGODB_URI=mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/hello-vibe?retryWrites=true&w=majority

# OpenAI API設定
OPENAI_API_KEY=sk-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

# SERPER API設定（Web検索用）
SERPER_API_KEY=あなたのSERPER_API_KEY

# サーバー設定
PORT=3000
```

### 2. 依存関係のインストール

```bash
npm install
```

### 3. アップロードディレクトリの作成

```bash
mkdir uploads
```

### 4. アプリの起動

```bash
npm start
```

### 5. ブラウザでアクセス

```
http://localhost:3000
```

## 🚀 デプロイ

### GitHub Secretsに以下を設定：

1. `EC2_SSH_KEY`: EC2のSSH秘密鍵（PEM形式）
2. `EC2_HOST`: EC2のパブリックIP
3. `LINE_CHANNEL_ID`: LINEチャンネルID
4. `LINE_CHANNEL_SECRET`: LINEチャンネルシークレット
5. `SESSION_SECRET`: ランダムな秘密鍵
6. `OPENAI_API_KEY`: OpenAI APIキー
7. `MONGODB_URI`: MongoDB Atlas接続URI
8. `SERPER_API_KEY`: SERPER APIキー

### デプロイ方法

`main`ブランチにプッシュすると、GitHub Actionsが自動でEC2にデプロイします。

```bash
git add .
git commit -m "Update BOGs system"
git push origin main
```

## 📝 必要なAPI取得方法

### LINE Developers
1. https://developers.line.biz/console/ にアクセス
2. 新しいプロバイダー → 新しいチャネル（LINE Login）を作成
3. チャンネルID、チャンネルシークレットを取得
4. コールバックURLを設定

### MongoDB Atlas
1. https://www.mongodb.com/cloud/atlas にアクセス
2. 無料クラスター作成
3. Database Access でユーザー作成
4. Network Access でIPホワイトリスト設定（EC2のIP）
5. 接続文字列を取得

### OpenAI
1. https://platform.openai.com/ にアクセス
2. API Keys で新しいキーを作成
3. 料金設定を確認

### SERPER
1. https://serper.dev/ にアクセス
2. アカウント作成
3. APIキーを取得（無料で2,500検索/月）

## 📱 使い方

### 1. LINEでログイン
トップページの「LINEでログイン」ボタンをクリック

### 2. チャットモード
- リアルタイムで他のメンバーとチャット
- Enter改行、Shift+Enter送信

### 3. AI RAGモード
- ドキュメントをアップロード（PDF/Word/Text）
- AIがドキュメント内容を記憶
- 質問すると、ドキュメントを参照して回答

### 4. AI Webモード
- リアルタイムWeb検索
- 最新情報を取得して回答
- 情報源を表示

## 🎯 今後の拡張案

- [ ] ドキュメント削除機能
- [ ] チャット履歴エクスポート
- [ ] 音声入力対応
- [ ] マルチモーダル（画像解析）
- [ ] チーム機能（部署別チャット）
- [ ] 管理画面
- [ ] ダークモード

## 📄 ライセンス

MIT

---

**Built with 🔥 by Vibe Coding**
