// 优化版性能监控系统
class OptimizedPerformanceMonitor {
    constructor() {
        this.metrics = {
            fps: 0,
            loadTime: 0,
            memoryUsage: null,
            errors: 0,
            apiCalls: 0
        };
        
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsCalculationInterval = null;
        this.observers = [];
        this.isMonitoring = false;
        
        // 节流控制
        this.lastFPSLog = 0;
        this.fpsLogInterval = 5000; // 每5秒最多记录一次FPS警告
    }

    // 初始化（延迟启动以避免影响页面加载）
    init() {
        // 等待页面完全加载后再启动监控
        if (document.readyState === 'complete') {
            this.delayedStart();
        } else {
            window.addEventListener('load', () => {
                setTimeout(() => this.delayedStart(), 1000); // 延迟1秒启动
            });
        }
        
        console.log('📊 优化版性能监控系统已初始化');
    }

    // 延迟启动监控
    delayedStart() {
        this.measureLoadTime();
        this.startOptimizedFPSMonitoring();
        this.startMemoryMonitoring();
        this.setupPerformanceObserver();
        this.bindEvents();
        
        this.isMonitoring = true;
        console.log('📊 性能监控已启动');
    }

    // 优化的页面加载时间测量
    measureLoadTime() {
        try {
            // 使用 PerformanceNavigationTiming API (更精确)
            if (performance.getEntriesByType) {
                const navigation = performance.getEntriesByType('navigation')[0];
                if (navigation) {
                    const loadTime = navigation.loadEventEnd - navigation.navigationStart;
                    
                    // 验证数据的合理性
                    if (loadTime > 0 && loadTime < 60000) { // 0-60秒范围内认为合理
                        this.metrics.loadTime = Math.round(loadTime);
                        console.log(`⏱️ 页面加载时间: ${this.metrics.loadTime}ms`);
                    } else {
                        console.warn('⚠️ 页面加载时间数据异常，跳过记录');
                    }
                    return;
                }
            }
            
            // 降级到传统API
            if (performance.timing && performance.timing.loadEventEnd > 0) {
                const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
                if (loadTime > 0 && loadTime < 60000) {
                    this.metrics.loadTime = Math.round(loadTime);
                    console.log(`⏱️ 页面加载时间: ${this.metrics.loadTime}ms`);
                }
            }
        } catch (error) {
            console.warn('⚠️ 无法测量页面加载时间:', error);
        }
    }

    // 优化的FPS监控（减少性能影响）
    startOptimizedFPSMonitoring() {
        let frames = 0;
        let startTime = performance.now();
        
        const countFrame = () => {
            frames++;
            const currentTime = performance.now();
            const elapsed = currentTime - startTime;
            
            // 每2秒计算一次FPS（而不是每秒）
            if (elapsed >= 2000) {
                const fps = Math.round((frames * 1000) / elapsed);
                this.metrics.fps = fps;
                
                // 节流FPS警告日志
                if (fps < 30 && fps > 0) {
                    const now = Date.now();
                    if (now - this.lastFPSLog > this.fpsLogInterval) {
                        console.warn(`⚠️ FPS较低: ${fps} (建议值: ≥30)`);
                        this.notifyObservers('fpsWarning', fps);
                        this.lastFPSLog = now;
                    }
                }
                
                // 重置计数器
                frames = 0;
                startTime = currentTime;
            }
            
            // 只在监控活跃时继续
            if (this.isMonitoring) {
                requestAnimationFrame(countFrame);
            }
        };
        
        // 使用 requestIdleCallback 在浏览器空闲时启动（如果支持）
        if (window.requestIdleCallback) {
            requestIdleCallback(() => {
                requestAnimationFrame(countFrame);
            });
        } else {
            requestAnimationFrame(countFrame);
        }
    }

    // 优化的内存监控
    startMemoryMonitoring() {
        if (!performance.memory) {
            console.log('💾 浏览器不支持内存监控');
            return;
        }

        const updateMemory = () => {
            try {
                const memory = performance.memory;
                this.metrics.memoryUsage = {
                    used: Math.round(memory.usedJSHeapSize / 1048576), // MB
                    total: Math.round(memory.totalJSHeapSize / 1048576), // MB
                    limit: Math.round(memory.jsHeapSizeLimit / 1048576) // MB
                };
                
                const usagePercent = (this.metrics.memoryUsage.used / this.metrics.memoryUsage.limit) * 100;
                
                // 只在内存使用率过高时警告
                if (usagePercent > 85) {
                    console.warn(`⚠️ 内存使用率较高: ${usagePercent.toFixed(1)}% (${this.metrics.memoryUsage.used}MB)`);
                    this.notifyObservers('memoryWarning', this.metrics.memoryUsage);
                }
            } catch (error) {
                console.warn('⚠️ 内存监控错误:', error);
            }
        };
        
        // 立即检查一次，然后每10秒检查一次（降低频率）
        updateMemory();
        setInterval(updateMemory, 10000);
    }

    // 轻量级性能观察器
    setupPerformanceObserver() {
        if (!window.PerformanceObserver) {
            console.log('📊 浏览器不支持 PerformanceObserver');
            return;
        }

        try {
            // 只观察重要的性能指标
            const observer = new PerformanceObserver((list) => {
                const entries = list.getEntries();
                entries.forEach(entry => {
                    switch (entry.entryType) {
                        case 'paint':
                            this.handlePaintTiming(entry);
                            break;
                        case 'largest-contentful-paint':
                            this.handleLCPTiming(entry);
                            break;
                        case 'navigation':
                            this.handleNavigationTiming(entry);
                            break;
                        // 移除resource监控以减少性能影响
                    }
                });
            });
            
            observer.observe({
                entryTypes: ['paint', 'largest-contentful-paint', 'navigation']
            });
            
            this.perfObserver = observer;
        } catch (error) {
            console.warn('⚠️ 无法启动性能观察器:', error);
        }
    }

    // 处理关键绘制时间
    handlePaintTiming(entry) {
        const time = Math.round(entry.startTime);
        console.log(`🎨 ${entry.name}: ${time}ms`);
        
        // 只对异常慢的绘制发出警告
        if (time > 3000) {
            console.warn(`⚠️ ${entry.name} 时间过长: ${time}ms`);
        }
    }

    // 处理最大内容绘制
    handleLCPTiming(entry) {
        const lcp = Math.round(entry.startTime);
        console.log(`📏 最大内容绘制 (LCP): ${lcp}ms`);
        
        if (lcp > 2500) {
            console.warn('⚠️ LCP时间过长，可能影响用户体验');
            this.notifyObservers('lcpWarning', lcp);
        }
    }

    // 处理导航时间
    handleNavigationTiming(entry) {
        const metrics = {
            domContentLoaded: Math.round(entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart),
            loadComplete: Math.round(entry.loadEventEnd - entry.loadEventStart),
            domInteractive: Math.round(entry.domInteractive - entry.fetchStart)
        };
        
        console.log('🔄 导航性能:', metrics);
        
        // 检查是否有异常值
        if (metrics.domInteractive > 3000) {
            console.warn('⚠️ DOM 交互时间过长');
        }
    }

    // 获取性能建议
    getOptimizationSuggestions() {
        const suggestions = [];
        
        if (this.metrics.loadTime > 3000) {
            suggestions.push({
                type: 'loading',
                message: '⚡ 页面加载时间较长，建议优化资源加载',
                priority: 'high'
            });
        }
        
        if (this.metrics.fps < 30 && this.metrics.fps > 0) {
            suggestions.push({
                type: 'performance',
                message: '🎮 帧率较低，建议减少动画或DOM操作',
                priority: 'medium'
            });
        }
        
        if (this.metrics.memoryUsage && this.metrics.memoryUsage.used > 100) {
            suggestions.push({
                type: 'memory',
                message: '🧹 内存使用较高，建议清理未使用的对象',
                priority: 'medium'
            });
        }
        
        return suggestions;
    }

    // 获取简化的性能报告
    getPerformanceReport() {
        return {
            fps: this.metrics.fps,
            loadTime: this.metrics.loadTime,
            memoryUsage: this.metrics.memoryUsage,
            timestamp: Date.now(),
            suggestions: this.getOptimizationSuggestions()
        };
    }

    // 停止监控
    stop() {
        this.isMonitoring = false;
        
        if (this.perfObserver) {
            this.perfObserver.disconnect();
        }
        
        console.log('📊 性能监控已停止');
    }

    // 观察者模式
    addObserver(callback) {
        this.observers.push(callback);
    }

    removeObserver(callback) {
        this.observers = this.observers.filter(obs => obs !== callback);
    }

    notifyObservers(event, data) {
        this.observers.forEach(callback => {
            try {
                callback(event, data);
            } catch (error) {
                console.warn('⚠️ 观察者回调错误:', error);
            }
        });
    }

    // 轻量级事件绑定
    bindEvents() {
        // 只绑定关键错误监听
        window.addEventListener('error', (event) => {
            this.metrics.errors++;
            console.error('❌ JavaScript错误:', event.error?.message || 'Unknown error');
        });

        window.addEventListener('unhandledrejection', (event) => {
            this.metrics.errors++;
            console.error('❌ 未处理的Promise拒绝:', event.reason);
        });
    }

    // 手动触发性能检查
    checkPerformanceNow() {
        const report = this.getPerformanceReport();
        console.log('📊 当前性能状态:', report);
        return report;
    }
}

// 全局实例
window.optimizedPerformanceMonitor = new OptimizedPerformanceMonitor(); 