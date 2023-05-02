const { dbQuery } = require("./db-query");
const bcrypt = require("bcrypt");

// Note that `recipeCollectionId` and `recipeId` must be numeric,
// unless otherwise stated.
module.exports = class PgPersistence {
  constructor(session) {
    this.username = session.username;
  }

  // Returns `true` if `username` and `password` combine to identify a
  // legitimate application user, `false` if either the `username` or
  // `password` is invalid.
  async authenticate(username, password) {
    const FIND_HASHED_PASSWORD =
      "SELECT password FROM users WHERE username = $1";

    let result = await dbQuery(FIND_HASHED_PASSWORD, username);
    if (result.rowCount === 0) return false;

    return bcrypt.compare(password, result.rows[0].password);
  }
  // Finds whether another recipe with the given title exists in the specified
  // collection. Returns `true` if a matching recipe is found, `false`
  // otherwise.
  async existsRecipeTitleInCollection(title, recipeCollectionId, recipeId) {
    const FIND_RECIPE_IN_COLLECTION =
      "SELECT * FROM recipes WHERE title = $1 AND collection_id = $2 AND id != $3 AND username = $4";

    let result = await dbQuery(
      FIND_RECIPE_IN_COLLECTION,
      title,
      recipeCollectionId,
      recipeId,
      this.username
    );

    return !!result.rows[0];
  }

  // Returns `true` if a recipe collection with the specified ID exists,
  // `false` otherwise.
  async existsRecipeCollection(recipeCollectionId) {
    const FIND_COLLECTION =
      "SELECT NULL FROM recipeCollections WHERE id = $1 AND username = $2";

    let result = await dbQuery(
      FIND_COLLECTION,
      recipeCollectionId,
      this.username
    );

    if (!result) return false;

    return result.rowCount > 0;
  }

  // Finds a recipe's ID by its title in the database. Returns the ID of the
  // matching recipe, or `false` if no matching recipe is found.
  async findRecipeId(title, recipeCollectionId) {
    const FIND_RECIPE =
      "SELECT * FROM recipes WHERE title = $1 AND collection_id = $2 AND username = $3";

    let result = await dbQuery(
      FIND_RECIPE,
      title,
      recipeCollectionId,
      this.username
    );
    if (!result.rows[0]) return false;

    return result.rows[0].id;
  }

  // Finds the ID of the recipe collection with the given title in the database.
  // Returns the ID of the first matching collection, or `false` if no matching
  // collection is found.
  async findRecipeCollectionIdFromTitle(title) {
    const FIND_RECIPECOLLECTION =
      "SELECT * FROM recipeCollections WHERE title = $1 AND username = $2";

    let result = await dbQuery(FIND_RECIPECOLLECTION, title, this.username);
    if (!result.rows[0]) return false;

    return result.rows[0].id;
  }

  // Returns an array of recipe collections sorted alphabetically by title, with
  // each collection containing up to 5 recipes. Returns `false` if pageNumber
  // is not a positive integer, or if there are no recipe collections to return.
  async sortedRecipeCollections(pageNumber) {
    if (!Number.isInteger(pageNumber) || pageNumber < 1) return false;

    pageNumber -= 1;
    let offsetNumber = pageNumber * 5;

    const FIVE_RECIPECOLLECTIONS =
      "SELECT * FROM recipeCollections WHERE username = $1 ORDER BY lower(title) ASC LIMIT 5 OFFSET $2";

    const FIND_RECIPES =
      "SELECT * FROM recipes WHERE collection_id = $1 AND username = $2";

    let result = await dbQuery(
      FIVE_RECIPECOLLECTIONS,
      this.username,
      offsetNumber
    );
    let recipeCollections = result.rows;

    if (!recipeCollections.length) return false;
    for (let index = 0; index < recipeCollections.length; index += 1) {
      let recipeCollection = recipeCollections[index];
      let recipes = await dbQuery(
        FIND_RECIPES,
        recipeCollection.id,
        this.username
      );
      recipeCollection.recipes = recipes.rows;
    }

    return this._sortCollectionsBySize(recipeCollections);
  }

  // Returns an array of recipes from the database, sorted alphabetically
  // by title, with each recipe belonging to the specified recipe collection,
  // up to 5. Returns `false` if pageNumber is not a positive integer, or if
  // there are no recipes to return.
  async sortedRecipes(recipeCollectionId, pageNumber) {
    if (!Number.isInteger(pageNumber) || pageNumber < 1) return false;

    pageNumber -= 1;
    let offsetNumber = pageNumber * 5;

    const SORTED_RECIPES =
      "SELECT * FROM recipes WHERE collection_id = $1 AND username = $2 ORDER BY lower(title) ASC LIMIT 5 OFFSET $3";

    let result = await dbQuery(
      SORTED_RECIPES,
      recipeCollectionId,
      this.username,
      offsetNumber
    );

    if (!result.rows.length) return false;

    return result.rows;
  }

  // Retrieves a single recipe with the specified ID from the specified recipe
  // collection in the database, along with all of its associated ingredients.
  // If no such recipe is found, returns `undefined`.
  async loadRecipe(recipeCollectionId, recipeId) {
    const FIND_RECIPE =
      "SELECT * FROM recipes WHERE collection_id = $1 AND id = $2 AND username = $3";
    const FIND_INGREDIENTS =
      "SELECT * FROM ingredients WHERE recipe_id = $1 AND username = $2";

    let resultRecipe = dbQuery(
      FIND_RECIPE,
      recipeCollectionId,
      recipeId,
      this.username
    );
    let resultIngredients = dbQuery(FIND_INGREDIENTS, recipeId, this.username);
    let resultBoth = await Promise.all([resultRecipe, resultIngredients]);

    let recipe = resultBoth[0].rows[0];
    if (!recipe) return undefined;

    recipe.ingredients = resultBoth[1].rows;
    return recipe;
  }

  // Finds a recipe collection with the given ID and all its associated recipes.
  // Returns `false` if recipe collection isn't found.
  async loadRecipeCollection(recipeCollectionId) {
    const FIND_RECIPE_COLLECTION =
      "SELECT * FROM recipeCollections WHERE id = $1 AND username = $2";
    const FIND_RECIPES =
      "SELECT * FROM recipes WHERE collection_id = $1 AND username = $2";

    let resultRecipeCollection = dbQuery(
      FIND_RECIPE_COLLECTION,
      recipeCollectionId,
      this.username
    );
    let resultRecipes = dbQuery(
      FIND_RECIPES,
      recipeCollectionId,
      this.username
    );
    let resultBoth = await Promise.all([resultRecipeCollection, resultRecipes]);

    let recipeCollection = resultBoth[0].rows[0];
    if (!recipeCollection) return undefined;

    recipeCollection.recipes = resultBoth[1].rows;
    return recipeCollection;
  }

  // Deletes a recipe with the given ID that belongs to the given recipe
  // collection.
  // Returns `true` on successful deletion,
  // `false` if collection is not found.
  async deleteRecipe(recipeCollectionId, recipeId) {
    const DELETE_RECIPE =
      "DELETE FROM recipes WHERE collection_id = $1 AND id = $2 AND username = $3";

    let result = await dbQuery(
      DELETE_RECIPE,
      recipeCollectionId,
      recipeId,
      this.username
    );
    return result.rowCount > 0;
  }

  // Deletes a recipe collection with the given ID
  // Returns `false` if collection is not found,
  //`true` if collection is successfully deleted.
  async deleteRecipeCollection(recipeCollectionId) {
    const DELETE_RECIPECOLLECTION =
      "DELETE FROM recipeCollections WHERE id = $1 AND username = $2";

    let result = await dbQuery(
      DELETE_RECIPECOLLECTION,
      recipeCollectionId,
      this.username
    );
    return result.rowCount > 0;
  }

  // Deletes all ingredients with a given recipe ID.
  // Returns `true` if no more ingredients with the given recipe ID exist,
  // `false` otherwise.
  async deleteAllIngredientsFromRecipe(recipeId) {
    const DELETE_INGREDIENTS =
      "DELETE FROM ingredients WHERE recipe_id = $1 AND username = $2";
    const FIND_INGREDIENTS =
      "SELECT * FROM ingredients WHERE recipe_id = $1 AND username = $2";

    let deletion = await dbQuery(DELETE_INGREDIENTS, recipeId, this.username);
    let result = await dbQuery(FIND_INGREDIENTS, recipeId, this.username);

    return !result.rows.length;
  }

  // Creates a new ingredient with the specified properties.
  // Returns `true` on successful creation, `false` otherwise.
  async createIngredient(args) {
    const CREATE_INGREDIENT = `
    INSERT INTO ingredients
    (recipe_id, name, quantity, unit, username)
    VALUES ($1, $2, $3, $4, $5)`;

    let result = await dbQuery(CREATE_INGREDIENT, ...args, this.username);
    return result.rowCount > 0;
  }

  // Creates a new recipe with the specified properties.
  // Returns `true` if recipe is made successfully,
  // `false` otherwise.
  async createRecipe(
    recipeCollectionId,
    title,
    prepTime,
    totalTime,
    instructions
  ) {
    const CREATE_RECIPE = `
    INSERT INTO recipes 
    (collection_id, title, prep_time, total_time, instructions, username)
    VALUES ($1, $2, $3, $4, $5, $6);`;

    let result = await dbQuery(
      CREATE_RECIPE,
      recipeCollectionId,
      title,
      prepTime,
      totalTime,
      instructions,
      this.username
    );
    return result.rowCount > 0;
  }

  // Creates a new recipe collection with the specified title. Returns
  // `true` on successful creation, `false` otherwise.
  async createRecipeCollection(title) {
    const CREATE_RECIPECOLLECTION =
      "INSERT INTO recipeCollections (title, username) VALUES ($1, $2)";

    try {
      let result = await dbQuery(CREATE_RECIPECOLLECTION, title, this.username);
      return result.rowCount > 0;
    } catch (error) {
      if (this.isUniqueConstraintViolation(error)) return false;
      throw error;
    }
  }

  // Updates the title of a recipe collection with the given ID.
  // Returns `true` if recipe collection was successfully updated,
  // `false` otherwise.
  async setRecipeCollectionTitle(recipeCollectionId, title) {
    const SET_RECIPECOLLECTION_TITLE =
      "UPDATE recipeCollections SET title = $1 WHERE id = $2 AND username = $3";
    let result = await dbQuery(
      SET_RECIPECOLLECTION_TITLE,
      title,
      +recipeCollectionId,
      this.username
    );

    return result.rowCount > 0;
  }

  // Updates properties of a recipe with the given ID.
  // Returns `true` if the recipe was updated successfully, `false` otherwise.
  async updateRecipe(
    recipeId,
    recipeCollectionId,
    title,
    prepTime,
    totalTime,
    instructions
  ) {
    const UPDATE_RECIPE =
      "UPDATE recipes SET collection_id = $1, title = $2, prep_time = $3, total_time = $4, instructions = $5 WHERE id = $6 AND username = $7";
    let result = await dbQuery(
      UPDATE_RECIPE,
      recipeCollectionId,
      title,
      prepTime,
      totalTime,
      instructions,
      recipeId,
      this.username
    );

    return result.rowCount > 0;
  }

  // Returns `true` if `error` seems to indicate a `UNIQUE` constraint
  // violation, `false` otherwise.
  isUniqueConstraintViolation(error) {
    return /duplicate key value violates unique constraint/.test(String(error));
  }

  // Return `true` if `error` seems to indicate that prep time is greater than total cooking time
  isTimeConstraintViolation(error) {
    return /violates check constraint "recipes_check"/.test(String(error));
  }

  // Sorts an array of recipe collections in descending order by the number of
  // recipes they contain.
  _sortCollectionsBySize(collections) {
    return collections.sort(
      (collectionA, collectionB) =>
        collectionB.recipes.length - collectionA.recipes.length
    );
  }

  // Returns total number of collections pages or `false` on failure.
  // No known failure conditions.
  async _getCollectionsPageCount() {
    const COUNT_COLLECTIONS =
      "SELECT NULL FROM recipeCollections WHERE username = $1";

    let result = await dbQuery(COUNT_COLLECTIONS, this.username);

    if (!result) return false;

    return Math.ceil(result.rowCount / 5);
  }

  // Returns total number of recipes pages for a collection or
  // `false` on failure. No known failure conditions.
  async _getRecipesPageCount(collection_id) {
    const COUNT_COLLECTIONS =
      "SELECT NULL FROM recipes WHERE collection_id = $1 AND username = $2";

    let result = await dbQuery(COUNT_COLLECTIONS, collection_id, this.username);

    if (!result) return false;
    console.log(result.rowCount);

    return Math.ceil(result.rowCount / 5);
  }
};
