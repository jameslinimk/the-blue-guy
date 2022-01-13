const { app, BrowserWindow } = require('electron')

app.whenReady().then(() => {
    const win = new BrowserWindow({
        width: 750,
        height: 750
    })

    win.setSize(750, 750)
    win.loadFile("./website/index.html")
})