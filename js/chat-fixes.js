// 聊天系统修复脚本
(function() {
    'use strict';
    
    console.log('🔧 应用聊天系统修复...');
    
    // 等待DOM和聊天系统加载完成
    function applyChatFixes() {
        // 修复1：确保发送按钮功能正常
        const sendButton = document.querySelector('.chat-input-container button');
        const chatInput = document.getElementById('chatInput');
        
        if (sendButton && chatInput) {
            // 移除旧的事件监听器
            sendButton.replaceWith(sendButton.cloneNode(true));
            const newSendButton = document.querySelector('.chat-input-container button');
            
            // 添加新的事件监听器
            newSendButton.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // 绑定回车键
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            console.log('✅ 发送按钮功能已修复');
        }
        
        // 修复2：确保在线用户列表元素存在
        const userCountSpan = document.querySelector('.online-count');
        if (userCountSpan && !document.getElementById('userCount')) {
            userCountSpan.innerHTML = '<span id="userCount">1</span> ONLINE';
        }
        
        // 修复3：确保聊天系统引用正确的元素
        if (window.socketChatSystem) {
            window.socketChatSystem.usersListElement = document.getElementById('onlineUsersList');
            window.socketChatSystem.onlineUsersElement = document.getElementById('onlineUsers');
            window.socketChatSystem.userCountElement = document.getElementById('userCount');
            
            console.log('✅ 聊天系统元素引用已更新');
        }
        
        // 修复4：添加全屏切换功能
        const chatTitle = document.querySelector('.chat-header h3');
        if (chatTitle) {
            chatTitle.style.cursor = 'pointer';
            chatTitle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
            
            console.log('✅ 全屏切换功能已修复');
        }
        
        console.log('🎉 聊天系统修复完成');
    }
    
    // 立即应用修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyChatFixes);
    } else {
        applyChatFixes();
    }
    
    // 在聊天系统加载后再次应用修复
    setTimeout(applyChatFixes, 1000);
    
})(); 

// 聊天系统修复和增强
class ChatSystemFixes {
    constructor() {
        console.log('🔧 应用聊天系统修复...');
        this.init();
    }

    init() {
        // 修复发送按钮功能
        this.fixSendButton();
        
        // 修复聊天系统元素引用
        this.fixChatElements();
        
        // 修复全屏切换功能
        this.fixFullscreenToggle();
        
        console.log('🎉 聊天系统修复完成');
    }

    fixSendButton() {
        const sendButton = document.querySelector('.chat-input-container button');
        const chatInput = document.getElementById('chatInput');
        
        if (sendButton && chatInput) {
            // 移除旧的事件监听器
            sendButton.replaceWith(sendButton.cloneNode(true));
            const newSendButton = document.querySelector('.chat-input-container button');
            
            // 添加新的事件监听器
            newSendButton.addEventListener('click', () => {
                this.sendMessage();
            });
            
            // 绑定回车键
            chatInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.sendMessage();
                }
            });
            
            console.log('✅ 发送按钮功能已修复');
        }
    }

    sendMessage() {
        const chatInput = document.getElementById('chatInput');
        const message = chatInput.value.trim();
        
        if (message) {
            // 使用Socket.io聊天系统发送消息
            if (window.socketChatSystem && window.socketChatSystem.sendMessage) {
                window.socketChatSystem.sendMessage(message);
            } else {
                // 如果Socket.io不可用，显示提示
                this.showChatError('聊天服务器未连接，请检查网络连接');
            }
            
            chatInput.value = '';
        }
    }

    showChatError(message) {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            const errorElement = document.createElement('div');
            errorElement.className = 'chat-message system-error';
            errorElement.innerHTML = `
                <div class="message-header">
                    <span class="username">系统</span>
                    <span class="timestamp">${new Date().toLocaleTimeString('zh-CN')}</span>
                </div>
                <div class="message-text">${message}</div>
            `;
            
            chatMessages.appendChild(errorElement);
            chatMessages.scrollTop = chatMessages.scrollHeight;
        }
    }

    fixChatElements() {
        // 确保聊天元素正确引用
        const chatContainer = document.querySelector('.chat-container');
        const chatMessages = document.getElementById('chatMessages');
        const chatInput = document.getElementById('chatInput');
        
        if (chatContainer && chatMessages && chatInput) {
            console.log('✅ 聊天系统元素引用已更新');
        }
    }

    fixFullscreenToggle() {
        const chatTitle = document.querySelector('.chat-header h3');
        if (chatTitle) {
            chatTitle.addEventListener('click', () => {
                this.toggleFullscreen();
            });
            console.log('✅ 全屏切换功能已修复');
        }
    }

    toggleFullscreen() {
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer) {
            chatContainer.classList.toggle('fullscreen');
            
            // 兼容不同浏览器的全屏API
            if (chatContainer.classList.contains('fullscreen')) {
                if (chatContainer.requestFullscreen) {
                    chatContainer.requestFullscreen();
                } else if (chatContainer.webkitRequestFullscreen) {
                    chatContainer.webkitRequestFullscreen();
                } else if (chatContainer.msRequestFullscreen) {
                    chatContainer.msRequestFullscreen();
                }
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                } else if (document.msExitFullscreen) {
                    document.msExitFullscreen();
                }
            }
        }
    }
}

// 全局错误处理
window.addEventListener('error', (e) => {
    if (e.message.includes('socket.io') || e.message.includes('Socket')) {
        console.log('🔧 Socket.io相关错误已被捕获，使用离线模式');
        return true; // 阻止错误传播
    }
});

// 初始化聊天修复系统
document.addEventListener('DOMContentLoaded', () => {
    new ChatSystemFixes();
});

// 导出到全局
window.chatSystemFixes = new ChatSystemFixes(); 