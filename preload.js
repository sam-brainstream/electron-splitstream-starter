const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  onTranscript: (callback) => ipcRenderer.on('transcript', (_event, value) => callback(value))
})
