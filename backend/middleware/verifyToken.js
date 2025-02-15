const jwt = require('jsonwebtoken');
const verifyToken = (req,res,next) =>{
    const token = req.cookies.token;
    try{
        if(!token){
            return res.status(401).json({success:false,message:"Unauthorized"}); 

        }
        const decoded = jwt.verify(token,process.env.JWT_SECRET);   
        req.userId = decoded.userId; // useruid field is added to the rquest which is the userid in the token
        next();
    }
    catch(error){
        return res.status(401).json({success:false,message:"Unauthorized"}); 
    }
    
}
module.exports = { verifyToken };