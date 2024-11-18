const express = require("express");
const router = express.Router();
const purchaseSchema = require("../Models/Compras");
const User = require("../Models/User");
const Event = require("../Models/Event");

// Create purchase
router.post("/purchases", async (req, res) => {
  try {
    const { user_id, event_id, ticket_quantity } = req.body;

    // Validar referencias
    const userExists = await User.findById(user_id);
    const eventExists = await Event.findById(event_id);

    if (!userExists) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    if (!eventExists) {
      return res.status(404).json({ message: "Evento no encontrado" });
    }

    if (eventExists.available_tickets < ticket_quantity) {
      return res.status(400).json({
        message: `don't have ${ticket_quantity} tickets available`,
      });
    }

    // Crear compra
    const purchase = new purchaseSchema(req.body);
    const savedPurchase = await purchase.save();

    // Actualizar el historial de compras del usuario
    const updateUser = await User.updateOne(
      { _id: savedPurchase.user_id },
      { $push: { "client.purchase_history": { purchase_id: savedPurchase._id } } }
    );

    if (updateUser.modifiedCount === 0) {
      return res.status(404).json({ message: "Don't have actualize history user" });
    }

    // Actualizar cantidad de entradas del evento
    eventExists.available_tickets -= ticket_quantity;
    eventExists.seats_sold += ticket_quantity
    await eventExists.save();

    res.status(201).json(savedPurchase);
  } catch (error) {
    console.error("Error creating the purchase:", error);
    res.status(500).json({ message: error.message });
  }
});


// Get all purchases
router.get("/purchases", async (req, res) => {
  purchaseSchema.find()

    .then((data) => res.json(data))
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Get a purchase by ID
router.get("/purchases/:id", async (req, res) => {
  try {
    const purchase = await purchaseSchema
      .findById(req.params.id)
    if (!purchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json(purchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get purchases of a user
router.get("/purchases/user/:user_id", async (req, res) => {
  try {
    const purchases = await purchaseSchema
      .find({ user_id: req.params.user_id })
    if (!purchases.length) {
      return res
        .status(404)
        .json({ message: "No purchases found for this user" });
    }
    res.json(purchases);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Update a purchase
router.put("/purchases/:id", async (req, res) => {
  try {
    const updatedPurchase = await purchaseSchema.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }
    res.json(updatedPurchase);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete a purchase
router.delete("/purchases/:id", async (req, res) => {
  try {
    const deletedPurchase = await purchaseSchema.findByIdAndDelete(req.params.id);
    if (!deletedPurchase) {
      return res.status(404).json({ message: "Purchase not found" });
    }

    // Remove reference from user's purchase history
    await User.updateOne(
      { _id: deletedPurchase.user_id },
      {
        $pull: { "Client.purchase_history": { purchase_id: deletedPurchase._id } }
      }
    );

    const eventExists = await Event.findById(deletedPurchase.event_id);
    eventExists.available_tickets += deletedPurchase.ticket_quantity;

    if (eventExists) {
      eventExists.available_tickets += deletedPurchase.ticket_quantity;
      eventExists.sold_seats -= deletedPurchase.ticket_quantity;
      await eventExists.save();
    }

    res.json({ message: "Purchase deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Delete all purchases and history of users
router.delete("/purchases", async (req, res) => {
  try {
    await purchaseSchema.deleteMany();
    await User.updateMany(
      {},
      { $set: { "Client.purchase_history": [] } }
    );
    res.json({ message: "All purchases and history deleted" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
