const seedData = require("./seed-data.js");
const { sortTodoLists, sortTodos } = require("./sort");
const nextId = require("./next-id");
const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");
module.exports = class PgPersistence {
  constructor(session) {
    this.user_id = session.userId;
  }
  async sortedTodoLists() {
    const ALL_TODOLISTS = `SELECT 
    todolists.id AS todolist_id, 
    todolists.title AS todolist_title, 
    todolists.user_id AS todolist_user_id,
    todos.id AS todo_id,
    todos.title AS todo_title,
    todos.done AS todo_done,
    todos.todo_list_id AS todos_todolist_id,
    todos.user_id AS todo.user_id 
    FROM todolists JOIN todos ON todolists.id = todos.todo_list_id 
    WHERE user_id = $1 ORDER BY lower(todolists.title)`;
    const result = await dbQuery(ALL_TODOLISTS, this.user_id);
    return this.#partitionTodoLists(result.rows);
  }

  convertRecords(records) {
    const todolists = [];
    let todolist = {};
    let previousTodoListId;
    for (let i = 0; i < records.length; i += 1) {
      const record = records[i];
      // appends a todo to todos property on an existing todolist
      if (
        record.todolist_id === previousTodoListId &&
        todolist["id"] !== undefined
      ) {
        // 2 === 1
        const todo = {
          id: record.todos_id,
          title: record.todos_title,
          done: record.todos_done,
          todo_list_id: record.todos_todolist_id,
          user_id: record.todos_user_id,
        };
        todolist["todos"].push(todo);
        console.log("IN IF", todolists);
      } else {
        // add the todolist if not empty to the collection of todolists
        // creates a new todolist
        if (Object.keys(todolist).length !== 0) todolists.push(todolist);
        todolist = {};
        todolist.id = record.todolist_id;
        todolist.title = record.todolist_title;
        todolist.user_id = record.todolist_user_id;
        todolist.todos = [
          {
            id: record.todos_id,
            title: record.todos_title,
            done: record.todos_done,
            todo_list_id: record.todos_todolist_id,
            user_id: record.todos_user_id,
          },
        ];
        console.log("IN ELSE", todolists);
      }
      previousTodoListId = todolist.id; //1
      console.log("PREVIOUSTODOLISTID", previousTodoListId);
    }
    if (Object.keys(todolist).length !== 0) todolists.push(todolist);
    return todolists;
  }

  isDoneTodoList(todoList) {
    return (
      todoList.todos.length > 0 && todoList.todos.every((todo) => todo.done)
    );
  }

  #partitionTodoLists(todoLists) {
    let undone = [];
    let done = [];
    todoLists.forEach((todoList) => {
      if (this.isDoneTodoList(todoList)) {
        done.push(todoList);
      } else {
        undone.push(todoList);
      }
    });
    return undone.concat(done);
  }

  async loadTodoList(todoListId) {
    const FIND_TODOLIST = "SELECT * FROM todolists WHERE id = $1";
    const FIND_TODOS = "SELECT * FROM todos WHERE todo_list_id = $1";

    const resultTodoList = dbQuery(FIND_TODOLIST, todoListId);
    const resultTodos = dbQuery(FIND_TODOS, todoListId);
    let resultBoth = await Promise.all([resultTodoList, resultTodos]);
    let todoList = resultBoth[0].rows[0];
    if (!todoList) return undefined;

    todoList.todos = resultBoth[1].rows;
    return todoList;
  }

  async loadTodo(todoListId, todoId) {
    const FIND_TODO = "SELECT * FROM todos WHERE todo_list_id = $1 AND id = $2";
    const resultTodo = await dbQuery(FIND_TODO, todoListId, todoId);
    return resultTodo.rows[0];
  }

  async toggleDoneTodo(todoListId, todoId) {
    const TOGGLE_TODO =
      "UPDATE todos SET done = NOT done WHERE todo_list_id = $1 AND id = $2";
    const updateTodo = await dbQuery(TOGGLE_TODO, todoListId, todoId);
    return updateTodo.rowCount > 0;
  }

  async sortedTodos(list) {
    const SORT_TODOS =
      "SELECT * FROM todos WHERE todo_list_id = $1 ORDER BY done, lower(title)";
    const resultSorted = await dbQuery(SORT_TODOS, list.id);
    return resultSorted.rows;
  }

  isDoneTodoList(todoList) {
    return (
      todoList.todos.length > 0 && todoList.todos.every((todo) => todo.done)
    );
  }

  async addTodo(todoListId, title) {
    const ADDTODO =
      "INSERT INTO todos (todo_list_id, title, user_id) VALUES ($1, $2, $3)";
    const result = await dbQuery(ADDTODO, todoListId, title, this.user_id);
    return result.rowCount > 0;
  }

  async addTodoList(title) {
    console.log("IN ADDTODOLIST", this.user_id);
    const ADDTODOLIST =
      "INSERT INTO todoLists (title, user_id) VALUES ($1, $2)";
    try {
      const result = await dbQuery(ADDTODOLIST, title, this.user_id);
      return result.rowCount > 0;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) return false;
      throw error;
    }
  }

  async deleteTodoList(todoListId) {
    const DELETETODOLIST = "DELETE FROM todolists WHERE id = $1";
    let result = await dbQuery(DELETETODOLIST, todoListId);
    return result.rowCount > 0;
  }

  async deleteTodo(todoListId, todoId) {
    const DELETETODO = "DELETE FROM todos WHERE todo_list_id = $1 AND id = $2";
    let result = await dbQuery(DELETETODO, todoListId, todoId);
    return result.rowCount > 0;
  }

  hasUndoneTodos(todoList) {
    return todoList.todos.some((todo) => !todo.done);
  }

  async completeAllTodos(todoListId) {
    const COMPLETE_ALL =
      "UPDATE todos SET done = TRUE" +
      "  WHERE todo_list_id = $1 AND NOT done" +
      "  AND user_id = $2";

    let result = await dbQuery(COMPLETE_ALL, todoListId, this.user_id);
    return result.rowCount > 0;
  }

  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }

  // Returns a Promise that resolves to `true` if a todo list with the specified
  // title exists in the list of todo lists, `false` otherwise.
  async existsTodoListTitle(title) {
    const FIND_TODOLIST = "SELECT null FROM todolists WHERE title = $1";
    let result = await dbQuery(FIND_TODOLIST, title);
    console.log("IN EXISTSTODOLISTTILE", result);
    return result.rowCount > 0;
  }

  // Set a new title for the specified todo list. Returns a promise that
  // resolves to `true` on success, `false` if the todo list wasn't found.
  async setTodoListTitle(todoListId, title) {
    const UPDATE_TITLE = "UPDATE todolists SET title = $1 WHERE id = $2";
    let result = await dbQuery(UPDATE_TITLE, title, todoListId);
    return result.rowCount > 0;
  }

  async validateUser(username, password) {
    const FIND_USER = "SELECT * FROM users WHERE username = $1";
    const result = await dbQuery(FIND_USER, username);
    console.log("IN VALIDATEUSER: result", result);
    if (result.rowCount > 0) {
      const match = await bcrypt.compare(password, result.rows[0].password);
      console.log("IN VALIDATEUSER", result.rows);
      if (match) return result.rows[0];
    }
    return false;
  }
};
