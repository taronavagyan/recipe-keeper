const nextId = require("./next-id");

class Ingredient {
  constructor(name, quantity, unit) {
    this.id = nextId();
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
  }
}

module.exports = Ingredient;
