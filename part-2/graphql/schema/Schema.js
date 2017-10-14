const graphql = require('graphql')
const Todo = require('../../models/Todo')

// define the Todo type for graphql
const TodoType = new graphql.GraphQLObjectType({
  name: 'todo',
  description: 'a todo item',
  fields: {
    _id: {type: graphql.GraphQLString},
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
        _id: {
          type: graphql.GraphQLString
        }
      },
      resolve: (_, {_id}) => {
        where = _id ? {_id} : {};
        return new Promise((resolve, reject) => {
          Todo.find(where)
            .then(data => resolve(data))
            .catch(err => reject(err))
        })
      }
    }
  }
})

// define the mutations of the graphql Schema
const mutation = new graphql.GraphQLObjectType({
  name: 'TodoMutation',
  fields: {
    createTodo: {
      type: TodoType,
      args: {
        content: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {content}) => {
        return new Promise((resolve, reject) => {
          const newTodo = new Todo({content, done: false});
          newTodo.save()
            .then(todo => resolve(todo))
            .catch(err => reject(err))
        })
      }
    },
    checkTodo: {
      type: TodoType,
      args: {
        _id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {_id}) => {
        return new Promise((resolve, reject) => {
          Todo.findById(_id)
            .then(todo => {
              todo.done = true;
              return todo.save();
            })
            .then(todo => resolve(todo))
            .catch(err => reject(err))
        })
      }
    },
    deleteTodo: {
      type: TodoType,
      args: {
        _id: {
          type: new graphql.GraphQLNonNull(graphql.GraphQLString)
        }
      },
      resolve: (_, {_id}) => {
        return new Promise((resolve, reject) => {
          Todo.findOneAndRemove(_id)
            .then(todo => resolve(todo))
            .catch(err => reject(err))
        })
      }
    }
  }
})

// create and exports the graphql Schema
module.exports = new graphql.GraphQLSchema({
  query,
  mutation
})
