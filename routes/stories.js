const express = require("express"),
  router = express.Router();

// Helpers
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");
// controllers
const storiesController = require("../controllers/stories");
// models
const Story = require("../models/story");
const Vote = require("../models/vote");

// * safe routes
// get public stories view
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .sort({ date: "desc" })
    .populate("creator")
    .populate("votes")
    .then(stories => {
      console.log("TCL: stories", stories)
      // Vote.find({ storyId: { $lte: stories.id } }).then(vote => {
      //   console.log("TCL: vote", vote);
      // });
      res.render("stories/index", { stories });
    });
});
// add get add story view
router.get("/add", ensureAuthenticated, (req, res) => {
  res.render("stories/add");
});
// get story by id
router.get("/show/:id", (req, res) => {
  Story.findOne({ _id: req.params.id })
    .populate("creator")
    .populate("comments.commentCreator")
    .then(story => {
      if (story.status == "public") {
        return res.render("stories/show", { story });
      } else if (req.user) {
        if (story.creator.id == req.user.id) {
          return res.render("stories/show", { story });
        } else {
          res.redirect("/stories");
        }
      } else {
        res.redirect("/stories");
      }
    });
});
// get edit story view
router.get("/edit/:id", ensureAuthenticated, (req, res) => {
  Story.findOne({ _id: req.params.id })
    // .populate('creator')
    .then(story => {
      if (story.creator != req.user.id) {
        res.redirect(`/stories/show/${story.id}`);
      } else {
        res.render("stories/edit", { story });
      }
    });
});
// get stories by user
router.get("/user/:userId", (req, res) => {
  Story.find({ creator: req.params.userId, status: "public" })
    .populate("creator")
    // .populate("comments.commentCreator")
    .then(stories => {
      res.render("stories/index", { stories });
    });
});
// get stories by authenticated user
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ creator: req.user.id })
    .populate("creator")
    .then(stories => {
      res.render("stories/index", { stories });
    });
});

// * unsafe Routes
router.post("/add", ensureAuthenticated, storiesController.addStory);
router.put("/edit/:id", ensureAuthenticated, storiesController.editStory);
router.delete("/:id", ensureAuthenticated, storiesController.deleteStory);
// Comments
router
  .route("/comment/:storyId")
  .post(ensureAuthenticated, storiesController.addComment)
  .delete(ensureAuthenticated, storiesController.deleteComment);

// Votes
// TODO: add ensure auth
// router.post("/upVote/:storyId/:vote", storiesController.upVoteToggle);
// router.post("/downVote/:storyId/:vote", storiesController.downVoteToggle);
// intern vote   
router.post("/upVote/:storyId/:vote", storiesController.upVote);
// router.post("/downVote/:storyId/:vote", storiesController.downVoteToggle);
module.exports = router;
