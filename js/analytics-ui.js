/**
 * 高级分析系统用户界面 - 第4阶段
 * 包含3D图表、AI预测界面、风险评估面板和优化建议界面
 */

class AnalyticsUI {
    constructor() {
        this.isInitialized = false;
        this.currentView = 'overview';
        this.charts = new Map();
        this.panels = new Map();
        this.animationFrameId = null;
        
        // UI配置
        this.config = {
            refreshInterval: 5000,
            chartUpdateInterval: 1000,
            animationDuration: 300,
            maxDataPoints: 100,
            colorScheme: {
                primary: '#ff6600',
                secondary: '#0066ff',
                success: '#00ff66',
                warning: '#ffcc00',
                danger: '#ff3366',
                background: '#1a1a1a',
                surface: '#2a2a2a',
                text: '#ffffff'
            }
        };
        
        // 3D图表配置
        this.chart3DConfig = {
            width: 800,
            height: 600,
            depth: 400,
            perspective: 1000,
            rotationSpeed: 0.005,
            enableInteraction: true
        };
        
        this.init();
    }
    
    async init() {
        try {
            console.log('[AnalyticsUI] 初始化高级分析UI...');
            
            // 创建主容器
            this.createMainContainer();
            
            // 创建导航面板
            this.createNavigationPanel();
            
            // 创建概览仪表板
            this.createOverviewDashboard();
            
            // 创建AI预测面板
            this.createPredictionPanel();
            
            // 创建风险评估面板
            this.createRiskAssessmentPanel();
            
            // 创建优化建议面板
            this.createOptimizationPanel();
            
            // 创建3D图表容器
            this.create3DChartContainer();
            
            // 绑定事件监听器
            this.bindEventListeners();
            
            // 启动更新循环
            this.startUpdateLoop();
            
            this.isInitialized = true;
            console.log('[AnalyticsUI] 高级分析UI初始化完成');
        } catch (error) {
            console.error('[AnalyticsUI] 初始化失败:', error);
        }
    }
    
    // 创建主容器
    createMainContainer() {
        // 检查是否已存在
        let container = document.getElementById('analyticsContainer');
        if (container) {
            container.remove();
        }
        
        container = document.createElement('div');
        container.id = 'analyticsContainer';
        container.className = 'analytics-container';
        container.style.display = 'none';
        
        container.innerHTML = `
            <div class="analytics-header">
                <div class="header-title">
                    <span class="title-icon">◆</span>
                    <span class="title-text">ADVANCED ANALYTICS SYSTEM</span>
                    <span class="title-version">v4.0</span>
                </div>
                <div class="header-status">
                    <div class="status-indicator online" id="systemStatus"></div>
                    <span class="status-text" id="systemStatusText">SYSTEM ONLINE</span>
                </div>
            </div>
            
            <div class="analytics-navigation" id="analyticsNavigation">
                <!-- 导航将在这里动态生成 -->
            </div>
            
            <div class="analytics-content" id="analyticsContent">
                <!-- 内容面板将在这里动态生成 -->
            </div>
            
            <div class="analytics-footer">
                <div class="footer-stats" id="analyticsStats">
                    <!-- 统计信息将在这里显示 -->
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        console.log('[AnalyticsUI] 主容器已创建');
    }
    
    // 创建导航面板
    createNavigationPanel() {
        const navigation = document.getElementById('analyticsNavigation');
        
        const navItems = [
            { id: 'overview', label: 'OVERVIEW', icon: '◆' },
            { id: 'predictions', label: 'AI PREDICTIONS', icon: '◇' },
            { id: 'risk', label: 'RISK ASSESSMENT', icon: '◈' },
            { id: 'optimization', label: 'OPTIMIZATION', icon: '◉' },
            { id: 'charts3d', label: '3D ANALYSIS', icon: '◎' }
        ];
        
        navigation.innerHTML = navItems.map(item => `
            <div class="nav-item ${item.id === 'overview' ? 'active' : ''}" 
                 data-view="${item.id}" 
                 onclick="window.analyticsUI.switchView('${item.id}')">
                <span class="nav-icon">${item.icon}</span>
                <span class="nav-label">${item.label}</span>
                <div class="nav-indicator"></div>
            </div>
        `).join('');
        
        console.log('[AnalyticsUI] 导航面板已创建');
    }
    
    // 创建概览仪表板
    createOverviewDashboard() {
        const overviewPanel = document.createElement('div');
        overviewPanel.id = 'overviewPanel';
        overviewPanel.className = 'analytics-panel active';
        
        overviewPanel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">SYSTEM OVERVIEW</h2>
                <div class="panel-controls">
                    <button class="control-btn" onclick="window.analyticsUI.refreshData()">
                        <span class="btn-icon">⟲</span>
                        <span class="btn-text">REFRESH</span>
                    </button>
                </div>
            </div>
            
            <div class="overview-grid">
                <div class="overview-card">
                    <div class="card-header">
                        <span class="card-icon">◆</span>
                        <span class="card-title">SYSTEM METRICS</span>
                    </div>
                    <div class="card-content" id="systemMetrics">
                        <div class="metric-row">
                            <span class="metric-label">PREDICTION ACCURACY:</span>
                            <span class="metric-value" id="predictionAccuracy">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">RISK ASSESSMENT:</span>
                            <span class="metric-value" id="riskAccuracy">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">OPTIMIZATION SCORE:</span>
                            <span class="metric-value" id="optimizationScore">--</span>
                        </div>
                        <div class="metric-row">
                            <span class="metric-label">SYSTEM RELIABILITY:</span>
                            <span class="metric-value" id="systemReliability">--</span>
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">
                        <span class="card-icon">◇</span>
                        <span class="card-title">MARKET DATA</span>
                    </div>
                    <div class="card-content" id="marketOverview">
                        <div class="market-grid" id="marketGrid">
                            <!-- 市场数据将在这里显示 -->
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">
                        <span class="card-icon">◈</span>
                        <span class="card-title">RISK ALERTS</span>
                    </div>
                    <div class="card-content" id="riskAlerts">
                        <div class="alerts-list" id="alertsList">
                            <!-- 风险警报将在这里显示 -->
                        </div>
                    </div>
                </div>
                
                <div class="overview-card">
                    <div class="card-header">
                        <span class="card-icon">◉</span>
                        <span class="card-title">RECENT PREDICTIONS</span>
                    </div>
                    <div class="card-content" id="recentPredictions">
                        <div class="predictions-list" id="predictionsList">
                            <!-- 最近预测将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').appendChild(overviewPanel);
        this.panels.set('overview', overviewPanel);
        console.log('[AnalyticsUI] 概览仪表板已创建');
    }
    
    // 创建AI预测面板
    createPredictionPanel() {
        const predictionPanel = document.createElement('div');
        predictionPanel.id = 'predictionPanel';
        predictionPanel.className = 'analytics-panel';
        
        predictionPanel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">AI PREDICTION SYSTEM</h2>
                <div class="panel-controls">
                    <select class="control-select" id="predictionSource">
                        <option value="all">ALL SOURCES</option>
                        <option value="Crusader_Industries_Hub">CRUSADER HUB</option>
                        <option value="Microtech_Trade_Center">MICROTECH CENTER</option>
                        <option value="ArcCorp_Mining_Exchange">ARCCORP EXCHANGE</option>
                        <option value="Hurston_Commodity_Market">HURSTON MARKET</option>
                        <option value="Stanton_Central_Exchange">STANTON EXCHANGE</option>
                    </select>
                    <button class="control-btn" onclick="window.analyticsUI.generatePrediction()">
                        <span class="btn-icon">⚡</span>
                        <span class="btn-text">PREDICT</span>
                    </button>
                </div>
            </div>
            
            <div class="prediction-grid">
                <div class="prediction-card large">
                    <div class="card-header">
                        <span class="card-icon">🧠</span>
                        <span class="card-title">NEURAL NETWORK ANALYSIS</span>
                    </div>
                    <div class="card-content">
                        <div class="neural-visualization" id="neuralVisualization">
                            <canvas id="neuralCanvas" width="400" height="300"></canvas>
                        </div>
                        <div class="neural-stats" id="neuralStats">
                            <div class="stat-item">
                                <span class="stat-label">CONFIDENCE:</span>
                                <span class="stat-value" id="predictionConfidence">--</span>
                            </div>
                            <div class="stat-item">
                                <span class="stat-label">TREND:</span>
                                <span class="stat-value" id="predictionTrend">--</span>
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="prediction-card">
                    <div class="card-header">
                        <span class="card-icon">📈</span>
                        <span class="card-title">PRICE FORECAST</span>
                    </div>
                    <div class="card-content">
                        <div class="forecast-chart" id="forecastChart">
                            <canvas id="forecastCanvas" width="300" height="200"></canvas>
                        </div>
                        <div class="forecast-details" id="forecastDetails">
                            <!-- 预测详情将在这里显示 -->
                        </div>
                    </div>
                </div>
                
                <div class="prediction-card">
                    <div class="card-header">
                        <span class="card-icon">⚖️</span>
                        <span class="card-title">PROBABILITY ANALYSIS</span>
                    </div>
                    <div class="card-content">
                        <div class="probability-bars" id="probabilityBars">
                            <div class="prob-bar">
                                <span class="prob-label">BULLISH:</span>
                                <div class="prob-track">
                                    <div class="prob-fill bullish" id="bullishProb"></div>
                                </div>
                                <span class="prob-value" id="bullishValue">--</span>
                            </div>
                            <div class="prob-bar">
                                <span class="prob-label">NEUTRAL:</span>
                                <div class="prob-track">
                                    <div class="prob-fill neutral" id="neutralProb"></div>
                                </div>
                                <span class="prob-value" id="neutralValue">--</span>
                            </div>
                            <div class="prob-bar">
                                <span class="prob-label">BEARISH:</span>
                                <div class="prob-track">
                                    <div class="prob-fill bearish" id="bearishProb"></div>
                                </div>
                                <span class="prob-value" id="bearishValue">--</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').appendChild(predictionPanel);
        this.panels.set('predictions', predictionPanel);
        console.log('[AnalyticsUI] AI预测面板已创建');
    }
    
    // 创建风险评估面板
    createRiskAssessmentPanel() {
        const riskPanel = document.createElement('div');
        riskPanel.id = 'riskPanel';
        riskPanel.className = 'analytics-panel';
        
        riskPanel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">RISK ASSESSMENT CENTER</h2>
                <div class="panel-controls">
                    <div class="risk-level-indicator" id="overallRiskLevel">
                        <span class="risk-label">OVERALL RISK:</span>
                        <span class="risk-value" id="overallRiskValue">CALCULATING...</span>
                    </div>
                </div>
            </div>
            
            <div class="risk-grid">
                <div class="risk-card large">
                    <div class="card-header">
                        <span class="card-icon">⚠️</span>
                        <span class="card-title">RISK MATRIX</span>
                    </div>
                    <div class="card-content">
                        <div class="risk-matrix" id="riskMatrix">
                            <canvas id="riskMatrixCanvas" width="400" height="300"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="risk-card">
                    <div class="card-header">
                        <span class="card-icon">📊</span>
                        <span class="card-title">VOLATILITY ANALYSIS</span>
                    </div>
                    <div class="card-content">
                        <div class="volatility-chart" id="volatilityChart">
                            <canvas id="volatilityCanvas" width="300" height="200"></canvas>
                        </div>
                        <div class="volatility-stats" id="volatilityStats">
                            <!-- 波动率统计将在这里显示 -->
                        </div>
                    </div>
                </div>
                
                <div class="risk-card">
                    <div class="card-header">
                        <span class="card-icon">💧</span>
                        <span class="card-title">LIQUIDITY RISK</span>
                    </div>
                    <div class="card-content">
                        <div class="liquidity-gauge" id="liquidityGauge">
                            <canvas id="liquidityCanvas" width="200" height="200"></canvas>
                        </div>
                        <div class="liquidity-details" id="liquidityDetails">
                            <!-- 流动性详情将在这里显示 -->
                        </div>
                    </div>
                </div>
                
                <div class="risk-card">
                    <div class="card-header">
                        <span class="card-icon">🎯</span>
                        <span class="card-title">CONCENTRATION RISK</span>
                    </div>
                    <div class="card-content">
                        <div class="concentration-pie" id="concentrationPie">
                            <canvas id="concentrationCanvas" width="200" height="200"></canvas>
                        </div>
                        <div class="concentration-legend" id="concentrationLegend">
                            <!-- 集中度图例将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
            
            <div class="risk-alerts-section">
                <div class="section-header">
                    <h3 class="section-title">ACTIVE RISK ALERTS</h3>
                </div>
                <div class="alerts-container" id="activeAlerts">
                    <!-- 活跃风险警报将在这里显示 -->
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').appendChild(riskPanel);
        this.panels.set('risk', riskPanel);
        console.log('[AnalyticsUI] 风险评估面板已创建');
    }
    
    // 创建优化建议面板
    createOptimizationPanel() {
        const optimizationPanel = document.createElement('div');
        optimizationPanel.id = 'optimizationPanel';
        optimizationPanel.className = 'analytics-panel';
        
        optimizationPanel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">PORTFOLIO OPTIMIZATION</h2>
                <div class="panel-controls">
                    <button class="control-btn" onclick="window.analyticsUI.runOptimization()">
                        <span class="btn-icon">⚙️</span>
                        <span class="btn-text">OPTIMIZE</span>
                    </button>
                </div>
            </div>
            
            <div class="optimization-grid">
                <div class="optimization-card large">
                    <div class="card-header">
                        <span class="card-icon">🧬</span>
                        <span class="card-title">GENETIC ALGORITHM OPTIMIZATION</span>
                    </div>
                    <div class="card-content">
                        <div class="optimization-progress" id="optimizationProgress">
                            <div class="progress-header">
                                <span class="progress-label">GENERATION:</span>
                                <span class="progress-value" id="currentGeneration">0</span>
                                <span class="progress-separator">/</span>
                                <span class="progress-total" id="totalGenerations">50</span>
                            </div>
                            <div class="progress-bar">
                                <div class="progress-fill" id="progressFill"></div>
                            </div>
                            <div class="progress-stats">
                                <span class="stat-item">BEST FITNESS: <span id="bestFitness">--</span></span>
                                <span class="stat-item">CONVERGENCE: <span id="convergence">--</span></span>
                            </div>
                        </div>
                        <div class="fitness-chart" id="fitnessChart">
                            <canvas id="fitnessCanvas" width="500" height="250"></canvas>
                        </div>
                    </div>
                </div>
                
                <div class="optimization-card">
                    <div class="card-header">
                        <span class="card-icon">📋</span>
                        <span class="card-title">CURRENT PORTFOLIO</span>
                    </div>
                    <div class="card-content">
                        <div class="portfolio-allocation" id="currentAllocation">
                            <canvas id="currentPortfolioCanvas" width="250" height="250"></canvas>
                        </div>
                        <div class="portfolio-stats" id="currentPortfolioStats">
                            <!-- 当前投资组合统计 -->
                        </div>
                    </div>
                </div>
                
                <div class="optimization-card">
                    <div class="card-header">
                        <span class="card-icon">✨</span>
                        <span class="card-title">OPTIMIZED PORTFOLIO</span>
                    </div>
                    <div class="card-content">
                        <div class="portfolio-allocation" id="optimizedAllocation">
                            <canvas id="optimizedPortfolioCanvas" width="250" height="250"></canvas>
                        </div>
                        <div class="portfolio-stats" id="optimizedPortfolioStats">
                            <!-- 优化后投资组合统计 -->
                        </div>
                    </div>
                </div>
                
                <div class="optimization-card">
                    <div class="card-header">
                        <span class="card-icon">💡</span>
                        <span class="card-title">RECOMMENDATIONS</span>
                    </div>
                    <div class="card-content">
                        <div class="recommendations-list" id="recommendationsList">
                            <!-- 优化建议将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').appendChild(optimizationPanel);
        this.panels.set('optimization', optimizationPanel);
        console.log('[AnalyticsUI] 优化建议面板已创建');
    }
    
    // 创建3D图表容器
    create3DChartContainer() {
        const chart3DPanel = document.createElement('div');
        chart3DPanel.id = 'chart3DPanel';
        chart3DPanel.className = 'analytics-panel';
        
        chart3DPanel.innerHTML = `
            <div class="panel-header">
                <h2 class="panel-title">3D MARKET ANALYSIS</h2>
                <div class="panel-controls">
                    <select class="control-select" id="chart3DType">
                        <option value="surface">PRICE SURFACE</option>
                        <option value="scatter">CORRELATION SCATTER</option>
                        <option value="volume">VOLUME VISUALIZATION</option>
                        <option value="risk">RISK LANDSCAPE</option>
                    </select>
                    <button class="control-btn" onclick="window.analyticsUI.reset3DView()">
                        <span class="btn-icon">↻</span>
                        <span class="btn-text">RESET</span>
                    </button>
                </div>
            </div>
            
            <div class="chart3d-container">
                <div class="chart3d-viewport" id="chart3DViewport">
                    <canvas id="chart3DCanvas" width="${this.chart3DConfig.width}" height="${this.chart3DConfig.height}"></canvas>
                    <div class="chart3d-controls" id="chart3DControls">
                        <div class="control-group">
                            <label class="control-label">ROTATION X:</label>
                            <input type="range" class="control-slider" id="rotationX" min="-180" max="180" value="0">
                        </div>
                        <div class="control-group">
                            <label class="control-label">ROTATION Y:</label>
                            <input type="range" class="control-slider" id="rotationY" min="-180" max="180" value="0">
                        </div>
                        <div class="control-group">
                            <label class="control-label">ZOOM:</label>
                            <input type="range" class="control-slider" id="zoomLevel" min="50" max="200" value="100">
                        </div>
                    </div>
                </div>
                
                <div class="chart3d-info" id="chart3DInfo">
                    <div class="info-section">
                        <h4 class="info-title">ANALYSIS PARAMETERS</h4>
                        <div class="info-content" id="analysisParams">
                            <!-- 分析参数将在这里显示 -->
                        </div>
                    </div>
                    
                    <div class="info-section">
                        <h4 class="info-title">DATA INSIGHTS</h4>
                        <div class="info-content" id="dataInsights">
                            <!-- 数据洞察将在这里显示 -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.getElementById('analyticsContent').appendChild(chart3DPanel);
        this.panels.set('charts3d', chart3DPanel);
        console.log('[AnalyticsUI] 3D图表容器已创建');
    }
    
    // 绑定事件监听器
    bindEventListeners() {
        // 监听高级分析系统事件
        if (window.advancedAnalytics) {
            window.advancedAnalytics.addEventListener('systemInitialized', (data) => {
                this.updateSystemStatus('online', 'SYSTEM ONLINE');
                this.updateSystemMetrics(data);
            });
            
            window.advancedAnalytics.addEventListener('marketDataUpdated', (data) => {
                this.updateMarketOverview(data);
            });
            
            window.advancedAnalytics.addEventListener('predictionsUpdated', (data) => {
                this.updatePredictionData(data);
            });
            
            window.advancedAnalytics.addEventListener('highRiskAlert', (data) => {
                this.addRiskAlert(data);
            });
            
            window.advancedAnalytics.addEventListener('optimizationProgress', (data) => {
                this.updateOptimizationProgress(data);
            });
        }
        
        // 键盘快捷键
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.key === 'a' && event.shiftKey) {
                event.preventDefault();
                this.toggle();
            }
        });
        
        console.log('[AnalyticsUI] 事件监听器已绑定');
    }
    
    // 启动更新循环
    startUpdateLoop() {
        const updateData = () => {
            if (this.isInitialized && this.isVisible()) {
                this.updateCurrentView();
            }
            
            this.animationFrameId = requestAnimationFrame(updateData);
        };
        
        updateData();
        console.log('[AnalyticsUI] 更新循环已启动');
    }
    
    // 视图切换
    switchView(viewId) {
        // 更新导航状态
        document.querySelectorAll('.nav-item').forEach(item => {
            item.classList.remove('active');
        });
        document.querySelector(`[data-view="${viewId}"]`).classList.add('active');
        
        // 更新面板显示
        this.panels.forEach((panel, panelId) => {
            if (panelId === viewId) {
                panel.classList.add('active');
            } else {
                panel.classList.remove('active');
            }
        });
        
        this.currentView = viewId;
        this.updateCurrentView();
        
        // 触发声音效果
        if (window.soundSystem) {
            window.soundSystem.play('tab_switch');
        }
        
        console.log(`[AnalyticsUI] 切换到视图: ${viewId}`);
    }
    
    // 更新当前视图
    updateCurrentView() {
        switch (this.currentView) {
            case 'overview':
                this.updateOverviewData();
                break;
            case 'predictions':
                this.updatePredictionData();
                break;
            case 'risk':
                this.updateRiskData();
                break;
            case 'optimization':
                this.updateOptimizationData();
                break;
            case 'charts3d':
                this.update3DChart();
                break;
        }
    }
    
    // 更新概览数据
    updateOverviewData() {
        if (!window.advancedAnalytics || !window.advancedAnalytics.isInitialized) return;
        
        const metrics = window.advancedAnalytics.getSystemMetrics();
        this.updateSystemMetrics(metrics);
        
        // 更新市场网格
        this.updateMarketGrid();
        
        // 更新警报列表
        this.updateAlertsList();
        
        // 更新预测列表
        this.updatePredictionsList();
        
        // 更新市场概览
        this.updateMarketOverview();
    }
    
    // 更新市场概览
    updateMarketOverview() {
        if (!window.advancedAnalytics) return;
        
        // 更新市场网格数据
        const marketData = Array.from(window.advancedAnalytics.marketData.entries()).slice(0, 5);
        
        // 计算总体市场指标
        let totalVolume = 0;
        let avgPrice = 0;
        let priceCount = 0;
        
        marketData.forEach(([source, data]) => {
            if (data && data.length > 0) {
                const latest = data[data.length - 1];
                totalVolume += latest.volume || 0;
                avgPrice += latest.price || 0;
                priceCount++;
            }
        });
        
        if (priceCount > 0) {
            avgPrice = avgPrice / priceCount;
        }
        
        // 更新总体指标显示
        const totalVolumeEl = document.getElementById('totalVolume');
        const avgPriceEl = document.getElementById('avgPrice');
        const marketStatusEl = document.getElementById('marketStatus');
        
        if (totalVolumeEl) {
            totalVolumeEl.textContent = this.formatNumber(totalVolume);
        }
        
        if (avgPriceEl) {
            avgPriceEl.textContent = this.formatNumber(avgPrice) + ' UEC';
        }
        
        if (marketStatusEl) {
            const status = totalVolume > 50000 ? 'ACTIVE' : 'QUIET';
            marketStatusEl.textContent = status;
            marketStatusEl.className = `market-status ${status.toLowerCase()}`;
        }
    }
    
    // 显示/隐藏分析界面
    toggle() {
        const container = document.getElementById('analyticsContainer');
        if (container.style.display === 'none') {
            this.show();
        } else {
            this.hide();
        }
    }
    
    show() {
        const container = document.getElementById('analyticsContainer');
        container.style.display = 'block';
        
        // 添加显示动画
        container.style.opacity = '0';
        container.style.transform = 'translateY(20px)';
        
        requestAnimationFrame(() => {
            container.style.transition = 'all 0.3s ease';
            container.style.opacity = '1';
            container.style.transform = 'translateY(0)';
        });
        
        // 触发声音效果
        if (window.soundSystem) {
            window.soundSystem.play('system_startup');
        }
        
        console.log('[AnalyticsUI] 分析界面已显示');
    }
    
    hide() {
        const container = document.getElementById('analyticsContainer');
        
        container.style.transition = 'all 0.3s ease';
        container.style.opacity = '0';
        container.style.transform = 'translateY(-20px)';
        
        setTimeout(() => {
            container.style.display = 'none';
        }, 300);
        
        console.log('[AnalyticsUI] 分析界面已隐藏');
    }
    
    isVisible() {
        const container = document.getElementById('analyticsContainer');
        return container && container.style.display !== 'none';
    }
    
    // 工具方法和缺失方法实现
    
    // 更新市场网格
    updateMarketGrid() {
        const marketGrid = document.getElementById('marketGrid');
        if (!marketGrid || !window.advancedAnalytics) return;
        
        const marketData = Array.from(window.advancedAnalytics.marketData.entries()).slice(0, 5);
        
        marketGrid.innerHTML = marketData.map(([source, data]) => {
            const latest = data[data.length - 1];
            if (!latest) return '';
            
            return `
                <div class="market-item">
                    <span class="market-name">${source.replace(/_/g, ' ')}</span>
                    <span class="market-price">${this.formatNumber(latest.price)} UEC</span>
                </div>
            `;
        }).join('');
    }
    
    // 更新警报列表
    updateAlertsList() {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;
        
        // 模拟警报数据
        const alerts = [
            { level: 'high', message: 'High volatility detected in Laranite market' },
            { level: 'medium', message: 'Price divergence in Agricultural Supplies' },
            { level: 'low', message: 'Stable trading conditions in most sectors' }
        ];
        
        alertsList.innerHTML = alerts.map(alert => `
            <div class="alert-item alert-${alert.level}">
                ${alert.message}
            </div>
        `).join('');
    }
    
    // 更新预测列表
    updatePredictionsList() {
        const predictionsList = document.getElementById('predictionsList');
        if (!predictionsList) return;
        
        // 模拟预测数据
        const predictions = [
            { commodity: 'Titanium', trend: 'bullish', confidence: 0.85 },
            { commodity: 'Medical Supplies', trend: 'bearish', confidence: 0.72 },
            { commodity: 'Processed Food', trend: 'neutral', confidence: 0.68 }
        ];
        
        predictionsList.innerHTML = predictions.map(pred => `
            <div class="prediction-item">
                <strong>${pred.commodity}</strong>: ${pred.trend.toUpperCase()} 
                (${this.formatPercentage(pred.confidence)} confidence)
            </div>
        `).join('');
    }
    
    // 更新预测数据
    updatePredictionData() {
        // 更新神经网络可视化
        this.updateNeuralVisualization();
        
        // 更新概率条
        this.updateProbabilityBars();
        
        // 更新预测图表
        this.updateForecastChart();
    }
    
    // 更新神经网络可视化
    updateNeuralVisualization() {
        const canvas = document.getElementById('neuralCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制神经网络结构
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1;
        
        // 输入层
        const inputNodes = 5;
        const hiddenNodes = 8;
        const outputNodes = 3;
        
        const nodeRadius = 8;
        const layerSpacing = width / 4;
        
        // 绘制连接线
        for (let i = 0; i < inputNodes; i++) {
            for (let j = 0; j < hiddenNodes; j++) {
                const x1 = layerSpacing;
                const y1 = (height / (inputNodes + 1)) * (i + 1);
                const x2 = layerSpacing * 2;
                const y2 = (height / (hiddenNodes + 1)) * (j + 1);
                
                ctx.beginPath();
                ctx.moveTo(x1, y1);
                ctx.lineTo(x2, y2);
                ctx.stroke();
            }
        }
        
        // 绘制节点
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < inputNodes; i++) {
            const x = layerSpacing;
            const y = (height / (inputNodes + 1)) * (i + 1);
            
            ctx.beginPath();
            ctx.arc(x, y, nodeRadius, 0, Math.PI * 2);
            ctx.fill();
        }
        
        // 更新统计信息
        const confidenceEl = document.getElementById('predictionConfidence');
        const trendEl = document.getElementById('predictionTrend');
        
        if (confidenceEl) confidenceEl.textContent = '87.3%';
        if (trendEl) trendEl.textContent = 'BULLISH';
    }
    
    // 更新概率条
    updateProbabilityBars() {
        const bullishProb = document.getElementById('bullishProb');
        const neutralProb = document.getElementById('neutralProb');
        const bearishProb = document.getElementById('bearishProb');
        
        const bullishValue = document.getElementById('bullishValue');
        const neutralValue = document.getElementById('neutralValue');
        const bearishValue = document.getElementById('bearishValue');
        
        // 模拟概率数据
        const probabilities = {
            bullish: 0.65,
            neutral: 0.25,
            bearish: 0.10
        };
        
        if (bullishProb) bullishProb.style.width = this.formatPercentage(probabilities.bullish);
        if (neutralProb) neutralProb.style.width = this.formatPercentage(probabilities.neutral);
        if (bearishProb) bearishProb.style.width = this.formatPercentage(probabilities.bearish);
        
        if (bullishValue) bullishValue.textContent = this.formatPercentage(probabilities.bullish);
        if (neutralValue) neutralValue.textContent = this.formatPercentage(probabilities.neutral);
        if (bearishValue) bearishValue.textContent = this.formatPercentage(probabilities.bearish);
    }
    
    // 更新预测图表
    updateForecastChart() {
        const canvas = document.getElementById('forecastCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        // 清除画布
        ctx.clearRect(0, 0, width, height);
        
        // 绘制价格预测线
        ctx.strokeStyle = '#00ff66';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        const points = 20;
        for (let i = 0; i < points; i++) {
            const x = (width / points) * i;
            const y = height / 2 + Math.sin(i * 0.3) * 30;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.stroke();
    }
    
    // 更新风险数据
    updateRiskData() {
        this.updateRiskMatrix();
        this.updateVolatilityChart();
        this.updateLiquidityGauge();
        this.updateConcentrationPie();
    }
    
    // 更新风险矩阵
    updateRiskMatrix() {
        const canvas = document.getElementById('riskMatrixCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制热力图
        const gridSize = 20;
        const cols = Math.floor(width / gridSize);
        const rows = Math.floor(height / gridSize);
        
        for (let i = 0; i < cols; i++) {
            for (let j = 0; j < rows; j++) {
                const risk = Math.random();
                const color = this.getRiskColor(this.categorizeRiskValue(risk));
                
                ctx.fillStyle = color + '80'; // 添加透明度
                ctx.fillRect(i * gridSize, j * gridSize, gridSize - 1, gridSize - 1);
            }
        }
    }
    
    // 更新波动率图表
    updateVolatilityChart() {
        const canvas = document.getElementById('volatilityCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制波动率条形图
        ctx.fillStyle = '#ffcc00';
        const bars = 10;
        const barWidth = width / bars - 2;
        
        for (let i = 0; i < bars; i++) {
            const barHeight = Math.random() * height * 0.8;
            const x = i * (barWidth + 2);
            const y = height - barHeight;
            
            ctx.fillRect(x, y, barWidth, barHeight);
        }
    }
    
    // 更新流动性仪表
    updateLiquidityGauge() {
        const canvas = document.getElementById('liquidityCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        
        ctx.clearRect(0, 0, width, height);
        
        // 绘制仪表盘
        ctx.strokeStyle = '#333';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
        
        // 绘制指针
        const liquidity = 0.75; // 模拟流动性值
        const angle = Math.PI + (Math.PI * liquidity);
        
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + Math.cos(angle) * radius * 0.8,
            centerY + Math.sin(angle) * radius * 0.8
        );
        ctx.stroke();
    }
    
    // 更新集中度饼图
    updateConcentrationPie() {
        const canvas = document.getElementById('concentrationCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        
        ctx.clearRect(0, 0, width, height);
        
        // 模拟集中度数据
        const data = [
            { value: 0.4, color: '#ff6600' },
            { value: 0.3, color: '#00ff66' },
            { value: 0.2, color: '#0066ff' },
            { value: 0.1, color: '#ffcc00' }
        ];
        
        let currentAngle = 0;
        
        data.forEach(segment => {
            const sliceAngle = segment.value * Math.PI * 2;
            
            ctx.fillStyle = segment.color;
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
        });
    }
    
    // 更新优化数据
    updateOptimizationData() {
        this.updateOptimizationProgress({ generation: 0, progress: 0 });
        this.updatePortfolioCharts();
        this.updateRecommendations();
    }
    
    // 更新投资组合图表
    updatePortfolioCharts() {
        // 当前投资组合
        this.drawPortfoliePie('currentPortfolioCanvas', {
            'Laranite': 0.4,
            'Medical Supplies': 0.3,
            'Agricultural': 0.2,
            'Titanium': 0.1
        });
        
        // 优化后投资组合
        this.drawPortfoliePie('optimizedPortfolioCanvas', {
            'Laranite': 0.3,
            'Medical Supplies': 0.35,
            'Agricultural': 0.25,
            'Titanium': 0.1
        });
    }
    
    // 绘制投资组合饼图
    drawPortfoliePie(canvasId, data) {
        const canvas = document.getElementById(canvasId);
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        const centerX = width / 2;
        const centerY = height / 2;
        const radius = Math.min(width, height) / 2 - 10;
        
        ctx.clearRect(0, 0, width, height);
        
        const colors = ['#ff6600', '#00ff66', '#0066ff', '#ffcc00', '#ff3366'];
        let currentAngle = 0;
        let colorIndex = 0;
        
        Object.entries(data).forEach(([name, value]) => {
            const sliceAngle = value * Math.PI * 2;
            
            ctx.fillStyle = colors[colorIndex % colors.length];
            ctx.beginPath();
            ctx.moveTo(centerX, centerY);
            ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
            ctx.closePath();
            ctx.fill();
            
            currentAngle += sliceAngle;
            colorIndex++;
        });
    }
    
    // 更新建议列表
    updateRecommendations() {
        const recommendationsList = document.getElementById('recommendationsList');
        if (!recommendationsList) return;
        
        const recommendations = [
            'Increase Medical Supplies allocation by 5%',
            'Reduce Laranite exposure due to high volatility',
            'Consider diversifying into Consumer Goods sector',
            'Maintain current Titanium position for stability'
        ];
        
        recommendationsList.innerHTML = recommendations.map(rec => `
            <div class="recommendation-item">${rec}</div>
        `).join('');
    }
    
    // 更新3D图表
    update3DChart() {
        const canvas = document.getElementById('chart3DCanvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const { width, height } = canvas;
        
        ctx.clearRect(0, 0, width, height);
        
        // 简化的3D效果（实际应用中会使用WebGL）
        ctx.strokeStyle = '#ff6600';
        ctx.lineWidth = 1;
        
        // 绘制3D网格
        const gridSize = 20;
        for (let i = 0; i < width; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i, height);
            ctx.stroke();
        }
        
        for (let i = 0; i < height; i += gridSize) {
            ctx.beginPath();
            ctx.moveTo(0, i);
            ctx.lineTo(width, i);
            ctx.stroke();
        }
        
        // 绘制3D数据点
        ctx.fillStyle = '#ff6600';
        for (let i = 0; i < 50; i++) {
            const x = Math.random() * width;
            const y = Math.random() * height;
            const size = 2 + Math.random() * 6;
            
            ctx.beginPath();
            ctx.arc(x, y, size, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    // 添加风险警报
    addRiskAlert(data) {
        const alertsList = document.getElementById('alertsList');
        if (!alertsList) return;
        
        const alertItem = document.createElement('div');
        alertItem.className = `alert-item alert-${data.riskLevel}`;
        alertItem.textContent = `HIGH RISK: ${data.source.replace(/_/g, ' ')} - ${data.riskLevel.toUpperCase()}`;
        
        alertsList.insertBefore(alertItem, alertsList.firstChild);
        
        // 限制警报数量
        while (alertsList.children.length > 5) {
            alertsList.removeChild(alertsList.lastChild);
        }
    }
    
    // 更新优化进度
    updateOptimizationProgress(data) {
        const currentGeneration = document.getElementById('currentGeneration');
        const progressFill = document.getElementById('progressFill');
        const bestFitness = document.getElementById('bestFitness');
        
        if (currentGeneration) currentGeneration.textContent = data.generation || 0;
        if (progressFill) progressFill.style.width = (data.progress || 0) + '%';
        if (bestFitness) bestFitness.textContent = this.formatNumber(data.bestFitness || 0);
    }
    
    // 生成预测
    generatePrediction() {
        if (!window.advancedAnalytics) return;
        
        const source = document.getElementById('predictionSource')?.value || 'all';
        console.log(`[AnalyticsUI] 生成预测: ${source}`);
        
        // 触发预测生成
        window.advancedAnalytics.generatePredictions();
        
        // 更新UI
        this.updatePredictionData();
        
        // 触发声音效果
        if (window.soundSystem) {
            window.soundSystem.play('notification');
        }
    }
    
    // 运行优化
    runOptimization() {
        if (!window.advancedAnalytics) return;
        
        console.log('[AnalyticsUI] 运行投资组合优化');
        
        // 模拟当前投资组合
        const currentPortfolio = {
            'Laranite': 400000,
            'Medical_Supplies': 300000,
            'Agricultural': 200000,
            'Titanium': 100000
        };
        
        // 启动优化
        window.advancedAnalytics.getOptimizationRecommendations(currentPortfolio)
            .then(result => {
                if (result) {
                    console.log('[AnalyticsUI] 优化完成:', result);
                    this.updateOptimizationData();
                }
            });
        
        // 触发声音效果
        if (window.soundSystem) {
            window.soundSystem.play('system_startup');
        }
    }
    
    // 重置3D视图
    reset3DView() {
        const rotationX = document.getElementById('rotationX');
        const rotationY = document.getElementById('rotationY');
        const zoomLevel = document.getElementById('zoomLevel');
        
        if (rotationX) rotationX.value = 0;
        if (rotationY) rotationY.value = 0;
        if (zoomLevel) zoomLevel.value = 100;
        
        this.update3DChart();
    }
    
    // 刷新数据
    refreshData() {
        if (!window.advancedAnalytics) return;
        
        console.log('[AnalyticsUI] 刷新分析数据');
        
        // 强制收集新数据
        window.advancedAnalytics.collectMarketData();
        
        // 更新当前视图
        this.updateCurrentView();
        
        // 触发声音效果
        if (window.soundSystem) {
            window.soundSystem.play('notification');
        }
    }
    
    // 分类风险值
    categorizeRiskValue(value) {
        if (value < 0.3) return 'low';
        if (value < 0.6) return 'medium';
        if (value < 0.8) return 'high';
        return 'critical';
    }
    
    // 更新系统状态
    updateSystemStatus(status, text) {
        const statusIndicator = document.getElementById('systemStatus');
        const statusText = document.getElementById('systemStatusText');
        
        if (statusIndicator && statusText) {
            statusIndicator.className = `status-indicator ${status}`;
            statusText.textContent = text;
        }
    }
    
    // 更新系统指标
    updateSystemMetrics(metrics) {
        const elements = {
            predictionAccuracy: document.getElementById('predictionAccuracy'),
            riskAccuracy: document.getElementById('riskAccuracy'),
            optimizationScore: document.getElementById('optimizationScore'),
            systemReliability: document.getElementById('systemReliability')
        };
        
        if (elements.predictionAccuracy) {
            elements.predictionAccuracy.textContent = (metrics.predictionAccuracy * 100).toFixed(1) + '%';
        }
        if (elements.riskAccuracy) {
            elements.riskAccuracy.textContent = (metrics.riskPredictionAccuracy * 100).toFixed(1) + '%';
        }
        if (elements.optimizationScore) {
            elements.optimizationScore.textContent = (metrics.profitOptimizationScore * 100).toFixed(1) + '%';
        }
        if (elements.systemReliability) {
            elements.systemReliability.textContent = (metrics.systemReliability * 100).toFixed(1) + '%';
        }
    }
    
    // 格式化数字
    formatNumber(num, decimals = 2) {
        if (num >= 1000000) {
            return (num / 1000000).toFixed(decimals) + 'M';
        } else if (num >= 1000) {
            return (num / 1000).toFixed(decimals) + 'K';
        }
        return num.toFixed(decimals);
    }
    
    // 格式化百分比
    formatPercentage(value) {
        return (value * 100).toFixed(1) + '%';
    }
    
    // 获取风险等级颜色
    getRiskColor(level) {
        switch (level) {
            case 'low': return this.config.colorScheme.success;
            case 'medium': return this.config.colorScheme.warning;
            case 'high': return this.config.colorScheme.danger;
            case 'critical': return '#ff0000';
            default: return this.config.colorScheme.text;
        }
    }
}

// 全局实例
window.AnalyticsUI = AnalyticsUI;

// 自动初始化
document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.analyticsUI === 'undefined') {
        setTimeout(() => {
            window.analyticsUI = new AnalyticsUI();
            console.log('[AnalyticsUI] UI系统已初始化');
        }, 1000); // 等待其他系统初始化
    }
}); 