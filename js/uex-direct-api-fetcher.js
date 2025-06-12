// UEX Corp 直接API调用系统（无需代理服务器）
class UEXDirectApiFetcher {
    constructor() {
        this.apiBaseUrl = 'https://api.uexcorp.space/2.0';
        this.token = 'd55bc23a6fee307de57c1b07a24c25fe7996444d';
        this.dailyLimit = 100;
        this.ships = [];
        this.apiUsage = {
            requests_used: 0,
            daily_limit: 100,
            remaining: 100,
            usage_percentage: 0,
            last_request: null,
            next_reset: null
        };
        this.lastUpdate = null;
        this.updateInterval = 8 * 60 * 60 * 1000; // 8小时更新一次
        this.refreshTimer = null;
        this.isUpdating = false;
        this.totalShips = 0;
        
        // 从本地存储加载API使用统计
        this.loadApiUsageFromStorage();
        
        console.log('🌐 UEX直接API调用系统已初始化');
        console.log('📊 为节省API配额，设置8小时更新间隔');
        console.log(`🔑 使用Token: ${this.token.substring(0, 8)}...`);
    }

    async init() {
        try {
            // 检查今日API使用量
            this.checkDailyReset();
            
            // 从缓存加载
            if (this.loadFromCache()) {
                // 如果缓存数据较新，不立即更新
                if (this.lastUpdate && (Date.now() - this.lastUpdate < this.updateInterval)) {
                    console.log('📱 使用缓存数据，跳过立即更新');
                    this.updateUI();
                    this.updateStatusIndicator('connected');
                    this.startAutoUpdate();
                    return;
                }
            }
            
            // 检查API余额
            if (this.apiUsage.remaining < 1) {
                console.log('⚠️ API请求余额不足，使用缓存数据');
                this.updateStatusIndicator('error');
                this.showApiLimitMessage('今日API请求已用完，请明天再试');
                if (this.ships.length > 0) {
                    this.updateUI();
                } else {
                    this.loadFallbackData();
                }
                return;
            }
            
            // 获取最新数据
            await this.fetchUEXData();
            
            // 设置定时更新
            this.startAutoUpdate();
            
            console.log('✅ UEX直接API系统初始化完成');
        } catch (error) {
            console.error('❌ UEX直接API系统初始化失败:', error);
            this.loadFallbackData();
        }
    }

    // 检查每日重置
    checkDailyReset() {
        const now = Date.now();
        const today = new Date().toDateString();
        const lastRequestDate = this.apiUsage.last_request ? new Date(this.apiUsage.last_request).toDateString() : null;
        
        if (lastRequestDate !== today) {
            // 新的一天，重置计数
            this.apiUsage.requests_used = 0;
            this.apiUsage.remaining = this.dailyLimit;
            this.apiUsage.usage_percentage = 0;
            this.apiUsage.next_reset = new Date(now + 24 * 60 * 60 * 1000).toLocaleString('zh-CN');
            
            console.log('🔄 每日API请求计数已重置');
            this.saveApiUsageToStorage();
        }
    }

    // 从本地存储加载API使用统计
    loadApiUsageFromStorage() {
        try {
            const stored = localStorage.getItem('uex_api_usage');
            if (stored) {
                const data = JSON.parse(stored);
                this.apiUsage = { ...this.apiUsage, ...data };
            }
        } catch (error) {
            console.warn('⚠️ 加载API使用统计失败:', error);
        }
    }

    // 保存API使用统计到本地存储
    saveApiUsageToStorage() {
        try {
            localStorage.setItem('uex_api_usage', JSON.stringify(this.apiUsage));
        } catch (error) {
            console.warn('⚠️ 保存API使用统计失败:', error);
        }
    }

    // 更新API使用统计
    updateApiUsage() {
        this.apiUsage.requests_used++;
        this.apiUsage.remaining = this.dailyLimit - this.apiUsage.requests_used;
        this.apiUsage.usage_percentage = Math.round((this.apiUsage.requests_used / this.dailyLimit) * 100);
        this.apiUsage.last_request = Date.now();
        
        this.saveApiUsageToStorage();
        
        console.log(`📊 API使用: ${this.apiUsage.requests_used}/${this.dailyLimit} (${this.apiUsage.usage_percentage}%)`);
    }

    // 直接调用UEX API
    async callUEXAPI(endpoint, params = {}) {
        // 检查API限制
        if (this.apiUsage.remaining < 1) {
            throw new Error('今日API请求已达限额，请明天再试');
        }

        try {
            // 构建URL
            const url = new URL(`${this.apiBaseUrl}/${endpoint}`);
            Object.keys(params).forEach(key => {
                url.searchParams.append(key, params[key]);
            });

            console.log(`📡 调用UEX API: ${endpoint}`);
            
            // 发起请求
            const response = await fetch(url.toString(), {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${this.token}`,
                    'Accept': 'application/json',
                    'User-Agent': 'Star-Citizen-Tool/3.0'
                },
                mode: 'cors'
            });

            // 更新API使用统计
            this.updateApiUsage();

            if (!response.ok) {
                throw new Error(`HTTP错误: ${response.status} ${response.statusText}`);
            }

            const data = await response.json();
            
            if (data.status !== 'ok') {
                throw new Error(`UEX API错误: ${data.message || 'Unknown error'}`);
            }

            return data.data;
        } catch (error) {
            console.error(`❌ UEX API调用失败 (${endpoint}):`, error.message);
            throw error;
        }
    }

    // 获取UEX飞船数据
    async fetchUEXData() {
        if (this.isUpdating) {
            console.log('⏳ 数据更新正在进行中...');
            return;
        }

        this.isUpdating = true;
        this.updateStatusIndicator('loading');
        console.log('📡 正在从UEX Corp直接获取飞船数据...');

        try {
            // 检查API余额
            if (this.apiUsage.remaining < 1) {
                throw new Error('API请求余额不足，请明天再试');
            }

            // 获取飞船数据
            const vehicles = await this.callUEXAPI('vehicles');
            
            if (!vehicles || !Array.isArray(vehicles)) {
                throw new Error('获取到的飞船数据格式无效');
            }

            // 处理飞船数据
            this.ships = vehicles.map(vehicle => ({
                // 基础信息
                id: vehicle.slug || vehicle.id,
                name: vehicle.name,
                manufacturer: vehicle.manufacturer?.name || vehicle.manufacturer,
                
                // 分类信息
                category: vehicle.classification?.name || vehicle.category || '未分类',
                subcategory: vehicle.classification?.subcategory || vehicle.subcategory || '',
                size: vehicle.size || vehicle.classification?.size || 'Unknown',
                role: vehicle.role || vehicle.focus || vehicle.type || 'Multi-Role',
                
                // 技术规格
                length: parseFloat(vehicle.length) || 0,
                beam: parseFloat(vehicle.beam) || parseFloat(vehicle.width) || 0,
                height: parseFloat(vehicle.height) || 0,
                mass: parseFloat(vehicle.mass) || 0,
                
                // 船员信息
                crew_min: parseInt(vehicle.crew_min) || parseInt(vehicle.crew?.min) || 1,
                crew_max: parseInt(vehicle.crew_max) || parseInt(vehicle.crew?.max) || 1,
                
                // 货舱容量
                cargo_capacity: parseInt(vehicle.cargo_capacity || vehicle.cargo) || 0,
                
                // 状态和描述
                status: vehicle.status || (vehicle.flight_ready ? 'Flight Ready' : 'In Development'),
                description: vehicle.description || '',
                
                // UEX特有数据
                uex_id: vehicle.id,
                slug: vehicle.slug,
                image_url: vehicle.image || vehicle.thumbnail,
                variants: vehicle.variants || [],
                
                // 更新时间
                updated: Date.now(),
                
                // 价格信息（如果有）
                price_uec: vehicle.price_uec || 0,
                price_usd: vehicle.price_usd || 0
            }));

            this.totalShips = this.ships.length;
            this.lastUpdate = Date.now();
            
            this.saveToCache();
            
            console.log(`✅ 成功获取 ${this.totalShips} 艘真实飞船数据`);
            console.log(`📊 API使用: ${this.apiUsage.requests_used}/${this.apiUsage.daily_limit} (剩余${this.apiUsage.remaining})`);
            
            this.updateUI();
            this.updateStatusIndicator('connected');

        } catch (error) {
            console.error('❌ 获取UEX数据失败:', error);
            this.updateStatusIndicator('error');
            
            // 如果是API限额错误，显示特殊提示
            if (error.message.includes('限额') || error.message.includes('余额不足')) {
                this.showApiLimitMessage(error.message);
            }
            
            // 如果获取失败且没有缓存数据，则使用备用数据
            if (this.ships.length === 0) {
                this.loadFallbackData();
            }
        } finally {
            this.isUpdating = false;
        }
    }

    // 显示API限额提示
    showApiLimitMessage(message) {
        const statusContainer = document.querySelector('.uex-data-status');
        if (statusContainer) {
            const limitWarning = document.createElement('div');
            limitWarning.className = 'api-limit-warning';
            limitWarning.innerHTML = `
                <div class="warning-content">
                    <span class="warning-icon">⚠️</span>
                    <span class="warning-text">${message}</span>
                </div>
            `;
            statusContainer.appendChild(limitWarning);
            
            // 10秒后移除警告
            setTimeout(() => {
                if (limitWarning.parentNode) {
                    limitWarning.remove();
                }
            }, 10000);
        }
    }

    // 更新状态指示器
    updateStatusIndicator(status) {
        const statusDot = document.querySelector('.uex-status-dot');
        const statusText = document.querySelector('.status-text');
        
        if (statusDot) {
            statusDot.className = 'status-dot uex-status-dot';
            statusDot.classList.add(status);
        }
        
        if (statusText) {
            const statusTexts = {
                'loading': 'UEX 加载中',
                'connected': 'UEX LIVE DATA',
                'error': 'UEX 连接错误'
            };
            statusText.textContent = statusTexts[status] || 'UEX LIVE DATA';
        }
        
        // 更新API使用量显示
        this.updateApiUsageDisplay();
    }

    // 更新API使用量显示
    updateApiUsageDisplay() {
        const usageElement = document.querySelector('.api-usage-info');
        if (usageElement) {
            usageElement.innerHTML = `
                <div class="api-usage-stats">
                    <span>API使用: ${this.apiUsage.requests_used}/${this.apiUsage.daily_limit}</span>
                    <span>剩余: ${this.apiUsage.remaining}</span>
                    <span>使用率: ${this.apiUsage.usage_percentage}%</span>
                </div>
            `;
        }
    }

    // 缓存到本地存储
    saveToCache() {
        try {
            const cacheData = {
                ships: this.ships,
                apiUsage: this.apiUsage,
                lastUpdate: this.lastUpdate,
                totalShips: this.totalShips,
                version: '3.2'
            };
            
            localStorage.setItem('uex_direct_ships_cache', JSON.stringify(cacheData));
            console.log(`💾 已缓存 ${this.ships.length} 艘飞船数据到本地`);
        } catch (error) {
            console.warn('⚠️ 缓存保存失败:', error);
        }
    }

    // 从缓存加载
    loadFromCache() {
        try {
            const cached = localStorage.getItem('uex_direct_ships_cache');
            if (cached) {
                const cacheData = JSON.parse(cached);
                
                this.ships = cacheData.ships || [];
                this.lastUpdate = cacheData.lastUpdate;
                this.totalShips = cacheData.totalShips || this.ships.length;
                
                const timeDiff = Date.now() - this.lastUpdate;
                console.log(`📱 已从缓存加载 ${this.ships.length} 艘飞船数据 (${Math.round(timeDiff / 1000 / 60)} 分钟前)`);
                return true;
            }
        } catch (error) {
            console.warn('⚠️ 缓存加载失败:', error);
        }
        return false;
    }

    // 加载备用数据
    loadFallbackData() {
        console.log('🔄 UEX直接API不可用，使用备用模拟数据...');
        if (window.uexLiveDataFetcher) {
            window.uexLiveDataFetcher.init();
        }
    }

    // 启动自动更新
    startAutoUpdate() {
        this.stopAutoUpdate();
        
        this.refreshTimer = setInterval(() => {
            // 检查API使用量，决定是否更新
            this.checkDailyReset();
            
            if (this.apiUsage.remaining > 2) {
                console.log('🔄 定时更新UEX数据...');
                this.fetchUEXData();
            } else {
                console.log('⚠️ API余额不足，跳过本次更新');
            }
        }, this.updateInterval);
        
        console.log(`⏰ 已设置每 ${this.updateInterval / 1000 / 60 / 60} 小时自动更新`);
    }

    // 停止自动更新
    stopAutoUpdate() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
        }
    }

    // 更新UI
    updateUI() {
        if (this.ships.length === 0) return;

        // 更新飞船数据库UI
        this.updateShipsGrid();
        this.updateLastUpdateTime();
        
        // 触发自定义事件
        window.dispatchEvent(new CustomEvent('uexDirectDataUpdated', {
            detail: { 
                ships: this.ships, 
                lastUpdate: this.lastUpdate,
                totalShips: this.totalShips,
                apiUsage: this.apiUsage
            }
        }));
    }

    // 更新飞船网格显示
    updateShipsGrid() {
        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;

        itemsGrid.innerHTML = '';

        this.ships.forEach(ship => {
            const shipCard = this.createShipCard(ship);
            itemsGrid.appendChild(shipCard);
        });

        console.log(`🚀 已更新显示 ${this.ships.length} 艘真实飞船`);
    }

    // 创建飞船卡片
    createShipCard(ship) {
        const card = document.createElement('div');
        card.className = 'item-card ship-card';
        card.dataset.shipId = ship.id;
        card.dataset.shipSlug = ship.slug;

        // 价格显示逻辑
        let priceDisplay = '';
        if (ship.price_usd && ship.price_usd > 0) {
            priceDisplay = `$${ship.price_usd} USD`;
        } else if (ship.price_uec && ship.price_uec > 0) {
            priceDisplay = `${ship.price_uec.toLocaleString()} UEC`;
        } else {
            priceDisplay = '价格待定';
        }

        const manufacturer = ship.manufacturer || 'Unknown';
        const shipIcon = this.getShipIcon(manufacturer);
        
        // 改进图片处理 - 优先使用SVG生成，因为UEX图片URL可能有问题
        const shipImage = this.generateShipImage(ship);

        card.innerHTML = `
            <div class="ship-image-container">
                <div class="ship-svg-image">
                    ${shipImage}
                </div>
            </div>
            <h4>${ship.name || 'Unknown Ship'}</h4>
            <p class="ship-manufacturer">${manufacturer}</p>
            <p class="ship-price">${priceDisplay}</p>
            <div class="ship-specs">
                <span>Cargo: ${ship.cargo_capacity || 0} SCU</span>
                <span>Crew: ${ship.crew_min || 1}-${ship.crew_max || 1}</span>
            </div>
            <div class="ship-meta">
                <span class="ship-size">${ship.size || 'Unknown'}</span>
                <span class="ship-status">${ship.status || 'Unknown'}</span>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            this.showShipDetails(ship);
        });

        return card;
    }

    // 其他方法与原系统相同...
    getShipIcon(manufacturer) {
        const icons = {
            'Aegis Dynamics': '⚔️',
            'Anvil Aerospace': '🔨',
            'Origin Jumpworks': '✨',
            'Drake Interplanetary': '🏴‍☠️',
            'Roberts Space Industries': '🏛️',
            'MISC': '🔧',
            'Crusader Industries': '🛡️',
            'Esperia': '🏺',
            'Vanduul': '👾',
            'Xi\'an': '🎭',
            'Argo Astronautics': '🏗️',
            'Consolidated Outland': '🌌',
            'Banu': '👁️'
        };
        return icons[manufacturer] || '🚀';
    }

    generateShipImage(ship) {
        const manufacturerColors = {
            'Aegis Dynamics': '#ff6600',
            'Anvil Aerospace': '#00aaff',
            'Origin Jumpworks': '#ffffff',
            'Drake Interplanetary': '#ff3300',
            'Roberts Space Industries': '#ffaa00',
            'MISC': '#00ff88',
            'Crusader Industries': '#0066ff',
            'Esperia': '#aa5500',
            'Vanduul': '#800080',
            'Xi\'an': '#00ffaa',
            'Argo Astronautics': '#ffa500',
            'Consolidated Outland': '#9932cc',
            'Banu': '#20b2aa'
        };
        
        const manufacturer = ship.manufacturer || 'Unknown';
        const color = manufacturerColors[manufacturer] || '#ff6600';
        const icon = this.getShipIcon(manufacturer);
        
        // 安全地获取制造商简称
        const manufacturerShort = manufacturer && typeof manufacturer === 'string' 
            ? manufacturer.split(' ')[0] 
            : 'UNK';
        
        // 根据飞船尺寸调整图标
        const shipSize = ship.size || 'Unknown';
        let iconSize = 20;
        let circleRadius = 35;
        
        switch(shipSize.toLowerCase()) {
            case 'small':
            case 's':
                iconSize = 16;
                circleRadius = 25;
                break;
            case 'medium':
            case 'm':
                iconSize = 20;
                circleRadius = 35;
                break;
            case 'large':
            case 'l':
                iconSize = 24;
                circleRadius = 40;
                break;
            case 'capital':
            case 'c':
                iconSize = 28;
                circleRadius = 45;
                break;
        }
        
        // 直接返回SVG字符串，不用data URL
        return `
            <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" style="background: #001122; border-radius: 8px;">
                <defs>
                    <radialGradient id="glow_${ship.id}" cx="50%" cy="50%" r="50%">
                        <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                        <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                    </radialGradient>
                    <filter id="shadow_${ship.id}">
                        <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
                    </filter>
                </defs>
                
                <!-- 背景发光 -->
                <circle cx="60" cy="60" r="${circleRadius + 10}" fill="url(#glow_${ship.id})"/>
                
                <!-- 主圆环 -->
                <circle cx="60" cy="60" r="${circleRadius}" fill="none" stroke="${color}" stroke-width="2" opacity="0.8"/>
                <circle cx="60" cy="60" r="${circleRadius - 8}" fill="none" stroke="${color}" stroke-width="1" opacity="0.4"/>
                
                <!-- 装饰线条 -->
                <line x1="60" y1="25" x2="60" y2="35" stroke="${color}" stroke-width="2" opacity="0.6"/>
                <line x1="60" y1="85" x2="60" y2="95" stroke="${color}" stroke-width="2" opacity="0.6"/>
                <line x1="25" y1="60" x2="35" y2="60" stroke="${color}" stroke-width="2" opacity="0.6"/>
                <line x1="85" y1="60" x2="95" y2="60" stroke="${color}" stroke-width="2" opacity="0.6"/>
                
                <!-- 制造商图标 -->
                <text x="60" y="65" text-anchor="middle" dominant-baseline="middle" 
                      fill="${color}" font-size="${iconSize}" font-family="Arial, sans-serif" 
                      filter="url(#shadow_${ship.id})">${icon}</text>
                
                <!-- 飞船名称 -->
                <text x="60" y="85" text-anchor="middle" fill="${color}" font-size="8" 
                      font-family="Arial, sans-serif" opacity="0.8">${ship.name ? ship.name.substring(0, 12) : 'Unknown'}</text>
                
                <!-- 制造商简称 -->
                <text x="60" y="110" text-anchor="middle" fill="${color}" font-size="7" 
                      font-family="Arial, sans-serif" opacity="0.6">${manufacturerShort}</text>
                
                <!-- 尺寸指示器 -->
                <text x="110" y="15" text-anchor="end" fill="${color}" font-size="10" 
                      font-family="Arial, sans-serif" opacity="0.7">${shipSize}</text>
            </svg>
        `;
    }

    showShipDetails(ship) {
        const detailContainer = document.querySelector('.item-detail-container');
        if (!detailContainer) return;

        // 价格信息显示
        let priceInfo = '<h3>价格信息</h3>';
        if (ship.price_usd && ship.price_usd > 0) {
            priceInfo += `<div class="price-usd">$${ship.price_usd} USD</div>`;
        }
        if (ship.price_uec && ship.price_uec > 0) {
            priceInfo += `<div class="price-uec">${ship.price_uec.toLocaleString()} UEC</div>`;
        }
        if (!ship.price_usd && !ship.price_uec) {
            priceInfo += '<div class="price-pending">价格待定</div>';
        }

        const manufacturer = ship.manufacturer || 'Unknown';
        // 直接生成SVG内容，不使用img标签
        const shipImageSVG = this.generateShipImage(ship);

        detailContainer.innerHTML = `
            <div class="ship-detail">
                <div class="ship-image-preview">
                    <div class="ship-svg-display">
                        ${shipImageSVG}
                    </div>
                </div>
                
                <div class="ship-detail-header">
                    <h2>${ship.name || 'Unknown Ship'}</h2>
                    <div class="ship-status">${ship.status || 'Unknown'}</div>
                </div>
                
                <div class="ship-basic-info">
                    <h3>基本信息</h3>
                    <div class="info-row">
                        <span class="info-label">制造商:</span>
                        <span class="info-value">${manufacturer}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">类型:</span>
                        <span class="info-value">${ship.category || 'Unknown'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">角色:</span>
                        <span class="info-value">${ship.role || 'Unknown'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">尺寸:</span>
                        <span class="info-value">${ship.size || 'Unknown'}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">船员:</span>
                        <span class="info-value">${ship.crew_min || 1}-${ship.crew_max || 1}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">货舱:</span>
                        <span class="info-value">${ship.cargo_capacity || 0} SCU</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">长度:</span>
                        <span class="info-value">${ship.length || 0}m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">宽度:</span>
                        <span class="info-value">${ship.beam || 0}m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">高度:</span>
                        <span class="info-value">${ship.height || 0}m</span>
                    </div>
                </div>
                
                <div class="ship-pricing">
                    ${priceInfo}
                </div>
                
                <div class="update-info">
                    <small>UEX真实数据更新时间: ${new Date(ship.updated).toLocaleString('zh-CN')}</small>
                    ${ship.description ? `<p class="ship-description">${ship.description}</p>` : ''}
                </div>
            </div>
        `;

        // 移除其他选中状态
        document.querySelectorAll('.ship-card.selected, .item-card.selected').forEach(c => c.classList.remove('selected'));
        const currentCard = document.querySelector(`[data-ship-id="${ship.id}"]`);
        if (currentCard) {
            currentCard.classList.add('selected');
        }
    }

    updateLastUpdateTime() {
        const updateIndicators = document.querySelectorAll('.last-update-time');
        const timeString = new Date(this.lastUpdate).toLocaleString('zh-CN');
        
        updateIndicators.forEach(indicator => {
            const apiInfo = ` (${this.apiUsage.requests_used}/${this.apiUsage.daily_limit} API请求)`;
            indicator.textContent = `最后更新: ${timeString} (${this.totalShips}艘飞船)${apiInfo}`;
        });
    }

    async refreshData() {
        console.log('🔄 手动刷新UEX数据...');
        
        // 检查API余额
        this.checkDailyReset();
        if (this.apiUsage.remaining < 1) {
            alert('今日API请求已用完，请明天再试！');
            return;
        }
        
        await this.fetchUEXData();
    }

    getAllShips() {
        return this.ships;
    }

    destroy() {
        this.stopAutoUpdate();
        this.ships = [];
        this.lastUpdate = null;
        console.log('🗑️ UEX直接API系统已清理');
    }
}

// 创建全局实例
window.uexDirectAPI = new UEXDirectApiFetcher();
// 为了兼容性，也保留旧名称
window.uexDirectApiFetcher = window.uexDirectAPI; 