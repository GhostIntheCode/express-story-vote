const express = require("express"),
  router = express.Router(),
  fetch = require("node-fetch");

// Routes
const authRouter = require("./auth"),
  storiesRouter = require("./stories"),
  apiRoutes = require("./api");

// Helpers
const { ensureAuthenticated, ensureGuest } = require("../helpers/auth");
const { calculateVotes } = require("../helpers/vote");

// models
const Story = require("../models/story");

router.get("/", ensureGuest, (req, res) => {
  res.render("index/welcome");
});
router.get("/nodeFetch", (req, res) => {
  fetch("https://api.github.com/users/abayoss")
    .then(res => res.json())
    .then(json => {
      res.json({ appCreator: json });
    });
});
router.get("/search", (req, res) => {
  res.render("index/search");
});
router.get("/dashboard", ensureAuthenticated, (req, res) => {
  Story.find({ creator: req.user.id })
    .populate("creator")
    .then(async stories => {
      // add totalVotes
      const storiesWithVotes = await calculateVotes(stories, req.user);
      stories = storiesWithVotes;
      res.render("index/dashboard", { stories });
    });
});

router.use("/auth", authRouter);
router.use("/stories", storiesRouter);
router.use("/api", apiRoutes);

module.exports = router;
