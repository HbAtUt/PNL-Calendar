const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('pnlApi', {
  loadData: () => ipcRenderer.invoke('load-data'),
  saveData: (data) => ipcRenderer.invoke('save-data', data),
  exportJson: (json) => ipcRenderer.invoke('export-json', json),
  importJson: () => ipcRenderer.invoke('import-json'),
  closeWindow: () => ipcRenderer.send('close-window'),
});
