const express = require('express');
const router = express.Router();
const passport = require('passport');
const bcrypt = require('bcrypt');
const User = require('../user');
const Posts = require('../posts');
const Comment = require('../comment');

//-----------------------------Check and fetch datas-----------------------------------
router.post('/is-owner',(req,res)=>{
    if(req.isAuthenticated()){
        Posts.findOne({_id:req.body.postID})
        .then(foundPost => {
            if(foundPost){
                if(foundPost.userID == req.user.id) res.send("owner");
                else res.status(403).send("not owner");
            }else{
                res.status(404).send("404");
            }
        }).catch(err => res.status(404).send("404")); 
    } 
})

router.post('/get-users',(req,res)=>{
    if(req.isAuthenticated()){
        User.find({_id: {$ne :  req.user.id }}).then(data =>{
            res.send(data)
        }).catch(err => res.status(404).send("404"));
    }else{
        res.status(401).send("not authenticated");
    }
})
router.post('/get-user-by-id',(req, res)=>{
    User.findOne({_id:req.body.userID})
    .then(foundUser=>{
        if(foundUser) res.send(foundUser);
        else res.status(404).send("404");
    }).catch(err => console.log(err));
})

router.post('/get-profile-or-user', (req, res) => {
    if(req.isAuthenticated()){
        if(req.body.username === req.user.username) {
            res.send("owner");
        }else{
            User.findOne({username: req.body.username})
            .then(foundUser => {
                if(foundUser){
                    Posts.find({userID:foundUser._id})
                    .then(data => {
                        res.send({
                            user : foundUser,
                            posts : data
                        })
                    }).catch(err => console.log(err));
                }else{
                    res.status(404).send("404");
                }
            }).catch(err => console.log(err));
        }
    }else {
        res.status(401).send("not authenticated")
    }
})


router.post('/is-liked',(req, res) => {
    if(req.isAuthenticated()){
        Posts.findById(req.body.postID)
        .then(data => {
            if(data){
                if (data.likes.some(like => like.userID === req.user.id)) res.send(true);
                else res.send(false);
            }else{
                res.send();
            }
        }).catch(err => console.log(err));
    }else{
        res.send();
    }
});

router.post('/get-post-data',(req,res)=>{
        Posts.findOne({_id:req.body.postID})
        .then((data)=>{
            if(data){
                User.findOne({_id : data.userID})
                .then((user)=>{
                    if(user) res.send({
                        post : data,
                        owner : user
                    })
                    else res.status(403).send("not owner")
                }).catch((err)=>{console.log(err)}); 
            }else{
                res.status(404).send("404");
            }
        }).catch((err)=>{console.log(err)});
    });
//-----------------------------Check and fetch datas-----------------------------------

//----------------------------Upload and post------------------------------------
router.post('/submit',(req,res)=>{
    if(req.isAuthenticated()){
        const currentDate = new Date();
            User.findOne({_id: req.user.id})
            .then(async(owner) => {
                const newPost = new Posts({
                    userID : req.user.id,
                    date : currentDate,
                    title : req.body.title,
                    content : req.body.content,
                    edited : false
                });
                await newPost.save().then(done => res.send("done")).catch(err => res.send("").status(500));
            }).catch(err => console.log(err));
        }else{
            res.status(401).send("not authenticated");
        }
    })
router.post('/post-like',(req,res)=>{
    if(req.isAuthenticated()){
        Posts.findById(req.body.postID)
        .then((data)=>{
            if (data.likes.some(like => like.userID === req.user.id)) {
            Posts.updateOne(
                { _id: req.body.postID }, 
                { $pull: { likes: { userID: req.user.id } } },
            ).then((done)=>{
                Posts.findById(req.body.postID)
                .then((final)=>{
                    res.send({
                        likes : final.likes,
                        message : "Unliked Successfully"
                    });
                }).catch(err => console.log(err));;
            }).catch(err => console.log(err));;
            }else{
                Posts.updateOne(
                    { _id: req.body.postID }, 
                    { $push: { likes: {userID : req.user.id} } },
                ).then((done)=>{
                    Posts.findById(req.body.postID)
                    .then((final)=>{
                        res.send({
                            likes : final.likes,
                            message : "Liked successfully"
                        });
                    }).catch(err => console.log(err));;
                }).catch(err => console.log(err));;
            }
        }).catch(err => console.log(err));;

    }else{
        res.status(401).send("not authenticated");
    }
})
router.post('/post-comment',(req,res)=>{
    if(req.isAuthenticated()){
        User.findById(req.user.id).then(data=>{
            async function postComment(){
                const newComment = new Comment({
                    postId : req.body.postID,
                    commenterID : req.user.id,
                    commentedDate : new Date(),
                    comment : req.body.comment
                });
                await newComment.save().then(done => res.send("done")).catch(err => res.send("").status(500));
                    Posts.updateOne(
                        { _id: req.body.postID }, 
                        { $push: { comments: newComment} },
                    ).then(data => {        
                    }).catch(err => res.status(500).send("error to post comment"));
            }postComment().catch(err=> console.log(err));
        }).catch(err => console.log(err))
    }else{
        res.status(401).send("not authenticated");
    }
})
router.post('/upload-image',(req, res) => {
    if(req.isAuthenticated()){
        User.updateOne({_id:req.user.id},{image:req.body.imageURL})
        .then(data=> {
            console.log(data);
            res.status(201).send("not authenticated");
        })
        .catch(err => {console.log(err) 
            res.send("").status(500)});
    }else{
        res.status(401).send("not authenticated");
    }
  });
//----------------------------Upload and post------------------------------------

//------------------------------Auth (login,logout,register)----------------------------------
  router.post('/login',(req,res,next)=>{
    passport.authenticate('local',(err,user,info)=>{
        if(err) throw err;
        if(!user) res.status(401).send("not authenticated")
        else{
            req.logIn(user, err =>{
                if(err) throw err
                res.status(200).send("User successfully logged in")
            })
        }
    })(req, res,next);
})
router.post('/register',(req, res, next) => {
    try {
      User.findOne({ username: req.body.username })
      .then((findUser) => {
      if (findUser) {
        return res.status(409).send("user already exists");
      }else{
        async function createUser(){
            const hashedPassword = await bcrypt.hash(req.body.password, 10);
            const newUser = new User({
              username: req.body.username,
              registerDate: new Date(),
              password: hashedPassword,
            });
            await newUser.save();
            passport.authenticate('local', (err, user, info) => {
              if (err) throw err;
              if (!user) return res.send("not authenticated").status(401);
              req.logIn(user, (err) => {
                if (err) throw err;
                res.status(200).send('User successfully logged in');
              });
            })(req, res, next);
          }createUser().catch(err => {res.status(500)});
        }
    })
      } catch (error) {
        console.log(error);
        res.status(500).send("register failed");
      }
  });
  
router.post('/logout', function(req, res, next){
    req.logout(function(err) {
      if (err) { return next(err); }
      else res.send('Logout Success');
    });
  });
//------------------------------Auth----------------------------------
module.exports = router;