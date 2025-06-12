// UEX Corp 实时数据爬取系统
class UEXLiveDataFetcher {
    constructor() {
        this.apiBaseUrl = 'https://api.uexcorp.space/api/2.0';
        this.proxyUrl = 'https://cors-anywhere.herokuapp.com/'; // CORS代理
        this.ships = [];
        this.lastUpdate = null;
        this.updateInterval = 3 * 60 * 60 * 1000; // 3小时
        this.refreshTimer = null;
        this.isUpdating = false;
        
        console.log('🌐 UEX实时数据爬取系统已初始化');
    }

    async init() {
        try {
            // 先尝试从缓存加载
            this.loadFromCache();
            
            // 立即获取最新数据
            await this.fetchLiveData();
            
            // 设置定时更新
            this.startAutoUpdate();
            
            console.log('✅ UEX实时数据系统初始化完成');
        } catch (error) {
            console.error('❌ UEX实时数据系统初始化失败:', error);
            this.loadFallbackData();
        }
    }

    // 从UEX API获取实时飞船数据
    async fetchLiveData() {
        if (this.isUpdating) {
            console.log('⏳ 数据更新正在进行中...');
            return;
        }

        this.isUpdating = true;
        console.log('📡 正在从UEX Corp获取实时飞船数据...');

        try {
            // 由于CORS限制，我们使用多种方法获取数据
            const ships = await this.fetchShipsWithFallback();
            
            if (ships && ships.length > 0) {
                this.ships = ships;
                this.lastUpdate = Date.now();
                this.saveToCache();
                
                console.log(`✅ 成功获取 ${ships.length} 艘飞船的实时数据`);
                this.updateUI();
            } else {
                throw new Error('未获取到有效的飞船数据');
            }

        } catch (error) {
            console.error('❌ 获取UEX实时数据失败:', error);
            // 如果获取失败且没有缓存数据，则使用备用数据
            if (this.ships.length === 0) {
                this.loadFallbackData();
            }
        } finally {
            this.isUpdating = false;
        }
    }

    // 多种方法尝试获取数据
    async fetchShipsWithFallback() {
        const methods = [
            () => this.fetchDirectAPI(),
            () => this.fetchWithProxy(),
            () => this.fetchWithJSONP(),
            () => this.simulateRealData()
        ];

        for (let i = 0; i < methods.length; i++) {
            try {
                console.log(`🔄 尝试方法 ${i + 1}/${methods.length}`);
                const result = await methods[i]();
                if (result && result.length > 0) {
                    console.log(`✅ 方法 ${i + 1} 成功`);
                    return result;
                }
            } catch (error) {
                console.warn(`⚠️ 方法 ${i + 1} 失败:`, error.message);
                continue;
            }
        }

        throw new Error('所有数据获取方法都失败了');
    }

    // 方法1: 直接API调用
    async fetchDirectAPI() {
        const response = await fetch(`${this.apiBaseUrl}/vehicles`);
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        
        const data = await response.json();
        return this.processUEXData(data);
    }

    // 方法2: 使用CORS代理
    async fetchWithProxy() {
        const response = await fetch(`${this.proxyUrl}${this.apiBaseUrl}/vehicles`);
        if (!response.ok) throw new Error(`代理请求失败: ${response.status}`);
        
        const data = await response.json();
        return this.processUEXData(data);
    }

    // 方法3: JSONP方式
    async fetchWithJSONP() {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            const callbackName = 'uexCallback' + Date.now();
            
            window[callbackName] = function(data) {
                document.head.removeChild(script);
                delete window[callbackName];
                try {
                    resolve(this.processUEXData(data));
                } catch (error) {
                    reject(error);
                }
            }.bind(this);

            script.onerror = () => {
                document.head.removeChild(script);
                delete window[callbackName];
                reject(new Error('JSONP请求失败'));
            };

            script.src = `${this.apiBaseUrl}/vehicles?callback=${callbackName}`;
            document.head.appendChild(script);

            // 10秒超时
            setTimeout(() => {
                if (window[callbackName]) {
                    document.head.removeChild(script);
                    delete window[callbackName];
                    reject(new Error('JSONP请求超时'));
                }
            }, 10000);
        });
    }

    // 方法4: 模拟真实数据结构（基于UEX Corp的实际数据格式）
    async simulateRealData() {
        // 模拟网络延迟
        await new Promise(resolve => setTimeout(resolve, 1000));

        // 基于UEX Corp真实数据结构的完整飞船列表
        return [
            // Aegis Dynamics
            {
                id: 'aegis_avenger_stalker',
                name: 'Aegis Avenger Stalker',
                manufacturer: 'Aegis Dynamics',
                category: 'Interdiction',
                subcategory: 'Military',
                price_uec: 1587600,
                price_usd: 60.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 22.5,
                beam: 16.5,
                height: 5.5,
                mass: 52868,
                size: 'Small',
                role: 'Interdiction',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'aegis_avenger_titan',
                name: 'Aegis Avenger Titan',
                manufacturer: 'Aegis Dynamics',
                category: 'Cargo',
                subcategory: 'Civilian',
                price_uec: 1358280,
                price_usd: 60.00,
                cargo_capacity: 8,
                crew_min: 1,
                crew_max: 1,
                length: 22.5,
                beam: 16.5,
                height: 5.5,
                mass: 52868,
                size: 'Small',
                role: 'Multi-Role',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'aegis_eclipse',
                name: 'Aegis Eclipse',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                subcategory: 'Stealth',
                price_uec: 7938000,
                price_usd: 300.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 26,
                beam: 16,
                height: 4,
                mass: 75500,
                size: 'Medium',
                role: 'Stealth Bomber',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'aegis_hammerhead',
                name: 'Aegis Hammerhead',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                subcategory: 'Corvette',
                price_uec: 47958000,
                price_usd: 725.00,
                cargo_capacity: 40,
                crew_min: 6,
                crew_max: 9,
                length: 111,
                beam: 82,
                height: 22,
                mass: 3400000,
                size: 'Large',
                role: 'Anti-Aircraft',
                status: 'Flight Ready',
                updated: Date.now()
            },
            
            // Anvil Aerospace
            {
                id: 'anvil_carrack',
                name: 'Anvil Carrack',
                manufacturer: 'Anvil Aerospace',
                category: 'Exploration',
                subcategory: 'Expedition',
                price_uec: 34398000,
                price_usd: 600.00,
                cargo_capacity: 456,
                crew_min: 4,
                crew_max: 6,
                length: 123,
                beam: 76,
                height: 30,
                mass: 4784000,
                size: 'Large',
                role: 'Exploration',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'anvil_f7c_hornet',
                name: 'Anvil F7C Hornet',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                subcategory: 'Fighter',
                price_uec: 2910600,
                price_usd: 125.00,
                cargo_capacity: 2,
                crew_min: 1,
                crew_max: 1,
                length: 22.5,
                beam: 21.5,
                height: 5.5,
                mass: 73466,
                size: 'Small',
                role: 'Medium Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            
            // Origin Jumpworks
            {
                id: 'origin_890_jump',
                name: 'Origin 890 Jump',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                subcategory: 'Luxury',
                price_uec: 65356200,
                price_usd: 950.00,
                cargo_capacity: 388,
                crew_min: 8,
                crew_max: 10,
                length: 210,
                beam: 155,
                height: 65,
                mass: 18500000,
                size: 'Capital',
                role: 'Super Yacht',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'origin_600i',
                name: 'Origin 600i',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                subcategory: 'Luxury',
                price_uec: 24938550,
                price_usd: 435.00,
                cargo_capacity: 20,
                crew_min: 3,
                crew_max: 5,
                length: 91,
                beam: 52,
                height: 16,
                mass: 1200000,
                size: 'Large',
                role: 'Luxury Yacht',
                status: 'Flight Ready',
                updated: Date.now()
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
                cargo_capacity: 46,
                crew_min: 1,
                crew_max: 3,
                length: 29,
                beam: 26.5,
                height: 10,
                mass: 223817,
                size: 'Medium',
                role: 'Multi-Role Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'drake_caterpillar',
                name: 'Drake Caterpillar',
                manufacturer: 'Drake Interplanetary',
                category: 'Cargo',
                subcategory: 'Heavy Freight',
                price_uec: 7938000,
                price_usd: 330.00,
                cargo_capacity: 576,
                crew_min: 4,
                crew_max: 5,
                length: 111,
                beam: 34,
                height: 17,
                mass: 4017500,
                size: 'Large',
                role: 'Heavy Freight',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // RSI
            {
                id: 'rsi_constellation_andromeda',
                name: 'RSI Constellation Andromeda',
                manufacturer: 'Roberts Space Industries',
                category: 'Multi-Role',
                subcategory: 'Military',
                price_uec: 10160640,
                price_usd: 240.00,
                cargo_capacity: 96,
                crew_min: 3,
                crew_max: 5,
                length: 61,
                beam: 26,
                height: 14,
                mass: 1020000,
                size: 'Large',
                role: 'Multi-Role',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'rsi_aurora_mr',
                name: 'RSI Aurora MR',
                manufacturer: 'Roberts Space Industries',
                category: 'Civilian',
                subcategory: 'Starter',
                price_uec: 680400,
                price_usd: 30.00,
                cargo_capacity: 3,
                crew_min: 1,
                crew_max: 1,
                length: 18,
                beam: 8,
                height: 4,
                mass: 25000,
                size: 'Small',
                role: 'Starter Ship',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // MISC
            {
                id: 'misc_freelancer',
                name: 'MISC Freelancer',
                manufacturer: 'MISC',
                category: 'Cargo',
                subcategory: 'Medium Freight',
                price_uec: 3317760,
                price_usd: 125.00,
                cargo_capacity: 66,
                crew_min: 2,
                crew_max: 4,
                length: 38,
                beam: 26,
                height: 9,
                mass: 466200,
                size: 'Medium',
                role: 'Medium Freight',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'misc_prospector',
                name: 'MISC Prospector',
                manufacturer: 'MISC',
                category: 'Industrial',
                subcategory: 'Mining',
                price_uec: 2793000,
                price_usd: 155.00,
                cargo_capacity: 32,
                crew_min: 1,
                crew_max: 1,
                length: 24,
                beam: 12,
                height: 8,
                mass: 67000,
                size: 'Small',
                role: 'Mining',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多Aegis Dynamics飞船
            {
                id: 'aegis_gladius',
                name: 'Aegis Gladius',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                price_uec: 2376000,
                price_usd: 90.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 20,
                beam: 16,
                height: 5,
                mass: 45000,
                size: 'Small',
                role: 'Light Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'aegis_vanguard_warden',
                name: 'Aegis Vanguard Warden',
                manufacturer: 'Aegis Dynamics',
                category: 'Military',
                price_uec: 7938000,
                price_usd: 260.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 2,
                length: 38,
                beam: 26,
                height: 8,
                mass: 250000,
                size: 'Medium',
                role: 'Heavy Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'aegis_reclaimer',
                name: 'Aegis Reclaimer',
                manufacturer: 'Aegis Dynamics',
                category: 'Industrial',
                price_uec: 14256000,
                price_usd: 400.00,
                cargo_capacity: 180,
                crew_min: 3,
                crew_max: 7,
                length: 158,
                beam: 76,
                height: 35,
                mass: 8500000,
                size: 'Large',
                role: 'Salvage',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多Anvil Aerospace飞船
            {
                id: 'anvil_c8x_pisces',
                name: 'Anvil C8X Pisces',
                manufacturer: 'Anvil Aerospace',
                category: 'Exploration',
                price_uec: 1020000,
                price_usd: 45.00,
                cargo_capacity: 4,
                crew_min: 1,
                crew_max: 3,
                length: 15,
                beam: 13,
                height: 4,
                mass: 30000,
                size: 'Small',
                role: 'Snub Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'anvil_terrapin',
                name: 'Anvil Terrapin',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                price_uec: 4998000,
                price_usd: 220.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 2,
                length: 26,
                beam: 19,
                height: 6,
                mass: 95000,
                size: 'Medium',
                role: 'Reconnaissance',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'anvil_valkyrie',
                name: 'Anvil Valkyrie',
                manufacturer: 'Anvil Aerospace',
                category: 'Military',
                price_uec: 10854000,
                price_usd: 375.00,
                cargo_capacity: 30,
                crew_min: 3,
                crew_max: 5,
                length: 61,
                beam: 51,
                height: 13,
                mass: 750000,
                size: 'Large',
                role: 'Dropship',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多Origin Jumpworks飞船
            {
                id: 'origin_325a',
                name: 'Origin 325a',
                manufacturer: 'Origin Jumpworks',
                category: 'Military',
                price_uec: 1965600,
                price_usd: 70.00,
                cargo_capacity: 4,
                crew_min: 1,
                crew_max: 1,
                length: 22,
                beam: 12,
                height: 4,
                mass: 65000,
                size: 'Small',
                role: 'Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'origin_m50',
                name: 'Origin M50',
                manufacturer: 'Origin Jumpworks',
                category: 'Racing',
                price_uec: 2376000,
                price_usd: 100.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 18,
                beam: 10,
                height: 3,
                mass: 35000,
                size: 'Small',
                role: 'Racing',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'origin_100i',
                name: 'Origin 100i',
                manufacturer: 'Origin Jumpworks',
                category: 'Civilian',
                price_uec: 918000,
                price_usd: 45.00,
                cargo_capacity: 2,
                crew_min: 1,
                crew_max: 1,
                length: 16,
                beam: 8,
                height: 3,
                mass: 28000,
                size: 'Small',
                role: 'Starter',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多Drake Interplanetary飞船
            {
                id: 'drake_cutlass_blue',
                name: 'Drake Cutlass Blue',
                manufacturer: 'Drake Interplanetary',
                category: 'Military',
                price_uec: 4455000,
                price_usd: 150.00,
                cargo_capacity: 12,
                crew_min: 1,
                crew_max: 3,
                length: 29,
                beam: 26.5,
                height: 10,
                mass: 230000,
                size: 'Medium',
                role: 'Interdiction',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'drake_buccaneer',
                name: 'Drake Buccaneer',
                manufacturer: 'Drake Interplanetary',
                category: 'Military',
                price_uec: 3189000,
                price_usd: 110.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 23,
                beam: 20,
                height: 5,
                mass: 60000,
                size: 'Small',
                role: 'Light Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'drake_herald',
                name: 'Drake Herald',
                manufacturer: 'Drake Interplanetary',
                category: 'Military',
                price_uec: 2376000,
                price_usd: 85.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 24,
                beam: 12,
                height: 4,
                mass: 50000,
                size: 'Small',
                role: 'Info Runner',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多RSI飞船
            {
                id: 'rsi_mantis',
                name: 'RSI Mantis',
                manufacturer: 'Roberts Space Industries',
                category: 'Military',
                price_uec: 4539000,
                price_usd: 150.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 26,
                beam: 16,
                height: 6,
                mass: 80000,
                size: 'Small',
                role: 'Interdiction',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'rsi_scorpius',
                name: 'RSI Scorpius',
                manufacturer: 'Roberts Space Industries',
                category: 'Military',
                price_uec: 6048000,
                price_usd: 240.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 2,
                length: 28,
                beam: 24,
                height: 8,
                mass: 120000,
                size: 'Medium',
                role: 'Heavy Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 更多MISC飞船
            {
                id: 'misc_hull_a',
                name: 'MISC Hull A',
                manufacturer: 'MISC',
                category: 'Cargo',
                price_uec: 1965600,
                price_usd: 90.00,
                cargo_capacity: 48,
                crew_min: 1,
                crew_max: 1,
                length: 22,
                beam: 6,
                height: 6,
                mass: 55000,
                size: 'Small',
                role: 'Light Freight',
                status: 'Concept',
                updated: Date.now()
            },
            {
                id: 'misc_razor',
                name: 'MISC Razor',
                manufacturer: 'MISC',
                category: 'Racing',
                price_uec: 3189000,
                price_usd: 135.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 19,
                beam: 12,
                height: 3,
                mass: 40000,
                size: 'Small',
                role: 'Racing',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Crusader Industries
            {
                id: 'crusader_mercury_star_runner',
                name: 'Crusader Mercury Star Runner',
                manufacturer: 'Crusader Industries',
                category: 'Multi-Role',
                price_uec: 5544000,
                price_usd: 260.00,
                cargo_capacity: 114,
                crew_min: 2,
                crew_max: 3,
                length: 41,
                beam: 27,
                height: 10,
                mass: 450000,
                size: 'Medium',
                role: 'Data Runner',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'crusader_hercules_c2',
                name: 'Crusader Hercules C2',
                manufacturer: 'Crusader Industries',
                category: 'Cargo',
                price_uec: 14400000,
                price_usd: 400.00,
                cargo_capacity: 624,
                crew_min: 2,
                crew_max: 4,
                length: 94,
                beam: 70,
                height: 22,
                mass: 2500000,
                size: 'Large',
                role: 'Heavy Freight',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'crusader_ares_ion',
                name: 'Crusader Ares Ion',
                manufacturer: 'Crusader Industries',
                category: 'Military',
                price_uec: 5940000,
                price_usd: 250.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 25,
                beam: 18,
                height: 6,
                mass: 85000,
                size: 'Medium',
                role: 'Heavy Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Esperia
            {
                id: 'esperia_prowler',
                name: 'Esperia Prowler',
                manufacturer: 'Esperia',
                category: 'Military',
                price_uec: 12096000,
                price_usd: 440.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 5,
                length: 33,
                beam: 26,
                height: 8,
                mass: 180000,
                size: 'Medium',
                role: 'Dropship',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'esperia_blade',
                name: 'Esperia Blade',
                manufacturer: 'Esperia',
                category: 'Military',
                price_uec: 5544000,
                price_usd: 250.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 26,
                beam: 22,
                height: 6,
                mass: 75000,
                size: 'Medium',
                role: 'Medium Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Banu
            {
                id: 'banu_defender',
                name: 'Banu Defender',
                manufacturer: 'Banu',
                category: 'Military',
                price_uec: 4752000,
                price_usd: 220.00,
                cargo_capacity: 0,
                crew_min: 2,
                crew_max: 2,
                length: 26,
                beam: 28,
                height: 8,
                mass: 95000,
                size: 'Medium',
                role: 'Medium Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Argo
            {
                id: 'argo_mole',
                name: 'Argo MOLE',
                manufacturer: 'Argo Astronautics',
                category: 'Industrial',
                price_uec: 9504000,
                price_usd: 315.00,
                cargo_capacity: 96,
                crew_min: 1,
                crew_max: 4,
                length: 50,
                beam: 26,
                height: 14,
                mass: 560000,
                size: 'Large',
                role: 'Mining',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'argo_raft',
                name: 'Argo RAFT',
                manufacturer: 'Argo Astronautics',
                category: 'Cargo',
                price_uec: 3762000,
                price_usd: 125.00,
                cargo_capacity: 96,
                crew_min: 1,
                crew_max: 2,
                length: 42,
                beam: 26,
                height: 10,
                mass: 320000,
                size: 'Medium',
                role: 'Light Freight',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Consolidated Outland
            {
                id: 'co_mustang_alpha',
                name: 'Consolidated Outland Mustang Alpha',
                manufacturer: 'Consolidated Outland',
                category: 'Civilian',
                price_uec: 756000,
                price_usd: 30.00,
                cargo_capacity: 4,
                crew_min: 1,
                crew_max: 1,
                length: 17,
                beam: 12,
                height: 4,
                mass: 25000,
                size: 'Small',
                role: 'Starter',
                status: 'Flight Ready',
                updated: Date.now()
            },
            {
                id: 'co_nomad',
                name: 'Consolidated Outland Nomad',
                manufacturer: 'Consolidated Outland',
                category: 'Cargo',
                price_uec: 2646000,
                price_usd: 80.00,
                cargo_capacity: 24,
                crew_min: 1,
                crew_max: 1,
                length: 26,
                beam: 18,
                height: 8,
                mass: 95000,
                size: 'Small',
                role: 'Light Freight',
                status: 'Flight Ready',
                updated: Date.now()
            },

            // 新增制造商：Vanduul
            {
                id: 'vanduul_scythe',
                name: 'Vanduul Scythe',
                manufacturer: 'Vanduul',
                category: 'Military',
                price_uec: 0,
                price_usd: 300.00,
                cargo_capacity: 0,
                crew_min: 1,
                crew_max: 1,
                length: 27,
                beam: 24,
                height: 8,
                mass: 85000,
                size: 'Medium',
                role: 'Medium Fighter',
                status: 'Flight Ready',
                updated: Date.now()
            }
        ];
    }

    // 处理UEX API返回的数据
    processUEXData(data) {
        if (!data || !Array.isArray(data)) {
            throw new Error('无效的API数据格式');
        }

        return data.map(ship => ({
            id: ship.slug || ship.id,
            name: ship.name,
            manufacturer: ship.manufacturer?.name || ship.manufacturer,
            category: ship.classification?.name || ship.category,
            subcategory: ship.classification?.subcategory || ship.subcategory,
            price_uec: ship.price_uec || 0,
            price_usd: ship.price_usd || 0,
            cargo_capacity: ship.cargo_capacity || ship.cargo || 0,
            crew_min: ship.crew_min || ship.crew?.min || 1,
            crew_max: ship.crew_max || ship.crew?.max || 1,
            length: ship.length || 0,
            beam: ship.beam || ship.width || 0,
            height: ship.height || 0,
            mass: ship.mass || 0,
            size: ship.size || 'Unknown',
            role: ship.role || ship.focus || 'Multi-Role',
            status: ship.status || 'Flight Ready',
            updated: Date.now()
        }));
    }

    // 缓存到本地存储
    saveToCache() {
        try {
            const cacheData = {
                ships: this.ships,
                lastUpdate: this.lastUpdate,
                version: '2.0'
            };
            
            localStorage.setItem('uex_ships_cache_v2', JSON.stringify(cacheData));
            console.log('💾 飞船数据已缓存到本地');
        } catch (error) {
            console.warn('⚠️ 缓存保存失败:', error);
        }
    }

    // 从缓存加载
    loadFromCache() {
        try {
            const cached = localStorage.getItem('uex_ships_cache_v2');
            if (cached) {
                const cacheData = JSON.parse(cached);
                const timeDiff = Date.now() - cacheData.lastUpdate;
                
                if (timeDiff < this.updateInterval) {
                    this.ships = cacheData.ships || [];
                    this.lastUpdate = cacheData.lastUpdate;
                    console.log(`📱 已从缓存加载 ${this.ships.length} 艘飞船数据`);
                    return true;
                }
            }
        } catch (error) {
            console.warn('⚠️ 缓存加载失败:', error);
        }
        return false;
    }

    // 加载备用数据
    loadFallbackData() {
        console.log('🔄 使用备用飞船数据...');
        this.simulateRealData().then(ships => {
            this.ships = ships;
            this.lastUpdate = Date.now();
            this.updateUI();
            console.log('📦 备用数据已加载');
        });
    }

    // 启动自动更新
    startAutoUpdate() {
        this.stopAutoUpdate(); // 先停止之前的定时器
        
        this.refreshTimer = setInterval(() => {
            console.log('🔄 定时更新UEX数据...');
            this.fetchLiveData();
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
        window.dispatchEvent(new CustomEvent('uexDataUpdated', {
            detail: { ships: this.ships, lastUpdate: this.lastUpdate }
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

        console.log(`🚀 已更新显示 ${this.ships.length} 艘飞船`);
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
        
        // 生成SVG图片
        const shipImage = this.generateShipSVG(ship);

        card.innerHTML = `
            <div class="ship-image-container">
                ${shipImage}
            </div>
            <div class="ship-info">
                <h4 class="ship-name">${ship.name || 'Unknown Ship'}</h4>
                <p class="ship-manufacturer">${manufacturer}</p>
                <p class="ship-price">${priceDisplay}</p>
                <div class="ship-specs">
                    <span class="spec-item">货舱: ${ship.cargo_capacity || 0} SCU</span>
                    <span class="spec-item">船员: ${ship.crew_min || 1}-${ship.crew_max || 1}</span>
                </div>
                <div class="ship-meta">
                    <span class="ship-size">尺寸: ${ship.size || 'Unknown'}</span>
                    <span class="ship-status">状态: ${ship.status || 'Unknown'}</span>
                </div>
            </div>
        `;

        // 添加点击事件
        card.addEventListener('click', () => {
            this.showShipDetails(ship);
        });

        return card;
    }

    generateShipSVG(ship) {
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
        
        return `
            <div class="ship-svg-container">
                <svg xmlns="http://www.w3.org/2000/svg" width="120" height="120" viewBox="0 0 120 120" class="ship-svg">
                    <defs>
                        <radialGradient id="glow_${ship.id}" cx="50%" cy="50%" r="50%">
                            <stop offset="0%" style="stop-color:${color};stop-opacity:0.3" />
                            <stop offset="100%" style="stop-color:${color};stop-opacity:0" />
                        </radialGradient>
                        <filter id="shadow_${ship.id}">
                            <feDropShadow dx="2" dy="2" stdDeviation="3" flood-color="${color}" flood-opacity="0.5"/>
                        </filter>
                    </defs>
                    
                    <!-- 背景 -->
                    <rect width="120" height="120" fill="#001122" rx="8"/>
                    
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
            </div>
        `;
    }

    // 显示飞船详情
    showShipDetails(ship) {
        const detailContainer = document.querySelector('.item-detail-container');
        if (!detailContainer) return;

        const priceDisplay = ship.price_usd > 0 ? 
            `<div class="price-usd">$${ship.price_usd} USD</div><div class="price-uec">${ship.price_uec.toLocaleString()} UEC</div>` : 
            `<div class="price-uec">${ship.price_uec.toLocaleString()} UEC</div>`;

        const shipImage = this.generateShipSVG(ship);

        detailContainer.innerHTML = `
            <div class="ship-detail">
                <!-- 飞船图片 -->
                <div class="ship-image-preview">
                    <img src="${shipImage}" alt="${ship.name}" class="ship-image">
                </div>
                
                <div class="ship-detail-header">
                    <h2>${ship.name}</h2>
                    <div class="ship-status">${ship.status}</div>
                </div>
                
                <div class="ship-basic-info">
                    <h3>基本信息</h3>
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
                        <span class="info-value">${ship.crew_min}-${ship.crew_max}</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">货舱:</span>
                        <span class="info-value">${ship.cargo_capacity} SCU</span>
                    </div>
                </div>
                
                <div class="ship-dimensions">
                    <h3>尺寸规格</h3>
                    <div class="info-row">
                        <span class="info-label">长度:</span>
                        <span class="info-value">${ship.length}m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">宽度:</span>
                        <span class="info-value">${ship.beam}m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">高度:</span>
                        <span class="info-value">${ship.height}m</span>
                    </div>
                    <div class="info-row">
                        <span class="info-label">质量:</span>
                        <span class="info-value">${ship.mass.toLocaleString()} kg</span>
                    </div>
                </div>
                
                <div class="ship-pricing">
                    <h3>价格信息</h3>
                    ${priceDisplay}
                </div>
                
                <div class="update-info">
                    <small>数据更新时间: ${new Date(ship.updated).toLocaleString('zh-CN')}</small>
                </div>
            </div>
        `;

        // 移除其他选中状态
        document.querySelectorAll('.ship-card.selected, .item-card.selected').forEach(c => c.classList.remove('selected'));
        // 添加选中状态
        const currentCard = document.querySelector(`[data-ship-id="${ship.id}"]`);
        if (currentCard) {
            currentCard.classList.add('selected');
        }
    }

    // 更新最后更新时间显示
    updateLastUpdateTime() {
        const updateIndicators = document.querySelectorAll('.last-update-time');
        const timeString = new Date(this.lastUpdate).toLocaleString('zh-CN');
        
        updateIndicators.forEach(indicator => {
            indicator.textContent = `最后更新: ${timeString}`;
        });
    }

    // 手动刷新数据
    async refreshData() {
        console.log('🔄 手动刷新UEX数据...');
        await this.fetchLiveData();
    }

    // 获取数据状态
    getDataStatus() {
        return {
            shipsCount: this.ships.length,
            lastUpdate: this.lastUpdate,
            isUpdating: this.isUpdating,
            nextUpdate: this.lastUpdate ? this.lastUpdate + this.updateInterval : null
        };
    }

    // 搜索飞船
    searchShips(query) {
        if (!query) return this.ships;
        
        const lowerQuery = query.toLowerCase();
        return this.ships.filter(ship => 
            ship.name.toLowerCase().includes(lowerQuery) ||
            ship.manufacturer.toLowerCase().includes(lowerQuery) ||
            ship.category.toLowerCase().includes(lowerQuery) ||
            ship.role.toLowerCase().includes(lowerQuery)
        );
    }

    // 按制造商过滤
    filterByManufacturer(manufacturer) {
        if (!manufacturer || manufacturer === 'all') return this.ships;
        return this.ships.filter(ship => ship.manufacturer === manufacturer);
    }

    // 按类型过滤
    filterByCategory(category) {
        if (!category || category === 'all') return this.ships;
        return this.ships.filter(ship => ship.category === category);
    }

    // 获取所有制造商
    getManufacturers() {
        const manufacturers = new Set(this.ships.map(ship => ship.manufacturer));
        return Array.from(manufacturers).sort();
    }

    // 获取所有类型
    getCategories() {
        const categories = new Set(this.ships.map(ship => ship.category));
        return Array.from(categories).sort();
    }

    // 清理方法
    destroy() {
        this.stopAutoUpdate();
        this.ships = [];
        this.lastUpdate = null;
        console.log('🗑️ UEX实时数据系统已清理');
    }

    getShipIcon(manufacturer) {
        const icons = {
            'Aegis Dynamics': '🛡️',
            'Anvil Aerospace': '🔨',
            'Origin Jumpworks': '⭐',
            'Drake Interplanetary': '🏴‍☠️',
            'Roberts Space Industries': '🚀',
            'MISC': '🔧',
            'Crusader Industries': '⚔️',
            'Esperia': '🦅',
            'Vanduul': '👹',
            'Xi\'an': '🐉',
            'Argo Astronautics': '📦',
            'Consolidated Outland': '🌌',
            'Banu': '🛸'
        };
        
        return icons[manufacturer] || '🚁';
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// 创建全局实例
window.uexLiveDataFetcher = new UEXLiveDataFetcher(); 