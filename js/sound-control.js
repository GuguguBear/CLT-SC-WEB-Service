// 音效控制面板 - Drake 风格
class SoundControl {
    constructor() {
        this.soundSystem = window.soundSystem;
        this.controlPanel = null;
        this.isVisible = false;
        
        this.init();
    }

    init() {
        this.createControlPanel();
        this.bindEvents();
        console.log('🎛️ 音效控制面板已初始化');
    }

    createControlPanel() {
        this.controlPanel = document.createElement('div');
        this.controlPanel.className = 'sound-control-panel';
        this.controlPanel.innerHTML = `
            <div class="sound-control-overlay"></div>
            <div class="sound-control-container">
                <!-- 面板头部 -->
                <div class="control-header">
                    <div class="header-left">
                        <div class="control-logo">
                            <div class="logo-icon">🎵</div>
                            <div class="logo-text">
                                <div class="title">AUDIO CONTROL</div>
                                <div class="subtitle">Drake Systems</div>
                            </div>
                        </div>
                    </div>
                    <div class="header-right">
                        <div class="system-status">
                            <div class="status-indicator ${this.soundSystem.isEnabled ? 'online' : 'offline'}"></div>
                            <span class="status-text">${this.soundSystem.isEnabled ? 'ONLINE' : 'OFFLINE'}</span>
                        </div>
                        <button class="control-close-btn" id="closeSoundControl">
                            <span class="close-icon">✕</span>
                        </button>
                    </div>
                </div>

                <!-- 主控制区域 -->
                <div class="control-body">
                    <!-- 主音量控制 -->
                    <div class="control-section primary">
                        <div class="section-header">
                            <div class="section-icon">🔊</div>
                            <div class="section-info">
                                <div class="section-title">MASTER VOLUME</div>
                                <div class="section-desc">System Audio Level</div>
                            </div>
                            <div class="section-value" id="masterVolumeDisplay">${Math.round(this.soundSystem.masterVolume * 100)}%</div>
                        </div>
                        <div class="volume-control-advanced">
                            <div class="volume-slider-wrapper">
                                <input type="range" class="volume-slider" id="masterVolumeSlider" 
                                       min="0" max="100" value="${this.soundSystem.masterVolume * 100}">
                                <div class="slider-track">
                                    <div class="slider-fill" id="volumeFill"></div>
                                    <div class="slider-thumb" id="volumeThumb"></div>
                                </div>
                            </div>
                            <div class="volume-presets">
                                <button class="preset-btn" data-volume="0">0%</button>
                                <button class="preset-btn" data-volume="25">25%</button>
                                <button class="preset-btn" data-volume="50">50%</button>
                                <button class="preset-btn" data-volume="75">75%</button>
                                <button class="preset-btn" data-volume="100">100%</button>
                            </div>
                        </div>
                    </div>

                    <!-- 系统控制 -->
                    <div class="control-section">
                        <div class="section-header">
                            <div class="section-icon">⚡</div>
                            <div class="section-info">
                                <div class="section-title">SYSTEM CONTROL</div>
                                <div class="section-desc">Audio Engine Management</div>
                            </div>
                        </div>
                        <div class="system-controls">
                            <div class="toggle-group">
                                <button class="power-toggle ${this.soundSystem.isEnabled ? 'enabled' : 'disabled'}" 
                                        id="soundToggleBtn">
                                    <div class="toggle-icon">
                                        <div class="power-ring"></div>
                                        <div class="power-symbol">${this.soundSystem.isEnabled ? '●' : '○'}</div>
                                    </div>
                                    <div class="toggle-label">
                                        <div class="label-text">${this.soundSystem.isEnabled ? 'ENABLED' : 'DISABLED'}</div>
                                        <div class="label-desc">Audio System</div>
                                    </div>
                                </button>
                            </div>
                            <div class="system-info">
                                <div class="info-grid">
                                    <div class="info-item">
                                        <div class="info-label">Audio Context</div>
                                        <div class="info-value ${this.soundSystem.audioContext ? 'online' : 'offline'}" 
                                             id="audioContextStatus">${this.soundSystem.audioContext ? 'READY' : 'ERROR'}</div>
                                    </div>
                                    <div class="info-item">
                                        <div class="info-label">Loaded Sounds</div>
                                        <div class="info-value" id="soundCountValue">${this.soundSystem.sounds.size}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 音效测试区域 -->
                    <div class="control-section">
                        <div class="section-header">
                            <div class="section-icon">🧪</div>
                            <div class="section-info">
                                <div class="section-title">AUDIO TESTING</div>
                                <div class="section-desc">Sound Effect Preview</div>
                            </div>
                        </div>
                        <div class="test-grid">
                            <button class="test-card" data-sound="button_click">
                                <div class="test-icon">🔘</div>
                                <div class="test-info">
                                    <div class="test-name">Button Click</div>
                                    <div class="test-type">UI Sound</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                            <button class="test-card" data-sound="login_success">
                                <div class="test-icon">✅</div>
                                <div class="test-info">
                                    <div class="test-name">Login Success</div>
                                    <div class="test-type">System Alert</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                            <button class="test-card" data-sound="notification">
                                <div class="test-icon">📢</div>
                                <div class="test-info">
                                    <div class="test-name">Notification</div>
                                    <div class="test-type">Alert Tone</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                            <button class="test-card" data-sound="trade_complete">
                                <div class="test-icon">💰</div>
                                <div class="test-info">
                                    <div class="test-name">Trade Complete</div>
                                    <div class="test-type">Success Sound</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                            <button class="test-card" data-sound="system_startup">
                                <div class="test-icon">🚀</div>
                                <div class="test-info">
                                    <div class="test-name">System Startup</div>
                                    <div class="test-type">Boot Sound</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                            <button class="test-card" data-sound="ambient_hum">
                                <div class="test-icon">🌌</div>
                                <div class="test-info">
                                    <div class="test-name">Ambient Hum</div>
                                    <div class="test-type">Background</div>
                                </div>
                                <div class="test-wave"></div>
                            </button>
                        </div>
                    </div>
                </div>

                <!-- 面板底部 -->
                <div class="control-footer">
                    <div class="footer-left">
                        <div class="version-info">
                            <span class="version-label">Audio Engine v2.1</span>
                            <span class="build-info">Build 2025.12</span>
                        </div>
                    </div>
                    <div class="footer-right">
                        <div class="shortcut-info">
                            <span class="shortcut-key">Ctrl+M</span>
                            <span class="shortcut-desc">Quick Access</span>
                        </div>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(this.controlPanel);
        this.updateVolumeDisplay();
    }

    bindEvents() {
        // 关闭面板
        document.getElementById('closeSoundControl').addEventListener('click', () => {
            this.hide();
        });

        // 点击遮罩关闭
        const overlay = this.controlPanel.querySelector('.sound-control-overlay');
        overlay.addEventListener('click', () => {
            this.hide();
        });

        // 音量调节
        const volumeSlider = document.getElementById('masterVolumeSlider');
        const volumeDisplay = document.getElementById('masterVolumeDisplay');
        
        volumeSlider.addEventListener('input', (e) => {
            const volume = e.target.value / 100;
            this.soundSystem.setMasterVolume(volume);
            volumeDisplay.textContent = `${e.target.value}%`;
            this.updateVolumeDisplay();
            
            // 播放预览音效
            if (this.soundSystem.isEnabled) {
                this.soundSystem.play('button_click');
            }
        });

        // 音量预设按钮
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const volume = parseInt(btn.dataset.volume);
                volumeSlider.value = volume;
                this.soundSystem.setMasterVolume(volume / 100);
                volumeDisplay.textContent = `${volume}%`;
                this.updateVolumeDisplay();
                
                // 高亮按钮
                document.querySelectorAll('.preset-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                if (this.soundSystem.isEnabled) {
                    this.soundSystem.play('button_click');
                }
            });
        });

        // 电源开关
        document.getElementById('soundToggleBtn').addEventListener('click', () => {
            const enabled = this.soundSystem.toggleSound();
            this.updatePowerToggle(enabled);
            this.updateSystemStatus();
            
            if (enabled) {
                this.soundSystem.play('system_startup');
            }
        });

        // 音效测试
        document.querySelectorAll('.test-card').forEach(card => {
            card.addEventListener('click', () => {
                const soundName = card.dataset.sound;
                if (this.soundSystem.isEnabled) {
                    this.soundSystem.play(soundName);
                    this.animateTestCard(card);
                }
            });
        });

        // 键盘快捷键
        document.addEventListener('keydown', (e) => {
            if (e.ctrlKey && e.key === 'm') {
                e.preventDefault();
                this.toggle();
            }
            
            if (e.key === 'Escape' && this.isVisible) {
                this.hide();
            }
        });
    }

    updateVolumeDisplay() {
        const volumeFill = document.getElementById('volumeFill');
        const volumeThumb = document.getElementById('volumeThumb');
        const percentage = this.soundSystem.masterVolume * 100;
        
        if (volumeFill) {
            volumeFill.style.width = `${percentage}%`;
        }
        
        if (volumeThumb) {
            volumeThumb.style.left = `${percentage}%`;
        }
        
        // 更新预设按钮状态
        document.querySelectorAll('.preset-btn').forEach(btn => {
            btn.classList.remove('active');
            if (parseInt(btn.dataset.volume) === Math.round(percentage)) {
                btn.classList.add('active');
            }
        });
    }

    updatePowerToggle(enabled) {
        const toggleBtn = document.getElementById('soundToggleBtn');
        const powerSymbol = toggleBtn.querySelector('.power-symbol');
        const labelText = toggleBtn.querySelector('.label-text');
        
        if (enabled) {
            toggleBtn.classList.remove('disabled');
            toggleBtn.classList.add('enabled');
            powerSymbol.textContent = '●';
            labelText.textContent = 'ENABLED';
        } else {
            toggleBtn.classList.remove('enabled');
            toggleBtn.classList.add('disabled');
            powerSymbol.textContent = '○';
            labelText.textContent = 'DISABLED';
        }
    }

    updateSystemStatus() {
        const statusIndicator = document.querySelector('.status-indicator');
        const statusText = document.querySelector('.status-text');
        const audioContextStatus = document.getElementById('audioContextStatus');
        const soundCountValue = document.getElementById('soundCountValue');
        
        if (statusIndicator && statusText) {
            if (this.soundSystem.isEnabled) {
                statusIndicator.classList.remove('offline');
                statusIndicator.classList.add('online');
                statusText.textContent = 'ONLINE';
            } else {
                statusIndicator.classList.remove('online');
                statusIndicator.classList.add('offline');
                statusText.textContent = 'OFFLINE';
            }
        }
        
        if (audioContextStatus) {
            audioContextStatus.textContent = this.soundSystem.audioContext ? 'READY' : 'ERROR';
            audioContextStatus.className = `info-value ${this.soundSystem.audioContext ? 'online' : 'offline'}`;
        }
        
        if (soundCountValue) {
            soundCountValue.textContent = this.soundSystem.sounds.size;
        }
    }

    animateTestCard(card) {
        card.classList.add('testing');
        const wave = card.querySelector('.test-wave');
        if (wave) {
            wave.classList.add('active');
        }
        
        setTimeout(() => {
            card.classList.remove('testing');
            if (wave) {
                wave.classList.remove('active');
            }
        }, 600);
    }

    show() {
        this.isVisible = true;
        this.controlPanel.classList.add('visible');
        this.updateSystemStatus();
        this.updateVolumeDisplay();
        document.body.style.overflow = 'hidden';
        
        // 播放打开音效
        if (this.soundSystem.isEnabled) {
            setTimeout(() => {
                this.soundSystem.play('system_startup');
            }, 200);
        }
    }

    hide() {
        this.isVisible = false;
        this.controlPanel.classList.remove('visible');
        document.body.style.overflow = '';
        
        // 播放关闭音效
        if (this.soundSystem.isEnabled) {
            this.soundSystem.play('button_click');
        }
    }

    toggle() {
        if (this.isVisible) {
            this.hide();
        } else {
            this.show();
        }
    }
}

// 初始化音效控制面板
window.soundControlSystem = new SoundControl();

// 兼容性别名
window.soundControl = window.soundControlSystem;

// 添加快捷访问按钮到用户菜单
document.addEventListener('DOMContentLoaded', () => {
    const userDropdown = document.querySelector('.user-dropdown-menu');
    if (userDropdown) {
        const soundControlItem = document.createElement('div');
        soundControlItem.className = 'dropdown-item';
        soundControlItem.innerHTML = `
            <span class="dropdown-icon">🎵</span>
            <span>音效控制</span>
        `;
        soundControlItem.addEventListener('click', () => {
            window.soundControl.show();
        });
        
        userDropdown.insertBefore(soundControlItem, userDropdown.lastElementChild);
    }
}); 