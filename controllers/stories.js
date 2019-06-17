// models
const Story = require("../models/story");

module.exports = {
  addStory: (req, res) => {
    const url = req.protocol + "://" + req.get("host");
    const newStory = {
      title: req.body.title,
      body: req.body.body,
      status: req.body.status,
      creator: req.user.id,
      image: url + "/img/NoImage.jpg",
    };
    if (!newStory.body) newStory.body = "to be writen soon...";
    if (!req.body.allowComments) {
      newStory.allowComments = false;
    }
    if (req.file) {
      newStory.image = url + "/stories/images/dev/" + req.file.filename;
    }
    new Story(newStory).save().then(story => {
      res.redirect(`/stories/show/${story.id}`);
    });
  },
  editStory: (req, res) => {
    Story.findOne({ _id: req.params.id }).then(story => {
      // new values
      story.title = req.body.title;
      story.body = req.body.body;
      story.status = req.body.status;
      if (req.body.allowComments) {
        story.allowComments = true;
      } else {
        story.allowComments = false;
      }

      story.save().then(story => {
        res.redirect(`/dashboard`);
      });
    });
  },
  deleteStory: (req, res) => {
    Story.deleteOne({ _id: req.params.id }).then(story => {
      res.redirect(`/dashboard`);
    });
  },
  addComment: (req, res) => {
    Story.findOne({ _id: req.params.id }).then(story => {
      const newComment = {
        commentBody: req.body.commentBody,
        commentCreator: req.user.id
      };
      // add to the begining of the array
      story.comments.unshift(newComment);

      story.save().then(story => {
        res.redirect(`/stories/show/${story.id}`);
      });
    });
  },
  deleteComment: () => {
    // ! until improuving app
  }
};
