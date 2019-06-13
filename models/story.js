const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const storySchema = new Schema({
  title: {
    type: String,
    required: true
  },
  body: {
    type: String,
    required: true
  },
  image: String,
  allowComments:{ type: Boolean, default: true },
  status: { type: String, default: "public" },
  creator: {
      type: Schema.Types.ObjectId,
      ref: 'users'
  },
  date: {
    type: Date,
    default: Date.now
  },
  comments: [{
      commentBody: {
          type: String,
          required: true
      },
      commentDate: {
          type: Date,
          default: Date.now
      },
      commentCreator: {
        type: Schema.Types.ObjectId,
        ref: 'users'
      }
  }]
});

module.exports = mongoose.model("story", storySchema, 'stories');
