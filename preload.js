const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getSettings: () => ipcRenderer.invoke('get-settings'),
  saveSettings: (settings) => ipcRenderer.invoke('save-settings', settings),
  translateText: (data) => ipcRenderer.invoke('translate-text', data),
  onFocusInput: (callback) => ipcRenderer.on('focus-input', callback),
  openSettings: () => ipcRenderer.invoke('open-settings')
});