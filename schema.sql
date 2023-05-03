DROP TABLE IF EXISTS ingredients;
DROP TABLE IF EXISTS recipes;
DROP TABLE IF EXISTS recipeCollections;
DROP TABLE IF EXISTS users;


CREATE TABLE recipeCollections (
  id serial PRIMARY KEY,
  title text NOT NULL,
  username text NOT NULL,
  UNIQUE (title, username)
);

CREATE TABLE recipes (
  id serial PRIMARY KEY,
  title text NOT NULL,
  prep_time integer NOT NULL DEFAULT 0,
  total_time integer NOT NULL CHECK (total_time >= prep_time),
  instructions text,
  username text NOT NULL,
  collection_id integer NOT NULL REFERENCES recipeCollections(id) ON DELETE CASCADE,
  UNIQUE (title, collection_id)
);

CREATE TABLE ingredients (
  id serial PRIMARY KEY,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  username text NOT NULL,
  recipe_id integer NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
);

CREATE TABLE users (
  username text PRIMARY KEY,
  password text NOT NULL,
  salt text NOT NULL
);