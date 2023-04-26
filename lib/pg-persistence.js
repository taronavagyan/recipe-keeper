const { dbQuery } = require("./db-query");

module.exports = class PgPersistence {
  async findRecipeIdFromTitle(title) {
    const FIND_RECIPE = "SELECT * FROM RECIPES WHERE title = $1";

    let result = await dbQuery(FIND_RECIPE, title);
    if (!result.rows[0]) return false;

    return result.rows[0].id;
  }
  // Returns a copy of the list of recipe collections sorted by size and title.
  async sortedRecipeCollections() {
    const ALL_RECIPECOLLECTIONS =
      "SELECT * FROM recipeCollections ORDER BY lower(title) ASC";

    const FIND_RECIPES = "SELECT * FROM recipes WHERE collection_id = $1";

    let result = await dbQuery(ALL_RECIPECOLLECTIONS);
    let recipeCollections = result.rows;
    console.log(recipeCollections);

    for (let index = 0; index < recipeCollections.length; index += 1) {
      let recipeCollection = recipeCollections[index];
      let recipes = await dbQuery(FIND_RECIPES, recipeCollection.id);
      recipeCollection.recipes = recipes.rows;
    }

    return this._sortCollectionsBySize(recipeCollections);
  }

  // Return a copy of the list of recipes sorted by title.
  sortedRecipes(recipeCollection) {
    return recipeCollection.recipes.sort(
      (recipeA, recipeB) => recipeB.title - recipeA.title
    );
  }

  // Returns a copy of the recipe with the indicated ID.
  // Returns `undefined` if not found.
  // Note that `recipeId` must be numeric.
  async loadRecipe(recipeCollectionId, recipeId) {
    const FIND_RECIPE =
      "SELECT * FROM recipes WHERE collection_id = $1 AND id = $2";
    const FIND_INGREDIENTS = "SELECT * FROM ingredients WHERE recipe_id = $1";

    let resultRecipe = dbQuery(FIND_RECIPE, recipeCollectionId, recipeId);
    let resultIngredients = dbQuery(FIND_INGREDIENTS, recipeId);
    let resultBoth = await Promise.all([resultRecipe, resultIngredients]);

    let recipe = resultBoth[0].rows[0];
    if (!recipe) return undefined;

    recipe.ingredients = resultBoth[1].rows;
    return recipe;
  }

  // Returns a copy of the recipe collection with the indicated ID.
  // Returns `undefined` if not found.
  // Note that `recipeCollectionId` must be numeric.
  async loadRecipeCollection(recipeCollectionId) {
    const FIND_RECIPE_COLLECTION =
      "SELECT * FROM recipeCollections WHERE id = $1";
    const FIND_RECIPES = "SELECT * FROM recipes WHERE collection_id = $1";

    let resultRecipeCollection = dbQuery(
      FIND_RECIPE_COLLECTION,
      recipeCollectionId
    );
    let resultRecipes = dbQuery(FIND_RECIPES, recipeCollectionId);
    let resultBoth = await Promise.all([resultRecipeCollection, resultRecipes]);

    let recipeCollection = resultBoth[0].rows[0];
    if (!recipeCollection) return undefined;

    recipeCollection.recipes = resultBoth[1].rows;
    return recipeCollection;
  }

  // Deletes the indicated recipe from the indicated recipe collection.
  // Returns `true` on success, `false` if the recipe or recipe collection
  // doesn't exist. The id arguments must both be numeric.
  async deleteRecipe(recipeCollectionId, recipeId) {
    const DELETE_RECIPE =
      "DELETE FROM recipes WHERE collection_id = $1 AND id = $2";

    let result = await dbQuery(DELETE_RECIPE, recipeCollectionId, recipeId);
    return result.rowCount > 0;
  }

  // Deletes recipe collection. Returns `false` if collection
  // is not found, `true` if collection is successfully deleted.
  async deleteRecipeCollection(recipeCollectionId) {
    const DELETE_RECIPECOLLECTION =
      "DELETE FROM recipeCollections WHERE id = $1";

    let result = await dbQuery(DELETE_RECIPECOLLECTION, recipeCollectionId);
    return result.rowCount > 0;
  }

  // Creates a new ingredient.
  async createIngredient(args) {
    const CREATE_INGREDIENT = `
    INSERT INTO ingredients
    (recipe_id, name, quantity, unit)
    VALUES ($1, $2, $3, $4)`;

    let result = await dbQuery(CREATE_INGREDIENT, ...args);
    return result.rowCount > 0;
  }

  // Creates a new recipe. Returns `false` if recipe collection
  // cannot be found, and `true` if recipe is made successfully.
  async createRecipe(
    recipeCollectionId,
    title,
    prepTime,
    totalTime,
    instructions
  ) {
    const CREATE_RECIPE = `
    INSERT INTO recipes 
    (collection_id, title, prep_time, total_time, instructions)
    VALUES ($1, $2, $3, $4, $5);`;

    let result = await dbQuery(
      CREATE_RECIPE,
      recipeCollectionId,
      title,
      prepTime,
      totalTime,
      instructions
    );
    return result.rowCount > 0;
  }

  // Creates a new recipe collection with the specified title. Returns
  // `true` on success, `false` on failure. (At this time, there are no
  // known failure conditions.)
  async createRecipeCollection(title) {
    const CREATE_RECIPECOLLECTION =
      "INSERT INTO recipeCollections (title) VALUES ($1)";

    try {
      let result = await dbQuery(CREATE_RECIPECOLLECTION, title);
      return result.rowCount > 0;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) return false;
      throw error;
    }
  }

  // Sets title for specified recipe collection. Returns `false` if
  // recipe collection cannot be found, and `true` if title is
  // successfully set.
  async setRecipeCollectionTitle(recipeCollectionId, title) {
    const SET_RECIPECOLLECTION_TITLE =
      "UPDATE recipeCollections SET title = $1 WHERE id = $2";
    let result = await dbQuery(
      SET_RECIPECOLLECTION_TITLE,
      title,
      +recipeCollectionId
    );

    return result.rowCount > 0;
  }

  // Returns `true` if `error` seems to indicate a `UNIQUE` constraint
  // violation, `false` otherwise.
  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }

  // Return an array of recipe collections sorted by number of recipes DESC
  _sortCollectionsBySize(collections) {
    return collections.sort(
      (collectionA, collectionB) =>
        collectionB.recipes.length - collectionA.recipes.length
    );
  }
};
