const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");

const userSchema = new Schema({
  email: { type: String, required: true },
  password: String,
  googleID: String,
  facebookID: String,
  firstName: String,
  lastName: String,
  image: String
});

userSchema.pre("save", function(next) {
  console.log('entered');
  bcrypt.genSalt(10, (err, salt) => {
    bcrypt.hash(this.password, salt, (err, hashedPassword) => {
      console.log("TCL: this.password", this.password)
      if (err) throw err;
      this.password = hashedPassword;
      next();
    });
  });
});

userSchema.methods.isValidPassword = async function(newPassword) {
  try {
    return await bcrypt.compare(newPassword, this.password);
  } catch (error) {
    console.log(error);
  }
};
module.exports = mongoose.model("users", userSchema);
