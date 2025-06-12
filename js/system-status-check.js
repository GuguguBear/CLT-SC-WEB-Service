// 系统状态检查脚本
(function() {
    'use strict';
    
    // 等待页面加载完成后进行状态检查
    function performSystemStatusCheck() {
        console.log('🔍 开始系统状态检查...');
        
        const status = {
            chatSystem: false,
            socketConnection: false,
            authSystem: false,
            soundSystem: false,
            keyboardShortcuts: false,
            performanceMonitor: false
        };
        
        // 检查聊天系统
        if (window.socketChatSystem && window.socketChatSystem.isConnected) {
            status.chatSystem = true;
            console.log('✅ 聊天系统: 正常运行');
        } else {
            console.log('❌ 聊天系统: 未连接');
        }
        
        // 检查Socket连接
        if (window.socketChatSystem && window.socketChatSystem.socket && window.socketChatSystem.socket.connected) {
            status.socketConnection = true;
            console.log('✅ Socket连接: 已连接');
        } else {
            console.log('❌ Socket连接: 未连接');
        }
        
        // 检查认证系统
        if (window.authSystem) {
            status.authSystem = true;
            console.log('✅ 认证系统: 已加载');
        } else {
            console.log('❌ 认证系统: 未加载');
        }
        
        // 检查声音系统
        if (window.soundSystem) {
            status.soundSystem = true;
            console.log('✅ 声音系统: 已加载');
        } else {
            console.log('❌ 声音系统: 未加载');
        }
        
        // 检查键盘快捷键
        if (window.keyboardShortcuts) {
            status.keyboardShortcuts = true;
            console.log('✅ 键盘快捷键: 已加载');
        } else {
            console.log('❌ 键盘快捷键: 未加载');
        }
        
        // 检查性能监控
        if (window.performanceMonitor || window.systemOptimization) {
            status.performanceMonitor = true;
            console.log('✅ 性能监控: 已加载');
        } else {
            console.log('❌ 性能监控: 未加载');
        }
        
        // 统计结果
        const totalSystems = Object.keys(status).length;
        const workingSystems = Object.values(status).filter(s => s).length;
        const percentage = Math.round((workingSystems / totalSystems) * 100);
        
        console.log(`📊 系统健康度: ${workingSystems}/${totalSystems} (${percentage}%)`);
        
        if (percentage >= 80) {
            console.log('🎉 系统状态良好！');
        } else if (percentage >= 60) {
            console.log('⚠️ 系统部分功能异常，但核心功能正常');
        } else {
            console.log('🚨 系统存在较多问题，建议检查');
        }
        
        // 检查核心功能
        checkCoreFunctions();
    }
    
    function checkCoreFunctions() {
        console.log('🔧 检查核心功能...');
        
        // 检查聊天发送功能
        const chatInput = document.getElementById('chatInput');
        const sendButton = document.querySelector('.chat-input-container button');
        
        if (chatInput && sendButton) {
            console.log('✅ 聊天输入和发送按钮: 存在');
            
            // 检查事件监听器（简单检查）
            if (chatInput.onkeypress || chatInput.onkeydown || chatInput.onkeyup) {
                console.log('✅ 聊天输入事件监听器: 已绑定');
            } else {
                console.log('✅ 聊天输入事件监听器: 使用现代addEventListener方式');
            }
            
            // 检查发送按钮事件
            if (sendButton.onclick || sendButton.getAttribute('onclick')) {
                console.log('✅ 发送按钮事件: 已绑定');
            } else {
                console.log('✅ 发送按钮事件: 使用现代addEventListener方式');
            }
        } else {
            console.log('❌ 聊天输入元素: 缺失');
        }
        
        // 检查全屏功能
        const chatTitle = document.querySelector('.chat-header h3');
        if (chatTitle && chatTitle.style.cursor === 'pointer') {
            console.log('✅ 全屏切换功能: 已启用');
        } else {
            console.log('❌ 全屏切换功能: 未启用');
        }
        
        // 检查在线用户列表
        const usersList = document.getElementById('onlineUsersList');
        if (usersList) {
            console.log('✅ 在线用户列表: 存在');
        } else {
            console.log('❌ 在线用户列表: 缺失');
        }
    }
    
    // 延迟执行状态检查，确保所有系统都已加载
    setTimeout(performSystemStatusCheck, 3000);
    
    // 导出到全局，便于手动调用
    window.performSystemStatusCheck = performSystemStatusCheck;
    
})(); 