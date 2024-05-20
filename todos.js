const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const app = express();
const host = "localhost";
const port = 3001;
const LokiStore = store(session);
const PgPersistence = require("./lib/pg-persistence.js");
//const {persistence} = require("./lib/get-config.js");
//const Persistence = require(persistence);
const catchError = require("./lib/catch-error");
app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));
app.use(session({
  cookie: {
    httpOnly: true,
    maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in millseconds
    path: "/",
    secure: false,
  },
  name: "launch-school-todos-session-id",
  resave: false,
  saveUninitialized: true,
  secret: "this is not very secure",
  store: new LokiStore({}),
}));

app.use(flash());
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

// Extract session info
app.use((req, res, next) => {
  res.locals.signedIn = req.session.signedIn;
  res.locals.username = req.session.username;

  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Redirect start page
app.get("/", (req, res) => {
  res.redirect("/lists");
});

// Render the signin page
app.get("/users/signin", (req, res) => {
 // req.flash("info", "Please sign in.");
  res.render("signin"/*, {flash: req.flash()}*/);
}); 
// User signs in 
app.post("/users/signin", async(req, res) => {
  const username = req.body.username;
  const password  = req.body.password;
  const authenicatedUser = await res.locals.store.validateUser(username, password);
  if (authenicatedUser) {
    req.flash("info", "Welcome!");
    console.log("SIGN_IN", authenicatedUser);
    req.session.username = authenicatedUser.username;
    req.session.signedIn = true;
    res.redirect("/lists");
  }else{
    req.flash("error", "Invalid credentials");
    res.redirect("/users/signin");
  }
});

//User signs out
app.post("/users/signout", (req, res) => {
  //req.session.signedIn = false;
  delete req.session.username;
  delete req.session.signedIn;
  res.redirect("/users/signin");
});
// Render the list of todo lists
app.get("/lists", 
  catchError(async (req, res) => {
    let store = res.locals.store;
    let todoLists = await store.sortedTodoLists();
    let todosInfo = todoLists.map( todoList => {
      return {
        countAllTodos: todoList.todos.length,
        countDoneTodos: todoList.todos.filter(todo => todo.done).length,
        isDone: store.isDoneTodoList(todoList)
      }
    });
    res.render("lists", {
      todoLists,
      todosInfo,
  //    signedIn: req.session.signedIn,
  //    username: req.session.username,
    });
  })
);
function anonUser(req, res, next) {
  if(!req.session.signedIn) {
    res.redirect("/users/signin");
  }else{
    next();
  }
}
// Render new todo list page
app.get("/lists/new", anonUser, (req, res) => {
  res.render("new-list");
});
// Create a new todo list
app.post("/lists",
  anonUser,
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
  ],
  catchError(
    async(req, res)=> {
      let errors = validationResult(req);
      let todoListTitle = req.body.todoListTitle;

      const rerenderNewList = () => {
        res.render("new-list", {
          todoListTitle,
          flash: req.flash(),
        });
      };

      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        rerenderNewList();
      } else if (await res.locals.store.existsTodoListTitle(todoListTitle)) {
        req.flash("error", "The list title must be unique.");
        rerenderNewList();
      } else {
        let created = await res.locals.store.addTodoList(todoListTitle);
        if (!created) {
          req.flash("error", "The list title must be unique.");
          rerenderNewList();
        } else {
          req.flash("success", "The todo list has been created.");
          res.redirect("/lists");
        }
      }
    })
  );

// Render individual todo list and its todos
app.get("/lists/:todoListId", 
  catchError(async (req, res) => {
    let todoListId = req.params.todoListId;
    const todoList = await res.locals.store.loadTodoList(+todoListId);
    if (todoList === undefined) {
      throw new Error("Not found.");
    } else {
      console.log("TODOLIST IN LIST", todoList);
      todoList.todos = await res.locals.store.sortedTodos(todoList);
      console.log("TODOS IN LIST", todoList.todos);
      res.render("list", {
        todoList,
        todos: todoList.todos,
        hasUndoneTodos: res.locals.store.hasUndoneTodos(todoList),
        //todos:  res.locals.store.sortedTodos(todoList.todos),
        isAllTodosDone:  res.locals.store.isDoneTodoList(todoList)
      });
    }
  })
);

// Toggle completion status of a todo
app.post("/lists/:todoListId/todos/:todoId/toggle", 
  anonUser,
  catchError(async(req, res)=> {
    let { todoListId, todoId } = req.params;
    let toggledTodo = res.locals.store.toggleDoneTodo(+todoListId, +todoId);
    if (!toggledTodo) {
      throw new Error("Not found.");
    } else {
      let todo = await res.locals.store.loadTodo(+todoListId, +todoId);
      if (todo.done) {
        req.flash("success", `"${todo.title}" marked as NOT done!`);
      } else {
        req.flash("success", `"${todo.title}" marked done.`);
      }

      res.redirect(`/lists/${todoListId}`);
    }
  })
);

// Delete a todo
app.post("/lists/:todoListId/todos/:todoId/destroy", 
  anonUser,
  catchError(async (req, res) => {
    let { todoListId, todoId } = { ...req.params };
    let deleted = res.locals.store.deleteTodo(+todoListId, +todoId);

    if (!deleted) throw new Error("Not found.");
    req.flash("success", "The todo has been deleted.");
    res.redirect(`/lists/${todoListId}`);
  })
);

// Mark all todos as done
app.post("/lists/:todoListId/complete_all", 
  anonUser,
  catchError(async(req, res) => {
    let todoListId = req.params.todoListId;
    let completeAll = await res.locals.store.completeAllTodos(+todoListId);
    if (!completeAll) throw new Error("Not found.");
    req.flash("success", "All todos have been marked as done.");
    res.redirect(`/lists/${todoListId}`);
  })
);
// Create a new todo and add it to the specified list
app.post("/lists/:todoListId/todos",
  anonUser,
  [
    body("todoTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The todo title is required.")
      .isLength({ max: 100 })
      .withMessage("Todo title must be between 1 and 100 characters."),
  ],
  catchError(async(req, res) => {
    let todoListId = req.params.todoListId;
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach(message => req.flash("error", message.msg));
      let todoList = await res.locals.store.loadTodoList(+todoListId);
      if (!todoList) throw new Error("Not found.");
      todoList.todos = await res.locals.store.sortedTodos(todoList);
      res.render("list", {
        flash: req.flash(),
        todoList,
        todos: todoList.todos,
        //todos: await res.locals.store.sortedTodos(todoList.todos),
        hasUndoneTodos: res.locals.store.hasUndoneTodos(todoList),
        todoTitle: req.body.todoTitle,
      });
    } else {
      const created =  await res.locals.store.addTodo(+todoListId, req.body.todoTitle);
      if (!created) throw new Error("Not found.");
      req.flash("success", "The todo has been created.");
      res.redirect(`/lists/${todoListId}`);
    }
  })
);

// Render edit todo list form
app.get("/lists/:todoListId/edit", 
  anonUser, 
  catchError(async(req, res) => {
    let todoListId = req.params.todoListId;
    let todoList = await res.locals.store.loadTodoList(+todoListId);
    if (!todoList) throw new Error("Not found.");
    res.render("edit-list", { todoList });
  })
);

// Delete todo list
app.post("/lists/:todoListId/destroy", 
  anonUser,
  catchError(async(req, res) => {
    const todoListId = +req.params.todoListId;
    const deleted = await res.locals.store.deleteTodoList(todoListId);
    if (!deleted) throw new Error("Not found.");
    req.flash("success", "Todo list deleted.");
    res.redirect("/lists");
  })
);

// Edit todo list title
app.post("/lists/:todoListId/edit",
  anonUser,
  [
    body("todoListTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The list title is required.")
      .isLength({ max: 100 })
      .withMessage("List title must be between 1 and 100 characters.")
 ],
  catchError(async(req, res)=> {
    let store = res.locals.store;
    let todoListId = req.params.todoListId;
    let todoListTitle = req.body.todoListTitle;

    const rerenderEditList = async() => {
      const todoList = await store.loadTodoList(+todoListId);
      if(!todoList) throw new Error("Not found.");
      res.render("edit-list", {
        todoListTitle,
        todoList,
        flash: req.flash(),
      });
    };
    try {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach(message => req.flash("error", message.msg));
        rerenderEditList();
      } else if (await res.locals.store.existsTodoListTitle(todoListTitle)) {
        req.flash("error", "The list title must be unique.");
        rerenderEditList();
      } else {
        const updated = await store.setTodoListTitle(+todoListId, todoListTitle);
        if (!updated) throw new Error("Not found.");
        req.flash("success", "Todo list updated.");
        res.redirect(`/lists/${todoListId}`);
      }
    } catch(error) {
      if (store.isUniqueConstraintViolation(error)) {
        req.flash("error", "The list title must be unique.");
        rerenderEditList();
      } else {
        throw error;
      }
    }
  })
);

// Error handler
app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});

// Listener
app.listen(port, host, () => {
  console.log(`Todos is listening on port ${port} of ${host}!`);
});
