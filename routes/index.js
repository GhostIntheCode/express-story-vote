const express = require("express"),
  router = express.Router();

// Routes
const authRouter = require("./auth"),
  storiesRouter = require("./stories");

// Helpers
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");

// models
const Story = require("../models/story");

router.get("/", ensureGuest, (req, res) => {
  res.render("index/welcome");
});
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Story.find({ creator: req.user.id })
    .populate("creator")
    .then(stories => {
      res.render("index/dashboard", { stories });
    });
});

router.use("/auth", authRouter);
router.use("/stories", storiesRouter);

module.exports = router;
