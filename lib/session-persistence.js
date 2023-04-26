const SeedData = require("./seed-data");
const deepCopy = require("./deep-copy");
const { sortRecipeCollections, sortRecipes } = require("./sort");
const nextId = require("./next-id");

module.exports = class SessionPersistence {
  constructor(session) {
    this._recipeCollections = session.recipeCollections || deepCopy(SeedData);
    session.recipeCollections = this._recipeCollections;
  }

  // Returns a copy of the list of recipe collections sorted by size and title.
  sortedRecipeCollections() {
    return sortRecipeCollections(deepCopy(this._recipeCollections));
  }

  // Return a copy of the list of recipes sorted by title.
  sortedRecipes(recipeCollection) {
    return deepCopy(sortRecipes(recipeCollection));
  }

  // Returns a copy of the recipe with the indicated ID.
  // Returns `undefined` if not found.
  // Note that `recipeId` must be numeric.
  loadRecipe(recipeCollectionId, recipeId) {
    let recipe = this._findRecipe(recipeCollectionId, recipeId);
    return deepCopy(recipe);
  }

  // Returns a copy of the recipe collection with the indicated ID.
  // Returns `undefined` if not found.
  // Note that `recipeCollectionId` must be numeric.
  loadRecipeCollection(recipeCollectionId) {
    let recipeCollection = this._findRecipeCollection(recipeCollectionId);
    return deepCopy(recipeCollection);
  }

  // Deletes the indicated recipe from the indicated recipe collection.
  // Returns `true` on success, `false` if the recipe or recipe collection
  // doesn't exist. The id arguments must both be numeric.
  deleteRecipe(recipeCollectionId, recipeId) {
    let recipeCollection = this._findRecipeCollection(recipeCollectionId);
    if (!recipeCollection) return false;

    let recipeIndex = recipeCollection.recipes.findIndex(
      (recipe) => recipe.id === recipeId
    );
    if (recipeIndex === -1) return false;

    recipeCollection.recipes.splice(recipeIndex, 1);
    return true;
  }

  // Deletes recipe collection. Returns `false` if collection
  // is not found, `true` if collection is successfully deleted.
  deleteRecipeCollection(recipeCollectionId) {
    let collectionIndex = this._recipeCollections.findIndex(
      (collection) => collection.id === recipeCollectionId
    );

    if (collectionIndex === -1) return false;

    this._recipeCollections.splice(collectionIndex, 1);
    return true;
  }

  // Creates a new recipe. Returns `false` if recipe collection
  // cannot be found, and `true` if recipe is made successfully.
  createRecipe(
    recipeCollectionId,
    title,
    prepTime,
    totalTime,
    instructions,
    ingredients
  ) {
    let recipeCollection = this._findRecipeCollection(recipeCollectionId);
    if (!recipeCollection) return false;

    recipeCollection.recipes.push({
      id: nextId(),
      title,
      prepTime,
      totalTime,
      instructions,
      ingredients,
    });

    return true;
  }

  // Returns `true` if a recipe collection with the specified title
  // exists in the list of recipe collections, `false` otherwise.
  existsRecipeCollectionTitle(title) {
    return this._recipeCollections.some(
      (collection) => collection.title === title
    );
  }

  // Sets title for specified recipe collection. Returns `false` if
  // recipe collection cannot be found, and `true` if title is
  // successfully set.
  setRecipeCollectionTitle(recipeCollectionId, title) {
    let recipeCollection = this._findRecipeCollection(recipeCollectionId);
    if (!recipeCollection) return false;

    recipeCollection.title = title;
    return true;
  }

  // Returns a reference to the recipe collection with the indicated ID.
  // Returns `undefined` if not found. Note that `recipeCollectionId` must be numeric.
  _findRecipeCollection(recipeCollectionId) {
    return this._recipeCollections.find(
      (recipeCollection) => recipeCollection.id === recipeCollectionId
    );
  }

  // Returns a reference to the indicated recipe in the indicated recipe
  // collection.
  // Returns `undefined` if either the recipe collection or the recipe is
  // not found. Note that both IDs must be numeric.
  _findRecipe(recipeCollectionId, recipeId) {
    let recipeCollection = this._findRecipeCollection(recipeCollectionId);
    if (!recipeCollection) return undefined;

    return recipeCollection.recipes.find((recipe) => recipe.id === recipeId);
  }
};
