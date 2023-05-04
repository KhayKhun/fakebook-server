require("dotenv").config();
const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const mongoose = require('mongoose');
const MongoStore = require('connect-mongo');
mongoose.connect(process.env.MONGODB_URL,{useNewUrlParser: true ,useUnifiedTopology: true ,serverSelectionTimeoutMS: 30000 });

const passport = require('passport');
const session = require('express-session');

const getRoutes = require('./routes/getRoutes');
const postRoutes = require('./routes/postRoutes');
const deleteRoutes = require('./routes/deleteRoutes');
const patchRoutes = require('./routes/patchRoutes');

//----------------------------End of import------------------------------------
app.set('trust proxy', 1);
app.use(bodyParser.urlencoded({ extended : true }));
app.use(bodyParser.json());
app.use(cors({
    origin: ['https://graceful-gumdrop-d94a77.netlify.app', 'http://localhost:5173'],
    credentials: true,
    optionsSuccessStatus: 200
  }));
app.use(session({
    secret : 'secret',
    resave : true,
    saveUninitialized : true,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URL,
    }),
    cookie :{
        maxAge : 3600 * 24 * 3,
        sameSite : 'none',
        secure : true,
    }
}));
app.use(cookieParser('secret'))
app.use(passport.initialize());
app.use(passport.session());
require('./passportConfig')(passport);

//-----------------------------Routes-----------------------------------
app.use('/', getRoutes);
app.use('/', postRoutes);
app.use('/', deleteRoutes);
app.use('/', patchRoutes);

//-----------------------------Start Server-----------------------------------
app.listen(process.env.PORT || 3001,function(){
    console.log(`listening on port ${process.env.PORT || 3001}`);
})
