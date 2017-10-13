`npm init`

`npm install --save express`


`touch index.js`

add the following code in index.js
```
const mongoose = require('mongoose')
const app = express()

app.get('/', _ => res.send("Hello world !"))

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
```

in package.json add script `"start": "node index.js"`
