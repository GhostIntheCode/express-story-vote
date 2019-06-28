const GoogleStrategy = require("passport-google-oauth20").Strategy,
  LocalStrategy = require("passport-local").Strategy,
  JwtStrategy = require("passport-jwt").Strategy,
  ExtractJwt = require("passport-jwt").ExtractJwt,
  FacebookStrategy = require("passport-facebook").Strategy,
  User = require("../models/user"),
  keys = require("./keys");

module.exports = function(passport) {
  // for api :
  passport.use(
    new JwtStrategy({
      jwtFromRequest: ExtractJwt.fromHeader('authorization'),
      secretOrKey: keys.JWT_SECRET
    }, async function(jwt_payload, done) {
      try {
        // Find the user specified in token
        const user = await User.findById(jwt_payload.sub);

        // If user doesn't exist, handle it
        if (!user) {
          return done(null, false);
        }

        // Otherwise, return the user
        done(null, user);
      } catch (error) {
        done(error, false);
      }
    })
  );
  // for view:
  passport.use(
    new LocalStrategy(
      {
        usernameField: "email"
      },
      async (email, password, done) => {
        try {
          User.findOne({
            email
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
          });
        } catch (error) {
          done(error, false);
        }
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
