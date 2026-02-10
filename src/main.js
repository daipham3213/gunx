import { app, Menu, shell, BrowserWindow } from 'electron';
import path from 'path';
import started from 'electron-squirrel-startup';

const APP_NAME = 'Gunx - The Chicken Farm';

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const resolvePluginBaseDir = () => {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'app.asar.unpacked', 'src', 'plugins');
  }

  return path.join(process.cwd(), 'src', 'plugins');
};

const setupFlashPlugin = () => {
  const PLUGIN_VERSION = '32.0.0.371';
  const PLUGIN_ARCH = process.arch === 'x64' ? 'x64' : 'ia32';

  let pluginName = '';
  let pluginType = '';

  switch (process.platform) {
    case 'win32':
      pluginType = 'win';
      pluginName = 'pepflashplayer.dll';
      break;
    case 'darwin':
      pluginType = 'mac';
      pluginName = 'PepperFlashPlayer.plugin';
      break;
    default:
      pluginType = 'linux';
      pluginName = 'libpepflashplayer.so';
  }

  if (['freebsd', 'linux', 'netbsd', 'openbsd'].includes(process.platform)) {
    app.commandLine.appendSwitch('no-sandbox');
  }

  if (process.platform !== 'darwin') {
    app.commandLine.appendSwitch('high-dpi-support', '1')
    app.commandLine.appendSwitch('force-device-scale-factor', "1");
    app.commandLine.appendSwitch('--enable-npapi')
  }

  const fullPath = path.join(resolvePluginBaseDir(), pluginType, PLUGIN_ARCH, pluginName);
  console.debug(`Loading Flash plugin from: ${fullPath}`);

  app.commandLine.appendSwitch('ppapi-flash-path', fullPath);
  app.commandLine.appendSwitch('ppapi-flash-version', PLUGIN_VERSION);
  app.commandLine.appendSwitch('disable-site-isolation-trials')
  app.commandLine.appendSwitch('ignore-certificate-errors', 'true')
  app.commandLine.appendSwitch('allow-insecure-localhost', 'true')
  app.commandLine.appendSwitch('incognito')
};

const createMenu = () => {
  const template = [
    { role: "reload" },
    { type: "separator" },
    { role: "resetZoom" },
    { role: "zoomIn" },
    { role: "zoomOut" },
    { type: "separator" },
    { role: "togglefullscreen" },
  ];

  if (process.env.NODE_ENV === 'development') {
    template.push(
      { type: "separator" },
      {
        label: "DevTools",
        submenu: [
          { role: "forceReload" },
          { role: "toggleDevTools" },
        ]
      }
    );
  }

  Menu.setApplicationMenu(Menu.buildFromTemplate(template));
};

const createWindow = () => {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 1100,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      plugins: true,
    },
  });

  mainWindow.webContents.on("new-window", (event, url) => {
    event.preventDefault();
    shell.openExternal(url);
  });

  mainWindow.webContents.on("context-menu", (event, params) => {
    Menu.getApplicationMenu().popup(mainWindow, params.x, params.y);
  });

  // and load the index.html of the app.
  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`));
  }
};


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  app.allowRendererProcessReuse = true;

  createWindow();
  createMenu();

  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
setupFlashPlugin();