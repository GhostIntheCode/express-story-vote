const express = require("express"),
  router = express.Router(),
passport = require('passport');

router.post(
  "/auth/jwt",
  passport.authenticate("jwt", { session: false }),
  (req, res) => {
    res.send(req.user.profile);
  }
);

module.exports = router;
