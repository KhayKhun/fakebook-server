const mongoose = require('mongoose');
// const userSchema = require('./user').userSchema;
const postSchema = new mongoose.Schema({
    userID : String,
    date : Number,
    title : String,
    content : String, 
    comments : Array,
    likes : Array,
    edited : Boolean
})

const Posts = mongoose.model('Posts', postSchema);

module.exports = Posts;