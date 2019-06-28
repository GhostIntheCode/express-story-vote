const passport = require("passport"),
  JWT = require("jsonwebtoken"),
  User = require("../../models/user"),
  { JWT_SECRET } = require("../../config/keys");

signToken = user => {
  return JWT.sign(
    {
      iss: "abayoss",
      sub: user.id,
      iat: new Date().getTime(), // current time
      exp: new Date().setDate(new Date().getDate() + 1) // current time + 1 day ahead
    },
    JWT_SECRET
  );
};

module.exports = {
  signUp: async (req, res, next) => {
    const { email, password } = req.body;

    // Check if there is a user with the same email
    const foundUser = await User.findOne({ email });
    if (foundUser) {
      return res.status(403).json({ error: "Email is already in use" });
    }

    // Create a new user
    const newUser = new User({ email, password });
    await newUser.save();

    // Generate the token
    const token = signToken(newUser);

    // Respond with token
    res.status(200).json({ token });
  },
  login: async (req, res, next) => {
    const { email, password } = req.body;
    const foundUser = await User.findOne({ email });
    const isMatch = await foundUser.isValidPassword(password);
    if (isMatch) {
      // Generate and respond with the token
      const token = signToken(foundUser);
      res.status(200).json({ token });
    } else {
      return res.status(403).json({ error: "invalid login credentials " });
    }
  },
  secret: (req,res) => res.json({message : "hey secret", user: req.user.id})
};
