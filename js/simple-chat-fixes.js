// 简单聊天修复 - 只解决重复显示问题
(function() {
    'use strict';
    
    console.log('🔧 启动简单聊天修复...');
    
    // 等待DOM加载完成
    function init() {
        // 1. 修复重复的ONLINE USERS显示
        fixDuplicateUserLists();
        
        // 2. 改进全屏样式（不破坏现有布局）
        addSimpleFullscreenStyles();
        
        console.log('✅ 简单聊天修复完成');
    }
    
    // 修复重复的用户列表显示
    function fixDuplicateUserLists() {
        // 查找所有包含"ONLINE USERS"的元素
        const allElements = document.querySelectorAll('*');
        let removedCount = 0;
        
        allElements.forEach(element => {
            // 检查是否是JavaScript动态创建的重复用户列表
            if (element.id && element.id.includes('online-users-list') && element.id !== 'onlineUsersList') {
                console.log('🗑️ 移除重复用户列表:', element.id);
                element.remove();
                removedCount++;
            }
        });
        
        // 确保只有一个用户列表标题
        const userTitles = document.querySelectorAll('h4');
        userTitles.forEach(title => {
            if (title.textContent && title.textContent.includes('ONLINE USERS')) {
                const parent = title.closest('div');
                // 如果不是主要的用户列表，移除
                if (parent && parent.id !== 'onlineUsersList' && !parent.closest('#onlineUsersList')) {
                    console.log('🗑️ 移除重复用户标题:', title.textContent);
                    parent.remove();
                    removedCount++;
                }
            }
        });
        
        if (removedCount > 0) {
            console.log(`✅ 已移除 ${removedCount} 个重复元素`);
        } else {
            console.log('✅ 未发现重复元素');
        }
    }
    
    // 添加简单的全屏样式改进
    function addSimpleFullscreenStyles() {
        // 检查是否已经添加过样式
        if (document.getElementById('simple-fullscreen-fix')) return;
        
        const style = document.createElement('style');
        style.id = 'simple-fullscreen-fix';
        style.textContent = `
            /* 简单全屏改进 - 不破坏现有布局 */
            .chat-container.fullscreen {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                z-index: 9999;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(5px);
            }
            
            /* 全屏时确保用户列表显示 */
            .chat-container.fullscreen .online-users-list.hidden {
                display: block !important;
            }
            
            /* 全屏时的输入框位置修正 */
            .chat-container.fullscreen .chat-input-container {
                position: absolute;
                bottom: 20px;
                left: 20px;
                right: 340px; /* 为右侧用户列表留空间 */
                z-index: 10000;
            }
            
            /* 移动端全屏适配 */
            @media (max-width: 768px) {
                .chat-container.fullscreen .chat-input-container {
                    right: 20px; /* 移动端时不留空间 */
                }
            }
            
            /* 全屏提示 */
            .chat-container.fullscreen::before {
                content: "Press ESC to exit fullscreen";
                position: absolute;
                top: 20px;
                right: 20px;
                background: rgba(255, 102, 0, 0.8);
                color: white;
                padding: 5px 10px;
                border-radius: 3px;
                font-size: 12px;
                z-index: 10001;
                animation: fadeInOut 4s ease-in-out;
            }
            
            @keyframes fadeInOut {
                0%, 20%, 80%, 100% { opacity: 0; }
                30%, 70% { opacity: 1; }
            }
        `;
        
        document.head.appendChild(style);
        console.log('🎨 已添加简单全屏样式');
    }
    
    // 立即运行或等待DOM加载
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // 延迟执行，确保其他脚本已加载
        setTimeout(init, 500);
    }
    
    // 定期检查并修复重复元素（防止动态创建）
    setInterval(fixDuplicateUserLists, 5000);
    
})();

console.log('🔧 简单聊天修复已加载'); 