// 声音效果系统 - Star Citizen 贸易终端
class SoundSystem {
    constructor() {
        this.sounds = new Map();
        this.isEnabled = this.loadSoundPreference();
        this.masterVolume = this.loadVolumePreference();
        this.currentMusic = null;
        this.soundCategories = {
            UI: 'ui',
            ALERT: 'alert', 
            SYSTEM: 'system',
            AMBIENT: 'ambient',
            NOTIFICATION: 'notification'
        };
        
        this.init();
    }

    init() {
        this.createAudioContext();
        this.loadSoundDefinitions();
        this.preloadSounds();
        this.bindEvents();
        console.log('🎵 声音系统已初始化');
    }

    createAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.gainNode = this.audioContext.createGain();
            this.gainNode.connect(this.audioContext.destination);
            this.gainNode.gain.value = this.masterVolume;
            
            // 监听第一次用户交互以激活AudioContext
            this.setupUserInteractionListener();
        } catch (error) {
            console.warn('⚠️ 无法创建音频上下文:', error);
        }
    }
    
    setupUserInteractionListener() {
        const resumeAudio = () => {
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume().then(() => {
                    console.log('🎵 音频上下文已激活');
                }).catch(error => {
                    console.warn('⚠️ 无法激活音频上下文:', error);
                });
            }
        };
        
        // 添加多种用户交互事件监听
        const events = ['click', 'touchstart', 'keydown'];
        const removeListeners = () => {
            events.forEach(event => {
                document.removeEventListener(event, resumeAudio);
            });
        };
        
        events.forEach(event => {
            document.addEventListener(event, () => {
                resumeAudio();
                removeListeners();
            }, { once: true });
        });
    }

    loadSoundDefinitions() {
        // 定义所有音效文件（使用在线免费音效或生成的音效）
        this.soundDefinitions = {
            // UI 交互音效
            button_hover: {
                category: this.soundCategories.UI,
                volume: 0.3,
                url: this.generateBeepSound(800, 0.1)
            },
            button_click: {
                category: this.soundCategories.UI,
                volume: 0.4,
                url: this.generateBeepSound(1200, 0.15)
            },
            tab_switch: {
                category: this.soundCategories.UI,
                volume: 0.35,
                url: this.generateSweepSound(600, 900, 0.2)
            },
            
            // 系统音效
            login_success: {
                category: this.soundCategories.SYSTEM,
                volume: 0.6,
                url: this.generateChordSound([440, 554, 659], 0.8)
            },
            login_error: {
                category: this.soundCategories.SYSTEM,
                volume: 0.5,
                url: this.generateBeepSound(300, 0.5)
            },
            system_startup: {
                category: this.soundCategories.SYSTEM,
                volume: 0.7,
                url: this.generateStartupSound()
            },
            
            // 警报音效
            price_alert_high: {
                category: this.soundCategories.ALERT,
                volume: 0.8,
                url: this.generateAlertSound(1000, 0.6)
            },
            price_alert_medium: {
                category: this.soundCategories.ALERT,
                volume: 0.6,
                url: this.generateAlertSound(800, 0.4)
            },
            market_event: {
                category: this.soundCategories.ALERT,
                volume: 0.5,
                url: this.generatePulseSound(600, 0.8)
            },
            
            // 通知音效
            notification: {
                category: this.soundCategories.NOTIFICATION,
                volume: 0.4,
                url: this.generateNotificationSound()
            },
            trade_complete: {
                category: this.soundCategories.NOTIFICATION,
                volume: 0.6,
                url: this.generateSuccessSound()
            },
            
            // 环境音效
            ambient_hum: {
                category: this.soundCategories.AMBIENT,
                volume: 0.2,
                url: this.generateAmbientHum(),
                loop: true
            },
            data_processing: {
                category: this.soundCategories.AMBIENT,
                volume: 0.3,
                url: this.generateDataSound(),
                loop: true
            },
            
            // 聊天系统音效
            message_send: {
                category: this.soundCategories.UI,
                volume: 0.4,
                url: this.generateMessageSendSound()
            },
            message_receive: {
                category: this.soundCategories.NOTIFICATION,
                volume: 0.5,
                url: this.generateMessageReceiveSound()
            },
            user_join: {
                category: this.soundCategories.NOTIFICATION,
                volume: 0.3,
                url: this.generateUserJoinSound()
            },
            user_leave: {
                category: this.soundCategories.NOTIFICATION,
                volume: 0.3,
                url: this.generateUserLeaveSound()
            }
        };
    }

    // 生成简单的蜂鸣音
    generateBeepSound(frequency, duration) {
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * Math.exp(-t * 3);
        }
        
        return audioBuffer;
    }

    // 生成扫频音
    generateSweepSound(startFreq, endFreq, duration) {
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = startFreq + (endFreq - startFreq) * (t / duration);
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * (1 - t / duration);
        }
        
        return audioBuffer;
    }

    // 生成和弦音
    generateChordSound(frequencies, duration) {
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            let sample = 0;
            frequencies.forEach(freq => {
                sample += Math.sin(2 * Math.PI * freq * t) / frequencies.length;
            });
            channelData[i] = sample * Math.exp(-t * 2);
        }
        
        return audioBuffer;
    }

    // 生成警报音
    generateAlertSound(frequency, duration) {
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const modulation = Math.sin(2 * Math.PI * 5 * t);
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * modulation * 0.5;
        }
        
        return audioBuffer;
    }

    // 生成脉冲音
    generatePulseSound(frequency, duration) {
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const pulse = Math.floor(t * 8) % 2;
            channelData[i] = Math.sin(2 * Math.PI * frequency * t) * pulse * 0.6;
        }
        
        return audioBuffer;
    }

    // 生成通知音
    generateNotificationSound() {
        const duration = 0.5;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq1 = 660;
            const freq2 = 880;
            const wave1 = Math.sin(2 * Math.PI * freq1 * t);
            const wave2 = Math.sin(2 * Math.PI * freq2 * t);
            channelData[i] = (wave1 + wave2) * 0.3 * Math.exp(-t * 4);
        }
        
        return audioBuffer;
    }

    // 生成成功音
    generateSuccessSound() {
        const duration = 0.8;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        const notes = [523, 659, 784]; // C, E, G
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const noteIndex = Math.floor(t * 6) % notes.length;
            const freq = notes[noteIndex];
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * 0.4 * Math.exp(-t * 2);
        }
        
        return audioBuffer;
    }

    // 生成启动音
    generateStartupSound() {
        const duration = 1.5;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 200 + t * 400;
            const noise = (Math.random() - 0.5) * 0.1;
            channelData[i] = (Math.sin(2 * Math.PI * freq * t) + noise) * 0.5 * (1 - t / duration);
        }
        
        return audioBuffer;
    }

    // 生成环境嗡鸣声
    generateAmbientHum() {
        const duration = 5; // 循环音效
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const lowFreq = 60 + Math.sin(t * 0.5) * 10;
            const midFreq = 120 + Math.sin(t * 0.3) * 20;
            const noise = (Math.random() - 0.5) * 0.05;
            channelData[i] = (Math.sin(2 * Math.PI * lowFreq * t) * 0.3 + 
                             Math.sin(2 * Math.PI * midFreq * t) * 0.2 + noise) * 0.4;
        }
        
        return audioBuffer;
    }

    // 生成数据处理音
    generateDataSound() {
        const duration = 3;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const digitalNoise = Math.floor(Math.random() * 8) / 8 - 0.5;
            const pulse = Math.sin(t * 30) > 0 ? 1 : 0;
            channelData[i] = digitalNoise * pulse * 0.15;
        }
        
        return audioBuffer;
    }

    async preloadSounds() {
        for (const [name, def] of Object.entries(this.soundDefinitions)) {
            try {
                this.sounds.set(name, {
                    buffer: def.url,
                    volume: def.volume,
                    category: def.category,
                    loop: def.loop || false
                });
            } catch (error) {
                console.warn(`⚠️ 无法加载音效 ${name}:`, error);
            }
        }
        console.log(`🎵 已预加载 ${this.sounds.size} 个音效`);
    }

    play(soundName, volumeOverride = null) {
        if (!this.isEnabled || !this.sounds.has(soundName)) return null;

        // 检查AudioContext状态
        if (this.audioContext && this.audioContext.state === 'suspended') {
            console.log('🎵 AudioContext暂停，尝试恢复...');
            this.audioContext.resume().catch(error => {
                console.warn('⚠️ 无法恢复AudioContext:', error);
            });
        }

        try {
            const sound = this.sounds.get(soundName);
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();
            
            source.buffer = sound.buffer;
            source.connect(gainNode);
            gainNode.connect(this.gainNode);
            
            const volume = volumeOverride !== null ? volumeOverride : sound.volume;
            gainNode.gain.value = volume * this.masterVolume;
            
            if (sound.loop) {
                source.loop = true;
            }
            
            source.start();
            
            // 如果是环境音，保存引用以便停止
            if (sound.category === this.soundCategories.AMBIENT) {
                if (this.currentMusic) {
                    this.currentMusic.stop();
                }
                this.currentMusic = source;
            }
            
            return source;
        } catch (error) {
            console.warn(`⚠️ 播放音效失败 ${soundName}:`, error);
            return null;
        }
    }

    stop(source) {
        if (source) {
            try {
                source.stop();
            } catch (error) {
                console.warn('⚠️ 停止音效失败:', error);
            }
        }
    }

    stopAmbient() {
        if (this.currentMusic) {
            this.stop(this.currentMusic);
            this.currentMusic = null;
        }
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        if (this.gainNode) {
            this.gainNode.gain.value = this.masterVolume;
        }
        this.saveSoundPreferences();
    }

    toggleSound() {
        this.isEnabled = !this.isEnabled;
        if (!this.isEnabled) {
            this.stopAmbient();
        }
        this.saveSoundPreferences();
        return this.isEnabled;
    }

    bindEvents() {
        // 绑定UI事件
        document.addEventListener('click', (e) => {
            if (e.target.matches('.terminal-btn, .trade-btn, .nav-tab-btn, .dashboard-btn')) {
                this.play('button_click');
            }
        });

        document.addEventListener('mouseover', (e) => {
            if (e.target.matches('.terminal-btn, .trade-btn, .nav-tab-btn, .dashboard-btn')) {
                this.play('button_hover');
            }
        });

        // 监听系统事件
        document.addEventListener('loginSuccess', () => {
            this.play('login_success');
            setTimeout(() => this.play('ambient_hum'), 1000);
        });

        document.addEventListener('loginError', () => {
            this.play('login_error');
        });

        document.addEventListener('tabSwitch', () => {
            this.play('tab_switch');
        });

        // 监听实时数据事件
        document.addEventListener('priceAlert', (e) => {
            const { severity } = e.detail;
            if (severity === 'high') {
                this.play('price_alert_high');
            } else {
                this.play('price_alert_medium');
            }
        });

        document.addEventListener('marketEvent', () => {
            this.play('market_event');
        });

        document.addEventListener('tradeComplete', () => {
            this.play('trade_complete');
        });

        document.addEventListener('notification', () => {
            this.play('notification');
        });
    }

    // 保存音效设置
    saveSoundPreferences() {
        try {
            localStorage.setItem('sc_sound_enabled', this.isEnabled);
            localStorage.setItem('sc_sound_volume', this.masterVolume);
        } catch (error) {
            console.warn('⚠️ 无法保存音效设置:', error);
        }
    }

    // 加载音效设置
    loadSoundPreference() {
        try {
            const enabled = localStorage.getItem('sc_sound_enabled');
            return enabled !== null ? enabled === 'true' : true;
        } catch (error) {
            return true;
        }
    }

    loadVolumePreference() {
        try {
            const volume = localStorage.getItem('sc_sound_volume');
            return volume !== null ? parseFloat(volume) : 0.7;
        } catch (error) {
            return 0.7;
        }
    }

    // 获取音效状态
    getStatus() {
        return {
            enabled: this.isEnabled,
            volume: this.masterVolume,
            soundCount: this.sounds.size,
            categories: Object.values(this.soundCategories)
        };
    }

    // 生成消息发送音效
    generateMessageSendSound() {
        const duration = 0.3;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 800 + t * 200; // 上升音调
            const envelope = Math.exp(-t * 8);
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.4;
        }
        
        return audioBuffer;
    }

    // 生成消息接收音效
    generateMessageReceiveSound() {
        const duration = 0.4;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq1 = 600;
            const freq2 = 450;
            const wave1 = Math.sin(2 * Math.PI * freq1 * t);
            const wave2 = Math.sin(2 * Math.PI * freq2 * t);
            const envelope = Math.exp(-t * 5);
            channelData[i] = (wave1 + wave2) * 0.25 * envelope;
        }
        
        return audioBuffer;
    }

    // 生成用户加入音效
    generateUserJoinSound() {
        const duration = 0.6;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        const notes = [523, 659, 784]; // C, E, G 和弦
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            let sample = 0;
            notes.forEach((freq, index) => {
                const delay = index * 0.1;
                if (t > delay) {
                    sample += Math.sin(2 * Math.PI * freq * (t - delay)) * Math.exp(-(t - delay) * 4);
                }
            });
            channelData[i] = sample * 0.2;
        }
        
        return audioBuffer;
    }

    // 生成用户离开音效
    generateUserLeaveSound() {
        const duration = 0.5;
        const audioBuffer = this.audioContext.createBuffer(1, this.audioContext.sampleRate * duration, this.audioContext.sampleRate);
        const channelData = audioBuffer.getChannelData(0);
        
        for (let i = 0; i < channelData.length; i++) {
            const t = i / this.audioContext.sampleRate;
            const freq = 600 - t * 200; // 下降音调
            const envelope = Math.exp(-t * 3);
            channelData[i] = Math.sin(2 * Math.PI * freq * t) * envelope * 0.3;
        }
        
        return audioBuffer;
    }
}

// 创建全局声音系统实例
window.soundSystem = new SoundSystem();

// 导出给其他模块使用
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SoundSystem;
} 