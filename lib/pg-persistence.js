const seedData = require("./seed-data.js");
const {sortTodoLists, sortTodos} = require("./sort");
const nextId = require("./next-id");
const {dbQuery} = require("./db-query");

module.exports = class PgPersistence {
  
  constructor(session){
    this.todoLists = session.todoLists || structuredClone(seedData);
    session.todoLists = this.todoLists;
  }

  async testQuery1() {
    const SQL = "SELECT * FROM todolists";
    const result = await dbQuery(SQL);
    console.log("query1", result.rows);
  }

  async testQuery2() {
    const SQL = "SELECT * FROM todos";
    const result = await dbQuery(SQL);
    console.log("query2", result.rows);
  }
  
  async todoListTitleQuery(title) {
    const SQL =  'SELECT * FROM todolists WHERE title = $1';
    const result = await dbQuery(SQL, title);
    console.log("todoListByTitle", result.rows[0]);
  }
  #findTodoList (todoListId) {
    return this.todoLists.find(todoList => todoList.id === todoListId);
  };

  loadTodoList (todoListId) { 
    console.log({todoListId});
    const todoList = this.todoLists.find(todoList => todoList.id === todoListId);
    return structuredClone(todoList);
  };

  isDoneTodoList(todoList) {
    return todoList.todos.length > 0 && todoList.todos.every(todo => todo.done); 
  }

  sortedTodoLists() {
    let todoLists = structuredClone(this.todoLists);
    let undoneList = todoLists.filter(todoList => !this.isDoneTodoList(todoList));
    let doneList = todoLists.filter(todoList => this.isDoneTodoList(todoList));
    return sortTodoLists(undoneList, doneList);
  }

  existsTodoListTitle(title) {
    return this.todoLists.some(todoList => todoList.title === title);
  }

  setTitle(todoListId, newTitle){
    const todoList = this.#findTodoList(todoListId);
    todoList.title = newTitle;
    return true;
  }

  addTodoList (title) {
    this.todoLists.push({
      title,
      id: nextId(),
      todos:[]
    });
    return true;
  }

  deleteTodoList (todoListId) {
    const index = this.todoLists.findIndex(todo => todo.id === todoListId);
    this.todoLists.splice(index, 1);
  }
  
  loadTodo (todoListId, todoId) {
    const todoList = this.loadTodoList(+todoListId);
    return structuredClone(todoList.todos.find(todo => todo.id === todoId));
    
  };

  #findTodo (todoListId, todoId) {
    const todoList = this.#findTodoList(+todoListId);
    return todoList.todos.find(todo => todo.id === todoId);
  };
 
    sortedTodos(list) {
    const undoneTodos = list.filter(todo => !todo.done);
    const doneTodos = list.filter(todo => todo.done);
    return sortTodos(undoneTodos, doneTodos);
  }

  addTodo (todoListId, title) {
    let todoList = this.#findTodoList(todoListId);
    todoList.todos.push({
    title,
    id: nextId(),
    done: false
    });
    return true;
  }

   deleteTodo (todoListId, todoId) {
    const todoList = this.#findTodoList(+todoListId);
    const index = todoList.todos.findIndex(todo => todo.id === todoId);
    todoList.todos.splice(index, 1); 
  }

 toggleDoneTodo(todoListId, todoId) {
    const todo = this.#findTodo(todoListId, todoId);
    if (!todo) return false;
    todo.done = !todo.done;
    return true;
  }

  allMarkedDone(todoListId) {
    const todoList = this.#findTodoList(todoListId);
    todoList.forEach(todo => {
      todo.done = true;
    });
  }
};

