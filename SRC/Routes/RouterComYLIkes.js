const express = require("express");
const router = express.Router();
const comYLIkesSchema = require("../Models/ComYLikes");
const Event = require("../Models/Event");

router.post("/comYLikes", async (req, res) => {
  const { event_id, user_id, comment, user_name, like } = req.body;

  try {
    // Crear un nuevo documento de comentarios y likes
    const newCommentAndLike = new comYLIkesSchema({
      event_id,
      user_id,
      comment,
      user_name,
      like
    });

    // Guardar el comentario en la base de datos
    const savedCommentAndLike = await newCommentAndLike.save();

    // Incrementar likes en el evento si `like` es verdadero
    if (like) {
      const updatedEvent = await Event.findByIdAndUpdate(
        event_id,
        { $inc: { likes: 1 } },
        { new: true }
      );

      if (!updatedEvent) {
        return res.status(404).json({ message: "Event not found" });
      }
    }

    // Responder con el comentario guardado
    res.status(201).json(savedCommentAndLike);
  } catch (error) {
    res.status(500).json({ errorr: error.message });
  }
});

router.get("/comYLikes", (req, res) => {
  comYLIkesSchema
    .find()
    .then((data) => res.json(data))
    .catch((error) => res.status(500).json({ message: error.message }));
});

router.get("/comYLikes/:id", (req, res) => {
  const { id } = req.params;
  comYLIkesSchema
    .findById(id)
    .then((data) => {
      if (!data) {
        return res.status(404).json({ message: "comYLike not found" });
      }
      res.json(data);
    })
    .catch((error) => res.status(500).json({ message: error.message }));
});
router.get("/comYLikes/event/:event_id", async (req, res) => {
  const { event_id } = req.params;

  // Verificar si el event_id es válido
  if (!event_id.match(/^[0-9a-fA-F]{24}$/)) {
    return res.status(400).json({ message: "Invalid event ID format" });
  }

  try {
    const commentsAndLikes = await comYLIkesSchema.find({ event_id });

    // Si no se encuentran comentarios, retornar un mensaje
    if (!commentsAndLikes.length) {
      return res
        .status(404)
        .json({ message: "No comments or likes found for this event" });
    }

    res.json(commentsAndLikes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.put("/comYLikes/:id", async (req, res) => {
    const { id } = req.params;
    const { like } = req.body;
  
    try {
      // Encuentra el comentario o like existente
      const existingComment = await comYLIkesSchema.findById(id);
  
      if (!existingComment) {
        return res.status(404).json({ message: "comYLike not found" });
      }
  
      // Si el like está cambiando de `true` a `false`, resta 1 al contador de likes del evento
      if (existingComment.like === true && like === false) {
        await Event.findByIdAndUpdate(
          existingComment.event_id,
          { $inc: { likes: -1 } },
          { new: true }
        );
      }
  
      // Si el like está cambiando de `false` a `true`, suma 1 al contador de likes del evento
      if (existingComment.like === false && like === true) {
        await Event.findByIdAndUpdate(
          existingComment.event_id,
          { $inc: { likes: 1 } },
          { new: true }
        );
      }
  
      // Actualiza el comentario o like con los nuevos datos
      const updatedComment = await comYLIkesSchema.findByIdAndUpdate(id, req.body, {
        new: true,
      });
  
      res.json(updatedComment);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
  

router.delete("/comYLikes/:id", async (req, res) => {
  const { id } = req.params;

  try {
    // Encuentra el comentario o like a eliminar
    const commentToDelete = await comYLIkesSchema.findById(id);

    if (!commentToDelete) {
      return res.status(404).json({ message: "Comment or like not found" });
    }

    // Si el like estaba activo, resta 1 al contador de likes del evento
    if (commentToDelete.like === true) {
      await Event.findByIdAndUpdate(
        commentToDelete.event_id,
        { $inc: { likes: -1 } },
        { new: true }
      );
    }

    // Elimina el comentario o like
    await comYLIkesSchema.findByIdAndDelete(id);

    res.json({ message: "Comment or like deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

router.delete("/comYLikes", (req, res) => {
  comYLIkesSchema
    .deleteMany()
    .then((data) => res.json(data))
    .catch((error) => res.status(500).json({ message: error.message }));
});

module.exports = router;
