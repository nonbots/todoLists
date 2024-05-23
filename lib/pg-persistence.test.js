const Pg = require("./pg-persistence.js");
const pg = new Pg({ userId: 1 });

test("makes two list for records with two list ids", () => {
  const records = [
    {
      todolist_id: 1,
      todolist_title: "todolist 1",
      todolist_user_id: 1,
      todos_id: 1,
      todos_title: "todo 1",
      todos_done: false,
      todos_todolist_id: 1,
      todos_user_id: 1,
    },
    {
      todolist_id: 2,
      todolist_title: "todolist 2",
      todolist_user_id: 1,
      todos_id: 1,
      todos_title: "todo 1",
      todos_done: false,
      todos_todolist_id: 2,
      todos_user_id: 1,
    },
  ];

  const expectedResult = [
    {
      id: 1,
      title: "todolist 1",
      todos: [
        {
          done: false,
          id: 1,
          title: "todo 1",
          todo_list_id: 1,
          user_id: 1,
        },
      ],
      user_id: 1,
    },
    {
      id: 2,
      title: "todolist 2",
      todos: [
        {
          done: false,
          id: 1,
          title: "todo 1",
          todo_list_id: 2,
          user_id: 1,
        },
      ],
      user_id: 1,
    },
  ];

  expect(pg.convertRecords(records)).toEqual(expectedResult);
});

test("makes two todos for a todolist", () => {
  const records = [
    {
      todolist_id: 1,
      todolist_title: "todolist 1",
      todolist_user_id: 1,
      todos_id: 1,
      todos_title: "todo 1",
      todos_done: false,
      todos_todolist_id: 1,
      todos_user_id: 1,
    },
    {
      todolist_id: 1,
      todolist_title: "todolist 1",
      todolist_user_id: 1,
      todos_id: 2,
      todos_title: "todo 2",
      todos_done: false,
      todos_todolist_id: 1,
      todos_user_id: 1,
    },
  ];

  const expectedResult = [
    {
      id: 1,
      title: "todolist 1",
      todos: [
        {
          done: false,
          id: 1,
          title: "todo 1",
          todo_list_id: 1,
          user_id: 1,
        },
        {
          done: false,
          id: 2,
          title: "todo 2",
          todo_list_id: 1,
          user_id: 1,
        },
      ],
      user_id: 1,
    },
  ];

  expect(pg.convertRecords(records)).toEqual(expectedResult);
});
