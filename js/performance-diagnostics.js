// 性能诊断工具
class PerformanceDiagnostics {
    constructor() {
        this.diagnostics = [];
        this.startTime = performance.now();
    }

    // 运行完整的性能诊断
    async runDiagnostics() {
        console.log('🔍 开始性能诊断...');
        this.diagnostics = [];

        // 基础性能检查
        await this.checkBasicPerformance();
        
        // 资源加载检查
        await this.checkResourceLoading();
        
        // JavaScript执行检查
        await this.checkJavaScriptPerformance();
        
        // 内存使用检查
        await this.checkMemoryUsage();
        
        // DOM复杂度检查
        await this.checkDOMComplexity();
        
        // 生成报告
        this.generateReport();
        
        return this.diagnostics;
    }

    // 基础性能检查
    async checkBasicPerformance() {
        console.log('📊 检查基础性能...');
        
        // 检查FPS
        const fps = await this.measureFPS();
        if (fps < 30) {
            this.addDiagnostic('warning', 'FPS过低', `当前FPS: ${fps}，建议值: ≥30`, {
                suggestions: [
                    '减少页面动画效果',
                    '优化CSS动画性能',
                    '降低DOM操作频率'
                ]
            });
        } else if (fps < 50) {
            this.addDiagnostic('info', 'FPS偏低', `当前FPS: ${fps}，建议值: ≥50`);
        }

        // 检查页面加载时间
        if (performance.timing && performance.timing.loadEventEnd > 0) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            if (loadTime > 5000) {
                this.addDiagnostic('error', '页面加载过慢', `加载时间: ${loadTime}ms`, {
                    suggestions: [
                        '压缩JavaScript和CSS文件',
                        '优化图片资源',
                        '使用CDN加速'
                    ]
                });
            } else if (loadTime > 3000) {
                this.addDiagnostic('warning', '页面加载较慢', `加载时间: ${loadTime}ms`);
            }
        }
    }

    // 资源加载检查
    async checkResourceLoading() {
        console.log('📦 检查资源加载...');
        
        if (!performance.getEntriesByType) return;
        
        const resources = performance.getEntriesByType('resource');
        let slowResources = 0;
        let totalSize = 0;
        
        resources.forEach(resource => {
            const loadTime = resource.responseEnd - resource.startTime;
            if (loadTime > 2000) {
                slowResources++;
                this.addDiagnostic('warning', '慢资源', `${resource.name} 加载时间: ${Math.round(loadTime)}ms`);
            }
            
            if (resource.transferSize) {
                totalSize += resource.transferSize;
            }
        });

        if (slowResources > 5) {
            this.addDiagnostic('error', '多个慢资源', `${slowResources} 个资源加载缓慢`);
        }

        // 检查总资源大小
        if (totalSize > 5 * 1024 * 1024) { // 5MB
            this.addDiagnostic('warning', '资源文件过大', `总大小: ${Math.round(totalSize / 1024 / 1024)}MB`);
        }
    }

    // JavaScript执行性能检查  
    async checkJavaScriptPerformance() {
        console.log('⚡ 检查JavaScript性能...');
        
        // 检查长任务
        if (window.PerformanceObserver) {
            try {
                const longTasks = performance.getEntriesByType('longtask');
                if (longTasks.length > 0) {
                    this.addDiagnostic('warning', '检测到长任务', `${longTasks.length} 个阻塞任务`, {
                        suggestions: [
                            '将大任务分解为小任务',
                            '使用 Web Workers 处理重计算',
                            '添加 setTimeout 让出主线程'
                        ]
                    });
                }
            } catch (error) {
                console.warn('无法检查长任务:', error);
            }
        }

        // 检查定时器数量
        const intervalCount = this.countActiveIntervals();
        if (intervalCount > 10) {
            this.addDiagnostic('warning', '定时器过多', `活跃定时器: ${intervalCount} 个`);
        }
    }

    // 内存使用检查
    async checkMemoryUsage() {
        console.log('💾 检查内存使用...');
        
        if (!performance.memory) {
            this.addDiagnostic('info', '内存监控不可用', '浏览器不支持内存监控');
            return;
        }

        const memory = performance.memory;
        const usedMB = Math.round(memory.usedJSHeapSize / 1048576);
        const totalMB = Math.round(memory.totalJSHeapSize / 1048576);
        const limitMB = Math.round(memory.jsHeapSizeLimit / 1048576);
        
        const usagePercent = (usedMB / limitMB) * 100;
        
        if (usagePercent > 90) {
            this.addDiagnostic('error', '内存使用过高', `${usagePercent.toFixed(1)}% (${usedMB}MB)`, {
                suggestions: [
                    '清理未使用的变量和对象',
                    '检查内存泄漏',
                    '优化数据结构'
                ]
            });
        } else if (usagePercent > 70) {
            this.addDiagnostic('warning', '内存使用较高', `${usagePercent.toFixed(1)}% (${usedMB}MB)`);
        }
    }

    // DOM复杂度检查
    async checkDOMComplexity() {
        console.log('🏗️ 检查DOM复杂度...');
        
        const nodeCount = document.getElementsByTagName('*').length;
        const maxDepth = this.calculateDOMDepth();
        
        if (nodeCount > 3000) {
            this.addDiagnostic('warning', 'DOM节点过多', `节点数量: ${nodeCount}`, {
                suggestions: [
                    '使用虚拟滚动减少DOM节点',
                    '延迟加载非关键内容',
                    '优化组件结构'
                ]
            });
        }
        
        if (maxDepth > 15) {
            this.addDiagnostic('warning', 'DOM层级过深', `最大深度: ${maxDepth}`);
        }

        // 检查隐藏元素
        const hiddenElements = document.querySelectorAll('[style*="display: none"], .hidden').length;
        if (hiddenElements > 100) {
            this.addDiagnostic('info', '大量隐藏元素', `隐藏元素: ${hiddenElements} 个`);
        }
    }

    // 测量FPS
    measureFPS() {
        return new Promise(resolve => {
            let frames = 0;
            const startTime = performance.now();
            
            const countFrame = () => {
                frames++;
                const elapsed = performance.now() - startTime;
                
                if (elapsed >= 1000) {
                    const fps = Math.round((frames * 1000) / elapsed);
                    resolve(fps);
                } else {
                    requestAnimationFrame(countFrame);
                }
            };
            
            requestAnimationFrame(countFrame);
        });
    }

    // 计算DOM深度
    calculateDOMDepth(element = document.body, depth = 0) {
        if (!element || !element.children) return depth;
        
        let maxDepth = depth;
        for (let child of element.children) {
            const childDepth = this.calculateDOMDepth(child, depth + 1);
            maxDepth = Math.max(maxDepth, childDepth);
        }
        
        return maxDepth;
    }

    // 估算活跃定时器数量（近似）
    countActiveIntervals() {
        // 这是一个近似值，实际无法准确统计所有定时器
        let count = 0;
        
        // 检查已知的定时器
        if (window.realtimeDataSystem && window.realtimeDataSystem.updateInterval) count++;
        if (window.performanceMonitor && window.performanceMonitor.isMonitoring) count++;
        if (window.chatSystem && window.chatSystem.syncInterval) count++;
        
        return count;
    }

    // 添加诊断结果
    addDiagnostic(level, title, message, details = {}) {
        this.diagnostics.push({
            level,
            title,
            message,
            timestamp: Date.now(),
            ...details
        });
    }

    // 生成诊断报告
    generateReport() {
        const errors = this.diagnostics.filter(d => d.level === 'error');
        const warnings = this.diagnostics.filter(d => d.level === 'warning');
        const info = this.diagnostics.filter(d => d.level === 'info');
        
        console.log('\n🔍 性能诊断报告');
        console.log('='.repeat(50));
        console.log(`⏱️ 诊断耗时: ${Math.round(performance.now() - this.startTime)}ms`);
        console.log(`❌ 错误: ${errors.length} 个`);
        console.log(`⚠️ 警告: ${warnings.length} 个`);
        console.log(`ℹ️ 信息: ${info.length} 个`);
        
        if (errors.length > 0) {
            console.log('\n❌ 错误详情:');
            errors.forEach(error => {
                console.log(`  • ${error.title}: ${error.message}`);
                if (error.suggestions) {
                    error.suggestions.forEach(suggestion => {
                        console.log(`    - ${suggestion}`);
                    });
                }
            });
        }
        
        if (warnings.length > 0) {
            console.log('\n⚠️ 警告详情:');
            warnings.forEach(warning => {
                console.log(`  • ${warning.title}: ${warning.message}`);
                if (warning.suggestions) {
                    warning.suggestions.forEach(suggestion => {
                        console.log(`    - ${suggestion}`);
                    });
                }
            });
        }
        
        console.log('\n' + '='.repeat(50));
        
        // 提供总体建议
        this.provideTotalSuggestions(errors, warnings);
    }

    // 提供总体优化建议
    provideTotalSuggestions(errors, warnings) {
        if (errors.length === 0 && warnings.length === 0) {
            console.log('✅ 恭喜！您的页面性能表现良好');
            return;
        }
        
        console.log('💡 总体优化建议:');
        
        if (errors.length > 0) {
            console.log('  🔥 高优先级:');
            console.log('    - 立即处理所有错误级别的性能问题');
            console.log('    - 考虑使用性能分析工具进行深入分析');
        }
        
        if (warnings.length > 0) {
            console.log('  📈 中优先级:');
            console.log('    - 逐步优化警告级别的性能问题');
            console.log('    - 监控性能指标变化');
        }
        
        console.log('  🛠️ 通用建议:');
        console.log('    - 定期运行性能诊断');
        console.log('    - 在不同设备和网络环境下测试');
        console.log('    - 考虑使用 Lighthouse 进行详细分析');
    }

    // 获取诊断结果
    getResults() {
        return {
            summary: {
                errors: this.diagnostics.filter(d => d.level === 'error').length,
                warnings: this.diagnostics.filter(d => d.level === 'warning').length,
                info: this.diagnostics.filter(d => d.level === 'info').length,
                duration: Math.round(performance.now() - this.startTime)
            },
            diagnostics: this.diagnostics
        };
    }
}

// 创建全局诊断工具
window.performanceDiagnostics = new PerformanceDiagnostics();

// 添加快捷命令
window.runPerformanceDiagnostics = () => {
    return window.performanceDiagnostics.runDiagnostics();
}; 