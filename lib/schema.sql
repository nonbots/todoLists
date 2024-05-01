CREATE TABLE todolists (
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE
);

CREATE TABLE todos (
  id serial PRIMARY KEY, 
  title text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  todo_List_id integer NOT NULL REFERENCES todolists(id) ON DELETE CASCADE
);
