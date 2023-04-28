const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    username : String,
    registerDate : Number,
    password : String,
    image : {
        contentType: String,
        image: Buffer,
    }
})

const User = mongoose.model('User', userSchema);

module.exports = User;