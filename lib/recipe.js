const nextId = require("./next-id");
const Ingredient = require("./ingredient");

class Recipe {
  constructor(title, prepTime, totalTime, instructions, ingredients) {
    this.id = nextId();
    this.title = title;
    this.prepTime = prepTime;
    this.totalTime = totalTime;
    this.instructions = instructions;
    this.ingredients = ingredients || [];
  }

  static makeRecipe(rawRecipe) {
    let recipe = Object.assign(new Recipe(), {
      id: rawRecipe.id,
      title: rawRecipe.title,
      prepTime: rawRecipe.prepTime,
      totalTime: rawRecipe.totalTime,
      instructions: rawRecipe.instructions,
    });

    rawRecipe.ingredients.forEach((ingredient) =>
      recipe.addIngredient(Ingredient.makeIngredient(ingredient))
    );

    return recipe;
  }

  toString() {
    return `${this.title}: Prep Time: ${this.prepTime} Total Time: ${this.totalTime}`;
  }

  addIngredient(ingredient) {
    if (!(ingredient instanceof Ingredient)) {
      throw new TypeError("can only add Ingredient objects");
    } else {
      this.ingredients.push(ingredient);
    }
  }
}

module.exports = Recipe;
