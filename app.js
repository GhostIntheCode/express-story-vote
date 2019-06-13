const express = require("express"),
  app = express(),
  port = process.env.PORT || 3000,
  path = require("path"),
  indexRouter = require("./routes"),
  mongoose = require("mongoose"),
  exphbs = require("express-handlebars"),
  bodyParser = require("body-parser"),
  methodOverride = require("method-override"),
  flash = require("connect-flash"),
  passport = require("passport"),
  cookieParser = require("cookie-parser"),
  session = require("express-session"),
  keys = require("./config/keys");

// helpers for exhbs
const {
  truncate,
  stripTags,
  formatDate,
  select,
  editIcon
} = require("./helpers/hbs");

// passport config
require("./config/passportOauth")(passport);

// Body parser middleware
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

// method override
app.use(methodOverride("_method"));

mongoose
  .connect(keys.mongoURI, { useNewUrlParser: true })
  .then(console.log(`Connected to Atlas mongo cluster `))
  .catch(err => console.log(err));

app.engine(
  "handlebars",
  exphbs({
    helpers: {
      truncate,
      stripTags,
      formatDate,
      select,
      editIcon
    },
    defaultLayout: "main"
  })
);
app.set("view engine", "handlebars");

// static folder
app.use(express.static(path.join(__dirname, "public")));

app.use(cookieParser());
app.use(
  session({
    secret: "session secret",
    resave: true,
    saveUninitialized: true
  })
);

app.use(passport.initialize());
app.use(passport.session());

// use connect flash
app.use(flash());

// Global variables
app.use(function(req, res, next) {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

//Routes :
app.use("/", indexRouter);

// 404 response handler  :
app.get('*', function(req, res){
  res.status(404).render('404', {
    header: '404',
    message: 'this is not the page you are looking for'
  });
});

app.listen(port, () => console.log("server runing on port " + port + " ..."));
