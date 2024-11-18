const express = require("express");
const router = express.Router();

const Event = require("../Models/Event");
const User = require("../Models/User");

// Crear un evento y asignarlo al organizador
router.post("/events", async (req, res) => {
  try {
    const event = new Event(req.body);

    // Guardar el evento
    const savedEvent = await event.save();

    // Asignar el evento al organizador
    const updateResult = await User.updateOne(
      { _id: savedEvent.organizer_id },
      { $push: { "organizer.events": savedEvent._id } }
    );

    if (updateResult.nModified === 0) {
      return res.status(404).json({ message: "Organizer not found" });
    }

    res.status(201).json(savedEvent);
  } catch (error) {
    console.error("Error saving the event:", error);
    res.status(500).json({ message: error.message });
  }
});

// Obtener todos los eventos
router.get("/events", (req, res) => {
  Event.find()
    .populate("organizer_id", "first_name last_name email") // Opcional: Mostrar la información del organizador
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Obtener un evento por ID
router.get("/events/:id", (req, res) => {
  const { id } = req.params;
  Event.findById(id)
    .populate("organizer_id", "first_name last_name email")
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Actualizar un evento por ID
router.put("/events/:id", (req, res) => {
  const { id } = req.params;
  Event.findByIdAndUpdate(id, req.body, { new: true })
    .then((data) => res.json(data))
    .catch((error) => res.json({ message: error }));
});

// Eliminar un evento por ID
router.delete("/events/:id", async (req, res) => {
  const { id } = req.params;
  try {
    // Buscar el evento para obtener el ID del organizador
    const eventToDelete = await Event.findById(id);

    if (!eventToDelete) {
      return res.status(404).json({ message: "Event not found" });
    }

    // Eliminar el evento del organizador
    const updateResult = await User.updateOne(
      { _id: eventToDelete.organizer_id },
      { $pull: { "organizer.events": eventToDelete._id } }
    );

    if (updateResult.nModified === 0) {
      return res.status(404).json({ message: "Organizer not found or event not associated" });
    }

    // Eliminar el evento de la colección de eventos
    await eventToDelete.remove();

    res.status(200).json({ message: "Event deleted successfully" });
  } catch (error) {
    console.error("Error deleting the event:", error);
    res.status(500).json({ message: error.message });
  }
});

// Eliminar todos los eventos
router.delete("/events", async (req, res) => {
  try {
    // Eliminar todos los eventos
    const deletedEvents = await Event.deleteMany();

    // Eliminar los eventos asociados de todos los organizadores
    await User.updateMany(
      {},
      { $pull: { "organizer.events": { $in: deletedEvents._id } } }
    );

    res.status(200).json(deletedEvents);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
