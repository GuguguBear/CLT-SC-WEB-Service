// 实时统计仪表板模块
class DashboardSystem {
    constructor() {
        this.charts = new Map();
        this.updateInterval = null;
        this.isVisible = false;
        this.initializeDashboard();
    }

    initializeDashboard() {
        this.createDashboardHTML();
        this.initializeCharts();
        this.bindEvents();
        this.startUpdates();
        console.log('📊 统计仪表板已启动');
    }

    createDashboardHTML() {
        // 检查是否已存在
        if (document.getElementById('dashboard-container')) return;

        const dashboardHTML = `
            <div id="dashboard-container" class="dashboard-container" style="display: none;">
                <div class="dashboard-header">
                    <div class="dashboard-title">
                        <span class="dashboard-icon">📊</span>
                        <span>MARKET INTELLIGENCE</span>
                    </div>
                    <div class="dashboard-controls">
                        <button class="dashboard-btn" onclick="dashboardSystem.toggleAutoRefresh()">
                            <span id="auto-refresh-status">AUTO REFRESH: ON</span>
                        </button>
                        <button class="dashboard-btn" onclick="dashboardSystem.refreshAll()">REFRESH</button>
                        <button class="dashboard-btn" onclick="dashboardSystem.hideDashboard()">CLOSE</button>
                    </div>
                </div>

                <div class="dashboard-content">
                    <!-- 统计概览 -->
                    <div class="stats-grid">
                        <div class="stat-card">
                            <div class="stat-icon">💰</div>
                            <div class="stat-info">
                                <div class="stat-value" id="total-profit">0 aUEC</div>
                                <div class="stat-label">总利润</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">📈</div>
                            <div class="stat-info">
                                <div class="stat-value" id="average-roi">0%</div>
                                <div class="stat-label">平均ROI</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">🚛</div>
                            <div class="stat-info">
                                <div class="stat-value" id="total-trades">0</div>
                                <div class="stat-label">交易次数</div>
                            </div>
                        </div>
                        
                        <div class="stat-card">
                            <div class="stat-icon">⚡</div>
                            <div class="stat-info">
                                <div class="stat-value" id="market-volatility">0%</div>
                                <div class="stat-label">市场波动</div>
                            </div>
                        </div>
                    </div>

                    <!-- 图表区域 -->
                    <div class="charts-container">
                        <div class="chart-panel">
                            <div class="chart-header">
                                <h3>价格趋势</h3>
                                <select id="price-chart-commodity" class="chart-select">
                                    <option value="DIAM">钻石</option>
                                    <option value="GOLD">黄金</option>
                                    <option value="QUAN">量子能量</option>
                                </select>
                            </div>
                            <div class="chart-content">
                                <canvas id="price-chart" width="400" height="200"></canvas>
                            </div>
                        </div>

                        <div class="chart-panel">
                            <div class="chart-header">
                                <h3>收益分布</h3>
                                <div class="chart-legend">
                                    <span class="legend-item"><span class="legend-color profit"></span>盈利路线</span>
                                    <span class="legend-item"><span class="legend-color loss"></span>亏损路线</span>
                                </div>
                            </div>
                            <div class="chart-content">
                                <canvas id="profit-chart" width="400" height="200"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- 市场事件 -->
                    <div class="market-events-panel">
                        <div class="panel-header">
                            <h3>市场动态</h3>
                            <span class="live-indicator">🔴 LIVE</span>
                        </div>
                        <div class="events-list" id="market-events-list">
                            <!-- 市场事件将在这里显示 -->
                        </div>
                    </div>

                    <!-- 价格预警 -->
                    <div class="alerts-panel">
                        <div class="panel-header">
                            <h3>价格预警</h3>
                            <span class="alert-count" id="alert-count">0</span>
                        </div>
                        <div class="alerts-list" id="alerts-list">
                            <!-- 预警将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.insertAdjacentHTML('beforeend', dashboardHTML);
    }

    initializeCharts() {
        // 初始化价格图表
        this.initPriceChart();
        this.initProfitChart();
    }

    initPriceChart() {
        const canvas = document.getElementById('price-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.set('price', { canvas, ctx });
        this.updatePriceChart();
    }

    initProfitChart() {
        const canvas = document.getElementById('profit-chart');
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        this.charts.set('profit', { canvas, ctx });
        this.updateProfitChart();
    }

    updatePriceChart() {
        const chart = this.charts.get('price');
        if (!chart) return;

        const select = document.getElementById('price-chart-commodity');
        const selectedCommodity = select?.value || 'DIAM';
        
        // 获取价格历史数据
        const history = window.realtimeDataSystem?.getPriceHistory(selectedCommodity, 12) || [];
        
        if (history.length === 0) return;

        const { canvas, ctx } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // 清除画布
        ctx.clearRect(0, 0, width, height);

        // 设置样式
        ctx.strokeStyle = '#ff6600';
        ctx.fillStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.font = '10px Share Tech Mono';

        // 计算数据范围
        const prices = history.map(h => h.price);
        const minPrice = Math.min(...prices);
        const maxPrice = Math.max(...prices);
        const priceRange = maxPrice - minPrice || 1;

        // 绘制网格
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 1;
        
        // 垂直网格线
        for (let i = 0; i <= 10; i++) {
            const x = (i / 10) * width;
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        
        // 水平网格线
        for (let i = 0; i <= 5; i++) {
            const y = (i / 5) * height;
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(width, y);
            ctx.stroke();
        }

        // 绘制价格线
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();

        history.forEach((point, index) => {
            const x = (index / (history.length - 1)) * width;
            const y = height - ((point.price - minPrice) / priceRange) * height;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });

        ctx.stroke();

        // 绘制数据点
        ctx.fillStyle = '#ff6600';
        history.forEach((point, index) => {
            const x = (index / (history.length - 1)) * width;
            const y = height - ((point.price - minPrice) / priceRange) * height;
            
            ctx.beginPath();
            ctx.arc(x, y, 3, 0, 2 * Math.PI);
            ctx.fill();
        });

        // 绘制标签
        ctx.fillStyle = '#fff';
        ctx.fillText(`${minPrice.toLocaleString()}`, 5, height - 5);
        ctx.fillText(`${maxPrice.toLocaleString()}`, 5, 15);
        
        const latestPrice = prices[prices.length - 1];
        ctx.fillText(`当前: ${latestPrice.toLocaleString()}`, width - 100, 15);
    }

    updateProfitChart() {
        const chart = this.charts.get('profit');
        if (!chart) return;

        const routes = window.tradingSystem?.tradeRoutes || [];
        if (routes.length === 0) return;

        const { canvas, ctx } = chart;
        const width = canvas.width;
        const height = canvas.height;

        // 清除画布
        ctx.clearRect(0, 0, width, height);

        // 分类路线
        const profitableRoutes = routes.filter(r => r.totalProfit > 0);
        const unprofitableRoutes = routes.filter(r => r.totalProfit <= 0);

        // 绘制盈利分布饼图
        const total = routes.length;
        const profitableCount = profitableRoutes.length;
        const unprofitableCount = unprofitableRoutes.length;

        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 20;

        // 绘制盈利部分
        if (profitableCount > 0) {
            const profitAngle = (profitableCount / total) * 2 * Math.PI;
            
            ctx.fillStyle = '#00ff00';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, 0, profitAngle);
            ctx.closePath();
            ctx.fill();
        }

        // 绘制亏损部分
        if (unprofitableCount > 0) {
            const profitAngle = (profitableCount / total) * 2 * Math.PI;
            const lossAngle = (unprofitableCount / total) * 2 * Math.PI;
            
            ctx.fillStyle = '#ff3300';
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, profitAngle, profitAngle + lossAngle);
            ctx.closePath();
            ctx.fill();
        }

        // 绘制边框
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.stroke();

        // 绘制百分比标签
        ctx.fillStyle = '#fff';
        ctx.font = '12px Share Tech Mono';
        ctx.textAlign = 'center';
        
        const profitPercentage = Math.round((profitableCount / total) * 100);
        ctx.fillText(`${profitPercentage}%`, centerX, centerY - 5);
        ctx.fillText('盈利', centerX, centerY + 10);
    }

    updateStatistics() {
        if (!window.realtimeDataSystem) return;

        const stats = window.realtimeDataSystem.getStatistics();

        // 更新统计卡片
        const elements = {
            'total-profit': `${stats.totalProfit.toLocaleString()} aUEC`,
            'average-roi': `${stats.averageROI}%`,
            'total-trades': stats.totalTrades.toString(),
            'market-volatility': `${stats.marketVolatility}%`
        };

        Object.entries(elements).forEach(([id, value]) => {
            const element = document.getElementById(id);
            if (element) element.textContent = value;
        });
    }

    updateMarketEvents() {
        if (!window.realtimeDataSystem) return;

        const events = window.realtimeDataSystem.getMarketEvents().slice(0, 5);
        const container = document.getElementById('market-events-list');
        
        if (!container) return;

        container.innerHTML = events.map(event => `
            <div class="event-item">
                <div class="event-icon">${this.getEventIcon(event.impact)}</div>
                <div class="event-content">
                    <div class="event-message">${event.message}</div>
                    <div class="event-details">
                        <span class="event-commodity">${event.commodity}</span>
                        <span class="event-time">${this.formatTime(event.timestamp)}</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    updateAlerts() {
        if (!window.realtimeDataSystem) return;

        const alerts = window.realtimeDataSystem.getActiveAlerts();
        const container = document.getElementById('alerts-list');
        const countElement = document.getElementById('alert-count');
        
        if (!container) return;

        // 更新预警计数
        if (countElement) {
            countElement.textContent = alerts.length.toString();
        }

        container.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.severity}">
                <div class="alert-icon">${this.getAlertIcon(alert.type)}</div>
                <div class="alert-content">
                    <div class="alert-message">${alert.message}</div>
                    <div class="alert-time">${this.formatTime(alert.timestamp)}</div>
                </div>
            </div>
        `).join('');
    }

    getEventIcon(impact) {
        const icons = {
            positive: '📈',
            negative: '📉',
            risk: '⚠️',
            safety: '🛡️',
            disruption: '⚡'
        };
        return icons[impact] || 'ℹ️';
    }

    getAlertIcon(type) {
        const icons = {
            price_alert: '📊',
            extreme_high: '🚀',
            extreme_low: '📉',
            volume_spike: '💥'
        };
        return icons[type] || '⚠️';
    }

    formatTime(timestamp) {
        const now = Date.now();
        const diff = now - timestamp;
        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(minutes / 60);

        if (hours > 0) {
            return `${hours}小时前`;
        } else if (minutes > 0) {
            return `${minutes}分钟前`;
        } else {
            return '刚刚';
        }
    }

    bindEvents() {
        // 商品选择变化时更新图表
        const commoditySelect = document.getElementById('price-chart-commodity');
        if (commoditySelect) {
            commoditySelect.addEventListener('change', () => {
                this.updatePriceChart();
            });
        }
    }

    startUpdates() {
        // 每10秒更新一次仪表板
        this.updateInterval = setInterval(() => {
            if (this.isVisible) {
                this.updateAll();
            }
        }, 10000);
    }

    updateAll() {
        this.updateStatistics();
        this.updatePriceChart();
        this.updateProfitChart();
        this.updateMarketEvents();
        this.updateAlerts();
    }

    showDashboard() {
        const container = document.getElementById('dashboard-container');
        if (container) {
            container.style.display = 'block';
            this.isVisible = true;
            this.updateAll();
        }
    }

    hideDashboard() {
        const container = document.getElementById('dashboard-container');
        if (container) {
            container.style.display = 'none';
            this.isVisible = false;
        }
    }

    toggleDashboard() {
        if (this.isVisible) {
            this.hideDashboard();
        } else {
            this.showDashboard();
        }
    }

    refreshAll() {
        this.updateAll();
        this.showNotification('数据已刷新');
    }

    toggleAutoRefresh() {
        const statusElement = document.getElementById('auto-refresh-status');
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
            this.updateInterval = null;
            if (statusElement) statusElement.textContent = 'AUTO REFRESH: OFF';
        } else {
            this.startUpdates();
            if (statusElement) statusElement.textContent = 'AUTO REFRESH: ON';
        }
    }

    showNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'dashboard-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: #ff6600;
            color: #000;
            padding: 10px 20px;
            border-radius: 5px;
            font-family: 'Share Tech Mono', monospace;
            font-size: 11px;
            z-index: 10003;
        `;

        document.body.appendChild(notification);
        setTimeout(() => notification.remove(), 2000);
    }
}

// 导出仪表板系统
window.dashboardSystem = new DashboardSystem(); 