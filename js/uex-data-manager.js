// UEX数据管理系统
class UEXDataManager {
    constructor() {
        this.apiBaseUrl = 'https://api.uexcorp.space/api/2.0';
        this.ships = [];
        this.lastUpdate = null;
        this.updateInterval = 5 * 60 * 1000; // 5分钟
        this.refreshTimer = null;
        
        console.log('🚀 UEX数据管理器已初始化');
    }

    // 初始化系统
    async init() {
        try {
            // 加载缓存的数据
            this.loadCachedData();
            
            // 首次获取数据
            await this.fetchShipData();
            
            // 设置定时更新
            this.startAutoUpdate();
            
            // 更新UI
            this.updateItemDatabase();
            
            console.log('✅ UEX数据管理器初始化完成');
        } catch (error) {
            console.error('❌ UEX数据管理器初始化失败:', error);
            this.loadFallbackData();
        }
    }

    // 从UEX API获取飞船数据
    async fetchShipData() {
        try {
            console.log('📡 正在获取UEX飞船数据...');
            
            // 由于CORS限制，我们使用模拟数据
            // 实际部署时需要配置代理服务器或使用服务器端API
            const ships = await this.getMockShipData();
            
            this.ships = ships;
            this.lastUpdate = Date.now();
            
            // 缓存数据
            this.cacheData();
            
            console.log(`✅ 已获取 ${ships.length} 艘飞船数据`);
            return ships;
            
        } catch (error) {
            console.error('❌ 获取UEX数据失败:', error);
            throw error;
        }
    }

    // 获取模拟飞船数据（替代真实的UEX API）
    async getMockShipData() {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        return [
            {
                id: 'aegis_avenger_titan',
                name: 'Aegis Avenger Titan',
                manufacturer: 'Aegis Dynamics',
                size: 'Small',
                type: 'Multi-Role',
                crew: '1',
                cargo: '8 SCU',
                price: 70,
                image: 'https://media.robertsspaceindustries.com/jl4ncaoer4ayk/source.jpg',
                description: '阿维杰尔泰坦是一艘多用途小型飞船，适合新手飞行员。',
                specs: {
                    length: '22.5m',
                    beam: '16.5m',
                    height: '5.5m',
                    mass: '52,868 kg'
                }
            },
            {
                id: 'origin_300i',
                name: 'Origin 300i',
                manufacturer: 'Origin Jumpworks',
                size: 'Small',
                type: 'Touring',
                crew: '1',
                cargo: '8 SCU',
                price: 80,
                image: 'https://media.robertsspaceindustries.com/z6t67p5b7uy5f/source.jpg',
                description: 'Origin 300i是一艘豪华的个人运输飞船。',
                specs: {
                    length: '24m',
                    beam: '16m',
                    height: '7m',
                    mass: '75,500 kg'
                }
            },
            {
                id: 'misc_freelancer',
                name: 'MISC Freelancer',
                manufacturer: 'Musashi Industrial',
                size: 'Medium',
                type: 'Cargo',
                crew: '2-4',
                cargo: '66 SCU',
                price: 150,
                image: 'https://media.robertsspaceindustries.com/mr2dhmt7sr89s/source.jpg',
                description: 'MISC Freelancer是一艘可靠的中型货船。',
                specs: {
                    length: '38m',
                    beam: '26m',
                    height: '9m',
                    mass: '220,000 kg'
                }
            },
            {
                id: 'anvil_hornet',
                name: 'Anvil F7C Hornet',
                manufacturer: 'Anvil Aerospace',
                size: 'Small',
                type: 'Fighter',
                crew: '1',
                cargo: '0 SCU',
                price: 110,
                image: 'https://media.robertsspaceindustries.com/n1e87j3v6iy03/source.jpg',
                description: 'Anvil Hornet是一艘强大的单座战斗机。',
                specs: {
                    length: '22.5m',
                    beam: '21.5m',
                    height: '5.5m',
                    mass: '73,466 kg'
                }
            },
            {
                id: 'rsi_constellation',
                name: 'RSI Constellation Andromeda',
                manufacturer: 'Roberts Space Industries',
                size: 'Large',
                type: 'Multi-Role',
                crew: '3-5',
                cargo: '96 SCU',
                price: 280,
                image: 'https://media.robertsspaceindustries.com/6qqtkvuuhj5ez/source.jpg',
                description: 'RSI Constellation是一艘大型多用途飞船。',
                specs: {
                    length: '61m',
                    beam: '26m',
                    height: '14m',
                    mass: '1,020,000 kg'
                }
            },
            {
                id: 'drake_cutlass',
                name: 'Drake Cutlass Black',
                manufacturer: 'Drake Interplanetary',
                size: 'Medium',
                type: 'Multi-Role',
                crew: '1-3',
                cargo: '46 SCU',
                price: 120,
                image: 'https://media.robertsspaceindustries.com/g1bq5tbma69wj/source.jpg',
                description: 'Drake Cutlass Black是一艘坚固的中型飞船。',
                specs: {
                    length: '29m',
                    beam: '26.5m',
                    height: '10m',
                    mass: '223,817 kg'
                }
            }
        ];
    }

    // 加载缓存数据
    loadCachedData() {
        try {
            const cached = localStorage.getItem('uex_ships_cache');
            const cacheTime = localStorage.getItem('uex_cache_time');
            
            if (cached && cacheTime) {
                const timeDiff = Date.now() - parseInt(cacheTime);
                if (timeDiff < this.updateInterval) {
                    this.ships = JSON.parse(cached);
                    this.lastUpdate = parseInt(cacheTime);
                    console.log('📱 已加载缓存的UEX数据');
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠️ 加载缓存数据失败:', error);
        }
        return false;
    }

    // 缓存数据
    cacheData() {
        try {
            localStorage.setItem('uex_ships_cache', JSON.stringify(this.ships));
            localStorage.setItem('uex_cache_time', this.lastUpdate.toString());
        } catch (error) {
            console.warn('⚠️ 缓存数据失败:', error);
        }
    }

    // 加载备用数据
    loadFallbackData() {
        console.log('🔄 使用备用数据...');
        this.getMockShipData().then(ships => {
            this.ships = ships;
            this.lastUpdate = Date.now();
            this.updateItemDatabase();
        });
    }

    // 开始自动更新
    startAutoUpdate() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
        }
        
        this.refreshTimer = setInterval(async () => {
            console.log('🔄 定时更新UEX数据...');
            try {
                await this.fetchShipData();
                this.updateItemDatabase();
            } catch (error) {
                console.error('定时更新失败:', error);
            }
        }, this.updateInterval);
        
        console.log('⏰ 已设置5分钟自动更新');
    }

    // 停止自动更新
    stopAutoUpdate() {
        if (this.refreshTimer) {
            clearInterval(this.refreshTimer);
            this.refreshTimer = null;
            console.log('⏰ 已停止自动更新');
        }
    }

    // 更新物品数据库界面
    updateItemDatabase() {
        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;

        // 清空现有内容
        itemsGrid.innerHTML = '';

        // 添加飞船卡片
        this.ships.forEach(ship => {
            const itemCard = this.createShipCard(ship);
            itemsGrid.appendChild(itemCard);
        });

        // 更新页面标题显示数据更新时间
        this.updateDataTimestamp();
        
        console.log(`🎨 已更新物品数据库，显示 ${this.ships.length} 艘飞船`);
    }

    // 创建飞船卡片
    createShipCard(ship) {
        const card = document.createElement('div');
        card.className = 'item-card';
        card.onclick = () => this.showShipDetails(ship);
        
        card.innerHTML = `
            <img src="${ship.image}" alt="${ship.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23111\\'/%3E%3Crect x=\\'50\\' y=\\'90\\' width=\\'100\\' height=\\'20\\' fill=\\'%23ff6600\\'/%3E%3Crect x=\\'90\\' y=\\'50\\' width=\\'20\\' height=\\'100\\' fill=\\'%23ff6600\\'/%3E%3C/svg%3E'">
            <h4>${ship.name}</h4>
            <p>${ship.manufacturer}</p>
            <div class="ship-info">
                <span class="ship-type">${ship.type}</span>
                <span class="ship-size">${ship.size}</span>
            </div>
            <div class="ship-price">$${ship.price}M UEC</div>
        `;
        
        return card;
    }

    // 显示飞船详情
    showShipDetails(ship) {
        const detailContainer = document.querySelector('.item-detail-container');
        if (!detailContainer) return;

        detailContainer.innerHTML = `
            <div class="item-preview">
                <div class="item-image">
                    <img src="${ship.image}" alt="${ship.name}" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=\\'http://www.w3.org/2000/svg\\' viewBox=\\'0 0 200 200\\'%3E%3Crect width=\\'200\\' height=\\'200\\' fill=\\'%23111\\'/%3E%3Crect x=\\'50\\' y=\\'90\\' width=\\'100\\' height=\\'20\\' fill=\\'%23ff6600\\'/%3E%3Crect x=\\'90\\' y=\\'50\\' width=\\'20\\' height=\\'100\\' fill=\\'%23ff6600\\'/%3E%3C/svg%3E'">
                </div>
                <div class="item-info">
                    <h2>${ship.name}</h2>
                    <p><strong>制造商:</strong> ${ship.manufacturer}</p>
                    <p><strong>类型:</strong> ${ship.type}</p>
                    <p><strong>尺寸:</strong> ${ship.size}</p>
                    <p><strong>船员:</strong> ${ship.crew}</p>
                    <p><strong>货舱:</strong> ${ship.cargo}</p>
                    <p><strong>价格:</strong> $${ship.price}M UEC</p>
                    <div class="ship-description">
                        <h3>描述</h3>
                        <p>${ship.description}</p>
                    </div>
                    <div class="ship-specs">
                        <h3>技术规格</h3>
                        <ul>
                            <li>长度: ${ship.specs.length}</li>
                            <li>宽度: ${ship.specs.beam}</li>
                            <li>高度: ${ship.specs.height}</li>
                            <li>质量: ${ship.specs.mass}</li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
    }

    // 更新数据时间戳显示
    updateDataTimestamp() {
        const timestamp = new Date(this.lastUpdate).toLocaleString();
        const header = document.querySelector('.panel-title-bar h3');
        if (header && this.lastUpdate) {
            header.title = `数据更新时间: ${timestamp}`;
        }
    }

    // 搜索飞船
    searchShips(query) {
        if (!query || query.trim() === '') {
            this.updateItemDatabase();
            return;
        }

        const filteredShips = this.ships.filter(ship => 
            ship.name.toLowerCase().includes(query.toLowerCase()) ||
            ship.manufacturer.toLowerCase().includes(query.toLowerCase()) ||
            ship.type.toLowerCase().includes(query.toLowerCase())
        );

        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;

        itemsGrid.innerHTML = '';
        filteredShips.forEach(ship => {
            const itemCard = this.createShipCard(ship);
            itemsGrid.appendChild(itemCard);
        });

        console.log(`🔍 搜索结果: ${filteredShips.length} 艘飞船`);
    }

    // 获取所有飞船数据
    getShips() {
        return this.ships;
    }

    // 获取更新状态
    getUpdateStatus() {
        return {
            lastUpdate: this.lastUpdate,
            nextUpdate: this.lastUpdate + this.updateInterval,
            isAutoUpdating: !!this.refreshTimer,
            shipCount: this.ships.length
        };
    }
}

// 创建全局实例
window.uexDataManager = new UEXDataManager();

// 覆盖原有的搜索函数
window.searchItems = function(query) {
    if (window.uexDataManager) {
        window.uexDataManager.searchShips(query);
    }
};

console.log('🚀 UEX数据管理器已加载'); 