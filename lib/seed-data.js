const RecipeCollection = require("./recipe-collection");
const Recipe = require("./recipe");
const Ingredient = require("./ingredient");

let breadCollection = new RecipeCollection("Keto recipes");

let bananaBread = new Recipe("Banana Bread", 15, 30, "Make banana bread");
let banana = new Ingredient("Banana", 2, "bananas");
let bread = new Ingredient("Bread", 1, "loaf");
bananaBread.addIngredient(banana);
bananaBread.addIngredient(bread);

let sourdoughBread = new Recipe(
  "Sourdough Bread",
  30,
  60,
  "Make sourdough bread"
);
let sourdoughStarter = new Ingredient("Sourdough Starter", 1, "cups");
let yeast = new Ingredient("Yeast", 2, "tablespoons");
let flour = new Ingredient("Flour", 5, "cups");
sourdoughBread.addIngredient(sourdoughStarter);
sourdoughBread.addIngredient(yeast);
sourdoughBread.addIngredient(flour);

breadCollection.addRecipe(bananaBread);
breadCollection.addRecipe(sourdoughBread);

let sandwichCollection = new RecipeCollection("Sandwiches");

let BLT = new Recipe("BLT", 10, 10, "Make BLT sandwich");
let bacon = new Ingredient("Bacon", 2, "pieces");
let lettuce = new Ingredient("Lettuce", 1, "handfuls");
let tomato = new Ingredient("Tomato", 1, "tomato");

BLT.addIngredient(bacon);
BLT.addIngredient(lettuce);
BLT.addIngredient(tomato);

sandwichCollection.addRecipe(BLT);

let RecipeCollections = [breadCollection, sandwichCollection];

module.exports = RecipeCollections;
