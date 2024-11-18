const express = require("express");
const router = express.Router();
const User = require("../Models/User");

// Crear usuario
router.post("/users", (req, res) => {
  const { nombre, email, password } = req.body;
  

  const user = new User(req.body);
  user
    .save()
    .then((data) => res.status(201).json(data))
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Obtener todos los usuarios
router.get("/users", (req, res) => {
  User.find()

    .then((data) => res.json(data))
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Obtener un usuario por ID
router.get("/users/:id", (req, res) => {
  const { id } = req.params;
  User.findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(data);
    })
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Actualizar un usuario por ID
router.put("/users/:id", (req, res) => {
  const { id } = req.params;
  User.findByIdAndUpdate(id, req.body, { new: true })
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json(data);
    })
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Eliminar un usuario por ID
router.delete("/users/:id", (req, res) => {
  const { id } = req.params;
  User.findByIdAndDelete(id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User deleted successfully" });
    })
    .catch((error) => res.status(500).json({ message: error.message }));
});

// Eliminar todos los usuarios
router.delete("/users", (req, res) => {
  // Optional: Add a confirmation or restriction before deleting all users
  User.deleteMany()
    .then((data) => res.json({ message: "All users deleted" }))
    .catch((error) => res.status(500).json({ message: error.message }));
});

module.exports = router;
