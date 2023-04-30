const express = require('express');
const router = express.Router();

const User = require('../user');
const Posts = require('../posts');

router.get('/user',(req,res)=>{
    if(req.isAuthenticated()){
        User.findById(req.user.id)
        .then(foundUser => {
            Posts.find({userID:foundUser._id})
            .then(data => {
                res.send({
                    user : foundUser,
                    posts : data
                })
            }).catch(err => console.log(err));
        }).catch(err => console.log(err));
    }else{
        res.sendStatus(401)
    }
})
router.get('/user-only',(req,res)=>{
    if(req.isAuthenticated()){
        User.findById(req.user.id)
        .then(foundUser=>{
            if(foundUser) res.send(foundUser);
            else res.sendStatus(404);
        }).catch(err => console.log(err));
    }else{
        res.sendStatus(401)
    }
})

router.get('/posts-for-home',(req,res)=>{
    if(req.isAuthenticated()){
        console.log(req.cookies);
        Posts.find({ userID : {$ne : req.user.id}}).then((data)=>{
            res.send(data);
        }).catch(err => console.log(err));
    }else{
        res.send();
    }
});

router.get('/users/:userId/image', (req, res) => {
    User.findById(req.params.userId).then(user => {
        if (user.image) {
            res.send({
                image : user.image
            });
        }
        else{
            res.sendStatus(404);
        }
    }).catch(err => console.log(err));;
});
module.exports = router;