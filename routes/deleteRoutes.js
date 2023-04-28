const express = require('express');
const router = express.Router();

const User = require('../user');
const Posts = require('../posts');
const Comment = require('../comment');

router.delete('/delete-post',(req, res)=>{
    console.log(req.body);
    if(req.isAuthenticated()){
        if(req.body.ownerID === req.user.id){
            async function deletePost(){
                Posts.findOneAndDelete({_id:req.body.postID})
                .then(data => {
                    res.send("Deleted post")
                })
            }deletePost().catch(err=>console.log(err));
        }else{
            res.sendStatus(403);
        }
    }else{
        res.sendStatus(401)
    }
});
router.delete('/delete-comment',(req,res)=>{
    if(req.isAuthenticated()){
        Comment.findOne({_id:req.body.commentID})
        .then(foundComment => {
            if(foundComment.commenterID === req.user.id){
                Posts.findOne({ _id: foundComment.postId })
                Posts.updateOne(
                    { _id: foundComment.postId }, 
                    { $pull: { comments: foundComment} },
                ).then(async (data )=> {
                    await Comment.deleteOne({_id : req.body.commentID})
                    res.send("deleted")
                });
            }else{
                res.sendStatus(403);
            }
        })
    }else{
        res.sendStatus(401);
    }
})

module.exports = router;