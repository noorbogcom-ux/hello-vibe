# 開発ドキュメント - ハロー！バイブ！チャット 🚀

## 📋 プロジェクト概要

LINEアカウントでログインできるリアルタイムチャットアプリケーション。
AWS EC2上で稼働し、GitHub Actionsで自動デプロイされる。

**公開URL:** http://43.207.102.107

---

## 🏗️ 技術スタック

### バックエンド
- **Node.js** v20.x
- **Express** 4.18.2 - Webフレームワーク
- **Socket.io** 4.6.1 - リアルタイム通信（WebSocket）
- **express-session** 1.17.3 - セッション管理
- **axios** 1.6.2 - HTTP通信（LINE API呼び出し）
- **dotenv** 16.3.1 - 環境変数管理

### フロントエンド
- HTML5 + CSS3
- JavaScript（ES6+）
- Socket.io Client

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
├── public/
│   └── index.html               # フロントエンドHTML
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
LINE_CHANNEL_ID=2008398258
LINE_CHANNEL_SECRET=b93e218ea1d09df54f6f7d0c6b21ce53
LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback
SESSION_SECRET=hello-vibe-super-secret-key-2024
PORT=3000
```

### 本番環境（EC2）
GitHub Secretsから自動的に設定される：
- `LINE_CHANNEL_ID`
- `LINE_CHANNEL_SECRET`
- `LINE_CALLBACK_URL` (自動生成: `http://43.207.102.107/auth/line/callback`)
- `SESSION_SECRET`

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

| Secret名 | 説明 | 値 |
|---------|------|-----|
| `EC2_SSH_KEY` | EC2接続用SSH秘密鍵（PEM形式） | -----BEGIN RSA PRIVATE KEY----- ... |
| `EC2_HOST` | EC2のパブリックIP | `43.207.102.107` |
| `LINE_CHANNEL_ID` | LINEチャネルID | `2008398258` |
| `LINE_CHANNEL_SECRET` | LINEチャネルシークレット | `b93e218ea1d09df54f6f7d0c6b21ce53` |
| `SESSION_SECRET` | セッション暗号化キー | `hello-vibe-super-secret-key-2024` |

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

### 3. 環境変数ファイル作成
プロジェクトルートに`.env`ファイルを作成：
```env
LINE_CHANNEL_ID=2008398258
LINE_CHANNEL_SECRET=b93e218ea1d09df54f6f7d0c6b21ce53
LINE_CALLBACK_URL=http://localhost:3000/auth/line/callback
SESSION_SECRET=hello-vibe-super-secret-key-2024
PORT=3000
```

### 4. サーバー起動
```bash
npm start
```

### 5. ブラウザでアクセス
```
http://localhost:3000
```

### 6. 開発モード（ファイル変更時に自動再起動）
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
4. EC2上で以下を実行：
   - `.env`ファイル作成
   - `npm install --production`
   - PM2でアプリ再起動

### 手動デプロイ（緊急時）
```bash
# ファイルアップロード
scp -i hello-vibe-key.pem -r public server.js package.json ubuntu@43.207.102.107:/home/ubuntu/hello-vibe/

# SSH接続
ssh -i hello-vibe-key.pem ubuntu@43.207.102.107

# サーバー上で
cd /home/ubuntu/hello-vibe
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

# 再起動
pm2 restart hello-vibe

# 停止
pm2 stop hello-vibe

# 削除
pm2 delete hello-vibe
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

### Socket.io イベント
- `connection` - クライアント接続
- `chat message` - メッセージ送信
- `user count` - オンライン人数更新
- `disconnect` - クライアント切断

---

## 🎯 次のステップアイデア

### 機能追加
- [ ] データベース追加（MongoDB/MySQL）でメッセージ保存
- [ ] メッセージ履歴表示
- [ ] 画像・ファイル送信機能
- [ ] グループチャット機能
- [ ] ユーザー検索機能
- [ ] プライベートメッセージ（DM）
- [ ] リアクション機能（絵文字）
- [ ] オンライン/オフライン表示
- [ ] 既読機能

### インフラ改善
- [ ] HTTPS化（Let's Encrypt SSL証明書）
- [ ] 独自ドメイン設定（Route 53）
- [ ] Auto Scaling設定
- [ ] ロードバランサー設定
- [ ] CloudWatch監視設定
- [ ] バックアップ自動化

### セキュリティ強化
- [ ] CSRF対策強化
- [ ] XSS対策強化
- [ ] レート制限（Rate Limiting）
- [ ] IPホワイトリスト
- [ ] 入力バリデーション強化

---

## 📚 参考リンク

- **GitHub リポジトリ:** https://github.com/noorbogcom-ux/hello-vibe
- **LINE Developers:** https://developers.line.biz/console/
- **Socket.io ドキュメント:** https://socket.io/docs/
- **Express ドキュメント:** https://expressjs.com/
- **PM2 ドキュメント:** https://pm2.keymetrics.io/

---

## 👥 開発者向けメモ

### コーディングスタイル
- インデント: 2スペース
- セミコロン: 必須
- 命名規則: camelCase

### Gitワークフロー
- メインブランチ: `main`
- コミットメッセージ形式: `[Add/Fix/Update]: 説明`

### 注意事項
- `.env`ファイルは絶対にGitにコミットしない
- 秘密鍵（.pem）も絶対にコミットしない
- 本番環境の環境変数を変更したらEC2上の`.env`も更新する
- デプロイ前にローカルでテストする

---

## 🎊 プロジェクト完成日

**2025年10月31日**

非エンジニアからスタートして、1日で以下を達成：
- AWS EC2環境構築
- リアルタイムチャットアプリ開発
- LINE認証実装
- CI/CD自動デプロイ構築

お疲れ様でした！🎉

