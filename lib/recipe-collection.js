const nextId = require("./next-id");
const Recipe = require("./recipe");

class RecipeCollection {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.recipes = [];
  }

  addRecipe(recipe) {
    if (!(recipe instanceof Recipe)) {
      throw new TypeError("can only add Recipe objects");
    }

    this.recipes.push(recipe);
  }

  size() {
    return this.recipes.length;
  }

  toString() {
    return `${this.title} Recipes`;
  }
}

module.exports = RecipeCollection;
