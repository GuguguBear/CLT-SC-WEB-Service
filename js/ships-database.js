// Star Citizen 飞船数据库系统
class ShipsDatabase {
    constructor() {
        this.ships = [];
        this.filteredShips = [];
        this.currentFilter = 'all';
        this.currentSort = 'name';
        this.searchQuery = '';
        this.manufacturers = new Set();
        this.types = new Set();
        
        console.log('🚀 飞船数据库系统已初始化');
    }

    async init() {
        try {
            await this.loadShipsData();
            this.initializeUI();
            this.bindEvents();
            this.updateDisplay();
            
            console.log('✅ 飞船数据库系统初始化完成');
        } catch (error) {
            console.error('❌ 飞船数据库系统初始化失败:', error);
        }
    }

    // 加载飞船数据（基于UEX Corp数据结构）
    async loadShipsData() {
        // 基于UEX Corp的真实数据结构
        this.ships = [
            // Aegis Dynamics
            {
                id: 'aegis_avenger_stalker',
                name: 'Aegis Avenger Stalker',
                manufacturer: 'Aegis Dynamics',
                category: 'Interdiction',
                subcategory: 'Military',
                price_uec: 1587600,
                price_usd: 60.00,
                cargo: 0,
                crew: '1',
                size: 'Small',
                length: '22.5m',
                beam: '16.5m',
                height: '5.5m',
                mass: '52,868 kg',
                description: '阿维杰尔猎手是一艘专为拦截任务设计的军用飞船，配备先进的拦截设备。',
                image: 'https://media.robertsspaceindustries.com/jl4ncaoer4ayk/source.jpg',
                role: 'Interdiction',
                status: 'Flight Ready'
            },
            {
                id: 'aegis_avenger_titan',
                name: 'Aegis Avenger Titan',
                manufacturer: 'Aegis Dynamics',
                category: 'Cargo',
                subcategory: 'Civilian',
                price_uec: 1358280,
                price_usd: 60.00,
                cargo: 8,
                crew: '1',
                size: 'Small',
                length: '22.5m',
                beam: '16.5m',
                height: '5.5m',
                mass: '52,868 kg',
                description: '阿维杰尔泰坦是一艘多功能小型飞船，平衡了货运能力和战斗性能。',
                image: 'https://media.robertsspaceindustries.com/jl4ncaoer4ayk/source.jpg',
                role: 'Multi-Role',
                status: 'Flight Ready'
            },
            {
                id: 'aegis_eclipse',
                name: 'Aegis Eclipse',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                subcategory: 'Stealth',
                price_uec: 7938000,
                price_usd: 300.00,
                cargo: 0,
                crew: '1',
                size: 'Medium',
                length: '26m',
                beam: '16m',
                height: '4m',
                mass: '75,500 kg',
                description: '阿维杰尔日蚀是一艘隐形轰炸机，专为渗透和精确打击任务设计。',
                image: 'https://media.robertsspaceindustries.com/eclipse/source.jpg',
                role: 'Stealth Bomber',
                status: 'Flight Ready'
            },
            {
                id: 'aegis_gladius',
                name: 'Aegis Gladius',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                subcategory: 'Fighter',
                price_uec: 2381400,
                price_usd: 90.00,
                cargo: 0,
                crew: '1',
                size: 'Small',
                length: '22m',
                beam: '16m',
                height: '5m',
                mass: '41,250 kg',
                description: '阿维杰尔角斗士是一艘轻型战斗机，以其机动性和火力而闻名。',
                image: 'https://media.robertsspaceindustries.com/gladius/source.jpg',
                role: 'Light Fighter',
                status: 'Flight Ready'
            },
            {
                id: 'aegis_hammerhead',
                name: 'Aegis Hammerhead',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                subcategory: 'Corvette',
                price_uec: 47958000,
                price_usd: 725.00,
                cargo: 40,
                crew: '6-9',
                size: 'Large',
                length: '111m',
                beam: '82m',
                height: '22m',
                mass: '3,400,000 kg',
                description: '阿维杰尔锤头鲨是一艘重型护卫舰，配备强大的防空火力。',
                image: 'https://media.robertsspaceindustries.com/hammerhead/source.jpg',
                role: 'Anti-Aircraft',
                status: 'Flight Ready'
            },
            {
                id: 'aegis_reclaimer',
                name: 'Aegis Reclaimer',
                manufacturer: 'Aegis Dynamics',
                category: 'Industrial',
                subcategory: 'Salvage',
                price_uec: 31752000,
                price_usd: 400.00,
                cargo: 420,
                crew: '7',
                size: 'Capital',
                length: '158m',
                beam: '76m',
                height: '44m',
                mass: '8,268,000 kg',
                description: '阿维杰尔回收者是一艘大型打捞船，能够回收和处理太空残骸。',
                image: 'https://media.robertsspaceindustries.com/reclaimer/source.jpg',
                role: 'Heavy Salvage',
                status: 'Flight Ready'
            },

            // Anvil Aerospace
            {
                id: 'anvil_arrow',
                name: 'Anvil Arrow',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                subcategory: 'Fighter',
                price_uec: 1984500,
                price_usd: 75.00,
                cargo: 0,
                crew: '1',
                size: 'Small',
                length: '16m',
                beam: '12m',
                height: '3m',
                mass: '30,000 kg',
                description: '铁砧箭矢是一艘轻型战斗机，专为高速拦截和侦察任务设计。',
                image: 'https://media.robertsspaceindustries.com/arrow/source.jpg',
                role: 'Light Fighter',
                status: 'Flight Ready'
            },
            {
                id: 'anvil_carrack',
                name: 'Anvil Carrack',
                manufacturer: 'Anvil Aerospace',
                category: 'Exploration',
                subcategory: 'Expedition',
                price_uec: 34398000,
                price_usd: 600.00,
                cargo: 456,
                crew: '4-6',
                size: 'Large',
                length: '123m',
                beam: '76m',
                height: '30m',
                mass: '4,784,000 kg',
                description: '铁砧卡拉克是一艘大型探索船，配备先进的扫描设备和长航程能力。',
                image: 'https://media.robertsspaceindustries.com/carrack/source.jpg',
                role: 'Exploration',
                status: 'Flight Ready'
            },
            {
                id: 'anvil_hornet_f7c',
                name: 'Anvil F7C Hornet',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                subcategory: 'Fighter',
                price_uec: 2910600,
                price_usd: 125.00,
                cargo: 2,
                crew: '1',
                size: 'Small',
                length: '22.5m',
                beam: '21.5m',
                height: '5.5m',
                mass: '73,466 kg',
                description: '铁砧大黄蜂是一艘中型战斗机，在UEE海军中广泛使用。',
                image: 'https://media.robertsspaceindustries.com/hornet/source.jpg',
                role: 'Medium Fighter',
                status: 'Flight Ready'
            },
            {
                id: 'anvil_valkyrie',
                name: 'Anvil Valkyrie',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                subcategory: 'Dropship',
                price_uec: 19845000,
                price_usd: 375.00,
                cargo: 90,
                crew: '2',
                size: 'Large',
                length: '46m',
                beam: '48m',
                height: '12m',
                mass: '650,000 kg',
                description: '铁砧瓦尔基里是一艘军用运输舰，专为部队投送和支援任务设计。',
                image: 'https://media.robertsspaceindustries.com/valkyrie/source.jpg',
                role: 'Dropship',
                status: 'Flight Ready'
            },

            // Origin Jumpworks
            {
                id: 'origin_300i',
                name: 'Origin 300i',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                subcategory: 'Touring',
                price_uec: 1375920,
                price_usd: 60.00,
                cargo: 8,
                crew: '1',
                size: 'Small',
                length: '24m',
                beam: '16m',
                height: '7m',
                mass: '75,500 kg',
                description: 'Origin 300i是一艘豪华的个人飞船，结合了舒适性和性能。',
                image: 'https://media.robertsspaceindustries.com/300i/source.jpg',
                role: 'Luxury Touring',
                status: 'Flight Ready'
            },
            {
                id: 'origin_350r',
                name: 'Origin 350r',
                manufacturer: 'Origin Jumpworks',
                category: 'Racing',
                subcategory: 'Civilian',
                price_uec: 3748500,
                price_usd: 125.00,
                cargo: 4,
                crew: '1',
                size: 'Small',
                length: '24m',
                beam: '16m',
                height: '7m',
                mass: '68,000 kg',
                description: 'Origin 350r是一艘高性能竞速飞船，专为速度而设计。',
                image: 'https://media.robertsspaceindustries.com/350r/source.jpg',
                role: 'Racing',
                status: 'Flight Ready'
            },
            {
                id: 'origin_600i',
                name: 'Origin 600i',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                subcategory: 'Luxury',
                price_uec: 24938550,
                price_usd: 435.00,
                cargo: 20,
                crew: '3-5',
                size: 'Large',
                length: '91m',
                beam: '52m',
                height: '16m',
                mass: '1,200,000 kg',
                description: 'Origin 600i是一艘豪华游艇，提供无与伦比的舒适体验。',
                image: 'https://media.robertsspaceindustries.com/600i/source.jpg',
                role: 'Luxury Yacht',
                status: 'Flight Ready'
            },
            {
                id: 'origin_890_jump',
                name: 'Origin 890 Jump',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                subcategory: 'Luxury',
                price_uec: 65356200,
                price_usd: 950.00,
                cargo: 388,
                crew: '8-10',
                size: 'Capital',
                length: '210m',
                beam: '155m',
                height: '65m',
                mass: '18,500,000 kg',
                description: 'Origin 890 Jump是终极豪华巨型游艇，代表了奢华的巅峰。',
                image: 'https://media.robertsspaceindustries.com/890jump/source.jpg',
                role: 'Super Yacht',
                status: 'Flight Ready'
            },

            // RSI (Roberts Space Industries)
            {
                id: 'rsi_aurora_mr',
                name: 'RSI Aurora MR',
                manufacturer: 'Roberts Space Industries',
                category: 'Civilian',
                subcategory: 'Starter',
                price_uec: 680400,
                price_usd: 30.00,
                cargo: 3,
                crew: '1',
                size: 'Small',
                length: '18m',
                beam: '8m',
                height: '4m',
                mass: '25,000 kg',
                description: 'RSI极光MR是一艘入门级飞船，适合新手飞行员开始太空冒险。',
                image: 'https://media.robertsspaceindustries.com/aurora/source.jpg',
                role: 'Starter Ship',
                status: 'Flight Ready'
            },
            {
                id: 'rsi_constellation_andromeda',
                name: 'RSI Constellation Andromeda',
                manufacturer: 'Roberts Space Industries',
                category: 'Multi-Role',
                subcategory: 'Military',
                price_uec: 10160640,
                price_usd: 240.00,
                cargo: 96,
                crew: '3-5',
                size: 'Large',
                length: '61m',
                beam: '26m',
                height: '14m',
                mass: '1,020,000 kg',
                description: 'RSI星座仙女座是一艘大型多用途飞船，平衡了火力、货运和探索能力。',
                image: 'https://media.robertsspaceindustries.com/constellation/source.jpg',
                role: 'Multi-Role',
                status: 'Flight Ready'
            },

            // MISC (Musashi Industrial & Starflight Concern)
            {
                id: 'misc_freelancer',
                name: 'MISC Freelancer',
                manufacturer: 'MISC',
                category: 'Cargo',
                subcategory: 'Medium Freight',
                price_uec: 3317760,
                price_usd: 125.00,
                cargo: 66,
                crew: '2-4',
                size: 'Medium',
                length: '38m',
                beam: '26m',
                height: '9m',
                mass: '466,200 kg',
                description: 'MISC自由职业者是一艘可靠的中型货船，以其耐用性而著称。',
                image: 'https://media.robertsspaceindustries.com/freelancer/source.jpg',
                role: 'Medium Freight',
                status: 'Flight Ready'
            },
            {
                id: 'misc_prospector',
                name: 'MISC Prospector',
                manufacturer: 'MISC',
                category: 'Industrial',
                subcategory: 'Mining',
                price_uec: 2793000,
                price_usd: 155.00,
                cargo: 32,
                crew: '1',
                size: 'Small',
                length: '24m',
                beam: '12m',
                height: '8m',
                mass: '67,000 kg',
                description: 'MISC勘探者是一艘专业采矿船，配备先进的采矿激光器。',
                image: 'https://media.robertsspaceindustries.com/prospector/source.jpg',
                role: 'Mining',
                status: 'Flight Ready'
            },

            // Drake Interplanetary
            {
                id: 'drake_cutlass_black',
                name: 'Drake Cutlass Black',
                manufacturer: 'Drake Interplanetary',
                category: 'Multi-Role',
                subcategory: 'Medium Fighter',
                price_uec: 2646000,
                price_usd: 120.00,
                cargo: 46,
                crew: '1-3',
                size: 'Medium',
                length: '29m',
                beam: '26.5m',
                height: '10m',
                mass: '223,817 kg',
                description: 'Drake短刀黑色版是一艘多功能中型飞船，深受独立承包商喜爱。',
                image: 'https://media.robertsspaceindustries.com/cutlass/source.jpg',
                role: 'Multi-Role Fighter',
                status: 'Flight Ready'
            },
            {
                id: 'drake_caterpillar',
                name: 'Drake Caterpillar',
                manufacturer: 'Drake Interplanetary',
                category: 'Cargo',
                subcategory: 'Heavy Freight',
                price_uec: 7938000,
                price_usd: 330.00,
                cargo: 576,
                crew: '4-5',
                size: 'Large',
                length: '111m',
                beam: '34m',
                height: '17m',
                mass: '4,017,500 kg',
                description: 'Drake毛虫是一艘大型货船，以其模块化设计和大货舱而闻名。',
                image: 'https://media.robertsspaceindustries.com/caterpillar/source.jpg',
                role: 'Heavy Freight',
                status: 'Flight Ready'
            }
        ];

        // 提取制造商和类型用于过滤
        this.ships.forEach(ship => {
            this.manufacturers.add(ship.manufacturer);
            this.types.add(ship.category);
        });

        this.filteredShips = [...this.ships];
        console.log(`📊 已加载 ${this.ships.length} 艘飞船数据`);
    }

    // 初始化UI
    initializeUI() {
        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;

        // 创建搜索和过滤器UI
        this.createSearchAndFilters();
    }

    // 创建搜索和过滤器
    createSearchAndFilters() {
        const searchBox = document.querySelector('.search-box');
        if (!searchBox) return;

        // 更新搜索框
        const searchInput = searchBox.querySelector('input');
        if (searchInput) {
            searchInput.placeholder = 'Search ships...';
            searchInput.addEventListener('input', (e) => {
                this.searchQuery = e.target.value.toLowerCase();
                this.filterAndDisplay();
            });
        }

        // 创建过滤器面板
        this.createFilterPanel();
    }

    // 创建过滤器面板
    createFilterPanel() {
        const leftPanel = document.querySelector('.left-panel');
        if (!leftPanel) return;

        const filterHTML = `
            <div class="ships-filters" style="margin-top: 20px;">
                <div class="filter-section">
                    <h4 style="color: #ff6600; margin-bottom: 10px;">制造商</h4>
                    <select id="manufacturerFilter" class="filter-select">
                        <option value="all">All Manufacturers</option>
                        ${Array.from(this.manufacturers).map(manufacturer => 
                            `<option value="${manufacturer}">${manufacturer}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="filter-section" style="margin-top: 15px;">
                    <h4 style="color: #ff6600; margin-bottom: 10px;">类型</h4>
                    <select id="categoryFilter" class="filter-select">
                        <option value="all">All Categories</option>
                        ${Array.from(this.types).map(type => 
                            `<option value="${type}">${type}</option>`
                        ).join('')}
                    </select>
                </div>
                
                <div class="filter-section" style="margin-top: 15px;">
                    <h4 style="color: #ff6600; margin-bottom: 10px;">排序</h4>
                    <select id="sortFilter" class="filter-select">
                        <option value="name">Name</option>
                        <option value="price_uec">Price (UEC)</option>
                        <option value="price_usd">Price (USD)</option>
                        <option value="cargo">Cargo Capacity</option>
                        <option value="manufacturer">Manufacturer</option>
                    </select>
                </div>
            </div>
        `;

        leftPanel.insertAdjacentHTML('beforeend', filterHTML);
        this.addFilterStyles();
        this.bindFilterEvents();
    }

    // 添加过滤器样式
    addFilterStyles() {
        const style = document.createElement('style');
        style.innerHTML = `
            .ships-filters .filter-section {
                background: rgba(17, 17, 17, 0.8);
                border: 1px solid #ff6600;
                padding: 10px;
                border-radius: 3px;
                margin-bottom: 10px;
            }
            
            .filter-select {
                width: 100%;
                background: #000000;
                border: 1px solid #ff6600;
                color: #ff6600;
                padding: 5px;
                font-family: inherit;
                font-size: 11px;
            }
            
            .filter-select:focus {
                outline: none;
                box-shadow: 0 0 5px rgba(255, 102, 0, 0.5);
            }
        `;
        document.head.appendChild(style);
    }

    // 绑定过滤器事件
    bindFilterEvents() {
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        if (manufacturerFilter) {
            manufacturerFilter.addEventListener('change', () => {
                this.filterAndDisplay();
            });
        }

        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.filterAndDisplay();
            });
        }

        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                this.filterAndDisplay();
            });
        }
    }

    // 过滤和显示
    filterAndDisplay() {
        const manufacturerFilter = document.getElementById('manufacturerFilter');
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');

        let filtered = [...this.ships];

        // 应用搜索
        if (this.searchQuery) {
            filtered = filtered.filter(ship => 
                ship.name.toLowerCase().includes(this.searchQuery) ||
                ship.manufacturer.toLowerCase().includes(this.searchQuery) ||
                ship.category.toLowerCase().includes(this.searchQuery)
            );
        }

        // 应用制造商过滤
        if (manufacturerFilter && manufacturerFilter.value !== 'all') {
            filtered = filtered.filter(ship => ship.manufacturer === manufacturerFilter.value);
        }

        // 应用类型过滤
        if (categoryFilter && categoryFilter.value !== 'all') {
            filtered = filtered.filter(ship => ship.category === categoryFilter.value);
        }

        // 应用排序
        if (sortFilter) {
            const sortBy = sortFilter.value;
            filtered.sort((a, b) => {
                if (sortBy === 'name') {
                    return a.name.localeCompare(b.name);
                } else if (sortBy === 'price_uec' || sortBy === 'price_usd') {
                    return a[sortBy] - b[sortBy];
                } else if (sortBy === 'cargo') {
                    return b.cargo - a.cargo;
                } else if (sortBy === 'manufacturer') {
                    return a.manufacturer.localeCompare(b.manufacturer);
                }
                return 0;
            });
        }

        this.filteredShips = filtered;
        this.updateDisplay();
    }

    // 更新显示
    updateDisplay() {
        const itemsGrid = document.getElementById('itemsGrid');
        if (!itemsGrid) return;

        itemsGrid.innerHTML = '';

        this.filteredShips.forEach(ship => {
            const shipCard = this.createShipCard(ship);
            itemsGrid.appendChild(shipCard);
        });

        console.log(`🚀 显示 ${this.filteredShips.length} 艘飞船`);
    }

    // 创建飞船卡片
    createShipCard(ship) {
        const card = document.createElement('div');
        card.className = 'item-card ship-card';
        card.dataset.shipId = ship.id;

        const priceDisplay = ship.price_usd > 0 ? 
            `$${ship.price_usd} / ${ship.price_uec.toLocaleString()} UEC` : 
            `${ship.price_uec.toLocaleString()} UEC`;

        card.innerHTML = `
            <div class="ship-image">
                <img src="${ship.image}" alt="${ship.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTQiIGZpbGw9IiNmZjY2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaGlwIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
            </div>
            <div class="ship-info">
                <h4>${ship.name}</h4>
                <div class="ship-manufacturer">${ship.manufacturer}</div>
                <div class="ship-category">${ship.category}</div>
                <div class="ship-specs">
                    <div class="spec-item">
                        <span class="spec-label">Cargo:</span>
                        <span class="spec-value">${ship.cargo} SCU</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Crew:</span>
                        <span class="spec-value">${ship.crew}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Size:</span>
                        <span class="spec-value">${ship.size}</span>
                    </div>
                </div>
                <div class="ship-price">${priceDisplay}</div>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            this.showShipDetails(ship);
            // 移除其他选中状态
            document.querySelectorAll('.ship-card.selected').forEach(c => c.classList.remove('selected'));
            // 添加选中状态
            card.classList.add('selected');
        });

        return card;
    }

    // 显示飞船详情
    showShipDetails(ship) {
        const detailContainer = document.querySelector('.item-detail-container');
        if (!detailContainer) return;

        const priceDisplay = ship.price_usd > 0 ? 
            `<div class="price-usd">$${ship.price_usd} USD</div><div class="price-uec">${ship.price_uec.toLocaleString()} UEC</div>` : 
            `<div class="price-uec">${ship.price_uec.toLocaleString()} UEC</div>`;

        detailContainer.innerHTML = `
            <div class="ship-detail">
                <div class="ship-detail-header">
                    <h2>${ship.name}</h2>
                    <div class="ship-status">${ship.status}</div>
                </div>
                
                <div class="ship-detail-image">
                    <img src="${ship.image}" alt="${ship.name}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjI0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjMzMzIi8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJtb25vc3BhY2UiIGZvbnQtc2l6ZT0iMTgiIGZpbGw9IiNmZjY2MDAiIHRleHQtYW5jaG9yPSJtaWRkbGUiIGR5PSIuM2VtIj5TaGlwIEltYWdlPC90ZXh0Pjwvc3ZnPg=='">
                </div>
                
                <div class="ship-detail-info">
                    <div class="ship-basic-info">
                        <div class="info-row">
                            <span class="info-label">制造商:</span>
                            <span class="info-value">${ship.manufacturer}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">类型:</span>
                            <span class="info-value">${ship.category}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">角色:</span>
                            <span class="info-value">${ship.role}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">尺寸:</span>
                            <span class="info-value">${ship.size}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">船员:</span>
                            <span class="info-value">${ship.crew}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">货舱:</span>
                            <span class="info-value">${ship.cargo} SCU</span>
                        </div>
                    </div>
                    
                    <div class="ship-dimensions">
                        <h3>尺寸规格</h3>
                        <div class="info-row">
                            <span class="info-label">长度:</span>
                            <span class="info-value">${ship.length}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">宽度:</span>
                            <span class="info-value">${ship.beam}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">高度:</span>
                            <span class="info-value">${ship.height}</span>
                        </div>
                        <div class="info-row">
                            <span class="info-label">质量:</span>
                            <span class="info-value">${ship.mass}</span>
                        </div>
                    </div>
                    
                    <div class="ship-pricing">
                        <h3>价格信息</h3>
                        ${priceDisplay}
                    </div>
                    
                    <div class="ship-description">
                        <h3>描述</h3>
                        <p>${ship.description}</p>
                    </div>
                </div>
            </div>
        `;

        this.addShipDetailStyles();
    }

    // 添加飞船详情样式
    addShipDetailStyles() {
        if (document.getElementById('ship-detail-styles')) return;

        const style = document.createElement('style');
        style.id = 'ship-detail-styles';
        style.innerHTML = `
            .ship-card {
                border: 2px solid #333333;
                transition: all 0.3s;
            }
            
            .ship-card:hover {
                border-color: #ff6600;
                box-shadow: 0 0 10px rgba(255, 102, 0, 0.3);
            }
            
            .ship-card.selected {
                border-color: #ff6600;
                background: rgba(255, 102, 0, 0.1);
            }
            
            .ship-image {
                width: 100%;
                height: 120px;
                overflow: hidden;
                background: #222222;
            }
            
            .ship-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .ship-info {
                padding: 10px;
            }
            
            .ship-info h4 {
                color: #ff6600;
                margin-bottom: 5px;
                font-size: 14px;
            }
            
            .ship-manufacturer {
                color: #cccccc;
                font-size: 11px;
                margin-bottom: 3px;
            }
            
            .ship-category {
                color: #999999;
                font-size: 10px;
                margin-bottom: 8px;
            }
            
            .ship-specs {
                margin-bottom: 8px;
            }
            
            .spec-item {
                display: flex;
                justify-content: space-between;
                font-size: 10px;
                margin-bottom: 2px;
            }
            
            .spec-label {
                color: #999999;
            }
            
            .spec-value {
                color: #cccccc;
            }
            
            .ship-price {
                color: #ff6600;
                font-size: 11px;
                font-weight: bold;
                text-align: center;
                padding-top: 5px;
                border-top: 1px solid #333333;
            }
            
            .ship-detail {
                padding: 20px;
                color: #cccccc;
            }
            
            .ship-detail-header {
                display: flex;
                justify-content: space-between;
                align-items: center;
                margin-bottom: 20px;
                border-bottom: 2px solid #ff6600;
                padding-bottom: 10px;
            }
            
            .ship-detail-header h2 {
                color: #ff6600;
                font-size: 24px;
            }
            
            .ship-status {
                background: #ff6600;
                color: #000000;
                padding: 4px 12px;
                font-size: 11px;
                font-weight: bold;
            }
            
            .ship-detail-image {
                width: 100%;
                height: 240px;
                overflow: hidden;
                background: #222222;
                border: 2px solid #ff6600;
                margin-bottom: 20px;
            }
            
            .ship-detail-image img {
                width: 100%;
                height: 100%;
                object-fit: cover;
            }
            
            .ship-detail-info {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
            }
            
            .ship-basic-info,
            .ship-dimensions,
            .ship-pricing {
                background: rgba(17, 17, 17, 0.8);
                border: 1px solid #ff6600;
                padding: 15px;
                border-radius: 3px;
            }
            
            .ship-description {
                grid-column: 1 / -1;
                background: rgba(17, 17, 17, 0.8);
                border: 1px solid #ff6600;
                padding: 15px;
                border-radius: 3px;
            }
            
            .ship-detail-info h3 {
                color: #ff6600;
                font-size: 16px;
                margin-bottom: 10px;
                border-bottom: 1px solid #333333;
                padding-bottom: 5px;
            }
            
            .info-row {
                display: flex;
                justify-content: space-between;
                margin-bottom: 8px;
                font-size: 12px;
            }
            
            .info-label {
                color: #999999;
            }
            
            .info-value {
                color: #cccccc;
                font-weight: bold;
            }
            
            .price-usd {
                color: #00ff00;
                font-size: 18px;
                font-weight: bold;
                margin-bottom: 5px;
            }
            
            .price-uec {
                color: #ff6600;
                font-size: 16px;
                font-weight: bold;
            }
            
            @media (max-width: 768px) {
                .ship-detail-info {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }

    // 绑定事件
    bindEvents() {
        // 已在其他方法中处理
    }

    // 获取飞船数据
    getShips() {
        return this.ships;
    }

    // 搜索飞船
    searchShips(query) {
        this.searchQuery = query.toLowerCase();
        this.filterAndDisplay();
    }
}

// 创建全局实例
window.shipsDatabase = new ShipsDatabase();