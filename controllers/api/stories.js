// models
const Story = require("../../models/story");

module.exports = {
  getStories: (req, res) => {
    Story.find({ status: "public" })
      .sort({ date: "desc" })
      .populate("creator")
      .then(stories => {
        res.json({ stories });
      });
  },
  getStory: (req, res) => {
    Story.findOne({ _id: req.params.id })
      .populate("creator")
      .populate("comments.commentCreator")
      .then(story => {
        if (story.status == "public") {
          return res.json({ story });
        } else if (req.user) {
          if (story.creator.id == req.user.id) {
            return res.json({ story });
          } else {
            res.redirect("/stories");
          }
        } else {
          res.redirect("/stories");
        }
      });
  },
  getStoryByUser: (req, res) => {
    Story.find({ creator: req.params.userId, status: "public" })
      .populate("creator")
      .then(stories => {
        res.json({ stories });
      });
  },
  getStoryByAuthUser: (req, res) => {
    Story.find({ creator: req.user.id })
      .populate("creator")
      .then(stories => {
        res.json({ stories });
      });
  }
};
