const graphql = require('graphql')
const Todo = require('../../models/Todo')

const fakeDatabase = {
  1: new Todo(1, "Buy some beer"),
  2: new Todo(2, "Buy some pizza"),
  3: new Todo(3, "Learn GraphQL")
}

const TodoType = new graphql.GraphQLObjectType({
  name: 'todo',
  description: 'a todo item',
  fields: {
    id: {type: graphql.GraphQLInt},
    content: {type: graphql.GraphQLString},
    done: {type: graphql.GraphQLBoolean}
  }
})

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
          return [fakeDatabase[id]]
        return Object.values(fakeDatabase)
      }
    }
  }
})

const mutation = new graphql.GraphQLObjectType({
  name: 'TodoMutation',
  fields: {
    createTodo: {
      type: new graphql.GraphQLList(TodoType),
      args: {
        id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLInt)
        },
        content: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {id, content}) => {
        const newTodo = new Todo(id, content)
        fakeDatabase[id] = newTodo
        return Object.values(fakeDatabase)
      }
    }
  }
})

module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})
