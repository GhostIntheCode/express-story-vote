if (process.env.NODE_ENV === "production") {
  module.exports = {
    StoriesImagesUrl: "/stories/images/"
  };
} else {
  module.exports = require("./keys_dev");
}
