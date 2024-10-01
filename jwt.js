const jwt=require('jsonwebtoken');
const User = require('./models/users')

const jwtAuthMiddleware =async (req,res,next)=>{

    const authorization=req.headers.authorization;
    if(!authorization) {
        console.log(authorization);
        return res.status(401).json({success:0,message:'unauthorized'});
    }

    const token =req.headers.authorization.split(' ')[1];

    if(!token)  return res.status(401).json({success:0,message:'unauthorized'});

    try{
        const decoded = jwt.verify(token,process.env.JWT_SECRET);

        req.user=decoded;
        // console.log(decoded)
       const userId=req.user.id;
        if(! await User.findById(userId)) {
            
            return res.status(401).json({success:0,message:'unauthorized'});
        }
        next();
    }catch(err){
        console.log(err);
        res.status(401).json({error:'invalid Token'});
    }
}

const generateToken = (userData)=>{
    return jwt.sign(userData,process.env.JWT_SECRET,{ expiresIn: '1h' });
}

module.exports={jwtAuthMiddleware,generateToken}