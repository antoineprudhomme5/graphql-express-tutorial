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
