"use strict";

// Dynamically add ingredient fields when the "Add Ingredient" button is clicked
const addIngredientButton = document.getElementById("addIngredientButton");
const ingredientsContainer = document.getElementById("ingredients");

addIngredientButton.addEventListener("click", () => {
  const ingredientFields = document.createElement("div");
  ingredientFields.classList.add("ingredient");
  ingredientFields.innerHTML = `
        <input type="text" name="ingredientName[]" placeholder="Ingredient name">
        <input type="text" name="ingredientQuantity[]" placeholder="Quantity">
        <input type="text" name="ingredientUnit[]" placeholder="Unit">
        <button type="button" class="deleteIngredientButton">Delete</button>
      `;
  ingredientsContainer.appendChild(ingredientFields);

  // Dynamically delete ingredient fields when the "Delete Ingredient" button
  // is clicked.
  const deleteButtons = document.querySelectorAll(".deleteIngredientButton");
  deleteButtons.forEach((button) => {
    button.addEventListener("click", () => {
      button.parentNode.remove();
    });
  });
});
