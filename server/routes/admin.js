const express = require("express");
const router = express.Router();
const Post = require("../models/post");
const User = require("../models/User");
const adminLayout = "../views/layouts/admin.ejs";
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const jwtSecret = process.env.JWT_SECRET;

/*
 * Check Login
 */
const authMiddleware = (req, res, next ) => {
  const token = req.cookies.token;
  if(!token) {
    return res.status(401).json( { message: 'Unauthorized'} );
  }
  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch(error) {
    res.status(401).json( { message: 'Unauthorized'} );
  }
}





/*
 * GET
 * Admin/login page
 */

router.get("/admin", async (req, res) => {
  try {
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJS,Express & MongoDB.",
    };
    res.render("admin/index", { locals, layout: adminLayout });
  } catch (err) {
    console.log(err);
  }
});

/*
 * POST
 * Admin- check login
 */

router.post("/admin", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    const token = jwt.sign({ userId: user._id }, jwtSecret);
    res.cookie("token", token, { httpOnly: true });
    res.redirect("/dashboard");
  } catch (error) {
    console.log(error);
  }
});

/*
 * GET
 * Admin- dashboard
 */

router.get("/dashboard",authMiddleware,async (req, res) => {
  try{
    const locals = {
      title: "Admin",
      description: "Simple Blog created with NodeJS,Express & MongoDB.",
    };
   const data=await Post.find();
   res.render("admin/dashboard",{
    locals,data,layout: adminLayout
   });
  }
  catch(err){
   console.log(err);
  }
});

/*
 * POST
 * Admin- register
 */

router.post("/register", async (req, res) => {
  try {
    const { username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    try {
      const user = await User.create({ username, password: hashedPassword });
      res.status(201).json({ message: "UserCreated", user });
    } catch (err) {
      if (err.code === 11000) {
        res.status(409).json({ message: "user already in use." });
      }
      res.status(500).json({ message: "Interal server error" });
    }
  } catch (err) {
    console.log(err);
  }
});

module.exports = router;

/*
 * GET
 * Admin- Create new Post
 */

router.get("/add-post",authMiddleware,async (req, res) => {
  try{
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJS,Express & MongoDB.",
    };
   const data=await Post.find();
   res.render("admin/add-post",{
    locals,layout: adminLayout,
   });
  }
  catch(err){
   console.log(err);
  }
});

/*
 * POST
 * Admin- Create new Post
 */

router.post("/add-post",authMiddleware,async (req, res) => {
  try{
    try{
      const newPost=new Post({
        title:req.body.title,
        body:req.body.body
      })
      await Post.create(newPost);
      res.redirect("/dashboard");
    }
    catch{
      console.log(err);
    }
  }
  catch(err){
    console.log(err);
  }
});

/*
 * GET
 * Admin- Create new Post
 */

router.get("/edit-post/:id",authMiddleware,async (req, res) => {
  try{
    const locals = {
      title: "Add Post",
      description: "Simple Blog created with NodeJS,Express & MongoDB.",
    };   
  const data=await Post.findOne({_id:req.params.id});
  res.render(`admin/edit-post`,{
  locals,data,layout: adminLayout,
  })}
  catch(err){
   console.log(err);
  }
});
/*
 * PUT
 * Admin- Create new Post
 */

router.put("/edit-post/:id",authMiddleware,async (req, res) => {
  try{
  await Post.findByIdAndUpdate(req.params.id,{
    title:req.body.title,
    body:req.body.body,
    upadatedAt:Date.now()
  })
  res.redirect(`/edit-post/${req.params.id}`)
  }
  catch(err){
   console.log(err);
  }
});

/*
 * DELETE
 * Admin- Delete Post
 */
router.delete("/delete-post/:id",authMiddleware,async (req, res) => {
try{
  await Post.deleteOne({_id:req.params.id});
  res.redirect("/dashboard");
}catch(err){
  console.log(err);
}
})

/*
 * GET
 * Admin- logout
 */

router.get('/logout',(req,res)=>{
  //res.clearCookie('token');
  res.redirect('/')
})