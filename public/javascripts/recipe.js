"use strict";

// Dynamically add ingredient fields when the "Add Ingredient" button is clicked
const addIngredientButton = document.getElementById("addIngredientButton");
const ingredientsContainer = document.getElementById("ingredients");

addIngredientButton.addEventListener("click", () => {
  const ingredientFields = document.createElement("div");
  ingredientFields.classList.add("ingredient");
  ingredientFields.innerHTML = `
        <input type="text" name="ingredientName[]" placeholder="Ingredient name" required>
        <input type="number" name="ingredientQuantity[]" placeholder="Quantity" min="1" max="9999" required>
        <input type="text" name="ingredientUnit[]" placeholder="Unit">
        <button type="button" class="deleteIngredientButton" required>Delete</button>
      `;
  ingredientsContainer.appendChild(ingredientFields);

  // Show the delete button only if there are 1 or more ingredients
  const deleteButtons = document.querySelectorAll(".deleteIngredientButton");
  if (deleteButtons.length === 1) {
    deleteButtons[0].style.display = "none";
  } else {
    deleteButtons.forEach((button) => {
      button.style.display = "block";
    });
  }
});

// Dynamically delete ingredient fields when the "Delete Ingredient" button is clicked.
ingredientsContainer.addEventListener("click", (event) => {
  if (event.target.classList.contains("deleteIngredientButton")) {
    event.target.parentNode.remove();

    // Show the delete button only if there are 1 or more ingredients
    const deleteButtons = document.querySelectorAll(".deleteIngredientButton");
    if (deleteButtons.length === 1) {
      deleteButtons[0].style.display = "none";
    } else {
      deleteButtons.forEach((button) => {
        button.style.display = "block";
      });
    }
  }
});
