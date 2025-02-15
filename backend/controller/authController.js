const User = require('../models/user');
const bcrypt = require('bcryptjs');
// const crypto = require('crypto')
const { generateTokenAndSetCookie } = require('../utils/generateTokenAndSetCookie');


const signup = async (req,res) =>{ 
    const { email, password, name } = req.body;
    try{
        if(!email || !password || !name){
            throw new Error("All fields are required");
        }
        const userAlreadyExists = await User.findOne({email});
        if(userAlreadyExists){
            return res.status(400).json({success:false,message:"User already exists"})
        }

        const hashPassword = await bcrypt.hash(password, 10);
        const verificationToken = Math.floor(100000+ Math.random()*900000).toString();
    
        const user = new User ({
            email,
            password: hashPassword,
            name,
            verificationToken,
            verificationTokenExpiresAt: Date.now() + 24*60*60*1000 // 24 hours
        }) 
        await user.save();
        console.log(user);
        //jwt 
        generateTokenAndSetCookie(res,user._id);

        // sendVerificationEmail(user.email, verificationToken); //email.js

        res.status(201).json({
            success:true,
            message:"User created successfully",
            user:{
                ...user._doc,
                password:undefined,
            },
        })
    }
    catch(error){
            res.status(500).json({success:false,message:error.message});
    }
}


const login = async (req,res) =>{
    const { email, password } = req.body;
    try{
        const user = await User.findOne({email});
        if(!user){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if(!isPasswordValid){
            return res.status(400).json({success:false,message:"Invalid credentials"});
        }
        generateTokenAndSetCookie(res, user._id);

        user.lastLogin = Date.now();
        await user.save();
        res.status(200).json({
            success:true, 
            message:"Email verified successfully",
            user:{
                ...user._doc,
                password:undefined,
            }
    });
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
}
const logout = async (req,res) =>{
    res.clearCookie("token");
    res.status(200).json({success:true,message:"Logged out successfully"});

}
const checkAuth = async (req,res) =>{
    try{
    const user = await User.findById(req.userId);
    if(!user){
        return res.status(401).json({success:false,message:"Unauthorized"});
    }
    res.status(200).json({
        success:true,
        user:{
            ...user._doc,
            password:undefined,
        }});
    }
    catch(error){
        res.status(500).json({success:false,message:error.message});
    }
}

module.exports = {signup,login,logout,checkAuth};

