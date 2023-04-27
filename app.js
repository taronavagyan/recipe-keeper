const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const PgPersistence = require("./lib/pg-persistence");
const catchError = require("./lib/catch-error");

const app = express();
const host = "localhost";
const port = 3000;
const LokiStore = store(session);

app.set("views", "./views");
app.set("view engine", "pug");

app.use(morgan("common"));
app.use(express.static("public"));
app.use(express.urlencoded({ extended: false }));

app.use(
  session({
    cookie: {
      httpOnly: true,
      maxAge: 31 * 24 * 60 * 60 * 1000, // 31 days in milliseconds
      path: "/",
      secure: false,
    },
    name: "recipe-keeper-session-id",
    resave: false,
    saveUninitialized: true,
    secret: "this is not very secure",
    store: new LokiStore({}),
  })
);

app.use(flash());

// Create a new datastore
app.use((req, res, next) => {
  res.locals.store = new PgPersistence(req.session);
  next();
});

app.use((req, res, next) => {
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Redirect to collections
app.get("/", (req, res) => {
  res.redirect("/collections");
});

// Render the list of recipe collections
app.get(
  "/collections",
  catchError(async (req, res) => {
    let store = res.locals.store;
    let recipeCollections = await store.sortedRecipeCollections();

    res.render("collections", { recipeCollections });
  })
);

// Render new collection page
app.get("/collections/new", (req, res) => {
  res.render("new-collection");
});

// Create a new recipe collection
app.post(
  "/collections",
  [
    body("recipeCollectionTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The collection title is required.")
      .isLength({ max: 100 })
      .withMessage("Collection title must be between 1 and 100 characters."),
  ],
  catchError(async (req, res) => {
    let store = res.locals.store;
    let errors = validationResult(req);
    let recipeCollectionTitle = req.body.recipeCollectionTitle;

    const rerenderNewCollection = () => {
      res.render("new-collection", {
        recipeCollectionTitle,
        flash: req.flash(),
      });
    };

    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));
      rerenderNewCollection();
    } else if (await store.findRecipeIdFromTitle(recipeCollectionTitle)) {
      req.flash("error", "The collection title must be unique.");
      rerenderNewCollection();
    } else {
      let created = await store.createRecipeCollection(recipeCollectionTitle);

      if (!created) {
        req.flash("error", "The recipe collection title must be unique.");
        rerenderNewCollection();
      } else {
        req.flash("success", "The recipe collection has been created.");
        res.redirect("/collections");
      }
    }
  })
);

// Render individual recipe collection and its recipes
app.get(
  "/collections/:recipeCollectionId",
  catchError(async (req, res) => {
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeCollection = await res.locals.store.loadRecipeCollection(
      +recipeCollectionId
    );

    if (recipeCollection === undefined) throw new Error("Not found.");

    // Sort recipes in collection
    recipeCollection.recipes = res.locals.store.sortedRecipes(recipeCollection);

    res.render("collection", {
      recipeCollection,
    });
  })
);

// Edit a recipe
app.get(
  "/collections/:recipeCollectionId/recipes/:recipeId/edit",
  catchError(async (req, res) => {
    let { recipeCollectionId, recipeId } = { ...req.params };
    let recipe = await res.locals.store.loadRecipe(
      +recipeCollectionId,
      +recipeId
    );
    console.log(recipe);

    if (!recipe) throw new Error("Not found.");

    res.render("edit-recipe", { recipe });
  })
);

// Delete recipe from recipe collection
app.post(
  "/collections/:recipeCollectionId/recipes/:recipeId/destroy",
  catchError(async (req, res) => {
    let { recipeCollectionId, recipeId } = { ...req.params };
    let deleted = await res.locals.store.deleteRecipe(
      +recipeCollectionId,
      +recipeId
    );

    if (!deleted) throw new Error("Not found.");

    req.flash("success", "The recipe has been deleted.");
    res.redirect(`/collections/${recipeCollectionId}`);
  })
);

app.get(
  "/collections/:recipeCollectionId/edit",
  catchError(async (req, res) => {
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeCollection = await res.locals.store.loadRecipeCollection(
      +recipeCollectionId
    );

    if (!recipeCollection) throw new Error("Not found.");

    res.render("edit-collection", { recipeCollection });
  })
);

// List recipe
app.get(
  "/collections/:recipeCollectionId/recipes/:recipeId",
  catchError(async (req, res) => {
    let { recipeCollectionId, recipeId } = { ...req.params };

    let recipe = await res.locals.store.loadRecipe(
      +recipeCollectionId,
      +recipeId
    );

    if (!recipe) throw new Error("Not found.");

    res.render("recipe", { recipe, recipeCollectionId });
  })
);

// INPUT VALIDATION NEEDED
// Edit an existing recipe
app.post(
  "/collections/:recipeCollectionId/recipes/:recipeId/edit",
  catchError(async (req, res) => {
    let { recipeCollectionId, recipeId } = { ...req.params };
  })
);

// Create a new recipe and add it to the specified collection.
app.post(
  "/collections/:recipeCollectionId/recipes",
  [
    body("title")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The recipe title is required.")
      .isLength({ max: 100 })
      .withMessage("Recipe title must be between 1 and 100 characters."),
  ],
  catchError(async (req, res) => {
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeTitle = req.body.title;

    let errors = validationResult(req);

    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));

      let recipeCollection = res.locals.store.loadRecipeCollection(
        +recipeCollectionId
      );

      if (!recipeCollection) throw new Error("Not found.");

      recipeCollection.recipes =
        res.locals.store.sortedRecipes(recipeCollection);

      res.render("collection", {
        flash: req.flash(),
        recipeCollection,
        recipeTitle,
      });
    } else {
      let store = res.locals.store;

      const ingredientNames = [].concat(req.body["ingredientName[]"]);
      const ingredientQuantities = [].concat(req.body["ingredientQuantity[]"]);
      const ingredientUnits = [].concat(req.body["ingredientUnit[]"]);

      const ingredients = ingredientNames.map((name, index) => {
        const quantity = ingredientQuantities[index];
        const unit = ingredientUnits[index];
        return [name, quantity, unit];
      });

      let { prepTime, totalTime, instructions } = { ...req.body };

      let createdRecipe = await store.createRecipe(
        +recipeCollectionId,
        recipeTitle,
        prepTime,
        totalTime,
        instructions,
        ingredients
      );

      if (!createdRecipe) throw new Error("Not found.");

      let recipeId = await store.findRecipeIdFromTitle(recipeTitle);

      for (let ingIdx = 0; ingIdx < ingredients.length; ingIdx += 1) {
        let createdIng = await store.createIngredient(
          [recipeId].concat(ingredients[ingIdx])
        );
        if (!createdIng) throw new Error("Not found.");
      }

      req.flash("success", "The recipe has been created.");
      res.redirect(`/collections/${recipeCollectionId}`);
    }
  })
);

// Delete recipe collection
app.post(
  "/collections/:recipeCollectionId/destroy",
  catchError((req, res) => {
    let recipeCollectionId = +req.params.recipeCollectionId;
    let deleted = res.locals.store.deleteRecipeCollection(+recipeCollectionId);

    if (!deleted) throw new Error("Not found.");

    req.flash("success", "Recipe collection deleted.");
    res.redirect("/collections");
  })
);

// Edit recipe collection title
app.post(
  "/collections/:recipeCollectionId/edit",
  [
    body("recipeCollectionTitle")
      .trim()
      .isLength({ min: 1 })
      .withMessage("The recipe collection title is required.")
      .isLength({ max: 100 })
      .withMessage(
        "Recipe collection title must be between 1 and 100 characters."
      ),
  ],
  catchError(async (req, res) => {
    let store = res.locals.store;
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeCollectionTitle = req.body.recipeCollectionTitle;

    const rerenderEditCollection = async () => {
      let recipeCollection = await store.loadRecipeCollection(
        +recipeCollectionId
      );
      if (!recipeCollection) throw new Error("Not found.");

      res.render("edit-collection", {
        recipeCollectionTitle,
        recipeCollection,
        flash: req.flash(),
      });
    };

    try {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((message) => req.flash("error", message.msg));
        await rerenderEditCollection();
      } else if (await store.findRecipeIdFromTitle(recipeCollectionTitle)) {
        req.flash("error", "The collection title must be unique.");
        await rerenderEditCollection();
      } else {
        let updated = await store.setRecipeCollectionTitle(
          +recipeCollectionId,
          recipeCollectionTitle
        );

        if (!updated) throw new Error("Not found.");

        req.flash("success", "Recipe collection updated.");
        res.redirect(`/collections/${recipeCollectionId}`);
      }
    } catch (error) {
      if (store.isUniqueConstraintViolation(error)) {
        req.flash("error", "The collection title must be unique.");
        rerenderEditCollection();
      } else {
        throw error;
      }
    }
  })
);

app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});
//Listener
app.listen(port, host, () => {
  console.log(`Recipe Keeper is listening on port ${port} of ${host}!`);
});
