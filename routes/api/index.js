const express = require("express"),
  router = express.Router();

// Routes
const authRouter = require("./auth");
const storiesRouter = require("./stories");

// routes :
router.use("/auth", authRouter);
router.use("/stories", storiesRouter);

module.exports = router;
