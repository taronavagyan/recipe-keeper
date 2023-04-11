const nextId = require("./next-id");
const Ingredient = require("./ingredient");

class Recipe {
  constructor(title, prepTime, totalTime, instructions) {
    this.id = nextId();
    this.title = title;
    this.prepTime = prepTime;
    this.totalTime = totalTime;
    this.instructions = instructions;
    this.ingredients = [];
  }

  toString() {
    return `${this.title}: Prep Time: ${this.prepTime} Total Time: ${this.totalTime}`;
  }

  addIngredient(ingredient) {
    if (!(ingredient instanceof Ingredient)) {
      throw new TypeError("can only add Ingredient objects");
    }
  }
}

module.exports = Recipe;
