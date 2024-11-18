const mongoose = require("mongoose");
const User = require("./User");

// Define the event schema
const eventSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  organizer_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event_type: [{ type: String, required: true }],
  total_seats: { type: Number, required: true },
  seats_sold: { type: Number, required: true },
  available_tickets: { type: Number, required: true },
  ticket_price: { type: Number, required: true },
  location: {
    venue: { type: String, required: true },
    address: { type: String, required: true },
  },
  event_dates: {
    sales_start_date: { type: Date, required: true },
    sales_end_date: { type: Date, required: true },
    event_date: { type: Date, required: true },
    event_time: { type: String, required: true },
  },
  likes: { type: Number, default: 0 },
});

module.exports = mongoose.model("Event", eventSchema);
