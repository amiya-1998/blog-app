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

app.use(function(req, res, next){
  res.locals.currentUser = req.user;
  next();
});

// Routes

// INDEX Route
app.get("/", function(req, res) {
  res.redirect("/blogs");
});

// LOGIN Route
app.get("/login", function(req, res){
  res.render("login");
});

app.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}), function(req, res){
});

// REGISTER Route
app.get("/register", function(req, res){
  res.render("register");
});

app.post("/register", function(req, res){
  User.register(new User({username: req.body.username}), req.body.password, function(err, user){ // User object that we want to create and the password separately
    if(err) {
      console.log(err);
      return res.render("register");
    } else {
        passport.authenticate("local")(req, res, function() {
        res.redirect("/");
      });
    }
  });
});

// LOGOUT Route
app.get("/logout", isLoggedIn, function(req, res){
  req.logout();
  res.redirect("/");
});

app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log("Error!");
    } else {
      res.render("blogs/index", {blogs: blogs});
    }
  })
});

// NEW BLOG Route
app.get("/blogs/new", isLoggedIn, function(req, res) {
  res.render("blogs/new");
});

app.post("/blogs", isLoggedIn, function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog){
    if(err) {
      res.render("blogs/new");
    } else {
      res.redirect("/blogs");
    }
  });
});

// SHOW Route
app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("blogs/show", {blog: foundBlog});
    }
  });
});


// COMMENT Route
app.get("/blogs/:id/comments/new", isLoggedIn, function(req, res){
  Blog.findById(req.params.id, function(err, blog){
    if(err) {
      console.log(err);
    } else {
      res.render("comments/new", {blog: blog});
    }
  });
});

app.post("/blogs/:id/comments", isLoggedIn, function(req, res){
  Blog.findById(req.params.id, function(err, blog){
    if(err) {
      console.log(err);
      res.redirect("/blogs");
    } else {
      Comment.create(req.body.comment, function(err, comment){
        if(err){
          console.log(err);
          res.redirect("/blogs");
        } else {
          blog.comments.push(comment);
          blog.save();
          res.redirect("/blogs/" + blog._id);
        }
      });
    }
  })
});

app.get("/blogs/:id/edit", isLoggedIn, function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("blogs/edit", {blog: foundBlog});
    }
  });
});

app.put("/blogs/:id", isLoggedIn, function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

app.delete("/blogs/:id", isLoggedIn, function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){ // After deleted no more data comes back except error
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

app.listen(3000, 'localhost', function() {
  console.log("Server started at port 3000.");
});
