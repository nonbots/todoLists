const seedData = require("./seed-data");
const {sortTodoLists, sortTodos} = require("./sort");
const nextId = require("./next-id");
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
    console.log({todoListId});
    const todoList = this.todoLists.find(todoList => todoList.id === todoListId);
    console.log("IN LOADTODOLIST: TODOLIST", todoList);
    return structuredClone(todoList);
  };
  #findTodoList (todoListId) {
    return this.todoLists.find(todoList => todoList.id === todoListId);
  };

  sortedTodos(list) {
    console.log("LIST",list);
    const undoneTodos = list.filter(todo => !todo.done);
    const doneTodos = list.filter(todo => todo.done);
    return sortTodos(undoneTodos, doneTodos);
  }
  addTodoList (title) {
    this.todoLists.push({
      title,
      id: nextId(),
      todos:[]
    });
  }
  addTodo (todoListId, title) {
    let todoList = this.#findTodoList(todoListId);

    todoList.todos.push({
    title,
    id: nextId(),
    done: false
    });
  }
  deleteTodoList (todoListId) {
    const index = this.todoLists.findIndex(todo => todo.id === todoListId);
    this.todoLists.splice(index, 1);
  }
  deleteTodo (todoListId, todoId) {
    
    const todoList = this.#findTodoList(+todoListId);
    console.log("INPUTID", todoId);
    const index = todoList.todos.findIndex(todo => todo.id === todoId);

    console.log("BEFORE", index);
    console.log("BEFORE", todoList.todos);
    todoList.todos.splice(index, 1); 
    console.log("AFTER", todoList.todos);
  }
  // Find a todo with the indicated ID in the indicated todo list. Returns
  // `undefined` if not found. Note that both `todoListId` and `todoId` must be
  // numeric.
  loadTodo (todoListId, todoId) {
    const todoList = this.loadTodoList(+todoListId);
    return structuredClone(todoList.todos.find(todo => todo.id === todoId));
    
  };
  #findTodo (todoListId, todoId) {
    const todoList = this.#findTodoList(+todoListId);
    return todoList.todos.find(todo => todo.id === todoId);
  };
  toggleDoneTodo(todoListId, todoId) {
    const todo = this.#findTodo(todoListId, todoId);
   if (!todo) return false;

    console.log("BEFORE", todo.done);
    todo.done = !todo.done;
    console.log("AFTER", todo.done);
    return true;
  }

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
  setTitle(todoListId, newTitle){
    const todoList = this.loadTodoList(todoListId);
    todoList.title = newTitle;
  }
  allMarkedDone(todoListId) {
    const todoList = this.#findTodoList(todoListId);
    todoList.forEach(todo => todo.done = true);
  }
};
