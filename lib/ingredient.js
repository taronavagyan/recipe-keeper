const nextId = require("./next-id");

class Ingredient {
  constructor(name, quantity, unit) {
    this.id = nextId();
    this.name = name;
    this.quantity = quantity;
    this.unit = unit;
  }

  static makeIngredient(rawIngredient) {
    return Object.assign(new Ingredient(), rawIngredient);
  }

  toString() {
    return `${this.name} - ${this.quantity} ${this.unit}`;
  }
}

module.exports = Ingredient;
