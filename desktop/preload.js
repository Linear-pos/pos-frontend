const { contextBridge, ipcRenderer } = require("electron")

contextBridge.exposeInMainWorld("electron", {
  platform: process.platform,
  products: {
    import: (data) => ipcRenderer.invoke('products:import', data),
    validate: (data) => ipcRenderer.invoke('products:validate', data)
  }
})
