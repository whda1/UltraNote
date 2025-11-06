import { app, BrowserWindow, dialog, ipcMain, Menu } from 'electron'
import { createRequire } from 'node:module'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import electronDl from 'electron-dl';
import {download, CancelError} from 'electron-dl';
import debug from 'electron-debug';
import { readFileWithDialog, saveWithDialog, saveWithoutDialog } from './event';

const require = createRequire(import.meta.url)
const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL =  process.env['VITE_DEV_SERVER_URL']
// export const VITE_DEV_SERVER_URL = "http://localhost:5173/"
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

let win: BrowserWindow | null

const menu = Menu.buildFromTemplate([
  { role: 'copy' },
  { role: 'cut' },
  { role: 'paste' },
  { role: 'selectAll' },
  { role : 'pasteAndMatchStyle'},
  { role : 'toggleDevTools' },
])

function createWindow() {
  win = new BrowserWindow({
    width:1500,
    height:600,
    icon: path.join(process.env.VITE_PUBLIC, 'electron-vite.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      spellcheck: false
    },
  })

  
  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  win.webContents.on('context-menu',(_event,params)=>{
    menu.popup()
  })


  if (VITE_DEV_SERVER_URL) {
    win.loadURL("http://localhost:5173/")
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})


electronDl()
app.whenReady().then(()=>{
    createWindow()
    saveWithDialog()
    saveWithoutDialog()
    readFileWithDialog()
    console.log("This is the vite dev server url")
    console.log(VITE_DEV_SERVER_URL)
  }
)

