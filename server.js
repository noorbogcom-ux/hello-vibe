const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// 静的ファイルの提供
app.use(express.static(path.join(__dirname, 'public')));

// ルート
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// 接続中のユーザー数を管理
let userCount = 0;

// Socket.io接続処理
io.on('connection', (socket) => {
  userCount++;
  console.log(`新しいユーザーが接続しました (接続数: ${userCount})`);
  
  // 全員に接続数を通知
  io.emit('user count', userCount);
  
  // チャットメッセージを受信
  socket.on('chat message', (msg) => {
    console.log('メッセージ:', msg);
    // 全員にメッセージを送信
    io.emit('chat message', {
      text: msg.text,
      username: msg.username || '匿名',
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

