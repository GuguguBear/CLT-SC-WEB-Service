const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const app = express();
const server = http.createServer(app);

// 安全中间件
app.use(helmet({
    contentSecurityPolicy: false // 允许Socket.io正常工作
}));

// CORS设置
app.use(cors({
    origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
    methods: ["GET", "POST"],
    credentials: true
}));

// 静态文件服务
app.use(express.static(path.join(__dirname)));

// Socket.io配置
const io = socketIo(server, {
    cors: {
        origin: ["http://localhost:8000", "http://127.0.0.1:8000"],
        methods: ["GET", "POST"],
        credentials: true
    },
    transports: ['websocket', 'polling']
});

// 存储用户和消息
const users = new Map(); // userId -> {username, socketId, lastSeen}
const messages = []; // 消息历史
const MAX_MESSAGES = 100; // 最大消息数量

// 生成唯一ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// 清理离线用户
function cleanupOfflineUsers() {
    const now = Date.now();
    const TIMEOUT = 5 * 60 * 1000; // 5分钟超时
    
    for (const [userId, user] of users.entries()) {
        if (now - user.lastSeen > TIMEOUT) {
            users.delete(userId);
            console.log(`🧹 清理离线用户: ${user.username}`);
        }
    }
}

// 定期清理离线用户
setInterval(cleanupOfflineUsers, 60000); // 每分钟检查一次

// Socket.io连接处理
io.on('connection', (socket) => {
    console.log(`🔗 新连接: ${socket.id}`);
    
    // 用户加入
    socket.on('join', (data) => {
        const { username, userId } = data;
        
        if (!username || !userId) {
            socket.emit('error', { message: '用户名和ID不能为空' });
            return;
        }
        
        // 更新用户信息
        users.set(userId, {
            username,
            socketId: socket.id,
            lastSeen: Date.now(),
            joinTime: Date.now()
        });
        
        socket.userId = userId;
        socket.username = username;
        
        console.log(`👤 用户加入: ${username} (${userId})`);
        
        // 发送欢迎消息
        socket.emit('welcome', {
            message: `欢迎来到Star Citizen聊天室, ${username}!`,
            users: Array.from(users.values()).map(u => ({
                username: u.username,
                online: true
            }))
        });
        
        // 发送历史消息
        socket.emit('history', {
            messages: messages.slice(-20) // 发送最近20条消息
        });
        
        // 通知其他用户
        socket.broadcast.emit('userJoined', {
            username,
            message: `${username} 加入了聊天室`,
            timestamp: Date.now(),
            users: Array.from(users.values()).map(u => ({
                username: u.username,
                online: true
            }))
        });
        
        // 发送在线用户列表
        io.emit('userList', {
            users: Array.from(users.values()).map(u => ({
                username: u.username,
                online: true
            }))
        });
    });
    
    // 处理消息
    socket.on('message', (data) => {
        if (!socket.userId || !socket.username) {
            socket.emit('error', { message: '请先登录' });
            return;
        }
        
        const { text, type = 'user' } = data;
        
        if (!text || text.trim().length === 0) {
            socket.emit('error', { message: '消息内容不能为空' });
            return;
        }
        
        if (text.length > 500) {
            socket.emit('error', { message: '消息长度不能超过500字符' });
            return;
        }
        
        // 创建消息对象
        const message = {
            id: generateId(),
            userId: socket.userId,
            username: socket.username,
            text: text.trim(),
            type,
            timestamp: Date.now()
        };
        
        // 保存消息
        messages.push(message);
        
        // 限制消息数量
        if (messages.length > MAX_MESSAGES) {
            messages.splice(0, messages.length - MAX_MESSAGES);
        }
        
        console.log(`💬 ${socket.username}: ${text}`);
        
        // 广播消息
        io.emit('newMessage', message);
        
        // 更新用户活动时间
        const user = users.get(socket.userId);
        if (user) {
            user.lastSeen = Date.now();
        }
    });
    
    // 用户状态更新
    socket.on('updateStatus', () => {
        if (socket.userId) {
            const user = users.get(socket.userId);
            if (user) {
                user.lastSeen = Date.now();
            }
        }
    });
    
    // 获取在线用户
    socket.on('getUsers', () => {
        socket.emit('userList', {
            users: Array.from(users.values()).map(u => ({
                username: u.username,
                online: true
            }))
        });
    });
    
    // 断开连接
    socket.on('disconnect', () => {
        console.log(`❌ 连接断开: ${socket.id}`);
        
        if (socket.userId && socket.username) {
            const user = users.get(socket.userId);
            if (user) {
                // 标记用户为离线，但不立即删除
                user.lastSeen = Date.now();
                
                console.log(`👋 用户离开: ${socket.username}`);
                
                // 通知其他用户
                socket.broadcast.emit('userLeft', {
                    username: socket.username,
                    message: `${socket.username} 离开了聊天室`,
                    timestamp: Date.now()
                });
                
                // 延迟删除用户（给重连机会）
                setTimeout(() => {
                    if (users.has(socket.userId)) {
                        const currentUser = users.get(socket.userId);
                        if (currentUser.socketId === socket.id) {
                            users.delete(socket.userId);
                        }
                    }
                    
                    // 更新用户列表
                    io.emit('userList', {
                        users: Array.from(users.values()).map(u => ({
                            username: u.username,
                            online: true
                        }))
                    });
                }, 10000); // 10秒后删除
            }
        }
    });
    
    // 错误处理
    socket.on('error', (error) => {
        console.error('Socket错误:', error);
    });
});

// API路由
app.get('/api/health', (req, res) => {
    res.json({
        status: 'ok',
        timestamp: Date.now(),
        users: users.size,
        messages: messages.length
    });
});

app.get('/api/stats', (req, res) => {
    res.json({
        onlineUsers: users.size,
        totalMessages: messages.length,
        recentMessages: messages.slice(-10),
        uptime: process.uptime()
    });
});

// 错误处理
app.use((err, req, res, next) => {
    console.error('服务器错误:', err);
    res.status(500).json({ error: '服务器内部错误' });
});

// 404处理
app.use((req, res) => {
    res.status(404).json({ error: '页面未找到' });
});

// 启动服务器
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
    console.log('🚀 Star Citizen聊天服务器启动成功!');
    console.log(`📡 服务器地址: http://localhost:${PORT}`);
    console.log(`🔗 Socket.io端点: ws://localhost:${PORT}`);
    console.log('========================');
});

// 优雅关闭
process.on('SIGTERM', () => {
    console.log('正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('正在关闭服务器...');
    server.close(() => {
        console.log('服务器已关闭');
        process.exit(0);
    });
}); 