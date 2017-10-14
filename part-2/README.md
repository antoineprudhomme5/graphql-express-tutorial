`npm install --save mongoose dotenv`

create .env file
`touch .env`

add DB_HOST and DB_NAME in .env

load .env file in index.js

import mongoose + connect to DB

replace Todo.js class with a mongoose schema

remove fakeDatabase

in graphql todotype, replace type of id with GraphQLGraphQLString

rewrite resolve of each query and mutation with using mongoose
