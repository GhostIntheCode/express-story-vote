const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const votesSchema = new Schema({
  direction: { type: Number, enum: [1, 0, -1], default: 0 },
  storyId: {
    type: Schema.Types.ObjectId,
    ref: "stories"
  },
  voteCreator: {
    type: Schema.Types.ObjectId,
    ref: "user"
  }
});

// const postVotesSchema = new Schema({
//   storyId: {
//     type: Schema.Types.ObjectId,
//     ref: "stories"
//   },
//   Votes: [{
//     direction: { type: Number, enum: [1, 0, -1], default: 0 },
//     voteCreator: {
//       type: Schema.Types.ObjectId,
//       ref: "user"
//     }
//   }]
// });

module.exports = mongoose.model("vote", votesSchema);
