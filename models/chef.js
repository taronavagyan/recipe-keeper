const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create schema for chef
const chefSchema = new Schema({
  name: {
    type: String,
    required: true,
  },
  country: String,
  speciality: String,
  experience: Number,
});

// Create model for chef
const Chef = mongoose.model("Chef", chefSchema);

module.exports = Chef;
