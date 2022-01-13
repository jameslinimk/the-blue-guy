const express = require('express')
const expressApp = express()
const port = 80
const path = require('path')

expressApp.use('/', express.static(path.join(__dirname, "website")))

expressApp.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})