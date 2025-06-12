const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();
const PORT = 3001;

// 启用CORS
app.use(cors());
app.use(express.json());

// UEX API配置
const UEX_API_BASE = 'https://api.uexcorp.space/2.0';
const UEX_TOKEN = 'd55bc23a6fee307de57c1b07a24c25fe7996444d';
const DAILY_LIMIT = 100; // 用户每日限额
const REQUEST_INTERVAL = (24 * 60 * 60 * 1000) / DAILY_LIMIT; // 每次请求间隔

// 请求限制管理
let requestCount = 0;
let lastRequestTime = 0;
let dailyResetTime = Date.now() + (24 * 60 * 60 * 1000);

console.log('🌐 启动UEX真实API代理服务器...');
console.log(`📊 每日限额: ${DAILY_LIMIT} 请求`);
console.log(`⏱️ 请求间隔: ${Math.round(REQUEST_INTERVAL / 1000)} 秒`);

// 请求限制检查
function checkRateLimit() {
    const now = Date.now();
    
    // 每日重置
    if (now > dailyResetTime) {
        requestCount = 0;
        dailyResetTime = now + (24 * 60 * 60 * 1000);
        console.log('🔄 每日请求计数已重置');
    }
    
    // 检查每日限额
    if (requestCount >= DAILY_LIMIT) {
        throw new Error(`已达到每日限额 ${DAILY_LIMIT} 请求，请明天再试`);
    }
    
    // 检查请求间隔
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < REQUEST_INTERVAL) {
        const waitTime = REQUEST_INTERVAL - timeSinceLastRequest;
        throw new Error(`请求过于频繁，请等待 ${Math.round(waitTime / 1000)} 秒`);
    }
    
    return true;
}

// 发起UEX API请求
async function makeUEXRequest(endpoint, params = {}) {
    checkRateLimit();
    
    requestCount++;
    lastRequestTime = Date.now();
    
    console.log(`📡 UEX API请求 ${requestCount}/${DAILY_LIMIT}: ${endpoint}`);
    
    const response = await axios.get(`${UEX_API_BASE}/${endpoint}`, {
        headers: {
            'Authorization': `Bearer ${UEX_TOKEN}`,
            'Accept': 'application/json',
            'User-Agent': 'Star-Citizen-Tool/3.0'
        },
        params: params,
        timeout: 30000
    });
    
    if (response.data.status !== 'ok') {
        throw new Error(`UEX API错误: ${response.data.message || 'Unknown error'}`);
    }
    
    return response.data.data;
}

// 获取所有飞船数据
app.get('/api/ships', async (req, res) => {
    try {
        console.log('📡 正在从UEX API获取飞船数据...');
        
        // 检查缓存
        const cached = req.headers['use-cache'] !== 'false';
        if (cached) {
            // 这里可以添加Redis或内存缓存逻辑
        }
        
        // 获取飞船基础数据
        const vehicles = await makeUEXRequest('vehicles');
        
        console.log(`✅ 成功获取 ${vehicles.length} 艘飞船基础数据`);
        
        // 处理飞船数据
        const processedShips = vehicles.map(vehicle => ({
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
        
        console.log(`📊 处理完成，返回 ${processedShips.length} 艘飞船`);
        
        res.json({
            success: true,
            count: processedShips.length,
            timestamp: Date.now(),
            ships: processedShips,
            api_usage: {
                requests_used: requestCount,
                daily_limit: DAILY_LIMIT,
                remaining: DAILY_LIMIT - requestCount,
                next_reset: new Date(dailyResetTime).toLocaleString('zh-CN')
            }
        });
        
    } catch (error) {
        console.error('❌ UEX API错误:', error.message);
        
        res.status(error.message.includes('限额') ? 429 : 500).json({
            success: false,
            error: error.message,
            timestamp: Date.now(),
            api_usage: {
                requests_used: requestCount,
                daily_limit: DAILY_LIMIT,
                remaining: DAILY_LIMIT - requestCount
            }
        });
    }
});

// 获取飞船价格信息
app.get('/api/ships/prices', async (req, res) => {
    try {
        console.log('💰 正在获取飞船价格数据...');
        
        // 分别获取不同类型的价格
        const [purchasePrices, rentalPrices] = await Promise.all([
            makeUEXRequest('vehicles_purchases_prices_all'),
            makeUEXRequest('vehicles_rentals_prices_all')
        ]);
        
        res.json({
            success: true,
            purchase_prices: purchasePrices,
            rental_prices: rentalPrices,
            timestamp: Date.now(),
            api_usage: {
                requests_used: requestCount,
                daily_limit: DAILY_LIMIT,
                remaining: DAILY_LIMIT - requestCount
            }
        });
        
    } catch (error) {
        console.error('❌ 获取价格数据失败:', error.message);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// 获取特定飞船详情
app.get('/api/ships/:slug', async (req, res) => {
    try {
        const slug = req.params.slug;
        console.log(`🔍 获取飞船详情: ${slug}`);
        
        // 这里需要根据UEX API文档调整，可能需要从vehicles列表中筛选
        const vehicles = await makeUEXRequest('vehicles');
        const ship = vehicles.find(v => v.slug === slug || v.id === slug);
        
        if (!ship) {
            return res.status(404).json({
                success: false,
                error: '飞船未找到'
            });
        }
        
        res.json({
            success: true,
            ship: ship,
            timestamp: Date.now()
        });
        
    } catch (error) {
        console.error(`❌ 获取飞船详情失败: ${error.message}`);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

// API使用统计
app.get('/api/usage', (req, res) => {
    res.json({
        success: true,
        usage: {
            requests_used: requestCount,
            daily_limit: DAILY_LIMIT,
            remaining: DAILY_LIMIT - requestCount,
            usage_percentage: Math.round((requestCount / DAILY_LIMIT) * 100),
            next_reset: new Date(dailyResetTime).toLocaleString('zh-CN'),
            last_request: lastRequestTime ? new Date(lastRequestTime).toLocaleString('zh-CN') : null
        }
    });
});

// 健康检查
app.get('/health', (req, res) => {
    res.json({
        status: 'healthy',
        timestamp: Date.now(),
        service: 'UEX Real API Proxy Server',
        api_usage: {
            requests_used: requestCount,
            daily_limit: DAILY_LIMIT,
            remaining: DAILY_LIMIT - requestCount
        }
    });
});

// 启动服务器
app.listen(PORT, () => {
    console.log(`🚀 UEX真实API代理服务器运行在 http://localhost:${PORT}`);
    console.log(`📖 获取飞船: http://localhost:${PORT}/api/ships`);
    console.log(`💰 获取价格: http://localhost:${PORT}/api/ships/prices`);
    console.log(`📊 API使用量: http://localhost:${PORT}/api/usage`);
    console.log(`🏥 健康检查: http://localhost:${PORT}/health`);
    console.log(`🔑 使用Token: ${UEX_TOKEN.substring(0, 8)}...`);
}); 