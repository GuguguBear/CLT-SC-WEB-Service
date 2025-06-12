// 修复缺失的JavaScript函数
(function() {
    'use strict';
    
    console.log('🔧 修复缺失的JavaScript函数...');
    
    // 修复缺失的 copyRecoveryCode 函数
    window.copyRecoveryCode = function() {
        const recoveryCodeElement = document.getElementById('currentRecoveryCode');
        if (recoveryCodeElement) {
            const recoveryCode = recoveryCodeElement.textContent;
            
            // 复制到剪贴板
            navigator.clipboard.writeText(recoveryCode).then(() => {
                console.log('📋 恢复代码已复制到剪贴板');
                
                // 显示复制成功提示
                showNotification('恢复代码已复制到剪贴板', 'success');
            }).catch(err => {
                console.error('复制失败:', err);
                
                // 备用方法：选择文本
                if (document.selection) {
                    const range = document.body.createTextRange();
                    range.moveToElementText(recoveryCodeElement);
                    range.select();
                } else if (window.getSelection) {
                    const range = document.createRange();
                    range.selectNode(recoveryCodeElement);
                    window.getSelection().removeAllRanges();
                    window.getSelection().addRange(range);
                }
                
                showNotification('请手动复制选中的恢复代码', 'info');
            });
        }
    };
    
    // 修复缺失的 regenerateRecoveryCode 函数
    window.regenerateRecoveryCode = function() {
        const currentUser = localStorage.getItem('currentUsername') || localStorage.getItem('sc_current_user');
        
        if (!currentUser) {
            showNotification('请先登录', 'error');
            return;
        }
        
        // 生成新的恢复代码
        const newCode = generateRandomCode();
        
        // 更新用户数据
        const userData = JSON.parse(localStorage.getItem('sc_users') || '{}');
        if (userData[currentUser]) {
            userData[currentUser].recoveryCode = newCode;
            localStorage.setItem('sc_users', JSON.stringify(userData));
            
            // 更新显示
            const currentRecoveryCodeElement = document.getElementById('currentRecoveryCode');
            if (currentRecoveryCodeElement) {
                currentRecoveryCodeElement.textContent = newCode;
            }
            
            // 显示新代码模态框
            showNewRecoveryCode(newCode);
            
            console.log('🔑 已生成新的恢复代码');
            showNotification('新的恢复代码已生成', 'success');
        } else {
            showNotification('用户数据不存在', 'error');
        }
    };
    
    // 生成随机恢复代码
    function generateRandomCode() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 12; i++) {
            if (i > 0 && i % 4 === 0) result += '-';
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        return result;
    }
    
    // 显示新恢复代码模态框
    function showNewRecoveryCode(code) {
        const modal = document.getElementById('newCodeModal');
        const codeElement = document.getElementById('newRecoveryCode');
        
        if (modal && codeElement) {
            codeElement.textContent = code;
            modal.style.display = 'flex';
            
            // 自动复制到剪贴板
            navigator.clipboard.writeText(code).then(() => {
                const copyIndicator = modal.querySelector('.copy-indicator');
                if (copyIndicator) {
                    copyIndicator.style.display = 'block';
                    setTimeout(() => {
                        copyIndicator.style.display = 'none';
                    }, 2000);
                }
            });
            
            // 10秒后自动关闭
            setTimeout(() => {
                closeNewCodeModal();
            }, 10000);
        }
    }
    
    // 关闭新代码模态框
    window.closeNewCodeModal = function() {
        const modal = document.getElementById('newCodeModal');
        if (modal) {
            modal.style.display = 'none';
        }
    };
    
    // 通用通知函数
    function showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        notification.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: ${type === 'success' ? '#4CAF50' : type === 'error' ? '#F44336' : '#2196F3'};
            color: white;
            padding: 12px 20px;
            border-radius: 4px;
            z-index: 10003;
            font-family: 'Share Tech Mono', monospace;
            font-size: 12px;
            animation: slideInRight 0.3s ease-out;
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.style.animation = 'slideInRight 0.3s ease-in reverse';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
    
    console.log('✅ JavaScript函数修复完成');
    
})(); 