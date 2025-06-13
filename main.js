const { app, BrowserWindow, Menu, globalShortcut, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs');

let mainWindow;
let settingsWindow;

const createMainWindow = () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    minWidth: 600,
    minHeight: 400,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  mainWindow.loadFile('index.html');

  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
};

const createSettingsWindow = () => {
  if (settingsWindow) {
    settingsWindow.focus();
    return;
  }

  settingsWindow = new BrowserWindow({
    width: 500,
    height: 400,
    parent: mainWindow,
    modal: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    titleBarStyle: 'hiddenInset',
    show: false
  });

  settingsWindow.loadFile('settings.html');

  settingsWindow.once('ready-to-show', () => {
    settingsWindow.show();
  });

  settingsWindow.on('closed', () => {
    if (mainWindow) {
      mainWindow.webContents.send('settings-closed');
    }
    settingsWindow = null;
  });
};

app.whenReady().then(() => {
  createMainWindow();

  const template = [
    {
      label: 'File',
      submenu: [
        {
          label: 'Settings',
          accelerator: 'CmdOrCtrl+,',
          click: () => createSettingsWindow()
        },
        { type: 'separator' },
        {
          label: 'Quit',
          accelerator: process.platform === 'darwin' ? 'Cmd+Q' : 'Ctrl+Q',
          click: () => app.quit()
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' },
        { role: 'selectall' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { role: 'toggleDevTools' },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    }
  ];

  const menu = Menu.buildFromTemplate(template);
  Menu.setApplicationMenu(menu);

  globalShortcut.register('CmdOrCtrl+Shift+T', () => {
    if (mainWindow) {
      mainWindow.focus();
      mainWindow.webContents.send('focus-input');
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createMainWindow();
  }
});

app.on('will-quit', () => {
  globalShortcut.unregisterAll();
});

ipcMain.handle('get-settings', () => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf8'));
    }
  } catch (error) {
    console.error('Error reading settings:', error);
  }
  return {};
});

ipcMain.handle('save-settings', (event, settings) => {
  const settingsPath = path.join(app.getPath('userData'), 'settings.json');
  try {
    fs.writeFileSync(settingsPath, JSON.stringify(settings, null, 2));
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
});

ipcMain.handle('open-settings', () => {
  createSettingsWindow();
  return true;
});

ipcMain.handle('translate-text', async (event, { text, sourceLang, targetLang, settings }) => {
  const axios = require('axios');
  
  try {
    const { apiProvider, apiKey, apiUrl, model } = settings;
    
    if (!apiKey) {
      throw new Error('API key not configured');
    }

    let response;
    
    switch (apiProvider) {
      case 'openai':
        response = await axios.post('https://api.openai.com/v1/chat/completions', {
          model: model || 'gpt-3.5-turbo',
          messages: [{
            role: 'user',
            content: `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translation, no explanations:\n\n${text}`
          }],
          temperature: 0.3
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.choices[0].message.content.trim();
        
      case 'anthropic':
        response = await axios.post('https://api.anthropic.com/v1/messages', {
          model: model || 'claude-3-sonnet-20240229',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translation, no explanations:\n\n${text}`
          }]
        }, {
          headers: {
            'x-api-key': apiKey,
            'Content-Type': 'application/json',
            'anthropic-version': '2023-06-01'
          }
        });
        return response.data.content[0].text.trim();
        
      case 'custom':
        if (!apiUrl) {
          throw new Error('Custom API URL not configured');
        }
        response = await axios.post(apiUrl, {
          prompt: `Translate the following text from ${sourceLang} to ${targetLang}. Only return the translation, no explanations:\n\n${text}`,
          model: model
        }, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          }
        });
        return response.data.response || response.data.choices?.[0]?.message?.content || response.data.text;
        
      default:
        throw new Error('Unsupported API provider');
    }
  } catch (error) {
    console.error('Translation error:', error);
    throw error;
  }
});