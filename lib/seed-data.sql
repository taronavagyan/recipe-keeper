INSERT INTO recipeCollections (id, title, username) VALUES 
  (1, 'Salads', 'admin'), 
  (2, 'Pasta', 'admin'), 
  (3, 'Desserts', 'admin');


INSERT INTO recipes (id, title, prep_time, total_time, instructions, collection_id, username) 
  VALUES 
  (1, 'Greek Salad', 10, 10, 'To make a Greek salad, first wash and chop lettuce, tomatoes, cucumbers, and onions. Then, add feta cheese and kalamata olives. In a separate bowl, whisk together olive oil, red wine vinegar, lemon juice, garlic, oregano, salt, and pepper. Pour the dressing over the salad and toss to combine.', 1, 'admin'), 
  (2, 'Spaghetti Bolognese', 15, 45, 'To make spaghetti bolognese, first heat oil in a large saucepan over medium heat. Add chopped onions, garlic, and carrots and cook until softened. Add ground beef and cook until browned. Then, add canned tomatoes, tomato paste, beef broth, and seasonings. Let the sauce simmer for 30 minutes. Serve over cooked spaghetti noodles.', 2, 'admin'), 
  (3, 'Chocolate Cake', 30, 60, 'To make chocolate cake, first preheat the oven to 350°F. In a large bowl, whisk together flour, cocoa powder, baking powder, baking soda, and salt. In a separate bowl, beat together butter, sugar, eggs, and vanilla extract. Gradually add in the dry ingredients, alternating with milk, until well combined. Pour the batter into a greased baking dish and bake for 30-35 minutes. Let the cake cool before serving.', 3, 'admin'),
  (5, 'Caprese Salad', 5, 5, 'To make Caprese salad, slice fresh tomatoes and mozzarella cheese. Layer them alternately on a plate. Drizzle with olive oil and balsamic vinegar. Sprinkle with salt and pepper. Garnish with fresh basil leaves.', 1, 'admin'), 
  (6, 'Chicken Caesar Salad', 15, 15, 'To make chicken Caesar salad, first grill chicken breast until cooked through. Wash and chop romaine lettuce. Add grilled chicken, croutons, and parmesan cheese. In a separate bowl, mix together Caesar dressing, lemon juice, Worcestershire sauce, and garlic. Pour the dressing over the salad and toss to combine.', 1, 'admin'),
  (7, 'Asian Slaw Salad', 10, 10, 'To make Asian Slaw Salad, first chop cabbage, carrots, and red pepper into thin strips. In a separate bowl, mix together rice vinegar, sesame oil, soy sauce, honey, and grated ginger. Pour the dressing over the salad and toss to combine. Top with chopped scallions and toasted sesame seeds.', 1, 'admin'),
  (8, 'Mediterranean Chickpea Salad', 10, 10, 'To make Mediterranean Chickpea Salad, first mix together chickpeas, diced cucumber, diced tomatoes, diced red onion, and chopped parsley in a large bowl. In a separate bowl, whisk together olive oil, lemon juice, garlic, salt, and pepper. Pour the dressing over the salad and toss to combine. Top with crumbled feta cheese.', 1, 'admin');
  


INSERT INTO ingredients (id, name, quantity, unit, recipe_id, username) 
  VALUES 
  (1, 'Lettuce', 1, 'head', 1, 'admin'), 
  (2, 'Tomato', 2, 'medium', 1, 'admin'), 
  (3, 'Cucumber', 1, 'large', 1, 'admin'), 
  (4, 'Feta Cheese', 100, 'g', 1, 'admin'), 
  (5, 'Olive Oil', 2, 'tbsp', 1, 'admin'), 
  (6, 'Salt', 1, 'pinch', 1, 'admin'), 
  (7, 'Spaghetti', 500, 'g', 2, 'admin'), 
  (8, 'Ground Beef', 500, 'g', 2, 'admin'), 
  (9, 'Onion', 1, 'medium', 2, 'admin'), 
  (10, 'Garlic', 2, 'cloves', 2, 'admin'), 
  (11, 'Tomato Sauce', 500, 'ml', 2, 'admin'), 
  (12, 'Sugar', 1, 'tsp', 3, 'admin'), 
  (13, 'All-Purpose Flour', 250, 'g', 3, 'admin'), 
  (14, 'Baking Powder', 1, 'tsp', 3, 'admin'), 
  (15, 'Cocoa Powder', 50, 'g', 3, 'admin'), 
  (16, 'Butter', 125, 'g', 3, 'admin'), 
  (17, 'Egg', 2, 'large', 3, 'admin'), 
  (18, 'Milk', 200, 'ml', 3, 'admin'),
  (30, 'Tomato', 2, 'medium', 5, 'admin'), 
  (31, 'Mozzarella Cheese', 100, 'g', 5, 'admin'), 
  (32, 'Olive Oil', 2, 'tbsp', 5, 'admin'), 
  (33, 'Balsamic Vinegar', 1, 'tbsp', 5, 'admin'), 
  (34, 'Salt', 1, 'pinch', 5, 'admin'), 
  (35, 'Pepper', 1, 'pinch', 5, 'admin'), 
  (36, 'Romaine Lettuce', 1, 'head', 6, 'admin'), 
  (37, 'Chicken Breast', 500, 'g', 6, 'admin'), 
  (38, 'Croutons', 100, 'g', 6, 'admin'), 
  (39, 'Parmesan Cheese', 50, 'g', 6, 'admin'), 
  (40, 'Caesar Dressing', 2, 'tbsp', 6, 'admin'), 
  (41, 'Lemon Juice', 1, 'tbsp', 6, 'admin'), 
  (42, 'Worcestershire Sauce', 1, 'tsp', 6, 'admin'), 
  (43, 'Garlic', 1, 'clove', 6, 'admin'),
  (44, 'Kale', 1, 'bunch', 7, 'admin'),
  (45, 'Roasted Sweet Potatoes', 2, 'medium', 7, 'admin'),
  (46, 'Pomegranate Seeds', 1, 'cup', 7, 'admin'),
  (47, 'Pecans', 1, 'cup', 7, 'admin'),
  (48, 'Balsamic Vinegar', 2, 'tbsp', 7, 'admin'),
  (49, 'Olive Oil', 2, 'tbsp', 7, 'admin'),
  (50, 'Maple Syrup', 1, 'tbsp', 7, 'admin'),
  (51, 'Dijon Mustard', 1, 'tsp', 7, 'admin'),
  (52, 'Salt', 1, 'pinch', 7, 'admin'),
  (53, 'Pepper', 1, 'pinch', 7, 'admin'),
  (54, 'Arugula', 1, 'bunch', 8, 'admin'),
  (55, 'Prosciutto', 4, 'slices', 8, 'admin'),
  (56, 'Parmesan Cheese', 50, 'g', 8, 'admin'),
  (57, 'Cherry Tomatoes', 1, 'cup', 8, 'admin'),
  (58, 'Balsamic Vinegar', 2, 'tbsp', 8, 'admin'),
  (59, 'Olive Oil', 2, 'tbsp', 8, 'admin'),
  (60, 'Garlic', 1, 'clove', 8, 'admin'),
  (61, 'Salt', 1, 'pinch', 8, 'admin'),
  (62, 'Pepper', 1, 'pinch', 8, 'admin');


ALTER SEQUENCE recipes_id_seq RESTART WITH 100;
ALTER SEQUENCE ingredients_id_seq RESTART WITH 100;
ALTER SEQUENCE recipecollections_id_seq RESTART WITH 100;