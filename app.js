var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");
var methodOverride = require("method-override");
var expressSanitizer = require("express-sanitizer");

mongoose.connect("mongodb://localhost/blog");

app = express();
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({extended: true}));
app.use(methodOverride("_method"));
app.use(expressSanitizer()); // Must go after bodyParser

var blogSchema = new mongoose.Schema({
  title: String,
  image: String,
  body: String,
  created: {
    type: Date,
    default: Date.now
  }
});
// Mongoose model config
var Blog = mongoose.model("Blog", blogSchema);
//
// Blog.create({
//   title: "Test Blog",
//   image: "",
//   body: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Fugit alias ipsam esse itaque non ab sint facere minus quia blanditiis!"
// });

app.get("/", function(req, res) {
  res.redirect("/blogs");
});

app.get("/blogs", function(req, res) {
  Blog.find({}, function(err, blogs) {
    if(err) {
      console.log("Error!");
    } else {
      res.render("index", {blogs: blogs});
    }
  })
});

app.get("/blogs/new", function(req, res) {
  res.render("new");
});

app.post("/blogs", function(req, res) {
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.create(req.body.blog, function(err, newBlog){
    if(err) {
      res.render("/blogs/new");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.get("/blogs/:id", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("show", {blog: foundBlog});
    }
  });
});

app.get("/blogs/:id/edit", function(req, res){
  Blog.findById(req.params.id, function(err, foundBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.render("edit", {blog: foundBlog});
    }
  });
});

app.put("/blogs/:id", function(req, res){
  req.body.blog.body = req.sanitize(req.body.blog.body);
  Blog.findByIdAndUpdate(req.params.id, req.body.blog, function(err, updatedBlog){
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs/" + req.params.id);
    }
  });
});

app.delete("/blogs/:id", function(req, res){
  Blog.findByIdAndRemove(req.params.id, function(err){ // After deleted no more data comes back except error
    if(err) {
      res.redirect("/blogs");
    } else {
      res.redirect("/blogs");
    }
  });
});

app.listen(3000, 'localhost', function() {
  console.log("Server started at port 3000.");
});
