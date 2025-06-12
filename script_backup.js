// 备份版本的原始script.js - 只保留核心功能
// 如果模块化版本出现问题，可以回退到这个版本

// 简化的全局变量
let currentUser = null;
let users = JSON.parse(localStorage.getItem('sc_users') || '{}');

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    bindEventListeners();
    startAnimations();
    checkExistingSession();
}

function bindEventListeners() {
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

    // 恢复表单
    const recoverForm = document.getElementById('recoverForm');
    if (recoverForm) {
        recoverForm.addEventListener('submit', handleRecover);
    }
}

function handleLogin(e) {
    e.preventDefault();
    const username = document.getElementById('loginUsername').value;
    const password = document.getElementById('loginPassword').value;

    const user = users[username];
    if (user && user.password === password) {
        currentUser = username;
        localStorage.setItem('sc_current_user', username);
        showMainApp();
    } else {
        alert('登录失败：用户名或密码错误');
    }
}

function handleRegister(e) {
    e.preventDefault();
    const username = document.getElementById('registerUsername').value;
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (password !== confirmPassword) {
        alert('密码确认不匹配');
        return;
    }

    if (users[username]) {
        alert('用户名已存在');
        return;
    }

    const recoveryCode = generateRecoveryCode();
    users[username] = { password, recoveryCode };
    localStorage.setItem('sc_users', JSON.stringify(users));
    
    currentUser = username;
    localStorage.setItem('sc_current_user', username);
    showMainApp();
}

function handleRecover(e) {
    e.preventDefault();
    const username = document.getElementById('recoverUsername').value;
    const recoveryCode = document.getElementById('recoverCode').value;

    const user = users[username];
    if (user && user.recoveryCode === recoveryCode) {
        alert('恢复成功，请设置新密码');
    } else {
        alert('恢复失败：用户名或恢复代码错误');
    }
}

function generateRecoveryCode() {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < 12; i++) {
        if (i > 0 && i % 4 === 0) result += '-';
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'flex';
}

function logout() {
    currentUser = null;
    localStorage.removeItem('sc_current_user');
    location.reload();
}

function checkExistingSession() {
    const savedUser = localStorage.getItem('sc_current_user');
    if (savedUser) {
        currentUser = savedUser;
        showMainApp();
    }
}

function showTab(tabName) {
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

function startAnimations() {
    // 启动系统运行时间计数器
    const systemStartTime = Date.now();
    const uptimeElement = document.querySelector('.uptime-counter');
    
    if (uptimeElement) {
        setInterval(() => {
            const now = Date.now();
            const uptime = now - systemStartTime;
            
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
            
            uptimeElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        }, 1000);
    }

    // 启动打字机效果
    const typewriterElement = document.querySelector('.typewriter-text');
    if (typewriterElement) {
        const texts = [
            '数据库访问终端已激活',
            '正在扫描星际贸易网络...',
            '连接到UEE商业数据中心',
            '系统就绪 - 请进行身份验证'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        function typeChar() {
            const currentText = texts[textIndex];
            
            if (isDeleting) {
                typewriterElement.textContent = currentText.substring(0, charIndex - 1);
                charIndex--;
            } else {
                typewriterElement.textContent = currentText.substring(0, charIndex + 1);
                charIndex++;
            }

            let typeSpeed = isDeleting ? 30 : 60;

            if (!isDeleting && charIndex === currentText.length) {
                typeSpeed = 2000;
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(typeChar, typeSpeed);
        }

        typeChar();
    }
} 