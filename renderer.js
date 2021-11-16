const { ipcRenderer } = require('electron');
const path = require('path');

const elem = document.querySelector('.btn');

elem.addEventListener( "click" , () => {
   ipcRenderer.send("download", {
      url: "https://speedtest.selectel.ru/10MB",
      properties: {directory: path.join(__dirname, 'downloads') }
   });
});

ipcRenderer.on("download complete", (event, file) => {
   console.log("download complete file "+file);
});

ipcRenderer.on("download progress", (event, progress) => {
   const progressInPercentages = progress.percent * 100;
   const cleanProgressInPercentages = Math.floor(progress.percent * 100);
   console.log(cleanProgressInPercentages);
});



