var express = require("express");
var router = express.Router();
var Blog = require("../models/blog");
var middleware = require("../middleware"); // By default it will require the contents of index.js

// DISPLAY ALL AVAILABLE Blogs Route
router.get("/", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log("Error!");
    } else {
      res.render("blogs/index", {blogs: blogs});
    }
  });
});

// NEW BLOG Route

router.get("/new", middleware.isLoggedIn, function(req, res) {
  res.render("blogs/new");
});

router.post("/", middleware.isLoggedIn, function(req, res) {
  req.body.body = req.sanitize(req.body.body);
  var title = req.body.title;
  var image = req.body.image;
  var body = req.body.body;
  var author = {
    id: req.user._id,
    username: req.user.username
  }
  Blog.create({title:title , image:image, body:body, author:author}, function(err, newBlog){
    if(err) {
      res.render("blogs/new");
    } else {
      console.log(newBlog);
      res.redirect("/blogs");
    }
  });
});

// SHOW Route
router.get("/:id", function(req, res){
  Blog.findById(req.params.id).populate("comments").exec(function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("blogs/show", {blog: foundBlog});
    }
  });
});

// EDIT Blog
router.get("/:id/edit", middleware.checkBlogOwnership, function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("blogs/edit", {blog: foundBlog});
    }
  });
});

router.put("/:id", middleware.checkBlogOwnership, function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

// DELETE Blog
router.delete("/:id", middleware.checkBlogOwnership, function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){ // After deleted no more data comes back except error
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

module.exports = router;
