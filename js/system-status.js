// 系统状态监控 - Star Citizen 贸易终端
class SystemStatus {
    constructor() {
        this.isVisible = false;
        this.updateInterval = 2000;
        this.intervalId = null;
        
        this.init();
    }

    init() {
        this.createStatusPanel();
        this.bindEvents();
        this.startStatusUpdates();
        
        console.log('📟 系统状态监控已初始化');
    }

    // 创建状态面板
    createStatusPanel() {
        const panel = document.createElement('div');
        panel.id = 'systemStatusPanel';
        panel.className = 'system-status-panel';
        panel.innerHTML = `
            <div class="status-header">
                <div class="status-title">
                    <span class="status-icon">📟</span>
                    SYSTEM STATUS
                </div>
                <div class="status-controls">
                    <button class="status-btn" onclick="window.systemStatus.hide()">✕</button>
                </div>
            </div>
            <div class="status-content">
                <div class="status-grid">
                    <div class="status-section">
                        <h3>系统模块</h3>
                        <div id="moduleStatus"></div>
                    </div>
                </div>
            </div>
        `;

        this.stylePanel(panel);
        document.body.appendChild(panel);
    }

    // 样式化面板
    stylePanel(panel) {
        panel.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 600px;
            height: 400px;
            background: rgba(26, 35, 60, 0.95);
            border: 2px solid #ff6600;
            border-radius: 12px;
            z-index: 10000;
            display: none;
            color: #ffffff;
            font-family: 'Orbitron', monospace;
        `;
    }

    // 显示面板
    show() {
        const panel = document.getElementById('systemStatusPanel');
        if (panel) {
            panel.style.display = 'block';
            this.isVisible = true;
            this.updateStatus();
        }
    }

    // 隐藏面板
    hide() {
        const panel = document.getElementById('systemStatusPanel');
        if (panel) {
            panel.style.display = 'none';
            this.isVisible = false;
        }
    }

    // 更新状态
    updateStatus() {
        const container = document.getElementById('moduleStatus');
        if (!container) return;

        const modules = [
            { name: '认证系统', instance: window.authSystem },
            { name: '交易系统', instance: window.tradingSystem },
            { name: '声音系统', instance: window.soundSystem },
            { name: '高级分析', instance: window.advancedAnalytics },
            { name: '数据管理', instance: window.dataManager },
            { name: '性能监控', instance: window.performanceMonitor }
        ];

        container.innerHTML = modules.map(module => {
            const status = module.instance ? '✅' : '❌';
            return `<div>${module.name}: ${status}</div>`;
        }).join('');
    }

    // 开始状态更新
    startStatusUpdates() {
        this.intervalId = setInterval(() => {
            if (this.isVisible) {
                this.updateStatus();
            }
        }, this.updateInterval);
    }

    // 绑定事件
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                if (this.isVisible) {
                    this.hide();
                } else {
                    this.show();
                }
            }
        });
    }
}

// 全局实例
window.systemStatus = new SystemStatus();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SystemStatus;
} 