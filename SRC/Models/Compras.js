const mongoose = require("mongoose");
const user = require("./User");
const event = require("./Event");

const purchaseSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Event",
    required: true,
  },
  purchase_date: {
    type: Date,
    default: Date.now,
  },
  ticket_quantity: {
    type: Number,
    required: true,
    min: 1,
  },
  unit_price: {
    type: Number,
    required: true,
    min: 0,
  },
  total_price: {
    type: Number,
    required: true,
    min: 0,
  },
});

// Middleware to automatically calculate total_price
purchaseSchema.pre("save", function (next) {
  this.total_price = this.ticket_quantity * this.unit_price;
  next();
});

module.exports = mongoose.model("Purchase", purchaseSchema);
