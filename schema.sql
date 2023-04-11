CREATE TABLE recipe_collections (
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE
);

CREATE TABLE recipes (
  id serial PRIMARY KEY,
  title text NOT NULL UNIQUE,
  prep_time integer NOT NULL DEFAULT 0,
  total_time integer NOT NULL CHECK (total_time >= prep_time),
  instructions text NOT NULL UNIQUE,
  collection_id integer NOT NULL REFERENCES recipe_collections(id) ON DELETE CASCADE
);

CREATE TABLE ingredients (
  id serial PRIMARY KEY,
  name text NOT NULL,
  quantity integer NOT NULL CHECK (quantity > 0),
  unit text NOT NULL,
  recipe_id integer NOT NULL REFERENCES recipes(id) ON DELETE CASCADE
);