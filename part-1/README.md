# Setup Graphql with express.js [part 1]

image = schema ?

The last month, I wanted to try GraphQL, because i've heard a lot about it but didn't know what it was. Graphql is just an API query language, it's not specific to any database or language, so I decided to use it with Express.js because it works well with javascript and I like express.js (really simple to setup a simple server).

The documentation of GraplQL is really good, but it's not specific to any language and I didn't found complete exemples of GraphQL with express.js during my learning. So i've decided to write this article, to help people who are interesting to use graphql with express.js to have a simple example.

(link to github repo)

**What do we want to create?**

I will not change the tradition, we are going to create a simple todolist.

There will be only one model, called Todo, which will be a task on the todolist, with 3 attributes :
- id: to identify uniquely each Todo
- content: the task
- done: a boolean that is true if the task has been completed

In this first article, I will not complicated things with a database. A javascript object will play the role of the database. I will write a second article to show you how to use this source code with a database.

## Fresh install of express.js

Before starting to play with GraphQL, we need to setup an express.js server. So let's do it !

First of all, make sure you have (Node.js)[https://nodejs.org/en/] installed on your computer.

Now, open a terminal, move in your favorite folder, and create a new folder for this project (the name of the folder doesn't matter, but don't name it *graphql* because there will be a conflict with the graphql package).

Go into this new folder and run the following command to init the node project:

`npm init`

This will create a package.json, which describes your project.

Let's install Express.js :

`npm install --save express`

Ok, now we have all we need to setup our server.

Create a new file, called index.js, and add the following code in it :

```
const express = require('express')
const app = express()

app.get('/', _ => res.send("Hello world !"))

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
```

What does this code ?
- import the Express framework
- create a new express app
- create a default route, and say "Hello world!" to the guy who request the root
- run the server on port http://localhost:3000

One last thing to do: I like to run my server using a script of my package.json file. So add `"start": "node index.js"` to your package.json's script property :

```
...
"scripts": {
  "start": "node index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
},
...
```  

You can now run `npm start` in your terminal.

First part done, we have a running server ! You can check on http://localhost:3000, you will see your browser saying you "Hello world!".

## Adding graphql

Now, let's see the interesting part : graphql.

The first thing we need to do is creating the Todo model. As I said, we are not using database in this article, so our model will be a simple ES6 class, describing a Todo.


Create the file `[path to your project]/models/Todo.js` and put this code in it :

```
class Todo {
  /**
   * Todo constructor
   * @param  {String}  content      Text that describes the task to do
   * @param  {Boolean} [done=false] True if the task is done
   */
  constructor(content, done=false) {
    this.id = ++Todo.counter;
    this.content = content;
    this.done = done;


  }
}

// counter of instances
Todo.counter = 0;

module.exports = Todo;

```

As you can see, it's a simple javascript class with the 3 attributes I spoke about in the introduction.

There is a tricky thing by the way : `Todo.counter`. It's a property linked to the Todo class (not linked to an instance of Todo). The goal of this property is to simulate an autoincrementation of the id attribute.

As you can see in the constructor, each time a new Todo is created, we increment the counter, and then, set the id of this new Todo `this.id = ++Todo.counter`. So the ids will be 1, 2, 3, 4, ...

Every graphql service is based on a schema, which describes your data and what you can do on it. Your schema will contains queries and mutations.

Queries are used to fetch data from your GraphQL API. In our case, we only need to fetch all the Todo, or one Todo by Id.

Mutations are used to change data on our server. So we will use mutations in order to create, delete or update a Todo.

Queries and mutations are used to fetch and change our data, but we can't directly touch to our Todo instances. We have to create a graphql todo type, which contains only the fields that can be requested.  

We also need to create our fake database. For this example, we will do it in the same file as our GraphQL schema. So let's create this schema and add our database in it to start.

Create the file `[path to your project]/graphql/schema/Schema.js` and put this code in it :

```
const Todo = require('../../models/Todo')

const fakeDatabase = {};

// fill the fakeDatabase with some todos
(function() {
  const todos = ["Buy some beer", "Buy some pizza", "Learn GraphQL"];
  todos.map(todo => fakeDatabase[Todo.counter] = new Todo(todo));
})()
```

We use a self-invoking function to fill our fake database with some Todo, using the class we've created before.
Now, each time we will run our server, our fakeDatabase object will contains 3 Todos.

Next step: define the graphql todo type. It's really simple, just add this code

Import graphql at the top of the file
`const graphql = require('graphql')`

and this code at the end of the file

```
// define the Todo type for graphql
const TodoType = new graphql.GraphQLObjectType({
  name: 'todo',
  description: 'a todo item',
  fields: {
    id: {type: graphql.GraphQLInt},
    content: {type: graphql.GraphQLString},
    done: {type: graphql.GraphQLBoolean}
  }
})
```

Here, the fields are the same as those in our class.

Then, we create our schema with just the query for the moment.


```
// define the queries of the graphql Schema
const query = new graphql.GraphQLObjectType({
  name: 'TodoQuery',
  fields: {
    todo: {
      type: new graphql.GraphQLList(TodoType),
      args: {
        id: {
          type: graphql.GraphQLInt
        }
      },
      resolve: (_, {id}) => {
        if (id)
          return [fakeDatabase[id]];
        return Object.values(fakeDatabase);
      }
    }
  }
})
```

In the code below, we create a new Type, that's looks similar to the Todo type we've created before.
But, in fact, this type his special, like the mutation type we are going to create later in the article. These two types define the entry point of every Graphql query.

If you look carefully at the code, you can see that we have only one field, called todo. This field has:
- a type: what returned when quey this field
- args: arguments we can pass when querying this type
- a resolve method: where we do some stuff and return the response.

We just need to add some code to exports our schema, at the end of the file :
```
// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query
})
```

Ok, so we have a simple graphql Schema with a Todo graphql type based on our Todo class, that we can query.
But our server can only return "Hello world!" for the moment. So let's add these lines in our index.js and we are good to try the query.

In index.js, import graphql-express and our schema:
```
const graphqlHTTP = require('express-graphql')
const schema = require('./graphql/schema/Schema')
```  

and add this middleware
```
app.use('/graphql', graphqlHTTP({
  schema,
  graphiql: true
}))
```
