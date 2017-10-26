# GraphQL & Express.js [part 2]

Welcome back !
In the previous part, we've created a GraphQL api on Express.js to manage our Todolist.

*If you missed it, you can find the article [here](https://medium.com/@prudywsh/graphql-express-js-part-1-49a5071636d2).
There is a link to the Github repo wite the code of the part 1 in the article*

In the first part, we didn't use a database. Instead, we've used a javascript object to store our data. It's fine for a example, like in our case. But in the real world, you don't want that, because if you restart you server, all your data are lost.

So right now, we are going to put a database on the code of part 1.

Here, we will use a Mongodb database and mongoose as ORM. But the procedure will be similar for any ORM, so you can do it with the one you like if you want.

You can find the code [here, on my github](https://github.com/prudywsh/graphql-express-tutorial/tree/master/part-2).

## Prepare the ground

Before getting to the heart of the matter, let's do some preliminary work, so we don't have to thing about these things later.

### Install the new dependencies

First of all, install the new dependencies we need to connect our server to a MongoDB database.

```
npm install --save mongoose dotenv
```

- **mongoose** is a MongoDB ORM (maybe the most famous)
- **dotenv** is a module that load environnement variables from a .env file at the root of our project into the process.env object.

### Create the .env file

At the root of the project, create a new file called **.env**. As I said in the dependencies installation just before, the variables we put in this file will be loaded in process.env.

But what do we want to put in this file ?
Our database connection's variables !

But why do we want to do that ?
It's a good practice ! If you want to share your code with someone, you don't want this guy to have your database login and password, and you don't want go through your code to clean each value that belongs to your environnement ... So one solution is to create a *.env* file, that you don't send to the guy you want to share your code with. Instead, you can send him a *.env.example* file with the variables but without the values, like I did for this code (check the github repo), so the guy who want to try my code just have to fill the file with his values.

For the mongodb connection, we need 2 things:
- the database's host, we will call this variable **DB_HOST**
- the database's name, we will call this variable **DB_NAME**

Here is the content of my .env file on my computer :

```
DB_HOST=localhost:27017
DB_NAME=todolist
```

If you are using mongodb locally wth the default settings, your DB_HOST is the same as me.
For the DB_NAME, we doesn't created the database yet, so we will change it later.

## Set up mongoose

### Create the database

If you don't have mongodb on your computer, [you must install it](https://www.mongodb.com/). (Else, it will be complicated to run this code :)).

*If you want a GUI to manage your MongoDB database, you can take a look at [Robomongo](https://robomongo.org/)*

Now we have to create a database for this project.

- open a terminal
- run `mongo` to open the mongodb shell
- run `use DB_NAME` where DB_NAME is the name of your database

**dont forget to change the value of DB_NAME in your .env with the value you choose !**

### Connection to mongodb

The connection to our database will be done in **index.js**.

The first thing to do is to load our environnement file, so we can access the variables in process.env. We also have to import mongoose, because it's the module that will help us to interact with our MongoDB database.

At the top of the file, put theses lines:

```
require('dotenv').config()
const mongoose = require('mongoose')
```

Now, we can do the connection to our database. Simply add these lines under the modules's imports.

```
// connect to mongodb
mongoose.connect(`mongodb://${process.env.DB_HOST}/${process.env.DB_NAME}`)
```

As you can see, we use our environnement variables for the connection.

## Replace the fakeDatabase

Our server is connected to a real database. So let's change our code to use the real database instead of our fake database.

### From ES6 class to Mongoose schema

We will start to refactor our Todo model. Remove the old code of our model and put this one instead.

```
const mongoose = require('mongoose')
const Schema = mongoose.Schema

const todoSchema = new Schema({
  content: String,
  done: Boolean
})

module.exports = mongoose.model('Todo', todoSchema)
```

Our ES6 class is replaced by a mongoose Schema. Then, we create the Todo model from this schema and export it.

*Note that there is no 'id' attribute in the schema. If fact, any mongodb document has a _id attribute which is unique. So we will use it instead of creating our own 'id' field. But it's important to remember that the field is now '_id', not 'id' and that '_id' is a string, not an integer like 'id'*

We change our model, but as I said in the part 1, we doesn't query directly our model, but a GraphQL type. The 'id' attribute has been replaced by the '\_id' attribute, so we have to update or graphql schema.

In **Schema.js**, in the TodoType's fields attribute, replace

```
id: {type: graphql.GraphQLInt},
```

with

```
\_id: {type: graphql.GraphQLString},
```

*So now, to query by id, we will use '\_id' as key and a string as value.*

### rewrite resolve methods

With Grahql-express, we can return promises in resolve methods, and that's awesome, because a lot of mongoose queries return promises ! So except the cases where we have to do more than a simple query, we can directly return the mongoose query !

We will start with the simplest resolve to update: deleteTodo. This mutation delete a Todo by id and return the deleted Todo. Mongoose has a great method to do it, which return a promise ! So the resolve method of deleteTodo is just that :

```
resolve: (_, {_id}) => {
  return Todo.findOneAndRemove(_id)
}
```

*Of course, if you don't want to return directly the mongoose because you want to handle the errors for example, you can encapsulate the mongoose promise in you promise. Instead of returning the mongoose's promise, you return your promise with the mongoose's promise in it.*

Now, we can update the query to fetch our Todo. The only thing we have to care about is that we can pass an id to fetch only one Todo. So we have to handle both cases.

```
resolve: (_, {_id}) => {
  where = _id ? {_id} : {};
  return Todo.find(where)
}
```

**Todo.find** is a Promise that return an array. If there is an id in the request, the requested Todo will the first element in this array.

*Here, we return an array even if we want only one Todo. But you can separate the query in 2 queries: one for fetch all the Todos (return an array), another to fecth a Todo by id (return a Todo object)*

### remove the fakeDatabase

The fakeDatabase object and the self-invoking function that fill the database are now become useless, we can remove them to clean our code.


*Congratulation, we now have a real database to manage or Todolist !
You know now how to use a database with GraphQL.*
