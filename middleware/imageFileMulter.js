const multer = require("multer");
const { StoriesImagesUrl } = require("../config/storage");

const MIME_TYPES = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg"
};
const storage = multer.diskStorage({
  destination: function(req, file, cb) {
    const isValid = MIME_TYPES[file.mimetype];
    let error = new Error("invalid mime type");
    isValid ? (error = null) : (error = error);
    cb(error, "public" + StoriesImagesUrl);
  },
  filename: function(req, file, cb) {
    const name =
      file.fieldname +
      "-" +
      file.originalname
        .toLowerCase()
        .split(" ")
        .join("-") +
      "-" +
      Date.now();
    const ext = MIME_TYPES[file.mimetype];
    cb(null, name + "." + ext);
  }
});

module.exports = multer({ storage: storage }).single("image");
