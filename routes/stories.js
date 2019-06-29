const express = require("express"),
  router = express.Router();

// controllers
const storiesController = require("../controllers/stories");
// multer
const imageCheck = require("../middleware/imageFileMulter");
// models
const Story = require("../models/story");
// Helpers
const { ensureAuthenticated } = require("../helpers/auth");
const { calculateVotes, calculateUniqueVotes } = require("../helpers/vote");

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}
// * safe routes
// get public stories view
router.get("/", (req, res, next) => {
  // search
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), "gi");
    Story.find({ title: regex, status: "public" })
      .sort({ date: "desc" })
      .populate("creator")
      .then(async stories => {
        if (stories.length < 1) {
          res.render("index/search", { search: req.query.search });
        } else {
          // add Votes
          stories = await calculateVotes(stories, req.user);
          // sort by totall votes
          stories = stories.sort((s1, s2) =>
            s1.totalVotes < s2.totalVotes ? 1 : -1
          );
          // render view
          return res.render("stories/index", { stories });
        }
      });
  } else {
    Story.find({ status: "public" })
      .sort({ date: "desc" })
      .populate("creator")
      .then(async stories => {
        // add Votes
        stories = await calculateVotes(stories, req.user);
        // sort by totall votes
        stories = stories.sort((s1, s2) =>
          s1.totalVotes < s2.totalVotes ? 1 : -1
        );

        // render view
        return res.render("stories/index", { stories });
      });
  }
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
    .then(async story => {
      if (story.status == "public") {
        // add totalVotes
        const storyWithVotes = await calculateUniqueVotes(story, req.user);
        story = storyWithVotes;
        return res.render("stories/show", { story });
      } else if (req.user) {
        if (story.creator.id == req.user.id) {
          // add totalVotes
          const storyWithVotes = await calculateUniqueVotes(story, req.user);
          story = storyWithVotes;
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
  Story.findOne({ _id: req.params.id }).then(story => {
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
    .sort({ date: "desc" })
    .populate("creator")
    .then(async stories => {
      // add totalVotes
      const storiesWithVotes = await calculateVotes(stories, req.user);
      stories = storiesWithVotes;
      res.render("stories/index", { stories });
    });
});
// get stories by authenticated user
router.get("/my", ensureAuthenticated, (req, res) => {
  Story.find({ creator: req.user.id })
    .populate("creator")
    .sort({ date: "desc" })
    .then(async stories => {
      // add totalVotes
      const storiesWithVotes = await calculateVotes(stories, req.user);
      stories = storiesWithVotes;
      res.render("stories/index", { stories });
    });
});

// * unsafe Routes
router.post(
  "/add",
  ensureAuthenticated,
  imageCheck,
  storiesController.addStory
);
router.put(
  "/edit/:id",
  ensureAuthenticated,
  imageCheck,
  storiesController.editStory
);
router.delete("/:id", ensureAuthenticated, storiesController.deleteStory);
// * Comments
router
  .route("/comment/:storyId")
  .post(ensureAuthenticated, storiesController.addComment)
  .delete(ensureAuthenticated, storiesController.deleteComment);

// * Votes
// External vote collection
router.post(
  "/upVote/:storyId/:vote",
  ensureAuthenticated,
  storiesController.upVoteToggle
);
router.post(
  "/downVote/:storyId/:vote",
  ensureAuthenticated,
  storiesController.downVoteToggle
);
module.exports = router;
