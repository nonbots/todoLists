const seedData = require("./seed-data");
const {sortTodoLists, sortTodos} = require("./sort");
module.exports = class SessionPersistence {
  constructor(session){
    this.todoLists = session.todoLists || structuredCloned(seedData);
    session.todoLists = this.todoLists;
  }
  sortedTodoLists() {
    let todoLists = structuredClone(this.todoLists);
    let undoneList = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let doneList = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undoneList, doneList);
  }
  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done);
  }
};
