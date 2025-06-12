// 中英文本地化系统
class LocalizationSystem {
    constructor() {
        this.currentLanguage = 'zh-CN';
        this.translations = {
            'zh-CN': {
                // 飞船相关
                'ships': '飞船',
                'manufacturer': '制造商',
                'cargo_capacity': '货舱容量',
                'crew': '船员',
                'size': '尺寸',
                'status': '状态',
                'price': '价格',
                'length': '长度',
                'beam': '宽度',
                'height': '高度',
                'mass': '质量',
                
                // 制造商
                'Aegis Dynamics': '神盾动力',
                'Anvil Aerospace': '铁砧航空',
                'Origin Jumpworks': '起源跃迁',
                'Drake Interplanetary': '德雷克星际',
                'Roberts Space Industries': '罗伯茨太空工业',
                'MISC': '多元工业供应公司',
                'Crusader Industries': '十字军工业',
                'Esperia': '埃斯佩里亚',
                'Vanduul': '剜度',
                'Xi\'an': '希安',
                'Argo Astronautics': '阿尔戈航天',
                'Consolidated Outland': '联合外域',
                'Banu': '巴努',
                
                // 飞船类型
                'Fighter': '战斗机',
                'Bomber': '轰炸机',
                'Interceptor': '拦截机',
                'Cargo': '货船',
                'Transport': '运输船',
                'Mining': '采矿船',
                'Exploration': '探索船',
                'Racing': '竞速船',
                'Multi-Role': '多用途',
                'Capital': '主力舰',
                'Corvette': '护卫舰',
                'Frigate': '护卫舰',
                'Destroyer': '驱逐舰',
                'Cruiser': '巡洋舰',
                'Battleship': '战列舰',
                'Carrier': '航母',
                
                // 尺寸
                'Small': '小型',
                'Medium': '中型',
                'Large': '大型',
                'Capital': '主力舰级',
                'Unknown': '未知',
                
                // 状态
                'Flight Ready': '可飞行',
                'In Development': '开发中',
                'Concept': '概念阶段',
                'Hangar Ready': '机库就绪',
                
                // UI元素
                'search_placeholder': '搜索飞船名称、制造商或类型...',
                'no_results': '未找到匹配的飞船',
                'loading': '加载中...',
                'error': '错误',
                'refresh': '刷新',
                'details': '详情',
                'specifications': '规格参数',
                'description': '描述',
                
                // 贸易相关
                'trading': '贸易',
                'routes': '路线',
                'profit': '利润',
                'investment': '投资',
                'buy_price': '买入价格',
                'sell_price': '卖出价格',
                'profit_margin': '利润率',
                'commodity': '商品',
                'location': '地点',
                'station': '空间站',
                'terminal': '终端',
                
                // 系统状态
                'online': '在线',
                'offline': '离线',
                'connected': '已连接',
                'disconnected': '已断开',
                'api_usage': 'API使用量',
                'cache_status': '缓存状态',
                'last_update': '最后更新',
                'system_health': '系统健康度'
            },
            'en-US': {
                // 飞船相关
                'ships': 'Ships',
                'manufacturer': 'Manufacturer',
                'cargo_capacity': 'Cargo Capacity',
                'crew': 'Crew',
                'size': 'Size',
                'status': 'Status',
                'price': 'Price',
                'length': 'Length',
                'beam': 'Beam',
                'height': 'Height',
                'mass': 'Mass',
                
                // 制造商 (保持英文)
                'Aegis Dynamics': 'Aegis Dynamics',
                'Anvil Aerospace': 'Anvil Aerospace',
                'Origin Jumpworks': 'Origin Jumpworks',
                'Drake Interplanetary': 'Drake Interplanetary',
                'Roberts Space Industries': 'Roberts Space Industries',
                'MISC': 'MISC',
                'Crusader Industries': 'Crusader Industries',
                'Esperia': 'Esperia',
                'Vanduul': 'Vanduul',
                'Xi\'an': 'Xi\'an',
                'Argo Astronautics': 'Argo Astronautics',
                'Consolidated Outland': 'Consolidated Outland',
                'Banu': 'Banu',
                
                // 飞船类型
                'Fighter': 'Fighter',
                'Bomber': 'Bomber',
                'Interceptor': 'Interceptor',
                'Cargo': 'Cargo',
                'Transport': 'Transport',
                'Mining': 'Mining',
                'Exploration': 'Exploration',
                'Racing': 'Racing',
                'Multi-Role': 'Multi-Role',
                'Capital': 'Capital',
                'Corvette': 'Corvette',
                'Frigate': 'Frigate',
                'Destroyer': 'Destroyer',
                'Cruiser': 'Cruiser',
                'Battleship': 'Battleship',
                'Carrier': 'Carrier',
                
                // 尺寸
                'Small': 'Small',
                'Medium': 'Medium',
                'Large': 'Large',
                'Capital': 'Capital',
                'Unknown': 'Unknown',
                
                // 状态
                'Flight Ready': 'Flight Ready',
                'In Development': 'In Development',
                'Concept': 'Concept',
                'Hangar Ready': 'Hangar Ready',
                
                // UI元素
                'search_placeholder': 'Search ships, manufacturers, or types...',
                'no_results': 'No matching ships found',
                'loading': 'Loading...',
                'error': 'Error',
                'refresh': 'Refresh',
                'details': 'Details',
                'specifications': 'Specifications',
                'description': 'Description',
                
                // 贸易相关
                'trading': 'Trading',
                'routes': 'Routes',
                'profit': 'Profit',
                'investment': 'Investment',
                'buy_price': 'Buy Price',
                'sell_price': 'Sell Price',
                'profit_margin': 'Profit Margin',
                'commodity': 'Commodity',
                'location': 'Location',
                'station': 'Station',
                'terminal': 'Terminal',
                
                // 系统状态
                'online': 'Online',
                'offline': 'Offline',
                'connected': 'Connected',
                'disconnected': 'Disconnected',
                'api_usage': 'API Usage',
                'cache_status': 'Cache Status',
                'last_update': 'Last Update',
                'system_health': 'System Health'
            }
        };
        
        console.log('🌐 本地化系统已初始化');
    }

    // 获取翻译文本
    t(key, fallback = null) {
        const translation = this.translations[this.currentLanguage]?.[key] || 
                          this.translations['en-US']?.[key] || 
                          fallback || 
                          key;
        return translation;
    }

    // 获取双语文本 (中文 / English)
    getBilingual(key, englishKey = null) {
        const chinese = this.translations['zh-CN']?.[key] || key;
        const english = englishKey ? 
                       this.translations['en-US']?.[englishKey] : 
                       this.translations['en-US']?.[key] || key;
        
        if (chinese === english) {
            return chinese;
        }
        
        return `${chinese} / ${english}`;
    }

    // 搜索支持中英文
    searchMatch(text, query) {
        if (!text || !query) return false;
        
        const normalizedText = text.toLowerCase();
        const normalizedQuery = query.toLowerCase();
        
        // 直接匹配
        if (normalizedText.includes(normalizedQuery)) {
            return true;
        }
        
        // 检查是否有对应的翻译匹配
        for (const lang of ['zh-CN', 'en-US']) {
            const translations = this.translations[lang];
            for (const [key, value] of Object.entries(translations)) {
                if (value.toLowerCase() === normalizedText) {
                    // 找到了对应的key，检查其他语言的翻译
                    for (const otherLang of ['zh-CN', 'en-US']) {
                        if (otherLang !== lang) {
                            const otherTranslation = this.translations[otherLang]?.[key];
                            if (otherTranslation && otherTranslation.toLowerCase().includes(normalizedQuery)) {
                                return true;
                            }
                        }
                    }
                }
            }
        }
        
        return false;
    }

    // 切换语言
    setLanguage(lang) {
        if (this.translations[lang]) {
            this.currentLanguage = lang;
            this.updateUI();
            console.log(`🌐 语言已切换到: ${lang}`);
        }
    }

    // 更新UI文本
    updateUI() {
        // 更新所有带有 data-i18n 属性的元素
        document.querySelectorAll('[data-i18n]').forEach(element => {
            const key = element.getAttribute('data-i18n');
            element.textContent = this.t(key);
        });

        // 更新占位符文本
        document.querySelectorAll('[data-i18n-placeholder]').forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            element.placeholder = this.t(key);
        });
    }

    // 格式化飞船信息为双语
    formatShipInfo(ship) {
        return {
            ...ship,
            manufacturer_bilingual: this.getBilingual(ship.manufacturer),
            category_bilingual: this.getBilingual(ship.category),
            size_bilingual: this.getBilingual(ship.size),
            status_bilingual: this.getBilingual(ship.status),
            role_bilingual: this.getBilingual(ship.role)
        };
    }

    // 获取搜索关键词（包含中英文）
    getSearchKeywords(ship) {
        const keywords = [
            ship.name,
            ship.manufacturer,
            ship.category,
            ship.size,
            ship.status,
            ship.role
        ];

        // 添加中文翻译
        keywords.push(
            this.t(ship.manufacturer),
            this.t(ship.category),
            this.t(ship.size),
            this.t(ship.status),
            this.t(ship.role)
        );

        return keywords.filter(Boolean).join(' ').toLowerCase();
    }
}

// 创建全局实例
window.localization = new LocalizationSystem(); 