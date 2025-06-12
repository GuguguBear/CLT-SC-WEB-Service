// UEX Corp 增强贸易数据系统
class UEXEnhancedTrading {
    constructor() {
        this.apiBaseUrl = 'https://api.uexcorp.space/2.0';
        this.token = 'd55bc23a6fee307de57c1b07a24c25fe7996444d';
        
        // 缓存数据
        this.commodities = [];
        this.prices = {};
        this.routes = [];
        this.stations = [];
        this.terminals = [];
        
        // API使用管理
        this.apiUsage = this.loadApiUsage();
        this.lastUpdate = null;
        this.updateInterval = 4 * 60 * 60 * 1000; // 4小时更新
        
        console.log('🚀 UEX增强贸易系统已初始化');
    }

    // 加载API使用统计
    loadApiUsage() {
        try {
            const stored = localStorage.getItem('uex_trading_api_usage');
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.warn('⚠️ 加载API使用统计失败:', error);
        }
        
        return {
            requests_used: 0,
            daily_limit: 100,
            remaining: 100,
            last_reset: Date.now()
        };
    }

    // 保存API使用统计
    saveApiUsage() {
        try {
            localStorage.setItem('uex_trading_api_usage', JSON.stringify(this.apiUsage));
        } catch (error) {
            console.warn('⚠️ 保存API使用统计失败:', error);
        }
    }

    // 调用UEX API
    async callUEXAPI(endpoint, params = {}) {
        // 检查每日重置
        const now = Date.now();
        const daysSinceReset = (now - this.apiUsage.last_reset) / (24 * 60 * 60 * 1000);
        if (daysSinceReset >= 1) {
            this.apiUsage.requests_used = 0;
            this.apiUsage.remaining = this.apiUsage.daily_limit;
            this.apiUsage.last_reset = now;
        }

        // 检查API限制
        if (this.apiUsage.remaining < 1) {
            throw new Error('今日API请求已达限额');
        }

        try {
            const url = new URL(`${this.apiBaseUrl}/${endpoint}`);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            console.log(`📡 调用贸易API: ${endpoint}`);
            
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json'
                }
            });

            // 更新API使用统计
            this.apiUsage.requests_used++;
            this.apiUsage.remaining--;
            this.saveApiUsage();

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status}`);
            }

            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(`UEX API错误: ${data.message || 'Unknown error'}`);
            }

            return data.data;
        } catch (error) {
            console.error(`❌ 贸易API调用失败 (${endpoint}):`, error.message);
            throw error;
        }
    }

    // 初始化贸易系统
    async init() {
        try {
            // 检查缓存
            if (this.loadFromCache()) {
                const timeDiff = Date.now() - this.lastUpdate;
                if (timeDiff < this.updateInterval) {
                    console.log('📱 使用缓存的贸易数据');
                    this.updateTradingUI();
                    return;
                }
            }

            // 获取新数据
            await this.fetchTradingData();
            
            console.log('✅ UEX增强贸易系统初始化完成');
        } catch (error) {
            console.error('❌ UEX增强贸易系统初始化失败:', error);
        }
    }

    // 获取贸易数据
    async fetchTradingData() {
        console.log('📡 正在获取UEX贸易数据...');
        
        try {
            // 并行获取多种数据（小心API限制）
            const promises = [];
            
            if (this.apiUsage.remaining >= 4) {
                promises.push(
                    this.callUEXAPI('commodities').then(data => ({ type: 'commodities', data })),
                    this.callUEXAPI('commodities_prices_all').then(data => ({ type: 'prices', data })),
                    this.callUEXAPI('space_stations').then(data => ({ type: 'stations', data })),
                    this.callUEXAPI('terminals').then(data => ({ type: 'terminals', data }))
                );
            } else {
                // API余额不足，只获取最重要的数据
                if (this.apiUsage.remaining >= 2) {
                    promises.push(
                        this.callUEXAPI('commodities').then(data => ({ type: 'commodities', data })),
                        this.callUEXAPI('commodities_prices_all').then(data => ({ type: 'prices', data }))
                    );
                } else if (this.apiUsage.remaining >= 1) {
                    promises.push(
                        this.callUEXAPI('commodities').then(data => ({ type: 'commodities', data }))
                    );
                }
            }

            const results = await Promise.all(promises);
            
            // 处理结果
            results.forEach(result => {
                switch (result.type) {
                    case 'commodities':
                        this.commodities = result.data || [];
                        console.log(`✅ 获取到 ${this.commodities.length} 种商品`);
                        break;
                    case 'prices':
                        this.prices = this.processPriceData(result.data || []);
                        console.log(`✅ 获取到 ${Object.keys(this.prices).length} 个价格数据`);
                        break;
                    case 'stations':
                        this.stations = result.data || [];
                        console.log(`✅ 获取到 ${this.stations.length} 个空间站`);
                        break;
                    case 'terminals':
                        this.terminals = result.data || [];
                        console.log(`✅ 获取到 ${this.terminals.length} 个终端`);
                        break;
                }
            });

            // 分析贸易路线
            this.analyzeRoutes();
            
            this.lastUpdate = Date.now();
            this.saveToCache();
            this.updateTradingUI();
            
            console.log(`📊 贸易数据更新完成，API剩余: ${this.apiUsage.remaining}`);
            
        } catch (error) {
            console.error('❌ 获取贸易数据失败:', error);
            throw error;
        }
    }

    // 处理价格数据
    processPriceData(priceArray) {
        const priceMap = {};
        
        priceArray.forEach(price => {
            const key = `${price.commodity_slug}_${price.terminal_slug}`;
            priceMap[key] = {
                commodity: price.commodity_name,
                terminal: price.terminal_name,
                buy_price: price.price_buy,
                sell_price: price.price_sell,
                updated: price.date_modified
            };
        });
        
        return priceMap;
    }

    // 分析贸易路线
    analyzeRoutes() {
        console.log('🔍 分析最优贸易路线...');
        
        this.routes = [];
        const commodityGroups = this.groupCommoditiesByProfit();
        
        commodityGroups.forEach(group => {
            if (group.routes && group.routes.length > 0) {
                this.routes.push(...group.routes.slice(0, 5)); // 每种商品最多5条路线
            }
        });
        
        // 按利润排序
        this.routes.sort((a, b) => b.profit - a.profit);
        
        console.log(`✅ 分析完成，找到 ${this.routes.length} 条贸易路线`);
    }

    // 按利润分组商品
    groupCommoditiesByProfit() {
        const groups = {};
        
        this.commodities.forEach(commodity => {
            const routes = this.findRoutesForCommodity(commodity);
            
            if (routes.length > 0) {
                groups[commodity.slug] = {
                    commodity: commodity,
                    routes: routes
                };
            }
        });
        
        return Object.values(groups);
    }

    // 为特定商品查找路线
    findRoutesForCommodity(commodity) {
        const routes = [];
        const buyPrices = [];
        const sellPrices = [];
        
        // 收集买入和卖出价格
        Object.values(this.prices).forEach(price => {
            if (price.commodity === commodity.name) {
                if (price.buy_price > 0) {
                    buyPrices.push(price);
                }
                if (price.sell_price > 0) {
                    sellPrices.push(price);
                }
            }
        });
        
        // 计算路线
        buyPrices.forEach(buyPrice => {
            sellPrices.forEach(sellPrice => {
                if (buyPrice.terminal !== sellPrice.terminal && sellPrice.sell_price > buyPrice.buy_price) {
                    const profit = sellPrice.sell_price - buyPrice.buy_price;
                    const profitMargin = (profit / buyPrice.buy_price) * 100;
                    
                    routes.push({
                        commodity: commodity.name,
                        buy_location: buyPrice.terminal,
                        sell_location: sellPrice.terminal,
                        buy_price: buyPrice.buy_price,
                        sell_price: sellPrice.sell_price,
                        profit: profit,
                        profit_margin: profitMargin,
                        updated: Math.min(new Date(buyPrice.updated).getTime(), new Date(sellPrice.updated).getTime())
                    });
                }
            });
        });
        
        return routes.sort((a, b) => b.profit_margin - a.profit_margin).slice(0, 10);
    }

    // 更新贸易UI
    updateTradingUI() {
        this.updateTradingRoutes();
        this.updateCommodityPrices();
        this.updateStationInfo();
    }

    // 更新贸易路线显示
    updateTradingRoutes() {
        const routesList = document.getElementById('routesList');
        if (!routesList) return;

        if (this.routes.length === 0) {
            routesList.innerHTML = `
                <div class="no-routes-message">
                    <div class="no-routes-icon">📊</div>
                    <div class="no-routes-text">正在分析UEX贸易数据...</div>
                </div>
            `;
            return;
        }

        routesList.innerHTML = this.routes.slice(0, 20).map((route, index) => `
            <div class="route-item enhanced-route" data-route-index="${index}">
                <div class="route-header">
                    <div class="route-commodity">${route.commodity}</div>
                    <div class="route-profit">+${route.profit.toLocaleString()} UEC</div>
                </div>
                <div class="route-details">
                    <div class="route-path">
                        <span class="buy-location">📍 ${route.buy_location}</span>
                        <span class="route-arrow">→</span>
                        <span class="sell-location">📍 ${route.sell_location}</span>
                    </div>
                    <div class="route-prices">
                        <span class="buy-price">买入: ${route.buy_price.toLocaleString()} UEC</span>
                        <span class="sell-price">卖出: ${route.sell_price.toLocaleString()} UEC</span>
                        <span class="profit-margin">利润率: ${route.profit_margin.toFixed(1)}%</span>
                    </div>
                </div>
                <div class="route-meta">
                    <span class="data-age">数据时间: ${new Date(route.updated).toLocaleString('zh-CN')}</span>
                </div>
            </div>
        `).join('');

        // 绑定点击事件
        routesList.addEventListener('click', (e) => {
            const routeItem = e.target.closest('.route-item');
            if (routeItem) {
                const index = parseInt(routeItem.dataset.routeIndex);
                this.showRouteDetails(this.routes[index]);
            }
        });
    }

    // 显示路线详情
    showRouteDetails(route) {
        const detailsContainer = document.getElementById('routeDetails');
        if (!detailsContainer) return;

        detailsContainer.innerHTML = `
            <div class="enhanced-route-details">
                <div class="route-detail-header">
                    <h3>${route.commodity} 贸易路线</h3>
                    <div class="profit-highlight">+${route.profit.toLocaleString()} UEC (${route.profit_margin.toFixed(1)}%)</div>
                </div>
                
                <div class="route-path-detail">
                    <div class="location-card buy-card">
                        <h4>📍 买入地点</h4>
                        <div class="location-name">${route.buy_location}</div>
                        <div class="price-info">价格: ${route.buy_price.toLocaleString()} UEC</div>
                    </div>
                    
                    <div class="route-arrow-detail">→</div>
                    
                    <div class="location-card sell-card">
                        <h4>📍 卖出地点</h4>
                        <div class="location-name">${route.sell_location}</div>
                        <div class="price-info">价格: ${route.sell_price.toLocaleString()} UEC</div>
                    </div>
                </div>
                
                <div class="route-analysis">
                    <h4>路线分析</h4>
                    <div class="analysis-grid">
                        <div class="analysis-item">
                            <span class="label">商品:</span>
                            <span class="value">${route.commodity}</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">单位利润:</span>
                            <span class="value">${route.profit.toLocaleString()} UEC</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">利润率:</span>
                            <span class="value">${route.profit_margin.toFixed(2)}%</span>
                        </div>
                        <div class="analysis-item">
                            <span class="label">数据更新:</span>
                            <span class="value">${new Date(route.updated).toLocaleString('zh-CN')}</span>
                        </div>
                    </div>
                </div>
                
                <div class="investment-calculator">
                    <h4>投资计算器</h4>
                    <div class="calc-inputs">
                        <label>投资金额 (UEC):</label>
                        <input type="number" id="investment" value="100000" min="1000" step="1000">
                        <button onclick="window.uexEnhancedTrading.calculateInvestment(${route.buy_price}, ${route.profit})">计算收益</button>
                    </div>
                    <div id="investment-result" class="calc-result"></div>
                </div>
            </div>
        `;
    }

    // 计算投资收益
    calculateInvestment(buyPrice, profitPerUnit) {
        const investmentInput = document.getElementById('investment');
        const resultDiv = document.getElementById('investment-result');
        
        if (!investmentInput || !resultDiv) return;
        
        const investment = parseFloat(investmentInput.value) || 0;
        const units = Math.floor(investment / buyPrice);
        const totalProfit = units * profitPerUnit;
        const roi = (totalProfit / investment) * 100;
        
        resultDiv.innerHTML = `
            <div class="calc-results">
                <div class="calc-item">可购买: ${units.toLocaleString()} 单位</div>
                <div class="calc-item">总利润: ${totalProfit.toLocaleString()} UEC</div>
                <div class="calc-item">投资回报率: ${roi.toFixed(2)}%</div>
            </div>
        `;
    }

    // 缓存管理
    saveToCache() {
        try {
            const cacheData = {
                commodities: this.commodities,
                prices: this.prices,
                routes: this.routes,
                stations: this.stations,
                terminals: this.terminals,
                lastUpdate: this.lastUpdate,
                apiUsage: this.apiUsage,
                version: '1.0'
            };
            
            localStorage.setItem('uex_enhanced_trading_cache', JSON.stringify(cacheData));
            console.log('💾 贸易数据已缓存');
        } catch (error) {
            console.warn('⚠️ 贸易数据缓存失败:', error);
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem('uex_enhanced_trading_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                
                this.commodities = cacheData.commodities || [];
                this.prices = cacheData.prices || {};
                this.routes = cacheData.routes || [];
                this.stations = cacheData.stations || [];
                this.terminals = cacheData.terminals || [];
                this.lastUpdate = cacheData.lastUpdate;
                this.apiUsage = cacheData.apiUsage || this.apiUsage;
                
                console.log(`📱 已从缓存加载贸易数据`);
                return true;
            }
        } catch (error) {
            console.warn('⚠️ 贸易数据缓存加载失败:', error);
        }
        return false;
    }

    updateCommodityPrices() {
        // 更新商品价格显示的逻辑
    }

    updateStationInfo() {
        // 更新空间站信息的逻辑
    }

    // 手动刷新数据
    async refreshData() {
        console.log('🔄 手动刷新贸易数据...');
        
        if (this.apiUsage.remaining < 1) {
            alert('今日API请求已用完，请明天再试！');
            return;
        }
        
        await this.fetchTradingData();
    }
}

// 创建全局实例
window.uexEnhancedTrading = new UEXEnhancedTrading(); 