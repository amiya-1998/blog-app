var express = require("express");
var router = express.Router();
var User = require("../models/user");
var passport = require("passport");

// INDEX Route
router.get("/", function(req, res) {
  res.redirect("/blogs");
});

// LOGIN Route
router.get("/login", function(req, res){
  res.render("login");
});

router.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/login"
}), function(req, res){
});

// REGISTER Route
router.get("/register", function(req, res){
  res.render("register");
});

router.post("/register", function(req, res){
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
router.get("/logout", isLoggedIn, function(req, res){
  req.logout();
  res.redirect("/");
});

// MIDDLEWARES
function isLoggedIn(req, res, next){
  if(req.isAuthenticated()){
    return next();
  }
  res.redirect("/login");
}

module.exports = router;
