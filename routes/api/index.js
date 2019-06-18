const express = require("express"),
  router = express.Router();

// Routes
const authRouter = require("./auth");
// helpers
const { apiEnsureAuthenticated, ensureGuest } = require("../../helpers/auth");
//controller :
const apiStoriesController = require("../../controllers/api/story");
// story model
const Story = require("../../models/story");
// multer :
const imageCheck = require('../../middleware/imageFileMulter');

//story routes :

// * safe routes
// get public stories view
router.get("/", (req, res) => {
  Story.find({ status: "public" })
    .sort({ date: "desc" })
    .populate("creator")
    .then(stories => {
      res.json({ stories });
    });
});
// get story by id
router.get("/show/:id", (req, res) => {
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
          res.json({message: 'unauthorized'});
        }
      } else {
        res.redirect({message: 'unauthorized'});
      }
    });
});
// get edit story view
// router.get("/edit/:id", apiEnsureAuthenticated, (req, res) => {
//   Story.findOne({ _id: req.params.id })
//     // .populate('creator')
//     .then(story => {
//       if (story.creator != req.user.id) {
//         res.redirect(`/stories/show/${story.id}`);
//       } else {
//         res.render("stories/edit", { story });
//       }
//     });
// });
// get stories by user
router.get("/user/:userId", (req, res) => {
  Story.find({ creator: req.params.userId, status: "public" })
    .populate("creator")
    // .populate("comments.commentCreator")
    .then(stories => {
      res.json({ stories });
    });
});
// get stories by authenticated user
router.get("/my", apiEnsureAuthenticated, (req, res) => {
  Story.find({ creator: req.user.id })
    .populate("creator")
    .then(stories => {
      res.json({ stories });
    });
});

// * unsafe Routes
router.post(
  "/add",
  apiEnsureAuthenticated,
  imageCheck,
  apiStoriesController.addStory
);
router.put(
  "/edit/:id",
  apiEnsureAuthenticated,
  imageCheck,
  apiStoriesController.editStory
);
router.delete("/:id", apiEnsureAuthenticated, apiStoriesController.deleteStory);
// Comments
router.post("/comment/:id", apiEnsureAuthenticated, apiStoriesController.addComment);
router.delete(
  "/comment/:id",
  apiEnsureAuthenticated,
  apiStoriesController.deleteComment
);

// auth routes :
router.use("/auth", authRouter);

module.exports = router;
