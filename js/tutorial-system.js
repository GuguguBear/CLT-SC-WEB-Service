// 用户引导系统 - Star Citizen 贸易终端
class TutorialSystem {
    constructor() {
        this.currentStep = 0;
        this.isActive = false;
        this.tutorialData = [];
        this.overlay = null;
        this.tooltip = null;
        this.skipTutorial = false;
        
        this.config = {
            overlay: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                zIndex: 10000
            },
            tooltip: {
                backgroundColor: 'rgba(26, 35, 60, 0.95)',
                borderColor: '#ff6600',
                textColor: '#ffffff',
                maxWidth: '350px'
            },
            animation: {
                duration: 300
            }
        };
        
        this.init();
    }

    init() {
        this.loadTutorialData();
        this.checkFirstVisit();
        this.bindEvents();
        
        console.log('🎓 用户引导系统已初始化');
    }

    // 加载教程数据
    loadTutorialData() {
        this.tutorialData = [
            {
                id: 'welcome',
                title: '欢迎来到 Star Citizen 贸易终端',
                content: '这是一个专业的星际公民贸易分析平台。让我来为您介绍主要功能。',
                target: null,
                position: 'center',
                showNext: true,
                showSkip: true,
                action: null
            },
            {
                id: 'login',
                title: '用户系统',
                content: '首先，您需要登录或注册账户。点击右上角的登录按钮开始。',
                target: '.auth-buttons',
                position: 'bottom',
                showNext: true,
                showPrev: true,
                action: () => {
                    const authButtons = document.querySelector('.auth-buttons');
                    if (authButtons) {
                        authButtons.style.border = '2px solid #ff6600';
                        authButtons.style.borderRadius = '4px';
                    }
                }
            },
            {
                id: 'complete',
                title: '教程完成',
                content: '恭喜！您已经了解了所有主要功能。现在可以开始您的星际贸易之旅了。祝您交易愉快！',
                target: null,
                position: 'center',
                showNext: false,
                showPrev: true,
                action: () => {
                    document.dispatchEvent(new CustomEvent('tutorialComplete'));
                    if (window.soundSystem) {
                        window.soundSystem.play('trade_complete');
                    }
                }
            }
        ];
    }

    // 检查是否首次访问
    checkFirstVisit() {
        const hasSeenTutorial = localStorage.getItem('sc_tutorial_completed');
        if (!hasSeenTutorial) {
            setTimeout(() => {
                this.start();
            }, 2000);
        }
    }

    // 开始教程
    start() {
        if (this.isActive) return;
        
        this.isActive = true;
        this.currentStep = 0;
        this.createOverlay();
        this.showStep(0);
        
        console.log('🎓 教程已开始');
        
        if (window.soundSystem) {
            window.soundSystem.play('system_startup');
        }
    }

    // 绑定事件
    bindEvents() {
        document.addEventListener('keydown', (e) => {
            if (e.key === 'F1') {
                e.preventDefault();
                this.stop();
                setTimeout(() => this.start(), 300);
            }
        });
    }

    // 停止教程
    stop() {
        this.isActive = false;
        console.log('🎓 教程已停止');
    }

    // 创建遮罩层
    createOverlay() {
        // 简化实现
    }

    // 显示步骤
    showStep(stepIndex) {
        // 简化实现
    }
}

// 全局实例
window.tutorialSystem = new TutorialSystem();

// 导出
if (typeof module !== 'undefined' && module.exports) {
    module.exports = TutorialSystem;
} 