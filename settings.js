class SettingsManager {
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
        const addLanguageBtn = document.getElementById('addLanguage');
        const resetLanguagesBtn = document.getElementById('resetLanguages');

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

        addLanguageBtn.addEventListener('click', () => {
            this.showAddLanguageDialog();
        });

        resetLanguagesBtn.addEventListener('click', () => {
            this.resetLanguages();
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

        this.populateLanguageList();
        this.updateTestButton();
    }

    populateLanguageList() {
        const languageList = document.getElementById('languageList');
        const languages = this.settings.languages || this.defaultLanguages;
        
        languageList.innerHTML = '';
        
        languages.forEach(lang => {
            const languageItem = document.createElement('div');
            languageItem.className = 'language-item';
            
            const checkbox = document.createElement('input');
            checkbox.type = 'checkbox';
            checkbox.id = `lang-${lang.code}`;
            checkbox.checked = lang.enabled;
            checkbox.addEventListener('change', (e) => {
                lang.enabled = e.target.checked;
            });
            
            const label = document.createElement('label');
            label.htmlFor = `lang-${lang.code}`;
            label.textContent = lang.name;
            
            const codeSpan = document.createElement('span');
            codeSpan.className = 'language-code';
            codeSpan.textContent = `(${lang.code})`;
            
            label.appendChild(codeSpan);
            languageItem.appendChild(checkbox);
            languageItem.appendChild(label);
            languageList.appendChild(languageItem);
        });
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
        const languages = this.settings.languages || this.defaultLanguages;
        const languageList = document.getElementById('languageList');
        
        // Update enabled status from checkboxes
        languages.forEach(lang => {
            const checkbox = document.getElementById(`lang-${lang.code}`);
            if (checkbox) {
                lang.enabled = checkbox.checked;
            }
        });

        return {
            apiProvider: document.getElementById('apiProvider').value,
            apiKey: document.getElementById('apiKey').value,
            model: document.getElementById('model').value,
            apiUrl: document.getElementById('apiUrl').value,
            autoTranslate: document.getElementById('autoTranslate').checked,
            saveHistory: document.getElementById('saveHistory').checked,
            languages: languages
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

    resetLanguages() {
        if (confirm('Are you sure you want to reset to default languages? This will restore all default languages.')) {
            this.settings.languages = [...this.defaultLanguages];
            this.populateLanguageList();
            this.showMessage('Languages reset to default', 'success');
        }
    }

    showAddLanguageDialog() {
        const overlay = document.createElement('div');
        overlay.className = 'overlay';
        
        const dialog = document.createElement('div');
        dialog.className = 'add-language-dialog';
        dialog.innerHTML = `
            <h3>Add Custom Language</h3>
            <div class="form-group">
                <label for="newLangCode">Language Code:</label>
                <input type="text" id="newLangCode" placeholder="e.g., nl, sv, tr" maxlength="5">
            </div>
            <div class="form-group">
                <label for="newLangName">Language Name:</label>
                <input type="text" id="newLangName" placeholder="e.g., Dutch, Swedish, Turkish">
            </div>
            <div class="dialog-actions">
                <button type="button" class="btn btn-secondary" id="cancelAddLang">Cancel</button>
                <button type="button" class="btn btn-primary" id="confirmAddLang">Add Language</button>
            </div>
        `;

        document.body.appendChild(overlay);
        document.body.appendChild(dialog);

        const cancelBtn = dialog.querySelector('#cancelAddLang');
        const confirmBtn = dialog.querySelector('#confirmAddLang');
        const codeInput = dialog.querySelector('#newLangCode');
        const nameInput = dialog.querySelector('#newLangName');

        const closeDialog = () => {
            document.body.removeChild(overlay);
            document.body.removeChild(dialog);
        };

        cancelBtn.addEventListener('click', closeDialog);
        overlay.addEventListener('click', closeDialog);

        confirmBtn.addEventListener('click', () => {
            const code = codeInput.value.trim().toLowerCase();
            const name = nameInput.value.trim();

            if (!code || !name) {
                this.showMessage('Please fill in both language code and name', 'error');
                return;
            }

            if (code.length < 2 || code.length > 5) {
                this.showMessage('Language code must be 2-5 characters', 'error');
                return;
            }

            // Check if language already exists
            const languages = this.settings.languages || this.defaultLanguages;
            if (languages.some(lang => lang.code === code)) {
                this.showMessage('Language code already exists', 'error');
                return;
            }

            // Add new language
            const newLanguage = { code, name, enabled: true };
            languages.push(newLanguage);
            this.settings.languages = languages;
            
            this.populateLanguageList();
            this.showMessage(`Added language: ${name} (${code})`, 'success');
            closeDialog();
        });

        // Focus on first input
        codeInput.focus();

        // Handle Enter key
        const handleEnter = (e) => {
            if (e.key === 'Enter') {
                confirmBtn.click();
            }
        };

        codeInput.addEventListener('keydown', handleEnter);
        nameInput.addEventListener('keydown', handleEnter);
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