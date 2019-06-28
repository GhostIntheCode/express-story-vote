const express = require("express"),
  passport = require("passport"),
  router = express.Router(),
  passportJwt = passport.authenticate("jwt", { session: false });

// controllers
const storiesController = require("../../controllers/stories");
const storiesApiController = require("../../controllers/api/stories");
// multer
const imageCheck = require("../../middleware/imageFileMulter");

// * safe routes
// get public stories
router.get("/", storiesApiController.getStories);
// get story by id
router.get("/show/:id", storiesApiController.getStory);
// get stories by user
router.get("/user/:userId", storiesApiController.getStoryByUser);
// get stories by authenticated user
router.get("/my", passportJwt, storiesApiController.getStoryByAuthUser);

// * unsafe Routes
router.post("/add", passportJwt, imageCheck, storiesController.addStory);
router.put("/edit/:id", passportJwt, imageCheck, storiesController.editStory);
router.delete("/:id", passportJwt, storiesController.deleteStory);
// Comments
router.post("/comment/:id", passportJwt, storiesController.addComment);
router.delete("/comment/:id", passportJwt, storiesController.deleteComment);

// * Votes
router.post("/upVote/:storyId/:vote", passportJwt, storiesController.upVoteToggle);
router.post("/downVote/:storyId/:vote", passportJwt, storiesController.downVoteToggle);

module.exports = router;
