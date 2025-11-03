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
8. ✅ @メンション機能 & AI超強化（2025年11月3日）
   - @メンション ドロップダウン
   - コピー・削除機能
   - BOGsメッセージ永続化
   - AIプロンプト大幅強化
   - ハイブリッドRAG+Web検索

## 🎨 デザイン

- **ブランド**: BOGCOM
- **プロダクト名**: BOGs (BOGCOM AI Assistant)
- **モバイルファースト**: スマホ完全対応
- **プロフェッショナルなブルーカラースキーム**

## 🚀 機能

### 💬 リアルタイムチャット（超強化版）
- **2つのチャンネル**: 
  - 💬 **オープンチャット**: 全員参加可能
  - 👔 **アドミンチャット**: 役員専用（承認制）
- **@メンション機能**: 
  - @入力で自動ドロップダウン表示
  - オンラインユーザー選択
  - @BOGs + コマンド選択
  - キーボードナビゲーション（↑↓、Tab、Enter）
- **メッセージ機能**:
  - 📋 **コピー機能**: ワンクリックでクリップボードにコピー
  - 🗑️ **削除機能**: 論理削除（AI学習用に保持）
  - ⏰ **時間表示**: 「14:35」形式で表示
- **Socket.io**: リアルタイム双方向通信
- **LINE認証**: LINEアカウントでログイン
- **チャット履歴**: MongoDBで永続化、ページ移動しても消えない
- **効果音**: 送信・受信で音が鳴る（Web Audio API）
- **オンラインユーザー数**: 接続中のユーザーをリアルタイム表示
- **スマートな入力**: Enter改行、Shift+Enter送信

### 🤖 AI RAGモード
- **ドキュメント分析**: PDF、Word、テキストファイルをアップロード
- **エンコーディング自動検出**: Shift-JIS、EUC-JP、UTF-8など日本語文字化け対策
- **RAG (Retrieval-Augmented Generation)**: アップロードしたドキュメントから情報を抽出してAIが回答
- **会話記憶**: MongoDBで会話履歴を保存し、パーソナライズされた応答
- **参照表示**: 回答の根拠となるドキュメントを表示

### 🌐 Web検索モード（ハイブリッド強化版）
- **SERPER API**: Google検索結果をリアルタイムで取得
- **ハイブリッドモード**: 社内資料（RAG）+ Web検索を統合
  - 社内資料を優先参照
  - Web検索で補足情報を追加
  - 両方のソースを表示
- **強化されたAIプロンプト**:
  - ✅ 曖昧な回答を完全禁止
  - ✅ 具体的な数値・事実の抽出を強制
  - ✅ 明確な判断（可/不可/条件付き）を要求
  - ✅ 構造化された回答フォーマット
- **情報源表示**: 回答の根拠となるドキュメント・Webサイトを表示

### 🤖 AIファシリテーター（完全版）
- **@メンションドロップダウン**: 
  - `@BOGs` で呼び出し
  - コマンド選択（要約、議事録、検索）
  - キーボードで簡単選択
- **会話要約**: `@BOGs 要約` で最近の会話を要約
- **議事録生成**: `@BOGs 議事録` で決定事項・TODO抽出
- **過去ログ検索**: `@BOGs 検索: キーワード` で関連情報を検索
- **自由な質問**: チャット履歴を参照して質問に答える
- **メッセージ永続化**: BOGsの応答もチャット履歴に保存（再読み込みで消えない）

### 👔 役員専用機能
- **アドミンチャット**: 役員のみアクセス可能な議論スペース
- **BOGsアドバイザー**: 🤖 **BOGsに意見を聞く**ボタンで戦略的アドバイス
  - 意思決定のポイント分析
  - リスクと機会の提示
  - 次のアクション提案
  - 注意すべき点の指摘

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
- **encoding-japanese**: 日本語エンコーディング自動検出（文字化け対策）

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

## 💾 データ保存場所

### ファイルストレージ
- **アップロードされたファイル本体**: `uploads/` ディレクトリ（サーバー上）
- **ファイルサイズ制限**: 10MB/ファイル

### MongoDB コレクション
- **users**: ユーザー情報（LINE認証情報、ロール）
- **chatmessages**: チャットメッセージ（削除済みメッセージは `deleted: true`）
- **conversations**: AI会話履歴（RAG/Webモード）
- **documents**: アップロードされたドキュメントのメタデータと抽出テキスト

### 論理削除
- チャットメッセージは **論理削除**（`deleted: true`）
- ユーザーからは見えないが、**AI学習用にDBに保持**
- @BOGsやBOGsアドバイザーは削除済みメッセージも分析可能

## 🎯 今後の拡張案

- [ ] ドキュメント削除機能
- [ ] チャット履歴エクスポート
- [ ] 音声入力対応
- [ ] マルチモーダル（画像解析）
- [ ] チーム機能（部署別チャット）
- [ ] 管理画面
- [ ] ダークモード

## 📚 ドキュメント

- **[ユーザーマニュアル](USER_MANUAL.md)**: エンドユーザー向けの使い方ガイド
- **[開発者向けドキュメント](DEVELOPMENT.md)**: 技術的な詳細とプロジェクト引継ぎ資料

## 📄 ライセンス

MIT

---

**Built with 🔥 by Vibe Coding**
