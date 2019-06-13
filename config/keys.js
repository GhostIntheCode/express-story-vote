if (process.env.NODE_ENV === "production") {
  module.exports = {
    mongoURI: process.env.mongoURI,
    google: {
      ClientID: process.env.googleClientID,
      ClientSecret: process.env.googleClientSecret
    },
    facebook: {
      ClientID: process.env.facebookClientID,
      ClientSecret: process.env.facebookClientSecret
    }
  };
} else {
  module.exports = require("./keys_dev");
}