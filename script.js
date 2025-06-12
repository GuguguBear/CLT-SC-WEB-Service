// 全局变量
let currentUser = null;
let users = JSON.parse(localStorage.getItem('sc_users') || '{}');
let chatMessages = JSON.parse(localStorage.getItem('sc_chat_messages') || '[]');
let currentItems = [];
let selectedItem = null;

// 德雷克风格全局变量
let systemStartTime = Date.now();
let uptimeInterval;

// 真实星际公民物品数据 (基于UEX Corp Space)
const realStarCitizenItems = [
    {
        id: 1,
        code: "DIAM",
        name: "钻石 (Diamond)",
        type: "贵金属",
        rarity: "稀有",
        price: 5000,
        marketPrice: 5123,
        description: "天然钻石，用于高端电子设备和珠宝制造",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "5,123 aUEC/SCU",
            "波动率": "±15%",
            "需求": "高",
            "产地": "Aaron Belt"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpath d='M50 15 L65 35 L50 85 L35 35 Z' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Cpath d='M35 35 L65 35' stroke='%2300ffff' stroke-width='1'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EDIAM%3C/text%3E%3C/svg%3E"
    },
    {
        id: 2,
        code: "GOLD",
        name: "黄金 (Gold)",
        type: "贵金属",
        rarity: "稀有",
        price: 6000,
        marketPrice: 6245,
        description: "纯度99.9%的黄金，广泛用于电子和装饰",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "6,245 aUEC/SCU",
            "波动率": "±8%",
            "需求": "稳定",
            "产地": "多个星系"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='50' cy='50' r='25' fill='none' stroke='%23FFD700' stroke-width='3'/%3E%3Ccircle cx='50' cy='50' r='15' fill='%23FFD700' opacity='0.3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EGOLD%3C/text%3E%3C/svg%3E"
    },
    {
        id: 3,
        code: "QUAN",
        name: "量子能量 (Quantainium)",
        type: "能源材料",
        rarity: "传奇",
        price: 22000,
        marketPrice: 22567,
        description: "极不稳定的高能材料，用于量子驱动器",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "22,567 aUEC/SCU",
            "波动率": "±25%",
            "需求": "极高",
            "风险": "不稳定 - 会爆炸"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpolygon points='50,15 65,35 65,65 50,85 35,65 35,35' fill='none' stroke='%23FF00FF' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%23FF00FF' opacity='0.6'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EQUAN%3C/text%3E%3C/svg%3E"
    },
    {
        id: 4,
        code: "LARA",
        name: "Laranite",
        type: "工业材料",
        rarity: "军用",
        price: 3000,
        marketPrice: 3156,
        description: "高强度合金材料，用于船舶装甲制造",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "3,156 aUEC/SCU",
            "波动率": "±12%",
            "需求": "高",
            "用途": "船舶装甲"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='25' y='25' width='50' height='50' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Cpath d='M25 25 L75 75 M75 25 L25 75' stroke='%2300ffff' stroke-width='1'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ELARA%3C/text%3E%3C/svg%3E"
    },
    {
        id: 5,
        code: "ALUM",
        name: "铝材 (Aluminum)",
        type: "基础材料",
        rarity: "常见",
        price: 297,
        marketPrice: 315,
        description: "轻质金属材料，广泛用于建筑和制造",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "315 aUEC/SCU",
            "波动率": "±5%",
            "需求": "稳定",
            "产量": "高"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%23C0C0C0' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%23C0C0C0' stroke-width='1'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EALUM%3C/text%3E%3C/svg%3E"
    },
    {
        id: 6,
        code: "TITA",
        name: "钛金属 (Titanium)",
        type: "高级材料",
        rarity: "工业",
        price: 448,
        marketPrice: 467,
        description: "超强轻质金属，用于高性能组件制造",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "467 aUEC/SCU",
            "波动率": "±8%",
            "需求": "高",
            "强度": "极高"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpolygon points='50,20 70,40 70,60 50,80 30,60 30,40' fill='none' stroke='%23A0A0A0' stroke-width='2'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ETITA%3C/text%3E%3C/svg%3E"
    },
    {
        id: 7,
        code: "HADA",
        name: "Hadanite",
        type: "稀有矿物",
        rarity: "传奇",
        price: 548000,
        marketPrice: 587230,
        description: "极其稀有的晶体，具有独特的能量特性",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "587,230 aUEC/SCU",
            "波动率": "±30%",
            "需求": "极高",
            "稀有度": "传奇级"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpath d='M50 10 L70 30 L60 70 L40 70 L30 30 Z' fill='none' stroke='%23FF6B6B' stroke-width='2'/%3E%3Ccircle cx='50' cy='45' r='8' fill='%23FF6B6B' opacity='0.6'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EHADA%3C/text%3E%3C/svg%3E"
    },
    {
        id: 8,
        code: "WIDO",
        name: "WiDoW (禁药)",
        type: "违禁品",
        rarity: "非法",
        price: 6000,
        marketPrice: 6534,
        description: "非法药物，高风险高收益的走私商品",
        category: "违禁品",
        tradeable: true,
        stats: {
            "市场价格": "6,534 aUEC/SCU",
            "波动率": "±40%",
            "风险": "非法 - 被抓获会入狱",
            "需求": "黑市"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='30' y='30' width='40' height='40' fill='none' stroke='%23FF0000' stroke-width='2'/%3E%3Cpath d='M30 30 L70 70 M70 30 L30 70' stroke='%23FF0000' stroke-width='2'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EWIDO%3C/text%3E%3C/svg%3E"
    },
    {
        id: 9,
        code: "MEDS",
        name: "医疗用品 (Medical Supplies)",
        type: "医疗物资",
        rarity: "常见",
        price: 3000,
        marketPrice: 3145,
        description: "基础医疗设备和药品，救死扶伤必需品",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "3,145 aUEC/SCU",
            "波动率": "±6%",
            "需求": "稳定",
            "用途": "医疗救助"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpath d='M40 30 L60 30 L60 40 L70 40 L70 60 L60 60 L60 70 L40 70 L40 60 L30 60 L30 40 L40 40 Z' fill='none' stroke='%2300FF00' stroke-width='2'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EMEDS%3C/text%3E%3C/svg%3E"
    },
    {
        id: 10,
        code: "STIM",
        name: "兴奋剂 (Stims)",
        type: "增强剂",
        rarity: "军用",
        price: 3000,
        marketPrice: 3267,
        description: "战斗兴奋剂，提升反应速度和耐力",
        category: "消耗品",
        tradeable: true,
        stats: {
            "市场价格": "3,267 aUEC/SCU",
            "波动率": "±15%",
            "效果": "提升反应速度",
            "持续时间": "30分钟"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='35' y='25' width='30' height='50' rx='5' fill='none' stroke='%23FFFF00' stroke-width='2'/%3E%3Crect x='40' y='35' width='20' height='8' fill='%23FFFF00' opacity='0.6'/%3E%3Crect x='40' y='50' width='20' height='8' fill='%23FFFF00' opacity='0.4'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ESTIM%3C/text%3E%3C/svg%3E"
    },
    {
        id: 11,
        code: "FFOO",
        name: "新鲜食物 (Fresh Food)",
        type: "食物",
        rarity: "常见",
        price: 19000,
        marketPrice: 19456,
        description: "新鲜的食材和即食食品，维持生命必需",
        category: "商品",
        tradeable: true,
        stats: {
            "市场价格": "19,456 aUEC/SCU",
            "波动率": "±10%",
            "保质期": "有限",
            "需求": "持续"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='35' cy='40' r='8' fill='none' stroke='%23FF8000' stroke-width='2'/%3E%3Ccircle cx='65' cy='40' r='8' fill='none' stroke='%23FF0000' stroke-width='2'/%3E%3Crect x='40' y='55' width='20' height='15' fill='none' stroke='%2300FF00' stroke-width='2'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EFFOO%3C/text%3E%3C/svg%3E"
    },
    {
        id: 12,
        code: "COMP",
        name: "计算机组件 (Computer Components)",
        type: "电子设备",
        rarity: "工业",
        price: 14000,
        marketPrice: 14567,
        description: "高性能计算机组件，用于船舰系统升级",
        category: "组件",
        tradeable: true,
        stats: {
            "市场价格": "14,567 aUEC/SCU",
            "波动率": "±12%",
            "技术等级": "军用级",
            "兼容性": "通用"
        },
        image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='25' y='30' width='50' height='40' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Crect x='30' y='35' width='40' height='20' fill='%2300ffff' opacity='0.2'/%3E%3Cline x1='30' y1='60' x2='35' y2='60' stroke='%2300ffff' stroke-width='1'/%3E%3Cline x1='40' y1='60' x2='60' y2='60' stroke='%2300ffff' stroke-width='1'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ECOMP%3C/text%3E%3C/svg%3E"
    }
];

// 暂时使用基础数据，稍后合并
let mockItems = realStarCitizenItems;

// 页面加载完成后初始化
// 注意：这个监听器将被文件末尾的更完整版本替代

// 初始化应用
function initializeApp() {
    // 合并所有数据源
    const allStarCitizenItems = [...realStarCitizenItems, ...erkulGamesData.shipComponents];
    mockItems = allStarCitizenItems;
    currentItems = [...mockItems];
    
    // 检查是否已登录
    currentUser = localStorage.getItem('sc_current_user');
    
    if (currentUser && users[currentUser]) {
        showMainApp();
    } else {
        // 初始化科幻登录界面
        initializeSciFiLogin();
    }
    
    bindEventListeners();
    loadChatMessages();
    createParticleEffect();
    startAnimations();
    
    // 启动市场价格更新
    uexMarketData.updateMarketPrices();
    setInterval(() => {
        uexMarketData.updateMarketPrices();
        if (currentUser) {
            loadItems(); // 重新加载物品显示更新的价格
        }
    }, 30000); // 每30秒更新一次价格
    
    // 添加数据来源引用和版权信息
    const footer = document.createElement('div');
    footer.className = 'uex-footer';
    footer.innerHTML = `
        <div class="uex-credit">
            交易数据: <a href="https://uexcorp.space/" target="_blank">UEX Corp Space</a> | 
            装备数据: <a href="https://www.erkul.games/live/calculator" target="_blank">Erkul Games</a> | 
            星际公民版本: 4.1.1 | 
            数据更新: 每30秒
        </div>
    `;
    document.body.appendChild(footer);
}

// 绑定事件监听器
function bindEventListeners() {
    // 登录表单
    document.getElementById('loginForm').addEventListener('submit', handleLogin);
    
    // 注册表单
    document.getElementById('registerForm').addEventListener('submit', handleRegister);
    
    // 找回密码表单
    document.getElementById('recoverForm').addEventListener('submit', handleRecover);
    
    // 搜索物品
    document.getElementById('itemSearch').addEventListener('input', handleItemSearch);
    
    // 聊天输入
    document.getElementById('chatInput').addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            sendMessage();
        }
    });
}

// 标签页切换
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写完整的登录信息');
        return;
    }
    
    if (users[username] && users[username].password === password) {
        currentUser = username;
        localStorage.setItem('sc_current_user', username);
        showMainApp();
    } else {
        alert('用户名或密码错误');
    }
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('请填写完整的注册信息');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (users[username]) {
        alert('用户名已存在');
        return;
    }
    
    // 生成找回代码
    const recoveryCode = generateRecoveryCode();
    
    // 保存用户信息
    users[username] = {
        password: password,
        recoveryCode: recoveryCode,
        registerTime: new Date().toISOString()
    };
    
    localStorage.setItem('sc_users', JSON.stringify(users));
    
    // 显示找回代码
    document.querySelector('.code-display').textContent = recoveryCode;
    document.getElementById('recoveryCode').style.display = 'block';
    
    // 清空表单
    document.getElementById('registerForm').reset();
    
    alert('注册成功！请务必保存您的找回代码。');
}

// 处理找回密码
function handleRecover(e) {
    e.preventDefault();
    const username = document.getElementById('recoverUsername').value.trim();
    const recoveryCode = document.getElementById('recoverCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    
    if (!username || !recoveryCode || !newPassword) {
        alert('请填写完整的找回信息');
        return;
    }
    
    if (!users[username]) {
        alert('用户不存在');
        return;
    }
    
    if (users[username].recoveryCode !== recoveryCode) {
        alert('找回代码错误');
        return;
    }
    
    // 更新密码
    users[username].password = newPassword;
    const newRecoveryCode = generateRecoveryCode(); // 重新生成找回代码
    users[username].recoveryCode = newRecoveryCode;
    
    localStorage.setItem('sc_users', JSON.stringify(users));
    
    // 显示新代码的动态效果
    showNewRecoveryCode(newRecoveryCode);
    
    // 清空表单并切换到登录
    document.getElementById('recoverForm').reset();
    showTab('login');
}

// 生成找回代码
function generateRecoveryCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7) result += '-';
    }
    return result;
}

// 显示主应用
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
    document.getElementById('currentUser').textContent = currentUser;
    
    // 加载物品
    loadItems();
    
    // 加载聊天记录
    loadChatMessages();
    
    // 添加欢迎消息
    addChatMessage('系统', `欢迎 ${currentUser} 进入星际公民物品查看器！`, true);
    
    // 初始化用户下拉菜单
    initializeUserDropdown();
}

// 登出
function logout() {
    currentUser = null;
    localStorage.removeItem('sc_current_user');
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
    
    // 清空表单
    document.querySelectorAll('form').forEach(form => form.reset());
    document.getElementById('recoveryCode').style.display = 'none';
    
    // 重置到登录标签
    showTab('login');
}

// 加载物品
function loadItems() {
    const itemsGrid = document.getElementById('itemsGrid');
    itemsGrid.innerHTML = '';
    
    currentItems.forEach(item => {
        const itemCard = createItemCard(item);
        itemsGrid.appendChild(itemCard);
    });
}

// 创建物品卡片
function createItemCard(item) {
    const card = document.createElement('div');
    card.className = 'item-card';
    card.setAttribute('data-category', item.category);
    card.onclick = () => selectItem(item);
    
    // 为飞船组件添加特殊图标
    const categoryIcon = item.category === '飞船组件' ? '🛠️ ' : 
                        item.category === '违禁品' ? '⚠️ ' : 
                        item.category === '商品' ? '📦 ' : '';
    
    card.innerHTML = `
        <img src="${item.image}" alt="${item.name}" loading="lazy">
        <h4>${categoryIcon}${item.name.length > 20 ? item.name.substring(0, 20) + '...' : item.name}</h4>
        <div class="item-type">${item.type}</div>
        ${item.manufacturer ? `<div class="manufacturer-badge">${item.manufacturer}</div>` : ''}
    `;
    
    return card;
}

// 选择物品
function selectItem(item) {
    selectedItem = item;
    
    // 更新选中状态
    document.querySelectorAll('.item-card').forEach(card => {
        card.classList.remove('selected');
    });
    event.currentTarget.classList.add('selected');
    
    // 更新详情面板
    updateItemDetails(item);
}

// 更新物品详情
function updateItemDetails(item) {
    document.getElementById('itemName').textContent = item.name;
    document.getElementById('itemImage').src = item.image;
    document.getElementById('itemImage').alt = item.name;
    
    const statsContainer = document.getElementById('itemStats');
    statsContainer.innerHTML = '';
    
    // 添加基本信息
    const basicInfo = document.createElement('div');
    basicInfo.className = 'stat-item';
    const currentPrice = item.currentPrice || item.marketPrice;
    const isPriceUp = currentPrice > item.marketPrice;
    
    basicInfo.innerHTML = `
        <div class="stat-label">基本信息</div>
        <div class="stat-value">${item.type} - ${item.rarity}</div>
        <div class="stat-label" style="margin-top: 10px;">商品代码</div>
        <div class="stat-value">${item.code}</div>
        <div class="stat-label" style="margin-top: 10px;">当前价格</div>
        <div class="stat-value ${isPriceUp ? 'price-up' : 'price-down'}">${currentPrice.toLocaleString()} aUEC</div>
    `;
    statsContainer.appendChild(basicInfo);
    
    // 添加交易信息（仅适用于可交易物品）
    if (item.tradeable) {
        const tradeInfo = document.createElement('div');
        tradeInfo.className = 'stat-item';
        tradeInfo.style.gridColumn = '1 / -1';
        tradeInfo.innerHTML = showTradeInfo(item);
        statsContainer.appendChild(tradeInfo);
    }
    
    // 添加描述
    const description = document.createElement('div');
    description.className = 'stat-item';
    description.style.gridColumn = '1 / -1';
    description.innerHTML = `
        <div class="stat-label">描述</div>
        <div class="stat-value" style="font-size: 14px; line-height: 1.4;">${item.description}</div>
    `;
    statsContainer.appendChild(description);
    
    // 添加统计信息
    Object.entries(item.stats).forEach(([key, value]) => {
        const statItem = document.createElement('div');
        statItem.className = 'stat-item';
        statItem.innerHTML = `
            <div class="stat-label">${key}</div>
            <div class="stat-value">${value}</div>
        `;
        statsContainer.appendChild(statItem);
    });
}

// 处理物品搜索
function handleItemSearch(e) {
    const searchTerm = e.target.value.toLowerCase().trim();
    
    if (!searchTerm) {
        currentItems = [...mockItems];
    } else {
        currentItems = mockItems.filter(item => 
            item.name.toLowerCase().includes(searchTerm) ||
            item.type.toLowerCase().includes(searchTerm) ||
            item.rarity.toLowerCase().includes(searchTerm) ||
            item.description.toLowerCase().includes(searchTerm)
        );
    }
    
    loadItems();
}

// 发送消息
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message || !currentUser) return;
    
    addChatMessage(currentUser, message);
    input.value = '';
    
    // 模拟其他用户的回复
    setTimeout(() => {
        const responses = [
            '了解，谢谢分享！',
            '这个物品我也在找呢',
            '价格怎么样？',
            '有什么好推荐的吗？',
            '星际公民的装备真是越来越丰富了',
            '这个配置看起来不错',
            '我正在攒钱买这个',
            '有人一起组队吗？',
            '🚀 根据UEX数据，Quantainium价格又涨了！',
            '💎 钻石交易现在很火热啊',
            '⚠️ 小心WiDoW交易，最近抓得很严',
            '🏭 Area18的计算机组件供应充足',
            '🌟 New Babbage的Hadanite价格不错',
            '📈 市场波动有点大，注意风险',
            '🛸 有人知道最新的贸易路线吗？',
            '💰 今天的利润还不错！'
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        const randomUser = `飞行员${Math.floor(Math.random() * 1000)}`;
        addChatMessage(randomUser, randomResponse);
    }, 1000 + Math.random() * 3000);
}

// 添加聊天消息
function addChatMessage(username, content, isSystem = false) {
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = `message ${username === currentUser ? 'own' : ''}`;
    
    const timestamp = new Date().toLocaleTimeString('zh-CN', { 
        hour: '2-digit', 
        minute: '2-digit' 
    });
    
    messageElement.innerHTML = `
        <div class="username">${isSystem ? '🤖 ' : ''}${username}</div>
        <div class="content">${content}</div>
        <div class="timestamp">${timestamp}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    // 保存到本地存储
    if (!isSystem) {
        chatMessages.push({
            username,
            content,
            timestamp: new Date().toISOString()
        });
        
        // 限制消息数量
        if (chatMessages.length > 100) {
            chatMessages = chatMessages.slice(-100);
        }
        
        localStorage.setItem('sc_chat_messages', JSON.stringify(chatMessages));
    }
}

// 加载聊天记录
function loadChatMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    messagesContainer.innerHTML = '';
    
    // 加载最近的20条消息
    const recentMessages = chatMessages.slice(-20);
    
    recentMessages.forEach(msg => {
        const messageElement = document.createElement('div');
        messageElement.className = `message ${msg.username === currentUser ? 'own' : ''}`;
        
        const timestamp = new Date(msg.timestamp).toLocaleTimeString('zh-CN', {
            hour: '2-digit',
            minute: '2-digit'
        });
        
        messageElement.innerHTML = `
            <div class="username">${msg.username}</div>
            <div class="content">${msg.content}</div>
            <div class="timestamp">${timestamp}</div>
        `;
        
        messagesContainer.appendChild(messageElement);
    });
    
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

// 创建粒子效果
function createParticleEffect() {
    const particlesContainer = document.getElementById('particles');
    
    setInterval(() => {
        if (document.querySelectorAll('.particle').length < 50) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            // 随机位置和延迟
            particle.style.left = Math.random() * 100 + 'vw';
            particle.style.animationDelay = Math.random() * 2 + 's';
            particle.style.animationDuration = (3 + Math.random() * 2) + 's';
            
            particlesContainer.appendChild(particle);
            
            // 动画结束后移除粒子
            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, 5000);
        }
    }, 200);
}

// 启动动画效果
function startAnimations() {
    // 让标题有发光效果
    setInterval(() => {
        const logos = document.querySelectorAll('.logo, .app-title');
        logos.forEach(logo => {
            logo.classList.toggle('glow');
        });
    }, 2000);
    
    // 更新在线人数 (模拟)
    setInterval(() => {
        const onlineCount = Math.floor(Math.random() * 50) + 150;
        const onlineElement = document.getElementById('onlineCount');
        if (onlineElement) {
            onlineElement.textContent = onlineCount;
        }
    }, 30000);
}

// 错误处理
window.addEventListener('error', function(e) {
    console.error('应用错误:', e.error);
});

// 防止页面刷新时丢失状态
window.addEventListener('beforeunload', function() {
    if (currentUser) {
        localStorage.setItem('sc_current_user', currentUser);
    }
});

// Erkul Games 飞船装备数据整合
const erkulGamesData = {
    // 飞船装备组件数据 (基于Erkul Games)
    shipComponents: [
        {
            id: 101,
            code: "JS-300",
            name: "Jokker Suckerpunch JS-300 量子驱动器",
            type: "量子驱动器",
            rarity: "军用",
            price: 45230,
            marketPrice: 45230,
            description: "高性能量子驱动器，提供卓越的跳跃性能和稳定性",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "Jokker",
            stats: {
                "量子燃料容量": "2,500 单位",
                "跳跃距离": "20.47 Mm",
                "充能时间": "8.2 秒",
                "冷却时间": "5.1 秒",
                "校准时间": "6.7 秒",
                "燃料消耗": "0.27/Mm",
                "热量产生": "2,100 单位",
                "EM签名": "185 单位",
                "兼容尺寸": "Size 1"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='50' cy='50' r='35' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='15' fill='%2300ffff' opacity='0.6'/%3E%3Cpath d='M30 30 L70 70 M70 30 L30 70' stroke='%2300ffff' stroke-width='1' opacity='0.8'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EQ-Drive%3C/text%3E%3C/svg%3E"
        },
        {
            id: 102,
            code: "CF-227",
            name: "Klaus & Werner CF-227 BadgerRptr 激光炮",
            type: "武器系统",
            rarity: "军用",
            price: 8750,
            marketPrice: 8750,
            description: "军用级激光炮，高精度高伤害输出",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "Klaus & Werner",
            stats: {
                "伤害 (每发)": "185 伤害",
                "射速": "600 RPM",
                "DPS": "1,850",
                "射程": "1,400 米",
                "抛射体速度": "1,400 m/s",
                "能量消耗": "45 单位/发",
                "热量产生": "12 单位/发",
                "弹药类型": "激光能量",
                "兼容尺寸": "Size 2"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='15' y='40' width='70' height='20' fill='%2300ffff' opacity='0.8'/%3E%3Crect x='10' y='45' width='15' height='10' fill='%2300ffff'/%3E%3Cline x1='85' y1='50' x2='95' y2='50' stroke='%23ff0000' stroke-width='3'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ELaser%3C/text%3E%3C/svg%3E"
        },
        {
            id: 103,
            code: "FR-66",
            name: "Aegis FR-66 护盾发生器",
            type: "护盾系统",
            rarity: "军用",
            price: 12400,
            marketPrice: 12400,
            description: "军用级护盾发生器，提供可靠的防护能力",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "Aegis Dynamics",
            stats: {
                "护盾血量": "3,200 HP",
                "充能速率": "165 HP/s",
                "充能延迟": "2.5 秒",
                "重启时间": "8.0 秒",
                "能量消耗": "890 单位",
                "热量产生": "450 单位",
                "EM签名": "125 单位",
                "抗性": "物理 15%, 能量 20%",
                "兼容尺寸": "Size 2"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Cpath d='M50 15 L75 35 L75 65 L50 85 L25 65 L25 35 Z' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='20' fill='%2300ffff' opacity='0.2'/%3E%3Ccircle cx='50' cy='50' r='10' fill='%2300ffff' opacity='0.4'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EShield%3C/text%3E%3C/svg%3E"
        },
        {
            id: 104,
            code: "JS-400",
            name: "Jokker JS-400 推进器",
            type: "推进系统",
            rarity: "竞赛",
            price: 15800,
            marketPrice: 15800,
            description: "竞赛级推进器，提供卓越的机动性和速度",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "Jokker",
            stats: {
                "最大推力": "1,850 N",
                "燃料效率": "0.92 单位/N",
                "热量产生": "215 单位",
                "EM签名": "95 单位",
                "IR签名": "180 单位",
                "最大速度贡献": "+15%",
                "加速度贡献": "+20%",
                "机动性": "极高",
                "兼容尺寸": "Size 2"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='30' cy='30' r='12' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='70' cy='30' r='12' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='50' cy='70' r='15' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Cpath d='M20 80 Q50 60 80 80' stroke='%23ff8800' stroke-width='3' fill='none'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EThruster%3C/text%3E%3C/svg%3E"
        },
        {
            id: 105,
            code: "MR-3A",
            name: "Mirai MR-3A 雷达系统",
            type: "电子系统",
            rarity: "工业",
            price: 7200,
            marketPrice: 7200,
            description: "高精度雷达系统，提供卓越的探测能力",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "Mirai",
            stats: {
                "探测距离": "25.5 km",
                "追踪距离": "18.2 km",
                "目标锁定": "8 个目标",
                "刷新率": "2.1 秒",
                "能量消耗": "320 单位",
                "EM签名": "45 单位",
                "角度覆盖": "360°",
                "精度": "98.5%",
                "兼容尺寸": "Size 1"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Ccircle cx='50' cy='50' r='30' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Ccircle cx='50' cy='50' r='20' fill='none' stroke='%2300ffff' stroke-width='1' stroke-dasharray='3,3'/%3E%3Ccircle cx='50' cy='50' r='10' fill='none' stroke='%2300ffff' stroke-width='1' stroke-dasharray='2,2'/%3E%3Cline x1='50' y1='20' x2='50' y2='80' stroke='%2300ffff' stroke-width='1' opacity='0.6'/%3E%3Cline x1='20' y1='50' x2='80' y2='50' stroke='%2300ffff' stroke-width='1' opacity='0.6'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3ERadar%3C/text%3E%3C/svg%3E"
        },
        {
            id: 106,
            code: "C-803A",
            name: "CryAstro C-803A 电源",
            type: "电源系统",
            rarity: "工业",
            price: 9850,
            marketPrice: 9850,
            description: "高效能电源系统，为飞船提供稳定电力",
            category: "飞船组件",
            tradeable: true,
            manufacturer: "CryAstro",
            stats: {
                "电力输出": "5,200 单位",
                "效率": "92%",
                "热量产生": "380 单位",
                "EM签名": "155 单位",
                "启动时间": "3.2 秒",
                "过载保护": "启用",
                "冗余备份": "双重备份",
                "重量": "185 kg",
                "兼容尺寸": "Size 2"
            },
            image: "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100' height='100' viewBox='0 0 100 100'%3E%3Crect width='100' height='100' fill='%23001a33'/%3E%3Crect x='25' y='25' width='50' height='50' fill='none' stroke='%2300ffff' stroke-width='2'/%3E%3Crect x='30' y='30' width='40' height='20' fill='%2300ffff' opacity='0.3'/%3E%3Crect x='30' y='55' width='40' height='15' fill='%2300ffff' opacity='0.2'/%3E%3Cline x1='35' y1='78' x2='40' y2='78' stroke='%2300ffff' stroke-width='2'/%3E%3Cline x1='45' y1='78' x2='55' y2='78' stroke='%2300ffff' stroke-width='2'/%3E%3Cline x1='60' y1='78' x2='65' y2='78' stroke='%2300ffff' stroke-width='2'/%3E%3Ctext x='50' y='95' text-anchor='middle' fill='%2300ffff' font-size='8' font-family='Orbitron'%3EPower%3C/text%3E%3C/svg%3E"
        }
    ],
    
    // DPS计算功能
    calculateDPS: function(weapon) {
        const damage = parseFloat(weapon.stats["伤害 (每发)"]?.replace(' 伤害', '') || 0);
        const rpm = parseFloat(weapon.stats["射速"]?.replace(' RPM', '') || 0);
        return Math.round((damage * rpm) / 60);
    },
    
    // 组件兼容性检查
    checkCompatibility: function(component1, component2) {
        // 简化的兼容性检查逻辑
        const size1 = component1.stats["兼容尺寸"];
        const size2 = component2.stats["兼容尺寸"];
        return size1 === size2;
    },
    
    // 获取制造商信息
    getManufacturerInfo: function(manufacturer) {
        const manufacturers = {
            "Jokker": { specialty: "高性能驱动器和推进器", reputation: "优秀" },
            "Klaus & Werner": { specialty: "军用武器系统", reputation: "可靠" },
            "Aegis Dynamics": { specialty: "军用装备", reputation: "顶级" },
            "Mirai": { specialty: "电子系统", reputation: "创新" },
            "CryAstro": { specialty: "电源和燃料系统", reputation: "稳定" }
        };
        return manufacturers[manufacturer] || { specialty: "通用组件", reputation: "标准" };
    }
};

// UEX Corp Space 交易数据整合
const uexMarketData = {
    // 实时价格波动模拟
    priceFluctuation: function(basePrice, volatility) {
        const fluctuation = (Math.random() - 0.5) * 2 * (volatility / 100);
        return Math.round(basePrice * (1 + fluctuation));
    },
    
    // 更新市场价格
    updateMarketPrices: function() {
        realStarCitizenItems.forEach(item => {
            if (item.tradeable) {
                const volatilityMatch = item.stats["波动率"]?.match(/±(\d+)%/);
                const volatility = volatilityMatch ? parseInt(volatilityMatch[1]) : 10;
                item.currentPrice = this.priceFluctuation(item.marketPrice, volatility);
                
                // 更新需求状态
                const demand = Math.random();
                if (demand < 0.3) item.demandStatus = "低";
                else if (demand < 0.7) item.demandStatus = "中等"; 
                else item.demandStatus = "高";
            }
        });
    },
    
    // 交易站点数据 (基于UEX Corp Space)
    tradingStations: [
        { name: "Port Olisar", system: "Crusader", bestFor: ["QUAN", "DIAM", "GOLD"] },
        { name: "Lorville", system: "Hurston", bestFor: ["ALUM", "TITA", "MEDS"] },
        { name: "Area18", system: "ArcCorp", bestFor: ["COMP", "STIM", "LARA"] },
        { name: "New Babbage", system: "microTech", bestFor: ["FFOO", "HADA", "WIDO"] }
    ],
    
    // 获取最佳交易站点
    getBestTradingStation: function(itemCode) {
        for (const station of this.tradingStations) {
            if (station.bestFor.includes(itemCode)) {
                return station;
            }
        }
        return this.tradingStations[Math.floor(Math.random() * this.tradingStations.length)];
    }
};

// 交易功能
function showTradeInfo(item) {
    let tradeHtml = '';
    
    // UEX交易数据 (适用于商品)
    if (item.category === '商品' || item.category === '违禁品') {
        const station = uexMarketData.getBestTradingStation(item.code);
        const profitMargin = Math.round((item.currentPrice - item.price) / item.price * 100);
        
        tradeHtml = `
            <div class="trade-info">
                <h4>🚀 交易信息</h4>
                <div class="trade-row">
                    <span>当前价格:</span>
                    <span class="${profitMargin > 0 ? 'profit' : 'loss'}">${item.currentPrice?.toLocaleString() || item.marketPrice.toLocaleString()} aUEC</span>
                </div>
                <div class="trade-row">
                    <span>基础价格:</span>
                    <span>${item.marketPrice.toLocaleString()} aUEC</span>
                </div>
                <div class="trade-row">
                    <span>盈利空间:</span>
                    <span class="${profitMargin > 0 ? 'profit' : 'loss'}">${profitMargin > 0 ? '+' : ''}${profitMargin}%</span>
                </div>
                <div class="trade-row">
                    <span>最佳交易站:</span>
                    <span>${station.name} (${station.system})</span>
                </div>
                <div class="trade-row">
                    <span>需求状态:</span>
                    <span class="demand-${item.demandStatus}">${item.demandStatus || '中等'}</span>
                </div>
                ${item.category === '违禁品' ? '<div class="warning">⚠️ 警告: 违禁品交易风险极高!</div>' : ''}
            </div>
        `;
    }
    
    // Erkul Games组件数据 (适用于飞船组件)
    if (item.category === '飞船组件' && item.manufacturer) {
        const manufacturerInfo = erkulGamesData.getManufacturerInfo(item.manufacturer);
        let componentSpecial = '';
        
        // 为武器系统计算DPS
        if (item.type === '武器系统' && item.stats["伤害 (每发)"] && item.stats["射速"]) {
            const calculatedDPS = erkulGamesData.calculateDPS(item);
            componentSpecial = `
                <div class="trade-row">
                    <span>计算DPS:</span>
                    <span class="dps-highlight">${calculatedDPS}</span>
                </div>
            `;
        }
        
        tradeHtml = `
            <div class="trade-info erkul-info">
                <h4>🛠️ 组件信息 (Erkul Games)</h4>
                <div class="trade-row">
                    <span>制造商:</span>
                    <span class="manufacturer">${item.manufacturer}</span>
                </div>
                <div class="trade-row">
                    <span>专业领域:</span>
                    <span>${manufacturerInfo.specialty}</span>
                </div>
                <div class="trade-row">
                    <span>品质评级:</span>
                    <span class="reputation-${manufacturerInfo.reputation}">${manufacturerInfo.reputation}</span>
                </div>
                ${componentSpecial}
                <div class="trade-row">
                    <span>组件价格:</span>
                    <span class="component-price">${item.marketPrice.toLocaleString()} aUEC</span>
                </div>
                <div class="erkul-link">
                    <a href="https://www.erkul.games/live/calculator" target="_blank">
                        🔗 在Erkul Games中查看详细配置
                    </a>
                </div>
            </div>
        `;
    }
    
    return tradeHtml;
}

// 贸易路线分析器
const tradingRouteAnalyzer = {
    // 星系和站点距离数据 (基于星际公民实际距离)
    locations: {
        "Port Olisar": { system: "Crusader", coordinates: [0, 0, 0] },
        "Lorville": { system: "Hurston", coordinates: [15.8, 0, 0] },
        "Area18": { system: "ArcCorp", coordinates: [0, 15.8, 0] },
        "New Babbage": { system: "microTech", coordinates: [0, 0, 15.8] },
        "Grim HEX": { system: "Crusader", coordinates: [0.5, 0, 0] },
        "Everus Harbor": { system: "Hurston", coordinates: [15.3, 0, 0] },
        "Baijini Point": { system: "ArcCorp", coordinates: [0, 16.1, 0] },
        "Port Tressler": { system: "microTech", coordinates: [0, 0, 16.1] }
    },

    // 计算两点间距离 (单位: AU)
    calculateDistance: function(loc1, loc2) {
        const coords1 = this.locations[loc1].coordinates;
        const coords2 = this.locations[loc2].coordinates;
        const dx = coords1[0] - coords2[0];
        const dy = coords1[1] - coords2[1];
        const dz = coords1[2] - coords2[2];
        return Math.sqrt(dx*dx + dy*dy + dz*dz);
    },

    // 生成所有可能的贸易路线
    generateRoutes: function(maxInvestment, cargoCapacity) {
        const routes = [];
        const tradableItems = realStarCitizenItems.filter(item => item.tradeable);
        const locations = Object.keys(this.locations);

        tradableItems.forEach(item => {
            locations.forEach(buyLocation => {
                locations.forEach(sellLocation => {
                    if (buyLocation !== sellLocation) {
                        const route = this.calculateRoute(item, buyLocation, sellLocation, maxInvestment, cargoCapacity);
                        if (route.profit > 0) {
                            routes.push(route);
                        }
                    }
                });
            });
        });

        return routes;
    },

    // 计算单条路线的详细信息
    calculateRoute: function(item, buyLocation, sellLocation, maxInvestment, cargoCapacity) {
        const buyPrice = this.getBuyPrice(item, buyLocation);
        const sellPrice = this.getSellPrice(item, sellLocation);
        const distance = this.calculateDistance(buyLocation, sellLocation);
        
        // 计算最大购买数量
        const maxByMoney = Math.floor(maxInvestment / buyPrice);
        const maxByCargo = cargoCapacity;
        const quantity = Math.min(maxByMoney, maxByCargo);
        
        const investment = quantity * buyPrice;
        const revenue = quantity * sellPrice;
        const profit = revenue - investment;
        const roi = investment > 0 ? (profit / investment) * 100 : 0;
        const profitPerSCU = quantity > 0 ? profit / quantity : 0;
        const profitPerAU = distance > 0 ? profit / distance : 0;

        // 计算风险等级
        let riskLevel = "低";
        if (item.category === "违禁品") riskLevel = "极高";
        else if (item.stats["波动率"]?.includes("±30%") || item.stats["波动率"]?.includes("±25%")) riskLevel = "高";
        else if (item.stats["波动率"]?.includes("±20%") || item.stats["波动率"]?.includes("±15%")) riskLevel = "中";

        return {
            item: item,
            buyLocation: buyLocation,
            sellLocation: sellLocation,
            buyPrice: buyPrice,
            sellPrice: sellPrice,
            quantity: quantity,
            investment: investment,
            revenue: revenue,
            profit: profit,
            roi: roi,
            distance: distance,
            profitPerSCU: profitPerSCU,
            profitPerAU: profitPerAU,
            riskLevel: riskLevel,
            efficiency: profitPerAU / (distance + 1) // 综合效率指标
        };
    },

    // 获取购买价格 (考虑位置折扣)
    getBuyPrice: function(item, location) {
        let basePrice = item.currentPrice || item.marketPrice;
        
        // 不同站点的价格差异
        const locationModifier = {
            "Port Olisar": 1.0,
            "Lorville": 0.95,  // 工业中心，原材料便宜
            "Area18": 1.05,   // 商业中心，价格稍高
            "New Babbage": 1.02,
            "Grim HEX": 0.90, // 黑市，价格便宜但风险高
            "Everus Harbor": 0.97,
            "Baijini Point": 1.03,
            "Port Tressler": 1.01
        };

        return Math.round(basePrice * (locationModifier[location] || 1.0));
    },

    // 获取销售价格 (考虑位置溢价)
    getSellPrice: function(item, location) {
        let basePrice = item.currentPrice || item.marketPrice;
        
        // 销售价格通常比购买价格高5-15%
        const locationModifier = {
            "Port Olisar": 1.10,
            "Lorville": 1.05,
            "Area18": 1.15,  // 商业中心，卖价更高
            "New Babbage": 1.12,
            "Grim HEX": 1.20, // 黑市，高风险高回报
            "Everus Harbor": 1.08,
            "Baijini Point": 1.13,
            "Port Tressler": 1.11
        };

        return Math.round(basePrice * (locationModifier[location] || 1.10));
    },

    // 排序路线
    sortRoutes: function(routes, sortMethod) {
        switch(sortMethod) {
            case 'profit':
                return routes.sort((a, b) => b.profit - a.profit);
            case 'distance':
                return routes.sort((a, b) => a.distance - b.distance);
            case 'cost':
                return routes.sort((a, b) => a.investment - b.investment);
            case 'roi':
                return routes.sort((a, b) => b.roi - a.roi);
            default:
                return routes.sort((a, b) => b.profit - a.profit);
        }
    }
};

// 主标签页切换
function showMainTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.main-content-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签
    document.getElementById(tabName + 'Tab').classList.add('active');
    event.target.classList.add('active');

    // 如果切换到贸易路线页面，初始化贸易分析
    if (tabName === 'trading') {
        initializeTradingRoutes();
    }
}

// 初始化贸易路线页面
function initializeTradingRoutes() {
    // 绑定事件监听器
    document.getElementById('analyzeRoutes').addEventListener('click', analyzeTradingRoutes);
    document.getElementById('refreshPrices').addEventListener('click', function() {
        uexMarketData.updateMarketPrices();
        analyzeTradingRoutes();
    });
    document.getElementById('sortMethod').addEventListener('change', analyzeTradingRoutes);
    
    // 自动进行初始分析
    setTimeout(analyzeTradingRoutes, 500);
}

// 分析贸易路线
function analyzeTradingRoutes() {
    const maxInvestment = parseInt(document.getElementById('maxInvestment').value);
    const cargoCapacity = parseInt(document.getElementById('cargoCapacity').value);
    const sortMethod = document.getElementById('sortMethod').value;
    
    // 生成所有路线
    const allRoutes = tradingRouteAnalyzer.generateRoutes(maxInvestment, cargoCapacity);
    
    // 排序并取前30条
    const sortedRoutes = tradingRouteAnalyzer.sortRoutes(allRoutes, sortMethod);
    const topRoutes = sortedRoutes.slice(0, 30);
    
    // 显示路线列表
    displayRoutesList(topRoutes);
}

// 显示路线列表
function displayRoutesList(routes) {
    const routesList = document.getElementById('routesList');
    if (!routesList) return;
    
    routesList.innerHTML = '';
    
    if (routes.length === 0) {
        routesList.innerHTML = `
            <div class="no-routes-message">
                <div class="no-routes-icon">📊</div>
                <div class="no-routes-text">No profitable routes found with current parameters</div>
            </div>
        `;
        return;
    }
    
    routes.forEach((route, index) => {
        const routeElement = document.createElement('div');
        routeElement.className = 'route-item';
        routeElement.onclick = () => selectRoute(route);
        
        routeElement.innerHTML = `
            <div class="route-rank">${index + 1}</div>
            <div class="route-summary">
                <div class="route-commodity">${route.item.name}</div>
                <div class="route-path">
                    ${route.buyLocation} → ${route.sellLocation}
                    (${route.distance.toFixed(1)} AU)
                </div>
                <div class="route-profit">
                    PROFIT: ${route.profit.toLocaleString()} aUEC
                    (${route.roi.toFixed(1)}% ROI)
                </div>
                <div class="route-stats">
                    <div class="route-stat">INVEST: ${route.investment.toLocaleString()}</div>
                    <div class="route-stat">QTY: ${route.quantity} SCU</div>
                    <div class="route-stat">RISK: ${route.riskLevel}</div>
                    <div class="route-stat">EFF: ${route.profitPerAU.toFixed(0)}/AU</div>
                </div>
            </div>
        `;
        
        routesList.appendChild(routeElement);
    });
}

// 选择路线并显示详情
function selectRoute(route) {
    // 移除之前的选中状态
    document.querySelectorAll('.route-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加当前选中状态
    event.currentTarget.classList.add('selected');
    
    // 显示路线详情
    displayRouteDetails(route);
}

// 显示路线详细信息
function displayRouteDetails(route) {
    const routeDetails = document.getElementById('routeDetails');
    if (!routeDetails) return;
    
    routeDetails.innerHTML = `
        <div class="route-detail-card">
            <div class="detail-title">COMMODITY ANALYSIS</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">ITEM CODE:</span>
                    <span class="detail-value">${route.item.code}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ITEM TYPE:</span>
                    <span class="detail-value">${route.item.type}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">BUY LOCATION:</span>
                    <span class="detail-value">${route.buyLocation}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">SELL LOCATION:</span>
                    <span class="detail-value">${route.sellLocation}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">BUY PRICE:</span>
                    <span class="detail-value">${route.buyPrice.toLocaleString()} aUEC/SCU</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">SELL PRICE:</span>
                    <span class="detail-value">${route.sellPrice.toLocaleString()} aUEC/SCU</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">QUANTITY:</span>
                    <span class="detail-value">${route.quantity} SCU</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">DISTANCE:</span>
                    <span class="detail-value">${route.distance.toFixed(1)} AU</span>
                </div>
            </div>
        </div>

        <div class="route-detail-card">
            <div class="detail-title">FINANCIAL ANALYSIS</div>
            <div class="detail-grid">
                <div class="detail-item">
                    <span class="detail-label">INVESTMENT:</span>
                    <span class="detail-value">${route.investment.toLocaleString()} aUEC</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">REVENUE:</span>
                    <span class="detail-value">${route.revenue.toLocaleString()} aUEC</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">NET PROFIT:</span>
                    <span class="detail-value profit-highlight">${route.profit.toLocaleString()} aUEC</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">ROI:</span>
                    <span class="detail-value profit-highlight">${route.roi.toFixed(1)}%</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">PROFIT/SCU:</span>
                    <span class="detail-value">${route.profitPerSCU.toLocaleString()} aUEC/SCU</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">EFFICIENCY:</span>
                    <span class="detail-value">${route.profitPerAU.toFixed(0)} aUEC/AU</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">RISK LEVEL:</span>
                    <span class="detail-value ${route.riskLevel === 'EXTREME' ? 'warning-highlight' : ''}">${route.riskLevel}</span>
                </div>
                <div class="detail-item">
                    <span class="detail-label">PRIORITY:</span>
                    <span class="detail-value">${route.roi > 50 ? 'HIGH' : route.roi > 20 ? 'MEDIUM' : 'LOW'}</span>
                </div>
            </div>
        </div>

        <div class="route-detail-card">
            <div class="detail-title">⚠️ 风险提示</div>
            <div style="color: #00ccff; font-family: 'Orbitron', monospace; font-size: 12px; line-height: 1.5;">
                ${route.riskLevel === '极高' ? 
                    '• 此路线涉及违禁品交易，被发现将面临严重后果<br>• 建议携带足够的护盾和武器<br>• 避开主要安全检查点' :
                    route.riskLevel === '高' ? 
                    '• 商品价格波动较大，存在亏损风险<br>• 建议分批交易，降低风险<br>• 密切关注市场动态' :
                    '• 相对安全的贸易路线<br>• 适合新手商人练习<br>• 建议定期更新价格信息'
                }
            </div>
        </div>
    `;
}

// 这部分初始化代码已经合并到主initializeApp函数中

// 显示新重置代码的动态效果
function showNewRecoveryCode(code) {
    const modal = document.getElementById('newCodeModal');
    const codeElement = document.getElementById('newRecoveryCode');
    
    codeElement.textContent = code;
    modal.classList.add('show');
    
    // 自动复制到剪贴板
    copyToClipboard(code);
    
    // 8秒后自动关闭
    setTimeout(() => {
        if (modal.classList.contains('show')) {
            closeNewCodeModal();
        }
    }, 8000);
}

// 关闭新代码模态框
function closeNewCodeModal() {
    const modal = document.getElementById('newCodeModal');
    modal.classList.remove('show');
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(() => {
            console.log('已复制到剪贴板');
        }).catch(err => {
            console.error('复制失败:', err);
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 备用复制方法
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
        console.log('已复制到剪贴板');
    } catch (err) {
        console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
}

// 初始化用户下拉菜单
function initializeUserDropdown() {
    const dropdown = document.querySelector('.user-dropdown');
    const menu = document.getElementById('userDropdownMenu');
    const trigger = document.getElementById('userDropdownTrigger');
    
    let hideTimeout;
    
    // 显示下拉菜单
    function showDropdownMenu() {
        clearTimeout(hideTimeout);
        menu.style.opacity = '1';
        menu.style.visibility = 'visible';
        menu.style.transform = 'translateY(0)';
        menu.style.pointerEvents = 'auto';
    }
    
    // 隐藏下拉菜单
    function hideDropdownMenu() {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
        menu.style.pointerEvents = 'none';
    }
    
    // 延迟隐藏下拉菜单
    function delayHideDropdownMenu() {
        hideTimeout = setTimeout(hideDropdownMenu, 200); // 200ms延迟
    }
    
    // 鼠标进入用户名区域
    trigger.addEventListener('mouseenter', function() {
        showDropdownMenu();
    });
    
    // 鼠标离开用户名区域
    trigger.addEventListener('mouseleave', function() {
        delayHideDropdownMenu();
    });
    
    // 鼠标进入下拉菜单
    menu.addEventListener('mouseenter', function() {
        showDropdownMenu();
    });
    
    // 鼠标离开下拉菜单
    menu.addEventListener('mouseleave', function() {
        delayHideDropdownMenu();
    });
    
    // 点击空白处关闭下拉菜单
    document.addEventListener('click', function(e) {
        if (!dropdown.contains(e.target)) {
            clearTimeout(hideTimeout);
            hideDropdownMenu();
        }
    });
}

// 打开用户设置
function openUserSettings() {
    const modal = document.getElementById('userSettingsModal');
    const currentRecoveryCode = document.getElementById('currentRecoveryCode');
    const settingsUsername = document.getElementById('settingsUsername');
    
    // 显示当前用户信息
    if (users[currentUser]) {
        currentRecoveryCode.textContent = users[currentUser].recoveryCode;
        settingsUsername.placeholder = `当前: ${currentUser}`;
    }
    
    modal.classList.add('show');
}

// 关闭用户设置
function closeUserSettings() {
    const modal = document.getElementById('userSettingsModal');
    modal.classList.remove('show');
    
    // 清空输入框
    document.getElementById('settingsUsername').value = '';
    document.getElementById('settingsNewPassword').value = '';
    
    // 重置下拉菜单状态
    const menu = document.getElementById('userDropdownMenu');
    if (menu) {
        menu.style.opacity = '0';
        menu.style.visibility = 'hidden';
        menu.style.transform = 'translateY(-10px)';
        menu.style.pointerEvents = 'none';
    }
}

// 更新用户名
function updateUsername() {
    const newUsername = document.getElementById('settingsUsername').value.trim();
    
    if (!newUsername) {
        alert('请输入新的用户名');
        return;
    }
    
    if (newUsername === currentUser) {
        alert('新用户名与当前用户名相同');
        return;
    }
    
    if (users[newUsername]) {
        alert('该用户名已存在');
        return;
    }
    
    // 更新用户数据
    const userData = users[currentUser];
    delete users[currentUser];
    users[newUsername] = userData;
    
    // 更新当前用户
    const oldUser = currentUser;
    currentUser = newUsername;
    
    // 保存到本地存储
    localStorage.setItem('sc_users', JSON.stringify(users));
    localStorage.setItem('sc_current_user', currentUser);
    
    // 更新界面显示
    document.getElementById('currentUser').textContent = currentUser;
    document.getElementById('settingsUsername').value = '';
    document.getElementById('settingsUsername').placeholder = `当前: ${currentUser}`;
    
    // 添加聊天消息
    addChatMessage('系统', `用户 ${oldUser} 已更名为 ${currentUser}`, true);
    
    alert('用户名更新成功！');
}

// 更新密码
function updatePassword() {
    const newPassword = document.getElementById('settingsNewPassword').value;
    
    if (!newPassword) {
        alert('请输入新密码');
        return;
    }
    
    if (newPassword.length < 4) {
        alert('密码长度至少4位');
        return;
    }
    
    // 更新密码
    users[currentUser].password = newPassword;
    
    // 保存到本地存储
    localStorage.setItem('sc_users', JSON.stringify(users));
    
    // 清空输入框
    document.getElementById('settingsNewPassword').value = '';
    
    // 添加聊天消息
    addChatMessage('系统', `用户 ${currentUser} 已更新密码`, true);
    
    alert('密码更新成功！');
}

// 复制重置代码
function copyRecoveryCode() {
    const recoveryCode = users[currentUser].recoveryCode;
    copyToClipboard(recoveryCode);
    
    // 显示复制反馈
    const copyBtn = document.querySelector('.copy-btn');
    const originalText = copyBtn.textContent;
    copyBtn.textContent = '✓';
    copyBtn.style.background = 'linear-gradient(135deg, rgba(0, 255, 0, 0.3), rgba(0, 255, 0, 0.2))';
    
    setTimeout(() => {
        copyBtn.textContent = originalText;
        copyBtn.style.background = '';
    }, 2000);
    
    alert('重置代码已复制到剪贴板！');
}

// 重新生成重置代码
function regenerateRecoveryCode() {
    if (!confirm('确定要重新生成重置代码吗？\n重新生成后，旧的重置代码将失效！')) {
        return;
    }
    
    const newRecoveryCode = generateRecoveryCode();
    users[currentUser].recoveryCode = newRecoveryCode;
    
    // 保存到本地存储
    localStorage.setItem('sc_users', JSON.stringify(users));
    
    // 更新显示
    document.getElementById('currentRecoveryCode').textContent = newRecoveryCode;
    
    // 显示新代码的动态效果
    closeUserSettings();
    showNewRecoveryCode(newRecoveryCode);
    
    // 添加聊天消息
    addChatMessage('系统', `用户 ${currentUser} 已重新生成重置代码`, true);
}

// 硬核代码雨动画效果
function initializeCodeRain() {
    const canvas = document.getElementById('codeRainCanvas');
    const glitchCanvas = document.getElementById('glitchCanvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let glitchCtx = null;
    
    if (glitchCanvas) {
        glitchCtx = glitchCanvas.getContext('2d');
    }
    
    // 设置canvas大小
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (glitchCanvas) {
            glitchCanvas.width = window.innerWidth;
            glitchCanvas.height = window.innerHeight;
        }
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // 扩展字符集包含更多科幻元素
    const codeChars = '01ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz+-*/=<>[]{}()ﾊﾋﾌﾍﾎﾏﾐﾑﾒﾓﾔﾕﾖﾗﾘﾙﾚﾛﾜﾝアイウエオカキクケコサシスセソタチツテト';
    const glitchChars = '▓▒░█▀▄▌▐■□▲△▼▽◆◇○●◎☉⚡⚙⚠⚰⚾⛔⛳⛽✓✗✦✧✪✫✬✭✮✯✰✱✲✳✴✵✶✷✸✹✺✻✼✽✾✿';
    
    const columns = Math.floor(canvas.width / 16);
    const drops = [];
    const glitchDrops = [];
    
    // 初始化水滴位置
    for (let i = 0; i < columns; i++) {
        drops[i] = Math.random() * -canvas.height;
        glitchDrops[i] = Math.random() * -canvas.height;
    }
    
    let glitchActive = false;
    let glitchTimer = 0;
    let lastGlitchTime = 0;
    
    function drawCodeRain() {
        // 半透明背景，创建拖尾效果
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // 随机故障激活
        const currentTime = Date.now();
        if (currentTime - lastGlitchTime > 5000 && Math.random() > 0.996) {
            glitchActive = true;
            glitchTimer = 30 + Math.floor(Math.random() * 20);
            lastGlitchTime = currentTime;
        }
        
        if (glitchActive) {
            glitchTimer--;
            if (glitchTimer <= 0) {
                glitchActive = false;
            }
        }
        
        // 设置字体
        ctx.font = '12px "Share Tech Mono", monospace';
        
        // 绘制每一列的字符
        for (let i = 0; i < drops.length; i++) {
            const char = codeChars[Math.floor(Math.random() * codeChars.length)];
            const x = i * 16;
            const y = drops[i];
            
            // 颜色系统：主要绿色，偶尔其他颜色
            let color = '#00ff00';
            if (Math.random() > 0.95) {
                color = '#00ffff';
            } else if (Math.random() > 0.98) {
                color = '#ff0040';
            } else if (Math.random() > 0.992) {
                color = '#ffff00';
            }
            
            ctx.fillStyle = color;
            ctx.shadowColor = color;
            ctx.shadowBlur = 6;
            
            if (y > 0 && y < canvas.height) {
                ctx.fillText(char, x, y);
                
                // 头部高亮效果
                if (y < 50) {
                    ctx.fillStyle = '#ffffff';
                    ctx.shadowBlur = 12;
                    ctx.globalAlpha = 0.8;
                    ctx.fillText(char, x, y);
                    ctx.globalAlpha = 1;
                }
            }
            
            // 重置水滴位置
            if (y > canvas.height + 50 && Math.random() > 0.975) {
                drops[i] = Math.random() * -200;
            }
            
            drops[i] += Math.random() * 2 + 1;
        }
        
        ctx.shadowBlur = 0;
    }
    
    function drawGlitch() {
        if (!glitchCtx || !glitchActive) {
            if (glitchCtx) glitchCtx.clearRect(0, 0, glitchCanvas.width, glitchCanvas.height);
            return;
        }
        
        // 故障背景
        glitchCtx.fillStyle = `rgba(0, 0, 0, ${0.1 + Math.random() * 0.2})`;
        glitchCtx.fillRect(0, 0, glitchCanvas.width, glitchCanvas.height);
        
        // 故障字符
        glitchCtx.font = '14px "Share Tech Mono", monospace';
        
        for (let i = 0; i < glitchDrops.length; i += 3) {
            const colors = ['#ff0040', '#00ffff', '#ffff00', '#ff8000'];
            const color = colors[Math.floor(Math.random() * colors.length)];
            
            glitchCtx.fillStyle = color;
            glitchCtx.shadowColor = color;
            glitchCtx.shadowBlur = 8;
            
            const char = glitchChars[Math.floor(Math.random() * glitchChars.length)];
            
            // 添加故障偏移
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            const x = (i * 16) + offsetX;
            const y = glitchDrops[i] + offsetY;
            
            if (y > 0 && y < glitchCanvas.height && Math.random() > 0.6) {
                glitchCtx.fillText(char, x, y);
            }
            
            if (glitchDrops[i] > glitchCanvas.height + 50 && Math.random() > 0.8) {
                glitchDrops[i] = Math.random() * -100;
            }
            
            glitchDrops[i] += Math.random() * 4 + 2;
        }
        
        glitchCtx.shadowBlur = 0;
    }
    
    function animate() {
        drawCodeRain();
        drawGlitch();
        requestAnimationFrame(animate);
    }
    
    animate();
}

// 系统运行时间计数器
function initializeSystemUptime() {
    const uptimeElement = document.querySelector('.uptime-counter');
    if (!uptimeElement) return;
    
    let seconds = 0;
    
    function updateUptime() {
        const hours = Math.floor(seconds / 3600).toString().padStart(2, '0');
        const minutes = Math.floor((seconds % 3600) / 60).toString().padStart(2, '0');
        const secs = (seconds % 60).toString().padStart(2, '0');
        
        uptimeElement.textContent = `${hours}:${minutes}:${secs}`;
        seconds++;
    }
    
    // 每秒更新一次
    setInterval(updateUptime, 1000);
    updateUptime(); // 立即更新一次
}

// 打字机效果
function initializeTypewriter() {
    const typewriterText = document.querySelector('.typewriter-text');
    if (!typewriterText) return;
    
    const text = 'QUANTUM DATABASE ACCESS TERMINAL';
    let index = 0;
    
    function typeChar() {
        if (index < text.length) {
            typewriterText.textContent = text.substring(0, index + 1);
            index++;
            setTimeout(typeChar, 100);
        }
    }
    
    // 延迟开始打字效果
    setTimeout(typeChar, 1000);
}

// 增强登录界面初始化 - 硬核科幻版
function initializeSciFiLogin() {
    // 只在登录界面运行这些效果
    if (document.getElementById('loginScreen')) {
        initializeCodeRain();
        initializeSystemUptime();
        initializeTypewriter();
        initializeAlienDataParser();
        
        // 添加登录按钮点击动画
        const authButtons = document.querySelectorAll('.auth-btn');
        authButtons.forEach(btn => {
            btn.addEventListener('click', function(e) {
                const btnText = this.querySelector('.btn-text');
                const btnLoading = this.querySelector('.btn-loading');
                
                if (btnText && btnLoading) {
                    btnText.style.opacity = '0.5';
                    btnLoading.style.opacity = '1';
                    
                    // 模拟处理时间
                    setTimeout(() => {
                        btnText.style.opacity = '1';
                        btnLoading.style.opacity = '0';
                    }, 1500);
                }
            });
        });
        
        // 输入框聚焦特效
        const inputs = document.querySelectorAll('.input-group input');
        inputs.forEach(input => {
            input.addEventListener('focus', function() {
                const borderEffect = this.nextElementSibling;
                if (borderEffect && borderEffect.classList.contains('input-border-effect')) {
                    borderEffect.style.opacity = '1';
                }
            });
            
            input.addEventListener('blur', function() {
                const borderEffect = this.nextElementSibling;
                if (borderEffect && borderEffect.classList.contains('input-border-effect')) {
                    borderEffect.style.opacity = '0';
                }
            });
        });
    }
}

// 外星数据解析器动画
function initializeAlienDataParser() {
    const parserElements = document.querySelectorAll('.parser-value.parsing');
    
    parserElements.forEach(element => {
        const finalValue = element.getAttribute('data-final');
        const processingTexts = [
            'SCANNING...',
            'ANALYZING...',
            'DECODING...',
            'PROCESSING...',
            'PARSING...',
            'IDENTIFYING...',
            'VALIDATING...'
        ];
        
        let currentIndex = 0;
        let processingComplete = false;
        
        function updateParsingText() {
            if (processingComplete) return;
            
            if (currentIndex < processingTexts.length * 2) {
                element.textContent = processingTexts[currentIndex % processingTexts.length];
                currentIndex++;
                setTimeout(updateParsingText, 300 + Math.random() * 200);
            } else {
                element.textContent = finalValue;
                element.classList.remove('parsing');
                element.style.color = '#00ff00';
                element.style.textShadow = '0 0 10px #00ff00';
                processingComplete = true;
            }
        }
        
        // 延迟开始解析动画
        setTimeout(() => {
            updateParsingText();
        }, Math.random() * 2000 + 1000);
    });
}

// 德雷克风格系统运行时间计数器
function startUptimeCounter() {
    const uptimeElement = document.querySelector('.uptime-counter');
    if (!uptimeElement) return;
    
    uptimeInterval = setInterval(() => {
        const elapsed = Date.now() - systemStartTime;
        const hours = Math.floor(elapsed / 3600000);
        const minutes = Math.floor((elapsed % 3600000) / 60000);
        const seconds = Math.floor((elapsed % 60000) / 1000);
        
        uptimeElement.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }, 1000);
}

// 德雷克风格打字机效果
function initTypewriter() {
    const typewriterElement = document.querySelector('.typewriter-text');
    if (!typewriterElement) return;
    
    const text = 'PERSONNEL ACCESS TERMINAL';
    let index = 0;
    
    typewriterElement.textContent = '';
    
    const typeChar = () => {
        if (index < text.length) {
            typewriterElement.textContent += text.charAt(index);
            index++;
            setTimeout(typeChar, 50);
        }
    };
    
    setTimeout(typeChar, 1000);
}

// 用户数据存储 (保持原有功能)
const userData = {
    users: JSON.parse(localStorage.getItem('users') || '{}'),
    currentUser: localStorage.getItem('currentUser'),
    
    saveUser(username, password, recoveryCode) {
        this.users[username] = {
            password: password,
            recoveryCode: recoveryCode,
            createdAt: new Date().toISOString()
        };
        localStorage.setItem('users', JSON.stringify(this.users));
    },
    
    getUser(username) {
        return this.users[username];
    },
    
    updateUser(username, updates) {
        if (this.users[username]) {
            Object.assign(this.users[username], updates);
            localStorage.setItem('users', JSON.stringify(this.users));
        }
    },
    
    setCurrentUser(username) {
        this.currentUser = username;
        localStorage.setItem('currentUser', username);
    },
    
    logout() {
        this.currentUser = null;
        localStorage.removeItem('currentUser');
    }
};

// 标签页切换功能
function showTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    
    // 移除所有标签按钮的活动状态
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示目标标签内容
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应的标签按钮
    event.target.classList.add('active');
}

// 初始化登录表单
function initLoginForms() {
    // 登录表单
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', handleLogin);
    }
    
    // 注册表单
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
        registerForm.addEventListener('submit', handleRegister);
    }
    
    // 密码重置表单
    const recoverForm = document.getElementById('recoverForm');
    if (recoverForm) {
        recoverForm.addEventListener('submit', handleRecover);
    }
    
    // 检查是否已有用户登录
    if (userData.currentUser) {
        showMainApp();
    }
}

// 处理登录
function handleLogin(e) {
    e.preventDefault();
    
    const username = document.getElementById('loginUsername').value.trim();
    const password = document.getElementById('loginPassword').value;
    
    if (!username || !password) {
        alert('请填写完整的登录信息');
        return;
    }
    
    const user = userData.getUser(username);
    
    if (!user || user.password !== password) {
        alert('用户名或密码错误');
        return;
    }
    
    // 显示处理动画
    showProcessing(e.target.querySelector('.terminal-btn'));
    
    setTimeout(() => {
        userData.setCurrentUser(username);
        showMainApp();
    }, 1500);
}

// 处理注册
function handleRegister(e) {
    e.preventDefault();
    
    const username = document.getElementById('registerUsername').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;
    
    if (!username || !password || !confirmPassword) {
        alert('请填写完整的注册信息');
        return;
    }
    
    if (password !== confirmPassword) {
        alert('两次输入的密码不一致');
        return;
    }
    
    if (userData.getUser(username)) {
        alert('用户名已存在');
        return;
    }
    
    // 显示处理动画
    showProcessing(e.target.querySelector('.terminal-btn'));
    
    setTimeout(() => {
        // 生成恢复代码
        const recoveryCode = generateRecoveryCode();
        
        // 保存用户
        userData.saveUser(username, password, recoveryCode);
        
        // 显示恢复代码
        showRecoveryCode(recoveryCode);
        
        hideProcessing(e.target.querySelector('.terminal-btn'));
    }, 1500);
}

// 处理密码重置
function handleRecover(e) {
    e.preventDefault();
    
    const username = document.getElementById('recoverUsername').value.trim();
    const recoveryCode = document.getElementById('recoverCode').value.trim();
    const newPassword = document.getElementById('newPassword').value;
    
    if (!username || !recoveryCode || !newPassword) {
        alert('请填写完整的重置信息');
        return;
    }
    
    const user = userData.getUser(username);
    
    if (!user || user.recoveryCode !== recoveryCode) {
        alert('用户名或重置代码错误');
        return;
    }
    
    // 显示处理动画
    showProcessing(e.target.querySelector('.terminal-btn'));
    
    setTimeout(() => {
        // 生成新的恢复代码
        const newRecoveryCode = generateRecoveryCode();
        
        // 更新用户密码和恢复代码
        userData.updateUser(username, {
            password: newPassword,
            recoveryCode: newRecoveryCode
        });
        
        // 显示新的恢复代码
        showNewRecoveryCode(newRecoveryCode);
        
        hideProcessing(e.target.querySelector('.terminal-btn'));
        
        // 清空表单
        e.target.reset();
        
        alert('密码重置成功！请妥善保存新的重置代码。');
    }, 1500);
}

// 显示处理动画
function showProcessing(button) {
    const btnText = button.querySelector('.btn-text');
    const btnProcessing = button.querySelector('.btn-processing');
    
    if (btnText) btnText.style.display = 'none';
    if (btnProcessing) btnProcessing.style.display = 'block';
}

// 隐藏处理动画
function hideProcessing(button) {
    const btnText = button.querySelector('.btn-text');
    const btnProcessing = button.querySelector('.btn-processing');
    
    if (btnText) btnText.style.display = 'inline';
    if (btnProcessing) btnProcessing.style.display = 'none';
}

// 生成恢复代码
function generateRecoveryCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
        if (i === 3 || i === 7) result += '-';
    }
    return result;
}

// 显示恢复代码
function showRecoveryCode(code) {
    const recoveryDiv = document.getElementById('recoveryCode');
    const codeDisplay = recoveryDiv.querySelector('.code-display');
    
    codeDisplay.textContent = code;
    recoveryDiv.style.display = 'block';
    
    // 自动复制到剪贴板
    copyToClipboard(code);
}

// 显示新重置代码模态框
function showNewRecoveryCode(code) {
    const modal = document.getElementById('newCodeModal');
    const codeElement = document.getElementById('newRecoveryCode');
    
    codeElement.textContent = code;
    modal.style.display = 'flex';
    
    // 自动复制到剪贴板
    copyToClipboard(code);
    
    // 3秒后自动关闭（可选）
    setTimeout(() => {
        modal.style.display = 'none';
    }, 10000);
}

// 关闭新重置代码模态框
function closeNewCodeModal() {
    document.getElementById('newCodeModal').style.display = 'none';
}

// 复制到剪贴板
function copyToClipboard(text) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(text).catch(() => {
            fallbackCopyToClipboard(text);
        });
    } else {
        fallbackCopyToClipboard(text);
    }
}

// 备用复制方法
function fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        document.execCommand('copy');
    } catch (err) {
        console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
}

// 显示主应用
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    
    // 更新用户名显示
    const usernameElement = document.getElementById('currentUsername');
    if (usernameElement) {
        usernameElement.textContent = userData.currentUser;
    }
    
    // 初始化主应用功能
    initMainApp();
}

// 初始化主应用
function initMainApp() {
    // 加载物品数据
    loadItemData();
    
    // 绑定主标签切换事件
    if (!window.mainTabsInitialized) {
        initMainTabs();
        window.mainTabsInitialized = true;
    }
    
    console.log('主应用已初始化');
}

// 初始化主标签功能
function initMainTabs() {
    // 如果没有标签按钮，直接返回
    const tabButtons = document.querySelectorAll('.nav-tab-btn');
    if (tabButtons.length === 0) return;
    
    // 绑定标签按钮事件
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.textContent.includes('ITEM') ? 'items' : 'trading';
            showMainTab(tabName);
        });
    });
}

// 主标签页切换
function showMainTab(tabName) {
    // 隐藏所有标签内容
    document.querySelectorAll('.main-content-tab').forEach(tab => {
        tab.classList.remove('active');
    });
    
    // 移除所有按钮的活动状态
    document.querySelectorAll('.nav-tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // 显示选中的标签
    const targetTab = document.getElementById(tabName + 'Tab');
    if (targetTab) {
        targetTab.classList.add('active');
    }
    
    // 激活对应按钮
    const activeButton = Array.from(document.querySelectorAll('.nav-tab-btn')).find(btn => {
        return (tabName === 'items' && btn.textContent.includes('ITEM')) ||
               (tabName === 'trading' && btn.textContent.includes('TRADE'));
    });
    
    if (activeButton) {
        activeButton.classList.add('active');
    }

    // 如果切换到贸易路线页面，初始化贸易分析
    if (tabName === 'trading') {
        setTimeout(() => {
            initializeTradingRoutes();
        }, 100);
    }
}

// 初始化贸易路线页面
function initializeTradingRoutes() {
    // 检查元素是否存在
    const analyzeButton = document.getElementById('analyzeRoutes');
    const refreshButton = document.getElementById('refreshPrices');
    const sortSelect = document.getElementById('sortMethod');
    
    if (!analyzeButton || !refreshButton || !sortSelect) {
        console.log('贸易路线元素未找到，跳过初始化');
        return;
    }
    
    // 移除之前的事件监听器（防止重复绑定）
    const newAnalyzeButton = analyzeButton.cloneNode(true);
    const newRefreshButton = refreshButton.cloneNode(true);
    const newSortSelect = sortSelect.cloneNode(true);
    
    analyzeButton.parentNode.replaceChild(newAnalyzeButton, analyzeButton);
    refreshButton.parentNode.replaceChild(newRefreshButton, refreshButton);
    sortSelect.parentNode.replaceChild(newSortSelect, sortSelect);
    
    // 绑定新的事件监听器
    newAnalyzeButton.addEventListener('click', analyzeTradingRoutes);
    newRefreshButton.addEventListener('click', function() {
        // 更新市场价格
        updateMarketPrices();
        analyzeTradingRoutes();
    });
    newSortSelect.addEventListener('change', analyzeTradingRoutes);
    
    console.log('贸易路线功能已初始化');
}

// 模拟市场价格更新
function updateMarketPrices() {
    console.log('市场价格已更新');
    // 这里可以添加实际的价格更新逻辑
}

// 分析贸易路线
function analyzeTradingRoutes() {
    const maxInvestment = parseInt(document.getElementById('maxInvestment')?.value || 1000000);
    const cargoCapacity = parseInt(document.getElementById('cargoCapacity')?.value || 100);
    const sortMethod = document.getElementById('sortMethod')?.value || 'profit';
    
    console.log('分析贸易路线', { maxInvestment, cargoCapacity, sortMethod });
    
    // 生成示例路线数据
    const routes = generateSampleRoutes(maxInvestment, cargoCapacity);
    
    // 排序路线
    const sortedRoutes = sortRoutes(routes, sortMethod);
    
    // 显示前20个路线
    const topRoutes = sortedRoutes.slice(0, 20);
    
    // 显示路线列表
    displayRoutesList(topRoutes);
}

// 生成示例路线数据
function generateSampleRoutes(maxInvestment, cargoCapacity) {
    const commodities = [
        { code: 'QUAN', name: 'Quantainium', type: 'Mineral', buyPrice: 8500, sellPrice: 12000 },
        { code: 'DIAM', name: 'Diamond', type: 'Gem', buyPrice: 6800, sellPrice: 9500 },
        { code: 'GOLD', name: 'Gold', type: 'Metal', buyPrice: 5200, sellPrice: 7300 },
        { code: 'LATN', name: 'Laranite', type: 'Mineral', buyPrice: 3100, sellPrice: 4800 },
        { code: 'ALUM', name: 'Aluminum', type: 'Metal', buyPrice: 1200, sellPrice: 1850 },
        { code: 'TITA', name: 'Titanium', type: 'Metal', buyPrice: 2800, sellPrice: 4200 },
        { code: 'WIDO', name: 'WiDoW', type: 'Drug', buyPrice: 15000, sellPrice: 25000 },
        { code: 'MEDI', name: 'Medical Supplies', type: 'Consumer', buyPrice: 1800, sellPrice: 2900 }
    ];
    
    const locations = [
        'Area18 - ArcCorp', 'New Babbage - microTech', 'Lorville - Hurston',
        'Port Olisar - Crusader', 'Grim HEX - Yela', 'Levski - Delamar',
        'Daymar - Crusader', 'Wala - Crusader', 'Yela - Crusader',
        'Cellin - Crusader', 'Aberdeen - Hurston', 'Arial - Hurston'
    ];
    
    const routes = [];
    
    commodities.forEach(commodity => {
        for (let i = 0; i < locations.length; i++) {
            for (let j = 0; j < locations.length; j++) {
                if (i !== j) {
                    const buyLocation = locations[i];
                    const sellLocation = locations[j];
                    const distance = Math.random() * 50 + 10; // 10-60 AU
                    
                    // 计算可承载数量
                    const maxQuantityByCapacity = cargoCapacity;
                    const maxQuantityByInvestment = Math.floor(maxInvestment / commodity.buyPrice);
                    const quantity = Math.min(maxQuantityByCapacity, maxQuantityByInvestment);
                    
                    if (quantity > 0) {
                        const investment = quantity * commodity.buyPrice;
                        const revenue = quantity * commodity.sellPrice;
                        const profit = revenue - investment;
                        const roi = (profit / investment) * 100;
                        const profitPerSCU = commodity.sellPrice - commodity.buyPrice;
                        const profitPerAU = profit / distance;
                        
                        // 计算风险等级
                        let riskLevel = 'LOW';
                        if (commodity.type === 'Drug') riskLevel = 'EXTREME';
                        else if (commodity.type === 'Mineral' && commodity.buyPrice > 5000) riskLevel = 'HIGH';
                        else if (profit > 500000) riskLevel = 'MEDIUM';
                        
                        routes.push({
                            item: commodity,
                            buyLocation,
                            sellLocation,
                            buyPrice: commodity.buyPrice,
                            sellPrice: commodity.sellPrice,
                            quantity,
                            distance,
                            investment,
                            revenue,
                            profit,
                            roi,
                            profitPerSCU,
                            profitPerAU,
                            riskLevel
                        });
                    }
                }
            }
        }
    });
    
    return routes.filter(route => route.profit > 0);
}

// 排序路线
function sortRoutes(routes, sortMethod) {
    switch(sortMethod) {
        case 'profit':
            return routes.sort((a, b) => b.profit - a.profit);
        case 'roi':
            return routes.sort((a, b) => b.roi - a.roi);
        case 'distance':
            return routes.sort((a, b) => a.distance - b.distance);
        case 'cost':
            return routes.sort((a, b) => a.investment - b.investment);
        default:
            return routes.sort((a, b) => b.profit - a.profit);
    }
}

// 选择路线并显示详情
function selectRoute(route) {
    // 移除之前的选中状态
    document.querySelectorAll('.route-item').forEach(item => {
        item.classList.remove('selected');
    });
    
    // 添加当前选中状态
    event.currentTarget.classList.add('selected');
    
    // 显示路线详情
    displayRouteDetails(route);
}

// 退出登录
function logout() {
    userData.logout();
    
    // 清理运行时间计数器
    if (uptimeInterval) {
        clearInterval(uptimeInterval);
    }
    
    // 重置系统开始时间
    systemStartTime = Date.now();
    
    // 显示登录界面
    document.getElementById('mainApp').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    
    // 重新启动计数器和打字机效果
    startUptimeCounter();
    initTypewriter();
}

// 用户设置相关功能
function openUserSettings() {
    const modal = document.getElementById('userSettingsModal');
    const currentRecoveryCode = document.getElementById('currentRecoveryCode');
    
    // 显示当前用户的恢复代码
    const user = userData.getUser(userData.currentUser);
    if (user && currentRecoveryCode) {
        currentRecoveryCode.textContent = user.recoveryCode;
    }
    
    modal.style.display = 'flex';
}

function closeUserSettings() {
    document.getElementById('userSettingsModal').style.display = 'none';
}

function updateUsername() {
    const newUsername = document.getElementById('settingsUsername').value.trim();
    
    if (!newUsername) {
        alert('请输入新的用户名');
        return;
    }
    
    if (userData.getUser(newUsername)) {
        alert('用户名已存在');
        return;
    }
    
    // 复制当前用户数据到新用户名
    const currentUserData = userData.getUser(userData.currentUser);
    userData.saveUser(newUsername, currentUserData.password, currentUserData.recoveryCode);
    
    // 删除旧用户名
    delete userData.users[userData.currentUser];
    localStorage.setItem('users', JSON.stringify(userData.users));
    
    // 更新当前用户
    userData.setCurrentUser(newUsername);
    
    // 更新显示
    document.getElementById('currentUsername').textContent = newUsername;
    document.getElementById('settingsUsername').value = '';
    
    alert('用户名更新成功');
}

function updatePassword() {
    const newPassword = document.getElementById('settingsNewPassword').value;
    
    if (!newPassword) {
        alert('请输入新密码');
        return;
    }
    
    // 生成新的恢复代码
    const newRecoveryCode = generateRecoveryCode();
    
    // 更新用户数据
    userData.updateUser(userData.currentUser, {
        password: newPassword,
        recoveryCode: newRecoveryCode
    });
    
    // 显示新的恢复代码
    showNewRecoveryCode(newRecoveryCode);
    
    // 更新设置中显示的恢复代码
    document.getElementById('currentRecoveryCode').textContent = newRecoveryCode;
    document.getElementById('settingsNewPassword').value = '';
    
    alert('密码更新成功！新的重置代码已生成。');
}

function copyRecoveryCode() {
    const recoveryCode = document.getElementById('currentRecoveryCode').textContent;
    copyToClipboard(recoveryCode);
    alert('重置代码已复制到剪贴板');
}

function regenerateRecoveryCode() {
    if (!confirm('确定要重新生成重置代码吗？旧的代码将失效。')) {
        return;
    }
    
    const newRecoveryCode = generateRecoveryCode();
    
    // 更新用户数据
    userData.updateUser(userData.currentUser, {
        recoveryCode: newRecoveryCode
    });
    
    // 显示新的恢复代码
    showNewRecoveryCode(newRecoveryCode);
    
    // 更新设置中显示的恢复代码
    document.getElementById('currentRecoveryCode').textContent = newRecoveryCode;
    
    alert('新的重置代码已生成');
}

// 简单的聊天功能
function sendMessage() {
    const input = document.getElementById('chatInput');
    const message = input.value.trim();
    
    if (!message) return;
    
    const messagesContainer = document.getElementById('chatMessages');
    const messageElement = document.createElement('div');
    messageElement.className = 'message';
    messageElement.innerHTML = `
        <div class="username">${userData.currentUser}</div>
        <div class="content">${message}</div>
        <div class="timestamp">${new Date().toLocaleTimeString()}</div>
    `;
    
    messagesContainer.appendChild(messageElement);
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
    
    input.value = '';
}

// 键盘事件监听
document.addEventListener('keydown', function(e) {
    // 在聊天输入框中按回车发送消息
    if (e.target.id === 'chatInput' && e.key === 'Enter') {
        sendMessage();
    }
});

// 德雷克风格增强功能
function initDrakeEnhancements() {
    // 添加随机的系统噪音效果
    setInterval(() => {
        const indicators = document.querySelectorAll('.indicator.active');
        indicators.forEach(indicator => {
            if (Math.random() < 0.1) {
                indicator.style.opacity = Math.random() * 0.5 + 0.5;
            }
        });
    }, 2000);
    
    // 添加面板条纹动画随机性
    setInterval(() => {
        const stripes = document.querySelectorAll('.panel-stripe');
        stripes.forEach(stripe => {
            if (Math.random() < 0.2) {
                stripe.style.animationDuration = (Math.random() * 2 + 1) + 's';
            }
        });
    }, 5000);
}

// 在页面加载完成后启动德雷克增强功能
window.addEventListener('load', () => {
    initDrakeEnhancements();
});

// 替换原有的初始化代码为德雷克风格的初始化
// 当页面加载完成时初始化应用
document.addEventListener('DOMContentLoaded', function() {
    // 启动系统运行时间计数器
    startUptimeCounter();
    
    // 初始化打字机效果
    initTypewriter();
    
    // 初始化登录表单功能
    initLoginForms();
    
    // 加载物品数据
    loadItemData();
    
    // 启动德雷克增强功能
    initDrakeEnhancements();
});