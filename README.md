# ハロー！バイブ！プロジェクト 🚀

バイブコーディングの練習用プロジェクトです。

## プロジェクトの目標

1. ✅ シンプルなホームページを作成してGitHubにプッシュ
2. ✅ EC2でホームページを公開
3. ✅ GitHub Actions で自動デプロイを設定
4. ✅ リアルタイムチャット機能を追加
5. ✅ LINE認証機能を追加
6. ✅ AI RAGシステム実装

## 🚀 機能

### チャット機能
- **リアルタイムチャット**: Socket.ioを使用したリアルタイム通信
- **LINE認証**: LINEアカウントでログイン

### AI RAGシステム
- **🤖 AIチャットボット**: OpenAI GPT-4o-miniを使用
- **📄 ファイルアップロード**: PDF、Word、テキストファイル対応
- **🧠 RAG機能**: アップロードしたドキュメントから情報を抽出してAIが回答
- **💾 会話履歴**: MongoDBで会話を記憶してパーソナライズ

### インフラ
- **自動デプロイ**: GitHub ActionsでEC2に自動デプロイ
- **プロセス管理**: PM2でNode.jsアプリを管理
- **リバースプロキシ**: Nginxでポート80からNode.jsアプリにアクセス

## ローカルで確認する方法

このプロジェクトはシンプルなHTMLファイルなので、`index.html` をブラウザで開くだけで確認できます。

## GitHubへのプッシュ手順

```bash
# Gitリポジトリを初期化
git init

# ファイルをステージング
git add .

# コミット
git commit -m "Initial commit: ハロー！バイブ！ページを作成"

# GitHubにリポジトリを作成してから
git branch -M main
git remote add origin <あなたのGitHubリポジトリURL>
git push -u origin main
```

## AWSへのデプロイ手順（次のステップ）

AWS Amplifyを使用してデプロイする予定です。
詳細は次のステップで追加します。

## 技術スタック

- HTML5
- CSS3
- （今後追加予定）JavaScript
- （今後追加予定）チャット機能
- （今後追加予定）LINE認証

