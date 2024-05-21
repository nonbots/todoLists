DROP TABLE IF EXISTS todos;
DROP TABLE IF EXISTS todolists;
DROP TABLE IF EXISTS users;

CREATE TABLE users (
  id serial PRIMARY KEY,
  username text NOT NULL UNIQUE,
  password text NOT NULL
);

CREATE TABLE todolists (
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE,
  user_id integer NOT NULL REFERENCES users(id)
);

CREATE TABLE todos (
  id serial PRIMARY KEY, 
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  todo_List_id integer NOT NULL REFERENCES todolists(id) ON DELETE CASCADE,
  user_id integer NOT NULL REFERENCES users(id)
);

INSERT INTO users (username, password)
  VALUES ('admin', '$2b$10$wZsR2FCY/pyq/sKlvh4uiO9e.1mzdifcgHcQhPdAOJmpyaBv0wSn.'), --secret
         ('developer', '$2b$10$D.AnPm3SpYY3x87WrDIv..Axm.y4Hex4FraYUvI4AdcP3qZkKS6Oy'), --letmein
         ('somebody', '$2b$10$nPH.EMq3I1AJeAtOeFYb2u8qKrPoflfVjFiIDbjvkvPSSRuAEAHSa'); --knock-knock

-- Seed data for todolists table
INSERT INTO todolists (id, title, user_id) VALUES (1, 'Work Todos', 1);
INSERT INTO todolists (id, title, user_id) VALUES (2, 'Home Todos', 1);
INSERT INTO todolists (id, title, user_id) VALUES (3, 'Additional Todos', 1);
INSERT INTO todolists (id, title, user_id) VALUES (4, 'Social Todos', 1);

-- Seed data for todos table
-- Set todo_list_id for these todos to the id from "Work Todos"
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Get coffee', true, 1, 1);
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Chat with co-workers', true, 1, 1);
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Duck out of meeting', false, 1, 1);

-- Set todo_list_id for these todos to the id from "Home Todos"
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Feed the cats', true, 2, 1);
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Go to bed', true, 2, 1);
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Buy milk', true, 2, 1);
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Study for Launch School', true, 2, 1);

-- Set todo_list_id for this todo to the id from "Social Todos"
INSERT INTO todos (title, done, todo_list_id, user_id) VALUES ('Go to Libby''s birthday party', false, 4, 1);




