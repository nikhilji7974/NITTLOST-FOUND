const express = require('express');
const router = express.Router();
const User = require('./../models/users.js');
const upload = require('./../multer');
const { jwtAuthMiddleware ,generateToken} = require('../jwt.js');
const db = require('./../db.js');
const bcrypt=require('bcrypt');

//check admin
const checkAdminRole = async(userId)=>{
    try{
        const user = await User.findById(userId);
        return user.role === 'admin';

    }catch(err){
        return false; 
    } 
}

// check if admin is already present

const alreadyadmin = async()=>{
    const users =  await User.find();
    for(var ele = 0 ; ele <users.length; ele++){
        if(users[ele].role === 'admin') return 1;
    }
    return 0;
    // console.log(users[0]);
};

// Sign Up

router.post('/signup', async(req,res)=>{

    try{
        
        const data = req.body
            console.log(data);
        if(data.role === 'admin'){ 
            if( await alreadyadmin ()){
                console.log('no two admins');
                return res.json({result:1})
            }
            
        }
         
        const newUser = new User(data);

        const response = await newUser.save();

        console.log('data saved');
 
        const payload= {
            id: response.id
            
        }

        console.log(JSON.stringify(payload));
        const token = generateToken(payload);

        console.log("Token is :",token);

        // const redirectUrl = `/user/post?token=${encodeURIComponent(token)}`;

        return res.json({result:3,token:token});
        
        
    }catch(err){
        console.log(err);
        return res.json({result:2});
        
    }

}) 

//Login route 
router.post('/login',async(req,res)=>{
    try{
        const {studentId,password}= req.body;

        console.log(req.body);
        const user = await User.findOne({studentId:studentId});
        
        if(!user){
            return res.status(400).json({success:2});
        }
        const match = await bcrypt.compare(password, user.password);

        if(!match) {
           return res.status(400).json({success:0}); 
        }

        const payload={
            id:user.id 
        }
        const token = generateToken(payload);

        return res.json({success:1 , token : token}) 
        

    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
        return;
    }
})

// Profile 

router.get('/profile',jwtAuthMiddleware, async(req,res)=>{
    try{
        const userData=req.user;
        const userId=userData.id;

        const user = await User.findById(userId);
      
        res.status(200).json({success:true,user:user});
        return;
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Internal server error'});
        return;
    }
})

//change Password  

router.put('/profile/password',jwtAuthMiddleware,async(req,res)=>{
    try{
        
       
        const userId= req.user.id
        const {currentPassword,newPassword}= req.body
        // console.log(userId)
        const user = await User.findById(userId);
        
        const match = await bcrypt.compare(currentPassword,user.password);
            if(!match){
                return res.status(400).json({success:1});
            }
        
   
        user.password=newPassword;
        await user.save();
        console.log('Password changed');
        res.status(200).json({success:2,message:'password is changed'});
        return;
    }catch(err){
        console.log(err);
        res.status(500).json({success:0,error:'internal server error'});
        return;
    }
})
//delete
 
router.delete('/:userID',jwtAuthMiddleware,async(req,res)=>{
    try{

        if(! await checkAdminRole(req.user.id)){
        
            return res.status(403).json({message : 'user is not admin'});
            
        }

        const userID = req.params.userID;
        
        
        const response = await User.findByIdAndDelete(userID);
        if(!response){
            return res.status(404).json({error: ' user not found'});
            
        }
      
        console.log('user deleted ');
        res.status(200).json({message:'deleted'});
        return;
    }catch(err){
        console.log(err);
        res.status(500).json({error:'internal server error'});
        return;
    }
})

// posting new items 

router.post('/post',jwtAuthMiddleware,upload.single('photo'),async(req,res)=>{
  

    try{
    const userId = req.user.id
    const user = await User.findById(userId);
    const photoLink = req.file.path;
    const details = req.body.details;
    const type = req.body.type;

    user.posts.push({
        photo:photoLink,
        details:details,
        type:type
    })
    await user.save();

    console.log("post saved"); 

    return res.status(200).json({success:1})

    }catch(err){
        console.log(err);
        res.status(500).json({success:0,error:'internal server error'});
        return;
    }

 
});

router.get('/posts',jwtAuthMiddleware,async(req,res)=>{
    try{
        
        const allUsers = await User.find();
        
    var allposts=[];
    console.log(allposts);
    allUsers.forEach(ele=>{
        const userPosts=ele.posts;
        userPosts.forEach(posts=>{
            allposts.push(posts);
        })
    })
    console.log(allposts);
   return res.status(200).json({success:1,allposts:allposts})
   
    
    }catch(err){
        console.log(err);
        res.status(500).json({error:'Cannot find the page'});
        return;
    }

})

router.delete('/post/delete/:postId',jwtAuthMiddleware,async(req,res)=>{

   try{
    const postId = req.params.postId
    const userId=req.user.id
    const user = await User.findById(userId);

    const postIndex = user.posts.findIndex(post => post._id.equals(postId));

    if(postIndex == -1) {
        res.status(404).json({ message: "Post not found" });
        return ;
    }
    user.posts.splice(postIndex, 1);
console.log('Updated Posts Array:', user.posts);
    await user.save();
    res.status(200).json({success:1,user});
    return;
   }
   catch(err){
    console.log(err);
        res.status(500).json({error:'internal server error'});
        return;
   }

})

router.put('/post/update/:postId',jwtAuthMiddleware,upload.single('photo'),async(req,res)=>{
    try{
        const userId=req.user.id
        const user = await User.findById(userId);
        
        const postId = req.params.postId

       const photo=req.file.path;
       const details=req.body.details;
       const type=req.body.type;

       
        // const postIndex = user.posts.findIndex(post => post.postId === postId);
        const element = user.posts.find(post => post._id.equals(postId));   
        if(!element){
            res.status(404).json({success:0,message:"only the user who has posted can update the post"})
            return;
        }
       element.photo=photo
       element.details=details
       element.type=type
       
       await user.save();
       res.status(200).json({success:1,element});
        return ;
       
    }catch(err){
        console.log(err);
        res.status(500).json({success:2,error:'internal server error'});
    }
})
module.exports = router;