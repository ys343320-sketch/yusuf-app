// server.js
require('dotenv').config();
const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const { Server } = require('socket.io');

const authRoutes = require('./routes/auth');
const chatRoutes = require('./routes/chat');
const { initChatSocket } = require('./socket/chatSocket');
const { apiLimiter } = require('./middleware/rateLimiter');

if (!process.env.JWT_SECRET || process.env.JWT_SECRET === 'change_this_to_a_long_random_secret_key') {
  console.warn('⚠️  تحذير: JWT_SECRET لسه القيمة الافتراضية أو مش موجود! غيّره في ملف .env قبل ما تنزل التطبيق فعلياً.');
}

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: { origin: '*' }, // في الإنتاج، حدد الدومين بتاعك بدل *
  maxHttpBufferSize: 8 * 1024 * 1024, // 8 ميجا - كافي عشان يستوعب رسايل صوتية وصور مشفرة
});

app.use(helmet()); // يضيف HTTP headers أمان (يمنع هجمات معروفة زي clickjacking, MIME sniffing)
app.use(cors());
app.use(express.json({ limit: '100kb' })); // حد أقصى لحجم الطلب - يمنع هجمات إغراق الذاكرة
app.use('/api', apiLimiter); // حد عام لكل طلبات الـ API

app.use('/api/auth', authRoutes);
app.use('/api/chat', chatRoutes);

app.get('/', (req, res) => {
  res.json({ status: 'يوسف سيرفر شغال 🚀' });
});

initChatSocket(io);

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => {
  console.log(`🚀 سيرفر يوسف شغال على http://localhost:${PORT}`);
});
