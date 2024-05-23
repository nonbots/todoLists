const Pg = require("./pg-persistence.js");
const pg =  new Pg({userId: 1});
const records = [{todolist_id: 1,
                  todolist_title: "todolist 1", 
                  todolist_user_id: 1,
                  todos_id: 1,
                  todos_title:"todo 1",
                  todos_done: false, 
                  todos_todolist_id : 1, 
                  todos_user_id : 1
                },{
                  todolist_id: 2,
                  todolist_title: "todolist 2", 
                  todolist_user_id: 1,
                  todos_id: 1,
                  todos_title:"todo 1",
                  todos_done: false, 
                  todos_todolist_id : 2, 
                  todos_user_id : 1
                }];
/*
 * [{id....todos: [{id..}], ....}
*/


const transformedData = pg.convertRecords(records);
console.log("FINAL RESULT", transformedData);
