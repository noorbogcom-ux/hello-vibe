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
const ChatMessage = require('./models/ChatMessage');

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
      pictureUrl: user.pictureUrl,
      role: user.role
    };
    
    console.log('ログイン成功:', user.displayName, `(${user.role})`);
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

// チャット履歴取得API
app.get('/api/chat-history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const limit = parseInt(req.query.limit) || 50; // デフォルト50件
    const channel = req.query.channel || 'general';
    
    // アドミンチャンネルはアドミンのみアクセス可能
    if (channel === 'admin' && req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'アクセス権限がありません' });
    }
    
    // 最新50件のメッセージを取得（チャンネルでフィルタ、削除済み除外）
    const messages = await ChatMessage.find({ channel, deleted: false })
      .sort({ timestamp: -1 })
      .limit(limit);
    
    // 古い順に並び替えて返す
    const sortedMessages = messages.reverse().map(msg => ({
      _id: msg._id.toString(),
      text: msg.text,
      username: msg.username,
      pictureUrl: msg.pictureUrl,
      userId: msg.userId,
      timestamp: new Date(msg.timestamp).toLocaleTimeString('ja-JP')
    }));
    
    res.json({ messages: sortedMessages });
    
  } catch (error) {
    console.error('チャット履歴取得エラー:', error);
    res.status(500).json({ error: 'チャット履歴の取得に失敗しました' });
  }
});

// AI会話履歴取得API
app.get('/api/conversation-history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const limit = parseInt(req.query.limit) || 20; // デフォルト20件（10往復）
    
    // ユーザーの会話履歴を取得
    const conversation = await Conversation.findOne({ userId: req.session.user.userId });
    
    if (!conversation || conversation.messages.length === 0) {
      return res.json({ messages: [] });
    }
    
    // 最新のlimit件を取得（古い順）
    const recentMessages = conversation.messages.slice(-limit);
    
    res.json({ messages: recentMessages });
    
  } catch (error) {
    console.error('AI会話履歴取得エラー:', error);
    res.status(500).json({ error: 'AI会話履歴の取得に失敗しました' });
  }
});

// BOGsに意見を聞くAPI（アドミン専用）
app.post('/api/bogs-advice', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    if (req.session.user.role !== 'admin') {
      return res.status(403).json({ error: 'アドミン権限が必要です' });
    }
    
    const { messageCount = 30 } = req.body;
    
    // アドミンチャットの履歴を取得（削除済みも含む - AIの学習用）
    const recentMessages = await ChatMessage.find({ channel: 'admin' })
      .sort({ timestamp: -1 })
      .limit(messageCount);
    
    if (recentMessages.length === 0) {
      return res.json({ 
        success: true, 
        response: 'まだアドミンチャットの履歴がありません。議論を開始してください。' 
      });
    }
    
    const messages = recentMessages.reverse();
    
    // チャット履歴をテキスト化
    const chatHistory = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleTimeString('ja-JP')}] ${msg.username}: ${msg.text}`
    ).join('\n');
    
    // AIに戦略的アドバイスを求める
    const systemPrompt = `あなたはBOGCOM社の戦略アドバイザーです。役員会議の内容を分析し、以下の観点から提言してください：
1. 意思決定のポイント
2. リスクと機会
3. 次のアクション提案
4. 注意すべき点

簡潔かつ具体的に、役員が判断しやすい形でアドバイスしてください。`;
    
    const userPrompt = `以下の役員会議の内容を分析し、戦略的アドバイスをお願いします：\n\n${chatHistory}`;
    
    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 1500
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    console.log(`BOGsアドバイス: ${aiResponse.substring(0, 100)}...`);
    
    res.json({
      success: true,
      response: aiResponse
    });
    
  } catch (error) {
    console.error('BOGsアドバイスエラー:', error);
    res.status(500).json({ error: 'アドバイス生成に失敗しました' });
  }
});

// メッセージ削除API（論理削除）
app.delete('/api/chat-message/:messageId', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const { messageId } = req.params;
    
    // メッセージを取得
    const message = await ChatMessage.findById(messageId);
    
    if (!message) {
      return res.status(404).json({ error: 'メッセージが見つかりません' });
    }
    
    // 自分のメッセージのみ削除可能
    if (message.userId !== req.session.user.userId) {
      return res.status(403).json({ error: '他のユーザーのメッセージは削除できません' });
    }
    
    // 論理削除（deleted フラグを立てる）
    message.deleted = true;
    await message.save();
    
    console.log(`メッセージ論理削除: ${messageId} by ${req.session.user.displayName}`);
    
    res.json({ success: true, messageId });
    
  } catch (error) {
    console.error('メッセージ削除エラー:', error);
    res.status(500).json({ error: 'メッセージの削除に失敗しました' });
  }
});

// AI会話履歴クリアAPI
app.delete('/api/conversation-history', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    // ユーザーの会話履歴を削除
    const conversation = await Conversation.findOne({ userId: req.session.user.userId });
    
    if (conversation) {
      conversation.messages = [];
      await conversation.save();
      console.log(`AI会話履歴をクリアしました: ${req.session.user.displayName}`);
    }
    
    res.json({ success: true, message: '会話履歴をクリアしました' });
    
  } catch (error) {
    console.error('AI会話履歴クリアエラー:', error);
    res.status(500).json({ error: '会話履歴のクリアに失敗しました' });
  }
});

// AIファシリテーター API
app.post('/api/facilitator', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const { command, messageCount = 20 } = req.body;
    
    // 最近のチャットメッセージを取得（削除済みも含む - AIの学習用）
    const recentMessages = await ChatMessage.find()
      .sort({ timestamp: -1 })
      .limit(messageCount);
    
    const messages = recentMessages.reverse();
    
    if (messages.length === 0) {
      return res.json({ 
        success: true, 
        response: 'まだチャット履歴がありません。' 
      });
    }
    
    // チャット履歴をテキスト化
    const chatHistory = messages.map(msg => 
      `[${new Date(msg.timestamp).toLocaleTimeString('ja-JP')}] ${msg.username}: ${msg.text}`
    ).join('\n');
    
    let systemPrompt = '';
    let userPrompt = '';
    
    // コマンドに応じてプロンプトを変更
    if (command === 'summarize' || command === '要約') {
      systemPrompt = 'あなたは会議のファシリテーターです。チャットの会話を簡潔に要約してください。';
      userPrompt = `以下のチャット履歴を要約してください：\n\n${chatHistory}`;
      
    } else if (command === 'minutes' || command === '議事録') {
      systemPrompt = 'あなたは議事録作成の専門家です。会話から決定事項とTODOを抽出してください。';
      userPrompt = `以下のチャット履歴から、【決定事項】と【TODO】を抽出して整理してください：\n\n${chatHistory}`;
      
    } else if (command === 'organize' || command === '整理') {
      systemPrompt = 'あなたは議論を整理する専門家です。会話の論点を整理し、次のアクションを提案してください。';
      userPrompt = `以下のチャット履歴の議論を整理し、次に何をすべきか提案してください：\n\n${chatHistory}`;
      
    } else if (command.startsWith('search:') || command.startsWith('検索:')) {
      const keyword = command.replace(/^(search:|検索:)/, '').trim();
      systemPrompt = 'あなたは情報検索の専門家です。キーワードに関連する会話を見つけて説明してください。';
      userPrompt = `以下のチャット履歴から「${keyword}」に関連する内容を見つけて説明してください：\n\n${chatHistory}`;
      
    } else {
      // デフォルト: 質問に答える
      systemPrompt = 'あなたはチームのAIアシスタントです。チャット履歴を参照して質問に答えてください。';
      userPrompt = `以下のチャット履歴を参照して質問に答えてください：\n\n${chatHistory}\n\n質問: ${command}`;
    }
    
    // OpenAI APIを呼び出し
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.7,
      max_tokens: 1000
    });
    
    const aiResponse = completion.choices[0].message.content;
    
    console.log(`AIファシリテーター応答: ${aiResponse.substring(0, 100)}...`);
    
    res.json({
      success: true,
      response: aiResponse
    });
    
  } catch (error) {
    console.error('AIファシリテーターエラー:', error);
    res.status(500).json({ error: 'AIファシリテーターの処理に失敗しました' });
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

// SERPER APIでWeb検索
async function searchWeb(query) {
  try {
    const response = await axios.post(
      'https://google.serper.dev/search',
      {
        q: query,
        num: 5 // 検索結果5件
      },
      {
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        }
      }
    );
    
    const results = response.data.organic || [];
    const searchContext = results
      .map((r, i) => `[検索結果 ${i + 1}]\nタイトル: ${r.title}\n内容: ${r.snippet}\nURL: ${r.link}`)
      .join('\n\n');
    
    const sources = results.map(r => r.title);
    
    return { searchContext, sources };
  } catch (error) {
    console.error('Web検索エラー:', error.response?.data || error.message);
    throw new Error('Web検索に失敗しました');
  }
}

// AIチャットAPI
app.post('/api/chat', async (req, res) => {
  try {
    if (!req.session.user) {
      return res.status(401).json({ error: 'ログインが必要です' });
    }
    
    const { message, mode = 'rag' } = req.body;
    
    let systemPrompt = '';
    let additionalContext = '';
    let sources = [];
    
    // モードに応じて処理を分岐
    if (mode === 'web') {
      // Webモード: SERPER APIで検索
      console.log(`🌐 Web検索モード: ${message}`);
      const { searchContext, sources: webSources } = await searchWeb(message);
      additionalContext = searchContext;
      sources = webSources;
      
      systemPrompt = `あなたは親切なAIアシスタントです。以下のWeb検索結果を参照して、ユーザーの質問に答えてください。

【Web検索結果】
${additionalContext}

上記の最新情報を活用しながら、ユーザーの質問に丁寧に答えてください。情報源を引用する場合は、どの検索結果から得た情報かを明示してください。`;
      
    } else {
      // RAGモード: ユーザーのドキュメントを検索
      console.log(`📚 RAGモード: ${message}`);
      const userDocuments = await Document.find({ 
        userId: req.session.user.userId,
        processed: true
      });
      
      if (userDocuments.length > 0) {
        additionalContext = userDocuments
          .map(doc => `[ファイル: ${doc.originalName}]\n${doc.extractedText}`)
          .join('\n\n---\n\n');
        
        sources = userDocuments.map(doc => doc.originalName);
        
        systemPrompt = `あなたは親切なAIアシスタントです。以下のユーザーがアップロードしたドキュメントの内容を参照して、質問に答えてください。

【ユーザーのドキュメント】
${additionalContext}

上記の情報を活用しながら、ユーザーの質問に丁寧に答えてください。もし関連情報がドキュメントにあれば、それを引用して答えてください。`;
      } else {
        systemPrompt = 'あなたは親切なAIアシスタントです。ユーザーの質問に丁寧に答えてください。まだドキュメントがアップロードされていないようです。';
      }
    }
    
    // 会話履歴を取得
    let conversation = await Conversation.findOne({ userId: req.session.user.userId });
    
    if (!conversation) {
      conversation = new Conversation({
        userId: req.session.user.userId,
        messages: []
      });
    }
    
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
    
    console.log(`AI応答 (${mode}モード): ${aiResponse.substring(0, 100)}...`);
    
    res.json({
      success: true,
      response: aiResponse,
      sources: sources.length > 0 ? sources : null
    });
    
  } catch (error) {
    console.error('AIチャットエラー:', error);
    res.status(500).json({ error: error.message || 'AIチャットの処理に失敗しました' });
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
  socket.on('chat message', async (msg) => {
    if (!session.user) {
      socket.emit('error', 'ログインが必要です');
      return;
    }
    
    const channel = msg.channel || 'general';
    
    // アドミンチャンネルはアドミンのみ送信可能
    if (channel === 'admin' && session.user.role !== 'admin') {
      socket.emit('error', 'アクセス権限がありません');
      return;
    }
    
    console.log(`[${channel}] メッセージ:`, msg.text, 'from', session.user.displayName);
    
    // MongoDBに保存
    let savedMessage;
    try {
      const chatMessage = new ChatMessage({
        userId: session.user.userId,
        username: session.user.displayName,
        pictureUrl: session.user.pictureUrl,
        text: msg.text,
        channel: channel
      });
      savedMessage = await chatMessage.save();
      console.log(`[${channel}] チャットメッセージをDBに保存しました`);
    } catch (error) {
      console.error('チャットメッセージ保存エラー:', error);
      return;
    }
    
    const messageData = {
      _id: savedMessage._id.toString(),
      text: msg.text,
      username: session.user.displayName,
      pictureUrl: session.user.pictureUrl,
      userId: session.user.userId,
      timestamp: new Date().toLocaleTimeString('ja-JP'),
      channel: channel
    };
    
    // チャンネル別にブロードキャスト
    if (channel === 'admin') {
      // アドミンチャンネルはアドミンのみに配信
      io.sockets.sockets.forEach((s) => {
        if (s.request.session && s.request.session.user && s.request.session.user.role === 'admin') {
          s.emit('chat message', messageData);
        }
      });
    } else {
      // 一般チャンネルは全員に配信
      io.emit('chat message', messageData);
    }
  });
  
  // メッセージ削除イベント
  socket.on('delete message', async (data) => {
    if (!session.user) {
      socket.emit('error', 'ログインが必要です');
      return;
    }
    
    const { messageId, channel } = data;
    
    console.log(`メッセージ削除リクエスト: ${messageId} by ${session.user.displayName}`);
    
    // チャンネル別にブロードキャスト
    if (channel === 'admin') {
      // アドミンチャンネルはアドミンのみに配信
      io.sockets.sockets.forEach((s) => {
        if (s.request.session && s.request.session.user && s.request.session.user.role === 'admin') {
          s.emit('message deleted', { messageId });
        }
      });
    } else {
      // 一般チャンネルは全員に配信
      io.emit('message deleted', { messageId });
    }
  });
  
  // AIファシリテーターの応答をブロードキャスト
  socket.on('facilitator broadcast', (data) => {
    if (!session.user) {
      return;
    }
    
    console.log('AIファシリテーター応答をブロードキャスト');
    
    // 送信者以外の全員に配信
    socket.broadcast.emit('facilitator response', {
      response: data.response
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
