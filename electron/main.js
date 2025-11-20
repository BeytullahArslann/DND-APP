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

  // In development, load from Vite dev server
  const isDev = !app.isPackaged;

  if (isDev) {
    win.loadURL('http://localhost:5173');
    win.webContents.openDevTools();
  } else {
    // In production, load from the dist folder
    // The path needs to be relative to the main.js file in the build output
    // Adjust this based on where electron-builder places things.
    // Usually 'dist/index.html' relative to app root.
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
