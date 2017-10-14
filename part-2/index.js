require('dotenv').config()

const express = require('express')
const graphqlHTTP = require('express-graphql')
const mongoose = require('mongoose')
const app = express()

const schema = require('./graphql/schema/Schema')

// connect to mongodb
mongoose.connect('mongodb://localhost:27017/graphql')
mongoose.connection.on('error', _ => console.error('FAILED to connect to mongoose'))
mongoose.connection.once('open', _ => console.log('Connected to mongoose'))

app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))

app.get('/', (req, res) => res.send("Hello world !"))

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
