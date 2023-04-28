const express = require('express');
const router = express.Router();

const Posts = require('../posts');

router.patch('/submit-edited-post',(req,res)=>{
    function post(){
        Posts.findOne({_id:req.body.postID})
        .then(foundPost => {
            if(foundPost){
                foundPost.title = req.body.title
                foundPost.content = req.body.content
                foundPost.edited = true

                foundPost.save().then(data => {
                    res.send("edited");
                });
            }else{
                res.sendStatus(404);
            }
        })
    }post()
})
  

module.exports = router;