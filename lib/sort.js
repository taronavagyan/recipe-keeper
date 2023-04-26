// Compare object titles alphabetically (case-insensitive)
const compareByTitle = (itemA, itemB) => {
  let titleA = itemA.title.toLowerCase();
  let titleB = itemB.title.toLowerCase();

  if (titleA < titleB) {
    return -1;
  } else if (titleA > titleB) {
    return 1;
  } else {
    return 0;
  }
};

module.exports = {
  // Return the list of recipe collections sorted by size and title.
  sortRecipeCollections(collections) {
    return collections.slice().sort((collectionA, collectionB) => {
      let aSize = collectionA.recipes.length;
      let bSize = collectionB.recipes.length;

      if (aSize !== bSize) {
        return bSize - aSize;
      } else {
        return compareByTitle(collectionA, collectionB);
      }
    });
  },

  // Sort a list of recipes
  sortRecipes(recipeCollection) {
    return recipeCollection.recipes.sort(compareByTitle);
  },
};
