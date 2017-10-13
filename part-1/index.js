const express = require('express')
const app = express()

app.get('/', (req, res) => res.send("Hello world !"))

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
