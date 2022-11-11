const { ObjectId } = require("mongoose").Types;
const { read } = require("fs");
const { Thought, Reaction, User } = require("../models");

module.exports = {
  //GET to get all thoughts
  getAllThoughts(req, res) {
    Thought.find()
      .then((thought) => res.json(thought))
      .catch((err) => res.status(500).json(err));
  },
  //GET to get a single thought by its _id
  getSingleThought(req, res) {
    Thought.findOne({ _id: req.params.thoughtId })
      .then((thought) => res.json(thought))
      .catch((err) => res.status(500).json(err));
  },
  //POST to create a new thought (dont forget to push the created thought's _id to the associated user's thoughts array field)
  createThought(req, res) {
    Thought.create(req.body)
      .then((thought) => {
        return User.findOneAndUpdate(
          { _id: req.body.userId },
          { $addToSet: { thoughts: thought._id } },
          { new: true }
        );
      })
      .then((user) =>
        !user
          ? res.status(404).json({
              message: "No user found with this id.",
            })
          : res.json(user)
      )
      .catch((err) => {
        res.status(500).json(err);
      });
  },
  //PUT to update a thought by its _id
  updateThought(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $set: req.body },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought found with this id." })
          : res.json(thought)
      )
      .catch((err) => {
        res.status(500).json(err);
      });
  },
  //DELETE to remove a thought by its _id
  deleteThought(req, res) {
    Thought.findOneAndRemove(
      { _id: req.params.thoughtId },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with that id." })
          : User.findOneAndUpdate(
              { thoughts: req.params.thoughtId },
              { $pull: { thoughts: req.params.thoughtId } },
              { new: true }
            )
      )
      .then((user) =>
        !user
          ? res.status(404).json({ message: "No user with that id" })
          : res.json(user)
      )
      .catch((err) => {
        res.status(500).json(err);
      });
  },

  // /api/thought/:thoughtId/reactions

  //POST to create a reaction stored in a single thought's [reactions] array field
  createReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $addToSet: { reactions: req.body } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id." })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
  //DELETE to pull and remove a reaction by the reaction's reactionId value
  deleteReaction(req, res) {
    Thought.findOneAndUpdate(
      { _id: req.params.thoughtId },
      { $pull: { reactions: { reactionId: req.params.reactionId } } },
      { runValidators: true, new: true }
    )
      .then((thought) =>
        !thought
          ? res.status(404).json({ message: "No thought with this id." })
          : res.json(thought)
      )
      .catch((err) => res.status(500).json(err));
  },
};
