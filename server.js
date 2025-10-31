require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// セッション設定
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // 本番環境ではtrueに（HTTPS必須）
    maxAge: 24 * 60 * 60 * 1000 // 24時間
  }
});

app.use(sessionMiddleware);
app.use(express.json());

// Socket.ioでセッションを共有
io.use((socket, next) => {
  sessionMiddleware(socket.request, {}, next);
});

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ルート
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// LINE Login認証開始
app.get('/auth/line', (req, res) => {
  const state = crypto.randomBytes(16).toString('hex');
  req.session.state = state;
  
  const authUrl = `https://access.line.me/oauth2/v2.1/authorize?` +
    `response_type=code&` +
    `client_id=${process.env.LINE_CHANNEL_ID}&` +
    `redirect_uri=${encodeURIComponent(process.env.LINE_CALLBACK_URL)}&` +
    `state=${state}&` +
    `scope=profile%20openid`;
  
  res.redirect(authUrl);
});

// LINE Loginコールバック
app.get('/auth/line/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // CSRF対策
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state parameter');
  }
  
  try {
    // アクセストークンを取得
    const tokenResponse = await axios.post('https://api.line.me/oauth2/v2.1/token', 
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.LINE_CALLBACK_URL,
        client_id: process.env.LINE_CHANNEL_ID,
        client_secret: process.env.LINE_CHANNEL_SECRET
      }),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      }
    );
    
    const accessToken = tokenResponse.data.access_token;
    
    // ユーザープロフィールを取得
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    // セッションにユーザー情報を保存
    req.session.user = {
      userId: profileResponse.data.userId,
      displayName: profileResponse.data.displayName,
      pictureUrl: profileResponse.data.pictureUrl
    };
    
    console.log('ログイン成功:', req.session.user.displayName);
    res.redirect('/');
    
  } catch (error) {
    console.error('LINE認証エラー:', error.response?.data || error.message);
    res.status(500).send('認証に失敗しました');
  }
});

// ログアウト
app.get('/auth/logout', (req, res) => {
  req.session.destroy();
  res.redirect('/');
});

// ユーザー情報API
app.get('/api/user', (req, res) => {
  if (req.session.user) {
    res.json(req.session.user);
  } else {
    res.status(401).json({ error: 'Not authenticated' });
  }
});

// 接続中のユーザー数を管理
let userCount = 0;

// Socket.io接続処理
io.on('connection', (socket) => {
  const session = socket.request.session;
  
  userCount++;
  console.log(`新しいユーザーが接続しました (接続数: ${userCount})`);
  
  // 認証状態を確認
  if (session.user) {
    console.log(`認証済みユーザー: ${session.user.displayName}`);
  }
  
  // 全員に接続数を通知
  io.emit('user count', userCount);
  
  // チャットメッセージを受信
  socket.on('chat message', (msg) => {
    // 認証チェック
    if (!session.user) {
      socket.emit('error', 'ログインが必要です');
      return;
    }
    
    console.log('メッセージ:', msg.text, 'from', session.user.displayName);
    
    // 全員にメッセージを送信（LINEのユーザー情報を使用）
    io.emit('chat message', {
      text: msg.text,
      username: session.user.displayName,
      pictureUrl: session.user.pictureUrl,
      timestamp: new Date().toLocaleTimeString('ja-JP')
    });
  });
  
  // ユーザーが切断
  socket.on('disconnect', () => {
    userCount--;
    console.log(`ユーザーが切断しました (接続数: ${userCount})`);
    io.emit('user count', userCount);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
});
