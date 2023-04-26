const nextId = require("./next-id");

module.exports = [
  {
    id: nextId(),
    title: "Breads",
    recipes: [
      {
        id: nextId(),
        title: "Banana Bread",
        prepTime: 15,
        totalTime: 30,
        instructions: "Make banana bread",
        ingredients: [
          {
            id: nextId(),
            name: "Banana",
            quantity: 2,
            unit: "bananas",
          },
          {
            id: nextId(),
            name: "Bread",
            quantity: 1,
            unit: "loaf",
          },
        ],
      },
      {
        id: nextId(),
        title: "Sourdough Bread",
        prepTime: 30,
        totalTime: 60,
        instructions: "Make sourdough bread",
        ingredients: [
          {
            id: nextId(),
            name: "Sourdough Starter",
            quantity: 1,
            unit: "cup",
          },
          {
            id: nextId(),
            name: "Yeast",
            quantity: 2,
            unit: "tablespoons",
          },
          {
            id: nextId(),
            name: "Flour",
            quantity: 5,
            unit: "cups",
          },
        ],
      },
    ],
  },
  {
    id: nextId(),
    title: "Sandwiches",
    recipes: [
      {
        id: nextId(),
        title: "BLT",
        prepTime: 5,
        totalTime: 15,
        instructions: "Make BLT sandwich",
        ingredients: [
          {
            id: nextId(),
            name: "Bacon",
            quantity: 2,
            unit: "pieces",
          },
          {
            id: nextId(),
            name: "Lettuce",
            quantity: 0.5,
            unit: "head",
          },
          {
            id: nextId(),
            name: "Tomato",
            quantity: 4,
            unit: "slices",
          },
          {
            id: nextId(),
            name: "Wheat bread",
            quantity: 1,
            unit: "loaf",
          },
        ],
      },
    ],
  },
  {
    id: nextId(),
    title: "Soups",
    recipes: [],
  },
];
