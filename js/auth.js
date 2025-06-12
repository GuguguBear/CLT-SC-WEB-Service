// 认证系统模块
class AuthSystem {
    constructor() {
        this.users = JSON.parse(localStorage.getItem('sc_users') || '{}');
        this.currentUser = null;
        this.initializeAuth();
        this.checkExistingSession(); // 添加会话检查
    }

    initializeAuth() {
        this.initLoginForms();
        this.bindAuthEvents();
    }

    initLoginForms() {
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const recoverForm = document.getElementById('recoverForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
        if (recoverForm) {
            recoverForm.addEventListener('submit', (e) => this.handleRecover(e));
        }
    }

    bindAuthEvents() {
        // 绑定标签页切换
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                // 安全获取tab名称
const tabBtn = e.target.closest('.tab-btn');
let tabName = 'login'; // 默认值
if (tabBtn && tabBtn.onclick) {
    try {
        const onclickStr = tabBtn.onclick.toString();
        const match = onclickStr.match(/showTab\('(\w+)'\)/);
        if (match && match[1]) {
            tabName = match[1];
        }
    } catch (error) {
        console.warn('无法解析tab名称，使用默认值:', error);
    }
}
                this.showTab(tabName);
            });
        });
    }

    showTab(tabName) {
        // 隐藏所有标签内容
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active');
        });
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.classList.remove('active');
        });

        // 显示指定标签
        const targetTab = document.getElementById(tabName + 'Tab');
        const targetBtn = document.querySelector(`[onclick="showTab('${tabName}')"]`);
        
        if (targetTab) targetTab.classList.add('active');
        if (targetBtn) targetBtn.classList.add('active');
    }

    async handleLogin(e) {
        e.preventDefault();
        const username = document.getElementById('loginUsername').value;
        const password = document.getElementById('loginPassword').value;
        const button = e.target.querySelector('.terminal-btn');

        this.showProcessing(button);

        try {
            await this.delay(1500);
            
            const user = this.getUser(username);
            if (user && user.password === password) {
                this.setCurrentUser(username);
                this.showMainApp();
                // 触发登录成功事件（用于声音系统）
                document.dispatchEvent(new CustomEvent('loginSuccess'));
                
                // 触发用户登录事件（用于聊天系统）
                document.dispatchEvent(new CustomEvent('userLoggedIn', {
                    detail: { username: username }
                }));
            } else {
                this.showAuthError('认证失败：用户名或密码错误');
                // 触发登录错误事件（用于声音系统）
                document.dispatchEvent(new CustomEvent('loginError'));
            }
        } finally {
            this.hideProcessing(button);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        const username = document.getElementById('registerUsername').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        const button = e.target.querySelector('.terminal-btn');

        if (password !== confirmPassword) {
            this.showAuthError('密码确认不匹配');
            return;
        }

        if (this.getUser(username)) {
            this.showAuthError('用户名已存在');
            return;
        }

        this.showProcessing(button);

        try {
            await this.delay(2000);
            
            const recoveryCode = this.generateRecoveryCode();
            this.saveUser(username, password, recoveryCode);
            this.showRecoveryCode(recoveryCode);
            
            setTimeout(() => {
                            this.setCurrentUser(username);
            this.showMainApp();
            
            // 触发登录成功事件（用于声音系统）
            document.dispatchEvent(new CustomEvent('loginSuccess'));
            
            // 触发用户登录事件（用于聊天系统）
            document.dispatchEvent(new CustomEvent('userLoggedIn', {
                detail: { username: username }
            }));
            }, 3000);
        } finally {
            this.hideProcessing(button);
        }
    }

    async handleRecover(e) {
        e.preventDefault();
        const username = document.getElementById('recoverUsername').value;
        const recoveryCode = document.getElementById('recoverCode').value;
        const button = e.target.querySelector('.terminal-btn');

        this.showProcessing(button);

        try {
            await this.delay(1500);
            
            const user = this.getUser(username);
            if (user && user.recoveryCode === recoveryCode) {
                // 显示密码重置选项
                this.showPasswordReset(username);
            } else {
                this.showAuthError('恢复失败：用户名或恢复代码错误');
            }
        } finally {
            this.hideProcessing(button);
        }
    }

    showProcessing(button) {
        const btnText = button.querySelector('.btn-text');
        const processing = button.querySelector('.btn-processing');
        btnText.style.display = 'none';
        processing.style.display = 'block';
        button.disabled = true;
    }

    hideProcessing(button) {
        const btnText = button.querySelector('.btn-text');
        const processing = button.querySelector('.btn-processing');
        btnText.style.display = 'block';
        processing.style.display = 'none';
        button.disabled = false;
    }

    showAuthError(message) {
        // 显示错误信息的方法
        const errorDiv = document.createElement('div');
        errorDiv.className = 'auth-error';
        errorDiv.textContent = message;
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #ff3300;
            color: #000;
            padding: 10px 20px;
            border: 2px solid #ff6600;
            font-family: 'Share Tech Mono', monospace;
            z-index: 10000;
        `;
        
        document.body.appendChild(errorDiv);
        setTimeout(() => errorDiv.remove(), 3000);
    }

    generateRecoveryCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) result += '-';
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }

    showRecoveryCode(code) {
        const codeDisplay = document.querySelector('#recoveryCode .code-display');
        if (codeDisplay) {
            codeDisplay.innerHTML = `
                <div class="code-text">${code}</div>
                <button onclick="authSystem.copyToClipboard('${code}')" class="copy-btn">
                    [复制到剪贴板]
                </button>
            `;
            document.getElementById('recoveryCode').style.display = 'block';
        }
    }

    showPasswordReset(username) {
        // 实现密码重置界面
        console.log('显示密码重置界面：', username);
    }

    copyToClipboard(text) {
        if (navigator.clipboard) {
            navigator.clipboard.writeText(text).then(() => {
                this.showAuthError('恢复代码已复制到剪贴板');
            });
        } else {
            this.fallbackCopyToClipboard(text);
        }
    }

    fallbackCopyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            this.showAuthError('恢复代码已复制到剪贴板');
        } catch (err) {
            console.error('复制失败:', err);
        }
        document.body.removeChild(textArea);
    }

    saveUser(username, password, recoveryCode) {
        this.users[username] = { password, recoveryCode };
        localStorage.setItem('sc_users', JSON.stringify(this.users));
    }

    getUser(username) {
        return this.users[username];
    }

    updateUser(username, updates) {
        if (this.users[username]) {
            this.users[username] = { ...this.users[username], ...updates };
            localStorage.setItem('sc_users', JSON.stringify(this.users));
        }
    }

    setCurrentUser(username) {
        this.currentUser = username;
        localStorage.setItem('sc_current_user', username);
    }

    logout() {
        // 触发用户登出事件（用于聊天系统）
        document.dispatchEvent(new CustomEvent('userLoggedOut'));
        
        this.currentUser = null;
        localStorage.removeItem('sc_current_user');
        location.reload();
    }

    showMainApp() {
        document.getElementById('loginScreen').style.display = 'none';
        document.getElementById('mainApp').style.display = 'flex';
        
        // 更新用户显示
        const usernameDisplay = document.getElementById('currentUsername');
        if (usernameDisplay) {
            usernameDisplay.textContent = this.currentUser;
        }
        
        // 初始化主应用
        if (window.mainApp) {
            window.mainApp.currentUser = this.currentUser;
            window.mainApp.initialize();
        }
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // 检查现有会话
    checkExistingSession() {
        const savedUser = localStorage.getItem('sc_current_user');
        if (savedUser && this.getUser(savedUser)) {
            console.log('🔄 检测到现有会话，自动登录:', savedUser);
            this.currentUser = savedUser;
            
            // 延迟显示主应用，确保DOM已加载
            setTimeout(() => {
                this.showMainApp();
                
                // 触发用户登录事件
                document.dispatchEvent(new CustomEvent('userLoggedIn', {
                    detail: { username: savedUser }
                }));
                
                console.log('✅ 会话恢复成功');
            }, 100);
        } else {
            console.log('📝 未检测到有效会话，显示登录界面');
        }
    }
}

// 导出认证系统
window.authSystem = new AuthSystem(); 