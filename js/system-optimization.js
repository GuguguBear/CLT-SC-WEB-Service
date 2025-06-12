// Star Citizen 系统优化和冲突解决
class SystemOptimization {
    constructor() {
        this.optimizations = [];
        this.conflicts = [];
        this.performanceMetrics = {};
        
        this.init();
    }

    async init() {
        console.log('🔧 系统优化模块启动...');
        
        // 检查和解决冲突
        await this.resolveConflicts();
        
        // 性能优化
        await this.performanceOptimizations();
        
        // 内存清理
        this.setupMemoryCleanup();
        
        // 错误监控
        this.setupErrorMonitoring();
        
        console.log('✅ 系统优化完成');
    }

    // 解决系统冲突
    async resolveConflicts() {
        console.log('🔍 检查系统冲突...');
        
        // 1. 聊天系统冲突解决
        this.resolveChatSystemConflicts();
        
        // 2. 重复脚本检查
        this.checkDuplicateScripts();
        
        // 3. 全局变量冲突
        this.resolveGlobalVariableConflicts();
        
        // 4. 事件监听器优化
        this.optimizeEventListeners();
    }

    // 聊天系统冲突解决
    resolveChatSystemConflicts() {
        const chatSystems = [
            'socketChatSystem',
            'realtimeChatSystem', 
            'enhancedChatSystem',
            'cloudChatSystem'
        ];
        
        // 确保只有一个主要聊天系统
        if (window.socketChatSystem && window.socketChatSystem._isPrimary) {
            // 清理其他聊天系统
            chatSystems.forEach(system => {
                if (system !== 'socketChatSystem' && window[system]) {
                    console.log(`🧹 清理冲突的聊天系统: ${system}`);
                    if (window[system].disconnect) {
                        window[system].disconnect();
                    }
                    delete window[system];
                }
            });
            
            // 确保chatSystem指向正确的实例
            window.chatSystem = window.socketChatSystem;
            console.log('✅ 聊天系统冲突已解决，使用Socket.io聊天系统');
        }
    }

    // 检查重复脚本
    checkDuplicateScripts() {
        const scripts = document.querySelectorAll('script[src]');
        const scriptMap = new Map();
        const duplicates = [];

        scripts.forEach(script => {
            const src = script.src;
            if (scriptMap.has(src)) {
                duplicates.push(src);
            } else {
                scriptMap.set(src, script);
            }
        });

        if (duplicates.length > 0) {
            console.warn('⚠️ 发现重复脚本:', duplicates);
            this.conflicts.push({
                type: 'duplicate_scripts',
                items: duplicates
            });
        }
    }

    // 全局变量冲突解决
    resolveGlobalVariableConflicts() {
        const protectedGlobals = [
            'chatSystem',
            'soundSystem', 
            'loadingManager',
            'auth',
            'tradingSystem'
        ];

        protectedGlobals.forEach(globalVar => {
            if (window[globalVar] && typeof window[globalVar] === 'object') {
                // 冻结关键全局变量防止意外覆盖
                Object.freeze(window[globalVar]);
            }
        });
    }

    // 优化事件监听器
    optimizeEventListeners() {
        // 移除重复的事件监听器
        const elements = document.querySelectorAll('[onclick], [onkeypress]');
        elements.forEach(element => {
            if (element.onclick && element.addEventListener) {
                // 检查是否有重复绑定
                const currentHandler = element.onclick;
                element.onclick = null;
                element.addEventListener('click', currentHandler, { once: false, passive: true });
            }
        });
    }

    // 性能优化
    async performanceOptimizations() {
        console.log('⚡ 执行性能优化...');
        
        // 1. 图片懒加载
        this.setupLazyLoading();
        
        // 2. DOM操作优化
        this.optimizeDOMOperations();
        
        // 3. 缓存优化
        this.setupCaching();
        
        // 4. 节流和防抖
        this.setupThrottleAndDebounce();
        
        // 5. 移动端优化
        this.mobileOptimizations();
    }

    // 图片懒加载
    setupLazyLoading() {
        if ('IntersectionObserver' in window) {
            const imageObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        const img = entry.target;
                        if (img.dataset.src) {
                            img.src = img.dataset.src;
                            imageObserver.unobserve(img);
                        }
                    }
                });
            });

            document.querySelectorAll('img[data-src]').forEach(img => {
                imageObserver.observe(img);
            });
        }
    }

    // DOM操作优化
    optimizeDOMOperations() {
        // 批量DOM更新
        window.batchDOMUpdate = (updateFn) => {
            return new Promise(resolve => {
                requestAnimationFrame(() => {
                    updateFn();
                    resolve();
                });
            });
        };

        // 虚拟滚动优化大列表
        this.setupVirtualScrolling();
    }

    // 虚拟滚动
    setupVirtualScrolling() {
        const chatMessages = document.getElementById('chatMessages');
        if (chatMessages) {
            let lastScrollTop = 0;
            let ticking = false;

            const optimizedScroll = () => {
                if (!ticking) {
                    requestAnimationFrame(() => {
                        const scrollTop = chatMessages.scrollTop;
                        const scrollHeight = chatMessages.scrollHeight;
                        const clientHeight = chatMessages.clientHeight;

                        // 自动清理过多的消息元素
                        const messages = chatMessages.children;
                        if (messages.length > 100) {
                            for (let i = 0; i < 20; i++) {
                                if (messages[i]) {
                                    messages[i].remove();
                                }
                            }
                        }

                        lastScrollTop = scrollTop;
                        ticking = false;
                    });
                }
                ticking = true;
            };

            chatMessages.addEventListener('scroll', optimizedScroll, { passive: true });
        }
    }

    // 缓存优化
    setupCaching() {
        // Service Worker缓存
        if ('serviceWorker' in navigator) {
            navigator.serviceWorker.register('sw.js').catch(err => {
                console.log('Service Worker registration failed:', err);
            });
        }

        // 本地存储优化
        this.optimizeLocalStorage();
    }

    // 本地存储优化
    optimizeLocalStorage() {
        const STORAGE_QUOTA = 5 * 1024 * 1024; // 5MB

        window.optimizedStorage = {
            set: (key, value) => {
                try {
                    const serialized = JSON.stringify(value);
                    if (serialized.length > STORAGE_QUOTA) {
                        console.warn('数据太大，无法存储:', key);
                        return false;
                    }
                    localStorage.setItem(key, serialized);
                    return true;
                } catch (e) {
                    console.error('存储失败:', e);
                    this.cleanupStorage();
                    return false;
                }
            },

            get: (key) => {
                try {
                    const item = localStorage.getItem(key);
                    return item ? JSON.parse(item) : null;
                } catch (e) {
                    console.error('读取失败:', e);
                    return null;
                }
            }
        };
    }

    // 存储清理
    cleanupStorage() {
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith('temp_') || key.includes('cache_')) {
                localStorage.removeItem(key);
            }
        });
    }

    // 节流和防抖
    setupThrottleAndDebounce() {
        // 节流函数
        window.throttle = (func, limit) => {
            let inThrottle;
            return function() {
                const args = arguments;
                const context = this;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(() => inThrottle = false, limit);
                }
            }
        };

        // 防抖函数
        window.debounce = (func, delay) => {
            let timeoutId;
            return function() {
                const args = arguments;
                const context = this;
                clearTimeout(timeoutId);
                timeoutId = setTimeout(() => func.apply(context, args), delay);
            }
        };
    }

    // 移动端优化
    mobileOptimizations() {
        if (/Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
            // 禁用不必要的动画
            document.body.classList.add('mobile-device');
            
            // 优化触摸事件
            this.optimizeTouchEvents();
            
            // 减少重绘
            this.reduceRepaints();
            
            // 内存管理
            this.mobileMemoryManagement();
        }
    }

    // 优化触摸事件
    optimizeTouchEvents() {
        // 防止滚动弹性
        document.addEventListener('touchmove', (e) => {
            if (e.target.closest('.chat-messages') || e.target.closest('.routes-list')) {
                return; // 允许聊天和列表滚动
            }
            e.preventDefault();
        }, { passive: false });

        // 快速点击优化
        document.addEventListener('touchstart', () => {}, { passive: true });
    }

    // 减少重绘
    reduceRepaints() {
        // 合并样式修改
        window.batchStyleUpdate = (element, styles) => {
            Object.assign(element.style, styles);
        };
    }

    // 移动端内存管理
    mobileMemoryManagement() {
        // 监听内存压力
        if ('memory' in performance) {
            setInterval(() => {
                const memory = performance.memory;
                if (memory.usedJSHeapSize > memory.jsHeapSizeLimit * 0.8) {
                    console.warn('内存使用率过高，执行清理...');
                    this.forceGarbageCollection();
                }
            }, 30000);
        }
    }

    // 强制垃圾回收
    forceGarbageCollection() {
        // 清理缓存
        this.cleanupStorage();
        
        // 清理事件监听器
        this.cleanupEventListeners();
        
        // 清理DOM引用
        this.cleanupDOMReferences();
    }

    // 清理事件监听器
    cleanupEventListeners() {
        // 移除过期的事件监听器
        if (window._eventListeners) {
            window._eventListeners.forEach(listener => {
                if (listener.cleanup) {
                    listener.cleanup();
                }
            });
            window._eventListeners = [];
        }
    }

    // 清理DOM引用
    cleanupDOMReferences() {
        // 清理不再使用的DOM引用
        Object.keys(window).forEach(key => {
            if (key.includes('Element') && window[key] && !document.contains(window[key])) {
                delete window[key];
            }
        });
    }

    // 内存清理
    setupMemoryCleanup() {
        // 定期清理
        setInterval(() => {
            this.performMemoryCleanup();
        }, 5 * 60 * 1000); // 每5分钟

        // 页面隐藏时清理
        document.addEventListener('visibilitychange', () => {
            if (document.hidden) {
                this.performMemoryCleanup();
            }
        });
    }

    // 执行内存清理
    performMemoryCleanup() {
        // 清理临时数据
        this.cleanupTemporaryData();
        
        // 压缩图片缓存
        this.compressImageCache();
        
        // 清理日志
        this.cleanupLogs();
    }

    // 清理临时数据
    cleanupTemporaryData() {
        // 清理超过1小时的临时数据
        const now = Date.now();
        Object.keys(sessionStorage).forEach(key => {
            if (key.startsWith('temp_')) {
                try {
                    const data = JSON.parse(sessionStorage.getItem(key));
                    if (data.timestamp && now - data.timestamp > 3600000) {
                        sessionStorage.removeItem(key);
                    }
                } catch (e) {
                    sessionStorage.removeItem(key);
                }
            }
        });
    }

    // 压缩图片缓存
    compressImageCache() {
        // 清理不再使用的图片缓存
        if ('caches' in window) {
            caches.keys().then(cacheNames => {
                cacheNames.forEach(cacheName => {
                    if (cacheName.includes('images') && cacheName !== 'images-v1') {
                        caches.delete(cacheName);
                    }
                });
            });
        }
    }

    // 清理日志
    cleanupLogs() {
        // 限制控制台日志数量
        if (console.clear && typeof console.clear === 'function') {
            const logCount = window._logCount || 0;
            if (logCount > 1000) {
                console.clear();
                window._logCount = 0;
            }
        }
    }

    // 错误监控
    setupErrorMonitoring() {
        // 全局错误处理
        window.addEventListener('error', (e) => {
            this.handleGlobalError(e);
        });

        // Promise错误处理
        window.addEventListener('unhandledrejection', (e) => {
            this.handlePromiseRejection(e);
        });

        // 性能监控
        this.setupPerformanceMonitoring();
    }

    // 处理全局错误
    handleGlobalError(error) {
        console.error('全局错误:', error);
        
        // 记录错误
        this.logError({
            type: 'global_error',
            message: error.message,
            filename: error.filename,
            lineno: error.lineno,
            colno: error.colno,
            timestamp: Date.now()
        });

        // 尝试恢复
        this.attemptRecovery(error);
    }

    // 处理Promise拒绝
    handlePromiseRejection(rejection) {
        console.error('未处理的Promise拒绝:', rejection.reason);
        
        this.logError({
            type: 'promise_rejection',
            reason: rejection.reason,
            timestamp: Date.now()
        });
    }

    // 性能监控
    setupPerformanceMonitoring() {
        // 监控FPS
        if (window.requestAnimationFrame) {
            let lastTime = performance.now();
            let frames = 0;

            const measureFPS = (currentTime) => {
                frames++;
                if (currentTime >= lastTime + 1000) {
                    this.performanceMetrics.fps = Math.round((frames * 1000) / (currentTime - lastTime));
                    frames = 0;
                    lastTime = currentTime;

                    // 如果FPS过低，触发优化
                    if (this.performanceMetrics.fps < 30) {
                        this.triggerPerformanceOptimization();
                    }
                }
                requestAnimationFrame(measureFPS);
            };

            requestAnimationFrame(measureFPS);
        }
    }

    // 触发性能优化
    triggerPerformanceOptimization() {
        console.warn('检测到性能问题，触发优化...');
        
        // 减少动画
        document.body.classList.add('reduced-motion');
        
        // 清理内存
        this.performMemoryCleanup();
        
        // 暂停非关键功能
        this.pauseNonCriticalFeatures();
    }

    // 暂停非关键功能
    pauseNonCriticalFeatures() {
        // 暂停分析（添加安全检查）
        if (window.analyticsUI && typeof window.analyticsUI.pause === 'function') {
            window.analyticsUI.pause();
        } else if (window.analyticsUI && typeof window.analyticsUI.pauseUpdates === 'function') {
            window.analyticsUI.pauseUpdates();
        }
        
        // 减少更新频率
        if (window.realtimeData && typeof window.realtimeData.setUpdateInterval === 'function') {
            window.realtimeData.setUpdateInterval(5000);
        }
        
        // 暂停性能监控
        if (window.performanceMonitor && typeof window.performanceMonitor.pause === 'function') {
            window.performanceMonitor.pause();
        }
        
        // 暂停教程系统
        if (window.tutorialSystem && typeof window.tutorialSystem.pause === 'function') {
            window.tutorialSystem.pause();
        }
    }

    // 记录错误
    logError(error) {
        try {
            const errors = JSON.parse(localStorage.getItem('system_errors') || '[]');
            errors.push(error);
            
            // 只保留最近的50个错误
            if (errors.length > 50) {
                errors.splice(0, errors.length - 50);
            }
            
            localStorage.setItem('system_errors', JSON.stringify(errors));
        } catch (e) {
            console.error('无法记录错误:', e);
        }
    }

    // 尝试恢复
    attemptRecovery(error) {
        // 根据错误类型尝试不同的恢复策略
        if (error.message.includes('chatSystem')) {
            this.recoverChatSystem();
        } else if (error.message.includes('Socket')) {
            this.recoverSocketConnection();
        }
    }

    // 恢复聊天系统
    recoverChatSystem() {
        console.log('尝试恢复聊天系统...');
        if (window.socketChatSystem && window.socketChatSystem.reconnect) {
            window.socketChatSystem.reconnect();
        }
    }

    // 恢复Socket连接
    recoverSocketConnection() {
        console.log('尝试恢复Socket连接...');
        if (window.chatSystem && window.chatSystem.handleReconnect) {
            window.chatSystem.handleReconnect();
        }
    }

    // 获取系统状态
    getSystemStatus() {
        return {
            optimizations: this.optimizations,
            conflicts: this.conflicts,
            performanceMetrics: this.performanceMetrics,
            memoryUsage: performance.memory || null,
            timestamp: Date.now()
        };
    }
}

// 创建全局实例
window.systemOptimization = new SystemOptimization();

console.log('🔧 系统优化模块已加载'); 