// 数据管理系统 - Star Citizen 贸易终端
class DataManager {
    constructor() {
        this.storagePrefix = 'sc_terminal_';
        this.version = '1.0.0';
        this.encryptionKey = this.generateEncryptionKey();
        this.compressionEnabled = true;
        this.autoBackupInterval = 5 * 60 * 1000; // 5分钟
        this.maxBackups = 10;
        
        this.dataSchemas = {
            user: {
                version: '1.0',
                fields: ['username', 'email', 'preferences', 'createdAt', 'lastLogin']
            },
            trading: {
                version: '1.0',
                fields: ['portfolio', 'transactions', 'watchlist', 'alerts']
            },
            analytics: {
                version: '1.0',
                fields: ['predictions', 'models', 'riskProfiles', 'optimizations']
            },
            system: {
                version: '1.0',
                fields: ['settings', 'theme', 'soundPrefs', 'tutorial']
            }
        };
        
        this.init();
    }

    init() {
        this.checkStorageSupport();
        this.performMigrations();
        this.startAutoBackup();
        this.bindEvents();
        this.cleanupOldData();
        
        console.log('💾 数据管理系统已初始化');
    }

    // 检查存储支持
    checkStorageSupport() {
        this.supports = {
            localStorage: this.testStorage('localStorage'),
            sessionStorage: this.testStorage('sessionStorage'),
            indexedDB: 'indexedDB' in window,
            webSQL: 'openDatabase' in window
        };
        
        console.log('💾 存储支持:', this.supports);
        
        if (!this.supports.localStorage) {
            console.warn('⚠️ LocalStorage 不可用，数据将无法持久化');
        }
    }

    // 测试存储
    testStorage(type) {
        try {
            const storage = window[type];
            const testKey = '__storage_test__';
            storage.setItem(testKey, 'test');
            storage.removeItem(testKey);
            return true;
        } catch (e) {
            return false;
        }
    }

    // 生成加密密钥
    generateEncryptionKey() {
        let key = localStorage.getItem(this.storagePrefix + 'encryption_key');
        if (!key) {
            key = this.randomString(32);
            localStorage.setItem(this.storagePrefix + 'encryption_key', key);
        }
        return key;
    }

    // 生成随机字符串
    randomString(length) {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let result = '';
        for (let i = 0; i < length; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    // 简单加密（基于XOR）
    encrypt(data, key = this.encryptionKey) {
        const dataStr = JSON.stringify(data);
        let encrypted = '';
        
        for (let i = 0; i < dataStr.length; i++) {
            const keyChar = key[i % key.length];
            const dataChar = dataStr[i];
            encrypted += String.fromCharCode(dataChar.charCodeAt(0) ^ keyChar.charCodeAt(0));
        }
        
        return btoa(encrypted);
    }

    // 简单解密
    decrypt(encryptedData, key = this.encryptionKey) {
        try {
            const encrypted = atob(encryptedData);
            let decrypted = '';
            
            for (let i = 0; i < encrypted.length; i++) {
                const keyChar = key[i % key.length];
                const encryptedChar = encrypted[i];
                decrypted += String.fromCharCode(encryptedChar.charCodeAt(0) ^ keyChar.charCodeAt(0));
            }
            
            return JSON.parse(decrypted);
        } catch (error) {
            console.error('解密失败:', error);
            return null;
        }
    }

    // 压缩数据（简单的RLE压缩）
    compress(data) {
        if (!this.compressionEnabled) return data;
        
        const dataStr = JSON.stringify(data);
        let compressed = '';
        
        for (let i = 0; i < dataStr.length; i++) {
            let char = dataStr[i];
            let count = 1;
            
            while (i + 1 < dataStr.length && dataStr[i + 1] === char) {
                count++;
                i++;
            }
            
            compressed += count > 1 ? `${count}${char}` : char;
        }
        
        return compressed.length < dataStr.length ? compressed : dataStr;
    }

    // 解压缩数据
    decompress(compressedData) {
        if (!this.compressionEnabled) return compressedData;
        
        try {
            let decompressed = '';
            let i = 0;
            
            while (i < compressedData.length) {
                if (compressedData[i].match(/\d/)) {
                    let count = '';
                    while (i < compressedData.length && compressedData[i].match(/\d/)) {
                        count += compressedData[i];
                        i++;
                    }
                    
                    if (i < compressedData.length) {
                        decompressed += compressedData[i].repeat(parseInt(count));
                        i++;
                    }
                } else {
                    decompressed += compressedData[i];
                    i++;
                }
            }
            
            return decompressed;
        } catch (error) {
            return compressedData;
        }
    }

    // 保存数据
    save(category, key, data, options = {}) {
        if (!this.supports.localStorage) {
            console.warn('⚠️ 无法保存数据，LocalStorage 不可用');
            return false;
        }
        
        try {
            const fullKey = this.storagePrefix + category + '_' + key;
            const metadata = {
                version: this.version,
                category: category,
                key: key,
                timestamp: Date.now(),
                encrypted: options.encrypt !== false,
                compressed: options.compress !== false
            };
            
            let processedData = data;
            
            // 压缩
            if (options.compress !== false) {
                processedData = this.compress(processedData);
            }
            
            // 加密
            if (options.encrypt !== false) {
                processedData = this.encrypt(processedData);
            }
            
            const dataPackage = {
                metadata: metadata,
                data: processedData
            };
            
            localStorage.setItem(fullKey, JSON.stringify(dataPackage));
            
            // 更新索引
            this.updateIndex(category, key, metadata);
            
            console.log(`💾 已保存数据: ${category}/${key}`);
            return true;
            
        } catch (error) {
            console.error('保存数据失败:', error);
            return false;
        }
    }

    // 加载数据
    load(category, key, defaultValue = null) {
        if (!this.supports.localStorage) {
            return defaultValue;
        }
        
        try {
            const fullKey = this.storagePrefix + category + '_' + key;
            const stored = localStorage.getItem(fullKey);
            
            if (!stored) {
                return defaultValue;
            }
            
            const dataPackage = JSON.parse(stored);
            let data = dataPackage.data;
            
            // 解密
            if (dataPackage.metadata.encrypted) {
                data = this.decrypt(data);
                if (data === null) {
                    console.warn(`⚠️ 解密失败: ${category}/${key}`);
                    return defaultValue;
                }
            }
            
            // 解压缩
            if (dataPackage.metadata.compressed && typeof data === 'string') {
                data = this.decompress(data);
                try {
                    data = JSON.parse(data);
                } catch (e) {
                    // 如果解析失败，保持原始数据
                }
            }
            
            console.log(`💾 已加载数据: ${category}/${key}`);
            return data;
            
        } catch (error) {
            console.error('加载数据失败:', error);
            return defaultValue;
        }
    }

    // 删除数据
    remove(category, key) {
        if (!this.supports.localStorage) {
            return false;
        }
        
        try {
            const fullKey = this.storagePrefix + category + '_' + key;
            localStorage.removeItem(fullKey);
            
            // 更新索引
            this.removeFromIndex(category, key);
            
            console.log(`💾 已删除数据: ${category}/${key}`);
            return true;
            
        } catch (error) {
            console.error('删除数据失败:', error);
            return false;
        }
    }

    // 更新索引
    updateIndex(category, key, metadata) {
        const indexKey = this.storagePrefix + 'index';
        let index = {};
        
        try {
            const stored = localStorage.getItem(indexKey);
            if (stored) {
                index = JSON.parse(stored);
            }
        } catch (error) {
            console.warn('索引损坏，重新创建');
        }
        
        if (!index[category]) {
            index[category] = {};
        }
        
        index[category][key] = metadata;
        
        try {
            localStorage.setItem(indexKey, JSON.stringify(index));
        } catch (error) {
            console.error('更新索引失败:', error);
        }
    }

    // 从索引中移除
    removeFromIndex(category, key) {
        const indexKey = this.storagePrefix + 'index';
        
        try {
            const stored = localStorage.getItem(indexKey);
            if (stored) {
                const index = JSON.parse(stored);
                if (index[category] && index[category][key]) {
                    delete index[category][key];
                    localStorage.setItem(indexKey, JSON.stringify(index));
                }
            }
        } catch (error) {
            console.error('从索引移除失败:', error);
        }
    }

    // 获取索引
    getIndex() {
        const indexKey = this.storagePrefix + 'index';
        
        try {
            const stored = localStorage.getItem(indexKey);
            return stored ? JSON.parse(stored) : {};
        } catch (error) {
            console.error('获取索引失败:', error);
            return {};
        }
    }

    // 列出分类中的所有数据
    list(category) {
        const index = this.getIndex();
        return index[category] ? Object.keys(index[category]) : [];
    }

    // 清空分类
    clearCategory(category) {
        const keys = this.list(category);
        keys.forEach(key => this.remove(category, key));
        console.log(`💾 已清空分类: ${category}`);
    }

    // 清空所有数据
    clearAll() {
        if (!this.supports.localStorage) return;
        
        const keys = Object.keys(localStorage);
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                localStorage.removeItem(key);
            }
        });
        
        console.log('💾 已清空所有数据');
    }

    // 创建备份
    createBackup() {
        try {
            const index = this.getIndex();
            const backup = {
                version: this.version,
                timestamp: Date.now(),
                data: {}
            };
            
            Object.keys(index).forEach(category => {
                backup.data[category] = {};
                Object.keys(index[category]).forEach(key => {
                    const data = this.load(category, key);
                    if (data !== null) {
                        backup.data[category][key] = data;
                    }
                });
            });
            
            const backupKey = this.storagePrefix + 'backup_' + Date.now();
            localStorage.setItem(backupKey, JSON.stringify(backup));
            
            // 保持最大备份数量限制
            this.cleanupBackups();
            
            console.log('💾 备份已创建');
            return backupKey;
            
        } catch (error) {
            console.error('创建备份失败:', error);
            return null;
        }
    }

    // 恢复备份
    restoreBackup(backupKey) {
        try {
            const backupData = localStorage.getItem(backupKey);
            if (!backupData) {
                console.error('备份不存在');
                return false;
            }
            
            const backup = JSON.parse(backupData);
            
            // 清空现有数据
            this.clearAll();
            
            // 恢复数据
            Object.keys(backup.data).forEach(category => {
                Object.keys(backup.data[category]).forEach(key => {
                    this.save(category, key, backup.data[category][key]);
                });
            });
            
            console.log('💾 备份已恢复');
            return true;
            
        } catch (error) {
            console.error('恢复备份失败:', error);
            return false;
        }
    }

    // 获取备份列表
    getBackups() {
        const keys = Object.keys(localStorage);
        const backups = [];
        
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix + 'backup_')) {
                try {
                    const backup = JSON.parse(localStorage.getItem(key));
                    backups.push({
                        key: key,
                        timestamp: backup.timestamp,
                        date: new Date(backup.timestamp).toLocaleString('zh-CN'),
                        version: backup.version
                    });
                } catch (error) {
                    console.warn('备份数据损坏:', key);
                }
            }
        });
        
        return backups.sort((a, b) => b.timestamp - a.timestamp);
    }

    // 清理旧备份
    cleanupBackups() {
        const backups = this.getBackups();
        if (backups.length > this.maxBackups) {
            const toDelete = backups.slice(this.maxBackups);
            toDelete.forEach(backup => {
                localStorage.removeItem(backup.key);
            });
            console.log(`💾 清理了 ${toDelete.length} 个旧备份`);
        }
    }

    // 启动自动备份
    startAutoBackup() {
        setInterval(() => {
            this.createBackup();
        }, this.autoBackupInterval);
        
        console.log('💾 自动备份已启动');
    }

    // 数据迁移
    performMigrations() {
        const currentVersion = this.load('system', 'version', '0.0.0');
        
        if (currentVersion !== this.version) {
            console.log(`💾 执行数据迁移: ${currentVersion} -> ${this.version}`);
            
            // 执行迁移逻辑
            this.migrate(currentVersion, this.version);
            
            // 更新版本
            this.save('system', 'version', this.version);
        }
    }

    // 迁移逻辑
    migrate(fromVersion, toVersion) {
        // 这里可以添加具体的迁移逻辑
        console.log('💾 数据迁移完成');
    }

    // 清理旧数据
    cleanupOldData() {
        const index = this.getIndex();
        const now = Date.now();
        const maxAge = 30 * 24 * 60 * 60 * 1000; // 30天
        
        Object.keys(index).forEach(category => {
            Object.keys(index[category]).forEach(key => {
                const metadata = index[category][key];
                if (now - metadata.timestamp > maxAge) {
                    console.log(`💾 清理过期数据: ${category}/${key}`);
                    this.remove(category, key);
                }
            });
        });
    }

    // 导出数据
    exportData() {
        const data = {
            version: this.version,
            timestamp: Date.now(),
            data: {}
        };
        
        const index = this.getIndex();
        Object.keys(index).forEach(category => {
            data.data[category] = {};
            Object.keys(index[category]).forEach(key => {
                const itemData = this.load(category, key);
                if (itemData !== null) {
                    data.data[category][key] = itemData;
                }
            });
        });
        
        const blob = new Blob([JSON.stringify(data, null, 2)], {
            type: 'application/json'
        });
        
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `sc-terminal-data-${Date.now()}.json`;
        a.click();
        
        URL.revokeObjectURL(url);
        console.log('💾 数据已导出');
    }

    // 导入数据
    importData(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                try {
                    const data = JSON.parse(e.target.result);
                    
                    // 验证数据格式
                    if (!data.version || !data.data) {
                        throw new Error('无效的数据格式');
                    }
                    
                    // 导入数据
                    Object.keys(data.data).forEach(category => {
                        Object.keys(data.data[category]).forEach(key => {
                            this.save(category, key, data.data[category][key]);
                        });
                    });
                    
                    console.log('💾 数据已导入');
                    resolve(true);
                    
                } catch (error) {
                    console.error('导入数据失败:', error);
                    reject(error);
                }
            };
            
            reader.onerror = () => {
                reject(new Error('文件读取失败'));
            };
            
            reader.readAsText(file);
        });
    }

    // 获取存储使用情况
    getStorageUsage() {
        if (!this.supports.localStorage) {
            return { used: 0, available: 0, total: 0 };
        }
        
        let used = 0;
        const keys = Object.keys(localStorage);
        
        keys.forEach(key => {
            if (key.startsWith(this.storagePrefix)) {
                used += localStorage.getItem(key).length;
            }
        });
        
        // 估算总可用空间（通常是5-10MB）
        const total = 5 * 1024 * 1024; // 5MB
        
        return {
            used: used,
            available: total - used,
            total: total,
            usedPercent: (used / total * 100).toFixed(1)
        };
    }

    // 绑定事件
    bindEvents() {
        // 页面卸载前自动保存
        window.addEventListener('beforeunload', () => {
            this.createBackup();
        });
        
        // 存储事件监听
        window.addEventListener('storage', (e) => {
            if (e.key && e.key.startsWith(this.storagePrefix)) {
                console.log('💾 检测到外部存储变化:', e.key);
            }
        });
    }

    // 获取状态
    getStatus() {
        return {
            version: this.version,
            supports: this.supports,
            storage: this.getStorageUsage(),
            backups: this.getBackups().length,
            categories: Object.keys(this.getIndex())
        };
    }
}

// 全局实例
window.dataManager = new DataManager();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = DataManager;
} 