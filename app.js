const express = require("express");
const morgan = require("morgan");
const flash = require("express-flash");
const session = require("express-session");
const { body, validationResult } = require("express-validator");
const store = require("connect-loki");
const PgPersistence = require("./lib/pg-persistence");
const catchError = require("./lib/catch-error");
const hasDuplicates = require("./lib/hasDuplicates");
const range = require("./lib/range");
const titleValidation = (field) => {
  return [
    body(field)
      .trim()
      .isLength({ min: 1 })
      .withMessage("Title is required.")
      .isLength({ max: 100 })
      .withMessage("Title must be between 1 and 100 characters."),
  ];
};

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
  res.locals.username = req.session.username;
  res.locals.signedIn = req.session.signedIn;
  res.locals.flash = req.session.flash;
  delete req.session.flash;
  next();
});

// Detect unauthorized access to routes.
app.use((req, res, next) => {
  if (!res.locals.signedIn && req.path !== "/users/signin") {
    req.session.returnTo = req.originalUrl;
    res.redirect("/users/signin");
  } else {
    next();
  }
});

// Redirect to collections
app.get("/", (req, res) => {
  res.redirect("/collections");
});

// Render the list of recipe collections on page 1
app.get(
  "/collections",
  catchError(async (req, res) => {
    const FIRST_PAGE = 1;
    let store = res.locals.store;

    const LAST_PAGE = await store._getCollectionsPageCount();
    const THIS_PAGE = FIRST_PAGE;
    const ALL_PAGES = range(LAST_PAGE);
    let recipeCollections = await store.sortedRecipeCollections(FIRST_PAGE);

    req.flash("p", "You are currently on page 1 of recipe collections.");
    res.render("collections", {
      recipeCollections,
      flash: req.flash(),
      ALL_PAGES,
      THIS_PAGE,
    });
  })
);

// Render the list of recipe collections on the specified page
app.get(
  "/collections/page/:pageNumber",
  catchError(async (req, res) => {
    let store = res.locals.store;
    const FIRST_PAGE = 1;
    const LAST_PAGE = await store._getCollectionsPageCount();
    const THIS_PAGE = req.params.pageNumber;
    const ALL_PAGES = range(LAST_PAGE);

    if (+THIS_PAGE === 0) res.redirect("/collections");

    const rerenderCollections = async () => {
      let recipeCollections = await store.sortedRecipeCollections(FIRST_PAGE);

      req.flash("error", "Invalid page number.");
      req.flash("p", "You are currently on page 1 of recipe collections.");
      res.render("collections", {
        recipeCollections,
        flash: req.flash(),
        ALL_PAGES,
        THIS_PAGE: FIRST_PAGE,
      });
    };

    let recipeCollections = await store.sortedRecipeCollections(+THIS_PAGE);

    if (!recipeCollections || !Number.isInteger(+THIS_PAGE)) {
      await rerenderCollections();
    } else {
      req.flash(
        "p",
        `You are currently on page ${THIS_PAGE} of recipe collections.`
      );
      res.render("collections", {
        recipeCollections,
        flash: req.flash(),
        ALL_PAGES,
        THIS_PAGE,
      });
    }
  })
);

// Render new collection page
app.get("/collections/new", (req, res) => {
  res.render("new-collection");
});

// Create a new recipe collection
app.post(
  "/collections",
  titleValidation("recipeCollectionTitle"),
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
    } else if (
      await store.findRecipeCollectionIdFromTitle(recipeCollectionTitle)
    ) {
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

// Redirect to recipe collection.
app.get("/collections/:recipeCollectionId/recipes", (req, res) => {
  let recipeCollectionId = req.params.recipeCollectionId;
  res.redirect(`/collections/${recipeCollectionId}`);
});

// Render individual recipe collection and its recipes on page 1
app.get(
  "/collections/:recipeCollectionId",
  catchError(async (req, res) => {
    let recipeCollectionId = req.params.recipeCollectionId;
    let store = res.locals.store;
    const FIRST_PAGE = 1;
    const LAST_PAGE = await store._getRecipesPageCount(+recipeCollectionId);
    const ALL_PAGES = range(LAST_PAGE);

    if (Number.isNaN(+recipeCollectionId)) throw new Error("Not found.");

    let recipeCollection = await store.loadRecipeCollection(
      +recipeCollectionId
    );

    if (!recipeCollection) throw new Error("Not found.");

    recipeCollection.recipes = await store.sortedRecipes(
      +recipeCollectionId,
      FIRST_PAGE
    );

    req.flash("p", `You are currently on page 1 of ${recipeCollection.title}.`);
    res.render("collection", {
      recipeCollection,
      flash: req.flash(),
      ALL_PAGES,
      THIS_PAGE: FIRST_PAGE,
    });
  })
);

// Render individual recipe collection and its recipes on the specified page
app.get(
  "/collections/:recipeCollectionId/page/:pageNumber",
  catchError(async (req, res) => {
    let store = res.locals.store;
    let recipeCollectionId = req.params.recipeCollectionId;
    let THIS_PAGE = req.params.pageNumber;
    const FIRST_PAGE = 1;
    const LAST_PAGE = await store._getRecipesPageCount(+recipeCollectionId);
    const ALL_PAGES = range(LAST_PAGE);

    if (+THIS_PAGE === 0) res.redirect(`/collections/${recipeCollectionId}`);

    const rerenderCollection = async () => {
      recipeCollection.recipes = await store.sortedRecipes(
        recipeCollectionId,
        FIRST_PAGE
      );
      req.flash("error", "Invalid page number.");
      req.flash(
        "p",
        `You are currently on page 1 of ${recipeCollection.title}.`
      );
      res.render("collection", {
        recipeCollection,
        flash: req.flash(),
        ALL_PAGES,
        THIS_PAGE: FIRST_PAGE,
      });
    };

    let recipeCollection = await store.loadRecipeCollection(
      +recipeCollectionId
    );

    if (!recipeCollection) throw new Error("Not found.");

    recipeCollection.recipes = await store.sortedRecipes(
      recipeCollectionId,
      +THIS_PAGE
    );

    if (!recipeCollection.recipes || !Number.isInteger(+THIS_PAGE)) {
      await rerenderCollection();
    } else {
      req.flash(
        "p",
        `You are currently on page ${THIS_PAGE} of ${recipeCollection.title}.`
      );
      res.render("collection", {
        recipeCollection,
        flash: req.flash(),
        ALL_PAGES,
        THIS_PAGE,
      });
    }
  })
);

// Display edit recipe page
app.get(
  "/collections/:recipeCollectionId/recipes/:recipeId/edit",
  catchError(async (req, res) => {
    let { recipeCollectionId, recipeId } = { ...req.params };
    let recipe = await res.locals.store.loadRecipe(
      +recipeCollectionId,
      +recipeId
    );

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

// Display edit recipe collection page
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

// Display new recipe page
app.get("/collections/:recipeCollectionId/recipes/new", (req, res) => {
  let recipeCollectionId = req.params.recipeCollectionId;
  res.render("new-recipe", { recipeCollectionId });
});

// Display recipe
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

// Edit an existing recipe
app.post(
  "/collections/:recipeCollectionId/recipes/:recipeId/edit",
  titleValidation("recipeTitle"),
  [
    body("instructions")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Instructions are required"),
  ],

  catchError(async (req, res) => {
    let store = res.locals.store;
    let { recipeCollectionId, recipeId } = { ...req.params };
    let { recipeTitle, prepTime, totalTime, instructions } = {
      ...req.body,
    };
    const ingredientNames = [].concat(req.body["ingredientName[]"]);
    const ingredientQuantities = [].concat(req.body["ingredientQuantity[]"]);
    const ingredientUnits = [].concat(req.body["ingredientUnit[]"]);

    const getIngredientsInfo = () => {
      return ingredientNames.map((name, index) => {
        const quantity = ingredientQuantities[index];
        const unit = ingredientUnits[index];
        return { name, quantity, unit };
      });
    };

    const rerenderEditRecipe = async () => {
      let recipe = await store.loadRecipe(+recipeCollectionId, +recipeId);
      if (!recipe) throw new Error("Not found.");

      res.render("edit-recipe", {
        recipe,
        flash: req.flash(),
      });
    };

    if (ingredientUnits.some((unit) => unit.trim() === "")) {
      req.flash("error", "Ingredient units are required.");
      await rerenderEditRecipe();
    }

    if (hasDuplicates(ingredientNames)) {
      req.flash("error", "Cannot add the same ingredient more than once.");
      await rerenderEditRecipe();
    }

    try {
      let errors = validationResult(req);
      if (!errors.isEmpty()) {
        errors.array().forEach((message) => req.flash("error", message.msg));
        await rerenderEditRecipe();
      } else if (
        await store.existsRecipeTitleInCollection(
          recipeTitle,
          +recipeCollectionId,
          +recipeId
        )
      ) {
        req.flash("error", "The recipe title must be unique.");
        await rerenderEditRecipe();
      } else {
        let ingredientsInfo = getIngredientsInfo();

        let updated = await store.updateRecipe(
          +recipeId,
          +recipeCollectionId,
          recipeTitle,
          prepTime,
          totalTime,
          instructions
        );

        if (!updated) throw new Error("Not found.");

        let deletedIngredients = await store.deleteAllIngredientsFromRecipe(
          +recipeId
        );

        for (let ingIdx = 0; ingIdx < ingredientsInfo.length; ingIdx += 1) {
          let createdIng = await store.createIngredient(
            [recipeId].concat(Object.values(ingredientsInfo[ingIdx]))
          );
          if (!createdIng) throw new Error("Not found.");
        }

        req.flash("success", "Recipe updated.");
        res.redirect(`/collections/${recipeCollectionId}/recipes/${recipeId}`);
      }
    } catch (error) {
      if (store.isUniqueConstraintViolation(error)) {
        req.flash("error", "The recipe title must be unique.");
        await rerenderEditRecipe();
      } else {
        throw error;
      }
    }
  })
);

// Create a new recipe
app.post(
  "/collections/:recipeCollectionId/recipes/new",
  titleValidation("title"),
  [
    body("instructions")
      .trim()
      .isLength({ min: 1 })
      .withMessage("Instructions are required"),
  ],

  catchError(async (req, res) => {
    let store = res.locals.store;
    let recipeCollectionId = req.params.recipeCollectionId;
    let recipeTitle = req.body.title;
    let { prepTime, totalTime, instructions } = { ...req.body };
    const ingredientNames = [].concat(req.body["ingredientName[]"]);
    const ingredientQuantities = [].concat(req.body["ingredientQuantity[]"]);
    const ingredientUnits = [].concat(req.body["ingredientUnit[]"]);

    const getIngredientsInfo = () => {
      return ingredientNames.map((name, index) => {
        const quantity = ingredientQuantities[index];
        const unit = ingredientUnits[index];
        return { name, quantity, unit };
      });
    };

    let ingredientsInfo = getIngredientsInfo();

    const rerenderNewRecipe = async () => {
      res.render("new-recipe", {
        flash: req.flash(),
        recipeCollectionId,
        recipeTitle,
        prepTime,
        totalTime,
        instructions,
        ingredientsInfo,
      });
    };

    if (ingredientUnits.some((unit) => unit.trim() === "")) {
      req.flash("error", "Ingredient units are required.");
      await rerenderNewRecipe();
    }

    if (hasDuplicates(ingredientNames)) {
      req.flash("error", "Cannot add the same ingredient more than once.");
      await rerenderNewRecipe();
    }

    try {
      let errors = validationResult(req);

      if (!errors.isEmpty()) {
        errors.array().forEach((message) => req.flash("error", message.msg));
        await rerenderNewRecipe();
      } else {
        let createdRecipe = await store.createRecipe(
          +recipeCollectionId,
          recipeTitle,
          prepTime,
          totalTime,
          instructions
        );

        if (!createdRecipe) throw new Error("Not found.");

        let recipeId = await store.findRecipeId(
          recipeTitle,
          +recipeCollectionId
        );

        for (let ingIdx = 0; ingIdx < ingredientsInfo.length; ingIdx += 1) {
          let createdIng = await store.createIngredient(
            [recipeId].concat(Object.values(ingredientsInfo[ingIdx]))
          );
          if (!createdIng) throw new Error("Not found.");
        }

        req.flash("success", "The recipe has been created.");
        res.redirect(`/collections/${recipeCollectionId}`);
      }
    } catch (error) {
      if (store.isUniqueConstraintViolation(error)) {
        req.flash("error", "The recipe title must be unique.");
        await rerenderNewRecipe();
      } else if (store.isTimeConstraintViolation(error)) {
        req.flash("error", "Prep time must not be greater than total time.");
        await rerenderNewRecipe();
      } else {
        throw error;
      }
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
  titleValidation("recipeCollectionTitle"),
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
      } else if (
        await store.findRecipeCollectionIdFromTitle(recipeCollectionTitle)
      ) {
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
        await rerenderEditCollection();
      } else {
        throw error;
      }
    }
  })
);

// Render the Sign In page.
app.get("/users/signin", (req, res) => {
  req.flash("p", "Please sign in to access Recipe Keeper.");
  res.render("signin", {
    flash: req.flash(),
  });
});

// Handle Sign In form submission
app.post(
  "/users/signin",
  catchError(async (req, res) => {
    let username = req.body.username.trim();
    let password = req.body.password;

    let authenticated = await res.locals.store.authenticate(username, password);
    if (!authenticated) {
      req.flash("error", "Invalid credentials.");
      res.render("signin", {
        flash: req.flash(),
        username: req.body.username,
      });
    } else {
      let session = req.session;
      session.username = username;
      session.signedIn = true;
      const returnTo = session.returnTo || "/";
      delete session.returnTo;
      res.redirect(returnTo);
    }
  })
);

// Handle Sign Out.
app.post("/users/signout", (req, res) => {
  delete req.session.username;
  delete req.session.signedIn;
  res.redirect("/users/signin");
});

// Handle errors.
app.use((err, req, res, _next) => {
  console.log(err); // Writes more extensive information to the console log
  res.render("error");
});

// Handle invalid routes (cannot / GET errors).
app.use((req, res) => {
  req.flash("p", "Invalid route. Redirecting to collections page.");
  res.redirect("/collections");
});

//Listener
app.listen(port, host, () => {
  console.log(`Recipe Keeper is listening on port ${port} of ${host}!`);
});
