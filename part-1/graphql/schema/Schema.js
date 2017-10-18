const graphql = require('graphql')
const Todo = require('../../models/Todo')

const fakeDatabase = {};

// fill the fakeDatabase with some todos
(function() {
  const todos = ["Buy some beer", "Buy some pizza", "Learn GraphQL"];
  todos.map(todo => fakeDatabase[Todo.counter] = new Todo(todo));
})()

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
          return [fakeDatabase[id-1]];
        return Object.values(fakeDatabase);
      }
    }
  }
})

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

// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})
