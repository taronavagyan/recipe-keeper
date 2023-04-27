DELETE FROM ingredients;
DELETE FROM recipes;
DELETE FROM recipeCollections;

INSERT INTO recipeCollections (id, title) VALUES (1, 'Breads');
INSERT INTO recipeCollections (id, title) VALUES (2, 'Sandwiches');
INSERT INTO recipeCollections (id, title) VALUES (3, 'Soups');

INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id) VALUES (1, 'Banana Bread', 15, 30, 'Make banana bread', 1);
INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id) VALUES (2, 'Sourdough Bread', 30, 60, 'Make sourdough bread', 1);
INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id) VALUES (3, 'BLT', 5, 15, 'Make BLT sandwich', 2);

INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (1, 'Banana', 2, 'bananas', 1);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (2, 'Bread', 1, 'loaf', 1);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (3, 'Sourdough Starter', 1, 'cup', 2);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (4, 'Yeast', 2, 'tablespoons', 2);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (5, 'Flour', 5, 'cups', 2);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (6, 'Bacon', 2, 'pieces', 3);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (7, 'Lettuce', 0.5, 'head', 3);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (8, 'Tomato', 4, 'slices', 3);
INSERT INTO ingredients (id, name, quantity, unit, recipe_id) VALUES (9, 'Wheat bread', 1, 'loaf', 3);

ALTER sequence recipes_id_seq RESTART WITH 4;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 10;
ALTER SEQUENCE recipecollections_id_seq RESTART WITH 4;
