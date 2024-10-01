const express =require("express");
const app=express();
   
const path = require('path')
const upload = require('multer');
const bodyParser=require('body-parser');
require ('dotenv').config();

const bodyparser=require('body-parser');
const {jwtAuthMiddleware} = require("./jwt");

app.use(bodyParser.json());
app.use(express.urlencoded({extended:false}));
 


//ejs set
app.set("view engine","ejs");
app.set('views',path.resolve("./views"));
//import the routing files
const userRoutes = require('./routes/userRoutes');
            

//upload instance 
app.use('/user', (req, res, next) => {
    req.upload = upload;
    next();
}, userRoutes); 
 
//serving the images 
app.use('/images', express.static(path.join(__dirname, 'images')));
//use the routes 
 
app.use('/user',userRoutes)  

//ejse page rendering
app.get('/signup',async(req,res)=>{
    res.render('signUp');
}) 

app.get('/header',async(req,res)=>{
    res.render('header');
})


app.get('/post',jwtAuthMiddleware,async(req,res)=>{
    res.render("makePost");
})

app.get('/login',async(req,res)=>{
    res.render('login');    
})
 
app.get('/home',async(req,res)=>{
    
    res.render('home');
})

app.get('/makepost',async(req,res)=>{
    res.render('makePost');
})

app.get('/profile',async(req,res)=>{
    res.render('profile');   
})

app.get('/changepassword',async(req,res)=>{
    res.render('changePassword'); 
})


app.get('/updatePost',async(req,res)=>{
    res.render('updatePost');
})

app.get('/',async(req,res)=>{
    res.render('startingpage');
})

app.get('/aboutuspage',async(req,res)=>{
    res.render('/aboutuspage');
})

app.get('/privacypolicypage',async(req,res)=>{
    res.render('/privacypolicypage');
})

app.get('/termsandconditionpage',async(req,res)=>{
    res.render('/termsandconditionpage');
})


const PORT = process.env.PORT || 3000;


app.listen(PORT,()=>{
    console.log('Server is listning on Port ',PORT);
    
})