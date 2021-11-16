const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const {download} = require("electron-dl");

function createWindow () {
   const win = new BrowserWindow({
      width: 800,
      height: 600,
      webPreferences: {
         nodeIntegration: true,
         contextIsolation: false,
         nativeWindowOpen: true,
         enableRemoteModule: true,
         preload: path.join(__dirname, 'preload.js')
      },
   })
   win.loadFile('index.html');
   return win;
}

app.whenReady().then(() => {

   const win = createWindow();

   ipcMain.on("download", (event, info) => {
      info.properties.onProgress = status => win.webContents.send("download progress", status);
      download(BrowserWindow.getFocusedWindow(), info.url, info.properties)
         .then(dl => win.webContents.send("download complete", dl.getSavePath()));
      // console.log(info);
   });

   win.webContents.session.on('will-download', (event, item, webContents) => {
      // Set the save path, making Electron not to prompt a save dialog.
      // item.setSavePath('/tmp/save.pdf')

      win.webContents.session.webRequest.onBeforeSendHeaders((details, callback) => {
         details.requestHeaders['User-Agent'] = 'MyAgent'
         console.log('onBeforeSendHeaders');
         callback({ requestHeaders: details.requestHeaders })
      })

      item.on('updated', (event, state) => {
         if (state === 'interrupted') {
            console.log('Download is interrupted but can be resumed')
         } else if (state === 'progressing') {
            if (item.isPaused()) {
               console.log('Download is paused')
            } else {
               console.log(`Received bytes: ${item.getReceivedBytes()}`)
            }
         }
      })
      item.once('done', (event, state) => {
         if (state === 'completed') {
            console.log('Download successfully')
         } else {
            console.log(`Download failed: ${state}`)
         }
      })
   })

   app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
   })
})

app.on('window-all-closed', function () {
   if (process.platform !== 'darwin') app.quit()
})


