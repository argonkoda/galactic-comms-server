
import {app, BrowserWindow, ipcMain} from 'electron';
import path from 'node:path';
// @ts-ignore
import RENDERER_FILE_PATH from 'renderer';
import {start, stop, isRunning, log} from './server';

const createWindow = () => {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      preload: path.join(__dirname, 'preload.cjs'),
      contextIsolation: true,
      nodeIntegration: false,
    }
  });

  const logHandler = (...args) => {
    win.webContents.send('server:log', ...args);
  }

  log.on('log', logHandler)

  win.on('closed', () => log.off('log', logHandler))

  win.loadURL(RENDERER_FILE_PATH);
}

app.on('window-all-closed', async () => {
  if (process.platform !== 'darwin') {
    if (isRunning()) await stop();
    app.quit()
  }
})

app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

ipcMain.handle('server:start', async (event, options) => {
  await start(options);
})

ipcMain.handle('server:stop', async (event) => {
  await stop();
})

ipcMain.handle('server:is-running', () => {
  return isRunning();
})