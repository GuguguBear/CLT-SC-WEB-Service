// 键盘快捷键管理系统
class KeyboardShortcuts {
    constructor() {
        this.shortcuts = new Map();
        this.isEnabled = true;
        this.helpVisible = false;
        this.init();
    }

    init() {
        this.setupDefaultShortcuts();
        this.setupEventListeners();
        this.createHelpOverlay();
        console.log('⌨️ 键盘快捷键系统已初始化');
    }

    setupDefaultShortcuts() {
        // 聊天相关
        this.register('Ctrl+Enter', () => {
            if (window.chatSystem && window.chatSystem.isConnected) {
                // 使用新的Socket.io聊天系统
                if (window.chatSystem.sendMessage) {
                    const messageInput = document.getElementById('messageInput');
                    const message = messageInput?.value?.trim();
                    if (message) {
                        window.chatSystem.sendMessage(message);
                        messageInput.value = '';
                    }
                } else if (window.chatSystem.handleSendMessage) {
                    // 兼容旧聊天系统
                    window.chatSystem.handleSendMessage();
                }
            }
        }, '发送聊天消息');

        this.register('F11', () => {
            if (window.chatSystem) {
                window.chatSystem.toggleChatFullscreen();
            }
        }, '切换聊天全屏');

        // 音效控制
        this.register('Ctrl+M', () => {
            if (window.soundSystem) {
                window.soundSystem.toggleSound();
            }
        }, '切换音效开关');

        this.register('Ctrl+Shift+M', () => {
            if (window.soundSystem) {
                window.soundSystem.toggleMute();
            }
        }, '静音/取消静音');

        // 界面控制
        this.register('Ctrl+Shift+H', () => {
            this.toggleHelp();
        }, '显示/隐藏快捷键帮助');

        this.register('Escape', () => {
            this.handleEscape();
        }, '取消/关闭当前操作');

        // 系统功能
        this.register('Ctrl+R', (e) => {
            e.preventDefault();
            if (window.loadingManager) {
                window.loadingManager.show('刷新系统...', '正在重新加载数据');
            }
            setTimeout(() => {
                location.reload();
            }, 500);
        }, '刷新页面');

        // 开发调试 (仅在开发环境)
        this.register('Ctrl+Shift+D', () => {
            this.toggleDebugMode();
        }, '切换调试模式');

        // 性能诊断
        this.register('Ctrl+Shift+P', () => {
            this.runPerformanceDiagnostics();
        }, '运行性能诊断');

        console.log(`🎹 注册了 ${this.shortcuts.size} 个快捷键`);
    }

    setupEventListeners() {
        document.addEventListener('keydown', (e) => {
            if (!this.isEnabled) return;

            const combo = this.getKeyCombo(e);
            const shortcut = this.shortcuts.get(combo);

            if (shortcut) {
                e.preventDefault();
                try {
                    shortcut.action(e);
                    console.log(`⌨️ 执行快捷键: ${combo}`);
                    
                    // 播放音效
                    if (window.soundSystem) {
                        window.soundSystem.play('button_click');
                    }
                } catch (error) {
                    console.error(`快捷键执行失败 ${combo}:`, error);
                }
            }
        });
    }

    getKeyCombo(e) {
        const parts = [];
        
        if (e.ctrlKey) parts.push('Ctrl');
        if (e.shiftKey) parts.push('Shift');
        if (e.altKey) parts.push('Alt');
        if (e.metaKey) parts.push('Meta');
        
        // 检查key是否存在
        if (!e.key) return parts.join('+');
        
        // 特殊键处理
        if (e.key === 'Enter') parts.push('Enter');
        else if (e.key === 'Escape') parts.push('Escape');
        else if (e.key.startsWith('F') && e.key.length <= 3) parts.push(e.key);
        else parts.push(e.key.toUpperCase());
        
        return parts.join('+');
    }

    register(combo, action, description = '') {
        this.shortcuts.set(combo, {
            action,
            description,
            combo
        });
    }

    unregister(combo) {
        return this.shortcuts.delete(combo);
    }

    enable() {
        this.isEnabled = true;
        console.log('✅ 快捷键系统已启用');
    }

    disable() {
        this.isEnabled = false;
        console.log('⏸️ 快捷键系统已禁用');
    }

    handleEscape() {
        // 优先级处理ESC键
        const chatContainer = document.querySelector('.chat-container');
        if (chatContainer && chatContainer.classList.contains('fullscreen')) {
            if (window.chatSystem) {
                window.chatSystem.toggleChatFullscreen();
            }
            return;
        }

        // 关闭帮助界面
        if (this.helpVisible) {
            this.toggleHelp();
            return;
        }

        // 其他ESC处理
        console.log('🚪 ESC键处理完成');
    }

    toggleHelp() {
        const helpOverlay = document.getElementById('shortcut-help-overlay');
        if (!helpOverlay) return;

        this.helpVisible = !this.helpVisible;
        helpOverlay.style.display = this.helpVisible ? 'flex' : 'none';

        if (this.helpVisible) {
            this.updateHelpContent();
            if (window.soundSystem) {
                window.soundSystem.play('menu_open');
            }
        } else {
            if (window.soundSystem) {
                window.soundSystem.play('menu_close');
            }
        }
    }

    createHelpOverlay() {
        const overlay = document.createElement('div');
        overlay.id = 'shortcut-help-overlay';
        overlay.innerHTML = `
            <div class="shortcut-help-container">
                <div class="shortcut-help-header">
                    <h3>⌨️ 键盘快捷键</h3>
                    <button class="help-close-btn" onclick="keyboardShortcuts.toggleHelp()">×</button>
                </div>
                <div class="shortcut-help-content">
                    <!-- 动态生成内容 -->
                </div>
                <div class="shortcut-help-footer">
                    <p>按 <kbd>Ctrl+Shift+H</kbd> 或 <kbd>ESC</kbd> 关闭此帮助</p>
                </div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            #shortcut-help-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.9);
                backdrop-filter: blur(5px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 9998;
                font-family: 'Share Tech Mono', monospace;
            }

            .shortcut-help-container {
                background: #111;
                border: 2px solid #ff6600;
                border-radius: 8px;
                max-width: 600px;
                max-height: 80vh;
                overflow-y: auto;
                box-shadow: 0 0 30px rgba(255, 102, 0, 0.5);
            }

            .shortcut-help-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 20px;
                border-bottom: 1px solid #333;
                background: rgba(255, 102, 0, 0.1);
            }

            .shortcut-help-header h3 {
                color: #ff6600;
                margin: 0;
                font-size: 18px;
            }

            .help-close-btn {
                background: none;
                border: none;
                color: #ff6600;
                font-size: 24px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .help-close-btn:hover {
                background: rgba(255, 102, 0, 0.2);
                border-radius: 50%;
            }

            .shortcut-help-content {
                padding: 20px;
                color: #ccc;
            }

            .shortcut-group {
                margin-bottom: 20px;
            }

            .shortcut-group h4 {
                color: #ff8800;
                font-size: 14px;
                margin-bottom: 10px;
                border-bottom: 1px solid #333;
                padding-bottom: 5px;
            }

            .shortcut-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid rgba(255, 102, 0, 0.1);
            }

            .shortcut-item:last-child {
                border-bottom: none;
            }

            .shortcut-keys {
                display: flex;
                gap: 4px;
            }

            .shortcut-keys kbd {
                background: #333;
                border: 1px solid #555;
                border-radius: 3px;
                padding: 4px 8px;
                font-size: 11px;
                color: #ff6600;
                font-family: inherit;
            }

            .shortcut-description {
                flex: 1;
                margin-left: 15px;
                font-size: 12px;
            }

            .shortcut-help-footer {
                padding: 15px 20px;
                border-top: 1px solid #333;
                text-align: center;
                color: #888;
                font-size: 11px;
            }

            .shortcut-help-footer kbd {
                background: #333;
                border: 1px solid #555;
                border-radius: 3px;
                padding: 2px 6px;
                color: #ff6600;
            }

            @media (max-width: 768px) {
                .shortcut-help-container {
                    max-width: 90vw;
                    margin: 20px;
                }

                .shortcut-item {
                    flex-direction: column;
                    align-items: flex-start;
                    gap: 5px;
                }

                .shortcut-description {
                    margin-left: 0;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(overlay);
    }

    updateHelpContent() {
        const content = document.querySelector('.shortcut-help-content');
        if (!content) return;

        const groups = {
            '聊天功能': [],
            '音效控制': [],
            '界面控制': [],
            '系统功能': [],
            '开发调试': []
        };

        // 分组快捷键
        for (const [combo, shortcut] of this.shortcuts.entries()) {
            const desc = shortcut.description;
            if (desc.includes('聊天') || desc.includes('消息')) {
                groups['聊天功能'].push({ combo, ...shortcut });
            } else if (desc.includes('音效') || desc.includes('音')) {
                groups['音效控制'].push({ combo, ...shortcut });
            } else if (desc.includes('界面') || desc.includes('显示') || desc.includes('全屏')) {
                groups['界面控制'].push({ combo, ...shortcut });
            } else if (desc.includes('调试')) {
                groups['开发调试'].push({ combo, ...shortcut });
            } else {
                groups['系统功能'].push({ combo, ...shortcut });
            }
        }

        let html = '';
        for (const [groupName, shortcuts] of Object.entries(groups)) {
            if (shortcuts.length === 0) continue;

            html += `<div class="shortcut-group">
                <h4>${groupName}</h4>`;

            for (const shortcut of shortcuts) {
                const keys = shortcut.combo.split('+').map(key => `<kbd>${key}</kbd>`).join('');
                html += `<div class="shortcut-item">
                    <div class="shortcut-keys">${keys}</div>
                    <div class="shortcut-description">${shortcut.description}</div>
                </div>`;
            }

            html += '</div>';
        }

        content.innerHTML = html;
    }

    toggleDebugMode() {
        const isDebug = document.body.classList.toggle('debug-mode');
        console.log(`🐛 调试模式: ${isDebug ? '开启' : '关闭'}`);
        
        if (isDebug) {
            console.log('当前注册的快捷键:', Array.from(this.shortcuts.keys()));
        }
    }

    runPerformanceDiagnostics() {
        if (window.runPerformanceDiagnostics) {
            console.log('🔍 启动性能诊断...');
            if (window.soundSystem) {
                window.soundSystem.play('system_startup');
            }
            window.runPerformanceDiagnostics();
        } else {
            console.warn('⚠️ 性能诊断工具未加载');
        }
    }

    // 获取所有快捷键列表
    getShortcuts() {
        return Array.from(this.shortcuts.entries()).map(([combo, shortcut]) => ({
            combo,
            description: shortcut.description
        }));
    }
}

// 创建全局实例
window.keyboardShortcuts = new KeyboardShortcuts();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = KeyboardShortcuts;
} 