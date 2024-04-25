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
  // Find a todo list with the indicated ID. Returns `undefined` if not found.
  // Note that `todoListId` must be numeric.
  loadTodoList (todoListId) {
    return this.todoLists.find(todoList => todoList.id === todoListId);
  };

  sortedTodos(list) {
    console.log("LIST",list);
    const undoneTodos = list.filter(todo => !todo.done);
    const doneTodos = list.filter(todo => todo.done);
    return sortTodos(undoneTodos, doneTodos);
  }
  addTodo (todoListId, todo) {
    let todoList = this.loadTodoList(+todoListId);
    todoList.todos.push(todo);
  }
  deleteTodoList (todoListId) {
    const index = this.todoLists.indexOf(todoListId);
    this.todoLists.splice(index, 1);
  }
  deleteTodo (todoListId, todoId) {
    
    const todoList = this.loadTodoList(+todoListId);
    const index = todoList.todos.findIndex(todo => todo.id === todoId);
    todoList.todos.splice(index, 1); 
  }
  // Find a todo with the indicated ID in the indicated todo list. Returns
  // `undefined` if not found. Note that both `todoListId` and `todoId` must be
  // numeric.
  loadTodo (todoListId, todoId) {
    const todoList = this.loadTodoList(+todoListId);
    return todoList.todos.find(todo => todo.id === todoId);
  };

  isDone (todoListId, todoId) {
    const todo = this.loadTodo(todoListId, todoId);
    return todo.done; 
  }

  done (todoListId, todoId) {
    const todo = this.loadTodo(todoListId, todoId);
    todo.done = true;
  }
  undone (todoListId, todoId) {
      const todo = this.loadTodo(todoListId, todoId);
      todo.done = false;
    }
};
