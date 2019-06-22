const express = require("express"),
  router = express.Router();

// Helpers
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");
// controllers
const storiesController = require("../controllers/stories");
// models
const Story = require("../models/story");
const Vote = require("../models/vote");

// for public stories feed :
// checks if current user voted and add votes to a new stories array
const calculateVotes = async (stories, user) => {
  let storyTotalVotes = [];
  for (const story of stories) {
    const newStory = { ...story._doc };
    if (user) {
      newStory.currentUserVoted = false;
      newStory.currentUserDirection = 0;
      // for handlebars {
      newStory.currentUserVotedUp = false;
      newStory.currentUserVotedDown = false;
      // }
      await Vote.findOne({ storyId: story.id, voteCreator: user }).then(
        async vote => {
          if (vote) {
            newStory.currentUserVoted = true;
            newStory.currentUserDirection = vote.direction;
            // for handlebars :
            if (vote.direction > 0) newStory.currentUserVotedUp = true;
            if (vote.direction < 0) newStory.currentUserVotedDown = true;
          }
        }
      );
    }
    newStory.totalVotes = 0;
    newStory.totalUpVotes = 0;
    newStory.totalDownVotes = 0;
    await Vote.find({ storyId: story.id }).then(async votes => {
      if (votes.length > 0) {
        await votes.forEach(async vote => {
          // todo : remove if statements cuz not needed :
          if (vote.direction < 0) {
            newStory.totalDownVotes += vote.direction;
          }
          if (vote.direction > 0) {
            newStory.totalUpVotes += vote.direction;
          }
          newStory.totalVotes += vote.direction;
        });
      }
    });
    storyTotalVotes.push(newStory);
  }
  return storyTotalVotes;

  // stories.forEach(story => {
  //   Vote.find({ storyId: story.id }).then(votes => {
  //     if (votes.length > 0) {
  //       votes.forEach(vote => {
  //         if (vote.direction = 1) {
  //           totalVotes += vote.direction;
  //           console.log("TCL: calculateTotalVotes -> totalVotes", totalVotes)
  //         }
  //       });
  //     }
  //   });
  // });
};

// * safe routes
// get public stories view
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .sort({ date: "desc" })
    .populate("creator")
    .then(async stories => {
      // add totalVotes
      const storiesWithVotes = await calculateVotes(stories, req.user);
      // console.log("TCL: last totalVotes", storiesWithVotes);
      stories = storiesWithVotes;
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
// * Comments
router
  .route("/comment/:storyId")
  .post(ensureAuthenticated, storiesController.addComment)
  .delete(ensureAuthenticated, storiesController.deleteComment);

// * Votes
// TODO: add ensure auth
// External vote collection
// router.post("/upVote/:storyId/:vote", ( req, res ) => res.json({ message : 'voting route reached !'}));
router.post("/upVote/:storyId/:vote", storiesController.upVoteToggle);
router.post("/downVote/:storyId/:vote", storiesController.downVoteToggle);
// intern vote
// router.post("/upVote/:storyId/:vote", storiesController.upVote);
// router.post("/downVote/:storyId/:vote", storiesController.downVoteToggle);
module.exports = router;
