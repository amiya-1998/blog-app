var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");
var passport = require("passport");
var LocalStrategy = require("passport-local");
var passportLocalMongoose = require("passport-local-mongoose");
var User = require("./models/user");
var Blog = require("./models/blog");
var Comment = require("./models/comment");
var blogRoutes = require("./routes/blogs");
var commentRoutes = require("./routes/comments");
var indexRoutes = require("./routes/index");

mongoose.connect("mongodb://localhost/blog");

app = express();
app.set("view engine", "ejs");
app.use(require("express-session")({
  secret: "My name is Amiya", // Encode and decode the session
  resave: false,
  saveUninitialized: false
}));
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // Must go after bodyParser
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
// Responsible and encoding and decoding the session respectively
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  next();
});

// Routes
app.use(indexRoutes); // "/" by default
app.use("/blogs", blogRoutes);
app.use("/blogs/:id/comments", commentRoutes);

app.listen(3000, 'localhost', function() {
  console.log("Server started at port 3000.");
});
