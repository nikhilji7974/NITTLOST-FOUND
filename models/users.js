const mongoose =require('mongoose');
// const { v4: uuidv4 } = require('uuid');
const bcrypt=require('bcrypt');
const { type } = require('os');
const userSchema=new mongoose.Schema({

    name:{
        type:String,
        require:true,

    },
    
    email:{
        type:String,
            
    },
    studentId:{
        type:Number,
        require:true,
        unique:true,
    },
    password:{
        type:String,
        require:true,
    },
    role:{
        type:String,
        enum:['user','admin'],
        default:'user',
    },
    posts:[
        {
            
            photo:{
                type:String,
                require:true,
            },
            details:{
                type:String,
            },
            postedOn:{
                type:Date,
                default:Date.now(),
            },
            id:{
                type:String,
            },
            userName:{
                type:String,
            }
        }
    ],

});
 
userSchema.pre('save',async function(next){
    const person =this;

    if(!person.isModified('password')) return next();

    try{

        const salt = await bcrypt.genSalt(10);

        const hashedPassword = await bcrypt.hash(person.password,salt);
        person.password = hashedPassword;
        next();
    }catch(err){
        return next(err);
    }
})



userSchema.pre('save', function(next) {
    // Ensure that userName in posts is set to the user's name
    this.posts.forEach(post => {
        post.userName = this.name;
    });
    next();
});



// userSchema.methods.comparePassword = async function(candidatePasswod){
//     try{
//         var ismatch;
//         if(candidatePasswod === this.password) ismatch =1 
//         else ismatch=0
//         return ismatch;

//     }catch(err){
//         throw err;
//     }
// }
const User=mongoose.model('User',userSchema);
module.exports=User;