// 基于Socket.io的实时聊天系统
class SocketChatSystem {
    constructor() {
        this.socket = null;
        this.isConnected = false;
        this.currentUser = null;
        this.reconnectAttempts = 0;
        this.maxReconnectAttempts = 5;
        this.reconnectDelay = 1000;
        this.messageQueue = [];
        
        // 服务器配置
        this.serverUrl = 'http://localhost:3000';
        
        // UI元素
        this.chatContainer = null;
        this.messageInput = null;
        this.messagesContainer = null;
        this.userCountElement = null;
        this.onlineUsersElement = null;
        
        this.init();
    }

    async init() {
        console.log('🌐 初始化Socket.io聊天系统...');
        
        // 等待Socket.io库加载
        await this.loadSocketIO();
        
        // 初始化UI
        this.initializeUI();
        
        // 绑定事件
        this.bindEvents();
        
        console.log('✅ Socket.io聊天系统初始化完成');
    }

    // 加载Socket.io库
    async loadSocketIO() {
        return new Promise((resolve, reject) => {
            if (window.io) {
                resolve();
                return;
            }

            const script = document.createElement('script');
            script.src = 'https://cdn.socket.io/4.7.4/socket.io.min.js';
            script.onload = () => {
                console.log('✅ Socket.io库加载成功');
                resolve();
            };
            script.onerror = () => {
                console.error('❌ Socket.io库加载失败');
                reject(new Error('Socket.io库加载失败'));
            };
            document.head.appendChild(script);
        });
    }

    // 初始化UI
    initializeUI() {
        this.chatContainer = document.querySelector('.chat-container');
        this.messageInput = document.getElementById('chatInput'); // 修正ID
        this.messagesContainer = document.getElementById('chatMessages'); // 修正ID
        
        // 创建连接状态指示器
        this.createConnectionIndicator();
        
        // 创建在线用户列表
        this.createOnlineUsersList();
    }

    // 创建连接状态指示器
    createConnectionIndicator() {
        // 创建状态指示器，融入聊天标题栏
        const chatHeader = document.querySelector('.chat-header');
        if (!chatHeader) return;
        
        const indicator = document.createElement('div');
        indicator.id = 'connection-indicator';
        indicator.innerHTML = `
            <div class="connection-status">
                <span class="status-dot" id="status-dot"></span>
                <span class="status-text" id="status-text">未连接</span>
            </div>
        `;
        
        // 插入到在线用户数旁边
        const onlineCount = chatHeader.querySelector('.online-count');
        if (onlineCount) {
            chatHeader.insertBefore(indicator, onlineCount);
        } else {
            chatHeader.appendChild(indicator);
        }
        
        // 添加融入主题的样式
        const style = document.createElement('style');
        style.textContent = `
            #connection-indicator {
                display: flex;
                align-items: center;
                gap: 8px;
                font-size: 10px;
                color: #00d4ff;
                text-transform: uppercase;
                letter-spacing: 0.5px;
                font-family: 'Orbitron', 'Courier New', monospace;
                margin-left: auto;
                margin-right: 10px;
            }
            
            .connection-status {
                display: flex;
                align-items: center;
                gap: 6px;
                padding: 2px 8px;
                background: rgba(0, 212, 255, 0.1);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 3px;
                transition: all 0.3s ease;
            }
            
            .status-dot {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #666;
                transition: all 0.3s ease;
                box-shadow: 0 0 4px rgba(0, 0, 0, 0.5);
            }
            
            .status-dot.connected {
                background: #00ff41;
                box-shadow: 0 0 8px rgba(0, 255, 65, 0.6);
            }
            
            .status-dot.connecting {
                background: #ffaa00;
                animation: sc-pulse 1.5s infinite;
                box-shadow: 0 0 8px rgba(255, 170, 0, 0.6);
            }
            
            .status-dot.disconnected {
                background: #ff4444;
                box-shadow: 0 0 8px rgba(255, 68, 68, 0.6);
            }
            
            .connection-status:hover {
                background: rgba(0, 212, 255, 0.2);
                border-color: rgba(0, 212, 255, 0.5);
            }
            
            @keyframes sc-pulse {
                0%, 100% { 
                    opacity: 1; 
                    transform: scale(1);
                }
                50% { 
                    opacity: 0.6; 
                    transform: scale(1.2);
                }
            }
            
            /* 全屏模式下的样式调整 */
            .chat-container.fullscreen #connection-indicator {
                font-size: 12px;
                margin-right: 20px;
            }
            
            .chat-container.fullscreen .connection-status {
                padding: 4px 12px;
            }
        `;
        
        if (!document.getElementById('connection-indicator-style')) {
            style.id = 'connection-indicator-style';
            document.head.appendChild(style);
        }
    }

    // 创建在线用户列表
    createOnlineUsersList() {
        // 使用现有的HTML用户列表，不创建新的
        this.usersListElement = document.getElementById('onlineUsersList');
        if (!this.usersListElement) return;
        
        // 添加样式
        this.addUsersListStyles();
        
        // 绑定到现有的HTML元素
        this.userCountElement = document.getElementById('userCount');
        this.onlineUsersElement = document.getElementById('onlineUsers');
        
        console.log('✅ 使用现有HTML用户列表');
    }

    // 添加用户列表样式
    addUsersListStyles() {
        if (document.getElementById('users-list-style')) return;
        
        const style = document.createElement('style');
        style.id = 'users-list-style';
        style.textContent = `
            .online-users-list {
                background: rgba(0, 20, 40, 0.95);
                border: 1px solid rgba(0, 212, 255, 0.3);
                border-radius: 5px;
                margin-top: 10px;
                transition: all 0.3s ease;
                font-family: 'Orbitron', 'Courier New', monospace;
            }
            
            .online-users-list.hidden {
                display: none;
            }
            
            .users-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 10px 15px;
                background: rgba(0, 212, 255, 0.1);
                border-bottom: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 5px 5px 0 0;
            }
            
            .users-title {
                display: flex;
                align-items: center;
                gap: 8px;
                color: #00d4ff;
            }
            
            .users-title h4 {
                margin: 0;
                font-size: 12px;
                font-weight: 600;
                letter-spacing: 1px;
                text-transform: uppercase;
            }
            
            .users-icon {
                font-size: 14px;
            }
            
            .users-count {
                background: rgba(0, 255, 65, 0.2);
                color: #00ff41;
                padding: 2px 8px;
                border-radius: 10px;
                font-size: 10px;
                font-weight: bold;
                border: 1px solid rgba(0, 255, 65, 0.3);
            }
            
            .users-content {
                max-height: 150px;
                overflow-y: auto;
                padding: 5px;
            }
            
            .user-item {
                display: flex;
                align-items: center;
                gap: 8px;
                padding: 6px 10px;
                margin: 2px 0;
                border-radius: 3px;
                transition: all 0.2s ease;
                font-size: 11px;
                color: #b0e0ff;
            }
            
            .user-item:hover {
                background: rgba(0, 212, 255, 0.1);
            }
            
            .user-item.current {
                background: rgba(0, 255, 65, 0.15);
                color: #00ff41;
                border-left: 3px solid #00ff41;
            }
            
            .user-status {
                width: 6px;
                height: 6px;
                border-radius: 50%;
                background: #00ff41;
                box-shadow: 0 0 4px rgba(0, 255, 65, 0.6);
                animation: user-pulse 2s infinite;
            }
            
            .user-name {
                flex: 1;
                font-weight: 500;
                letter-spacing: 0.5px;
            }
            
            @keyframes user-pulse {
                0%, 100% { opacity: 1; }
                50% { opacity: 0.7; }
            }
            
            /* 全屏模式下的布局 */
            .chat-container.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(5px);
                display: flex;
                flex-direction: column;
                overflow: hidden;
            }
            
            .chat-container.fullscreen .chat-content {
                position: absolute;
                top: 60px;
                left: 0;
                right: 300px; /* 为右侧用户列表留300px */
                bottom: 0;
                display: flex;
                flex-direction: column;
            }
            
            .chat-container.fullscreen .chat-header {
                background: rgba(0, 20, 40, 0.9);
                border-bottom: 2px solid #ff6600;
                padding: 15px 20px;
                display: flex;
                justify-content: space-between;
                align-items: center;
                position: relative;
                z-index: 10000;
            }
            
            .chat-container.fullscreen .chat-header h3 {
                font-size: 24px;
                color: #ff6600;
                margin: 0;
                letter-spacing: 2px;
                text-shadow: 0 0 10px rgba(255, 102, 0, 0.5);
            }
            
            .chat-container.fullscreen .chat-header .online-count {
                font-size: 14px;
                color: #00ff41;
                background: rgba(0, 255, 65, 0.1);
                padding: 5px 10px;
                border-radius: 15px;
                border: 1px solid rgba(0, 255, 65, 0.3);
            }
            
            .chat-container.fullscreen .chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 20px;
                background: rgba(0, 10, 20, 0.8);
                scrollbar-width: thin;
                scrollbar-color: #ff6600 rgba(0, 0, 0, 0.3);
            }
            
            /* 全屏下的消息样式优化 */
            .chat-container.fullscreen .message {
                background: rgba(0, 20, 40, 0.6);
                border: 1px solid rgba(0, 212, 255, 0.2);
                border-radius: 8px;
                padding: 12px 15px;
                margin: 8px 0;
                font-size: 14px;
                line-height: 1.4;
            }
            
            .chat-container.fullscreen .message.own {
                background: rgba(255, 102, 0, 0.1);
                border-color: rgba(255, 102, 0, 0.3);
                margin-left: 20%;
            }
            
            .chat-container.fullscreen .message.system {
                background: rgba(0, 255, 65, 0.05);
                border-color: rgba(0, 255, 65, 0.2);
                text-align: center;
                font-style: italic;
            }
            
            .chat-container.fullscreen .chat-messages::-webkit-scrollbar {
                width: 8px;
            }
            
            .chat-container.fullscreen .chat-messages::-webkit-scrollbar-track {
                background: rgba(0, 0, 0, 0.3);
            }
            
            .chat-container.fullscreen .chat-messages::-webkit-scrollbar-thumb {
                background: #ff6600;
                border-radius: 4px;
            }
            
            .chat-container.fullscreen .chat-input-container {
                background: rgba(0, 20, 40, 0.95);
                border-top: 2px solid #ff6600;
                padding: 15px 20px;
                display: flex;
                gap: 10px;
                flex-shrink: 0;
            }
            
            .chat-container.fullscreen .chat-input-container input {
                flex: 1;
                background: rgba(0, 0, 0, 0.7);
                border: 1px solid #ff6600;
                color: #fff;
                padding: 12px 15px;
                border-radius: 5px;
                font-size: 14px;
                font-family: 'Orbitron', monospace;
            }
            
            .chat-container.fullscreen .chat-input-container button {
                background: #ff6600;
                color: #fff;
                border: none;
                padding: 12px 20px;
                border-radius: 5px;
                cursor: pointer;
                font-weight: bold;
                font-family: 'Orbitron', monospace;
                transition: all 0.3s ease;
            }
            
            .chat-container.fullscreen .chat-input-container button:hover {
                background: #e55a00;
                box-shadow: 0 0 15px rgba(255, 102, 0, 0.5);
            }
            
            .chat-container.fullscreen .online-users-list {
                position: absolute;
                top: 60px; /* 在header下方 */
                right: 0;
                width: 300px;
                height: calc(100vh - 60px);
                margin: 0;
                background: rgba(0, 15, 30, 0.9);
                border-left: 2px solid #ff6600;
                overflow-y: auto;
                z-index: 9998;
            }
            
            .chat-container.fullscreen .users-content {
                max-height: none;
                height: calc(100% - 60px);
                overflow-y: auto;
            }
            
            /* 全屏退出按钮 */
            .chat-container.fullscreen::before {
                content: "Press ESC to exit fullscreen";
                position: absolute;
                top: 10px;
                right: 10px;
                background: rgba(0, 0, 0, 0.7);
                color: #ff6600;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 11px;
                z-index: 10001;
                animation: fade-in-out 4s ease-in-out;
            }
            
            @keyframes fade-in-out {
                0%, 20%, 80%, 100% { opacity: 0; }
                30%, 70% { opacity: 1; }
            }
            
            /* 移动端适配 */
            @media (max-width: 768px) {
                .chat-container.fullscreen .chat-content {
                    flex-direction: column;
                }
                
                .chat-container.fullscreen .online-users-list {
                    width: 100%;
                    height: 200px;
                    border-left: none;
                    border-bottom: 2px solid #ff6600;
                    order: -1;
                }
                
                .chat-container.fullscreen .chat-messages {
                    height: calc(100% - 280px);
                }
                
                .chat-container.fullscreen .chat-input-container {
                    right: 0; /* 移动端时输入框占满宽度 */
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 连接到服务器
    async connect(username) {
        if (this.isConnected) {
            console.log('已经连接到服务器');
            return;
        }

        this.currentUser = username;
        this.updateConnectionStatus('connecting', '连接中...');

        try {
            // 创建Socket连接
            this.socket = io(this.serverUrl, {
                transports: ['websocket', 'polling'],
                timeout: 10000,
                forceNew: true
            });

            // 设置事件监听器
            this.setupSocketListeners();
            
            // 加入聊天室
            this.socket.emit('join', {
                username: username,
                userId: this.generateUserId(username)
            });

            console.log(`🔗 正在连接到聊天服务器: ${username}`);
            
        } catch (error) {
            console.error('连接失败:', error);
            this.updateConnectionStatus('disconnected', '连接失败');
            this.handleReconnect();
        }
    }

    // 设置Socket事件监听器
    setupSocketListeners() {
        // 连接成功
        this.socket.on('connect', () => {
            console.log('✅ 已连接到聊天服务器');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            this.updateConnectionStatus('connected', '已连接');
            
            // 发送队列中的消息
            this.flushMessageQueue();
            
            // 播放连接音效
            if (window.soundSystem) {
                window.soundSystem.play('connection_success');
            }
        });

        // 欢迎消息
        this.socket.on('welcome', (data) => {
            console.log('🎉 收到欢迎消息:', data.message);
            this.addSystemMessage(data.message);
            
            if (data.users) {
                this.updateUsersList(data.users);
            }
        });

        // 历史消息
        this.socket.on('history', (data) => {
            console.log(`📚 加载了 ${data.messages.length} 条历史消息`);
            data.messages.forEach(message => {
                this.displayMessage(message, false); // 不播放音效
            });
        });

        // 新消息
        this.socket.on('newMessage', (message) => {
            console.log('📥 收到新消息:', message);
            this.displayMessage(message, true);
        });

        // 用户加入
        this.socket.on('userJoined', (data) => {
            console.log('👤 用户加入:', data.username);
            this.addSystemMessage(data.message);
            
            if (data.users) {
                this.updateUsersList(data.users);
            }
            
            // 播放用户加入音效
            if (window.soundSystem && data.username !== this.currentUser) {
                window.soundSystem.play('user_join');
            }
        });

        // 用户离开
        this.socket.on('userLeft', (data) => {
            console.log('👋 用户离开:', data.username);
            this.addSystemMessage(data.message);
            
            // 播放用户离开音效
            if (window.soundSystem && data.username !== this.currentUser) {
                window.soundSystem.play('user_leave');
            }
        });

        // 用户列表更新
        this.socket.on('userList', (data) => {
            this.updateUsersList(data.users);
        });

        // 连接断开
        this.socket.on('disconnect', (reason) => {
            console.log('❌ 连接断开:', reason);
            this.isConnected = false;
            this.updateConnectionStatus('disconnected', '连接断开');
            
            if (reason !== 'io client disconnect') {
                this.handleReconnect();
            }
        });

        // 错误处理
        this.socket.on('error', (error) => {
            console.error('❌ Socket错误:', error);
            this.addSystemMessage(`错误: ${error.message || '未知错误'}`, 'error');
        });

        // 连接错误
        this.socket.on('connect_error', (error) => {
            console.error('❌ 连接错误:', error);
            this.updateConnectionStatus('disconnected', '连接错误');
            this.handleReconnect();
        });
    }

    // 处理重连
    handleReconnect() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            console.log('❌ 达到最大重连次数，停止重连');
            this.addSystemMessage('连接失败，请刷新页面重试', 'error');
            return;
        }

        this.reconnectAttempts++;
        const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1);
        
        console.log(`🔄 ${delay}ms后进行第${this.reconnectAttempts}次重连...`);
        this.updateConnectionStatus('connecting', `重连中... (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        
        setTimeout(() => {
            if (this.currentUser && !this.isConnected) {
                this.connect(this.currentUser);
            }
        }, delay);
    }

    // 发送消息
    sendMessage(text, type = 'user') {
        if (!text || text.trim().length === 0) {
            console.warn('消息内容为空');
            return false;
        }

        const message = {
            text: text.trim(),
            type: type
        };

        if (this.isConnected && this.socket) {
            this.socket.emit('message', message);
            console.log('📤 消息已发送:', text);
            
            // 播放发送音效
            if (window.soundSystem && type === 'user') {
                window.soundSystem.play('message_send');
            }
            
            return true;
        } else {
            // 添加到队列
            this.messageQueue.push(message);
            console.log('📤 消息已加入队列（等待连接）');
            return false;
        }
    }

    // 发送队列中的消息
    flushMessageQueue() {
        if (this.messageQueue.length === 0) return;
        
        console.log(`📤 发送队列中的 ${this.messageQueue.length} 条消息`);
        
        this.messageQueue.forEach(message => {
            this.socket.emit('message', message);
        });
        
        this.messageQueue = [];
    }

    // 显示消息
    displayMessage(message, playSound = true) {
        if (!this.messagesContainer) return;

        const messageElement = document.createElement('div');
        messageElement.className = `message ${message.type}`;
        
        const isOwnMessage = message.username === this.currentUser;
        if (isOwnMessage) {
            messageElement.classList.add('own');
        }

        const timestamp = new Date(message.timestamp).toLocaleTimeString();
        
        messageElement.innerHTML = `
            <div class="message-content">
                <div class="message-header">
                    <span class="username">${message.username}</span>
                    <span class="timestamp">${timestamp}</span>
                </div>
                <div class="message-text">${this.formatMessage(message.text)}</div>
            </div>
        `;

        this.messagesContainer.appendChild(messageElement);
        this.scrollToBottom();

        // 播放接收音效
        if (playSound && !isOwnMessage && window.soundSystem) {
            window.soundSystem.play('message_receive');
        }

        // 添加动画
        requestAnimationFrame(() => {
            messageElement.classList.add('visible');
        });
    }

    // 添加系统消息
    addSystemMessage(text, type = 'system') {
        const message = {
            id: Date.now(),
            username: 'System',
            text: text,
            type: type,
            timestamp: Date.now()
        };
        
        this.displayMessage(message, false);
    }

    // 格式化消息文本
    formatMessage(text) {
        // 转义HTML
        text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
        
        // 表情符号转换
        const emojis = {
            ':)': '😊',
            ':D': '😃',
            ':(': '😢',
            ':P': '😛',
            ';)': '😉',
            ':o': '😮',
            ':heart:': '❤️',
            ':star:': '⭐',
            ':fire:': '🔥',
            ':rocket:': '🚀'
        };
        
        for (const [key, emoji] of Object.entries(emojis)) {
            text = text.replace(new RegExp(key.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'), emoji);
        }
        
        return text;
    }

    // 更新连接状态
    updateConnectionStatus(status, text) {
        const statusDot = document.getElementById('status-dot');
        const statusText = document.getElementById('status-text');
        
        if (statusDot && statusText) {
            statusDot.className = `status-dot ${status}`;
            statusText.textContent = text;
        }
    }

    // 更新在线用户列表
    updateUsersList(users) {
        if (!this.userCountElement || !this.onlineUsersElement) return;
        
        this.userCountElement.textContent = users.length;
        
        this.onlineUsersElement.innerHTML = users.map(user => `
            <div class="user-item ${user.username === this.currentUser ? 'current' : ''}">
                <span class="user-status"></span>
                <span class="user-name">${user.username}</span>
            </div>
        `).join('');
    }

    // 滚动到底部
    scrollToBottom() {
        if (this.messagesContainer) {
            this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
        }
    }

    // 生成用户ID
    generateUserId(username) {
        return `${username}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // 断开连接
    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
            this.socket = null;
        }
        
        this.isConnected = false;
        this.currentUser = null;
        this.updateConnectionStatus('disconnected', '已断开');
        
        console.log('👋 已断开聊天服务器连接');
    }

    // 绑定事件
    bindEvents() {
        // 消息输入处理
        if (this.messageInput) {
            this.messageInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    const text = this.messageInput.value.trim();
                    if (text) {
                        this.sendMessage(text);
                        this.messageInput.value = '';
                    }
                }
            });
        }

        // 发送按钮事件处理
        const sendButton = document.querySelector('.chat-input-container button');
        if (sendButton) {
            sendButton.addEventListener('click', (e) => {
                e.preventDefault();
                const text = this.messageInput ? this.messageInput.value.trim() : '';
                if (text) {
                    this.sendMessage(text);
                    if (this.messageInput) {
                        this.messageInput.value = '';
                    }
                }
            });
        }

        // 聊天标题点击全屏事件  
        const chatHeader = document.querySelector('.chat-header h3');
        if (chatHeader) {
            chatHeader.style.cursor = 'pointer';
            chatHeader.addEventListener('click', () => {
                this.openFullscreenChat();
            });
            console.log('💬 已绑定聊天标题点击全屏事件');
        }

        // ESC键退出全屏
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.chatContainer && this.chatContainer.classList.contains('fullscreen')) {
                    this.toggleChatFullscreen();
                }
            }
        });
    }

    // 获取连接状态
    getConnectionStatus() {
        return {
            connected: this.isConnected,
            user: this.currentUser,
            reconnectAttempts: this.reconnectAttempts,
            queuedMessages: this.messageQueue.length
        };
    }

    // 打开独立全屏聊天页面
    openFullscreenChat() {
        // 播放打开音效
        if (window.soundSystem) {
            window.soundSystem.play('menu_open');
        }
        
        // 打开新的全屏聊天窗口
        const chatWindow = window.open(
            'chat-fullscreen.html',
            'StarCitizenChat',
            'width=1920,height=1080,scrollbars=no,resizable=yes,status=no,location=no,toolbar=no,menubar=no,fullscreen=yes'
        );
        
        if (chatWindow) {
            // 尝试使窗口全屏
            chatWindow.focus();
            console.log('💬 已打开独立全屏聊天窗口');
        } else {
            console.warn('⚠️ 无法打开聊天窗口，可能被浏览器阻止');
            // 如果弹窗被阻止，则跳转到聊天页面
            window.location.href = 'chat-fullscreen.html';
        }
    }

    // 切换聊天全屏（兼容现有功能，保留用于其他地方调用）
    toggleChatFullscreen() {
        if (this.chatContainer) {
            const isFullscreen = this.chatContainer.classList.contains('fullscreen');
            this.chatContainer.classList.toggle('fullscreen');
            
            // 控制用户列表显示
            if (this.usersListElement) {
                if (isFullscreen) {
                    // 退出全屏，隐藏用户列表
                    this.usersListElement.classList.add('hidden');
                } else {
                    // 进入全屏，显示用户列表
                    this.usersListElement.classList.remove('hidden');
                }
            }
            
            // 播放音效
            if (window.soundSystem) {
                window.soundSystem.play(!isFullscreen ? 'menu_open' : 'menu_close');
            }
            
            console.log(`💬 聊天室${!isFullscreen ? '进入' : '退出'}全屏模式`);
        }
    }
}

// 创建全局实例（替换原有的聊天系统）
if (window.socketChatSystem) {
    console.log('⚠️ Socket.io聊天系统已存在，跳过重复创建');
} else {
    window.socketChatSystem = new SocketChatSystem();
    
    // 为了兼容现有代码，覆盖所有可能的聊天系统引用
    window.chatSystem = window.socketChatSystem;
    
    // 标记为主要聊天系统
    window.socketChatSystem._isPrimary = true;
    
    console.log('🌐 Socket.io聊天系统已加载并设为主要聊天系统');
} 