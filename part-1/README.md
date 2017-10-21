# Setup Graphql with express.js [part 1]

image = schema ?

After hearing about Graphql during many months, I've decided to try it. Graphql is just an API query language, it's not specific to any database or language, so I've decided to use it with Express.js, because I like it and it's really simple.

The documentation of GraphQL is really good, but it's not specific to any language and I didn't found complete exemples of GraphQL with express.js during my learning. So I've decided to write this article to help people who are interested to use graphql with express.js.

**What are we going to do?**

I will not change the tradition, we are going to create a simple todolist !

There will be only one model, called Todo, which will be a task on the todolist.
A Todo has 3 attributes :
- id: to identify uniquely each Todo
- content: the task's description
- done: a boolean that is true if the task has been completed

To make things simple, there will be no database in this article. Instead, we will use an object as a fake database. I will write a second article to show you how to use this code with a database.

You can find the code [here on my github](https://github.com/prudywsh/graphql-test/tree/master/part-1) :)

## Fresh install of express.js

Before starting to play with GraphQL, we need to setup an express.js server. So let's do it !

First of all, make sure you have [Node.js](https://nodejs.org/en/) installed on your computer.

Open a terminal, go into your favorite folder, and create a new repository for this project (the name of the repository doesn't matter, but don't name it *"graphql"* because there will be a conflict with the graphql package).

Go into this new repository and run the following command to init the node project:

```
npm init
```

Answers the few questions. When you'll be done, a package.json file that describes your project will be created.

Now, you are ready to install Express.js :

```
npm install --save express
```

Now, we have all we need to setup our server.

Create a new file, called index.js, and add the following code in it:

```
const express = require('express')
const app = express()

app.get('/', _ => res.send("Hello world !"))

// run server on port 3000
app.listen('3000', _ => console.log('Server is listening on port 3000...'))
```

What does this code do ?
- import the Express framework
- create a new express app
- create a default route, and say "Hello world!" to the guy who request it
- run the server on port 3000

One last thing to do: I like to run my server using a script of my package.json file. So add `"start": "node index.js"` to your package.json's script property :

```
...
"scripts": {
  "start": "node index.js",
  "test": "echo \"Error: no test specified\" && exit 1"
},
...
```  

You can now run your express.js server :

```
npm start
```

First part done, we have a running server ! You can check on http://localhost:3000, you will see your browser saying you "Hello world!".

## GraphQL

Now, let's see the interesting part: graphql.

Before all, we need to install the following dependencies:

```
npm install --save graphql express-graphql
```

- graphql is the JavaScript reference implementation for GraphQL
- express-graphql to mount a graphql API

### The Todo model

The first thing we need to do is creating the Todo model. As I said, we are not using database in this article, so our model will be a simple ES6 class, describing a Todo.


Create the file `[path to your project]/models/Todo.js` and put this code in it :

```
class Todo {
  /**
   * Todo constructor
   * @param  {String}  content      Text that describes the task to do
   */
  constructor(content) {
    this.id = ++Todo.counter;
    this.content = content;
    this.done = false;
  }
}

// counter of instances
Todo.counter = 0;

module.exports = Todo;
```

As you can see, it's a simple javascript class with the 3 attributes I spoke about in the introduction.

There is a tricky thing by the way : `Todo.counter`. It's a property linked to the Todo class (not linked to an instance of Todo). The goal of this property is to simulate an autoincrementation of the id attribute.

As you can see in the constructor, each time a new Todo is created, we increment the counter, and then, set the id of this new Todo.
```
this.id = ++Todo.counter
```
So the ids will be 1, 2, 3, 4, ...

### GraphQL schema

Every graphql service is based on a schema, which describes your data and what you can do on it. Your schema will contains queries and mutations.

Queries are used to fetch data from your GraphQL API. In our case, we only need to fetch all the Todo, or one Todo by Id.

Mutations are used to change data on our server. So we will use mutations in order to create, delete or update a Todo.

Queries and mutations are used to fetch and change our data, but we can't directly manipulate our Todo instances. We have to create a graphql Todo type, which contains only the fields that can be requested.  

We also need to create our fake database. For this example, we will do it in the same file as our GraphQL schema. So let's create this schema and add our database in it.

#### Create the fake database

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

Next step: define the graphql Todo type.

#### Create the Todo type

Import graphql at the top of the file
`const graphql = require('graphql')`

and put this code at the end of the file :

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

In our case, the fields are the same as those in our Todo model.

#### Create the Query type

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

In the code below, we create a new Type, that's looks similar to the Todo type we've created before. But, in fact, this type his special, like the mutation type we are going to create after.

These two types define the entry point of every Graphql query.

If you look carefully at the code, you can see that we have only one field, called todo. This field has:
- a type: what is returned when query this field
- args: arguments we can pass when querying this type
- a resolve method: where we do the treatment of the request and return the response

#### export the schema

We need to add some code to exports our schema, at the end of the file :
```
// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query
})
```

#### create the graphql endpoint

Ok, so we have a simple graphql Schema with a Todo graphql type based on our Todo class, that we can query.
But our server can only return "Hello world!" for the moment. So let's add these lines in our index.js and we are good to try the query.

In index.js, import express-graphql and our schema:
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

We set `graphiql` to true in order to activate Graphiql. It's a graphical interface that allow us to interact easily with our API. So it's perfect to test what we did.

#### let's test our query

Run `npm start` and go to `http://localhost:3000/graphql`. If all is ok, you should see the graphiql interface.

Query all todo with all fields :

```
query {
    todo {
        id,
        content,
        done
    }
}
```

Query a todo by id, with all fields :

```
query {
    todo(id: 3) {
        id,
        content,
        done
    }
}
```

#### Create the mutations

Last thing we need to do: add mutations !

Go back to `Schema.js`, and add the following code:

```
// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'TodoMutation',
  fields: {
    createTodo: {
      type: new graphql.GraphQLList(TodoType),
      args: {
        content: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {content}) => {
        const newTodo = new Todo(content);
        fakeDatabase[newTodo.id] = newTodo;
        return Object.values(fakeDatabase);
      }
    },
    checkTodo: {
      type: new graphql.GraphQLList(TodoType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        fakeDatabase[id].done = true;
        return Object.values(fakeDatabase);
      }
    },
    deleteTodo: {
      type: new graphql.GraphQLList(TodoType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        }
      },
      resolve: (_, {id}) => {
        delete fakeDatabase[id];
        return Object.values(fakeDatabase);
      }
    }
  }
})
```

That's a lot of code, but it's really similar to the code of the query type. The 3 fields are:
- createTodo: mutation to create a new Todo. The only parameter is content and it's required
- checkTodo: given the id of a todo, the mutation set the done attribute of this todo to true
- deleteTodo: given the id of a todo, delete this todo

Add the mutation type in the exports of our schema:
```
// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})
```

And we are done, we have all we need. Let's try the mutations !

#### let's test our mutations

Create a new todo:
```
mutation {
    createTodo(content: "todo I created") {
        id,
        content,
        done
    }
}
```

Update the new Todo to the done attribute to true:
```
mutation {
    checkTodo(id: 4) {
        id,
        content,
        done
    }
}
```

Delete the Todo:
```
mutation {
    deleteTodo(id: 4) {
        id,
        content,
        done
    }
}
```

Congratulation ! You just wrote a GraphQL server to manage your todolist !
You now know how to build a simple graphql crud API with express.js.
In the next part, I will show you how to replace the fake database we've used in this article by a real database.
