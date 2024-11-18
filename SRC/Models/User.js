const mongoose = require("mongoose");
const Event = require("./Event");

// Define the user schema
const userSchema = new mongoose.Schema({
  first_name: { type: String, required: true },
  last_name: { type: String, required: true },
  birth_date: { type: Date, required: true },
  phone: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  roles: { type: String },
  client: {
    purchase_history: [
      {
        purchase_id: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "Purchase" 
        },
      },
    ],
    preferences: { type: String },
  },
  organizer: {
    events: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],
  },
  administrator: {
    special_permissions: { type: Boolean },
  },
});

module.exports = mongoose.model("User", userSchema);
