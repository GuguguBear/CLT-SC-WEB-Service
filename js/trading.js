// 贸易系统模块
class TradingSystem {
    constructor() {
        this.tradeRoutes = [];
        this.selectedRoute = null;
        this.marketData = this.initializeMarketData();
        this.initializeTrading();
    }

    initializeMarketData() {
        return {
            locations: [
                'New Babbage', 'Port Olisar', 'Lorville', 'Area18',
                'Grim HEX', 'Port Tressler', 'Everus Harbor',
                'Seraphim Station', 'Baijini Point', 'Cru L1',
                'Cru L4', 'Cru L5', 'HUR L1', 'HUR L2',
                'HUR L3', 'HUR L4', 'HUR L5', 'ARC L1',
                'MIC L1', 'Covalex Hub'
            ],
            commodities: [
                { code: 'DIAM', name: '钻石', basePrice: 5123, volatility: 0.15 },
                { code: 'GOLD', name: '黄金', basePrice: 6245, volatility: 0.08 },
                { code: 'QUAN', name: '量子能量', basePrice: 22567, volatility: 0.25 },
                { code: 'LARA', name: 'Laranite', basePrice: 3156, volatility: 0.12 },
                { code: 'ALUM', name: '铝材', basePrice: 315, volatility: 0.05 },
                { code: 'TITA', name: '钛金属', basePrice: 467, volatility: 0.08 },
                { code: 'HADA', name: 'Hadanite', basePrice: 587230, volatility: 0.30 },
                { code: 'WIDO', name: 'WiDoW', basePrice: 6534, volatility: 0.40 }
            ]
        };
    }

    initializeTrading() {
        // 延迟绑定事件，等待DOM加载
        setTimeout(() => {
            this.bindTradingEvents();
            this.updateMarketPrices();
            this.startPriceUpdates();
        }, 500);
    }

    bindTradingEvents() {
        // 投资金额输入
        const investmentInput = document.getElementById('maxInvestment');
        if (investmentInput) {
            investmentInput.addEventListener('input', () => this.analyzeTradingRoutes());
        }

        // 货舱容量输入
        const capacityInput = document.getElementById('cargoCapacity');
        if (capacityInput) {
            capacityInput.addEventListener('input', () => this.analyzeTradingRoutes());
        }

        // 排序选择
        const sortSelect = document.getElementById('sortMethod');
        if (sortSelect) {
            sortSelect.addEventListener('change', () => this.analyzeTradingRoutes());
        }

        // 分析按钮
        const analyzeBtn = document.getElementById('analyzeRoutes');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.analyzeTradingRoutes());
        }

        // 刷新按钮
        const refreshBtn = document.getElementById('refreshPrices');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => this.refreshRoutes());
        }
    }

    updateMarketPrices() {
        this.marketData.commodities.forEach(commodity => {
            // 如果实时数据系统存在且有当前价格，使用实时价格
            if (window.realtimeDataSystem && commodity.currentPrice) {
                // 实时数据系统已经设置了 currentPrice 和 priceChange
                return;
            }
            
            // 否则使用传统的价格更新
            const change = (Math.random() - 0.5) * 2 * commodity.volatility;
            commodity.currentPrice = Math.round(commodity.basePrice * (1 + change));
            commodity.priceChange = change;
        });
    }

    startPriceUpdates() {
        // 每30秒更新一次价格
        setInterval(() => {
            this.updateMarketPrices();
            if (this.selectedRoute) {
                this.displayRouteDetails(this.selectedRoute);
            }
        }, 30000);
    }

    analyzeTradingRoutes() {
        const investment = parseInt(document.getElementById('maxInvestment')?.value || 1000000);
        const capacity = parseInt(document.getElementById('cargoCapacity')?.value || 100);
        const sortMethod = document.getElementById('sortMethod')?.value || 'profit';

        this.tradeRoutes = this.generateSampleRoutes(investment, capacity);
        this.tradeRoutes = this.sortRoutes(this.tradeRoutes, sortMethod);
        this.displayRoutesList(this.tradeRoutes);
    }

    generateSampleRoutes(maxInvestment, cargoCapacity) {
        const routes = [];
        const locations = this.marketData.locations;
        const commodities = this.marketData.commodities;

        // 生成贸易路线
        for (let i = 0; i < 15; i++) {
            const commodity = commodities[Math.floor(Math.random() * commodities.length)];
            const fromLocation = locations[Math.floor(Math.random() * locations.length)];
            let toLocation = locations[Math.floor(Math.random() * locations.length)];
            
            // 确保起点和终点不同
            while (toLocation === fromLocation) {
                toLocation = locations[Math.floor(Math.random() * locations.length)];
            }

            const buyPrice = commodity.currentPrice * (0.8 + Math.random() * 0.2);
            const sellPrice = commodity.currentPrice * (1.1 + Math.random() * 0.3);
            const profitPerUnit = sellPrice - buyPrice;
            
            const maxUnits = Math.min(
                Math.floor(maxInvestment / buyPrice),
                cargoCapacity
            );
            
            const totalProfit = profitPerUnit * maxUnits;
            const totalInvestment = buyPrice * maxUnits;
            const roi = (totalProfit / totalInvestment) * 100;
            
            // 随机距离和时间
            const distance = Math.round(50000 + Math.random() * 200000);
            const travelTime = Math.round(distance / 1000 / 60); // 分钟
            const profitPerHour = (totalProfit / travelTime) * 60;

            routes.push({
                id: i + 1,
                commodity: commodity,
                from: fromLocation,
                to: toLocation,
                buyPrice: Math.round(buyPrice),
                sellPrice: Math.round(sellPrice),
                profitPerUnit: Math.round(profitPerUnit),
                maxUnits: maxUnits,
                totalProfit: Math.round(totalProfit),
                totalInvestment: Math.round(totalInvestment),
                roi: Math.round(roi * 100) / 100,
                distance: distance,
                travelTime: travelTime,
                profitPerHour: Math.round(profitPerHour),
                risk: this.calculateRisk(commodity, distance)
            });
        }

        return routes.filter(route => route.totalProfit > 0);
    }

    calculateRisk(commodity, distance) {
        let risk = 'LOW';
        
        if (commodity.code === 'WIDO') {
            risk = 'ILLEGAL';
        } else if (commodity.code === 'QUAN' || commodity.volatility > 0.2) {
            risk = 'HIGH';
        } else if (distance > 150000 || commodity.volatility > 0.1) {
            risk = 'MEDIUM';
        }
        
        return risk;
    }

    sortRoutes(routes, sortMethod) {
        switch (sortMethod) {
            case 'profit':
                return routes.sort((a, b) => b.totalProfit - a.totalProfit);
            case 'roi':
                return routes.sort((a, b) => b.roi - a.roi);
            case 'distance':
                return routes.sort((a, b) => a.distance - b.distance);
            case 'cost':
                return routes.sort((a, b) => a.totalInvestment - b.totalInvestment);
            default:
                return routes;
        }
    }

    displayRoutesList(routes) {
        const routesList = document.getElementById('routesList');
        if (!routesList) return;

        if (routes.length === 0) {
            routesList.innerHTML = `
                <div class="no-routes-message">
                    <div class="no-routes-icon">📊</div>
                    <div class="no-routes-text">没有找到合适的贸易路线</div>
                </div>
            `;
            return;
        }

        routesList.innerHTML = routes.map((route, index) => `
            <div class="route-item" onclick="tradingSystem.selectRoute(${route.id})" data-route-id="${route.id}">
                <div class="route-rank">#${index + 1}</div>
                <div class="route-summary">
                    <div class="route-commodity">${route.commodity.name}</div>
                    <div class="route-path">${route.from} → ${route.to}</div>
                </div>
                <div class="route-profit">
                    <div class="profit-amount">+${route.totalProfit.toLocaleString()} aUEC</div>
                    <div class="roi-percentage">${route.roi}% ROI</div>
                </div>
                <div class="route-stats">
                    <div class="route-stat">
                        <span class="stat-value">${route.travelTime}min</span>
                        <span class="stat-label">时间</span>
                    </div>
                    <div class="route-stat">
                        <span class="stat-value ${this.getRiskClass(route.risk)}">${route.risk}</span>
                        <span class="stat-label">风险</span>
                    </div>
                </div>
            </div>
        `).join('');
    }

    getRiskClass(risk) {
        switch (risk) {
            case 'LOW': return 'risk-low';
            case 'MEDIUM': return 'risk-medium';
            case 'HIGH': return 'risk-high';
            case 'ILLEGAL': return 'risk-illegal';
            default: return '';
        }
    }

    selectRoute(routeId) {
        // 移除之前的选中状态
        document.querySelectorAll('.route-item').forEach(item => {
            item.classList.remove('selected');
        });

        // 选中当前路线
        const selectedItem = document.querySelector(`[data-route-id="${routeId}"]`);
        if (selectedItem) {
            selectedItem.classList.add('selected');
        }

        // 找到路线数据
        this.selectedRoute = this.tradeRoutes.find(route => route.id === routeId);
        if (this.selectedRoute) {
            this.displayRouteDetails(this.selectedRoute);
        }
    }

    displayRouteDetails(route) {
        const detailsContainer = document.getElementById('routeDetails');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="route-detail-card">
                <div class="detail-title">贸易路线详情</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">商品:</span>
                        <span class="detail-value">${route.commodity.name} (${route.commodity.code})</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">起点:</span>
                        <span class="detail-value">${route.from}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">终点:</span>
                        <span class="detail-value">${route.to}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">距离:</span>
                        <span class="detail-value">${route.distance.toLocaleString()} km</span>
                    </div>
                </div>
            </div>

            <div class="route-detail-card">
                <div class="detail-title">价格信息</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">买入价格:</span>
                        <span class="detail-value">${route.buyPrice.toLocaleString()} aUEC/SCU</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">卖出价格:</span>
                        <span class="detail-value">${route.sellPrice.toLocaleString()} aUEC/SCU</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">单位利润:</span>
                        <span class="detail-value profit-highlight">+${route.profitPerUnit.toLocaleString()} aUEC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">最大运输:</span>
                        <span class="detail-value">${route.maxUnits} SCU</span>
                    </div>
                </div>
            </div>

            <div class="route-detail-card">
                <div class="detail-title">收益分析</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">总投资:</span>
                        <span class="detail-value">${route.totalInvestment.toLocaleString()} aUEC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">总利润:</span>
                        <span class="detail-value profit-highlight">+${route.totalProfit.toLocaleString()} aUEC</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">投资回报率:</span>
                        <span class="detail-value profit-highlight">${route.roi}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">小时收益:</span>
                        <span class="detail-value">${route.profitPerHour.toLocaleString()} aUEC/h</span>
                    </div>
                </div>
            </div>

            <div class="route-detail-card">
                <div class="detail-title">风险评估</div>
                <div class="detail-grid">
                    <div class="detail-item">
                        <span class="detail-label">风险等级:</span>
                        <span class="detail-value ${this.getRiskClass(route.risk)}">${route.risk}</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">旅行时间:</span>
                        <span class="detail-value">${route.travelTime} 分钟</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">市场波动:</span>
                        <span class="detail-value">${Math.round(route.commodity.volatility * 100)}%</span>
                    </div>
                    <div class="detail-item">
                        <span class="detail-label">推荐指数:</span>
                        <span class="detail-value">${this.getRecommendationScore(route)}/10</span>
                    </div>
                </div>
            </div>
        `;
    }

    getRecommendationScore(route) {
        let score = 5; // 基础分数
        
        // 根据ROI调整
        if (route.roi > 50) score += 2;
        else if (route.roi > 25) score += 1;
        else if (route.roi < 10) score -= 1;
        
        // 根据风险调整
        switch (route.risk) {
            case 'LOW': score += 1; break;
            case 'HIGH': score -= 1; break;
            case 'ILLEGAL': score -= 2; break;
        }
        
        // 根据时间调整
        if (route.travelTime < 30) score += 1;
        else if (route.travelTime > 120) score -= 1;
        
        return Math.max(1, Math.min(10, score));
    }

    refreshRoutes() {
        this.updateMarketPrices();
        this.analyzeTradingRoutes();
        
        // 显示刷新动画
        const refreshBtn = document.getElementById('refreshPrices');
        if (refreshBtn) {
            refreshBtn.textContent = '[刷新中...]';
            refreshBtn.disabled = true;
            
            setTimeout(() => {
                refreshBtn.innerHTML = `
                    <span class="btn-bracket">[</span>
                    <span class="btn-text">REFRESH PRICES</span>
                    <span class="btn-bracket">]</span>
                `;
                refreshBtn.disabled = false;
                
                // 触发刷新完成事件（用于声音系统）
                document.dispatchEvent(new CustomEvent('tradeComplete', {
                    detail: { type: 'refresh', routeCount: this.tradeRoutes.length }
                }));
            }, 1500);
        }
    }

    exportRoutes() {
        const data = {
            timestamp: new Date().toISOString(),
            routes: this.tradeRoutes,
            marketData: this.marketData
        };
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `trade_routes_${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// 导出贸易系统
window.tradingSystem = new TradingSystem(); 