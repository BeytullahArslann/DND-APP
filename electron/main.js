import { app, BrowserWindow, session } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';

// Needed for ES Module path resolution in some contexts
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Security best practice
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js') // We might need this later, but safe to define
    },
  });

  // In development, load from Expo Web dev server (default 8081)
  const isDev = !app.isPackaged;

  if (isDev) {
    // Expo defaults to 8081
    win.loadURL('http://localhost:8081');
    win.webContents.openDevTools();
  } else {
    // In production, load from the dist folder
    // Note: You must run `npx expo export:web` to generate dist
    win.loadFile(path.join(__dirname, '../dist/index.html'));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
