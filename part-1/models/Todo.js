module.exports = class Todo {
  constructor(id, content, done=false) {
    this.id = id;
    this.content = content;
    this.done = done;
  }
}
