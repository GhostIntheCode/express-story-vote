const passport = require("passport"),
  User = require("../models/user"),
  bcrypt = require("bcryptjs");

module.exports = {
  login: (req, res, next) => {
    passport.authenticate("local", {
      successRedirect: "/dashboard",
      failureRedirect: "/auth/login",
      failureFlash: true
    })(req, res, next);
  },
  register: (req, res) => {
    let errors = [];

    if (req.body.password[0] != req.body.password[1]) {
      errors.push({ text: "Passwords do not match" });
    }

    if (req.body.password[0].length < 4 || req.body.password[1].length < 4) {
      errors.push({ text: "Password must be at least 4 characters" });
    }

    if (errors.length > 0) {
      res.render("auth/register", {
        errors: errors,
        name: req.body.name,
        email: req.body.email
      });
    } else {
      User.findOne({ email: req.body.email }).then(user => {
        if (user) {
          req.flash("error_msg", "Email already regsitered");
          errors.push({ text: "user already exists" });
          res.redirect("/auth/login", {
            errors: errors
          });
        } else {
          const newUser = new User({
            firstName: req.body.name,
            email: req.body.email,
            password: req.body.password[0],
            image: "/img/NoImage.jpg"
          });
          // hash v2 :
          // using a pre method to hash password on the user model 
          newUser
            .save()
            .then(user => {
              req.flash("success_msg", "You are now registered and can log in");
              res.redirect("/auth/login");
            })
            .catch(err => {
              console.log(err);
              return;
            });
          // hash V1 :
          // bcrypt.genSalt(10, (err, salt) => {
          //   bcrypt.hash(newUser.password, salt, (err, hash) => {
          //     if (err) throw err;
          //     newUser.password = hash;
          //     newUser
          //       .save()
          //       .then(user => {
          //         req.flash(
          //           "success_msg",
          //           "You are now registered and can log in"
          //         );
          //         res.redirect("/auth/login");
          //       })
          //       .catch(err => {
          //         console.log(err);
          //         return;
          //       });
          //   });
          // });
        }
      });
    }
  }
};
