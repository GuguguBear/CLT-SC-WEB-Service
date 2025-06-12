// UEX贸易市场系统
class UEXTradingMarket {
    constructor() {
        this.apiBaseUrl = 'https://api.uexcorp.space/2.0';
        this.token = 'd55bc23a6fee307de57c1b07a24c25fe7996444d';
        
        // 市场数据
        this.commodities = [];
        this.prices = [];
        this.stations = [];
        this.terminals = [];
        this.routes = [];
        
        // API管理
        this.apiUsage = this.loadApiUsage();
        this.lastUpdate = null;
        this.updateInterval = 2 * 60 * 60 * 1000; // 2小时更新
        
        // UI状态
        this.currentView = 'overview';
        this.selectedCommodity = null;
        this.selectedRoute = null;
        
        console.log('🏪 UEX贸易市场系统已初始化');
    }

    async init() {
        try {
            // 创建贸易市场UI
            this.createTradingMarketUI();
            
            // 检查缓存
            if (this.loadFromCache()) {
                const timeDiff = Date.now() - this.lastUpdate;
                if (timeDiff < this.updateInterval) {
                    console.log('📱 使用缓存的贸易市场数据');
                    this.updateMarketUI();
                    return;
                }
            }

            // 获取新数据
            await this.fetchMarketData();
            
            console.log('✅ UEX贸易市场系统初始化完成');
        } catch (error) {
            console.error('❌ UEX贸易市场系统初始化失败:', error);
        }
    }

    createTradingMarketUI() {
        const tradingTab = document.getElementById('tradingTab');
        if (!tradingTab) return;

        tradingTab.innerHTML = `
            <div class="trading-market-fullscreen">
                <!-- 全屏标题栏 -->
                <div class="market-header-bar">
                    <div class="header-left">
                        <div class="market-logo">
                            <div class="logo-icon">🏪</div>
                            <div class="logo-text">
                                <div class="main-title">UEX TRADING MARKET</div>
                                <div class="sub-title">UNIVERSAL EXCHANGE CORPORATION</div>
                            </div>
                        </div>
                    </div>
                    
                    <div class="header-center">
                        <div class="market-status-display">
                            <div class="status-item">
                                <span class="status-label">API状态:</span>
                                <span class="status-indicator" id="marketApiStatus">🔄 连接中</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">数据更新:</span>
                                <span class="status-value" id="lastMarketUpdate">-</span>
                            </div>
                            <div class="status-item">
                                <span class="status-label">商品数量:</span>
                                <span class="status-value" id="commodityCount">-</span>
                            </div>
                        </div>
                    </div>
                    
                    <div class="header-right">
                        <button class="market-refresh-btn" id="refreshMarketData">
                            <span class="btn-icon">🔄</span>
                            <span class="btn-text">刷新数据</span>
                        </button>
                    </div>
                </div>

                <!-- 主导航栏 -->
                <div class="market-main-nav">
                    <div class="nav-tabs-container">
                        <button class="market-nav-tab active" data-view="overview">
                            <span class="tab-icon">📊</span>
                            <span class="tab-text">市场概览</span>
                        </button>
                        <button class="market-nav-tab" data-view="commodities">
                            <span class="tab-icon">📦</span>
                            <span class="tab-text">商品价格</span>
                        </button>
                        <button class="market-nav-tab" data-view="routes">
                            <span class="tab-icon">🚀</span>
                            <span class="tab-text">贸易路线</span>
                        </button>
                        <button class="market-nav-tab" data-view="stations">
                            <span class="tab-icon">🏢</span>
                            <span class="tab-text">空间站</span>
                        </button>
                        <button class="market-nav-tab" data-view="calculator">
                            <span class="tab-icon">💰</span>
                            <span class="tab-text">利润计算器</span>
                        </button>
                    </div>
                </div>

                <!-- 主内容区域 -->
                <div class="market-main-content">
                    <!-- 市场概览 -->
                    <div class="market-content-view active" id="overviewView">
                        <div class="overview-dashboard">
                            <div class="dashboard-section">
                                <div class="section-header">
                                    <h2>📈 热门商品</h2>
                                    <div class="section-controls">
                                        <select class="filter-select" id="hotCommodityFilter">
                                            <option value="profit">按利润排序</option>
                                            <option value="margin">按利润率排序</option>
                                            <option value="volume">按交易量排序</option>
                                        </select>
                                    </div>
                                </div>
                                <div class="hot-commodities-grid" id="hotCommoditiesGrid">
                                    <div class="loading-card">🔄 加载热门商品数据...</div>
                                </div>
                            </div>
                            
                            <div class="dashboard-section">
                                <div class="section-header">
                                    <h2>🚀 最佳路线</h2>
                                    <div class="section-controls">
                                        <input type="number" class="filter-input" id="routeInvestmentFilter" 
                                               placeholder="最大投资额 (UEC)" min="1000" step="1000">
                                    </div>
                                </div>
                                <div class="best-routes-list" id="bestRoutesList">
                                    <div class="loading-card">🔄 分析最佳贸易路线...</div>
                                </div>
                            </div>
                            
                            <div class="dashboard-section full-width">
                                <div class="section-header">
                                    <h2>📊 市场统计</h2>
                                </div>
                                <div class="market-stats-grid" id="marketStatsGrid">
                                    <div class="stat-card">
                                        <div class="stat-icon">📦</div>
                                        <div class="stat-content">
                                            <div class="stat-value" id="totalCommodities">-</div>
                                            <div class="stat-label">商品种类</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">💰</div>
                                        <div class="stat-content">
                                            <div class="stat-value" id="totalPrices">-</div>
                                            <div class="stat-label">价格记录</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">🏢</div>
                                        <div class="stat-content">
                                            <div class="stat-value" id="totalStations">-</div>
                                            <div class="stat-label">空间站</div>
                                        </div>
                                    </div>
                                    <div class="stat-card">
                                        <div class="stat-icon">🔄</div>
                                        <div class="stat-content">
                                            <div class="stat-value" id="apiUsagePercent">-</div>
                                            <div class="stat-label">API使用率</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 其他视图内容 -->
                    <div class="market-content-view" id="commoditiesView">
                        <div class="commodities-interface">
                            <div class="interface-header">
                                <div class="search-section">
                                    <input type="text" class="market-search-input" id="commoditySearchInput" 
                                           placeholder="搜索商品名称...">
                                </div>
                                <div class="filter-section">
                                    <select class="market-filter-select" id="commoditySortSelect">
                                        <option value="name">按名称排序</option>
                                        <option value="profit">按利润排序</option>
                                        <option value="margin">按利润率排序</option>
                                        <option value="volume">按交易量排序</option>
                                    </select>
                                </div>
                            </div>
                            <div class="commodities-data-grid" id="commoditiesDataGrid">
                                <div class="loading-message">🔄 加载商品数据...</div>
                            </div>
                        </div>
                    </div>

                    <div class="market-content-view" id="routesView">
                        <div class="routes-interface">
                            <div class="interface-header">
                                <div class="route-filters">
                                    <input type="number" class="market-filter-input" id="maxInvestmentInput" 
                                           placeholder="最大投资 (UEC)" min="1000" step="1000">
                                    <input type="number" class="market-filter-input" id="cargoCapacityInput" 
                                           placeholder="货舱容量 (SCU)" min="1" step="1">
                                    <select class="market-filter-select" id="routeSortSelect">
                                        <option value="profit">按总利润排序</option>
                                        <option value="roi">按投资回报率排序</option>
                                        <option value="efficiency">按时间效率排序</option>
                                    </select>
                                    <button class="analyze-routes-btn" id="analyzeRoutesBtn">
                                        <span class="btn-icon">🔍</span>
                                        <span class="btn-text">分析路线</span>
                                    </button>
                                </div>
                            </div>
                            <div class="routes-results-grid" id="routesResultsGrid">
                                <div class="analysis-prompt">
                                    <div class="prompt-icon">🚀</div>
                                    <div class="prompt-text">设置筛选条件并点击"分析路线"开始计算最优贸易路线</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="market-content-view" id="stationsView">
                        <div class="stations-interface">
                            <div class="interface-header">
                                <input type="text" class="market-search-input" id="stationSearchInput" 
                                       placeholder="搜索空间站名称...">
                            </div>
                            <div class="stations-data-grid" id="stationsDataGrid">
                                <div class="loading-message">🔄 加载空间站数据...</div>
                            </div>
                        </div>
                    </div>

                    <div class="market-content-view" id="calculatorView">
                        <div class="calculator-interface">
                            <div class="calculator-panels">
                                <div class="calculator-input-panel">
                                    <div class="panel-header">
                                        <h3>💰 贸易利润计算器</h3>
                                    </div>
                                    <div class="calculator-form">
                                        <div class="form-group">
                                            <label class="form-label">选择商品:</label>
                                            <select class="form-select" id="calcCommoditySelect">
                                                <option value="">选择商品...</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="form-label">买入地点:</label>
                                            <select class="form-select" id="calcBuyLocationSelect">
                                                <option value="">选择买入地点...</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="form-label">卖出地点:</label>
                                            <select class="form-select" id="calcSellLocationSelect">
                                                <option value="">选择卖出地点...</option>
                                            </select>
                                        </div>
                                        
                                        <div class="form-group">
                                            <label class="form-label">投资金额 (UEC):</label>
                                            <input type="number" class="form-input" id="calcInvestmentInput" 
                                                   value="100000" min="1000" step="1000">
                                        </div>
                                        
                                        <button class="calculate-profit-btn" id="calculateProfitBtn">
                                            <span class="btn-icon">🧮</span>
                                            <span class="btn-text">计算利润</span>
                                        </button>
                                    </div>
                                </div>
                                
                                <div class="calculator-result-panel">
                                    <div class="panel-header">
                                        <h3>📊 计算结果</h3>
                                    </div>
                                    <div class="calculation-results" id="calculationResults">
                                        <div class="result-placeholder">
                                            <div class="placeholder-icon">💡</div>
                                            <div class="placeholder-text">填写左侧信息并点击"计算利润"查看详细分析</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;

        // 绑定事件
        this.bindMarketEvents();
    }

    bindMarketEvents() {
        // 绑定导航标签事件
        document.querySelectorAll('.market-nav-tab').forEach(tab => {
            tab.addEventListener('click', (e) => {
                const viewName = e.currentTarget.dataset.view;
                this.switchView(viewName);
            });
        });

        // 绑定刷新按钮
        const refreshBtn = document.getElementById('refreshMarketData');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshAllData();
            });
        }

        // 绑定搜索和筛选事件
        this.bindSearchAndFilters();
        
        console.log('✅ UEX贸易市场事件已绑定');
    }

    switchView(viewName) {
        // 隐藏所有视图
        document.querySelectorAll('.market-content-view').forEach(view => {
            view.classList.remove('active');
        });

        // 移除所有标签的激活状态
        document.querySelectorAll('.market-nav-tab').forEach(tab => {
            tab.classList.remove('active');
        });

        // 显示目标视图
        const targetView = document.getElementById(viewName + 'View');
        if (targetView) {
            targetView.classList.add('active');
        }

        // 激活对应标签
        const targetTab = document.querySelector(`[data-view="${viewName}"]`);
        if (targetTab) {
            targetTab.classList.add('active');
        }

        // 根据视图加载相应数据
        this.loadViewData(viewName);
        
        console.log(`🔄 切换到视图: ${viewName}`);
    }

    bindSearchAndFilters() {
        // 商品搜索
        const commoditySearch = document.getElementById('commoditySearchInput');
        if (commoditySearch) {
            commoditySearch.addEventListener('input', (e) => {
                this.filterCommodities(e.target.value);
            });
        }

        // 商品排序
        const commoditySort = document.getElementById('commoditySortSelect');
        if (commoditySort) {
            commoditySort.addEventListener('change', (e) => {
                this.sortCommodities(e.target.value);
            });
        }

        // 路线分析按钮
        const analyzeBtn = document.getElementById('analyzeRoutesBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => {
                this.analyzeRoutes();
            });
        }

        // 利润计算按钮
        const calcBtn = document.getElementById('calculateProfitBtn');
        if (calcBtn) {
            calcBtn.addEventListener('click', () => {
                this.calculateProfit();
            });
        }

        // 空间站搜索
        const stationSearch = document.getElementById('stationSearchInput');
        if (stationSearch) {
            stationSearch.addEventListener('input', (e) => {
                this.filterStations(e.target.value);
            });
        }
    }

    async loadViewData(viewName) {
        switch (viewName) {
            case 'overview':
                await this.loadOverviewData();
                break;
            case 'commodities':
                await this.loadCommoditiesData();
                break;
            case 'routes':
                // 路线数据按需加载
                break;
            case 'stations':
                await this.loadStationsData();
                break;
            case 'calculator':
                await this.loadCalculatorData();
                break;
        }
    }

    async loadOverviewData() {
        try {
            // 更新统计数据
            this.updateMarketStats();
            
            // 加载热门商品
            await this.loadHotCommodities();
            
            // 加载最佳路线
            await this.loadBestRoutes();
            
        } catch (error) {
            console.error('❌ 加载概览数据失败:', error);
        }
    }

    updateMarketStats() {
        const stats = {
            totalCommodities: this.commodities.length,
            totalPrices: this.prices.length,
            totalStations: this.stations.length,
            apiUsagePercent: Math.round((this.apiUsage.requests_used / this.apiUsage.daily_limit) * 100)
        };

        // 更新统计卡片
        const totalCommoditiesEl = document.getElementById('totalCommodities');
        if (totalCommoditiesEl) totalCommoditiesEl.textContent = stats.totalCommodities;

        const totalPricesEl = document.getElementById('totalPrices');
        if (totalPricesEl) totalPricesEl.textContent = stats.totalPrices.toLocaleString();

        const totalStationsEl = document.getElementById('totalStations');
        if (totalStationsEl) totalStationsEl.textContent = stats.totalStations;

        const apiUsageEl = document.getElementById('apiUsagePercent');
        if (apiUsageEl) apiUsageEl.textContent = `${stats.apiUsagePercent}%`;

        // 更新状态显示
        const commodityCountEl = document.getElementById('commodityCount');
        if (commodityCountEl) commodityCountEl.textContent = stats.totalCommodities;

        const lastUpdateEl = document.getElementById('lastMarketUpdate');
        if (lastUpdateEl) lastUpdateEl.textContent = new Date(this.lastUpdate).toLocaleTimeString('zh-CN');

        const apiStatusEl = document.getElementById('marketApiStatus');
        if (apiStatusEl) {
            if (stats.apiUsagePercent < 90) {
                apiStatusEl.textContent = '✅ 正常';
                apiStatusEl.style.color = '#00ff88';
            } else {
                apiStatusEl.textContent = '⚠️ 接近限制';
                apiStatusEl.style.color = '#ffaa00';
            }
        }
    }

    async loadHotCommodities() {
        const hotCommoditiesGrid = document.getElementById('hotCommoditiesGrid');
        if (!hotCommoditiesGrid) return;

        // 计算热门商品（基于利润率）
        const hotCommodities = this.calculateHotCommodities();
        
        if (hotCommodities.length === 0) {
            hotCommoditiesGrid.innerHTML = '<div class="loading-card">暂无热门商品数据</div>';
            return;
        }

        hotCommoditiesGrid.innerHTML = hotCommodities.slice(0, 6).map(commodity => `
            <div class="commodity-card" data-commodity="${commodity.name}">
                <div class="commodity-name">${commodity.name}</div>
                <div class="commodity-profit">+${commodity.maxProfit.toLocaleString()} UEC</div>
                <div class="commodity-margin">利润率: ${commodity.profitMargin.toFixed(1)}%</div>
                <div class="commodity-volume">交易量: ${commodity.volume || 'N/A'}</div>
            </div>
        `).join('');

        // 绑定点击事件
        hotCommoditiesGrid.querySelectorAll('.commodity-card').forEach(card => {
            card.addEventListener('click', (e) => {
                const commodityName = e.currentTarget.dataset.commodity;
                this.showCommodityDetails(commodityName);
            });
        });
    }

    calculateHotCommodities() {
        const commodityProfits = new Map();

        // 计算每个商品的最大利润
        this.prices.forEach(price => {
            const commodity = price.commodity_name;
            if (!commodityProfits.has(commodity)) {
                commodityProfits.set(commodity, {
                    name: commodity,
                    minPrice: price.price_sell || price.price_buy,
                    maxPrice: price.price_sell || price.price_buy,
                    buyPrices: [],
                    sellPrices: []
                });
            }

            const data = commodityProfits.get(commodity);
            if (price.price_buy) data.buyPrices.push(price.price_buy);
            if (price.price_sell) data.sellPrices.push(price.price_sell);
        });

        // 计算利润和利润率
        const results = [];
        commodityProfits.forEach(data => {
            if (data.buyPrices.length > 0 && data.sellPrices.length > 0) {
                const minBuy = Math.min(...data.buyPrices);
                const maxSell = Math.max(...data.sellPrices);
                const profit = maxSell - minBuy;
                const margin = (profit / minBuy) * 100;

                if (profit > 0) {
                    results.push({
                        name: data.name,
                        maxProfit: profit,
                        profitMargin: margin,
                        minBuyPrice: minBuy,
                        maxSellPrice: maxSell,
                        volume: data.buyPrices.length + data.sellPrices.length
                    });
                }
            }
        });

        return results.sort((a, b) => b.profitMargin - a.profitMargin);
    }

    async loadBestRoutes() {
        const bestRoutesList = document.getElementById('bestRoutesList');
        if (!bestRoutesList) return;

        const routes = this.calculateBestRoutes(5); // 获取前5条路线
        
        if (routes.length === 0) {
            bestRoutesList.innerHTML = '<div class="loading-card">暂无最佳路线数据</div>';
            return;
        }

        bestRoutesList.innerHTML = routes.map(route => `
            <div class="route-card">
                <div class="route-header">
                    <div class="route-commodity">${route.commodity}</div>
                    <div class="route-profit">+${route.profit.toLocaleString()} UEC</div>
                </div>
                <div class="route-details">
                    <div>买入: ${route.buyLocation}</div>
                    <div>卖出: ${route.sellLocation}</div>
                    <div>投资: ${route.investment.toLocaleString()} UEC</div>
                    <div>回报率: ${route.roi.toFixed(1)}%</div>
                </div>
            </div>
        `).join('');
    }

    calculateBestRoutes(limit = 10) {
        const routes = [];
        const commodityPrices = new Map();

        // 按商品分组价格数据
        this.prices.forEach(price => {
            const commodity = price.commodity_name;
            if (!commodityPrices.has(commodity)) {
                commodityPrices.set(commodity, { buy: [], sell: [] });
            }
            
            const data = commodityPrices.get(commodity);
            if (price.price_buy) {
                data.buy.push({
                    price: price.price_buy,
                    location: price.location_name,
                    station: price.station_name
                });
            }
            if (price.price_sell) {
                data.sell.push({
                    price: price.price_sell,
                    location: price.location_name,
                    station: price.station_name
                });
            }
        });

        // 计算最佳路线
        commodityPrices.forEach((data, commodity) => {
            if (data.buy.length > 0 && data.sell.length > 0) {
                // 找到最低买价和最高卖价
                const bestBuy = data.buy.reduce((min, current) => 
                    current.price < min.price ? current : min
                );
                const bestSell = data.sell.reduce((max, current) => 
                    current.price > max.price ? current : max
                );

                const profit = bestSell.price - bestBuy.price;
                if (profit > 0) {
                    const investment = bestBuy.price * 100; // 假设购买100单位
                    const totalProfit = profit * 100;
                    const roi = (totalProfit / investment) * 100;

                    routes.push({
                        commodity,
                        buyLocation: `${bestBuy.location} - ${bestBuy.station}`,
                        sellLocation: `${bestSell.location} - ${bestSell.station}`,
                        buyPrice: bestBuy.price,
                        sellPrice: bestSell.price,
                        profit: totalProfit,
                        investment,
                        roi
                    });
                }
            }
        });

        return routes.sort((a, b) => b.roi - a.roi).slice(0, limit);
    }

    // 其他方法的占位符
    async loadCommoditiesData() {
        console.log('🔄 加载商品数据...');
        // 实现商品数据加载
    }

    async loadStationsData() {
        console.log('🔄 加载空间站数据...');
        // 实现空间站数据加载
    }

    async loadCalculatorData() {
        console.log('🔄 加载计算器数据...');
        // 实现计算器数据加载
    }

    filterCommodities(searchTerm) {
        console.log('🔍 筛选商品:', searchTerm);
        // 实现商品筛选
    }

    sortCommodities(sortBy) {
        console.log('📊 排序商品:', sortBy);
        // 实现商品排序
    }

    analyzeRoutes() {
        console.log('🚀 分析路线...');
        // 实现路线分析
    }

    calculateProfit() {
        console.log('💰 计算利润...');
        // 实现利润计算
    }

    filterStations(searchTerm) {
        console.log('🔍 筛选空间站:', searchTerm);
        // 实现空间站筛选
    }

    showCommodityDetails(commodityName) {
        console.log('📦 显示商品详情:', commodityName);
        // 实现商品详情显示
    }

    async refreshAllData() {
        console.log('🔄 刷新所有数据...');
        try {
            await this.fetchUEXData();
            this.updateMarketStats();
            await this.loadOverviewData();
            console.log('✅ 数据刷新完成');
        } catch (error) {
            console.error('❌ 数据刷新失败:', error);
        }
    }

    async fetchMarketData() {
        console.log('📡 正在获取UEX贸易市场数据...');
        
        try {
            // 检查API余额
            if (this.apiUsage.remaining < 3) {
                throw new Error('API请求余额不足');
            }

            // 并行获取数据
            const promises = [
                this.callUEXAPI('commodities').then(data => ({ type: 'commodities', data })),
                this.callUEXAPI('commodities_prices_all').then(data => ({ type: 'prices', data })),
                this.callUEXAPI('space_stations').then(data => ({ type: 'stations', data }))
            ];

            const results = await Promise.all(promises);
            
            // 处理结果
            results.forEach(result => {
                switch (result.type) {
                    case 'commodities':
                        this.commodities = result.data || [];
                        console.log(`✅ 获取到 ${this.commodities.length} 种商品`);
                        break;
                    case 'prices':
                        this.prices = result.data || [];
                        console.log(`✅ 获取到 ${this.prices.length} 条价格记录`);
                        break;
                    case 'stations':
                        this.stations = result.data || [];
                        console.log(`✅ 获取到 ${this.stations.length} 个空间站`);
                        break;
                }
            });

            // 分析贸易路线
            this.analyzeMarketRoutes();
            
            this.lastUpdate = Date.now();
            this.saveToCache();
            this.updateMarketUI();
            
            console.log(`📊 贸易市场数据更新完成`);
            
        } catch (error) {
            console.error('❌ 获取贸易市场数据失败:', error);
            this.updateMarketStatus('error', error.message);
        }
    }

    analyzeMarketRoutes() {
        console.log('🔍 分析贸易市场路线...');
        
        this.routes = [];
        const commodityMap = new Map();
        
        // 按商品分组价格数据
        this.prices.forEach(price => {
            if (!commodityMap.has(price.commodity_slug)) {
                commodityMap.set(price.commodity_slug, {
                    commodity: price.commodity_name,
                    buyPrices: [],
                    sellPrices: []
                });
            }
            
            const commodity = commodityMap.get(price.commodity_slug);
            if (price.price_buy > 0) {
                commodity.buyPrices.push(price);
            }
            if (price.price_sell > 0) {
                commodity.sellPrices.push(price);
            }
        });
        
        // 计算路线
        commodityMap.forEach((commodity, slug) => {
            commodity.buyPrices.forEach(buyPrice => {
                commodity.sellPrices.forEach(sellPrice => {
                    if (buyPrice.terminal_slug !== sellPrice.terminal_slug && 
                        sellPrice.price_sell > buyPrice.price_buy) {
                        
                        const profit = sellPrice.price_sell - buyPrice.price_buy;
                        const profitMargin = (profit / buyPrice.price_buy) * 100;
                        
                        this.routes.push({
                            commodity: commodity.commodity,
                            commodity_slug: slug,
                            buy_location: buyPrice.terminal_name,
                            sell_location: sellPrice.terminal_name,
                            buy_price: buyPrice.price_buy,
                            sell_price: sellPrice.price_sell,
                            profit: profit,
                            profit_margin: profitMargin,
                            updated: Math.min(
                                new Date(buyPrice.date_modified).getTime(),
                                new Date(sellPrice.date_modified).getTime()
                            )
                        });
                    }
                });
            });
        });
        
        // 按利润率排序
        this.routes.sort((a, b) => b.profit_margin - a.profit_margin);
        
        console.log(`✅ 分析完成，找到 ${this.routes.length} 条贸易路线`);
    }

    updateMarketUI() {
        this.updateMarketStatus('connected', '市场数据已更新');
        
        // 根据当前视图更新相应数据
        switch (this.currentView) {
            case 'overview':
                this.updateOverviewData();
                break;
            case 'commodities':
                this.updateCommoditiesData();
                break;
            case 'routes':
                this.updateRoutesData();
                break;
            case 'stations':
                this.updateStationsData();
                break;
            case 'calculator':
                this.updateCalculatorData();
                break;
        }
    }

    updateMarketStatus(status, message) {
        const statusEl = document.getElementById('marketStatus');
        if (statusEl) {
            statusEl.className = `status-indicator ${status}`;
            statusEl.textContent = message;
        }
    }

    updateOverviewData() {
        // 更新热门商品
        const hotCommodities = this.getHotCommodities();
        const hotCommoditiesEl = document.getElementById('hotCommodities');
        if (hotCommoditiesEl) {
            hotCommoditiesEl.innerHTML = hotCommodities.map(commodity => `
                <div class="hot-commodity-item">
                    <div class="commodity-name">${commodity.name}</div>
                    <div class="commodity-profit">+${commodity.avgProfit.toFixed(0)} UEC</div>
                    <div class="commodity-margin">${commodity.avgMargin.toFixed(1)}%</div>
                </div>
            `).join('');
        }

        // 更新最佳路线
        const topRoutes = this.routes.slice(0, 5);
        const topRoutesEl = document.getElementById('topRoutes');
        if (topRoutesEl) {
            topRoutesEl.innerHTML = topRoutes.map(route => `
                <div class="top-route-item">
                    <div class="route-commodity">${route.commodity}</div>
                    <div class="route-path">${route.buy_location} → ${route.sell_location}</div>
                    <div class="route-profit">+${route.profit.toFixed(0)} UEC (${route.profit_margin.toFixed(1)}%)</div>
                </div>
            `).join('');
        }

        // 更新市场统计
        document.getElementById('commodityCount').textContent = this.commodities.length;
        document.getElementById('priceCount').textContent = this.prices.length;
        document.getElementById('stationCount').textContent = this.stations.length;
        document.getElementById('lastUpdateTime').textContent = 
            this.lastUpdate ? new Date(this.lastUpdate).toLocaleString('zh-CN') : '未知';
    }

    getHotCommodities() {
        const commodityStats = new Map();
        
        this.routes.forEach(route => {
            if (!commodityStats.has(route.commodity)) {
                commodityStats.set(route.commodity, {
                    name: route.commodity,
                    profits: [],
                    margins: []
                });
            }
            
            const stats = commodityStats.get(route.commodity);
            stats.profits.push(route.profit);
            stats.margins.push(route.profit_margin);
        });
        
        const hotCommodities = [];
        commodityStats.forEach((stats, name) => {
            const avgProfit = stats.profits.reduce((a, b) => a + b, 0) / stats.profits.length;
            const avgMargin = stats.margins.reduce((a, b) => a + b, 0) / stats.margins.length;
            
            hotCommodities.push({
                name,
                avgProfit,
                avgMargin,
                routeCount: stats.profits.length
            });
        });
        
        return hotCommodities
            .sort((a, b) => b.avgMargin - a.avgMargin)
            .slice(0, 10);
    }

    // API调用方法（复用之前的逻辑）
    async callUEXAPI(endpoint, params = {}) {
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

    // 缓存管理方法
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

    saveApiUsage() {
        try {
            localStorage.setItem('uex_trading_api_usage', JSON.stringify(this.apiUsage));
        } catch (error) {
            console.warn('⚠️ 保存API使用统计失败:', error);
        }
    }

    saveToCache() {
        try {
            const cacheData = {
                commodities: this.commodities,
                prices: this.prices,
                stations: this.stations,
                routes: this.routes,
                lastUpdate: this.lastUpdate,
                version: '1.0'
            };
            
            localStorage.setItem('uex_trading_market_cache', JSON.stringify(cacheData));
            console.log('💾 贸易市场数据已缓存');
        } catch (error) {
            console.warn('⚠️ 贸易市场数据缓存失败:', error);
        }
    }

    loadFromCache() {
        try {
            const cached = localStorage.getItem('uex_trading_market_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                
                this.commodities = cacheData.commodities || [];
                this.prices = cacheData.prices || [];
                this.stations = cacheData.stations || [];
                this.routes = cacheData.routes || [];
                this.lastUpdate = cacheData.lastUpdate;
                
                console.log(`📱 已从缓存加载贸易市场数据`);
                return true;
            }
        } catch (error) {
            console.warn('⚠️ 贸易市场数据缓存加载失败:', error);
        }
        return false;
    }

    // 其他方法的占位符
    updateCommoditiesData() {
        console.log('📦 更新商品数据视图');
    }

    updateRoutesData() {
        console.log('🚀 更新路线数据视图');
    }

    updateStationsData() {
        console.log('🏢 更新空间站数据视图');
    }

    updateCalculatorData() {
        console.log('💰 更新计算器数据视图');
    }

    async refreshMarketData() {
        console.log('🔄 手动刷新贸易市场数据...');
        await this.fetchMarketData();
    }

    analyzeOptimalRoutes() {
        console.log('🔍 分析最优贸易路线...');
    }

    calculateTradeProfit() {
        console.log('🧮 计算贸易利润...');
    }

    filterCommodities(query) {
        console.log('🔍 过滤商品:', query);
    }

    filterStations(query) {
        console.log('🔍 过滤空间站:', query);
    }
}

// 创建全局实例
window.uexTradingMarket = new UEXTradingMarket(); 