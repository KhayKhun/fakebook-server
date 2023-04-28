const User = require('./user');
const bcrypt = require('bcryptjs');
const LocalStrategy = require('passport-local').Strategy;

module.exports = function(passport) {
    passport.use(new LocalStrategy((username,password,done) => {
        User.findOne({username: username}).then((user) => {
            if(!user) return done(null,false);
            bcrypt.compare(password, user.password,(err,result) => {
                if(err) throw err;
                if(result) done(null,user);
                else done(null,false);
            })
        }).catch((err) => {console.error(err)});
    }))

    passport.serializeUser((user,cb)=>{
        cb(null,user.id)
    })
    passport.deserializeUser((id,cb)=>{
        User.findOne({_id:id}).then((user)=>{
            cb(null,{
                id:user.id,
                username:user.username,
                registerDate : user.registerDate
            })
        }).catch(err => console.log(err));
    })
}