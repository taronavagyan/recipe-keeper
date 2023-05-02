INSERT INTO recipeCollections (id, title, username) VALUES (1, 'Breads', 'admin');
INSERT INTO recipeCollections (id, title, username) VALUES (2, 'Sandwiches', 'admin');
INSERT INTO recipeCollections (id, title, username) VALUES (3, 'Soups', 'admin');

INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id, username) 
  VALUES (1, 'Banana Bread', 15, 30, 'Make banana bread', 1, 'admin');
INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id, username) 
  VALUES (2, 'Sourdough Bread', 30, 60, 'Make sourdough bread', 1, 'admin');
INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id, username) 
  VALUES (3, 'BLT', 5, 15, 'Make BLT sandwich', 2, 'admin');

INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (1, 'Banana', 2, 'whole', 1, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (2, 'Bread', 1, 'loaf', 1, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (3, 'Sourdough Starter', 1, 'cup', 2, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (4, 'Yeast', 2, 'teaspoons', 2, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (5, 'Flour', 5, 'cups', 2, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (6, 'Bacon', 2, 'pieces', 3, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (7, 'Shredded Lettuce', 1, 'cup', 3, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (8, 'Tomato', 4, 'slices', 3, 'admin');
INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES (9, 'Wheat bread', 1, 'loaf', 3, 'admin');

ALTER sequence recipes_id_seq RESTART WITH 4;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 10;
ALTER SEQUENCE recipecollections_id_seq RESTART WITH 4;