const express = require("express"),
  passport = require("passport"),
  router = express.Router(),
  authController = require("../../controllers/api/auth"),
  passportJwt = passport.authenticate("jwt", { session: false });

router.post(
  "/login",
  authController.login
);
router.post(
  "/signUp",
  authController.signUp
);

router
  .route("/secret")
  .get(
    passportJwt,
    authController.secret
  );

module.exports = router;
