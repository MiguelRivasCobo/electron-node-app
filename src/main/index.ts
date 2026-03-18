import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import {
  initDatabase,
  getNodes,
  getEdges,
  updateNode,
  updateNodePosition,
  addNode,
  deleteNode
} from './database'
import type { NodeRecord } from './database'

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    show: false,
    autoHideMenuBar: true,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false,
      contextIsolation: true
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  // Open external links in the default browser
  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // Dev: load Vite dev server; Prod: load built file
  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  // ── Database (async init with WebAssembly SQLite) ──────────────────────
  await initDatabase()

  // ── IPC handlers ─────────────────────────
  ipcMain.handle('db:get-nodes', () => getNodes())

  ipcMain.handle('db:get-edges', () => getEdges())

  ipcMain.handle('db:update-node', (_event, payload) => {
    const { id, title, description, image_url } = payload as {
      id: string
      title: string
      description: string
      image_url: string
    }
    return { success: updateNode(id, title, description, image_url) }
  })

  ipcMain.handle('db:update-node-position', (_event, payload) => {
    const { id, x, y } = payload as { id: string; x: number; y: number }
    return { success: updateNodePosition(id, x, y) }
  })

  ipcMain.handle('db:add-node', (_event, payload) => {
    return { success: addNode(payload as NodeRecord) }
  })

  ipcMain.handle('db:delete-node', (_event, id) => {
    return { success: deleteNode(id as string) }
  })

  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
