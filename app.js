const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const SessionPersistence = require("./lib/session-persistence");

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
  res.locals.store = new SessionPersistence(req.session);
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
app.get("/collections", (req, res) => {
  res.render("collections", {
    recipeCollections: res.locals.store.sortedRecipeCollections(),
  });
});

// Render new collection page
app.get("/collections/new", (req, res) => {
  res.render("new-collection");
});

// Create a new collection
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
  (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));
      res.render("new-collection", {
        flash: req.flash(),
        recipeCollectionTitle: req.body.recipeCollectionTitle,
      });
    } else {
      req.session.recipeCollections.push(
        new RecipeCollection(req.body.recipeCollectionTitle)
      );
      req.flash("success", "The recipe collection has been created.");
      res.redirect("/collections");
    }
  }
);

// Render individual recipe collection and its recipes
app.get("/collections/:recipeCollectionId", (req, res, next) => {
  let recipeCollectionId = req.params.recipeCollectionId;

  let recipeCollection = res.locals.store.loadRecipeCollection(
    +recipeCollectionId
  );
  if (recipeCollection === undefined) {
    next(new Error("Not found."));
  } else {
    recipeCollection.recipes = res.locals.store.sortedRecipes(recipeCollection);
    res.render("collection", {
      recipeCollection,
    });
  }
});

// Edit a recipe
// app.get(
//   "/collections/:recipeCollectionId/recipes/:recipeId/edit",
//   (req, res, (next) => {})
// );

// Delete recipe from recipe collection
app.get(
  "/collections/:recipeCollectionId/recipes/:recipeId/destroy",
  (req, res, next) => {
    let { recipeCollectionId, recipeId } = { ...req.params };
    let deleted = res.locals.store.deleteRecipe(+recipeCollectionId, +recipeId);

    if (!deleted) {
      next(new Error("Not found."));
    } else {
      req.flash("success", "The recipe has been deleted.");
      res.redirect(`/collections/${recipeCollectionId}`);
    }
  }
);

app.get("/collections/:recipeCollectionId/edit", (req, res, next) => {
  let recipeCollectionId = req.params.recipeCollectionId;
  let recipeCollection = res.locals.store.loadRecipeCollection(
    +recipeCollectionId
  );
  if (!recipeCollection) {
    next(new Error("Not found."));
  } else {
    res.render("edit-collection", { recipeCollection });
  }
});

// List recipe
app.get(
  "/collections/:recipeCollectionId/recipes/:recipeId",
  (req, res, next) => {
    let { recipeCollectionId, recipeId } = { ...req.params };

    let recipeCollection = res.locals.store.loadRecipeCollection(
      +recipeCollectionId
    );
    if (!recipeCollection) {
      next(new Error("Not found."));
    } else {
      let recipe = res.locals.store.loadRecipe(+recipeCollectionId, +recipeId);
      if (!recipe) {
        next(new Error("Not found."));
      } else {
        res.render("recipe", { recipe, recipeCollectionId });
      }
    }
  }
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
  (req, res, next) => {
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeCollection = res.locals.store.loadRecipeCollection(
      +recipeCollectionId
    );
    let recipeTitle = req.body.title;
    if (!recipeCollection) {
      next(new Error("Not found."));
    } else {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((message) => req.flash("error", message.msg));

        recipeCollection.recipes =
          res.locals.store.sortedRecipes(recipeCollection);
        res.render("collection", {
          flash: req.flash(),
          recipeCollection,
          recipeTitle,
        });
      } else {
        const ingredientNames = [].concat(req.body["ingredientName[]"]);
        const ingredientQuantities = [].concat(
          req.body["ingredientQuantity[]"]
        );
        const ingredientUnits = [].concat(req.body["ingredientUnit[]"]);

        const ingredients = ingredientNames.map((name, index) => {
          const quantity = ingredientQuantities[index];
          const unit = ingredientUnits[index];
          return { name, quantity, unit };
        });

        let { prepTime, totalTime, instructions } = { ...req.body };

        res.locals.store.createRecipe(
          +recipeCollectionId,
          recipeTitle,
          prepTime,
          totalTime,
          instructions,
          ingredients
        );

        req.flash("success", "The recipe has been created.");
        res.redirect(`/collections/${recipeCollectionId}`);
      }
    }
  }
);

// Delete recipe collection
app.post("/collections/:recipeCollectionId/destroy", (req, res, next) => {
  let recipeCollectionId = +req.params.recipeCollectionId;
  let deleted = res.locals.store.deleteRecipeCollection(+recipeCollectionId);
  if (!deleted) {
    next(new Error("Not found."));
  } else {
    req.flash("success", "Recipe collection deleted.");
    res.redirect("/collections");
  }
});

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
  (req, res, next) => {
    let store = res.locals.store;
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeCollectionTitle = req.body.recipeCollectionTitle;

    const rerenderEditCollection = () => {
      let recipeCollection = store.loadRecipeCollection(+recipeCollectionId);
      if (!recipeCollection) {
        next(new Error("Not found."));
      } else {
        res.render("edit-collection", {
          recipeCollectionTitle,
          recipeCollection,
          flash: req.flash(),
        });
      }
    };

    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      errors.array().forEach((message) => req.flash("error", message.msg));
      res.rerenderEditCollection();
    } else if (
      res.locals.store.existsRecipeCollectionTitle(recipeCollectionTitle)
    ) {
      req.flash("error", "The collection title must be unique.");
      rerenderEditCollection();
    } else if (
      !res.locals.store.setRecipeCollectionTitle(
        +recipeCollectionId,
        recipeCollectionTitle
      )
    ) {
      next(new Error("Not found."));
    } else {
      req.flash("success", "Recipe collection updated.");
      res.redirect(`/collections/${recipeCollectionId}`);
    }
  }
);

app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.status(404).send(err.message);
});
//Listener
app.listen(port, host, () => {
  console.log(`Recipe Keeper is listening on port ${port} of ${host}!`);
});
