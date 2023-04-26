const { raw } = require("express");
const nextId = require("./next-id");
const Recipe = require("./recipe");

class RecipeCollection {
  constructor(title) {
    this.id = nextId();
    this.title = title;
    this.recipes = [];
  }

  static makeRecipeCollection(rawRecipeCollection) {
    let recipeCollection = Object.assign(new RecipeCollection(), {
      id: rawRecipeCollection.id,
      title: rawRecipeCollection.title,
    });

    rawRecipeCollection.recipes.forEach((recipe) =>
      recipeCollection.addRecipe(Recipe.makeRecipe(recipe))
    );

    return recipeCollection;
  }

  setTitle(newTitle) {
    this.title = newTitle;
  }

  addRecipe(recipe) {
    if (!(recipe instanceof Recipe)) {
      throw new TypeError("can only add Recipe objects");
    }

    this.recipes.push(recipe);
  }

  first() {
    return this.recipes[0];
  }

  size() {
    return this.recipes.length;
  }

  removeAt(index) {
    this._validateIndex(index);
    return this.recipes.splice(index, 1);
  }

  findById(recipeId) {
    return this.recipes.find((recipe) => recipe.id === recipeId);
  }

  findIndexOf(recipeToFind) {
    let findId = recipeToFind.id;
    return this.recipes.findIndex((recipe) => recipe.id === findId);
  }

  toString() {
    return `${this.title} Recipes`;
  }

  _validateIndex(index) {
    if (!(index in this.recipes)) {
      throw new ReferenceError(`invalid index: ${index}`);
    }
  }
}

module.exports = RecipeCollection;
