-- Seed data for todolists table
INSERT INTO todolists (id, title) VALUES (1, 'Work Todos');
INSERT INTO todolists (id, title) VALUES (2, 'Home Todos');
INSERT INTO todolists (id, title) VALUES (3, 'Additional Todos');
INSERT INTO todolists (id, title) VALUES (4, 'Social Todos');

-- Seed data for todos table
-- Set todo_list_id for these todos to the id from "Work Todos"
INSERT INTO todos (title, done, todo_list_id) VALUES ('Get coffee', true, 1);
INSERT INTO todos (title, done, todo_list_id) VALUES ('Chat with co-workers', true, 1);
INSERT INTO todos (title, done, todo_list_id) VALUES ('Duck out of meeting', false, 1);

-- Set todo_list_id for these todos to the id from "Home Todos"
INSERT INTO todos (title, done, todo_list_id) VALUES ('Feed the cats', true, 2);
INSERT INTO todos (title, done, todo_list_id) VALUES ('Go to bed', true, 2);
INSERT INTO todos (title, done, todo_list_id) VALUES ('Buy milk', true, 2);
INSERT INTO todos (title, done, todo_list_id) VALUES ('Study for Launch School', true, 2);

-- Set todo_list_id for this todo to the id from "Social Todos"
INSERT INTO todos (title, done, todo_list_id) VALUES ('Go to Libby''s birthday party', false, 4);

