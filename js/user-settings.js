// 用户设置管理系统
class UserSettingsManager {
    constructor() {
        this.defaultSettings = {
            priceAlertsEnabled: false,
            soundEnabled: true,
            theme: 'dark',
            language: 'zh-CN',
            autoSave: true,
            notifications: {
                chat: true,
                system: true,
                price: false
            }
        };
        
        console.log('⚙️ 用户设置管理器已初始化');
    }

    // 获取用户设置
    getUserSettings(username) {
        if (!username) return this.defaultSettings;
        
        try {
            const settings = localStorage.getItem(`userSettings_${username}`);
            if (settings) {
                const parsed = JSON.parse(settings);
                // 合并默认设置，确保新字段存在
                return { ...this.defaultSettings, ...parsed };
            }
        } catch (error) {
            console.warn('获取用户设置失败:', error);
        }
        
        return this.defaultSettings;
    }

    // 保存用户设置
    saveUserSettings(username, settings) {
        if (!username) return false;
        
        try {
            localStorage.setItem(`userSettings_${username}`, JSON.stringify(settings));
            console.log('✅ 用户设置已保存');
            
            // 触发设置更新事件
            document.dispatchEvent(new CustomEvent('userSettingsUpdated', {
                detail: { username, settings }
            }));
            
            return true;
        } catch (error) {
            console.error('保存用户设置失败:', error);
            return false;
        }
    }

    // 更新特定设置
    updateSetting(username, key, value) {
        const settings = this.getUserSettings(username);
        
        if (key.includes('.')) {
            // 支持嵌套设置，如 'notifications.price'
            const keys = key.split('.');
            let current = settings;
            for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
            }
            current[keys[keys.length - 1]] = value;
        } else {
            settings[key] = value;
        }
        
        return this.saveUserSettings(username, settings);
    }

    // 创建设置面板
    createSettingsPanel() {
        const currentUser = localStorage.getItem('currentUsername');
        if (!currentUser) return null;

        const settings = this.getUserSettings(currentUser);
        
        const panel = document.createElement('div');
        panel.className = 'settings-panel';
        panel.innerHTML = `
            <div class="settings-header">
                <h3>用户设置</h3>
                <button class="close-btn" onclick="this.closest('.settings-panel').remove()">×</button>
            </div>
            <div class="settings-content">
                <div class="setting-group">
                    <h4>通知设置</h4>
                    <label class="setting-item">
                        <input type="checkbox" id="priceAlertsEnabled" ${settings.priceAlertsEnabled ? 'checked' : ''}>
                        <span>启用价格预警</span>
                        <small>当商品价格出现大幅波动时显示预警</small>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="soundEnabled" ${settings.soundEnabled ? 'checked' : ''}>
                        <span>启用音效</span>
                        <small>播放聊天和系统音效</small>
                    </label>
                    <label class="setting-item">
                        <input type="checkbox" id="chatNotifications" ${settings.notifications.chat ? 'checked' : ''}>
                        <span>聊天通知</span>
                        <small>新消息到达时显示通知</small>
                    </label>
                </div>
                
                <div class="setting-group">
                    <h4>界面设置</h4>
                    <label class="setting-item">
                        <span>主题</span>
                        <select id="theme">
                            <option value="dark" ${settings.theme === 'dark' ? 'selected' : ''}>深色主题</option>
                            <option value="light" ${settings.theme === 'light' ? 'selected' : ''}>浅色主题</option>
                        </select>
                    </label>
                    <label class="setting-item">
                        <span>语言</span>
                        <select id="language">
                            <option value="zh-CN" ${settings.language === 'zh-CN' ? 'selected' : ''}>简体中文</option>
                            <option value="en-US" ${settings.language === 'en-US' ? 'selected' : ''}>English</option>
                        </select>
                    </label>
                </div>
                
                <div class="setting-group">
                    <h4>系统设置</h4>
                    <label class="setting-item">
                        <input type="checkbox" id="autoSave" ${settings.autoSave ? 'checked' : ''}>
                        <span>自动保存</span>
                        <small>自动保存用户数据和设置</small>
                    </label>
                </div>
                
                <div class="settings-actions">
                    <button class="btn btn-primary" id="saveSettings">保存设置</button>
                    <button class="btn btn-secondary" id="resetSettings">恢复默认</button>
                </div>
            </div>
        `;

        // 添加样式
        this.addSettingsStyles();
        
        // 绑定事件
        this.bindSettingsEvents(panel, currentUser);
        
        return panel;
    }

    // 绑定设置面板事件
    bindSettingsEvents(panel, username) {
        // 保存设置
        panel.querySelector('#saveSettings').addEventListener('click', () => {
            const newSettings = {
                priceAlertsEnabled: panel.querySelector('#priceAlertsEnabled').checked,
                soundEnabled: panel.querySelector('#soundEnabled').checked,
                theme: panel.querySelector('#theme').value,
                language: panel.querySelector('#language').value,
                autoSave: panel.querySelector('#autoSave').checked,
                notifications: {
                    chat: panel.querySelector('#chatNotifications').checked,
                    system: true,
                    price: panel.querySelector('#priceAlertsEnabled').checked
                }
            };
            
            if (this.saveUserSettings(username, newSettings)) {
                this.showNotification('设置已保存', 'success');
                panel.remove();
            } else {
                this.showNotification('保存失败', 'error');
            }
        });

        // 重置设置
        panel.querySelector('#resetSettings').addEventListener('click', () => {
            if (confirm('确定要恢复默认设置吗？')) {
                if (this.saveUserSettings(username, this.defaultSettings)) {
                    this.showNotification('已恢复默认设置', 'success');
                    panel.remove();
                }
            }
        });

        // 实时预览价格预警设置
        panel.querySelector('#priceAlertsEnabled').addEventListener('change', (e) => {
            const enabled = e.target.checked;
            if (enabled) {
                this.showNotification('价格预警已启用 - 这是一个预览', 'info');
            }
        });
    }

    // 显示通知
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10003;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }

    // 添加设置面板样式
    addSettingsStyles() {
        if (document.getElementById('settings-styles')) return;
        
        const style = document.createElement('style');
        style.id = 'settings-styles';
        style.textContent = `
            .settings-panel {
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(145deg, #1a1a2e, #0f0f1e);
                border: 2px solid #ff6600;
                border-radius: 8px;
                width: 400px;
                max-width: 90vw;
                max-height: 80vh;
                overflow-y: auto;
                z-index: 10002;
                font-family: 'Share Tech Mono', monospace;
                color: #fff;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5);
            }
            
            .settings-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 15px 20px;
                border-bottom: 1px solid #333;
                background: rgba(255, 102, 0, 0.1);
            }
            
            .settings-header h3 {
                margin: 0;
                color: #ff6600;
                font-size: 16px;
            }
            
            .close-btn {
                background: none;
                border: none;
                color: #ff6600;
                font-size: 20px;
                cursor: pointer;
                padding: 0;
                width: 30px;
                height: 30px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.3s;
            }
            
            .close-btn:hover {
                background: rgba(255, 102, 0, 0.2);
            }
            
            .settings-content {
                padding: 20px;
            }
            
            .setting-group {
                margin-bottom: 25px;
            }
            
            .setting-group h4 {
                margin: 0 0 15px 0;
                color: #ff6600;
                font-size: 14px;
                border-bottom: 1px solid #333;
                padding-bottom: 5px;
            }
            
            .setting-item {
                display: flex;
                flex-direction: column;
                margin-bottom: 15px;
                cursor: pointer;
            }
            
            .setting-item input[type="checkbox"] {
                margin-right: 10px;
                align-self: flex-start;
                margin-top: 2px;
            }
            
            .setting-item select {
                background: #2a2a3e;
                border: 1px solid #444;
                color: #fff;
                padding: 5px 10px;
                border-radius: 4px;
                font-family: inherit;
                margin-top: 5px;
            }
            
            .setting-item span {
                font-size: 13px;
                margin-bottom: 3px;
            }
            
            .setting-item small {
                color: #aaa;
                font-size: 11px;
                margin-top: 3px;
            }
            
            .settings-actions {
                display: flex;
                gap: 10px;
                justify-content: flex-end;
                margin-top: 20px;
                padding-top: 20px;
                border-top: 1px solid #333;
            }
            
            .btn {
                padding: 8px 16px;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-family: inherit;
                font-size: 12px;
                transition: all 0.3s;
            }
            
            .btn-primary {
                background: #ff6600;
                color: white;
            }
            
            .btn-primary:hover {
                background: #e55a00;
            }
            
            .btn-secondary {
                background: #444;
                color: white;
            }
            
            .btn-secondary:hover {
                background: #555;
            }
            
            @keyframes slideInRight {
                from {
                    transform: translateX(100%);
                    opacity: 0;
                }
                to {
                    transform: translateX(0);
                    opacity: 1;
                }
            }
        `;
        
        document.head.appendChild(style);
    }

    // 显示设置面板
    showSettings() {
        // 移除现有面板
        const existing = document.querySelector('.settings-panel');
        if (existing) existing.remove();
        
        const panel = this.createSettingsPanel();
        if (panel) {
            document.body.appendChild(panel);
        } else {
            this.showNotification('请先登录后再进行设置', 'error');
        }
    }

    // 检查是否启用价格预警
    isPriceAlertEnabled(username) {
        const settings = this.getUserSettings(username);
        return settings.priceAlertsEnabled === true;
    }

    // 获取当前用户设置
    getCurrentUserSettings() {
        const currentUser = localStorage.getItem('currentUsername');
        return currentUser ? this.getUserSettings(currentUser) : this.defaultSettings;
    }
}

// 创建全局实例
window.userSettingsManager = new UserSettingsManager();

// 添加设置按钮到界面（如果需要）
document.addEventListener('DOMContentLoaded', () => {
    // 可以在这里添加设置按钮到导航栏或其他位置
    
    // 监听用户登录事件
    document.addEventListener('userLoggedIn', (e) => {
        console.log('用户登录，加载设置:', e.detail.username);
    });
    
    // 监听设置更新事件
    document.addEventListener('userSettingsUpdated', (e) => {
        console.log('用户设置已更新:', e.detail);
        
        // 如果价格预警设置改变，通知实时数据系统
        if (window.realtimeDataSystem) {
            // 触发价格预警检查更新
        }
    });
});

console.log('⚙️ 用户设置管理器已加载'); 