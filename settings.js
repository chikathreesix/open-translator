class SettingsManager {
    constructor() {
        this.settings = {};
        this.init();
    }

    async init() {
        await this.loadSettings();
        this.setupEventListeners();
        this.populateForm();
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
        const apiProvider = document.getElementById('apiProvider');
        const apiKey = document.getElementById('apiKey');
        const toggleApiKey = document.getElementById('toggleApiKey');
        const model = document.getElementById('model');
        const testConnection = document.getElementById('testConnection');
        const saveBtn = document.getElementById('saveBtn');
        const cancelBtn = document.getElementById('cancelBtn');

        apiProvider.addEventListener('change', (e) => {
            this.handleProviderChange(e.target.value);
        });

        toggleApiKey.addEventListener('click', () => {
            const type = apiKey.type === 'password' ? 'text' : 'password';
            apiKey.type = type;
            toggleApiKey.textContent = type === 'password' ? '👁️' : '🙈';
        });

        apiKey.addEventListener('input', () => {
            this.updateTestButton();
        });

        testConnection.addEventListener('click', () => {
            this.testConnection();
        });

        saveBtn.addEventListener('click', () => {
            this.saveSettings();
        });

        cancelBtn.addEventListener('click', () => {
            window.close();
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                window.close();
            } else if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                this.saveSettings();
            }
        });
    }

    populateForm() {
        const elements = {
            apiProvider: document.getElementById('apiProvider'),
            apiKey: document.getElementById('apiKey'),
            model: document.getElementById('model'),
            apiUrl: document.getElementById('apiUrl'),
            autoTranslate: document.getElementById('autoTranslate'),
            saveHistory: document.getElementById('saveHistory')
        };

        if (this.settings.apiProvider) {
            elements.apiProvider.value = this.settings.apiProvider;
            this.handleProviderChange(this.settings.apiProvider);
        }

        if (this.settings.apiKey) {
            elements.apiKey.value = this.settings.apiKey;
        }

        if (this.settings.model) {
            elements.model.value = this.settings.model;
        }

        if (this.settings.apiUrl) {
            elements.apiUrl.value = this.settings.apiUrl;
        }

        elements.autoTranslate.checked = this.settings.autoTranslate || false;
        elements.saveHistory.checked = this.settings.saveHistory || false;

        this.updateTestButton();
    }

    handleProviderChange(provider) {
        const modelGroup = document.getElementById('modelGroup');
        const apiUrlGroup = document.getElementById('apiUrlGroup');
        const apiTest = document.getElementById('apiTest');
        const modelSelect = document.getElementById('model');

        modelGroup.style.display = provider ? 'block' : 'none';
        apiUrlGroup.style.display = provider === 'custom' ? 'block' : 'none';
        apiTest.style.display = provider ? 'block' : 'none';

        modelSelect.innerHTML = '<option value="">Default model</option>';

        switch (provider) {
            case 'openai':
                this.addModelOptions([
                    { value: 'gpt-3.5-turbo', text: 'GPT-3.5 Turbo' },
                    { value: 'gpt-4', text: 'GPT-4' },
                    { value: 'gpt-4-turbo', text: 'GPT-4 Turbo' },
                    { value: 'gpt-4o', text: 'GPT-4o' }
                ]);
                break;
            case 'anthropic':
                this.addModelOptions([
                    { value: 'claude-3-haiku-20240307', text: 'Claude 3 Haiku' },
                    { value: 'claude-3-sonnet-20240229', text: 'Claude 3 Sonnet' },
                    { value: 'claude-3-opus-20240229', text: 'Claude 3 Opus' }
                ]);
                break;
            case 'custom':
                break;
        }

        this.updateTestButton();
    }

    addModelOptions(models) {
        const modelSelect = document.getElementById('model');
        models.forEach(model => {
            const option = document.createElement('option');
            option.value = model.value;
            option.textContent = model.text;
            modelSelect.appendChild(option);
        });
    }

    updateTestButton() {
        const apiProvider = document.getElementById('apiProvider').value;
        const apiKey = document.getElementById('apiKey').value;
        const testBtn = document.getElementById('testConnection');
        
        testBtn.disabled = !apiProvider || !apiKey;
    }

    async testConnection() {
        const testBtn = document.getElementById('testConnection');
        const testResult = document.getElementById('testResult');
        
        testBtn.disabled = true;
        testBtn.textContent = 'Testing...';
        testResult.style.display = 'none';

        try {
            const settings = this.getFormData();
            
            const testTranslation = await window.electronAPI.translateText({
                text: "Hello",
                sourceLang: "English",
                targetLang: "Spanish",
                settings: settings
            });

            testResult.className = 'test-result success';
            testResult.textContent = `✓ Connection successful! Test translation: "${testTranslation}"`;
            testResult.style.display = 'block';

        } catch (error) {
            testResult.className = 'test-result error';
            testResult.textContent = `✗ Connection failed: ${error.message}`;
            testResult.style.display = 'block';
        } finally {
            testBtn.disabled = false;
            testBtn.textContent = 'Test Connection';
            this.updateTestButton();
        }
    }

    getFormData() {
        return {
            apiProvider: document.getElementById('apiProvider').value,
            apiKey: document.getElementById('apiKey').value,
            model: document.getElementById('model').value,
            apiUrl: document.getElementById('apiUrl').value,
            autoTranslate: document.getElementById('autoTranslate').checked,
            saveHistory: document.getElementById('saveHistory').checked
        };
    }

    async saveSettings() {
        const saveBtn = document.getElementById('saveBtn');
        const originalText = saveBtn.textContent;
        
        saveBtn.disabled = true;
        saveBtn.textContent = 'Saving...';

        try {
            const newSettings = this.getFormData();
            const success = await window.electronAPI.saveSettings(newSettings);
            
            if (success) {
                this.settings = newSettings;
                saveBtn.textContent = 'Saved!';
                setTimeout(() => {
                    window.close();
                }, 1000);
            } else {
                throw new Error('Failed to save settings');
            }

        } catch (error) {
            console.error('Failed to save settings:', error);
            saveBtn.textContent = 'Error!';
            setTimeout(() => {
                saveBtn.textContent = originalText;
                saveBtn.disabled = false;
            }, 2000);
        }
    }

    showMessage(message, type = 'info') {
        const existing = document.querySelector('.message');
        if (existing) {
            existing.remove();
        }

        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 12px 20px;
            border-radius: 6px;
            color: white;
            font-weight: 500;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            ${type === 'success' ? 'background: #28a745;' : ''}
            ${type === 'error' ? 'background: #dc3545;' : ''}
            ${type === 'info' ? 'background: #17a2b8;' : ''}
        `;

        document.body.appendChild(messageDiv);

        setTimeout(() => {
            messageDiv.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => messageDiv.remove(), 300);
        }, 3000);
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
    new SettingsManager();
});