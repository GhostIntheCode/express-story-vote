const express = require("express"),
  router = express.Router();
// helper :
const {ensureGuest} = require('../../helpers/auth')

// Oauth Routes
const passportOauth = require("./passportOauth");
router.use("/Oauth", passportOauth);

// local auth
const authController = require("../../controllers/auth");
router
  .route("/login")
  .get(ensureGuest, (req, res) => res.render("auth/login"))
  .post(authController.login);

router
  .route("/register")
  .get(ensureGuest, (req, res) => res.render("auth/register"))
  .post(authController.register);

router.get("/logout", (req, res) => {
  req.logOut();
  res.redirect("/");
});

module.exports = router;
