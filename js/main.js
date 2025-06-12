// 主应用系统模块
class MainApplication {
    constructor() {
        this.isInitialized = false;
        this.currentTab = 'database';
        this.currentUser = null;
        this.subsystems = {};
        this.initialize();
    }

    async initialize() {
        // 这个方法用于登录后的初始化
        if (!this.isInitialized) {
            this.initializeApp();
        }
        
        // 确保界面正确显示
        setTimeout(() => {
            this.initMainInterface();
        }, 100);
    }

    initializeApp() {
        try {
            // Phase 5: 核心子系统初始化
            console.log('🔗 正在初始化核心子系统...');
            
            if (window.realtimeDataSystem) {
                this.realtimeDataSystem = window.realtimeDataSystem;
                console.log('📊 实时数据系统已初始化');
            }
            
            if (window.dashboardManager) {
                this.dashboardManager = window.dashboardManager;
                console.log('📈 仪表板管理器已初始化');
            }
            
            if (window.socketChatSystem) {
                this.socketChatSystem = window.socketChatSystem;
                console.log('💬 Socket聊天系统已初始化');
            }

            // 跳过旧的UEX数据管理器，使用新的直接API系统
            // if (window.uexDataManager) {
            //     this.uexDataManager = window.uexDataManager;
            //     console.log('🚀 UEX数据管理器已初始化');
            // }

            // 初始化本地化系统
            if (window.localization) {
                console.log('🌐 本地化系统已就绪');
            }

            // 初始化UEX贸易市场系统
            if (window.uexTradingMarket) {
                await window.uexTradingMarket.init();
                console.log('🏪 UEX贸易市场系统已就绪');
            }

            // 初始化UEX直接API系统（优先级最高）
            if (window.uexDirectApiFetcher) {
                await window.uexDirectApiFetcher.init();
                console.log('🚀 UEX直接API系统已就绪');
            } else if (window.uexLiveDataFetcher) {
                // 备用：UEX模拟数据系统
                await window.uexLiveDataFetcher.init();
                console.log('📡 UEX模拟数据系统已就绪');
            } else if (window.shipsDatabase) {
                // 最后备用：静态数据库
                window.shipsDatabase.init();
                console.log('💾 静态飞船数据库已就绪');
            }

            this.initMainInterface();

        } catch (error) {
            console.error('❌ 应用初始化失败:', error);
        }
    }

    // Phase 5: 初始化用户体验优化系统
    initPhase5Systems() {
        // 性能监控系统
        if (window.performanceMonitor) {
            console.log('📊 性能监控系统已初始化');
            
            // 添加性能监控观察者
            window.performanceMonitor.addObserver((event, data) => {
                if (event === 'memoryWarning' || event === 'fpsWarning') {
                    this.showErrorNotification(`性能警告: ${event}`);
                }
            });
        }

        // 数据管理系统
        if (window.dataManager) {
            console.log('💾 数据管理系统已初始化');
            
            // 迁移用户数据到新的数据管理系统
            this.migrateUserData();
        }

        // 用户引导系统
        if (window.tutorialSystem) {
            console.log('🎓 用户引导系统已初始化');
        }

        // 系统状态监控
        if (window.systemStatusMonitor) {
            console.log('📟 系统状态监控已初始化');
        }

        // 不再使用旧的UEX数据管理器，避免与新的直接API系统冲突
        // if (window.uexDataManager) {
        //     console.log('🚀 UEX数据管理器已初始化');
        //     window.uexDataManager.init();
        // }
    }

    // 迁移用户数据
    migrateUserData() {
        try {
            // 迁移现有的localStorage数据到新的数据管理系统
            const existingUser = localStorage.getItem('sc_current_user');
            if (existingUser && window.dataManager) {
                window.dataManager.save('user', 'current', existingUser);
            }

            const soundEnabled = localStorage.getItem('sc_sound_enabled');
            if (soundEnabled !== null && window.dataManager) {
                window.dataManager.save('system', 'soundEnabled', soundEnabled === 'true');
            }

            const soundVolume = localStorage.getItem('sc_sound_volume');
            if (soundVolume && window.dataManager) {
                window.dataManager.save('system', 'soundVolume', parseFloat(soundVolume));
            }

            console.log('💾 用户数据迁移完成');
        } catch (error) {
            console.warn('⚠️ 用户数据迁移失败:', error);
        }
    }

    checkExistingSession() {
        const savedUser = localStorage.getItem('sc_current_user');
        if (savedUser) {
            this.currentUser = savedUser;
            // 如果有已登录用户，显示主应用
            setTimeout(async () => {
                if (window.authSystem) {
                    window.authSystem.currentUser = savedUser;
                    window.authSystem.showMainApp();
                    
                    // 连接聊天系统
                    if (window.chatSystem) {
                        await window.chatSystem.connect(savedUser);
                        console.log(`💬 已为用户 ${savedUser} 自动连接聊天系统`);
                    }
                }
            }, 100);
        }
    }

    initializeSubsystems() {
        console.log('🔗 正在初始化核心子系统...');
        
        // 不再初始化旧的UEX数据管理器，避免与直接API系统冲突
        // if (window.uexDataManager) {
        //     this.uexDataManager = window.uexDataManager;
        //     console.log('🚀 UEX数据管理器已初始化');
        // }
        
        if (window.realtimeDataSystem) {
            this.realtimeDataSystem = window.realtimeDataSystem;
            console.log('📊 实时数据系统已初始化');
        }
        
        if (window.dashboardManager) {
            this.dashboardManager = window.dashboardManager;
            console.log('📈 仪表板管理器已初始化');
        }
        
        if (window.socketChatSystem) {
            this.socketChatSystem = window.socketChatSystem;
            console.log('💬 Socket聊天系统已初始化');
        }
    }

    async waitForSubsystems() {
        const maxAttempts = 50;
        let attempts = 0;
        
        while (attempts < maxAttempts) {
            if (window.authSystem && window.tradingSystem && window.effectsSystem && 
                window.realtimeDataSystem && window.dashboardSystem) {
                return true;
            }
            
            await this.delay(100);
            attempts++;
        }
        
        console.warn('部分子系统未能及时加载');
        return false;
    }

    setupSystemIntegration() {
        // 实时数据系统集成
        if (this.subsystems.realtime) {
            console.log('🔗 实时数据系统已启动');
            
            // 订阅价格更新事件
            this.subsystems.realtime.subscribe('priceUpdate', () => {
                // 通知贸易系统更新路线显示
                if (this.subsystems.trading && this.subsystems.trading.selectedRoute) {
                    this.subsystems.trading.displayRouteDetails(this.subsystems.trading.selectedRoute);
                }
            });
        }

        // 仪表板系统集成
        if (this.subsystems.dashboard) {
            console.log('📊 仪表板系统已启动');
        }

        // 聊天系统集成
        if (window.chatSystem) {
            console.log('💬 聊天系统已启动');
            
            // 监听认证状态变化
            document.addEventListener('userLoggedIn', async (e) => {
                if (e.detail && e.detail.username) {
                    this.currentUser = e.detail.username;
                    // 连接聊天系统
                    await window.chatSystem.connect(this.currentUser);
                    
                    // 播放用户加入音效
                    if (window.soundSystem) {
                        setTimeout(() => {
                            window.soundSystem.play('user_join');
                        }, 500);
                    }
                }
            });

            document.addEventListener('userLoggedOut', () => {
                // 断开聊天系统
                if (window.chatSystem.isConnected) {
                    // 播放用户离开音效
                    if (window.soundSystem) {
                        window.soundSystem.play('user_leave');
                    }
                    window.chatSystem.disconnect();
                }
            });
        }
    }

    initMainInterface() {
        this.initTabSwitching();
        this.initUserDropdown();
        this.initItemDatabase();
        this.bindMainEvents();
    }

    initTabSwitching() {
        const tabButtons = document.querySelectorAll('.nav-tab-btn');
        tabButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const tabName = btn.textContent.includes('ITEM') ? 'items' : 'trading';
                this.showMainTab(tabName);
            });
        });
    }

    showMainTab(tabName) {
        // 隐藏所有标签内容
        document.querySelectorAll('.main-content-tab').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.nav-tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示指定标签
        const targetTab = document.getElementById(tabName + 'Tab');
        const targetBtn = tabName === 'items' ? 
            document.querySelector('.nav-tab-btn:first-child') :
            document.querySelector('.nav-tab-btn:last-child');
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');

        this.currentTab = tabName;

        // 触发标签切换事件（用于声音系统）
        document.dispatchEvent(new CustomEvent('tabSwitch', {
            detail: { tab: tabName }
        }));

        // 初始化对应功能
        if (tabName === 'trading' && this.subsystems.trading) {
            setTimeout(() => {
                this.subsystems.trading.analyzeTradingRoutes();
            }, 100);
        }
    }

    initUserDropdown() {
        const userDropdown = document.querySelector('.user-dropdown');
        if (!userDropdown) return;

        const userInfo = userDropdown.querySelector('.user-info');
        const dropdown = userDropdown.querySelector('.user-dropdown-menu');
        
        let hideTimeout;

        const showMenu = () => {
            clearTimeout(hideTimeout);
            dropdown.style.display = 'block';
            setTimeout(() => dropdown.classList.add('show'), 10);
        };

        const hideMenu = () => {
            hideTimeout = setTimeout(() => {
                dropdown.classList.remove('show');
                setTimeout(() => {
                    if (!dropdown.classList.contains('show')) {
                        dropdown.style.display = 'none';
                    }
                }, 300);
            }, 300);
        };

        userInfo.addEventListener('mouseenter', showMenu);
        userInfo.addEventListener('mouseleave', hideMenu);
        dropdown.addEventListener('mouseenter', showMenu);
        dropdown.addEventListener('mouseleave', hideMenu);

        // 绑定菜单项点击事件
        dropdown.addEventListener('click', (e) => {
            const item = e.target.closest('.dropdown-item');
            if (!item) return;

            if (item.textContent.includes('设置')) {
                this.openUserSettings();
            } else if (item.textContent.includes('登出')) {
                this.logout();
            }
        });
    }

    async initItemDatabase() {
        console.log('🚀 初始化物品数据库...');
        
        try {
            // 1. 尝试使用UEX直接API系统（优先级最高）
            if (typeof UEXDirectAPIFetcher !== 'undefined' && window.uexDirectAPI) {
                console.log('📡 尝试UEX直接API系统...');
                await window.uexDirectAPI.init();
                
                // 等待数据加载完成
                let attempts = 0;
                while (window.uexDirectAPI.ships.length === 0 && attempts < 10) {
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    attempts++;
                }
                
                if (window.uexDirectAPI.ships.length > 0) {
                    this.currentDataSource = 'uex-direct-api';
                    console.log(`✅ UEX直接API系统加载成功: ${window.uexDirectAPI.ships.length} 艘飞船`);
                    
                    // 初始化增强贸易系统
                    if (typeof UEXEnhancedTrading !== 'undefined' && window.uexEnhancedTrading) {
                        console.log('📊 初始化UEX增强贸易系统...');
                        await window.uexEnhancedTrading.init();
                        
                        // 绑定贸易界面事件
                        this.bindTradingEvents();
                    }
                    
                    return;
                } else {
                    console.log('⚠️ UEX直接API未返回数据，尝试备用方案...');
                }
            } else {
                console.log('⚠️ UEX直接API系统未找到，检查系统...');
            }
            
            // 2. 回退到UEX模拟数据系统
            if (typeof UEXLiveDataFetcher !== 'undefined' && window.uexLiveDataFetcher) {
                console.log('📱 尝试UEX模拟数据系统...');
                await window.uexLiveDataFetcher.init();
                
                if (window.uexLiveDataFetcher.ships.length > 0) {
                    this.currentDataSource = 'uex-live-data';
                    console.log(`✅ UEX模拟数据系统加载成功: ${window.uexLiveDataFetcher.ships.length} 艘飞船`);
                    return;
                }
            }
            
            // 3. 最后回退到备用飞船数据库
            if (typeof shipsDatabase !== 'undefined' && shipsDatabase.ships) {
                console.log('💾 使用备用飞船数据库...');
                this.currentDataSource = 'ships-database';
                this.updateItemDisplay(shipsDatabase.ships);
                console.log(`✅ 备用飞船数据库加载: ${shipsDatabase.ships.length} 艘飞船`);
                return;
            }
            
            // 4. 传统物品数据库（最后备选）
            if (typeof itemsDatabase !== 'undefined' && itemsDatabase.items) {
                console.log('📦 使用传统物品数据库...');
                this.currentDataSource = 'items-database';
                this.updateItemDisplay(itemsDatabase.items);
                console.log(`✅ 传统物品数据库加载: ${itemsDatabase.items.length} 个物品`);
                return;
            }
            
            console.error('❌ 所有数据源都不可用');
            
        } catch (error) {
            console.error('❌ 初始化数据库时出错:', error);
        }
    }

    // 绑定贸易界面事件
    bindTradingEvents() {
        const analyzeRoutesBtn = document.getElementById('analyzeRoutes');
        const refreshPricesBtn = document.getElementById('refreshPrices');
        
        if (analyzeRoutesBtn) {
            analyzeRoutesBtn.addEventListener('click', async () => {
                analyzeRoutesBtn.disabled = true;
                analyzeRoutesBtn.innerHTML = '<span class="btn-text">分析中...</span>';
                
                try {
                    if (window.uexEnhancedTrading) {
                        await window.uexEnhancedTrading.fetchTradingData();
                    }
                } catch (error) {
                    console.error('分析贸易路线失败:', error);
                    alert('分析失败: ' + error.message);
                } finally {
                    analyzeRoutesBtn.disabled = false;
                    analyzeRoutesBtn.innerHTML = `
                        <span class="btn-bracket">[</span>
                        <span class="btn-text">ANALYZE ROUTES</span>
                        <span class="btn-bracket">]</span>
                    `;
                }
            });
        }
        
        if (refreshPricesBtn) {
            refreshPricesBtn.addEventListener('click', async () => {
                refreshPricesBtn.disabled = true;
                refreshPricesBtn.innerHTML = '<span class="btn-text">刷新中...</span>';
                
                try {
                    if (window.uexEnhancedTrading) {
                        await window.uexEnhancedTrading.refreshData();
                    }
                } catch (error) {
                    console.error('刷新价格失败:', error);
                    alert('刷新失败: ' + error.message);
                } finally {
                    refreshPricesBtn.disabled = false;
                    refreshPricesBtn.innerHTML = `
                        <span class="btn-bracket">[</span>
                        <span class="btn-text">REFRESH PRICES</span>
                        <span class="btn-bracket">]</span>
                    `;
                }
            });
        }
    }

    renderItemGrid(items) {
        const itemsGrid = document.querySelector('.items-grid');
        if (!itemsGrid) return;

        itemsGrid.innerHTML = items.map(item => `
            <div class="item-card" data-item-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <p class="item-code">${item.code}</p>
                <p class="item-price">${item.price.toLocaleString()} aUEC</p>
            </div>
        `).join('');

        // 绑定点击事件
        itemsGrid.addEventListener('click', (e) => {
            const card = e.target.closest('.item-card');
            if (card) {
                const itemId = parseInt(card.dataset.itemId);
                const item = items.find(i => i.id === itemId);
                if (item) {
                    this.selectItem(item);
                }
            }
        });
    }

    selectItem(item) {
        // 移除之前的选中状态
        document.querySelectorAll('.item-card').forEach(card => {
            card.classList.remove('selected');
        });

        // 选中当前物品
        document.querySelector(`[data-item-id="${item.id}"]`).classList.add('selected');

        // 显示物品详情
        this.updateItemDetails(item);
    }

    updateItemDetails(item) {
        const detailContainer = document.querySelector('.item-detail-container');
        if (!detailContainer) return;

        detailContainer.innerHTML = `
            <div class="item-preview">
                <div class="item-image">
                    <img src="${item.image}" alt="${item.name}">
                </div>
                <div class="item-info">
                    <h2>${item.name}</h2>
                    <p class="item-code">代码: ${item.code}</p>
                    <p class="item-type">类型: ${item.type}</p>
                    <p class="item-rarity">稀有度: ${item.rarity}</p>
                    <p class="item-price">价格: ${item.price.toLocaleString()} aUEC</p>
                    <p class="item-description">${item.description}</p>
                </div>
            </div>
        `;
    }

    initItemSearch() {
        const searchInput = document.querySelector('.search-box input');
        if (!searchInput) return;

        searchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase();
            this.filterItems(query);
        });
    }

    filterItems(query) {
        const cards = document.querySelectorAll('.item-card, .ship-card');
        cards.forEach(card => {
            try {
                let name = '';
                let code = '';
                let manufacturer = '';
                
                // 检查是否是新的飞船卡片
                if (card.classList.contains('ship-card')) {
                    const nameElement = card.querySelector('h4');
                    const manufacturerElement = card.querySelector('.ship-manufacturer');
                    
                    name = nameElement ? nameElement.textContent.toLowerCase() : '';
                    manufacturer = manufacturerElement ? manufacturerElement.textContent.toLowerCase() : '';
                    code = manufacturer; // 对飞船，制造商也作为搜索条件
                } else {
                    // 旧的物品卡片结构
                    const nameElement = card.querySelector('h4');
                    const codeElement = card.querySelector('.item-code');
                    
                    name = nameElement ? nameElement.textContent.toLowerCase() : '';
                    code = codeElement ? codeElement.textContent.toLowerCase() : '';
                }
                
                const searchQuery = query.toLowerCase();
                const shouldShow = name.includes(searchQuery) || 
                                 code.includes(searchQuery) || 
                                 manufacturer.includes(searchQuery);
                
                card.style.display = shouldShow ? 'block' : 'none';
                
            } catch (error) {
                console.warn('搜索时跳过无效卡片:', error);
                // 如果出错，默认显示这个卡片
                card.style.display = 'block';
            }
        });
    }

    bindGlobalEvents() {
        // 全局按键事件
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                this.closeAllModals();
            }
            
            // Ctrl+D 切换仪表板
            if (e.ctrlKey && e.key === 'd') {
                e.preventDefault();
                if (window.dashboard) {
                    window.dashboard.toggle();
                }
            }
            
            // Ctrl+Shift+A 打开高级分析系统
            if (e.ctrlKey && e.shiftKey && e.key === 'A') {
                e.preventDefault();
                if (window.analyticsUI) {
                    window.analyticsUI.toggle();
                }
            }
            
            // Ctrl+M 打开音效控制面板
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                if (window.soundControlSystem) {
                    window.soundControlSystem.toggle();
                }
            }

            // Phase 5 快捷键
            // Ctrl+Shift+S 系统状态
            if (e.ctrlKey && e.shiftKey && e.key === 'S') {
                e.preventDefault();
                if (window.systemStatus) {
                    if (window.systemStatus.isVisible) {
                        window.systemStatus.hide();
                    } else {
                        window.systemStatus.show();
                    }
                }
            }

            // Ctrl+Shift+E 导出性能报告
            if (e.ctrlKey && e.shiftKey && e.key === 'E') {
                e.preventDefault();
                if (window.performanceMonitor) {
                    window.performanceMonitor.exportData();
                    this.showErrorNotification('性能报告已导出');
                }
            }

            // Ctrl+Shift+B 创建数据备份
            if (e.ctrlKey && e.shiftKey && e.key === 'B') {
                e.preventDefault();
                if (window.dataManager) {
                    window.dataManager.createBackup();
                    this.showErrorNotification('数据备份已创建');
                }
            }
        });

        // 按钮点击效果
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('terminal-btn') || 
                e.target.classList.contains('trade-btn')) {
                if (this.subsystems.effects) {
                    this.subsystems.effects.addButtonClickEffect(e.target);
                }
            }
        });

        // 窗口大小变化
        window.addEventListener('resize', () => {
            this.handleResize();
        });
    }

    bindMainEvents() {
        // 绑定全局Tab切换函数到window
        window.showTab = (tabName) => {
            if (this.subsystems.auth) {
                this.subsystems.auth.showTab(tabName);
            }
        };

        window.showMainTab = (tabName) => {
            this.showMainTab(tabName);
        };

        // 绑定用户相关的全局函数
        window.openUserSettings = () => {
            this.openUserSettings();
        };

        window.logout = () => {
            this.logout();
        };

        // 绑定其他全局函数
        window.closeUserSettings = () => {
            this.closeUserSettings();
        };

        window.sendMessage = () => {
            this.sendMessage();
        };

        window.searchItems = (query) => {
            this.filterItems(query);
        };

        // 绑定模态框相关函数
        window.closeNewCodeModal = () => {
            const modal = document.getElementById('newCodeModal');
            if (modal) modal.style.display = 'none';
        };

        // 绑定恢复码重新生成函数
        window.regenerateRecoveryCode = () => {
            this.regenerateRecoveryCode();
        };
    }

    closeAllModals() {
        const modals = document.querySelectorAll('.modal, .new-code-modal, .settings-modal');
        modals.forEach(modal => {
            modal.style.display = 'none';
        });
    }

    handleResize() {
        // 响应式布局调整
        if (window.innerWidth < 768) {
            document.body.classList.add('mobile');
        } else {
            document.body.classList.remove('mobile');
        }
    }

    openUserSettings() {
        const modal = document.getElementById('userSettingsModal');
        if (modal) {
            modal.style.display = 'flex';
            
            // 显示当前用户信息
            const currentUsername = document.getElementById('currentUsername');
            const currentRecoveryCode = document.getElementById('currentRecoveryCode');
            
            if (currentUsername) {
                currentUsername.textContent = this.currentUser || 'Unknown';
            }
            
            if (currentRecoveryCode && this.subsystems.auth) {
                const user = this.subsystems.auth.getUser(this.currentUser);
                if (user && user.recoveryCode) {
                    currentRecoveryCode.textContent = user.recoveryCode;
                }
            }
        }
    }

    closeUserSettings() {
        const modal = document.getElementById('userSettingsModal');
        if (modal) {
            modal.style.display = 'none';
        }
    }

    logout() {
        if (this.subsystems.auth) {
            this.subsystems.auth.logout();
        }
    }

    setupErrorHandling() {
        window.addEventListener('error', (e) => {
            console.error('应用错误:', e.error);
            this.showErrorNotification('系统错误，请刷新页面重试');
        });

        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise错误:', e.reason);
            this.showErrorNotification('网络错误，请检查连接');
        });
    }

    showErrorNotification(message) {
        const notification = document.createElement('div');
        notification.className = 'error-notification';
        notification.textContent = message;
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff3300;
            color: #fff;
            padding: 15px 20px;
            border: 2px solid #ff6600;
            font-family: 'Share Tech Mono', monospace;
            z-index: 10000;
            animation: slideInRight 0.3s ease-out;
        `;

        document.body.appendChild(notification);
        setTimeout(() => {
            notification.style.animation = 'slideOutRight 0.3s ease-in forwards';
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 获取应用状态
    getStatus() {
        return {
            initialized: this.isInitialized,
            currentUser: this.currentUser,
            currentTab: this.currentTab,
            subsystems: Object.keys(this.subsystems).reduce((acc, key) => {
                acc[key] = !!this.subsystems[key];
                return acc;
            }, {})
        };
    }

    // 发送消息 - 使用新的聊天系统
    sendMessage() {
        if (window.chatSystem && window.chatSystem.isConnected) {
            // 使用新的Socket.io聊天系统方法
            if (window.chatSystem.sendMessage) {
                const messageInput = document.getElementById('messageInput');
                const message = messageInput?.value?.trim();
                if (message) {
                    window.chatSystem.sendMessage(message);
                    messageInput.value = '';
                }
            } else if (window.chatSystem.handleSendMessage) {
                // 兼容旧聊天系统
                window.chatSystem.handleSendMessage();
            }
        } else {
            console.warn('聊天系统未连接');
        }
    }

    regenerateRecoveryCode() {
        if (this.subsystems.auth && this.currentUser) {
            const newCode = this.subsystems.auth.generateRecoveryCode();
            const user = this.subsystems.auth.getUser(this.currentUser);
            
            if (user) {
                user.recoveryCode = newCode;
                this.subsystems.auth.saveUsers();
                
                // 更新显示
                const currentRecoveryCode = document.getElementById('currentRecoveryCode');
                if (currentRecoveryCode) {
                    currentRecoveryCode.textContent = newCode;
                }
                
                // 触发声音效果
                if (window.soundSystem) {
                    window.soundSystem.playSound('notification');
                }
                
                this.showErrorNotification('恢复码已重新生成');
            }
        }
    }
}

// 创建并导出主应用实例
window.mainApp = new MainApplication();

// 为了兼容性，保留一些全局函数
window.showTab = (tabName) => {
    if (window.authSystem) {
        window.authSystem.showTab(tabName);
    }
};

window.showMainTab = function(tabName) {
    if (window.mainApp && window.mainApp.showMainTab) {
        window.mainApp.showMainTab(tabName);
    } else {
        console.warn('主应用未初始化，无法切换标签页');
    }
};

// 全局聊天函数
window.sendMessage = () => {
    if (window.chatSystem && window.chatSystem.isConnected) {
        window.chatSystem.handleSendMessage();
    } else if (window.mainApp) {
        window.mainApp.sendMessage();
    }
};

// 确保DOM加载完成后启动应用
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        if (window.mainApp && !window.mainApp.isInitialized) {
            window.mainApp.initializeApp();
        }
    });
} else {
    // DOM已经加载完成
    if (window.mainApp && !window.mainApp.isInitialized) {
        window.mainApp.initializeApp();
    }
} 