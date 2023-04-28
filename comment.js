const mongoose = require('mongoose');
// const userSchema = require('./user').userSchema;
const commentSchema = new mongoose.Schema({
    postId : String,
    commenterID : String,
    commentedDate : Number,
    comment : String
})

const Comment = mongoose.model('Comment', commentSchema);

module.exports = Comment;