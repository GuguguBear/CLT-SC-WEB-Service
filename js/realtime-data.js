// 实时数据系统模块
class RealtimeDataSystem {
    constructor() {
        this.isActive = false;
        this.updateInterval = null;
        this.priceHistory = new Map();
        this.marketEvents = [];
        this.alerts = [];
        this.statistics = {
            totalTrades: 0,
            totalProfit: 0,
            averageROI: 0,
            bestRoute: null,
            marketVolatility: 0
        };
        this.subscribers = new Map();
        
        // 延迟初始化，等待其他系统加载
        setTimeout(() => this.initializeSystem(), 500);
    }

    initializeSystem() {
        this.initializePriceHistory();
        this.generateMarketEvents();
        this.startRealTimeUpdates();
        console.log('📊 实时数据系统已启动');
    }

    // 初始化价格历史数据
    initializePriceHistory() {
        // 等待贸易系统加载
        const initHistory = () => {
            const commodities = window.tradingSystem?.marketData?.commodities || [];
            
            if (commodities.length === 0) {
                setTimeout(initHistory, 100);
                return;
            }
            
            commodities.forEach(commodity => {
                const history = [];
                const basePrice = commodity.basePrice;
                
                // 生成过去24小时的价格历史（每小时一个数据点）
                for (let i = 24; i >= 0; i--) {
                    const timestamp = Date.now() - (i * 60 * 60 * 1000);
                    const volatilityFactor = 1 + (Math.random() - 0.5) * 2 * commodity.volatility;
                    const price = Math.round(basePrice * volatilityFactor);
                    
                    history.push({
                        timestamp,
                        price,
                        volume: Math.floor(Math.random() * 1000) + 100,
                        trend: Math.random() > 0.5 ? 'up' : 'down'
                    });
                }
                
                this.priceHistory.set(commodity.code, history);
                
                // 设置初始当前价格
                const latestPrice = history[history.length - 1].price;
                commodity.currentPrice = latestPrice;
                commodity.priceChange = (latestPrice - basePrice) / basePrice;
                commodity.trend = history[history.length - 1].trend;
            });
        };
        
        initHistory();
    }

    // 生成市场事件
    generateMarketEvents() {
        const eventTypes = [
            { type: 'supply_shortage', impact: 'positive', message: '供应短缺导致价格上涨' },
            { type: 'trade_embargo', impact: 'negative', message: '贸易禁运影响运输路线' },
            { type: 'new_discovery', impact: 'negative', message: '新矿藏发现导致价格下跌' },
            { type: 'pirate_activity', impact: 'risk', message: '海盗活动增加，运输风险上升' },
            { type: 'security_patrol', impact: 'safety', message: '安全巡逻增强，风险降低' },
            { type: 'economic_boom', impact: 'positive', message: '经济繁荣提升需求' },
            { type: 'station_maintenance', impact: 'disruption', message: '空间站维护影响交易' }
        ];

        // 随机生成一些市场事件
        for (let i = 0; i < 3; i++) {
            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const commodity = window.tradingSystem?.marketData?.commodities[
                Math.floor(Math.random() * window.tradingSystem.marketData.commodities.length)
            ];
            
            if (commodity) {
                this.marketEvents.push({
                    id: Date.now() + i,
                    timestamp: Date.now() - Math.random() * 6 * 60 * 60 * 1000, // 过去6小时内
                    commodity: commodity.code,
                    ...event
                });
            }
        }
    }

    // 启动实时更新
    startRealTimeUpdates() {
        if (this.isActive) return;
        
        this.isActive = true;
        
        // 每30秒更新一次价格
        this.updateInterval = setInterval(() => {
            this.updateMarketPrices();
            this.updateStatistics();
            this.checkPriceAlerts();
            this.notifySubscribers('priceUpdate');
        }, 30000);

        // 每5分钟生成新的市场事件
        setInterval(() => {
            this.generateRandomMarketEvent();
        }, 5 * 60 * 1000);
    }

    // 更新市场价格
    updateMarketPrices() {
        const commodities = window.tradingSystem?.marketData?.commodities || [];
        const currentTime = Date.now();

        commodities.forEach(commodity => {
            const history = this.priceHistory.get(commodity.code) || [];
            const lastPrice = history[history.length - 1]?.price || commodity.basePrice;
            
            // 基础波动
            let volatilityFactor = 1 + (Math.random() - 0.5) * 2 * commodity.volatility;
            
            // 应用市场事件影响
            const activeEvents = this.getActiveEventsForCommodity(commodity.code);
            activeEvents.forEach(event => {
                switch (event.impact) {
                    case 'positive':
                        volatilityFactor *= 1.1 + Math.random() * 0.2;
                        break;
                    case 'negative':
                        volatilityFactor *= 0.8 + Math.random() * 0.1;
                        break;
                    case 'disruption':
                        volatilityFactor *= 0.9 + Math.random() * 0.2;
                        break;
                }
            });

            // 趋势延续（价格有惯性）
            const recentTrend = this.getRecentTrend(commodity.code);
            if (recentTrend === 'up') {
                volatilityFactor *= 1.05;
            } else if (recentTrend === 'down') {
                volatilityFactor *= 0.95;
            }

            const newPrice = Math.round(lastPrice * volatilityFactor);
            const trend = newPrice > lastPrice ? 'up' : newPrice < lastPrice ? 'down' : 'stable';
            
            // 更新价格历史
            history.push({
                timestamp: currentTime,
                price: newPrice,
                volume: Math.floor(Math.random() * 1000) + 100,
                trend
            });

            // 保持历史记录在合理范围内（最多保留48小时）
            if (history.length > 48) {
                history.shift();
            }

            // 更新当前价格
            commodity.currentPrice = newPrice;
            commodity.priceChange = (newPrice - commodity.basePrice) / commodity.basePrice;
            commodity.trend = trend;
        });

        // 通知贸易系统更新路线
        if (window.tradingSystem) {
            window.tradingSystem.updateMarketPrices();
        }
    }

    // 获取商品的近期趋势
    getRecentTrend(commodityCode) {
        const history = this.priceHistory.get(commodityCode) || [];
        if (history.length < 3) return 'stable';

        const recent = history.slice(-3);
        const upTrends = recent.filter(h => h.trend === 'up').length;
        const downTrends = recent.filter(h => h.trend === 'down').length;

        if (upTrends > downTrends) return 'up';
        if (downTrends > upTrends) return 'down';
        return 'stable';
    }

    // 获取影响特定商品的活跃事件
    getActiveEventsForCommodity(commodityCode) {
        const sixHoursAgo = Date.now() - 6 * 60 * 60 * 1000;
        return this.marketEvents.filter(event => 
            event.commodity === commodityCode && 
            event.timestamp > sixHoursAgo
        );
    }

    // 生成随机市场事件
    generateRandomMarketEvent() {
        if (Math.random() < 0.3) { // 30% 概率生成新事件
            const eventTypes = [
                { type: 'price_surge', impact: 'positive', message: '突发需求激增' },
                { type: 'supply_drop', impact: 'negative', message: '供应链中断' },
                { type: 'competition', impact: 'negative', message: '竞争对手降价' },
                { type: 'quality_bonus', impact: 'positive', message: '高品质货物奖励' }
            ];

            const event = eventTypes[Math.floor(Math.random() * eventTypes.length)];
            const commodities = window.tradingSystem?.marketData?.commodities || [];
            const commodity = commodities[Math.floor(Math.random() * commodities.length)];

            if (commodity) {
                const newEvent = {
                    id: Date.now(),
                    timestamp: Date.now(),
                    commodity: commodity.code,
                    ...event
                };

                this.marketEvents.push(newEvent);
                this.showMarketAlert(`${commodity.name}: ${event.message}`, event.impact);
                
                // 触发市场事件（用于声音系统）
                document.dispatchEvent(new CustomEvent('marketEvent', {
                    detail: { 
                        commodity: commodity.code,
                        event: event.type,
                        message: event.message,
                        impact: event.impact
                    }
                }));
                
                // 保持事件列表在合理大小
                if (this.marketEvents.length > 20) {
                    this.marketEvents.shift();
                }
            }
        }
    }

    // 更新统计数据
    updateStatistics() {
        const routes = window.tradingSystem?.tradeRoutes || [];
        
        if (routes.length > 0) {
            const totalProfit = routes.reduce((sum, route) => sum + route.totalProfit, 0);
            const averageROI = routes.reduce((sum, route) => sum + route.roi, 0) / routes.length;
            const bestRoute = routes.reduce((best, route) => 
                route.totalProfit > (best?.totalProfit || 0) ? route : best, null);

            // 计算市场波动性
            const commodities = window.tradingSystem?.marketData?.commodities || [];
            const totalVolatility = commodities.reduce((sum, c) => sum + Math.abs(c.priceChange || 0), 0);
            const marketVolatility = totalVolatility / commodities.length;

            this.statistics = {
                totalTrades: this.statistics.totalTrades + Math.floor(Math.random() * 5),
                totalProfit,
                averageROI: Math.round(averageROI * 100) / 100,
                bestRoute,
                marketVolatility: Math.round(marketVolatility * 10000) / 100 // 转换为百分比
            };
        }
    }

    // 检查价格预警
    checkPriceAlerts() {
        const commodities = window.tradingSystem?.marketData?.commodities || [];
        
        commodities.forEach(commodity => {
            const priceChange = Math.abs(commodity.priceChange || 0);
            
            // 价格大幅波动预警
            if (priceChange > 0.15) { // 15%以上波动
                const direction = commodity.priceChange > 0 ? '上涨' : '下跌';
                const percentage = Math.round(priceChange * 100);
                
                this.addAlert({
                    id: Date.now() + Math.random(),
                    type: 'price_alert',
                    commodity: commodity.code,
                    message: `${commodity.name}价格${direction}${percentage}%`,
                    severity: priceChange > 0.25 ? 'high' : 'medium',
                    timestamp: Date.now()
                });
            }

            // 极端价格预警
            if (commodity.currentPrice > commodity.basePrice * 1.5) {
                this.addAlert({
                    id: Date.now() + Math.random(),
                    type: 'extreme_high',
                    commodity: commodity.code,
                    message: `${commodity.name}价格达到极高水平`,
                    severity: 'high',
                    timestamp: Date.now()
                });
            } else if (commodity.currentPrice < commodity.basePrice * 0.5) {
                this.addAlert({
                    id: Date.now() + Math.random(),
                    type: 'extreme_low',
                    commodity: commodity.code,
                    message: `${commodity.name}价格跌至极低水平`,
                    severity: 'high',
                    timestamp: Date.now()
                });
            }
        });
    }

    // 添加预警
    addAlert(alert) {
        // 检查用户是否启用价格预警
        if (!this.isPriceAlertEnabled()) {
            return; // 用户未启用价格预警，直接返回
        }
        
        this.alerts.push(alert);
        this.showAlert(alert);
        
        // 触发价格警报事件（用于声音系统）
        document.dispatchEvent(new CustomEvent('priceAlert', {
            detail: { 
                commodity: alert.commodity,
                message: alert.message,
                severity: alert.severity,
                type: alert.type
            }
        }));
        
        // 保持预警列表在合理大小
        if (this.alerts.length > 10) {
            this.alerts.shift();
        }
    }

    // 检查用户是否启用价格预警
    isPriceAlertEnabled() {
        // 检查用户是否已登录
        const currentUser = localStorage.getItem('currentUsername');
        if (!currentUser) {
            return false; // 未登录用户不显示价格预警
        }
        
        // 检查用户设置
        const userSettings = JSON.parse(localStorage.getItem(`userSettings_${currentUser}`) || '{}');
        return userSettings.priceAlertsEnabled === true;
    }

    // 显示预警
    showAlert(alert) {
        const alertDiv = document.createElement('div');
        alertDiv.className = `realtime-alert alert-${alert.severity}`;
        alertDiv.innerHTML = `
            <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
            <div class="alert-content">
                <div class="alert-title">${alert.commodity} 价格预警</div>
                <div class="alert-message">${alert.message}</div>
            </div>
            <div class="alert-time">${new Date(alert.timestamp).toLocaleTimeString()}</div>
        `;

        alertDiv.style.cssText = `
            position: fixed;
            top: ${100 + this.alerts.length * 80}px;
            right: 20px;
            background: linear-gradient(145deg, #1a1a1a, #000);
            border: 2px solid ${this.getAlertColor(alert.severity)};
            color: #fff;
            padding: 15px;
            border-radius: 5px;
            max-width: 300px;
            z-index: 10001;
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            box-shadow: 0 5px 15px rgba(0,0,0,0.5);
            animation: alertSlideIn 0.3s ease-out;
        `;

        // 添加动画样式
        if (!document.getElementById('alert-styles')) {
            const style = document.createElement('style');
            style.id = 'alert-styles';
            style.textContent = `
                @keyframes alertSlideIn {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .realtime-alert {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }
                
                .alert-icon {
                    font-size: 20px;
                    flex-shrink: 0;
                }
                
                .alert-content {
                    flex: 1;
                }
                
                .alert-title {
                    font-weight: bold;
                    margin-bottom: 5px;
                }
                
                .alert-time {
                    font-size: 9px;
                    opacity: 0.7;
                    flex-shrink: 0;
                }
            `;
            document.head.appendChild(style);
        }

        document.body.appendChild(alertDiv);

        // 5秒后自动移除
        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.style.animation = 'alertSlideIn 0.3s ease-in reverse';
                setTimeout(() => alertDiv.remove(), 300);
            }
        }, 5000);
    }

    // 显示市场预警
    showMarketAlert(message, impact) {
        const alertDiv = document.createElement('div');
        alertDiv.className = 'market-alert';
        alertDiv.innerHTML = `
            <div class="market-alert-icon">${this.getMarketIcon(impact)}</div>
            <div class="market-alert-message">${message}</div>
        `;

        alertDiv.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: rgba(255, 102, 0, 0.9);
            color: #000;
            padding: 10px 15px;
            border-radius: 5px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            z-index: 10002;
            max-width: 250px;
            display: flex;
            align-items: center;
            gap: 10px;
            animation: alertSlideIn 0.3s ease-out;
        `;

        document.body.appendChild(alertDiv);

        setTimeout(() => {
            if (alertDiv.parentNode) {
                alertDiv.remove();
            }
        }, 4000);
    }

    // 获取预警图标
    getAlertIcon(type) {
        const icons = {
            price_alert: '📈',
            extreme_high: '🚀',
            extreme_low: '📉',
            volume_spike: '💥',
            trend_change: '🔄'
        };
        return icons[type] || '⚠️';
    }

    // 获取市场图标
    getMarketIcon(impact) {
        const icons = {
            positive: '📈',
            negative: '📉',
            risk: '⚠️',
            safety: '🛡️',
            disruption: '⚡'
        };
        return icons[impact] || 'ℹ️';
    }

    // 获取预警颜色
    getAlertColor(severity) {
        const colors = {
            low: '#00ff00',
            medium: '#ffaa00',
            high: '#ff3300'
        };
        return colors[severity] || '#ff6600';
    }

    // 订阅数据更新
    subscribe(eventType, callback) {
        if (!this.subscribers.has(eventType)) {
            this.subscribers.set(eventType, []);
        }
        this.subscribers.get(eventType).push(callback);
    }

    // 通知订阅者
    notifySubscribers(eventType, data = null) {
        const callbacks = this.subscribers.get(eventType) || [];
        callbacks.forEach(callback => {
            try {
                callback(data);
            } catch (error) {
                console.error('订阅者回调错误:', error);
            }
        });
    }

    // 获取价格历史
    getPriceHistory(commodityCode, hours = 24) {
        const history = this.priceHistory.get(commodityCode) || [];
        const cutoffTime = Date.now() - hours * 60 * 60 * 1000;
        return history.filter(entry => entry.timestamp >= cutoffTime);
    }

    // 获取统计数据
    getStatistics() {
        return { ...this.statistics };
    }

    // 获取活跃预警
    getActiveAlerts() {
        const oneHourAgo = Date.now() - 60 * 60 * 1000;
        return this.alerts.filter(alert => alert.timestamp > oneHourAgo);
    }

    // 获取市场事件
    getMarketEvents() {
        return [...this.marketEvents].sort((a, b) => b.timestamp - a.timestamp);
    }

    // 停止实时更新
    stopRealTimeUpdates() {
        this.isActive = false;
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
        }
    }

    // 重启实时更新
    restartRealTimeUpdates() {
        this.stopRealTimeUpdates();
        this.startRealTimeUpdates();
    }
}

// 导出实时数据系统
window.realtimeDataSystem = new RealtimeDataSystem(); 