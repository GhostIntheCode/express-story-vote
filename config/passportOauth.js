const GoogleStrategy = require("passport-google-oauth20").Strategy,
  LocalStrategy = require("passport-local").Strategy,
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require('passport-jwt').ExtractJwt,
  FacebookStrategy = require("passport-facebook").Strategy,
  // TwitterStrategy = require("passport-twitter").Strategy,
  User = require("../models/user"),
  // bcrypt = require("bcryptjs"),
  keys = require("./keys");

module.exports = function(passport) {
  // for api :
  var opts = {};
  opts.jwtFromRequest = ExtractJwt.fromAuthHeaderAsBearerToken();
  opts.secretOrKey = "secret";
  opts.issuer = "accounts.examplesoft.com";
  opts.audience = "storybooks.com";
  opts.passReqToCallback = true;
  passport.use(
    new JwtStrategy(opts, function(req, jwt_payload, done) {
      User.findOne({ id: jwt_payload.sub }, function(err, user) {

        // if (err) {
        //   return done(err, false);
        // }
        // if (user) {
        //   return done(null, user);
        // } else {
        //   return done(null, false);
        //   // or you could create a new account
        // }
      });
    })
  );
  // for view:
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email"
      },
      async (email, password, done) => {
        User.findOne({
          email: email
        }).then(user => {
          if (!user) {
            return done(null, false, { message: "No User Found" });
          }
          // match password v2:
          user.isValidPassword(password).then(isMatch => {
            if (isMatch) {
              return done(null, user);
            } else {
              return done(null, false, {
                message: "Incorrect Email and/or Password"
              });
            }
          });

          // Match password v1:
          // bcrypt.compare(password, user.password, (err, isMatch) => {
          //   if (err) throw err;
          //   if (isMatch) {
          //     return done(null, user);
          //   } else {
          //     return done(null, false, { message: "Password Incorrect" });
          //   }
          // });
        });
      }
    )
  );
  passport.use(
    new GoogleStrategy(
      {
        clientID: keys.google.ClientID,
        clientSecret: keys.google.ClientSecret,
        callbackURL: "/auth/Oauth/google/callback",
        proxy: true
      },
      (accessToken, refreshToken, profile, done) => {
        const newUser = {
          googleID: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: "/img/NoImage.jpg"
        };
        newUser.image = profile.photos[0].value;

        User.findOne({ googleID: profile.id }).then(user => {
          if (user) {
            // return user
            done(null, user);
          } else {
            // create user
            new User(newUser).save().then(user => done(null, user));
          }
        });
      }
    )
  );
  passport.use(
    new FacebookStrategy(
      {
        clientID: keys.facebook.ClientID,
        clientSecret: keys.facebook.ClientSecret,
        callbackURL: "/auth/Oauth/facebook/callback",
        profileFields: ["id", "name", "email"]
      },
      function(accessToken, refreshToken, profile, done) {
        const newUser = {
          facebookID: profile.id,
          firstName: profile.name.givenName,
          lastName: profile.name.familyName,
          email: profile.emails[0].value,
          image: "/img/NoImage.jpg"
        };
        newUser.image =
          "https://graph.facebook.com/" + profile.id + "/picture?type=large";

        User.findOne({ facebookID: profile.id }).then(user => {
          if (user) {
            // return user
            done(null, user);
          } else {
            // create user
            new User(newUser).save().then(user => done(null, user));
          }
        });
      }
    )
  );

  // coockie stuff
  passport.serializeUser((user, done) => {
    done(null, user.id);
  });
  passport.deserializeUser((id, done) => {
    User.findById(id).then(user => done(null, user));
  });
};
