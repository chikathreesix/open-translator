class OpenTranslator {
    constructor() {
        this.settings = {};
        this.defaultLanguages = [
            { code: 'auto', name: 'Detect language', enabled: true },
            { code: 'en', name: 'English', enabled: true },
            { code: 'es', name: 'Spanish', enabled: true },
            { code: 'fr', name: 'French', enabled: true },
            { code: 'de', name: 'German', enabled: true },
            { code: 'it', name: 'Italian', enabled: true },
            { code: 'pt', name: 'Portuguese', enabled: true },
            { code: 'ru', name: 'Russian', enabled: true },
            { code: 'ja', name: 'Japanese', enabled: true },
            { code: 'ko', name: 'Korean', enabled: true },
            { code: 'zh', name: 'Chinese', enabled: true },
            { code: 'ar', name: 'Arabic', enabled: true },
            { code: 'hi', name: 'Hindi', enabled: true }
        ];
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.populateLanguageSelectors();
        this.updateAPIStatus();
        
        window.electronAPI.onFocusInput(() => {
            document.getElementById('sourceText').focus();
        });

        // Listen for settings window close to refresh settings
        window.electronAPI.onSettingsClosed(async () => {
            await this.loadSettings();
            this.populateLanguageSelectors();
            this.updateAPIStatus();
        });
    }

    async loadSettings() {
        try {
            this.settings = await window.electronAPI.getSettings();
        } catch (error) {
            console.error('Failed to load settings:', error);
            this.settings = {};
        }
    }

    setupEventListeners() {
        const sourceText = document.getElementById('sourceText');
        const targetText = document.getElementById('targetText');
        const translateBtn = document.getElementById('translateBtn');
        const clearBtn = document.getElementById('clearBtn');
        const copyBtn = document.getElementById('copyBtn');
        const swapBtn = document.getElementById('swapLangs');
        const settingsBtn = document.getElementById('settingsBtn');
        const charCount = document.getElementById('charCount');

        sourceText.addEventListener('input', (e) => {
            const length = e.target.value.length;
            charCount.textContent = length;
            
            if (length > 5000) {
                charCount.style.color = '#ff6b6b';
                e.target.value = e.target.value.substring(0, 5000);
            } else {
                charCount.style.color = '#999';
            }
            
            if (length > 0 && this.settings.apiKey) {
                translateBtn.disabled = false;
            } else {
                translateBtn.disabled = true;
            }
        });

        sourceText.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
                this.translateText();
            }
        });

        translateBtn.addEventListener('click', () => this.translateText());
        
        clearBtn.addEventListener('click', () => {
            sourceText.value = '';
            targetText.value = '';
            charCount.textContent = '0';
            translateBtn.disabled = true;
            this.updateStatus('');
        });

        copyBtn.addEventListener('click', () => {
            if (targetText.value) {
                navigator.clipboard.writeText(targetText.value);
                this.showToast('Translation copied to clipboard!');
            }
        });

        swapBtn.addEventListener('click', () => {
            const sourceLang = document.getElementById('sourceLang');
            const targetLang = document.getElementById('targetLang');
            
            if (sourceLang.value !== 'auto') {
                const temp = sourceLang.value;
                sourceLang.value = targetLang.value;
                targetLang.value = temp;
                
                const tempText = sourceText.value;
                sourceText.value = targetText.value;
                targetText.value = tempText;
                
                charCount.textContent = sourceText.value.length;
            }
        });

        settingsBtn.addEventListener('click', () => {
            this.openSettings();
        });
    }

    async translateText() {
        const sourceText = document.getElementById('sourceText').value.trim();
        const targetText = document.getElementById('targetText');
        const translateBtn = document.getElementById('translateBtn');
        const btnText = translateBtn.querySelector('.btn-text');
        const btnLoading = translateBtn.querySelector('.btn-loading');
        
        if (!sourceText) return;
        
        if (!this.settings.apiKey) {
            this.updateStatus('Please configure API key in settings');
            this.openSettings();
            return;
        }

        try {
            translateBtn.disabled = true;
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline-flex';
            
            const sourceLang = document.getElementById('sourceLang').value;
            const targetLang = document.getElementById('targetLang').value;
            
            this.updateStatus('Translating...');
            
            const translation = await window.electronAPI.translateText({
                text: sourceText,
                sourceLang: sourceLang === 'auto' ? 'auto-detect' : this.getLanguageName(sourceLang),
                targetLang: this.getLanguageName(targetLang),
                settings: this.settings
            });
            
            targetText.value = translation;
            this.updateStatus(`Translated from ${this.getLanguageName(sourceLang)} to ${this.getLanguageName(targetLang)}`);
            
        } catch (error) {
            console.error('Translation error:', error);
            this.updateStatus(`Translation failed: ${error.message}`);
            targetText.value = '';
        } finally {
            translateBtn.disabled = false;
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
        }
    }

    populateLanguageSelectors() {
        const languages = this.settings.languages || this.defaultLanguages;
        const enabledLanguages = languages.filter(lang => lang.enabled);
        
        const sourceLang = document.getElementById('sourceLang');
        const targetLang = document.getElementById('targetLang');
        
        // Store current selections
        const currentSource = sourceLang.value;
        const currentTarget = targetLang.value;
        
        // Clear and populate source language selector
        sourceLang.innerHTML = '';
        enabledLanguages.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            sourceLang.appendChild(option);
        });
        
        // Clear and populate target language selector (exclude 'auto')
        targetLang.innerHTML = '';
        enabledLanguages.filter(lang => lang.code !== 'auto').forEach(lang => {
            const option = document.createElement('option');
            option.value = lang.code;
            option.textContent = lang.name;
            targetLang.appendChild(option);
        });
        
        // Restore selections if they still exist
        if (enabledLanguages.some(lang => lang.code === currentSource)) {
            sourceLang.value = currentSource;
        } else {
            sourceLang.value = 'auto';
        }
        
        if (enabledLanguages.some(lang => lang.code === currentTarget)) {
            targetLang.value = currentTarget;
        } else {
            targetLang.value = 'en';
        }
    }

    getLanguageName(code) {
        const languages = this.settings.languages || this.defaultLanguages;
        const language = languages.find(lang => lang.code === code);
        return language ? language.name : code;
    }

    updateStatus(message) {
        document.getElementById('statusText').textContent = message;
    }

    updateAPIStatus() {
        const apiStatus = document.getElementById('apiStatus');
        if (this.settings.apiKey && this.settings.apiProvider) {
            apiStatus.textContent = `Connected (${this.settings.apiProvider})`;
            apiStatus.className = 'api-status connected';
        } else {
            apiStatus.textContent = 'Not configured';
            apiStatus.className = 'api-status disconnected';
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        toast.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #4CAF50;
            color: white;
            padding: 12px 20px;
            border-radius: 6px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
        `;
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => document.body.removeChild(toast), 300);
        }, 3000);
    }

    openSettings() {
        window.electronAPI.openSettings();
    }
}

const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
    }
    @keyframes slideOut {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
    }
`;
document.head.appendChild(style);

document.addEventListener('DOMContentLoaded', () => {
    new OpenTranslator();
});