// 视觉效果系统模块
class EffectsSystem {
    constructor() {
        this.isInitialized = false;
        this.animations = new Map();
        this.canvasElements = new Map();
        this.initializeEffects();
    }

    initializeEffects() {
        if (this.isInitialized) return;
        
        this.initializeSystemUptime();
        this.initializeTypewriter();
        this.initializeCRTEffects();
        this.initializeParticles();
        
        this.isInitialized = true;
    }

    // 系统运行时间计数器
    initializeSystemUptime() {
        const systemStartTime = Date.now();
        const uptimeElement = document.querySelector('.uptime-counter');
        
        if (!uptimeElement) return;

        const updateUptime = () => {
            const now = Date.now();
            const uptime = now - systemStartTime;
            
            const hours = Math.floor(uptime / (1000 * 60 * 60));
            const minutes = Math.floor((uptime % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((uptime % (1000 * 60)) / 1000);
            
            uptimeElement.textContent = 
                `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        };

        updateUptime();
        this.animations.set('uptime', setInterval(updateUptime, 1000));
    }

    // 打字机效果
    initializeTypewriter() {
        const typewriterElement = document.querySelector('.typewriter-text');
        if (!typewriterElement) return;

        const texts = [
            '数据库访问终端已激活',
            '正在扫描星际贸易网络...',
            '连接到UEE商业数据中心',
            '系统就绪 - 请进行身份验证'
        ];
        
        let textIndex = 0;
        let charIndex = 0;
        let isDeleting = false;

        const typeChar = () => {
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
                typeSpeed = 2000; // 停留时间
                isDeleting = true;
            } else if (isDeleting && charIndex === 0) {
                isDeleting = false;
                textIndex = (textIndex + 1) % texts.length;
                typeSpeed = 500;
            }

            setTimeout(typeChar, typeSpeed);
        };

        typeChar();
    }

    // CRT扫描线和闪烁效果
    initializeCRTEffects() {
        // 添加随机闪烁效果
        const addScreenFlicker = () => {
            if (Math.random() < 0.002) { // 0.2% 概率闪烁
                document.body.style.filter = 'brightness(1.2) contrast(1.1)';
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 50 + Math.random() * 100);
            }
        };

        this.animations.set('flicker', setInterval(addScreenFlicker, 100));

        // 添加偶尔的色彩偏移
        const addColorShift = () => {
            if (Math.random() < 0.001) { // 0.1% 概率色彩偏移
                const shift = Math.random() * 2 - 1;
                document.body.style.filter = `hue-rotate(${shift * 10}deg)`;
                setTimeout(() => {
                    document.body.style.filter = '';
                }, 200 + Math.random() * 300);
            }
        };

        this.animations.set('colorShift', setInterval(addColorShift, 200));
    }

    // 粒子系统
    initializeParticles() {
        const particleContainer = document.createElement('div');
        particleContainer.className = 'particle-container';
        particleContainer.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            pointer-events: none;
            z-index: 1;
            overflow: hidden;
        `;
        document.body.appendChild(particleContainer);

        // 创建数据流粒子
        const createDataParticle = () => {
            const particle = document.createElement('div');
            particle.className = 'data-particle';
            particle.textContent = Math.random() > 0.5 ? '1' : '0';
            
            const size = 8 + Math.random() * 4;
            const startX = Math.random() * window.innerWidth;
            const duration = 3000 + Math.random() * 4000;
            
            particle.style.cssText = `
                position: absolute;
                top: -20px;
                left: ${startX}px;
                color: rgba(255, 102, 0, ${0.3 + Math.random() * 0.4});
                font-size: ${size}px;
                font-family: 'Share Tech Mono', monospace;
                animation: dataFall ${duration}ms linear forwards;
            `;

            particleContainer.appendChild(particle);

            setTimeout(() => {
                if (particle.parentNode) {
                    particle.parentNode.removeChild(particle);
                }
            }, duration);
        };

        // 添加CSS动画
        if (!document.getElementById('particle-styles')) {
            const style = document.createElement('style');
            style.id = 'particle-styles';
            style.textContent = `
                @keyframes dataFall {
                    to {
                        transform: translateY(${window.innerHeight + 20}px);
                        opacity: 0;
                    }
                }
                
                .data-particle {
                    font-weight: bold;
                    text-shadow: 0 0 5px currentColor;
                }
                
                @keyframes matrixRain {
                    0% {
                        transform: translateY(-100vh);
                        opacity: 1;
                    }
                    100% {
                        transform: translateY(100vh);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        // 定期创建粒子
        this.animations.set('particles', setInterval(createDataParticle, 300));
    }

    // 按钮点击效果
    addButtonClickEffect(button) {
        const ripple = document.createElement('div');
        ripple.className = 'button-ripple';
        
        const rect = button.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        
        ripple.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            width: ${size}px;
            height: ${size}px;
            background: rgba(255, 102, 0, 0.3);
            border-radius: 50%;
            transform: translate(-50%, -50%) scale(0);
            animation: rippleEffect 0.6s ease-out;
            pointer-events: none;
            z-index: 10;
        `;

        // 添加ripple动画
        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes rippleEffect {
                    to {
                        transform: translate(-50%, -50%) scale(2);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }

        button.style.position = 'relative';
        button.style.overflow = 'hidden';
        button.appendChild(ripple);

        setTimeout(() => {
            if (ripple.parentNode) {
                ripple.parentNode.removeChild(ripple);
            }
        }, 600);
    }

    // 文字扫描效果
    addTextScanEffect(element, text, callback) {
        let index = 0;
        const chars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        
        const scanChar = () => {
            if (index <= text.length) {
                const scrambled = text.substring(0, index) + 
                    Array.from({length: text.length - index}, () => 
                        chars[Math.floor(Math.random() * chars.length)]
                    ).join('');
                
                element.textContent = scrambled;
                index++;
                setTimeout(scanChar, 50);
            } else if (callback) {
                callback();
            }
        };

        scanChar();
    }

    // 全息图效果
    addHologramEffect(element) {
        element.style.cssText += `
            position: relative;
            animation: hologramFlicker 2s infinite;
        `;

        // 添加全息图样式
        if (!document.getElementById('hologram-styles')) {
            const style = document.createElement('style');
            style.id = 'hologram-styles';
            style.textContent = `
                @keyframes hologramFlicker {
                    0%, 100% { 
                        opacity: 1;
                        text-shadow: 0 0 10px #ff6600;
                    }
                    50% { 
                        opacity: 0.8;
                        text-shadow: 0 0 20px #ff6600, 0 0 30px #ff6600;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    }

    // 数据加载动画
    showDataLoading(container, duration = 2000) {
        const loader = document.createElement('div');
        loader.className = 'data-loader';
        loader.innerHTML = `
            <div class="loading-text">正在加载数据</div>
            <div class="loading-bar">
                <div class="loading-progress"></div>
            </div>
            <div class="loading-info">
                <span class="loading-percentage">0%</span>
                <span class="loading-status">连接中...</span>
            </div>
        `;
        
        loader.style.cssText = `
            position: absolute;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            text-align: center;
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #ff6600;
            padding: 20px;
            min-width: 300px;
            z-index: 1000;
        `;

        // 添加加载动画样式
        if (!document.getElementById('loading-styles')) {
            const style = document.createElement('style');
            style.id = 'loading-styles';
            style.textContent = `
                .loading-bar {
                    width: 100%;
                    height: 4px;
                    background: #333;
                    margin: 10px 0;
                    position: relative;
                    overflow: hidden;
                }
                
                .loading-progress {
                    height: 100%;
                    background: linear-gradient(90deg, #ff6600, #ff9900);
                    width: 0%;
                    transition: width 0.3s ease;
                    box-shadow: 0 0 10px #ff6600;
                }
                
                .loading-info {
                    display: flex;
                    justify-content: space-between;
                    font-size: 10px;
                    margin-top: 10px;
                }
            `;
            document.head.appendChild(style);
        }

        container.appendChild(loader);

        // 动画进度
        let progress = 0;
        const progressInterval = setInterval(() => {
            progress += Math.random() * 15;
            if (progress > 100) progress = 100;
            
            const progressBar = loader.querySelector('.loading-progress');
            const percentage = loader.querySelector('.loading-percentage');
            const status = loader.querySelector('.loading-status');
            
            if (progressBar) progressBar.style.width = progress + '%';
            if (percentage) percentage.textContent = Math.round(progress) + '%';
            
            if (status) {
                if (progress < 30) status.textContent = '连接中...';
                else if (progress < 60) status.textContent = '验证权限...';
                else if (progress < 90) status.textContent = '下载数据...';
                else status.textContent = '完成';
            }
            
            if (progress >= 100) {
                clearInterval(progressInterval);
                setTimeout(() => {
                    if (loader.parentNode) {
                        loader.parentNode.removeChild(loader);
                    }
                }, 500);
            }
        }, duration / 20);

        return loader;
    }

    // 停止所有动画
    stopAllAnimations() {
        this.animations.forEach((animation, key) => {
            if (typeof animation === 'number') {
                clearInterval(animation);
            }
        });
        this.animations.clear();
    }

    // 重启动画
    restartAnimations() {
        this.stopAllAnimations();
        this.isInitialized = false;
        setTimeout(() => this.initializeEffects(), 100);
    }

    // 获取随机故障效果
    getRandomGlitchText(text) {
        const glitchChars = '!@#$%^&*()_+-=[]{}|;:,.<>?';
        let result = '';
        
        for (let i = 0; i < text.length; i++) {
            if (Math.random() < 0.1) {
                result += glitchChars[Math.floor(Math.random() * glitchChars.length)];
            } else {
                result += text[i];
            }
        }
        
        return result;
    }
}

// 导出效果系统
window.effectsSystem = new EffectsSystem(); 