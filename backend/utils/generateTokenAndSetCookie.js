const jwt = require("jsonwebtoken");

const generateTokenAndSetCookie = (res, userId) =>{
    const token = jwt.sign({userId}, process.env.JWT_SECRET,{
        expiresIn: "7d",
    })

    res.cookie("token", token,{
        httpOnly: true, //cannot be accesed by javascript
        secure: process.env.NODE_ENV === "production", //cookie will only be set in production
        sameSite:"strict", //will prevent the csrf attack
        maxAge: 7*24*60*60*1000 //7 days
    });
    return token;
}

module.exports = {
    generateTokenAndSetCookie
}