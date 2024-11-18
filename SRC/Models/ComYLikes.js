
const mongoose = require("mongoose");
const user = require("./User");
const event = require("./Event");

const commentAndLikesSchema = new mongoose.Schema({

    event_id: { type: mongoose.Schema.Types.ObjectId, ref: "Event" },
    comment: { 
        user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
        text: { type: String, required: true },
        user_name: { type: String, required: true, ref: "User" },
    },
    like: {type: Boolean, default: false},
});

module.exports = mongoose.model("CommentAndLikes", commentAndLikesSchema);
