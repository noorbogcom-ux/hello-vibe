require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const session = require('express-session');
const axios = require('axios');
const path = require('path');
const crypto = require('crypto');
const mongoose = require('mongoose');
const multer = require('multer');
const fs = require('fs').promises;
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const OpenAI = require('openai');

// モデルのインポート
const User = require('./models/User');
const Conversation = require('./models/Conversation');
const Document = require('./models/Document');

const app = express();
const server = http.createServer(app);
const io = socketIO(server);

const PORT = process.env.PORT || 3000;

// MongoDB接続
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('✅ MongoDB接続成功'))
  .catch(err => console.error('❌ MongoDB接続エラー:', err));

// OpenAI設定
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Multer設定（ファイルアップロード）
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB制限
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('PDF、Word、またはテキストファイルのみアップロード可能です'));
    }
  }
});

// セッション設定
const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || 'default-secret',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false,
    maxAge: 24 * 60 * 60 * 1000
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

app.get('/chat.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'chat.html'));
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
  
  if (state !== req.session.state) {
    return res.status(400).send('Invalid state parameter');
  }
  
  try {
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
    
    const profileResponse = await axios.get('https://api.line.me/v2/profile', {
      headers: {
        Authorization: `Bearer ${accessToken}`
      }
    });
    
    // MongoDBにユーザーを保存または更新
    let user = await User.findOne({ lineUserId: profileResponse.data.userId });
    
    if (!user) {
      user = new User({
        lineUserId: profileResponse.data.userId,
        displayName: profileResponse.data.displayName,
        pictureUrl: profileResponse.data.pictureUrl
      });
      await user.save();
      console.log('新規ユーザー登録:', user.displayName);
    } else {
      user.lastActiveAt = Date.now();
      await user.save();
    }
    
    req.session.user = {
      userId: user._id.toString(),
      lineUserId: user.lineUserId,
      displayName: user.displayName,
      pictureUrl: user.pictureUrl
    };
    
    console.log('ログイン成功:', user.displayName);
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

// ファイルアップロードAPI
app.post('/api/upload', upload.single('file'), async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const file = req.file;
    let extractedText = '';
    
    // ファイルからテキストを抽出
    const fileBuffer = await fs.readFile(file.path);
    
    if (file.mimetype === 'application/pdf') {
      const data = await pdfParse(fileBuffer);
      extractedText = data.text;
    } else if (file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      extractedText = result.value;
    } else if (file.mimetype === 'text/plain') {
      extractedText = fileBuffer.toString('utf-8');
    }
    
    // MongoDBに保存
    const document = new Document({
      userId: req.session.user.userId,
      filename: file.filename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      fileSize: file.size,
      filePath: file.path,
      extractedText: extractedText,
      processed: true
    });
    
    await document.save();
    
    console.log(`ファイルアップロード成功: ${file.originalname} (${extractedText.length}文字)`);
    
    res.json({
      success: true,
      documentId: document._id,
      filename: file.originalname,
      textLength: extractedText.length
    });
    
  } catch (error) {
    console.error('ファイルアップロードエラー:', error);
    res.status(500).json({ error: 'ファイルのアップロードに失敗しました' });
  }
});

// ユーザーのドキュメント一覧取得
app.get('/api/documents', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const documents = await Document.find({ userId: req.session.user.userId })
      .select('originalName fileSize uploadedAt')
      .sort({ uploadedAt: -1 });
    
    res.json(documents);
    
  } catch (error) {
    console.error('ドキュメント取得エラー:', error);
    res.status(500).json({ error: 'ドキュメントの取得に失敗しました' });
  }
});

// AIチャットAPI
app.post('/api/chat', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const { message } = req.body;
    
    // ユーザーのドキュメントを取得（RAG用）
    const userDocuments = await Document.find({ 
      userId: req.session.user.userId,
      processed: true
    });
    
    // ドキュメント内容を結合
    const knowledgeBase = userDocuments
      .map(doc => `[ファイル: ${doc.originalName}]\n${doc.extractedText}`)
      .join('\n\n---\n\n');
    
    // 会話履歴を取得
    let conversation = await Conversation.findOne({ userId: req.session.user.userId });
    
    if (!conversation) {
      conversation = new Conversation({
        userId: req.session.user.userId,
        messages: []
      });
    }
    
    // システムプロンプト（RAG + パーソナライゼーション）
    const systemPrompt = knowledgeBase 
      ? `あなたは親切なAIアシスタントです。以下のユーザーがアップロードしたドキュメントの内容を参照して、質問に答えてください。

【ユーザーのドキュメント】
${knowledgeBase}

上記の情報を活用しながら、ユーザーの質問に丁寧に答えてください。もし関連情報がドキュメントにあれば、それを引用して答えてください。`
      : 'あなたは親切なAIアシスタントです。ユーザーの質問に丁寧に答えてください。';
    
    // 直近の会話履歴（最大10件）
    const recentMessages = conversation.messages.slice(-10);
    
    // OpenAI APIに送信するメッセージ
    const messages = [
      { role: 'system', content: systemPrompt },
      ...recentMessages.map(m => ({ role: m.role, content: m.content })),
      { role: 'user', content: message }
    ];
    
    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini', // コスト効率の良いモデル
      messages: messages,
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    // 会話履歴に保存
    conversation.messages.push(
      { role: 'user', content: message },
      { role: 'assistant', content: aiResponse }
    );
    
    await conversation.save();
    
    console.log(`AI応答: ${aiResponse.substring(0, 100)}...`);
    
    res.json({
      success: true,
      response: aiResponse
    });
    
  } catch (error) {
    console.error('AIチャットエラー:', error);
    res.status(500).json({ error: 'AIチャットの処理に失敗しました' });
  }
});

// 接続中のユーザー数を管理
let userCount = 0;

// Socket.io接続処理
io.on('connection', (socket) => {
  const session = socket.request.session;
  
  userCount++;
  console.log(`新しいユーザーが接続しました (接続数: ${userCount})`);
  
  if (session.user) {
    console.log(`認証済みユーザー: ${session.user.displayName}`);
  }
  
  io.emit('user count', userCount);
  
  // チャットメッセージを受信
  socket.on('chat message', (msg) => {
    if (!session.user) {
      socket.emit('error', 'ログインが必要です');
      return;
    }
    
    console.log('メッセージ:', msg.text, 'from', session.user.displayName);
    
    io.emit('chat message', {
      text: msg.text,
      username: session.user.displayName,
      pictureUrl: session.user.pictureUrl,
      timestamp: new Date().toLocaleTimeString('ja-JP')
    });
  });
  
  socket.on('disconnect', () => {
    userCount--;
    console.log(`ユーザーが切断しました (接続数: ${userCount})`);
    io.emit('user count', userCount);
  });
});

server.listen(PORT, () => {
  console.log(`🚀 サーバーが起動しました: http://localhost:${PORT}`);
});
