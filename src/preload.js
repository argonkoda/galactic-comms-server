import { contextBridge, ipcRenderer } from "electron";

contextBridge.exposeInMainWorld('server', {
  async start(options) {
    await ipcRenderer.invoke('server:start', options);
  },
  async stop(){
    await ipcRenderer.invoke('server:stop');
  },
  async isRunning() {
    return await ipcRenderer.invoke('server:is-running');
  },
  log: {
    subscribe(fn) {
      const handler = (event, ...args) => fn(args);
      ipcRenderer.on('server:log', handler);
      return () => ipcRenderer.off('server:log', handler);
    }
  }
})