const express = require('express')
const app = express()
const port = 80
const path = require('path')

app.use('/', express.static(path.join(__dirname, "website")))

app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})