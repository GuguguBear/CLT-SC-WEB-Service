// 全局加载状态管理器
class LoadingManager {
    constructor() {
        this.loadingCount = 0;
        this.overlay = null;
        this.init();
    }

    init() {
        this.createLoadingOverlay();
        console.log('⏳ 加载管理器已初始化');
    }

    createLoadingOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'loading-overlay';
        this.overlay.innerHTML = `
            <div class="loading-container">
                <div class="loading-spinner">
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                    <div class="spinner-ring"></div>
                </div>
                <div class="loading-text">加载中...</div>
                <div class="loading-subtext">Drake Systems 正在启动</div>
            </div>
        `;

        // 添加样式
        const style = document.createElement('style');
        style.textContent = `
            .loading-overlay {
                position: fixed;
                top: 0;
                left: 0;
                width: 100vw;
                height: 100vh;
                background: rgba(0, 0, 0, 0.95);
                backdrop-filter: blur(10px);
                display: none;
                justify-content: center;
                align-items: center;
                z-index: 10000;
                font-family: 'Share Tech Mono', monospace;
            }

            .loading-container {
                text-align: center;
                color: #ff6600;
            }

            .loading-spinner {
                position: relative;
                width: 80px;
                height: 80px;
                margin: 0 auto 20px;
            }

            .spinner-ring {
                position: absolute;
                width: 100%;
                height: 100%;
                border: 4px solid transparent;
                border-top: 4px solid #ff6600;
                border-radius: 50%;
                animation: spin 1.5s linear infinite;
            }

            .spinner-ring:nth-child(2) {
                width: 60px;
                height: 60px;
                top: 10px;
                left: 10px;
                border-top-color: #ff8800;
                animation-duration: 1.2s;
                animation-direction: reverse;
            }

            .spinner-ring:nth-child(3) {
                width: 40px;
                height: 40px;
                top: 20px;
                left: 20px;
                border-top-color: #ffaa00;
                animation-duration: 0.9s;
            }

            @keyframes spin {
                0% { transform: rotate(0deg); }
                100% { transform: rotate(360deg); }
            }

            .loading-text {
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 8px;
                text-shadow: 0 0 10px rgba(255, 102, 0, 0.6);
            }

            .loading-subtext {
                font-size: 12px;
                color: #cc5500;
                opacity: 0.8;
                letter-spacing: 0.1em;
            }

            /* 响应式设计 */
            @media (max-width: 768px) {
                .loading-spinner {
                    width: 60px;
                    height: 60px;
                }

                .spinner-ring:nth-child(2) {
                    width: 45px;
                    height: 45px;
                    top: 7.5px;
                    left: 7.5px;
                }

                .spinner-ring:nth-child(3) {
                    width: 30px;
                    height: 30px;
                    top: 15px;
                    left: 15px;
                }

                .loading-text {
                    font-size: 16px;
                }

                .loading-subtext {
                    font-size: 11px;
                }
            }
        `;

        document.head.appendChild(style);
        document.body.appendChild(this.overlay);
    }

    show(message = '加载中...', subtext = 'Drake Systems 正在启动') {
        this.loadingCount++;
        
        if (this.overlay) {
            const textEl = this.overlay.querySelector('.loading-text');
            const subtextEl = this.overlay.querySelector('.loading-subtext');
            
            if (textEl) textEl.textContent = message;
            if (subtextEl) subtextEl.textContent = subtext;
            
            this.overlay.style.display = 'flex';
            
            // 添加淡入动画
            setTimeout(() => {
                this.overlay.style.opacity = '1';
            }, 10);
        }

        console.log(`⏳ 显示加载状态: ${message}`);
    }

    hide() {
        this.loadingCount = Math.max(0, this.loadingCount - 1);
        
        if (this.loadingCount === 0 && this.overlay) {
            this.overlay.style.opacity = '0';
            setTimeout(() => {
                if (this.loadingCount === 0) {
                    this.overlay.style.display = 'none';
                }
            }, 300);
        }

        console.log('✅ 隐藏加载状态');
    }

    forceHide() {
        this.loadingCount = 0;
        if (this.overlay) {
            this.overlay.style.display = 'none';
        }
    }

    // 异步操作包装器
    async wrap(promise, message = '处理中...', subtext = '请稍候') {
        this.show(message, subtext);
        try {
            const result = await promise;
            this.hide();
            return result;
        } catch (error) {
            this.hide();
            throw error;
        }
    }

    // 模拟延迟（用于测试）
    async simulateLoading(duration = 2000, message = '模拟加载...') {
        this.show(message);
        await new Promise(resolve => setTimeout(resolve, duration));
        this.hide();
    }
}

// 创建全局实例
window.loadingManager = new LoadingManager();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LoadingManager;
} 